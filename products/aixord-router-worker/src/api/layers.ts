/**
 * Execution Layers API (Path B: Proactive Debugging)
 *
 * Manages the lifecycle of execution layers for layered execution mode.
 * Layers represent discrete units of work that must be verified before proceeding.
 *
 * Layer Lifecycle:
 * PENDING → ACTIVE → EXECUTED → VERIFIED → LOCKED
 *                       ↓
 *                    FAILED
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';

const layers = new Hono<{ Bindings: Env }>();

// All routes require authentication
layers.use('*', requireAuth);

// ============================================================================
// Types
// ============================================================================

type LayerStatus = 'PENDING' | 'ACTIVE' | 'EXECUTED' | 'VERIFIED' | 'LOCKED' | 'FAILED';
type VerificationMethod = 'user_confirm' | 'screenshot' | 'test_output' | 'file_check' | 'ai_auto';

interface ExecutionLayer {
  id: string;
  project_id: string;
  session_number: number;
  layer_number: number;
  title: string;
  description: string | null;
  status: LayerStatus;
  expected_inputs: string | null;
  expected_outputs: string | null;
  actual_outputs: string | null;
  verification_method: VerificationMethod | null;
  verification_evidence: string | null;
  verified_at: string | null;
  verified_by: string | null;
  failure_reason: string | null;
  retry_count: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  locked_at: string | null;
}

interface CreateLayerInput {
  layer_number: number;
  title: string;
  description?: string;
  expected_inputs?: object;
  expected_outputs?: object;
}

interface UpdateLayerInput {
  title?: string;
  description?: string;
  expected_inputs?: object;
  expected_outputs?: object;
  actual_outputs?: object;
}

interface VerifyLayerInput {
  method: VerificationMethod;
  evidence?: {
    type: string;
    image_id?: string;
    text?: string;
    timestamp?: string;
  };
  notes?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
  return `layer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

async function verifyProjectOwnership(
  db: D1Database,
  projectId: string,
  userId: string
): Promise<boolean> {
  const project = await db.prepare(
    'SELECT id FROM projects WHERE id = ? AND user_id = ?'
  ).bind(projectId, userId).first();
  return !!project;
}

async function getActiveLayer(
  db: D1Database,
  projectId: string,
  sessionNumber: number
): Promise<ExecutionLayer | null> {
  return db.prepare(
    `SELECT * FROM execution_layers
     WHERE project_id = ? AND session_number = ? AND status = 'ACTIVE'
     LIMIT 1`
  ).bind(projectId, sessionNumber).first() as Promise<ExecutionLayer | null>;
}

// ============================================================================
// Routes
// ============================================================================

/**
 * GET /projects/:projectId/layers
 * List all layers for a project (optionally filtered by session)
 */
layers.get('/projects/:projectId/layers', async (c) => {
  const { projectId } = c.req.param();
  const sessionNumber = c.req.query('session');
  const userId = c.get('userId');

  // Verify ownership
  const isOwner = await verifyProjectOwnership(c.env.DB, projectId, userId);
  if (!isOwner) {
    return c.json({ error: 'Project not found or access denied' }, 404);
  }

  let query = 'SELECT * FROM execution_layers WHERE project_id = ?';
  const params: (string | number)[] = [projectId];

  if (sessionNumber) {
    query += ' AND session_number = ?';
    params.push(parseInt(sessionNumber, 10));
  }

  query += ' ORDER BY session_number DESC, layer_number ASC';

  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  // Parse JSON fields
  const layers = (results as ExecutionLayer[]).map((layer) => ({
    ...layer,
    expected_inputs: layer.expected_inputs ? JSON.parse(layer.expected_inputs) : null,
    expected_outputs: layer.expected_outputs ? JSON.parse(layer.expected_outputs) : null,
    actual_outputs: layer.actual_outputs ? JSON.parse(layer.actual_outputs) : null,
    verification_evidence: layer.verification_evidence ? JSON.parse(layer.verification_evidence) : null,
  }));

  return c.json({ layers });
});

/**
 * GET /projects/:projectId/layers/:layerId
 * Get a specific layer
 */
layers.get('/projects/:projectId/layers/:layerId', async (c) => {
  const { projectId, layerId } = c.req.param();
  const userId = c.get('userId');

  const isOwner = await verifyProjectOwnership(c.env.DB, projectId, userId);
  if (!isOwner) {
    return c.json({ error: 'Project not found or access denied' }, 404);
  }

  const layer = await c.env.DB.prepare(
    'SELECT * FROM execution_layers WHERE id = ? AND project_id = ?'
  ).bind(layerId, projectId).first() as ExecutionLayer | null;

  if (!layer) {
    return c.json({ error: 'Layer not found' }, 404);
  }

  return c.json({
    ...layer,
    expected_inputs: layer.expected_inputs ? JSON.parse(layer.expected_inputs) : null,
    expected_outputs: layer.expected_outputs ? JSON.parse(layer.expected_outputs) : null,
    actual_outputs: layer.actual_outputs ? JSON.parse(layer.actual_outputs) : null,
    verification_evidence: layer.verification_evidence ? JSON.parse(layer.verification_evidence) : null,
  });
});

/**
 * POST /projects/:projectId/layers
 * Create a new layer (must be in Execute phase)
 */
layers.post('/projects/:projectId/layers', async (c) => {
  const { projectId } = c.req.param();
  const userId = c.get('userId');
  const body = await c.req.json() as CreateLayerInput;

  const isOwner = await verifyProjectOwnership(c.env.DB, projectId, userId);
  if (!isOwner) {
    return c.json({ error: 'Project not found or access denied' }, 404);
  }

  // Get current session number from project state
  const state = await c.env.DB.prepare(
    'SELECT capsule FROM project_state WHERE project_id = ?'
  ).bind(projectId).first<{ capsule: string }>();

  if (!state) {
    return c.json({ error: 'Project state not found' }, 400);
  }

  const capsule = JSON.parse(state.capsule);
  const sessionNumber = capsule.session?.number || 1;

  // Validate required fields
  if (!body.layer_number || !body.title) {
    return c.json({ error: 'layer_number and title are required' }, 400);
  }

  // Check for duplicate layer number in this session
  const existing = await c.env.DB.prepare(
    `SELECT id FROM execution_layers
     WHERE project_id = ? AND session_number = ? AND layer_number = ?`
  ).bind(projectId, sessionNumber, body.layer_number).first();

  if (existing) {
    return c.json({ error: `Layer ${body.layer_number} already exists in this session` }, 409);
  }

  const id = generateId();
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO execution_layers (
      id, project_id, session_number, layer_number, title, description,
      expected_inputs, expected_outputs, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    projectId,
    sessionNumber,
    body.layer_number,
    body.title,
    body.description || null,
    body.expected_inputs ? JSON.stringify(body.expected_inputs) : null,
    body.expected_outputs ? JSON.stringify(body.expected_outputs) : null,
    now
  ).run();

  const layer = await c.env.DB.prepare(
    'SELECT * FROM execution_layers WHERE id = ?'
  ).bind(id).first() as ExecutionLayer;

  return c.json({
    ...layer,
    expected_inputs: layer.expected_inputs ? JSON.parse(layer.expected_inputs) : null,
    expected_outputs: layer.expected_outputs ? JSON.parse(layer.expected_outputs) : null,
  }, 201);
});

/**
 * POST /projects/:projectId/layers/batch
 * Create multiple layers at once (AI decomposes work into layers)
 */
layers.post('/projects/:projectId/layers/batch', async (c) => {
  const { projectId } = c.req.param();
  const userId = c.get('userId');
  const body = await c.req.json() as { layers: CreateLayerInput[] };

  const isOwner = await verifyProjectOwnership(c.env.DB, projectId, userId);
  if (!isOwner) {
    return c.json({ error: 'Project not found or access denied' }, 404);
  }

  if (!body.layers || !Array.isArray(body.layers) || body.layers.length === 0) {
    return c.json({ error: 'layers array is required' }, 400);
  }

  // Get current session number
  const state = await c.env.DB.prepare(
    'SELECT capsule FROM project_state WHERE project_id = ?'
  ).bind(projectId).first<{ capsule: string }>();

  if (!state) {
    return c.json({ error: 'Project state not found' }, 400);
  }

  const capsule = JSON.parse(state.capsule);
  const sessionNumber = capsule.session?.number || 1;

  const now = new Date().toISOString();
  const createdLayers: ExecutionLayer[] = [];

  for (const layerInput of body.layers) {
    if (!layerInput.layer_number || !layerInput.title) {
      return c.json({ error: 'Each layer requires layer_number and title' }, 400);
    }

    const id = generateId();

    await c.env.DB.prepare(
      `INSERT INTO execution_layers (
        id, project_id, session_number, layer_number, title, description,
        expected_inputs, expected_outputs, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      projectId,
      sessionNumber,
      layerInput.layer_number,
      layerInput.title,
      layerInput.description || null,
      layerInput.expected_inputs ? JSON.stringify(layerInput.expected_inputs) : null,
      layerInput.expected_outputs ? JSON.stringify(layerInput.expected_outputs) : null,
      now
    ).run();

    const layer = await c.env.DB.prepare(
      'SELECT * FROM execution_layers WHERE id = ?'
    ).bind(id).first() as ExecutionLayer;

    createdLayers.push(layer);
  }

  return c.json({
    layers: createdLayers.map((layer) => ({
      ...layer,
      expected_inputs: layer.expected_inputs ? JSON.parse(layer.expected_inputs) : null,
      expected_outputs: layer.expected_outputs ? JSON.parse(layer.expected_outputs) : null,
    })),
  }, 201);
});

/**
 * PATCH /projects/:projectId/layers/:layerId
 * Update a layer (only if not LOCKED)
 */
layers.patch('/projects/:projectId/layers/:layerId', async (c) => {
  const { projectId, layerId } = c.req.param();
  const userId = c.get('userId');
  const body = await c.req.json() as UpdateLayerInput;

  const isOwner = await verifyProjectOwnership(c.env.DB, projectId, userId);
  if (!isOwner) {
    return c.json({ error: 'Project not found or access denied' }, 404);
  }

  const layer = await c.env.DB.prepare(
    'SELECT * FROM execution_layers WHERE id = ? AND project_id = ?'
  ).bind(layerId, projectId).first() as ExecutionLayer | null;

  if (!layer) {
    return c.json({ error: 'Layer not found' }, 404);
  }

  if (layer.status === 'LOCKED') {
    return c.json({ error: 'Cannot modify a locked layer' }, 403);
  }

  const updates: string[] = [];
  const values: (string | null)[] = [];

  if (body.title !== undefined) {
    updates.push('title = ?');
    values.push(body.title);
  }
  if (body.description !== undefined) {
    updates.push('description = ?');
    values.push(body.description);
  }
  if (body.expected_inputs !== undefined) {
    updates.push('expected_inputs = ?');
    values.push(JSON.stringify(body.expected_inputs));
  }
  if (body.expected_outputs !== undefined) {
    updates.push('expected_outputs = ?');
    values.push(JSON.stringify(body.expected_outputs));
  }
  if (body.actual_outputs !== undefined) {
    updates.push('actual_outputs = ?');
    values.push(JSON.stringify(body.actual_outputs));
  }

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  await c.env.DB.prepare(
    `UPDATE execution_layers SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values, layerId).run();

  const updated = await c.env.DB.prepare(
    'SELECT * FROM execution_layers WHERE id = ?'
  ).bind(layerId).first() as ExecutionLayer;

  return c.json({
    ...updated,
    expected_inputs: updated.expected_inputs ? JSON.parse(updated.expected_inputs) : null,
    expected_outputs: updated.expected_outputs ? JSON.parse(updated.expected_outputs) : null,
    actual_outputs: updated.actual_outputs ? JSON.parse(updated.actual_outputs) : null,
    verification_evidence: updated.verification_evidence ? JSON.parse(updated.verification_evidence) : null,
  });
});

/**
 * POST /projects/:projectId/layers/:layerId/start
 * Start executing a layer (PENDING → ACTIVE)
 */
layers.post('/projects/:projectId/layers/:layerId/start', async (c) => {
  const { projectId, layerId } = c.req.param();
  const userId = c.get('userId');

  const isOwner = await verifyProjectOwnership(c.env.DB, projectId, userId);
  if (!isOwner) {
    return c.json({ error: 'Project not found or access denied' }, 404);
  }

  const layer = await c.env.DB.prepare(
    'SELECT * FROM execution_layers WHERE id = ? AND project_id = ?'
  ).bind(layerId, projectId).first() as ExecutionLayer | null;

  if (!layer) {
    return c.json({ error: 'Layer not found' }, 404);
  }

  if (layer.status !== 'PENDING') {
    return c.json({ error: `Cannot start layer in ${layer.status} state` }, 400);
  }

  // Check if there's already an active layer
  const activeLayer = await getActiveLayer(c.env.DB, projectId, layer.session_number);
  if (activeLayer) {
    return c.json({
      error: `Layer ${activeLayer.layer_number} (${activeLayer.title}) is already active. Complete it first.`,
    }, 409);
  }

  // Verify all previous layers are locked
  const previousLayers = await c.env.DB.prepare(
    `SELECT * FROM execution_layers
     WHERE project_id = ? AND session_number = ? AND layer_number < ?
     ORDER BY layer_number ASC`
  ).bind(projectId, layer.session_number, layer.layer_number).all();

  for (const prev of previousLayers.results as ExecutionLayer[]) {
    if (prev.status !== 'LOCKED') {
      return c.json({
        error: `Layer ${prev.layer_number} (${prev.title}) must be verified and locked before starting layer ${layer.layer_number}`,
      }, 400);
    }
  }

  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `UPDATE execution_layers SET status = 'ACTIVE', started_at = ? WHERE id = ?`
  ).bind(now, layerId).run();

  const updated = await c.env.DB.prepare(
    'SELECT * FROM execution_layers WHERE id = ?'
  ).bind(layerId).first() as ExecutionLayer;

  return c.json({
    ...updated,
    expected_inputs: updated.expected_inputs ? JSON.parse(updated.expected_inputs) : null,
    expected_outputs: updated.expected_outputs ? JSON.parse(updated.expected_outputs) : null,
  });
});

/**
 * POST /projects/:projectId/layers/:layerId/complete
 * Mark layer as executed (ACTIVE → EXECUTED)
 */
layers.post('/projects/:projectId/layers/:layerId/complete', async (c) => {
  const { projectId, layerId } = c.req.param();
  const userId = c.get('userId');
  const body = await c.req.json() as { actual_outputs?: object };

  const isOwner = await verifyProjectOwnership(c.env.DB, projectId, userId);
  if (!isOwner) {
    return c.json({ error: 'Project not found or access denied' }, 404);
  }

  const layer = await c.env.DB.prepare(
    'SELECT * FROM execution_layers WHERE id = ? AND project_id = ?'
  ).bind(layerId, projectId).first() as ExecutionLayer | null;

  if (!layer) {
    return c.json({ error: 'Layer not found' }, 404);
  }

  if (layer.status !== 'ACTIVE') {
    return c.json({ error: `Cannot complete layer in ${layer.status} state` }, 400);
  }

  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `UPDATE execution_layers
     SET status = 'EXECUTED', completed_at = ?, actual_outputs = ?
     WHERE id = ?`
  ).bind(
    now,
    body.actual_outputs ? JSON.stringify(body.actual_outputs) : layer.actual_outputs,
    layerId
  ).run();

  const updated = await c.env.DB.prepare(
    'SELECT * FROM execution_layers WHERE id = ?'
  ).bind(layerId).first() as ExecutionLayer;

  return c.json({
    ...updated,
    expected_inputs: updated.expected_inputs ? JSON.parse(updated.expected_inputs) : null,
    expected_outputs: updated.expected_outputs ? JSON.parse(updated.expected_outputs) : null,
    actual_outputs: updated.actual_outputs ? JSON.parse(updated.actual_outputs) : null,
  });
});

/**
 * POST /projects/:projectId/layers/:layerId/verify
 * Verify a layer (EXECUTED → VERIFIED → LOCKED)
 */
layers.post('/projects/:projectId/layers/:layerId/verify', async (c) => {
  const { projectId, layerId } = c.req.param();
  const userId = c.get('userId');
  const body = await c.req.json() as VerifyLayerInput;

  const isOwner = await verifyProjectOwnership(c.env.DB, projectId, userId);
  if (!isOwner) {
    return c.json({ error: 'Project not found or access denied' }, 404);
  }

  const layer = await c.env.DB.prepare(
    'SELECT * FROM execution_layers WHERE id = ? AND project_id = ?'
  ).bind(layerId, projectId).first() as ExecutionLayer | null;

  if (!layer) {
    return c.json({ error: 'Layer not found' }, 404);
  }

  if (layer.status !== 'EXECUTED') {
    return c.json({ error: `Cannot verify layer in ${layer.status} state` }, 400);
  }

  if (!body.method) {
    return c.json({ error: 'verification method is required' }, 400);
  }

  const now = new Date().toISOString();
  const evidence = body.evidence ? {
    ...body.evidence,
    timestamp: body.evidence.timestamp || now,
  } : { type: body.method, timestamp: now };

  // Store evidence separately if provided
  if (body.evidence && (body.evidence.image_id || body.evidence.text)) {
    const evidenceId = `evid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await c.env.DB.prepare(
      `INSERT INTO layer_evidence (id, layer_id, evidence_type, image_id, text_content, user_notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      evidenceId,
      layerId,
      body.method,
      body.evidence.image_id || null,
      body.evidence.text || null,
      body.notes || null,
      now
    ).run();
  }

  // Transition directly to LOCKED (verified layers are immediately locked)
  await c.env.DB.prepare(
    `UPDATE execution_layers
     SET status = 'LOCKED',
         verification_method = ?,
         verification_evidence = ?,
         verified_at = ?,
         verified_by = 'user',
         locked_at = ?
     WHERE id = ?`
  ).bind(
    body.method,
    JSON.stringify(evidence),
    now,
    now,
    layerId
  ).run();

  const updated = await c.env.DB.prepare(
    'SELECT * FROM execution_layers WHERE id = ?'
  ).bind(layerId).first() as ExecutionLayer;

  return c.json({
    ...updated,
    expected_inputs: updated.expected_inputs ? JSON.parse(updated.expected_inputs) : null,
    expected_outputs: updated.expected_outputs ? JSON.parse(updated.expected_outputs) : null,
    actual_outputs: updated.actual_outputs ? JSON.parse(updated.actual_outputs) : null,
    verification_evidence: updated.verification_evidence ? JSON.parse(updated.verification_evidence) : null,
  });
});

/**
 * POST /projects/:projectId/layers/:layerId/fail
 * Mark layer as failed (ACTIVE/EXECUTED → FAILED)
 */
layers.post('/projects/:projectId/layers/:layerId/fail', async (c) => {
  const { projectId, layerId } = c.req.param();
  const userId = c.get('userId');
  const body = await c.req.json() as { reason: string };

  const isOwner = await verifyProjectOwnership(c.env.DB, projectId, userId);
  if (!isOwner) {
    return c.json({ error: 'Project not found or access denied' }, 404);
  }

  const layer = await c.env.DB.prepare(
    'SELECT * FROM execution_layers WHERE id = ? AND project_id = ?'
  ).bind(layerId, projectId).first() as ExecutionLayer | null;

  if (!layer) {
    return c.json({ error: 'Layer not found' }, 404);
  }

  if (layer.status !== 'ACTIVE' && layer.status !== 'EXECUTED') {
    return c.json({ error: `Cannot fail layer in ${layer.status} state` }, 400);
  }

  if (!body.reason) {
    return c.json({ error: 'failure reason is required' }, 400);
  }

  await c.env.DB.prepare(
    `UPDATE execution_layers
     SET status = 'FAILED', failure_reason = ?, retry_count = retry_count + 1
     WHERE id = ?`
  ).bind(body.reason, layerId).run();

  const updated = await c.env.DB.prepare(
    'SELECT * FROM execution_layers WHERE id = ?'
  ).bind(layerId).first() as ExecutionLayer;

  return c.json({
    ...updated,
    expected_inputs: updated.expected_inputs ? JSON.parse(updated.expected_inputs) : null,
    expected_outputs: updated.expected_outputs ? JSON.parse(updated.expected_outputs) : null,
  });
});

/**
 * POST /projects/:projectId/layers/:layerId/retry
 * Retry a failed layer (FAILED → ACTIVE)
 */
layers.post('/projects/:projectId/layers/:layerId/retry', async (c) => {
  const { projectId, layerId } = c.req.param();
  const userId = c.get('userId');

  const isOwner = await verifyProjectOwnership(c.env.DB, projectId, userId);
  if (!isOwner) {
    return c.json({ error: 'Project not found or access denied' }, 404);
  }

  const layer = await c.env.DB.prepare(
    'SELECT * FROM execution_layers WHERE id = ? AND project_id = ?'
  ).bind(layerId, projectId).first() as ExecutionLayer | null;

  if (!layer) {
    return c.json({ error: 'Layer not found' }, 404);
  }

  if (layer.status !== 'FAILED') {
    return c.json({ error: `Cannot retry layer in ${layer.status} state` }, 400);
  }

  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `UPDATE execution_layers
     SET status = 'ACTIVE', started_at = ?, failure_reason = NULL
     WHERE id = ?`
  ).bind(now, layerId).run();

  const updated = await c.env.DB.prepare(
    'SELECT * FROM execution_layers WHERE id = ?'
  ).bind(layerId).first() as ExecutionLayer;

  return c.json({
    ...updated,
    expected_inputs: updated.expected_inputs ? JSON.parse(updated.expected_inputs) : null,
    expected_outputs: updated.expected_outputs ? JSON.parse(updated.expected_outputs) : null,
  });
});

/**
 * DELETE /projects/:projectId/layers/:layerId
 * Delete a layer (only if PENDING)
 */
layers.delete('/projects/:projectId/layers/:layerId', async (c) => {
  const { projectId, layerId } = c.req.param();
  const userId = c.get('userId');

  const isOwner = await verifyProjectOwnership(c.env.DB, projectId, userId);
  if (!isOwner) {
    return c.json({ error: 'Project not found or access denied' }, 404);
  }

  const layer = await c.env.DB.prepare(
    'SELECT * FROM execution_layers WHERE id = ? AND project_id = ?'
  ).bind(layerId, projectId).first() as ExecutionLayer | null;

  if (!layer) {
    return c.json({ error: 'Layer not found' }, 404);
  }

  if (layer.status !== 'PENDING') {
    return c.json({ error: 'Only PENDING layers can be deleted' }, 403);
  }

  await c.env.DB.prepare('DELETE FROM execution_layers WHERE id = ?').bind(layerId).run();

  return c.json({ success: true });
});

/**
 * GET /projects/:projectId/layers/:layerId/evidence
 * Get all evidence for a layer
 */
layers.get('/projects/:projectId/layers/:layerId/evidence', async (c) => {
  const { projectId, layerId } = c.req.param();
  const userId = c.get('userId');

  const isOwner = await verifyProjectOwnership(c.env.DB, projectId, userId);
  if (!isOwner) {
    return c.json({ error: 'Project not found or access denied' }, 404);
  }

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM layer_evidence WHERE layer_id = ? ORDER BY created_at ASC'
  ).bind(layerId).all();

  return c.json({ evidence: results });
});

export default layers;
