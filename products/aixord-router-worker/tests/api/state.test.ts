/**
 * State API Endpoint Tests
 *
 * Tests the state sub-router mounted at /api/v1/state:
 *   GET    /api/v1/state/:projectId                    — Fetch project state
 *   PUT    /api/v1/state/:projectId                    — Update state
 *   PUT    /api/v1/state/:projectId/gates/:gateId      — Toggle single gate
 *   PUT    /api/v1/state/:projectId/phase              — Phase transition
 *   POST   /api/v1/state/:projectId/phases/:phase/finalize — Finalize phase
 *   POST   /api/v1/state/:projectId/gates/evaluate     — Re-evaluate gates
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types';
import { type MockQueryResult } from '../helpers';
import { createMockEnv, createTestSession, jsonHeaders, authHeaders } from '../test-app';

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

// Mock gateRules for evaluate endpoint
vi.mock('../../src/services/gateRules', () => ({
  evaluateAllGates: vi.fn().mockResolvedValue({
    evaluated: [],
    changed: [],
    gates: {},
    phase: 'BRAINSTORM',
    gate_details: {},
  }),
}));

import { evaluateAllGates } from '../../src/services/gateRules';
const mockEvaluateGates = vi.mocked(evaluateAllGates);

let stateRouter: any;

beforeEach(async () => {
  vi.clearAllMocks();
  const mod = await import('../../src/api/state');
  stateRouter = mod.default;
});

function buildApp(queries: MockQueryResult[] = []) {
  const env = createMockEnv(queries);
  const app = new Hono<{ Bindings: Env }>();
  app.route('/api/v1/state', stateRouter);

  const req = (path: string, init?: RequestInit) =>
    app.request(path, init, env);

  return { app, env, req };
}

/** Auth session query */
function sessionQuery(userId = 'user-1'): MockQueryResult {
  return { pattern: 'token_hash', result: { user_id: userId, id: 'sess-1', email: 'user@test.com' } };
}

/** Project ownership verification query */
function ownerQuery(projectId = 'proj-1', userId = 'user-1'): MockQueryResult {
  return { pattern: 'SELECT id FROM projects WHERE id', result: { id: projectId, owner_id: userId } };
}

/** Standard project state */
function projectState(phase = 'BRAINSTORM', gates: Record<string, boolean> = {}): MockQueryResult {
  return {
    pattern: 'SELECT * FROM project_state WHERE project_id',
    result: {
      project_id: 'proj-1',
      phase,
      gates: JSON.stringify(gates),
      capsule: JSON.stringify({
        session: { number: 1, phase, messageCount: 0 },
        project: { name: 'Test', objective: 'Build', type: 'software' },
      }),
      updated_at: '2026-01-01T00:00:00Z',
    },
  };
}

// ============================================================================
// GET State Tests
// ============================================================================
describe('GET /api/v1/state/:projectId', () => {
  it('returns project state for valid project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      projectState('BRAINSTORM', { 'GA:LIC': true, 'GA:DIS': false }),
      // Security gates lookup
      { pattern: 'security_gates WHERE project_id', result: { gs_dc: 1, gs_dp: 0, gs_ac: 1, gs_ai: 1, gs_jr: 0, gs_rt: 0 } },
    ]);

    const res = await req('/api/v1/state/proj-1', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { project_id: string; phase: string; gates: Record<string, boolean> };
    expect(body.project_id).toBe('proj-1');
    expect(body.phase).toBe('BRAINSTORM');
    expect(body.gates).toBeDefined();
  });

  it('returns 404 for project not owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/state/proj-unknown', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/state/proj-1');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// PUT State (Bulk Update) Tests
// ============================================================================
describe('PUT /api/v1/state/:projectId', () => {
  it('updates phase and gates', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      projectState(),
      // UPDATE project_state
      { pattern: 'UPDATE project_state SET', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/state/proj-1', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({
        phase: 'PLAN',
        gates: { 'GA:LIC': true, 'GA:DIS': true, 'GA:TIR': true },
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('updates data classification', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      projectState(),
      { pattern: 'UPDATE project_state SET', runResult: { success: true } },
      // data_classification check — exists
      { pattern: 'SELECT project_id FROM data_classification', result: { project_id: 'proj-1' } },
      // UPDATE data_classification
      { pattern: 'UPDATE data_classification', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/state/proj-1', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({
        data_classification: { pii: 'YES', ai_exposure: 'EXTERNAL' },
      }),
    });

    expect(res.status).toBe(200);
  });

  it('returns 404 for non-existent project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/state/proj-unknown', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ phase: 'PLAN' }),
    });

    expect(res.status).toBe(404);
  });
});

// ============================================================================
// Gate Toggle Tests
// ============================================================================
describe('PUT /api/v1/state/:projectId/gates/:gateId', () => {
  it('enables a gate without preconditions', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // GET current gates
      { pattern: 'SELECT gates FROM project_state', result: { gates: JSON.stringify({ 'GA:LIC': false, 'GA:DIS': false }) } },
      // UPDATE gates
      { pattern: 'UPDATE project_state SET gates', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/state/proj-1/gates/GA:LIC', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ enabled: true }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; gates: Record<string, boolean> };
    expect(body.success).toBe(true);
    expect(body.gates['GA:LIC']).toBe(true);
  });

  it('disables a gate', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT gates FROM project_state', result: { gates: JSON.stringify({ 'GA:LIC': true }) } },
      { pattern: 'UPDATE project_state SET gates', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/state/proj-1/gates/GA:LIC', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ enabled: false }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; gates: Record<string, boolean> };
    expect(body.gates['GA:LIC']).toBe(false);
  });

  it('rejects GA:ENV without workspace binding', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Workspace binding check — not confirmed
      { pattern: 'SELECT binding_confirmed FROM workspace_bindings', result: null },
    ]);

    const res = await req('/api/v1/state/proj-1/gates/GA:ENV', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ enabled: true }),
    });

    expect(res.status).toBe(403);
    const body = await res.json() as { error: string; gate: string };
    expect(body.gate).toBe('GA:ENV');
  });

  it('returns 404 for non-existent project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/state/proj-unknown/gates/GA:LIC', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ enabled: true }),
    });

    expect(res.status).toBe(404);
  });
});

// ============================================================================
// Phase Transition Tests
// ============================================================================
describe('PUT /api/v1/state/:projectId/phase', () => {
  it('allows forward transition when gates are satisfied', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Current state with all BRAINSTORM exit gates passed
      {
        pattern: 'SELECT phase, gates',
        result: {
          phase: 'BRAINSTORM',
          gates: JSON.stringify({ 'GA:LIC': true, 'GA:DIS': true, 'GA:TIR': true }),
          reassess_count: 0,
        },
      },
      // UPDATE phase
      { pattern: 'UPDATE project_state SET phase', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/state/proj-1/phase', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ phase: 'PLAN' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; phase: string };
    expect(body.success).toBe(true);
    expect(body.phase).toBe('PLAN');
  });

  it('rejects forward transition with unsatisfied gates', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      {
        pattern: 'SELECT phase, gates',
        result: {
          phase: 'BRAINSTORM',
          gates: JSON.stringify({ 'GA:LIC': true, 'GA:DIS': false, 'GA:TIR': false }),
          reassess_count: 0,
        },
      },
    ]);

    const res = await req('/api/v1/state/proj-1/phase', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ phase: 'PLAN' }),
    });

    // Should be 403 or 422 — blocked by missing gates
    expect(res.status).toBeGreaterThanOrEqual(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBeDefined();
  });

  it('returns 404 for non-existent project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/state/proj-unknown/phase', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ phase: 'PLAN' }),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/state/proj-1/phase', {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({ phase: 'PLAN' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Gates Evaluate Tests
// ============================================================================
describe('POST /api/v1/state/:projectId/gates/evaluate', () => {
  it('evaluates all gates and returns results', async () => {
    const { token } = await createTestSession();

    mockEvaluateGates.mockResolvedValue({
      evaluated: ['GA:LIC', 'GA:DIS'],
      changed: ['GA:LIC'],
      gates: { 'GA:LIC': true, 'GA:DIS': false },
      phase: 'BRAINSTORM',
      gate_details: {},
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/state/proj-1/gates/evaluate', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { evaluated: string[]; changed: string[] };
    expect(body.evaluated).toContain('GA:LIC');
    expect(body.changed).toContain('GA:LIC');
  });

  it('returns 404 for non-existent project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/state/proj-1/gates/evaluate', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/state/proj-1/gates/evaluate', {
      method: 'POST',
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Phase Finalize Tests (High-level governance)
// ============================================================================
describe('POST /api/v1/state/:projectId/phases/:phase/finalize', () => {
  it('returns 404 for non-existent project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/state/proj-1/phases/BRAINSTORM/finalize', {
      method: 'POST',
      headers: authHeaders(token),
    });

    // Finalize uses 403 for ownership (Director-only check)
    expect([403, 404]).toContain(res.status);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/state/proj-1/phases/BRAINSTORM/finalize', {
      method: 'POST',
    });

    expect(res.status).toBe(401);
  });

  it('rejects when phase does not match current', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      // Owner verification — finalize checks owner_id directly
      // verifyProjectOwnership: SELECT id FROM projects WHERE id = ? AND owner_id = ?
      ownerQuery(),
      // Current state is BRAINSTORM, trying to finalize PLAN
      {
        pattern: 'SELECT phase, gates, phase_locked FROM project_state',
        result: {
          phase: 'BRAINSTORM',
          gates: JSON.stringify({}),
          phase_locked: 0,
        },
      },
    ]);

    const res = await req('/api/v1/state/proj-1/phases/PLAN/finalize', {
      method: 'POST',
      headers: authHeaders(token),
    });

    // 409 = phase mismatch (current BRAINSTORM != requested PLAN)
    expect(res.status).toBe(409);
    const body = await res.json() as { error: string; currentPhase: string };
    expect(body.error).toContain('Cannot finalize');
    expect(body.currentPhase).toBe('BRAINSTORM');
  });
});
