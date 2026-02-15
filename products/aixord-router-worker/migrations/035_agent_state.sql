-- Migration 035: Agent State — Worker-Auditor Multi-Agent Architecture
-- HANDOFF-CGC-01 GAP-1: Agent Instances
-- Tracks all agent instances (SUPERVISOR, WORKER, AUDITOR) in the system

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
