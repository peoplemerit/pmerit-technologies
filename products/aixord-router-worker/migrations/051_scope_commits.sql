-- Migration 051: Scope-level commit tracking (ENV-SYNC-01 Phase 3)
--
-- Adds scope_name and deliverable_id columns to github_commits table
-- so we can track which scope each commit belongs to.

ALTER TABLE github_commits ADD COLUMN scope_name TEXT;
ALTER TABLE github_commits ADD COLUMN deliverable_id TEXT;
