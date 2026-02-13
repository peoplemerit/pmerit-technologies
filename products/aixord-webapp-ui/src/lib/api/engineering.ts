/**
 * AIXORD Web App API Client - Engineering Governance (AIXORD v4.5)
 */

import { request } from './core';

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

  // --- Import from Plan Artifact ---
  async importFromPlanArtifact(
    projectId: string,
    data: {
      scopes: Array<{
        name: string;
        purpose?: string;
        boundary?: string;
        assumptions?: string[];
        deliverables?: Array<{
          name: string;
          description?: string;
          dod_evidence_spec?: string;
          dod_verification_method?: string;
          upstream_deps?: string[];
          downstream_deps?: string[];
        }>;
      }>;
      selected_option?: { id: string; title: string; rationale: string };
      milestones?: Array<{ name: string; target: string; deliverables: string[] }>;
      tech_stack?: Array<{ component: string; technology: string; rationale: string }>;
      risks?: Array<{ description: string; mitigation: string; source: string }>;
    },
    token: string
  ): Promise<{ success: boolean; imported: { scopes: number; deliverables: number } }> {
    return request<{ success: boolean; imported: { scopes: number; deliverables: number } }>(
      `/projects/${projectId}/blueprint/import`,
      { method: 'POST', body: JSON.stringify(data) },
      token
    );
  },
};
