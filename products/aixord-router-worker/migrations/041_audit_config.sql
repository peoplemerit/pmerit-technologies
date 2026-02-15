-- Migration 041: Audit Configuration per Project
-- HANDOFF-MOSA-AUDIT-01 Phase 2A: Inter-Operative Audit Pattern
-- Created: 2026-02-15
-- Purpose: Configure cross-model audit settings per project

CREATE TABLE IF NOT EXISTS audit_config (
  project_id TEXT PRIMARY KEY,

  -- Model configuration
  worker_model TEXT NOT NULL DEFAULT 'openai:gpt-4o',
  auditor_model TEXT NOT NULL DEFAULT 'anthropic:claude-sonnet-4-20250514',

  -- Automation settings
  auto_audit_on_lock INTEGER DEFAULT 0,
  incremental_by_module INTEGER DEFAULT 1,

  -- Thresholds
  diminishing_returns_threshold INTEGER DEFAULT 5,
  critical_auto_halt INTEGER DEFAULT 1,
  high_severity_limit INTEGER DEFAULT 10,

  -- Context budget
  max_context_per_audit INTEGER DEFAULT 50000,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TRIGGER IF NOT EXISTS update_audit_config_timestamp
AFTER UPDATE ON audit_config
FOR EACH ROW
BEGIN
  UPDATE audit_config SET updated_at = datetime('now') WHERE project_id = NEW.project_id;
END;
