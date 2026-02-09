/**
 * AIXORD Web App API Client
 *
 * Connects to D4 Web App at https://aixord-webapp.peoplemerit.workers.dev
 */

const API_BASE = 'https://aixord-router-worker.peoplemerit.workers.dev/api/v1';

/**
 * API Error class for structured error handling
 */
export class APIError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  isConflict(): boolean {
    return this.statusCode === 409;
  }
}

/**
 * Helper to make authenticated requests
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Safely parse JSON — backend may return non-JSON on Worker-level crashes
  const responseText = await response.text();
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new APIError(
      response.status,
      'PARSE_ERROR',
      `Server returned non-JSON response (${response.status}): ${responseText.slice(0, 200)}`
    );
  }

  if (!response.ok) {
    throw new APIError(
      response.status,
      (data.code as string) || 'UNKNOWN_ERROR',
      (data.error as string) || 'An unknown error occurred'
    );
  }

  return data as T;
}

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  apiKey: string;
  emailVerified?: boolean;
}

export type ProjectType = 'software' | 'general' | 'research' | 'legal' | 'personal';

export interface Project {
  id: string;
  name: string;
  objective: string;
  realityClassification: 'GREENFIELD' | 'BROWNFIELD' | 'LEGACY';
  projectType: ProjectType;
  createdAt: string;
  updatedAt: string;
}

// AIXORD v4.3 Data Classification Value
export type DataClassificationValue = 'YES' | 'NO' | 'UNKNOWN';

// AIXORD v4.3 AI Exposure Level (L-SPG3, L-SPG4)
export type AIExposureLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'PROHIBITED';

// AIXORD v4.3 Data Classification (SPG-01) - Full interface
export interface DataClassification {
  projectId: string;
  pii: DataClassificationValue;
  phi: DataClassificationValue;
  financial: DataClassificationValue;
  legal: DataClassificationValue;
  minorData: DataClassificationValue;
  jurisdiction: string;
  regulations: string[];
  aiExposure: AIExposureLevel;
  declared: boolean;
  declaredBy?: string;
  declaredAt?: string;
}

// AIXORD v4.3 Reconciliation Triad (GCP-01)
export interface ReconciliationTriad {
  planned: string[];
  claimed: string[];
  verified: string[];
  divergences: string[];
}

// AIXORD v4.3 Security Gates (SPG-01)
export interface SecurityGates {
  GS_DC: boolean;  // Data Classification declared
  GS_DP: boolean;  // Data Protection requirements satisfiable
  GS_AC: boolean;  // Access Controls appropriate
  GS_AI: boolean;  // AI usage complies with classification
  GS_JR: boolean;  // Jurisdiction compliance confirmed
  GS_RT: boolean;  // Retention/deletion policy compliant
}

export interface AIXORDState {
  project: {
    name: string;
    objective: string;
  };
  session: {
    number: number;
    phase: string;
    messageCount: number;
    startedAt: string;
    lastCheckpoint?: string;
  };
  gates: Record<string, boolean>;
  reality: {
    class: string;
    constraints: string[];
  };
  // AIXORD v4.3 additions (optional for backward compatibility)
  dataClassification?: DataClassification;
  securityGates?: SecurityGates;
  reconciliation?: ReconciliationTriad;
  enhancement?: {
    fs: number;
    hr: number;
    oa: number;
    '2m': number;
  };
  sessionSeq?: {
    seq: number;
    prev: string;
    drift: number;
  };
}

/**
 * Decision record from the governance audit ledger.
 * Uses frontend-friendly camelCase with proper typing.
 */
export interface Decision {
  id: string;
  projectId: string;
  type: 'APPROVAL' | 'REJECTION' | 'DEFERRAL' | 'SCOPE_CHANGE';
  summary: string;
  actor: string;
  phase?: 'B' | 'P' | 'E' | 'R';
  rationale?: string;
  createdAt: string;
}

/**
 * Backend decision response type (snake_case from D1 database)
 */
interface BackendDecision {
  id: string;
  project_id: string;
  decision_type: string;
  description: string;
  actor: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Transform backend decision to frontend Decision format
 */
function transformDecision(raw: BackendDecision): Decision {
  return {
    id: raw.id,
    projectId: raw.project_id,
    type: raw.decision_type as Decision['type'],
    summary: raw.description,
    actor: raw.actor,
    phase: raw.metadata?.phase as Decision['phase'],
    rationale: raw.metadata?.rationale as string | undefined,
    createdAt: raw.created_at,
  };
}

// ============================================================================
// Auth API
// ============================================================================

export const authApi = {
  /**
   * Register a new user
   * Backend returns: { user: { id, email, emailVerified }, token, expires_at, message }
   */
  async register(email: string, password: string, name?: string, username?: string): Promise<User> {
    const response = await request<{
      user: { id: string; email: string; emailVerified?: boolean };
      token: string;
      expires_at: string;
      message?: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
    return {
      id: response.user.id,
      email: response.user.email,
      name: name,
      apiKey: response.token,
      emailVerified: response.user.emailVerified ?? true,
    };
  },

  /**
   * Login with email and password
   * Backend returns: { user: { id, email }, token, expires_at }
   */
  async login(email: string, password: string): Promise<User> {
    const response = await request<{
      user: { id: string; email: string; emailVerified?: boolean };
      token: string;
      expires_at: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return {
      id: response.user.id,
      email: response.user.email,
      name: undefined,
      apiKey: response.token,
      emailVerified: response.user.emailVerified ?? true,
    };
  },

  /**
   * Get current user info (validates API key)
   * Backend returns: { user: { id, email, emailVerified } }
   */
  async me(token: string): Promise<User> {
    const response = await request<{
      user: { id: string; email: string; emailVerified?: boolean };
    }>('/auth/me', {}, token);
    return {
      id: response.user.id,
      email: response.user.email,
      name: undefined,
      apiKey: token,
      emailVerified: response.user.emailVerified ?? false,
    };
  },

  /**
   * Get current user's subscription from backend
   * Returns subscription tier, status, and billing info
   */
  async getSubscription(token: string): Promise<{
    tier: string;
    status: string;
    keyMode: 'PLATFORM' | 'BYOK';
    periodEnd: string | null;
    stripeCustomerId: string | null;
  }> {
    return request<{
      tier: string;
      status: string;
      keyMode: 'PLATFORM' | 'BYOK';
      periodEnd: string | null;
      stripeCustomerId: string | null;
    }>('/auth/subscription', {}, token);
  },
};

// ============================================================================
// Projects API
// ============================================================================

/**
 * Backend project response type (snake_case from D1 database)
 */
interface BackendProject {
  id: string;
  name: string;
  objective: string;
  owner_id?: string;
  reality_classification: string;
  project_type?: string;
  conserved_scopes?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Validate and normalize a date string
 * Returns ISO string if valid, undefined otherwise
 */
function normalizeDate(dateStr: string | null | undefined): string | undefined {
  if (!dateStr) return undefined;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return undefined;
    return date.toISOString();
  } catch {
    return undefined;
  }
}

/**
 * Transform backend project (snake_case) to frontend Project (camelCase)
 */
function transformProject(raw: BackendProject): Project {
  // Normalize reality classification - handle empty strings, whitespace, and case
  const normalizedReality = raw.reality_classification?.trim()?.toUpperCase() || 'GREENFIELD';
  const validRealities = ['GREENFIELD', 'BROWNFIELD', 'LEGACY'];
  const finalReality = validRealities.includes(normalizedReality)
    ? normalizedReality as Project['realityClassification']
    : 'GREENFIELD';

  const VALID_PROJECT_TYPES: ProjectType[] = ['software', 'general', 'research', 'legal', 'personal'];
  const projectType: ProjectType = VALID_PROJECT_TYPES.includes(raw.project_type as ProjectType)
    ? raw.project_type as ProjectType
    : 'software';

  return {
    id: raw.id,
    name: raw.name || 'Untitled Project',
    objective: raw.objective || '',
    realityClassification: finalReality,
    projectType,
    createdAt: normalizeDate(raw.created_at) || new Date().toISOString(),
    updatedAt: normalizeDate(raw.updated_at) || new Date().toISOString(),
  };
}

export const projectsApi = {
  /**
   * List all projects for the authenticated user
   */
  async list(token: string): Promise<Project[]> {
    const response = await request<{ projects: BackendProject[] }>('/projects', {}, token);
    return response.projects.map(transformProject);
  },

  /**
   * Get a specific project
   * Note: Backend returns flat project (not wrapped in { project: ... })
   */
  async get(id: string, token: string): Promise<Project> {
    const response = await request<BackendProject>(`/projects/${id}`, {}, token);
    return transformProject(response);
  },

  /**
   * Create a new project
   * Note: Backend expects snake_case (reality_classification)
   */
  async create(
    data: {
      name: string;
      objective: string;
      realityClassification: 'GREENFIELD' | 'BROWNFIELD' | 'LEGACY';
      projectType?: ProjectType;
    },
    token: string
  ): Promise<Project> {
    // Transform to backend format (snake_case)
    const backendData = {
      name: data.name,
      objective: data.objective,
      reality_classification: data.realityClassification,
      project_type: data.projectType || 'software',
    };
    // Backend returns flat project response (not wrapped in { project: ... })
    const response = await request<BackendProject>('/projects', {
      method: 'POST',
      body: JSON.stringify(backendData),
    }, token);
    return transformProject(response);
  },

  /**
   * Update a project
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      objective: string;
    }>,
    token: string
  ): Promise<Project> {
    const response = await request<{ project: Project }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
    return response.project;
  },

  /**
   * Delete a project
   */
  async delete(id: string, token: string): Promise<void> {
    await request<void>(`/projects/${id}`, {
      method: 'DELETE',
    }, token);
  },
};

// ============================================================================
// State API
// ============================================================================

/**
 * Backend state response type (from D1 database)
 * Supports both v4.2 (minimal) and v4.3 (full) capsule structures
 */
interface BackendState {
  project_id: string;
  phase: string;
  gates: Record<string, boolean>;
  capsule: {
    // v4.2 fields
    session?: { number: number; phase: string; messageCount: number; startedAt: string; lastCheckpoint?: string | null };
    project?: { name: string; objective: string | null };
    reality?: { class: string; constraints: string[] };
    // v4.3 additions (SPG-01, GCP-01)
    data_classification?: {
      pii: string;
      phi: string;
      financial: string;
      legal: string;
      minor: string;
      jurisdiction: string;
      regulations: string[];
    };
    security_gates?: {
      GS_DC: boolean;
      GS_DP: boolean;
      GS_AC: boolean;
      GS_AI: boolean;
      GS_JR: boolean;
      GS_RT: boolean;
    };
    reconciliation?: {
      planned: string[];
      claimed: string[];
      verified: string[];
      divergences: string[];
    };
    enhancement?: {
      fs: number;
      hr: number;
      oa: number;
      '2m': number;
    };
    session_seq?: {
      seq: number;
      prev: string;
      drift: number;
    };
  };
  updated_at: string;
}

/**
 * Normalize phase to standard format (full word: BRAINSTORM, PLAN, EXECUTE, REVIEW)
 * Handles both single-char (B, P, E, R) and full word inputs
 */
function normalizePhase(phase: string | null | undefined): string {
  if (!phase) return 'BRAINSTORM';
  const p = phase.trim().toUpperCase();

  // Map single character to full word
  const shortToFull: Record<string, string> = {
    'B': 'BRAINSTORM',
    'P': 'PLAN',
    'E': 'EXECUTE',
    'R': 'REVIEW'
  };

  if (p.length === 1 && shortToFull[p]) {
    return shortToFull[p];
  }

  // Already full word or close enough
  if (['BRAINSTORM', 'PLAN', 'EXECUTE', 'REVIEW'].includes(p)) {
    return p;
  }

  // Default
  return 'BRAINSTORM';
}

/**
 * Convert phase to single character format for router
 */
export function phaseToShort(phase: string | null | undefined): 'B' | 'P' | 'E' | 'R' {
  if (!phase) return 'B';
  const p = phase.trim().toUpperCase();

  // Already single char
  if (p === 'B' || p === 'P' || p === 'E' || p === 'R') {
    return p as 'B' | 'P' | 'E' | 'R';
  }

  // Map full word to single char
  const fullToShort: Record<string, 'B' | 'P' | 'E' | 'R'> = {
    'BRAINSTORM': 'B',
    'PLAN': 'P',
    'EXECUTE': 'E',
    'REVIEW': 'R'
  };

  return fullToShort[p] || 'B';
}

/**
 * Transform backend state to frontend AIXORDState format
 * Supports both v4.2 (minimal) and v4.3 (full) state structures
 *
 * D-013 FIX: Phase is now read from raw.phase as the source of truth
 * The backend updates the phase column directly via PUT /state/:id/phase
 */
function transformState(raw: BackendState): AIXORDState {
  // D-013 FIX: Prioritize raw.phase (the database column) over capsule.session.phase
  // The phase column is updated directly by setPhase API, capsule may have stale data
  const rawPhase = raw.phase || raw.capsule?.session?.phase;
  const capsule = raw.capsule || {};

  // Base state (v4.2 compatible)
  const state: AIXORDState = {
    project: {
      name: capsule.project?.name || '',
      objective: capsule.project?.objective || ''
    },
    session: {
      number: capsule.session?.number || 1,
      phase: normalizePhase(rawPhase),
      messageCount: capsule.session?.messageCount || 0,
      startedAt: normalizeDate(capsule.session?.startedAt) || normalizeDate(raw.updated_at) || new Date().toISOString(),
      lastCheckpoint: capsule.session?.lastCheckpoint ?? undefined
    },
    gates: raw.gates || {},
    reality: capsule.reality || { class: 'GREENFIELD', constraints: [] },
  };

  // v4.3 additions (if present in capsule)
  if (capsule.data_classification) {
    const dc = capsule.data_classification as Record<string, unknown>;
    state.dataClassification = {
      projectId: '',
      pii: (dc.pii as DataClassificationValue) || 'UNKNOWN',
      phi: (dc.phi as DataClassificationValue) || 'UNKNOWN',
      financial: (dc.financial as DataClassificationValue) || 'UNKNOWN',
      legal: (dc.legal as DataClassificationValue) || 'UNKNOWN',
      minorData: ((dc.minor_data || dc.minorData || dc.minor) as DataClassificationValue) || 'UNKNOWN',
      jurisdiction: (dc.jurisdiction as string) || '',
      regulations: (dc.regulations as string[]) || [],
      aiExposure: ((dc.ai_exposure || dc.aiExposure) as AIExposureLevel) || 'RESTRICTED',
      declared: !!(dc.declared_at || dc.declaredAt || dc.declared),
    };
  }

  if (capsule.security_gates) {
    state.securityGates = {
      GS_DC: capsule.security_gates.GS_DC || false,
      GS_DP: capsule.security_gates.GS_DP || false,
      GS_AC: capsule.security_gates.GS_AC || false,
      GS_AI: capsule.security_gates.GS_AI || false,
      GS_JR: capsule.security_gates.GS_JR || false,
      GS_RT: capsule.security_gates.GS_RT || false
    };
  }

  if (capsule.reconciliation) {
    state.reconciliation = {
      planned: capsule.reconciliation.planned || [],
      claimed: capsule.reconciliation.claimed || [],
      verified: capsule.reconciliation.verified || [],
      divergences: capsule.reconciliation.divergences || []
    };
  }

  if (capsule.enhancement) {
    state.enhancement = {
      fs: capsule.enhancement.fs || 0,
      hr: capsule.enhancement.hr || 0,
      oa: capsule.enhancement.oa || 0,
      '2m': capsule.enhancement['2m'] || 0
    };
  }

  if (capsule.session_seq) {
    state.sessionSeq = {
      seq: capsule.session_seq.seq || 1,
      prev: capsule.session_seq.prev || '',
      drift: capsule.session_seq.drift || 0
    };
  }

  return state;
}

export const stateApi = {
  /**
   * Get project state
   * Backend returns: { project_id, phase, gates, capsule, updated_at }
   */
  async get(projectId: string, token: string): Promise<AIXORDState> {
    const response = await request<BackendState>(`/state/${projectId}`, {}, token);
    return transformState(response);
  },

  /**
   * Update full state
   * Backend accepts: { phase?, gates?, capsule? }
   */
  async update(
    projectId: string,
    state: Partial<{ phase: string; gates: Record<string, boolean>; capsule: object }>,
    token: string
  ): Promise<{ success: boolean; updated_at: string }> {
    const response = await request<{ success: boolean; updated_at: string }>(`/state/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(state),
    }, token);
    return response;
  },

  /**
   * Toggle a gate (pass/unpass)
   * Backend accepts: { enabled: boolean }
   * Backend returns: { success: true, gates: {...}, updated_at }
   */
  async toggleGate(
    projectId: string,
    gateId: string,
    enabled: boolean,
    token: string
  ): Promise<Record<string, boolean>> {
    const response = await request<{ success: boolean; gates: Record<string, boolean>; updated_at: string }>(
      `/state/${projectId}/gates/${gateId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ enabled }),
      },
      token
    );
    return response.gates;
  },

  /**
   * Set current phase
   * Backend accepts: { phase: 'BRAINSTORM' | 'PLAN' | 'EXECUTE' | 'REVIEW' }
   * Backend returns: { success: true, phase, updated_at }
   * On 403: throws PhaseTransitionError with missingGates details
   */
  async setPhase(projectId: string, phase: string, token: string): Promise<string> {
    const res = await fetch(`${API_BASE}/state/${projectId}/phase`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ phase }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 403 && data.missingGates) {
        const err = new APIError(403, 'PHASE_BLOCKED', data.message || data.error);
        (err as any).missingGates = data.missingGates;
        throw err;
      }
      throw new APIError(res.status, data.code || 'UNKNOWN_ERROR', data.error || 'Unknown error');
    }
    return data.phase;
  },

  /**
   * Evaluate all gate preconditions and auto-flip satisfied gates
   * AI-Governance Integration — Phase 2: Auto-Satisfaction Rules Engine
   * Idempotent: safe to call multiple times
   */
  async evaluateGates(projectId: string, token: string): Promise<{
    evaluated: string[];
    changed: Array<{ gateId: string; from: boolean; to: boolean }>;
    gates: Record<string, boolean>;
    phase: string;
  }> {
    return request<{
      evaluated: string[];
      changed: Array<{ gateId: string; from: boolean; to: boolean }>;
      gates: Record<string, boolean>;
      phase: string;
    }>(`/state/${projectId}/gates/evaluate`, { method: 'POST' }, token);
  },

  /**
   * Finalize a phase — formal governance transaction
   * Phase 4: Validates authority, gates, artifacts, logs to decision ledger,
   * and advances to next phase.
   */
  async finalizePhase(projectId: string, phase: string, token: string): Promise<{
    success: boolean;
    result: 'APPROVED' | 'REJECTED';
    phase_from: string;
    phase_to: string;
    artifact_checks: Array<{ check: string; passed: boolean; detail: string }>;
    missing_gates?: string[];
    message: string;
    ledger_logged?: boolean;
  }> {
    return request<{
      success: boolean;
      result: 'APPROVED' | 'REJECTED';
      phase_from: string;
      phase_to: string;
      artifact_checks: Array<{ check: string; passed: boolean; detail: string }>;
      missing_gates?: string[];
      message: string;
      ledger_logged?: boolean;
    }>(`/state/${projectId}/phases/${phase}/finalize`, { method: 'POST' }, token);
  },
};

// ============================================================================
// Decisions API
// ============================================================================

export const decisionsApi = {
  /**
   * List decisions for a project
   * Backend returns: { decisions: [...] }
   */
  async list(projectId: string, token: string): Promise<Decision[]> {
    const response = await request<{ decisions: BackendDecision[] }>(
      `/projects/${projectId}/decisions`,
      {},
      token
    );
    return response.decisions.map(transformDecision);
  },

  /**
   * Create a decision
   * Backend expects: { decision_type, description, actor?, metadata? }
   * Backend returns: flat decision object (not wrapped)
   */
  async create(
    projectId: string,
    data: {
      type: Decision['type'];
      summary: string;
      phase?: Decision['phase'];
      rationale?: string;
    },
    token: string
  ): Promise<Decision> {
    // Transform frontend format to backend format
    const backendData = {
      decision_type: data.type,
      description: data.summary,
      actor: 'USER',
      metadata: {
        phase: data.phase,
        rationale: data.rationale,
      },
    };
    const response = await request<BackendDecision>(
      `/projects/${projectId}/decisions`,
      {
        method: 'POST',
        body: JSON.stringify(backendData),
      },
      token
    );
    return transformDecision(response);
  },
};

// ============================================================================
// Messages API (Conversation Persistence)
// ============================================================================

/**
 * Chat message record for persistence.
 */
export interface ChatMessage {
  id: string;
  projectId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/**
 * Backend message response type (snake_case from D1 database)
 */
interface BackendMessage {
  id: string;
  project_id: string;
  role: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Transform backend message to frontend ChatMessage format
 */
function transformMessage(raw: BackendMessage): ChatMessage {
  return {
    id: raw.id,
    projectId: raw.project_id,
    role: raw.role as ChatMessage['role'],
    content: raw.content,
    metadata: raw.metadata,
    createdAt: raw.created_at,
  };
}

export const messagesApi = {
  /**
   * List messages for a project
   */
  async list(projectId: string, token: string, limit = 100, offset = 0, sessionId?: string): Promise<ChatMessage[]> {
    let url = `/projects/${projectId}/messages?limit=${limit}&offset=${offset}`;
    if (sessionId) url += `&session_id=${sessionId}`;
    const response = await request<{ messages: BackendMessage[] }>(
      url,
      {},
      token
    );
    return response.messages.map(transformMessage);
  },

  /**
   * Create a single message
   */
  async create(
    projectId: string,
    data: {
      role: ChatMessage['role'];
      content: string;
      metadata?: Record<string, unknown>;
      session_id?: string;
    },
    token: string
  ): Promise<ChatMessage> {
    const response = await request<BackendMessage>(
      `/projects/${projectId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
    return transformMessage(response);
  },

  /**
   * Create multiple messages at once (batch save)
   */
  async createBatch(
    projectId: string,
    messages: Array<{
      role: ChatMessage['role'];
      content: string;
      metadata?: Record<string, unknown>;
      created_at?: string;
    }>,
    token: string
  ): Promise<ChatMessage[]> {
    const response = await request<{ messages: BackendMessage[] }>(
      `/projects/${projectId}/messages/batch`,
      {
        method: 'POST',
        body: JSON.stringify({ messages }),
      },
      token
    );
    return response.messages.map(transformMessage);
  },

  /**
   * Clear all messages for a project
   */
  async clear(projectId: string, token: string): Promise<void> {
    await request<{ success: boolean }>(
      `/projects/${projectId}/messages`,
      { method: 'DELETE' },
      token
    );
  },
};

// ============================================================================
// Router API (Model Router for AI Chat)
// ============================================================================

/**
 * Router base URL (same worker, different endpoint path)
 */
const ROUTER_BASE = 'https://aixord-router-worker.peoplemerit.workers.dev/v1/router';

/**
 * Router request types
 */
export type RouterMode = 'ECONOMY' | 'BALANCED' | 'PREMIUM';
export type RouterPhase = 'B' | 'P' | 'E' | 'R';
export type RouterIntent = 'CHAT' | 'VERIFY' | 'EXTRACT' | 'CLASSIFY' | 'RAG_VERIFY';

export interface RouterRequest {
  product: 'AIXORD_COPILOT' | 'PMERIT_CHATBOT';
  intent: RouterIntent;
  mode: RouterMode;
  subscription: {
    tier: 'TRIAL' | 'MANUSCRIPT_BYOK' | 'BYOK_STANDARD' | 'PLATFORM_STANDARD' | 'PLATFORM_PRO' | 'ENTERPRISE';
    key_mode: 'PLATFORM' | 'BYOK';
    user_api_key?: string;
  };
  capsule: {
    objective: string;
    phase: RouterPhase;
    constraints?: string[];
    decisions?: string[];
    open_questions?: string[];
    session_graph?: {
      current: { number: number; type: string; messageCount: number };
      lineage: Array<{ number: number; type: string; edgeType: string; summary?: string }>;
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
    // AI-Governance Integration — Phase 1
    gates?: {
      setup: Record<string, boolean>;
      work: Record<string, boolean>;
      security: Record<string, boolean>;
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
  };
  delta: {
    user_input: string;
    selection_ids?: string[];
    changed_constraints?: string[];
    artifact_refs?: string[];
  };
  budget?: {
    max_cost_usd?: number;
    max_input_tokens?: number;
    max_output_tokens?: number;
    max_latency_ms?: number;
  };
  policy_flags?: {
    require_citations?: boolean;
    strict_mode?: boolean;
    allow_retry?: boolean;
  };
  trace: {
    project_id: string;
    session_id: string;
    request_id: string;
    user_id: string;
  };
}

export interface RouterResponse {
  status: 'OK' | 'BLOCKED' | 'RETRIED' | 'ERROR';
  content: string;
  model_used: {
    provider: string;
    model: string;
  };
  usage: {
    input_tokens: number;
    output_tokens: number;
    cost_usd: number;
    latency_ms: number;
  };
  verification?: {
    verdict: 'PASS' | 'WARN' | 'FAIL';
    flags: Array<{
      code: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
      detail?: string;
    }>;
  };
  error?: string;
}

export const routerApi = {
  /**
   * Execute a chat request through the model router
   */
  async execute(request: RouterRequest): Promise<RouterResponse> {
    const response = await fetch(`${ROUTER_BASE}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    // Safely parse JSON — backend may return non-JSON on Worker-level crashes
    const responseText = await response.text();
    let data: RouterResponse;
    try {
      data = JSON.parse(responseText) as RouterResponse;
    } catch {
      throw new APIError(
        response.status,
        'ROUTER_ERROR',
        `Router returned non-JSON response (${response.status}): ${responseText.slice(0, 200)}`
      );
    }

    if (!response.ok && !data.error) {
      throw new APIError(response.status, 'ROUTER_ERROR', 'Failed to execute router request');
    }

    return data;
  },

  /**
   * Get a cost quote without executing
   */
  async quote(request: RouterRequest): Promise<{
    model_class: string;
    primary_model: { provider: string; model: string };
    estimated: {
      input_tokens: number;
      output_tokens: number;
      cost_usd: number;
    };
  }> {
    const response = await fetch(`${ROUTER_BASE}/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(response.status, 'ROUTER_ERROR', data.error || 'Failed to get quote');
    }

    return data;
  },

  /**
   * Check router health
   */
  async health(): Promise<{ status: string; version: string; timestamp: string }> {
    const response = await fetch(`${ROUTER_BASE}/health`);
    return response.json();
  },

  /**
   * List available models
   */
  async models(): Promise<{
    classes: Record<string, Array<{ provider: string; model: string }>>;
    timestamp: string;
  }> {
    const response = await fetch(`${ROUTER_BASE}/models`);
    return response.json();
  },
};

// ============================================================================
// Billing API
// ============================================================================

/**
 * Billing base URL (same worker, different endpoint path)
 */
const BILLING_BASE = 'https://aixord-router-worker.peoplemerit.workers.dev/v1/billing';

/**
 * Subscription tier type
 */
export type SubscriptionTier = 'TRIAL' | 'MANUSCRIPT_BYOK' | 'BYOK_STANDARD' | 'PLATFORM_STANDARD' | 'PLATFORM_PRO' | 'ENTERPRISE';

/**
 * Subscription status type
 */
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';

/**
 * Subscription info
 */
export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  keyMode: 'PLATFORM' | 'BYOK';
  periodStart?: string;
  periodEnd?: string;
  stripeCustomerId?: string;
}

export const billingApi = {
  /**
   * Create a Stripe checkout session for subscription upgrade
   * Returns URL to redirect user to Stripe checkout
   */
  async createCheckout(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ url: string }> {
    const response = await fetch(`${BILLING_BASE}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });

    const data = await response.json() as { url?: string; error?: string };

    if (!response.ok) {
      throw new APIError(response.status, 'BILLING_ERROR', data.error || 'Failed to create checkout session');
    }

    return { url: data.url! };
  },

  /**
   * Create a Stripe customer portal session for subscription management
   * Returns URL to redirect user to Stripe customer portal
   */
  async createPortal(
    customerId: string,
    returnUrl: string
  ): Promise<{ url: string }> {
    const response = await fetch(`${BILLING_BASE}/portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
        return_url: returnUrl,
      }),
    });

    const data = await response.json() as { url?: string; error?: string };

    if (!response.ok) {
      throw new APIError(response.status, 'BILLING_ERROR', data.error || 'Failed to create portal session');
    }

    return { url: data.url! };
  },

  /**
   * Activate a Gumroad license (one-time purchase)
   */
  async activateGumroad(
    userId: string,
    licenseKey: string
  ): Promise<{ success: boolean; tier: SubscriptionTier }> {
    const response = await fetch(`${BILLING_BASE}/activate/gumroad`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        license_key: licenseKey,
      }),
    });

    const data = await response.json() as { success?: boolean; tier?: SubscriptionTier; error?: string };

    if (!response.ok) {
      throw new APIError(response.status, 'BILLING_ERROR', data.error || 'Failed to activate license');
    }

    return { success: true, tier: data.tier || 'MANUSCRIPT_BYOK' };
  },

  /**
   * Activate a KDP book code (one-time purchase)
   */
  async activateKdp(
    userId: string,
    code: string
  ): Promise<{ success: boolean; tier: SubscriptionTier }> {
    const response = await fetch(`${BILLING_BASE}/activate/kdp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        code: code,
      }),
    });

    const data = await response.json() as { success?: boolean; tier?: SubscriptionTier; error?: string };

    if (!response.ok) {
      throw new APIError(response.status, 'BILLING_ERROR', data.error || 'Failed to activate code');
    }

    return { success: true, tier: data.tier || 'MANUSCRIPT_BYOK' };
  },
};

// ============================================================================
// GitHub API (PATCH-GITHUB-01)
// ============================================================================

/**
 * GitHub connection status
 */
export interface GitHubConnection {
  project_id: string;
  connected: boolean;
  repo_owner: string | null;
  repo_name: string | null;
  scope: 'READ_ONLY';
  connected_at: string | null;
  last_sync: string | null;
}

/**
 * GitHub evidence record
 */
export interface GitHubEvidenceRecord {
  id: string;
  evidence_type: 'COMMIT' | 'PR' | 'RELEASE' | 'CI_STATUS' | 'ISSUE' | 'MILESTONE';
  triad_category: 'PLANNED' | 'CLAIMED' | 'VERIFIED';
  ref_id: string;
  ref_url: string;
  title: string;
  author: string;
  evidence_timestamp: string;
  status: 'PENDING' | 'VERIFIED' | 'STALE' | 'UNAVAILABLE';
}

/**
 * Evidence grouped by triad category
 */
export interface EvidenceTriad {
  planned: GitHubEvidenceRecord[];
  claimed: GitHubEvidenceRecord[];
  verified: GitHubEvidenceRecord[];
}

/**
 * GitHub repository info
 */
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  private: boolean;
  description: string | null;
  updated_at: string;
  url: string;
}

export const githubApi = {
  /**
   * Initiate GitHub OAuth connection
   * Returns authorization URL to redirect user
   */
  async connect(
    projectId: string,
    token: string,
    repoOwner?: string,
    repoName?: string
  ): Promise<{ authorization_url: string; state: string; expires_in: number }> {
    return request<{ authorization_url: string; state: string; expires_in: number }>(
      '/github/connect',
      {
        method: 'POST',
        body: JSON.stringify({ project_id: projectId, repo_owner: repoOwner, repo_name: repoName }),
      },
      token
    );
  },

  /**
   * Get GitHub connection status for a project
   */
  async getStatus(projectId: string, token: string): Promise<GitHubConnection> {
    return request<GitHubConnection>(`/github/status/${projectId}`, {}, token);
  },

  /**
   * Disconnect GitHub from a project
   */
  async disconnect(projectId: string, token: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/github/disconnect/${projectId}`, { method: 'DELETE' }, token);
  },

  /**
   * List repositories available to the user
   */
  async listRepos(projectId: string, token: string): Promise<{ repos: GitHubRepo[] }> {
    return request<{ repos: GitHubRepo[] }>(`/github/repos?project_id=${projectId}`, {}, token);
  },

  /**
   * Update the connected repository for a project
   */
  async selectRepo(
    projectId: string,
    repoOwner: string,
    repoName: string,
    token: string
  ): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(
      `/github/repo/${projectId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ repo_owner: repoOwner, repo_name: repoName }),
      },
      token
    );
  },
};

// ============================================================================
// Evidence API (PATCH-GITHUB-01)
// ============================================================================

export const evidenceApi = {
  /**
   * Trigger evidence sync from GitHub
   */
  async sync(projectId: string, token: string, sessionId?: string): Promise<{
    project_id: string;
    synced_at: string;
    total_fetched: number;
    by_type: Record<string, number>;
    by_triad: Record<string, number>;
    errors: string[];
  }> {
    return request<{
      project_id: string;
      synced_at: string;
      total_fetched: number;
      by_type: Record<string, number>;
      by_triad: Record<string, number>;
      errors: string[];
    }>(`/evidence/sync/${projectId}`, {
      method: 'POST',
      ...(sessionId && { body: JSON.stringify({ session_id: sessionId }) }),
    }, token);
  },

  /**
   * Get all evidence for a project
   */
  async list(projectId: string, token: string): Promise<{
    project_id: string;
    total: number;
    evidence: GitHubEvidenceRecord[];
  }> {
    return request<{
      project_id: string;
      total: number;
      evidence: GitHubEvidenceRecord[];
    }>(`/evidence/${projectId}`, {}, token);
  },

  /**
   * Get evidence grouped by triad category
   */
  async getTriad(projectId: string, token: string): Promise<{
    project_id: string;
    connection: { repo_owner: string | null; repo_name: string | null; last_sync: string | null } | null;
    counts: { planned: number; claimed: number; verified: number; total: number };
    triad: EvidenceTriad;
  }> {
    return request<{
      project_id: string;
      connection: { repo_owner: string | null; repo_name: string | null; last_sync: string | null } | null;
      counts: { planned: number; claimed: number; verified: number; total: number };
      triad: EvidenceTriad;
    }>(`/evidence/${projectId}/triad`, {}, token);
  },
};

// ============================================================================
// Knowledge Artifacts API (GKDL-01)
// ============================================================================

/**
 * Knowledge artifact types per AIXORD v4.3 GKDL-01
 * Sessions = evidence, Artifacts = authoritative
 */
export type KnowledgeArtifactType =
  | 'FAQ_REFERENCE'
  | 'SYSTEM_OPERATION_MANUAL'
  | 'SYSTEM_DIAGNOSTICS_GUIDE'
  | 'CONSOLIDATED_SESSION_REFERENCE'
  | 'DEFINITION_OF_DONE';

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
  projectId: string;
  type: KnowledgeArtifactType;
  title: string;
  version: number;
  content: string;
  summary?: string;
  derivationSource: DerivationSource;
  sourceSessionIds?: string[];
  sourceArtifactIds?: string[];
  status: ArtifactStatus;
  approvedBy?: string;
  approvedAt?: string;
  authorityLevel: number;
  supersedes?: string;
  supersededBy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Backend knowledge artifact response type (snake_case from D1 database)
 */
interface BackendKnowledgeArtifact {
  id: string;
  project_id: string;
  type: string;
  title: string;
  version: number;
  content: string;
  summary?: string;
  derivation_source: string;
  source_session_ids?: string;
  source_artifact_ids?: string;
  status: string;
  approved_by?: string;
  approved_at?: string;
  authority_level: number;
  supersedes?: string;
  superseded_by?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Transform backend knowledge artifact to frontend format
 */
function transformKnowledgeArtifact(raw: BackendKnowledgeArtifact): KnowledgeArtifact {
  return {
    id: raw.id,
    projectId: raw.project_id,
    type: raw.type as KnowledgeArtifactType,
    title: raw.title,
    version: raw.version,
    content: raw.content,
    summary: raw.summary,
    derivationSource: raw.derivation_source as DerivationSource,
    sourceSessionIds: raw.source_session_ids ? JSON.parse(raw.source_session_ids) : undefined,
    sourceArtifactIds: raw.source_artifact_ids ? JSON.parse(raw.source_artifact_ids) : undefined,
    status: raw.status as ArtifactStatus,
    approvedBy: raw.approved_by,
    approvedAt: raw.approved_at,
    authorityLevel: raw.authority_level,
    supersedes: raw.supersedes,
    supersededBy: raw.superseded_by,
    createdBy: raw.created_by,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Authority levels per artifact type (for UI display)
 */
export const ARTIFACT_AUTHORITY_LEVELS: Record<KnowledgeArtifactType, number> = {
  CONSOLIDATED_SESSION_REFERENCE: 100,
  DEFINITION_OF_DONE: 80,
  SYSTEM_OPERATION_MANUAL: 60,
  SYSTEM_DIAGNOSTICS_GUIDE: 40,
  FAQ_REFERENCE: 20,
};

/**
 * Human-readable artifact type labels
 */
export const ARTIFACT_TYPE_LABELS: Record<KnowledgeArtifactType, string> = {
  FAQ_REFERENCE: 'FAQ Reference',
  SYSTEM_OPERATION_MANUAL: 'System Operation Manual',
  SYSTEM_DIAGNOSTICS_GUIDE: 'System Diagnostics Guide',
  CONSOLIDATED_SESSION_REFERENCE: 'Consolidated Session Reference (CSR)',
  DEFINITION_OF_DONE: 'Definition of Done',
};

/**
 * Human-readable status labels
 */
export const ARTIFACT_STATUS_LABELS: Record<ArtifactStatus, string> = {
  DRAFT: 'Draft',
  REVIEW: 'In Review',
  APPROVED: 'Approved',
  SUPERSEDED: 'Superseded',
};

export const knowledgeApi = {
  /**
   * List all knowledge artifacts for a project
   */
  async list(
    projectId: string,
    token: string,
    filters?: { type?: KnowledgeArtifactType; status?: ArtifactStatus }
  ): Promise<{ artifacts: KnowledgeArtifact[]; total: number }> {
    let endpoint = `/projects/${projectId}/knowledge`;
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const response = await request<{ artifacts: BackendKnowledgeArtifact[]; total: number }>(
      endpoint,
      {},
      token
    );
    return {
      artifacts: response.artifacts.map(transformKnowledgeArtifact),
      total: response.total,
    };
  },

  /**
   * Get a specific knowledge artifact
   */
  async get(projectId: string, artifactId: string, token: string): Promise<KnowledgeArtifact> {
    const response = await request<BackendKnowledgeArtifact>(
      `/projects/${projectId}/knowledge/${artifactId}`,
      {},
      token
    );
    return transformKnowledgeArtifact(response);
  },

  /**
   * Create a new knowledge artifact
   */
  async create(
    projectId: string,
    data: {
      type: KnowledgeArtifactType;
      title: string;
      content: string;
      summary?: string;
      derivationSource?: DerivationSource;
      sourceSessionIds?: string[];
      sourceArtifactIds?: string[];
    },
    token: string
  ): Promise<{
    id: string;
    type: KnowledgeArtifactType;
    title: string;
    version: number;
    status: ArtifactStatus;
    authorityLevel: number;
    createdAt: string;
  }> {
    const backendData = {
      type: data.type,
      title: data.title,
      content: data.content,
      summary: data.summary,
      derivation_source: data.derivationSource || 'MANUAL',
      source_session_ids: data.sourceSessionIds,
      source_artifact_ids: data.sourceArtifactIds,
    };
    const response = await request<{
      id: string;
      type: string;
      title: string;
      version: number;
      status: string;
      authority_level: number;
      created_at: string;
    }>(
      `/projects/${projectId}/knowledge`,
      {
        method: 'POST',
        body: JSON.stringify(backendData),
      },
      token
    );
    return {
      id: response.id,
      type: response.type as KnowledgeArtifactType,
      title: response.title,
      version: response.version,
      status: response.status as ArtifactStatus,
      authorityLevel: response.authority_level,
      createdAt: response.created_at,
    };
  },

  /**
   * Update a knowledge artifact
   */
  async update(
    projectId: string,
    artifactId: string,
    data: {
      title?: string;
      content?: string;
      summary?: string;
      status?: ArtifactStatus;
    },
    token: string
  ): Promise<{ id: string; version: number; updatedAt: string }> {
    const response = await request<{ id: string; version: number; updated_at: string }>(
      `/projects/${projectId}/knowledge/${artifactId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    );
    return {
      id: response.id,
      version: response.version,
      updatedAt: response.updated_at,
    };
  },

  /**
   * Delete (supersede) a knowledge artifact
   */
  async delete(
    projectId: string,
    artifactId: string,
    token: string
  ): Promise<{ success: boolean; status: 'SUPERSEDED' }> {
    return request<{ success: boolean; status: 'SUPERSEDED' }>(
      `/projects/${projectId}/knowledge/${artifactId}`,
      { method: 'DELETE' },
      token
    );
  },

  /**
   * Approve a knowledge artifact (L-GKDL5)
   */
  async approve(
    projectId: string,
    artifactId: string,
    token: string
  ): Promise<{
    id: string;
    status: 'APPROVED';
    approvedBy: string;
    approvedAt: string;
  }> {
    const response = await request<{
      id: string;
      status: string;
      approved_by: string;
      approved_at: string;
    }>(
      `/projects/${projectId}/knowledge/${artifactId}/approve`,
      { method: 'POST' },
      token
    );
    return {
      id: response.id,
      status: 'APPROVED',
      approvedBy: response.approved_by,
      approvedAt: response.approved_at,
    };
  },

  /**
   * Generate a Consolidated Session Reference (CSR)
   * Per L-GCP6: Required for 10+ sessions
   */
  async generateCSR(
    projectId: string,
    token: string
  ): Promise<{
    id: string;
    type: 'CONSOLIDATED_SESSION_REFERENCE';
    title: string;
    status: 'DRAFT';
    sessionCount: number;
    message: string;
  }> {
    const response = await request<{
      id: string;
      type: string;
      title: string;
      status: string;
      session_count: number;
      message: string;
    }>(
      `/projects/${projectId}/knowledge/generate-csr`,
      { method: 'POST' },
      token
    );
    return {
      id: response.id,
      type: 'CONSOLIDATED_SESSION_REFERENCE',
      title: response.title,
      status: 'DRAFT',
      sessionCount: response.session_count,
      message: response.message,
    };
  },
};

// ============================================================================
// CCS Types (PATCH-CCS-01)
// ============================================================================

export type CCSPhase = 'INACTIVE' | 'DETECT' | 'CONTAIN' | 'ROTATE' | 'INVALIDATE' | 'VERIFY' | 'ATTEST' | 'UNLOCK';
export type CCSIncidentStatus = 'ACTIVE' | 'RESOLVED' | 'EXPIRED';
export type CCSArtifactType = 'CCS-01' | 'CCS-02' | 'CCS-03' | 'CCS-04' | 'CCS-05';
export type CredentialType = 'API_KEY' | 'ACCESS_TOKEN' | 'SECRET_KEY' | 'PASSWORD' | 'OAUTH_TOKEN' | 'DATABASE_CREDENTIAL' | 'ENCRYPTION_KEY' | 'OTHER';
export type ExposureSource = 'VERSION_CONTROL' | 'LOG_FILE' | 'SCREENSHOT' | 'PUBLIC_CHANNEL' | 'THIRD_PARTY_BREACH' | 'SECURITY_AUDIT' | 'OTHER';

export interface CCSIncident {
  id: string;
  projectId: string;
  incidentNumber: string;
  phase: CCSPhase;
  status: CCSIncidentStatus;
  credentialType: CredentialType;
  credentialName: string;
  exposureSource: ExposureSource;
  exposureDescription: string;
  exposureDetectedAt: string;
  impactAssessment: string;
  affectedSystems: string[];
  containCompletedAt?: string;
  rotateCompletedAt?: string;
  invalidateCompletedAt?: string;
  verifyCompletedAt?: string;
  attestCompletedAt?: string;
  unlockCompletedAt?: string;
  attestedBy?: string;
  attestationStatement?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CCSArtifact {
  id: string;
  incidentId: string;
  artifactType: CCSArtifactType;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface CCSVerificationTest {
  id: string;
  incidentId: string;
  testType: 'OLD_REJECTED' | 'NEW_SUCCESS' | 'DEPENDENT_SYSTEM';
  targetSystem: string;
  expectedResult: string;
  actualResult: string;
  passed: boolean;
  testedBy: string;
  testedAt: string;
}

export interface CCSGateStatus {
  GA_CCS: 0 | 1;
  ccs_phase: CCSPhase;
  incident_id: string | null;
  active_incidents: number;
  blocking: boolean;
  active_incident?: {
    incident_number: string;
    phase: CCSPhase;
    credential_name: string;
    credential_type: CredentialType;
  };
}

// ============================================================================
// CCS API (PATCH-CCS-01)
// ============================================================================

export const ccsApi = {
  /**
   * Get GA:CCS gate status
   */
  async getStatus(projectId: string, token: string): Promise<CCSGateStatus> {
    return request<CCSGateStatus>(
      `/projects/${projectId}/ccs/status`,
      {},
      token
    );
  },

  /**
   * Create a CCS incident (activates GA:CCS gate)
   */
  async createIncident(
    projectId: string,
    data: {
      credentialType: CredentialType;
      credentialName: string;
      exposureSource: ExposureSource;
      exposureDescription: string;
      impactAssessment: string;
      affectedSystems?: string[];
    },
    token: string
  ): Promise<{
    id: string;
    incidentNumber: string;
    phase: CCSPhase;
    status: CCSIncidentStatus;
    gaCcs: number;
    message: string;
  }> {
    const response = await request<{
      id: string;
      incident_number: string;
      phase: CCSPhase;
      status: CCSIncidentStatus;
      ga_ccs: number;
      message: string;
    }>(
      `/projects/${projectId}/ccs/incidents`,
      {
        method: 'POST',
        body: JSON.stringify({
          credential_type: data.credentialType,
          credential_name: data.credentialName,
          exposure_source: data.exposureSource,
          exposure_description: data.exposureDescription,
          impact_assessment: data.impactAssessment,
          affected_systems: data.affectedSystems,
        }),
      },
      token
    );
    return {
      id: response.id,
      incidentNumber: response.incident_number,
      phase: response.phase,
      status: response.status,
      gaCcs: response.ga_ccs,
      message: response.message,
    };
  },

  /**
   * List CCS incidents
   */
  async listIncidents(
    projectId: string,
    token: string,
    status?: CCSIncidentStatus
  ): Promise<{ incidents: CCSIncident[]; total: number }> {
    const query = status ? `?status=${status}` : '';
    const response = await request<{
      incidents: Array<{
        id: string;
        project_id: string;
        incident_number: string;
        phase: CCSPhase;
        status: CCSIncidentStatus;
        credential_type: CredentialType;
        credential_name: string;
        exposure_source: ExposureSource;
        exposure_description: string;
        exposure_detected_at: string;
        impact_assessment: string;
        affected_systems: string[];
        contain_completed_at?: string;
        rotate_completed_at?: string;
        invalidate_completed_at?: string;
        verify_completed_at?: string;
        attest_completed_at?: string;
        unlock_completed_at?: string;
        attested_by?: string;
        attestation_statement?: string;
        created_by: string;
        created_at: string;
        updated_at: string;
        resolved_at?: string;
      }>;
      total: number;
    }>(
      `/projects/${projectId}/ccs/incidents${query}`,
      {},
      token
    );
    return {
      incidents: response.incidents.map(i => ({
        id: i.id,
        projectId: i.project_id,
        incidentNumber: i.incident_number,
        phase: i.phase,
        status: i.status,
        credentialType: i.credential_type,
        credentialName: i.credential_name,
        exposureSource: i.exposure_source,
        exposureDescription: i.exposure_description,
        exposureDetectedAt: i.exposure_detected_at,
        impactAssessment: i.impact_assessment,
        affectedSystems: i.affected_systems || [],
        containCompletedAt: i.contain_completed_at,
        rotateCompletedAt: i.rotate_completed_at,
        invalidateCompletedAt: i.invalidate_completed_at,
        verifyCompletedAt: i.verify_completed_at,
        attestCompletedAt: i.attest_completed_at,
        unlockCompletedAt: i.unlock_completed_at,
        attestedBy: i.attested_by,
        attestationStatement: i.attestation_statement,
        createdBy: i.created_by,
        createdAt: i.created_at,
        updatedAt: i.updated_at,
        resolvedAt: i.resolved_at,
      })),
      total: response.total,
    };
  },

  /**
   * Get incident details
   */
  async getIncident(
    projectId: string,
    incidentId: string,
    token: string
  ): Promise<CCSIncident & { artifacts: CCSArtifact[]; verificationTests: CCSVerificationTest[] }> {
    const response = await request<{
      id: string;
      project_id: string;
      incident_number: string;
      phase: CCSPhase;
      status: CCSIncidentStatus;
      credential_type: CredentialType;
      credential_name: string;
      exposure_source: ExposureSource;
      exposure_description: string;
      exposure_detected_at: string;
      impact_assessment: string;
      affected_systems: string[];
      contain_completed_at?: string;
      rotate_completed_at?: string;
      invalidate_completed_at?: string;
      verify_completed_at?: string;
      attest_completed_at?: string;
      unlock_completed_at?: string;
      attested_by?: string;
      attestation_statement?: string;
      created_by: string;
      created_at: string;
      updated_at: string;
      resolved_at?: string;
      artifacts: Array<{
        id: string;
        incident_id: string;
        artifact_type: CCSArtifactType;
        title: string;
        content: string;
        created_by: string;
        created_at: string;
      }>;
      verification_tests: Array<{
        id: string;
        incident_id: string;
        test_type: 'OLD_REJECTED' | 'NEW_SUCCESS' | 'DEPENDENT_SYSTEM';
        target_system: string;
        expected_result: string;
        actual_result: string;
        passed: boolean;
        tested_by: string;
        tested_at: string;
      }>;
    }>(
      `/projects/${projectId}/ccs/incidents/${incidentId}`,
      {},
      token
    );
    return {
      id: response.id,
      projectId: response.project_id,
      incidentNumber: response.incident_number,
      phase: response.phase,
      status: response.status,
      credentialType: response.credential_type,
      credentialName: response.credential_name,
      exposureSource: response.exposure_source,
      exposureDescription: response.exposure_description,
      exposureDetectedAt: response.exposure_detected_at,
      impactAssessment: response.impact_assessment,
      affectedSystems: response.affected_systems || [],
      containCompletedAt: response.contain_completed_at,
      rotateCompletedAt: response.rotate_completed_at,
      invalidateCompletedAt: response.invalidate_completed_at,
      verifyCompletedAt: response.verify_completed_at,
      attestCompletedAt: response.attest_completed_at,
      unlockCompletedAt: response.unlock_completed_at,
      attestedBy: response.attested_by,
      attestationStatement: response.attestation_statement,
      createdBy: response.created_by,
      createdAt: response.created_at,
      updatedAt: response.updated_at,
      resolvedAt: response.resolved_at,
      artifacts: response.artifacts.map(a => ({
        id: a.id,
        incidentId: a.incident_id,
        artifactType: a.artifact_type,
        title: a.title,
        content: a.content,
        createdBy: a.created_by,
        createdAt: a.created_at,
      })),
      verificationTests: response.verification_tests.map(t => ({
        id: t.id,
        incidentId: t.incident_id,
        testType: t.test_type,
        targetSystem: t.target_system,
        expectedResult: t.expected_result,
        actualResult: t.actual_result,
        passed: t.passed,
        testedBy: t.tested_by,
        testedAt: t.tested_at,
      })),
    };
  },

  /**
   * Update incident phase
   */
  async updatePhase(
    projectId: string,
    incidentId: string,
    phase: CCSPhase,
    token: string
  ): Promise<{
    id: string;
    phase: CCSPhase;
    previousPhase: CCSPhase;
    transitionCompletedAt: string;
    gaCcs: number;
  }> {
    const response = await request<{
      id: string;
      phase: CCSPhase;
      previous_phase: CCSPhase;
      transition_completed_at: string;
      ga_ccs: number;
    }>(
      `/projects/${projectId}/ccs/incidents/${incidentId}/phase`,
      {
        method: 'PUT',
        body: JSON.stringify({ phase }),
      },
      token
    );
    return {
      id: response.id,
      phase: response.phase,
      previousPhase: response.previous_phase,
      transitionCompletedAt: response.transition_completed_at,
      gaCcs: response.ga_ccs,
    };
  },

  /**
   * Add CCS artifact
   */
  async addArtifact(
    projectId: string,
    incidentId: string,
    data: {
      artifactType: CCSArtifactType;
      title: string;
      content: string;
    },
    token: string
  ): Promise<{ id: string; artifactType: CCSArtifactType; title: string; createdAt: string }> {
    const response = await request<{
      id: string;
      artifact_type: CCSArtifactType;
      title: string;
      created_at: string;
    }>(
      `/projects/${projectId}/ccs/incidents/${incidentId}/artifacts`,
      {
        method: 'POST',
        body: JSON.stringify({
          artifact_type: data.artifactType,
          title: data.title,
          content: data.content,
        }),
      },
      token
    );
    return {
      id: response.id,
      artifactType: response.artifact_type,
      title: response.title,
      createdAt: response.created_at,
    };
  },

  /**
   * Add verification test
   */
  async addVerificationTest(
    projectId: string,
    incidentId: string,
    data: {
      testType: 'OLD_REJECTED' | 'NEW_SUCCESS' | 'DEPENDENT_SYSTEM';
      targetSystem: string;
      expectedResult: string;
      actualResult: string;
      passed: boolean;
    },
    token: string
  ): Promise<{ id: string; testType: string; passed: boolean; testedAt: string }> {
    const response = await request<{
      id: string;
      test_type: string;
      passed: boolean;
      tested_at: string;
    }>(
      `/projects/${projectId}/ccs/incidents/${incidentId}/verify`,
      {
        method: 'POST',
        body: JSON.stringify({
          test_type: data.testType,
          target_system: data.targetSystem,
          expected_result: data.expectedResult,
          actual_result: data.actualResult,
          passed: data.passed,
        }),
      },
      token
    );
    return {
      id: response.id,
      testType: response.test_type,
      passed: response.passed,
      testedAt: response.tested_at,
    };
  },

  /**
   * Submit Director attestation (CCS-04)
   */
  async attest(
    projectId: string,
    incidentId: string,
    attestationStatement: string,
    token: string
  ): Promise<{ id: string; attested: boolean; attestedBy: string; attestedAt: string; message: string }> {
    const response = await request<{
      id: string;
      attested: boolean;
      attested_by: string;
      attested_at: string;
      message: string;
    }>(
      `/projects/${projectId}/ccs/incidents/${incidentId}/attest`,
      {
        method: 'POST',
        body: JSON.stringify({ attestation_statement: attestationStatement }),
      },
      token
    );
    return {
      id: response.id,
      attested: response.attested,
      attestedBy: response.attested_by,
      attestedAt: response.attested_at,
      message: response.message,
    };
  },

  /**
   * Unlock GA:CCS gate
   */
  async unlock(
    projectId: string,
    incidentId: string,
    token: string
  ): Promise<{
    id: string;
    phase: CCSPhase;
    status: CCSIncidentStatus;
    gaCcs: number;
    message: string;
    unlockedAt: string;
  }> {
    const response = await request<{
      id: string;
      phase: CCSPhase;
      status: CCSIncidentStatus;
      ga_ccs: number;
      message: string;
      unlocked_at: string;
    }>(
      `/projects/${projectId}/ccs/incidents/${incidentId}/unlock`,
      { method: 'POST' },
      token
    );
    return {
      id: response.id,
      phase: response.phase,
      status: response.status,
      gaCcs: response.ga_ccs,
      message: response.message,
      unlockedAt: response.unlocked_at,
    };
  },
};

// ============================================================================
// Security API (SPG-01)
// ============================================================================

/**
 * Security Gate status
 */
export interface SecurityGate {
  passed: boolean;
  passedAt?: string;
  required: boolean;
  description: string;
}

/**
 * Security Gates for a project
 */
export interface SecurityGatesStatus {
  projectId: string;
  gates: {
    'GS:DC': SecurityGate;
    'GS:DP': SecurityGate;
    'GS:AC': SecurityGate;
    'GS:AI': SecurityGate;
    'GS:JR': SecurityGate;
    'GS:RT': SecurityGate;
  };
  executionAllowed: boolean;
  reason: string | null;
}

/**
 * AI Exposure validation result
 */
export interface AIExposureValidation {
  allowed: boolean;
  exposureLevel: AIExposureLevel;
  requiresRedaction: boolean;
  blockedReason: string | null;
  logId: string;
  redactionRules: {
    maskPii: boolean;
    maskPhi: boolean;
    maskMinorData: boolean;
  } | null;
}

export const securityApi = {
  /**
   * Get data classification for a project
   */
  async getClassification(projectId: string, token: string): Promise<DataClassification> {
    const response = await request<{
      project_id: string;
      pii: DataClassificationValue;
      phi: DataClassificationValue;
      financial: DataClassificationValue;
      legal: DataClassificationValue;
      minor_data: DataClassificationValue;
      jurisdiction: string;
      regulations: string[];
      ai_exposure: AIExposureLevel;
      declared: boolean;
      declared_by?: string;
      declared_at?: string;
    }>(`/projects/${projectId}/security/classification`, {}, token);

    return {
      projectId: response.project_id,
      pii: response.pii,
      phi: response.phi,
      financial: response.financial,
      legal: response.legal,
      minorData: response.minor_data,
      jurisdiction: response.jurisdiction,
      regulations: response.regulations,
      aiExposure: response.ai_exposure,
      declared: response.declared,
      declaredBy: response.declared_by,
      declaredAt: response.declared_at,
    };
  },

  /**
   * Set data classification for a project (GS:DC gate - L-SPG1)
   */
  async setClassification(
    projectId: string,
    data: {
      pii?: DataClassificationValue;
      phi?: DataClassificationValue;
      financial?: DataClassificationValue;
      legal?: DataClassificationValue;
      minorData?: DataClassificationValue;
      jurisdiction?: string;
      regulations?: string[];
      aiExposure?: AIExposureLevel;
    },
    token: string
  ): Promise<{
    success: boolean;
    classification: Omit<DataClassification, 'projectId' | 'declared' | 'declaredBy' | 'declaredAt'>;
    gatesPassed: string[];
    warnings: string[];
  }> {
    const response = await request<{
      success: boolean;
      classification: {
        pii: DataClassificationValue;
        phi: DataClassificationValue;
        financial: DataClassificationValue;
        legal: DataClassificationValue;
        minor_data: DataClassificationValue;
        jurisdiction: string;
        regulations: string[];
        ai_exposure: AIExposureLevel;
      };
      gates_passed: string[];
      warnings: string[];
    }>(
      `/projects/${projectId}/security/classification`,
      {
        method: 'PUT',
        body: JSON.stringify({
          pii: data.pii,
          phi: data.phi,
          financial: data.financial,
          legal: data.legal,
          minor_data: data.minorData,
          jurisdiction: data.jurisdiction,
          regulations: data.regulations,
          ai_exposure: data.aiExposure,
        }),
      },
      token
    );

    return {
      success: response.success,
      classification: {
        pii: response.classification.pii,
        phi: response.classification.phi,
        financial: response.classification.financial,
        legal: response.classification.legal,
        minorData: response.classification.minor_data,
        jurisdiction: response.classification.jurisdiction,
        regulations: response.classification.regulations,
        aiExposure: response.classification.ai_exposure,
      },
      gatesPassed: response.gates_passed,
      warnings: response.warnings,
    };
  },

  /**
   * Get security gates status for a project
   */
  async getGates(projectId: string, token: string): Promise<SecurityGatesStatus> {
    const response = await request<{
      project_id: string;
      gates: {
        'GS:DC': SecurityGate;
        'GS:DP': SecurityGate;
        'GS:AC': SecurityGate;
        'GS:AI': SecurityGate;
        'GS:JR': SecurityGate;
        'GS:RT': SecurityGate;
      };
      execution_allowed: boolean;
      reason: string | null;
    }>(`/projects/${projectId}/security/gates`, {}, token);

    return {
      projectId: response.project_id,
      gates: response.gates,
      executionAllowed: response.execution_allowed,
      reason: response.reason,
    };
  },

  /**
   * Validate AI exposure before sending to model
   */
  async validateExposure(
    projectId: string,
    requestId: string,
    token: string
  ): Promise<AIExposureValidation> {
    const response = await request<{
      allowed: boolean;
      exposure_level: AIExposureLevel;
      requires_redaction: boolean;
      blocked_reason: string | null;
      log_id: string;
      redaction_rules: {
        mask_pii: boolean;
        mask_phi: boolean;
        mask_minor_data: boolean;
      } | null;
    }>(
      `/projects/${projectId}/security/validate-exposure`,
      {
        method: 'POST',
        body: JSON.stringify({ request_id: requestId }),
      },
      token
    );

    return {
      allowed: response.allowed,
      exposureLevel: response.exposure_level,
      requiresRedaction: response.requires_redaction,
      blockedReason: response.blocked_reason,
      logId: response.log_id,
      redactionRules: response.redaction_rules ? {
        maskPii: response.redaction_rules.mask_pii,
        maskPhi: response.redaction_rules.mask_phi,
        maskMinorData: response.redaction_rules.mask_minor_data,
      } : null,
    };
  },
};

// ============================================================================
// Usage API (H1/H2 - Trial and Metering)
// ============================================================================

export interface UsageData {
  period: string;
  tier: string;
  requests: {
    used: number;
    limit: number;
    remaining: number;
  };
  tokens: {
    used: number;
  };
  estimatedCostCents: number;
  codeTasks: {
    used: number;
  };
  trial: {
    expiresAt: string;
    daysLeft: number;
  } | null;
}

export interface UsageHistoryItem {
  period: string;
  request_count: number;
  token_count: number;
  estimated_cost_cents: number;
  code_task_count: number;
}

/** D16: Per-project metrics */
export interface ProjectMetrics {
  project_id: string;
  project_name: string;
  sessions: number;
  messages: number;
  tokens: number;
  cost_usd: number;
}

const usageApi = {
  /**
   * Get current period usage
   */
  async current(token: string): Promise<UsageData> {
    const response = await request<{
      period: string;
      tier: string;
      requests: { used: number; limit: number; remaining: number };
      tokens: { used: number };
      estimated_cost_cents: number;
      code_tasks: { used: number };
      trial: { expires_at: string; days_left: number } | null;
    }>('/usage', {}, token);

    return {
      period: response.period,
      tier: response.tier,
      requests: response.requests,
      tokens: response.tokens,
      estimatedCostCents: response.estimated_cost_cents,
      codeTasks: response.code_tasks,
      trial: response.trial ? {
        expiresAt: response.trial.expires_at,
        daysLeft: response.trial.days_left,
      } : null,
    };
  },

  /**
   * Get usage history (past 6 months)
   */
  async history(token: string): Promise<UsageHistoryItem[]> {
    const response = await request<{ history: UsageHistoryItem[] }>('/usage/history', {}, token);
    return response.history;
  },

  /**
   * D16: Get per-project metrics
   */
  async projectMetrics(token: string): Promise<ProjectMetrics[]> {
    const response = await request<{ projects: ProjectMetrics[] }>('/usage/projects', {}, token);
    return response.projects;
  },
};

// ============================================================================
// Image API (ENH-4: Path C — Image Evidence)
// ============================================================================

export interface ImageMetadata {
  id: string;
  project_id: string;
  user_id: string;
  r2_key: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  evidence_type: 'GENERAL' | 'CHECKPOINT' | 'GATE_PROOF' | 'SCREENSHOT' | 'DIAGRAM';
  caption: string | null;
  checkpoint_id: string | null;
  decision_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImageUploadResponse {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  evidence_type: string;
  url: string;
  created_at: string;
}

export interface ImageListResponse {
  project_id: string;
  total: number;
  limit: number;
  offset: number;
  images: ImageMetadata[];
}

export const imageApi = {
  /**
   * Upload an image to a project (multipart/form-data)
   */
  async upload(
    projectId: string,
    file: File,
    options: {
      evidenceType?: string;
      caption?: string;
      checkpointId?: string;
      decisionId?: string;
    },
    token: string
  ): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (options.evidenceType) formData.append('evidence_type', options.evidenceType);
    if (options.caption) formData.append('caption', options.caption);
    if (options.checkpointId) formData.append('checkpoint_id', options.checkpointId);
    if (options.decisionId) formData.append('decision_id', options.decisionId);

    const response = await fetch(`${API_BASE}/projects/${projectId}/images`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new APIError(response.status, data.code || 'UPLOAD_ERROR', data.error || 'Upload failed');
    }
    return data;
  },

  /**
   * List images for a project
   */
  async list(
    projectId: string,
    token: string,
    options?: { evidenceType?: string; limit?: number; offset?: number }
  ): Promise<ImageListResponse> {
    const params = new URLSearchParams();
    if (options?.evidenceType) params.set('evidence_type', options.evidenceType);
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('offset', String(options.offset));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<ImageListResponse>(`/projects/${projectId}/images${qs}`, {}, token);
  },

  /**
   * Get image metadata
   */
  async get(projectId: string, imageId: string, token: string): Promise<ImageMetadata> {
    return request<ImageMetadata>(`/projects/${projectId}/images/${imageId}`, {}, token);
  },

  /**
   * Get image URL (returns the serving endpoint path)
   */
  getUrl(projectId: string, imageId: string): string {
    return `${API_BASE}/projects/${projectId}/images/${imageId}/url`;
  },

  /**
   * Get image as base64 for AI vision (FIX 2: Session 19)
   */
  async getBase64(projectId: string, imageId: string, token: string): Promise<{
    base64: string;
    media_type: string;
    filename: string;
  }> {
    return request<{ base64: string; media_type: string; filename: string }>(
      `/projects/${projectId}/images/${imageId}/base64`,
      {},
      token
    );
  },

  /**
   * Delete an image
   */
  async delete(projectId: string, imageId: string, token: string): Promise<{ deleted: boolean; id: string }> {
    return request<{ deleted: boolean; id: string }>(
      `/projects/${projectId}/images/${imageId}`,
      { method: 'DELETE' },
      token
    );
  },
};

// ============================================================================
// Execution Layers API (Path B: Proactive Debugging)
// ============================================================================

export type LayerStatus = 'PENDING' | 'ACTIVE' | 'EXECUTED' | 'VERIFIED' | 'LOCKED' | 'FAILED';
export type VerificationMethod = 'user_confirm' | 'screenshot' | 'test_output' | 'file_check' | 'ai_auto';

export interface ExecutionLayer {
  id: string;
  project_id: string;
  session_number: number;
  layer_number: number;
  title: string;
  description: string | null;
  status: LayerStatus;
  expected_inputs: Record<string, unknown> | null;
  expected_outputs: Record<string, unknown> | null;
  actual_outputs: Record<string, unknown> | null;
  verification_method: VerificationMethod | null;
  verification_evidence: {
    type: string;
    image_id?: string;
    text?: string;
    timestamp: string;
  } | null;
  verified_at: string | null;
  verified_by: string | null;
  failure_reason: string | null;
  retry_count: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  locked_at: string | null;
}

export interface CreateLayerInput {
  layer_number: number;
  title: string;
  description?: string;
  expected_inputs?: Record<string, unknown>;
  expected_outputs?: Record<string, unknown>;
}

export interface VerifyLayerInput {
  method: VerificationMethod;
  evidence?: {
    type: string;
    image_id?: string;
    text?: string;
  };
  notes?: string;
}

export const layersApi = {
  /**
   * List all layers for a project (optionally filtered by session)
   */
  async list(projectId: string, token: string, sessionNumber?: number): Promise<{ layers: ExecutionLayer[] }> {
    const url = sessionNumber
      ? `/projects/${projectId}/layers?session=${sessionNumber}`
      : `/projects/${projectId}/layers`;
    return request<{ layers: ExecutionLayer[] }>(url, {}, token);
  },

  /**
   * Get a specific layer
   */
  async get(projectId: string, layerId: string, token: string): Promise<ExecutionLayer> {
    return request<ExecutionLayer>(`/projects/${projectId}/layers/${layerId}`, {}, token);
  },

  /**
   * Create a new layer
   */
  async create(projectId: string, data: CreateLayerInput, token: string): Promise<ExecutionLayer> {
    return request<ExecutionLayer>(
      `/projects/${projectId}/layers`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      token
    );
  },

  /**
   * Create multiple layers at once
   */
  async createBatch(projectId: string, layers: CreateLayerInput[], token: string): Promise<{ layers: ExecutionLayer[] }> {
    return request<{ layers: ExecutionLayer[] }>(
      `/projects/${projectId}/layers/batch`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layers }),
      },
      token
    );
  },

  /**
   * Update a layer
   */
  async update(
    projectId: string,
    layerId: string,
    data: Partial<CreateLayerInput> & { actual_outputs?: Record<string, unknown> },
    token: string
  ): Promise<ExecutionLayer> {
    return request<ExecutionLayer>(
      `/projects/${projectId}/layers/${layerId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      token
    );
  },

  /**
   * Start executing a layer (PENDING → ACTIVE)
   */
  async start(projectId: string, layerId: string, token: string): Promise<ExecutionLayer> {
    return request<ExecutionLayer>(
      `/projects/${projectId}/layers/${layerId}/start`,
      { method: 'POST' },
      token
    );
  },

  /**
   * Mark layer as executed (ACTIVE → EXECUTED)
   */
  async complete(projectId: string, layerId: string, actualOutputs: Record<string, unknown> | undefined, token: string): Promise<ExecutionLayer> {
    return request<ExecutionLayer>(
      `/projects/${projectId}/layers/${layerId}/complete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actual_outputs: actualOutputs }),
      },
      token
    );
  },

  /**
   * Verify a layer (EXECUTED → LOCKED)
   */
  async verify(projectId: string, layerId: string, data: VerifyLayerInput, token: string): Promise<ExecutionLayer> {
    return request<ExecutionLayer>(
      `/projects/${projectId}/layers/${layerId}/verify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      token
    );
  },

  /**
   * Mark layer as failed (ACTIVE/EXECUTED → FAILED)
   */
  async fail(projectId: string, layerId: string, reason: string, token: string): Promise<ExecutionLayer> {
    return request<ExecutionLayer>(
      `/projects/${projectId}/layers/${layerId}/fail`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      },
      token
    );
  },

  /**
   * Retry a failed layer (FAILED → ACTIVE)
   */
  async retry(projectId: string, layerId: string, token: string): Promise<ExecutionLayer> {
    return request<ExecutionLayer>(
      `/projects/${projectId}/layers/${layerId}/retry`,
      { method: 'POST' },
      token
    );
  },

  /**
   * Delete a layer (only PENDING layers)
   */
  async delete(projectId: string, layerId: string, token: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(
      `/projects/${projectId}/layers/${layerId}`,
      { method: 'DELETE' },
      token
    );
  },

  /**
   * Get evidence for a layer
   */
  async getEvidence(projectId: string, layerId: string, token: string): Promise<{ evidence: unknown[] }> {
    return request<{ evidence: unknown[] }>(
      `/projects/${projectId}/layers/${layerId}/evidence`,
      {},
      token
    );
  },
};

// ============================================================================
// Sessions API (AIXORD v4.4 — Session Graph Model)
// ============================================================================

export type SessionType = 'DISCOVER' | 'BRAINSTORM' | 'BLUEPRINT' | 'EXECUTE' | 'AUDIT' | 'VERIFY_LOCK';
export type SessionStatus = 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
export type EdgeType = 'CONTINUES' | 'DERIVES' | 'SUPERSEDES' | 'FORKS' | 'RECONCILES';

export interface ProjectSession {
  id: string;
  project_id: string;
  session_number: number;
  session_type: SessionType;
  status: SessionStatus;
  phase: string;
  capsule_snapshot?: string;
  summary?: string;
  message_count: number;
  token_count: number;
  cost_usd: number;
  started_at: string;
  closed_at?: string;
  created_by: string;
}

export interface SessionEdge {
  id: string;
  from_session_id: string;
  to_session_id: string;
  edge_type: EdgeType;
  metadata?: string;
  created_at: string;
}

/** D10: Session metrics (aggregated from message metadata) */
export interface SessionMetrics {
  session_id: string;
  session_number: number;
  session_type: string;
  status: string;
  started_at: string;
  closed_at: string | null;
  messages: {
    total: number;
    user: number;
    assistant: number;
    system: number;
  };
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost_usd: number;
  avg_latency_ms: number;
  model_usage: Record<string, number>;
}

export const sessionsApi = {
  /**
   * Create a new session
   */
  async create(
    projectId: string,
    data: {
      session_type?: SessionType;
      parent_session_id?: string;
      edge_type?: EdgeType;
    },
    token: string
  ): Promise<ProjectSession> {
    return request<ProjectSession>(
      `/projects/${projectId}/sessions`,
      { method: 'POST', body: JSON.stringify(data) },
      token
    );
  },

  /**
   * List sessions for a project
   */
  async list(projectId: string, token: string, status?: SessionStatus): Promise<ProjectSession[]> {
    const query = status ? `?status=${status}` : '';
    const result = await request<{ sessions: ProjectSession[] }>(
      `/projects/${projectId}/sessions${query}`,
      {},
      token
    );
    return result.sessions;
  },

  /**
   * Get session details
   */
  async get(projectId: string, sessionId: string, token: string): Promise<ProjectSession> {
    return request<ProjectSession>(
      `/projects/${projectId}/sessions/${sessionId}`,
      {},
      token
    );
  },

  /**
   * Update session (close, archive, summary)
   */
  async update(
    projectId: string,
    sessionId: string,
    data: {
      status?: SessionStatus;
      summary?: string;
      capsule_snapshot?: object;
      phase?: string;
    },
    token: string
  ): Promise<{ success: boolean; updated_at: string }> {
    return request<{ success: boolean; updated_at: string }>(
      `/projects/${projectId}/sessions/${sessionId}`,
      { method: 'PUT', body: JSON.stringify(data) },
      token
    );
  },

  /**
   * Get session graph (edges)
   */
  async getGraph(
    projectId: string,
    sessionId: string,
    token: string
  ): Promise<{ session_id: string; outgoing: SessionEdge[]; incoming: SessionEdge[] }> {
    return request<{ session_id: string; outgoing: SessionEdge[]; incoming: SessionEdge[] }>(
      `/projects/${projectId}/sessions/${sessionId}/graph`,
      {},
      token
    );
  },

  /**
   * D10: Get session metrics (aggregated usage)
   */
  async getMetrics(
    projectId: string,
    sessionId: string,
    token: string
  ): Promise<SessionMetrics> {
    return request<SessionMetrics>(
      `/projects/${projectId}/sessions/${sessionId}/metrics`,
      {},
      token
    );
  },

  /**
   * Create edge between sessions
   */
  async createEdge(
    projectId: string,
    fromSessionId: string,
    data: {
      to_session_id: string;
      edge_type: EdgeType;
      metadata?: object;
    },
    token: string
  ): Promise<SessionEdge> {
    return request<SessionEdge>(
      `/projects/${projectId}/sessions/${fromSessionId}/edges`,
      { method: 'POST', body: JSON.stringify(data) },
      token
    );
  },
};

// ============================================================================
// Part XIV — Engineering Governance API (AIXORD v4.5)
// ============================================================================

/** §64.3 SAR status */
export type SARStatus = 'DRAFT' | 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';

/** §64.4 Contract status */
export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'DEPRECATED' | 'BROKEN';

/** §64.6 Fitness dimension */
export type FitnessDimension = 'PERFORMANCE' | 'SCALABILITY' | 'RELIABILITY' | 'SECURITY' | 'COST' | 'OTHER';

/** §64.6 Fitness status */
export type FitnessStatus = 'DEFINED' | 'MEASURING' | 'PASSING' | 'FAILING' | 'NOT_APPLICABLE';

/** §65.3 Test level */
export type TestLevel = 'UNIT' | 'INTEGRATION' | 'SYSTEM' | 'ACCEPTANCE';

/** §65.3 Test result */
export type TestResult = 'PASS' | 'FAIL' | 'SKIP' | 'NOT_RUN';

/** §66.5 Budget status */
export type BudgetStatus = 'ACTIVE' | 'EXHAUSTED' | 'EXCEEDED' | 'CLOSED';

/** §67.2 Readiness level */
export type ReadinessLevel = 'L0' | 'L1' | 'L2' | 'L3';

/** §67.4 Alert severity */
export type AlertSeverity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';

/** §67.6 Knowledge transfer type */
export type KnowledgeTransferType = 'DEPLOYMENT' | 'MONITORING' | 'TROUBLESHOOTING' | 'ARCHITECTURE' | 'API' | 'DEPENDENCIES' | 'OTHER';

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
  idempotency: string | null;
  status: ContractStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

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

export interface IntegrationTestRecord {
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

export interface OperationalReadiness {
  id: string;
  project_id: string;
  declared_level: ReadinessLevel;
  current_level: ReadinessLevel;
  deployment_method: string | null;
  health_endpoint: string | null;
  logging_strategy: string | null;
  alerting: string | null;
  checklist_json: string | null;
  verified_at: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RollbackStrategy {
  id: string;
  project_id: string;
  component_name: string;
  rollback_method: string;
  rollback_tested: boolean;
  rollback_tested_at: string | null;
  recovery_time_target: string | null;
  procedure: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AlertConfiguration {
  id: string;
  project_id: string;
  alert_name: string;
  severity: AlertSeverity;
  condition_description: string;
  notification_channel: string | null;
  escalation_path: string | null;
  enabled: boolean;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeTransfer {
  id: string;
  project_id: string;
  title: string;
  transfer_type: KnowledgeTransferType;
  content: string | null;
  target_audience: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EngineeringComplianceArea {
  count?: number;
  declared_level?: string | null;
  current_level?: string | null;
  required: boolean;
  met: boolean;
}

export interface EngineeringCompliance {
  project_id: string;
  overall_percentage: number;
  required_percentage: number;
  areas: Record<string, EngineeringComplianceArea>;
  test_results: Array<{ test_level: string; last_result: string; count: number }>;
  fitness_status: Array<{ status: string; count: number }>;
  summary: string;
}

export const engineeringApi = {
  // --- SAR ---
  async listSAR(projectId: string, token: string, status?: SARStatus): Promise<SAR[]> {
    const query = status ? `?status=${status}` : '';
    const result = await request<{ sars: SAR[] }>(`/projects/${projectId}/engineering/sar${query}`, {}, token);
    return result.sars;
  },
  async getSAR(projectId: string, sarId: string, token: string): Promise<SAR & { interface_contracts: InterfaceContract[] }> {
    return request<SAR & { interface_contracts: InterfaceContract[] }>(`/projects/${projectId}/engineering/sar/${sarId}`, {}, token);
  },
  async createSAR(projectId: string, data: Partial<SAR>, token: string): Promise<SAR> {
    return request<SAR>(`/projects/${projectId}/engineering/sar`, { method: 'POST', body: JSON.stringify(data) }, token);
  },
  async updateSAR(projectId: string, sarId: string, data: Partial<SAR>, token: string): Promise<{ id: string; updated_at: string }> {
    return request<{ id: string; updated_at: string }>(`/projects/${projectId}/engineering/sar/${sarId}`, { method: 'PUT', body: JSON.stringify(data) }, token);
  },
  async deleteSAR(projectId: string, sarId: string, token: string): Promise<{ deleted: boolean }> {
    return request<{ deleted: boolean }>(`/projects/${projectId}/engineering/sar/${sarId}`, { method: 'DELETE' }, token);
  },

  // --- Interface Contracts ---
  async listContracts(projectId: string, token: string): Promise<InterfaceContract[]> {
    const result = await request<{ contracts: InterfaceContract[] }>(`/projects/${projectId}/engineering/contracts`, {}, token);
    return result.contracts;
  },
  async createContract(projectId: string, data: Partial<InterfaceContract>, token: string): Promise<InterfaceContract> {
    return request<InterfaceContract>(`/projects/${projectId}/engineering/contracts`, { method: 'POST', body: JSON.stringify(data) }, token);
  },
  async updateContract(projectId: string, contractId: string, data: Partial<InterfaceContract>, token: string): Promise<{ id: string; updated_at: string }> {
    return request<{ id: string; updated_at: string }>(`/projects/${projectId}/engineering/contracts/${contractId}`, { method: 'PUT', body: JSON.stringify(data) }, token);
  },
  async deleteContract(projectId: string, contractId: string, token: string): Promise<{ deleted: boolean }> {
    return request<{ deleted: boolean }>(`/projects/${projectId}/engineering/contracts/${contractId}`, { method: 'DELETE' }, token);
  },

  // --- Fitness Functions ---
  async listFitness(projectId: string, token: string): Promise<FitnessFunction[]> {
    const result = await request<{ fitness_functions: FitnessFunction[] }>(`/projects/${projectId}/engineering/fitness`, {}, token);
    return result.fitness_functions;
  },
  async createFitness(projectId: string, data: Partial<FitnessFunction>, token: string): Promise<FitnessFunction> {
    return request<FitnessFunction>(`/projects/${projectId}/engineering/fitness`, { method: 'POST', body: JSON.stringify(data) }, token);
  },
  async updateFitness(projectId: string, fitnessId: string, data: Partial<FitnessFunction>, token: string): Promise<{ id: string; updated_at: string }> {
    return request<{ id: string; updated_at: string }>(`/projects/${projectId}/engineering/fitness/${fitnessId}`, { method: 'PUT', body: JSON.stringify(data) }, token);
  },
  async deleteFitness(projectId: string, fitnessId: string, token: string): Promise<{ deleted: boolean }> {
    return request<{ deleted: boolean }>(`/projects/${projectId}/engineering/fitness/${fitnessId}`, { method: 'DELETE' }, token);
  },

  // --- Integration Tests ---
  async listTests(projectId: string, token: string, level?: TestLevel): Promise<IntegrationTestRecord[]> {
    const query = level ? `?level=${level}` : '';
    const result = await request<{ tests: IntegrationTestRecord[] }>(`/projects/${projectId}/engineering/tests${query}`, {}, token);
    return result.tests;
  },
  async createTest(projectId: string, data: Partial<IntegrationTestRecord>, token: string): Promise<IntegrationTestRecord> {
    return request<IntegrationTestRecord>(`/projects/${projectId}/engineering/tests`, { method: 'POST', body: JSON.stringify(data) }, token);
  },
  async updateTest(projectId: string, testId: string, data: Partial<IntegrationTestRecord>, token: string): Promise<{ id: string; updated_at: string }> {
    return request<{ id: string; updated_at: string }>(`/projects/${projectId}/engineering/tests/${testId}`, { method: 'PUT', body: JSON.stringify(data) }, token);
  },
  async deleteTest(projectId: string, testId: string, token: string): Promise<{ deleted: boolean }> {
    return request<{ deleted: boolean }>(`/projects/${projectId}/engineering/tests/${testId}`, { method: 'DELETE' }, token);
  },

  // --- Iteration Budget ---
  async listBudget(projectId: string, token: string): Promise<IterationBudget[]> {
    const result = await request<{ budgets: IterationBudget[] }>(`/projects/${projectId}/engineering/budget`, {}, token);
    return result.budgets;
  },
  async createBudget(projectId: string, data: Partial<IterationBudget>, token: string): Promise<IterationBudget> {
    return request<IterationBudget>(`/projects/${projectId}/engineering/budget`, { method: 'POST', body: JSON.stringify(data) }, token);
  },
  async updateBudget(projectId: string, budgetId: string, data: Partial<IterationBudget>, token: string): Promise<{ id: string; updated_at: string }> {
    return request<{ id: string; updated_at: string }>(`/projects/${projectId}/engineering/budget/${budgetId}`, { method: 'PUT', body: JSON.stringify(data) }, token);
  },

  // --- Operational Readiness ---
  async listReadiness(projectId: string, token: string): Promise<OperationalReadiness[]> {
    const result = await request<{ readiness: OperationalReadiness[] }>(`/projects/${projectId}/engineering/readiness`, {}, token);
    return result.readiness;
  },
  async createReadiness(projectId: string, data: Partial<OperationalReadiness>, token: string): Promise<OperationalReadiness> {
    return request<OperationalReadiness>(`/projects/${projectId}/engineering/readiness`, { method: 'POST', body: JSON.stringify(data) }, token);
  },
  async updateReadiness(projectId: string, readinessId: string, data: Partial<OperationalReadiness>, token: string): Promise<{ id: string; updated_at: string }> {
    return request<{ id: string; updated_at: string }>(`/projects/${projectId}/engineering/readiness/${readinessId}`, { method: 'PUT', body: JSON.stringify(data) }, token);
  },

  // --- Rollback Strategies ---
  async listRollback(projectId: string, token: string): Promise<RollbackStrategy[]> {
    const result = await request<{ strategies: RollbackStrategy[] }>(`/projects/${projectId}/engineering/rollback`, {}, token);
    return result.strategies;
  },
  async createRollback(projectId: string, data: Partial<RollbackStrategy>, token: string): Promise<RollbackStrategy> {
    return request<RollbackStrategy>(`/projects/${projectId}/engineering/rollback`, { method: 'POST', body: JSON.stringify(data) }, token);
  },
  async updateRollback(projectId: string, rollbackId: string, data: Partial<RollbackStrategy>, token: string): Promise<{ id: string; updated_at: string }> {
    return request<{ id: string; updated_at: string }>(`/projects/${projectId}/engineering/rollback/${rollbackId}`, { method: 'PUT', body: JSON.stringify(data) }, token);
  },
  async deleteRollback(projectId: string, rollbackId: string, token: string): Promise<{ deleted: boolean }> {
    return request<{ deleted: boolean }>(`/projects/${projectId}/engineering/rollback/${rollbackId}`, { method: 'DELETE' }, token);
  },

  // --- Alert Configurations ---
  async listAlerts(projectId: string, token: string): Promise<AlertConfiguration[]> {
    const result = await request<{ alerts: AlertConfiguration[] }>(`/projects/${projectId}/engineering/alerts`, {}, token);
    return result.alerts;
  },
  async createAlert(projectId: string, data: Partial<AlertConfiguration>, token: string): Promise<AlertConfiguration> {
    return request<AlertConfiguration>(`/projects/${projectId}/engineering/alerts`, { method: 'POST', body: JSON.stringify(data) }, token);
  },
  async updateAlert(projectId: string, alertId: string, data: Partial<AlertConfiguration>, token: string): Promise<{ id: string; updated_at: string }> {
    return request<{ id: string; updated_at: string }>(`/projects/${projectId}/engineering/alerts/${alertId}`, { method: 'PUT', body: JSON.stringify(data) }, token);
  },
  async deleteAlert(projectId: string, alertId: string, token: string): Promise<{ deleted: boolean }> {
    return request<{ deleted: boolean }>(`/projects/${projectId}/engineering/alerts/${alertId}`, { method: 'DELETE' }, token);
  },

  // --- Knowledge Transfers ---
  async listKnowledge(projectId: string, token: string): Promise<KnowledgeTransfer[]> {
    const result = await request<{ knowledge: KnowledgeTransfer[] }>(`/projects/${projectId}/engineering/knowledge`, {}, token);
    return result.knowledge;
  },
  async createKnowledge(projectId: string, data: Partial<KnowledgeTransfer>, token: string): Promise<KnowledgeTransfer> {
    return request<KnowledgeTransfer>(`/projects/${projectId}/engineering/knowledge`, { method: 'POST', body: JSON.stringify(data) }, token);
  },
  async updateKnowledge(projectId: string, ktId: string, data: Partial<KnowledgeTransfer>, token: string): Promise<{ id: string; updated_at: string }> {
    return request<{ id: string; updated_at: string }>(`/projects/${projectId}/engineering/knowledge/${ktId}`, { method: 'PUT', body: JSON.stringify(data) }, token);
  },
  async deleteKnowledge(projectId: string, ktId: string, token: string): Promise<{ deleted: boolean }> {
    return request<{ deleted: boolean }>(`/projects/${projectId}/engineering/knowledge/${ktId}`, { method: 'DELETE' }, token);
  },

  // --- Compliance Summary ---
  async getCompliance(projectId: string, token: string): Promise<EngineeringCompliance> {
    return request<EngineeringCompliance>(`/projects/${projectId}/engineering/compliance`, {}, token);
  },
};

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
  assumptions: string;
  assumption_status: 'OPEN' | 'CONFIRMED' | 'UNKNOWN';
  inputs: string | null;
  outputs: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETE' | 'CANCELLED';
  sort_order: number;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  children?: BlueprintScope[];
  deliverables?: BlueprintDeliverable[];
}

export interface BlueprintDeliverable {
  id: string;
  project_id: string;
  scope_id: string;
  name: string;
  description: string | null;
  upstream_deps: string;
  downstream_deps: string;
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
  totals: { scopes: number; subscopes: number; deliverables: number };
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

export const blueprintApi = {
  // --- Scopes ---
  async listScopes(projectId: string, token: string): Promise<BlueprintScope[]> {
    const result = await request<{ scopes: BlueprintScope[] }>(`/projects/${projectId}/blueprint/scopes`, {}, token);
    return result.scopes;
  },
  async getScope(projectId: string, scopeId: string, token: string): Promise<BlueprintScope> {
    return request<BlueprintScope>(`/projects/${projectId}/blueprint/scopes/${scopeId}`, {}, token);
  },
  async createScope(projectId: string, data: { name: string; parent_scope_id?: string; purpose?: string; boundary?: string; assumptions?: string[]; assumption_status?: string; inputs?: string; outputs?: string; notes?: string }, token: string): Promise<BlueprintScope> {
    return request<BlueprintScope>(`/projects/${projectId}/blueprint/scopes`, { method: 'POST', body: JSON.stringify(data) }, token);
  },
  async updateScope(projectId: string, scopeId: string, data: Partial<{ name: string; purpose: string; boundary: string; assumptions: string[]; assumption_status: string; inputs: string; outputs: string; status: string; sort_order: number; notes: string }>, token: string): Promise<{ id: string; updated_at: string }> {
    return request<{ id: string; updated_at: string }>(`/projects/${projectId}/blueprint/scopes/${scopeId}`, { method: 'PUT', body: JSON.stringify(data) }, token);
  },
  async deleteScope(projectId: string, scopeId: string, token: string): Promise<{ deleted: boolean }> {
    return request<{ deleted: boolean }>(`/projects/${projectId}/blueprint/scopes/${scopeId}`, { method: 'DELETE' }, token);
  },

  // --- Deliverables ---
  async listDeliverables(projectId: string, token: string, scopeId?: string): Promise<BlueprintDeliverable[]> {
    const query = scopeId ? `?scope_id=${scopeId}` : '';
    const result = await request<{ deliverables: BlueprintDeliverable[] }>(`/projects/${projectId}/blueprint/deliverables${query}`, {}, token);
    return result.deliverables;
  },
  async getDeliverable(projectId: string, deliverableId: string, token: string): Promise<BlueprintDeliverable> {
    return request<BlueprintDeliverable>(`/projects/${projectId}/blueprint/deliverables/${deliverableId}`, {}, token);
  },
  async createDeliverable(projectId: string, data: { scope_id: string; name: string; description?: string; upstream_deps?: string[]; downstream_deps?: string[]; dependency_type?: string; dod_evidence_spec?: string; dod_verification_method?: string; dod_quality_bar?: string; dod_failure_modes?: string; notes?: string }, token: string): Promise<BlueprintDeliverable> {
    return request<BlueprintDeliverable>(`/projects/${projectId}/blueprint/deliverables`, { method: 'POST', body: JSON.stringify(data) }, token);
  },
  async updateDeliverable(projectId: string, deliverableId: string, data: Partial<{ name: string; description: string; scope_id: string; upstream_deps: string[]; downstream_deps: string[]; dependency_type: string; dod_evidence_spec: string; dod_verification_method: string; dod_quality_bar: string; dod_failure_modes: string; status: string; sort_order: number; notes: string }>, token: string): Promise<{ id: string; updated_at: string }> {
    return request<{ id: string; updated_at: string }>(`/projects/${projectId}/blueprint/deliverables/${deliverableId}`, { method: 'PUT', body: JSON.stringify(data) }, token);
  },
  async deleteDeliverable(projectId: string, deliverableId: string, token: string): Promise<{ deleted: boolean }> {
    return request<{ deleted: boolean }>(`/projects/${projectId}/blueprint/deliverables/${deliverableId}`, { method: 'DELETE' }, token);
  },

  // --- Integrity Validation ---
  async runValidation(projectId: string, token: string): Promise<IntegrityReport> {
    return request<IntegrityReport>(`/projects/${projectId}/blueprint/validate`, { method: 'POST' }, token);
  },
  async getIntegrity(projectId: string, token: string): Promise<IntegrityReport | null> {
    const result = await request<{ report: IntegrityReport | null }>(`/projects/${projectId}/blueprint/integrity`, {}, token);
    return result.report;
  },

  // --- DAG ---
  async getDAG(projectId: string, token: string): Promise<{ nodes: DAGNode[]; edges: DAGEdge[]; total_nodes: number; total_edges: number }> {
    return request<{ nodes: DAGNode[]; edges: DAGEdge[]; total_nodes: number; total_edges: number }>(`/projects/${projectId}/blueprint/dag`, {}, token);
  },

  // --- Summary ---
  async getSummary(projectId: string, token: string): Promise<BlueprintSummary> {
    return request<BlueprintSummary>(`/projects/${projectId}/blueprint/summary`, {}, token);
  },
};

// ============================================================================
// Workspace Binding Types & API (Unified GA:ENV + GA:FLD)
// ============================================================================

export interface WorkspaceBinding {
  id: string;
  project_id: string;
  folder_name: string | null;
  folder_template: string | null;
  permission_level: string;
  scaffold_generated: number;
  github_connected: number;
  github_repo: string | null;
  binding_confirmed: number;
  bound_at: string | null;
  updated_at: string;
}

export interface WorkspaceStatus {
  bound: boolean;
  folder_linked: boolean;
  folder_name?: string;
  folder_template?: string;
  permission_level?: string;
  scaffold_generated?: boolean;
  github_connected: boolean;
  github_repo?: string | null;
  confirmed: boolean;
}

export const workspaceApi = {
  async getBinding(projectId: string, token: string): Promise<WorkspaceBinding | null> {
    const result = await request<{ binding: WorkspaceBinding | null }>(`/projects/${projectId}/workspace`, {}, token);
    return result.binding;
  },

  async updateBinding(projectId: string, data: {
    folder_name?: string;
    folder_template?: string;
    permission_level?: string;
    scaffold_generated?: boolean;
    github_connected?: boolean;
    github_repo?: string;
    binding_confirmed?: boolean;
  }, token: string): Promise<{ success: boolean; updated_at: string }> {
    return request<{ success: boolean; updated_at: string }>(`/projects/${projectId}/workspace`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  },

  async deleteBinding(projectId: string, token: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/projects/${projectId}/workspace`, {
      method: 'DELETE',
    }, token);
  },

  async getStatus(projectId: string, token: string): Promise<WorkspaceStatus> {
    return request<WorkspaceStatus>(`/projects/${projectId}/workspace/status`, {}, token);
  },
};

// ============================================================================
// Combined API object
// ============================================================================

export const api = {
  auth: authApi,
  projects: projectsApi,
  state: stateApi,
  decisions: decisionsApi,
  messages: messagesApi,
  router: routerApi,
  billing: billingApi,
  github: githubApi,
  evidence: evidenceApi,
  knowledge: knowledgeApi,
  ccs: ccsApi,
  security: securityApi,
  usage: usageApi,
  images: imageApi,
  layers: layersApi,
  sessions: sessionsApi,
  engineering: engineeringApi,
  blueprint: blueprintApi,
  workspace: workspaceApi,
};

export default api;
