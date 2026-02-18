/**
 * DeepSeek Provider Adapter
 *
 * Handles API calls to DeepSeek models.
 * DeepSeek uses OpenAI-compatible API format.
 */

import type { Message, CallOptions, ProviderResponse } from '../types';
import { RouterError } from '../types';
import { log } from '../utils/logger';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * Call DeepSeek API (OpenAI-compatible)
 */
export async function callDeepSeek(
  model: string,
  messages: Message[],
  apiKey: string,
  options: CallOptions = {}
): Promise<ProviderResponse> {
  const body = {
    model,
    max_tokens: options.maxOutputTokens || 4096,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content
    }))
  };

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    
    // Structured error logging (no auth header presence — security concern)
    log.error('deepseek_api_error', { status: response.status, model });
    
    throw new RouterError(
      'DEEPSEEK_ERROR',
      `DeepSeek API error: ${response.status} - ${errorText}`,
      response.status >= 500 ? 503 : 400
    );
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
    usage: { prompt_tokens: number; completion_tokens: number };
  };

  return {
    content: data.choices[0]?.message?.content || '',
    usage: {
      input_tokens: data.usage.prompt_tokens,
      output_tokens: data.usage.completion_tokens
    }
  };
}

/**
 * Estimate cost for DeepSeek models
 * Prices in USD per 1M tokens (as of 2026)
 */
export function estimateDeepSeekCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  // Pricing per 1M tokens (DeepSeek is very cheap)
  const PRICING: Record<string, { input: number; output: number }> = {
    'deepseek-chat': { input: 0.14, output: 0.28 },
    'deepseek-coder': { input: 0.14, output: 0.28 }
  };

  const price = PRICING[model] || { input: 0.14, output: 0.28 };

  return (
    (inputTokens / 1_000_000) * price.input +
    (outputTokens / 1_000_000) * price.output
  );
}
