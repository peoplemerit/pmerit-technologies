-- Migration 012: Image Metadata for Evidence (ENH-4: Path C)
-- Tracks image uploads stored in R2 bucket 'aixord-images'

CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  -- R2 object reference
  r2_key TEXT NOT NULL UNIQUE,

  -- File metadata
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,

  -- Evidence classification
  evidence_type TEXT DEFAULT 'GENERAL',  -- GENERAL | CHECKPOINT | GATE_PROOF | SCREENSHOT | DIAGRAM
  caption TEXT,

  -- Optional link to a specific checkpoint/decision
  checkpoint_id TEXT,
  decision_id TEXT,

  -- Audit
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index: list images by project (most common query)
CREATE INDEX IF NOT EXISTS idx_images_project ON images(project_id, created_at DESC);

-- Index: list images by user
CREATE INDEX IF NOT EXISTS idx_images_user ON images(user_id, created_at DESC);

-- Index: filter by evidence type within a project
CREATE INDEX IF NOT EXISTS idx_images_evidence ON images(project_id, evidence_type);
