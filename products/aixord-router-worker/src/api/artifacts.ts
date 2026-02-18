/**
 * Artifacts API — Mandatory Artifact Commit Layer (L-AB)
 *
 * Records artifact write events with SHA256 hashes for integrity tracking.
 * Enables the frontend to report persistence evidence in the EvidenceRibbon.
 *
 * Endpoints:
 *   - POST   /:projectId/artifacts/commit     — Record an artifact commit
 *   - GET    /:projectId/artifacts/commits     — List artifact commits
 *   - GET    /:projectId/artifacts/latest       — Latest commit summary
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import { verifyProjectOwnership } from '../utils/projectOwnership';

const artifacts = new Hono<{ Bindings: Env }>();

artifacts.use('/*', requireAuth);

/**
 * POST /:projectId/artifacts/commit
 * Record an artifact commit event (files written to workspace)
 */
artifacts.post('/:projectId/artifacts/commit', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    session_id?: string;
    commit_type?: string;
    files: Array<{
      path: string;
      sha256: string;
      bytes: number;
      action: string; // CREATED | UPDATED | DELETED
    }>;
  }>();

  if (!body.files || !Array.isArray(body.files) || body.files.length === 0) {
    return c.json({ error: 'files array is required and must not be empty' }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const fileCount = body.files.length;
  const totalBytes = body.files.reduce((sum, f) => sum + (f.bytes || 0), 0);
  const filesManifest = JSON.stringify(body.files);

  // Compute overall commit hash from manifest
  const encoder = new TextEncoder();
  const manifestBytes = encoder.encode(filesManifest);
  const hashBuffer = await crypto.subtle.digest('SHA-256', manifestBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const commitHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  await c.env.DB.prepare(`
    INSERT INTO artifact_commits
      (id, project_id, session_id, user_id, commit_type, file_count, total_bytes,
       files_manifest, commit_hash, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'COMMITTED', ?)
  `).bind(
    id,
    projectId,
    body.session_id ?? null,
    userId,
    body.commit_type || 'MANUAL',
    fileCount,
    totalBytes,
    filesManifest,
    commitHash,
    now
  ).run();

  return c.json({
    id,
    commit_hash: commitHash,
    file_count: fileCount,
    total_bytes: totalBytes,
    status: 'COMMITTED',
    created_at: now,
  }, 201);
});

/**
 * GET /:projectId/artifacts/commits
 * List artifact commits for a project
 */
artifacts.get('/:projectId/artifacts/commits', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const limit = parseInt(c.req.query('limit') || '20', 10);
  const offset = parseInt(c.req.query('offset') || '0', 10);

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const commits = await c.env.DB.prepare(`
    SELECT id, session_id, commit_type, file_count, total_bytes,
           commit_hash, status, created_at, verified_at
    FROM artifact_commits
    WHERE project_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).bind(projectId, limit, offset).all();

  const countRow = await c.env.DB.prepare(
    'SELECT COUNT(*) as total FROM artifact_commits WHERE project_id = ?'
  ).bind(projectId).first<{ total: number }>();

  return c.json({
    commits: commits.results || [],
    total: countRow?.total || 0,
    limit,
    offset,
  });
});

/**
 * GET /:projectId/artifacts/latest
 * Quick summary of latest artifact commit — used by EvidenceRibbon
 */
artifacts.get('/:projectId/artifacts/latest', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const latest = await c.env.DB.prepare(`
    SELECT id, session_id, commit_type, file_count, total_bytes,
           files_manifest, commit_hash, status, created_at
    FROM artifact_commits
    WHERE project_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).bind(projectId).first<{
    id: string;
    session_id: string | null;
    commit_type: string;
    file_count: number;
    total_bytes: number;
    files_manifest: string;
    commit_hash: string;
    status: string;
    created_at: string;
  }>();

  // Also get total commit count
  const countRow = await c.env.DB.prepare(
    'SELECT COUNT(*) as total FROM artifact_commits WHERE project_id = ?'
  ).bind(projectId).first<{ total: number }>();

  if (!latest) {
    return c.json({
      has_commits: false,
      total_commits: 0,
      latest: null,
    });
  }

  return c.json({
    has_commits: true,
    total_commits: countRow?.total || 0,
    latest: {
      id: latest.id,
      commit_type: latest.commit_type,
      file_count: latest.file_count,
      total_bytes: latest.total_bytes,
      commit_hash: latest.commit_hash,
      status: latest.status,
      created_at: latest.created_at,
      files: JSON.parse(latest.files_manifest || '[]'),
    },
  });
});

export default artifacts;
