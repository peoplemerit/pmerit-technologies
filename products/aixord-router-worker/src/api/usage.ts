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

/**
 * GET /api/v1/usage/projects — D16: Per-project metrics
 * Aggregates usage data across all sessions for each project.
 */
usage.get('/projects', async (c) => {
  const userId = c.get('userId');

  // Get all projects owned by user
  const projects = await c.env.DB.prepare(
    'SELECT id, name FROM projects WHERE owner_id = ?'
  ).bind(userId).all<{ id: string; name: string }>();

  const projectMetrics = [];

  for (const project of projects.results) {
    // Count sessions
    const sessionCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM project_sessions WHERE project_id = ?'
    ).bind(project.id).first<{ count: number }>();

    // Count messages
    const messageCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM messages WHERE project_id = ?'
    ).bind(project.id).first<{ count: number }>();

    // Aggregate token/cost from assistant message metadata
    const assistantMessages = await c.env.DB.prepare(
      "SELECT metadata FROM messages WHERE project_id = ? AND role = 'assistant'"
    ).bind(project.id).all<{ metadata: string }>();

    let totalTokens = 0;
    let totalCost = 0;

    for (const msg of assistantMessages.results) {
      try {
        const meta = JSON.parse(msg.metadata || '{}');
        if (meta.usage) {
          totalTokens += (meta.usage.inputTokens || 0) + (meta.usage.outputTokens || 0);
          totalCost += meta.usage.costUsd || 0;
        }
      } catch {
        // Skip unparseable
      }
    }

    projectMetrics.push({
      project_id: project.id,
      project_name: project.name,
      sessions: sessionCount?.count || 0,
      messages: messageCount?.count || 0,
      tokens: totalTokens,
      cost_usd: totalCost,
    });
  }

  return c.json({ projects: projectMetrics });
});

export { usage };
