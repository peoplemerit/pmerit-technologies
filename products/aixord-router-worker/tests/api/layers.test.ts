/**
 * Layers API Endpoint Tests
 *
 * Tests the layers sub-router mounted at /api/v1:
 *   POST   /api/v1/projects/:projectId/layers                 - Create layer
 *   GET    /api/v1/projects/:projectId/layers                 - List layers
 *   GET    /api/v1/projects/:projectId/layers/:layerId        - Get single layer
 *   PATCH  /api/v1/projects/:projectId/layers/:layerId        - Update layer
 *   POST   /api/v1/projects/:projectId/layers/:layerId/start  - Start (PENDING -> ACTIVE)
 *   POST   /api/v1/projects/:projectId/layers/:layerId/complete - Complete (ACTIVE -> EXECUTED)
 *   POST   /api/v1/projects/:projectId/layers/:layerId/verify - Verify (EXECUTED -> LOCKED)
 *   POST   /api/v1/projects/:projectId/layers/:layerId/fail   - Fail (ACTIVE|EXECUTED -> FAILED)
 *   POST   /api/v1/projects/:projectId/layers/:layerId/retry  - Retry (FAILED -> ACTIVE)
 *   POST   /api/v1/projects/:projectId/layers/batch           - Batch create
 *   DELETE /api/v1/projects/:projectId/layers/:layerId        - Delete (PENDING only)
 *   GET    /api/v1/projects/:projectId/layers/:layerId/evidence - Get evidence
 *
 * State Machine:
 *   PENDING -> ACTIVE -> EXECUTED -> LOCKED (via verify)
 *                          |
 *              ACTIVE -> FAILED -> (retry) -> ACTIVE
 *              EXECUTED -> FAILED -> (retry) -> ACTIVE
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types';
import { type MockQueryResult, genId } from '../helpers';
import { createMockEnv, createTestSession, authHeaders, jsonHeaders } from '../test-app';

// Mock crypto for requireAuth
vi.mock('../../src/utils/crypto', () => ({
  hashPasswordPBKDF2: vi.fn(),
  verifyPasswordPBKDF2: vi.fn(),
  hashSHA256: vi.fn().mockImplementation(async (input: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }),
}));

let layersRouter: any;

beforeEach(async () => {
  vi.clearAllMocks();
  const mod = await import('../../src/api/layers');
  layersRouter = mod.default;
});

// ============================================================================
// Test Helpers
// ============================================================================

function buildApp(queries: MockQueryResult[] = []) {
  const env = createMockEnv(queries);
  const app = new Hono<{ Bindings: Env }>();
  app.route('/api/v1', layersRouter);
  const req = (path: string, init?: RequestInit) => app.request(path, init, env);
  return { app, env, req };
}

/** Auth session query — matches token_hash lookup in requireAuth */
function sessionQuery(userId = 'user-1'): MockQueryResult {
  return { pattern: 'token_hash', result: { user_id: userId, id: 'sess-1', email: 'user@test.com' } };
}

/** Project ownership verification query */
function ownerQuery(projectId = 'proj-1', userId = 'user-1'): MockQueryResult {
  return { pattern: 'SELECT id FROM projects WHERE id', result: { id: projectId, owner_id: userId } };
}

/** Project state with capsule (needed for create/batch — to extract session number) */
function projectStateQuery(sessionNumber = 1): MockQueryResult {
  return {
    pattern: 'SELECT capsule FROM project_state',
    result: {
      capsule: JSON.stringify({
        session: { number: sessionNumber, phase: 'EXECUTE', messageCount: 5 },
        project: { name: 'Test', objective: 'Build something' },
      }),
    },
  };
}

/** A layer row factory for mock DB responses */
function makeLayer(overrides: Partial<{
  id: string;
  project_id: string;
  session_number: number;
  layer_number: number;
  title: string;
  description: string | null;
  status: string;
  expected_inputs: string | null;
  expected_outputs: string | null;
  actual_outputs: string | null;
  verification_method: string | null;
  verification_evidence: string | null;
  verified_at: string | null;
  verified_by: string | null;
  failure_reason: string | null;
  retry_count: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  locked_at: string | null;
}> = {}) {
  return {
    id: overrides.id ?? 'layer-1',
    project_id: overrides.project_id ?? 'proj-1',
    session_number: overrides.session_number ?? 1,
    layer_number: overrides.layer_number ?? 1,
    title: overrides.title ?? 'Test Layer',
    description: overrides.description ?? null,
    status: overrides.status ?? 'PENDING',
    expected_inputs: overrides.expected_inputs ?? null,
    expected_outputs: overrides.expected_outputs ?? null,
    actual_outputs: overrides.actual_outputs ?? null,
    verification_method: overrides.verification_method ?? null,
    verification_evidence: overrides.verification_evidence ?? null,
    verified_at: overrides.verified_at ?? null,
    verified_by: overrides.verified_by ?? null,
    failure_reason: overrides.failure_reason ?? null,
    retry_count: overrides.retry_count ?? 0,
    created_at: overrides.created_at ?? '2026-01-15T00:00:00Z',
    started_at: overrides.started_at ?? null,
    completed_at: overrides.completed_at ?? null,
    locked_at: overrides.locked_at ?? null,
  };
}

const BASE = '/api/v1/projects/proj-1/layers';

// ============================================================================
// Authentication Tests
// ============================================================================

describe('Layers API — Authentication', () => {
  it('returns 401 when no auth header is provided on GET list', async () => {
    const { req } = buildApp();
    const res = await req(BASE);
    expect(res.status).toBe(401);
  });

  it('returns 401 when no auth header is provided on POST create', async () => {
    const { req } = buildApp();
    const res = await req(BASE, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ layer_number: 1, title: 'Layer 1' }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 when no auth header is provided on start action', async () => {
    const { req } = buildApp();
    const res = await req(`${BASE}/layer-1/start`, { method: 'POST' });
    expect(res.status).toBe(401);
  });
});

// ============================================================================
// POST /projects/:projectId/layers — Create Layer
// ============================================================================

describe('POST /api/v1/projects/:projectId/layers', () => {
  it('creates a layer and returns 201', async () => {
    const { token } = await createTestSession();
    const createdLayer = makeLayer({ id: 'layer-new', layer_number: 1, title: 'Setup Environment' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      projectStateQuery(1),
      // Duplicate check — no existing layer with same number
      { pattern: 'SELECT id FROM execution_layers', result: null },
      // INSERT
      { pattern: 'INSERT INTO execution_layers', runResult: { success: true } },
      // SELECT after insert
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: createdLayer },
    ]);

    const res = await req(BASE, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ layer_number: 1, title: 'Setup Environment' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { id: string; title: string; status: string };
    expect(body.title).toBe('Setup Environment');
    expect(body.status).toBe('PENDING');
  });

  it('returns 400 when layer_number is missing', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      projectStateQuery(),
    ]);

    const res = await req(BASE, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ title: 'Missing Number' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('layer_number and title are required');
  });

  it('returns 400 when title is missing', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      projectStateQuery(),
    ]);

    const res = await req(BASE, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ layer_number: 1 }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('layer_number and title are required');
  });

  it('returns 409 when layer_number is duplicate in current session', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      projectStateQuery(),
      // Duplicate check — existing layer found
      { pattern: 'SELECT id FROM execution_layers', result: { id: 'existing-layer' } },
    ]);

    const res = await req(BASE, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ layer_number: 1, title: 'Duplicate' }),
    });

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('already exists');
  });

  it('returns 400 when project state is not found', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // project_state not found
      { pattern: 'SELECT capsule FROM project_state', result: null },
    ]);

    const res = await req(BASE, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ layer_number: 1, title: 'No State' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Project state not found');
  });

  it('returns 404 when project is not owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req(BASE, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ layer_number: 1, title: 'Not My Project' }),
    });

    expect(res.status).toBe(404);
  });
});

// ============================================================================
// GET /projects/:projectId/layers — List Layers
// ============================================================================

describe('GET /api/v1/projects/:projectId/layers', () => {
  it('lists layers for a project', async () => {
    const { token } = await createTestSession();
    const layers = [
      makeLayer({ id: 'l1', layer_number: 1, title: 'Setup', status: 'LOCKED' }),
      makeLayer({ id: 'l2', layer_number: 2, title: 'Build', status: 'ACTIVE' }),
    ];

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE project_id', result: layers },
    ]);

    const res = await req(BASE, { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    const body = await res.json() as { layers: Array<{ id: string; title: string }> };
    expect(body.layers).toHaveLength(2);
    expect(body.layers[0].title).toBe('Setup');
    expect(body.layers[1].title).toBe('Build');
  });

  it('returns 404 when project is not owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req(BASE, { headers: authHeaders(token) });
    expect(res.status).toBe(404);
  });
});

// ============================================================================
// GET /projects/:projectId/layers/:layerId — Get Single Layer
// ============================================================================

describe('GET /api/v1/projects/:projectId/layers/:layerId', () => {
  it('returns a single layer', async () => {
    const { token } = await createTestSession();
    const layer = makeLayer({ id: 'layer-1', title: 'Deploy', status: 'EXECUTED' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: layer },
    ]);

    const res = await req(`${BASE}/layer-1`, { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    const body = await res.json() as { id: string; title: string; status: string };
    expect(body.id).toBe('layer-1');
    expect(body.status).toBe('EXECUTED');
  });

  it('returns 404 when layer does not exist', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: null },
    ]);

    const res = await req(`${BASE}/nonexistent`, { headers: authHeaders(token) });
    expect(res.status).toBe(404);
  });
});

// ============================================================================
// PATCH /projects/:projectId/layers/:layerId — Update Layer
// ============================================================================

describe('PATCH /api/v1/projects/:projectId/layers/:layerId', () => {
  it('updates layer title and description', async () => {
    const { token } = await createTestSession();
    const layer = makeLayer({ id: 'layer-1', status: 'PENDING' });
    const updatedLayer = makeLayer({ id: 'layer-1', title: 'Updated Title', description: 'New desc', status: 'PENDING' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: layer },
      { pattern: 'UPDATE execution_layers SET', runResult: { success: true } },
      // Re-fetch after update
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: updatedLayer },
    ]);

    const res = await req(`${BASE}/layer-1`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ title: 'Updated Title', description: 'New desc' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { title: string; description: string };
    expect(body.title).toBe('Updated Title');
    expect(body.description).toBe('New desc');
  });

  it('returns 403 when trying to modify a LOCKED layer', async () => {
    const { token } = await createTestSession();
    const lockedLayer = makeLayer({ id: 'layer-1', status: 'LOCKED' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: lockedLayer },
    ]);

    const res = await req(`${BASE}/layer-1`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ title: 'Try to change locked' }),
    });

    expect(res.status).toBe(403);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('locked');
  });

  it('returns 400 when no fields are provided', async () => {
    const { token } = await createTestSession();
    const layer = makeLayer({ id: 'layer-1', status: 'PENDING' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: layer },
    ]);

    const res = await req(`${BASE}/layer-1`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('No fields to update');
  });
});

// ============================================================================
// POST /projects/:projectId/layers/:layerId/start — Start (PENDING -> ACTIVE)
// ============================================================================

describe('POST /api/v1/projects/:projectId/layers/:layerId/start', () => {
  it('transitions a PENDING layer to ACTIVE', async () => {
    const { token } = await createTestSession();
    const pendingLayer = makeLayer({ id: 'layer-1', layer_number: 1, status: 'PENDING', session_number: 1 });
    const activeLayer = makeLayer({ id: 'layer-1', layer_number: 1, status: 'ACTIVE', started_at: '2026-01-15T01:00:00Z' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Fetch layer
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: pendingLayer },
      // Check for active layer in session — none found
      { pattern: "status = 'ACTIVE'", result: null },
      // Check previous layers — none (layer 1)
      { pattern: 'layer_number <', result: [] },
      // UPDATE to ACTIVE
      { pattern: 'UPDATE execution_layers SET', runResult: { success: true } },
      // Re-fetch after update
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: activeLayer },
    ]);

    const res = await req(`${BASE}/layer-1/start`, {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { status: string; started_at: string };
    expect(body.status).toBe('ACTIVE');
    expect(body.started_at).toBeDefined();
  });

  it('rejects starting a layer that is not PENDING', async () => {
    const { token } = await createTestSession();
    const activeLayer = makeLayer({ id: 'layer-1', status: 'ACTIVE' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: activeLayer },
    ]);

    const res = await req(`${BASE}/layer-1/start`, {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Cannot start layer in ACTIVE state');
  });

  it('rejects starting when another layer is already ACTIVE', async () => {
    const { token } = await createTestSession();
    const pendingLayer = makeLayer({ id: 'layer-2', layer_number: 2, status: 'PENDING', session_number: 1 });
    const existingActiveLayer = makeLayer({ id: 'layer-1', layer_number: 1, status: 'ACTIVE', title: 'Setup', session_number: 1 });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: pendingLayer },
      // Active layer exists
      { pattern: "status = 'ACTIVE'", result: existingActiveLayer },
    ]);

    const res = await req(`${BASE}/layer-2/start`, {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('already active');
  });

  it('rejects starting layer 2 when layer 1 is not LOCKED', async () => {
    const { token } = await createTestSession();
    const pendingLayer2 = makeLayer({ id: 'layer-2', layer_number: 2, status: 'PENDING', session_number: 1 });
    const executedLayer1 = makeLayer({ id: 'layer-1', layer_number: 1, status: 'EXECUTED', title: 'Setup', session_number: 1 });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: pendingLayer2 },
      // No active layer
      { pattern: "status = 'ACTIVE'", result: null },
      // Previous layers — layer 1 is EXECUTED (not LOCKED)
      { pattern: 'layer_number <', result: [executedLayer1] },
    ]);

    const res = await req(`${BASE}/layer-2/start`, {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('must be verified and locked');
  });
});

// ============================================================================
// POST /projects/:projectId/layers/:layerId/complete — Complete (ACTIVE -> EXECUTED)
// ============================================================================

describe('POST /api/v1/projects/:projectId/layers/:layerId/complete', () => {
  it('transitions an ACTIVE layer to EXECUTED', async () => {
    const { token } = await createTestSession();
    const activeLayer = makeLayer({ id: 'layer-1', status: 'ACTIVE' });
    const executedLayer = makeLayer({ id: 'layer-1', status: 'EXECUTED', completed_at: '2026-01-15T02:00:00Z' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: activeLayer },
      { pattern: 'UPDATE execution_layers', runResult: { success: true } },
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: executedLayer },
    ]);

    const res = await req(`${BASE}/layer-1/complete`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ actual_outputs: { files: ['main.ts'] } }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { status: string; completed_at: string };
    expect(body.status).toBe('EXECUTED');
    expect(body.completed_at).toBeDefined();
  });

  it('rejects completing a PENDING layer', async () => {
    const { token } = await createTestSession();
    const pendingLayer = makeLayer({ id: 'layer-1', status: 'PENDING' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: pendingLayer },
    ]);

    const res = await req(`${BASE}/layer-1/complete`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Cannot complete layer in PENDING state');
  });

  it('rejects completing a LOCKED layer', async () => {
    const { token } = await createTestSession();
    const lockedLayer = makeLayer({ id: 'layer-1', status: 'LOCKED' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: lockedLayer },
    ]);

    const res = await req(`${BASE}/layer-1/complete`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Cannot complete layer in LOCKED state');
  });
});

// ============================================================================
// POST /projects/:projectId/layers/:layerId/verify — Verify (EXECUTED -> LOCKED)
// ============================================================================

describe('POST /api/v1/projects/:projectId/layers/:layerId/verify', () => {
  it('transitions an EXECUTED layer to LOCKED with verification evidence', async () => {
    const { token } = await createTestSession();
    const executedLayer = makeLayer({ id: 'layer-1', status: 'EXECUTED' });
    const lockedLayer = makeLayer({
      id: 'layer-1',
      status: 'LOCKED',
      verification_method: 'user_confirm',
      verification_evidence: JSON.stringify({ type: 'user_confirm', timestamp: '2026-01-15T03:00:00Z' }),
      verified_at: '2026-01-15T03:00:00Z',
      verified_by: 'user',
      locked_at: '2026-01-15T03:00:00Z',
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: executedLayer },
      // UPDATE to LOCKED
      { pattern: 'UPDATE execution_layers', runResult: { success: true } },
      // Re-fetch
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: lockedLayer },
    ]);

    const res = await req(`${BASE}/layer-1/verify`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ method: 'user_confirm' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { status: string; verification_method: string; locked_at: string };
    expect(body.status).toBe('LOCKED');
    expect(body.verification_method).toBe('user_confirm');
    expect(body.locked_at).toBeDefined();
  });

  it('stores evidence when provided with image_id', async () => {
    const { token } = await createTestSession();
    const executedLayer = makeLayer({ id: 'layer-1', status: 'EXECUTED' });
    const lockedLayer = makeLayer({
      id: 'layer-1',
      status: 'LOCKED',
      verification_method: 'screenshot',
      verification_evidence: JSON.stringify({ type: 'screenshot', image_id: 'img-123', timestamp: '2026-01-15T03:00:00Z' }),
      locked_at: '2026-01-15T03:00:00Z',
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: executedLayer },
      // INSERT evidence record
      { pattern: 'INSERT INTO layer_evidence', runResult: { success: true } },
      // UPDATE layer
      { pattern: 'UPDATE execution_layers', runResult: { success: true } },
      // Re-fetch
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: lockedLayer },
    ]);

    const res = await req(`${BASE}/layer-1/verify`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        method: 'screenshot',
        evidence: { type: 'screenshot', image_id: 'img-123' },
        notes: 'Screenshot of completed build',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { status: string; verification_method: string };
    expect(body.status).toBe('LOCKED');
    expect(body.verification_method).toBe('screenshot');
  });

  it('rejects verifying a layer that is not EXECUTED', async () => {
    const { token } = await createTestSession();
    const activeLayer = makeLayer({ id: 'layer-1', status: 'ACTIVE' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: activeLayer },
    ]);

    const res = await req(`${BASE}/layer-1/verify`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ method: 'user_confirm' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Cannot verify layer in ACTIVE state');
  });

  it('rejects verification without a method', async () => {
    const { token } = await createTestSession();
    const executedLayer = makeLayer({ id: 'layer-1', status: 'EXECUTED' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: executedLayer },
    ]);

    const res = await req(`${BASE}/layer-1/verify`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('verification method is required');
  });
});

// ============================================================================
// POST /projects/:projectId/layers/:layerId/fail — Fail (ACTIVE|EXECUTED -> FAILED)
// ============================================================================

describe('POST /api/v1/projects/:projectId/layers/:layerId/fail', () => {
  it('transitions an ACTIVE layer to FAILED with reason', async () => {
    const { token } = await createTestSession();
    const activeLayer = makeLayer({ id: 'layer-1', status: 'ACTIVE' });
    const failedLayer = makeLayer({ id: 'layer-1', status: 'FAILED', failure_reason: 'Build failed', retry_count: 1 });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: activeLayer },
      { pattern: 'UPDATE execution_layers', runResult: { success: true } },
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: failedLayer },
    ]);

    const res = await req(`${BASE}/layer-1/fail`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ reason: 'Build failed' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { status: string; failure_reason: string; retry_count: number };
    expect(body.status).toBe('FAILED');
    expect(body.failure_reason).toBe('Build failed');
    expect(body.retry_count).toBe(1);
  });

  it('transitions an EXECUTED layer to FAILED', async () => {
    const { token } = await createTestSession();
    const executedLayer = makeLayer({ id: 'layer-1', status: 'EXECUTED' });
    const failedLayer = makeLayer({ id: 'layer-1', status: 'FAILED', failure_reason: 'Verification showed wrong output' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: executedLayer },
      { pattern: 'UPDATE execution_layers', runResult: { success: true } },
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: failedLayer },
    ]);

    const res = await req(`${BASE}/layer-1/fail`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ reason: 'Verification showed wrong output' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe('FAILED');
  });

  it('rejects failing a PENDING layer', async () => {
    const { token } = await createTestSession();
    const pendingLayer = makeLayer({ id: 'layer-1', status: 'PENDING' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: pendingLayer },
    ]);

    const res = await req(`${BASE}/layer-1/fail`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ reason: 'Should not work' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Cannot fail layer in PENDING state');
  });

  it('rejects failing a LOCKED layer', async () => {
    const { token } = await createTestSession();
    const lockedLayer = makeLayer({ id: 'layer-1', status: 'LOCKED' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: lockedLayer },
    ]);

    const res = await req(`${BASE}/layer-1/fail`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ reason: 'Cannot undo lock' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Cannot fail layer in LOCKED state');
  });

  it('rejects fail without a reason', async () => {
    const { token } = await createTestSession();
    const activeLayer = makeLayer({ id: 'layer-1', status: 'ACTIVE' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: activeLayer },
    ]);

    const res = await req(`${BASE}/layer-1/fail`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('failure reason is required');
  });
});

// ============================================================================
// POST /projects/:projectId/layers/:layerId/retry — Retry (FAILED -> ACTIVE)
// ============================================================================

describe('POST /api/v1/projects/:projectId/layers/:layerId/retry', () => {
  it('transitions a FAILED layer back to ACTIVE', async () => {
    const { token } = await createTestSession();
    const failedLayer = makeLayer({ id: 'layer-1', status: 'FAILED', failure_reason: 'Build crashed', retry_count: 1 });
    const retriedLayer = makeLayer({ id: 'layer-1', status: 'ACTIVE', failure_reason: null, retry_count: 1, started_at: '2026-01-15T04:00:00Z' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: failedLayer },
      { pattern: 'UPDATE execution_layers', runResult: { success: true } },
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: retriedLayer },
    ]);

    const res = await req(`${BASE}/layer-1/retry`, {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { status: string; failure_reason: string | null };
    expect(body.status).toBe('ACTIVE');
    expect(body.failure_reason).toBeNull();
  });

  it('rejects retrying a non-FAILED layer', async () => {
    const { token } = await createTestSession();
    const activeLayer = makeLayer({ id: 'layer-1', status: 'ACTIVE' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: activeLayer },
    ]);

    const res = await req(`${BASE}/layer-1/retry`, {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Cannot retry layer in ACTIVE state');
  });

  it('rejects retrying a PENDING layer', async () => {
    const { token } = await createTestSession();
    const pendingLayer = makeLayer({ id: 'layer-1', status: 'PENDING' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: pendingLayer },
    ]);

    const res = await req(`${BASE}/layer-1/retry`, {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Cannot retry layer in PENDING state');
  });
});

// ============================================================================
// POST /projects/:projectId/layers/batch — Batch Create
// ============================================================================

describe('POST /api/v1/projects/:projectId/layers/batch', () => {
  it('creates multiple layers in a batch', async () => {
    const { token } = await createTestSession();
    const layer1 = makeLayer({ id: 'l-1', layer_number: 1, title: 'Setup' });
    const layer2 = makeLayer({ id: 'l-2', layer_number: 2, title: 'Build' });
    const layer3 = makeLayer({ id: 'l-3', layer_number: 3, title: 'Test' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      projectStateQuery(),
      // Three INSERTs
      { pattern: 'INSERT INTO execution_layers', runResult: { success: true } },
      // Three SELECTs after insert (mock returns each layer in sequence)
      // Since all three hit the same pattern, mock returns the first match each time.
      // The mock always returns the first matching pattern, so we use a single result
      // that covers the SELECT * WHERE id query. We return layer1 for all three;
      // the test just verifies the response shape and status code.
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: layer1 },
    ]);

    const res = await req(`${BASE}/batch`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        layers: [
          { layer_number: 1, title: 'Setup' },
          { layer_number: 2, title: 'Build' },
          { layer_number: 3, title: 'Test' },
        ],
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { layers: Array<{ title: string; status: string }> };
    expect(body.layers).toHaveLength(3);
  });

  it('rejects batch with empty layers array', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req(`${BASE}/batch`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ layers: [] }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('layers array is required');
  });

  it('rejects batch when a layer is missing title', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      projectStateQuery(),
    ]);

    const res = await req(`${BASE}/batch`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        layers: [
          { layer_number: 1, title: 'Valid' },
          { layer_number: 2 },
        ],
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('layer_number and title');
  });

  it('rejects batch with missing layers field', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req(`${BASE}/batch`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('layers array is required');
  });
});

// ============================================================================
// DELETE /projects/:projectId/layers/:layerId — Delete Layer
// ============================================================================

describe('DELETE /api/v1/projects/:projectId/layers/:layerId', () => {
  it('deletes a PENDING layer', async () => {
    const { token } = await createTestSession();
    const pendingLayer = makeLayer({ id: 'layer-1', status: 'PENDING' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: pendingLayer },
      { pattern: 'DELETE FROM execution_layers', runResult: { success: true } },
    ]);

    const res = await req(`${BASE}/layer-1`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('rejects deleting an ACTIVE layer', async () => {
    const { token } = await createTestSession();
    const activeLayer = makeLayer({ id: 'layer-1', status: 'ACTIVE' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: activeLayer },
    ]);

    const res = await req(`${BASE}/layer-1`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(403);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Only PENDING layers can be deleted');
  });

  it('rejects deleting a LOCKED layer', async () => {
    const { token } = await createTestSession();
    const lockedLayer = makeLayer({ id: 'layer-1', status: 'LOCKED' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: lockedLayer },
    ]);

    const res = await req(`${BASE}/layer-1`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(403);
  });
});

// ============================================================================
// GET /projects/:projectId/layers/:layerId/evidence — Get Evidence
// ============================================================================

describe('GET /api/v1/projects/:projectId/layers/:layerId/evidence', () => {
  it('returns evidence records for a layer', async () => {
    const { token } = await createTestSession();
    const evidenceRecords = [
      { id: 'evid-1', layer_id: 'layer-1', evidence_type: 'screenshot', image_id: 'img-1', text_content: null, created_at: '2026-01-15T03:00:00Z' },
    ];

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM layer_evidence WHERE layer_id', result: evidenceRecords },
    ]);

    const res = await req(`${BASE}/layer-1/evidence`, { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    const body = await res.json() as { evidence: Array<{ id: string }> };
    expect(body.evidence).toHaveLength(1);
    expect(body.evidence[0].id).toBe('evid-1');
  });
});

// ============================================================================
// Full Lifecycle Integration (Happy Path via HTTP)
// ============================================================================

describe('Layers API — Full Lifecycle Happy Path', () => {
  it('walks a layer through PENDING -> ACTIVE -> EXECUTED -> LOCKED', async () => {
    const { token } = await createTestSession();

    // Step 1: Start the layer (PENDING -> ACTIVE)
    const pendingLayer = makeLayer({ id: 'layer-1', layer_number: 1, status: 'PENDING', session_number: 1 });
    const activeLayer = makeLayer({ id: 'layer-1', status: 'ACTIVE', started_at: '2026-01-15T01:00:00Z' });

    const { req: reqStart } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: pendingLayer },
      { pattern: "status = 'ACTIVE'", result: null },
      { pattern: 'layer_number <', result: [] },
      { pattern: 'UPDATE execution_layers SET', runResult: { success: true } },
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: activeLayer },
    ]);

    const startRes = await reqStart(`${BASE}/layer-1/start`, {
      method: 'POST',
      headers: authHeaders(token),
    });
    expect(startRes.status).toBe(200);
    expect(((await startRes.json()) as { status: string }).status).toBe('ACTIVE');

    // Step 2: Complete the layer (ACTIVE -> EXECUTED)
    const executedLayer = makeLayer({ id: 'layer-1', status: 'EXECUTED', completed_at: '2026-01-15T02:00:00Z' });

    const { req: reqComplete } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: activeLayer },
      { pattern: 'UPDATE execution_layers', runResult: { success: true } },
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: executedLayer },
    ]);

    const completeRes = await reqComplete(`${BASE}/layer-1/complete`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ actual_outputs: { result: 'success' } }),
    });
    expect(completeRes.status).toBe(200);
    expect(((await completeRes.json()) as { status: string }).status).toBe('EXECUTED');

    // Step 3: Verify the layer (EXECUTED -> LOCKED)
    const lockedLayer = makeLayer({
      id: 'layer-1',
      status: 'LOCKED',
      verification_method: 'user_confirm',
      locked_at: '2026-01-15T03:00:00Z',
    });

    const { req: reqVerify } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: executedLayer },
      { pattern: 'UPDATE execution_layers', runResult: { success: true } },
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: lockedLayer },
    ]);

    const verifyRes = await reqVerify(`${BASE}/layer-1/verify`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ method: 'user_confirm' }),
    });
    expect(verifyRes.status).toBe(200);
    expect(((await verifyRes.json()) as { status: string }).status).toBe('LOCKED');
  });
});

// ============================================================================
// Failure + Retry Path Integration
// ============================================================================

describe('Layers API — Failure and Retry Path', () => {
  it('walks ACTIVE -> FAILED -> retry -> ACTIVE -> EXECUTED -> LOCKED', async () => {
    const { token } = await createTestSession();

    // Step 1: Fail the active layer
    const activeLayer = makeLayer({ id: 'layer-1', status: 'ACTIVE' });
    const failedLayer = makeLayer({ id: 'layer-1', status: 'FAILED', failure_reason: 'Test failure', retry_count: 1 });

    const { req: reqFail } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: activeLayer },
      { pattern: 'UPDATE execution_layers', runResult: { success: true } },
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: failedLayer },
    ]);

    const failRes = await reqFail(`${BASE}/layer-1/fail`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ reason: 'Test failure' }),
    });
    expect(failRes.status).toBe(200);
    expect(((await failRes.json()) as { status: string }).status).toBe('FAILED');

    // Step 2: Retry the failed layer
    const retriedLayer = makeLayer({ id: 'layer-1', status: 'ACTIVE', failure_reason: null, retry_count: 1 });

    const { req: reqRetry } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: failedLayer },
      { pattern: 'UPDATE execution_layers', runResult: { success: true } },
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: retriedLayer },
    ]);

    const retryRes = await reqRetry(`${BASE}/layer-1/retry`, {
      method: 'POST',
      headers: authHeaders(token),
    });
    expect(retryRes.status).toBe(200);
    const retryBody = (await retryRes.json()) as { status: string; failure_reason: string | null };
    expect(retryBody.status).toBe('ACTIVE');
    expect(retryBody.failure_reason).toBeNull();

    // Step 3: Complete after retry
    const executedLayer = makeLayer({ id: 'layer-1', status: 'EXECUTED', completed_at: '2026-01-15T05:00:00Z' });

    const { req: reqComplete } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: retriedLayer },
      { pattern: 'UPDATE execution_layers', runResult: { success: true } },
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: executedLayer },
    ]);

    const completeRes = await reqComplete(`${BASE}/layer-1/complete`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });
    expect(completeRes.status).toBe(200);
    expect(((await completeRes.json()) as { status: string }).status).toBe('EXECUTED');

    // Step 4: Verify after retry + complete
    const lockedLayer = makeLayer({ id: 'layer-1', status: 'LOCKED', locked_at: '2026-01-15T06:00:00Z' });

    const { req: reqVerify } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM execution_layers WHERE id = ? AND project_id', result: executedLayer },
      { pattern: 'UPDATE execution_layers', runResult: { success: true } },
      { pattern: 'SELECT * FROM execution_layers WHERE id', result: lockedLayer },
    ]);

    const verifyRes = await reqVerify(`${BASE}/layer-1/verify`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ method: 'test_output' }),
    });
    expect(verifyRes.status).toBe(200);
    expect(((await verifyRes.json()) as { status: string }).status).toBe('LOCKED');
  });
});
