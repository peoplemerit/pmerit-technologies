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
import { decryptAESGCM } from '../utils/crypto';
import { log } from '../utils/logger';

/**
 * Cache for BYOK API keys
 * Key format: "userId:provider"
 * Value: { key: string, timestamp: number, updated_at: string }
 *
 * M-3 fix: Maximum cache size to prevent unbounded growth
 */
const KEY_CACHE = new Map<string, { key: string; timestamp: number; updated_at: string }>();
const CACHE_TTL = 30000; // 30 seconds
const CACHE_MAX_SIZE = 10000; // Max entries before eviction

/**
 * Evict expired entries from cache. Called when cache exceeds CACHE_MAX_SIZE.
 */
function evictStaleEntries(): void {
  const now = Date.now();
  for (const [key, entry] of KEY_CACHE) {
    if (now - entry.timestamp > CACHE_TTL) {
      KEY_CACHE.delete(key);
    }
  }
  // If still over limit after TTL eviction, drop oldest 25%
  if (KEY_CACHE.size > CACHE_MAX_SIZE) {
    const entries = Array.from(KEY_CACHE.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      KEY_CACHE.delete(entries[i][0]);
    }
  }
}

/**
 * Resolve the API key to use for a given provider
 */
export async function resolveApiKey(
  subscription: Subscription,
  provider: Provider,
  env: Env,
  userId: string
): Promise<string> {
  const tier = subscription.tier;

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
 */
async function resolveBYOKKey(
  provider: Provider,
  env: Env,
  userId: string
): Promise<string> {
  const cacheKey = `${userId}:${provider}`;
  const cached = KEY_CACHE.get(cacheKey);
  const now = Date.now();

  // Return cached if fresh
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    log.info('byok_cache_hit', { provider, user_id: userId.substring(0, 8) });
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

  // Decrypt API key
  let decryptedKey: string;
  const encKey = env.API_KEY_ENCRYPTION_KEY;
  if (encKey) {
    try {
      decryptedKey = await decryptAESGCM(userKey.api_key, encKey);
    } catch {
      decryptedKey = userKey.api_key;
    }
  } else {
    decryptedKey = userKey.api_key;
  }

  // M-3: Evict stale entries if cache exceeds max size
  if (KEY_CACHE.size >= CACHE_MAX_SIZE) {
    evictStaleEntries();
  }

  // Update cache
  KEY_CACHE.set(cacheKey, {
    key: decryptedKey,
    timestamp: now,
    updated_at: userKey.updated_at
  });

  log.info('byok_cache_miss', { provider, user_id: userId.substring(0, 8) });

  return decryptedKey;
}

/**
 * Resolve Platform key from environment secrets
 * H-2 fix: No key content logged (even prefixes)
 */
function resolvePlatformKey(
  provider: Provider,
  env: Env,
  userId: string
): string {
  const keyMap: Record<Provider, string | undefined> = {
    anthropic: env.PLATFORM_ANTHROPIC_KEY,
    openai: env.PLATFORM_OPENAI_KEY,
    google: env.PLATFORM_GOOGLE_KEY,
    deepseek: env.PLATFORM_DEEPSEEK_KEY
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

  // H-2 fix: Log usage without any key content
  log.info('platform_key_resolved', { provider, user_id: userId.substring(0, 8) });

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
 */
export function invalidateKeyCache(userId: string, provider?: Provider): void {
  if (provider) {
    const cacheKey = `${userId}:${provider}`;
    KEY_CACHE.delete(cacheKey);
    log.info('cache_invalidated', { provider, user_id: userId.substring(0, 8) });
  } else {
    let cleared = 0;
    for (const key of KEY_CACHE.keys()) {
      if (key.startsWith(`${userId}:`)) {
        KEY_CACHE.delete(key);
        cleared++;
      }
    }
    log.info('cache_invalidated_all', { count: cleared, user_id: userId.substring(0, 8) });
  }
}
