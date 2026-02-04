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
}

export interface ArtifactRef {
  id: string;
  hash: string;
  type: 'md' | 'pdf' | 'json' | 'txt' | 'img';
  hint?: string;
}

export interface Delta {
  user_input: string;
  selection_ids?: string[];
  changed_constraints?: string[];
  artifact_refs?: ArtifactRef[];
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
