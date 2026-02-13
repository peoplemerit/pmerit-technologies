/**
 * AIXORD Web App API Client - Projects & State Management
 */

import { API_BASE, APIError, request, normalizeDate, type Project, type ProjectType, type AIXORDState, type DataClassificationValue, type AIExposureLevel, type ReconciliationTriad } from './core';

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
  async setPhase(
    projectId: string,
    phase: string,
    token: string,
    reassessOptions?: { reassess_reason: string; review_summary?: string }
  ): Promise<string> {
    const res = await fetch(`${API_BASE}/state/${projectId}/phase`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ phase, ...reassessOptions }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 403 && data.missingGates) {
        const err = new APIError(403, 'PHASE_BLOCKED', data.message || data.error);
        (err as any).missingGates = data.missingGates;
        throw err;
      }
      if (res.status === 400 && (data.error === 'REASSESS_REASON_REQUIRED' || data.error === 'REASSESS_REVIEW_REQUIRED')) {
        const err = new APIError(400, data.error, data.message);
        (err as any).reassessData = data;
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
  async finalizePhase(projectId: string, phase: string, token: string, overrideOptions?: {
    override_warnings: boolean;
    override_reason: string;
  }): Promise<{
    success: boolean;
    result: 'APPROVED' | 'REJECTED' | 'WARNINGS';
    phase_from: string;
    phase_to: string;
    artifact_checks: Array<{ check: string; passed: boolean; detail: string }>;
    warnings?: Array<{ check: string; passed: boolean; detail: string }>;
    missing_gates?: string[];
    message: string;
    ledger_logged?: boolean;
  }> {
    return request<{
      success: boolean;
      result: 'APPROVED' | 'REJECTED' | 'WARNINGS';
      phase_from: string;
      phase_to: string;
      artifact_checks: Array<{ check: string; passed: boolean; detail: string }>;
      warnings?: Array<{ check: string; passed: boolean; detail: string }>;
      missing_gates?: string[];
      message: string;
      ledger_logged?: boolean;
    }>(`/state/${projectId}/phases/${phase}/finalize`, {
      method: 'POST',
      ...(overrideOptions ? { body: JSON.stringify(overrideOptions) } : {}),
    }, token);
  },
};
