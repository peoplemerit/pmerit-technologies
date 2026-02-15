-- Migration 037: Agent Audit Log — Worker-Auditor Multi-Agent Architecture
-- HANDOFF-CGC-01 GAP-1: Comprehensive agent event tracking
-- Logs all agent lifecycle events, HITL decisions, and resource consumption

CREATE TABLE IF NOT EXISTS agent_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES agent_instances(id) ON DELETE SET NULL,
  task_id TEXT REFERENCES agent_tasks(id) ON DELETE SET NULL,

  event_type TEXT NOT NULL CHECK (event_type IN (
    'AGENT_CREATED', 'AGENT_STARTED', 'AGENT_PAUSED', 'AGENT_RESUMED',
    'AGENT_COMPLETED', 'AGENT_FAILED', 'AGENT_TERMINATED',
    'TASK_ASSIGNED', 'TASK_STARTED', 'TASK_CHECKPOINT', 'TASK_COMPLETED',
    'TASK_FAILED', 'TASK_RETRIED',
    'AUDIT_REQUESTED', 'AUDIT_PASSED', 'AUDIT_FAILED',
    'APPROVAL_REQUESTED', 'APPROVAL_GRANTED', 'APPROVAL_DENIED',
    'HITL_INVOKED', 'HITL_RESOLVED',
    'WU_CONSUMED', 'TOKEN_CONSUMED', 'COST_INCURRED'
  )),

  event_data TEXT,

  -- Agent Hierarchy Context
  supervisor_id TEXT REFERENCES agent_instances(id),
  worker_id TEXT REFERENCES agent_instances(id),
  auditor_id TEXT REFERENCES agent_instances(id),

  -- Human Decision Record (for HITL events)
  human_actor_id TEXT REFERENCES users(id),
  human_decision TEXT,
  human_feedback TEXT,

  -- Performance Metrics
  latency_ms INTEGER,
  tokens_in INTEGER,
  tokens_out INTEGER,
  cost_usd REAL,
  wu_delta REAL,

  -- Security Context
  security_classification TEXT CHECK (security_classification IN ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED')),

  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_agent_audit_project ON agent_audit_log(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_audit_agent ON agent_audit_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_audit_task ON agent_audit_log(task_id);
CREATE INDEX IF NOT EXISTS idx_agent_audit_type ON agent_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_agent_audit_time ON agent_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_audit_human ON agent_audit_log(human_actor_id);
