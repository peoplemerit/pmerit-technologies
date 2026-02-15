/**
 * Model Routing Table
 *
 * Maps model classes to provider/model combinations with fallbacks.
 * This is the ONLY place that knows about specific model names.
 */

import type { ModelClass, ProviderModel } from '../types';

/**
 * Routing table: ModelClass -> Provider/Model candidates (in priority order)
 *
 * Based on MODEL_ROUTER_SPEC.md Section 8
 */
export const ROUTING_TABLE: Record<ModelClass, ProviderModel[]> = {
  ULTRA_CHEAP: [
    { provider: 'google', model: 'gemini-2.0-flash-lite' },
    { provider: 'deepseek', model: 'deepseek-chat' },
    { provider: 'openai', model: 'gpt-4o-mini' }
  ],

  FAST_ECONOMY: [
    { provider: 'google', model: 'gemini-2.0-flash' },
    { provider: 'openai', model: 'gpt-4o-mini' },
    { provider: 'anthropic', model: 'claude-3-5-haiku-20241022' }
  ],

  HIGH_QUALITY: [
    { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
    { provider: 'openai', model: 'gpt-4o' },
    { provider: 'google', model: 'gemini-2.0-pro' },
    { provider: 'deepseek', model: 'deepseek-chat' }
  ],

  FRONTIER: [
    { provider: 'anthropic', model: 'claude-3-opus-20240229' },
    { provider: 'openai', model: 'gpt-4.5-preview' },
    { provider: 'google', model: 'gemini-2.0-pro' }
  ],

  FAST_VERIFY: [
    { provider: 'google', model: 'gemini-2.0-flash' },
    { provider: 'openai', model: 'gpt-4o-mini' }
  ],

  RAG_VERIFY: [
    { provider: 'google', model: 'gemini-2.0-pro' },
    { provider: 'openai', model: 'gpt-4o' }
  ]
};

/**
 * Get candidates for a model class
 */
export function getCandidates(modelClass: ModelClass): ProviderModel[] {
  return ROUTING_TABLE[modelClass] || [];
}

/**
 * Get primary (first choice) model for a class
 */
export function getPrimary(modelClass: ModelClass): ProviderModel | null {
  const candidates = getCandidates(modelClass);
  return candidates.length > 0 ? candidates[0] : null;
}

/**
 * Get fallback models (all except primary)
 */
export function getFallbacks(modelClass: ModelClass): ProviderModel[] {
  const candidates = getCandidates(modelClass);
  return candidates.slice(1);
}
