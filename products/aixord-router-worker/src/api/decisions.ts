/**
 * Decisions API
 *
 * Audit ledger for governance decisions.
 *
 * Endpoints:
 * - POST /api/v1/projects/:projectId/decisions
 * - GET  /api/v1/projects/:projectId/decisions
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import { verifyProjectOwnership } from '../utils/projectOwnership';

const decisions = new Hono<{ Bindings: Env }>();

// All routes require auth
decisions.use('/*', requireAuth);

/**
 * POST /api/v1/projects/:projectId/decisions
 */
decisions.post('/:projectId/decisions', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    decision_type: string;
    description: string;
    actor?: string;
    metadata?: Record<string, unknown>;
  }>();

  const { decision_type, description, actor, metadata } = body;

  if (!decision_type || !description) {
    return c.json({ error: 'decision_type and description required' }, 400);
  }

  const decisionId = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO decisions (id, project_id, decision_type, description, actor, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    decisionId,
    projectId,
    decision_type,
    description,
    actor || 'USER',
    JSON.stringify(metadata || {}),
    now
  ).run();

  return c.json({
    id: decisionId,
    project_id: projectId,
    decision_type,
    description,
    actor: actor || 'USER',
    metadata: metadata || {},
    created_at: now
  }, 201);
});

/**
 * GET /api/v1/projects/:projectId/decisions
 */
decisions.get('/:projectId/decisions', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const result = await c.env.DB.prepare(`
    SELECT * FROM decisions
    WHERE project_id = ?
    ORDER BY created_at DESC
    LIMIT 100
  `).bind(projectId).all<{
    id: string;
    project_id: string;
    decision_type: string;
    description: string;
    actor: string;
    metadata: string;
    created_at: string;
  }>();

  return c.json({
    decisions: result.results.map(d => ({
      ...d,
      metadata: JSON.parse(d.metadata || '{}')
    }))
  });
});

export default decisions;
