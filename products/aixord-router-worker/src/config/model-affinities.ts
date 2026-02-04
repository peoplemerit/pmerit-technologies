/**
 * Model Affinity Configuration
 *
 * AIXORD PATCH-MOD-01: Multi-Model Governance
 *
 * This configuration defines which providers are preferred for each intent type.
 * Based on model strength analysis:
 * - Anthropic (Claude): Precision, rule adherence, structured output
 * - OpenAI (GPT): Fluency, synthesis, exploration
 * - Google (Gemini): Balanced, multimodal
 * - DeepSeek: Cost-effective, code-focused
 */

import type { ModelAffinity, RouterIntent, Provider } from '../types';

export const MODEL_AFFINITIES: ModelAffinity[] = [
  {
    intent: 'CHAT',
    preferred: ['anthropic', 'openai', 'google', 'deepseek'],
    rationale: 'General chat: balanced selection by mode preference',
    fallback: 'mode'
  },
  {
    intent: 'VERIFY',
    preferred: ['anthropic', 'openai'],
    rationale: 'Verification requires precision and rule adherence (Claude strength)',
    fallback: 'first'
  },
  {
    intent: 'EXTRACT',
    preferred: ['anthropic', 'openai'],
    rationale: 'Structured extraction requires format discipline (Claude strength)',
    fallback: 'first'
  },
  {
    intent: 'CLASSIFY',
    preferred: ['anthropic', 'openai', 'google'],
    rationale: 'Classification: all major models capable',
    fallback: 'mode'
  },
  {
    intent: 'BRAINSTORM',
    preferred: ['openai', 'anthropic', 'google'],
    rationale: 'Ideation benefits from flexibility (GPT strength)',
    fallback: 'first'
  },
  {
    intent: 'SUMMARIZE',
    preferred: ['openai', 'anthropic', 'google'],
    rationale: 'Synthesis benefits from fluency (GPT strength)',
    fallback: 'first'
  },
  {
    intent: 'IMPLEMENT',
    preferred: ['anthropic', 'deepseek', 'openai'],
    rationale: 'Code generation: Claude precise, DeepSeek cost-effective',
    fallback: 'mode'
  },
  {
    intent: 'AUDIT',
    preferred: ['anthropic'],
    rationale: 'Audit requires strict reconciliation discipline (Claude strength)',
    fallback: 'first'
  },
  {
    intent: 'RAG_VERIFY',
    preferred: ['google', 'openai'],
    rationale: 'RAG verification: Gemini strong at grounded responses',
    fallback: 'first'
  }
];

/**
 * Get affinity for a given intent
 */
export function getAffinityForIntent(intent: RouterIntent): ModelAffinity {
  const affinity = MODEL_AFFINITIES.find(a => a.intent === intent);
  // Default to CHAT affinity if intent not found
  return affinity || MODEL_AFFINITIES.find(a => a.intent === 'CHAT')!;
}

/**
 * Check if a provider is preferred for an intent
 */
export function isProviderPreferred(intent: RouterIntent, provider: Provider): boolean {
  const affinity = getAffinityForIntent(intent);
  return affinity.preferred.includes(provider);
}

/**
 * Get preferred provider for intent (first available)
 */
export function getPreferredProvider(
  intent: RouterIntent,
  availableProviders: Provider[]
): Provider | null {
  const affinity = getAffinityForIntent(intent);
  for (const preferred of affinity.preferred) {
    if (availableProviders.includes(preferred)) {
      return preferred;
    }
  }
  return null;
}

/**
 * Map RouterIntent to base Intent for existing routing logic
 */
export function routerIntentToBaseIntent(routerIntent: RouterIntent): 'CHAT' | 'VERIFY' | 'EXTRACT' | 'CLASSIFY' | 'RAG_VERIFY' {
  // Map extended intents to base intents for existing tier-based routing
  switch (routerIntent) {
    case 'CHAT':
    case 'BRAINSTORM':
    case 'SUMMARIZE':
      return 'CHAT';
    case 'VERIFY':
    case 'AUDIT':
      return 'VERIFY';
    case 'EXTRACT':
    case 'IMPLEMENT':
      return 'EXTRACT';
    case 'CLASSIFY':
      return 'CLASSIFY';
    case 'RAG_VERIFY':
      return 'RAG_VERIFY';
    default:
      return 'CHAT';
  }
}
