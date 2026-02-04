-- migrations/005_github_evidence.sql
-- GitHub Evidence Integration for HANDOFF-D4-GITHUB-EVIDENCE
-- Created: 2026-02-01
-- AIXORD v4.4 Patch: PATCH-GITHUB-01

-- ============================================================================
-- GitHub Connections (per project)
-- ============================================================================

CREATE TABLE IF NOT EXISTS github_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'READ_ONLY',
  connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_sync DATETIME,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- GitHub Evidence Records (EXTERNAL_EVIDENCE_LOG artifact)
-- ============================================================================

CREATE TABLE IF NOT EXISTS github_evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'GITHUB',

  -- Evidence classification
  evidence_type TEXT NOT NULL,           -- COMMIT, PR, RELEASE, CI_STATUS, ISSUE, MILESTONE
  triad_category TEXT NOT NULL,          -- PLANNED, CLAIMED, VERIFIED

  -- GitHub reference
  ref_id TEXT NOT NULL,                  -- commit SHA, PR number, release tag
  ref_url TEXT NOT NULL,                 -- Direct link to GitHub

  -- Verification status
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, VERIFIED, STALE, UNAVAILABLE
  verified_at DATETIME,
  stale_after DATETIME NOT NULL,          -- When evidence should be re-fetched

  -- Metadata (no sensitive content)
  title TEXT,                             -- PR title, commit message summary
  author TEXT,                            -- GitHub username
  evidence_timestamp DATETIME,            -- When created on GitHub

  -- Deliverable linking (optional)
  deliverable_id TEXT,                    -- Links to specific deliverable

  -- Audit trail
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE(project_id, source, evidence_type, ref_id)
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_github_conn_project ON github_connections(project_id);
CREATE INDEX IF NOT EXISTS idx_github_conn_user ON github_connections(user_id);

CREATE INDEX IF NOT EXISTS idx_evidence_project ON github_evidence(project_id);
CREATE INDEX IF NOT EXISTS idx_evidence_triad ON github_evidence(triad_category);
CREATE INDEX IF NOT EXISTS idx_evidence_status ON github_evidence(status);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON github_evidence(evidence_type);
CREATE INDEX IF NOT EXISTS idx_evidence_deliverable ON github_evidence(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_evidence_stale ON github_evidence(stale_after);

-- ============================================================================
-- User Assistance Mode Setting
-- ============================================================================

-- Add assistance_mode column to users table if not exists
-- Default: GUIDED (minimal GitHub visibility)
ALTER TABLE users ADD COLUMN assistance_mode TEXT DEFAULT 'GUIDED';

-- ============================================================================
-- OAuth State Storage (CSRF protection)
-- ============================================================================

CREATE TABLE IF NOT EXISTS oauth_states (
  state TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  expires_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);
