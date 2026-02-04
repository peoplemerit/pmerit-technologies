/**
 * Anthropic Provider Adapter
 *
 * Handles API calls to Claude models.
 */

import type { Message, CallOptions, ProviderResponse } from '../types';
import { RouterError } from '../types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

/**
 * Call Anthropic Claude API
 */
export async function callAnthropic(
  model: string,
  messages: Message[],
  apiKey: string,
  options: CallOptions = {}
): Promise<ProviderResponse> {
  // Convert messages to Anthropic format
  // System message goes in system field, not messages array
  let systemPrompt: string | undefined;
  const anthropicMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemPrompt = msg.content;
    } else {
      anthropicMessages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      });
    }
  }

  const body: Record<string, unknown> = {
    model,
    max_tokens: options.maxOutputTokens || 4096,
    messages: anthropicMessages
  };

  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new RouterError(
      'ANTHROPIC_ERROR',
      `Anthropic API error: ${response.status} - ${errorText}`,
      response.status >= 500 ? 503 : 400
    );
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
    usage: { input_tokens: number; output_tokens: number };
  };

  // Extract text from content blocks
  const textContent = data.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');

  return {
    content: textContent,
    usage: {
      input_tokens: data.usage.input_tokens,
      output_tokens: data.usage.output_tokens
    }
  };
}

/**
 * Estimate cost for Anthropic models
 * Prices in USD per 1M tokens (as of 2026)
 */
export function estimateAnthropicCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  // Pricing per 1M tokens
  const PRICING: Record<string, { input: number; output: number }> = {
    'claude-opus-4-20250514': { input: 15.0, output: 75.0 },
    'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
    'claude-3-5-haiku-latest': { input: 0.25, output: 1.25 }
  };

  const price = PRICING[model] || { input: 3.0, output: 15.0 }; // Default to Sonnet pricing

  return (
    (inputTokens / 1_000_000) * price.input +
    (outputTokens / 1_000_000) * price.output
  );
}
