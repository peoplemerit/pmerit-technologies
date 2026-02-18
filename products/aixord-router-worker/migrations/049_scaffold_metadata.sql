-- Migration 049: Scaffold metadata support
-- CRIT-01/CRIT-02 fix: Index for scaffold artifact lookups
-- Reuses existing `artifacts` table (migration 026) with type='scaffold'

CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(project_id, type);

-- Also index artifacts by name for quick scaffold template lookups
CREATE INDEX IF NOT EXISTS idx_artifacts_project_name ON artifacts(project_id, name);
