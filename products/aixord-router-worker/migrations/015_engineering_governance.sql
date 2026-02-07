-- migrations/015_engineering_governance.sql
-- Part XIV — Engineering Governance (AIXORD v4.5)
-- Created: 2026-02-07
--
-- Implements §64 (Architectural Decision Governance), §65 (Integration Verification),
-- §66 (Iteration Protocols), and §67 (Operational Readiness Criteria) as governed
-- artifacts with full CRUD lifecycle.
--
-- 9 tables covering all Part XIV artifact types.

-- ============================================================================
-- §64.3 — System Architecture Records (SAR)
-- 7 required elements: boundary, component_map, interface_contracts,
-- data_flow, state_ownership, consistency_model, failure_domains
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_architecture_records (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'ACTIVE', 'SUPERSEDED', 'ARCHIVED')),
  system_boundary TEXT,
  component_map TEXT,
  interface_contracts_summary TEXT,
  data_flow TEXT,
  state_ownership TEXT,
  consistency_model TEXT,
  failure_domains TEXT,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sar_project ON system_architecture_records(project_id);
CREATE INDEX IF NOT EXISTS idx_sar_status ON system_architecture_records(project_id, status);

-- ============================================================================
-- §64.4 — Interface Contracts
-- Elements: input_shape, output_shape, error_contract, versioning_strategy, idempotency
-- ============================================================================
CREATE TABLE IF NOT EXISTS interface_contracts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  sar_id TEXT,
  contract_name TEXT NOT NULL,
  producer TEXT NOT NULL,
  consumer TEXT NOT NULL,
  input_shape TEXT,
  output_shape TEXT,
  error_contract TEXT,
  versioning_strategy TEXT,
  idempotency TEXT CHECK (idempotency IN ('YES', 'NO', 'CONDITIONAL')),
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'ACTIVE', 'DEPRECATED', 'BROKEN')),
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (sar_id) REFERENCES system_architecture_records(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_contracts_project ON interface_contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_sar ON interface_contracts(sar_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON interface_contracts(project_id, status);

-- ============================================================================
-- §64.6 — Architectural Fitness Functions
-- Dimensions: performance, scalability, reliability, security, cost
-- ============================================================================
CREATE TABLE IF NOT EXISTS fitness_functions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  dimension TEXT NOT NULL
    CHECK (dimension IN ('PERFORMANCE', 'SCALABILITY', 'RELIABILITY', 'SECURITY', 'COST', 'OTHER')),
  metric_name TEXT NOT NULL,
  target_value TEXT NOT NULL,
  current_value TEXT,
  unit TEXT,
  measurement_method TEXT,
  verified_at DATETIME,
  status TEXT NOT NULL DEFAULT 'DEFINED'
    CHECK (status IN ('DEFINED', 'MEASURING', 'PASSING', 'FAILING', 'NOT_APPLICABLE')),
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fitness_project ON fitness_functions(project_id);
CREATE INDEX IF NOT EXISTS idx_fitness_dimension ON fitness_functions(project_id, dimension);

-- ============================================================================
-- §65.3 — Integration Tests (4 levels: UNIT, INTEGRATION, SYSTEM, ACCEPTANCE)
-- ============================================================================
CREATE TABLE IF NOT EXISTS integration_tests (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  contract_id TEXT,
  test_level TEXT NOT NULL
    CHECK (test_level IN ('UNIT', 'INTEGRATION', 'SYSTEM', 'ACCEPTANCE')),
  test_name TEXT NOT NULL,
  description TEXT,
  producer TEXT,
  consumer TEXT,
  happy_path TEXT,
  error_path TEXT,
  boundary_conditions TEXT,
  last_result TEXT CHECK (last_result IN ('PASS', 'FAIL', 'SKIP', 'NOT_RUN')),
  last_run_at DATETIME,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (contract_id) REFERENCES interface_contracts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tests_project ON integration_tests(project_id);
CREATE INDEX IF NOT EXISTS idx_tests_level ON integration_tests(project_id, test_level);
CREATE INDEX IF NOT EXISTS idx_tests_contract ON integration_tests(contract_id);

-- ============================================================================
-- §66.5 — Iteration Budget (per scope)
-- ============================================================================
CREATE TABLE IF NOT EXISTS iteration_budget (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  scope_name TEXT NOT NULL,
  expected_iterations INTEGER NOT NULL DEFAULT 0,
  iteration_ceiling INTEGER NOT NULL DEFAULT 3,
  actual_iterations INTEGER NOT NULL DEFAULT 0,
  time_budget_hours REAL,
  time_used_hours REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'EXHAUSTED', 'EXCEEDED', 'CLOSED')),
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_budget_project ON iteration_budget(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_scope ON iteration_budget(project_id, scope_name);

-- ============================================================================
-- §67.2 — Operational Readiness (L0-L3)
-- ============================================================================
CREATE TABLE IF NOT EXISTS operational_readiness (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  declared_level TEXT NOT NULL DEFAULT 'L0'
    CHECK (declared_level IN ('L0', 'L1', 'L2', 'L3')),
  current_level TEXT NOT NULL DEFAULT 'L0'
    CHECK (current_level IN ('L0', 'L1', 'L2', 'L3')),
  deployment_method TEXT,
  environment_parity TEXT,
  config_management TEXT,
  deployment_verification TEXT,
  health_endpoint TEXT,
  logging_strategy TEXT,
  error_reporting TEXT,
  key_metrics TEXT,
  alerting TEXT,
  dashboards TEXT,
  tracing TEXT,
  audit_logging TEXT,
  incident_response_plan TEXT,
  runbooks TEXT,
  sla_definitions TEXT,
  checklist_json TEXT,
  verified_at DATETIME,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_readiness_project ON operational_readiness(project_id);

-- ============================================================================
-- §67.3 — Rollback Strategies
-- ============================================================================
CREATE TABLE IF NOT EXISTS rollback_strategies (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  component_name TEXT NOT NULL,
  rollback_method TEXT NOT NULL,
  rollback_tested INTEGER NOT NULL DEFAULT 0,
  rollback_tested_at DATETIME,
  recovery_time_target TEXT,
  data_loss_tolerance TEXT,
  prerequisites TEXT,
  procedure TEXT,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rollback_project ON rollback_strategies(project_id);

-- ============================================================================
-- §67.4 — Alert Configurations
-- ============================================================================
CREATE TABLE IF NOT EXISTS alert_configurations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  alert_name TEXT NOT NULL,
  severity TEXT NOT NULL
    CHECK (severity IN ('SEV1', 'SEV2', 'SEV3', 'SEV4')),
  condition_description TEXT NOT NULL,
  notification_channel TEXT,
  escalation_path TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  last_triggered_at DATETIME,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_alerts_project ON alert_configurations(project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alert_configurations(project_id, severity);

-- ============================================================================
-- §67.6 — Knowledge Transfer Artifacts
-- ============================================================================
CREATE TABLE IF NOT EXISTS knowledge_transfers (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  transfer_type TEXT NOT NULL
    CHECK (transfer_type IN ('DEPLOYMENT', 'MONITORING', 'TROUBLESHOOTING', 'ARCHITECTURE', 'API', 'DEPENDENCIES', 'OTHER')),
  content TEXT,
  target_audience TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED')),
  reviewed_by TEXT,
  reviewed_at DATETIME,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_kt_project ON knowledge_transfers(project_id);
CREATE INDEX IF NOT EXISTS idx_kt_type ON knowledge_transfers(project_id, transfer_type);
