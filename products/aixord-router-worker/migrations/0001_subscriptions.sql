-- Subscriptions table
-- Tracks user subscription status
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('TRIAL', 'MANUSCRIPT_BYOK', 'BYOK_STANDARD', 'PLATFORM_STANDARD', 'PLATFORM_PRO', 'ENTERPRISE')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  gumroad_sale_id TEXT,
  kdp_code TEXT,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- Usage tracking table
-- Tracks per-user usage within billing periods
CREATE TABLE IF NOT EXISTS usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  requests_used INTEGER NOT NULL DEFAULT 0,
  tokens_input INTEGER NOT NULL DEFAULT 0,
  tokens_output INTEGER NOT NULL DEFAULT 0,
  cost_usd REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_usage_user_period ON usage(user_id, period_end);

-- Audit log table
-- Tracks all router executions for observability
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  product TEXT NOT NULL,
  tier TEXT NOT NULL,
  intent TEXT NOT NULL,
  mode TEXT NOT NULL,
  model_class TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd REAL NOT NULL,
  latency_ms INTEGER NOT NULL,
  status TEXT NOT NULL,
  fallbacks INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_project ON audit_log(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
