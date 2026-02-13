-- Migration 027: Fix user-referencing FK CASCADE gaps (MED-10, MED-14)
-- Changes RESTRICT to SET NULL on user-referencing FKs to allow GDPR erasure.
-- Also fixes github_evidence.session_id FK to allow session deletion.

-- ============================================================================
-- 1. Rebuild images table: user_id FK -> SET NULL (MED-10 / G2)
-- ============================================================================

PRAGMA foreign_keys=OFF;

CREATE TABLE images_new (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT,
  r2_key TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  evidence_type TEXT DEFAULT 'GENERAL',
  caption TEXT,
  checkpoint_id TEXT,
  decision_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO images_new SELECT * FROM images;
DROP TABLE images;
ALTER TABLE images_new RENAME TO images;

CREATE INDEX IF NOT EXISTS idx_images_project ON images(project_id);
CREATE INDEX IF NOT EXISTS idx_images_user ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_evidence_type ON images(evidence_type);

-- ============================================================================
-- 2. Rebuild knowledge_artifacts: created_by, approved_by -> SET NULL (G3, G4)
-- ============================================================================

CREATE TABLE knowledge_artifacts_new (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('ADR', 'SOW', 'FAQ', 'NOTE', 'LESSON', 'REFERENCE')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'ARCHIVED')),
  created_by TEXT,
  approved_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO knowledge_artifacts_new SELECT * FROM knowledge_artifacts;
DROP TABLE knowledge_artifacts;
ALTER TABLE knowledge_artifacts_new RENAME TO knowledge_artifacts;

CREATE INDEX IF NOT EXISTS idx_knowledge_project ON knowledge_artifacts(project_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_type ON knowledge_artifacts(artifact_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_status ON knowledge_artifacts(status);

-- ============================================================================
-- 3. Rebuild github_evidence: session_id FK -> SET NULL (MED-14 / G9)
-- ============================================================================

CREATE TABLE github_evidence_new (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  evidence_type TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  status TEXT DEFAULT 'PENDING',
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  session_id TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES project_sessions(id) ON DELETE SET NULL
);

INSERT INTO github_evidence_new SELECT * FROM github_evidence;
DROP TABLE github_evidence;
ALTER TABLE github_evidence_new RENAME TO github_evidence;

CREATE INDEX IF NOT EXISTS idx_evidence_project ON github_evidence(project_id);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON github_evidence(evidence_type);
CREATE INDEX IF NOT EXISTS idx_evidence_session ON github_evidence(session_id);

PRAGMA foreign_keys=ON;

-- ============================================================================
-- 4. Add FKs to orphan-risk tables (MED-11)
-- subscriptions, usage, usage_tracking have NO FK to users
-- Cannot add FK constraint to existing table in SQLite without rebuild.
-- For now, add indexes to support JOIN queries. Full FK enforcement
-- would require table rebuilds which risk data loss on these billing tables.
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_user ON usage(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user ON usage_tracking(user_id);
