/**
 * Assignments API Endpoint Tests — TDL Lifecycle
 *
 * Tests the assignments sub-router mounted at /api/v1/projects:
 *
 *   CRUD:
 *     POST   /:projectId/assignments              — Create assignment
 *     GET    /:projectId/assignments               — List assignments
 *     GET    /:projectId/assignments/:id            — Get single assignment
 *     PUT    /:projectId/assignments/:id            — Update assignment
 *     DELETE /:projectId/assignments/:id            — Remove assignment
 *
 *   Lifecycle:
 *     POST   /:projectId/assignments/:id/start     — AI begins work
 *     POST   /:projectId/assignments/:id/progress  — AI updates progress
 *     POST   /:projectId/assignments/:id/submit    — AI submits for review
 *     POST   /:projectId/assignments/:id/accept    — Director accepts
 *     POST   /:projectId/assignments/:id/reject    — Director rejects
 *     POST   /:projectId/assignments/:id/block     — AI reports blocker
 *
 *   Escalation:
 *     POST   /:projectId/assignments/:id/escalate  — AI creates escalation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types';
import { type MockQueryResult, makeAssignment, genId } from '../helpers';
import { createMockEnv, createTestSession, authHeaders, jsonHeaders } from '../test-app';

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

let assignmentsRouter: any;
let token: string;
let tokenHash: string;

beforeEach(async () => {
  vi.clearAllMocks();
  const session = await createTestSession();
  token = session.token;
  tokenHash = session.tokenHash;
  const mod = await import('../../src/api/assignments');
  assignmentsRouter = mod.default;
});

// ── Helpers ──

/** Session lookup for requireAuth (token_hash based) */
function sessionQuery(): MockQueryResult {
  return { pattern: 'token_hash', result: { user_id: 'user-1', id: 'sess-1', email: 'test@test.com' } };
}

/** Project ownership verification for verifyProjectOwnership */
function ownershipQuery(projectId = 'proj-1'): MockQueryResult {
  return { pattern: 'SELECT id FROM projects WHERE id', result: { id: projectId, owner_id: 'user-1' } };
}

/** Standard auth + ownership queries that every authenticated endpoint needs */
function authQueries(projectId = 'proj-1'): MockQueryResult[] {
  return [sessionQuery(), ownershipQuery(projectId)];
}

function buildApp(queries: MockQueryResult[] = []) {
  const env = createMockEnv(queries);
  const app = new Hono<{ Bindings: Env }>();
  app.route('/api/v1/projects', assignmentsRouter);
  const req = (path: string, init?: RequestInit) => app.request(path, init, env);
  return { app, env, req };
}

// ============================================================================
// CREATE ASSIGNMENT
// ============================================================================
describe('POST /api/v1/projects/:projectId/assignments', () => {
  it('creates an assignment and returns 201', async () => {
    const assignment = makeAssignment({
      id: 'assign-1', project_id: 'proj-1', deliverable_id: 'deliv-1', status: 'ASSIGNED',
    });

    const { req } = buildApp([
      ...authQueries(),
      // deliverable exists
      { pattern: 'SELECT id, name, status FROM blueprint_deliverables WHERE id', result: { id: 'deliv-1', name: 'Setup DB', status: 'READY' } },
      // upstream deps check
      { pattern: 'SELECT upstream_deps FROM blueprint_deliverables', result: { upstream_deps: '[]' } },
      // no existing active assignment
      { pattern: 'SELECT id FROM task_assignments WHERE deliverable_id', result: null },
      // INSERT
      { pattern: 'INSERT INTO task_assignments', runResult: { success: true, changes: 1 } },
      // UPDATE deliverable status to IN_PROGRESS
      { pattern: 'UPDATE blueprint_deliverables', runResult: { success: true } },
      // decision ledger
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
      // re-fetch created assignment
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: assignment },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ deliverable_id: 'deliv-1', priority: 'P1' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body.id).toBe('assign-1');
    expect(body.status).toBe('ASSIGNED');
  });

  it('returns 400 when deliverable_id is missing', async () => {
    const { req } = buildApp([...authQueries()]);

    const res = await req('/api/v1/projects/proj-1/assignments', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ priority: 'P1' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('deliverable_id');
  });

  it('returns 404 when deliverable not found', async () => {
    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT id, name, status FROM blueprint_deliverables WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ deliverable_id: 'nonexistent' }),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Deliverable not found');
  });

  it('returns 409 when deliverable already has an active assignment', async () => {
    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT id, name, status FROM blueprint_deliverables WHERE id', result: { id: 'deliv-1', name: 'Setup DB', status: 'READY' } },
      { pattern: 'SELECT upstream_deps FROM blueprint_deliverables', result: { upstream_deps: '[]' } },
      // existing active assignment found (SQL has newline between table and WHERE — use regex)
      { pattern: /SELECT id FROM task_assignments\s+WHERE deliverable_id/, result: { id: 'existing-assign' } },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ deliverable_id: 'deliv-1' }),
    });

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('already has an active assignment');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/assignments', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ deliverable_id: 'deliv-1' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// LIST ASSIGNMENTS
// ============================================================================
describe('GET /api/v1/projects/:projectId/assignments', () => {
  it('returns list of assignments for the project', async () => {
    const a1 = makeAssignment({ id: 'a1', project_id: 'proj-1', status: 'ASSIGNED' });
    const a2 = makeAssignment({ id: 'a2', project_id: 'proj-1', status: 'IN_PROGRESS' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT ta.*, bd.name', result: [a1, a2] },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { assignments: unknown[] };
    expect(body.assignments).toHaveLength(2);
  });

  it('returns empty array when no assignments exist', async () => {
    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT ta.*, bd.name', result: [] },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { assignments: unknown[] };
    expect(body.assignments).toEqual([]);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/assignments');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// GET SINGLE ASSIGNMENT
// ============================================================================
describe('GET /api/v1/projects/:projectId/assignments/:id', () => {
  it('returns assignment details', async () => {
    const assignment = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'IN_PROGRESS' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT ta.*, bd.name as deliverable_name', result: assignment },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.id).toBe('assign-1');
    expect(body.status).toBe('IN_PROGRESS');
  });

  it('returns 404 for non-existent assignment', async () => {
    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT ta.*, bd.name as deliverable_name', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/nonexistent', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Assignment not found');
  });
});

// ============================================================================
// UPDATE ASSIGNMENT
// ============================================================================
describe('PUT /api/v1/projects/:projectId/assignments/:id', () => {
  it('updates assignment priority and returns updated record', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', priority: 'P1' });
    const updated = { ...existing, priority: 'P0' };

    const { req } = buildApp([
      ...authQueries(),
      // getAssignment for existing check
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
      // UPDATE
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      // decision ledger for reprioritization
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ priority: 'P0' }),
    });

    expect(res.status).toBe(200);
  });

  it('returns 404 for non-existent assignment', async () => {
    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/nonexistent', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ priority: 'P0' }),
    });

    expect(res.status).toBe(404);
  });

  it('returns 400 when no fields to update', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('No fields to update');
  });
});

// ============================================================================
// START ASSIGNMENT (Lifecycle)
// ============================================================================
describe('POST /api/v1/projects/:projectId/assignments/:id/start', () => {
  it('starts an ASSIGNED assignment and transitions to IN_PROGRESS', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'ASSIGNED' });
    const started = { ...existing, status: 'IN_PROGRESS', started_at: new Date().toISOString() };

    const { req } = buildApp([
      ...authQueries(),
      // first getAssignment call (existence + status check)
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
      // UPDATE status to IN_PROGRESS
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      // decision ledger
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/start', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
  });

  it('allows starting a REJECTED assignment (rework)', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'REJECTED' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/start', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
  });

  it('returns 409 when trying to start from IN_PROGRESS status', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'IN_PROGRESS' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/start', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Cannot start from status');
  });

  it('returns 409 when trying to start from SUBMITTED status', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'SUBMITTED' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/start', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(409);
  });

  it('returns 404 for non-existent assignment', async () => {
    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/nonexistent/start', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });
});

// ============================================================================
// PROGRESS UPDATE (Lifecycle)
// ============================================================================
describe('POST /api/v1/projects/:projectId/assignments/:id/progress', () => {
  it('updates progress for an IN_PROGRESS assignment', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'IN_PROGRESS' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/progress', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        progress_notes: 'Halfway done',
        progress_percent: 50,
        completed_items: ['item-1'],
        remaining_items: ['item-2'],
      }),
    });

    expect(res.status).toBe(200);
  });

  it('returns 409 when assignment is not IN_PROGRESS', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'ASSIGNED' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/progress', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ progress_percent: 50 }),
    });

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Cannot update progress for status');
  });
});

// ============================================================================
// SUBMIT FOR REVIEW (Lifecycle)
// ============================================================================
describe('POST /api/v1/projects/:projectId/assignments/:id/submit', () => {
  it('submits an IN_PROGRESS assignment for review', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'IN_PROGRESS' });
    const submitted = { ...existing, status: 'SUBMITTED', progress_percent: 100 };

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/submit', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        summary: 'Completed the database setup with all migrations',
        evidence: ['migration-001.sql applied', 'schema verified'],
      }),
    });

    expect(res.status).toBe(200);
  });

  it('returns 400 when summary is missing', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'IN_PROGRESS' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/submit', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('summary is required');
  });

  it('returns 400 when summary is empty/whitespace', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'IN_PROGRESS' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/submit', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ summary: '   ' }),
    });

    expect(res.status).toBe(400);
  });

  it('returns 409 when assignment is not IN_PROGRESS', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'ASSIGNED' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/submit', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ summary: 'Done' }),
    });

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Cannot submit from status');
  });
});

// ============================================================================
// ACCEPT SUBMISSION (Lifecycle)
// ============================================================================
describe('POST /api/v1/projects/:projectId/assignments/:id/accept', () => {
  it('accepts a SUBMITTED assignment', async () => {
    const existing = makeAssignment({
      id: 'assign-1', project_id: 'proj-1', deliverable_id: 'deliv-1', status: 'SUBMITTED',
    });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
      // UPDATE assignment to ACCEPTED
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      // UPDATE deliverable to DONE
      { pattern: 'UPDATE blueprint_deliverables', runResult: { success: true } },
      // decision ledger
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/accept', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ notes: 'Looks great' }),
    });

    expect(res.status).toBe(200);
  });

  it('accepts with no body (body is optional)', async () => {
    const existing = makeAssignment({
      id: 'assign-1', project_id: 'proj-1', deliverable_id: 'deliv-1', status: 'SUBMITTED',
    });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      { pattern: 'UPDATE blueprint_deliverables', runResult: { success: true } },
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
    ]);

    // Send with no body — the endpoint uses .catch() to handle missing body
    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/accept', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    expect(res.status).toBe(200);
  });

  it('returns 409 when assignment is not SUBMITTED', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'IN_PROGRESS' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/accept', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Cannot accept from status');
  });

  it('returns 409 when trying to accept an ASSIGNED assignment', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'ASSIGNED' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/accept', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(409);
  });
});

// ============================================================================
// REJECT SUBMISSION (Lifecycle)
// ============================================================================
describe('POST /api/v1/projects/:projectId/assignments/:id/reject', () => {
  it('rejects a SUBMITTED assignment with notes', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'SUBMITTED' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/reject', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ notes: 'Missing unit tests for the edge cases' }),
    });

    expect(res.status).toBe(200);
  });

  it('returns 400 when notes are missing', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'SUBMITTED' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/reject', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('notes required');
  });

  it('returns 400 when notes are empty/whitespace', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'SUBMITTED' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/reject', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ notes: '   ' }),
    });

    expect(res.status).toBe(400);
  });

  it('returns 409 when assignment is not SUBMITTED', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'IN_PROGRESS' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/reject', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ notes: 'Needs work' }),
    });

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Cannot reject from status');
  });
});

// ============================================================================
// ESCALATE ASSIGNMENT
// ============================================================================
describe('POST /api/v1/projects/:projectId/assignments/:id/escalate', () => {
  it('creates an escalation for an IN_PROGRESS assignment', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'IN_PROGRESS' });
    const escalation = {
      id: 'esc-1', project_id: 'proj-1', assignment_id: 'assign-1',
      decision_needed: 'Choose framework', options: '["React","Vue"]',
      status: 'OPEN', recommendation: 'React',
    };

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
      // INSERT escalation
      { pattern: 'INSERT INTO escalation_log', runResult: { success: true } },
      // UPDATE assignment to BLOCKED
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      // decision ledger
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
      // re-fetch escalation
      { pattern: 'SELECT * FROM escalation_log WHERE id', result: escalation },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/escalate', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        decision_needed: 'Choose framework',
        options: ['React', 'Vue'],
        recommendation: 'React',
        rationale: 'Better ecosystem',
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body.status).toBe('OPEN');
    expect(body.decision_needed).toBe('Choose framework');
  });

  it('allows escalation from BLOCKED status', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'BLOCKED' });
    const escalation = {
      id: 'esc-1', project_id: 'proj-1', assignment_id: 'assign-1',
      decision_needed: 'Need budget approval', options: '["approve","deny"]',
      status: 'OPEN',
    };

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
      { pattern: 'INSERT INTO escalation_log', runResult: { success: true } },
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
      { pattern: 'SELECT * FROM escalation_log WHERE id', result: escalation },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/escalate', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        decision_needed: 'Need budget approval',
        options: ['approve', 'deny'],
      }),
    });

    expect(res.status).toBe(201);
  });

  it('returns 400 when decision_needed is missing', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'IN_PROGRESS' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/escalate', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ options: ['a', 'b'] }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('decision_needed');
  });

  it('returns 400 when options has fewer than 2 entries', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'IN_PROGRESS' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/escalate', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ decision_needed: 'Pick one', options: ['only-one'] }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('options must have 2-4 entries');
  });

  it('returns 400 when options has more than 4 entries', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'IN_PROGRESS' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/escalate', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ decision_needed: 'Pick one', options: ['a', 'b', 'c', 'd', 'e'] }),
    });

    expect(res.status).toBe(400);
  });

  it('returns 409 when assignment is ASSIGNED (not started)', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'ASSIGNED' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/escalate', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ decision_needed: 'Pick', options: ['a', 'b'] }),
    });

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Cannot escalate from status');
  });
});

// ============================================================================
// BLOCK ASSIGNMENT
// ============================================================================
describe('POST /api/v1/projects/:projectId/assignments/:id/block', () => {
  it('blocks an IN_PROGRESS assignment with a reason', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'IN_PROGRESS' });
    const blocked = { ...existing, status: 'BLOCKED', blocked_reason: 'Waiting for API key' };

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/block', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ reason: 'Waiting for API key' }),
    });

    expect(res.status).toBe(200);
  });

  it('returns 400 when reason is missing', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'IN_PROGRESS' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/block', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('reason is required');
  });

  it('returns 409 when assignment is not IN_PROGRESS', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'ASSIGNED' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1/block', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ reason: 'Stuck' }),
    });

    expect(res.status).toBe(409);
  });
});

// ============================================================================
// DELETE ASSIGNMENT
// ============================================================================
describe('DELETE /api/v1/projects/:projectId/assignments/:id', () => {
  it('deletes an ASSIGNED assignment', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'ASSIGNED' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
      { pattern: 'DELETE FROM task_assignments', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; deleted: string };
    expect(body.success).toBe(true);
    expect(body.deleted).toBe('assign-1');
  });

  it('returns 409 when trying to delete an ACCEPTED assignment', async () => {
    const existing = makeAssignment({ id: 'assign-1', project_id: 'proj-1', status: 'ACCEPTED' });

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Cannot delete an accepted assignment');
  });

  it('returns 404 for non-existent assignment', async () => {
    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/nonexistent', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/assignments/assign-1', {
      method: 'DELETE',
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// FULL LIFECYCLE: create -> start -> progress -> submit -> accept
// ============================================================================
describe('Full TDL Lifecycle: ASSIGNED -> IN_PROGRESS -> SUBMITTED -> ACCEPTED', () => {
  it('completes the full happy-path lifecycle', async () => {
    // Each step builds its own app since status changes between steps.
    // Step 1: Assignment exists as ASSIGNED — start it
    const assigned = makeAssignment({ id: 'a-1', project_id: 'proj-1', status: 'ASSIGNED' });
    const inProgress = { ...assigned, status: 'IN_PROGRESS', started_at: new Date().toISOString() };

    const { req: reqStart } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: assigned },
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
    ]);

    const startRes = await reqStart('/api/v1/projects/proj-1/assignments/a-1/start', {
      method: 'POST',
      headers: authHeaders(token),
    });
    expect(startRes.status).toBe(200);

    // Step 2: Assignment is IN_PROGRESS — update progress
    const { req: reqProgress } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: inProgress },
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
    ]);

    const progressRes = await reqProgress('/api/v1/projects/proj-1/assignments/a-1/progress', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ progress_percent: 75, progress_notes: 'Almost done' }),
    });
    expect(progressRes.status).toBe(200);

    // Step 3: Assignment is IN_PROGRESS — submit for review
    const { req: reqSubmit } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: inProgress },
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
    ]);

    const submitRes = await reqSubmit('/api/v1/projects/proj-1/assignments/a-1/submit', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ summary: 'All tasks complete', evidence: ['tests pass'] }),
    });
    expect(submitRes.status).toBe(200);

    // Step 4: Assignment is SUBMITTED — accept it
    const submitted = { ...inProgress, status: 'SUBMITTED', deliverable_id: 'deliv-1' };
    const { req: reqAccept } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: submitted },
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      { pattern: 'UPDATE blueprint_deliverables', runResult: { success: true } },
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
    ]);

    const acceptRes = await reqAccept('/api/v1/projects/proj-1/assignments/a-1/accept', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ notes: 'Great work' }),
    });
    expect(acceptRes.status).toBe(200);
  });
});

// ============================================================================
// REJECTION FLOW: submit -> reject -> start (rework) -> submit -> accept
// ============================================================================
describe('Rejection Flow: SUBMITTED -> REJECTED -> rework -> SUBMITTED -> ACCEPTED', () => {
  it('handles rejection and rework cycle', async () => {
    // Step 1: SUBMITTED -> reject
    const submitted = makeAssignment({ id: 'a-1', project_id: 'proj-1', status: 'SUBMITTED' });

    const { req: reqReject } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: submitted },
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
    ]);

    const rejectRes = await reqReject('/api/v1/projects/proj-1/assignments/a-1/reject', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ notes: 'Missing error handling' }),
    });
    expect(rejectRes.status).toBe(200);

    // Step 2: REJECTED -> start (rework)
    const rejected = { ...submitted, status: 'REJECTED' };

    const { req: reqStart } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: rejected },
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
    ]);

    const startRes = await reqStart('/api/v1/projects/proj-1/assignments/a-1/start', {
      method: 'POST',
      headers: authHeaders(token),
    });
    expect(startRes.status).toBe(200);

    // Step 3: IN_PROGRESS -> submit again
    const reworking = { ...rejected, status: 'IN_PROGRESS' };

    const { req: reqSubmit } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: reworking },
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
    ]);

    const submitRes = await reqSubmit('/api/v1/projects/proj-1/assignments/a-1/submit', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ summary: 'Added error handling, all tests pass' }),
    });
    expect(submitRes.status).toBe(200);

    // Step 4: SUBMITTED -> accept
    const resubmitted = { ...reworking, status: 'SUBMITTED', deliverable_id: 'deliv-1' };

    const { req: reqAccept } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: resubmitted },
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      { pattern: 'UPDATE blueprint_deliverables', runResult: { success: true } },
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
    ]);

    const acceptRes = await reqAccept('/api/v1/projects/proj-1/assignments/a-1/accept', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ notes: 'Fixed, approved' }),
    });
    expect(acceptRes.status).toBe(200);
  });
});

// ============================================================================
// ESCALATION FLOW: in_progress -> escalate -> blocked
// ============================================================================
describe('Escalation Flow: IN_PROGRESS -> escalate -> BLOCKED', () => {
  it('escalation blocks the assignment and creates an escalation record', async () => {
    const existing = makeAssignment({ id: 'a-1', project_id: 'proj-1', status: 'IN_PROGRESS' });
    const escalation = {
      id: 'esc-1', project_id: 'proj-1', assignment_id: 'a-1',
      decision_needed: 'Which API provider?', options: '["OpenAI","Anthropic","Google"]',
      recommendation: 'Anthropic', status: 'OPEN',
    };

    const { req } = buildApp([
      ...authQueries(),
      { pattern: 'SELECT * FROM task_assignments WHERE id', result: existing },
      { pattern: 'INSERT INTO escalation_log', runResult: { success: true } },
      { pattern: 'UPDATE task_assignments SET', runResult: { success: true } },
      { pattern: 'INSERT INTO decision_ledger', runResult: { success: true } },
      { pattern: 'SELECT * FROM escalation_log WHERE id', result: escalation },
    ]);

    const res = await req('/api/v1/projects/proj-1/assignments/a-1/escalate', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        decision_needed: 'Which API provider?',
        options: ['OpenAI', 'Anthropic', 'Google'],
        recommendation: 'Anthropic',
        rationale: 'Better instruction following',
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body.status).toBe('OPEN');
    expect(body.recommendation).toBe('Anthropic');
    // options should be parsed from JSON string to array by formatAssignment
    expect(Array.isArray(body.options)).toBe(true);
  });
});

// ============================================================================
// PROJECT OWNERSHIP (404 on wrong project)
// ============================================================================
describe('Project ownership verification', () => {
  it('returns 404 when user does not own the project', async () => {
    const { req } = buildApp([
      sessionQuery(),
      // Ownership check returns null (not owner)
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-999/assignments', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Project not found');
  });
});
