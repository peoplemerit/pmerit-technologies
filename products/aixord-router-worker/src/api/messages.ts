/**
 * Messages API
 *
 * Conversation persistence for chat history.
 *
 * Endpoints:
 * - GET  /api/v1/projects/:projectId/messages - List messages
 * - POST /api/v1/projects/:projectId/messages - Create message
 * - DELETE /api/v1/projects/:projectId/messages - Clear all messages
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import { triggerGateEvaluation } from '../services/gateRules';

const messages = new Hono<{ Bindings: Env }>();

// All routes require auth
messages.use('/*', requireAuth);

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

/**
 * GET /api/v1/projects/:projectId/messages
 */
messages.get('/:projectId/messages', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Optional query params
  const limit = Math.min(parseInt(c.req.query('limit') || '100'), 500);
  const offset = parseInt(c.req.query('offset') || '0');
  const sessionId = c.req.query('session_id'); // Filter by session

  let query = 'SELECT * FROM messages WHERE project_id = ?';
  const bindings: (string | number)[] = [projectId];

  if (sessionId) {
    query += ' AND session_id = ?';
    bindings.push(sessionId);
  }

  query += ' ORDER BY created_at ASC LIMIT ? OFFSET ?';
  bindings.push(limit, offset);

  const result = await c.env.DB.prepare(query).bind(...bindings).all<{
    id: string;
    project_id: string;
    session_id: string | null;
    role: string;
    content: string;
    metadata: string;
    created_at: string;
  }>();

  return c.json({
    messages: result.results.map(m => ({
      ...m,
      metadata: JSON.parse(m.metadata || '{}')
    }))
  });
});

/**
 * POST /api/v1/projects/:projectId/messages
 */
messages.post('/:projectId/messages', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: Record<string, unknown>;
    session_id?: string;
  }>();

  const { role, content, metadata, session_id } = body;

  if (!role || !content) {
    return c.json({ error: 'role and content required' }, 400);
  }

  if (!['user', 'assistant', 'system'].includes(role)) {
    return c.json({ error: 'role must be user, assistant, or system' }, 400);
  }

  const messageId = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO messages (id, project_id, session_id, role, content, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    messageId,
    projectId,
    session_id || null,
    role,
    content,
    JSON.stringify(metadata || {}),
    now
  ).run();

  // If session_id provided, increment session's message_count
  if (session_id) {
    await c.env.DB.prepare(
      'UPDATE project_sessions SET message_count = message_count + 1 WHERE id = ?'
    ).bind(session_id).run();
  }

  // Phase 2: Auto-evaluate gates after message creation (GA:DIS triggers on first user message)
  if (role === 'user') {
    c.executionCtx.waitUntil(triggerGateEvaluation(c.env.DB, projectId, userId));
  }

  return c.json({
    id: messageId,
    project_id: projectId,
    session_id: session_id || null,
    role,
    content,
    metadata: metadata || {},
    created_at: now
  }, 201);
});

/**
 * POST /api/v1/projects/:projectId/messages/batch
 * Create multiple messages at once (for saving entire conversations)
 */
messages.post('/:projectId/messages/batch', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    messages: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
      metadata?: Record<string, unknown>;
      created_at?: string;
    }>;
  }>();

  if (!body.messages || !Array.isArray(body.messages)) {
    return c.json({ error: 'messages array required' }, 400);
  }

  const results: Array<{
    id: string;
    project_id: string;
    role: string;
    content: string;
    metadata: Record<string, unknown>;
    created_at: string;
  }> = [];

  for (const msg of body.messages) {
    const messageId = crypto.randomUUID();
    const now = msg.created_at || new Date().toISOString();

    await c.env.DB.prepare(`
      INSERT INTO messages (id, project_id, role, content, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      messageId,
      projectId,
      msg.role,
      msg.content,
      JSON.stringify(msg.metadata || {}),
      now
    ).run();

    results.push({
      id: messageId,
      project_id: projectId,
      role: msg.role,
      content: msg.content,
      metadata: msg.metadata || {},
      created_at: now
    });
  }

  return c.json({ messages: results }, 201);
});

/**
 * DELETE /api/v1/projects/:projectId/messages
 * Clear all messages for a project
 */
messages.delete('/:projectId/messages', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM messages WHERE project_id = ?'
  ).bind(projectId).run();

  return c.json({ success: true });
});

export default messages;
