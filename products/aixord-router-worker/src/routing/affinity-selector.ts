/**
 * Affinity-Based Model Selector
 *
 * AIXORD PATCH-MOD-01: Multi-Model Governance
 *
 * Wraps existing model selection with intent-based affinity preferences.
 * Backward compatible: if no RouterIntent provided, defaults to mode-based selection.
 */

import type {
  RouterIntent,
  Provider,
  Mode,
  SubscriptionTier,
  ModelClass,
  ProviderModel
} from '../types';
import {
  getAffinityForIntent,
  getPreferredProvider,
  routerIntentToBaseIntent
} from '../config/model-affinities';
import { getModelClass } from './intent-map';
import { getCandidates } from './table';

/**
 * Selection result with rationale for audit
 */
export interface AffinitySelection {
  modelClass: ModelClass;
  candidates: ProviderModel[];
  preferredProvider: Provider | null;
  rationale: string;
  affinityUsed: boolean;
}

/**
 * Select model class and candidates with affinity consideration
 *
 * Selection priority:
 * 1. Map RouterIntent to base Intent for class selection
 * 2. Get candidates for that class
 * 3. If affinity match available, reorder candidates to prefer affinity
 * 4. Return selection with rationale
 */
export function selectWithAffinity(
  routerIntent: RouterIntent | undefined,
  tier: SubscriptionTier,
  mode: Mode,
  availableProviders: Provider[]
): AffinitySelection {
  // Default intent if not provided (backward compatibility)
  const effectiveIntent: RouterIntent = routerIntent || 'CHAT';

  // Map to base intent for existing tier-based model class selection
  const baseIntent = routerIntentToBaseIntent(effectiveIntent);

  // Get model class from existing logic
  const modelClass = getModelClass(tier, baseIntent, mode);

  // Get all candidates for this class
  const allCandidates = getCandidates(modelClass);

  // Filter to available providers
  const availableCandidates = allCandidates.filter(c =>
    availableProviders.includes(c.provider)
  );

  // Get affinity for this intent
  const affinity = getAffinityForIntent(effectiveIntent);

  // Try to find preferred provider
  const preferredProvider = getPreferredProvider(effectiveIntent, availableProviders);

  // Determine if we should use affinity-based ordering
  let candidates = availableCandidates;
  let rationale = '';
  let affinityUsed = false;

  if (preferredProvider && affinity.fallback === 'first') {
    // Reorder candidates to put preferred provider first
    const preferred = availableCandidates.filter(c => c.provider === preferredProvider);
    const others = availableCandidates.filter(c => c.provider !== preferredProvider);
    candidates = [...preferred, ...others];
    rationale = `Affinity match: ${affinity.rationale}`;
    affinityUsed = true;
  } else if (preferredProvider && affinity.fallback === 'mode') {
    // Mode-based selection but log that affinity was considered
    rationale = `Mode-based selection with affinity consideration (intent: ${effectiveIntent})`;
    affinityUsed = false;
  } else {
    // No preferred provider available, full fallback
    rationale = `No affinity match available (intent: ${effectiveIntent}, fallback: ${affinity.fallback})`;
    affinityUsed = false;
  }

  return {
    modelClass,
    candidates,
    preferredProvider,
    rationale,
    affinityUsed
  };
}

/**
 * Get selection metadata for response/logging
 */
export function getSelectionMetadata(
  selection: AffinitySelection,
  usedProvider: Provider,
  usedModel: string
): {
  intent_affinity_used: boolean;
  preferred_provider: Provider | null;
  selection_rationale: string;
} {
  return {
    intent_affinity_used: selection.affinityUsed,
    preferred_provider: selection.preferredProvider,
    selection_rationale: selection.rationale
  };
}
