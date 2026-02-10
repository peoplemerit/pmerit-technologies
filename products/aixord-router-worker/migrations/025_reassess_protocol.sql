-- Migration 025: REASSESS Protocol (HANDOFF-GFB-01 Task 3)
--
-- Adds governed friction to phase regression:
-- Level 1: Surgical Fix (same kingdom, reason required)
-- Level 2: Major Pivot (cross kingdom, artifacts superseded)
-- Level 3: Fresh Start (3rd+ reassessment, mandatory review)

-- Track reassessment count per project
ALTER TABLE project_state ADD COLUMN reassess_count INTEGER DEFAULT 0;

-- Reassessment log for pattern detection and audit
CREATE TABLE IF NOT EXISTS reassessment_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  phase_from TEXT NOT NULL,
  phase_to TEXT NOT NULL,
  reason TEXT NOT NULL,
  review_summary TEXT,
  artifact_impact TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reassessment_project ON reassessment_log(project_id);
