/**
 * Cost Estimation Utility (H2)
 *
 * Approximate cost per 1K tokens (input + output averaged) in cents
 */

const MODEL_COSTS_PER_1K: Record<string, number> = {
  // Anthropic
  'claude-sonnet-4-20250514': 0.9,
  'claude-haiku-4-5-20251001': 0.13,
  'claude-3-5-sonnet-20241022': 0.9,
  'claude-3-haiku-20240307': 0.13,

  // OpenAI
  'gpt-4o': 0.75,
  'gpt-4o-mini': 0.015,
  'gpt-4-turbo': 1.5,
  'gpt-3.5-turbo': 0.05,

  // Google
  'gemini-2.0-flash': 0.01,
  'gemini-1.5-pro': 0.35,
  'gemini-1.5-flash': 0.0375,

  // DeepSeek
  'deepseek-chat': 0.07,
  'deepseek-coder': 0.07,
};

/**
 * Estimate cost in cents for a given model and token count
 */
export function estimateCostCents(model: string, totalTokens: number): number {
  const costPer1K = MODEL_COSTS_PER_1K[model] || 1.0; // default high if unknown
  return Math.ceil((totalTokens / 1000) * costPer1K);
}

/**
 * Get cost per 1K tokens for a model
 */
export function getModelCostPer1K(model: string): number {
  return MODEL_COSTS_PER_1K[model] || 1.0;
}
