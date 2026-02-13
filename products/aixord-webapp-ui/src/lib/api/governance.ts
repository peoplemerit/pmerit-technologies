/**
 * AIXORD Web App API Client - Mathematical Governance
 *
 * WU Conservation, Readiness (R = L × P × V), Reconciliation Triad
 */

import { request } from './core';

// ============================================================================
// Types
// ============================================================================

export interface ScopeReadiness {
  scope_id: string;
  scope_name: string;
  L: number;
  P: number;
  V: number;
  R: number;
  allocated_wu: number;
  verified_wu: number;
  deliverable_count: number;
  deliverables_done: number;
  dmaic_breakdown: Record<string, number>;
}

export interface ConservationSnapshot {
  total: number;
  formula: number;
  verified: number;
  delta: number;
  valid: boolean;
}

export interface ProjectReadiness {
  project_id: string;
  scopes: ScopeReadiness[];
  project_R: number;
  conservation: ConservationSnapshot;
}

export interface ReconciliationEntry {
  scope_id: string;
  scope_name: string;
  planned_wu: number;
  claimed_wu: number;
  verified_wu: number;
  delta: number;
  divergence_pct: number;
  requires_attention: boolean;
}

export interface ReconciliationResult {
  project_id: string;
  entries: ReconciliationEntry[];
  has_divergences: boolean;
  max_divergence_pct: number;
  conservation: ConservationSnapshot;
}

export interface WUAuditEvent {
  id: number;
  project_id: string;
  scope_id: string | null;
  event_type: string;
  wu_amount: number;
  readiness_score: number | null;
  logic_score: number | null;
  procedural_score: number | null;
  validation_score: number | null;
  snapshot_total: number | null;
  snapshot_formula: number | null;
  snapshot_verified: number | null;
  conservation_valid: number | null;
  actor_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface GovernanceDashboardData {
  readiness: ProjectReadiness;
  reconciliation: ReconciliationResult;
  audit_trail: WUAuditEvent[];
  generated_at: string;
}

export interface WUInitResult {
  success: boolean;
  execution_total_wu: number;
  formula_execution_wu: number;
  verified_reality_wu: number;
}

export interface WUAllocateResult {
  success: boolean;
  error?: string;
  allocated_wu: number;
  conservation: ConservationSnapshot;
}

export interface WUTransferResult {
  scope_id: string;
  R: number;
  wu_transferred: number;
  new_verified_wu: number;
  conservation: ConservationSnapshot;
}

// ============================================================================
// API Functions
// ============================================================================

export const governanceApi = {
  /** Initialize project WU budget */
  initializeWU: (projectId: string, totalWU: number, token: string) =>
    request<WUInitResult>(
      `/projects/${projectId}/governance/wu/initialize`,
      { method: 'POST', body: JSON.stringify({ total_wu: totalWU }) },
      token
    ),

  /** Allocate WU to a scope */
  allocateWU: (projectId: string, scopeId: string, wuAmount: number, token: string) =>
    request<WUAllocateResult>(
      `/projects/${projectId}/governance/wu/allocate`,
      { method: 'POST', body: JSON.stringify({ scope_id: scopeId, wu_amount: wuAmount }) },
      token
    ),

  /** Transfer WU for a verified scope (applies R formula) */
  transferWU: (projectId: string, scopeId: string, token: string) =>
    request<WUTransferResult>(
      `/projects/${projectId}/governance/wu/transfer`,
      { method: 'POST', body: JSON.stringify({ scope_id: scopeId }) },
      token
    ),

  /** Get per-scope L/P/V/R readiness breakdown */
  getReadiness: (projectId: string, token: string) =>
    request<ProjectReadiness>(
      `/projects/${projectId}/governance/readiness`,
      { method: 'GET' },
      token
    ),

  /** Get conservation formula snapshot */
  getConservation: (projectId: string, token: string) =>
    request<ConservationSnapshot>(
      `/projects/${projectId}/governance/conservation`,
      { method: 'GET' },
      token
    ),

  /** Get reconciliation triad */
  getReconciliation: (projectId: string, token: string) =>
    request<ReconciliationResult>(
      `/projects/${projectId}/governance/reconciliation`,
      { method: 'GET' },
      token
    ),

  /** Get combined dashboard metrics */
  getDashboard: (projectId: string, token: string) =>
    request<GovernanceDashboardData>(
      `/projects/${projectId}/governance/dashboard`,
      { method: 'GET' },
      token
    ),

  /** Get WU audit trail (paginated) */
  getAudit: (projectId: string, token: string, limit = 50, offset = 0) =>
    request<{ events: WUAuditEvent[]; total: number; limit: number; offset: number }>(
      `/projects/${projectId}/governance/audit?limit=${limit}&offset=${offset}`,
      { method: 'GET' },
      token
    ),
};
