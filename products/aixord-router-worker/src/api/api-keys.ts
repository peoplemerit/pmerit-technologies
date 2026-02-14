/**
 * API Keys Management Endpoints
 * Allows BYOK users to configure their AI provider API keys
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { nanoid } from 'nanoid';

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api-keys
 * List all configured API keys for the current user (keys are masked)
 */
app.get('/', async (c) => {
  const userId = c.get('userId') as string | undefined;
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const keys = await c.env.DB.prepare(`
    SELECT id, provider, label, created_at, updated_at
    FROM user_api_keys
    WHERE user_id = ?
    ORDER BY provider
  `).bind(userId).all();

  return c.json({
    keys: keys.results || []
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

  // Validate API key format (basic check)
  if (!body.apiKey || body.apiKey.trim().length < 10) {
    return c.json({ error: 'Invalid API key format' }, 400);
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

    return c.json({
      message: `${body.provider} API key updated successfully`,
      provider: body.provider
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

    return c.json({
      message: `${body.provider} API key added successfully`,
      provider: body.provider,
      id: keyId
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

  return c.json({
    message: `${provider} API key removed successfully`,
    provider
  });
});

export default app;
