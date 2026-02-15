-- Migration 038: Password Hash Upgrade — HANDOFF-COPILOT-AUDIT-01
-- Adds per-user salt and algorithm tracking for PBKDF2 migration
-- Existing rows default to 'sha256' (legacy global-salt SHA-256)

ALTER TABLE users ADD COLUMN password_salt TEXT;
ALTER TABLE users ADD COLUMN hash_algorithm TEXT DEFAULT 'sha256';
