-- Migration 036: Task Queue — Worker-Auditor Multi-Agent Architecture
-- HANDOFF-CGC-01 GAP-1: Agent Task Queue
-- Manages task lifecycle, Worker-Auditor loop, and HITL approvals

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
    'AUTONOMOUS',
    'USER_GUIDED',
    'HYBRID'
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

  -- Readiness (Mathematical Governance Integration)
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
