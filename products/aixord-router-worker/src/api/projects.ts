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

const projects = new Hono<{ Bindings: Env }>();

// All routes require auth
projects.use('/*', requireAuth);

/**
 * POST /api/v1/projects
 */
projects.post('/', async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json<{ name?: string; objective?: string; reality_classification?: string }>();
    const { name, objective, reality_classification } = body;

    if (!name) {
      return c.json({ error: 'Project name required' }, 400);
    }

    const projectId = crypto.randomUUID();
    const now = new Date().toISOString();
    const realityClass = reality_classification || 'GREENFIELD';

    // Create project
    await c.env.DB.prepare(
      'INSERT INTO projects (id, owner_id, name, objective, reality_classification, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(projectId, userId, name, objective || null, realityClass, now, now).run();

    // Initialize state with full AIXORD v4.3 gate structure
    const initialGates = {
      // Setup gates (10-step)
      LIC: false, DIS: false, TIR: false, ENV: false, FLD: false,
      CIT: false, CON: false, OBJ: false, RA: false, DC: false,
      // Execution gates
      FX: false, PD: false, PR: false, BP: false, MS: false, VA: false, HO: false
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
      project: { name, objective: objective || null },
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
      created_at: now,
      updated_at: now
    }, 201);
  } catch (error) {
    console.error('Create project error:', error);
    return c.json({
      error: 'Failed to create project',
      detail: error instanceof Error ? error.message : String(error)
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
projects.put('/:id', async (c) => {
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
    await c.env.DB.batch([
      // Layer evidence (references execution_layers and images)
      c.env.DB.prepare(
        'DELETE FROM layer_evidence WHERE layer_id IN (SELECT id FROM execution_layers WHERE project_id = ?)'
      ).bind(projectId),
      // Blueprint children (deliverables + integrity reports reference scopes)
      c.env.DB.prepare(
        'DELETE FROM blueprint_integrity_reports WHERE scope_id IN (SELECT id FROM blueprint_scopes WHERE project_id = ?)'
      ).bind(projectId),
      c.env.DB.prepare(
        'DELETE FROM blueprint_deliverables WHERE scope_id IN (SELECT id FROM blueprint_scopes WHERE project_id = ?)'
      ).bind(projectId),
      c.env.DB.prepare('DELETE FROM blueprint_scopes WHERE project_id = ?').bind(projectId),
      // Session edges (references project_sessions)
      c.env.DB.prepare(
        'DELETE FROM session_edges WHERE from_session_id IN (SELECT id FROM project_sessions WHERE project_id = ?)'
      ).bind(projectId),
      // Direct project children
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
      c.env.DB.prepare('DELETE FROM project_state WHERE project_id = ?').bind(projectId),
      // Finally delete the project itself
      c.env.DB.prepare('DELETE FROM projects WHERE id = ? AND owner_id = ?').bind(projectId, userId),
    ]);

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return c.json({
      error: 'Failed to delete project',
      detail: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

export default projects;
