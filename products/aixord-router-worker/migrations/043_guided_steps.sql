-- Migration 043: Guided Steps — User-Guided Execution Mode
-- HANDOFF-CGC-01 GAP-1, Mode 2: AI plans, human executes, AI validates
--
-- When execution_mode = 'USER_GUIDED', the supervisor generates
-- step-by-step plans stored here. Humans execute each step and
-- submit evidence. The auditor AI validates each completion.

CREATE TABLE IF NOT EXISTS agent_guided_steps (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  task_id TEXT NOT NULL REFERENCES agent_tasks(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Step Definition
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  verification_criteria TEXT NOT NULL,
  estimated_minutes INTEGER,

  -- Step Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING',           -- Not started
    'IN_PROGRESS',       -- Human working on it
    'COMPLETED',         -- Human reported complete (awaiting validation)
    'VALIDATED',         -- AI confirmed completion
    'NEEDS_REVISION',    -- AI rejected — human needs to redo
    'SKIPPED'            -- Marked as not applicable
  )),

  -- Human Evidence
  user_evidence TEXT,     -- JSON: { description, type, url? }

  -- AI Validation
  ai_validation TEXT,     -- JSON: { passed, feedback, confidence }
  validated_at TEXT,
  completed_at TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  UNIQUE(task_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_guided_steps_task ON agent_guided_steps(task_id);
CREATE INDEX IF NOT EXISTS idx_guided_steps_project ON agent_guided_steps(project_id);
CREATE INDEX IF NOT EXISTS idx_guided_steps_status ON agent_guided_steps(status);
