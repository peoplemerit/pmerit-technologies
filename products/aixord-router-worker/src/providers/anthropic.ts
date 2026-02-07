/**
 * Anthropic Provider Adapter
 *
 * Handles API calls to Claude models.
 * D14: Prompt caching via anthropic-beta header and cache_control blocks.
 */

import type { Message, CallOptions, ProviderResponse, ImageContent } from '../types';
import { RouterError } from '../types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

// Anthropic content block types
type AnthropicTextBlock = { type: 'text'; text: string; cache_control?: { type: 'ephemeral' } };
type AnthropicImageBlock = {
  type: 'image';
  source: {
    type: 'base64';
    media_type: string;
    data: string;
  };
};
type AnthropicContentBlock = AnthropicTextBlock | AnthropicImageBlock;
type AnthropicContent = string | AnthropicContentBlock[];

// D14: System content block (structured format for caching)
type AnthropicSystemBlock = {
  type: 'text';
  text: string;
  cache_control?: { type: 'ephemeral' };
};

/**
 * Call Anthropic Claude API (ENH-4: vision/images, D14: prompt caching)
 */
export async function callAnthropic(
  model: string,
  messages: Message[],
  apiKey: string,
  options: CallOptions = {},
  images?: ImageContent[]
): Promise<ProviderResponse> {
  // Convert messages to Anthropic format
  // System message goes in system field, not messages array
  let systemPrompt: string | undefined;
  const anthropicMessages: Array<{ role: 'user' | 'assistant'; content: AnthropicContent }> = [];

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

  // ENH-4: If images are provided, convert the last user message to multimodal format
  if (images && images.length > 0 && anthropicMessages.length > 0) {
    const lastIdx = anthropicMessages.length - 1;
    const lastMsg = anthropicMessages[lastIdx];
    if (lastMsg.role === 'user') {
      // Build content array with images + text
      const contentBlocks: AnthropicContentBlock[] = [];

      // Add images first
      for (const img of images) {
        contentBlocks.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: img.media_type,
            data: img.base64,
          },
        });
      }

      // Add text
      contentBlocks.push({
        type: 'text',
        text: lastMsg.content as string,
      });

      // Replace with multimodal content
      anthropicMessages[lastIdx] = {
        role: 'user',
        content: contentBlocks,
      };
    }
  }

  const body: Record<string, unknown> = {
    model,
    max_tokens: options.maxOutputTokens || 4096,
    messages: anthropicMessages
  };

  // D14: System prompt with cache_control for prompt caching
  // Use structured system blocks so Anthropic can cache the system prompt
  if (systemPrompt) {
    const systemBlocks: AnthropicSystemBlock[] = [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ];
    body.system = systemBlocks;
  }

  // D14: Include prompt caching beta header
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': ANTHROPIC_VERSION,
    'anthropic-beta': 'prompt-caching-2024-07-31',
  };

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers,
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
    usage: {
      input_tokens: number;
      output_tokens: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };
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
      output_tokens: data.usage.output_tokens,
      cache_creation_input_tokens: data.usage.cache_creation_input_tokens,
      cache_read_input_tokens: data.usage.cache_read_input_tokens,
    }
  };
}

/**
 * Estimate cost for Anthropic models
 * Prices in USD per 1M tokens (as of 2026)
 * D14: Includes cache read/write pricing
 */
export function estimateAnthropicCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheCreationTokens?: number,
  cacheReadTokens?: number
): number {
  // Pricing per 1M tokens
  const PRICING: Record<string, { input: number; output: number; cacheWrite: number; cacheRead: number }> = {
    'claude-opus-4-20250514': { input: 15.0, output: 75.0, cacheWrite: 18.75, cacheRead: 1.50 },
    'claude-sonnet-4-20250514': { input: 3.0, output: 15.0, cacheWrite: 3.75, cacheRead: 0.30 },
    'claude-3-5-haiku-latest': { input: 0.25, output: 1.25, cacheWrite: 0.30, cacheRead: 0.025 }
  };

  const price = PRICING[model] || { input: 3.0, output: 15.0, cacheWrite: 3.75, cacheRead: 0.30 };

  let cost = (inputTokens / 1_000_000) * price.input +
    (outputTokens / 1_000_000) * price.output;

  // D14: Add cache costs if present
  if (cacheCreationTokens) {
    cost += (cacheCreationTokens / 1_000_000) * price.cacheWrite;
  }
  if (cacheReadTokens) {
    cost += (cacheReadTokens / 1_000_000) * price.cacheRead;
  }

  return cost;
}
