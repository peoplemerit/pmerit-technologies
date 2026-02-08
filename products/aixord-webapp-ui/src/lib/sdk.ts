/**
 * AIXORD SDK Client Wrapper (D3 Integration)
 *
 * Provides a governed SDK interface for the webapp that wraps:
 * - State management via webapp API
 * - Gate enforcement before AI calls
 * - Router execution with governance binding
 *
 * Per L-FX (Formula Execution): This binding ensures governance is enforced.
 * Per L-SPG3: AI exposure is validated before calls.
 * Per L-SPG5: Data classification gates (GS:DC) checked.
 *
 * @module @aixord/sdk-webapp
 */

import type {
  AIXORDState,
  DataClassification,
  RouterRequest,
  RouterResponse,
  RouterMode,
} from './api';
import { api, phaseToShort } from './api';

// ============================================================================
// Types
// ============================================================================

/**
 * SDK Configuration
 */
export interface AIXORDSDKConfig {
  /** Project ID for state management */
  projectId: string;
  /** Authentication token */
  token: string;
  /** User ID for audit */
  userId: string;
  /** Subscription tier */
  tier: 'TRIAL' | 'MANUSCRIPT_BYOK' | 'BYOK_STANDARD' | 'PLATFORM_STANDARD' | 'PLATFORM_PRO' | 'ENTERPRISE';
  /** Key mode */
  keyMode: 'PLATFORM' | 'BYOK';
  /** User API key for BYOK mode */
  userApiKey?: string;
  /** User API provider for BYOK mode */
  userApiProvider?: string;
}

/**
 * Gate check result
 */
export interface GateCheckResult {
  gate: string;
  passed: boolean;
  reason?: string;
  blocking: boolean;
}

/**
 * SDK Gate enforcement result
 */
export interface GateEnforcementResult {
  allowed: boolean;
  blockingGates: string[];
  gateResults: GateCheckResult[];
  reason: string | null;
}

/**
 * Execution Layer Context (Path B: Proactive Debugging)
 * Passed to AI during Execute phase for layered execution mode
 */
export interface ExecutionLayerContext {
  layer_number: number;
  title: string;
  status: 'PENDING' | 'ACTIVE' | 'EXECUTED' | 'VERIFIED' | 'LOCKED' | 'FAILED';
  expected_inputs?: Record<string, unknown>;
  expected_outputs?: Record<string, unknown>;
  locked_layers_count: number;
  failed_layers_count: number;
  total_layers: number;
}

/**
 * Send options for governed chat
 */
export interface SendOptions {
  /** User message content */
  message: string;
  /** Cost/quality mode */
  mode: RouterMode;
  /** Project objective */
  objective: string;
  /** Current phase (from state) */
  phase?: string;
  /** Reality constraints */
  constraints?: string[];
  /** Prior decisions */
  decisions?: string[];
  /** Session ID */
  sessionId?: string;
  /** Max output tokens budget */
  maxOutputTokens?: number;
  /** Image references attached to this message (ENH-4) */
  imageRefs?: Array<{ id: string; filename: string; evidenceType: string; projectId: string }>;
  /** Execution layer context for layered execution mode (Path B) */
  executionLayer?: ExecutionLayerContext;
  /** Session graph context (v4.4) */
  sessionGraph?: {
    current: { number: number; type: string; messageCount: number };
    lineage: Array<{ number: number; type: string; edgeType: string; summary?: string; messageCount?: number }>;
    total: number;
  };
  /** Workspace binding context (v4.4 — Session 24) */
  workspace?: {
    bound: boolean;
    folder_name?: string;
    template?: string;
    permission_level?: string;
    scaffold_generated?: boolean;
    github_connected?: boolean;
    github_repo?: string;
  };
  /** Gate states for governance-aware AI (AI-Gov Integration Phase 1) */
  gates?: Record<string, boolean>;
  /** Blueprint summary for governance-aware AI (AI-Gov Integration Phase 1) */
  blueprintSummary?: {
    scopes: number;
    deliverables: number;
    deliverables_with_dod: number;
    integrity_passed: boolean | null;
  };
}

/**
 * SDK response with governance metadata
 */
export interface AIXORDSDKResponse {
  /** AI response content */
  content: string;
  /** Status */
  status: 'SUCCESS' | 'ERROR' | 'BLOCKED';
  /** Error message if failed */
  error?: string;
  /** Model used */
  model: {
    provider: string;
    model: string;
    class: RouterMode;
  };
  /** Usage metrics */
  usage: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    latencyMs: number;
  };
  /** Gate enforcement result */
  enforcement: {
    gatesPassed: string[];
    gatesFailed: string[];
    aiExposureLevel: string;
    wasRedacted: boolean;
  };
  /** Verification result if applicable */
  verification?: {
    verdict: 'PASS' | 'WARN' | 'FAIL';
    flags: Array<{
      code: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
      detail?: string;
    }>;
  };
}

// ============================================================================
// SDK Errors
// ============================================================================

/**
 * Error when gates block execution
 */
export class GateBlockedError extends Error {
  public readonly blockingGates: string[];
  public readonly gateResults: GateCheckResult[];

  constructor(blockingGates: string[], gateResults: GateCheckResult[]) {
    super(`Execution blocked by gates: ${blockingGates.join(', ')}`);
    this.name = 'GateBlockedError';
    this.blockingGates = blockingGates;
    this.gateResults = gateResults;
  }
}

/**
 * Error when AI exposure is prohibited
 */
export class AIExposureBlockedError extends Error {
  public readonly exposureLevel: string;
  public readonly reason: string;

  constructor(exposureLevel: string, reason: string) {
    super(`AI exposure blocked: ${reason}`);
    this.name = 'AIExposureBlockedError';
    this.exposureLevel = exposureLevel;
    this.reason = reason;
  }
}

// ============================================================================
// AI-Governance Integration Helpers (Phase 1)
// ============================================================================

/** Phase exit gate requirements — mirrors backend state.ts PHASE_EXIT_REQUIREMENTS */
const PHASE_EXIT_REQUIREMENTS: Record<string, string[]> = {
  'BRAINSTORM': ['GA:LIC', 'GA:DIS', 'GA:TIR'],
  'PLAN': ['GA:ENV', 'GA:FLD', 'GA:BP', 'GA:IVL'],
  'EXECUTE': ['GW:PRE', 'GW:VAL', 'GW:VER'],
};

/** Categorize flat gate map into setup/work/security buckets */
function categorizeGates(gates: Record<string, boolean>) {
  const setup: Record<string, boolean> = {};
  const work: Record<string, boolean> = {};
  const security: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(gates)) {
    if (k.startsWith('GA:')) setup[k] = v;
    else if (k.startsWith('GW:')) work[k] = v;
    else if (k.startsWith('GS:')) security[k] = v;
  }
  return { setup, work, security };
}

/** Compute phase exit status from gate states */
function computePhaseExit(phase: string | undefined, gates: Record<string, boolean>) {
  const PHASE_NAMES: Record<string, string> = {
    'B': 'BRAINSTORM', 'P': 'PLAN', 'E': 'EXECUTE', 'R': 'REVIEW',
    'BRAINSTORM': 'BRAINSTORM', 'PLAN': 'PLAN', 'EXECUTE': 'EXECUTE', 'REVIEW': 'REVIEW',
  };
  const normalized = PHASE_NAMES[phase?.toUpperCase() || 'B'] || 'BRAINSTORM';
  const required = PHASE_EXIT_REQUIREMENTS[normalized] || [];
  const satisfied = required.filter(g => gates[g]);
  const missing = required.filter(g => !gates[g]);
  return {
    current_phase: normalized,
    required_gates: required,
    satisfied_gates: satisfied,
    missing_gates: missing,
    can_advance: missing.length === 0,
  };
}

// ============================================================================
// SDK Client
// ============================================================================

/**
 * AIXORD SDK Client for Webapp
 *
 * Provides governed AI interactions with:
 * - Gate enforcement (GS:DC, GS:AI, etc.)
 * - AI exposure validation (L-SPG3, L-SPG4)
 * - State management via webapp API
 * - Audit logging
 */
export class AIXORDSDKClient {
  private config: AIXORDSDKConfig;
  private state: AIXORDState | null = null;
  private dataClassification: DataClassification | null = null;

  constructor(config: AIXORDSDKConfig) {
    this.config = config;
  }

  /**
   * Initialize the SDK client
   * Loads state from backend
   *
   * RC-6 FIX: Removed separate classification/gates API calls.
   * All gate data is now read from state.gates which is returned by the state endpoint.
   */
  async init(): Promise<void> {
    // Load state (includes gates and classification data)
    try {
      this.state = await api.state.get(this.config.projectId, this.config.token);
      console.log('[AIXORD SDK] State loaded successfully. Phase:', this.state?.session?.phase);

      // Extract classification from state if available (embedded in capsule)
      if (this.state?.dataClassification) {
        this.dataClassification = this.state.dataClassification;
      }
    } catch (err) {
      console.warn('[AIXORD SDK] Failed to load state, using defaults:', err);
      this.state = null;
      this.dataClassification = null;
    }
  }

  /**
   * Check gates before execution
   * Per L-FX: Gates must be checked before AI execution
   *
   * Phase-aware enforcement (D-010 fix):
   * - BRAINSTORM: No gate enforcement (freeform ideation)
   * - PLAN: No gate enforcement (advisory planning)
   * - EXECUTE: GP + setup gates required
   * - REVIEW: VA gate required
   */
  async checkGates(phase?: string): Promise<GateEnforcementResult> {
    const results: GateCheckResult[] = [];
    const blockingGates: string[] = [];

    // Get current phase from state if not provided
    const currentPhase = (phase || this.state?.session?.phase || 'BRAINSTORM').toUpperCase();

    // D-010 DEBUG: Log phase for troubleshooting
    console.log('[AIXORD SDK] checkGates called with phase:', phase, '-> currentPhase:', currentPhase);

    // D-010 FIX: Brainstorm and Plan phases do NOT enforce gates
    // This allows freeform ideation and planning without governance blocks
    if (currentPhase === 'BRAINSTORM' || currentPhase === 'B' ||
        currentPhase === 'PLAN' || currentPhase === 'P') {
      console.log('[AIXORD SDK] Phase exempt - allowing freeform interaction');

      return {
        allowed: true,
        blockingGates: [],
        gateResults: [{
          gate: 'PHASE_EXEMPT',
          passed: true,
          reason: `${currentPhase} phase allows freeform AI interaction`,
          blocking: false,
        }],
        reason: null,
      };
    }

    // Only reaches here for EXECUTE or REVIEW phases
    console.log('[AIXORD SDK] Gate enforcement required for phase:', currentPhase);

    // RC-6 FIX: Check gates from state (already loaded during init)
    // No separate API call to /security/gates needed
    if (this.state?.gates) {
      // GP (Governance Passed) - formula must be bound
      const gpPassed = this.state.gates['GP'] ?? false;
      results.push({
        gate: 'GP',
        passed: gpPassed,
        reason: gpPassed ? undefined : 'Please complete the required setup gates in the Governance panel.',
        blocking: true, // GP is blocking in Execute/Review
      });
      if (!gpPassed) blockingGates.push('GP');

      // Check security gates from state.securityGates if available
      if (this.state.securityGates) {
        // GS:DC - Data Classification declared (L-SPG5)
        const gsDcPassed = this.state.securityGates.GS_DC ?? false;
        results.push({
          gate: 'GS:DC',
          passed: gsDcPassed,
          reason: gsDcPassed ? undefined : 'Data classification not declared',
          blocking: true,
        });
        if (!gsDcPassed) blockingGates.push('GS:DC');

        // GS:AI - AI usage complies with classification (L-SPG6)
        const gsAiPassed = this.state.securityGates.GS_AI ?? false;
        results.push({
          gate: 'GS:AI',
          passed: gsAiPassed,
          reason: gsAiPassed ? undefined : 'AI usage not compliant with data classification',
          blocking: true,
        });
        if (!gsAiPassed) blockingGates.push('GS:AI');
      }
    }

    // L-GCP3: DoD enforcement — REVIEW phase requires Definition of Done
    // This is a non-blocking warning (governance best practice, not hard gate)
    // so users can still proceed but are informed that DoD is missing
    if (currentPhase === 'REVIEW' || currentPhase === 'R') {
      try {
        const result = await api.knowledge.list(
          this.config.projectId,
          this.config.token,
          { type: 'DEFINITION_OF_DONE' as any, status: 'APPROVED' as any }
        );
        const hasDod = result && result.artifacts && result.artifacts.length > 0;
        results.push({
          gate: 'GA:DOD',
          passed: hasDod,
          reason: hasDod
            ? undefined
            : 'L-GCP3: No approved Definition of Done found. Create and approve a DoD artifact before verifying deliverables.',
          blocking: false, // Warning, not blocking
        });
        if (!hasDod) {
          console.warn('[AIXORD SDK] GA:DOD warning: No approved Definition of Done for REVIEW phase');
        }
      } catch (err) {
        // If knowledge API fails, add as non-blocking warning
        results.push({
          gate: 'GA:DOD',
          passed: false,
          reason: 'Unable to verify Definition of Done (knowledge API unavailable)',
          blocking: false,
        });
      }
    }

    // GA:ENG — Part XIV Engineering Governance (non-blocking, informational)
    // Checks if engineering governance artifacts exist for the project
    if (currentPhase === 'EXECUTE' || currentPhase === 'E' ||
        currentPhase === 'REVIEW' || currentPhase === 'R') {
      try {
        const compliance = await api.engineering.getCompliance(this.config.projectId, this.config.token);
        const engPassed = compliance.required_percentage >= 50;
        results.push({
          gate: 'GA:ENG',
          passed: engPassed,
          reason: engPassed
            ? undefined
            : `Part XIV Engineering Governance: ${compliance.summary}. Consider adding SAR, interface contracts, and operational readiness artifacts.`,
          blocking: false, // Non-blocking — informational only
        });
        if (!engPassed) {
          console.warn('[AIXORD SDK] GA:ENG advisory: Engineering governance artifacts incomplete —', compliance.summary);
        }
      } catch {
        // If engineering API fails, add as non-blocking info
        results.push({
          gate: 'GA:ENG',
          passed: false,
          reason: 'Unable to verify engineering governance (API unavailable)',
          blocking: false,
        });
      }
    }

    return {
      allowed: blockingGates.length === 0,
      blockingGates,
      gateResults: results,
      reason: blockingGates.length > 0 ? `Blocked by: ${blockingGates.join(', ')}` : null,
    };
  }

  /**
   * Validate AI exposure before sending to model
   * Per L-SPG3: No raw PII/PHI to AI without explicit consent
   * Per L-SPG4: Unknown classification = highest protection
   *
   * FIX 1A: Phase-aware bypass - BRAINSTORM/PLAN phases skip exposure checks
   * (same pattern as gate enforcement bypass)
   */
  async validateAIExposure(phase?: string): Promise<{
    allowed: boolean;
    exposureLevel: string;
    requiresRedaction: boolean;
    blockedReason: string | null;
  }> {
    // Get current phase
    const currentPhase = (phase || this.state?.session?.phase || 'BRAINSTORM').toUpperCase();

    // FIX 1A: Skip AI exposure enforcement during exploratory phases
    // Brainstorm and Plan are freeform exploration — no classification lockdown
    if (currentPhase === 'BRAINSTORM' || currentPhase === 'B' ||
        currentPhase === 'PLAN' || currentPhase === 'P') {
      console.log('[AIXORD SDK] AI exposure check skipped - exploratory phase:', currentPhase);
      return {
        allowed: true,
        exposureLevel: 'PHASE_EXEMPT',
        requiresRedaction: false,
        blockedReason: null,
      };
    }

    // If no classification and in execution phase, default to RESTRICTED per L-SPG4
    if (!this.dataClassification) {
      return {
        allowed: false,
        exposureLevel: 'RESTRICTED',
        requiresRedaction: false,
        blockedReason: 'Data classification not declared. Please complete Data Classification in the Governance panel before executing work.',
      };
    }

    const exposure = this.dataClassification.aiExposure;

    // Check exposure levels
    if (exposure === 'PROHIBITED') {
      return {
        allowed: false,
        exposureLevel: exposure,
        requiresRedaction: false,
        blockedReason: 'AI exposure is PROHIBITED for this project',
      };
    }

    if (exposure === 'RESTRICTED') {
      return {
        allowed: false,
        exposureLevel: exposure,
        requiresRedaction: false,
        blockedReason: 'AI exposure is RESTRICTED - Director authorization required',
      };
    }

    if (exposure === 'CONFIDENTIAL') {
      // Allowed but requires redaction
      return {
        allowed: true,
        exposureLevel: exposure,
        requiresRedaction: true,
        blockedReason: null,
      };
    }

    // PUBLIC or INTERNAL - allowed
    return {
      allowed: true,
      exposureLevel: exposure,
      requiresRedaction: false,
      blockedReason: null,
    };
  }

  /**
   * Send a governed message to the AI
   *
   * This is the main SDK method that:
   * 1. Checks gates (GP, GS:DC, GS:AI)
   * 2. Validates AI exposure
   * 3. Calls the router with governance binding
   * 4. Returns response with enforcement metadata
   */
  async send(options: SendOptions): Promise<AIXORDSDKResponse> {
    const requestId = `sdk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Get current phase for gate enforcement
    const phase = options.phase || this.state?.session.phase || 'BRAINSTORM';
    console.log('[AIXORD SDK] send() phase resolution: options.phase=', options.phase, 'this.state?.session.phase=', this.state?.session?.phase, 'resolved=', phase);

    // 1. Check gates (phase-aware - D-010 fix)
    const gateResult = await this.checkGates(phase);
    if (!gateResult.allowed) {
      throw new GateBlockedError(gateResult.blockingGates, gateResult.gateResults);
    }

    // 2. Validate AI exposure (phase-aware - FIX 1A)
    const exposureResult = await this.validateAIExposure(phase);
    if (!exposureResult.allowed) {
      throw new AIExposureBlockedError(
        exposureResult.exposureLevel,
        exposureResult.blockedReason!
      );
    }

    // 3. Fetch image base64 data if images attached (ENH-4: Session 19 fix)
    let imageData: Array<{ type: 'image'; media_type: string; base64: string; filename?: string }> = [];
    if (options.imageRefs?.length && this.config.token) {
      try {
        const imagePromises = options.imageRefs.map(async (ref) => {
          const data = await api.images.getBase64(ref.projectId, ref.id, this.config.token!);
          return {
            type: 'image' as const,
            media_type: data.media_type,
            base64: data.base64,
            filename: data.filename,
          };
        });
        imageData = await Promise.all(imagePromises);
      } catch (err) {
        console.warn('[SDK] Failed to fetch image base64 data:', err);
        // Continue without images — text context will still inform AI
      }
    }

    // 4. Build router request
    // Note: phase already defined above at line 383
    const routerRequest: RouterRequest = {
      product: 'AIXORD_COPILOT',
      intent: 'CHAT',
      mode: options.mode,
      subscription: {
        tier: this.config.tier,
        key_mode: this.config.keyMode,
        ...(this.config.keyMode === 'BYOK' && this.config.userApiKey && {
          user_api_key: this.config.userApiKey,
        }),
      },
      capsule: {
        objective: options.objective,
        phase: phaseToShort(phase),
        constraints: options.constraints || [],
        decisions: options.decisions || [],
        open_questions: [],
        ...(options.sessionGraph && { session_graph: options.sessionGraph }),
        ...(options.workspace && { workspace: options.workspace }),
        // AI-Governance Integration — Phase 1: Gate & Blueprint awareness
        ...(options.gates && { gates: categorizeGates(options.gates) }),
        ...(options.blueprintSummary && { blueprint_summary: options.blueprintSummary }),
        ...(options.gates && { phase_exit: computePhaseExit(phase, options.gates) }),
      },
      delta: {
        user_input: options.imageRefs?.length
          ? `${options.message}\n\n[Attached images: ${options.imageRefs.map(r => `${r.filename} (${r.evidenceType})`).join(', ')}]`
          : options.message,
        // ENH-4: Include actual image data for vision API
        ...(imageData.length > 0 && { images: imageData }),
        // Path B: Include execution layer context for layered execution mode
        ...(options.executionLayer && { execution_layer: options.executionLayer }),
      },
      budget: {
        max_output_tokens: options.maxOutputTokens || 4096,
      },
      trace: {
        project_id: this.config.projectId,
        session_id: options.sessionId || `session_${this.state?.session.number || 1}`,
        request_id: requestId,
        user_id: this.config.userId,
      },
    };

    // 4. Execute router call
    let routerResponse: RouterResponse;
    try {
      routerResponse = await api.router.execute(routerRequest);
    } catch (err) {
      return {
        content: '',
        status: 'ERROR',
        error: err instanceof Error ? err.message : 'Router execution failed',
        model: { provider: 'unknown', model: 'unknown', class: options.mode },
        usage: { inputTokens: 0, outputTokens: 0, costUsd: 0, latencyMs: 0 },
        enforcement: {
          gatesPassed: gateResult.gateResults.filter((g) => g.passed).map((g) => g.gate),
          gatesFailed: gateResult.blockingGates,
          aiExposureLevel: exposureResult.exposureLevel,
          wasRedacted: exposureResult.requiresRedaction,
        },
      };
    }

    // 5. Build SDK response — map backend status to SDK status vocabulary
    const sdkStatus: AIXORDSDKResponse['status'] =
      routerResponse.status === 'OK' || routerResponse.status === 'RETRIED'
        ? 'SUCCESS'
        : routerResponse.status === 'BLOCKED'
          ? 'BLOCKED'
          : 'ERROR';

    return {
      content: routerResponse.content,
      status: sdkStatus,
      error: routerResponse.error,
      model: {
        provider: routerResponse.model_used.provider,
        model: routerResponse.model_used.model,
        class: options.mode,
      },
      usage: {
        inputTokens: routerResponse.usage.input_tokens,
        outputTokens: routerResponse.usage.output_tokens,
        costUsd: routerResponse.usage.cost_usd,
        latencyMs: routerResponse.usage.latency_ms,
      },
      enforcement: {
        gatesPassed: gateResult.gateResults.filter((g) => g.passed).map((g) => g.gate),
        gatesFailed: gateResult.blockingGates,
        aiExposureLevel: exposureResult.exposureLevel,
        wasRedacted: exposureResult.requiresRedaction,
      },
      verification: routerResponse.verification,
    };
  }

  /**
   * Get current state
   */
  getState(): AIXORDState | null {
    return this.state;
  }

  /**
   * Get data classification
   */
  getDataClassification(): DataClassification | null {
    return this.dataClassification;
  }

  /**
   * Refresh state from backend
   */
  async refreshState(): Promise<AIXORDState | null> {
    try {
      this.state = await api.state.get(this.config.projectId, this.config.token);
      return this.state;
    } catch (err) {
      console.warn('[AIXORD SDK] Failed to refresh state:', err);
      return null;
    }
  }

  /**
   * Refresh data classification from backend
   */
  async refreshDataClassification(): Promise<DataClassification | null> {
    try {
      this.dataClassification = await api.security.getClassification(
        this.config.projectId,
        this.config.token
      );
      return this.dataClassification;
    } catch (err) {
      console.warn('[AIXORD SDK] Failed to refresh data classification:', err);
      return null;
    }
  }

  /**
   * Pass a gate
   */
  async passGate(gateId: string): Promise<void> {
    await api.state.toggleGate(this.config.projectId, gateId, true, this.config.token);
    await this.refreshState();
  }

  /**
   * Set phase
   */
  async setPhase(phase: string): Promise<void> {
    await api.state.setPhase(this.config.projectId, phase, this.config.token);
    await this.refreshState();
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create an AIXORD SDK client for a project
 */
export function createAIXORDClient(config: AIXORDSDKConfig): AIXORDSDKClient {
  return new AIXORDSDKClient(config);
}

// ============================================================================
// React Hook (for convenient use in components)
// ============================================================================

import { useState, useCallback, useEffect } from 'react';

/**
 * Hook configuration
 */
export interface UseAIXORDSDKConfig {
  projectId: string | null;
  token: string | null;
  userId: string | null;
  tier: AIXORDSDKConfig['tier'];
  keyMode: AIXORDSDKConfig['keyMode'];
  userApiKey?: string;
  userApiProvider?: string;
  /** Auto-initialize on mount */
  autoInit?: boolean;
}

/**
 * Hook return type
 */
export interface UseAIXORDSDKReturn {
  /** SDK client instance */
  client: AIXORDSDKClient | null;
  /** Whether SDK is initialized */
  isInitialized: boolean;
  /** Whether SDK is loading */
  isLoading: boolean;
  /** Initialization error */
  error: string | null;
  /** Send a message with governance */
  send: (options: Omit<SendOptions, 'objective'> & { objective?: string }) => Promise<AIXORDSDKResponse>;
  /** Check gates */
  checkGates: () => Promise<GateEnforcementResult>;
  /** Validate AI exposure */
  validateExposure: () => Promise<{
    allowed: boolean;
    exposureLevel: string;
    requiresRedaction: boolean;
    blockedReason: string | null;
  }>;
  /** Refresh state */
  refresh: () => Promise<void>;
}

/**
 * React hook for using AIXORD SDK in components
 *
 * Usage:
 * ```tsx
 * const { client, send, checkGates, isInitialized } = useAIXORDSDK({
 *   projectId: 'proj_123',
 *   token: authToken,
 *   userId: user.id,
 *   tier: 'PLATFORM_STANDARD',
 *   keyMode: 'PLATFORM',
 * });
 *
 * const handleSend = async (message: string) => {
 *   try {
 *     const response = await send({ message, mode: 'BALANCED', objective: project.objective });
 *     // Handle response
 *   } catch (err) {
 *     if (err instanceof GateBlockedError) {
 *       // Handle gate blocked
 *     }
 *   }
 * };
 * ```
 */
export function useAIXORDSDK(config: UseAIXORDSDKConfig): UseAIXORDSDKReturn {
  const [client, setClient] = useState<AIXORDSDKClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize client when config changes
  useEffect(() => {
    if (!config.projectId || !config.token || !config.userId) {
      setClient(null);
      setIsInitialized(false);
      return;
    }

    const sdkClient = new AIXORDSDKClient({
      projectId: config.projectId,
      token: config.token,
      userId: config.userId,
      tier: config.tier,
      keyMode: config.keyMode,
      userApiKey: config.userApiKey,
      userApiProvider: config.userApiProvider,
    });

    setClient(sdkClient);

    // Auto-initialize if requested
    if (config.autoInit !== false) {
      setIsLoading(true);
      setError(null);
      sdkClient
        .init()
        .then(() => {
          setIsInitialized(true);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to initialize SDK');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [
    config.projectId,
    config.token,
    config.userId,
    config.tier,
    config.keyMode,
    config.userApiKey,
    config.userApiProvider,
    config.autoInit,
  ]);

  // Send message
  const send = useCallback(
    async (options: Omit<SendOptions, 'objective'> & { objective?: string }): Promise<AIXORDSDKResponse> => {
      if (!client) {
        throw new Error('SDK client not initialized');
      }
      if (!isInitialized) {
        await client.init();
        setIsInitialized(true);
      }
      return client.send({
        ...options,
        objective: options.objective || '',
      });
    },
    [client, isInitialized]
  );

  // Check gates (phase-aware)
  const checkGates = useCallback(async (phase?: string): Promise<GateEnforcementResult> => {
    if (!client) {
      throw new Error('SDK client not initialized');
    }
    return client.checkGates(phase);
  }, [client]);

  // Validate exposure (phase-aware)
  const validateExposure = useCallback(async (phase?: string) => {
    if (!client) {
      throw new Error('SDK client not initialized');
    }
    return client.validateAIExposure(phase);
  }, [client]);

  // Refresh state
  const refresh = useCallback(async () => {
    if (!client) return;
    await Promise.all([client.refreshState(), client.refreshDataClassification()]);
  }, [client]);

  return {
    client,
    isInitialized,
    isLoading,
    error,
    send,
    checkGates,
    validateExposure,
    refresh,
  };
}

export default AIXORDSDKClient;
