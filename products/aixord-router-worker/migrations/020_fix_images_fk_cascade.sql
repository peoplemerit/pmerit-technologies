-- Migration 020: Fix images table FK to include ON DELETE CASCADE
-- The images table was created in migration 012 without CASCADE on project_id FK.
-- This caused DELETE FROM projects to fail with FK constraint errors.
-- Also fixes github_evidence.session_id FK (same issue as migration 019 for messages).

-- Step 1: Rebuild images table with proper CASCADE
PRAGMA foreign_keys=OFF;

CREATE TABLE images_new (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
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
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO images_new SELECT * FROM images;
DROP TABLE images;
ALTER TABLE images_new RENAME TO images;

CREATE INDEX IF NOT EXISTS idx_images_project ON images(project_id);
CREATE INDEX IF NOT EXISTS idx_images_user ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_evidence_type ON images(evidence_type);

PRAGMA foreign_keys=ON;
