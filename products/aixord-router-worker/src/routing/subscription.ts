/**
 * Subscription Validation
 *
 * Validates subscription status and enforces usage limits.
 */

import type { RouterRequest, Env, SubscriptionTier } from '../types';
import { RouterError, TIER_LIMITS } from '../types';

/**
 * Validate subscription before processing request
 */
export async function validateSubscription(
  request: RouterRequest,
  db: D1Database
): Promise<void> {
  const { tier, key_mode, user_api_key } = request.subscription;
  const { user_id } = request.trace;

  // 1. Verify BYOK tiers have user key
  // TRIAL is excluded — trial users can use BYOK or platform keys (dual-mode)
  const byokTiers: SubscriptionTier[] = ['MANUSCRIPT_BYOK', 'BYOK_STANDARD'];
  if (byokTiers.includes(tier) && key_mode !== 'BYOK') {
    throw new RouterError(
      'BYOK_REQUIRED',
      `Subscription tier ${tier} requires BYOK mode`,
      403
    );
  }

  if (key_mode === 'BYOK' && !user_api_key) {
    throw new RouterError(
      'BYOK_KEY_MISSING',
      'BYOK mode requires user_api_key',
      400
    );
  }

  // 2. Check subscription is active (skip for TRIAL)
  if (tier !== 'TRIAL') {
    const subscription = await db.prepare(`
      SELECT * FROM subscriptions
      WHERE user_id = ? AND status = 'active'
    `).bind(user_id).first();

    if (!subscription) {
      throw new RouterError(
        'NO_ACTIVE_SUBSCRIPTION',
        'No active subscription found. Please subscribe or use TRIAL tier.',
        403
      );
    }

    // Verify tier matches
    if (subscription.tier !== tier) {
      throw new RouterError(
        'TIER_MISMATCH',
        `Subscription tier ${subscription.tier} does not match requested tier ${tier}`,
        403
      );
    }
  }

  // 3. Check usage limits
  const limits = TIER_LIMITS[tier];
  if (limits.maxRequests !== -1) { // -1 means unlimited
    const usage = await db.prepare(`
      SELECT requests_used FROM usage
      WHERE user_id = ? AND period_end > datetime('now')
      ORDER BY period_end DESC
      LIMIT 1
    `).bind(user_id).first<{ requests_used: number }>();

    if (usage && usage.requests_used >= limits.maxRequests) {
      throw new RouterError(
        'LIMIT_EXCEEDED',
        `Monthly limit of ${limits.maxRequests} requests reached. Upgrade your plan or wait for reset.`,
        429
      );
    }
  }
}

/**
 * Increment usage counter after successful request
 */
export async function incrementUsage(
  request: RouterRequest,
  inputTokens: number,
  outputTokens: number,
  costUsd: number,
  db: D1Database
): Promise<void> {
  const { user_id } = request.trace;

  // Get or create current usage period
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Try to update existing usage record
  const result = await db.prepare(`
    UPDATE usage
    SET
      requests_used = requests_used + 1,
      tokens_input = tokens_input + ?,
      tokens_output = tokens_output + ?,
      cost_usd = cost_usd + ?
    WHERE user_id = ?
      AND period_start = ?
      AND period_end = ?
  `).bind(
    inputTokens,
    outputTokens,
    costUsd,
    user_id,
    periodStart.toISOString(),
    periodEnd.toISOString()
  ).run();

  // If no rows updated, create new usage record
  if (result.changes === 0) {
    const id = crypto.randomUUID();
    await db.prepare(`
      INSERT INTO usage (id, user_id, period_start, period_end, requests_used, tokens_input, tokens_output, cost_usd)
      VALUES (?, ?, ?, ?, 1, ?, ?, ?)
    `).bind(
      id,
      user_id,
      periodStart.toISOString(),
      periodEnd.toISOString(),
      inputTokens,
      outputTokens,
      costUsd
    ).run();
  }
}

/**
 * Get current usage for a user
 */
export async function getUsage(
  userId: string,
  db: D1Database
): Promise<{ requests_used: number; tokens_input: number; tokens_output: number; cost_usd: number } | null> {
  const usage = await db.prepare(`
    SELECT requests_used, tokens_input, tokens_output, cost_usd
    FROM usage
    WHERE user_id = ? AND period_end > datetime('now')
    ORDER BY period_end DESC
    LIMIT 1
  `).bind(userId).first<{
    requests_used: number;
    tokens_input: number;
    tokens_output: number;
    cost_usd: number;
  }>();

  return usage || null;
}
