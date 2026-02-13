/**
 * AIXORD Web App API Client - Workflow (Brainstorm, Assignments, Decisions)
 */

import { request, type Decision } from './core';

// ============================================================================
// Brainstorm Artifact API (HANDOFF-VD-CI-01)
// ============================================================================

export interface BrainstormOption {
  id: string;
  title: string;
  description: string;
  assumptions: string[];
  kill_conditions: string[];
  pros?: string[];
  cons?: string[];
}

export interface BrainstormDecisionCriteria {
  criteria: Array<{ name: string; weight: number; description?: string }>;
}

export interface BrainstormArtifactData {
  id: string;
  project_id: string;
  version: number;
  options: BrainstormOption[];
  assumptions: string[];
  decision_criteria: BrainstormDecisionCriteria;
  kill_conditions: string[];
  recommendation: string;
  generated_by: 'ai' | 'manual';
  status: 'DRAFT' | 'FINALIZED' | 'SUPERSEDED';
  created_at: string;
  updated_at: string;
}

export interface BrainstormValidationCheck {
  check: string;
  level: 'BLOCK' | 'WARN';
  passed: boolean;
  detail: string;
}

export interface BrainstormValidationResult {
  valid: boolean;
  checks: BrainstormValidationCheck[];
  block_count: number;
  warn_count: number;
  summary: string;
  artifact_id: string | null;
  artifact_version?: number;
  artifact_status?: string;
}

/** Per-dimension readiness status (HANDOFF-BQL-01) */
export interface BrainstormReadinessDimension {
  dimension: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  detail: string;
}

/** Brainstorm readiness vector (HANDOFF-BQL-01) */
export interface BrainstormReadinessData {
  ready: boolean;
  artifact_exists: boolean;
  dimensions: BrainstormReadinessDimension[];
  suggestion: string | null;
  artifact_id?: string;
  artifact_version?: number;
}

export const brainstormApi = {
  async createArtifact(
    projectId: string,
    data: {
      options: BrainstormOption[];
      assumptions?: string[];
      decision_criteria?: BrainstormDecisionCriteria;
      kill_conditions?: string[];
      recommendation?: string;
      generated_by?: 'ai' | 'manual';
    },
    token: string
  ): Promise<{ id: string; project_id: string; version: number; status: string; created_at: string }> {
    return request<{ id: string; project_id: string; version: number; status: string; created_at: string }>(
      `/projects/${projectId}/brainstorm/artifacts`,
      { method: 'POST', body: JSON.stringify(data) },
      token
    );
  },

  async getArtifact(
    projectId: string,
    token: string,
    params?: { version?: number; status?: string }
  ): Promise<BrainstormArtifactData> {
    const query = new URLSearchParams();
    if (params?.version) query.set('version', String(params.version));
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<BrainstormArtifactData>(
      `/projects/${projectId}/brainstorm/artifacts${qs ? '?' + qs : ''}`,
      {},
      token
    );
  },

  async validate(projectId: string, token: string): Promise<BrainstormValidationResult> {
    return request<BrainstormValidationResult>(
      `/projects/${projectId}/brainstorm/validate`,
      { method: 'POST' },
      token
    );
  },

  async getValidation(projectId: string, token: string): Promise<BrainstormValidationResult> {
    return request<BrainstormValidationResult>(
      `/projects/${projectId}/brainstorm/validation`,
      {},
      token
    );
  },

  async getReadiness(projectId: string, token: string): Promise<BrainstormReadinessData> {
    return request<BrainstormReadinessData>(
      `/projects/${projectId}/brainstorm/readiness`,
      {},
      token
    );
  },
};

// ============================================================================
// Assignments API (HANDOFF-TDL-01 Task 4)
// ============================================================================

export interface TaskAssignmentData {
  id: string;
  project_id: string;
  deliverable_id: string;
  session_id: string | null;
  priority: 'P0' | 'P1' | 'P2';
  sort_order: number;
  status: string;
  authority_scope: string[];
  escalation_triggers: string[];
  progress_notes: string;
  progress_percent: number;
  completed_items: string[];
  remaining_items: string[];
  blocked_reason: string | null;
  blocked_since: string | null;
  submitted_at: string | null;
  submission_summary: string | null;
  submission_evidence: string[];
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_verdict: string | null;
  review_notes: string | null;
  assigned_at: string;
  assigned_by: string;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

export interface EscalationData {
  id: string;
  project_id: string;
  assignment_id: string;
  decision_needed: string;
  options: string[];
  recommendation: string | null;
  recommendation_rationale: string | null;
  status: string;
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface StandupData {
  id: string;
  project_id: string;
  session_id: string;
  report_number: number;
  working_on: string;
  completed_since_last: string[];
  in_progress: string[];
  blocked: string[];
  next_actions: string[];
  estimate_to_completion: string | null;
  escalations_needed: string[];
  message_number: number | null;
  created_at: string;
}

export interface TaskBoardData {
  columns: Record<string, TaskAssignmentData[]>;
  stats: {
    total: number;
    by_status: Record<string, number>;
    by_priority: Record<string, number>;
    overall_progress: number;
  };
  open_escalations: number;
}

export const assignmentsApi = {
  // CRUD
  async assign(
    projectId: string,
    data: { deliverable_id: string; session_id?: string; priority?: string; authority_scope?: string[]; escalation_triggers?: string[] },
    token: string
  ): Promise<TaskAssignmentData> {
    return request<TaskAssignmentData>(
      `/projects/${projectId}/assignments`,
      { method: 'POST', body: JSON.stringify(data) },
      token
    );
  },

  async list(
    projectId: string,
    token: string,
    params?: { session_id?: string; status?: string; deliverable_id?: string }
  ): Promise<TaskAssignmentData[]> {
    const query = new URLSearchParams();
    if (params?.session_id) query.set('session_id', params.session_id);
    if (params?.status) query.set('status', params.status);
    if (params?.deliverable_id) query.set('deliverable_id', params.deliverable_id);
    const qs = query.toString();
    const result = await request<{ assignments: TaskAssignmentData[] }>(
      `/projects/${projectId}/assignments${qs ? '?' + qs : ''}`,
      {},
      token
    );
    return result.assignments || [];
  },

  async get(projectId: string, assignmentId: string, token: string): Promise<TaskAssignmentData> {
    return request<TaskAssignmentData>(
      `/projects/${projectId}/assignments/${assignmentId}`,
      {},
      token
    );
  },

  async update(
    projectId: string,
    assignmentId: string,
    data: Partial<Pick<TaskAssignmentData, 'priority' | 'sort_order' | 'authority_scope' | 'escalation_triggers'>>,
    token: string
  ): Promise<{ updated: boolean }> {
    return request<{ updated: boolean }>(
      `/projects/${projectId}/assignments/${assignmentId}`,
      { method: 'PUT', body: JSON.stringify(data) },
      token
    );
  },

  async remove(projectId: string, assignmentId: string, token: string): Promise<{ deleted: boolean }> {
    return request<{ deleted: boolean }>(
      `/projects/${projectId}/assignments/${assignmentId}`,
      { method: 'DELETE' },
      token
    );
  },

  // Lifecycle
  async start(projectId: string, assignmentId: string, token: string): Promise<{ status: string }> {
    return request<{ status: string }>(
      `/projects/${projectId}/assignments/${assignmentId}/start`,
      { method: 'POST' },
      token
    );
  },

  async progress(
    projectId: string,
    assignmentId: string,
    data: { progress_percent: number; progress_notes?: string; completed_items?: string[]; remaining_items?: string[] },
    token: string
  ): Promise<{ updated: boolean }> {
    return request<{ updated: boolean }>(
      `/projects/${projectId}/assignments/${assignmentId}/progress`,
      { method: 'POST', body: JSON.stringify(data) },
      token
    );
  },

  async submit(
    projectId: string,
    assignmentId: string,
    data: { submission_summary: string; submission_evidence?: string[] },
    token: string
  ): Promise<{ status: string }> {
    return request<{ status: string }>(
      `/projects/${projectId}/assignments/${assignmentId}/submit`,
      { method: 'POST', body: JSON.stringify(data) },
      token
    );
  },

  async accept(
    projectId: string,
    assignmentId: string,
    data: { review_notes?: string },
    token: string
  ): Promise<{ status: string }> {
    return request<{ status: string }>(
      `/projects/${projectId}/assignments/${assignmentId}/accept`,
      { method: 'POST', body: JSON.stringify(data) },
      token
    );
  },

  async reject(
    projectId: string,
    assignmentId: string,
    data: { review_notes: string },
    token: string
  ): Promise<{ status: string }> {
    return request<{ status: string }>(
      `/projects/${projectId}/assignments/${assignmentId}/reject`,
      { method: 'POST', body: JSON.stringify(data) },
      token
    );
  },

  async block(
    projectId: string,
    assignmentId: string,
    data: { blocked_reason: string },
    token: string
  ): Promise<{ status: string }> {
    return request<{ status: string }>(
      `/projects/${projectId}/assignments/${assignmentId}/block`,
      { method: 'POST', body: JSON.stringify(data) },
      token
    );
  },

  // Escalations
  async createEscalation(
    projectId: string,
    data: { assignment_id: string; decision_needed: string; options?: string[]; recommendation?: string; recommendation_rationale?: string },
    token: string
  ): Promise<EscalationData> {
    return request<EscalationData>(
      `/projects/${projectId}/escalations`,
      { method: 'POST', body: JSON.stringify(data) },
      token
    );
  },

  async listEscalations(
    projectId: string,
    token: string,
    params?: { status?: string; assignment_id?: string }
  ): Promise<EscalationData[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.assignment_id) query.set('assignment_id', params.assignment_id);
    const qs = query.toString();
    const result = await request<{ escalations: EscalationData[] }>(
      `/projects/${projectId}/escalations${qs ? '?' + qs : ''}`,
      {},
      token
    );
    return result.escalations || [];
  },

  async resolveEscalation(
    projectId: string,
    escalationId: string,
    data: { resolution: string },
    token: string
  ): Promise<{ status: string }> {
    return request<{ status: string }>(
      `/projects/${projectId}/escalations/${escalationId}/resolve`,
      { method: 'POST', body: JSON.stringify(data) },
      token
    );
  },

  // Standups — CRIT-07 FIX: Match backend route pattern /:projectId/sessions/:sessionId/standup
  async postStandup(
    projectId: string,
    data: {
      session_id: string;
      working_on: string;
      completed_since_last?: string[];
      in_progress?: string[];
      blocked?: string[];
      next_actions?: string[];
      estimate_to_completion?: string;
      message_number?: number;
    },
    token: string
  ): Promise<StandupData> {
    const { session_id, ...standupBody } = data;
    return request<StandupData>(
      `/projects/${projectId}/sessions/${session_id}/standup`,
      { method: 'POST', body: JSON.stringify(standupBody) },
      token
    );
  },

  async listStandups(
    projectId: string,
    sessionId: string,
    token: string
  ): Promise<StandupData[]> {
    const result = await request<{ standups: StandupData[] }>(
      `/projects/${projectId}/sessions/${sessionId}/standups`,
      {},
      token
    );
    return result.standups || [];
  },

  // TaskBoard
  async getTaskBoard(projectId: string, token: string): Promise<TaskBoardData> {
    return request<TaskBoardData>(
      `/projects/${projectId}/taskboard`,
      {},
      token
    );
  },
};

// ============================================================================
// Decisions API
// ============================================================================

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
