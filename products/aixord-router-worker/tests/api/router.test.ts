/**
 * Router Model Selection & Routing Table Tests
 *
 * Tests the pure routing functions: model class selection, tier enforcement,
 * routing table lookups, and mode adjustments.
 * These are all pure functions — no DB mocking needed.
 */

import { describe, it, expect } from 'vitest';
import { getModelClass, isClassAllowedForTier } from '../../src/routing/intent-map';
import { getCandidates, getPrimary, getFallbacks, ROUTING_TABLE } from '../../src/routing/table';
import { TIER_DEFINITIONS } from '../../src/config/tiers';
import type { SubscriptionTier, Intent, Mode, ModelClass } from '../../src/types';

// ============================================================================
// getModelClass — Tier/Intent/Mode → ModelClass
// ============================================================================
describe('getModelClass', () => {
  // Basic tier-intent mappings (BALANCED mode = no adjustment)
  describe('BALANCED mode (base mapping)', () => {
    it('TRIAL + CHAT → FAST_ECONOMY', () => {
      expect(getModelClass('TRIAL', 'CHAT', 'BALANCED')).toBe('FAST_ECONOMY');
    });

    it('TRIAL + VERIFY → ULTRA_CHEAP', () => {
      expect(getModelClass('TRIAL', 'VERIFY', 'BALANCED')).toBe('ULTRA_CHEAP');
    });

    it('BYOK_STANDARD + CHAT → HIGH_QUALITY', () => {
      expect(getModelClass('BYOK_STANDARD', 'CHAT', 'BALANCED')).toBe('HIGH_QUALITY');
    });

    it('PLATFORM_PRO + CHAT → HIGH_QUALITY', () => {
      expect(getModelClass('PLATFORM_PRO', 'CHAT', 'BALANCED')).toBe('HIGH_QUALITY');
    });

    it('ENTERPRISE + CHAT → FRONTIER', () => {
      expect(getModelClass('ENTERPRISE', 'CHAT', 'BALANCED')).toBe('FRONTIER');
    });

    it('PLATFORM_PRO + RAG_VERIFY → RAG_VERIFY', () => {
      expect(getModelClass('PLATFORM_PRO', 'RAG_VERIFY', 'BALANCED')).toBe('RAG_VERIFY');
    });

    it('PLATFORM_STANDARD + EXTRACT → FAST_ECONOMY', () => {
      expect(getModelClass('PLATFORM_STANDARD', 'EXTRACT', 'BALANCED')).toBe('FAST_ECONOMY');
    });
  });

  // Mode PREMIUM — upgrades model class
  describe('PREMIUM mode (upgrades)', () => {
    it('TRIAL + CHAT + PREMIUM → HIGH_QUALITY (FAST_ECONOMY upgraded)', () => {
      expect(getModelClass('TRIAL', 'CHAT', 'PREMIUM')).toBe('HIGH_QUALITY');
    });

    it('BYOK_STANDARD + CHAT + PREMIUM → FRONTIER (HIGH_QUALITY upgraded)', () => {
      expect(getModelClass('BYOK_STANDARD', 'CHAT', 'PREMIUM')).toBe('FRONTIER');
    });

    it('ENTERPRISE + CHAT + PREMIUM → FRONTIER (already at top, no change)', () => {
      expect(getModelClass('ENTERPRISE', 'CHAT', 'PREMIUM')).toBe('FRONTIER');
    });

    it('TRIAL + VERIFY + PREMIUM → ULTRA_CHEAP (no upgrade path for ULTRA_CHEAP)', () => {
      expect(getModelClass('TRIAL', 'VERIFY', 'PREMIUM')).toBe('ULTRA_CHEAP');
    });
  });

  // Mode ECONOMY — downgrades model class
  describe('ECONOMY mode (downgrades)', () => {
    it('BYOK_STANDARD + CHAT + ECONOMY → FAST_ECONOMY (HIGH_QUALITY downgraded)', () => {
      expect(getModelClass('BYOK_STANDARD', 'CHAT', 'ECONOMY')).toBe('FAST_ECONOMY');
    });

    it('ENTERPRISE + CHAT + ECONOMY → HIGH_QUALITY (FRONTIER downgraded)', () => {
      expect(getModelClass('ENTERPRISE', 'CHAT', 'ECONOMY')).toBe('HIGH_QUALITY');
    });

    it('TRIAL + CHAT + ECONOMY → FAST_ECONOMY (no downgrade for FAST_ECONOMY)', () => {
      expect(getModelClass('TRIAL', 'CHAT', 'ECONOMY')).toBe('FAST_ECONOMY');
    });
  });

  // Error cases
  it('throws for unknown tier', () => {
    expect(() => getModelClass('NONEXISTENT' as SubscriptionTier, 'CHAT', 'BALANCED')).toThrow('Unknown tier');
  });

  it('throws for unknown intent', () => {
    expect(() => getModelClass('TRIAL', 'NONEXISTENT' as Intent, 'BALANCED')).toThrow('Unknown intent');
  });
});

// ============================================================================
// isClassAllowedForTier — Gate enforcement
// ============================================================================
describe('isClassAllowedForTier', () => {
  it('TRIAL can use FAST_ECONOMY', () => {
    expect(isClassAllowedForTier('TRIAL', 'FAST_ECONOMY')).toBe(true);
  });

  it('TRIAL cannot use FRONTIER', () => {
    expect(isClassAllowedForTier('TRIAL', 'FRONTIER')).toBe(false);
  });

  it('TRIAL cannot use HIGH_QUALITY', () => {
    expect(isClassAllowedForTier('TRIAL', 'HIGH_QUALITY')).toBe(false);
  });

  it('TRIAL cannot use RAG_VERIFY', () => {
    expect(isClassAllowedForTier('TRIAL', 'RAG_VERIFY')).toBe(false);
  });

  it('PLATFORM_STANDARD can use HIGH_QUALITY', () => {
    expect(isClassAllowedForTier('PLATFORM_STANDARD', 'HIGH_QUALITY')).toBe(true);
  });

  it('PLATFORM_STANDARD cannot use FRONTIER', () => {
    expect(isClassAllowedForTier('PLATFORM_STANDARD', 'FRONTIER')).toBe(false);
  });

  it('PLATFORM_STANDARD cannot use RAG_VERIFY', () => {
    expect(isClassAllowedForTier('PLATFORM_STANDARD', 'RAG_VERIFY')).toBe(false);
  });

  it('PLATFORM_PRO can use FRONTIER', () => {
    expect(isClassAllowedForTier('PLATFORM_PRO', 'FRONTIER')).toBe(true);
  });

  it('PLATFORM_PRO can use RAG_VERIFY', () => {
    expect(isClassAllowedForTier('PLATFORM_PRO', 'RAG_VERIFY')).toBe(true);
  });

  it('ENTERPRISE can use all classes', () => {
    const allClasses: ModelClass[] = ['ULTRA_CHEAP', 'FAST_ECONOMY', 'HIGH_QUALITY', 'FRONTIER', 'FAST_VERIFY', 'RAG_VERIFY'];
    for (const cls of allClasses) {
      expect(isClassAllowedForTier('ENTERPRISE', cls)).toBe(true);
    }
  });

  it('MANUSCRIPT_BYOK can use FRONTIER and HIGH_QUALITY (BYOK unlocks)', () => {
    expect(isClassAllowedForTier('MANUSCRIPT_BYOK', 'FRONTIER')).toBe(true);
    expect(isClassAllowedForTier('MANUSCRIPT_BYOK', 'HIGH_QUALITY')).toBe(true);
  });

  it('returns false for unknown tier', () => {
    expect(isClassAllowedForTier('NONEXISTENT' as SubscriptionTier, 'FRONTIER')).toBe(false);
  });
});

// ============================================================================
// Routing Table — getCandidates, getPrimary, getFallbacks
// ============================================================================
describe('Routing Table', () => {
  describe('getCandidates', () => {
    it('returns 3 candidates for ULTRA_CHEAP', () => {
      const candidates = getCandidates('ULTRA_CHEAP');
      expect(candidates).toHaveLength(3);
      expect(candidates[0].provider).toBe('google');
    });

    it('returns 4 candidates for HIGH_QUALITY', () => {
      const candidates = getCandidates('HIGH_QUALITY');
      expect(candidates).toHaveLength(4);
      expect(candidates[0].provider).toBe('anthropic');
    });

    it('returns 3 candidates for FRONTIER', () => {
      const candidates = getCandidates('FRONTIER');
      expect(candidates).toHaveLength(3);
      expect(candidates[0].provider).toBe('anthropic');
      expect(candidates[0].model).toContain('opus');
    });

    it('returns empty array for unknown class', () => {
      expect(getCandidates('NONEXISTENT' as ModelClass)).toEqual([]);
    });
  });

  describe('getPrimary', () => {
    it('FAST_ECONOMY primary is google/gemini-2.5-flash', () => {
      const primary = getPrimary('FAST_ECONOMY');
      expect(primary).not.toBeNull();
      expect(primary!.provider).toBe('google');
      expect(primary!.model).toContain('flash');
    });

    it('FRONTIER primary is anthropic/claude-opus', () => {
      const primary = getPrimary('FRONTIER');
      expect(primary).not.toBeNull();
      expect(primary!.provider).toBe('anthropic');
      expect(primary!.model).toContain('opus');
    });

    it('returns null for unknown class', () => {
      expect(getPrimary('NONEXISTENT' as ModelClass)).toBeNull();
    });
  });

  describe('getFallbacks', () => {
    it('FAST_ECONOMY has 2 fallbacks (excluding primary google)', () => {
      const fallbacks = getFallbacks('FAST_ECONOMY');
      expect(fallbacks).toHaveLength(2);
      expect(fallbacks[0].provider).toBe('openai');
      expect(fallbacks[1].provider).toBe('anthropic');
    });

    it('FAST_VERIFY has 1 fallback', () => {
      const fallbacks = getFallbacks('FAST_VERIFY');
      expect(fallbacks).toHaveLength(1);
      expect(fallbacks[0].provider).toBe('openai');
    });

    it('returns empty for unknown class', () => {
      expect(getFallbacks('NONEXISTENT' as ModelClass)).toEqual([]);
    });
  });
});

// ============================================================================
// Tier Definitions — Config integrity
// ============================================================================
describe('TIER_DEFINITIONS', () => {
  it('has exactly 6 tiers', () => {
    expect(Object.keys(TIER_DEFINITIONS)).toHaveLength(6);
  });

  it('TRIAL is free (no Stripe price, not recurring)', () => {
    expect(TIER_DEFINITIONS.TRIAL.stripePriceId).toBeNull();
    expect(TIER_DEFINITIONS.TRIAL.isRecurring).toBe(false);
    expect(TIER_DEFINITIONS.TRIAL.requestLimit).toBe(50);
    expect(TIER_DEFINITIONS.TRIAL.keyMode).toBe('PLATFORM');
  });

  it('MANUSCRIPT_BYOK requires BYOK keys, not recurring', () => {
    expect(TIER_DEFINITIONS.MANUSCRIPT_BYOK.keyMode).toBe('BYOK');
    expect(TIER_DEFINITIONS.MANUSCRIPT_BYOK.isRecurring).toBe(false);
    expect(TIER_DEFINITIONS.MANUSCRIPT_BYOK.requiresApiKeys).toBe(true);
  });

  it('BYOK_STANDARD has a Stripe price ID', () => {
    expect(TIER_DEFINITIONS.BYOK_STANDARD.stripePriceId).toBeTruthy();
    expect(TIER_DEFINITIONS.BYOK_STANDARD.keyMode).toBe('BYOK');
    expect(TIER_DEFINITIONS.BYOK_STANDARD.isRecurring).toBe(true);
  });

  it('PLATFORM_STANDARD uses platform keys', () => {
    expect(TIER_DEFINITIONS.PLATFORM_STANDARD.keyMode).toBe('PLATFORM');
    expect(TIER_DEFINITIONS.PLATFORM_STANDARD.requiresApiKeys).toBe(false);
  });

  it('ENTERPRISE has unlimited requests', () => {
    expect(TIER_DEFINITIONS.ENTERPRISE.requestLimit).toBe(-1);
  });

  it('all Stripe tiers have unique price IDs', () => {
    const priceIds = Object.values(TIER_DEFINITIONS)
      .map(t => t.stripePriceId)
      .filter(Boolean);
    expect(new Set(priceIds).size).toBe(priceIds.length);
  });

  it('every tier has an intent map entry', () => {
    // Verify that getModelClass works for all tiers with CHAT intent
    const tiers = Object.keys(TIER_DEFINITIONS) as SubscriptionTier[];
    for (const tier of tiers) {
      expect(() => getModelClass(tier, 'CHAT', 'BALANCED')).not.toThrow();
    }
  });
});

// ============================================================================
// Routing Table completeness — every model class has candidates
// ============================================================================
describe('Routing Table completeness', () => {
  const allClasses: ModelClass[] = ['ULTRA_CHEAP', 'FAST_ECONOMY', 'HIGH_QUALITY', 'FRONTIER', 'FAST_VERIFY', 'RAG_VERIFY'];

  it('all 6 model classes have at least 2 candidates', () => {
    for (const cls of allClasses) {
      const candidates = getCandidates(cls);
      expect(candidates.length, `${cls} should have ≥2 candidates`).toBeGreaterThanOrEqual(2);
    }
  });

  it('every candidate has valid provider and model fields', () => {
    for (const cls of allClasses) {
      for (const candidate of getCandidates(cls)) {
        expect(candidate.provider).toBeTruthy();
        expect(candidate.model).toBeTruthy();
        expect(['anthropic', 'openai', 'google', 'deepseek']).toContain(candidate.provider);
      }
    }
  });
});
