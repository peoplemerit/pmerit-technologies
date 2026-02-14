-- Insert test API keys for user f7296c79-4064-4509-9e9b-0397aadab2fc
-- IMPORTANT: Replace these with your actual API keys before running!

-- Anthropic API key (replace with your actual key)
INSERT INTO user_api_keys (id, user_id, provider, api_key, label, created_at, updated_at)
VALUES (
  'key_anthropic_test',
  'f7296c79-4064-4509-9e9b-0397aadab2fc',
  'anthropic',
  'YOUR_ANTHROPIC_KEY_HERE',
  'Test Anthropic Key',
  datetime('now'),
  datetime('now')
);

-- OpenAI API key (replace with your actual key)
INSERT INTO user_api_keys (id, user_id, provider, api_key, label, created_at, updated_at)
VALUES (
  'key_openai_test',
  'f7296c79-4064-4509-9e9b-0397aadab2fc',
  'openai',
  'YOUR_OPENAI_KEY_HERE',
  'Test OpenAI Key',
  datetime('now'),
  datetime('now')
);

-- DeepSeek API key (replace with your actual key)
INSERT INTO user_api_keys (id, user_id, provider, api_key, label, created_at, updated_at)
VALUES (
  'key_deepseek_test',
  'f7296c79-4064-4509-9e9b-0397aadab2fc',
  'deepseek',
  'YOUR_DEEPSEEK_KEY_HERE',
  'Test DeepSeek Key',
  datetime('now'),
  datetime('now')
);

-- Google Gemini API key (replace with your actual key)
INSERT INTO user_api_keys (id, user_id, provider, api_key, label, created_at, updated_at)
VALUES (
  'key_google_test',
  'f7296c79-4064-4509-9e9b-0397aadab2fc',
  'google',
  'YOUR_GOOGLE_KEY_HERE',
  'Test Google Key',
  datetime('now'),
  datetime('now')
);

-- Verify the keys were inserted
SELECT provider, label, created_at FROM user_api_keys WHERE user_id = 'f7296c79-4064-4509-9e9b-0397aadab2fc';
