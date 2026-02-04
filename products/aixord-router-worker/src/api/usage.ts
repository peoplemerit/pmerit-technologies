/**
 * Usage API (H2)
 *
 * Per HANDOFF-D4-COMPREHENSIVE-V12:
 * - GET /api/v1/usage — current period usage
 * - GET /api/v1/usage/history — past 6 months
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import { getTierLimit } from '../middleware/entitlement';

const usage = new Hono<{ Bindings: Env }>();
usage.use('/*', requireAuth);

/**
 * GET /api/v1/usage — current period usage
 */
usage.get('/', async (c) => {
  const userId = c.get('userId');
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const user = await c.env.DB.prepare(
    'SELECT subscription_tier, trial_expires_at FROM users WHERE id = ?'
  ).bind(userId).first<{
    subscription_tier: string;
    trial_expires_at: string | null;
  }>();

  const current = await c.env.DB.prepare(
    'SELECT request_count, token_count, estimated_cost_cents, code_task_count FROM usage_tracking WHERE user_id = ? AND period = ?'
  ).bind(userId, currentPeriod).first<{
    request_count: number;
    token_count: number;
    estimated_cost_cents: number;
    code_task_count: number;
  }>();

  const tier = user?.subscription_tier || 'TRIAL';
  const limit = getTierLimit(tier);
  const used = current?.request_count || 0;

  // Calculate trial info
  let trial = null;
  if (tier === 'TRIAL' && user?.trial_expires_at) {
    const expiresAt = new Date(user.trial_expires_at);
    const daysLeft = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / 86400000));
    trial = {
      expires_at: user.trial_expires_at,
      days_left: daysLeft
    };
  }

  return c.json({
    period: currentPeriod,
    tier,
    requests: { used, limit, remaining: Math.max(0, limit - used) },
    tokens: { used: current?.token_count || 0 },
    estimated_cost_cents: current?.estimated_cost_cents || 0,
    code_tasks: { used: current?.code_task_count || 0 },
    trial
  });
});

/**
 * GET /api/v1/usage/history — past 6 months
 */
usage.get('/history', async (c) => {
  const userId = c.get('userId');
  const history = await c.env.DB.prepare(
    'SELECT period, request_count, token_count, estimated_cost_cents, code_task_count FROM usage_tracking WHERE user_id = ? ORDER BY period DESC LIMIT 6'
  ).bind(userId).all();

  return c.json({ history: history.results });
});

export { usage };
