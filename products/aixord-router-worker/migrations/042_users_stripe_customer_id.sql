-- FIX-STRIPE-PAYMENT-01: Add stripe_customer_id to users table
-- The webhook handler writes stripe_customer_id to users for future lookups
-- but this column was missing, causing all Stripe tier updates to silently fail.
-- Applied manually to production D1 on 2026-02-16.

ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;

-- Backfill from subscriptions table
UPDATE users SET stripe_customer_id = (
  SELECT s.stripe_customer_id FROM subscriptions s
  WHERE s.user_id = users.id AND s.stripe_customer_id IS NOT NULL
  LIMIT 1
) WHERE id IN (
  SELECT user_id FROM subscriptions WHERE stripe_customer_id IS NOT NULL
);
