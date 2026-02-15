-- Migration 040: Structured Finding Management
-- HANDOFF-MOSA-AUDIT-01 Phase 2A: Inter-Operative Audit Pattern
-- Created: 2026-02-15
-- Purpose: Support structured audit findings with triage workflow

CREATE TABLE IF NOT EXISTS audit_findings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  audit_id INTEGER NOT NULL,
  finding_type TEXT NOT NULL CHECK (finding_type IN (
    'CODE_BUG',
    'DOC_STALE',
    'DOC_INACCURATE',
    'SECURITY_VULN',
    'PERFORMANCE',
    'BEST_PRACTICE',
    'TECH_DEBT',
    'STYLE_VIOLATION'
  )),
  severity TEXT NOT NULL CHECK (severity IN (
    'CRITICAL',
    'HIGH',
    'MEDIUM',
    'LOW',
    'INFO'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  file_path TEXT,
  line_number INTEGER,
  code_snippet TEXT,
  recommendation TEXT,

  disposition TEXT NOT NULL DEFAULT 'PENDING' CHECK (disposition IN (
    'PENDING',
    'FIX',
    'ACCEPT',
    'DEFER',
    'INVALID'
  )),
  disposition_reason TEXT,
  triaged_by TEXT,
  triaged_at TEXT,

  fixed_in_commit TEXT,
  prior_audit_match TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (audit_id) REFERENCES agent_audit_log(id) ON DELETE CASCADE,
  FOREIGN KEY (triaged_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_findings_audit_id ON audit_findings(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_disposition ON audit_findings(disposition);
CREATE INDEX IF NOT EXISTS idx_audit_findings_severity ON audit_findings(severity);
CREATE INDEX IF NOT EXISTS idx_audit_findings_file_path ON audit_findings(file_path);
CREATE INDEX IF NOT EXISTS idx_audit_findings_prior_match ON audit_findings(prior_audit_match);

CREATE TRIGGER IF NOT EXISTS update_audit_findings_timestamp
AFTER UPDATE ON audit_findings
FOR EACH ROW
BEGIN
  UPDATE audit_findings SET updated_at = datetime('now') WHERE id = NEW.id;
END;
