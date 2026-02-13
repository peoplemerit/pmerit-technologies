-- ============================================================================
-- Migration 031: Mathematical Governance Integration
-- ============================================================================
-- Implements quantitative governance formulas:
--   - WU (Work Unit) conservation: EXECUTION_TOTAL = FORMULA_EXECUTION + VERIFIED_REALITY
--   - Readiness metric: R = L × P × V (Logic × Procedural × Validation)
--   - DMAIC phase tracking on deliverables (V component mapping)
--   - WU audit trail for conservation enforcement
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1A. Add WU + Readiness columns to blueprint_scopes
-- ----------------------------------------------------------------------------
ALTER TABLE blueprint_scopes ADD COLUMN allocated_wu REAL DEFAULT 0;
ALTER TABLE blueprint_scopes ADD COLUMN verified_wu REAL DEFAULT 0;
ALTER TABLE blueprint_scopes ADD COLUMN logic_score REAL DEFAULT 0;
ALTER TABLE blueprint_scopes ADD COLUMN procedural_score REAL DEFAULT 0;
ALTER TABLE blueprint_scopes ADD COLUMN validation_score REAL DEFAULT 0;

-- ----------------------------------------------------------------------------
-- 1B. Add WU Conservation columns to projects
-- EXECUTION_TOTAL = FORMULA_EXECUTION + VERIFIED_REALITY (conservation law)
-- ----------------------------------------------------------------------------
ALTER TABLE projects ADD COLUMN execution_total_wu REAL DEFAULT 0;
ALTER TABLE projects ADD COLUMN formula_execution_wu REAL DEFAULT 0;
ALTER TABLE projects ADD COLUMN verified_reality_wu REAL DEFAULT 0;

-- ----------------------------------------------------------------------------
-- 1C. WU Audit Trail
-- Every WU event is logged with a full conservation snapshot.
-- This is the source-of-truth for governance auditing.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wu_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  scope_id TEXT,
  event_type TEXT NOT NULL
    CHECK (event_type IN (
      'WU_ALLOCATED',       -- WU assigned to a scope
      'WU_TRANSFERRED',     -- WU moved from FORMULA → VERIFIED (scope verified)
      'WU_ADJUSTED',        -- Manual adjustment by Director
      'WU_DEALLOCATED',     -- WU removed from a scope
      'CONSERVATION_CHECK', -- Periodic or finalization conservation audit
      'READINESS_COMPUTED'  -- R score computed and stored
    )),
  wu_amount REAL NOT NULL DEFAULT 0,
  readiness_score REAL,
  logic_score REAL,
  procedural_score REAL,
  validation_score REAL,
  -- Conservation snapshot at time of event
  snapshot_total REAL,
  snapshot_formula REAL,
  snapshot_verified REAL,
  conservation_valid INTEGER,  -- 1 if |total - (formula + verified)| < 0.01
  actor_id TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (scope_id) REFERENCES blueprint_scopes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_wu_audit_project ON wu_audit_log(project_id);
CREATE INDEX IF NOT EXISTS idx_wu_audit_event ON wu_audit_log(project_id, event_type);

-- ----------------------------------------------------------------------------
-- 1D. Add DMAIC Phase to blueprint_deliverables (V component mapping)
-- V = 0.2 (DEFINE), 0.4 (MEASURE), 0.6 (ANALYZE), 0.8 (IMPROVE), 1.0 (CONTROL)
-- ----------------------------------------------------------------------------
ALTER TABLE blueprint_deliverables ADD COLUMN dmaic_phase TEXT DEFAULT 'DEFINE';
ALTER TABLE blueprint_deliverables ADD COLUMN wu_weight REAL DEFAULT 1.0;
