/**
 * Evidence API (HANDOFF-D4-GITHUB-EVIDENCE)
 *
 * Endpoints for fetching and querying external evidence.
 * Evidence augments the Reconciliation Triad - it INFORMS, never overrides.
 *
 * Endpoints:
 * - POST  /api/v1/evidence/sync/:projectId  - Trigger evidence sync
 * - GET   /api/v1/evidence/:projectId       - Get all evidence for project
 * - GET   /api/v1/evidence/:projectId/triad - Get evidence grouped by triad category
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import {
  syncProjectEvidence,
  getProjectEvidence,
  getStaleEvidence
} from '../services/evidence-fetch';

const evidence = new Hono<{ Bindings: Env }>();

// All routes require auth
evidence.use('/*', requireAuth);

/**
 * POST /api/v1/evidence/sync/:projectId
 *
 * Trigger evidence sync from GitHub for a project.
 * Returns sync results including counts by type and category.
 */
evidence.post('/sync/:projectId', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');

    // Verify project ownership
    const project = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
    ).bind(projectId, userId).first();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Get encryption key
    const encryptionKey = c.env.GITHUB_TOKEN_ENCRYPTION_KEY || 'default-key-change-in-production';

    // Accept optional session_id from request body
    let sessionId: string | undefined;
    try {
      const body = await c.req.json<{ session_id?: string }>();
      sessionId = body.session_id;
    } catch {
      // No body or invalid JSON — sessionId stays undefined
    }

    // Sync evidence with session attribution
    const result = await syncProjectEvidence(projectId, c.env.DB, encryptionKey, sessionId);

    return c.json(result);

  } catch (error) {
    console.error('Evidence sync error:', error);
    return c.json({
      error: 'Failed to sync evidence',
      detail: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

/**
 * GET /api/v1/evidence/:projectId
 *
 * Get all evidence for a project.
 * Returns flat list of all evidence records.
 */
evidence.get('/:projectId', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');

    // Verify project ownership
    const project = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
    ).bind(projectId, userId).first();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Get all evidence
    const result = await c.env.DB.prepare(`
      SELECT * FROM github_evidence
      WHERE project_id = ?
      ORDER BY evidence_timestamp DESC
    `).bind(projectId).all();

    return c.json({
      project_id: projectId,
      total: result.results.length,
      evidence: result.results
    });

  } catch (error) {
    console.error('Evidence fetch error:', error);
    return c.json({
      error: 'Failed to fetch evidence',
      detail: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

/**
 * GET /api/v1/evidence/:projectId/triad
 *
 * Get evidence grouped by Reconciliation Triad category.
 * Useful for displaying in the Evidence panel.
 */
evidence.get('/:projectId/triad', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');

    // Verify project ownership
    const project = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
    ).bind(projectId, userId).first();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Get evidence grouped by triad
    const grouped = await getProjectEvidence(projectId, c.env.DB);

    // Get connection info for display
    const connection = await c.env.DB.prepare(`
      SELECT repo_owner, repo_name, last_sync
      FROM github_connections
      WHERE project_id = ?
    `).bind(projectId).first<{
      repo_owner: string;
      repo_name: string;
      last_sync: string | null;
    }>();

    return c.json({
      project_id: projectId,
      connection: connection ? {
        repo_owner: connection.repo_owner === 'PENDING' ? null : connection.repo_owner,
        repo_name: connection.repo_name === 'PENDING' ? null : connection.repo_name,
        last_sync: connection.last_sync
      } : null,
      counts: {
        planned: grouped.planned.length,
        claimed: grouped.claimed.length,
        verified: grouped.verified.length,
        total: grouped.planned.length + grouped.claimed.length + grouped.verified.length
      },
      triad: grouped
    });

  } catch (error) {
    console.error('Evidence triad fetch error:', error);
    return c.json({
      error: 'Failed to fetch evidence',
      detail: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

/**
 * GET /api/v1/evidence/:projectId/stale
 *
 * Get stale evidence that needs re-fetching.
 * Admin/debug endpoint.
 */
evidence.get('/:projectId/stale', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');

    // Verify project ownership
    const project = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
    ).bind(projectId, userId).first();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Get stale evidence
    const stale = await getStaleEvidence(projectId, c.env.DB);

    return c.json({
      project_id: projectId,
      stale_count: stale.length,
      evidence: stale
    });

  } catch (error) {
    console.error('Stale evidence fetch error:', error);
    return c.json({
      error: 'Failed to fetch stale evidence',
      detail: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

export default evidence;
