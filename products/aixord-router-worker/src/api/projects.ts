/**
 * Projects API
 *
 * Endpoints:
 * - POST   /api/v1/projects
 * - GET    /api/v1/projects
 * - GET    /api/v1/projects/:id
 * - PUT    /api/v1/projects/:id
 * - DELETE /api/v1/projects/:id
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import { createProjectSchema, updateProjectSchema } from '../schemas/common';
import { log } from '../utils/logger';

const projects = new Hono<{ Bindings: Env }>();

// All routes require auth
projects.use('/*', requireAuth);

/**
 * POST /api/v1/projects
 */
projects.post('/', validateBody(createProjectSchema), async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json<{ name?: string; objective?: string; reality_classification?: string; project_type?: string }>();
    const { name, objective, reality_classification, project_type } = body;

    if (!name) {
      return c.json({ error: 'Project name required' }, 400);
    }

    const projectId = crypto.randomUUID();
    const now = new Date().toISOString();
    const realityClass = reality_classification || 'GREENFIELD';
    const VALID_PROJECT_TYPES = ['software', 'general', 'research', 'legal', 'personal'];
    const projectTypeValue = VALID_PROJECT_TYPES.includes(project_type || '') ? project_type! : 'software';

    // Create project
    await c.env.DB.prepare(
      'INSERT INTO projects (id, owner_id, name, objective, reality_classification, project_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(projectId, userId, name, objective || null, realityClass, projectTypeValue, now, now).run();

    // Initialize state with AIXORD gate structure (GA: = setup, GW: = work)
    // Non-software project types get reduced gates — skip blueprint/engineering-specific gates
    const isSoftware = projectTypeValue === 'software';
    const initialGates: Record<string, boolean> = {
      // Setup gates (GA: prefix) — core gates for all project types
      'GA:LIC': false, 'GA:DIS': false, 'GA:TIR': false,
      'GA:ENV': false, 'GA:FLD': false,
      'GA:CIT': false, 'GA:CON': false,
      // Blueprint/Integrity gates — software only (auto-passed for non-software)
      'GA:BP': !isSoftware, 'GA:IVL': !isSoftware,
      'GA:PS': false, 'GA:GP': false,
      // Work gates (GW: prefix) — reduced for non-software
      'GW:PRE': false, 'GW:VAL': false, 'GW:DOC': false,
      'GW:QA': !isSoftware,   // Auto-passed for non-software
      'GW:DEP': !isSoftware,  // Auto-passed for non-software
      'GW:VER': false, 'GW:ARC': false,
    };

    // Security gates (SPG-01)
    const initialSecurityGates = {
      GS_DC: false,  // Data Classification declared
      GS_DP: false,  // Data Protection requirements satisfiable
      GS_AC: false,  // Access Controls appropriate
      GS_AI: false,  // AI usage complies with classification
      GS_JR: false,  // Jurisdiction compliance confirmed
      GS_RT: false   // Retention/deletion policy compliant
    };

    // FIX 3 (Session 13C): Data classification (SPG-01) - defaults to permissive
    // Set ai_exposure = 'INTERNAL' and all fields = 'NO' so users can chat immediately
    const initialDataClassification = {
      pii: 'NO',
      phi: 'NO',
      financial: 'NO',
      legal: 'NO',
      minor: 'NO',
      jurisdiction: 'US',
      regulations: [],
      ai_exposure: 'INTERNAL'  // Permissive default - allows AI access
    };

    // Reconciliation triad (GCP-01)
    const initialReconciliation = {
      planned: [],
      claimed: [],
      verified: [],
      divergences: []
    };

    const initialCapsule = {
      session: { number: 1, phase: 'BRAINSTORM', messageCount: 0, startedAt: now, lastCheckpoint: null },
      project: { name, objective: objective || null, type: projectTypeValue },
      reality: { class: realityClass, constraints: [] },
      // AIXORD v4.3 additions
      data_classification: initialDataClassification,
      security_gates: initialSecurityGates,
      reconciliation: initialReconciliation,
      enhancement: { fs: 0, hr: 0, oa: 0, '2m': 0 },
      session_seq: { seq: 1, prev: '', drift: 0 }
    };

    await c.env.DB.prepare(
      'INSERT INTO project_state (project_id, phase, gates, capsule, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(projectId, 'BRAINSTORM', JSON.stringify(initialGates), JSON.stringify(initialCapsule), now).run();

    // FIX 3 (Session 13C): Create data_classification record with permissive defaults
    // This ensures new projects can use AI immediately without manual setup
    await c.env.DB.prepare(`
      INSERT INTO data_classification
        (project_id, pii, phi, financial, legal, minor_data, jurisdiction, regulations, ai_exposure, declared_by, declared_at)
      VALUES (?, 'NO', 'NO', 'NO', 'NO', 'NO', 'US', '[]', 'INTERNAL', ?, ?)
    `).bind(projectId, userId, now).run();

    // FIX 3 (Session 13C): Create security_gates record with GS:DC and GS:AI passed
    await c.env.DB.prepare(`
      INSERT INTO security_gates
        (project_id, gs_dc, gs_dc_passed_at, gs_dp, gs_ac, gs_ac_passed_at, gs_ai, gs_ai_passed_at, gs_jr, gs_rt, updated_at)
      VALUES (?, TRUE, ?, FALSE, TRUE, ?, TRUE, ?, FALSE, FALSE, ?)
    `).bind(projectId, now, now, now, now).run();

    return c.json({
      id: projectId,
      name,
      objective: objective || null,
      reality_classification: realityClass,
      project_type: projectTypeValue,
      created_at: now,
      updated_at: now
    }, 201);
  } catch (error) {
    log.error('project_create_failed', { error: error instanceof Error ? error.message : String(error) });
    return c.json({
      error: 'Failed to create project',
      error_code: 'INTERNAL_ERROR'
    }, 500);
  }
});

/**
 * GET /api/v1/projects
 */
projects.get('/', async (c) => {
  const userId = c.get('userId');

  const result = await c.env.DB.prepare(
    'SELECT * FROM projects WHERE owner_id = ? ORDER BY updated_at DESC'
  ).bind(userId).all();

  return c.json({ projects: result.results });
});

/**
 * GET /api/v1/projects/:id
 */
projects.get('/:id', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('id');

  const project = await c.env.DB.prepare(
    'SELECT * FROM projects WHERE id = ? AND owner_id = ?'
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  return c.json(project);
});

/**
 * PUT /api/v1/projects/:id
 */
projects.put('/:id', validateBody(updateProjectSchema), async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('id');
  const body = await c.req.json<{ name?: string; objective?: string }>();
  const { name, objective } = body;

  const existing = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
  ).bind(projectId, userId).first();

  if (!existing) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE projects
    SET name = COALESCE(?, name),
        objective = COALESCE(?, objective),
        updated_at = ?
    WHERE id = ?
  `).bind(name || null, objective, now, projectId).run();

  return c.json({ success: true, updated_at: now });
});

/**
 * DELETE /api/v1/projects/:id
 *
 * Explicitly deletes from all child tables in dependency order
 * before deleting the project itself. This avoids relying on
 * FK CASCADE behavior in D1/SQLite which is inconsistent.
 */
projects.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('id');

    // Verify project exists and is owned by user
    const project = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
    ).bind(projectId, userId).first();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Delete child tables in reverse dependency order using batch
    // This handles tables that may or may not have ON DELETE CASCADE
    // IMPORTANT: Every table with a FK to projects(id) MUST be listed here
    await c.env.DB.batch([
      // Grandchild tables (reference children, not projects directly)
      c.env.DB.prepare(
        'DELETE FROM layer_evidence WHERE layer_id IN (SELECT id FROM execution_layers WHERE project_id = ?)'
      ).bind(projectId),
      c.env.DB.prepare(
        'DELETE FROM blueprint_integrity_reports WHERE project_id = ?'
      ).bind(projectId),
      c.env.DB.prepare(
        'DELETE FROM blueprint_deliverables WHERE project_id = ?'
      ).bind(projectId),
      c.env.DB.prepare(
        'DELETE FROM session_edges WHERE from_session_id IN (SELECT id FROM project_sessions WHERE project_id = ?) OR to_session_id IN (SELECT id FROM project_sessions WHERE project_id = ?)'
      ).bind(projectId, projectId),
      // CCS children (reference ccs_incidents, not projects)
      c.env.DB.prepare(
        'DELETE FROM ccs_artifacts WHERE incident_id IN (SELECT id FROM ccs_incidents WHERE project_id = ?)'
      ).bind(projectId),
      c.env.DB.prepare(
        'DELETE FROM ccs_verification_tests WHERE incident_id IN (SELECT id FROM ccs_incidents WHERE project_id = ?)'
      ).bind(projectId),
      // All direct project children (every table with FK to projects.id)
      c.env.DB.prepare('DELETE FROM blueprint_scopes WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM images WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM github_evidence WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM github_connections WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM workspace_bindings WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM messages WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM decisions WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM execution_layers WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM project_sessions WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM knowledge_artifacts WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM ccs_incidents WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM data_classification WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM ai_exposure_log WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM security_gates WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM system_architecture_records WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM interface_contracts WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM fitness_functions WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM integration_tests WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM iteration_budget WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM operational_readiness WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM rollback_strategies WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM alert_configurations WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM knowledge_transfers WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM artifacts WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM state WHERE project_id = ?').bind(projectId),
      // SYS-01: Clean up conversations and their messages
      c.env.DB.prepare('DELETE FROM conversation_messages WHERE conversation_id IN (SELECT id FROM conversations WHERE project_id = ?)').bind(projectId),
      c.env.DB.prepare('DELETE FROM conversations WHERE project_id = ?').bind(projectId),
      c.env.DB.prepare('DELETE FROM project_state WHERE project_id = ?').bind(projectId),
      // Finally delete the project itself
      c.env.DB.prepare('DELETE FROM projects WHERE id = ? AND owner_id = ?').bind(projectId, userId),
    ]);

    return c.json({ success: true });
  } catch (error) {
    log.error('project_delete_failed', { error: error instanceof Error ? error.message : String(error) });
    return c.json({
      error: 'Failed to delete project',
      error_code: 'INTERNAL_ERROR'
    }, 500);
  }
});

export default projects;
