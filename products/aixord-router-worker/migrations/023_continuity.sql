-- Migration 023: Project Continuity Capsule (HANDOFF-PCC-01)
--
-- Adds:
-- 1. decision_ledger.summary — one-line decision summary for continuity display
-- 2. decision_ledger.supersedes_decision_id — chain superseded decisions
-- 3. continuity_pins — Director-curated pinned items for continuity context

-- ============================================================================
-- 1. Extend decision_ledger
-- ============================================================================

ALTER TABLE decision_ledger ADD COLUMN summary TEXT;
ALTER TABLE decision_ledger ADD COLUMN supersedes_decision_id TEXT;

-- ============================================================================
-- 2. Continuity Pins — Director-curated context items
-- ============================================================================

CREATE TABLE IF NOT EXISTS continuity_pins (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  pin_type TEXT NOT NULL CHECK (pin_type IN ('decision', 'artifact', 'constraint', 'session')),
  target_id TEXT NOT NULL,
  label TEXT,
  pinned_by TEXT NOT NULL,
  pinned_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE(project_id, pin_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_continuity_pins_project ON continuity_pins(project_id);
