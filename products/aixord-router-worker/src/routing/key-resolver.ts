/**
 * API Key Resolver
 *
 * Resolves API keys based on subscription mode (BYOK vs Platform).
 */

import type { Provider, Subscription, Env } from '../types';
import { RouterError } from '../types';

/**
 * BYOK tiers that require user-provided API keys
 */
const BYOK_REQUIRED_TIERS = ['TRIAL', 'MANUSCRIPT_BYOK', 'BYOK_STANDARD'];

/**
 * Resolve the API key to use for a given provider
 *
 * - BYOK mode: Use user-provided key
 * - Platform mode: Use environment keys
 */
export function resolveApiKey(
  subscription: Subscription,
  provider: Provider,
  env: Env
): string {
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

  // BYOK mode - use user-provided key
  if (subscription.key_mode === 'BYOK') {
    if (!subscription.user_api_key) {
      throw new RouterError(
        'BYOK_KEY_MISSING',
        'BYOK mode requires user_api_key in subscription',
        400
      );
    }
    return subscription.user_api_key;
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
export function isProviderAvailable(
  subscription: Subscription,
  provider: Provider,
  env: Env
): boolean {
  try {
    resolveApiKey(subscription, provider, env);
    return true;
  } catch {
    return false;
  }
}
