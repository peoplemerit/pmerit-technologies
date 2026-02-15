/**
 * SINGLE SOURCE OF TRUTH — Subscription Tier Definitions
 *
 * HANDOFF-SUBSCRIPTION-LOCKDOWN-01
 *
 * To add a new tier:
 *   1. Add it to TIER_DEFINITIONS below
 *   2. Add intent mapping in routing/intent-map.ts
 *   3. Done. Everything else derives from this file.
 *
 * ALL other files MUST import from here. No hardcoded tier arrays elsewhere.
 */

import type { SubscriptionTier } from '../types';

// =============================================================================
// TIER DEFINITION INTERFACE
// =============================================================================

export interface TierDefinition {
  id: SubscriptionTier;            // Internal tier ID (stored in DB)
  name: string;                    // Display name
  keyMode: 'BYOK' | 'PLATFORM';   // Who provides API keys
  requestLimit: number;            // Monthly AI request limit (-1 = unlimited)
  projectLimit: number;            // Max projects (-1 = unlimited)
  conversationLimit: number;       // Max conversations (-1 = unlimited)
  auditRetentionDays: number;      // How long to keep audit logs (-1 = forever)
  stripePriceId: string | null;    // Stripe price ID (null = no Stripe checkout)
  isRecurring: boolean;            // Monthly subscription vs one-time/free
  requiresApiKeys: boolean;        // Must user configure API keys to use AI?
}

// =============================================================================
// THE 6 CANONICAL TIERS
// =============================================================================

export const TIER_DEFINITIONS: Record<SubscriptionTier, TierDefinition> = {
  TRIAL: {
    id: 'TRIAL',
    name: 'Free Trial',
    keyMode: 'PLATFORM',
    requestLimit: 50,
    projectLimit: 1,
    conversationLimit: 3,
    auditRetentionDays: 7,
    stripePriceId: null,            // Free — no Stripe checkout
    isRecurring: false,
    requiresApiKeys: false,
  },
  MANUSCRIPT_BYOK: {
    id: 'MANUSCRIPT_BYOK',
    name: 'Manuscript',
    keyMode: 'BYOK',
    requestLimit: 500,
    projectLimit: 5,
    conversationLimit: 20,
    auditRetentionDays: 30,
    stripePriceId: null,            // Gumroad/KDP activation — no Stripe checkout
    isRecurring: false,
    requiresApiKeys: true,
  },
  BYOK_STANDARD: {
    id: 'BYOK_STANDARD',
    name: 'Standard (BYOK)',
    keyMode: 'BYOK',
    requestLimit: 1000,
    projectLimit: 10,
    conversationLimit: 50,
    auditRetentionDays: 90,
    stripePriceId: 'price_1SwVtL1Uy2Gsjci2w3a8b5hX',  // $9.99/month
    isRecurring: true,
    requiresApiKeys: true,
  },
  PLATFORM_STANDARD: {
    id: 'PLATFORM_STANDARD',
    name: 'Standard',
    keyMode: 'PLATFORM',
    requestLimit: 500,
    projectLimit: 10,
    conversationLimit: 50,
    auditRetentionDays: 90,
    stripePriceId: 'price_1SwVsN1Uy2Gsjci2CHVecrv9',  // $19.99/month
    isRecurring: true,
    requiresApiKeys: false,
  },
  PLATFORM_PRO: {
    id: 'PLATFORM_PRO',
    name: 'Pro',
    keyMode: 'PLATFORM',
    requestLimit: 2000,
    projectLimit: -1,
    conversationLimit: -1,
    auditRetentionDays: 365,
    stripePriceId: 'price_1SwVq61Uy2Gsjci2Wd6gxdAe',  // $49.99/month
    isRecurring: true,
    requiresApiKeys: false,
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    keyMode: 'PLATFORM',
    requestLimit: -1,
    projectLimit: -1,
    conversationLimit: -1,
    auditRetentionDays: -1,
    stripePriceId: null,            // Contact sales — no self-serve checkout
    isRecurring: true,
    requiresApiKeys: false,
  },
};

// =============================================================================
// DERIVED CONSTANTS — Used by other modules
// =============================================================================

/** All valid tier IDs */
export const ALL_TIER_IDS: SubscriptionTier[] =
  Object.keys(TIER_DEFINITIONS) as SubscriptionTier[];

/** Tier IDs that require user-provided API keys */
export const BYOK_TIER_IDS: SubscriptionTier[] =
  Object.values(TIER_DEFINITIONS)
    .filter(t => t.keyMode === 'BYOK')
    .map(t => t.id);

/** Tier IDs that use platform-managed API keys */
export const PLATFORM_TIER_IDS: SubscriptionTier[] =
  Object.values(TIER_DEFINITIONS)
    .filter(t => t.keyMode === 'PLATFORM')
    .map(t => t.id);

/** Map Stripe price IDs → tier IDs (for webhook processing) */
export const STRIPE_PRICE_TO_TIER: Record<string, SubscriptionTier> =
  Object.fromEntries(
    Object.values(TIER_DEFINITIONS)
      .filter(t => t.stripePriceId)
      .map(t => [t.stripePriceId!, t.id])
  );

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Get full tier definition by ID. Returns undefined for unknown tiers. */
export function getTierDefinition(tierId: string): TierDefinition | undefined {
  return TIER_DEFINITIONS[tierId as SubscriptionTier];
}

/** Get monthly request limit for a tier. Defaults to 50 (trial limit) for unknown tiers. */
export function getRequestLimit(tierId: string): number {
  return TIER_DEFINITIONS[tierId as SubscriptionTier]?.requestLimit ?? 50;
}

/** Check if tier requires user-provided API keys (BYOK). */
export function isByokTier(tierId: string): boolean {
  return BYOK_TIER_IDS.includes(tierId as SubscriptionTier);
}

/** Check if tier uses platform-managed API keys. */
export function isPlatformTier(tierId: string): boolean {
  return PLATFORM_TIER_IDS.includes(tierId as SubscriptionTier);
}

/** Check if a string is a valid tier ID. */
export function isValidTier(tierId: string): boolean {
  return ALL_TIER_IDS.includes(tierId as SubscriptionTier);
}

/** Get tier limits in the format expected by types.ts TIER_LIMITS. */
export function getTierLimits(tierId: string): {
  maxRequests: number;
  maxProjects: number;
  maxConversations: number;
  auditRetentionDays: number;
} {
  const def = TIER_DEFINITIONS[tierId as SubscriptionTier];
  if (!def) {
    return { maxRequests: 50, maxProjects: 1, maxConversations: 3, auditRetentionDays: 7 };
  }
  return {
    maxRequests: def.requestLimit,
    maxProjects: def.projectLimit,
    maxConversations: def.conversationLimit,
    auditRetentionDays: def.auditRetentionDays,
  };
}
