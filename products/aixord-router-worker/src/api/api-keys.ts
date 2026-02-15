/**
 * API Keys Management Endpoints
 * Allows BYOK users to configure their AI provider API keys
 */

import { Hono } from 'hono';
import type { Env, Provider } from '../types';
import { nanoid } from 'nanoid';
import { requireAuth } from '../middleware/requireAuth';
import { invalidateKeyCache } from '../routing/key-resolver';

const app = new Hono<{ Bindings: Env }>();

// Apply authentication middleware to all routes
app.use('/*', requireAuth);

// API Key validation patterns (relaxed to accept modern key formats)
// Session 3 Fix: OpenAI now accepts sk-proj- prefix and dots
// Session 3 Fix: DeepSeek now accepts dashes and underscores
// Session 3 Fix: Google flexible length (30+ chars instead of exactly 33)
const API_KEY_PATTERNS: Record<string, RegExp> = {
  anthropic: /^sk-ant-api03-[a-zA-Z0-9_-]{32,}$/,
  openai: /^sk-[a-zA-Z0-9._-]{20,}$/,
  google: /^AIzaSy[a-zA-Z0-9_-]{30,}$/,
  deepseek: /^sk-[a-zA-Z0-9_-]{32,}$/,
};

const API_KEY_EXAMPLES: Record<string, string> = {
  anthropic: 'sk-ant-api03-...',
  openai: 'sk-proj-... or sk-...',
  google: 'AIzaSy...',
  deepseek: 'sk-...',
};

/**
 * Validate API key format
 */
function validateApiKey(provider: string, apiKey: string): { valid: boolean; error?: string } {
  if (!apiKey || apiKey.trim() === '') {
    return { valid: false, error: 'API key cannot be empty' };
  }

  const pattern = API_KEY_PATTERNS[provider];
  if (!pattern) {
    // Unknown provider, skip validation
    return { valid: true };
  }

  if (!pattern.test(apiKey.trim())) {
    const example = API_KEY_EXAMPLES[provider];
    return {
      valid: false,
      error: `Invalid ${provider} API key format. Should look like: ${example}`
    };
  }

  return { valid: true };
}

/**
 * GET /api-keys
 * List all configured API keys for the current user
 */
app.get('/', async (c) => {
  const userId = c.get('userId') as string | undefined;
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const keys = await c.env.DB.prepare(`
    SELECT id, provider, api_key, label, created_at, updated_at
    FROM user_api_keys
    WHERE user_id = ?
    ORDER BY provider
  `).bind(userId).all();

  return c.json({
    success: true,
    keys: keys.results || [],
    count: keys.results?.length || 0
  });
});

/**
 * POST /api-keys
 * Add or update an API key for a specific provider
 * 
 * Body: { provider: 'anthropic' | 'openai' | 'google' | 'deepseek', apiKey: string, label?: string }
 */
app.post('/', async (c) => {
  const userId = c.get('userId') as string | undefined;
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json<{
    provider: string;
    apiKey: string;
    label?: string;
  }>();

  // Validate provider
  const validProviders = ['anthropic', 'openai', 'google', 'deepseek'];
  if (!validProviders.includes(body.provider)) {
    return c.json({
      error: `Invalid provider. Must be one of: ${validProviders.join(', ')}`
    }, 400);
  }

  // Validate API key format
  const validation = validateApiKey(body.provider, body.apiKey);
  if (!validation.valid) {
    return c.json({
      error: validation.error,
      provider: body.provider
    }, 400);
  }

  // Check if user already has a key for this provider
  const existing = await c.env.DB.prepare(`
    SELECT id FROM user_api_keys
    WHERE user_id = ? AND provider = ?
  `).bind(userId, body.provider).first();

  const now = new Date().toISOString();

  if (existing) {
    // Update existing key
    await c.env.DB.prepare(`
      UPDATE user_api_keys
      SET api_key = ?, label = ?, updated_at = ?
      WHERE user_id = ? AND provider = ?
    `).bind(
      body.apiKey.trim(),
      body.label || null,
      now,
      userId,
      body.provider
    ).run();

    // Invalidate cache to ensure new key is used immediately
    invalidateKeyCache(userId, body.provider as Provider);
    console.log(`[API KEY UPDATED] ${body.provider} key for user ${userId.substring(0, 8)}... - cache invalidated`);

    return c.json({
      success: true,
      message: `${body.provider} API key updated successfully`,
      provider: body.provider,
      cache_cleared: true
    });
  } else {
    // Insert new key
    const keyId = nanoid();
    await c.env.DB.prepare(`
      INSERT INTO user_api_keys (id, user_id, provider, api_key, label, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      keyId,
      userId,
      body.provider,
      body.apiKey.trim(),
      body.label || null,
      now,
      now
    ).run();

    // Invalidate cache to ensure new key is used immediately
    invalidateKeyCache(userId, body.provider as Provider);
    console.log(`[API KEY SAVED] ${body.provider} key for user ${userId.substring(0, 8)}... - cache invalidated`);

    return c.json({
      success: true,
      message: `${body.provider} API key added successfully`,
      provider: body.provider,
      id: keyId,
      cache_cleared: true
    });
  }
});

/**
 * DELETE /api-keys/:provider
 * Remove an API key for a specific provider
 */
app.delete('/:provider', async (c) => {
  const userId = c.get('userId') as string | undefined;
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const provider = c.req.param('provider');
  const validProviders = ['anthropic', 'openai', 'google', 'deepseek'];
  
  if (!validProviders.includes(provider)) {
    return c.json({ error: 'Invalid provider' }, 400);
  }

  await c.env.DB.prepare(`
    DELETE FROM user_api_keys
    WHERE user_id = ? AND provider = ?
  `).bind(userId, provider).run();

  // Invalidate cache after deletion
  invalidateKeyCache(userId, provider as Provider);
  console.log(`[API KEY DELETED] ${provider} key for user ${userId.substring(0, 8)}... - cache invalidated`);

  return c.json({
    success: true,
    message: `${provider} API key removed successfully`,
    provider,
    cache_cleared: true
  });
});

/**
 * POST /api-keys/test
 * Test an API key against the provider's API to verify it works
 *
 * Body: { provider: string, apiKey: string }
 */
app.post('/test', async (c) => {
  const userId = c.get('userId') as string | undefined;
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json<{
    provider: string;
    apiKey: string;
  }>();

  if (!body.provider || !body.apiKey) {
    return c.json({
      valid: false,
      error: 'Missing provider or apiKey',
      stage: 'validation'
    }, 400);
  }

  // Validate format first
  const validation = validateApiKey(body.provider, body.apiKey);
  if (!validation.valid) {
    return c.json({
      valid: false,
      error: validation.error,
      stage: 'format_validation',
    });
  }

  // Test actual API call
  try {
    let testResult;

    switch (body.provider) {
      case 'anthropic':
        testResult = await testAnthropicKey(body.apiKey);
        break;
      case 'openai':
        testResult = await testOpenAIKey(body.apiKey);
        break;
      case 'google':
        testResult = await testGoogleKey(body.apiKey);
        break;
      case 'deepseek':
        testResult = await testDeepSeekKey(body.apiKey);
        break;
      default:
        return c.json({
          valid: false,
          error: `Unknown provider: ${body.provider}`,
          stage: 'validation'
        }, 400);
    }

    return c.json({
      valid: testResult.valid,
      provider: body.provider,
      message: testResult.message,
      stage: 'api_test',
    });
  } catch (error: any) {
    return c.json({
      valid: false,
      error: error.message || 'Test failed',
      stage: 'api_test',
    });
  }
});

// Test helper functions
async function testAnthropicKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',  // Session 3: Use Haiku for testing (faster, always available)
      max_tokens: 10,
      messages: [{ role: 'user', content: 'test' }],
    }),
  });

  if (response.ok) {
    return { valid: true, message: 'Anthropic API key is valid' };
  } else if (response.status === 401) {
    return { valid: false, message: 'Invalid Anthropic API key' };
  } else {
    const error = await response.text();
    return { valid: false, message: `Anthropic API error: ${response.status} - ${error}` };
  }
}

async function testOpenAIKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (response.ok) {
    return { valid: true, message: 'OpenAI API key is valid' };
  } else if (response.status === 401) {
    return { valid: false, message: 'Invalid OpenAI API key' };
  } else {
    const error = await response.text();
    return { valid: false, message: `OpenAI API error: ${response.status} - ${error}` };
  }
}

async function testGoogleKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );

  if (response.ok) {
    return { valid: true, message: 'Google API key is valid' };
  } else if (response.status === 400) {
    return { valid: false, message: 'Invalid Google API key' };
  } else {
    const error = await response.text();
    return { valid: false, message: `Google API error: ${response.status} - ${error}` };
  }
}

async function testDeepSeekKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  const response = await fetch('https://api.deepseek.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (response.ok) {
    return { valid: true, message: 'DeepSeek API key is valid' };
  } else if (response.status === 401) {
    return { valid: false, message: 'Invalid DeepSeek API key' };
  } else {
    const error = await response.text();
    return { valid: false, message: `DeepSeek API error: ${response.status} - ${error}` };
  }
}

export default app;
