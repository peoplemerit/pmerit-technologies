-- Migration 044: Readiness Escalation — R-Threshold Auto-Escalation
-- HANDOFF-CGC-01 GAP-2: Automatic escalation when R crosses thresholds
--
-- Tracks escalation level changes and auto-actions triggered by
-- the readiness scoring engine.
-- NOTE: Uses readiness_escalation_log (not escalation_log, which is for task assignments)

-- Add escalation_level column to project_state
ALTER TABLE project_state ADD COLUMN escalation_level TEXT DEFAULT NULL;

-- Readiness escalation event log
CREATE TABLE IF NOT EXISTS readiness_escalation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Escalation transition
  from_level TEXT NOT NULL,    -- CRITICAL | AT_RISK | PROGRESSING | STAGING | READY | NONE
  to_level TEXT NOT NULL,      -- CRITICAL | AT_RISK | PROGRESSING | STAGING | READY
  project_r REAL NOT NULL,     -- R score at time of escalation

  -- Auto-actions taken
  auto_actions TEXT,           -- JSON array of action IDs executed
  gates_flipped TEXT,          -- JSON array of gate IDs auto-flipped

  -- Actor
  actor_id TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_r_escalation_project ON readiness_escalation_log(project_id);
CREATE INDEX IF NOT EXISTS idx_r_escalation_level ON readiness_escalation_log(to_level);
CREATE INDEX IF NOT EXISTS idx_r_escalation_time ON readiness_escalation_log(created_at);
