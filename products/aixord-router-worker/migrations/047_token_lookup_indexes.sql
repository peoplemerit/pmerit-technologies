-- Migration 047: Add missing indexes for token lookup performance
-- Fixes: email_verification_tokens and password_reset_tokens lack indexes on token column
-- These are queried by token value during auth flows (verify-email, reset-password)

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token
  ON email_verification_tokens (token);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token
  ON password_reset_tokens (token);

-- Also add composite index for BYOK key lookup (user_id + provider)
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_provider
  ON user_api_keys (user_id, provider);
