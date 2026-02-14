-- Fix incorrect tier: user paid for BYOK_STANDARD ($9.99) but was set to PLATFORM_STANDARD
UPDATE subscriptions 
SET tier = 'BYOK_STANDARD' 
WHERE user_id = 'f7296c79-4064-4509-9e9b-0397aadab2fc';

-- Also update users table
UPDATE users 
SET subscription_tier = 'BYOK_STANDARD' 
WHERE id = 'f7296c79-4064-4509-9e9b-0397aadab2fc';

-- Verify the changes
SELECT id, tier, status, stripe_customer_id FROM subscriptions WHERE user_id = 'f7296c79-4064-4509-9e9b-0397aadab2fc';
SELECT id, email, subscription_tier FROM users WHERE id = 'f7296c79-4064-4509-9e9b-0397aadab2fc';
