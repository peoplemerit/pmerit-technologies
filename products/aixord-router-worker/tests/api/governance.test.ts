/**
 * Governance API Endpoint Tests
 *
 * Tests the governance sub-router mounted at /api/v1/projects:
 *   POST /:projectId/governance/wu/initialize    — Set project total WU
 *   POST /:projectId/governance/wu/allocate      — Allocate WU to a scope
 *   POST /:projectId/governance/wu/transfer      — Transfer WU for verified scope
 *   GET  /:projectId/governance/readiness         — Per-scope L/P/V/R breakdown
 *   GET  /:projectId/governance/conservation      — Conservation formula snapshot
 *   GET  /:projectId/governance/reconciliation    — Reconciliation Triad
 *   GET  /:projectId/governance/dashboard         — Combined metrics
 *   GET  /:projectId/governance/audit             — WU audit trail
 *   GET  /:projectId/governance/escalation        — Get escalation status
 *   POST /:projectId/governance/escalation/check  — Trigger escalation check
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types';
import { type MockQueryResult } from '../helpers';
import { createMockEnv, createTestSession, authHeaders, jsonHeaders } from '../test-app';

// Mock crypto for requireAuth SHA-256 hashing
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

// Mock readinessEngine — controls what the service layer returns
vi.mock('../../src/services/readinessEngine', () => ({
  computeProjectReadiness: vi.fn().mockResolvedValue({
    project_id: 'proj-1',
    scopes: [],
    project_R: 0,
    conservation: { total: 0, formula: 0, verified: 0, delta: 0, valid: true },
  }),
  computeScopeReadiness: vi.fn().mockResolvedValue({
    scope_id: 'scope-1', scope_name: 'Test Scope',
    L: 0, P: 0, V: 0, R: 0,
    allocated_wu: 0, verified_wu: 0,
    deliverable_count: 0, deliverables_done: 0,
    dmaic_breakdown: {},
  }),
  getConservationSnapshot: vi.fn().mockResolvedValue({
    total: 100, formula: 100, verified: 0, delta: 0, valid: true,
  }),
  allocateWorkUnits: vi.fn().mockResolvedValue({
    success: true, allocated_wu: 30, conservation: { total: 100, formula: 100, verified: 0, delta: 0, valid: true },
  }),
  transferWorkUnits: vi.fn().mockResolvedValue({
    scope_id: 'scope-1', R: 0.5, wu_transferred: 15,
    new_verified_wu: 15,
    conservation: { total: 100, formula: 85, verified: 15, delta: 0, valid: true },
  }),
  computeReconciliation: vi.fn().mockResolvedValue({
    project_id: 'proj-1', entries: [], has_divergences: false,
    max_divergence_pct: 0,
    conservation: { total: 100, formula: 100, verified: 0, delta: 0, valid: true },
  }),
}));

// Mock readinessEscalation
vi.mock('../../src/services/readinessEscalation', () => ({
  getEscalationStatus: vi.fn().mockResolvedValue({
    level: 'CRITICAL',
    project_R: 0,
    last_changed: null,
    recent_events: [],
  }),
  checkReadinessEscalation: vi.fn().mockResolvedValue({
    escalation: null,
    previous_level: null,
    level_changed: false,
    gates_flipped: [],
  }),
}));

import {
  computeProjectReadiness,
  getConservationSnapshot,
  allocateWorkUnits,
  transferWorkUnits,
  computeReconciliation,
} from '../../src/services/readinessEngine';
import {
  getEscalationStatus,
  checkReadinessEscalation,
} from '../../src/services/readinessEscalation';

const mockComputeProjectReadiness = vi.mocked(computeProjectReadiness);
const mockGetConservation = vi.mocked(getConservationSnapshot);
const mockAllocateWU = vi.mocked(allocateWorkUnits);
const mockTransferWU = vi.mocked(transferWorkUnits);
const mockComputeReconciliation = vi.mocked(computeReconciliation);
const mockGetEscalationStatus = vi.mocked(getEscalationStatus);
const mockCheckEscalation = vi.mocked(checkReadinessEscalation);

let governanceRouter: any;

beforeEach(async () => {
  vi.clearAllMocks();
  const mod = await import('../../src/api/governance');
  governanceRouter = mod.default;
});

// ============================================================================
// Helpers
// ============================================================================

function buildApp(queries: MockQueryResult[] = []) {
  const env = createMockEnv(queries);
  const app = new Hono<{ Bindings: Env }>();
  app.route('/api/v1/projects', governanceRouter);
  const req = (path: string, init?: RequestInit) => app.request(path, init, env);
  return { app, env, req };
}

/** Auth session query — requireAuth looks up by token_hash */
function sessionQuery(userId = 'user-1'): MockQueryResult {
  return { pattern: 'token_hash', result: { user_id: userId, id: 'sess-1', email: 'test@test.com' } };
}

/** Project ownership verification query — verifyProjectOwnership */
function ownerQuery(projectId = 'proj-1', userId = 'user-1'): MockQueryResult {
  return { pattern: 'SELECT id FROM projects WHERE id', result: { id: projectId, owner_id: userId } };
}

// ============================================================================
// POST /:projectId/governance/wu/initialize
// ============================================================================
describe('POST /api/v1/projects/:projectId/governance/wu/initialize', () => {
  it('initializes WU pool with valid budget', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // SELECT execution_total_wu — not yet initialized
      { pattern: 'SELECT execution_total_wu FROM projects', result: { execution_total_wu: 0 } },
      // UPDATE projects SET execution_total_wu
      { pattern: 'UPDATE projects', runResult: { success: true } },
      // INSERT INTO wu_audit_log
      { pattern: 'INSERT INTO wu_audit_log', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/wu/initialize', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ total_wu: 100 }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.execution_total_wu).toBe(100);
    expect(body.formula_execution_wu).toBe(100);
    expect(body.verified_reality_wu).toBe(0);
  });

  it('rejects initialization with zero WU', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/wu/initialize', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ total_wu: 0 }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error).toContain('positive number');
  });

  it('rejects initialization with negative WU', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/wu/initialize', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ total_wu: -50 }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error).toContain('positive number');
  });

  it('returns 409 if WU already initialized', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Project already has WU initialized
      { pattern: 'SELECT execution_total_wu FROM projects', result: { execution_total_wu: 200 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/wu/initialize', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ total_wu: 100 }),
    });

    expect(res.status).toBe(409);
    const body = await res.json() as any;
    expect(body.error).toContain('already initialized');
    expect(body.current_total).toBe(200);
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-999/governance/wu/initialize', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ total_wu: 100 }),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/governance/wu/initialize', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ total_wu: 100 }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// POST /:projectId/governance/wu/allocate
// ============================================================================
describe('POST /api/v1/projects/:projectId/governance/wu/allocate', () => {
  it('allocates WU to a scope successfully', async () => {
    const { token } = await createTestSession();

    mockAllocateWU.mockResolvedValue({
      success: true,
      allocated_wu: 30,
      conservation: { total: 100, formula: 100, verified: 0, delta: 0, valid: true },
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Scope exists check
      { pattern: 'SELECT id FROM blueprint_scopes WHERE id', result: { id: 'scope-1' } },
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/wu/allocate', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ scope_id: 'scope-1', wu_amount: 30 }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.allocated_wu).toBe(30);
    expect(body.conservation.valid).toBe(true);
  });

  it('rejects allocation when exceeding project total', async () => {
    const { token } = await createTestSession();

    mockAllocateWU.mockResolvedValue({
      success: false,
      error: 'WU allocation exceeds project total. Available: 10, Requested: 50',
      allocated_wu: 0,
      conservation: { total: 100, formula: 100, verified: 0, delta: 0, valid: true },
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT id FROM blueprint_scopes WHERE id', result: { id: 'scope-1' } },
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/wu/allocate', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ scope_id: 'scope-1', wu_amount: 50 }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error).toContain('exceeds project total');
  });

  it('rejects negative WU amount', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/wu/allocate', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ scope_id: 'scope-1', wu_amount: -10 }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error).toContain('non-negative');
  });

  it('rejects when scope_id is missing', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/wu/allocate', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ wu_amount: 30 }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error).toContain('scope_id');
  });

  it('returns 404 when scope does not exist', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Scope does not exist
      { pattern: 'SELECT id FROM blueprint_scopes WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/wu/allocate', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ scope_id: 'scope-nonexistent', wu_amount: 30 }),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as any;
    expect(body.error).toContain('Scope not found');
  });

  it('allows zero WU allocation (reset)', async () => {
    const { token } = await createTestSession();

    mockAllocateWU.mockResolvedValue({
      success: true,
      allocated_wu: 0,
      conservation: { total: 100, formula: 100, verified: 0, delta: 0, valid: true },
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT id FROM blueprint_scopes WHERE id', result: { id: 'scope-1' } },
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/wu/allocate', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ scope_id: 'scope-1', wu_amount: 0 }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.allocated_wu).toBe(0);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/governance/wu/allocate', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ scope_id: 'scope-1', wu_amount: 30 }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// POST /:projectId/governance/wu/transfer
// ============================================================================
describe('POST /api/v1/projects/:projectId/governance/wu/transfer', () => {
  it('transfers WU based on R-score successfully', async () => {
    const { token } = await createTestSession();

    mockTransferWU.mockResolvedValue({
      scope_id: 'scope-1',
      R: 0.5,
      wu_transferred: 15,
      new_verified_wu: 15,
      conservation: { total: 100, formula: 85, verified: 15, delta: 0, valid: true },
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/wu/transfer', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ scope_id: 'scope-1' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.scope_id).toBe('scope-1');
    expect(body.R).toBe(0.5);
    expect(body.wu_transferred).toBe(15);
    expect(body.conservation.valid).toBe(true);
    // Conservation law: total = formula + verified
    expect(body.conservation.total).toBe(body.conservation.formula + body.conservation.verified);
  });

  it('returns 400 when scope_id is missing', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/wu/transfer', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error).toContain('scope_id');
  });

  it('returns 400 when transfer service throws', async () => {
    const { token } = await createTestSession();

    mockTransferWU.mockRejectedValue(new Error('Cannot transfer WU for LOCKED scope'));

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/wu/transfer', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ scope_id: 'scope-locked' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error).toContain('Transfer failed');
  });

  it('handles zero transfer when R is 0 (no readiness)', async () => {
    const { token } = await createTestSession();

    mockTransferWU.mockResolvedValue({
      scope_id: 'scope-1',
      R: 0,
      wu_transferred: 0,
      new_verified_wu: 0,
      conservation: { total: 100, formula: 100, verified: 0, delta: 0, valid: true },
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/wu/transfer', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ scope_id: 'scope-1' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.wu_transferred).toBe(0);
    expect(body.R).toBe(0);
    // Conservation holds: total = formula + verified (100 = 100 + 0)
    expect(body.conservation.delta).toBe(0);
    expect(body.conservation.valid).toBe(true);
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-999/governance/wu/transfer', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ scope_id: 'scope-1' }),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/governance/wu/transfer', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ scope_id: 'scope-1' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// GET /:projectId/governance/readiness
// ============================================================================
describe('GET /api/v1/projects/:projectId/governance/readiness', () => {
  it('returns project readiness with scope breakdown', async () => {
    const { token } = await createTestSession();

    mockComputeProjectReadiness.mockResolvedValue({
      project_id: 'proj-1',
      scopes: [
        {
          scope_id: 'scope-1', scope_name: 'Auth', L: 0.75, P: 0.5, V: 0.6, R: 0.225,
          allocated_wu: 40, verified_wu: 9, deliverable_count: 4, deliverables_done: 2,
          dmaic_breakdown: { DEFINE: 1, MEASURE: 2, ANALYZE: 1 },
        },
        {
          scope_id: 'scope-2', scope_name: 'Dashboard', L: 0.5, P: 0.333, V: 0.4, R: 0.067,
          allocated_wu: 30, verified_wu: 2, deliverable_count: 3, deliverables_done: 1,
          dmaic_breakdown: { DEFINE: 2, MEASURE: 1 },
        },
      ],
      project_R: 0.159,
      conservation: { total: 100, formula: 89, verified: 11, delta: 0, valid: true },
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/readiness', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.project_id).toBe('proj-1');
    expect(body.scopes).toHaveLength(2);
    expect(body.project_R).toBe(0.159);
    expect(body.conservation.valid).toBe(true);

    // Verify R = L * P * V for first scope (approximately)
    const s1 = body.scopes[0];
    expect(s1.scope_name).toBe('Auth');
    expect(s1.L).toBe(0.75);
    expect(s1.P).toBe(0.5);
    expect(s1.V).toBe(0.6);
    expect(s1.R).toBe(0.225);
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-999/governance/readiness', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/governance/readiness');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// GET /:projectId/governance/conservation
// ============================================================================
describe('GET /api/v1/projects/:projectId/governance/conservation', () => {
  it('returns conservation snapshot with valid=true when balanced', async () => {
    const { token } = await createTestSession();

    mockGetConservation.mockResolvedValue({
      total: 100, formula: 70, verified: 30, delta: 0, valid: true,
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/conservation', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    // Conservation law: TOTAL = FORMULA + VERIFIED
    expect(body.total).toBe(100);
    expect(body.formula).toBe(70);
    expect(body.verified).toBe(30);
    expect(body.delta).toBe(0);
    expect(body.valid).toBe(true);
    expect(body.total).toBe(body.formula + body.verified);
  });

  it('detects conservation violation when delta is non-zero', async () => {
    const { token } = await createTestSession();

    mockGetConservation.mockResolvedValue({
      total: 100, formula: 60, verified: 30, delta: 10, valid: false,
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/conservation', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.valid).toBe(false);
    expect(body.delta).toBe(10);
    // total != formula + verified (violation)
    expect(body.total).not.toBe(body.formula + body.verified);
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-999/governance/conservation', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });
});

// ============================================================================
// GET /:projectId/governance/reconciliation
// ============================================================================
describe('GET /api/v1/projects/:projectId/governance/reconciliation', () => {
  it('returns reconciliation triad with divergence detection', async () => {
    const { token } = await createTestSession();

    mockComputeReconciliation.mockResolvedValue({
      project_id: 'proj-1',
      entries: [
        {
          scope_id: 'scope-1', scope_name: 'Auth',
          planned_wu: 40, claimed_wu: 30, verified_wu: 10,
          delta: 30, divergence_pct: 75.0, requires_attention: true,
        },
        {
          scope_id: 'scope-2', scope_name: 'Dashboard',
          planned_wu: 30, claimed_wu: 10, verified_wu: 8,
          delta: 22, divergence_pct: 73.3, requires_attention: true,
        },
      ],
      has_divergences: true,
      max_divergence_pct: 75.0,
      conservation: { total: 100, formula: 82, verified: 18, delta: 0, valid: true },
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/reconciliation', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.project_id).toBe('proj-1');
    expect(body.has_divergences).toBe(true);
    expect(body.max_divergence_pct).toBe(75.0);
    expect(body.entries).toHaveLength(2);
    expect(body.entries[0].requires_attention).toBe(true);
  });

  it('returns clean reconciliation when no divergences', async () => {
    const { token } = await createTestSession();

    mockComputeReconciliation.mockResolvedValue({
      project_id: 'proj-1',
      entries: [],
      has_divergences: false,
      max_divergence_pct: 0,
      conservation: { total: 100, formula: 100, verified: 0, delta: 0, valid: true },
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/reconciliation', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.has_divergences).toBe(false);
    expect(body.max_divergence_pct).toBe(0);
  });
});

// ============================================================================
// GET /:projectId/governance/dashboard
// ============================================================================
describe('GET /api/v1/projects/:projectId/governance/dashboard', () => {
  it('returns combined readiness, reconciliation, and audit trail', async () => {
    const { token } = await createTestSession();

    mockComputeProjectReadiness.mockResolvedValue({
      project_id: 'proj-1',
      scopes: [],
      project_R: 0.35,
      conservation: { total: 100, formula: 80, verified: 20, delta: 0, valid: true },
    });

    mockComputeReconciliation.mockResolvedValue({
      project_id: 'proj-1',
      entries: [],
      has_divergences: false,
      max_divergence_pct: 0,
      conservation: { total: 100, formula: 80, verified: 20, delta: 0, valid: true },
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Audit trail query (SELECT * FROM wu_audit_log)
      {
        pattern: 'SELECT * FROM wu_audit_log',
        result: [
          { id: 'audit-1', event_type: 'WU_ALLOCATED', wu_amount: 100, created_at: '2026-01-15T00:00:00Z' },
          { id: 'audit-2', event_type: 'WU_TRANSFERRED', wu_amount: 20, created_at: '2026-01-16T00:00:00Z' },
        ],
      },
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/dashboard', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.readiness).toBeDefined();
    expect(body.readiness.project_R).toBe(0.35);
    expect(body.reconciliation).toBeDefined();
    expect(body.audit_trail).toBeDefined();
    expect(body.audit_trail.length).toBeGreaterThanOrEqual(1);
    expect(body.generated_at).toBeDefined();
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/dashboard', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/governance/dashboard');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// GET /:projectId/governance/audit
// ============================================================================
describe('GET /api/v1/projects/:projectId/governance/audit', () => {
  it('returns paginated audit trail', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Audit log query
      {
        pattern: 'SELECT * FROM wu_audit_log WHERE project_id',
        result: [
          { id: 'a-1', event_type: 'WU_ALLOCATED', wu_amount: 100 },
          { id: 'a-2', event_type: 'WU_TRANSFERRED', wu_amount: 15 },
        ],
      },
      // COUNT query
      { pattern: 'SELECT COUNT', result: { total: 2 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/audit?limit=10&offset=0', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.events).toBeDefined();
    expect(body.total).toBe(2);
    expect(body.limit).toBe(10);
    expect(body.offset).toBe(0);
  });

  it('uses default pagination when no params provided', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM wu_audit_log WHERE project_id', result: [] },
      { pattern: 'SELECT COUNT', result: { total: 0 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/audit', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.limit).toBe(50);
    expect(body.offset).toBe(0);
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-999/governance/audit', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });
});

// ============================================================================
// GET /:projectId/governance/escalation
// ============================================================================
describe('GET /api/v1/projects/:projectId/governance/escalation', () => {
  it('returns current escalation status', async () => {
    const { token } = await createTestSession();

    mockGetEscalationStatus.mockResolvedValue({
      level: 'AT_RISK',
      project_R: 0.3,
      last_changed: '2026-01-15T10:00:00Z',
      recent_events: [
        { from_level: 'CRITICAL', to_level: 'AT_RISK', project_r: 0.3, created_at: '2026-01-15T10:00:00Z' },
      ],
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/escalation', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.level).toBe('AT_RISK');
    expect(body.project_R).toBe(0.3);
    expect(body.recent_events).toHaveLength(1);
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      // verifyProjectOwnership returns false
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-999/governance/escalation', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/governance/escalation');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// POST /:projectId/governance/escalation/check
// ============================================================================
describe('POST /api/v1/projects/:projectId/governance/escalation/check', () => {
  it('triggers escalation check and returns result', async () => {
    const { token } = await createTestSession();

    mockCheckEscalation.mockResolvedValue({
      escalation: {
        level: 'STAGING',
        project_R: 0.65,
        threshold: 0.6,
        message: 'Project is in STAGING readiness (R=0.65).',
        auto_actions: ['AUTO_FLIP_GW:VAL', 'NOTIFY_PROGRESS_MILESTONE'],
        scope_details: [
          { scope_name: 'Auth', R: 0.7, bottleneck: 'V' },
        ],
      },
      previous_level: 'PROGRESSING',
      level_changed: true,
      gates_flipped: ['GW:VAL'],
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/escalation/check', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.level_changed).toBe(true);
    expect(body.previous_level).toBe('PROGRESSING');
    expect(body.escalation.level).toBe('STAGING');
    expect(body.gates_flipped).toContain('GW:VAL');
  });

  it('returns no escalation when level unchanged', async () => {
    const { token } = await createTestSession();

    mockCheckEscalation.mockResolvedValue({
      escalation: null,
      previous_level: 'CRITICAL',
      level_changed: false,
      gates_flipped: [],
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/escalation/check', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.level_changed).toBe(false);
    expect(body.escalation).toBeNull();
    expect(body.gates_flipped).toHaveLength(0);
  });

  it('returns 404 for non-owned project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-999/governance/escalation/check', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/governance/escalation/check', {
      method: 'POST',
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Conservation Law Validation (Cross-endpoint)
// ============================================================================
describe('WU Conservation Law — TOTAL = FORMULA + VERIFIED', () => {
  it('conservation holds after initialize (all WU in formula pool)', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT execution_total_wu FROM projects', result: { execution_total_wu: 0 } },
      { pattern: 'UPDATE projects', runResult: { success: true } },
      { pattern: 'INSERT INTO wu_audit_log', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/wu/initialize', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ total_wu: 250 }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    // TOTAL = FORMULA + VERIFIED => 250 = 250 + 0
    expect(body.execution_total_wu).toBe(body.formula_execution_wu + body.verified_reality_wu);
    expect(body.verified_reality_wu).toBe(0);
  });

  it('conservation holds after transfer (formula decreases, verified increases)', async () => {
    const { token } = await createTestSession();

    // Simulate: 100 total, after transfer 25 WU moves from formula to verified
    mockTransferWU.mockResolvedValue({
      scope_id: 'scope-1',
      R: 0.5,
      wu_transferred: 25,
      new_verified_wu: 25,
      conservation: { total: 100, formula: 75, verified: 25, delta: 0, valid: true },
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/governance/wu/transfer', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ scope_id: 'scope-1' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    const c = body.conservation;
    // Conservation law: total == formula + verified
    expect(c.total).toBe(c.formula + c.verified);
    expect(c.delta).toBe(0);
    expect(c.valid).toBe(true);
    // Verify the movement: 25 transferred
    expect(body.wu_transferred).toBe(25);
    expect(c.formula).toBe(75);
    expect(c.verified).toBe(25);
  });
});
