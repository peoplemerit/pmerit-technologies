/**
 * Engineering Governance API — AIXORD v4.5 Part XIV
 *
 * Implements §64 (Architectural Decision Governance), §65 (Integration Verification),
 * §66 (Iteration Protocols), and §67 (Operational Readiness Criteria) as full CRUD
 * infrastructure for governed engineering artifacts.
 *
 * Endpoints:
 * - CRUD  /:projectId/engineering/sar                    — System Architecture Records (§64.3)
 * - CRUD  /:projectId/engineering/contracts               — Interface Contracts (§64.4)
 * - CRUD  /:projectId/engineering/fitness                 — Fitness Functions (§64.6)
 * - CRUD  /:projectId/engineering/tests                   — Integration Tests (§65.3)
 * - CRUD  /:projectId/engineering/budget                  — Iteration Budget (§66.5)
 * - CRUD  /:projectId/engineering/readiness               — Operational Readiness (§67.2)
 * - CRUD  /:projectId/engineering/rollback                — Rollback Strategies (§67.3)
 * - CRUD  /:projectId/engineering/alerts                  — Alert Configurations (§67.4)
 * - CRUD  /:projectId/engineering/knowledge               — Knowledge Transfers (§67.6)
 * - GET   /:projectId/engineering/compliance              — Compliance Summary
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import { verifyProjectOwnership } from '../utils/projectOwnership';

const engineering = new Hono<{ Bindings: Env }>();

// All routes require auth
engineering.use('/*', requireAuth);

// ============================================================================
// §64.3 — SYSTEM ARCHITECTURE RECORDS (SAR)
// ============================================================================

/**
 * POST /:projectId/engineering/sar
 * Create a new SAR
 */
engineering.post('/:projectId/engineering/sar', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    title: string;
    system_boundary?: string;
    component_map?: string;
    interface_contracts_summary?: string;
    data_flow?: string;
    state_ownership?: string;
    consistency_model?: string;
    failure_domains?: string;
    notes?: string;
  }>();

  if (!body.title) {
    return c.json({ error: 'title is required' }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO system_architecture_records (
      id, project_id, title, version, status,
      system_boundary, component_map, interface_contracts_summary,
      data_flow, state_ownership, consistency_model, failure_domains,
      notes, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, 1, 'DRAFT', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, projectId, body.title,
    body.system_boundary || null,
    body.component_map || null,
    body.interface_contracts_summary || null,
    body.data_flow || null,
    body.state_ownership || null,
    body.consistency_model || null,
    body.failure_domains || null,
    body.notes || null,
    userId, now, now
  ).run();

  return c.json({
    id, project_id: projectId, title: body.title,
    version: 1, status: 'DRAFT', created_at: now,
  }, 201);
});

/**
 * GET /:projectId/engineering/sar
 * List all SARs for a project
 */
engineering.get('/:projectId/engineering/sar', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const statusFilter = c.req.query('status');
  let query = 'SELECT * FROM system_architecture_records WHERE project_id = ?';
  const params: string[] = [projectId];

  if (statusFilter) {
    query += ' AND status = ?';
    params.push(statusFilter);
  }

  query += ' ORDER BY created_at DESC';
  const result = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({ sars: result.results, total: result.results.length });
});

/**
 * GET /:projectId/engineering/sar/:sarId
 * Get SAR details
 */
engineering.get('/:projectId/engineering/sar/:sarId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const sarId = c.req.param('sarId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const sar = await c.env.DB.prepare(
    'SELECT * FROM system_architecture_records WHERE id = ? AND project_id = ?'
  ).bind(sarId, projectId).first();

  if (!sar) {
    return c.json({ error: 'SAR not found' }, 404);
  }

  // Include related interface contracts
  const contracts = await c.env.DB.prepare(
    'SELECT * FROM interface_contracts WHERE sar_id = ? ORDER BY created_at ASC'
  ).bind(sarId).all();

  return c.json({ ...sar, interface_contracts: contracts.results });
});

/**
 * PUT /:projectId/engineering/sar/:sarId
 * Update a SAR
 */
engineering.put('/:projectId/engineering/sar/:sarId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const sarId = c.req.param('sarId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await c.env.DB.prepare(
    'SELECT * FROM system_architecture_records WHERE id = ? AND project_id = ?'
  ).bind(sarId, projectId).first();

  if (!existing) {
    return c.json({ error: 'SAR not found' }, 404);
  }

  const body = await c.req.json<{
    title?: string;
    status?: string;
    system_boundary?: string;
    component_map?: string;
    interface_contracts_summary?: string;
    data_flow?: string;
    state_ownership?: string;
    consistency_model?: string;
    failure_domains?: string;
    notes?: string;
  }>();

  const now = new Date().toISOString();
  const newVersion = body.status === 'ACTIVE' && existing.status === 'DRAFT'
    ? (existing.version as number)
    : (existing.version as number);

  await c.env.DB.prepare(`
    UPDATE system_architecture_records SET
      title = ?, status = ?,
      system_boundary = ?, component_map = ?, interface_contracts_summary = ?,
      data_flow = ?, state_ownership = ?, consistency_model = ?, failure_domains = ?,
      notes = ?, updated_at = ?
    WHERE id = ? AND project_id = ?
  `).bind(
    body.title || existing.title,
    body.status || existing.status,
    body.system_boundary ?? existing.system_boundary,
    body.component_map ?? existing.component_map,
    body.interface_contracts_summary ?? existing.interface_contracts_summary,
    body.data_flow ?? existing.data_flow,
    body.state_ownership ?? existing.state_ownership,
    body.consistency_model ?? existing.consistency_model,
    body.failure_domains ?? existing.failure_domains,
    body.notes ?? existing.notes,
    now, sarId, projectId
  ).run();

  return c.json({ id: sarId, updated_at: now });
});

/**
 * DELETE /:projectId/engineering/sar/:sarId
 * Delete a SAR (only DRAFT status)
 */
engineering.delete('/:projectId/engineering/sar/:sarId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const sarId = c.req.param('sarId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await c.env.DB.prepare(
    'SELECT status FROM system_architecture_records WHERE id = ? AND project_id = ?'
  ).bind(sarId, projectId).first();

  if (!existing) {
    return c.json({ error: 'SAR not found' }, 404);
  }

  if (existing.status !== 'DRAFT') {
    return c.json({ error: 'Only DRAFT SARs can be deleted' }, 400);
  }

  await c.env.DB.prepare(
    'DELETE FROM system_architecture_records WHERE id = ? AND project_id = ?'
  ).bind(sarId, projectId).run();

  return c.json({ deleted: true });
});

// ============================================================================
// §64.4 — INTERFACE CONTRACTS
// ============================================================================

/**
 * POST /:projectId/engineering/contracts
 * Create an interface contract
 */
engineering.post('/:projectId/engineering/contracts', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    sar_id?: string;
    contract_name: string;
    producer: string;
    consumer: string;
    input_shape?: string;
    output_shape?: string;
    error_contract?: string;
    versioning_strategy?: string;
    idempotency?: string;
    notes?: string;
  }>();

  if (!body.contract_name || !body.producer || !body.consumer) {
    return c.json({ error: 'contract_name, producer, and consumer are required' }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO interface_contracts (
      id, project_id, sar_id, contract_name, producer, consumer,
      input_shape, output_shape, error_contract, versioning_strategy, idempotency,
      status, notes, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?)
  `).bind(
    id, projectId, body.sar_id || null,
    body.contract_name, body.producer, body.consumer,
    body.input_shape || null, body.output_shape || null,
    body.error_contract || null, body.versioning_strategy || null,
    body.idempotency || null,
    body.notes || null, userId, now, now
  ).run();

  return c.json({ id, contract_name: body.contract_name, created_at: now }, 201);
});

/**
 * GET /:projectId/engineering/contracts
 * List interface contracts
 */
engineering.get('/:projectId/engineering/contracts', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const result = await c.env.DB.prepare(
    'SELECT * FROM interface_contracts WHERE project_id = ? ORDER BY created_at DESC'
  ).bind(projectId).all();

  return c.json({ contracts: result.results, total: result.results.length });
});

/**
 * PUT /:projectId/engineering/contracts/:contractId
 * Update an interface contract
 */
engineering.put('/:projectId/engineering/contracts/:contractId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const contractId = c.req.param('contractId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await c.env.DB.prepare(
    'SELECT * FROM interface_contracts WHERE id = ? AND project_id = ?'
  ).bind(contractId, projectId).first();

  if (!existing) {
    return c.json({ error: 'Contract not found' }, 404);
  }

  const body = await c.req.json<Record<string, string | null>>();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE interface_contracts SET
      contract_name = ?, producer = ?, consumer = ?,
      input_shape = ?, output_shape = ?, error_contract = ?,
      versioning_strategy = ?, idempotency = ?, status = ?, notes = ?,
      updated_at = ?
    WHERE id = ? AND project_id = ?
  `).bind(
    body.contract_name || existing.contract_name,
    body.producer || existing.producer,
    body.consumer || existing.consumer,
    body.input_shape ?? existing.input_shape,
    body.output_shape ?? existing.output_shape,
    body.error_contract ?? existing.error_contract,
    body.versioning_strategy ?? existing.versioning_strategy,
    body.idempotency ?? existing.idempotency,
    body.status || existing.status,
    body.notes ?? existing.notes,
    now, contractId, projectId
  ).run();

  return c.json({ id: contractId, updated_at: now });
});

/**
 * DELETE /:projectId/engineering/contracts/:contractId
 */
engineering.delete('/:projectId/engineering/contracts/:contractId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const contractId = c.req.param('contractId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await c.env.DB.prepare(
    'SELECT status FROM interface_contracts WHERE id = ? AND project_id = ?'
  ).bind(contractId, projectId).first();

  if (!existing) {
    return c.json({ error: 'Contract not found' }, 404);
  }

  if (existing.status === 'ACTIVE') {
    return c.json({ error: 'Cannot delete ACTIVE contracts. Deprecate first.' }, 400);
  }

  await c.env.DB.prepare(
    'DELETE FROM interface_contracts WHERE id = ? AND project_id = ?'
  ).bind(contractId, projectId).run();

  return c.json({ deleted: true });
});

// ============================================================================
// §64.6 — FITNESS FUNCTIONS
// ============================================================================

/**
 * POST /:projectId/engineering/fitness
 */
engineering.post('/:projectId/engineering/fitness', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    dimension: string;
    metric_name: string;
    target_value: string;
    current_value?: string;
    unit?: string;
    measurement_method?: string;
    notes?: string;
  }>();

  if (!body.dimension || !body.metric_name || !body.target_value) {
    return c.json({ error: 'dimension, metric_name, and target_value are required' }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO fitness_functions (
      id, project_id, dimension, metric_name, target_value,
      current_value, unit, measurement_method, status, notes,
      created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DEFINED', ?, ?, ?, ?)
  `).bind(
    id, projectId, body.dimension, body.metric_name, body.target_value,
    body.current_value || null, body.unit || null,
    body.measurement_method || null, body.notes || null,
    userId, now, now
  ).run();

  return c.json({ id, metric_name: body.metric_name, created_at: now }, 201);
});

/**
 * GET /:projectId/engineering/fitness
 */
engineering.get('/:projectId/engineering/fitness', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const result = await c.env.DB.prepare(
    'SELECT * FROM fitness_functions WHERE project_id = ? ORDER BY dimension, created_at DESC'
  ).bind(projectId).all();

  return c.json({ fitness_functions: result.results, total: result.results.length });
});

/**
 * PUT /:projectId/engineering/fitness/:fitnessId
 */
engineering.put('/:projectId/engineering/fitness/:fitnessId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const fitnessId = c.req.param('fitnessId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await c.env.DB.prepare(
    'SELECT * FROM fitness_functions WHERE id = ? AND project_id = ?'
  ).bind(fitnessId, projectId).first();

  if (!existing) {
    return c.json({ error: 'Fitness function not found' }, 404);
  }

  const body = await c.req.json<Record<string, string | null>>();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE fitness_functions SET
      dimension = ?, metric_name = ?, target_value = ?,
      current_value = ?, unit = ?, measurement_method = ?,
      status = ?, verified_at = ?, notes = ?, updated_at = ?
    WHERE id = ? AND project_id = ?
  `).bind(
    body.dimension || existing.dimension,
    body.metric_name || existing.metric_name,
    body.target_value || existing.target_value,
    body.current_value ?? existing.current_value,
    body.unit ?? existing.unit,
    body.measurement_method ?? existing.measurement_method,
    body.status || existing.status,
    body.verified_at ?? existing.verified_at,
    body.notes ?? existing.notes,
    now, fitnessId, projectId
  ).run();

  return c.json({ id: fitnessId, updated_at: now });
});

/**
 * DELETE /:projectId/engineering/fitness/:fitnessId
 */
engineering.delete('/:projectId/engineering/fitness/:fitnessId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const fitnessId = c.req.param('fitnessId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM fitness_functions WHERE id = ? AND project_id = ?'
  ).bind(fitnessId, projectId).run();

  return c.json({ deleted: true });
});

// ============================================================================
// §65.3 — INTEGRATION TESTS
// ============================================================================

/**
 * POST /:projectId/engineering/tests
 */
engineering.post('/:projectId/engineering/tests', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    contract_id?: string;
    test_level: string;
    test_name: string;
    description?: string;
    producer?: string;
    consumer?: string;
    happy_path?: string;
    error_path?: string;
    boundary_conditions?: string;
    notes?: string;
  }>();

  if (!body.test_level || !body.test_name) {
    return c.json({ error: 'test_level and test_name are required' }, 400);
  }

  const validLevels = ['UNIT', 'INTEGRATION', 'SYSTEM', 'ACCEPTANCE'];
  if (!validLevels.includes(body.test_level)) {
    return c.json({ error: `Invalid test_level. Must be one of: ${validLevels.join(', ')}` }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO integration_tests (
      id, project_id, contract_id, test_level, test_name,
      description, producer, consumer,
      happy_path, error_path, boundary_conditions,
      last_result, notes, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NOT_RUN', ?, ?, ?, ?)
  `).bind(
    id, projectId, body.contract_id || null,
    body.test_level, body.test_name,
    body.description || null, body.producer || null, body.consumer || null,
    body.happy_path || null, body.error_path || null,
    body.boundary_conditions || null,
    body.notes || null, userId, now, now
  ).run();

  return c.json({ id, test_name: body.test_name, test_level: body.test_level, created_at: now }, 201);
});

/**
 * GET /:projectId/engineering/tests
 */
engineering.get('/:projectId/engineering/tests', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const levelFilter = c.req.query('level');
  let query = 'SELECT * FROM integration_tests WHERE project_id = ?';
  const params: string[] = [projectId];

  if (levelFilter) {
    query += ' AND test_level = ?';
    params.push(levelFilter);
  }

  query += ' ORDER BY test_level, created_at DESC';
  const result = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({ tests: result.results, total: result.results.length });
});

/**
 * PUT /:projectId/engineering/tests/:testId
 */
engineering.put('/:projectId/engineering/tests/:testId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const testId = c.req.param('testId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await c.env.DB.prepare(
    'SELECT * FROM integration_tests WHERE id = ? AND project_id = ?'
  ).bind(testId, projectId).first();

  if (!existing) {
    return c.json({ error: 'Test not found' }, 404);
  }

  const body = await c.req.json<Record<string, string | null>>();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE integration_tests SET
      test_name = ?, description = ?, test_level = ?,
      producer = ?, consumer = ?,
      happy_path = ?, error_path = ?, boundary_conditions = ?,
      last_result = ?, last_run_at = ?, notes = ?, updated_at = ?
    WHERE id = ? AND project_id = ?
  `).bind(
    body.test_name || existing.test_name,
    body.description ?? existing.description,
    body.test_level || existing.test_level,
    body.producer ?? existing.producer,
    body.consumer ?? existing.consumer,
    body.happy_path ?? existing.happy_path,
    body.error_path ?? existing.error_path,
    body.boundary_conditions ?? existing.boundary_conditions,
    body.last_result || existing.last_result,
    body.last_run_at ?? existing.last_run_at,
    body.notes ?? existing.notes,
    now, testId, projectId
  ).run();

  return c.json({ id: testId, updated_at: now });
});

/**
 * DELETE /:projectId/engineering/tests/:testId
 */
engineering.delete('/:projectId/engineering/tests/:testId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const testId = c.req.param('testId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM integration_tests WHERE id = ? AND project_id = ?'
  ).bind(testId, projectId).run();

  return c.json({ deleted: true });
});

// ============================================================================
// §66.5 — ITERATION BUDGET
// ============================================================================

/**
 * POST /:projectId/engineering/budget
 */
engineering.post('/:projectId/engineering/budget', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    scope_name: string;
    expected_iterations?: number;
    iteration_ceiling?: number;
    time_budget_hours?: number;
    notes?: string;
  }>();

  if (!body.scope_name) {
    return c.json({ error: 'scope_name is required' }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO iteration_budget (
      id, project_id, scope_name,
      expected_iterations, iteration_ceiling, actual_iterations,
      time_budget_hours, time_used_hours, status,
      notes, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 0, ?, 0, 'ACTIVE', ?, ?, ?, ?)
  `).bind(
    id, projectId, body.scope_name,
    body.expected_iterations ?? 0, body.iteration_ceiling ?? 3,
    body.time_budget_hours ?? null,
    body.notes || null, userId, now, now
  ).run();

  return c.json({ id, scope_name: body.scope_name, created_at: now }, 201);
});

/**
 * GET /:projectId/engineering/budget
 */
engineering.get('/:projectId/engineering/budget', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const result = await c.env.DB.prepare(
    'SELECT * FROM iteration_budget WHERE project_id = ? ORDER BY scope_name ASC'
  ).bind(projectId).all();

  return c.json({ budgets: result.results, total: result.results.length });
});

/**
 * PUT /:projectId/engineering/budget/:budgetId
 */
engineering.put('/:projectId/engineering/budget/:budgetId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const budgetId = c.req.param('budgetId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await c.env.DB.prepare(
    'SELECT * FROM iteration_budget WHERE id = ? AND project_id = ?'
  ).bind(budgetId, projectId).first();

  if (!existing) {
    return c.json({ error: 'Budget not found' }, 404);
  }

  const body = await c.req.json<Record<string, string | number | null>>();
  const now = new Date().toISOString();

  const actualIterations = (body.actual_iterations as number) ?? existing.actual_iterations;
  const ceiling = (body.iteration_ceiling as number) ?? existing.iteration_ceiling;
  let status = (body.status as string) || existing.status;

  // Auto-update status based on iterations
  if (actualIterations >= (ceiling as number) && status === 'ACTIVE') {
    status = 'EXCEEDED';
  }

  await c.env.DB.prepare(`
    UPDATE iteration_budget SET
      scope_name = ?, expected_iterations = ?, iteration_ceiling = ?,
      actual_iterations = ?, time_budget_hours = ?, time_used_hours = ?,
      status = ?, notes = ?, updated_at = ?
    WHERE id = ? AND project_id = ?
  `).bind(
    body.scope_name || existing.scope_name,
    body.expected_iterations ?? existing.expected_iterations,
    ceiling,
    actualIterations,
    body.time_budget_hours ?? existing.time_budget_hours,
    body.time_used_hours ?? existing.time_used_hours,
    status,
    body.notes ?? existing.notes,
    now, budgetId, projectId
  ).run();

  return c.json({ id: budgetId, status, updated_at: now });
});

// ============================================================================
// §67.2 — OPERATIONAL READINESS
// ============================================================================

/**
 * POST /:projectId/engineering/readiness
 */
engineering.post('/:projectId/engineering/readiness', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    declared_level: string;
    deployment_method?: string;
    environment_parity?: string;
    config_management?: string;
    deployment_verification?: string;
    health_endpoint?: string;
    logging_strategy?: string;
    error_reporting?: string;
    key_metrics?: string;
    alerting?: string;
    dashboards?: string;
    tracing?: string;
    audit_logging?: string;
    incident_response_plan?: string;
    runbooks?: string;
    sla_definitions?: string;
    checklist_json?: string;
    notes?: string;
  }>();

  if (!body.declared_level) {
    return c.json({ error: 'declared_level is required (L0, L1, L2, L3)' }, 400);
  }

  const validLevels = ['L0', 'L1', 'L2', 'L3'];
  if (!validLevels.includes(body.declared_level)) {
    return c.json({ error: `Invalid declared_level. Must be one of: ${validLevels.join(', ')}` }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO operational_readiness (
      id, project_id, declared_level, current_level,
      deployment_method, environment_parity, config_management, deployment_verification,
      health_endpoint, logging_strategy, error_reporting, key_metrics,
      alerting, dashboards, tracing, audit_logging,
      incident_response_plan, runbooks, sla_definitions,
      checklist_json, notes, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, 'L0', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, projectId, body.declared_level,
    body.deployment_method || null, body.environment_parity || null,
    body.config_management || null, body.deployment_verification || null,
    body.health_endpoint || null, body.logging_strategy || null,
    body.error_reporting || null, body.key_metrics || null,
    body.alerting || null, body.dashboards || null,
    body.tracing || null, body.audit_logging || null,
    body.incident_response_plan || null, body.runbooks || null,
    body.sla_definitions || null,
    body.checklist_json || null, body.notes || null,
    userId, now, now
  ).run();

  return c.json({ id, declared_level: body.declared_level, created_at: now }, 201);
});

/**
 * GET /:projectId/engineering/readiness
 */
engineering.get('/:projectId/engineering/readiness', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const result = await c.env.DB.prepare(
    'SELECT * FROM operational_readiness WHERE project_id = ? ORDER BY created_at DESC'
  ).bind(projectId).all();

  return c.json({ readiness: result.results, total: result.results.length });
});

/**
 * PUT /:projectId/engineering/readiness/:readinessId
 */
engineering.put('/:projectId/engineering/readiness/:readinessId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const readinessId = c.req.param('readinessId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await c.env.DB.prepare(
    'SELECT * FROM operational_readiness WHERE id = ? AND project_id = ?'
  ).bind(readinessId, projectId).first();

  if (!existing) {
    return c.json({ error: 'Readiness record not found' }, 404);
  }

  const body = await c.req.json<Record<string, string | null>>();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE operational_readiness SET
      declared_level = ?, current_level = ?,
      deployment_method = ?, environment_parity = ?,
      config_management = ?, deployment_verification = ?,
      health_endpoint = ?, logging_strategy = ?,
      error_reporting = ?, key_metrics = ?,
      alerting = ?, dashboards = ?,
      tracing = ?, audit_logging = ?,
      incident_response_plan = ?, runbooks = ?,
      sla_definitions = ?, checklist_json = ?,
      verified_at = ?, notes = ?, updated_at = ?
    WHERE id = ? AND project_id = ?
  `).bind(
    body.declared_level || existing.declared_level,
    body.current_level || existing.current_level,
    body.deployment_method ?? existing.deployment_method,
    body.environment_parity ?? existing.environment_parity,
    body.config_management ?? existing.config_management,
    body.deployment_verification ?? existing.deployment_verification,
    body.health_endpoint ?? existing.health_endpoint,
    body.logging_strategy ?? existing.logging_strategy,
    body.error_reporting ?? existing.error_reporting,
    body.key_metrics ?? existing.key_metrics,
    body.alerting ?? existing.alerting,
    body.dashboards ?? existing.dashboards,
    body.tracing ?? existing.tracing,
    body.audit_logging ?? existing.audit_logging,
    body.incident_response_plan ?? existing.incident_response_plan,
    body.runbooks ?? existing.runbooks,
    body.sla_definitions ?? existing.sla_definitions,
    body.checklist_json ?? existing.checklist_json,
    body.verified_at ?? existing.verified_at,
    body.notes ?? existing.notes,
    now, readinessId, projectId
  ).run();

  return c.json({ id: readinessId, updated_at: now });
});

// ============================================================================
// §67.3 — ROLLBACK STRATEGIES
// ============================================================================

/**
 * POST /:projectId/engineering/rollback
 */
engineering.post('/:projectId/engineering/rollback', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    component_name: string;
    rollback_method: string;
    recovery_time_target?: string;
    data_loss_tolerance?: string;
    prerequisites?: string;
    procedure?: string;
    notes?: string;
  }>();

  if (!body.component_name || !body.rollback_method) {
    return c.json({ error: 'component_name and rollback_method are required' }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO rollback_strategies (
      id, project_id, component_name, rollback_method,
      rollback_tested, recovery_time_target, data_loss_tolerance,
      prerequisites, procedure, notes, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, projectId, body.component_name, body.rollback_method,
    body.recovery_time_target || null, body.data_loss_tolerance || null,
    body.prerequisites || null, body.procedure || null,
    body.notes || null, userId, now, now
  ).run();

  return c.json({ id, component_name: body.component_name, created_at: now }, 201);
});

/**
 * GET /:projectId/engineering/rollback
 */
engineering.get('/:projectId/engineering/rollback', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const result = await c.env.DB.prepare(
    'SELECT * FROM rollback_strategies WHERE project_id = ? ORDER BY component_name ASC'
  ).bind(projectId).all();

  return c.json({
    strategies: result.results.map(r => ({
      ...r,
      rollback_tested: r.rollback_tested === 1,
    })),
    total: result.results.length,
  });
});

/**
 * PUT /:projectId/engineering/rollback/:rollbackId
 */
engineering.put('/:projectId/engineering/rollback/:rollbackId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const rollbackId = c.req.param('rollbackId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await c.env.DB.prepare(
    'SELECT * FROM rollback_strategies WHERE id = ? AND project_id = ?'
  ).bind(rollbackId, projectId).first();

  if (!existing) {
    return c.json({ error: 'Rollback strategy not found' }, 404);
  }

  const body = await c.req.json<Record<string, string | number | null>>();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE rollback_strategies SET
      component_name = ?, rollback_method = ?,
      rollback_tested = ?, rollback_tested_at = ?,
      recovery_time_target = ?, data_loss_tolerance = ?,
      prerequisites = ?, procedure = ?, notes = ?, updated_at = ?
    WHERE id = ? AND project_id = ?
  `).bind(
    body.component_name || existing.component_name,
    body.rollback_method || existing.rollback_method,
    body.rollback_tested ?? existing.rollback_tested,
    body.rollback_tested_at ?? existing.rollback_tested_at,
    body.recovery_time_target ?? existing.recovery_time_target,
    body.data_loss_tolerance ?? existing.data_loss_tolerance,
    body.prerequisites ?? existing.prerequisites,
    body.procedure ?? existing.procedure,
    body.notes ?? existing.notes,
    now, rollbackId, projectId
  ).run();

  return c.json({ id: rollbackId, updated_at: now });
});

/**
 * DELETE /:projectId/engineering/rollback/:rollbackId
 */
engineering.delete('/:projectId/engineering/rollback/:rollbackId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const rollbackId = c.req.param('rollbackId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM rollback_strategies WHERE id = ? AND project_id = ?'
  ).bind(rollbackId, projectId).run();

  return c.json({ deleted: true });
});

// ============================================================================
// §67.4 — ALERT CONFIGURATIONS
// ============================================================================

/**
 * POST /:projectId/engineering/alerts
 */
engineering.post('/:projectId/engineering/alerts', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    alert_name: string;
    severity: string;
    condition_description: string;
    notification_channel?: string;
    escalation_path?: string;
    notes?: string;
  }>();

  if (!body.alert_name || !body.severity || !body.condition_description) {
    return c.json({ error: 'alert_name, severity, and condition_description are required' }, 400);
  }

  const validSeverities = ['SEV1', 'SEV2', 'SEV3', 'SEV4'];
  if (!validSeverities.includes(body.severity)) {
    return c.json({ error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}` }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO alert_configurations (
      id, project_id, alert_name, severity, condition_description,
      notification_channel, escalation_path, enabled,
      notes, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
  `).bind(
    id, projectId, body.alert_name, body.severity, body.condition_description,
    body.notification_channel || null, body.escalation_path || null,
    body.notes || null, userId, now, now
  ).run();

  return c.json({ id, alert_name: body.alert_name, severity: body.severity, created_at: now }, 201);
});

/**
 * GET /:projectId/engineering/alerts
 */
engineering.get('/:projectId/engineering/alerts', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const result = await c.env.DB.prepare(
    'SELECT * FROM alert_configurations WHERE project_id = ? ORDER BY severity ASC, alert_name ASC'
  ).bind(projectId).all();

  return c.json({
    alerts: result.results.map(r => ({
      ...r,
      enabled: r.enabled === 1,
    })),
    total: result.results.length,
  });
});

/**
 * PUT /:projectId/engineering/alerts/:alertId
 */
engineering.put('/:projectId/engineering/alerts/:alertId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const alertId = c.req.param('alertId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await c.env.DB.prepare(
    'SELECT * FROM alert_configurations WHERE id = ? AND project_id = ?'
  ).bind(alertId, projectId).first();

  if (!existing) {
    return c.json({ error: 'Alert not found' }, 404);
  }

  const body = await c.req.json<Record<string, string | number | null>>();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE alert_configurations SET
      alert_name = ?, severity = ?, condition_description = ?,
      notification_channel = ?, escalation_path = ?,
      enabled = ?, notes = ?, updated_at = ?
    WHERE id = ? AND project_id = ?
  `).bind(
    body.alert_name || existing.alert_name,
    body.severity || existing.severity,
    body.condition_description || existing.condition_description,
    body.notification_channel ?? existing.notification_channel,
    body.escalation_path ?? existing.escalation_path,
    body.enabled ?? existing.enabled,
    body.notes ?? existing.notes,
    now, alertId, projectId
  ).run();

  return c.json({ id: alertId, updated_at: now });
});

/**
 * DELETE /:projectId/engineering/alerts/:alertId
 */
engineering.delete('/:projectId/engineering/alerts/:alertId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const alertId = c.req.param('alertId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM alert_configurations WHERE id = ? AND project_id = ?'
  ).bind(alertId, projectId).run();

  return c.json({ deleted: true });
});

// ============================================================================
// §67.6 — KNOWLEDGE TRANSFERS
// ============================================================================

/**
 * POST /:projectId/engineering/knowledge
 */
engineering.post('/:projectId/engineering/knowledge', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    title: string;
    transfer_type: string;
    content?: string;
    target_audience?: string;
    notes?: string;
  }>();

  if (!body.title || !body.transfer_type) {
    return c.json({ error: 'title and transfer_type are required' }, 400);
  }

  const validTypes = ['DEPLOYMENT', 'MONITORING', 'TROUBLESHOOTING', 'ARCHITECTURE', 'API', 'DEPENDENCIES', 'OTHER'];
  if (!validTypes.includes(body.transfer_type)) {
    return c.json({ error: `Invalid transfer_type. Must be one of: ${validTypes.join(', ')}` }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO knowledge_transfers (
      id, project_id, title, transfer_type, content,
      target_audience, status, notes, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?)
  `).bind(
    id, projectId, body.title, body.transfer_type,
    body.content || null, body.target_audience || null,
    body.notes || null, userId, now, now
  ).run();

  return c.json({ id, title: body.title, transfer_type: body.transfer_type, created_at: now }, 201);
});

/**
 * GET /:projectId/engineering/knowledge
 */
engineering.get('/:projectId/engineering/knowledge', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const result = await c.env.DB.prepare(
    'SELECT * FROM knowledge_transfers WHERE project_id = ? ORDER BY transfer_type ASC, created_at DESC'
  ).bind(projectId).all();

  return c.json({ knowledge: result.results, total: result.results.length });
});

/**
 * PUT /:projectId/engineering/knowledge/:ktId
 */
engineering.put('/:projectId/engineering/knowledge/:ktId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const ktId = c.req.param('ktId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await c.env.DB.prepare(
    'SELECT * FROM knowledge_transfers WHERE id = ? AND project_id = ?'
  ).bind(ktId, projectId).first();

  if (!existing) {
    return c.json({ error: 'Knowledge transfer not found' }, 404);
  }

  const body = await c.req.json<Record<string, string | null>>();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE knowledge_transfers SET
      title = ?, transfer_type = ?, content = ?,
      target_audience = ?, status = ?,
      reviewed_by = ?, reviewed_at = ?,
      notes = ?, updated_at = ?
    WHERE id = ? AND project_id = ?
  `).bind(
    body.title || existing.title,
    body.transfer_type || existing.transfer_type,
    body.content ?? existing.content,
    body.target_audience ?? existing.target_audience,
    body.status || existing.status,
    body.reviewed_by ?? existing.reviewed_by,
    body.reviewed_at ?? existing.reviewed_at,
    body.notes ?? existing.notes,
    now, ktId, projectId
  ).run();

  return c.json({ id: ktId, updated_at: now });
});

/**
 * DELETE /:projectId/engineering/knowledge/:ktId
 */
engineering.delete('/:projectId/engineering/knowledge/:ktId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const ktId = c.req.param('ktId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM knowledge_transfers WHERE id = ? AND project_id = ?'
  ).bind(ktId, projectId).run();

  return c.json({ deleted: true });
});

// ============================================================================
// COMPLIANCE SUMMARY (Aggregate endpoint)
// ============================================================================

/**
 * GET /:projectId/engineering/compliance
 * Returns Part XIV compliance summary across all artifact types
 */
engineering.get('/:projectId/engineering/compliance', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Parallel queries for all artifact counts
  const [
    sarResult,
    contractsResult,
    fitnessResult,
    testsResult,
    budgetResult,
    readinessResult,
    rollbackResult,
    alertsResult,
    ktResult,
  ] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as count FROM system_architecture_records WHERE project_id = ? AND status != \'ARCHIVED\'').bind(projectId).first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM interface_contracts WHERE project_id = ? AND status != \'DEPRECATED\'').bind(projectId).first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM fitness_functions WHERE project_id = ?').bind(projectId).first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM integration_tests WHERE project_id = ?').bind(projectId).first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM iteration_budget WHERE project_id = ?').bind(projectId).first(),
    c.env.DB.prepare('SELECT * FROM operational_readiness WHERE project_id = ? ORDER BY created_at DESC LIMIT 1').bind(projectId).first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM rollback_strategies WHERE project_id = ?').bind(projectId).first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM alert_configurations WHERE project_id = ? AND enabled = 1').bind(projectId).first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM knowledge_transfers WHERE project_id = ? AND status != \'ARCHIVED\'').bind(projectId).first(),
  ]);

  // Test results summary
  const testResults = await c.env.DB.prepare(`
    SELECT test_level, last_result, COUNT(*) as count
    FROM integration_tests WHERE project_id = ?
    GROUP BY test_level, last_result
  `).bind(projectId).all();

  // Fitness function status summary
  const fitnessStatus = await c.env.DB.prepare(`
    SELECT status, COUNT(*) as count
    FROM fitness_functions WHERE project_id = ?
    GROUP BY status
  `).bind(projectId).all();

  // Calculate compliance areas (9 areas from Part XIV roadmap)
  const areas = {
    sar: { count: (sarResult?.count as number) || 0, required: true, met: ((sarResult?.count as number) || 0) > 0 },
    interface_contracts: { count: (contractsResult?.count as number) || 0, required: true, met: ((contractsResult?.count as number) || 0) > 0 },
    fitness_functions: { count: (fitnessResult?.count as number) || 0, required: false, met: ((fitnessResult?.count as number) || 0) > 0 },
    integration_tests: { count: (testsResult?.count as number) || 0, required: true, met: ((testsResult?.count as number) || 0) > 0 },
    iteration_budget: { count: (budgetResult?.count as number) || 0, required: false, met: ((budgetResult?.count as number) || 0) > 0 },
    operational_readiness: {
      declared_level: readinessResult?.declared_level || null,
      current_level: readinessResult?.current_level || null,
      required: true,
      met: !!readinessResult,
    },
    rollback_strategies: { count: (rollbackResult?.count as number) || 0, required: true, met: ((rollbackResult?.count as number) || 0) > 0 },
    alert_configurations: { count: (alertsResult?.count as number) || 0, required: true, met: ((alertsResult?.count as number) || 0) > 0 },
    knowledge_transfers: { count: (ktResult?.count as number) || 0, required: false, met: ((ktResult?.count as number) || 0) > 0 },
  };

  const totalAreas = Object.keys(areas).length;
  const metAreas = Object.values(areas).filter(a => a.met).length;
  const requiredAreas = Object.values(areas).filter(a => a.required).length;
  const requiredMet = Object.values(areas).filter(a => a.required && a.met).length;

  return c.json({
    project_id: projectId,
    overall_percentage: Math.round((metAreas / totalAreas) * 100),
    required_percentage: requiredAreas > 0 ? Math.round((requiredMet / requiredAreas) * 100) : 100,
    areas,
    test_results: testResults.results,
    fitness_status: fitnessStatus.results,
    summary: `${metAreas}/${totalAreas} areas covered (${requiredMet}/${requiredAreas} required)`,
  });
});

export default engineering;
