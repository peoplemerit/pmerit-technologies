-- M-2: Persist circuit breaker state across Worker isolates / cold starts
-- One row per provider. Updated on state transitions only (not every request).

CREATE TABLE IF NOT EXISTS circuit_breaker_state (
  provider TEXT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'CLOSED' CHECK(state IN ('CLOSED', 'OPEN', 'HALF_OPEN')),
  failure_count INTEGER NOT NULL DEFAULT 0,
  last_failure_time INTEGER NOT NULL DEFAULT 0,
  last_success_time INTEGER NOT NULL DEFAULT 0,
  consecutive_successes INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
