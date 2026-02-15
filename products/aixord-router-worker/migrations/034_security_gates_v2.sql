-- Migration 034: Security Gates v2 — Resource-level Classification + Secret Audit
-- HANDOFF-CGC-01 GAP-2: GS:DC, GS:DP, GS:AI, GS:JR, GS:RT, GS:SA
-- Extends existing project-level data_classification (migration 009) with
-- resource-level classification and secret access audit logging.

-- Resource-level security classification (GS:DC at granular level)
CREATE TABLE IF NOT EXISTS security_classifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('SCOPE', 'DELIVERABLE', 'MESSAGE', 'FILE')),
  resource_id TEXT NOT NULL,

  -- GS:DC (Data Classification)
  classification TEXT NOT NULL CHECK (classification IN ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED')),
  classification_reason TEXT,
  classified_by TEXT REFERENCES users(id),
  classified_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- GS:AI (AI Exposure Control)
  ai_exposure_allowed INTEGER NOT NULL DEFAULT 1,
  ai_model_restrictions TEXT,

  -- GS:JR (Jurisdiction Review)
  data_residency TEXT,
  jurisdiction_reviewed INTEGER NOT NULL DEFAULT 0,
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TEXT,

  -- GS:RT (Retention Enforcement)
  retention_policy TEXT CHECK (retention_policy IN ('7_DAYS', '30_DAYS', '90_DAYS', '1_YEAR', '7_YEARS', 'PERMANENT')),
  retention_expires_at TEXT,

  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  UNIQUE(project_id, resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_security_class_project ON security_classifications(project_id);
CREATE INDEX IF NOT EXISTS idx_security_class_type ON security_classifications(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_security_class_level ON security_classifications(classification);

-- GS:SA (Secret Audit) — Track secret/API key access
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

CREATE INDEX IF NOT EXISTS idx_secret_audit_project ON secret_access_log(project_id);
CREATE INDEX IF NOT EXISTS idx_secret_audit_key ON secret_access_log(secret_key);
CREATE INDEX IF NOT EXISTS idx_secret_audit_time ON secret_access_log(accessed_at);
