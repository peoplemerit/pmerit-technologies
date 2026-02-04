-- migrations/011_trial_and_metering.sql
-- H1: Time-limited trial + H2: Usage metering
-- Created: 2026-02-02
-- Per HANDOFF-D4-COMPREHENSIVE-V12

-- Add trial expiration to users
ALTER TABLE users ADD COLUMN trial_expires_at TEXT;

-- Add usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  period TEXT NOT NULL,          -- YYYY-MM format
  request_count INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  estimated_cost_cents INTEGER DEFAULT 0,
  code_task_count INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, period)
);

CREATE INDEX IF NOT EXISTS idx_usage_user_period ON usage_tracking(user_id, period);
