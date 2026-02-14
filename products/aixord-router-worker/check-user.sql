SELECT id, email, subscription_tier, created_at FROM users WHERE id = 'f7296c79-4064-4509-9e9b-0397aadab2fc';
SELECT id, tier, status, key_mode, stripe_customer_id, stripe_subscription_id, user_api_key FROM subscriptions WHERE user_id = 'f7296c79-4064-4509-9e9b-0397aadab2fc';
