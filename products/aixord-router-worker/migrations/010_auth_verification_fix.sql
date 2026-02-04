-- 010_auth_verification_fix.sql
-- Fixes for auth verification migration
-- - Adds email_verified and username columns to users (without inline UNIQUE)
-- - Adds email column to email_verification_tokens (was missing)
-- Created: 2026-02-02

-- Add columns to users table (SQLite doesn't support UNIQUE on ALTER TABLE ADD)
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN username TEXT;

-- Apply UNIQUE constraint via index instead
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add missing email column to email_verification_tokens table
ALTER TABLE email_verification_tokens ADD COLUMN email TEXT;
