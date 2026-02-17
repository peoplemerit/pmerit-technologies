-- Migration 045: Root Cause Doctrine Phase 2 — Structural Enforcement
-- D79: Swiss Cheese Model root cause categorization + recurrence tracking
-- Created: 2026-02-16
-- Purpose: Persist root cause analysis from AI auditor, track recurrence across audits,
--          enable L-RCD governance enforcement blocking phase transitions when
--          recurring CRITICAL/HIGH root causes go unaddressed.

-- Add root cause fields to audit_findings
ALTER TABLE audit_findings ADD COLUMN root_cause TEXT;
ALTER TABLE audit_findings ADD COLUMN root_cause_category TEXT
  CHECK (root_cause_category IN ('INTEGRITY','VALIDATION','ISOLATION','OBSERVABILITY','PROCESS','DESIGN'));
ALTER TABLE audit_findings ADD COLUMN is_symptom INTEGER NOT NULL DEFAULT 0;

-- Root cause registry: tracks unique root causes across audits for recurrence detection
CREATE TABLE IF NOT EXISTS root_cause_registry (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  project_id TEXT NOT NULL,
  signature TEXT NOT NULL,
  canonical_description TEXT NOT NULL,
  category TEXT CHECK (category IN ('INTEGRITY','VALIDATION','ISOLATION','OBSERVABILITY','PROCESS','DESIGN')),
  first_seen_audit_id INTEGER NOT NULL,
  last_seen_audit_id INTEGER NOT NULL,
  occurrence_count INTEGER NOT NULL DEFAULT 1,
  max_severity TEXT DEFAULT 'LOW',
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','ADDRESSED','ACCEPTED')),
  resolution_commit TEXT,
  resolution_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (first_seen_audit_id) REFERENCES agent_audit_log(id) ON DELETE CASCADE,
  FOREIGN KEY (last_seen_audit_id) REFERENCES agent_audit_log(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rcr_project ON root_cause_registry(project_id);
CREATE INDEX IF NOT EXISTS idx_rcr_signature ON root_cause_registry(project_id, signature);
CREATE INDEX IF NOT EXISTS idx_rcr_status ON root_cause_registry(status);
CREATE INDEX IF NOT EXISTS idx_af_root_cause_cat ON audit_findings(root_cause_category);
CREATE INDEX IF NOT EXISTS idx_af_is_symptom ON audit_findings(is_symptom);

CREATE TRIGGER IF NOT EXISTS update_rcr_timestamp
AFTER UPDATE ON root_cause_registry
FOR EACH ROW BEGIN
  UPDATE root_cause_registry SET updated_at = datetime('now') WHERE id = NEW.id;
END;
