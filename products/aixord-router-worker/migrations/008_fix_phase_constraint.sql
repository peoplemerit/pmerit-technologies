-- migrations/008_fix_phase_constraint.sql
-- P0 Fix: Remove CHECK constraint on project_state.phase
-- Created: 2026-02-01
-- Issue: CHECK constraint only allows ('B', 'P', 'E', 'R') but code uses full names like 'BRAINSTORM'

-- SQLite doesn't support ALTER TABLE to drop constraints
-- We need to recreate the table

-- Step 1: Create new table without the restrictive CHECK constraint
CREATE TABLE project_state_fixed (
  project_id TEXT PRIMARY KEY,
  phase TEXT DEFAULT 'BRAINSTORM',
  gates TEXT DEFAULT '{}',
  capsule TEXT DEFAULT '{}',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Step 2: Copy existing data, converting old short codes to full names
INSERT INTO project_state_fixed (project_id, phase, gates, capsule, updated_at)
SELECT
  project_id,
  CASE phase
    WHEN 'B' THEN 'BRAINSTORM'
    WHEN 'P' THEN 'PLANNING'
    WHEN 'E' THEN 'EXECUTION'
    WHEN 'R' THEN 'REVIEW'
    ELSE phase
  END,
  gates,
  capsule,
  updated_at
FROM project_state;

-- Step 3: Drop old table
DROP TABLE project_state;

-- Step 4: Rename new table to original name
ALTER TABLE project_state_fixed RENAME TO project_state;
