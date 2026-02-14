/**
 * API Key Resolver
 *
 * Resolves API keys based on subscription mode (BYOK vs Platform).
 * Includes cache layer with invalidation support.
 */

import type { Provider, Subscription, Env } from '../types';
import { RouterError } from '../types';

/**
 * BYOK tiers that REQUIRE user-provided API keys (no platform fallback).
 * TRIAL is excluded — trial users can use BYOK or platform keys.
 */
const BYOK_REQUIRED_TIERS = ['MANUSCRIPT_BYOK', 'BYOK_STANDARD'];

/**
 * Cache for BYOK API keys
 * Key format: "userId:provider"
 * Value: { key: string, timestamp: number, updated_at: string }
 */
const KEY_CACHE = new Map<string, { key: string; timestamp: number; updated_at: string }>();

/**
 * Cache TTL (30 seconds)
 * Keys are cached to reduce database queries, but short enough to pick up changes quickly
 */
const CACHE_TTL = 30000;

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

  // BYOK mode - fetch provider-specific key from database (with caching)
  if (subscription.key_mode === 'BYOK') {
    // Cache key: userId:provider
    const cacheKey = `${userId}:${provider}`;
    const cached = KEY_CACHE.get(cacheKey);
    const now = Date.now();

    // Return cached if fresh
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      console.log(`[CACHE HIT] Using cached ${provider} key for user ${userId.substring(0, 8)}... | Updated: ${cached.updated_at}`);
      return cached.key;
    }

    // Fetch from database
    const userKey = await env.DB.prepare(`
      SELECT api_key, updated_at FROM user_api_keys
      WHERE user_id = ? AND provider = ?
    `).bind(userId, provider).first<{ api_key: string; updated_at: string }>();

    if (!userKey) {
      throw new RouterError(
        'BYOK_KEY_MISSING',
        `No API key configured for ${provider}. Please add your ${provider} API key in Settings.`,
        400
      );
    }

    // Update cache
    KEY_CACHE.set(cacheKey, {
      key: userKey.api_key,
      timestamp: now,
      updated_at: userKey.updated_at
    });

    // Debug logging to track key resolution and cache issues
    const keyPreview = userKey.api_key.substring(0, 15) + '...';
    console.log(`[CACHE MISS] Fetched fresh ${provider} key for user ${userId.substring(0, 8)}... | Updated: ${userKey.updated_at} | Preview: ${keyPreview}`);

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

/**
 * Invalidate cached API key(s)
 * Called after updating/deleting keys to ensure fresh data is used
 * 
 * @param userId - User ID whose keys to invalidate
 * @param provider - Specific provider to invalidate, or undefined to clear all for user
 */
export function invalidateKeyCache(userId: string, provider?: Provider): void {
  if (provider) {
    const cacheKey = `${userId}:${provider}`;
    KEY_CACHE.delete(cacheKey);
    console.log(`[CACHE CLEAR] Cleared ${provider} key for user ${userId.substring(0, 8)}...`);
  } else {
    // Clear all keys for user
    let cleared = 0;
    for (const key of KEY_CACHE.keys()) {
      if (key.startsWith(`${userId}:`)) {
        KEY_CACHE.delete(key);
        cleared++;
      }
    }
    console.log(`[CACHE CLEAR] Cleared ${cleared} keys for user ${userId.substring(0, 8)}...`);
  }
}
