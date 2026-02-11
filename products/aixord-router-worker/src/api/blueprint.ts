/**
 * Blueprint Governance API — AIXORD v4.5 Post-Blueprint (L-BPX, L-IVL)
 *
 * Implements Blueprint artifact management and Integrity Validation:
 *   - CRUD  /:projectId/blueprint/scopes          — Scopes & Sub-Scopes (L-BPX2-3)
 *   - CRUD  /:projectId/blueprint/deliverables     — Deliverables with DoD (L-BPX4-5)
 *   - POST  /:projectId/blueprint/validate         — 5-check Integrity Validation (L-IVL)
 *   - GET   /:projectId/blueprint/integrity        — Latest integrity report
 *   - GET   /:projectId/blueprint/dag              — DAG representation (L-BPX7)
 *   - GET   /:projectId/blueprint/summary          — Counts + validation status
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import { triggerGateEvaluation } from '../services/gateRules';

const blueprint = new Hono<{ Bindings: Env }>();

// All routes require auth
blueprint.use('/*', requireAuth);

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

// ============================================================================
// SCOPES CRUD — L-BPX2, L-BPX3
// ============================================================================

/**
 * POST /:projectId/blueprint/scopes
 * Create a scope (tier 1) or sub-scope (tier 2 with parent_scope_id)
 */
blueprint.post('/:projectId/blueprint/scopes', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    name: string;
    parent_scope_id?: string;
    purpose?: string;
    boundary?: string;
    assumptions?: string[];
    assumption_status?: string;
    inputs?: string;
    outputs?: string;
    notes?: string;
  }>();

  if (!body.name) {
    return c.json({ error: 'name is required' }, 400);
  }

  // Determine tier: if parent_scope_id provided and valid, tier = 2
  let tier = 1;
  if (body.parent_scope_id) {
    const parent = await c.env.DB.prepare(
      'SELECT id, tier FROM blueprint_scopes WHERE id = ? AND project_id = ?'
    ).bind(body.parent_scope_id, projectId).first<{ id: string; tier: number }>();
    if (!parent) {
      return c.json({ error: 'Parent scope not found' }, 404);
    }
    if (parent.tier !== 1) {
      return c.json({ error: 'Sub-scopes can only be children of tier-1 scopes' }, 400);
    }
    tier = 2;
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO blueprint_scopes (
      id, project_id, parent_scope_id, tier, name, purpose, boundary,
      assumptions, assumption_status, inputs, outputs, status,
      sort_order, notes, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', 0, ?, ?, ?, ?)
  `).bind(
    id, projectId, body.parent_scope_id || null, tier, body.name,
    body.purpose || null, body.boundary || null,
    JSON.stringify(body.assumptions || []),
    body.assumption_status || 'OPEN',
    body.inputs || null, body.outputs || null,
    body.notes || null, userId, now, now
  ).run();

  // Phase 2: Auto-evaluate gates after scope creation (GA:BP may flip)
  c.executionCtx.waitUntil(triggerGateEvaluation(c.env.DB, projectId, userId));

  return c.json({
    id, project_id: projectId, tier, name: body.name,
    parent_scope_id: body.parent_scope_id || null,
    status: 'DRAFT', created_at: now,
  }, 201);
});

/**
 * GET /:projectId/blueprint/scopes
 * List all scopes as a flat list (frontend builds tree from parent_scope_id)
 */
blueprint.get('/:projectId/blueprint/scopes', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const result = await c.env.DB.prepare(
    'SELECT * FROM blueprint_scopes WHERE project_id = ? ORDER BY tier ASC, sort_order ASC, created_at ASC'
  ).bind(projectId).all();

  return c.json({ scopes: result.results, total: result.results.length });
});

/**
 * GET /:projectId/blueprint/scopes/:scopeId
 * Get scope with its deliverables
 */
blueprint.get('/:projectId/blueprint/scopes/:scopeId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const scopeId = c.req.param('scopeId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const scope = await c.env.DB.prepare(
    'SELECT * FROM blueprint_scopes WHERE id = ? AND project_id = ?'
  ).bind(scopeId, projectId).first();

  if (!scope) {
    return c.json({ error: 'Scope not found' }, 404);
  }

  const deliverables = await c.env.DB.prepare(
    'SELECT * FROM blueprint_deliverables WHERE scope_id = ? AND project_id = ? ORDER BY sort_order ASC'
  ).bind(scopeId, projectId).all();

  const children = await c.env.DB.prepare(
    'SELECT * FROM blueprint_scopes WHERE parent_scope_id = ? AND project_id = ? ORDER BY sort_order ASC'
  ).bind(scopeId, projectId).all();

  return c.json({ ...scope, deliverables: deliverables.results, children: children.results });
});

/**
 * PUT /:projectId/blueprint/scopes/:scopeId
 * Update a scope
 */
blueprint.put('/:projectId/blueprint/scopes/:scopeId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const scopeId = c.req.param('scopeId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    name?: string;
    purpose?: string;
    boundary?: string;
    assumptions?: string[];
    assumption_status?: string;
    inputs?: string;
    outputs?: string;
    status?: string;
    sort_order?: number;
    notes?: string;
  }>();

  const now = new Date().toISOString();
  const sets: string[] = ['updated_at = ?'];
  const params: (string | number | null)[] = [now];

  if (body.name !== undefined) { sets.push('name = ?'); params.push(body.name); }
  if (body.purpose !== undefined) { sets.push('purpose = ?'); params.push(body.purpose); }
  if (body.boundary !== undefined) { sets.push('boundary = ?'); params.push(body.boundary); }
  if (body.assumptions !== undefined) { sets.push('assumptions = ?'); params.push(JSON.stringify(body.assumptions)); }
  if (body.assumption_status !== undefined) { sets.push('assumption_status = ?'); params.push(body.assumption_status); }
  if (body.inputs !== undefined) { sets.push('inputs = ?'); params.push(body.inputs); }
  if (body.outputs !== undefined) { sets.push('outputs = ?'); params.push(body.outputs); }
  if (body.status !== undefined) { sets.push('status = ?'); params.push(body.status); }
  if (body.sort_order !== undefined) { sets.push('sort_order = ?'); params.push(body.sort_order); }
  if (body.notes !== undefined) { sets.push('notes = ?'); params.push(body.notes); }

  params.push(scopeId, projectId);

  await c.env.DB.prepare(
    `UPDATE blueprint_scopes SET ${sets.join(', ')} WHERE id = ? AND project_id = ?`
  ).bind(...params).run();

  // Phase 2: Auto-evaluate gates after scope update
  c.executionCtx.waitUntil(triggerGateEvaluation(c.env.DB, projectId, userId));

  return c.json({ id: scopeId, updated_at: now });
});

/**
 * DELETE /:projectId/blueprint/scopes/:scopeId
 * Delete a scope (cascades to deliverables via FK)
 */
blueprint.delete('/:projectId/blueprint/scopes/:scopeId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const scopeId = c.req.param('scopeId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Delete deliverables under this scope first
  await c.env.DB.prepare(
    'DELETE FROM blueprint_deliverables WHERE scope_id = ? AND project_id = ?'
  ).bind(scopeId, projectId).run();

  // Delete child scopes and their deliverables
  const children = await c.env.DB.prepare(
    'SELECT id FROM blueprint_scopes WHERE parent_scope_id = ? AND project_id = ?'
  ).bind(scopeId, projectId).all();

  for (const child of children.results) {
    await c.env.DB.prepare(
      'DELETE FROM blueprint_deliverables WHERE scope_id = ? AND project_id = ?'
    ).bind((child as { id: string }).id, projectId).run();
  }

  await c.env.DB.prepare(
    'DELETE FROM blueprint_scopes WHERE parent_scope_id = ? AND project_id = ?'
  ).bind(scopeId, projectId).run();

  // Delete the scope itself
  await c.env.DB.prepare(
    'DELETE FROM blueprint_scopes WHERE id = ? AND project_id = ?'
  ).bind(scopeId, projectId).run();

  return c.json({ deleted: true });
});

// ============================================================================
// DELIVERABLES CRUD — L-BPX4, L-BPX5
// ============================================================================

/**
 * POST /:projectId/blueprint/deliverables
 * Create a deliverable under a scope
 */
blueprint.post('/:projectId/blueprint/deliverables', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    scope_id: string;
    name: string;
    description?: string;
    upstream_deps?: string[];
    downstream_deps?: string[];
    dependency_type?: string;
    dod_evidence_spec?: string;
    dod_verification_method?: string;
    dod_quality_bar?: string;
    dod_failure_modes?: string;
    notes?: string;
  }>();

  if (!body.scope_id || !body.name) {
    return c.json({ error: 'scope_id and name are required' }, 400);
  }

  // Verify scope exists
  const scope = await c.env.DB.prepare(
    'SELECT id FROM blueprint_scopes WHERE id = ? AND project_id = ?'
  ).bind(body.scope_id, projectId).first();

  if (!scope) {
    return c.json({ error: 'Scope not found' }, 404);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO blueprint_deliverables (
      id, project_id, scope_id, name, description,
      upstream_deps, downstream_deps, dependency_type,
      dod_evidence_spec, dod_verification_method, dod_quality_bar, dod_failure_modes,
      status, sort_order, notes, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', 0, ?, ?, ?, ?)
  `).bind(
    id, projectId, body.scope_id, body.name, body.description || null,
    JSON.stringify(body.upstream_deps || []),
    JSON.stringify(body.downstream_deps || []),
    body.dependency_type || 'hard',
    body.dod_evidence_spec || null,
    body.dod_verification_method || null,
    body.dod_quality_bar || null,
    body.dod_failure_modes || null,
    body.notes || null, userId, now, now
  ).run();

  return c.json({
    id, project_id: projectId, scope_id: body.scope_id, name: body.name,
    status: 'DRAFT', created_at: now,
  }, 201);
});

/**
 * GET /:projectId/blueprint/deliverables
 * List deliverables (optionally filtered by scope_id)
 */
blueprint.get('/:projectId/blueprint/deliverables', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const scopeId = c.req.query('scope_id');
  let query = 'SELECT * FROM blueprint_deliverables WHERE project_id = ?';
  const params: string[] = [projectId];

  if (scopeId) {
    query += ' AND scope_id = ?';
    params.push(scopeId);
  }

  query += ' ORDER BY sort_order ASC, created_at ASC';
  const result = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({ deliverables: result.results, total: result.results.length });
});

/**
 * GET /:projectId/blueprint/deliverables/:deliverableId
 */
blueprint.get('/:projectId/blueprint/deliverables/:deliverableId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const deliverableId = c.req.param('deliverableId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const deliverable = await c.env.DB.prepare(
    'SELECT * FROM blueprint_deliverables WHERE id = ? AND project_id = ?'
  ).bind(deliverableId, projectId).first();

  if (!deliverable) {
    return c.json({ error: 'Deliverable not found' }, 404);
  }

  return c.json(deliverable);
});

/**
 * PUT /:projectId/blueprint/deliverables/:deliverableId
 */
blueprint.put('/:projectId/blueprint/deliverables/:deliverableId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const deliverableId = c.req.param('deliverableId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    name?: string;
    description?: string;
    scope_id?: string;
    upstream_deps?: string[];
    downstream_deps?: string[];
    dependency_type?: string;
    dod_evidence_spec?: string;
    dod_verification_method?: string;
    dod_quality_bar?: string;
    dod_failure_modes?: string;
    status?: string;
    sort_order?: number;
    notes?: string;
  }>();

  const now = new Date().toISOString();
  const sets: string[] = ['updated_at = ?'];
  const params: (string | number | null)[] = [now];

  if (body.name !== undefined) { sets.push('name = ?'); params.push(body.name); }
  if (body.description !== undefined) { sets.push('description = ?'); params.push(body.description); }
  if (body.scope_id !== undefined) { sets.push('scope_id = ?'); params.push(body.scope_id); }
  if (body.upstream_deps !== undefined) { sets.push('upstream_deps = ?'); params.push(JSON.stringify(body.upstream_deps)); }
  if (body.downstream_deps !== undefined) { sets.push('downstream_deps = ?'); params.push(JSON.stringify(body.downstream_deps)); }
  if (body.dependency_type !== undefined) { sets.push('dependency_type = ?'); params.push(body.dependency_type); }
  if (body.dod_evidence_spec !== undefined) { sets.push('dod_evidence_spec = ?'); params.push(body.dod_evidence_spec); }
  if (body.dod_verification_method !== undefined) { sets.push('dod_verification_method = ?'); params.push(body.dod_verification_method); }
  if (body.dod_quality_bar !== undefined) { sets.push('dod_quality_bar = ?'); params.push(body.dod_quality_bar); }
  if (body.dod_failure_modes !== undefined) { sets.push('dod_failure_modes = ?'); params.push(body.dod_failure_modes); }
  if (body.status !== undefined) { sets.push('status = ?'); params.push(body.status); }
  if (body.sort_order !== undefined) { sets.push('sort_order = ?'); params.push(body.sort_order); }
  if (body.notes !== undefined) { sets.push('notes = ?'); params.push(body.notes); }

  params.push(deliverableId, projectId);

  await c.env.DB.prepare(
    `UPDATE blueprint_deliverables SET ${sets.join(', ')} WHERE id = ? AND project_id = ?`
  ).bind(...params).run();

  // Phase 2: Auto-evaluate gates after deliverable update (DoD completion may flip GA:BP)
  c.executionCtx.waitUntil(triggerGateEvaluation(c.env.DB, projectId, userId));

  return c.json({ id: deliverableId, updated_at: now });
});

/**
 * DELETE /:projectId/blueprint/deliverables/:deliverableId
 */
blueprint.delete('/:projectId/blueprint/deliverables/:deliverableId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const deliverableId = c.req.param('deliverableId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM blueprint_deliverables WHERE id = ? AND project_id = ?'
  ).bind(deliverableId, projectId).run();

  return c.json({ deleted: true });
});

// ============================================================================
// INTEGRITY VALIDATION — L-IVL (5 mandatory checks)
// ============================================================================

/**
 * POST /:projectId/blueprint/validate
 * Run all 5 integrity checks, create report, return results
 */
blueprint.post('/:projectId/blueprint/validate', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Load all scopes and deliverables
  const scopesResult = await c.env.DB.prepare(
    'SELECT * FROM blueprint_scopes WHERE project_id = ?'
  ).bind(projectId).all();
  const scopes = scopesResult.results as Array<{
    id: string; tier: number; name: string; purpose: string | null;
    assumption_status: string; parent_scope_id: string | null;
  }>;

  const deliverablesResult = await c.env.DB.prepare(
    'SELECT * FROM blueprint_deliverables WHERE project_id = ?'
  ).bind(projectId).all();
  const deliverables = deliverablesResult.results as Array<{
    id: string; scope_id: string; name: string;
    upstream_deps: string; downstream_deps: string;
    dod_evidence_spec: string | null; dod_verification_method: string | null;
  }>;

  // Load project for formula/objective check
  const project = await c.env.DB.prepare(
    'SELECT * FROM projects WHERE id = ?'
  ).bind(projectId).first<{ id: string; name: string; description: string | null }>();

  const tier1Scopes = scopes.filter(s => s.tier === 1);
  const tier2Scopes = scopes.filter(s => s.tier === 2);
  const deliverableIds = new Set(deliverables.map(d => d.id));

  // ---- CHECK 1: Formula Integrity ----
  let checkFormula = false;
  let checkFormulaDetail = '';

  if (tier1Scopes.length === 0) {
    checkFormulaDetail = 'No scopes defined. Blueprint requires at least one scope.';
  } else if (!project?.description && !project?.name) {
    checkFormulaDetail = 'Project has no objective/description. Cannot verify formula alignment.';
  } else {
    const scopesWithPurpose = tier1Scopes.filter(s => s.purpose && s.purpose.trim().length > 0);
    if (scopesWithPurpose.length === tier1Scopes.length) {
      checkFormula = true;
      checkFormulaDetail = `${tier1Scopes.length} scope(s) aligned to project "${project?.name}". All scopes have declared purpose.`;
    } else {
      checkFormulaDetail = `${tier1Scopes.length - scopesWithPurpose.length} scope(s) missing purpose declaration.`;
    }
  }

  // ---- CHECK 2: Structural Completeness ----
  let checkStructural = false;
  let checkStructuralDetail = '';

  if (tier1Scopes.length === 0) {
    checkStructuralDetail = 'No tier-1 scopes. Blueprint requires at least one scope.';
  } else if (deliverables.length === 0) {
    checkStructuralDetail = 'No deliverables. Blueprint requires at least one deliverable.';
  } else {
    // Check each scope has at least one deliverable (directly or via sub-scopes)
    const scopeIds = new Set(scopes.map(s => s.id));
    const scopesWithDeliverables = new Set(deliverables.map(d => d.scope_id));
    const emptyScopeNames: string[] = [];

    for (const scope of tier1Scopes) {
      const childScopeIds = tier2Scopes.filter(s => s.parent_scope_id === scope.id).map(s => s.id);
      const allScopeIds = [scope.id, ...childScopeIds];
      const hasDeliverables = allScopeIds.some(sid => scopesWithDeliverables.has(sid));
      if (!hasDeliverables) {
        emptyScopeNames.push(scope.name);
      }
    }

    if (emptyScopeNames.length > 0) {
      checkStructuralDetail = `Scope(s) without deliverables: ${emptyScopeNames.join(', ')}`;
    } else {
      checkStructural = true;
      checkStructuralDetail = `${tier1Scopes.length} scope(s), ${tier2Scopes.length} sub-scope(s), ${deliverables.length} deliverable(s). All scopes have deliverables.`;
    }
  }

  // ---- CHECK 3: DAG Soundness ----
  let checkDag = false;
  let checkDagDetail = '';

  if (deliverables.length === 0) {
    checkDagDetail = 'No deliverables to validate DAG.';
  } else {
    // Build adjacency list and check for cycles
    const adjList = new Map<string, string[]>();
    const invalidRefs: string[] = [];
    const selfRefs: string[] = [];
    let totalDeps = 0;

    for (const d of deliverables) {
      const upstream: string[] = JSON.parse(d.upstream_deps || '[]');
      adjList.set(d.id, upstream);
      totalDeps += upstream.length;

      for (const dep of upstream) {
        if (dep === d.id) {
          selfRefs.push(d.name);
        } else if (!deliverableIds.has(dep)) {
          invalidRefs.push(`${d.name} → ${dep}`);
        }
      }
    }

    if (selfRefs.length > 0) {
      checkDagDetail = `Self-referencing deliverables: ${selfRefs.join(', ')}`;
    } else if (invalidRefs.length > 0) {
      checkDagDetail = `Invalid dependency references: ${invalidRefs.join('; ')}`;
    } else {
      // Topological sort to detect cycles
      const visited = new Set<string>();
      const recursionStack = new Set<string>();
      let hasCycle = false;
      let cyclePath = '';

      function dfs(nodeId: string): boolean {
        visited.add(nodeId);
        recursionStack.add(nodeId);
        const deps = adjList.get(nodeId) || [];
        for (const dep of deps) {
          if (!visited.has(dep)) {
            if (dfs(dep)) return true;
          } else if (recursionStack.has(dep)) {
            hasCycle = true;
            cyclePath = `${dep} ↔ ${nodeId}`;
            return true;
          }
        }
        recursionStack.delete(nodeId);
        return false;
      }

      for (const d of deliverables) {
        if (!visited.has(d.id)) {
          dfs(d.id);
          if (hasCycle) break;
        }
      }

      if (hasCycle) {
        checkDagDetail = `Circular dependency detected: ${cyclePath}`;
      } else {
        checkDag = true;
        checkDagDetail = `DAG is acyclic. ${deliverables.length} nodes, ${totalDeps} edges. No cycles, no invalid references.`;
      }
    }
  }

  // ---- CHECK 4: Deliverable Integrity ----
  let checkDeliverable = false;
  let checkDeliverableDetail = '';

  if (deliverables.length === 0) {
    checkDeliverableDetail = 'No deliverables to validate.';
  } else {
    const missingDoD: string[] = [];
    for (const d of deliverables) {
      const missing: string[] = [];
      if (!d.dod_evidence_spec) missing.push('evidence_spec');
      if (!d.dod_verification_method) missing.push('verification_method');
      if (missing.length > 0) {
        missingDoD.push(`${d.name} (missing: ${missing.join(', ')})`);
      }
    }

    if (missingDoD.length > 0) {
      checkDeliverableDetail = `Deliverables missing DoD: ${missingDoD.join('; ')}`;
    } else {
      checkDeliverable = true;
      checkDeliverableDetail = `All ${deliverables.length} deliverable(s) have evidence specification and verification method.`;
    }
  }

  // ---- CHECK 5: Assumption Closure ----
  let checkAssumption = false;
  let checkAssumptionDetail = '';

  const unknownScopes = scopes.filter(s => s.assumption_status === 'UNKNOWN');
  if (unknownScopes.length > 0) {
    checkAssumptionDetail = `Unresolved assumptions in: ${unknownScopes.map(s => s.name).join(', ')}. All assumptions must be CONFIRMED or OPEN.`;
  } else {
    checkAssumption = true;
    const confirmed = scopes.filter(s => s.assumption_status === 'CONFIRMED').length;
    const open = scopes.filter(s => s.assumption_status === 'OPEN').length;
    checkAssumptionDetail = `All assumptions resolved. ${confirmed} CONFIRMED, ${open} OPEN (no UNKNOWN).`;
  }

  // ---- OVERALL ----
  const allPassed = checkFormula && checkStructural && checkDag && checkDeliverable && checkAssumption;

  // Save report
  const reportId = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO blueprint_integrity_reports (
      id, project_id,
      check_formula, check_formula_detail,
      check_structural, check_structural_detail,
      check_dag, check_dag_detail,
      check_deliverable, check_deliverable_detail,
      check_assumption, check_assumption_detail,
      all_passed, total_scopes, total_subscopes, total_deliverables, total_dependencies,
      run_by, run_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    reportId, projectId,
    checkFormula ? 1 : 0, checkFormulaDetail,
    checkStructural ? 1 : 0, checkStructuralDetail,
    checkDag ? 1 : 0, checkDagDetail,
    checkDeliverable ? 1 : 0, checkDeliverableDetail,
    checkAssumption ? 1 : 0, checkAssumptionDetail,
    allPassed ? 1 : 0,
    tier1Scopes.length, tier2Scopes.length, deliverables.length,
    deliverables.reduce((sum, d) => sum + JSON.parse(d.upstream_deps || '[]').length, 0),
    userId, now
  ).run();

  // Phase 2: Auto-evaluate gates after validation (GA:IVL flips based on all_passed)
  c.executionCtx.waitUntil(triggerGateEvaluation(c.env.DB, projectId, userId));

  return c.json({
    id: reportId,
    project_id: projectId,
    all_passed: allPassed,
    checks: {
      formula: { passed: checkFormula, detail: checkFormulaDetail },
      structural: { passed: checkStructural, detail: checkStructuralDetail },
      dag: { passed: checkDag, detail: checkDagDetail },
      deliverable: { passed: checkDeliverable, detail: checkDeliverableDetail },
      assumption: { passed: checkAssumption, detail: checkAssumptionDetail },
    },
    totals: {
      scopes: tier1Scopes.length,
      subscopes: tier2Scopes.length,
      deliverables: deliverables.length,
    },
    run_at: now,
  });
});

/**
 * GET /:projectId/blueprint/integrity
 * Get latest integrity report
 */
blueprint.get('/:projectId/blueprint/integrity', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const report = await c.env.DB.prepare(
    'SELECT * FROM blueprint_integrity_reports WHERE project_id = ? ORDER BY run_at DESC LIMIT 1'
  ).bind(projectId).first();

  if (!report) {
    return c.json({ report: null });
  }

  const r = report as Record<string, unknown>;
  return c.json({
    report: {
      ...r,
      checks: {
        formula: { passed: !!r.check_formula, detail: r.check_formula_detail },
        structural: { passed: !!r.check_structural, detail: r.check_structural_detail },
        dag: { passed: !!r.check_dag, detail: r.check_dag_detail },
        deliverable: { passed: !!r.check_deliverable, detail: r.check_deliverable_detail },
        assumption: { passed: !!r.check_assumption, detail: r.check_assumption_detail },
      },
      totals: {
        scopes: r.total_scopes || 0,
        subscopes: r.total_subscopes || 0,
        deliverables: r.total_deliverables || 0,
      },
    },
  });
});

// ============================================================================
// DAG — L-BPX7
// ============================================================================

/**
 * GET /:projectId/blueprint/dag
 * Get DAG representation (nodes = deliverables, edges = dependencies)
 */
blueprint.get('/:projectId/blueprint/dag', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const deliverables = await c.env.DB.prepare(
    'SELECT id, name, scope_id, status, upstream_deps, downstream_deps FROM blueprint_deliverables WHERE project_id = ? ORDER BY sort_order ASC'
  ).bind(projectId).all();

  const nodes = (deliverables.results as Array<{
    id: string; name: string; scope_id: string; status: string;
    upstream_deps: string; downstream_deps: string;
  }>).map(d => ({
    id: d.id,
    name: d.name,
    scope_id: d.scope_id,
    status: d.status,
  }));

  const edges: Array<{ from: string; to: string; type: string }> = [];
  for (const d of deliverables.results as Array<{ id: string; upstream_deps: string }>) {
    const upstream: string[] = JSON.parse(d.upstream_deps || '[]');
    for (const depId of upstream) {
      edges.push({ from: depId, to: d.id, type: 'dependency' });
    }
  }

  return c.json({ nodes, edges, total_nodes: nodes.length, total_edges: edges.length });
});

// ============================================================================
// SUMMARY
// ============================================================================

/**
 * GET /:projectId/blueprint/summary
 * Quick summary for ribbon display
 */
blueprint.get('/:projectId/blueprint/summary', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const scopeCount = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM blueprint_scopes WHERE project_id = ? AND tier = 1'
  ).bind(projectId).first<{ count: number }>();

  const subscopeCount = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM blueprint_scopes WHERE project_id = ? AND tier = 2'
  ).bind(projectId).first<{ count: number }>();

  const deliverableCount = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM blueprint_deliverables WHERE project_id = ?'
  ).bind(projectId).first<{ count: number }>();

  const deliverableWithDoD = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM blueprint_deliverables WHERE project_id = ? AND dod_evidence_spec IS NOT NULL AND dod_evidence_spec != '' AND dod_verification_method IS NOT NULL AND dod_verification_method != ''"
  ).bind(projectId).first<{ count: number }>();

  const latestReport = await c.env.DB.prepare(
    'SELECT all_passed, run_at FROM blueprint_integrity_reports WHERE project_id = ? ORDER BY run_at DESC LIMIT 1'
  ).bind(projectId).first<{ all_passed: number; run_at: string }>();

  return c.json({
    scopes: scopeCount?.count || 0,
    subscopes: subscopeCount?.count || 0,
    deliverables: deliverableCount?.count || 0,
    deliverables_with_dod: deliverableWithDoD?.count || 0,
    integrity: latestReport ? {
      passed: !!latestReport.all_passed,
      run_at: latestReport.run_at,
    } : null,
  });
});

// ============================================================================
// IMPORT — Atomic blueprint population from AI plan artifact
// ============================================================================

/**
 * POST /:projectId/blueprint/import
 *
 * Atomically creates scopes and deliverables from a parsed PLAN ARTIFACT.
 * This is called by the frontend after parsing === PLAN ARTIFACT === markers
 * from the AI response, following the same pattern as brainstorm artifact save.
 *
 * Clears any existing DRAFT scopes/deliverables before importing to ensure
 * the blueprint reflects the latest approved plan.
 */
blueprint.post('/:projectId/blueprint/import', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json();
  const { scopes: scopesInput = [], selected_option, milestones, tech_stack, risks } = body;

  // Validate minimum requirements
  if (!Array.isArray(scopesInput) || scopesInput.length === 0) {
    return c.json({ error: 'At least 1 scope is required' }, 400);
  }

  const hasDeliverables = scopesInput.some(
    (s: { deliverables?: unknown[] }) => Array.isArray(s.deliverables) && s.deliverables.length > 0
  );
  if (!hasDeliverables) {
    return c.json({ error: 'At least 1 deliverable is required across all scopes' }, 400);
  }

  const now = new Date().toISOString();
  const createdScopeIds: string[] = [];
  const createdDeliverableIds: string[] = [];

  try {
    // Clear existing DRAFT scopes and deliverables for this project
    // (CASCADE or manual delete — deliverables first due to FK)
    await c.env.DB.prepare(
      "DELETE FROM blueprint_deliverables WHERE project_id = ? AND status = 'DRAFT'"
    ).bind(projectId).run();
    await c.env.DB.prepare(
      "DELETE FROM blueprint_scopes WHERE project_id = ? AND status = 'DRAFT'"
    ).bind(projectId).run();

    // Build a map from deliverable name → generated ID for dependency resolution
    const deliverableNameToId: Record<string, string> = {};

    // First pass: generate IDs for all deliverables (needed for dependency resolution)
    for (const scope of scopesInput) {
      if (Array.isArray(scope.deliverables)) {
        for (const del of scope.deliverables) {
          deliverableNameToId[del.name] = crypto.randomUUID();
        }
      }
    }

    // Create scopes and their deliverables
    for (let si = 0; si < scopesInput.length; si++) {
      const scope = scopesInput[si];
      const scopeId = crypto.randomUUID();
      createdScopeIds.push(scopeId);

      await c.env.DB.prepare(
        `INSERT INTO blueprint_scopes (
          id, project_id, parent_scope_id, tier, name, purpose, boundary,
          assumptions, assumption_status, inputs, outputs, status,
          sort_order, notes, created_by, created_at, updated_at
        ) VALUES (?, ?, NULL, 1, ?, ?, ?, ?, 'OPEN', NULL, NULL, 'DRAFT', ?, NULL, ?, ?, ?)`
      ).bind(
        scopeId,
        projectId,
        scope.name || `Scope ${si + 1}`,
        scope.purpose || null,
        scope.boundary || null,
        JSON.stringify(scope.assumptions || []),
        si,
        userId,
        now,
        now
      ).run();

      // Create deliverables under this scope
      if (Array.isArray(scope.deliverables)) {
        for (let di = 0; di < scope.deliverables.length; di++) {
          const del = scope.deliverables[di];
          const delId = deliverableNameToId[del.name] || crypto.randomUUID();
          createdDeliverableIds.push(delId);

          // Resolve dependency names to IDs
          const upstreamIds = (del.upstream_deps || [])
            .map((name: string) => deliverableNameToId[name])
            .filter(Boolean);
          const downstreamIds = (del.downstream_deps || [])
            .map((name: string) => deliverableNameToId[name])
            .filter(Boolean);

          await c.env.DB.prepare(
            `INSERT INTO blueprint_deliverables (
              id, project_id, scope_id, name, description,
              upstream_deps, downstream_deps, dependency_type,
              dod_evidence_spec, dod_verification_method, dod_quality_bar, dod_failure_modes,
              status, sort_order, notes, created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'hard', ?, ?, NULL, NULL, 'DRAFT', ?, NULL, ?, ?, ?)`
          ).bind(
            delId,
            projectId,
            scopeId,
            del.name || `Deliverable ${di + 1}`,
            del.description || null,
            JSON.stringify(upstreamIds),
            JSON.stringify(downstreamIds),
            del.dod_evidence_spec || null,
            del.dod_verification_method || null,
            di,
            userId,
            now,
            now
          ).run();
        }
      }
    }

    // Store plan metadata (selected option, milestones, tech_stack, risks) as a note on the project
    // This preserves the full plan context beyond just scopes/deliverables
    if (selected_option || milestones || tech_stack || risks) {
      const planMeta = JSON.stringify({
        selected_option: selected_option || null,
        milestones: milestones || [],
        tech_stack: tech_stack || [],
        risks: risks || [],
        imported_at: now,
      });

      // Store as project metadata (update project description or a dedicated field)
      // For now, we store as the latest plan version info in a session log
      try {
        await c.env.DB.prepare(
          `INSERT INTO session_events (id, project_id, event_type, event_data, session_id, created_at)
           VALUES (?, ?, 'PLAN_ARTIFACT_IMPORTED', ?, ?, ?)`
        ).bind(
          crypto.randomUUID(),
          projectId,
          planMeta,
          'import',
          now
        ).run();
      } catch {
        // session_events table may not exist — non-blocking
        console.warn('Could not store plan metadata in session_events');
      }
    }

    // Trigger gate evaluation after import (must pass userId for user-dependent gates)
    try {
      await triggerGateEvaluation(c.env.DB, projectId, userId);
    } catch {
      // Non-blocking — gates will be re-evaluated on next check
    }

    return c.json({
      success: true,
      imported: {
        scopes: createdScopeIds.length,
        deliverables: createdDeliverableIds.length,
      },
      scope_ids: createdScopeIds,
      deliverable_ids: createdDeliverableIds,
    }, 201);

  } catch (err) {
    console.error('Blueprint import failed:', err);
    return c.json({
      error: 'Failed to import blueprint from plan artifact',
      details: err instanceof Error ? err.message : 'Unknown error',
    }, 500);
  }
});

export default blueprint;
