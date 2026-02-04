/**
 * Google Gemini Provider Adapter
 *
 * Handles API calls to Gemini models.
 */

import type { Message, CallOptions, ProviderResponse } from '../types';
import { RouterError } from '../types';

/**
 * Call Google Gemini API
 */
export async function callGoogle(
  model: string,
  messages: Message[],
  apiKey: string,
  options: CallOptions = {}
): Promise<ProviderResponse> {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Convert messages to Gemini format
  // System messages become a systemInstruction
  let systemInstruction: string | undefined;
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

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
  // Pricing per 1M tokens
  const PRICING: Record<string, { input: number; output: number }> = {
    'gemini-2.0-pro': { input: 1.25, output: 5.0 },
    'gemini-2.0-flash': { input: 0.075, output: 0.3 },
    'gemini-2.0-flash-lite': { input: 0.0375, output: 0.15 }
  };

  const price = PRICING[model] || { input: 0.075, output: 0.3 }; // Default to Flash pricing

  return (
    (inputTokens / 1_000_000) * price.input +
    (outputTokens / 1_000_000) * price.output
  );
}
