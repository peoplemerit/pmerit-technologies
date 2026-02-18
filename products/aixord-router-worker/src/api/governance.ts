/**
 * Mathematical Governance API
 *
 * Exposes the quantitative governance system:
 *   - WU Conservation (allocation, transfer, audit)
 *   - Readiness Scoring (R = L × P × V per scope)
 *   - Reconciliation Triad (PLANNED vs CLAIMED vs VERIFIED)
 *   - Combined Dashboard endpoint
 *
 * Endpoints:
 *   POST /:projectId/governance/wu/allocate      — Allocate WU to a scope
 *   POST /:projectId/governance/wu/transfer       — Transfer WU for verified scope
 *   POST /:projectId/governance/wu/initialize     — Set project total WU
 *   GET  /:projectId/governance/readiness         — Per-scope L/P/V/R breakdown
 *   GET  /:projectId/governance/conservation      — Conservation formula snapshot
 *   GET  /:projectId/governance/reconciliation    — Reconciliation Triad
 *   GET  /:projectId/governance/dashboard         — Combined metrics
 *   GET  /:projectId/governance/audit             — WU audit trail
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import {
  computeProjectReadiness,
  computeScopeReadiness,
  getConservationSnapshot,
  allocateWorkUnits,
  transferWorkUnits,
  computeReconciliation,
} from '../services/readinessEngine';
import { verifyProjectOwnership } from '../utils/projectOwnership';

const governance = new Hono<{ Bindings: Env }>();

governance.use('/*', requireAuth);

// ============================================================================
// WU MANAGEMENT
// ============================================================================

/**
 * POST /:projectId/governance/wu/initialize
 * Set the total WU budget for a project (Director action).
 * Sets execution_total_wu and formula_execution_wu (all work starts as planned).
 */
governance.post('/:projectId/governance/wu/initialize', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{ total_wu: number }>();
  const { total_wu } = body;

  if (!total_wu || total_wu <= 0) {
    return c.json({ error: 'total_wu must be a positive number' }, 400);
  }

  // Check if already initialized
  const project = await c.env.DB.prepare(
    'SELECT execution_total_wu FROM projects WHERE id = ?'
  ).bind(projectId).first<{ execution_total_wu: number }>();

  if (project && project.execution_total_wu > 0) {
    return c.json({
      error: 'WU already initialized. Use wu/adjust to modify.',
      current_total: project.execution_total_wu,
    }, 409);
  }

  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `UPDATE projects
     SET execution_total_wu = ?, formula_execution_wu = ?, verified_reality_wu = 0
     WHERE id = ?`
  ).bind(total_wu, total_wu, projectId).run();

  // Log
  await c.env.DB.prepare(
    `INSERT INTO wu_audit_log
     (project_id, event_type, wu_amount, snapshot_total, snapshot_formula, snapshot_verified, conservation_valid, actor_id, notes, created_at)
     VALUES (?, 'WU_ALLOCATED', ?, ?, ?, 0, 1, ?, 'Project WU initialized', ?)`
  ).bind(projectId, total_wu, total_wu, total_wu, userId, now).run();

  return c.json({
    success: true,
    execution_total_wu: total_wu,
    formula_execution_wu: total_wu,
    verified_reality_wu: 0,
  });
});

/**
 * POST /:projectId/governance/wu/allocate
 * Allocate WU to a scope from the project budget.
 */
governance.post('/:projectId/governance/wu/allocate', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{ scope_id: string; wu_amount: number }>();
  const { scope_id, wu_amount } = body;

  if (!scope_id) {
    return c.json({ error: 'scope_id is required' }, 400);
  }
  if (wu_amount === undefined || wu_amount < 0) {
    return c.json({ error: 'wu_amount must be a non-negative number' }, 400);
  }

  // Verify scope exists
  const scope = await c.env.DB.prepare(
    'SELECT id FROM blueprint_scopes WHERE id = ? AND project_id = ?'
  ).bind(scope_id, projectId).first();

  if (!scope) {
    return c.json({ error: 'Scope not found' }, 404);
  }

  const result = await allocateWorkUnits(c.env.DB, projectId, scope_id, wu_amount, userId);

  if (!result.success) {
    return c.json({ error: result.error, conservation: result.conservation }, 400);
  }

  return c.json(result);
});

/**
 * POST /:projectId/governance/wu/transfer
 * Transfer WU for a scope (applies R = L × P × V transfer formula).
 */
governance.post('/:projectId/governance/wu/transfer', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{ scope_id: string }>();
  const { scope_id } = body;

  if (!scope_id) {
    return c.json({ error: 'scope_id is required' }, 400);
  }

  try {
    const result = await transferWorkUnits(c.env.DB, projectId, scope_id, userId);
    return c.json(result);
  } catch (err) {
    return c.json({
      error: 'Transfer failed',
    }, 400);
  }
});

// ============================================================================
// READINESS & CONSERVATION QUERIES
// ============================================================================

/**
 * GET /:projectId/governance/readiness
 * Per-scope L/P/V/R breakdown + project-level R.
 */
governance.get('/:projectId/governance/readiness', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const result = await computeProjectReadiness(c.env.DB, projectId);
  return c.json(result);
});

/**
 * GET /:projectId/governance/conservation
 * Conservation formula snapshot.
 */
governance.get('/:projectId/governance/conservation', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const conservation = await getConservationSnapshot(c.env.DB, projectId);
  return c.json(conservation);
});

/**
 * GET /:projectId/governance/reconciliation
 * Reconciliation Triad: PLANNED vs CLAIMED vs VERIFIED.
 */
governance.get('/:projectId/governance/reconciliation', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const result = await computeReconciliation(c.env.DB, projectId);
  return c.json(result);
});

/**
 * GET /:projectId/governance/dashboard
 * Combined metrics: readiness + conservation + reconciliation + recent audit.
 */
governance.get('/:projectId/governance/dashboard', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Run all computations in parallel
  const [readiness, reconciliation, auditResult] = await Promise.all([
    computeProjectReadiness(c.env.DB, projectId),
    computeReconciliation(c.env.DB, projectId),
    c.env.DB.prepare(
      'SELECT * FROM wu_audit_log WHERE project_id = ? ORDER BY created_at DESC LIMIT 20'
    ).bind(projectId).all(),
  ]);

  return c.json({
    readiness,
    reconciliation,
    audit_trail: auditResult.results || [],
    generated_at: new Date().toISOString(),
  });
});

/**
 * GET /:projectId/governance/audit
 * WU audit trail (paginated).
 */
governance.get('/:projectId/governance/audit', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const limit = parseInt(c.req.query('limit') || '50', 10);
  const offset = parseInt(c.req.query('offset') || '0', 10);

  const result = await c.env.DB.prepare(
    'SELECT * FROM wu_audit_log WHERE project_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).bind(projectId, Math.min(limit, 100), offset).all();

  const countResult = await c.env.DB.prepare(
    'SELECT COUNT(*) as total FROM wu_audit_log WHERE project_id = ?'
  ).bind(projectId).first<{ total: number }>();

  return c.json({
    events: result.results || [],
    total: countResult?.total || 0,
    limit,
    offset,
  });
});

// =============================================================================
// GAP-2: Readiness Escalation Status
// =============================================================================

/**
 * GET /:projectId/governance/escalation
 * Get current escalation level and recent events.
 */
governance.get('/:projectId/governance/escalation', async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await verifyProjectOwnership(c.env.DB, projectId, userId);
  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const { getEscalationStatus } = await import('../services/readinessEscalation');
  const status = await getEscalationStatus(c.env.DB, projectId);

  return c.json(status);
});

/**
 * POST /:projectId/governance/escalation/check
 * Manually trigger an escalation check (for testing or Director override).
 */
governance.post('/:projectId/governance/escalation/check', async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await verifyProjectOwnership(c.env.DB, projectId, userId);
  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const { checkReadinessEscalation } = await import('../services/readinessEscalation');
  const result = await checkReadinessEscalation(c.env.DB, projectId, userId);

  return c.json(result);
});

export default governance;
