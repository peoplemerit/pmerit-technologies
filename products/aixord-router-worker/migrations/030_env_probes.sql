-- Migration 030: Environment Probes table
-- Used by POST /workspace/confirm-test to verify D1 write capability.
-- Rows are inserted and immediately deleted during probe execution.

CREATE TABLE IF NOT EXISTS env_probes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
