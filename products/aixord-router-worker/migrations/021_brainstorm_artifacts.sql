-- Migration 021: Brainstorm Artifacts
-- HANDOFF-VD-CI-01 Task A1: Structured brainstorm output storage
--
-- Stores the structured artifact generated during BRAINSTORM phase.
-- Each project can have multiple versions (drafts → finalized).

CREATE TABLE IF NOT EXISTS brainstorm_artifacts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  options TEXT NOT NULL DEFAULT '[]',
  assumptions TEXT NOT NULL DEFAULT '[]',
  decision_criteria TEXT NOT NULL DEFAULT '{}',
  kill_conditions TEXT NOT NULL DEFAULT '[]',
  recommendation TEXT DEFAULT 'NO_SELECTION',
  generated_by TEXT NOT NULL DEFAULT 'ai',
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Index for fast lookup by project
CREATE INDEX IF NOT EXISTS idx_brainstorm_artifacts_project
  ON brainstorm_artifacts(project_id, version DESC);
