/**
 * OpenAI Provider Adapter
 *
 * Handles API calls to GPT models.
 * D15: OpenAI prompt caching is automatic for GPT-4o and later models.
 * No special headers needed — caching is server-side and applied when
 * the same prompt prefix is reused within the cache TTL window.
 * Cached tokens are reported in usage.prompt_tokens_details.cached_tokens.
 */

import type { Message, CallOptions, ProviderResponse, ImageContent } from '../types';
import { RouterError } from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// OpenAI content types for multimodal messages
type OpenAITextPart = { type: 'text'; text: string };
type OpenAIImagePart = { type: 'image_url'; image_url: { url: string; detail?: 'auto' | 'low' | 'high' } };
type OpenAIContentPart = OpenAITextPart | OpenAIImagePart;
type OpenAIContent = string | OpenAIContentPart[];

/**
 * Call OpenAI API (ENH-4: Now supports vision/images)
 */
export async function callOpenAI(
  model: string,
  messages: Message[],
  apiKey: string,
  options: CallOptions = {},
  images?: ImageContent[]
): Promise<ProviderResponse> {
  // Build OpenAI messages format
  const openaiMessages: Array<{ role: string; content: OpenAIContent }> = messages.map(m => ({
    role: m.role,
    content: m.content as OpenAIContent
  }));

  // ENH-4: If images are provided, convert the last user message to multimodal format
  if (images && images.length > 0 && openaiMessages.length > 0) {
    const lastIdx = openaiMessages.length - 1;
    const lastMsg = openaiMessages[lastIdx];
    if (lastMsg.role === 'user') {
      const contentParts: OpenAIContentPart[] = [];

      // Add images as base64 data URLs
      for (const img of images) {
        contentParts.push({
          type: 'image_url',
          image_url: {
            url: `data:${img.media_type};base64,${img.base64}`,
            detail: 'auto',
          },
        });
      }

      // Add text
      contentParts.push({
        type: 'text',
        text: lastMsg.content as string,
      });

      openaiMessages[lastIdx] = {
        role: 'user',
        content: contentParts,
      };
    }
  }

  const body = {
    model,
    max_tokens: options.maxOutputTokens || 4096,
    messages: openaiMessages,
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
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      prompt_tokens_details?: { cached_tokens?: number };
    };
  };

  // D15: Report cached tokens if available
  const cachedTokens = data.usage.prompt_tokens_details?.cached_tokens;

  return {
    content: data.choices[0]?.message?.content || '',
    usage: {
      input_tokens: data.usage.prompt_tokens,
      output_tokens: data.usage.completion_tokens,
      cache_read_input_tokens: cachedTokens,
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
