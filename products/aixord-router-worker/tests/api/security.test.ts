/**
 * Security API Endpoint Tests
 *
 * Tests the security sub-router mounted at /api/v1/projects:
 *   GET    /api/v1/projects/:projectId/security/gates              — Get all security gates status
 *   GET    /api/v1/projects/:projectId/security/classification     — Get data classification
 *   PUT    /api/v1/projects/:projectId/security/classification     — Set data classification (GS:DC)
 *   POST   /api/v1/projects/:projectId/security/validate-exposure  — Validate AI exposure (GS:AI)
 *   POST   /api/v1/projects/:projectId/security/classify           — Classify a specific resource (GS:DC granular)
 *
 * Security Gates tested: GS:DC, GS:DP, GS:AC, GS:AI, GS:JR, GS:RT
 * Laws tested: L-SPG1, L-SPG3, L-SPG4, L-SPG5, L-SPG6
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types';
import { type MockQueryResult, genId } from '../helpers';
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

let securityRouter: any;
let token: string;
let tokenHash: string;

beforeEach(async () => {
  vi.clearAllMocks();
  const session = await createTestSession();
  token = session.token;
  tokenHash = session.tokenHash;
  const mod = await import('../../src/api/security');
  securityRouter = mod.default;
});

function buildApp(queries: MockQueryResult[] = []) {
  const env = createMockEnv(queries);
  const app = new Hono<{ Bindings: Env }>();
  app.route('/api/v1/projects', securityRouter);
  const req = (path: string, init?: RequestInit) => app.request(path, init, env);
  return { app, env, req };
}

/** Auth session query for requireAuth — matches token_hash lookup */
function sessionQuery(userId = 'user-1'): MockQueryResult {
  return {
    pattern: 'token_hash',
    result: { user_id: userId, id: 'sess-1', email: 'test@test.com' },
  };
}

/** Project ownership verification query — used by all security endpoints */
function ownerQuery(projectId = 'proj-1', userId = 'user-1'): MockQueryResult {
  return {
    pattern: 'SELECT id FROM projects WHERE id',
    result: { id: projectId, owner_id: userId },
  };
}

/** Extended owner query that returns owner_id (used by classify endpoint) */
function ownerQueryWithOwner(projectId = 'proj-1', userId = 'user-1'): MockQueryResult {
  return {
    pattern: 'SELECT id, owner_id FROM projects WHERE id',
    result: { id: projectId, owner_id: userId },
  };
}

// ============================================================================
// GET /:projectId/security/gates — Security Gates Status
// ============================================================================
describe('GET /api/v1/projects/:projectId/security/gates', () => {
  it('returns default gates when no gates record exists', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM security_gates WHERE project_id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/gates', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.project_id).toBe('proj-1');
    expect(body.gates['GS:DC'].passed).toBe(false);
    expect(body.gates['GS:DC'].required).toBe(true);
    expect(body.gates['GS:AC'].passed).toBe(true);
    expect(body.gates['GS:AC'].required).toBe(true);
    expect(body.gates['GS:AI'].passed).toBe(false);
    expect(body.gates['GS:DP'].required).toBe(false);
    expect(body.gates['GS:JR'].required).toBe(false);
    expect(body.gates['GS:RT'].required).toBe(false);
    expect(body.execution_allowed).toBe(false);
    expect(body.reason).toContain('GS:DC not passed');
  });

  it('returns stored gates with execution_allowed when GS:DC and GS:AC are passed', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      {
        pattern: 'SELECT * FROM security_gates WHERE project_id',
        result: {
          project_id: 'proj-1',
          gs_dc: true, gs_dc_passed_at: '2026-01-15T00:00:00Z',
          gs_dp: false, gs_dp_passed_at: null,
          gs_ac: true, gs_ac_passed_at: '2026-01-15T00:00:00Z',
          gs_ai: true, gs_ai_passed_at: '2026-01-15T00:00:00Z',
          gs_jr: false, gs_jr_passed_at: null,
          gs_rt: false, gs_rt_passed_at: null,
        },
      },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/gates', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.execution_allowed).toBe(true);
    expect(body.reason).toBeNull();
    expect(body.gates['GS:DC'].passed).toBe(true);
    expect(body.gates['GS:DC'].passed_at).toBe('2026-01-15T00:00:00Z');
    expect(body.gates['GS:AI'].passed).toBe(true);
  });

  it('returns 401 without auth token', async () => {
    const { req } = buildApp([]);

    const res = await req('/api/v1/projects/proj-1/security/gates', {
      headers: jsonHeaders,
    });

    expect(res.status).toBe(401);
  });

  it('returns 404 when project not owned by user', async () => {
    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-999/security/gates', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as any;
    expect(body.error).toBe('Project not found');
  });
});

// ============================================================================
// GET /:projectId/security/classification — Get Data Classification
// ============================================================================
describe('GET /api/v1/projects/:projectId/security/classification', () => {
  it('returns default RESTRICTED classification when none exists (L-SPG4)', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM data_classification WHERE project_id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classification', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.project_id).toBe('proj-1');
    expect(body.pii).toBe('UNKNOWN');
    expect(body.phi).toBe('UNKNOWN');
    expect(body.financial).toBe('UNKNOWN');
    expect(body.legal).toBe('UNKNOWN');
    expect(body.minor_data).toBe('UNKNOWN');
    expect(body.ai_exposure).toBe('RESTRICTED');
    expect(body.declared).toBe(false);
  });

  it('returns stored classification with parsed regulations', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      {
        pattern: 'SELECT * FROM data_classification WHERE project_id',
        result: {
          project_id: 'proj-1',
          pii: 'YES',
          phi: 'NO',
          financial: 'NO',
          legal: 'NO',
          minor_data: 'NO',
          jurisdiction: 'US',
          regulations: '["GDPR","CCPA"]',
          ai_exposure: 'INTERNAL',
          declared_by: 'user-1',
          declared_at: '2026-01-15T00:00:00Z',
        },
      },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classification', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.pii).toBe('YES');
    expect(body.ai_exposure).toBe('INTERNAL');
    expect(body.regulations).toEqual(['GDPR', 'CCPA']);
    expect(body.declared).toBe(true);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp([]);

    const res = await req('/api/v1/projects/proj-1/security/classification');

    expect(res.status).toBe(401);
  });

  it('returns 404 when project not owned', async () => {
    const { req } = buildApp([
      sessionQuery('user-2'),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classification', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });
});

// ============================================================================
// PUT /:projectId/security/classification — Set Data Classification (GS:DC)
// ============================================================================
describe('PUT /api/v1/projects/:projectId/security/classification', () => {
  const classificationBody = {
    pii: 'NO' as const,
    phi: 'NO' as const,
    financial: 'NO' as const,
    legal: 'NO' as const,
    minor_data: 'NO' as const,
    jurisdiction: 'US',
    regulations: [],
    ai_exposure: 'PUBLIC' as const,
  };

  it('creates classification and passes GS:DC gate', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Check existing classification for upsert
      { pattern: 'SELECT project_id FROM data_classification WHERE project_id', result: null },
      // INSERT data_classification
      { pattern: 'INSERT INTO data_classification', runResult: { success: true, changes: 1 } },
      // Check existing security_gates for updateSecurityGate (GS:DC)
      { pattern: 'SELECT project_id FROM security_gates WHERE project_id', result: null },
      // INSERT security_gates
      { pattern: 'INSERT INTO security_gates', runResult: { success: true, changes: 1 } },
      // UPDATE security_gates for gs_dc
      { pattern: 'UPDATE security_gates SET gs_dc', runResult: { success: true, changes: 1 } },
      // Also passes GS:AI because all fields are declared (not UNKNOWN)
      { pattern: 'UPDATE security_gates SET gs_ai', runResult: { success: true, changes: 1 } },
      // Audit decision INSERT
      { pattern: 'INSERT INTO decisions', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classification', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(classificationBody),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.classification.ai_exposure).toBe('PUBLIC');
    expect(body.gates_passed).toContain('GS:DC');
    expect(body.gates_passed).toContain('GS:AI');
    expect(body.warnings).toHaveLength(0);
  });

  it('rejects PUBLIC exposure with PII data (L-SPG4)', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classification', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ ...classificationBody, pii: 'YES', ai_exposure: 'PUBLIC' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error).toContain('L-SPG4');
    expect(body.suggestion).toBeDefined();
  });

  it('rejects INTERNAL exposure with PHI data (L-SPG3)', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classification', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ ...classificationBody, phi: 'YES', ai_exposure: 'INTERNAL' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error).toContain('L-SPG3');
    expect(body.error).toContain('PHI');
  });

  it('rejects non-RESTRICTED exposure with minor data (L-SPG3)', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classification', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ ...classificationBody, minor_data: 'YES', ai_exposure: 'CONFIDENTIAL' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error).toContain('L-SPG3');
    expect(body.error).toContain('Minor data');
  });

  it('upgrades PUBLIC to CONFIDENTIAL when UNKNOWN fields exist (L-SPG4)', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT project_id FROM data_classification WHERE project_id', result: null },
      { pattern: 'INSERT INTO data_classification', runResult: { success: true, changes: 1 } },
      { pattern: 'SELECT project_id FROM security_gates WHERE project_id', result: { project_id: 'proj-1' } },
      { pattern: 'UPDATE security_gates SET gs_dc', runResult: { success: true, changes: 1 } },
      { pattern: 'INSERT INTO decisions', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classification', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({
        pii: 'UNKNOWN',
        phi: 'NO',
        financial: 'NO',
        legal: 'NO',
        minor_data: 'NO',
        ai_exposure: 'PUBLIC',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.classification.ai_exposure).toBe('CONFIDENTIAL');
    expect(body.warnings).toHaveLength(1);
    expect(body.warnings[0]).toContain('upgraded');
    expect(body.warnings[0]).toContain('L-SPG4');
    // GS:AI should NOT be in gates_passed because pii is UNKNOWN
    expect(body.gates_passed).not.toContain('GS:AI');
  });

  it('updates existing classification record', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Existing classification exists
      { pattern: 'SELECT project_id FROM data_classification WHERE project_id', result: { project_id: 'proj-1' } },
      // UPDATE data_classification
      { pattern: 'UPDATE data_classification SET', runResult: { success: true, changes: 1 } },
      // Security gate exists
      { pattern: 'SELECT project_id FROM security_gates WHERE project_id', result: { project_id: 'proj-1' } },
      { pattern: 'UPDATE security_gates SET gs_dc', runResult: { success: true, changes: 1 } },
      { pattern: 'UPDATE security_gates SET gs_ai', runResult: { success: true, changes: 1 } },
      { pattern: 'INSERT INTO decisions', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classification', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(classificationBody),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
  });

  it('returns 404 when project not owned', async () => {
    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-999/security/classification', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(classificationBody),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp([]);

    const res = await req('/api/v1/projects/proj-1/security/classification', {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(classificationBody),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// POST /:projectId/security/validate-exposure — AI Exposure Validation (GS:AI)
// ============================================================================
describe('POST /api/v1/projects/:projectId/security/validate-exposure', () => {
  it('allows PUBLIC exposure and returns allowed=true', async () => {
    const { req } = buildApp([
      sessionQuery(),
      {
        pattern: 'SELECT ai_exposure, pii, phi, minor_data FROM data_classification',
        result: { ai_exposure: 'PUBLIC', pii: 'NO', phi: 'NO', minor_data: 'NO' },
      },
      // INSERT into ai_exposure_log
      { pattern: 'INSERT INTO ai_exposure_log', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/validate-exposure', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ request_id: 'req-1' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.allowed).toBe(true);
    expect(body.exposure_level).toBe('PUBLIC');
    expect(body.requires_redaction).toBe(false);
    expect(body.blocked_reason).toBeNull();
    expect(body.redaction_rules).toBeNull();
  });

  it('allows CONFIDENTIAL exposure with redaction rules', async () => {
    const { req } = buildApp([
      sessionQuery(),
      {
        pattern: 'SELECT ai_exposure, pii, phi, minor_data FROM data_classification',
        result: { ai_exposure: 'CONFIDENTIAL', pii: 'YES', phi: 'NO', minor_data: 'NO' },
      },
      { pattern: 'INSERT INTO ai_exposure_log', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/validate-exposure', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ request_id: 'req-2' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.allowed).toBe(true);
    expect(body.requires_redaction).toBe(true);
    expect(body.redaction_rules).toBeDefined();
    expect(body.redaction_rules.mask_pii).toBe(true);
    expect(body.redaction_rules.mask_phi).toBe(false);
  });

  it('blocks PROHIBITED exposure (L-SPG3)', async () => {
    const { req } = buildApp([
      sessionQuery(),
      {
        pattern: 'SELECT ai_exposure, pii, phi, minor_data FROM data_classification',
        result: { ai_exposure: 'PROHIBITED', pii: 'YES', phi: 'YES', minor_data: 'YES' },
      },
      { pattern: 'INSERT INTO ai_exposure_log', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/validate-exposure', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ request_id: 'req-3' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.allowed).toBe(false);
    expect(body.exposure_level).toBe('PROHIBITED');
    expect(body.blocked_reason).toContain('L-SPG3');
    expect(body.blocked_reason).toContain('PROHIBITED');
  });

  it('blocks RESTRICTED exposure requiring Director authorization', async () => {
    const { req } = buildApp([
      sessionQuery(),
      {
        pattern: 'SELECT ai_exposure, pii, phi, minor_data FROM data_classification',
        result: { ai_exposure: 'RESTRICTED', pii: 'YES', phi: 'NO', minor_data: 'NO' },
      },
      { pattern: 'INSERT INTO ai_exposure_log', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/validate-exposure', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ request_id: 'req-4' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.allowed).toBe(false);
    expect(body.exposure_level).toBe('RESTRICTED');
    expect(body.blocked_reason).toContain('Director authorization');
  });

  it('defaults to RESTRICTED when no classification exists (L-SPG4)', async () => {
    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT ai_exposure, pii, phi, minor_data FROM data_classification', result: null },
      { pattern: 'INSERT INTO ai_exposure_log', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/validate-exposure', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ request_id: 'req-5' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.allowed).toBe(false);
    expect(body.exposure_level).toBe('RESTRICTED');
    expect(body.blocked_reason).toContain('RESTRICTED');
  });

  it('allows INTERNAL exposure without redaction', async () => {
    const { req } = buildApp([
      sessionQuery(),
      {
        pattern: 'SELECT ai_exposure, pii, phi, minor_data FROM data_classification',
        result: { ai_exposure: 'INTERNAL', pii: 'NO', phi: 'NO', minor_data: 'NO' },
      },
      { pattern: 'INSERT INTO ai_exposure_log', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/validate-exposure', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ request_id: 'req-6' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.allowed).toBe(true);
    expect(body.requires_redaction).toBe(false);
    expect(body.exposure_level).toBe('INTERNAL');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp([]);

    const res = await req('/api/v1/projects/proj-1/security/validate-exposure', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ request_id: 'req-7' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// POST /:projectId/security/classify — Resource-Level Classification (GS:DC)
// ============================================================================
describe('POST /api/v1/projects/:projectId/security/classify', () => {
  const classifyBody = {
    resource_type: 'SCOPE',
    resource_id: 'scope-1',
    classification: 'INTERNAL',
    classification_reason: 'Low-risk internal scope',
    ai_exposure_allowed: true,
  };

  it('classifies a resource and returns success', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQueryWithOwner(),
      // INSERT security_classifications (upsert)
      { pattern: 'INSERT INTO security_classifications', runResult: { success: true, changes: 1 } },
      // INSERT decisions (audit)
      { pattern: 'INSERT INTO decisions', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classify', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(classifyBody),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.resource_type).toBe('SCOPE');
    expect(body.resource_id).toBe('scope-1');
    expect(body.classification).toBe('INTERNAL');
    expect(body.ai_exposure_allowed).toBe(true);
  });

  it('rejects invalid resource_type', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQueryWithOwner(),
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classify', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ ...classifyBody, resource_type: 'INVALID' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error).toContain('Invalid resource_type');
    expect(body.error).toContain('SCOPE');
    expect(body.error).toContain('DELIVERABLE');
  });

  it('rejects invalid classification level', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQueryWithOwner(),
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classify', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ ...classifyBody, classification: 'TOP_SECRET' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error).toContain('Invalid classification');
    expect(body.error).toContain('PUBLIC');
    expect(body.error).toContain('RESTRICTED');
  });

  it('rejects invalid retention_policy', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQueryWithOwner(),
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classify', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ ...classifyBody, retention_policy: 'FOREVER' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error).toContain('Invalid retention_policy');
  });

  it('accepts valid retention_policy and calculates expiry', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQueryWithOwner(),
      { pattern: 'INSERT INTO security_classifications', runResult: { success: true, changes: 1 } },
      { pattern: 'INSERT INTO decisions', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classify', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ ...classifyBody, retention_policy: '30_DAYS' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.retention_policy).toBe('30_DAYS');
    expect(body.retention_expires_at).toBeDefined();
    // Verify the expiry is roughly 30 days from now.
    // The server uses setDate(getDate() + 30) which preserves local wall-clock time,
    // so around DST transitions the UTC offset can shift by ±1h vs raw ms addition.
    // Use the same calculation as the server for an accurate comparison.
    const expiresAt = new Date(body.retention_expires_at).getTime();
    const expected = new Date();
    expected.setDate(expected.getDate() + 30);
    const tolerance = 5 * 60 * 1000; // 5 minutes
    expect(expiresAt).toBeGreaterThan(expected.getTime() - tolerance);
    expect(expiresAt).toBeLessThan(expected.getTime() + tolerance);
  });

  it('sets retention_expires_at to null for PERMANENT retention', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQueryWithOwner(),
      { pattern: 'INSERT INTO security_classifications', runResult: { success: true, changes: 1 } },
      { pattern: 'INSERT INTO decisions', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classify', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ ...classifyBody, retention_policy: 'PERMANENT' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.retention_policy).toBe('PERMANENT');
    expect(body.retention_expires_at).toBeNull();
  });

  it('defaults ai_exposure_allowed to true when not provided', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQueryWithOwner(),
      { pattern: 'INSERT INTO security_classifications', runResult: { success: true, changes: 1 } },
      { pattern: 'INSERT INTO decisions', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classify', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        resource_type: 'FILE',
        resource_id: 'file-1',
        classification: 'PUBLIC',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.ai_exposure_allowed).toBe(true);
  });

  it('sets ai_exposure_allowed to false when explicitly set', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQueryWithOwner(),
      { pattern: 'INSERT INTO security_classifications', runResult: { success: true, changes: 1 } },
      { pattern: 'INSERT INTO decisions', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/security/classify', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        resource_type: 'MESSAGE',
        resource_id: 'msg-1',
        classification: 'CONFIDENTIAL',
        ai_exposure_allowed: false,
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.ai_exposure_allowed).toBe(false);
  });

  it('returns 404 when project not owned', async () => {
    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id, owner_id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-999/security/classify', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(classifyBody),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp([]);

    const res = await req('/api/v1/projects/proj-1/security/classify', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(classifyBody),
    });

    expect(res.status).toBe(401);
  });

  it('accepts all four valid resource types', async () => {
    for (const resourceType of ['SCOPE', 'DELIVERABLE', 'MESSAGE', 'FILE']) {
      const { req } = buildApp([
        sessionQuery(),
        ownerQueryWithOwner(),
        { pattern: 'INSERT INTO security_classifications', runResult: { success: true, changes: 1 } },
        { pattern: 'INSERT INTO decisions', runResult: { success: true, changes: 1 } },
      ]);

      const res = await req('/api/v1/projects/proj-1/security/classify', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ ...classifyBody, resource_type: resourceType, resource_id: `${resourceType.toLowerCase()}-1` }),
      });

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.resource_type).toBe(resourceType);
    }
  });
});

// ============================================================================
// Cross-cutting: Auth & Ownership
// ============================================================================
describe('Security API — Cross-cutting auth and ownership', () => {
  it('returns 401 for all endpoints without Bearer token', async () => {
    const { req } = buildApp([]);

    const endpoints = [
      { path: '/api/v1/projects/proj-1/security/gates', method: 'GET' },
      { path: '/api/v1/projects/proj-1/security/classification', method: 'GET' },
      { path: '/api/v1/projects/proj-1/security/classification', method: 'PUT' },
      { path: '/api/v1/projects/proj-1/security/validate-exposure', method: 'POST' },
      { path: '/api/v1/projects/proj-1/security/classify', method: 'POST' },
    ];

    for (const ep of endpoints) {
      const init: RequestInit = { method: ep.method, headers: jsonHeaders };
      if (ep.method === 'PUT' || ep.method === 'POST') {
        init.body = JSON.stringify({});
      }
      const res = await req(ep.path, init);
      expect(res.status).toBe(401);
    }
  });
});
