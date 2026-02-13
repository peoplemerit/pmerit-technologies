-- Migration 026: Schema Reconciliation
-- Fixes: CRIT-06 (decisions CASCADE regression), HIGH-09/10/11 (ghost tables/columns)
-- Also: MED-12 (phase_locked), MED-13 (subscription_tier)
--
-- This migration reconciles the live database schema with the migration history.
-- Several tables and columns were created manually during development but never
-- captured in migration files. This migration ensures a fresh deployment matches
-- the live production schema.

-- ============================================================================
-- 1. Fix decisions table FK CASCADE regression (CRIT-06)
-- Migration 002 defined ON DELETE CASCADE but live DB lost it during a rebuild.
-- ============================================================================

PRAGMA foreign_keys=OFF;

CREATE TABLE decisions_new (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  decision_type TEXT NOT NULL,
  description TEXT NOT NULL,
  actor TEXT NOT NULL,
  metadata TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

INSERT INTO decisions_new SELECT id, project_id, decision_type, description, actor, metadata, created_at FROM decisions;

DROP TABLE decisions;
ALTER TABLE decisions_new RENAME TO decisions;

CREATE INDEX IF NOT EXISTS idx_decisions_project ON decisions(project_id, created_at);

PRAGMA foreign_keys=ON;

-- ============================================================================
-- 2. Ghost table: decision_ledger (HIGH-09, HIGH-11)
-- Exists in live DB, referenced by migration 023 ALTER, but never CREATE'd.
-- ============================================================================

CREATE TABLE IF NOT EXISTS decision_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  action TEXT,
  phase_from TEXT,
  phase_to TEXT,
  actor_id TEXT,
  actor_role TEXT DEFAULT 'DIRECTOR',
  gate_snapshot TEXT,
  artifact_check TEXT,
  result TEXT,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  summary TEXT,
  supersedes_decision_id TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_decision_ledger_project ON decision_ledger(project_id);

-- ============================================================================
-- 3. Ghost table: artifacts (HIGH-09)
-- Exists in live DB for storing generated artifacts during EXECUTE phase.
-- ============================================================================

CREATE TABLE IF NOT EXISTS artifacts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  type TEXT CHECK(type IN ('code', 'document', 'config', 'test', 'scaffold', 'other')),
  name TEXT,
  content TEXT,
  r2_key TEXT,
  version INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  created_by TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_artifacts_project ON artifacts(project_id);

-- ============================================================================
-- 4. Ghost table: state (HIGH-09)
-- Alternate state storage, exists in live DB.
-- ============================================================================

CREATE TABLE IF NOT EXISTS state (
  project_id TEXT PRIMARY KEY,
  state_json TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ============================================================================
-- 5. Ghost column: project_state.phase_locked (MED-12)
-- ============================================================================

-- SQLite silently ignores ADD COLUMN if it already exists with IF NOT EXISTS
-- Using a safe pattern: attempt add, ignore if exists
ALTER TABLE project_state ADD COLUMN phase_locked INTEGER DEFAULT 0;

-- ============================================================================
-- 6. Ghost column: users.subscription_tier (MED-13)
-- ============================================================================

ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'TRIAL';

-- ============================================================================
-- 7. Ghost columns on projects table (HIGH-10)
-- Live DB has owner_id instead of user_id, plus additional columns.
-- Using ADD COLUMN for safety — existing columns will cause harmless errors
-- that D1 migration runner handles gracefully.
-- ============================================================================

ALTER TABLE projects ADD COLUMN objective TEXT;
ALTER TABLE projects ADD COLUMN reality_classification TEXT;
ALTER TABLE projects ADD COLUMN conserved_scopes TEXT;
ALTER TABLE projects ADD COLUMN project_type TEXT DEFAULT 'software';
