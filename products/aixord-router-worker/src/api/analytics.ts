/**
 * Analytics API — Phase 3 Observability
 *
 * Provider performance metrics derived from model_selection_logs.
 *
 * Endpoints:
 * - GET /api/v1/analytics/providers — Per-provider success rates, request counts, model distribution
 * - GET /api/v1/analytics/intents   — Per-intent routing patterns and provider affinity
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import { getProviderHealth } from '../routing/circuit-breaker';

const analytics = new Hono<{ Bindings: Env }>();
analytics.use('/*', requireAuth);

// =============================================================================
// GET /api/v1/analytics/providers — Provider performance summary
// =============================================================================

analytics.get('/providers', async (c) => {
  const since = c.req.query('since') || getDefaultSince();
  const limit = Math.min(parseInt(c.req.query('limit') || '1000', 10), 5000);

  // Query 1: Per-provider request counts, model distribution
  const providerStats = await c.env.DB.prepare(`
    SELECT
      selected_provider AS provider,
      selected_model AS model,
      COUNT(*) AS request_count,
      SUM(CASE WHEN affinity_matched = 1 THEN 1 ELSE 0 END) AS affinity_matches
    FROM model_selection_logs
    WHERE timestamp >= ?
    GROUP BY selected_provider, selected_model
    ORDER BY request_count DESC
    LIMIT ?
  `).bind(since, limit).all<{
    provider: string;
    model: string;
    request_count: number;
    affinity_matches: number;
  }>();

  // Query 2: Per-provider totals
  const providerTotals = await c.env.DB.prepare(`
    SELECT
      selected_provider AS provider,
      COUNT(*) AS total_requests,
      SUM(CASE WHEN affinity_matched = 1 THEN 1 ELSE 0 END) AS total_affinity_matches
    FROM model_selection_logs
    WHERE timestamp >= ?
    GROUP BY selected_provider
    ORDER BY total_requests DESC
  `).bind(since).all<{
    provider: string;
    total_requests: number;
    total_affinity_matches: number;
  }>();

  // Query 3: Per-intent distribution
  const intentDistribution = await c.env.DB.prepare(`
    SELECT
      intent,
      COUNT(*) AS request_count,
      selected_provider AS top_provider
    FROM model_selection_logs
    WHERE timestamp >= ?
    GROUP BY intent
    ORDER BY request_count DESC
  `).bind(since).all<{
    intent: string;
    request_count: number;
    top_provider: string;
  }>();

  // Aggregate provider summaries
  const providers: Record<string, {
    total_requests: number;
    affinity_rate: number;
    models: Array<{ model: string; requests: number; affinity_rate: number }>;
  }> = {};

  for (const row of providerTotals.results) {
    providers[row.provider] = {
      total_requests: row.total_requests,
      affinity_rate: row.total_requests > 0
        ? Math.round((row.total_affinity_matches / row.total_requests) * 100) / 100
        : 0,
      models: [],
    };
  }

  for (const row of providerStats.results) {
    if (providers[row.provider]) {
      providers[row.provider].models.push({
        model: row.model,
        requests: row.request_count,
        affinity_rate: row.request_count > 0
          ? Math.round((row.affinity_matches / row.request_count) * 100) / 100
          : 0,
      });
    }
  }

  // Get live circuit breaker state
  const circuitBreaker = getProviderHealth();

  return c.json({
    period: { since, generated_at: new Date().toISOString() },
    providers,
    circuit_breaker: circuitBreaker,
    intent_distribution: intentDistribution.results,
  });
});

// =============================================================================
// GET /api/v1/analytics/intents — Intent-level routing analytics
// =============================================================================

analytics.get('/intents', async (c) => {
  const since = c.req.query('since') || getDefaultSince();

  // Per-intent breakdown with provider distribution
  const intentStats = await c.env.DB.prepare(`
    SELECT
      intent,
      mode,
      selected_provider AS provider,
      COUNT(*) AS request_count,
      SUM(CASE WHEN affinity_matched = 1 THEN 1 ELSE 0 END) AS affinity_matches
    FROM model_selection_logs
    WHERE timestamp >= ?
    GROUP BY intent, mode, selected_provider
    ORDER BY intent, request_count DESC
  `).bind(since).all<{
    intent: string;
    mode: string;
    provider: string;
    request_count: number;
    affinity_matches: number;
  }>();

  // Group by intent
  const intents: Record<string, {
    total_requests: number;
    modes: Record<string, number>;
    providers: Array<{ provider: string; requests: number; affinity_rate: number }>;
  }> = {};

  for (const row of intentStats.results) {
    if (!intents[row.intent]) {
      intents[row.intent] = { total_requests: 0, modes: {}, providers: [] };
    }
    const entry = intents[row.intent];
    entry.total_requests += row.request_count;
    entry.modes[row.mode] = (entry.modes[row.mode] || 0) + row.request_count;
    entry.providers.push({
      provider: row.provider,
      requests: row.request_count,
      affinity_rate: row.request_count > 0
        ? Math.round((row.affinity_matches / row.request_count) * 100) / 100
        : 0,
    });
  }

  return c.json({
    period: { since, generated_at: new Date().toISOString() },
    intents,
  });
});

// =============================================================================
// Helpers
// =============================================================================

/** Default: last 30 days */
function getDefaultSince(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString();
}

export { analytics };
