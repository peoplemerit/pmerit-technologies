-- Check GT2UTM user configuration
SELECT 
  id as user_id,
  email,
  name,
  created_at,
  updated_at
FROM users 
WHERE email = 'f.eranmiolu@gmail.com';

-- Check subscription details
SELECT 
  id,
  user_id,
  tier,
  status,
  stripe_customer_id,
  stripe_subscription_id,
  period_start,
  period_end,
  created_at,
  updated_at
FROM subscriptions 
WHERE user_id = (SELECT id FROM users WHERE email = 'f.eranmiolu@gmail.com');

-- Check configured API keys
SELECT 
  id,
  user_id,
  provider,
  CASE 
    WHEN LENGTH(api_key) > 10 THEN 'Configured (' || LENGTH(api_key) || ' chars)'
    ELSE 'Missing or Invalid'
  END as key_status,
  label,
  created_at,
  updated_at
FROM user_api_keys
WHERE user_id = (SELECT id FROM users WHERE email = 'f.eranmiolu@gmail.com')
ORDER BY provider;
