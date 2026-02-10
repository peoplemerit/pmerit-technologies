/**
 * AIXORD Router Types
 *
 * Defines contracts for the Model Router service.
 * Based on MODEL_ROUTER_SPEC.md and HANDOFF-D4-CHAT.md
 */

// =============================================================================
// ENVIRONMENT
// =============================================================================

export interface Env {
  // API Keys (secrets)
  ANTHROPIC_API_KEY: string;
  OPENAI_API_KEY: string;
  GOOGLE_API_KEY: string;
  DEEPSEEK_API_KEY?: string;

  // Billing (secrets)
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  GUMROAD_PRODUCT_ID?: string;
  KDP_CODE_SECRET?: string;

  // Auth
  AUTH_SALT?: string;

  // Email (Resend)
  RESEND_API_KEY?: string;

  // GitHub OAuth (HANDOFF-D4-GITHUB-EVIDENCE)
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GITHUB_REDIRECT_URI?: string;
  GITHUB_TOKEN_ENCRYPTION_KEY?: string;

  // Frontend URL for OAuth redirects (PATCH-CORS-01)
  FRONTEND_URL?: string;

  // D1 Database
  DB: D1Database;

  // R2 Object Storage - Image Evidence (ENH-4)
  IMAGES: R2Bucket;

  // Environment
  ENVIRONMENT: string;
}

// =============================================================================
// ROUTER REQUEST/RESPONSE
// =============================================================================

export type Product = 'AIXORD_COPILOT' | 'PMERIT_CHATBOT';

export type Intent = 'CHAT' | 'VERIFY' | 'EXTRACT' | 'CLASSIFY' | 'RAG_VERIFY';

// ============================================================================
// Multi-Model Governance Types (PATCH-MOD-01)
// ============================================================================

/**
 * Extended intent categories for model-appropriate routing
 * Based on task-model affinity analysis
 */
export type RouterIntent =
  | 'CHAT'           // General conversation (default)
  | 'VERIFY'         // Governance verification, compliance checks
  | 'EXTRACT'        // Structured data extraction
  | 'CLASSIFY'       // Categorization tasks
  | 'BRAINSTORM'     // Ideation, exploration
  | 'SUMMARIZE'      // Synthesis, condensation
  | 'IMPLEMENT'      // Code generation (when applicable)
  | 'AUDIT'          // Reconciliation, audit tasks
  | 'RAG_VERIFY';    // RAG verification (existing)

/**
 * Model affinity configuration
 * Defines preferred providers per intent
 */
export interface ModelAffinity {
  intent: RouterIntent;
  preferred: Provider[];    // Provider names in priority order
  rationale: string;        // Why this allocation (for audit)
  fallback: 'mode' | 'first'; // Fallback strategy if preferred unavailable
}

/**
 * Model selection log entry (for audit trail)
 */
export interface ModelSelectionLog {
  request_id: string;
  timestamp: string;
  intent: RouterIntent;
  mode: Mode;
  tier: SubscriptionTier;
  affinity_matched: boolean;
  selected_provider: Provider;
  selected_model: string;
  rationale: string;
}

export type Mode = 'ECONOMY' | 'BALANCED' | 'PREMIUM';

export type SubscriptionTier =
  | 'TRIAL'
  | 'MANUSCRIPT_BYOK'
  | 'BYOK_STANDARD'
  | 'PLATFORM_STANDARD'
  | 'PLATFORM_PRO'
  | 'ENTERPRISE';

export type KeyMode = 'PLATFORM' | 'BYOK';

export type ModelClass =
  | 'ULTRA_CHEAP'
  | 'FAST_ECONOMY'
  | 'HIGH_QUALITY'
  | 'FRONTIER'
  | 'FAST_VERIFY'
  | 'RAG_VERIFY';

export type Provider = 'anthropic' | 'openai' | 'google' | 'deepseek';

export interface Capsule {
  objective: string;
  phase: 'B' | 'P' | 'E' | 'R';
  constraints: string[];
  decisions: string[];
  open_questions: string[];
  session_graph?: {
    current: { number: number; type: string; messageCount: number };
    lineage: Array<{ number: number; type: string; edgeType: string; summary?: string; messageCount?: number }>;
    total: number;
  };
  workspace?: {
    bound: boolean;
    folder_name?: string;
    template?: string;
    permission_level?: string;
    scaffold_generated?: boolean;
    github_connected?: boolean;
    github_repo?: string;
  };
  // AI-Governance Integration — Phase 1: Gate & Blueprint awareness
  gates?: {
    setup: Record<string, boolean>;   // GA:* gates
    work: Record<string, boolean>;    // GW:* gates
    security: Record<string, boolean>; // GS:* gates
  };
  blueprint_summary?: {
    scopes: number;
    deliverables: number;
    deliverables_with_dod: number;
    integrity_passed: boolean | null;
  };
  phase_exit?: {
    current_phase: string;
    required_gates: string[];
    satisfied_gates: string[];
    missing_gates: string[];
    can_advance: boolean;
  };
  // Legacy capsule field from project creation (kept in sync with gates.security)
  security_gates?: Record<string, boolean>;
}

export interface ArtifactRef {
  id: string;
  hash: string;
  type: 'md' | 'pdf' | 'json' | 'txt' | 'img';
  hint?: string;
}

/** Image content for vision API (ENH-4: Session 19 fix) */
export interface ImageContent {
  type: 'image';
  media_type: string; // e.g., 'image/png', 'image/jpeg'
  base64: string;
  filename?: string;
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

export interface Delta {
  user_input: string;
  selection_ids?: string[];
  changed_constraints?: string[];
  artifact_refs?: ArtifactRef[];
  /** Image data for vision API (ENH-4) */
  images?: ImageContent[];
  /** Execution layer context for layered execution mode (Path B) */
  execution_layer?: ExecutionLayerContext;
}

export interface Budget {
  max_cost_usd?: number;
  max_input_tokens?: number;
  max_output_tokens?: number;
  max_latency_ms?: number;
}

export interface PolicyFlags {
  require_citations?: boolean;
  strict_mode?: boolean;
  allow_retry?: boolean;
}

export interface Trace {
  project_id: string;
  session_id: string;
  request_id: string;
  user_id: string;
}

export interface Subscription {
  tier: SubscriptionTier;
  key_mode: KeyMode;
  user_api_key?: string;
}

/**
 * Content redaction configuration (SPG-01 — L-SPG3)
 * Set internally by router when ai_exposure = CONFIDENTIAL
 */
export interface RedactionConfig {
  enabled: boolean;
  mask_pii: boolean;    // Mask SSN, email, phone patterns
  mask_phi: boolean;    // Mask medical record numbers, diagnoses
  mask_minor_data: boolean; // Mask child/minor identifiers
}

/**
 * Context Awareness Bridge (HANDOFF-PR-01)
 * Read-only context injected by router into system prompt.
 * AI sees summaries and flags — never raw secrets or authority.
 */
export interface ContextAwareness {
  // Tier 1A: Security gates visibility
  security?: {
    data_classified: boolean;
    access_control_configured: boolean;
    dependency_protected: boolean;
    ai_compliant: boolean;
    jurisdiction_reviewed: boolean;
    retention_defined: boolean;
  };
  // Tier 1B: Redaction awareness
  redaction?: {
    active: boolean;
    reason: string; // e.g., 'PII_PHI_PROTECTION'
  };
  // Tier 1C: Data classification visibility
  data_sensitivity?: {
    pii: boolean;
    phi: boolean;
    minor_data: boolean;
    financial: boolean;
    legal: boolean;
    exposure: string; // 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'PROHIBITED'
  };
  // Tier 2D: Evidence context (EXECUTE/REVIEW only)
  evidence_summary?: {
    commits_verified: number;
    prs_merged: number;
    ci_passing: boolean | null;
    total_evidence: number;
    last_sync: string | null;
  };
  // Tier 2F: CCS incident awareness
  incident?: {
    active: boolean;
    type: string; // 'CREDENTIAL_COMPROMISE'
    phase: string; // CCS lifecycle phase
    restricted_items: string[]; // credential names to avoid
  };
}

export interface RouterRequest {
  product: Product;
  intent: Intent;
  mode: Mode;
  subscription: Subscription;
  capsule: Capsule;
  delta: Delta;
  budget: Budget;
  policy_flags: PolicyFlags;
  trace: Trace;
  // PATCH-MOD-01: Optional extended intent for affinity-based routing
  router_intent?: RouterIntent;
  // SPG-01: Internal redaction config (set by router, not by client)
  _redaction_config?: RedactionConfig;
  // HANDOFF-PR-01: Context Awareness Bridge (set by router, not by client)
  _context_awareness?: ContextAwareness;
}

export interface VerificationFlag {
  code: 'MISSING_CITATIONS' | 'CONTRADICTION' | 'LOW_CONFIDENCE' | 'SCOPE_DRIFT' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  detail?: string;
}

export interface Verification {
  verdict: 'PASS' | 'WARN' | 'FAIL';
  flags: VerificationFlag[];
}

export interface Usage {
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  latency_ms: number;
}

export interface ModelUsed {
  provider: Provider;
  model: string;
  class?: ModelClass;
}

export interface RouterDebug {
  route: string;
  fallbacks: number;
  tier_limits?: {
    used: number;
    max: number;
  };
  // PATCH-MOD-01: Model selection metadata
  model_selection?: {
    router_intent: RouterIntent;
    affinity_used: boolean;
    preferred_provider: Provider | null;
    rationale: string;
  };
}

export interface RouterResponse {
  status: 'OK' | 'BLOCKED' | 'RETRIED' | 'ERROR';
  content: string;
  model_used: ModelUsed;
  verification?: Verification;
  usage: Usage;
  router_debug?: RouterDebug;
  error?: string;
}

// =============================================================================
// PROVIDER TYPES
// =============================================================================

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CallOptions {
  maxOutputTokens?: number;
  maxLatencyMs?: number;
  temperature?: number;
}

export interface ProviderResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
}

export interface ProviderModel {
  provider: Provider;
  model: string;
}

// =============================================================================
// TIER LIMITS
// =============================================================================

export interface TierLimits {
  maxRequests: number;
  maxProjects: number;
  maxConversations: number;
  auditRetentionDays: number;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  TRIAL: {
    maxRequests: 50,
    maxProjects: 1,
    maxConversations: 3,
    auditRetentionDays: 7
  },
  MANUSCRIPT_BYOK: {
    maxRequests: 500,
    maxProjects: 5,
    maxConversations: 20,
    auditRetentionDays: 30
  },
  BYOK_STANDARD: {
    maxRequests: 1000,
    maxProjects: 10,
    maxConversations: 50,
    auditRetentionDays: 90
  },
  PLATFORM_STANDARD: {
    maxRequests: 500,
    maxProjects: 10,
    maxConversations: 50,
    auditRetentionDays: 90
  },
  PLATFORM_PRO: {
    maxRequests: 2000,
    maxProjects: -1, // Unlimited
    maxConversations: -1,
    auditRetentionDays: 365
  },
  ENTERPRISE: {
    maxRequests: -1,
    maxProjects: -1,
    maxConversations: -1,
    auditRetentionDays: -1
  }
};

// =============================================================================
// ERRORS
// =============================================================================

export class RouterError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'RouterError';
  }
}

// ============================================================================
// GitHub Evidence Integration Types (HANDOFF-D4-GITHUB-EVIDENCE)
// ============================================================================

/**
 * Assistance Mode - controls disclosure level
 * Per ChatGPT UX spec: governance unchanged, only visibility changes
 */
export type AssistanceMode = 'GUIDED' | 'ASSISTED' | 'EXPERT';

/**
 * External evidence source types
 */
export type EvidenceSource = 'GITHUB' | 'GITLAB' | 'JIRA' | 'LINEAR' | 'MANUAL';

/**
 * Evidence verification status
 */
export type EvidenceStatus = 'PENDING' | 'VERIFIED' | 'STALE' | 'UNAVAILABLE';

/**
 * Evidence type classification
 */
export type EvidenceType = 'COMMIT' | 'PR' | 'RELEASE' | 'CI_STATUS' | 'ISSUE' | 'MILESTONE';

/**
 * Triad category mapping for evidence
 */
export type TriadCategory = 'PLANNED' | 'CLAIMED' | 'VERIFIED';

/**
 * GitHub Evidence Record (EXTERNAL_EVIDENCE_LOG artifact)
 * Maps to L-GCP Reconciliation Triad
 */
export interface GitHubEvidenceRecord {
  id: string;
  project_id: string;
  source: 'GITHUB';

  // Repository reference
  repo_owner: string;
  repo_name: string;

  // Evidence type
  evidence_type: EvidenceType;

  // Reference identifiers
  ref_id: string;           // commit SHA, PR number, release tag
  ref_url: string;          // Direct link to GitHub

  // Triad mapping
  triad_category: TriadCategory;

  // Verification
  status: EvidenceStatus;
  verified_at: string | null;
  stale_after: string;      // ISO timestamp when evidence should be re-fetched

  // Metadata (no sensitive content)
  title: string;            // PR title, commit message summary
  author: string;           // GitHub username
  timestamp: string;        // When the evidence was created on GitHub

  // Audit
  created_at: string;
  updated_at: string;
}

/**
 * GitHub connection status for a project
 */
export interface GitHubConnection {
  project_id: string;
  connected: boolean;
  repo_owner: string | null;
  repo_name: string | null;
  scope: 'READ_ONLY';       // Always read-only
  connected_at: string | null;
  last_sync: string | null;
}

/**
 * Security Gate: External Evidence Validated (GS:EV)
 */
export interface SecurityGateEV {
  gate_id: 'GS:EV';
  status: boolean;
  evidence_count: number;
  last_verified: string | null;
  verification_summary: string;
}

/**
 * Evidence sync result
 */
export interface EvidenceSyncResult {
  project_id: string;
  synced_at: string;
  total_fetched: number;
  by_type: Record<EvidenceType, number>;
  by_triad: Record<TriadCategory, number>;
  errors: string[];
}

// ============================================================================
// Knowledge Artifact Types (GKDL-01 - L-GKDL1-7)
// ============================================================================

/**
 * Knowledge artifact types per AIXORD v4.3 GKDL-01
 * Sessions = evidence, Artifacts = authoritative
 */
export type KnowledgeArtifactType =
  | 'FAQ_REFERENCE'           // Frequently Asked Questions
  | 'SYSTEM_OPERATION_MANUAL' // How the system operates
  | 'SYSTEM_DIAGNOSTICS_GUIDE' // Troubleshooting procedures
  | 'CONSOLIDATED_SESSION_REFERENCE' // CSR for 10+ sessions
  | 'DEFINITION_OF_DONE';     // DoD for deliverables

/**
 * Artifact status per GKDL-01
 * AI-derived = DRAFT until Director approves
 */
export type ArtifactStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'SUPERSEDED';

/**
 * Knowledge artifact derivation source
 */
export type DerivationSource = 'MANUAL' | 'AI_DERIVED' | 'EXTRACTED' | 'IMPORTED';

/**
 * Knowledge Artifact Record
 * Per L-GKDL1: Derived knowledge is governed
 * Per L-GKDL5: AI-derived = DRAFT until approved
 */
export interface KnowledgeArtifact {
  id: string;
  project_id: string;

  // Artifact identity
  type: KnowledgeArtifactType;
  title: string;
  version: number;

  // Content
  content: string;           // Markdown content
  summary?: string;          // Brief summary for listings

  // Derivation tracking (L-GKDL1, L-GKDL3)
  derivation_source: DerivationSource;
  source_session_ids?: string[]; // Sessions this was derived from
  source_artifact_ids?: string[]; // Parent artifacts

  // Status and approval (L-GKDL5)
  status: ArtifactStatus;
  approved_by?: string;      // User ID who approved
  approved_at?: string;

  // Authority hierarchy (L-GKDL6)
  authority_level: number;   // Higher = more authoritative (CSR > FAQ)
  supersedes?: string;       // ID of artifact this replaces
  superseded_by?: string;    // ID of artifact that replaced this

  // Audit
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * FAQ Entry within FAQ_REFERENCE artifact
 */
export interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
  source_sessions?: string[];
  created_at: string;
}

/**
 * CSR (Consolidated Session Reference) metadata
 * Per L-GCP6: Required for 10+ sessions
 */
export interface CSRMetadata {
  session_range: {
    start: number;
    end: number;
  };
  total_sessions: number;
  key_decisions: string[];
  major_milestones: string[];
  unresolved_items: string[];
  next_session_context: string;
}

/**
 * Knowledge artifact creation request
 */
export interface CreateKnowledgeArtifactRequest {
  type: KnowledgeArtifactType;
  title: string;
  content: string;
  summary?: string;
  derivation_source: DerivationSource;
  source_session_ids?: string[];
  source_artifact_ids?: string[];
}

/**
 * Knowledge artifact update request
 */
export interface UpdateKnowledgeArtifactRequest {
  title?: string;
  content?: string;
  summary?: string;
  status?: ArtifactStatus;
}

/**
 * Knowledge artifact query filters
 */
export interface KnowledgeArtifactFilters {
  type?: KnowledgeArtifactType;
  status?: ArtifactStatus;
  derivation_source?: DerivationSource;
}

// ============================================================================
// Credential Compromise & Sanitization Types (PATCH-CCS-01)
// ============================================================================

/**
 * CCS Lifecycle Phases per AIXORD v4.4
 * DETECT → CONTAIN → ROTATE → INVALIDATE → VERIFY → ATTEST → UNLOCK
 */
export type CCSPhase =
  | 'INACTIVE'     // No active incident
  | 'DETECT'       // Identifying exposure
  | 'CONTAIN'      // Limiting damage
  | 'ROTATE'       // Generating new credentials
  | 'INVALIDATE'   // Revoking old credentials
  | 'VERIFY'       // Testing old/new credentials
  | 'ATTEST'       // Director attestation
  | 'UNLOCK';      // Gate released

/**
 * CCS Incident status
 */
export type CCSIncidentStatus = 'ACTIVE' | 'RESOLVED' | 'EXPIRED';

/**
 * CCS Artifact types per v4.4 Section 56
 */
export type CCSArtifactType =
  | 'CCS-01'   // Exposure Report
  | 'CCS-02'   // Containment Record
  | 'CCS-03'   // Rotation Proof
  | 'CCS-04'   // Forward-Safety Attestation
  | 'CCS-05';  // Audit Trail

/**
 * Credential type classification
 */
export type CredentialType =
  | 'API_KEY'
  | 'ACCESS_TOKEN'
  | 'SECRET_KEY'
  | 'PASSWORD'
  | 'OAUTH_TOKEN'
  | 'DATABASE_CREDENTIAL'
  | 'ENCRYPTION_KEY'
  | 'OTHER';

/**
 * Exposure source classification
 */
export type ExposureSource =
  | 'VERSION_CONTROL'    // Git history
  | 'LOG_FILE'           // Application logs
  | 'SCREENSHOT'         // Visual exposure
  | 'PUBLIC_CHANNEL'     // Slack, email, etc.
  | 'THIRD_PARTY_BREACH' // External service compromised
  | 'SECURITY_AUDIT'     // Found during audit
  | 'OTHER';

/**
 * CCS Incident record
 */
export interface CCSIncident {
  id: string;
  project_id: string;

  // Incident identity
  incident_number: string;  // CCS-YYYY-MM-DD-NNN format
  phase: CCSPhase;
  status: CCSIncidentStatus;

  // Exposure details
  credential_type: CredentialType;
  credential_name: string;      // e.g., "STRIPE_SECRET_KEY"
  exposure_source: ExposureSource;
  exposure_description: string;
  exposure_detected_at: string;

  // Impact assessment
  impact_assessment: string;
  affected_systems: string[];   // JSON array

  // Lifecycle tracking
  contain_completed_at?: string;
  rotate_completed_at?: string;
  invalidate_completed_at?: string;
  verify_completed_at?: string;
  attest_completed_at?: string;
  unlock_completed_at?: string;

  // Attestation
  attested_by?: string;         // User ID
  attestation_statement?: string;

  // Audit
  created_by: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

/**
 * CCS Artifact record
 */
export interface CCSArtifact {
  id: string;
  incident_id: string;
  artifact_type: CCSArtifactType;
  title: string;
  content: string;              // Markdown content
  created_by: string;
  created_at: string;
}

/**
 * CCS Verification Test
 */
export interface CCSVerificationTest {
  id: string;
  incident_id: string;
  test_type: 'OLD_REJECTED' | 'NEW_SUCCESS' | 'DEPENDENT_SYSTEM';
  target_system: string;
  expected_result: string;
  actual_result: string;
  passed: boolean;
  tested_by: string;
  tested_at: string;
}

/**
 * GA:CCS Gate State (for project capsule)
 */
export interface CCSGateState {
  GA_CCS: 0 | 1;               // 0 = inactive, 1 = blocking
  ccs_phase: CCSPhase;
  incident_id: string | null;
  incidents_count: number;
}

/**
 * CCS Incident creation request
 */
export interface CreateCCSIncidentRequest {
  credential_type: CredentialType;
  credential_name: string;
  exposure_source: ExposureSource;
  exposure_description: string;
  impact_assessment: string;
  affected_systems?: string[];
}

/**
 * CCS Phase transition request
 */
export interface UpdateCCSPhaseRequest {
  phase: CCSPhase;
  notes?: string;
}

/**
 * CCS Attestation request
 */
export interface CCSAttestationRequest {
  attestation_statement: string;
  exceptions?: string[];
  risk_acceptance?: string;
}

// ============================================================================
// Image Evidence Types (ENH-4: Path C)
// ============================================================================

/**
 * Image evidence classification
 */
export type ImageEvidenceType =
  | 'GENERAL'      // Unclassified image
  | 'CHECKPOINT'   // Checkpoint verification screenshot
  | 'GATE_PROOF'   // Gate passage proof
  | 'SCREENSHOT'   // UI/application screenshot
  | 'DIAGRAM';     // Architecture or flow diagram

/**
 * Allowed MIME types for image upload
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

export type AllowedImageMime = typeof ALLOWED_IMAGE_TYPES[number];

/**
 * Max image size: 10 MB
 */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * Image metadata record (stored in D1)
 */
export interface ImageMetadata {
  id: string;
  project_id: string;
  user_id: string;
  r2_key: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  evidence_type: ImageEvidenceType;
  caption: string | null;
  checkpoint_id: string | null;
  decision_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Image upload response
 */
export interface ImageUploadResponse {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  evidence_type: ImageEvidenceType;
  url: string;
  created_at: string;
}

// =============================================================================
// PART XIV — ENGINEERING GOVERNANCE (AIXORD v4.5)
// =============================================================================

/** §64.3 — SAR status */
export type SARStatus = 'DRAFT' | 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';

/** §64.3 — System Architecture Record */
export interface SAR {
  id: string;
  project_id: string;
  title: string;
  version: number;
  status: SARStatus;
  system_boundary: string | null;
  component_map: string | null;
  interface_contracts_summary: string | null;
  data_flow: string | null;
  state_ownership: string | null;
  consistency_model: string | null;
  failure_domains: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/** §64.4 — Interface contract idempotency */
export type IdempotencyType = 'YES' | 'NO' | 'CONDITIONAL';

/** §64.4 — Interface contract status */
export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'DEPRECATED' | 'BROKEN';

/** §64.4 — Interface Contract */
export interface InterfaceContract {
  id: string;
  project_id: string;
  sar_id: string | null;
  contract_name: string;
  producer: string;
  consumer: string;
  input_shape: string | null;
  output_shape: string | null;
  error_contract: string | null;
  versioning_strategy: string | null;
  idempotency: IdempotencyType | null;
  status: ContractStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/** §64.6 — Fitness function dimension */
export type FitnessDimension = 'PERFORMANCE' | 'SCALABILITY' | 'RELIABILITY' | 'SECURITY' | 'COST' | 'OTHER';

/** §64.6 — Fitness function status */
export type FitnessStatus = 'DEFINED' | 'MEASURING' | 'PASSING' | 'FAILING' | 'NOT_APPLICABLE';

/** §64.6 — Architectural Fitness Function */
export interface FitnessFunction {
  id: string;
  project_id: string;
  dimension: FitnessDimension;
  metric_name: string;
  target_value: string;
  current_value: string | null;
  unit: string | null;
  measurement_method: string | null;
  verified_at: string | null;
  status: FitnessStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/** §65.3 — Integration test level */
export type TestLevel = 'UNIT' | 'INTEGRATION' | 'SYSTEM' | 'ACCEPTANCE';

/** §65.3 — Test result */
export type TestResult = 'PASS' | 'FAIL' | 'SKIP' | 'NOT_RUN';

/** §65.3 — Integration Test */
export interface IntegrationTest {
  id: string;
  project_id: string;
  contract_id: string | null;
  test_level: TestLevel;
  test_name: string;
  description: string | null;
  producer: string | null;
  consumer: string | null;
  happy_path: string | null;
  error_path: string | null;
  boundary_conditions: string | null;
  last_result: TestResult;
  last_run_at: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/** §66.5 — Iteration budget status */
export type BudgetStatus = 'ACTIVE' | 'EXHAUSTED' | 'EXCEEDED' | 'CLOSED';

/** §66.5 — Iteration Budget */
export interface IterationBudget {
  id: string;
  project_id: string;
  scope_name: string;
  expected_iterations: number;
  iteration_ceiling: number;
  actual_iterations: number;
  time_budget_hours: number | null;
  time_used_hours: number;
  status: BudgetStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/** §67.2 — Operational readiness level */
export type ReadinessLevel = 'L0' | 'L1' | 'L2' | 'L3';

/** §67.2 — Operational Readiness */
export interface OperationalReadiness {
  id: string;
  project_id: string;
  declared_level: ReadinessLevel;
  current_level: ReadinessLevel;
  deployment_method: string | null;
  environment_parity: string | null;
  config_management: string | null;
  deployment_verification: string | null;
  health_endpoint: string | null;
  logging_strategy: string | null;
  error_reporting: string | null;
  key_metrics: string | null;
  alerting: string | null;
  dashboards: string | null;
  tracing: string | null;
  audit_logging: string | null;
  incident_response_plan: string | null;
  runbooks: string | null;
  sla_definitions: string | null;
  checklist_json: string | null;
  verified_at: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/** §67.3 — Rollback Strategy */
export interface RollbackStrategy {
  id: string;
  project_id: string;
  component_name: string;
  rollback_method: string;
  rollback_tested: boolean;
  rollback_tested_at: string | null;
  recovery_time_target: string | null;
  data_loss_tolerance: string | null;
  prerequisites: string | null;
  procedure: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/** §67.4 — Alert severity */
export type AlertSeverity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';

/** §67.4 — Alert Configuration */
export interface AlertConfiguration {
  id: string;
  project_id: string;
  alert_name: string;
  severity: AlertSeverity;
  condition_description: string;
  notification_channel: string | null;
  escalation_path: string | null;
  enabled: boolean;
  last_triggered_at: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/** §67.6 — Knowledge transfer type */
export type KnowledgeTransferType = 'DEPLOYMENT' | 'MONITORING' | 'TROUBLESHOOTING' | 'ARCHITECTURE' | 'API' | 'DEPENDENCIES' | 'OTHER';

/** §67.6 — Knowledge transfer status */
export type KnowledgeTransferStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';

/** §67.6 — Knowledge Transfer */
export interface KnowledgeTransfer {
  id: string;
  project_id: string;
  title: string;
  transfer_type: KnowledgeTransferType;
  content: string | null;
  target_audience: string | null;
  status: KnowledgeTransferStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/** Engineering Compliance — Aggregate status */
export interface EngineeringComplianceArea {
  count?: number;
  declared_level?: string | null;
  current_level?: string | null;
  required: boolean;
  met: boolean;
}

/** Engineering Compliance Summary */
export interface EngineeringCompliance {
  project_id: string;
  overall_percentage: number;
  required_percentage: number;
  areas: Record<string, EngineeringComplianceArea>;
  test_results: Array<{ test_level: string; last_result: string; count: number }>;
  fitness_status: Array<{ status: string; count: number }>;
  summary: string;
}

// ============================================================================
// Blueprint Governance Types — AIXORD v4.5 (L-BPX, L-IVL)
// ============================================================================

export interface BlueprintScope {
  id: string;
  project_id: string;
  parent_scope_id: string | null;
  tier: 1 | 2;
  name: string;
  purpose: string | null;
  boundary: string | null;
  assumptions: string; // JSON array
  assumption_status: 'OPEN' | 'CONFIRMED' | 'UNKNOWN';
  inputs: string | null;
  outputs: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETE' | 'CANCELLED';
  sort_order: number;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BlueprintDeliverable {
  id: string;
  project_id: string;
  scope_id: string;
  name: string;
  description: string | null;
  upstream_deps: string; // JSON array of deliverable IDs
  downstream_deps: string; // JSON array of deliverable IDs
  dependency_type: 'hard' | 'soft';
  dod_evidence_spec: string | null;
  dod_verification_method: string | null;
  dod_quality_bar: string | null;
  dod_failure_modes: string | null;
  status: 'DRAFT' | 'READY' | 'IN_PROGRESS' | 'DONE' | 'VERIFIED' | 'LOCKED' | 'BLOCKED' | 'CANCELLED';
  sort_order: number;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrityCheck {
  passed: boolean;
  detail: string;
}

export interface IntegrityReport {
  id: string;
  project_id: string;
  all_passed: boolean;
  checks: {
    formula: IntegrityCheck;
    structural: IntegrityCheck;
    dag: IntegrityCheck;
    deliverable: IntegrityCheck;
    assumption: IntegrityCheck;
  };
  totals: {
    scopes: number;
    subscopes: number;
    deliverables: number;
  };
  run_by: string;
  run_at: string;
}

export interface BlueprintSummary {
  scopes: number;
  subscopes: number;
  deliverables: number;
  deliverables_with_dod: number;
  integrity: { passed: boolean; run_at: string } | null;
}

export interface DAGNode {
  id: string;
  name: string;
  scope_id: string;
  status: string;
}

export interface DAGEdge {
  from: string;
  to: string;
  type: string;
}

// ============================================================================
// Brainstorm Artifact Types (HANDOFF-VD-CI-01 — Task A1)
// ============================================================================

/** A single brainstorm option with its own assumptions and kill conditions */
export interface BrainstormOption {
  id: string;
  title: string;
  description: string;
  assumptions: string[];
  kill_conditions: string[];
  pros?: string[];
  cons?: string[];
}

/** Decision criteria for comparing brainstorm options */
export interface BrainstormDecisionCriteria {
  criteria: Array<{
    name: string;
    weight: number; // 1-5
    description?: string;
  }>;
}

/** Brainstorm artifact — structured output from BRAINSTORM phase */
export interface BrainstormArtifact {
  id: string;
  project_id: string;
  version: number;
  options: BrainstormOption[];
  assumptions: string[]; // Global assumptions (apply to all options)
  decision_criteria: BrainstormDecisionCriteria;
  kill_conditions: string[]; // Global kill conditions
  recommendation: string; // 'NO_SELECTION' | option ID selected by Director
  generated_by: 'ai' | 'manual';
  status: 'DRAFT' | 'FINALIZED' | 'SUPERSEDED';
  created_at: string;
  updated_at: string;
}

/** Validation check result for a brainstorm artifact */
export interface BrainstormValidationCheck {
  check: string;
  level: 'BLOCK' | 'WARN';
  passed: boolean;
  detail: string;
}

/** Full validation result for a brainstorm artifact */
export interface BrainstormValidationResult {
  valid: boolean; // true if all BLOCK checks pass
  checks: BrainstormValidationCheck[];
  block_count: number;
  warn_count: number;
  summary: string;
}
