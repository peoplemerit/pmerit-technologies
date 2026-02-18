/**
 * Blueprint API Endpoint Tests
 *
 * Tests the blueprint sub-router mounted at /api/v1/projects:
 *   POST   /:projectId/blueprint/scopes             — Create scope
 *   GET    /:projectId/blueprint/scopes              — List scopes
 *   GET    /:projectId/blueprint/scopes/:scopeId     — Get single scope
 *   PUT    /:projectId/blueprint/scopes/:scopeId     — Update scope
 *   DELETE /:projectId/blueprint/scopes/:scopeId     — Delete scope
 *   POST   /:projectId/blueprint/deliverables        — Create deliverable
 *   GET    /:projectId/blueprint/deliverables        — List deliverables
 *   PUT    /:projectId/blueprint/deliverables/:id    — Update deliverable
 *   DELETE /:projectId/blueprint/deliverables/:id    — Delete deliverable
 *   POST   /:projectId/blueprint/validate            — Integrity validation
 *   POST   /:projectId/blueprint/import              — Import from plan artifact
 *
 * The sub-router applies requireAuth internally via blueprint.use('/*', requireAuth).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types';
import { type MockQueryResult, makeScope, makeDeliverable, genId } from '../helpers';
import { createMockEnv, createTestSession, jsonHeaders, authHeaders } from '../test-app';

// Mock crypto for requireAuth middleware's token hashing
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

// Mock gateRules — triggerGateEvaluation is called after scope/deliverable mutations
vi.mock('../../src/services/gateRules', () => ({
  triggerGateEvaluation: vi.fn().mockResolvedValue(undefined),
  evaluateAllGates: vi.fn().mockResolvedValue({
    evaluated: [],
    changed: [],
    gates: {},
    phase: 'BLUEPRINT',
    gate_details: {},
  }),
}));

// Mock readinessEngine — computeScopeReadiness is called on deliverable status change
vi.mock('../../src/services/readinessEngine', () => ({
  computeScopeReadiness: vi.fn().mockResolvedValue(undefined),
}));

// Mock scaffoldTemplates — used by import endpoint
vi.mock('../../src/services/scaffoldTemplates', () => ({
  generateScaffoldFromBlueprint: vi.fn().mockResolvedValue({
    template_type: 'spa',
    nodes: [{ path: 'src/index.ts', type: 'entry' }],
  }),
}));

let blueprintRouter: any;

beforeEach(async () => {
  vi.clearAllMocks();
  const mod = await import('../../src/api/blueprint');
  blueprintRouter = mod.default;
});

/**
 * Build a test app with the blueprint router mounted at the projects path.
 * The router uses requireAuth middleware, so session DB queries are needed.
 */
function buildApp(queries: MockQueryResult[] = []) {
  const env = createMockEnv(queries);
  const app = new Hono<{ Bindings: Env }>();

  // Add executionCtx mock to the app
  app.use('/*', async (c, next) => {
    Object.defineProperty(c, 'executionCtx', {
      get: () => ({ waitUntil: vi.fn() }),
      configurable: true,
    });
    await next();
  });

  app.route('/api/v1/projects', blueprintRouter);

  const req = (path: string, init?: RequestInit) =>
    app.request(path, init, env);

  return { app, env, req };
}

/** Auth session query for requireAuth — token_hash based */
function sessionQuery(userId = 'user-1'): MockQueryResult {
  return { pattern: 'token_hash', result: { user_id: userId, id: 'sess-1', email: 'user@test.com' } };
}

/** Project ownership verification query */
function ownerQuery(projectId = 'proj-1', userId = 'user-1'): MockQueryResult {
  return { pattern: 'SELECT id FROM projects WHERE id', result: { id: projectId, owner_id: userId } };
}

// ============================================================================
// SCOPES — Create
// ============================================================================
describe('POST /api/v1/projects/:projectId/blueprint/scopes', () => {
  it('creates a tier-1 scope and returns 201', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // INSERT blueprint_scopes
      { pattern: 'INSERT INTO blueprint_scopes', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/scopes', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'Auth Module', boundary: 'User authentication and authorization' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { id: string; name: string; tier: number; status: string };
    expect(body.id).toBeDefined();
    expect(body.name).toBe('Auth Module');
    expect(body.tier).toBe(1);
    expect(body.status).toBe('DRAFT');
    expect(body.parent_scope_id).toBeNull();
  });

  it('creates a tier-2 sub-scope under a valid parent', async () => {
    const { token } = await createTestSession();
    const parentScopeId = genId('scope');

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Parent scope lookup
      { pattern: 'SELECT id, tier FROM blueprint_scopes WHERE id', result: { id: parentScopeId, tier: 1 } },
      // INSERT sub-scope
      { pattern: 'INSERT INTO blueprint_scopes', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/scopes', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'OAuth Provider', parent_scope_id: parentScopeId }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { tier: number; parent_scope_id: string };
    expect(body.tier).toBe(2);
    expect(body.parent_scope_id).toBe(parentScopeId);
  });

  it('returns 400 when name is missing', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/scopes', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ boundary: 'No name provided' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('name');
  });

  it('returns 404 when parent_scope_id does not exist', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Parent scope not found
      { pattern: 'SELECT id, tier FROM blueprint_scopes WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/scopes', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'Orphan Sub-Scope', parent_scope_id: 'nonexistent' }),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Parent scope not found');
  });

  it('returns 400 when parent scope is tier-2 (no nesting beyond tier 2)', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Parent is already tier-2
      { pattern: 'SELECT id, tier FROM blueprint_scopes WHERE id', result: { id: 'scope-t2', tier: 2 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/scopes', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'Too Deep', parent_scope_id: 'scope-t2' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('tier-1');
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      // Ownership fails
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/not-my-proj/blueprint/scopes', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'Test' }),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/blueprint/scopes', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ name: 'Test' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// SCOPES — List
// ============================================================================
describe('GET /api/v1/projects/:projectId/blueprint/scopes', () => {
  it('returns all scopes as a flat list', async () => {
    const { token } = await createTestSession();
    const scope1 = makeScope({ id: 'scope-1', project_id: 'proj-1', name: 'Auth' });
    const scope2 = makeScope({ id: 'scope-2', project_id: 'proj-1', name: 'Dashboard' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM blueprint_scopes WHERE project_id', result: [scope1, scope2] },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/scopes', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { scopes: unknown[]; total: number };
    expect(body.scopes).toHaveLength(2);
    expect(body.total).toBe(2);
  });

  it('returns empty list when no scopes exist', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM blueprint_scopes WHERE project_id', result: [] },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/scopes', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { scopes: unknown[]; total: number };
    expect(body.scopes).toEqual([]);
    expect(body.total).toBe(0);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/blueprint/scopes');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// SCOPES — Get Single
// ============================================================================
describe('GET /api/v1/projects/:projectId/blueprint/scopes/:scopeId', () => {
  it('returns scope with deliverables and children', async () => {
    const { token } = await createTestSession();
    const scope = makeScope({ id: 'scope-1', project_id: 'proj-1', name: 'Auth Module' });
    const deliverable = makeDeliverable({ id: 'del-1', scope_id: 'scope-1', name: 'Login API' });
    const childScope = makeScope({ id: 'scope-1a', project_id: 'proj-1', name: 'OAuth Sub-scope' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Scope lookup
      { pattern: 'SELECT * FROM blueprint_scopes WHERE id', result: scope },
      // Deliverables under this scope
      { pattern: 'SELECT * FROM blueprint_deliverables WHERE scope_id', result: [deliverable] },
      // Child scopes
      { pattern: 'SELECT * FROM blueprint_scopes WHERE parent_scope_id', result: [childScope] },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/scopes/scope-1', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      id: string; name: string;
      deliverables: Array<{ id: string }>;
      children: Array<{ id: string }>;
    };
    expect(body.id).toBe('scope-1');
    expect(body.name).toBe('Auth Module');
    expect(body.deliverables).toHaveLength(1);
    expect(body.deliverables[0].id).toBe('del-1');
    expect(body.children).toHaveLength(1);
    expect(body.children[0].id).toBe('scope-1a');
  });

  it('returns 404 for non-existent scope', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM blueprint_scopes WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/scopes/nonexistent', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Scope not found');
  });
});

// ============================================================================
// SCOPES — Update
// ============================================================================
describe('PUT /api/v1/projects/:projectId/blueprint/scopes/:scopeId', () => {
  it('updates scope fields and returns updated_at', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // UPDATE blueprint_scopes
      { pattern: 'UPDATE blueprint_scopes SET', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/scopes/scope-1', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'Updated Auth', purpose: 'Secure user login', status: 'IN_PROGRESS' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { id: string; updated_at: string };
    expect(body.id).toBe('scope-1');
    expect(body.updated_at).toBeDefined();
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/not-mine/blueprint/scopes/scope-1', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'Updated' }),
    });

    expect(res.status).toBe(404);
  });
});

// ============================================================================
// SCOPES — Delete
// ============================================================================
describe('DELETE /api/v1/projects/:projectId/blueprint/scopes/:scopeId', () => {
  it('deletes scope, its deliverables, and child scopes', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // DELETE deliverables under this scope
      { pattern: 'DELETE FROM blueprint_deliverables WHERE scope_id', runResult: { success: true, changes: 2 } },
      // Find child scopes
      { pattern: 'SELECT id FROM blueprint_scopes WHERE parent_scope_id', result: [{ id: 'child-1' }] },
      // DELETE child scope deliverables (loop iteration for child-1)
      // Note: The same DELETE pattern matches for child deliverables
      // DELETE child scopes
      { pattern: 'DELETE FROM blueprint_scopes WHERE parent_scope_id', runResult: { success: true, changes: 1 } },
      // DELETE the scope itself
      { pattern: 'DELETE FROM blueprint_scopes WHERE id', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/scopes/scope-1', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { deleted: boolean };
    expect(body.deleted).toBe(true);
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/not-mine/blueprint/scopes/scope-1', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/blueprint/scopes/scope-1', {
      method: 'DELETE',
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// DELIVERABLES — Create
// ============================================================================
describe('POST /api/v1/projects/:projectId/blueprint/deliverables', () => {
  it('creates a deliverable under a valid scope and returns 201', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Scope exists check
      { pattern: 'SELECT id FROM blueprint_scopes WHERE id', result: { id: 'scope-1' } },
      // INSERT deliverable
      { pattern: 'INSERT INTO blueprint_deliverables', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/deliverables', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        scope_id: 'scope-1',
        name: 'Login API',
        description: 'REST endpoint for user login',
        dod_evidence_spec: 'Unit tests with 80% coverage',
        dod_verification_method: 'CI pipeline green',
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { id: string; name: string; scope_id: string; status: string };
    expect(body.id).toBeDefined();
    expect(body.name).toBe('Login API');
    expect(body.scope_id).toBe('scope-1');
    expect(body.status).toBe('DRAFT');
  });

  it('returns 400 when scope_id is missing', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/deliverables', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'No Scope' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('scope_id');
  });

  it('returns 400 when name is missing', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/deliverables', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ scope_id: 'scope-1' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('name');
  });

  it('returns 404 when scope does not exist', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Scope not found
      { pattern: 'SELECT id FROM blueprint_scopes WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/deliverables', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ scope_id: 'nonexistent', name: 'Orphan Del' }),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Scope not found');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/blueprint/deliverables', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ scope_id: 'scope-1', name: 'Test' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// DELIVERABLES — List
// ============================================================================
describe('GET /api/v1/projects/:projectId/blueprint/deliverables', () => {
  it('returns all deliverables for a project', async () => {
    const { token } = await createTestSession();
    const del1 = makeDeliverable({ id: 'del-1', name: 'Login API' });
    const del2 = makeDeliverable({ id: 'del-2', name: 'Signup API' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM blueprint_deliverables WHERE project_id', result: [del1, del2] },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/deliverables', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { deliverables: unknown[]; total: number };
    expect(body.deliverables).toHaveLength(2);
    expect(body.total).toBe(2);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/blueprint/deliverables');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// DELIVERABLES — Update
// ============================================================================
describe('PUT /api/v1/projects/:projectId/blueprint/deliverables/:deliverableId', () => {
  it('updates deliverable fields and returns updated_at', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // UPDATE blueprint_deliverables
      { pattern: 'UPDATE blueprint_deliverables SET', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/deliverables/del-1', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({
        name: 'Updated Login API',
        description: 'Enhanced login with MFA',
        dod_evidence_spec: 'Integration tests passing',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { id: string; updated_at: string };
    expect(body.id).toBe('del-1');
    expect(body.updated_at).toBeDefined();
  });

  it('triggers readiness recomputation when status changes', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // UPDATE deliverable
      { pattern: 'UPDATE blueprint_deliverables SET', runResult: { success: true } },
      // Readiness lookup for scope_id after status change
      { pattern: 'SELECT scope_id FROM blueprint_deliverables WHERE id', result: { scope_id: 'scope-1' } },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/deliverables/del-1', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ status: 'IN_PROGRESS' }),
    });

    expect(res.status).toBe(200);
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/not-mine/blueprint/deliverables/del-1', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'Updated' }),
    });

    expect(res.status).toBe(404);
  });
});

// ============================================================================
// DELIVERABLES — Delete
// ============================================================================
describe('DELETE /api/v1/projects/:projectId/blueprint/deliverables/:deliverableId', () => {
  it('deletes a deliverable and returns success', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // DELETE deliverable
      { pattern: 'DELETE FROM blueprint_deliverables WHERE id', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/deliverables/del-1', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { deleted: boolean };
    expect(body.deleted).toBe(true);
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/not-mine/blueprint/deliverables/del-1', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/blueprint/deliverables/del-1', {
      method: 'DELETE',
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// VALIDATE — Integrity Validation (5 checks)
// ============================================================================
describe('POST /api/v1/projects/:projectId/blueprint/validate', () => {
  it('returns all-passed when blueprint is complete', async () => {
    const { token } = await createTestSession();

    const scopeData = {
      id: 'scope-1', tier: 1, name: 'Auth', purpose: 'Handle authentication',
      assumption_status: 'CONFIRMED', parent_scope_id: null,
    };
    const deliverableData = {
      id: 'del-1', scope_id: 'scope-1', name: 'Login API',
      upstream_deps: '[]', downstream_deps: '[]',
      dod_evidence_spec: 'Tests passing', dod_verification_method: 'CI pipeline',
    };
    const projectData = { id: 'proj-1', name: 'My App', description: 'A complete project' };

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Load scopes
      { pattern: 'SELECT * FROM blueprint_scopes WHERE project_id', result: [scopeData] },
      // Load deliverables
      { pattern: 'SELECT * FROM blueprint_deliverables WHERE project_id', result: [deliverableData] },
      // Load project
      { pattern: 'SELECT * FROM projects WHERE id', result: projectData },
      // INSERT integrity report
      { pattern: 'INSERT INTO blueprint_integrity_reports', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/validate', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      all_passed: boolean;
      checks: {
        formula: { passed: boolean; detail: string };
        structural: { passed: boolean };
        dag: { passed: boolean };
        deliverable: { passed: boolean };
        assumption: { passed: boolean };
      };
      totals: { scopes: number; deliverables: number };
    };
    expect(body.all_passed).toBe(true);
    expect(body.checks.formula.passed).toBe(true);
    expect(body.checks.structural.passed).toBe(true);
    expect(body.checks.dag.passed).toBe(true);
    expect(body.checks.deliverable.passed).toBe(true);
    expect(body.checks.assumption.passed).toBe(true);
    expect(body.totals.scopes).toBe(1);
    expect(body.totals.deliverables).toBe(1);
  });

  it('fails formula check when scopes lack purpose', async () => {
    const { token } = await createTestSession();

    const scopeNoPurpose = {
      id: 'scope-1', tier: 1, name: 'Auth', purpose: null,
      assumption_status: 'OPEN', parent_scope_id: null,
    };
    const deliverableData = {
      id: 'del-1', scope_id: 'scope-1', name: 'Login API',
      upstream_deps: '[]', downstream_deps: '[]',
      dod_evidence_spec: 'Tests', dod_verification_method: 'CI',
    };

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM blueprint_scopes WHERE project_id', result: [scopeNoPurpose] },
      { pattern: 'SELECT * FROM blueprint_deliverables WHERE project_id', result: [deliverableData] },
      { pattern: 'SELECT * FROM projects WHERE id', result: { id: 'proj-1', name: 'App', description: 'Yes' } },
      { pattern: 'INSERT INTO blueprint_integrity_reports', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/validate', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { all_passed: boolean; checks: { formula: { passed: boolean; detail: string } } };
    expect(body.all_passed).toBe(false);
    expect(body.checks.formula.passed).toBe(false);
    expect(body.checks.formula.detail).toContain('missing purpose');
  });

  it('fails deliverable check when DoD is incomplete', async () => {
    const { token } = await createTestSession();

    const scopeData = {
      id: 'scope-1', tier: 1, name: 'Auth', purpose: 'Auth purpose',
      assumption_status: 'OPEN', parent_scope_id: null,
    };
    // Deliverable missing dod_evidence_spec
    const deliverableMissingDoD = {
      id: 'del-1', scope_id: 'scope-1', name: 'Login API',
      upstream_deps: '[]', downstream_deps: '[]',
      dod_evidence_spec: null, dod_verification_method: null,
    };

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM blueprint_scopes WHERE project_id', result: [scopeData] },
      { pattern: 'SELECT * FROM blueprint_deliverables WHERE project_id', result: [deliverableMissingDoD] },
      { pattern: 'SELECT * FROM projects WHERE id', result: { id: 'proj-1', name: 'App', description: 'Yes' } },
      { pattern: 'INSERT INTO blueprint_integrity_reports', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/validate', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { all_passed: boolean; checks: { deliverable: { passed: boolean; detail: string } } };
    expect(body.all_passed).toBe(false);
    expect(body.checks.deliverable.passed).toBe(false);
    expect(body.checks.deliverable.detail).toContain('Login API');
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/not-mine/blueprint/validate', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/blueprint/validate', {
      method: 'POST',
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// IMPORT — Atomic blueprint population from AI plan artifact
// ============================================================================
describe('POST /api/v1/projects/:projectId/blueprint/import', () => {
  it('imports scopes and deliverables from plan artifact and returns 201', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // DELETE existing DRAFT deliverables
      { pattern: "DELETE FROM blueprint_deliverables WHERE project_id", runResult: { success: true } },
      // DELETE existing DRAFT scopes
      { pattern: "DELETE FROM blueprint_scopes WHERE project_id", runResult: { success: true } },
      // INSERT scope
      { pattern: 'INSERT INTO blueprint_scopes', runResult: { success: true, changes: 1 } },
      // INSERT deliverables
      { pattern: 'INSERT INTO blueprint_deliverables', runResult: { success: true, changes: 1 } },
      // INSERT artifacts (scaffold)
      { pattern: 'INSERT INTO artifacts', runResult: { success: true, changes: 1 } },
      // Engineering skeleton queries (firstScope lookup returns null — non-blocking)
      { pattern: 'SELECT title, description FROM blueprint_scopes', result: null },
    ]);

    const importPayload = {
      scopes: [
        {
          name: 'Authentication',
          purpose: 'Handle user identity',
          boundary: 'Login, signup, token management',
          assumptions: ['Users have email addresses'],
          deliverables: [
            {
              name: 'Login Endpoint',
              description: 'POST /auth/login',
              dod_evidence_spec: 'Returns JWT on success',
              dod_verification_method: 'Integration tests',
            },
            {
              name: 'Signup Endpoint',
              description: 'POST /auth/signup',
              dod_evidence_spec: 'Creates user in DB',
              dod_verification_method: 'Unit tests',
            },
          ],
        },
      ],
      selected_option: 'Option A',
      milestones: ['MVP', 'Beta'],
      tech_stack: ['TypeScript', 'Hono', 'D1'],
      risks: ['Scope creep'],
    };

    const res = await req('/api/v1/projects/proj-1/blueprint/import', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(importPayload),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as {
      success: boolean;
      imported: { scopes: number; deliverables: number };
      scope_ids: string[];
      deliverable_ids: string[];
    };
    expect(body.success).toBe(true);
    expect(body.imported.scopes).toBe(1);
    expect(body.imported.deliverables).toBe(2);
    expect(body.scope_ids).toHaveLength(1);
    expect(body.deliverable_ids).toHaveLength(2);
  });

  it('returns 400 when no scopes are provided', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/import', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ scopes: [] }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('At least 1 scope');
  });

  it('returns 400 when scopes exist but no deliverables across any scope', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/import', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        scopes: [
          { name: 'Empty Scope', deliverables: [] },
        ],
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('At least 1 deliverable');
  });

  it('imports with WU initialization when total_wu is provided', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: "DELETE FROM blueprint_deliverables WHERE project_id", runResult: { success: true } },
      { pattern: "DELETE FROM blueprint_scopes WHERE project_id", runResult: { success: true } },
      { pattern: 'INSERT INTO blueprint_scopes', runResult: { success: true, changes: 1 } },
      { pattern: 'INSERT INTO blueprint_deliverables', runResult: { success: true, changes: 1 } },
      // WU check — no existing WU
      { pattern: 'SELECT execution_total_wu FROM projects WHERE id', result: { execution_total_wu: 0 } },
      // UPDATE project WU budget
      { pattern: 'UPDATE projects SET execution_total_wu', runResult: { success: true } },
      // UPDATE scope WU allocation
      { pattern: 'UPDATE blueprint_scopes SET allocated_wu', runResult: { success: true } },
      // INSERT wu_audit_log
      { pattern: 'INSERT INTO wu_audit_log', runResult: { success: true } },
      // Session event for plan metadata
      { pattern: 'INSERT INTO session_events', runResult: { success: true } },
      // Scaffold artifact
      { pattern: 'INSERT INTO artifacts', runResult: { success: true } },
      // Engineering skeleton
      { pattern: 'SELECT title, description FROM blueprint_scopes', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/blueprint/import', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        scopes: [{
          name: 'Core',
          deliverables: [{ name: 'Task 1', description: 'Do the thing' }],
        }],
        total_wu: 100,
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { wu: { total_wu: number; wu_per_scope: number; scopes_allocated: number } | null };
    expect(body.wu).not.toBeNull();
    expect(body.wu!.total_wu).toBe(100);
    expect(body.wu!.scopes_allocated).toBe(1);
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/not-mine/blueprint/import', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ scopes: [{ name: 'Test', deliverables: [{ name: 'D1' }] }] }),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/blueprint/import', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ scopes: [] }),
    });

    expect(res.status).toBe(401);
  });
});
