/**
 * Project Workspace Page (Hybrid Ribbon Layout)
 *
 * Layout with MiniBar (always visible) + Detail Panel (expandable):
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ [A] AIXORD  [☰]  Project Name     [Gov] [BP] [Sec] [Ev] [Eng] [Info]   │ ← TabBar (48px)
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │ Phase [B]·[P]·[E]·[R]   ✓5 ○6   BP  SEC  EV           ▓▓▓▓░░ 45%     │ ← MiniBar (36px, always)
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │ [Detail panel - visible ONLY when tab is active, max 140px]             │ ← Detail Panel (0-140px)
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │                            CHAT AREA (maximized)                        │
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │ ● BRAINSTORM │ $0.0034 │ 61 msgs │ [📎] [input] [Balanced]             │ ← StatusBar
 * └──────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserSettings } from '../contexts/UserSettingsContext';
import { useProjectState } from '../hooks/useApi';
import { api, APIError, phaseToShort, brainstormApi, blueprintApi, type Project as ProjectType, type Decision, type CCSGateStatus, type SessionType, type EdgeType, type BrainstormReadinessData } from '../lib/api';
import { useAIXORDSDK, GateBlockedError, AIExposureBlockedError, GovernanceBlockError } from '../lib/sdk';
import { useSessions } from '../hooks/useSessions';
import { MessageBubble } from '../components/chat/MessageBubble';
import { QuickActions } from '../components/chat/QuickActions';
import { ImageUpload, type PendingImage } from '../components/chat/ImageUpload';
import { formatAttachmentsForContext, type AttachedFile } from '../components/FileAttachment';
import { detectAndResolveFiles } from '../lib/fileDetection';
import { processReadFileRequests } from '../lib/readFileRequest';
import { fileSystemStorage, readDirectory, readFileContent, verifyPermission } from '../lib/fileSystem';
import { ExecutionEngine } from '../lib/executionEngine';
import { validateScopeImports, type ImportValidationResult } from '../lib/scopeValidator';
import { CCSIncidentBanner } from '../components/CCSIncidentBanner';
import { CCSIncidentPanel } from '../components/CCSIncidentPanel';
import { CCSCreateIncidentModal } from '../components/CCSCreateIncidentModal';
import { TabBar } from '../components/layout/TabBar';
import { MiniBar } from '../components/layout/MiniBar';
import { Ribbon } from '../components/layout/Ribbon';
import { StatusBar } from '../components/layout/StatusBar';
import { GovernanceRibbon } from '../components/ribbon/GovernanceRibbon';
import { InfoRibbon } from '../components/ribbon/InfoRibbon';
import { EvidenceRibbon } from '../components/ribbon/EvidenceRibbon';
import { EngineeringRibbon } from '../components/ribbon/EngineeringRibbon';
import { SecurityRibbon } from '../components/ribbon/SecurityRibbon';
import { EngineeringPanel, type EngineeringSection } from '../components/EngineeringPanel';
import { BlueprintPanel } from '../components/BlueprintPanel';
import BlueprintRibbon from '../components/ribbon/BlueprintRibbon';
import { useEngineering } from '../hooks/useEngineering';
import { useBlueprint } from '../hooks/useBlueprint';
import { useAssignments } from '../hooks/useAssignments';
import { TaskBoard } from '../components/TaskBoard';
import { EscalationBanner } from '../components/EscalationBanner';
import { NewSessionModal } from '../components/session/NewSessionModal';
import { ProjectMemoryPanel } from '../components/ProjectMemoryPanel';
import { useContinuity } from '../hooks/useContinuity';
import { WorkspaceSetupWizard, type WorkspaceBindingData } from '../components/WorkspaceSetupWizard';
import EnvironmentAwarenessReport from '../components/EnvironmentAwarenessReport';
import type { Message, Conversation } from '../components/chat/types';

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/** Parse key: value fields from a structured AI output block */
function parseBlockFields(content: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      if (key && val) fields[key] = val;
    }
  }
  return fields;
}

// ============================================================================
// Main Project Component
// ============================================================================

export function Project() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, user, logout } = useAuth();
  const { settings, getActiveApiKey } = useUserSettings();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // FIX-WSC: Cache workspace file context to avoid re-scanning on every message
  const workspaceContextRef = useRef<{
    file_tree?: string;
    key_files?: Array<{ path: string; content: string }>;
  } | null>(null);
  const workspaceContextLoadedRef = useRef(false);

  // Ribbon state
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Project data
  const [project, setProject] = useState<ProjectType | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  // Available models state
  const [availableModels, setAvailableModels] = useState<Record<string, Array<{ provider: string; model: string }>> | null>(null);

  // Decisions data
  const [decisions, setDecisions] = useState<Decision[]>([]);

  // Chat state
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  // Session cost tracking
  const [sessionCost, setSessionCost] = useState<number>(0);
  const [sessionTokens, setSessionTokens] = useState<number>(0);

  // Local file system state
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  // Image upload modal state
  const [showImageUpload, setShowImageUpload] = useState(false);

  // Evidence state
  const [githubConnection, setGithubConnection] = useState<any>(null);
  const [recentEvidence, setRecentEvidence] = useState<Array<{ id: string; url: string; filename: string; evidenceType: string }>>([]);
  const [githubRepos, setGithubRepos] = useState<Array<{ owner: string; name: string; full_name: string; private: boolean }>>([]);

  // CCS state
  const [ccsStatus, setCcsStatus] = useState<CCSGateStatus | null>(null);
  const [showCCSPanel, setShowCCSPanel] = useState(false);
  const [showCCSCreate, setShowCCSCreate] = useState(false);

  // Phase transition error (Tier 1 enforcement)
  const [phaseError, setPhaseError] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Quality warning override modal (VD-CI-01 A4)
  const [pendingWarnings, setPendingWarnings] = useState<Array<{ check: string; passed: boolean; detail: string }> | null>(null);
  const [warningPhase, setWarningPhase] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState('');

  // Brainstorm artifact save prompt (HANDOFF-PTX-01)
  const [brainstormArtifactJustSaved, setBrainstormArtifactJustSaved] = useState(false);
  // Brainstorm readiness vector (HANDOFF-BQL-01)
  const [brainstormReadiness, setBrainstormReadiness] = useState<BrainstormReadinessData | null>(null);
  // FIX-PERSIST-FINALIZE: Track if user explicitly dismissed the finalize prompt
  // Prevents re-showing on state re-fetches within the same page session
  const brainstormFinalizeDismissedRef = useRef(false);

  // REASSESS Protocol modal state (GFB-01 Task 3)
  const [reassessModal, setReassessModal] = useState<{
    targetPhase: string;
    level: number;
    reassessCount: number;
    crossKingdom: boolean;
    phaseFrom: string;
  } | null>(null);
  const [reassessReason, setReassessReason] = useState('');
  const [reassessReview, setReassessReview] = useState('');

  // Governance state from hook
  const {
    state,
    isLoading: stateLoading,
    fetchState,
    toggleGate,
    setPhase,
  } = useProjectState(id || null, token);

  // AIXORD SDK Client
  // FIX: Get active API key once to avoid calling getActiveApiKey() twice and handle null safely
  const activeApiKey = settings.subscription.keyMode === 'BYOK' ? getActiveApiKey() : null;
  
  const {
    send: sdkSend,
  } = useAIXORDSDK({
    projectId: id || null,
    token: token || null,
    userId: user?.id || null,
    tier: settings.subscription.tier,
    keyMode: settings.subscription.keyMode,
    userApiKey: activeApiKey?.key ?? undefined,
    userApiProvider: activeApiKey?.provider ?? undefined,
    autoInit: true,
  });

  // Session Graph Model (AIXORD v4.4)
  const {
    sessions,
    activeSession,
    createSession,
    switchSession: rawSwitchSession,
  } = useSessions({
    projectId: id || null,
    token: token || null,
    userId: user?.id || null,
    initialSessionId: searchParams.get('session'),
  });

  // Gap 3: Session URL Navigation — update URL param on session switch
  const switchSession = useCallback((sessionId: string) => {
    rawSwitchSession(sessionId);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('session', sessionId);
      return next;
    }, { replace: true });
  }, [rawSwitchSession, setSearchParams]);

  // D10-D11: Session metrics from backend
  const [sessionMetrics, setSessionMetrics] = useState<import('../lib/api').SessionMetrics | null>(null);

  // Engineering governance (Part XIV)
  const engineering = useEngineering({
    projectId: id || null,
    token: token || null,
  });
  const [engineeringPanelOpen, setEngineeringPanelOpen] = useState(false);
  const [engineeringPanelSection, setEngineeringPanelSection] = useState<EngineeringSection>('sar');

  // Blueprint governance (L-BPX, L-IVL)
  const blueprint = useBlueprint({
    projectId: id || null,
    token: token || null,
  });
  const [blueprintPanelOpen, setBlueprintPanelOpen] = useState(false);

  // Task Delegation Layer (HANDOFF-TDL-01)
  const tdl = useAssignments({
    projectId: id || null,
    token: token || null,
    sessionId: activeSession?.id || null,
    autoFetch: true,
  });

  // Project Continuity Capsule (HANDOFF-PCC-01)
  const continuityHook = useContinuity({
    projectId: id || null,
    token: token || null,
    enabled: true,
  });

  const [showWorkspaceWizard, setShowWorkspaceWizard] = useState(false);
  const [showEnvReport, setShowEnvReport] = useState(false);
  const [workspaceChecked, setWorkspaceChecked] = useState(false);
  const [workspaceStatus, setWorkspaceStatus] = useState<{
    bound: boolean;
    folder_name?: string;
    folder_template?: string;
    permission_level?: string;
    scaffold_generated?: boolean;
    github_connected: boolean;
    github_repo?: string | null;
    confirmed: boolean;
  } | null>(null);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const fetchProject = useCallback(async () => {
    if (!id || !token) return;
    setProjectLoading(true);
    setProjectError(null);
    try {
      const data = await api.projects.get(id, token);
      setProject(data);
    } catch (err) {
      setProjectError(err instanceof Error ? err.message : 'Failed to fetch project');
    } finally {
      setProjectLoading(false);
    }
  }, [id, token]);

  const fetchDecisions = useCallback(async () => {
    if (!id || !token) return;
    try {
      const data = await api.decisions.list(id, token);
      setDecisions(data);
    } catch (err) {
      console.error('Failed to fetch decisions:', err);
    }
  }, [id, token]);

  const fetchEvidence = useCallback(async () => {
    if (!id || !token) return;
    try {
      const data = await api.evidence.getTriad(id, token);
      if (data.connection) {
        setGithubConnection({
          connected: true,
          repo_owner: data.connection.repo_owner,
          repo_name: data.connection.repo_name,
          last_sync: data.connection.last_sync,
        });
      }
    } catch {
      // Evidence fetch is non-critical
    }
  }, [id, token]);

  const fetchImages = useCallback(async () => {
    if (!id || !token) return;
    try {
      // Fetch both user-uploaded images and GitHub evidence
      const [images, evidence] = await Promise.allSettled([
        api.images.list(id, token),
        api.evidence.list(id, token),
      ]);

      const evidenceItems: typeof recentEvidence = [];

      if (images.status === 'fulfilled') {
        const imgList = (images.value as any).images || [];
        // Fetch each image as blob with auth header to create displayable URLs
        const blobResults = await Promise.allSettled(
          imgList.map(async (img: any) => {
            const res = await fetch(api.images.getUrl(id, img.id), {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) return null;
            const blob = await res.blob();
            return { img, blobUrl: URL.createObjectURL(blob) };
          })
        );
        for (const result of blobResults) {
          if (result.status === 'fulfilled' && result.value) {
            evidenceItems.push({
              id: result.value.img.id,
              url: result.value.blobUrl,
              filename: result.value.img.filename,
              evidenceType: result.value.img.evidence_type || 'SCREENSHOT',
            });
          }
        }
      }

      if (evidence.status === 'fulfilled') {
        const evList = (evidence.value as any).evidence || [];
        for (const ev of evList) {
          if (!evidenceItems.find(e => e.id === ev.id)) {
            evidenceItems.push({
              id: ev.id,
              url: ev.url || '',
              filename: ev.title || ev.filename || 'evidence',
              evidenceType: ev.evidence_type || ev.type || 'GITHUB',
            });
          }
        }
      }

      setRecentEvidence(evidenceItems);
    } catch {
      // Non-critical
    }
  }, [id, token]);

  const fetchGithubRepos = useCallback(async () => {
    if (!id || !token) return;
    try {
      const result = await api.github.listRepos(id, token);
      setGithubRepos((result as any).repos || []);
    } catch {
      // May not have GitHub connected
    }
  }, [id, token]);

  const fetchCCSStatus = useCallback(async () => {
    if (!id || !token) return;
    try {
      const status = await api.ccs.getStatus(id, token);
      setCcsStatus(status);
    } catch (err) {
      console.error('Failed to fetch CCS status:', err);
    }
  }, [id, token]);

  const fetchMessages = useCallback(async () => {
    if (!id || !token || !project) return;
    try {
      // Filter messages by active session if available
      const data = await api.messages.list(id, token, 100, 0, activeSession?.id);
      const messages: Message[] = data.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.createdAt),
        metadata: m.metadata as Message['metadata']
      }));

      // Calculate session totals from messages
      let totalCost = 0;
      let totalTokens = 0;
      messages.forEach(m => {
        if (m.metadata?.usage) {
          totalCost += m.metadata.usage.costUsd || 0;
          totalTokens += (m.metadata.usage.inputTokens || 0) + (m.metadata.usage.outputTokens || 0);
        }
      });
      setSessionCost(totalCost);
      setSessionTokens(totalTokens);

      setConversation(prev => prev ? {
        ...prev,
        messages,
        updatedAt: new Date()
      } : {
        id: `conv_${project.id}`,
        projectId: project.id,
        title: project.name,
        messages,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  }, [id, token, project, activeSession]);

  // Re-fetch messages and metrics when active session changes
  useEffect(() => {
    if (project && activeSession) {
      fetchMessages();
      // D10: Fetch session metrics from backend
      if (id && token) {
        api.sessions.getMetrics(id, activeSession.id, token)
          .then(setSessionMetrics)
          .catch(() => setSessionMetrics(null));
      }
    }
  }, [activeSession?.id]);

  // Initialize conversation when project loads
  useEffect(() => {
    if (project && !conversation) {
      setConversation({
        id: `conv_${project.id}`,
        projectId: project.id,
        title: project.name,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        capsule: state ? {
          objective: state.project.objective || '',
          phase: state.session.phase as 'B' | 'P' | 'E' | 'R',
          constraints: state.reality.constraints,
          decisions: [],
          openQuestions: []
        } : undefined
      });
      fetchMessages();
    }
  }, [project, conversation, state, fetchMessages]);

  useEffect(() => {
    fetchProject();
    fetchDecisions();
    fetchCCSStatus();
    fetchEvidence();
    fetchImages();
    fetchGithubRepos();
    api.router.models().then(data => setAvailableModels(data.classes)).catch(console.error);
  }, [fetchProject, fetchDecisions, fetchCCSStatus, fetchEvidence, fetchImages, fetchGithubRepos]);

  // Fetch workspace status for capsule enrichment + auto-detect wizard
  useEffect(() => {
    if (state && id && token && !workspaceChecked) {
      setWorkspaceChecked(true);
      api.workspace.getStatus(id, token)
        .then(status => {
          setWorkspaceStatus(status);
          // Show wizard if GA:ENV not passed and no confirmed binding
          const envPassed = state.gates?.['GA:ENV'];
          if (!envPassed && !status.confirmed) {
            setShowWorkspaceWizard(true);
          }
        })
        .catch(() => {
          setWorkspaceStatus({ bound: false, github_connected: false, confirmed: false });
          const envPassed = state.gates?.['GA:ENV'];
          if (!envPassed) {
            setShowWorkspaceWizard(true);
          }
        });
    }
  }, [state, id, token, workspaceChecked]);

  // FIX-PERSIST-FINALIZE: On page load / state change, check if brainstorm artifact
  // already exists with all exit gates passed. If so, show the persistent finalize prompt.
  // Root cause: brainstormArtifactJustSaved was only set during AI response parsing,
  // so refreshing the page lost the prompt even though the artifact + gates were ready.
  // See HANDOFF-PTX-02 for details.
  useEffect(() => {
    if (!state || !id || !token) return;
    // Only relevant in BRAINSTORM phase
    const phase = state.session.phase;
    if (phase !== 'BRAINSTORM' && phase !== 'B') return;
    // Don't re-show if user explicitly dismissed in this page session
    if (brainstormFinalizeDismissedRef.current) return;
    // Don't overwrite if already showing (e.g., from AI artifact extraction)
    if (brainstormArtifactJustSaved) return;
    // Check all 3 BRAINSTORM exit gates
    const gates = state.gates || {};
    const allExitGatesPassed = gates['GA:LIC'] && gates['GA:DIS'] && gates['GA:TIR'];
    if (!allExitGatesPassed) return;
    // All gates passed — check if brainstorm artifact exists via readiness API
    brainstormApi.getReadiness(id, token)
      .then((readiness) => {
        if (readiness.artifact_exists) {
          setBrainstormArtifactJustSaved(true);
          setBrainstormReadiness(readiness);
        }
      })
      .catch(() => {
        // Non-blocking — if readiness API fails, don't show the prompt
      });
  }, [state, id, token, brainstormArtifactJustSaved]);

  // Cleanup blob URLs for evidence images on unmount
  useEffect(() => {
    return () => {
      recentEvidence.forEach((e) => {
        if (e.url.startsWith('blob:')) URL.revokeObjectURL(e.url);
      });
    };
  }, [recentEvidence]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  // Load blueprint data when tab is activated
  useEffect(() => {
    if (activeTab === 'blueprint' && id && token) {
      blueprint.loadScopes();
      blueprint.loadDeliverables();
      blueprint.loadSummary();
      blueprint.loadIntegrity();
    }
  }, [activeTab]);

  // ============================================================================
  // Handlers
  // ============================================================================

  // Non-software projects hide Blueprint/Security/Engineering tabs
  const isSoftwareProject = !project || project.projectType === 'software';
  const hiddenTabs = isSoftwareProject ? [] : ['blueprint', 'security', 'engineering'];

  const handleTabClick = (tabId: string) => {
    setActiveTab(activeTab === tabId ? null : tabId);
  };

  const handleToggleGate = async (gateId: string) => {
    if (!state) return;
    try {
      const currentValue = state.gates[gateId] || false;
      await toggleGate(gateId, !currentValue);
    } catch (err) {
      console.error('Failed to toggle gate:', err);
    }
  };

  // GFB-01: Phase order for regression detection
  const PHASE_ORDER: Record<string, number> = { 'BRAINSTORM': 0, 'B': 0, 'PLAN': 1, 'P': 1, 'EXECUTE': 2, 'E': 2, 'REVIEW': 3, 'R': 3 };

  const handleSetPhase = async (phase: string) => {
    setPhaseError(null);

    // GFB-01: Detect phase regression → show REASSESS modal
    const currentIdx = PHASE_ORDER[currentPhase] ?? -1;
    const targetIdx = PHASE_ORDER[phase] ?? -1;
    if (targetIdx < currentIdx && targetIdx >= 0) {
      // Determine if cross-kingdom (B/P = IDEATION/BLUEPRINT, E/R = REALIZATION)
      const currentKingdom = currentIdx >= 2 ? 'REALIZATION' : 'IDEATION';
      const targetKingdom = targetIdx >= 2 ? 'REALIZATION' : 'IDEATION';
      const crossKingdom = currentKingdom !== targetKingdom;
      // Estimate level (backend is authoritative, this is for UI hint)
      let estimatedLevel = 1;
      if (crossKingdom) estimatedLevel = 2;
      // We don't know exact reassess_count client-side, so default to 0
      setReassessModal({
        targetPhase: phase,
        level: estimatedLevel,
        reassessCount: 0,
        crossKingdom,
        phaseFrom: currentPhase,
      });
      setReassessReason('');
      setReassessReview('');
      return;
    }

    try {
      await setPhase(phase);
    } catch (err) {
      if (err instanceof APIError && err.statusCode === 403) {
        const missing = (err as any).missingGates as string[] | undefined;
        setPhaseError(missing
          ? `${err.message} (missing: ${missing.join(', ')})`
          : err.message);
      } else {
        console.error('Failed to set phase:', err);
      }
    }
  };

  // AI-Governance Integration — Phase 2: Auto-evaluate gates after key actions
  const evaluateGatesAfterAction = useCallback(async () => {
    if (!id || !token) return;
    try {
      const result = await api.state.evaluateGates(id, token);
      if (result.changed.length > 0) {
        fetchState();
      }
    } catch (err) {
      console.warn('[GateEval] Evaluation failed:', err);
    }
  }, [id, token, fetchState]);

  // AI-Governance Integration — Phase 3: Handle phase advance from AI suggestion
  const handlePhaseAdvance = useCallback(async (targetPhase: string) => {
    if (!id || !token) return;
    setPhaseError(null);
    try {
      await api.state.setPhase(id, targetPhase, token);
      fetchState();
    } catch (err) {
      if (err instanceof APIError && err.statusCode === 403) {
        const missing = (err as any).missingGates as string[] | undefined;
        setPhaseError(missing
          ? `Phase advance blocked (missing: ${missing.join(', ')})`
          : (err as Error).message);
      } else {
        console.error('Phase advance failed:', err);
      }
    }
  }, [id, token, fetchState]);

  // Phase 4: Finalize Phase — formal governance transaction
  const handleFinalizePhase = useCallback(async (phase: string, overrideOptions?: {
    override_warnings: boolean;
    override_reason: string;
  }) => {
    if (!id || !token) return;
    setIsFinalizing(true);
    setPhaseError(null);
    try {
      const result = await api.state.finalizePhase(id, phase, token, overrideOptions);

      // WARNINGS response — show override modal for Director decision
      if (result.result === 'WARNINGS' && result.warnings) {
        setPendingWarnings(result.warnings);
        setWarningPhase(phase);
        setOverrideReason('');
        setIsFinalizing(false);
        return;
      }

      if (result.success) {
        // Phase finalized — refresh state to get new phase
        fetchState();
        // Add a system message to the chat
        const overrideNote = overrideOptions ? `\n\n⚠️ Quality warnings overridden: "${overrideOptions.override_reason}"` : '';
        const successMessage: Message = {
          id: generateId(),
          role: 'system',
          content: `✅ **Phase Finalized**\n\n${result.message}\n\nArtifact checks: ${result.artifact_checks.map(a => `${a.passed ? '✓' : '✗'} ${a.check}: ${a.detail}`).join('\n')}${overrideNote}`,
          timestamp: new Date(),
        };
        setConversation((prev) => prev ? {
          ...prev,
          messages: [...prev.messages, successMessage],
          updatedAt: new Date()
        } : prev);
        // Clear any pending warnings and artifact prompt
        setPendingWarnings(null);
        setWarningPhase(null);
        setOverrideReason('');
        setBrainstormArtifactJustSaved(false);
        setBrainstormReadiness(null);
        // FIX-PERSIST-FINALIZE: Reset dismiss ref on successful finalization
        // so it won't interfere with future brainstorm phases (e.g., after regression)
        brainstormFinalizeDismissedRef.current = false;
      }
    } catch (err) {
      if (err instanceof APIError) {
        setPhaseError(err.message);
      } else {
        console.error('Finalize phase failed:', err);
        setPhaseError('Failed to finalize phase');
      }
    } finally {
      setIsFinalizing(false);
    }
  }, [id, token, fetchState]);

  // Warning override — Director confirms override with reason
  const handleWarningOverride = useCallback(() => {
    if (!warningPhase || !overrideReason.trim()) return;
    handleFinalizePhase(warningPhase, {
      override_warnings: true,
      override_reason: overrideReason.trim(),
    });
  }, [warningPhase, overrideReason, handleFinalizePhase]);

  // Warning dismiss — cancel the override
  const handleWarningDismiss = useCallback(() => {
    setPendingWarnings(null);
    setWarningPhase(null);
    setOverrideReason('');
  }, []);

  // GFB-01: REASSESS confirm — send regression with reason to backend
  const handleReassessConfirm = useCallback(async () => {
    if (!reassessModal || !reassessReason.trim()) return;
    setPhaseError(null);
    try {
      await setPhase(reassessModal.targetPhase, {
        reassess_reason: reassessReason.trim(),
        review_summary: reassessReview.trim() || undefined,
      });
      // Success — close modal and refresh state
      setReassessModal(null);
      setReassessReason('');
      setReassessReview('');
      fetchState();
      // System message in chat
      const sysMsg: Message = {
        id: generateId(),
        role: 'system',
        content: `🔄 **Phase Reassessment**\n\nPhase regressed from **${reassessModal.phaseFrom}** → **${reassessModal.targetPhase}**\n\nReason: ${reassessReason.trim()}${reassessReview.trim() ? `\n\nReview Summary: ${reassessReview.trim()}` : ''}`,
        timestamp: new Date(),
      };
      setConversation((prev) => prev ? {
        ...prev,
        messages: [...prev.messages, sysMsg],
        updatedAt: new Date(),
      } : prev);
    } catch (err) {
      if (err instanceof APIError && err.code === 'REASSESS_REASON_REQUIRED') {
        // Backend wants more detail — update modal with server-provided level
        const data = (err as any).reassessData;
        if (data) {
          setReassessModal(prev => prev ? {
            ...prev,
            level: data.level,
            reassessCount: data.reassess_count,
            crossKingdom: data.cross_kingdom,
          } : prev);
        }
        setPhaseError(err.message);
      } else if (err instanceof APIError && err.code === 'REASSESS_REVIEW_REQUIRED') {
        // Level 3 — need review summary
        const data = (err as any).reassessData;
        if (data) {
          setReassessModal(prev => prev ? {
            ...prev,
            level: 3,
            reassessCount: data.reassess_count,
          } : prev);
        }
        setPhaseError(err.message);
      } else if (err instanceof APIError) {
        setPhaseError(err.message);
      } else {
        console.error('Reassess failed:', err);
        setPhaseError('Failed to reassess phase');
      }
    }
  }, [reassessModal, reassessReason, reassessReview, setPhase, fetchState]);

  // REASSESS dismiss
  const handleReassessDismiss = useCallback(() => {
    setReassessModal(null);
    setReassessReason('');
    setReassessReview('');
    setPhaseError(null);
  }, []);

  const handleWorkspaceComplete = useCallback(async (binding: WorkspaceBindingData) => {
    if (!id || !token) return;
    try {
      // Save binding to backend (convert null to undefined for API compatibility)
      await api.workspace.updateBinding(id, {
        folder_name: binding.folder_name ?? undefined,
        folder_template: binding.folder_template ?? undefined,
        permission_level: binding.permission_level,
        scaffold_generated: binding.scaffold_generated,
        github_connected: binding.github_connected,
        github_repo: binding.github_repo ?? undefined,
        binding_confirmed: binding.binding_confirmed,
      }, token);
      // Toggle GA:ENV and GA:FLD gates
      if (binding.folder_name) {
        await toggleGate('GA:FLD', true);
      }
      if (binding.binding_confirmed) {
        await toggleGate('GA:ENV', true);
      }
      // Refresh workspace status for capsule enrichment
      const updatedStatus = await api.workspace.getStatus(id, token);
      setWorkspaceStatus(updatedStatus);
      setShowWorkspaceWizard(false);
      // Phase 2: Auto-evaluate gates after workspace setup
      evaluateGatesAfterAction();
      // Phase 3: Show environment awareness report with backend probes
      setShowEnvReport(true);
    } catch (err) {
      console.error('Workspace setup failed:', err);
      // Still close wizard — binding was saved even if gate toggle failed
      setShowWorkspaceWizard(false);
    }
  }, [id, token, toggleGate, evaluateGatesAfterAction]);

  const handleEnvReportClose = useCallback((allPassed: boolean) => {
    setShowEnvReport(false);
    const sysMsg: Message = {
      id: generateId(),
      role: 'system',
      content: allPassed
        ? '✅ **Environment Verified**\n\nAll probes passed — D1 database (read/write), R2 storage, model router, and environment config are operational.\n\nWorkspace is fully bound and verified. Ready to proceed.'
        : '⚠️ **Environment Warning**\n\nWorkspace binding saved, but one or more environment probes reported issues. Check the report for details.\n\nYou can continue working — some backend capabilities may be limited.',
      timestamp: new Date(),
    };
    setConversation((prev) => prev ? {
      ...prev,
      messages: [...prev.messages, sysMsg],
      updatedAt: new Date(),
    } : prev);
  }, []);

  const handleGitHubConnect = useCallback(async () => {
    if (!id || !token) return;
    try {
      const result = await api.github.connect(id, token);
      if (result.authorization_url) window.location.href = result.authorization_url;
    } catch (err) {
      console.error('GitHub connect failed:', err);
    }
  }, [id, token]);

  const handleGitHubDisconnect = useCallback(async () => {
    if (!id || !token) return;
    try {
      await api.github.disconnect(id, token);
      setGithubConnection(null);
    } catch (err) {
      console.error('GitHub disconnect failed:', err);
    }
  }, [id, token]);

  const handleCreateCCSIncident = useCallback(async (data: {
    credentialType: import('../lib/api').CredentialType;
    credentialName: string;
    exposureSource: import('../lib/api').ExposureSource;
    exposureDescription: string;
    impactAssessment: string;
    affectedSystems?: string[];
  }) => {
    if (!id || !token) return;
    try {
      await api.ccs.createIncident(id, data, token);
      setShowCCSCreate(false);
      await fetchCCSStatus();
    } catch (err) {
      console.error('Failed to create CCS incident:', err);
    }
  }, [id, token, fetchCCSStatus]);

  const handleGitHubSelectRepo = useCallback(async (repoOwner: string, repoName: string) => {
    if (!id || !token) return;
    try {
      await api.github.selectRepo(id, repoOwner, repoName, token);
      setGithubConnection({ connected: true, repo_owner: repoOwner, repo_name: repoName });
      await fetchEvidence();
    } catch (err) {
      console.error('Failed to select repo:', err);
    }
  }, [id, token, fetchEvidence]);

  // D81: Scaffold Plan — Approve handler (writes files after user approval)
  const handleApproveScaffoldPlan = useCallback(async (messageId: string) => {
    if (!conversation || !id || !token) return;
    const message = conversation.messages.find(m => m.id === messageId);
    if (!message?.metadata?.scaffoldPlan) return;

    const updatedMetadata = {
      ...message.metadata,
      scaffoldPlan: { ...message.metadata.scaffoldPlan, status: 'approved' as const },
    };

    // Write files using ExecutionEngine
    try {
      const fileResult = await ExecutionEngine.processFilesOnly(message.content, id);
      updatedMetadata.executionResult = {
        filesCreated: fileResult.filesCreated,
        filesUpdated: fileResult.filesUpdated,
        progressUpdates: 0,
        submissions: 0,
        escalations: 0,
        errors: fileResult.errors,
      };

      // ENV-SYNC-01 Phase 2: Auto-commit scaffold files to GitHub
      if (
        token &&
        fileResult.filesCreated.length > 0 &&
        githubConnection?.connected &&
        githubConnection?.github_mode === 'WORKSPACE_SYNC' &&
        githubConnection?.repo_name &&
        githubConnection.repo_name !== 'PENDING'
      ) {
        try {
          const codeFenceRegex = /```(\w+):([^\n]+)\n([\s\S]*?)```/g;
          const filesToCommit: Array<{ path: string; content: string }> = [];
          let fenceMatch;
          while ((fenceMatch = codeFenceRegex.exec(message.content)) !== null) {
            const [, , path, code] = fenceMatch;
            const trimmedPath = path.trim();
            if (fileResult.filesCreated.includes(trimmedPath)) {
              filesToCommit.push({ path: trimmedPath, content: code.trim() });
            }
          }
          if (filesToCommit.length > 0) {
            const commitResult = await ExecutionEngine.commitToGitHub(
              id, filesToCommit, `[AIXORD] Scaffold approved — ${filesToCommit.length} file(s)`, token
            );
            if (commitResult.success) {
              (updatedMetadata as Record<string, unknown>).githubCommit = {
                commit_sha: commitResult.commit_sha,
                branch: commitResult.branch,
                commit_url: commitResult.commit_url,
                files_committed: filesToCommit.length,
              };
            }
          }
        } catch {
          // Non-blocking
        }
      }
    } catch (err) {
      updatedMetadata.executionResult = {
        filesCreated: [],
        filesUpdated: [],
        progressUpdates: 0,
        submissions: 0,
        escalations: 0,
        errors: [err instanceof Error ? err.message : 'Unknown error'],
      };
    }

    // Update local state
    setConversation(prev => prev ? {
      ...prev,
      messages: prev.messages.map(m => m.id === messageId ? { ...m, metadata: updatedMetadata } : m),
    } : prev);

    // Re-save to backend
    await api.messages.create(id, {
      role: 'assistant',
      content: message.content,
      metadata: updatedMetadata as Record<string, unknown>,
      session_id: activeSession?.id,
    }, token);
  }, [conversation, id, token, activeSession, githubConnection]);

  // D81: Scaffold Plan — Modify handler (sends feedback to AI for updated plan)
  // Note: handleSendMessage is used via ref pattern to avoid forward-declaration issue
  const handleModifyScaffoldPlanRef = useRef<((messageId: string, feedback: string) => Promise<void>) | undefined>(undefined);
  const handleModifyScaffoldPlan = useCallback(async (messageId: string, feedback: string) => {
    await handleModifyScaffoldPlanRef.current?.(messageId, feedback);
  }, []);

  const handleEvidenceSync = useCallback(async () => {
    if (!id || !token) return;
    try {
      await api.evidence.sync(id, token, activeSession?.id);
      await fetchEvidence();
      await fetchImages();
    } catch (err) {
      console.error('Evidence sync failed:', err);
    }
  }, [id, token, activeSession, fetchEvidence, fetchImages]);

  const handleDeleteImage = useCallback(async (imageId: string) => {
    if (!id || !token) return;
    try {
      await api.images.delete(id, imageId, token);
      setRecentEvidence(prev => prev.filter(e => e.id !== imageId));
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  }, [id, token]);

  // Bridge: api.messages.clear
  const handleClearMessages = useCallback(async () => {
    if (!id || !token) return;
    try {
      await api.messages.clear(id, token);
      setConversation(prev => prev ? { ...prev, messages: [], updatedAt: new Date() } : prev);
      setSessionCost(0);
      setSessionTokens(0);
    } catch (err) {
      console.error('Failed to clear messages:', err);
    }
  }, [id, token]);

  // Bridge: api.projects.update
  const handleUpdateProject = useCallback(async (data: { name?: string; objective?: string }) => {
    if (!id || !token) return;
    try {
      const updated = await api.projects.update(id, data, token);
      setProject(updated);
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  }, [id, token]);

  // D9: Clipboard image paste handler
  const handlePasteImage = useCallback((file: File) => {
    const preview = URL.createObjectURL(file);
    const image: PendingImage = {
      file,
      preview,
      evidenceType: 'SCREENSHOT',
      caption: '',
    };
    setPendingImages((prev) => [...prev, image]);
  }, []);

  // Image upload handlers
  const handleAddImage = useCallback((image: PendingImage) => {
    setPendingImages((prev) => [...prev, image]);
    setShowImageUpload(false);
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setPendingImages((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleClearImages = useCallback(() => {
    setPendingImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.preview));
      return [];
    });
  }, []);

  // Send message handler
  const handleSendMessage = async (content: string, mode: 'ECONOMY' | 'BALANCED' | 'PREMIUM') => {
    if (!conversation || !user || !id || !project || !token) return;

    // Build full message content with attachments
    const attachmentContext = formatAttachmentsForContext(attachedFiles);
    let fullContent = content + attachmentContext;

    // P0-3: Detect file references and resolve from workspace
    try {
      const fileDetection = await detectAndResolveFiles(content, id);
      if (fileDetection.injectedCount > 0) {
        fullContent += fileDetection.contextString;
      }
    } catch (err) {
      // File detection is non-blocking — log and continue
      console.warn('[FileDetection] Detection failed, continuing without file context:', err);
    }

    // Upload pending images
    const uploadedImages: Array<{ id: string; url: string; filename: string; evidenceType: string; caption?: string }> = [];
    if (pendingImages.length > 0) {
      for (const img of pendingImages) {
        try {
          const result = await api.images.upload(id, img.file, {
            evidenceType: img.evidenceType,
            caption: img.caption || undefined,
          }, token);
          uploadedImages.push({
            id: result.id,
            url: api.images.getUrl(id, result.id),
            filename: result.filename,
            evidenceType: result.evidence_type,
            caption: img.caption || undefined,
          });
        } catch (err) {
          console.error('Image upload failed:', err);
        }
      }
      pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setPendingImages([]);
    }

    // Add user message to UI immediately
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
      metadata: (attachedFiles.length > 0 || uploadedImages.length > 0) ? {
        attachments: attachedFiles.length > 0 ? attachedFiles.map((a) => ({
          name: a.file.name,
          path: a.file.path,
          size: a.file.size,
          includeContent: a.includeContent,
        })) : undefined,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
      } : undefined,
    };

    setAttachedFiles([]);

    setConversation((prev) => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage],
      updatedAt: new Date()
    } : prev);

    setChatLoading(true);

    try {
      // Save user message to backend
      await api.messages.create(id, {
        role: 'user',
        content,
        metadata: {},
        session_id: activeSession?.id,
      }, token);

      // Use AIXORD SDK for governed AI execution
      // Build session graph context for capsule enrichment (v4.4)
      const sessionGraph = activeSession ? {
        current: {
          number: activeSession.session_number,
          type: activeSession.session_type,
          messageCount: activeSession.message_count,
        },
        lineage: sessions
          .filter(s => s.id !== activeSession.id)
          .slice(-5)  // Last 5 prior sessions for context
          .map(s => ({
            number: s.session_number,
            type: s.session_type,
            edgeType: 'CONTINUES' as const,  // Simplified — Phase D+ will resolve actual edges
            summary: s.summary
              ? (s.summary.length > 200 ? s.summary.slice(0, 200) + '…' : s.summary)
              : `${s.session_type} session with ${s.message_count ?? 0} messages`,
            messageCount: s.message_count ?? 0,
          })),
        total: sessions.length,
      } : undefined;

      // FIX-N3 (SDK path): Build conversation history from current messages
      // The SDK was missing conversation_history — every message was contextless.
      const MAX_HISTORY_MESSAGES = 20;
      const conversationHistory = (conversation.messages || [])
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .slice(-MAX_HISTORY_MESSAGES)
        .map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }));

      // FIX-WSC: Scan workspace files for proactive context (cached after first scan)
      if (!workspaceContextLoadedRef.current && workspaceStatus?.bound) {
        workspaceContextLoadedRef.current = true;
        try {
          const linked = await fileSystemStorage.getHandle(id);
          if (linked?.handle) {
            const hasPermission = await verifyPermission(linked.handle, false);
            if (hasPermission) {
              // Read directory tree (2 levels deep)
              const entries = await readDirectory(linked.handle, '', true, 2);

              // Build file tree string
              const buildTree = (items: typeof entries, indent = ''): string => {
                return items.map(e => {
                  if (e.type === 'folder') {
                    const children = (e as { children?: typeof entries }).children;
                    return `${indent}[DIR] ${e.name}/` +
                      (children ? '\n' + buildTree(children, indent + '  ') : '');
                  }
                  return `${indent}${e.name} (${(e as { size: number }).size}b)`;
                }).join('\n');
              };
              const fileTree = buildTree(entries);

              // Read key files: explicit names + any .md files in root
              const KEY_FILE_NAMES = new Set(['README.md', 'readme.md', 'package.json', 'tsconfig.json',
                'wrangler.toml', 'wrangler.json', '.env.example', 'Cargo.toml', 'requirements.txt',
                'pyproject.toml', 'go.mod', 'CHANGELOG.md', 'CONTRIBUTING.md', 'LICENSE',
                'vite.config.ts', 'vite.config.js', 'next.config.js', 'next.config.mjs',
                'tailwind.config.ts', 'tailwind.config.js']);
              // Also auto-include any .md/.txt files in root (catches brainstorm.md, notes.md, etc.)
              const KEY_FILE_EXTENSIONS = new Set(['md', 'txt']);
              const MAX_KEY_FILES = 15; // Budget: up to 15 key files
              const MAX_KEY_FILE_SIZE = 5000; // 5KB per file (up from 3KB)
              const keyFiles: Array<{ path: string; content: string }> = [];

              for (const entry of entries) {
                if (keyFiles.length >= MAX_KEY_FILES) break;
                if (entry.type !== 'file') continue;
                const ext = entry.name.split('.').pop()?.toLowerCase() || '';
                const isKeyFile = KEY_FILE_NAMES.has(entry.name) || KEY_FILE_EXTENSIONS.has(ext);
                if (!isKeyFile) continue;
                try {
                    const fileData = await readFileContent((entry as { handle: FileSystemFileHandle }).handle);
                    if (fileData.content.length < MAX_KEY_FILE_SIZE) {
                      keyFiles.push({ path: entry.name, content: fileData.content });
                    }
                  } catch {
                    // Skip unreadable files
                  }
                }
              }

              workspaceContextRef.current = {
                file_tree: fileTree.slice(0, 8000),
                key_files: keyFiles.length > 0 ? keyFiles : undefined,
              };
            }
          }
        } catch (err) {
          console.warn('[FIX-WSC] Workspace scan failed (non-blocking):', err);
          workspaceContextRef.current = null;
        }
      }

      const sdkResponse = await sdkSend({
        message: fullContent,
        mode,
        objective: project.objective || '',
        phase: state?.session.phase,
        constraints: state?.reality.constraints || [],
        decisions: decisions.map(d => d.summary),
        sessionId: activeSession?.id || `session_${state?.session.number || 1}`,
        maxOutputTokens: 4096,
        conversationHistory: conversationHistory.length > 0 ? conversationHistory : undefined,
        workspaceContext: workspaceContextRef.current || undefined,
        imageRefs: uploadedImages.length > 0 ? uploadedImages.map(i => ({
          id: i.id,
          filename: i.filename,
          evidenceType: i.evidenceType,
          projectId: id,
        })) : undefined,
        sessionGraph,
        workspace: workspaceStatus ? {
          bound: workspaceStatus.bound,
          folder_name: workspaceStatus.folder_name,
          template: workspaceStatus.folder_template,
          permission_level: workspaceStatus.permission_level,
          scaffold_generated: workspaceStatus.scaffold_generated,
          github_connected: workspaceStatus.github_connected || false,
          github_repo: workspaceStatus.github_repo || undefined,
        } : { bound: false },
        // AI-Governance Integration — Phase 1: Gate & Blueprint awareness
        gates: state?.gates || undefined,
        blueprintSummary: blueprint.summary ? {
          scopes: blueprint.summary.scopes,
          deliverables: blueprint.summary.deliverables,
          deliverables_with_dod: blueprint.summary.deliverables_with_dod,
          integrity_passed: blueprint.summary.integrity?.passed ?? null,
        } : undefined,
      });

      // Create assistant message
      const assistantMetadata = {
        model: sdkResponse.model,
        usage: {
          inputTokens: sdkResponse.usage.inputTokens,
          outputTokens: sdkResponse.usage.outputTokens,
          costUsd: sdkResponse.usage.costUsd,
          latencyMs: sdkResponse.usage.latencyMs
        },
        verification: sdkResponse.verification,
        phase: phaseToShort(state?.session.phase),
        enforcement: {
          gatesPassed: sdkResponse.enforcement.gatesPassed,
          gatesFailed: sdkResponse.enforcement.gatesFailed,
          aiExposureLevel: sdkResponse.enforcement.aiExposureLevel,
          wasRedacted: sdkResponse.enforcement.wasRedacted,
        }
      };

      const assistantContent = sdkResponse.status === 'SUCCESS'
        ? sdkResponse.content
        : `Error: ${sdkResponse.error || 'Unknown error'}`;

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        metadata: assistantMetadata
      };

      // Save assistant message to backend
      await api.messages.create(id, {
        role: 'assistant',
        content: assistantContent,
        metadata: assistantMetadata,
        session_id: activeSession?.id,
      }, token);

      setConversation((prev) => prev ? {
        ...prev,
        messages: [...prev.messages, assistantMessage],
        updatedAt: new Date()
      } : prev);

      // Update session metrics
      setSessionCost(prev => prev + sdkResponse.usage.costUsd);
      setSessionTokens(prev => prev + sdkResponse.usage.outputTokens + sdkResponse.usage.inputTokens);

      // READ_FILE_REQUEST: Check if AI requested file contents from workspace
      // If found, auto-read files via FSAPI and send a follow-up message with contents
      if (sdkResponse.status === 'SUCCESS' && workspaceStatus?.bound) {
        try {
          const fileReadResult = await processReadFileRequests(assistantContent, id);
          if (fileReadResult.hasRequests && fileReadResult.filesRead > 0) {
            // Add a system-style message showing the file contents being injected
            const fileReadMessage: Message = {
              id: generateId(),
              role: 'user',
              content: fileReadResult.contextMessage,
              timestamp: new Date(),
              metadata: {
                autoFileRead: true,
                filesRead: fileReadResult.filesRead,
                requestedPaths: fileReadResult.results.map(r => r.path),
              },
            };

            // Save to backend
            await api.messages.create(id, {
              role: 'user',
              content: fileReadResult.contextMessage,
              metadata: { autoFileRead: true, filesRead: fileReadResult.filesRead },
              session_id: activeSession?.id,
            }, token);

            // Add to UI
            setConversation((prev) => prev ? {
              ...prev,
              messages: [...prev.messages, fileReadMessage],
              updatedAt: new Date()
            } : prev);

            // Auto-send follow-up AI call with file contents in context
            // The conversation history will now include the file contents
            const followUpHistory = [
              ...conversationHistory,
              { role: 'assistant' as const, content: assistantContent },
              { role: 'user' as const, content: fileReadResult.contextMessage },
            ].slice(-MAX_HISTORY_MESSAGES);

            const followUpResponse = await sdkSend({
              message: fileReadResult.contextMessage,
              mode,
              objective: project.objective || '',
              phase: state?.session.phase,
              constraints: state?.reality.constraints || [],
              decisions: decisions.map(d => d.summary),
              sessionId: activeSession?.id || `session_${state?.session.number || 1}`,
              maxOutputTokens: 4096,
              conversationHistory: followUpHistory,
              workspaceContext: workspaceContextRef.current || undefined,
              sessionGraph,
              workspace: workspaceStatus ? {
                bound: workspaceStatus.bound,
                folder_name: workspaceStatus.folder_name,
                template: workspaceStatus.folder_template,
                permission_level: workspaceStatus.permission_level,
                scaffold_generated: workspaceStatus.scaffold_generated,
                github_connected: workspaceStatus.github_connected || false,
                github_repo: workspaceStatus.github_repo || undefined,
              } : { bound: false },
              gates: state?.gates || undefined,
              blueprintSummary: blueprint.summary ? {
                scopes: blueprint.summary.scopes,
                deliverables: blueprint.summary.deliverables,
                deliverables_with_dod: blueprint.summary.deliverables_with_dod,
                integrity_passed: blueprint.summary.integrity?.passed ?? null,
              } : undefined,
            });

            // Create follow-up assistant message
            const followUpContent = followUpResponse.status === 'SUCCESS'
              ? followUpResponse.content
              : `Error: ${followUpResponse.error || 'Unknown error'}`;

            const followUpAssistantMessage: Message = {
              id: generateId(),
              role: 'assistant',
              content: followUpContent,
              timestamp: new Date(),
              metadata: {
                model: followUpResponse.model,
                usage: {
                  inputTokens: followUpResponse.usage.inputTokens,
                  outputTokens: followUpResponse.usage.outputTokens,
                  costUsd: followUpResponse.usage.costUsd,
                  latencyMs: followUpResponse.usage.latencyMs,
                },
                phase: phaseToShort(state?.session.phase),
                fileReadFollowUp: true,
              },
            };

            await api.messages.create(id, {
              role: 'assistant',
              content: followUpContent,
              metadata: followUpAssistantMessage.metadata as Record<string, unknown>,
              session_id: activeSession?.id,
            }, token);

            setConversation((prev) => prev ? {
              ...prev,
              messages: [...prev.messages, followUpAssistantMessage],
              updatedAt: new Date()
            } : prev);

            // Update metrics for follow-up call
            setSessionCost(prev => prev + followUpResponse.usage.costUsd);
            setSessionTokens(prev => prev + followUpResponse.usage.inputTokens + followUpResponse.usage.outputTokens);

            // Use the follow-up content for subsequent artifact extraction
            // (The original assistantContent is kept for the first pass)
          }
        } catch (fileReadErr) {
          // Non-blocking — file read auto-resolution is best-effort
          console.warn('[READ_FILE_REQUEST] Auto-resolution failed:', fileReadErr);
        }
      }

      // HANDOFF-VD-CI-01 A1: Extract brainstorm artifact from AI response
      if (state?.session.phase === 'BRAINSTORM' || state?.session.phase === 'B') {
        const artifactMatch = assistantContent.match(
          /=== BRAINSTORM ARTIFACT ===\s*([\s\S]*?)\s*=== END BRAINSTORM ARTIFACT ===/
        );
        if (artifactMatch) {
          try {
            // FIX-PLAN-RESILIENT: Strip markdown code fences and trailing commas
            let rawBsJson = artifactMatch[1].trim();
            rawBsJson = rawBsJson.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
            rawBsJson = rawBsJson.replace(/,\s*([\]}])/g, '$1');
            const artifactData = JSON.parse(rawBsJson);
            await brainstormApi.createArtifact(id, {
              options: artifactData.options || [],
              assumptions: artifactData.assumptions || [],
              decision_criteria: artifactData.decision_criteria || { criteria: [] },
              kill_conditions: artifactData.kill_conditions || [],
              generated_by: 'ai',
            }, token);
            // HANDOFF-PTX-01: Show inline finalize prompt after artifact save
            setBrainstormArtifactJustSaved(true);
            // HANDOFF-BQL-01: Fetch readiness after artifact save
            try {
              const readiness = await brainstormApi.getReadiness(id, token);
              setBrainstormReadiness(readiness);
            } catch {
              // Non-blocking — readiness indicator is optional
            }
          } catch {
            // Artifact parsing failed — non-blocking, user can retry
            console.warn('Failed to parse brainstorm artifact from AI response');
          }
        }
      }

      // FIX-PLAN: Extract plan artifact from AI response and populate blueprint
      // Mirrors the brainstorm artifact pattern: AI outputs structured JSON,
      // frontend parses it, frontend calls import endpoint to save to DB.
      if (state?.session.phase === 'PLAN' || state?.session.phase === 'P') {
        const planArtifactMatch = assistantContent.match(
          /=== PLAN ARTIFACT ===\s*([\s\S]*?)\s*=== END PLAN ARTIFACT ===/
        );
        if (planArtifactMatch) {
          try {
            // FIX-PLAN-RESILIENT: Strip markdown code fences and trailing commas
            let rawJson = planArtifactMatch[1].trim();
            rawJson = rawJson.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
            rawJson = rawJson.replace(/,\s*([\]}])/g, '$1');
            const planData = JSON.parse(rawJson);
            await blueprintApi.importFromPlanArtifact(id, {
              scopes: planData.scopes || [],
              selected_option: planData.selected_option || undefined,
              milestones: planData.milestones || [],
              tech_stack: planData.tech_stack || [],
              risks: planData.risks || [],
            }, token);

            // Auto-run blueprint validation after import so gates update
            try {
              await blueprintApi.runValidation(id, token);
            } catch {
              // Non-blocking — validation is optional at this point
            }

            // Refresh gate status after blueprint import
            try {
              await fetchState();
            } catch {
              // Non-blocking
            }
          } catch (parseErr) {
            // Plan artifact parsing failed — non-blocking, user can retry
            console.warn('Failed to parse/import plan artifact from AI response:', parseErr);
          }
        }
      }

      // HANDOFF-TDL-01 Task 7: Extract structured AI output blocks and call APIs
      if (state?.session.phase === 'EXECUTE' || state?.session.phase === 'E') {
        // D81 SCAFFOLD PLAN: Parse and store (Swiss Cheese — plan-before-execute gate)
        const scaffoldMatch = assistantContent.match(
          /=== SCAFFOLD PLAN ===\s*([\s\S]*?)\s*=== END SCAFFOLD PLAN ===/
        );
        let hasScaffoldPlan = false;
        if (scaffoldMatch) {
          try {
            const planData = JSON.parse(scaffoldMatch[1]);
            hasScaffoldPlan = true;
            assistantMessage.metadata = {
              ...assistantMessage.metadata,
              scaffoldPlan: {
                deliverable: planData.deliverable || '',
                projectName: planData.project_name || '',
                description: planData.description || '',
                files: (planData.files || []).map((f: Record<string, unknown>) => ({
                  path: (f.path as string) || '',
                  purpose: (f.purpose as string) || '',
                  language: (f.language as string) || '',
                  estimatedLines: (f.estimated_lines as number) || 0,
                })),
                tree: planData.tree || '',
                dependencies: planData.dependencies || [],
                totalFiles: planData.total_files || 0,
                estimatedTokens: planData.estimated_tokens || 0,
                status: 'pending' as const,
              }
            };
          } catch {
            console.warn('Failed to parse scaffold plan from AI response');
          }
        }

        try {
          // Progress updates
          const progressRe = /=== PROGRESS UPDATE ===\s*([\s\S]*?)\s*=== END PROGRESS UPDATE ===/g;
          let pm;
          while ((pm = progressRe.exec(assistantContent)) !== null) {
            const fields = parseBlockFields(pm[1]);
            if (fields.assignment_id && fields.percent) {
              await tdl.updateProgress(fields.assignment_id, {
                progress_percent: parseInt(fields.percent, 10) || 0,
                progress_notes: fields.completed || '',
                remaining_items: fields.next ? [fields.next] : [],
              });
            }
          }

          // Submissions
          const submitRe = /=== SUBMISSION ===\s*([\s\S]*?)\s*=== END SUBMISSION ===/g;
          let sm;
          while ((sm = submitRe.exec(assistantContent)) !== null) {
            const fields = parseBlockFields(sm[1]);
            if (fields.assignment_id && fields.summary) {
              await tdl.submitAssignment(fields.assignment_id, {
                submission_summary: fields.summary,
                submission_evidence: fields.evidence ? [fields.evidence] : [],
              });
            }
          }

          // Escalations
          const escRe = /=== ESCALATION ===\s*([\s\S]*?)\s*=== END ESCALATION ===/g;
          let em;
          while ((em = escRe.exec(assistantContent)) !== null) {
            const fields = parseBlockFields(em[1]);
            if (fields.assignment_id && fields.decision_needed) {
              await tdl.createEscalation({
                assignment_id: fields.assignment_id,
                decision_needed: fields.decision_needed,
                options: fields.options ? fields.options.split('|').map((s: string) => s.trim()) : [],
                recommendation: fields.recommendation || undefined,
                recommendation_rationale: fields.rationale || undefined,
              });
            }
          }

          // Standups
          const standupRe = /=== STANDUP ===\s*([\s\S]*?)\s*=== END STANDUP ===/g;
          let stm;
          while ((stm = standupRe.exec(assistantContent)) !== null) {
            const fields = parseBlockFields(stm[1]);
            if (fields.working_on && activeSession?.id) {
              await tdl.postStandup({
                session_id: activeSession.id,
                working_on: fields.working_on,
                completed_since_last: fields.completed ? [fields.completed] : [],
                blocked: fields.blocked ? [fields.blocked] : [],
                next_actions: fields.next ? [fields.next] : [],
                estimate_to_completion: fields.estimate || undefined,
              });
            }
          }
        } catch {
          console.warn('Failed to process TDL structured blocks from AI response');
        }

        // EXE-GAP-001: Write file deliverables to workspace
        // D81: SKIP auto file writing if scaffold plan is pending (user must approve first)
        if (!hasScaffoldPlan) {
          try {
            const fileResult = await ExecutionEngine.processFilesOnly(assistantContent, id);
            if (fileResult.filesCreated.length > 0 || fileResult.errors.length > 0) {
              assistantMessage.metadata = {
                ...assistantMessage.metadata,
                executionResult: {
                  filesCreated: fileResult.filesCreated,
                  filesUpdated: fileResult.filesUpdated,
                  progressUpdates: 0,
                  submissions: 0,
                  escalations: 0,
                  errors: fileResult.errors,
                }
              };

              // ENV-SYNC-01: Reconstruct file content array for commit + validation
              const writtenFiles: Array<{ path: string; content: string }> = [];
              if (fileResult.filesCreated.length > 0) {
                const codeFenceRegex = /```(\w+):([^\n]+)\n([\s\S]*?)```/g;
                let fenceMatch;
                while ((fenceMatch = codeFenceRegex.exec(assistantContent)) !== null) {
                  const [, , fPath, code] = fenceMatch;
                  const trimmedPath = fPath.trim();
                  if (fileResult.filesCreated.includes(trimmedPath)) {
                    writtenFiles.push({ path: trimmedPath, content: code.trim() });
                  }
                }
              }

              // ENV-SYNC-01 Phase 2: Auto-commit written files to GitHub
              if (
                token &&
                writtenFiles.length > 0 &&
                githubConnection?.connected &&
                githubConnection?.github_mode === 'WORKSPACE_SYNC' &&
                githubConnection?.repo_name &&
                githubConnection.repo_name !== 'PENDING'
              ) {
                try {
                  // ENV-SYNC-01 Phase 3: Detect scope markers for scope-level commit messages
                  const scopeCompleteMatch = assistantContent.match(/===\s*SCOPE COMPLETE:\s*(.+?)\s*===/);
                  const scopeName = scopeCompleteMatch?.[1]?.trim();
                  const commitMessage = scopeName
                    ? `[AIXORD] SCOPE: ${scopeName} — ${writtenFiles.length} file(s)`
                    : `[AIXORD] ${writtenFiles.length} file(s) written by AI`;
                  const commitResult = await ExecutionEngine.commitToGitHub(
                    id, writtenFiles, commitMessage, token, scopeName
                  );

                  if (commitResult.success) {
                    (assistantMessage.metadata as Record<string, unknown>).githubCommit = {
                      commit_sha: commitResult.commit_sha,
                      branch: commitResult.branch,
                      commit_url: commitResult.commit_url,
                      files_committed: writtenFiles.length,
                      scope_name: scopeName || undefined,
                    };
                  } else {
                    console.warn('GitHub auto-commit failed:', commitResult.error);
                  }
                } catch (commitErr) {
                  console.warn('GitHub auto-commit error:', commitErr);
                }
              }

              // ENV-SYNC-01 Phase 4: Cross-file import validation after file writes
              if (writtenFiles.length > 0) {
                try {
                  const validation = await validateScopeImports(id, writtenFiles);
                  if (validation.totalImports > 0) {
                    (assistantMessage.metadata as Record<string, unknown>).scopeValidation = {
                      valid: validation.valid,
                      totalImports: validation.totalImports,
                      resolvedImports: validation.resolvedImports,
                      unresolvedCount: validation.unresolvedImports.length,
                      unresolvedImports: validation.unresolvedImports.slice(0, 10), // Limit to 10
                      checkedFiles: validation.checkedFiles,
                    };
                  }
                } catch {
                  // Non-blocking — validation is best-effort
                }
              }

              // Re-save message with executionResult metadata
              await api.messages.create(id, {
                role: 'assistant',
                content: assistantContent,
                metadata: assistantMessage.metadata as Record<string, unknown>,
                session_id: activeSession?.id,
              }, token);
            }
          } catch (err) {
            console.warn('ExecutionEngine file processing failed:', err);
          }
        }
      }

      // Phase 2: Auto-evaluate gates after message exchange (GA:DIS, GA:LIC, GA:TIR may flip)
      // Immediate eval for any synchronous gate changes
      evaluateGatesAfterAction();
      // Delayed re-eval to catch backend waitUntil() async gate updates
      setTimeout(() => evaluateGatesAfterAction(), 2500);
      // HANDOFF-PTX-01: Always refresh state after message send to update governance ribbon
      // This ensures gate satisfaction is reflected even when evaluateGatesAfterAction
      // doesn't detect changes (e.g., gates already satisfied but ribbon stale)
      setTimeout(() => fetchState(), 1500);

    } catch (err) {
      console.error('Failed to send message:', err);

      let errorContent: string;
      let errorRole: 'system' | 'assistant' = 'system';
      let errorMetadata: Record<string, unknown> | undefined = undefined;

      if (err instanceof GovernanceBlockError) {
        // Phase 4: Hard Gate Enforcement — Router blocked the AI call
        // Governance lives OUTSIDE the model. The AI was never called.
        const gateLines = err.failedGates.map(g =>
          `• **${g.label}** — ${g.action}`
        ).join('\n');
        errorContent = `🛡️ **AIXORD Governance Block**\n\n` +
          `The AI model was **not called** — ${err.failedGates.length} required gate(s) must be satisfied for the **${err.phase}** phase.\n\n` +
          `**Required actions:**\n${gateLines}\n\n` +
          `Open the **Governance** tab or click the gate pills above to resolve.`;
        errorMetadata = {
          governance_block: true,
          phase: err.phase,
          failed_gates: err.failedGates,
        };
      } else if (err instanceof GateBlockedError) {
        const failedGates = err.gateResults.filter(g => !g.passed);
        const gateExplanations = failedGates.map(g => `- ${g.gate}: ${g.reason || 'Not completed'}`).join('\n');
        errorContent = `Setup Required\n\nSome project setup steps need to be completed before the AI can execute work.\n\nGates that need attention:\n${gateExplanations}\n\nOpen the Governance tab to review and complete the required gates.`;
      } else if (err instanceof AIExposureBlockedError) {
        errorContent = `AI Access Restricted\n\nThe current data classification restricts AI interaction.\n\n${err.reason || 'Please review the Data Classification settings.'}`;
      } else {
        errorContent = `Failed to get response: ${err instanceof Error ? err.message : 'Unknown error'}`;
      }

      const errorMessage: Message = {
        id: generateId(),
        role: errorRole,
        content: errorContent,
        timestamp: new Date(),
        ...(errorMetadata && { metadata: errorMetadata }),
      };

      setConversation((prev) => prev ? {
        ...prev,
        messages: [...prev.messages, errorMessage],
        updatedAt: new Date()
      } : prev);
    } finally {
      setChatLoading(false);
    }
  };

  // D81: Wire up modify scaffold plan ref (avoids forward-declaration of handleSendMessage)
  handleModifyScaffoldPlanRef.current = async (messageId: string, feedback: string) => {
    if (!conversation || !id) return;
    setConversation(prev => prev ? {
      ...prev,
      messages: prev.messages.map(m => {
        if (m.id !== messageId || !m.metadata?.scaffoldPlan) return m;
        return {
          ...m,
          metadata: {
            ...m.metadata,
            scaffoldPlan: { ...m.metadata.scaffoldPlan, status: 'modified' as const },
          },
        };
      }),
    } : prev);
    await handleSendMessage(`Modify the scaffold plan: ${feedback}\n\nPlease output an updated === SCAFFOLD PLAN === block.`, 'BALANCED');
  };

  // ============================================================================
  // Message Action Handlers (copy, regenerate, edit)
  // ============================================================================

  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
  }, []);

  const handleRegenerateMessage = useCallback((messageIndex: number) => {
    if (!conversation) return;
    const messages = conversation.messages;
    // Find the preceding user message
    let priorUserMsg: Message | null = null;
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        priorUserMsg = messages[i];
        break;
      }
    }
    if (!priorUserMsg) return;

    // Remove the assistant message from display state
    setConversation((prev) => prev ? {
      ...prev,
      messages: prev.messages.filter((_, i) => i !== messageIndex),
      updatedAt: new Date()
    } : prev);

    // Re-send the prior user message
    handleSendMessage(priorUserMsg.content, 'BALANCED');
  }, [conversation, handleSendMessage]);

  const handleEditMessage = useCallback((messageIndex: number, newContent: string) => {
    if (!conversation) return;

    // Update the message in display state
    setConversation((prev) => {
      if (!prev) return prev;
      const updated = [...prev.messages];
      updated[messageIndex] = { ...updated[messageIndex], content: newContent };
      // Remove all messages after this one (they'll be regenerated)
      const trimmed = updated.slice(0, messageIndex + 1);
      return { ...prev, messages: trimmed, updatedAt: new Date() };
    });

    // Re-send with new content to get fresh AI response
    handleSendMessage(newContent, 'BALANCED');
  }, [conversation, handleSendMessage]);

  // New Session handler — uses Session Graph API
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);

  const handleNewSession = () => {
    setShowNewSessionModal(true);
  };

  const handleCreateSession = async (opts: {
    sessionType: SessionType;
    parentSessionId?: string;
    edgeType?: EdgeType;
  }) => {
    const newSession = await createSession({
      sessionType: opts.sessionType,
      parentSessionId: opts.parentSessionId,
      edgeType: opts.edgeType,
    });

    if (newSession) {
      // Reset local conversation state for the new session
      setConversation({
        id: `conv_${id}_s${newSession.session_number}`,
        projectId: id || '',
        title: project?.name || '',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setSessionCost(0);
      setSessionTokens(0);
      setShowNewSessionModal(false);

      // Refresh governance state from backend
      await fetchState();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ============================================================================
  // Computed Values
  // ============================================================================

  const isLoading = projectLoading || stateLoading;
  const currentPhase = state?.session.phase || 'BRAINSTORM';

  // Count completed gates
  const gatesComplete = state ? Object.values(state.gates).filter(Boolean).length : 0;
  const gatesTotal = state ? Object.keys(state.gates).length : 0;

  // ============================================================================
  // Render
  // ============================================================================

  if (!id) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Project not found</h1>
          <Link to="/dashboard" className="text-violet-400 hover:text-violet-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">
      {/* Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabClick={handleTabClick}
        projectName={project?.name}
        userEmail={user?.email}
        onLogout={handleLogout}
        onNewSession={handleNewSession}
        projectId={id}
        sessionNumber={activeSession?.session_number || state?.session.number}
        hiddenTabs={hiddenTabs}
      />

      {/* MiniBar — always visible governance strip */}
      {state && (
        <MiniBar
          currentPhase={currentPhase}
          gates={state.gates}
          onTabClick={handleTabClick}
          activeTab={activeTab}
          hiddenTabs={hiddenTabs}
        />
      )}

      {/* Detail Panel (Ribbon) */}
      <Ribbon activeTab={activeTab} onClose={() => setActiveTab(null)}>
        {activeTab === 'governance' && state && (
          <GovernanceRibbon
            currentPhase={currentPhase}
            onSetPhase={handleSetPhase}
            gates={state.gates}
            onToggleGate={handleToggleGate}
            isLoading={isLoading}
            phaseError={phaseError}
            onOpenWorkspaceSetup={() => setShowWorkspaceWizard(true)}
            onFinalizePhase={handleFinalizePhase}
            isFinalizing={isFinalizing}
            finalizeReady={brainstormArtifactJustSaved}
          />
        )}
        {activeTab === 'security' && id && token && (
          <SecurityRibbon
            projectId={id}
            token={token}
            isLoading={isLoading}
          />
        )}
        {activeTab === 'evidence' && (
          <EvidenceRibbon
            isConnected={!!githubConnection?.connected}
            repoOwner={githubConnection?.repo_owner}
            repoName={githubConnection?.repo_name}
            lastSync={githubConnection?.last_sync}
            onConnect={handleGitHubConnect}
            onDisconnect={handleGitHubDisconnect}
            onSelectRepo={handleGitHubSelectRepo}
            onSync={handleEvidenceSync}
            repos={githubRepos}
            needsRepoSelection={githubConnection?.connected && (!githubConnection?.repo_name || githubConnection?.repo_name === 'PENDING')}
            recentEvidence={recentEvidence}
            onDeleteImage={handleDeleteImage}
            isLoading={isLoading}
          />
        )}
        {activeTab === 'blueprint' && (
          <BlueprintRibbon
            summary={blueprint.summary}
            scopes={blueprint.scopes}
            deliverables={blueprint.deliverables}
            integrityReport={blueprint.integrityReport}
            isLoading={blueprint.isLoading}
            onOpenPanel={() => setBlueprintPanelOpen(true)}
            onRunValidation={async () => {
              await blueprint.runValidation();
              await blueprint.loadSummary();
            }}
            onDeleteScope={async (scopeId) => {
              await blueprint.deleteScope(scopeId);
            }}
            onDeleteDeliverable={async (deliverableId) => {
              await blueprint.deleteDeliverable(deliverableId);
            }}
          />
        )}
        {activeTab === 'engineering' && (
          <EngineeringRibbon
            compliance={engineering.compliance || undefined}
            isLoading={engineering.isLoading}
            onOpenPanel={(section: string) => {
              setEngineeringPanelSection((section as EngineeringSection) || 'sar');
              setEngineeringPanelOpen(true);
            }}
          />
        )}
        {activeTab === 'tasks' && (
          <div className="p-4">
            <EscalationBanner
              escalations={tdl.escalations}
              onResolve={async (escalationId, resolution) => {
                await tdl.resolveEscalation(escalationId, { resolution });
              }}
            />
            <TaskBoard
              taskBoard={tdl.taskBoard}
              assignments={tdl.assignments}
              isLoading={tdl.isLoading}
              onStart={async (assignmentId) => { await tdl.startAssignment(assignmentId); }}
              onSubmit={async (assignmentId) => {
                const a = tdl.assignments.find(x => x.id === assignmentId);
                if (a) await tdl.submitAssignment(assignmentId, { submission_summary: a.progress_notes || 'Submitted for review' });
              }}
              onAccept={async (assignmentId) => { await tdl.acceptAssignment(assignmentId); }}
              onReject={async (assignmentId) => { await tdl.rejectAssignment(assignmentId, { review_notes: 'Needs revision' }); }}
              onBlock={async (assignmentId) => { await tdl.blockAssignment(assignmentId, { blocked_reason: 'Blocked by Director' }); }}
            />
          </div>
        )}
        {activeTab === 'memory' && (
          <ProjectMemoryPanel
            capsule={continuityHook.capsule}
            loading={continuityHook.loading}
            error={continuityHook.error}
            onRefresh={continuityHook.refresh}
            onPin={continuityHook.pinItem}
            onUnpin={continuityHook.unpinItem}
          />
        )}
        {activeTab === 'info' && project && id && token && (
          <InfoRibbon
            projectId={id}
            token={token}
            projectName={project.name}
            objective={project.objective}
            realityClassification={project.realityClassification}
            createdAt={project.createdAt}
            sessionNumber={activeSession?.session_number || state?.session.number || 1}
            sessionCost={sessionCost}
            sessionTokens={sessionTokens}
            messageCount={conversation?.messages.length || 0}
            sessionMetrics={sessionMetrics}
            availableModels={availableModels || undefined}
            sessions={sessions}
            activeSessionId={activeSession?.id}
            onSwitchSession={switchSession}
            onUpdateProject={handleUpdateProject}
          />
        )}
      </Ribbon>

      {/* CCS Report Button (when no active incident) */}
      {(!ccsStatus?.active_incident || ccsStatus?.GA_CCS === 0) && (
        <div className="px-4 py-1 flex justify-end">
          <button
            onClick={() => setShowCCSCreate(true)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Report Credential Incident
          </button>
        </div>
      )}

      {/* CCS Incident Banner */}
      {ccsStatus?.GA_CCS === 1 && ccsStatus.active_incident && (
        <CCSIncidentBanner
          incidentNumber={ccsStatus.active_incident.incident_number}
          phase={ccsStatus.active_incident.phase}
          credentialName={ccsStatus.active_incident.credential_name}
          credentialType={ccsStatus.active_incident.credential_type}
          onViewDetails={() => setShowCCSPanel(true)}
        />
      )}

      {/* Error Display */}
      {projectError && (
        <div className="mx-4 mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{projectError}</p>
        </div>
      )}

      {/* Chat Area (Maximized) */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Loading State */}
        {isLoading && !project && (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
          </div>
        )}

        {/* Workspace Not Bound Banner (P1-3: re-entry path) */}
        {project && workspaceChecked && workspaceStatus && !workspaceStatus.bound && (
          <div className={`mx-4 mt-2 border rounded-lg px-4 py-2.5 flex items-center justify-between ${
            state?.session.phase === 'EXECUTE' || state?.session.phase === 'E'
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-amber-500/10 border-amber-500/20'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${
                state?.session.phase === 'EXECUTE' || state?.session.phase === 'E' ? 'text-red-400' : 'text-amber-400'
              }`}>{state?.session.phase === 'EXECUTE' || state?.session.phase === 'E' ? '🚫' : '⚠️'}</span>
              <span className={`text-sm ${
                state?.session.phase === 'EXECUTE' || state?.session.phase === 'E' ? 'text-red-300' : 'text-amber-300'
              }`}>
                {state?.session.phase === 'EXECUTE' || state?.session.phase === 'E'
                  ? 'No workspace folder linked — files will NOT be written. Link a folder so the AI can create project files.'
                  : 'Workspace not configured — link a project folder for full governance'}
              </span>
            </div>
            <button
              onClick={() => setShowWorkspaceWizard(true)}
              className={`px-3 py-1 text-xs border rounded transition-colors ${
                state?.session.phase === 'EXECUTE' || state?.session.phase === 'E'
                  ? 'bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30 animate-pulse'
                  : 'bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30'
              }`}
            >
              Link folder now
            </button>
          </div>
        )}
        {/* Workspace Bound Confirmation — show target folder during EXECUTE */}
        {project && workspaceChecked && workspaceStatus?.bound && (state?.session.phase === 'EXECUTE' || state?.session.phase === 'E') && (
          <div className="mx-4 mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="text-emerald-400 text-sm">📁</span>
            <span className="text-emerald-300 text-sm">
              Files writing to: <span className="font-mono font-semibold">{workspaceStatus.folder_name}</span>
            </span>
          </div>
        )}

        {/* Chat Messages */}
        {project && (
          <div className="flex-1 overflow-y-auto p-4">
            {(!conversation || conversation.messages.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                {/* Phase icon */}
                <div className="text-5xl mb-3">
                  {activeSession?.session_type === 'BRAINSTORM' ? '💡' :
                   activeSession?.session_type === 'BLUEPRINT' ? '📋' :
                   activeSession?.session_type === 'EXECUTE' ? '⚡' :
                   activeSession?.session_type === 'AUDIT' ? '🔍' :
                   activeSession?.session_type === 'VERIFY_LOCK' ? '🔒' :
                   activeSession?.session_type === 'DISCOVER' ? '🔭' : '🚀'}
                </div>

                {/* Project objective */}
                {project.objective && (
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg px-4 py-3 mb-4 max-w-lg">
                    <p className="text-violet-300 text-xs font-medium uppercase tracking-wide mb-1">Project Objective</p>
                    <p className="text-white text-sm">{project.objective}</p>
                  </div>
                )}

                {/* Phase + session context */}
                <h4 className="text-lg font-medium text-white mb-1">
                  {activeSession?.session_type || 'BRAINSTORM'} Phase — Session {activeSession?.session_number || 1}
                </h4>
                <p className="text-gray-400 text-sm max-w-md mb-4">
                  {activeSession?.session_type === 'BRAINSTORM'
                    ? 'Explore ideas, define scope, and identify requirements for your project.'
                    : activeSession?.session_type === 'BLUEPRINT'
                    ? 'Structure your implementation approach, define deliverables and architecture.'
                    : activeSession?.session_type === 'EXECUTE'
                    ? 'Implement planned work — write code, create artifacts, build deliverables.'
                    : activeSession?.session_type === 'AUDIT'
                    ? 'Evaluate completed work against your objective and plan next steps.'
                    : activeSession?.session_type === 'VERIFY_LOCK'
                    ? 'Final verification and sign-off on completed deliverables.'
                    : activeSession?.session_type === 'DISCOVER'
                    ? 'Explore the problem space and gather context.'
                    : 'Start your governed AI conversation below.'}
                </p>

                {/* Gates status summary */}
                {gatesComplete !== undefined && gatesTotal !== undefined && (
                  <div className="text-gray-500 text-xs mb-3">
                    Governance: {gatesComplete}/{gatesTotal} gates cleared
                  </div>
                )}

                {/* Suggested first prompt */}
                <div className="bg-gray-800/50 border border-gray-700/30 rounded-lg px-4 py-2.5 max-w-md">
                  <p className="text-gray-500 text-xs mb-1">Try asking:</p>
                  <p className="text-gray-300 text-sm italic">
                    {activeSession?.session_type === 'BRAINSTORM'
                      ? `"Help me break down the scope and identify the key features for this project."`
                      : activeSession?.session_type === 'BLUEPRINT'
                      ? `"Create a technical architecture and implementation plan based on our brainstorm."`
                      : activeSession?.session_type === 'EXECUTE'
                      ? `"Let's start implementing the first deliverable from our plan."`
                      : activeSession?.session_type === 'AUDIT'
                      ? `"Review what we've built against the original objective and identify gaps."`
                      : activeSession?.session_type === 'VERIFY_LOCK'
                      ? `"Verify all deliverables are complete and ready for sign-off."`
                      : activeSession?.session_type === 'DISCOVER'
                      ? `"Help me understand the problem space and gather requirements."`
                      : `"Help me explore ideas and define scope for this project."`}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {conversation.messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    token={token || undefined}
                    onPhaseAdvance={message.role === 'assistant' ? handlePhaseAdvance : undefined}
                    onCopy={handleCopyMessage}
                    onRegenerate={message.role === 'assistant' ? () => handleRegenerateMessage(index) : undefined}
                    onEdit={message.role === 'user' ? (newContent: string) => handleEditMessage(index, newContent) : undefined}
                    workspaceFolderName={workspaceStatus?.folder_name || undefined}
                    workspaceBound={!!workspaceStatus?.bound}
                    onApproveScaffoldPlan={handleApproveScaffoldPlan}
                    onModifyScaffoldPlan={handleModifyScaffoldPlan}
                  />
                ))}

                {/* Loading indicator */}
                {chatLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-800 text-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm text-gray-400">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        )}

        {/* Pending Images Display */}
        {pendingImages.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-800 bg-gray-900/50">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-gray-400 text-xs shrink-0">Attached:</span>
              {pendingImages.map((img, index) => (
                <div key={index} className="relative group shrink-0">
                  <img
                    src={img.preview}
                    alt={img.file.name}
                    className="w-12 h-12 rounded object-cover border border-gray-700"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={handleClearImages}
                className="text-gray-400 hover:text-white text-xs"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* HANDOFF-PTX-01 + BQL-01: Inline Finalize Prompt + Readiness Indicator */}
      {brainstormArtifactJustSaved && (state?.session.phase === 'BRAINSTORM' || state?.session.phase === 'B') && (
        <div className="mx-4 mb-2 space-y-2">
          {/* Readiness indicator (BQL-01 Layer 2c) */}
          {brainstormReadiness && brainstormReadiness.artifact_exists && (
            <div className={`rounded-lg p-3 border ${
              brainstormReadiness.ready
                ? 'bg-green-900/20 border-green-500/30'
                : 'bg-amber-900/20 border-amber-500/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${brainstormReadiness.ready ? 'text-green-400' : 'text-amber-400'}`}>
                  {brainstormReadiness.ready ? 'Ready to finalize' : 'Improvements needed'}
                </span>
                {!brainstormReadiness.ready && (
                  <button
                    onClick={() => {
                      const weakDims = brainstormReadiness.dimensions
                        .filter(d => d.status !== 'PASS')
                        .map(d => `${d.dimension}: ${d.detail}`)
                        .join('; ');
                      handleSendMessage(
                        `Please improve the brainstorm artifact. These dimensions need work: ${weakDims}. Regenerate the full artifact with improvements.`,
                        'BALANCED'
                      );
                    }}
                    disabled={chatLoading}
                    className="text-xs bg-amber-600 text-white px-2.5 py-1 rounded hover:bg-amber-500 transition-colors disabled:opacity-50"
                  >
                    Ask AI to improve
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {brainstormReadiness.dimensions.map(d => (
                  <span
                    key={d.dimension}
                    title={d.detail}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      d.status === 'PASS'
                        ? 'bg-green-500/20 text-green-400'
                        : d.status === 'WARN'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {d.status === 'PASS' ? '✓' : d.status === 'WARN' ? '⚠' : '✗'} {d.dimension.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Finalize prompt */}
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-blue-300">Brainstorm artifact captured</p>
              <p className="text-xs text-blue-400/70">
                {brainstormReadiness?.ready === false
                  ? 'Improve quality above, or finalize with overrides.'
                  : 'When you\'re satisfied with the brainstorm, finalize to advance to Planning.'}
              </p>
            </div>
            <button
              onClick={() => {
                handleFinalizePhase(state?.session.phase === 'B' ? 'BRAINSTORM' : state?.session.phase || 'BRAINSTORM');
                setBrainstormArtifactJustSaved(false);
                setBrainstormReadiness(null);
              }}
              disabled={isFinalizing}
              className="shrink-0 bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {isFinalizing ? 'Finalizing...' : 'Finalize Brainstorm →'}
            </button>
            <button
              onClick={() => { setBrainstormArtifactJustSaved(false); setBrainstormReadiness(null); brainstormFinalizeDismissedRef.current = true; }}
              className="shrink-0 text-blue-400/50 hover:text-blue-300 transition-colors"
              title="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Quick Action Suggestion Buttons */}
      <QuickActions
        phase={currentPhase}
        onSend={handleSendMessage}
        isLoading={chatLoading}
        lastMessageRole={conversation?.messages.length ? conversation.messages[conversation.messages.length - 1].role : undefined}
      />

      {/* Status Bar with Input */}
      <StatusBar
        phase={currentPhase}
        gatesComplete={gatesComplete}
        gatesTotal={gatesTotal}
        sessionCost={sessionCost}
        messageCount={conversation?.messages.length || 0}
        isLoading={chatLoading}
        onSendMessage={handleSendMessage}
        onImageClick={() => setShowImageUpload(true)}
        onPasteImage={handlePasteImage}
        onClearMessages={handleClearMessages}
        pendingImageCount={pendingImages.length}
        assistanceMode={settings.preferences.assistanceMode}
      />

      {/* Image Upload Modal */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Attach Image</h3>
              <button
                onClick={() => setShowImageUpload(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ImageUpload
              images={pendingImages}
              onAdd={handleAddImage}
              onRemove={handleRemoveImage}
              onClear={handleClearImages}
              disabled={chatLoading}
            />
          </div>
        </div>
      )}

      {/* CCS Incident Panel */}
      {showCCSPanel && ccsStatus?.incident_id && id && token && (
        <CCSIncidentPanel
          projectId={id}
          incidentId={ccsStatus.incident_id}
          token={token}
          onClose={() => setShowCCSPanel(false)}
          onUpdate={() => fetchCCSStatus()}
        />
      )}

      {/* Engineering Governance Panel (Part XIV) */}
      {engineeringPanelOpen && id && token && (
        <EngineeringPanel
          projectId={id}
          token={token}
          initialSection={engineeringPanelSection}
          onClose={() => setEngineeringPanelOpen(false)}
          onUpdate={() => engineering.loadCompliance()}
        />
      )}

      {/* Blueprint Governance Panel (L-BPX, L-IVL) */}
      {blueprintPanelOpen && id && token && (
        <BlueprintPanel
          projectId={id}
          token={token}
          onClose={() => setBlueprintPanelOpen(false)}
          onUpdate={async () => {
            await blueprint.loadScopes();
            await blueprint.loadDeliverables();
            await blueprint.loadSummary();
          }}
          onEvaluateGates={evaluateGatesAfterAction}
        />
      )}

      {/* Workspace Setup Wizard (Unified GA:ENV + GA:FLD) */}
      {showWorkspaceWizard && id && token && (
        <WorkspaceSetupWizard
          projectId={id}
          token={token}
          onComplete={handleWorkspaceComplete}
          onSkip={() => setShowWorkspaceWizard(false)}
          githubConnection={githubConnection}
          onGitHubConnect={handleGitHubConnect}
          onGitHubDisconnect={handleGitHubDisconnect}
          onGitHubSelectRepo={handleGitHubSelectRepo}
          githubRepos={githubRepos}
        />
      )}

      {/* Environment Awareness Report (post-workspace-confirmation probes) */}
      {showEnvReport && id && token && (
        <EnvironmentAwarenessReport
          projectId={id}
          token={token}
          onClose={handleEnvReportClose}
        />
      )}

      {/* CCS Create Incident Modal */}
      {showCCSCreate && (
        <CCSCreateIncidentModal
          onConfirm={handleCreateCCSIncident}
          onCancel={() => setShowCCSCreate(false)}
        />
      )}

      {/* New Session Modal (AIXORD v4.4 Session Graph) */}
      {showNewSessionModal && (
        <NewSessionModal
          currentSession={activeSession}
          sessions={sessions}
          onConfirm={handleCreateSession}
          onCancel={() => setShowNewSessionModal(false)}
        />
      )}

      {/* Quality Warning Override Modal (VD-CI-01 A4) */}
      {pendingWarnings && warningPhase && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}>
          <div style={{
            background: '#1a1a2e', border: '1px solid #e2b714',
            borderRadius: '12px', padding: '24px', maxWidth: '520px', width: '90%',
            color: '#e0e0e0', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            <h3 style={{ color: '#e2b714', margin: '0 0 16px', fontSize: '16px' }}>
              ⚠️ Quality Warnings — Director Override Required
            </h3>
            <p style={{ fontSize: '13px', color: '#aaa', margin: '0 0 12px' }}>
              Phase <strong>{warningPhase}</strong> passed all blocking checks but has quality warnings.
              You may override these warnings with a reason (logged to decision ledger).
            </p>
            <div style={{
              background: '#12121f', borderRadius: '8px', padding: '12px',
              marginBottom: '16px', maxHeight: '200px', overflowY: 'auto',
            }}>
              {pendingWarnings.map((w, i) => (
                <div key={i} style={{
                  padding: '6px 0', borderBottom: i < pendingWarnings.length - 1 ? '1px solid #2a2a3e' : 'none',
                  fontSize: '13px',
                }}>
                  <span style={{ color: '#e2b714' }}>⚠ {w.check}</span>
                  <div style={{ color: '#888', fontSize: '12px', marginTop: '2px' }}>{w.detail}</div>
                </div>
              ))}
            </div>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Override reason (required) — explain why these warnings are acceptable..."
              style={{
                width: '100%', height: '70px', background: '#12121f', border: '1px solid #333',
                borderRadius: '6px', color: '#e0e0e0', padding: '8px', fontSize: '13px',
                resize: 'vertical', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
              {/* BQL-01 Layer 2d: Ask AI to Fix button */}
              <button
                onClick={() => {
                  const issues = pendingWarnings
                    .filter(w => !w.passed)
                    .map(w => `${w.check}: ${w.detail}`)
                    .join('; ');
                  handleWarningDismiss();
                  handleSendMessage(
                    `The brainstorm artifact has quality warnings that need fixing: ${issues}. Please regenerate the full artifact with these issues resolved.`,
                    'BALANCED'
                  );
                }}
                disabled={chatLoading}
                style={{
                  padding: '8px 16px', background: '#7c3aed', border: 'none',
                  borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                Ask AI to Fix
              </button>
              <button
                onClick={handleWarningDismiss}
                style={{
                  padding: '8px 16px', background: 'transparent', border: '1px solid #444',
                  borderRadius: '6px', color: '#aaa', cursor: 'pointer', fontSize: '13px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleWarningOverride}
                disabled={!overrideReason.trim() || isFinalizing}
                style={{
                  padding: '8px 16px', background: overrideReason.trim() ? '#e2b714' : '#444',
                  border: 'none', borderRadius: '6px',
                  color: overrideReason.trim() ? '#000' : '#666',
                  cursor: overrideReason.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 600, fontSize: '13px',
                }}
              >
                {isFinalizing ? 'Overriding...' : 'Override & Finalize'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GFB-01: REASSESS Protocol Modal */}
      {reassessModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}>
          <div style={{
            background: '#1a1a2e',
            border: `1px solid ${reassessModal.level >= 3 ? '#ef4444' : reassessModal.level >= 2 ? '#f59e0b' : '#3b82f6'}`,
            borderRadius: '12px', padding: '24px', maxWidth: '560px', width: '90%',
            color: '#e0e0e0', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            <h3 style={{
              color: reassessModal.level >= 3 ? '#ef4444' : reassessModal.level >= 2 ? '#f59e0b' : '#3b82f6',
              margin: '0 0 16px', fontSize: '16px',
            }}>
              {reassessModal.level >= 3 ? '🔴' : reassessModal.level >= 2 ? '🟠' : '🔵'}{' '}
              Phase Reassessment — Level {reassessModal.level}
              {reassessModal.level === 1 && ' (Surgical Fix)'}
              {reassessModal.level === 2 && ' (Major Pivot)'}
              {reassessModal.level === 3 && ' (Fresh Start)'}
            </h3>

            <p style={{ fontSize: '13px', color: '#aaa', margin: '0 0 12px' }}>
              You are moving <strong>backward</strong> from{' '}
              <span style={{ color: '#fff' }}>{reassessModal.phaseFrom}</span> →{' '}
              <span style={{ color: '#fff' }}>{reassessModal.targetPhase}</span>.
              {reassessModal.crossKingdom && (
                <span style={{ color: '#f59e0b' }}>
                  {' '}This crosses kingdom boundaries (Realization → Ideation/Blueprint).
                </span>
              )}
            </p>

            {/* Level indicator pills */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              {[1, 2, 3].map(l => (
                <span key={l} style={{
                  padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                  background: l === reassessModal.level
                    ? (l >= 3 ? '#ef4444' : l >= 2 ? '#f59e0b' : '#3b82f6')
                    : '#2a2a3e',
                  color: l === reassessModal.level ? '#fff' : '#666',
                }}>
                  L{l}: {l === 1 ? 'Surgical' : l === 2 ? 'Pivot' : 'Fresh Start'}
                </span>
              ))}
            </div>

            {reassessModal.level >= 2 && (
              <div style={{
                background: '#1c1c0f', border: '1px solid #f59e0b33', borderRadius: '8px',
                padding: '10px', marginBottom: '12px', fontSize: '12px', color: '#f59e0b',
              }}>
                ⚠️ <strong>Artifact Impact:</strong> Active artifacts will be marked as SUPERSEDED.
                {reassessModal.level >= 3 && (
                  <span> This is reassessment #{reassessModal.reassessCount || '3+'}. A review summary is required.</span>
                )}
              </div>
            )}

            {phaseError && (
              <div style={{
                background: '#2a1015', border: '1px solid #ef444466', borderRadius: '6px',
                padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: '#f87171',
              }}>
                {phaseError}
              </div>
            )}

            <textarea
              value={reassessReason}
              onChange={(e) => setReassessReason(e.target.value)}
              placeholder="Reassessment reason (required, min 20 characters) — why must the project go back?"
              style={{
                width: '100%', height: '70px', background: '#12121f', border: '1px solid #333',
                borderRadius: '6px', color: '#e0e0e0', padding: '8px', fontSize: '13px',
                resize: 'vertical', boxSizing: 'border-box',
              }}
            />
            <div style={{ fontSize: '11px', color: reassessReason.length >= 20 ? '#4ade80' : '#666', textAlign: 'right', marginTop: '2px' }}>
              {reassessReason.length}/20 characters
            </div>

            {reassessModal.level >= 3 && (
              <>
                <textarea
                  value={reassessReview}
                  onChange={(e) => setReassessReview(e.target.value)}
                  placeholder="Review summary (required for Level 3, min 50 characters) — explain the reassessment pattern..."
                  style={{
                    width: '100%', height: '80px', background: '#12121f', border: '1px solid #333',
                    borderRadius: '6px', color: '#e0e0e0', padding: '8px', fontSize: '13px',
                    resize: 'vertical', boxSizing: 'border-box', marginTop: '8px',
                  }}
                />
                <div style={{ fontSize: '11px', color: reassessReview.length >= 50 ? '#4ade80' : '#666', textAlign: 'right', marginTop: '2px' }}>
                  {reassessReview.length}/50 characters
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleReassessDismiss}
                style={{
                  padding: '8px 16px', background: 'transparent', border: '1px solid #444',
                  borderRadius: '6px', color: '#aaa', cursor: 'pointer', fontSize: '13px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReassessConfirm}
                disabled={reassessReason.length < 20 || (reassessModal.level >= 3 && reassessReview.length < 50)}
                style={{
                  padding: '8px 16px',
                  background: reassessReason.length >= 20 && (reassessModal.level < 3 || reassessReview.length >= 50)
                    ? (reassessModal.level >= 3 ? '#ef4444' : reassessModal.level >= 2 ? '#f59e0b' : '#3b82f6')
                    : '#444',
                  border: 'none', borderRadius: '6px',
                  color: reassessReason.length >= 20 ? '#fff' : '#666',
                  cursor: reassessReason.length >= 20 ? 'pointer' : 'not-allowed',
                  fontWeight: 600, fontSize: '13px',
                }}
              >
                Confirm Reassessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Project;
