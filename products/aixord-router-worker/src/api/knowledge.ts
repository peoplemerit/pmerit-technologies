/**
 * Knowledge Artifacts API (GKDL-01)
 *
 * Implements L-GKDL1-7 from AIXORD v4.3
 * - L-GKDL1: Derived knowledge is governed
 * - L-GKDL2: Sessions=evidence, artifacts=authoritative
 * - L-GKDL3: No derivation from unverified
 * - L-GKDL4: CSR → FAQ → SOM → SDG order
 * - L-GKDL5: AI-derived = DRAFT until approved
 * - L-GKDL6: Authority hierarchy
 * - L-GKDL7: Anti-Archaeology (CSR concept)
 *
 * Endpoints:
 * - GET    /api/v1/projects/:projectId/knowledge
 * - POST   /api/v1/projects/:projectId/knowledge
 * - GET    /api/v1/projects/:projectId/knowledge/:id
 * - PUT    /api/v1/projects/:projectId/knowledge/:id
 * - DELETE /api/v1/projects/:projectId/knowledge/:id
 * - POST   /api/v1/projects/:projectId/knowledge/:id/approve
 * - POST   /api/v1/projects/:projectId/knowledge/generate-csr
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import type {
  KnowledgeArtifact,
  KnowledgeArtifactType,
  ArtifactStatus,
  DerivationSource,
  CreateKnowledgeArtifactRequest,
  UpdateKnowledgeArtifactRequest,
} from '../types';
import { requireAuth } from '../middleware/requireAuth';

const knowledge = new Hono<{ Bindings: Env }>();

// All routes require auth
knowledge.use('/*', requireAuth);

// Authority levels per L-GKDL6 (higher = more authoritative)
const AUTHORITY_LEVELS: Record<KnowledgeArtifactType, number> = {
  CONSOLIDATED_SESSION_REFERENCE: 100,  // Highest - synthesizes sessions
  DEFINITION_OF_DONE: 80,               // Explicit completion criteria
  SYSTEM_OPERATION_MANUAL: 60,          // How system works
  SYSTEM_DIAGNOSTICS_GUIDE: 40,         // Troubleshooting
  FAQ_REFERENCE: 20,                    // Common questions
};

/**
 * GET /api/v1/projects/:projectId/knowledge
 * List all knowledge artifacts for a project
 */
knowledge.get('/:projectId/knowledge', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  // Verify project ownership
  const project = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Get query filters
  const type = c.req.query('type') as KnowledgeArtifactType | undefined;
  const status = c.req.query('status') as ArtifactStatus | undefined;

  let query = 'SELECT * FROM knowledge_artifacts WHERE project_id = ?';
  const params: string[] = [projectId];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY authority_level DESC, updated_at DESC';

  const result = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({
    artifacts: result.results.map(normalizeArtifact),
    total: result.results.length,
  });
});

/**
 * POST /api/v1/projects/:projectId/knowledge
 * Create a new knowledge artifact
 */
knowledge.post('/:projectId/knowledge', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  // Verify project ownership
  const project = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<CreateKnowledgeArtifactRequest>();
  const { type, title, content, summary, derivation_source, source_session_ids, source_artifact_ids } = body;

  if (!type || !title || !content) {
    return c.json({ error: 'type, title, and content are required' }, 400);
  }

  // Validate type
  if (!AUTHORITY_LEVELS[type]) {
    return c.json({ error: `Invalid artifact type: ${type}` }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Per L-GKDL5: AI-derived artifacts start as DRAFT
  const initialStatus: ArtifactStatus = derivation_source === 'AI_DERIVED' ? 'DRAFT' : 'REVIEW';

  await c.env.DB.prepare(`
    INSERT INTO knowledge_artifacts (
      id, project_id, type, title, version, content, summary,
      derivation_source, source_session_ids, source_artifact_ids,
      status, authority_level, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    projectId,
    type,
    title,
    1, // Initial version
    content,
    summary || null,
    derivation_source || 'MANUAL',
    source_session_ids ? JSON.stringify(source_session_ids) : null,
    source_artifact_ids ? JSON.stringify(source_artifact_ids) : null,
    initialStatus,
    AUTHORITY_LEVELS[type],
    userId,
    now,
    now
  ).run();

  return c.json({
    id,
    type,
    title,
    version: 1,
    status: initialStatus,
    authority_level: AUTHORITY_LEVELS[type],
    created_at: now,
  }, 201);
});

/**
 * GET /api/v1/projects/:projectId/knowledge/:id
 * Get a specific knowledge artifact
 */
knowledge.get('/:projectId/knowledge/:id', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const artifactId = c.req.param('id');

  // Verify project ownership
  const project = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const artifact = await c.env.DB.prepare(
    'SELECT * FROM knowledge_artifacts WHERE id = ? AND project_id = ?'
  ).bind(artifactId, projectId).first();

  if (!artifact) {
    return c.json({ error: 'Artifact not found' }, 404);
  }

  return c.json(normalizeArtifact(artifact));
});

/**
 * PUT /api/v1/projects/:projectId/knowledge/:id
 * Update a knowledge artifact
 */
knowledge.put('/:projectId/knowledge/:id', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const artifactId = c.req.param('id');

  // Verify project ownership
  const project = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await c.env.DB.prepare(
    'SELECT * FROM knowledge_artifacts WHERE id = ? AND project_id = ?'
  ).bind(artifactId, projectId).first();

  if (!existing) {
    return c.json({ error: 'Artifact not found' }, 404);
  }

  const body = await c.req.json<UpdateKnowledgeArtifactRequest>();
  const { title, content, summary, status } = body;

  const now = new Date().toISOString();
  const newVersion = (existing.version as number) + 1;

  await c.env.DB.prepare(`
    UPDATE knowledge_artifacts
    SET title = COALESCE(?, title),
        content = COALESCE(?, content),
        summary = COALESCE(?, summary),
        status = COALESCE(?, status),
        version = ?,
        updated_at = ?
    WHERE id = ?
  `).bind(
    title || null,
    content || null,
    summary || null,
    status || null,
    newVersion,
    now,
    artifactId
  ).run();

  return c.json({
    id: artifactId,
    version: newVersion,
    updated_at: now,
  });
});

/**
 * DELETE /api/v1/projects/:projectId/knowledge/:id
 * Delete a knowledge artifact (marks as SUPERSEDED, doesn't hard delete)
 */
knowledge.delete('/:projectId/knowledge/:id', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const artifactId = c.req.param('id');

  // Verify project ownership
  const project = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const now = new Date().toISOString();

  // Soft delete - mark as SUPERSEDED
  const result = await c.env.DB.prepare(`
    UPDATE knowledge_artifacts
    SET status = 'SUPERSEDED', updated_at = ?
    WHERE id = ? AND project_id = ?
  `).bind(now, artifactId, projectId).run();

  if (result.meta.changes === 0) {
    return c.json({ error: 'Artifact not found' }, 404);
  }

  return c.json({ success: true, status: 'SUPERSEDED' });
});

/**
 * POST /api/v1/projects/:projectId/knowledge/:id/approve
 * Approve a knowledge artifact (L-GKDL5)
 */
knowledge.post('/:projectId/knowledge/:id/approve', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const artifactId = c.req.param('id');

  // Verify project ownership
  const project = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await c.env.DB.prepare(
    'SELECT status FROM knowledge_artifacts WHERE id = ? AND project_id = ?'
  ).bind(artifactId, projectId).first();

  if (!existing) {
    return c.json({ error: 'Artifact not found' }, 404);
  }

  if (existing.status === 'APPROVED') {
    return c.json({ error: 'Artifact already approved' }, 400);
  }

  if (existing.status === 'SUPERSEDED') {
    return c.json({ error: 'Cannot approve superseded artifact' }, 400);
  }

  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE knowledge_artifacts
    SET status = 'APPROVED', approved_by = ?, approved_at = ?, updated_at = ?
    WHERE id = ?
  `).bind(userId, now, now, artifactId).run();

  return c.json({
    id: artifactId,
    status: 'APPROVED',
    approved_by: userId,
    approved_at: now,
  });
});

/**
 * POST /api/v1/projects/:projectId/knowledge/generate-csr
 * Generate a Consolidated Session Reference (L-GCP6, L-GKDL7)
 * This creates a CSR from the last N sessions
 */
knowledge.post('/:projectId/knowledge/generate-csr', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  // Verify project ownership
  const project = await c.env.DB.prepare(
    'SELECT id, name FROM projects WHERE id = ? AND owner_id = ?'
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Get session count from messages (approximation)
  const messagesResult = await c.env.DB.prepare(`
    SELECT COUNT(DISTINCT DATE(created_at)) as session_count,
           MIN(created_at) as first_session,
           MAX(created_at) as last_session
    FROM messages
    WHERE project_id = ?
  `).bind(projectId).first();

  const sessionCount = (messagesResult?.session_count as number) || 0;

  if (sessionCount < 10) {
    return c.json({
      error: 'CSR generation requires at least 10 sessions',
      current_sessions: sessionCount,
    }, 400);
  }

  // Get key decisions from the decisions table
  const decisionsResult = await c.env.DB.prepare(`
    SELECT description, created_at
    FROM decisions
    WHERE project_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  `).bind(projectId).all();

  const keyDecisions = decisionsResult.results.map(d => d.description as string);

  // Generate CSR content
  const now = new Date().toISOString();
  const csrContent = generateCSRContent(
    project.name as string,
    sessionCount,
    messagesResult?.first_session as string,
    messagesResult?.last_session as string,
    keyDecisions
  );

  const id = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO knowledge_artifacts (
      id, project_id, type, title, version, content, summary,
      derivation_source, status, authority_level, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    projectId,
    'CONSOLIDATED_SESSION_REFERENCE',
    `CSR: Sessions 1-${sessionCount}`,
    1,
    csrContent,
    `Consolidated reference for ${sessionCount} sessions`,
    'AI_DERIVED',
    'DRAFT', // Per L-GKDL5: AI-derived starts as DRAFT
    AUTHORITY_LEVELS.CONSOLIDATED_SESSION_REFERENCE,
    userId,
    now,
    now
  ).run();

  return c.json({
    id,
    type: 'CONSOLIDATED_SESSION_REFERENCE',
    title: `CSR: Sessions 1-${sessionCount}`,
    status: 'DRAFT',
    session_count: sessionCount,
    message: 'CSR generated. Requires Director approval per L-GKDL5.',
  }, 201);
});

// Helper: Generate CSR content
function generateCSRContent(
  projectName: string,
  sessionCount: number,
  firstSession: string,
  lastSession: string,
  keyDecisions: string[]
): string {
  return `# Consolidated Session Reference (CSR)

**Project:** ${projectName}
**Sessions Covered:** 1 - ${sessionCount}
**Date Range:** ${firstSession} to ${lastSession}
**Generated:** ${new Date().toISOString()}

---

## Session Overview

This CSR consolidates ${sessionCount} sessions per AIXORD L-GCP6 requirement.

## Key Decisions

${keyDecisions.length > 0
    ? keyDecisions.map((d, i) => `${i + 1}. ${d}`).join('\n')
    : '- No decisions recorded'}

## Recovery Context

To resume work on this project:
1. Review this CSR for context
2. Check the most recent session notes
3. Verify current phase and gate status

---

*Per L-GKDL7 (Anti-Archaeology): This CSR exists to prevent excessive session archaeology.*
*Generated per AIXORD v4.3 GKDL-01 specification.*
`;
}

// Helper: Normalize artifact from DB
function normalizeArtifact(row: Record<string, unknown>): KnowledgeArtifact {
  return {
    id: row.id as string,
    project_id: row.project_id as string,
    type: row.type as KnowledgeArtifactType,
    title: row.title as string,
    version: row.version as number,
    content: row.content as string,
    summary: row.summary as string | undefined,
    derivation_source: row.derivation_source as DerivationSource,
    source_session_ids: row.source_session_ids
      ? JSON.parse(row.source_session_ids as string)
      : undefined,
    source_artifact_ids: row.source_artifact_ids
      ? JSON.parse(row.source_artifact_ids as string)
      : undefined,
    status: row.status as ArtifactStatus,
    approved_by: row.approved_by as string | undefined,
    approved_at: row.approved_at as string | undefined,
    authority_level: row.authority_level as number,
    supersedes: row.supersedes as string | undefined,
    superseded_by: row.superseded_by as string | undefined,
    created_by: row.created_by as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export default knowledge;
