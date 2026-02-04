-- migrations/004_model_selection_logs.sql
-- Model selection audit logs for PATCH-MOD-01
-- Created: 2026-02-01

-- Model selection logs (audit trail)
CREATE TABLE IF NOT EXISTS model_selection_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  intent TEXT NOT NULL,
  mode TEXT NOT NULL,
  tier TEXT NOT NULL,
  affinity_matched INTEGER NOT NULL DEFAULT 0,
  selected_provider TEXT NOT NULL,
  selected_model TEXT NOT NULL,
  rationale TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_selection_logs_timestamp ON model_selection_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_selection_logs_intent ON model_selection_logs(intent);
CREATE INDEX IF NOT EXISTS idx_selection_logs_provider ON model_selection_logs(selected_provider);
