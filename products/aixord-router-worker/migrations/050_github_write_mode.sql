-- Migration 050: GitHub Dual-Mode (READ_ONLY + WORKSPACE_SYNC)
--
-- Adds write-enabled GitHub mode for Software — Full Governance projects.
-- READ_ONLY mode (evidence-only) remains the default for backward compatibility.
-- WORKSPACE_SYNC mode enables: repo creation, scaffold commits, code pushes.

-- Add github_mode column to connections (scope column stays for backward compat)
ALTER TABLE github_connections ADD COLUMN github_mode TEXT NOT NULL DEFAULT 'READ_ONLY';

-- Track commits made by the platform (not user commits from evidence sync)
CREATE TABLE IF NOT EXISTS github_commits (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  branch TEXT NOT NULL,
  commit_sha TEXT NOT NULL,
  tree_sha TEXT NOT NULL,
  message TEXT NOT NULL,
  files_count INTEGER NOT NULL DEFAULT 0,
  committed_by TEXT NOT NULL,
  committed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  pr_number INTEGER,
  pr_url TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_github_commits_project ON github_commits(project_id, committed_at DESC);
