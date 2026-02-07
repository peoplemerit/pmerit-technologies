/**
 * Sessions API — AIXORD v4.4 Session Graph Model
 *
 * Manages project sessions as nodes in a directed graph.
 * Each session has a type (DISCOVER, BRAINSTORM, BLUEPRINT, EXECUTE, AUDIT, VERIFY_LOCK)
 * and can be connected via typed edges (CONTINUES, DERIVES, SUPERSEDES, FORKS, RECONCILES).
 *
 * Endpoints:
 * - POST   /api/v1/projects/:projectId/sessions          - Create session
 * - GET    /api/v1/projects/:projectId/sessions          - List sessions
 * - GET    /api/v1/projects/:projectId/sessions/:sessionId - Get session details
 * - PUT    /api/v1/projects/:projectId/sessions/:sessionId - Update session
 * - GET    /api/v1/projects/:projectId/sessions/:sessionId/graph - Get session graph
 * - POST   /api/v1/projects/:projectId/sessions/:sessionId/edges - Create edge
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';

const sessions = new Hono<{ Bindings: Env }>();

// All routes require auth
sessions.use('/*', requireAuth);

/**
 * Verify project ownership
 */
async function verifyProjectOwnership(
  db: D1Database,
  projectId: string,
  userId: string
): Promise<boolean> {
  const project = await db.prepare(
    'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
  ).bind(projectId, userId).first();
  return !!project;
}

// Valid session types and edge types
const SESSION_TYPES = ['DISCOVER', 'BRAINSTORM', 'BLUEPRINT', 'EXECUTE', 'AUDIT', 'VERIFY_LOCK'] as const;
const EDGE_TYPES = ['CONTINUES', 'DERIVES', 'SUPERSEDES', 'FORKS', 'RECONCILES'] as const;

/**
 * POST /api/v1/projects/:projectId/sessions
 * Create a new session
 */
sessions.post('/:projectId/sessions', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    session_type?: string;
    parent_session_id?: string;
    edge_type?: string;
  }>();

  const sessionType = body.session_type || 'BRAINSTORM';
  if (!SESSION_TYPES.includes(sessionType as typeof SESSION_TYPES[number])) {
    return c.json({ error: `Invalid session_type. Must be one of: ${SESSION_TYPES.join(', ')}` }, 400);
  }

  // Calculate next session number
  const maxResult = await c.env.DB.prepare(
    'SELECT MAX(session_number) as max_num FROM project_sessions WHERE project_id = ?'
  ).bind(projectId).first<{ max_num: number | null }>();
  const sessionNumber = (maxResult?.max_num || 0) + 1;

  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();

  // If parent provided with edge type, close the parent session
  if (body.parent_session_id && body.edge_type) {
    const edgeType = body.edge_type;
    if (!EDGE_TYPES.includes(edgeType as typeof EDGE_TYPES[number])) {
      return c.json({ error: `Invalid edge_type. Must be one of: ${EDGE_TYPES.join(', ')}` }, 400);
    }

    // Verify parent session exists and belongs to this project
    const parent = await c.env.DB.prepare(
      'SELECT id, status FROM project_sessions WHERE id = ? AND project_id = ?'
    ).bind(body.parent_session_id, projectId).first<{ id: string; status: string }>();

    if (!parent) {
      return c.json({ error: 'Parent session not found' }, 404);
    }

    // If edge type is CONTINUES, close the parent
    if (edgeType === 'CONTINUES' && parent.status === 'ACTIVE') {
      await c.env.DB.prepare(
        'UPDATE project_sessions SET status = ?, closed_at = ? WHERE id = ?'
      ).bind('CLOSED', now, body.parent_session_id).run();
    }

    // Create the edge
    const edgeId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO session_edges (id, from_session_id, to_session_id, edge_type, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(edgeId, body.parent_session_id, sessionId, edgeType, now).run();
  }

  // Create the session
  await c.env.DB.prepare(`
    INSERT INTO project_sessions (id, project_id, session_number, session_type, status, phase, started_at, created_by)
    VALUES (?, ?, ?, ?, 'ACTIVE', 'BRAINSTORM', ?, ?)
  `).bind(sessionId, projectId, sessionNumber, sessionType, now, userId).run();

  // Update capsule.session.number in project_state
  const stateRow = await c.env.DB.prepare(
    'SELECT capsule FROM project_state WHERE project_id = ?'
  ).bind(projectId).first<{ capsule: string }>();

  if (stateRow) {
    const capsule = JSON.parse(stateRow.capsule || '{}');
    capsule.session = {
      ...capsule.session,
      number: sessionNumber,
      phase: 'BRAINSTORM',
      messageCount: 0,
      startedAt: now,
    };
    await c.env.DB.prepare(
      'UPDATE project_state SET capsule = ?, updated_at = ? WHERE project_id = ?'
    ).bind(JSON.stringify(capsule), now, projectId).run();
  }

  return c.json({
    id: sessionId,
    project_id: projectId,
    session_number: sessionNumber,
    session_type: sessionType,
    status: 'ACTIVE',
    phase: 'BRAINSTORM',
    message_count: 0,
    token_count: 0,
    cost_usd: 0,
    started_at: now,
    created_by: userId,
  }, 201);
});

/**
 * GET /api/v1/projects/:projectId/sessions
 * List sessions for a project
 */
sessions.get('/:projectId/sessions', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const status = c.req.query('status'); // Optional: filter by status
  let query = 'SELECT * FROM project_sessions WHERE project_id = ?';
  const bindings: string[] = [projectId];

  if (status) {
    query += ' AND status = ?';
    bindings.push(status);
  }

  query += ' ORDER BY session_number ASC';

  const stmt = c.env.DB.prepare(query);
  const result = await stmt.bind(...bindings).all();

  return c.json({ sessions: result.results });
});

/**
 * GET /api/v1/projects/:projectId/sessions/:sessionId
 * Get session details
 */
sessions.get('/:projectId/sessions/:sessionId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const sessionId = c.req.param('sessionId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const session = await c.env.DB.prepare(
    'SELECT * FROM project_sessions WHERE id = ? AND project_id = ?'
  ).bind(sessionId, projectId).first();

  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }

  return c.json(session);
});

/**
 * PUT /api/v1/projects/:projectId/sessions/:sessionId
 * Update session (close, archive, update summary, etc.)
 */
sessions.put('/:projectId/sessions/:sessionId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const sessionId = c.req.param('sessionId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const session = await c.env.DB.prepare(
    'SELECT * FROM project_sessions WHERE id = ? AND project_id = ?'
  ).bind(sessionId, projectId).first<{
    id: string;
    status: string;
  }>();

  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }

  const body = await c.req.json<{
    status?: string;
    summary?: string;
    capsule_snapshot?: object;
    phase?: string;
  }>();

  const updates: string[] = [];
  const values: unknown[] = [];
  const now = new Date().toISOString();

  if (body.status) {
    if (!['ACTIVE', 'CLOSED', 'ARCHIVED'].includes(body.status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    updates.push('status = ?');
    values.push(body.status);
    if (body.status === 'CLOSED' || body.status === 'ARCHIVED') {
      updates.push('closed_at = ?');
      values.push(now);
    }
  }

  if (body.summary !== undefined) {
    updates.push('summary = ?');
    values.push(body.summary);
  }

  if (body.capsule_snapshot) {
    updates.push('capsule_snapshot = ?');
    values.push(JSON.stringify(body.capsule_snapshot));
  }

  if (body.phase) {
    updates.push('phase = ?');
    values.push(body.phase);
  }

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  values.push(sessionId, projectId);
  await c.env.DB.prepare(
    `UPDATE project_sessions SET ${updates.join(', ')} WHERE id = ? AND project_id = ?`
  ).bind(...values).run();

  return c.json({ success: true, updated_at: now });
});

/**
 * GET /api/v1/projects/:projectId/sessions/:sessionId/graph
 * Get edges for a session (both incoming and outgoing)
 */
sessions.get('/:projectId/sessions/:sessionId/graph', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const sessionId = c.req.param('sessionId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Get outgoing edges
  const outgoing = await c.env.DB.prepare(
    'SELECT * FROM session_edges WHERE from_session_id = ?'
  ).bind(sessionId).all();

  // Get incoming edges
  const incoming = await c.env.DB.prepare(
    'SELECT * FROM session_edges WHERE to_session_id = ?'
  ).bind(sessionId).all();

  return c.json({
    session_id: sessionId,
    outgoing: outgoing.results,
    incoming: incoming.results,
  });
});

/**
 * GET /api/v1/projects/:projectId/sessions/:sessionId/metrics
 * D10: Session metrics — aggregate usage data for a session
 */
sessions.get('/:projectId/sessions/:sessionId/metrics', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const sessionId = c.req.param('sessionId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const session = await c.env.DB.prepare(
    'SELECT * FROM project_sessions WHERE id = ? AND project_id = ?'
  ).bind(sessionId, projectId).first<{
    id: string;
    session_number: number;
    session_type: string;
    status: string;
    started_at: string;
    closed_at: string | null;
  }>();

  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }

  // Count messages per role
  const messageCounts = await c.env.DB.prepare(`
    SELECT role, COUNT(*) as count FROM messages
    WHERE project_id = ? AND session_id = ?
    GROUP BY role
  `).bind(projectId, sessionId).all<{ role: string; count: number }>();

  const roleMap: Record<string, number> = {};
  for (const row of messageCounts.results) {
    roleMap[row.role] = row.count;
  }

  // Get all assistant messages to aggregate usage from metadata
  const assistantMessages = await c.env.DB.prepare(`
    SELECT metadata FROM messages
    WHERE project_id = ? AND session_id = ? AND role = 'assistant'
  `).bind(projectId, sessionId).all<{ metadata: string }>();

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCostUsd = 0;
  let totalLatencyMs = 0;
  const modelUsage: Record<string, number> = {};

  for (const msg of assistantMessages.results) {
    try {
      const meta = JSON.parse(msg.metadata || '{}');
      if (meta.usage) {
        totalInputTokens += meta.usage.inputTokens || 0;
        totalOutputTokens += meta.usage.outputTokens || 0;
        totalCostUsd += meta.usage.costUsd || 0;
        totalLatencyMs += meta.usage.latencyMs || 0;
      }
      if (meta.model) {
        const modelKey = typeof meta.model === 'string' ? meta.model : meta.model.model || 'unknown';
        modelUsage[modelKey] = (modelUsage[modelKey] || 0) + 1;
      }
    } catch {
      // Skip messages with unparseable metadata
    }
  }

  const totalMessages = Object.values(roleMap).reduce((a, b) => a + b, 0);

  return c.json({
    session_id: sessionId,
    session_number: session.session_number,
    session_type: session.session_type,
    status: session.status,
    started_at: session.started_at,
    closed_at: session.closed_at,
    messages: {
      total: totalMessages,
      user: roleMap['user'] || 0,
      assistant: roleMap['assistant'] || 0,
      system: roleMap['system'] || 0,
    },
    tokens: {
      input: totalInputTokens,
      output: totalOutputTokens,
      total: totalInputTokens + totalOutputTokens,
    },
    cost_usd: totalCostUsd,
    avg_latency_ms: assistantMessages.results.length > 0
      ? Math.round(totalLatencyMs / assistantMessages.results.length)
      : 0,
    model_usage: modelUsage,
  });
});

/**
 * POST /api/v1/projects/:projectId/sessions/:sessionId/edges
 * Create an edge between sessions
 */
sessions.post('/:projectId/sessions/:sessionId/edges', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const fromSessionId = c.req.param('sessionId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    to_session_id: string;
    edge_type: string;
    metadata?: object;
  }>();

  if (!body.to_session_id || !body.edge_type) {
    return c.json({ error: 'to_session_id and edge_type are required' }, 400);
  }

  if (!EDGE_TYPES.includes(body.edge_type as typeof EDGE_TYPES[number])) {
    return c.json({ error: `Invalid edge_type. Must be one of: ${EDGE_TYPES.join(', ')}` }, 400);
  }

  // Verify both sessions exist in this project
  const fromSession = await c.env.DB.prepare(
    'SELECT id FROM project_sessions WHERE id = ? AND project_id = ?'
  ).bind(fromSessionId, projectId).first();

  const toSession = await c.env.DB.prepare(
    'SELECT id FROM project_sessions WHERE id = ? AND project_id = ?'
  ).bind(body.to_session_id, projectId).first();

  if (!fromSession || !toSession) {
    return c.json({ error: 'One or both sessions not found in this project' }, 404);
  }

  const edgeId = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO session_edges (id, from_session_id, to_session_id, edge_type, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    edgeId,
    fromSessionId,
    body.to_session_id,
    body.edge_type,
    body.metadata ? JSON.stringify(body.metadata) : null,
    now
  ).run();

  return c.json({
    id: edgeId,
    from_session_id: fromSessionId,
    to_session_id: body.to_session_id,
    edge_type: body.edge_type,
    created_at: now,
  }, 201);
});

export default sessions;
