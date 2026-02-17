-- Migration 046: Schema Reconciliation — Production ↔ Staging parity
-- Created: 2026-02-17
-- Purpose: Add 4 tables that exist in staging but are missing from production.
--          These were applied via migrations 009 (partial) and 035-036 to staging
--          but production schema was built incrementally via direct SQL.
--
-- Tables added:
--   1. secret_access_log   — Security audit trail for secret access (SPG-01)
--   2. security_classifications — Per-resource classification + AI exposure rules
--   3. agent_instances     — Multi-agent architecture: agent state tracking
--   4. agent_tasks         — Multi-agent architecture: task queue + Worker-Auditor loop

-- =============================================================================
-- 1. SECRET ACCESS LOG (from SPG-01 security governance)
-- =============================================================================

CREATE TABLE IF NOT EXISTS secret_access_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  secret_key TEXT NOT NULL,
  accessed_by TEXT REFERENCES users(id),
  accessed_at TEXT NOT NULL DEFAULT (datetime('now')),
  access_type TEXT CHECK (access_type IN ('READ', 'WRITE', 'ROTATE', 'DELETE')),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_secret_access_project ON secret_access_log(project_id);
CREATE INDEX IF NOT EXISTS idx_secret_access_time ON secret_access_log(accessed_at);

-- =============================================================================
-- 2. SECURITY CLASSIFICATIONS (per-resource sensitivity + AI exposure)
-- =============================================================================

CREATE TABLE IF NOT EXISTS security_classifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('SCOPE', 'DELIVERABLE', 'MESSAGE', 'FILE')),
  resource_id TEXT NOT NULL,

  -- Classification level
  classification TEXT NOT NULL CHECK (classification IN ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED')),
  classification_reason TEXT,
  classified_by TEXT REFERENCES users(id),
  classified_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- AI exposure rules
  ai_exposure_allowed INTEGER NOT NULL DEFAULT 1,
  ai_model_restrictions TEXT,

  -- Jurisdiction
  data_residency TEXT,
  jurisdiction_reviewed INTEGER NOT NULL DEFAULT 0,
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TEXT,

  -- Retention
  retention_policy TEXT CHECK (retention_policy IN ('7_DAYS', '30_DAYS', '90_DAYS', '1_YEAR', '7_YEARS', 'PERMANENT')),
  retention_expires_at TEXT,

  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  UNIQUE(project_id, resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_security_class_project ON security_classifications(project_id);
CREATE INDEX IF NOT EXISTS idx_security_class_resource ON security_classifications(resource_type, resource_id);

-- =============================================================================
-- 3. AGENT INSTANCES (multi-agent architecture state tracking)
-- =============================================================================

CREATE TABLE IF NOT EXISTS agent_instances (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('SUPERVISOR', 'WORKER', 'AUDITOR')),
  model_provider TEXT NOT NULL CHECK (model_provider IN ('anthropic', 'openai', 'google', 'deepseek')),
  model_id TEXT NOT NULL,

  -- State Machine
  status TEXT NOT NULL DEFAULT 'IDLE' CHECK (status IN (
    'IDLE', 'INITIALIZING', 'RUNNING', 'WAITING_FOR_APPROVAL',
    'PAUSED', 'COMPLETED', 'FAILED', 'TERMINATED'
  )),

  -- Task Context
  current_scope_id TEXT,
  assigned_task TEXT,
  assigned_at TEXT,

  -- Session Recovery
  checkpoint_state TEXT,
  checkpoint_token TEXT,

  -- Metrics
  tokens_used INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  wu_consumed REAL DEFAULT 0,
  start_time TEXT,
  end_time TEXT,

  -- Hierarchy
  parent_agent_id TEXT REFERENCES agent_instances(id) ON DELETE SET NULL,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_agents_project ON agent_instances(project_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agent_instances(status);
CREATE INDEX IF NOT EXISTS idx_agents_type ON agent_instances(agent_type);
CREATE INDEX IF NOT EXISTS idx_agents_parent ON agent_instances(parent_agent_id);

-- =============================================================================
-- 4. AGENT TASKS (task queue + Worker-Auditor loop)
-- =============================================================================

CREATE TABLE IF NOT EXISTS agent_tasks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scope_id TEXT,
  deliverable_id TEXT,

  -- Task Definition
  task_type TEXT NOT NULL CHECK (task_type IN (
    'CODE_GENERATION', 'API_TEST', 'FILE_CREATE', 'FILE_UPDATE',
    'DATABASE_MIGRATION', 'DEPLOYMENT', 'DOCUMENTATION',
    'QUALITY_CHECK', 'SECURITY_SCAN', 'RESEARCH', 'ANALYSIS'
  )),
  task_description TEXT NOT NULL,
  acceptance_criteria TEXT,

  -- Execution Mode
  execution_mode TEXT NOT NULL DEFAULT 'AUTONOMOUS' CHECK (execution_mode IN (
    'AUTONOMOUS', 'USER_GUIDED', 'HYBRID'
  )),

  -- Status
  status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN (
    'QUEUED', 'ASSIGNED', 'IN_PROGRESS', 'AWAITING_AUDIT',
    'AWAITING_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED', 'FAILED'
  )),

  -- Assignment
  assigned_agent_id TEXT REFERENCES agent_instances(id) ON DELETE SET NULL,
  assigned_at TEXT,

  -- Worker-Auditor Loop
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  worker_output TEXT,
  audit_report TEXT,
  confidence_score REAL,

  -- Readiness (Mathematical Governance)
  logic_score REAL DEFAULT 0,
  procedural_score REAL DEFAULT 0,
  validation_score REAL DEFAULT 0,
  readiness_score REAL DEFAULT 0,

  -- Dependencies (DAG)
  depends_on TEXT,
  blocks TEXT,

  -- Results
  result_artifacts TEXT,
  error_message TEXT,

  -- Approval
  approved_by TEXT REFERENCES users(id),
  approved_at TEXT,
  approval_notes TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  started_at TEXT,
  completed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON agent_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON agent_tasks(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_scope ON agent_tasks(scope_id);
CREATE INDEX IF NOT EXISTS idx_tasks_readiness ON agent_tasks(readiness_score);
