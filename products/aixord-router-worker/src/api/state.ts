/**
 * State API
 *
 * AIXORD governance state persistence per project.
 *
 * Endpoints:
 * - GET  /api/v1/state/:projectId
 * - PUT  /api/v1/state/:projectId
 * - PUT  /api/v1/state/:projectId/gates/:gateId
 * - PUT  /api/v1/state/:projectId/phase
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';

const state = new Hono<{ Bindings: Env }>();

// All routes require auth
state.use('/*', requireAuth);

/**
 * Normalize phase to full name format (BRAINSTORM, PLAN, EXECUTE, REVIEW)
 * Accepts both short codes (B, P, E, R) and full names
 */
function normalizePhase(phase: string): string | null {
  if (!phase) return null;
  const p = phase.trim().toUpperCase();
  const phaseMap: Record<string, string> = {
    'B': 'BRAINSTORM', 'P': 'PLAN', 'E': 'EXECUTE', 'R': 'REVIEW',
    'BRAINSTORM': 'BRAINSTORM', 'PLAN': 'PLAN', 'EXECUTE': 'EXECUTE', 'REVIEW': 'REVIEW'
  };
  return phaseMap[p] || null;
}

/**
 * Validate phase string
 */
function isValidPhase(phase: string): boolean {
  const validPhases = ['B', 'P', 'E', 'R', 'BRAINSTORM', 'PLAN', 'EXECUTE', 'REVIEW'];
  return validPhases.includes(phase.toUpperCase());
}

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
 * GET /api/v1/state/:projectId
 */
state.get('/:projectId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const projectState = await c.env.DB.prepare(
    'SELECT * FROM project_state WHERE project_id = ?'
  ).bind(projectId).first<{
    project_id: string;
    phase: string;
    gates: string;
    capsule: string;
    updated_at: string;
  }>();

  if (!projectState) {
    return c.json({ error: 'State not found' }, 404);
  }

  return c.json({
    project_id: projectState.project_id,
    phase: projectState.phase,
    gates: JSON.parse(projectState.gates || '{}'),
    capsule: JSON.parse(projectState.capsule || '{}'),
    updated_at: projectState.updated_at
  });
});

/**
 * PUT /api/v1/state/:projectId
 */
state.put('/:projectId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    phase?: string;
    gates?: Record<string, boolean>;
    capsule?: Record<string, unknown>;
    // FIX 2 (Session 13C): Accept data_classification and security_gates from frontend
    data_classification?: {
      pii?: string;
      phi?: string;
      financial?: string;
      legal?: string;
      minor_data?: string;
      ai_exposure?: string;
    };
    security_gates?: Record<string, boolean>;
  }>();
  const { phase, gates, capsule, data_classification, security_gates } = body;

  // Validate and normalize phase if provided
  let normalizedPhaseValue: string | null = null;
  if (phase) {
    if (!isValidPhase(phase)) {
      return c.json({ error: 'Invalid phase. Must be B/P/E/R or BRAINSTORM/PLAN/EXECUTE/REVIEW' }, 400);
    }
    normalizedPhaseValue = normalizePhase(phase);
  }

  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE project_state
    SET phase = COALESCE(?, phase),
        gates = COALESCE(?, gates),
        capsule = COALESCE(?, capsule),
        updated_at = ?
    WHERE project_id = ?
  `).bind(
    normalizedPhaseValue,
    gates ? JSON.stringify(gates) : null,
    capsule ? JSON.stringify(capsule) : null,
    now,
    projectId
  ).run();

  // FIX 2 (Session 13C): Save data_classification if provided
  if (data_classification) {
    const existing = await c.env.DB.prepare(
      'SELECT project_id FROM data_classification WHERE project_id = ?'
    ).bind(projectId).first();

    if (existing) {
      await c.env.DB.prepare(`
        UPDATE data_classification
        SET pii = COALESCE(?, pii),
            phi = COALESCE(?, phi),
            financial = COALESCE(?, financial),
            legal = COALESCE(?, legal),
            minor_data = COALESCE(?, minor_data),
            ai_exposure = COALESCE(?, ai_exposure),
            declared_by = ?,
            declared_at = ?,
            updated_at = ?
        WHERE project_id = ?
      `).bind(
        data_classification.pii || null,
        data_classification.phi || null,
        data_classification.financial || null,
        data_classification.legal || null,
        data_classification.minor_data || null,
        data_classification.ai_exposure || null,
        userId,
        now,
        now,
        projectId
      ).run();
    } else {
      await c.env.DB.prepare(`
        INSERT INTO data_classification
          (project_id, pii, phi, financial, legal, minor_data, jurisdiction, regulations, ai_exposure, declared_by, declared_at)
        VALUES (?, ?, ?, ?, ?, ?, 'US', '[]', ?, ?, ?)
      `).bind(
        projectId,
        data_classification.pii || 'UNKNOWN',
        data_classification.phi || 'UNKNOWN',
        data_classification.financial || 'UNKNOWN',
        data_classification.legal || 'UNKNOWN',
        data_classification.minor_data || 'UNKNOWN',
        data_classification.ai_exposure || 'INTERNAL',
        userId,
        now
      ).run();
    }
  }

  // FIX 2 (Session 13C): Save security_gates if provided
  if (security_gates) {
    const existing = await c.env.DB.prepare(
      'SELECT project_id FROM security_gates WHERE project_id = ?'
    ).bind(projectId).first();

    if (existing) {
      // Update individual gates
      for (const [gate, passed] of Object.entries(security_gates)) {
        const gateColumn = gate.toLowerCase().replace(':', '_'); // GS:DC -> gs_dc
        const passedAtColumn = `${gateColumn}_passed_at`;
        // Use dynamic column names safely by checking against known gates
        const validGates = ['gs_dc', 'gs_dp', 'gs_ac', 'gs_ai', 'gs_jr', 'gs_rt'];
        if (validGates.includes(gateColumn)) {
          await c.env.DB.prepare(`
            UPDATE security_gates
            SET ${gateColumn} = ?, ${passedAtColumn} = ?, updated_at = ?
            WHERE project_id = ?
          `).bind(passed, passed ? now : null, now, projectId).run();
        }
      }
    } else {
      // Create new security_gates record with defaults
      await c.env.DB.prepare(`
        INSERT INTO security_gates
          (project_id, gs_dc, gs_dp, gs_ac, gs_ai, gs_jr, gs_rt, updated_at)
        VALUES (?, ?, FALSE, TRUE, ?, FALSE, FALSE, ?)
      `).bind(
        projectId,
        security_gates['GS:DC'] || security_gates['gs_dc'] || false,
        security_gates['GS:AI'] || security_gates['gs_ai'] || false,
        now
      ).run();
    }
  }

  return c.json({ success: true, updated_at: now });
});

/**
 * PUT /api/v1/state/:projectId/gates/:gateId
 */
state.put('/:projectId/gates/:gateId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const gateId = c.req.param('gateId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{ enabled: boolean }>();
  const { enabled } = body;

  if (typeof enabled !== 'boolean') {
    return c.json({ error: 'enabled must be a boolean' }, 400);
  }

  // Get current gates
  const current = await c.env.DB.prepare(
    'SELECT gates FROM project_state WHERE project_id = ?'
  ).bind(projectId).first<{ gates: string }>();

  const gates = JSON.parse(current?.gates || '{}');
  gates[gateId] = enabled;

  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE project_state
    SET gates = ?, updated_at = ?
    WHERE project_id = ?
  `).bind(JSON.stringify(gates), now, projectId).run();

  return c.json({ success: true, gates, updated_at: now });
});

/**
 * PUT /api/v1/state/:projectId/phase
 */
state.put('/:projectId/phase', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{ phase: string }>();
  const { phase } = body;

  if (!isValidPhase(phase)) {
    return c.json({ error: 'Invalid phase. Must be B/P/E/R or BRAINSTORM/PLAN/EXECUTE/REVIEW' }, 400);
  }

  const normalizedPhaseValue = normalizePhase(phase);
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE project_state
    SET phase = ?, updated_at = ?
    WHERE project_id = ?
  `).bind(normalizedPhaseValue, now, projectId).run();

  return c.json({ success: true, phase: normalizedPhaseValue, updated_at: now });
});

export default state;
