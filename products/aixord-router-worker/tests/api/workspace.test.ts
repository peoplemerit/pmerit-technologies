/**
 * Workspace API Endpoint Tests
 *
 * Tests the workspace sub-router mounted at /api/v1/projects:
 *   GET    /:projectId/workspace               — Get workspace binding
 *   PUT    /:projectId/workspace               — Create/update binding
 *   DELETE /:projectId/workspace               — Remove binding
 *   GET    /:projectId/workspace/status         — Quick status for ribbon
 *   POST   /:projectId/workspace/confirm-test   — Environment confirmation probes
 *   POST   /:projectId/workspace/setup          — Orchestrated workspace setup
 *   POST   /:projectId/workspace/artifacts      — Record workspace artifacts
 *   GET    /:projectId/scaffold                 — Retrieve scaffold template
 *
 * The sub-router applies requireAuth internally via workspace.use('/*', requireAuth).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types';
import { type MockQueryResult } from '../helpers';
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
  decryptAESGCM: vi.fn().mockResolvedValue('mock-decrypted-token'),
}));

// Mock logger to suppress console output in tests
vi.mock('../../src/utils/logger', () => ({
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock gateRules — triggerGateEvaluation is called after binding mutations
vi.mock('../../src/services/gateRules', () => ({
  triggerGateEvaluation: vi.fn().mockResolvedValue(undefined),
  evaluateAllGates: vi.fn().mockResolvedValue({
    evaluated: [],
    changed: [],
    gates: {},
    phase: 'PLAN',
    gate_details: {},
  }),
}));

// Mock scaffoldTemplates — used by workspace/setup endpoint
vi.mock('../../src/services/scaffoldTemplates', () => ({
  generateScaffoldFromBlueprint: vi.fn().mockResolvedValue({
    template_type: 'spa',
    nodes: [
      { path: 'src/index.ts', type: 'file', content: '// entry' },
      { path: 'src/lib', type: 'directory' },
    ],
  }),
}));

// Mock github-write — used by workspace/setup for WORKSPACE_SYNC mode
vi.mock('../../src/services/github-write', () => ({
  commitFilesToGitHub: vi.fn().mockResolvedValue({
    branch: 'aixord/test-project',
    commit_sha: 'abc1234567890',
    tree_sha: 'tree123',
    files_committed: 1,
    pr_number: null,
    pr_url: null,
  }),
}));

let workspaceRouter: any;

beforeEach(async () => {
  vi.clearAllMocks();
  const mod = await import('../../src/api/workspace');
  workspaceRouter = mod.default;
});

/**
 * Build a test app with the workspace router mounted at the projects path.
 * The router uses requireAuth middleware, so session DB queries are needed.
 * Includes executionCtx mock for waitUntil (used in PUT for gate evaluation).
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

  app.route('/api/v1/projects', workspaceRouter);

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
// GET /:projectId/workspace — Get workspace binding
// ============================================================================
describe('GET /api/v1/projects/:projectId/workspace', () => {
  it('returns workspace binding when it exists', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      {
        pattern: 'SELECT * FROM workspace_bindings WHERE project_id',
        result: {
          id: 'ws-1',
          project_id: 'proj-1',
          folder_name: 'my-project',
          folder_template: 'spa',
          permission_level: 'readwrite',
          scaffold_generated: 1,
          github_connected: 0,
          github_repo: null,
          binding_confirmed: 1,
        },
      },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { binding: { id: string; folder_name: string } };
    expect(body.binding).toBeDefined();
    expect(body.binding.id).toBe('ws-1');
    expect(body.binding.folder_name).toBe('my-project');
  });

  it('returns null binding when no workspace is bound', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM workspace_bindings WHERE project_id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { binding: null };
    expect(body.binding).toBeNull();
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      // ownership check fails — no row returned
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-other/workspace', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('not found');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/workspace');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// PUT /:projectId/workspace — Create/update binding
// ============================================================================
describe('PUT /api/v1/projects/:projectId/workspace', () => {
  it('creates a new workspace binding when none exists', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Check if binding exists — returns null (no existing binding)
      { pattern: 'SELECT id FROM workspace_bindings WHERE project_id', result: null },
      // INSERT new binding
      { pattern: 'INSERT INTO workspace_bindings', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({
        folder_name: 'new-project',
        folder_template: 'monorepo',
        permission_level: 'readwrite',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; updated_at: string };
    expect(body.success).toBe(true);
    expect(body.updated_at).toBeDefined();
  });

  it('updates an existing workspace binding', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Check if binding exists — returns existing
      { pattern: 'SELECT id FROM workspace_bindings WHERE project_id', result: { id: 'ws-1' } },
      // UPDATE existing binding
      { pattern: 'UPDATE workspace_bindings', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({
        folder_name: 'updated-project',
        scaffold_generated: true,
        binding_confirmed: true,
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; updated_at: string };
    expect(body.success).toBe(true);
    expect(body.updated_at).toBeDefined();
  });

  it('accepts scaffold count fields (Gap 2)', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT id FROM workspace_bindings WHERE project_id', result: null },
      { pattern: 'INSERT INTO workspace_bindings', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({
        folder_name: 'scaffold-test',
        scaffold_generated: true,
        scaffold_item_count: 12,
        scaffold_skipped_count: 2,
        scaffold_error_count: 0,
        scaffold_paths_written: ['src/index.ts', 'src/lib/api.ts'],
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('accepts github connection fields', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT id FROM workspace_bindings WHERE project_id', result: { id: 'ws-1' } },
      { pattern: 'UPDATE workspace_bindings', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({
        github_connected: true,
        github_repo: 'user/my-repo',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-other/workspace', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ folder_name: 'test' }),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/workspace', {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({ folder_name: 'test' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// DELETE /:projectId/workspace — Remove binding
// ============================================================================
describe('DELETE /api/v1/projects/:projectId/workspace', () => {
  it('deletes workspace binding and returns success', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'DELETE FROM workspace_bindings WHERE project_id', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('returns success even when no binding existed', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'DELETE FROM workspace_bindings WHERE project_id', runResult: { success: true, changes: 0 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-other/workspace', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/workspace', {
      method: 'DELETE',
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// GET /:projectId/workspace/status — Quick status for ribbon
// ============================================================================
describe('GET /api/v1/projects/:projectId/workspace/status', () => {
  it('returns full status when binding exists', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      {
        pattern: 'SELECT folder_name',
        result: {
          folder_name: 'my-project',
          folder_template: 'monorepo',
          permission_level: 'readwrite',
          scaffold_generated: 1,
          github_connected: 1,
          github_repo: 'user/repo',
          binding_confirmed: 1,
          scaffold_item_count: 10,
          scaffold_skipped_count: 1,
          scaffold_error_count: 0,
          scaffold_generated_at: '2026-01-15T00:00:00Z',
        },
      },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace/status', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      bound: boolean;
      folder_linked: boolean;
      folder_name: string;
      folder_template: string;
      permission_level: string;
      scaffold_generated: boolean;
      github_connected: boolean;
      github_repo: string;
      confirmed: boolean;
      scaffold_item_count: number;
      scaffold_skipped_count: number;
      scaffold_error_count: number;
      scaffold_generated_at: string;
    };
    expect(body.bound).toBe(true);
    expect(body.folder_linked).toBe(true);
    expect(body.folder_name).toBe('my-project');
    expect(body.folder_template).toBe('monorepo');
    expect(body.permission_level).toBe('readwrite');
    expect(body.scaffold_generated).toBe(true);
    expect(body.github_connected).toBe(true);
    expect(body.github_repo).toBe('user/repo');
    expect(body.confirmed).toBe(true);
    expect(body.scaffold_item_count).toBe(10);
    expect(body.scaffold_skipped_count).toBe(1);
    expect(body.scaffold_error_count).toBe(0);
    expect(body.scaffold_generated_at).toBe('2026-01-15T00:00:00Z');
  });

  it('returns unbound status when no binding exists', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT folder_name', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace/status', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      bound: boolean;
      folder_linked: boolean;
      github_connected: boolean;
      confirmed: boolean;
    };
    expect(body.bound).toBe(false);
    expect(body.folder_linked).toBe(false);
    expect(body.github_connected).toBe(false);
    expect(body.confirmed).toBe(false);
  });

  it('returns folder_linked false when folder_name is null', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      {
        pattern: 'SELECT folder_name',
        result: {
          folder_name: null,
          folder_template: null,
          permission_level: 'readwrite',
          scaffold_generated: 0,
          github_connected: 0,
          github_repo: null,
          binding_confirmed: 0,
          scaffold_item_count: null,
          scaffold_skipped_count: null,
          scaffold_error_count: null,
          scaffold_generated_at: null,
        },
      },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace/status', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      bound: boolean;
      folder_linked: boolean;
      scaffold_generated: boolean;
      confirmed: boolean;
      scaffold_item_count: number;
    };
    expect(body.bound).toBe(true);
    expect(body.folder_linked).toBe(false);
    expect(body.scaffold_generated).toBe(false);
    expect(body.confirmed).toBe(false);
    expect(body.scaffold_item_count).toBe(0);
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-other/workspace/status', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/workspace/status');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// POST /:projectId/workspace/confirm-test — Environment confirmation probes
// ============================================================================
describe('POST /api/v1/projects/:projectId/workspace/confirm-test', () => {
  it('runs all environment tests and returns results', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // D1 read test — SELECT projects
      { pattern: 'SELECT id, name FROM projects WHERE id', result: { id: 'proj-1', name: 'Test Project' } },
      // D1 write test — DELETE stale probes
      { pattern: "DELETE FROM env_probes WHERE created_at", runResult: { success: true, changes: 0 } },
      // D1 write test — INSERT probe
      { pattern: 'INSERT INTO env_probes', runResult: { success: true, changes: 1 } },
      // D1 write test — SELECT probe back
      { pattern: 'SELECT id FROM env_probes WHERE id', result: { id: 'probe-1' } },
      // D1 write test — DELETE probe cleanup
      { pattern: 'DELETE FROM env_probes WHERE id', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace/confirm-test', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      project_id: string;
      ran_at: string;
      all_passed: boolean;
      duration_ms: number;
      tests: Array<{
        test_id: string;
        name: string;
        passed: boolean;
        latency_ms: number;
        evidence: Record<string, unknown>;
      }>;
    };
    expect(body.project_id).toBe('proj-1');
    expect(body.ran_at).toBeDefined();
    expect(body.duration_ms).toBeGreaterThanOrEqual(0);
    expect(body.tests).toHaveLength(5);

    // Validate each test is present
    const testIds = body.tests.map(t => t.test_id);
    expect(testIds).toContain('D1_READ');
    expect(testIds).toContain('D1_WRITE');
    expect(testIds).toContain('R2_LIST');
    expect(testIds).toContain('ROUTER');
    expect(testIds).toContain('ENV_CONFIG');

    // D1_READ should pass (we provided a project row)
    const d1Read = body.tests.find(t => t.test_id === 'D1_READ')!;
    expect(d1Read.passed).toBe(true);
    expect(d1Read.evidence).toHaveProperty('project_found', true);

    // ROUTER should pass (ROUTING_TABLE is loaded in the real module)
    const router = body.tests.find(t => t.test_id === 'ROUTER')!;
    expect(router.passed).toBe(true);

    // ENV_CONFIG should pass (test env has all keys)
    const envConfig = body.tests.find(t => t.test_id === 'ENV_CONFIG')!;
    expect(envConfig.passed).toBe(true);
  });

  it('reports D1_READ as failed when project not found by probe', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // D1 read test — project not found in direct probe (ownership check passed separately)
      { pattern: 'SELECT id, name FROM projects WHERE id', result: null },
      // D1 write test queries
      { pattern: "DELETE FROM env_probes WHERE created_at", runResult: { success: true, changes: 0 } },
      { pattern: 'INSERT INTO env_probes', runResult: { success: true, changes: 1 } },
      { pattern: 'SELECT id FROM env_probes WHERE id', result: { id: 'probe-1' } },
      { pattern: 'DELETE FROM env_probes WHERE id', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace/confirm-test', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      all_passed: boolean;
      tests: Array<{ test_id: string; passed: boolean }>;
    };
    const d1Read = body.tests.find(t => t.test_id === 'D1_READ')!;
    expect(d1Read.passed).toBe(false);
    // all_passed should be false since D1_READ failed
    expect(body.all_passed).toBe(false);
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-other/workspace/confirm-test', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/workspace/confirm-test', {
      method: 'POST',
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// POST /:projectId/workspace/setup — Orchestrated workspace setup (CRIT-04)
// ============================================================================
describe('POST /api/v1/projects/:projectId/workspace/setup', () => {
  it('completes full workspace setup with folder and scaffold', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Step 1: Check existing binding
      { pattern: 'SELECT project_id FROM workspace_bindings WHERE project_id', result: null },
      // Step 1: INSERT new workspace binding
      { pattern: 'INSERT INTO workspace_bindings', runResult: { success: true, changes: 1 } },
      // Step 3: Confirm environment
      { pattern: 'UPDATE workspace_bindings SET binding_confirmed', runResult: { success: true, changes: 1 } },
      // Step 4: Scaffold — INSERT artifact
      { pattern: 'INSERT INTO artifacts', runResult: { success: true, changes: 1 } },
      // Step 5: GitHub connection check
      { pattern: 'SELECT repo_owner, repo_name', result: null },
      // Gate evaluation queries (non-blocking)
      { pattern: 'SELECT * FROM project_state', result: { project_id: 'proj-1', phase: 'PLAN', gates: '{}' } },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace/setup', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        folder_name: 'my-new-project',
        auto_scaffold: true,
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      success: boolean;
      steps: Array<{ name: string; status: string; detail?: string }>;
      message: string;
    };
    expect(body.success).toBe(true);
    expect(body.steps).toBeDefined();
    expect(body.steps.length).toBeGreaterThanOrEqual(4);

    // Verify step names
    const stepNames = body.steps.map(s => s.name);
    expect(stepNames).toContain('Link project folder');
    expect(stepNames).toContain('Connect GitHub');
    expect(stepNames).toContain('Confirm environment');
    expect(stepNames).toContain('Generate scaffold');
  });

  it('updates existing binding instead of creating new one', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Step 1: Check existing binding — exists
      { pattern: 'SELECT project_id FROM workspace_bindings WHERE project_id', result: { project_id: 'proj-1' } },
      // Step 1: UPDATE existing workspace binding
      { pattern: 'UPDATE workspace_bindings SET folder_name', runResult: { success: true, changes: 1 } },
      // Step 3: Confirm environment
      { pattern: 'UPDATE workspace_bindings SET binding_confirmed', runResult: { success: true, changes: 1 } },
      // Step 4: Scaffold — INSERT artifact
      { pattern: 'INSERT INTO artifacts', runResult: { success: true, changes: 1 } },
      // Step 5: GitHub connection check
      { pattern: 'SELECT repo_owner, repo_name', result: null },
      // Gate evaluation
      { pattern: 'SELECT * FROM project_state', result: { project_id: 'proj-1', phase: 'PLAN', gates: '{}' } },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace/setup', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ folder_name: 'existing-project' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('skips scaffold when auto_scaffold is false', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT project_id FROM workspace_bindings WHERE project_id', result: null },
      { pattern: 'INSERT INTO workspace_bindings', runResult: { success: true, changes: 1 } },
      { pattern: 'UPDATE workspace_bindings SET binding_confirmed', runResult: { success: true, changes: 1 } },
      // No scaffold queries needed
      { pattern: 'SELECT repo_owner, repo_name', result: null },
      { pattern: 'SELECT * FROM project_state', result: { project_id: 'proj-1', phase: 'PLAN', gates: '{}' } },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace/setup', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ folder_name: 'no-scaffold', auto_scaffold: false }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      success: boolean;
      steps: Array<{ name: string; status: string }>;
    };
    expect(body.success).toBe(true);
    const scaffoldStep = body.steps.find(s => s.name === 'Generate scaffold');
    expect(scaffoldStep?.status).toBe('skipped');
  });

  it('skips GitHub when no github_repo provided', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT project_id FROM workspace_bindings WHERE project_id', result: null },
      { pattern: 'INSERT INTO workspace_bindings', runResult: { success: true, changes: 1 } },
      { pattern: 'UPDATE workspace_bindings SET binding_confirmed', runResult: { success: true, changes: 1 } },
      { pattern: 'INSERT INTO artifacts', runResult: { success: true, changes: 1 } },
      { pattern: 'SELECT repo_owner, repo_name', result: null },
      { pattern: 'SELECT * FROM project_state', result: { project_id: 'proj-1', phase: 'PLAN', gates: '{}' } },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace/setup', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ folder_name: 'no-github' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      steps: Array<{ name: string; status: string; detail?: string }>;
    };
    const ghStep = body.steps.find(s => s.name === 'Connect GitHub');
    expect(ghStep?.status).toBe('skipped');
  });

  it('connects GitHub when github_repo is provided', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT project_id FROM workspace_bindings WHERE project_id', result: null },
      { pattern: 'INSERT INTO workspace_bindings', runResult: { success: true, changes: 1 } },
      // GitHub update
      { pattern: 'UPDATE workspace_bindings SET github_repo', runResult: { success: true, changes: 1 } },
      // Confirm environment
      { pattern: 'UPDATE workspace_bindings SET binding_confirmed', runResult: { success: true, changes: 1 } },
      // Scaffold
      { pattern: 'INSERT INTO artifacts', runResult: { success: true, changes: 1 } },
      // GitHub connection check for commit step
      { pattern: 'SELECT repo_owner, repo_name', result: null },
      { pattern: 'SELECT * FROM project_state', result: { project_id: 'proj-1', phase: 'PLAN', gates: '{}' } },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace/setup', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ folder_name: 'gh-project', github_repo: 'user/repo' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      steps: Array<{ name: string; status: string; detail?: string }>;
    };
    const ghStep = body.steps.find(s => s.name === 'Connect GitHub');
    expect(ghStep?.status).toBe('completed');
    expect(ghStep?.detail).toBe('user/repo');
  });

  it('returns 400 when folder_name is missing', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace/setup', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('folder_name');
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-other/workspace/setup', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ folder_name: 'test' }),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/workspace/setup', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ folder_name: 'test' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// POST /:projectId/workspace/artifacts — Record workspace artifacts (HIGH-03)
// ============================================================================
describe('POST /api/v1/projects/:projectId/workspace/artifacts', () => {
  it('tracks artifacts and returns count', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // INSERT artifact rows
      { pattern: 'INSERT INTO artifacts', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace/artifacts', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        artifacts: [
          { path: 'src/index.ts', size_bytes: 1024, file_type: 'typescript' },
          { path: 'src/lib/api.ts', size_bytes: 2048, file_type: 'typescript' },
          { path: 'README.md', size_bytes: 512, file_type: 'markdown' },
        ],
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { tracked: number; total: number };
    expect(body.tracked).toBe(3);
    expect(body.total).toBe(3);
  });

  it('returns 400 for empty artifacts array', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace/artifacts', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ artifacts: [] }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('artifacts array required');
  });

  it('returns 400 when artifacts field is missing', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace/artifacts', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-other/workspace/artifacts', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ artifacts: [{ path: 'test.ts' }] }),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/workspace/artifacts', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ artifacts: [{ path: 'test.ts' }] }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// GET /:projectId/scaffold — Retrieve scaffold template
// ============================================================================
describe('GET /api/v1/projects/:projectId/scaffold', () => {
  it('returns scaffold template when it exists', async () => {
    const { token } = await createTestSession();
    const scaffoldContent = JSON.stringify({
      template_type: 'spa',
      nodes: [
        { path: 'src/index.ts', type: 'file', content: '// entry' },
        { path: 'package.json', type: 'file', content: '{}' },
      ],
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      {
        pattern: "SELECT content FROM artifacts WHERE project_id",
        result: { content: scaffoldContent },
      },
    ]);

    const res = await req('/api/v1/projects/proj-1/scaffold', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      template_type: string;
      nodes: Array<{ path: string; type: string }>;
    };
    expect(body.template_type).toBe('spa');
    expect(body.nodes).toHaveLength(2);
    expect(body.nodes[0].path).toBe('src/index.ts');
  });

  it('returns 404 when no scaffold exists', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: "SELECT content FROM artifacts WHERE project_id", result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/scaffold', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('No scaffold template found');
  });

  it('returns 500 for invalid scaffold JSON', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      {
        pattern: "SELECT content FROM artifacts WHERE project_id",
        result: { content: 'not-valid-json{{{' },
      },
    ]);

    const res = await req('/api/v1/projects/proj-1/scaffold', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(500);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Invalid scaffold data');
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-other/scaffold', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/scaffold');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// S1 Vertical Slice — Full Chain Tests
// ============================================================================
describe('S1: Workspace binding stores all scaffold + push fields', () => {
  it('stores scaffold_item_count, scaffold_skipped_count, scaffold_error_count on binding', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT id FROM workspace_bindings WHERE project_id', result: null },
      { pattern: 'INSERT INTO workspace_bindings', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({
        folder_name: 'PantryApp',
        folder_template: 'web-app',
        permission_level: 'readwrite',
        scaffold_generated: true,
        scaffold_item_count: 15,
        scaffold_skipped_count: 3,
        scaffold_error_count: 0,
        binding_confirmed: true,
        github_connected: true,
        github_repo: 'user/pantry-app',
        github_push_count: 15,
        github_push_sha: 'abc123def456',
        github_push_branch: 'aixord/pantry-app',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; updated_at: string };
    expect(body.success).toBe(true);
    expect(body.updated_at).toBeDefined();
  });

  it('stores all fields on update to existing binding', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT id FROM workspace_bindings WHERE project_id', result: { id: 'ws-1' } },
      { pattern: 'UPDATE workspace_bindings', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/workspace', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({
        scaffold_generated: true,
        scaffold_item_count: 22,
        scaffold_skipped_count: 0,
        scaffold_error_count: 0,
        github_push_count: 22,
        github_push_sha: 'sha256abc',
        github_push_branch: 'aixord/my-project',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });
});
