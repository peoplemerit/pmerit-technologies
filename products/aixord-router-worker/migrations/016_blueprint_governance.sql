-- ============================================================================
-- Migration 016: Blueprint Governance (AIXORD v4.5 — L-BPX, L-IVL)
-- ============================================================================
-- Implements post-Blueprint governance:
--   - blueprint_scopes: 3-tier structure (Scopes → Sub-Scopes) per L-BPX2
--   - blueprint_deliverables: Atomic execution units with DoD per L-BPX4-5
--   - blueprint_integrity_reports: 5-check validation results per L-IVL
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: blueprint_scopes
-- Scopes (tier 1) and Sub-Scopes (tier 2) — L-BPX2, L-BPX3
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blueprint_scopes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  parent_scope_id TEXT,                     -- NULL = top-level scope, non-NULL = sub-scope
  tier INTEGER NOT NULL DEFAULT 1           -- 1 = Scope, 2 = Sub-Scope
    CHECK (tier IN (1, 2)),
  name TEXT NOT NULL,
  purpose TEXT,                             -- Why this scope exists
  boundary TEXT,                            -- What is in/out of scope
  assumptions TEXT DEFAULT '[]',            -- JSON array of assumption strings
  assumption_status TEXT DEFAULT 'OPEN'     -- OPEN | CONFIRMED | UNKNOWN
    CHECK (assumption_status IN ('OPEN', 'CONFIRMED', 'UNKNOWN')),
  inputs TEXT,                              -- What this scope receives
  outputs TEXT,                             -- What this scope produces
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETE', 'CANCELLED')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_scope_id) REFERENCES blueprint_scopes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bp_scopes_project ON blueprint_scopes(project_id);
CREATE INDEX IF NOT EXISTS idx_bp_scopes_parent ON blueprint_scopes(parent_scope_id);
CREATE INDEX IF NOT EXISTS idx_bp_scopes_tier ON blueprint_scopes(project_id, tier);

-- ----------------------------------------------------------------------------
-- Table: blueprint_deliverables
-- Atomic execution units with dependencies and DoD — L-BPX4, L-BPX5, L-BPX7
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blueprint_deliverables (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  scope_id TEXT NOT NULL,                   -- Must belong to a scope (tier 1 or 2)
  name TEXT NOT NULL,
  description TEXT,

  -- Dependencies (L-BPX4)
  upstream_deps TEXT DEFAULT '[]',          -- JSON array of deliverable IDs
  downstream_deps TEXT DEFAULT '[]',        -- JSON array of deliverable IDs
  dependency_type TEXT DEFAULT 'hard'
    CHECK (dependency_type IN ('hard', 'soft')),

  -- Definition of Done (L-BPX5)
  dod_evidence_spec TEXT,                   -- What evidence proves completion
  dod_verification_method TEXT,             -- How to verify (manual, automated, review)
  dod_quality_bar TEXT,                     -- Minimum quality threshold
  dod_failure_modes TEXT,                   -- Known ways this can fail

  -- Execution tracking
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'READY', 'IN_PROGRESS', 'DONE', 'VERIFIED', 'LOCKED', 'BLOCKED', 'CANCELLED')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (scope_id) REFERENCES blueprint_scopes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bp_deliverables_project ON blueprint_deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_bp_deliverables_scope ON blueprint_deliverables(scope_id);
CREATE INDEX IF NOT EXISTS idx_bp_deliverables_status ON blueprint_deliverables(project_id, status);

-- ----------------------------------------------------------------------------
-- Table: blueprint_integrity_reports
-- L-IVL validation results — 5 mandatory checks before EXECUTE entry
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blueprint_integrity_reports (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,

  -- Check 1: Formula Integrity (L-IVL1.1)
  check_formula INTEGER NOT NULL DEFAULT 0,
  check_formula_detail TEXT,

  -- Check 2: Structural Completeness (L-IVL1.2)
  check_structural INTEGER NOT NULL DEFAULT 0,
  check_structural_detail TEXT,

  -- Check 3: DAG Soundness (L-IVL1.3)
  check_dag INTEGER NOT NULL DEFAULT 0,
  check_dag_detail TEXT,

  -- Check 4: Deliverable Integrity (L-IVL1.4)
  check_deliverable INTEGER NOT NULL DEFAULT 0,
  check_deliverable_detail TEXT,

  -- Check 5: Assumption Closure (L-IVL1.5)
  check_assumption INTEGER NOT NULL DEFAULT 0,
  check_assumption_detail TEXT,

  -- Overall result
  all_passed INTEGER NOT NULL DEFAULT 0,    -- 1 if all 5 checks pass
  total_scopes INTEGER DEFAULT 0,
  total_subscopes INTEGER DEFAULT 0,
  total_deliverables INTEGER DEFAULT 0,
  total_dependencies INTEGER DEFAULT 0,

  -- Audit
  run_by TEXT NOT NULL,
  run_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bp_integrity_project ON blueprint_integrity_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_bp_integrity_passed ON blueprint_integrity_reports(project_id, all_passed);
