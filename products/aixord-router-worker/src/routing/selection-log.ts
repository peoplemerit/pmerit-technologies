/**
 * Model Selection Logging
 *
 * PATCH-MOD-01: Audit trail for multi-model governance
 *
 * Logs model selection decisions to the database for audit purposes.
 * Logging failures are fail-safe (don't break routing).
 */

import type { ModelSelectionLog } from '../types';
import { log as logger } from '../utils/logger';

/**
 * Log model selection decision to database
 *
 * This is a fire-and-forget operation - failures don't block routing
 */
export async function logModelSelection(
  db: D1Database,
  entry: ModelSelectionLog
): Promise<void> {
  try {
    await db.prepare(`
      INSERT INTO model_selection_logs
      (request_id, timestamp, intent, mode, tier, affinity_matched,
       selected_provider, selected_model, rationale)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      entry.request_id,
      entry.timestamp,
      entry.intent,
      entry.mode,
      entry.tier,
      entry.affinity_matched ? 1 : 0,
      entry.selected_provider,
      entry.selected_model,
      entry.rationale
    ).run();
  } catch (error) {
    // Phase 2: Use structured logging for audit failures (fail-safe, don't block routing)
    logger.error('selection_log_failed', {
      request_id: entry.request_id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Query model selection logs for audit
 */
export async function querySelectionLogs(
  db: D1Database,
  filters: {
    intent?: string;
    provider?: string;
    since?: string;
    limit?: number;
  }
): Promise<ModelSelectionLog[]> {
  let query = 'SELECT * FROM model_selection_logs WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters.intent) {
    query += ' AND intent = ?';
    params.push(filters.intent);
  }

  if (filters.provider) {
    query += ' AND selected_provider = ?';
    params.push(filters.provider);
  }

  if (filters.since) {
    query += ' AND timestamp >= ?';
    params.push(filters.since);
  }

  query += ' ORDER BY timestamp DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }

  const result = await db.prepare(query).bind(...params).all<{
    request_id: string;
    timestamp: string;
    intent: string;
    mode: string;
    tier: string;
    affinity_matched: number;
    selected_provider: string;
    selected_model: string;
    rationale: string;
  }>();

  return (result.results || []).map(row => ({
    request_id: row.request_id,
    timestamp: row.timestamp,
    intent: row.intent as ModelSelectionLog['intent'],
    mode: row.mode as ModelSelectionLog['mode'],
    tier: row.tier as ModelSelectionLog['tier'],
    affinity_matched: row.affinity_matched === 1,
    selected_provider: row.selected_provider as ModelSelectionLog['selected_provider'],
    selected_model: row.selected_model,
    rationale: row.rationale
  }));
}
