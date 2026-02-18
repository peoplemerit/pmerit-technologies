/**
 * API Keys Management Endpoints
 * Allows BYOK users to configure their AI provider API keys
 */

import { Hono } from 'hono';
import type { Env, Provider } from '../types';
import { nanoid } from 'nanoid';
import { requireAuth } from '../middleware/requireAuth';
import { invalidateKeyCache } from '../routing/key-resolver';
import { encryptAESGCM, decryptAESGCM, maskApiKey, verifyPasswordPBKDF2 } from '../utils/crypto';
import { log } from '../utils/logger';

/**
 * Decrypt an API key, with transparent migration for plaintext keys.
 * If decryption fails (key is plaintext), returns it as-is.
 */
async function decryptApiKey(storedKey: string, encryptionKey: string | undefined): Promise<string> {
  if (!encryptionKey) return storedKey;
  try {
    return await decryptAESGCM(storedKey, encryptionKey);
  } catch {
    // Not encrypted (plaintext legacy key) — return as-is
    return storedKey;
  }
}

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
 *
 * SECURITY (HANDOFF-SECURITY-CRITICAL-01):
 * Returns only masked key previews (e.g. "sk-ant-...xyz").
 * Full plaintext keys are NEVER returned in GET responses.
 * Use POST /api-keys/:id/reveal with password re-auth to view full key.
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

  // Return only safe metadata with masked preview (HANDOFF-SECURITY-CRITICAL-01)
  const encKey = c.env.API_KEY_ENCRYPTION_KEY;
  const safeKeys = await Promise.all(
    (keys.results || []).map(async (row: any) => ({
      id: row.id,
      provider: row.provider,
      key_preview: await maskApiKey(row.api_key, encKey),
      label: row.label,
      created_at: row.created_at,
      updated_at: row.updated_at,
      // SECURITY: NEVER include api_key, encrypted_key, or decrypted value
    }))
  );

  return c.json({
    success: true,
    keys: safeKeys,
    count: safeKeys.length
  });
});

/**
 * POST /api-keys/:id/reveal
 *
 * Reveal full API key with password re-authentication.
 * Returns plaintext key for one-time viewing (30-second frontend timeout).
 *
 * SECURITY (HANDOFF-SECURITY-CRITICAL-01):
 * - Requires password re-authentication (no token reuse)
 * - Verifies key ownership (user_id match)
 * - Logs both success and failure attempts
 * - Single-use response (not cached)
 */
app.post('/:id/reveal', async (c) => {
  const userId = c.get('userId') as string | undefined;
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { id } = c.req.param();
  let body: { password?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid request body' }, 400);
  }

  // Require password re-authentication
  if (!body.password) {
    return c.json({
      success: false,
      error: 'Password required to reveal API key'
    }, 401);
  }

  // Verify password
  const user = await c.env.DB.prepare(`
    SELECT password_hash, password_salt, hash_algorithm FROM users WHERE id = ?
  `).bind(userId).first<{
    password_hash: string;
    password_salt: string | null;
    hash_algorithm: string | null;
  }>();

  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  // Only support PBKDF2 for reveal (legacy SHA-256 users must login first to upgrade)
  if (!user.password_salt || user.hash_algorithm !== 'pbkdf2') {
    return c.json({
      success: false,
      error: 'Please log out and log back in before using this feature'
    }, 400);
  }

  const isValidPassword = await verifyPasswordPBKDF2(
    body.password,
    user.password_salt,
    user.password_hash
  );

  if (!isValidPassword) {
    // Log failed reveal attempt
    log.info('api_key_reveal_failed', { key_id: id, reason: 'invalid_password' });

    return c.json({ success: false, error: 'Invalid password' }, 401);
  }

  // Verify key ownership
  const keyRecord = await c.env.DB.prepare(`
    SELECT api_key, provider
    FROM user_api_keys
    WHERE id = ? AND user_id = ?
  `).bind(id, userId).first<{
    api_key: string;
    provider: string;
  }>();

  if (!keyRecord) {
    return c.json({ success: false, error: 'API key not found' }, 404);
  }

  // Decrypt and return
  const plaintextKey = await decryptApiKey(keyRecord.api_key, c.env.API_KEY_ENCRYPTION_KEY);

  // Log successful reveal
  log.info('api_key_revealed', { key_id: id, provider: keyRecord.provider });

  return c.json({
    success: true,
    api_key: plaintextKey,
    provider: keyRecord.provider,
    expires_in_seconds: 30 // Frontend auto-hide hint
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

  // Encrypt API key before storage (HANDOFF-COPILOT-AUDIT-01)
  const encKey = c.env.API_KEY_ENCRYPTION_KEY;
  const keyToStore = encKey
    ? await encryptAESGCM(body.apiKey.trim(), encKey)
    : body.apiKey.trim();

  if (existing) {
    // Update existing key
    await c.env.DB.prepare(`
      UPDATE user_api_keys
      SET api_key = ?, label = ?, updated_at = ?
      WHERE user_id = ? AND provider = ?
    `).bind(
      keyToStore,
      body.label || null,
      now,
      userId,
      body.provider
    ).run();

    // Invalidate cache to ensure new key is used immediately
    invalidateKeyCache(userId, body.provider as Provider);
    log.info('api_key_updated', { provider: body.provider });

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
      keyToStore,
      body.label || null,
      now,
      now
    ).run();

    // Invalidate cache to ensure new key is used immediately
    invalidateKeyCache(userId, body.provider as Provider);
    log.info('api_key_saved', { provider: body.provider });

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
  log.info('api_key_deleted', { provider });

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
    log.error('api_key_test_failed', { error: error.message || String(error), provider: body.provider });
    return c.json({
      valid: false,
      error: 'API key test failed',
      error_code: 'INTERNAL_ERROR',
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
