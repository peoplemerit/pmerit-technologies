/**
 * Conversations API (SYS-01)
 *
 * Conversation persistence for chat history with cloud sync.
 * Implements endpoints consumed by the frontend ConversationApi class.
 *
 * Endpoints:
 * - GET    /                    - List conversations (optional ?project_id=X)
 * - POST   /                    - Create conversation
 * - GET    /:id                 - Get single conversation
 * - PATCH  /:id                 - Update conversation (title, capsule)
 * - DELETE /:id                 - Delete conversation
 * - GET    /:id/messages        - Get messages for conversation
 * - POST   /:id/messages        - Add message to conversation
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import { verifyProjectOwnership } from '../utils/projectOwnership';

const conversations = new Hono<{ Bindings: Env }>();

// All routes require auth
conversations.use('/*', requireAuth);

/**
 * Verify that the authenticated user owns a conversation
 */
async function verifyConversationOwnership(
  db: D1Database,
  conversationId: string,
  userId: string
): Promise<boolean> {
  const conversation = await db.prepare(
    'SELECT id FROM conversations WHERE id = ? AND user_id = ?'
  ).bind(conversationId, userId).first();
  return !!conversation;
}

// =========================================================================
// GET / - List conversations
// Optional query param: ?project_id=X
// =========================================================================
conversations.get('/', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.query('project_id');

  let query = 'SELECT * FROM conversations WHERE user_id = ?';
  const bindings: string[] = [userId];

  if (projectId) {
    // Verify user owns the project before filtering
    if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
      return c.json({ error: 'Project not found' }, 404);
    }
    query += ' AND project_id = ?';
    bindings.push(projectId);
  }

  query += ' ORDER BY updated_at DESC';

  const result = await c.env.DB.prepare(query).bind(...bindings).all<{
    id: string;
    project_id: string;
    user_id: string;
    title: string;
    objective: string | null;
    capsule: string;
    created_at: string;
    updated_at: string;
  }>();

  return c.json({
    conversations: result.results
  });
});

// =========================================================================
// POST / - Create conversation
// Body: { project_id, title, capsule? }
// =========================================================================
conversations.post('/', async (c) => {
  const userId = c.get('userId');

  const body = await c.req.json<{
    project_id: string;
    title?: string;
    objective?: string;
    capsule?: string;
  }>();

  const { project_id, title, objective, capsule } = body;

  if (!project_id) {
    return c.json({ error: 'project_id is required' }, 400);
  }

  // Verify project ownership
  if (!await verifyProjectOwnership(c.env.DB, project_id, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const conversationId = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO conversations (id, project_id, user_id, title, objective, capsule, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    conversationId,
    project_id,
    userId,
    title || 'New Conversation',
    objective || null,
    capsule || '{}',
    now,
    now
  ).run();

  return c.json({
    id: conversationId,
    project_id,
    user_id: userId,
    title: title || 'New Conversation',
    objective: objective || null,
    capsule: capsule || '{}',
    created_at: now,
    updated_at: now
  }, 201);
});

// =========================================================================
// GET /:id - Get single conversation
// =========================================================================
conversations.get('/:id', async (c) => {
  const userId = c.get('userId');
  const conversationId = c.req.param('id');

  const conversation = await c.env.DB.prepare(
    'SELECT * FROM conversations WHERE id = ? AND user_id = ?'
  ).bind(conversationId, userId).first<{
    id: string;
    project_id: string;
    user_id: string;
    title: string;
    objective: string | null;
    capsule: string;
    created_at: string;
    updated_at: string;
  }>();

  if (!conversation) {
    return c.json({ error: 'Conversation not found' }, 404);
  }

  return c.json(conversation);
});

// =========================================================================
// PATCH /:id - Update conversation
// Body: { title?, capsule? }
// =========================================================================
conversations.patch('/:id', async (c) => {
  const userId = c.get('userId');
  const conversationId = c.req.param('id');

  // Verify ownership
  if (!await verifyConversationOwnership(c.env.DB, conversationId, userId)) {
    return c.json({ error: 'Conversation not found' }, 404);
  }

  const body = await c.req.json<{
    title?: string;
    objective?: string;
    capsule?: string;
  }>();

  const updates: string[] = [];
  const values: (string | null)[] = [];

  if (body.title !== undefined) {
    updates.push('title = ?');
    values.push(body.title);
  }

  if (body.objective !== undefined) {
    updates.push('objective = ?');
    values.push(body.objective);
  }

  if (body.capsule !== undefined) {
    updates.push('capsule = ?');
    values.push(body.capsule);
  }

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  // Always update the updated_at timestamp
  const now = new Date().toISOString();
  updates.push('updated_at = ?');
  values.push(now);

  // Add the WHERE clause bindings
  values.push(conversationId, userId);

  await c.env.DB.prepare(
    `UPDATE conversations SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
  ).bind(...values).run();

  return c.json({ success: true, updated_at: now });
});

// =========================================================================
// DELETE /:id - Delete conversation (cascades to messages)
// =========================================================================
conversations.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const conversationId = c.req.param('id');

  // Verify ownership
  if (!await verifyConversationOwnership(c.env.DB, conversationId, userId)) {
    return c.json({ error: 'Conversation not found' }, 404);
  }

  // Delete conversation (conversation_messages cascade via FK)
  await c.env.DB.prepare(
    'DELETE FROM conversations WHERE id = ? AND user_id = ?'
  ).bind(conversationId, userId).run();

  return c.json({ success: true });
});

// =========================================================================
// GET /:id/messages - Get messages for a conversation
// =========================================================================
conversations.get('/:id/messages', async (c) => {
  const userId = c.get('userId');
  const conversationId = c.req.param('id');

  // Verify conversation ownership
  if (!await verifyConversationOwnership(c.env.DB, conversationId, userId)) {
    return c.json({ error: 'Conversation not found' }, 404);
  }

  const result = await c.env.DB.prepare(
    'SELECT * FROM conversation_messages WHERE conversation_id = ? ORDER BY created_at ASC'
  ).bind(conversationId).all<{
    id: string;
    conversation_id: string;
    role: string;
    content: string;
    metadata: string;
    created_at: string;
  }>();

  return c.json({
    messages: result.results
  });
});

// =========================================================================
// POST /:id/messages - Add message to a conversation
// Body: { role, content, metadata? }
// =========================================================================
conversations.post('/:id/messages', async (c) => {
  const userId = c.get('userId');
  const conversationId = c.req.param('id');

  // Verify conversation ownership
  if (!await verifyConversationOwnership(c.env.DB, conversationId, userId)) {
    return c.json({ error: 'Conversation not found' }, 404);
  }

  const body = await c.req.json<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: string;
  }>();

  const { role, content, metadata } = body;

  if (!role || !content) {
    return c.json({ error: 'role and content are required' }, 400);
  }

  if (!['user', 'assistant', 'system'].includes(role)) {
    return c.json({ error: 'role must be user, assistant, or system' }, 400);
  }

  const messageId = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO conversation_messages (id, conversation_id, role, content, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    messageId,
    conversationId,
    role,
    content,
    metadata || '{}',
    now
  ).run();

  // Update conversation's updated_at timestamp
  await c.env.DB.prepare(
    'UPDATE conversations SET updated_at = ? WHERE id = ?'
  ).bind(now, conversationId).run();

  return c.json({
    id: messageId,
    conversation_id: conversationId,
    role,
    content,
    metadata: metadata || '{}',
    created_at: now
  }, 201);
});

export default conversations;
