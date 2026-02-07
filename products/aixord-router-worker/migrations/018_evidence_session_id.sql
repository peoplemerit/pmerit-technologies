-- migrations/018_evidence_session_id.sql
-- Add session_id to github_evidence for per-session evidence attribution
-- Session 24: Enables Reconciliation Triad per session
-- Created: 2026-02-07

-- Add nullable session_id column (existing records unaffected)
ALTER TABLE github_evidence ADD COLUMN session_id TEXT REFERENCES project_sessions(id);

-- Index for querying evidence by session
CREATE INDEX IF NOT EXISTS idx_evidence_session ON github_evidence(session_id);
