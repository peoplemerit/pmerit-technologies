/**
 * Google Gemini Provider Adapter
 *
 * Handles API calls to Gemini models.
 */

import type { Message, CallOptions, ProviderResponse, ImageContent } from '../types';
import { RouterError } from '../types';

// Gemini content part types
type GeminiTextPart = { text: string };
type GeminiInlineDataPart = { inline_data: { mime_type: string; data: string } };
type GeminiPart = GeminiTextPart | GeminiInlineDataPart;

/**
 * Call Google Gemini API (ENH-4: Now supports vision/images)
 */
export async function callGoogle(
  model: string,
  messages: Message[],
  apiKey: string,
  options: CallOptions = {},
  images?: ImageContent[]
): Promise<ProviderResponse> {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Convert messages to Gemini format
  // System messages become a systemInstruction
  let systemInstruction: string | undefined;
  const contents: Array<{ role: 'user' | 'model'; parts: GeminiPart[] }> = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemInstruction = msg.content;
    } else {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
  }

  // ENH-4: If images are provided, add as inline_data parts to the last user message
  if (images && images.length > 0 && contents.length > 0) {
    const lastIdx = contents.length - 1;
    const lastContent = contents[lastIdx];
    if (lastContent.role === 'user') {
      const parts: GeminiPart[] = [];

      // Add images first
      for (const img of images) {
        parts.push({
          inline_data: {
            mime_type: img.media_type,
            data: img.base64,
          },
        });
      }

      // Add existing text parts
      parts.push(...lastContent.parts);

      contents[lastIdx] = {
        role: 'user',
        parts,
      };
    }
  }

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: options.maxOutputTokens || 4096
    }
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    
    // Enhanced error logging for Google API issues
    console.error(`[Google Provider] API error ${response.status}:`, errorText);
    console.error(`[Google Provider] Request URL: ${apiUrl.replace(/key=.+$/, 'key=***')}`);
    console.error(`[Google Provider] Model: ${model}`);
    
    throw new RouterError(
      'GOOGLE_ERROR',
      `Google API error: ${response.status} - ${errorText}`,
      response.status >= 500 ? 503 : 400
    );
  }

  const data = await response.json() as {
    candidates: Array<{
      content: { parts: Array<{ text: string }> };
    }>;
    usageMetadata: {
      promptTokenCount: number;
      candidatesTokenCount: number;
    };
  };

  const textContent = data.candidates?.[0]?.content?.parts
    ?.map(p => p.text)
    ?.join('') || '';

  return {
    content: textContent,
    usage: {
      input_tokens: data.usageMetadata?.promptTokenCount || 0,
      output_tokens: data.usageMetadata?.candidatesTokenCount || 0
    }
  };
}

/**
 * Estimate cost for Google models
 * Prices in USD per 1M tokens (as of 2026)
 */
export function estimateGoogleCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  // Pricing per 1M tokens (updated 2026-02-15)
  const PRICING: Record<string, { input: number; output: number }> = {
    'gemini-2.5-pro': { input: 1.25, output: 5.0 },
    'gemini-2.5-flash': { input: 0.075, output: 0.3 },
    'gemini-2.5-flash-lite': { input: 0.0375, output: 0.15 },
  };

  const price = PRICING[model] || { input: 0.075, output: 0.3 }; // Default to Flash pricing

  return (
    (inputTokens / 1_000_000) * price.input +
    (outputTokens / 1_000_000) * price.output
  );
}
