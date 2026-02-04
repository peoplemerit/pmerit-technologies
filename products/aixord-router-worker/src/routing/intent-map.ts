/**
 * Intent to Model Class Mapping
 *
 * Maps (SubscriptionTier, Intent, Mode) -> ModelClass
 * Based on HANDOFF-D4-CHAT.md and MODEL_ROUTER_SPEC.md
 */

import type { SubscriptionTier, Intent, Mode, ModelClass } from '../types';

/**
 * Base intent-to-class mapping by tier
 * Mode adjustments applied on top
 */
const TIER_INTENT_MAP: Record<SubscriptionTier, Record<Intent, ModelClass>> = {
  TRIAL: {
    CHAT: 'FAST_ECONOMY',
    VERIFY: 'ULTRA_CHEAP',
    EXTRACT: 'ULTRA_CHEAP',
    CLASSIFY: 'ULTRA_CHEAP',
    RAG_VERIFY: 'FAST_VERIFY'
  },

  MANUSCRIPT_BYOK: {
    CHAT: 'FAST_ECONOMY',
    VERIFY: 'ULTRA_CHEAP',
    EXTRACT: 'ULTRA_CHEAP',
    CLASSIFY: 'ULTRA_CHEAP',
    RAG_VERIFY: 'FAST_VERIFY'
  },

  BYOK_STANDARD: {
    CHAT: 'HIGH_QUALITY',
    VERIFY: 'FAST_VERIFY',
    EXTRACT: 'ULTRA_CHEAP',
    CLASSIFY: 'ULTRA_CHEAP',
    RAG_VERIFY: 'FAST_VERIFY'
  },

  PLATFORM_STANDARD: {
    CHAT: 'HIGH_QUALITY',
    VERIFY: 'FAST_VERIFY',
    EXTRACT: 'FAST_ECONOMY',
    CLASSIFY: 'ULTRA_CHEAP',
    RAG_VERIFY: 'FAST_VERIFY'
  },

  PLATFORM_PRO: {
    CHAT: 'HIGH_QUALITY',
    VERIFY: 'FAST_VERIFY',
    EXTRACT: 'FAST_ECONOMY',
    CLASSIFY: 'FAST_ECONOMY',
    RAG_VERIFY: 'RAG_VERIFY'
  },

  ENTERPRISE: {
    CHAT: 'FRONTIER',
    VERIFY: 'FAST_VERIFY',
    EXTRACT: 'FAST_ECONOMY',
    CLASSIFY: 'FAST_ECONOMY',
    RAG_VERIFY: 'RAG_VERIFY'
  }
};

/**
 * Mode upgrades: When mode is PREMIUM, upgrade certain classes
 */
const MODE_UPGRADES: Partial<Record<ModelClass, ModelClass>> = {
  FAST_ECONOMY: 'HIGH_QUALITY',
  HIGH_QUALITY: 'FRONTIER'
};

/**
 * Mode downgrades: When mode is ECONOMY, downgrade certain classes
 */
const MODE_DOWNGRADES: Partial<Record<ModelClass, ModelClass>> = {
  HIGH_QUALITY: 'FAST_ECONOMY',
  FRONTIER: 'HIGH_QUALITY'
};

/**
 * Get the model class for a given tier, intent, and mode
 */
export function getModelClass(
  tier: SubscriptionTier,
  intent: Intent,
  mode: Mode
): ModelClass {
  // Get base class from tier/intent mapping
  const tierMap = TIER_INTENT_MAP[tier];
  if (!tierMap) {
    throw new Error(`Unknown tier: ${tier}`);
  }

  let modelClass = tierMap[intent];
  if (!modelClass) {
    throw new Error(`Unknown intent: ${intent}`);
  }

  // Apply mode adjustments
  if (mode === 'PREMIUM') {
    const upgraded = MODE_UPGRADES[modelClass];
    if (upgraded) {
      modelClass = upgraded;
    }
  } else if (mode === 'ECONOMY') {
    const downgraded = MODE_DOWNGRADES[modelClass];
    if (downgraded) {
      modelClass = downgraded;
    }
  }

  return modelClass;
}

/**
 * Check if a tier allows a specific model class
 */
export function isClassAllowedForTier(
  tier: SubscriptionTier,
  modelClass: ModelClass
): boolean {
  // FIX (Session 13D): BYOK users provide their own API keys — no class restriction
  // They are paying the provider directly, so we don't gate model quality
  const BYOK_TIERS: SubscriptionTier[] = ['BYOK_STANDARD', 'MANUSCRIPT_BYOK'];
  if (BYOK_TIERS.includes(tier)) {
    return true;
  }

  const TIER_ALLOWED_CLASSES: Record<SubscriptionTier, ModelClass[]> = {
    TRIAL: ['FAST_ECONOMY', 'ULTRA_CHEAP', 'FAST_VERIFY'],
    MANUSCRIPT_BYOK: ['FAST_ECONOMY', 'ULTRA_CHEAP', 'FAST_VERIFY'],
    BYOK_STANDARD: ['HIGH_QUALITY', 'FAST_ECONOMY', 'ULTRA_CHEAP', 'FAST_VERIFY'],
    PLATFORM_STANDARD: ['HIGH_QUALITY', 'FAST_ECONOMY', 'ULTRA_CHEAP', 'FAST_VERIFY'],
    PLATFORM_PRO: ['HIGH_QUALITY', 'FRONTIER', 'FAST_VERIFY', 'RAG_VERIFY', 'FAST_ECONOMY', 'ULTRA_CHEAP'],
    ENTERPRISE: ['HIGH_QUALITY', 'FRONTIER', 'FAST_VERIFY', 'RAG_VERIFY', 'FAST_ECONOMY', 'ULTRA_CHEAP']
  };

  const allowed = TIER_ALLOWED_CLASSES[tier];
  return allowed ? allowed.includes(modelClass) : false;
}
