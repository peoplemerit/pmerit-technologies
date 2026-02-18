/**
 * Projects API Endpoint Tests
 *
 * Tests the projects sub-router mounted at /api/v1/projects:
 *   POST   /api/v1/projects         — Create project
 *   GET    /api/v1/projects          — List user projects
 *   GET    /api/v1/projects/:id      — Get single project
 *   PUT    /api/v1/projects/:id      — Update project
 *   DELETE /api/v1/projects/:id      — Delete project (cascading)
 *
 * The sub-router applies requireAuth internally via projects.use('/*', requireAuth).
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
}));

let projectsRouter: any;

beforeEach(async () => {
  vi.clearAllMocks();
  const mod = await import('../../src/api/projects');
  projectsRouter = mod.default;
});

/**
 * Build a test app with the projects router.
 * The router has its own requireAuth middleware, so session DB queries are needed.
 */
function buildApp(queries: MockQueryResult[] = []) {
  const env = createMockEnv(queries);
  const app = new Hono<{ Bindings: Env }>();
  app.route('/api/v1/projects', projectsRouter);

  const req = (path: string, init?: RequestInit) =>
    app.request(path, init, env);

  return { app, env, req };
}

/** Session lookup query for requireAuth — token_hash based */
function sessionQuery(userId = 'user-1', email = 'user@test.com'): MockQueryResult {
  return {
    pattern: 'token_hash',
    result: { user_id: userId, id: 'sess-1', email },
  };
}

// ============================================================================
// Create Project Tests
// ============================================================================
describe('POST /api/v1/projects', () => {
  it('creates a project and returns 201', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      // INSERT project
      { pattern: 'INSERT INTO projects', runResult: { success: true, changes: 1 } },
      // INSERT project_state
      { pattern: 'INSERT INTO project_state', runResult: { success: true, changes: 1 } },
      // INSERT data_classification
      { pattern: 'INSERT INTO data_classification', runResult: { success: true, changes: 1 } },
      // INSERT security_gates
      { pattern: 'INSERT INTO security_gates', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'Test Project', objective: 'Build something' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as {
      id: string; name: string; objective: string;
      reality_classification: string; project_type: string;
    };
    expect(body.id).toBeDefined();
    expect(body.name).toBe('Test Project');
    expect(body.objective).toBe('Build something');
    expect(body.reality_classification).toBe('GREENFIELD');
    expect(body.project_type).toBe('software');
  });

  it('defaults project_type to software for unknown types', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'INSERT INTO projects', runResult: { success: true, changes: 1 } },
      { pattern: 'INSERT INTO project_state', runResult: { success: true, changes: 1 } },
      { pattern: 'INSERT INTO data_classification', runResult: { success: true, changes: 1 } },
      { pattern: 'INSERT INTO security_gates', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'Test', project_type: 'invalid_type' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { project_type: string };
    expect(body.project_type).toBe('software');
  });

  it('accepts valid project types', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'INSERT INTO projects', runResult: { success: true, changes: 1 } },
      { pattern: 'INSERT INTO project_state', runResult: { success: true, changes: 1 } },
      { pattern: 'INSERT INTO data_classification', runResult: { success: true, changes: 1 } },
      { pattern: 'INSERT INTO security_gates', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'Research Project', project_type: 'research' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { project_type: string };
    expect(body.project_type).toBe('research');
  });

  it('returns 400 for missing name', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([sessionQuery()]);

    const res = await req('/api/v1/projects', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ objective: 'No name provided' }),
    });

    // validateBody schema requires name — returns 400
    expect(res.status).toBe(400);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ name: 'Test' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// List Projects Tests
// ============================================================================
describe('GET /api/v1/projects', () => {
  it('returns user projects', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      {
        pattern: 'SELECT * FROM projects WHERE owner_id',
        result: [
          { id: 'proj-1', name: 'Project 1', owner_id: 'user-1' },
          { id: 'proj-2', name: 'Project 2', owner_id: 'user-1' },
        ],
      },
    ]);

    const res = await req('/api/v1/projects', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { projects: Array<{ id: string; name: string }> };
    expect(body.projects).toHaveLength(2);
    expect(body.projects[0].name).toBe('Project 1');
  });

  it('returns empty array when user has no projects', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT * FROM projects WHERE owner_id', result: [] },
    ]);

    const res = await req('/api/v1/projects', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { projects: unknown[] };
    expect(body.projects).toEqual([]);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Get Single Project Tests
// ============================================================================
describe('GET /api/v1/projects/:id', () => {
  it('returns project for valid ID', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      {
        pattern: 'SELECT * FROM projects WHERE id',
        result: { id: 'proj-1', name: 'My Project', owner_id: 'user-1', objective: 'Build it' },
      },
    ]);

    const res = await req('/api/v1/projects/proj-1', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { id: string; name: string };
    expect(body.id).toBe('proj-1');
    expect(body.name).toBe('My Project');
  });

  it('returns 404 for non-existent project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT * FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/nonexistent', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('not found');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Update Project Tests
// ============================================================================
describe('PUT /api/v1/projects/:id', () => {
  it('updates project name and objective', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      // Verify ownership
      { pattern: 'SELECT id FROM projects WHERE id', result: { id: 'proj-1' } },
      // UPDATE
      { pattern: 'UPDATE projects', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'Updated Name', objective: 'New objective' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; updated_at: string };
    expect(body.success).toBe(true);
    expect(body.updated_at).toBeDefined();
  });

  it('returns 404 for non-existent project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/nonexistent', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'Updated' }),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1', {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({ name: 'Updated' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Delete Project Tests
// ============================================================================
describe('DELETE /api/v1/projects/:id', () => {
  it('deletes project with cascading child cleanup', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      // Verify ownership
      { pattern: 'SELECT id FROM projects WHERE id', result: { id: 'proj-1' } },
      // All batch DELETE statements — mock DB handles these via run()
      { pattern: 'DELETE FROM', runResult: { success: true, changes: 0 } },
    ]);

    const res = await req('/api/v1/projects/proj-1', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('returns 404 for non-existent project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/nonexistent', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1', {
      method: 'DELETE',
    });

    expect(res.status).toBe(401);
  });
});
