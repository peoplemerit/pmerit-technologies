-- Migration 029: Rate Limiting Table
-- Creates table for tracking request rates per user/IP

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,
  window_key TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (key, window_key)
);

-- Index for cleanup operations
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup ON rate_limits(created_at);
