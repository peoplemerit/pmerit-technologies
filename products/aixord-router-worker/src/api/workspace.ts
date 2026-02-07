/**
 * Workspace Binding API — Unified GA:ENV + GA:FLD
 *
 * Server-side metadata for workspace bindings.
 * Client-side folder handles persist in IndexedDB (fileSystem.ts).
 * This API enables backend gate auto-checks without client involvement.
 *
 * Endpoints:
 *   - GET    /:projectId/workspace         — Get workspace binding
 *   - PUT    /:projectId/workspace         — Create/update binding
 *   - DELETE /:projectId/workspace         — Remove binding
 *   - GET    /:projectId/workspace/status  — Quick status for ribbon
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';

const workspace = new Hono<{ Bindings: Env }>();

workspace.use('/*', requireAuth);

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
 * GET /:projectId/workspace
 */
workspace.get('/:projectId/workspace', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const binding = await c.env.DB.prepare(
    'SELECT * FROM workspace_bindings WHERE project_id = ?'
  ).bind(projectId).first();

  if (!binding) {
    return c.json({ binding: null });
  }

  return c.json({ binding });
});

/**
 * PUT /:projectId/workspace
 * Create or update workspace binding
 */
workspace.put('/:projectId/workspace', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    folder_name?: string;
    folder_template?: string;
    permission_level?: string;
    scaffold_generated?: boolean;
    github_connected?: boolean;
    github_repo?: string;
    binding_confirmed?: boolean;
  }>();

  const now = new Date().toISOString();

  // Check if binding exists
  const existing = await c.env.DB.prepare(
    'SELECT id FROM workspace_bindings WHERE project_id = ?'
  ).bind(projectId).first();

  if (existing) {
    // Update existing binding
    await c.env.DB.prepare(`
      UPDATE workspace_bindings
      SET folder_name = COALESCE(?, folder_name),
          folder_template = COALESCE(?, folder_template),
          permission_level = COALESCE(?, permission_level),
          scaffold_generated = COALESCE(?, scaffold_generated),
          github_connected = COALESCE(?, github_connected),
          github_repo = COALESCE(?, github_repo),
          binding_confirmed = COALESCE(?, binding_confirmed),
          bound_at = COALESCE(bound_at, ?),
          updated_at = ?
      WHERE project_id = ?
    `).bind(
      body.folder_name ?? null,
      body.folder_template ?? null,
      body.permission_level ?? null,
      body.scaffold_generated !== undefined ? (body.scaffold_generated ? 1 : 0) : null,
      body.github_connected !== undefined ? (body.github_connected ? 1 : 0) : null,
      body.github_repo ?? null,
      body.binding_confirmed !== undefined ? (body.binding_confirmed ? 1 : 0) : null,
      now,
      now,
      projectId
    ).run();
  } else {
    // Create new binding
    const id = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO workspace_bindings
        (id, project_id, folder_name, folder_template, permission_level,
         scaffold_generated, github_connected, github_repo, binding_confirmed, bound_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      projectId,
      body.folder_name ?? null,
      body.folder_template ?? null,
      body.permission_level ?? 'readwrite',
      body.scaffold_generated ? 1 : 0,
      body.github_connected ? 1 : 0,
      body.github_repo ?? null,
      body.binding_confirmed ? 1 : 0,
      now,
      now
    ).run();
  }

  return c.json({ success: true, updated_at: now });
});

/**
 * DELETE /:projectId/workspace
 */
workspace.delete('/:projectId/workspace', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM workspace_bindings WHERE project_id = ?'
  ).bind(projectId).run();

  return c.json({ success: true });
});

/**
 * GET /:projectId/workspace/status
 * Quick status for ribbon display
 */
workspace.get('/:projectId/workspace/status', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const binding = await c.env.DB.prepare(
    'SELECT folder_name, folder_template, permission_level, scaffold_generated, github_connected, github_repo, binding_confirmed FROM workspace_bindings WHERE project_id = ?'
  ).bind(projectId).first<{
    folder_name: string | null;
    folder_template: string | null;
    permission_level: string;
    scaffold_generated: number;
    github_connected: number;
    github_repo: string | null;
    binding_confirmed: number;
  }>();

  if (!binding) {
    return c.json({
      bound: false,
      folder_linked: false,
      github_connected: false,
      confirmed: false,
    });
  }

  return c.json({
    bound: true,
    folder_linked: !!binding.folder_name,
    folder_name: binding.folder_name,
    folder_template: binding.folder_template,
    permission_level: binding.permission_level,
    scaffold_generated: !!binding.scaffold_generated,
    github_connected: !!binding.github_connected,
    github_repo: binding.github_repo,
    confirmed: !!binding.binding_confirmed,
  });
});

export default workspace;
