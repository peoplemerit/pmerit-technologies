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

  const tier = user?.subscription_tier || 'NONE';
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

  // M-4 fix: Single aggregated query instead of N+1
  const projectMetrics = await c.env.DB.prepare(`
    SELECT
      p.id as project_id,
      p.name as project_name,
      COALESCE(s.session_count, 0) as sessions,
      COALESCE(m.message_count, 0) as messages
    FROM projects p
    LEFT JOIN (
      SELECT project_id, COUNT(*) as session_count
      FROM project_sessions GROUP BY project_id
    ) s ON s.project_id = p.id
    LEFT JOIN (
      SELECT project_id, COUNT(*) as message_count
      FROM messages GROUP BY project_id
    ) m ON m.project_id = p.id
    WHERE p.owner_id = ?
    ORDER BY p.updated_at DESC
  `).bind(userId).all<{
    project_id: string; project_name: string; sessions: number; messages: number;
  }>();

  // Token/cost aggregation still requires metadata parsing per-project
  // but we batch-fetch all assistant messages in one query
  const allAssistantMeta = await c.env.DB.prepare(`
    SELECT m.project_id, m.metadata
    FROM messages m
    JOIN projects p ON m.project_id = p.id
    WHERE p.owner_id = ? AND m.role = 'assistant' AND m.metadata IS NOT NULL
  `).bind(userId).all<{ project_id: string; metadata: string }>();

  // Aggregate tokens/cost per project in memory
  const tokenMap = new Map<string, { tokens: number; cost: number }>();
  for (const msg of allAssistantMeta.results) {
    try {
      const meta = JSON.parse(msg.metadata || '{}');
      if (meta.usage) {
        const existing = tokenMap.get(msg.project_id) || { tokens: 0, cost: 0 };
        existing.tokens += (meta.usage.inputTokens || 0) + (meta.usage.outputTokens || 0);
        existing.cost += meta.usage.costUsd || 0;
        tokenMap.set(msg.project_id, existing);
      }
    } catch {
      // Skip unparseable metadata
    }
  }

  const results = projectMetrics.results.map(p => ({
    project_id: p.project_id,
    project_name: p.project_name,
    sessions: p.sessions,
    messages: p.messages,
    tokens: tokenMap.get(p.project_id)?.tokens || 0,
    cost_usd: tokenMap.get(p.project_id)?.cost || 0,
  }));

  return c.json({ projects: results });
});

export { usage };
