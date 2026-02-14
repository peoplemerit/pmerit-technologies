/**
 * API Key Resolver
 *
 * Resolves API keys based on subscription mode (BYOK vs Platform).
 */

import type { Provider, Subscription, Env } from '../types';
import { RouterError } from '../types';

/**
 * BYOK tiers that REQUIRE user-provided API keys (no platform fallback).
 * TRIAL is excluded — trial users can use BYOK or platform keys.
 */
const BYOK_REQUIRED_TIERS = ['MANUSCRIPT_BYOK', 'BYOK_STANDARD'];

/**
 * Resolve the API key to use for a given provider
 *
 * - BYOK mode: Fetch user-provided key for specific provider from database
 * - Platform mode: Use environment keys
 */
export async function resolveApiKey(
  subscription: Subscription,
  provider: Provider,
  env: Env,
  userId: string
): Promise<string> {
  // Check if this tier requires BYOK
  if (BYOK_REQUIRED_TIERS.includes(subscription.tier)) {
    if (subscription.key_mode !== 'BYOK') {
      throw new RouterError(
        'BYOK_REQUIRED',
        `Subscription tier ${subscription.tier} requires BYOK mode`,
        403
      );
    }
  }

  // BYOK mode - fetch provider-specific key from database
  if (subscription.key_mode === 'BYOK') {
    const userKey = await env.DB.prepare(`
      SELECT api_key FROM user_api_keys
      WHERE user_id = ? AND provider = ?
    `).bind(userId, provider).first<{ api_key: string }>();

    if (!userKey) {
      throw new RouterError(
        'BYOK_KEY_MISSING',
        `No API key configured for ${provider}. Please add your ${provider} API key in Settings.`,
        400
      );
    }

    return userKey.api_key;
  }

  // Platform mode - use environment keys
  const keyMap: Record<Provider, string | undefined> = {
    anthropic: env.ANTHROPIC_API_KEY,
    openai: env.OPENAI_API_KEY,
    google: env.GOOGLE_API_KEY,
    deepseek: env.DEEPSEEK_API_KEY
  };

  const key = keyMap[provider];
  if (!key) {
    throw new RouterError(
      'PLATFORM_KEY_MISSING',
      `No platform API key configured for ${provider}`,
      503
    );
  }

  return key;
}

/**
 * Check if a provider is available (has API key configured)
 */
export async function isProviderAvailable(
  subscription: Subscription,
  provider: Provider,
  env: Env,
  userId: string
): Promise<boolean> {
  try {
    await resolveApiKey(subscription, provider, env, userId);
    return true;
  } catch {
    return false;
  }
}
