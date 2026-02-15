/**
 * API Key Resolver — Hybrid Model
 *
 * Resolves API keys based on subscription tier:
 * - BYOK tiers: User provides keys (stored in D1)
 * - Platform tiers: PMERIT provides keys (from environment)
 *
 * Tier Classification:
 * - BYOK_TIERS = ['MANUSCRIPT_BYOK', 'BYOK_STANDARD']
 * - PLATFORM_TIERS = ['TRIAL', 'PLATFORM_STANDARD', 'PLATFORM_PRO', 'ENTERPRISE']
 */

import type { Provider, Subscription, Env } from '../types';
import { RouterError } from '../types';
import { isByokTier, isPlatformTier } from '../config/tiers';

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
 * - BYOK tiers: Fetch user-provided key from database (with caching)
 * - Platform tiers: Use environment secrets
 */
export async function resolveApiKey(
  subscription: Subscription,
  provider: Provider,
  env: Env,
  userId: string
): Promise<string> {
  const tier = subscription.tier;

  // Route based on tier classification (derived from config/tiers.ts)
  if (isByokTier(tier)) {
    return await resolveBYOKKey(provider, env, userId);
  } else if (isPlatformTier(tier)) {
    return resolvePlatformKey(provider, env, userId);
  } else {
    throw new RouterError(
      'UNKNOWN_TIER',
      `Unknown subscription tier: ${tier}`,
      500
    );
  }
}

/**
 * Resolve BYOK key from database (with caching)
 * Used for: MANUSCRIPT_BYOK, BYOK_STANDARD
 */
async function resolveBYOKKey(
  provider: Provider,
  env: Env,
  userId: string
): Promise<string> {
  // Cache key: userId:provider
  const cacheKey = `${userId}:${provider}`;
  const cached = KEY_CACHE.get(cacheKey);
  const now = Date.now();

  // Return cached if fresh
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    console.log(`[BYOK] [CACHE HIT] Using cached ${provider} key for user ${userId.substring(0, 8)}... | Updated: ${cached.updated_at}`);
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
      `No ${provider} API key found. Go to Settings → API Keys to add your ${provider} key.`,
      400,
      {
        provider,
        mode: 'BYOK',
        action: 'add_key',
        settings_url: '/settings?tab=api-keys'
      }
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
  console.log(`[BYOK] [CACHE MISS] Fetched fresh ${provider} key for user ${userId.substring(0, 8)}... | Updated: ${userKey.updated_at} | Preview: ${keyPreview}`);

  return userKey.api_key;
}

/**
 * Resolve Platform key from environment secrets
 * Used for: TRIAL, PLATFORM_STANDARD, PLATFORM_PRO, ENTERPRISE
 *
 * Cost Tracking: Log platform key usage for billing analysis
 */
function resolvePlatformKey(
  provider: Provider,
  env: Env,
  userId: string
): string {
  // Use legacy secret names (ANTHROPIC_API_KEY, etc.) which are the actual
  // wrangler secrets. PLATFORM_*_KEY was never configured as separate secrets.
  const keyMap: Record<Provider, string | undefined> = {
    anthropic: env.PLATFORM_ANTHROPIC_KEY || env.ANTHROPIC_API_KEY,
    openai: env.PLATFORM_OPENAI_KEY || env.OPENAI_API_KEY,
    google: env.PLATFORM_GOOGLE_KEY || env.GOOGLE_API_KEY,
    deepseek: env.PLATFORM_DEEPSEEK_KEY || env.DEEPSEEK_API_KEY
  };

  const key = keyMap[provider];
  if (!key) {
    throw new RouterError(
      'PLATFORM_KEY_MISSING',
      `No platform API key configured for ${provider}. Contact support.`,
      503,
      {
        provider,
        mode: 'PLATFORM',
        action: 'contact_support',
        suggestion: 'Platform keys are managed by PMERIT. Please contact support if this error persists.'
      }
    );
  }

  // Cost tracking log (distinguish platform usage from BYOK)
  const keyPreview = key.substring(0, 15) + '...';
  console.log(`[PLATFORM KEY] Using ${provider} platform key for user ${userId.substring(0, 8)}... | Preview: ${keyPreview}`);

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
