-- Migration 032: Artifact Commit Layer + Scaffold Count Reporting
-- Implements L-AB (Artifact Binding Law) mandatory persistence tracking
-- Also adds scaffold count columns for accurate reporting (Gap 2)

-- ============================================================================
-- Table: artifact_commits
-- Records each artifact commit (write) event with SHA256 hashes for integrity
-- ============================================================================

CREATE TABLE IF NOT EXISTS artifact_commits (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Commit metadata
  commit_type TEXT NOT NULL DEFAULT 'MANUAL',  -- MANUAL | SCAFFOLD | AUTO
  file_count INTEGER NOT NULL DEFAULT 0,
  total_bytes INTEGER NOT NULL DEFAULT 0,

  -- Integrity evidence (L-AB3: SHA256 hashes)
  files_manifest TEXT NOT NULL DEFAULT '[]',  -- JSON array of { path, sha256, bytes, action }
  commit_hash TEXT,                           -- Overall SHA256 of manifest

  -- Status
  status TEXT NOT NULL DEFAULT 'COMMITTED',   -- COMMITTED | VERIFIED | FAILED

  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  verified_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_artifact_commits_project
  ON artifact_commits(project_id);

CREATE INDEX IF NOT EXISTS idx_artifact_commits_session
  ON artifact_commits(session_id);

-- ============================================================================
-- Scaffold count columns on workspace_bindings (Gap 2)
-- Persists ScaffoldResult.created/skipped/errors for accurate count reporting
-- ============================================================================

ALTER TABLE workspace_bindings ADD COLUMN scaffold_item_count INTEGER DEFAULT 0;
ALTER TABLE workspace_bindings ADD COLUMN scaffold_skipped_count INTEGER DEFAULT 0;
ALTER TABLE workspace_bindings ADD COLUMN scaffold_error_count INTEGER DEFAULT 0;
ALTER TABLE workspace_bindings ADD COLUMN scaffold_paths_written TEXT DEFAULT '[]';
ALTER TABLE workspace_bindings ADD COLUMN scaffold_generated_at TEXT;
