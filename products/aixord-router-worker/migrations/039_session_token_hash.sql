-- Migration 039: Session Token Hashing — HANDOFF-COPILOT-AUDIT-01
-- Adds token_hash column for SHA-256 hashed token lookup
-- Existing sessions retain plaintext token for migration window (7 days)

ALTER TABLE sessions ADD COLUMN token_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
