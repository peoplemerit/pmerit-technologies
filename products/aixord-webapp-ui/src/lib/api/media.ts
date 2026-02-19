/**
 * AIXORD Web App API Client - Media, Sessions, Workspace, and Continuity
 */

import { API_BASE, APIError, request } from './core';

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
// Workspace Binding Types & API (Unified GA:ENV + GA:FLD)
// ============================================================================

// Environment Confirmation Test types
export interface EnvTestResult {
  test_id: string;
  name: string;
  passed: boolean;
  latency_ms: number;
  evidence: Record<string, unknown>;
  error?: string;
}

export interface EnvConfirmTestResult {
  project_id: string;
  ran_at: string;
  all_passed: boolean;
  duration_ms: number;
  tests: EnvTestResult[];
}

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
    // S1-T1: Scaffold count reporting
    scaffold_item_count?: number;
    scaffold_skipped_count?: number;
    scaffold_error_count?: number;
    // ENV-SYNC-01: Push metadata
    github_push_count?: number;
    github_push_sha?: string;
    github_push_branch?: string;
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

  async confirmTest(projectId: string, token: string): Promise<EnvConfirmTestResult> {
    return request<EnvConfirmTestResult>(`/projects/${projectId}/workspace/confirm-test`, {
      method: 'POST',
    }, token);
  },
};

// ============================================================================
// Project Continuity API (HANDOFF-PCC-01)
// ============================================================================

export interface ContinuityCapsule {
  project_id: string;
  objective: string;
  current_phase: string;
  phase_since: string;
  sessions_in_phase: number;
  session_timeline: Array<{
    number: number;
    type: string;
    status: string;
    summary: string | null;
    phase: string;
    message_count: number;
    closed_at: string | null;
  }>;
  selected_approach: { option_name: string; rationale: string } | null;
  rejected_approaches: Array<{ option_name: string; kill_reason: string }>;
  key_decisions: Array<{
    id: string;
    action: string;
    summary: string | null;
    result: string;
    reason: string;
    created_at: string;
  }>;
  active_work: Array<{
    deliverable_name: string;
    status: string;
    priority: string;
    progress_percent: number;
  }>;
  open_escalations: Array<{ deliverable_name: string; decision_needed: string }>;
  known_constraints: string[];
  total_sessions: number;
  total_decisions: number;
  total_deliverables: number;
  completed_deliverables: number;
  pinned_items: Array<{
    id: string;
    pin_type: string;
    target_id: string;
    label: string | null;
    pinned_at: string;
  }>;
}

export interface ContinuityPin {
  id: string;
  pin_type: string;
  target_id: string;
  label: string | null;
  pinned_by: string;
  pinned_at: string;
}

export const continuityApi = {
  async getCapsule(projectId: string, token: string): Promise<ContinuityCapsule> {
    return request<ContinuityCapsule>(`/projects/${projectId}/continuity`, {}, token);
  },

  async getSessionSummary(projectId: string, sessionId: string, token: string): Promise<{
    session: Record<string, unknown>;
    decisions: Array<Record<string, unknown>>;
  }> {
    return request(`/projects/${projectId}/continuity/sessions/${sessionId}`, {}, token);
  },

  async getDecisions(projectId: string, token: string, action?: string): Promise<{
    decisions: Array<Record<string, unknown>>;
  }> {
    const params = action ? `?action=${action}` : '';
    return request(`/projects/${projectId}/continuity/decisions${params}`, {}, token);
  },

  async getArtifacts(projectId: string, token: string, type?: string): Promise<Record<string, unknown>> {
    const params = type ? `?type=${type}` : '';
    return request(`/projects/${projectId}/continuity/artifacts${params}`, {}, token);
  },

  async getPins(projectId: string, token: string): Promise<{ pins: ContinuityPin[] }> {
    return request<{ pins: ContinuityPin[] }>(`/projects/${projectId}/continuity/pins`, {}, token);
  },

  async createPin(projectId: string, pin: { pin_type: string; target_id: string; label?: string }, token: string): Promise<ContinuityPin> {
    return request<ContinuityPin>(`/projects/${projectId}/continuity/pins`, {
      method: 'POST',
      body: JSON.stringify(pin),
    }, token);
  },

  async deletePin(projectId: string, pinId: string, token: string): Promise<void> {
    await request<void>(`/projects/${projectId}/continuity/pins/${pinId}`, {
      method: 'DELETE',
    }, token);
  },
};

// Export usage API as well
export { usageApi };
