/**
 * Provider Index
 *
 * Unified interface for calling any provider.
 */

import type { Provider, Message, CallOptions, ProviderResponse, ProviderModel, Env } from '../types';
import { RouterError } from '../types';
import { callAnthropic, estimateAnthropicCost } from './anthropic';
import { callOpenAI, estimateOpenAICost } from './openai';
import { callGoogle, estimateGoogleCost } from './google';
import { callDeepSeek, estimateDeepSeekCost } from './deepseek';

/**
 * Call a provider with the given model and messages
 */
export async function callProvider(
  candidate: ProviderModel,
  messages: Message[],
  apiKey: string,
  options: CallOptions = {}
): Promise<ProviderResponse> {
  switch (candidate.provider) {
    case 'anthropic':
      return callAnthropic(candidate.model, messages, apiKey, options);
    case 'openai':
      return callOpenAI(candidate.model, messages, apiKey, options);
    case 'google':
      return callGoogle(candidate.model, messages, apiKey, options);
    case 'deepseek':
      return callDeepSeek(candidate.model, messages, apiKey, options);
    default:
      throw new RouterError(
        'UNKNOWN_PROVIDER',
        `Unknown provider: ${candidate.provider}`,
        400
      );
  }
}

/**
 * Estimate cost for a provider/model
 */
export function estimateCost(
  provider: Provider,
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  switch (provider) {
    case 'anthropic':
      return estimateAnthropicCost(model, inputTokens, outputTokens);
    case 'openai':
      return estimateOpenAICost(model, inputTokens, outputTokens);
    case 'google':
      return estimateGoogleCost(model, inputTokens, outputTokens);
    case 'deepseek':
      return estimateDeepSeekCost(model, inputTokens, outputTokens);
    default:
      return 0;
  }
}

// Re-export individual providers
export { callAnthropic, estimateAnthropicCost } from './anthropic';
export { callOpenAI, estimateOpenAICost } from './openai';
export { callGoogle, estimateGoogleCost } from './google';
export { callDeepSeek, estimateDeepSeekCost } from './deepseek';
