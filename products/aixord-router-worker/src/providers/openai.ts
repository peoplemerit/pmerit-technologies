/**
 * OpenAI Provider Adapter
 *
 * Handles API calls to GPT models.
 */

import type { Message, CallOptions, ProviderResponse } from '../types';
import { RouterError } from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Call OpenAI API
 */
export async function callOpenAI(
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

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new RouterError(
      'OPENAI_ERROR',
      `OpenAI API error: ${response.status} - ${errorText}`,
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
 * Estimate cost for OpenAI models
 * Prices in USD per 1M tokens (as of 2026)
 */
export function estimateOpenAICost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  // Pricing per 1M tokens
  const PRICING: Record<string, { input: number; output: number }> = {
    'gpt-4.5-preview': { input: 75.0, output: 150.0 },
    'gpt-4o': { input: 2.5, output: 10.0 },
    'gpt-4o-mini': { input: 0.15, output: 0.6 }
  };

  const price = PRICING[model] || { input: 2.5, output: 10.0 }; // Default to GPT-4o pricing

  return (
    (inputTokens / 1_000_000) * price.input +
    (outputTokens / 1_000_000) * price.output
  );
}
