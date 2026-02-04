/**
 * Entitlement Middleware (H1/H2)
 *
 * Per HANDOFF-D4-COMPREHENSIVE-V12:
 * - Checks trial expiration
 * - Enforces per-tier request limits
 * - Tracks usage per billing period
 */

import { Context, Next } from 'hono';
import type { Env } from '../types';

interface EntitlementResult {
  allowed: boolean;
  reason?: string;
  tier: string;
  remaining_requests: number;
  trial_days_left?: number;
}

// Tier limits per month
const TIER_LIMITS: Record<string, number> = {
  'TRIAL': 50,            // 50 total during trial (not per month)
  'MANUSCRIPT_BYOK': 500,
  'BYOK_STANDARD': 1000,
  'PLATFORM_STANDARD': 500,
  'PLATFORM_PRO': 2000,
  'ENTERPRISE': 999999,
};

/**
 * Middleware to check user entitlement before AI requests
 */
export async function checkEntitlement(c: Context<{ Bindings: Env }>, next: Next) {
  const userId = c.get('userId');

  if (!userId) {
    return c.json({ error: 'UNAUTHORIZED' }, 401);
  }

  const user = await c.env.DB.prepare(
    'SELECT subscription_tier, trial_expires_at FROM users WHERE id = ?'
  ).bind(userId).first<{
    subscription_tier: string;
    trial_expires_at: string | null;
  }>();

  if (!user) {
    return c.json({ error: 'USER_NOT_FOUND' }, 404);
  }

  const tier = user.subscription_tier || 'TRIAL';
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Check trial expiration
  if (tier === 'TRIAL') {
    const expiresAt = user.trial_expires_at ? new Date(user.trial_expires_at) : null;
    if (expiresAt && now > expiresAt) {
      return c.json({
        error: 'TRIAL_EXPIRED',
        message: 'Your 14-day trial has expired. Please upgrade to continue.',
        upgrade_url: '/pricing'
      }, 403);
    }
  }

  // Get current usage
  const usage = await c.env.DB.prepare(
    'SELECT request_count, code_task_count FROM usage_tracking WHERE user_id = ? AND period = ?'
  ).bind(userId, currentPeriod).first<{
    request_count: number;
    code_task_count: number;
  }>();

  const requestCount = usage?.request_count || 0;
  const limit = TIER_LIMITS[tier] || 50;
  const remaining = Math.max(0, limit - requestCount);

  if (remaining <= 0) {
    return c.json({
      error: 'ALLOWANCE_EXHAUSTED',
      message: `You've used all ${limit} requests for this period. Upgrade for more.`,
      upgrade_url: '/pricing',
      usage: { used: requestCount, limit, period: currentPeriod }
    }, 429);
  }

  // Calculate trial days left
  let trialDaysLeft: number | undefined;
  if (tier === 'TRIAL' && user.trial_expires_at) {
    const expiresAt = new Date(user.trial_expires_at);
    trialDaysLeft = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / 86400000));
  }

  // Store entitlement info in header for downstream access
  c.res.headers.set('X-Entitlement-Tier', tier);
  c.res.headers.set('X-Entitlement-Remaining', String(remaining));
  if (trialDaysLeft !== undefined) {
    c.res.headers.set('X-Trial-Days-Left', String(trialDaysLeft));
  }

  await next();
}

/**
 * Call after each successful AI request to increment counter
 */
export async function incrementUsage(
  db: D1Database,
  userId: string,
  tokensUsed: number,
  estimatedCostCents: number,
  isCodeTask: boolean = false
): Promise<void> {
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  await db.prepare(`
    INSERT INTO usage_tracking (user_id, period, request_count, token_count, estimated_cost_cents, code_task_count, updated_at)
    VALUES (?, ?, 1, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, period) DO UPDATE SET
      request_count = request_count + 1,
      token_count = token_count + ?,
      estimated_cost_cents = estimated_cost_cents + ?,
      code_task_count = code_task_count + ?,
      updated_at = datetime('now')
  `).bind(
    userId, period, tokensUsed, estimatedCostCents, isCodeTask ? 1 : 0,
    tokensUsed, estimatedCostCents, isCodeTask ? 1 : 0
  ).run();
}

/**
 * Get tier limit for a subscription tier
 */
export function getTierLimit(tier: string): number {
  return TIER_LIMITS[tier] || 50;
}
