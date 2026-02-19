/**
 * Brainstorm API Endpoint Tests
 *
 * Tests the brainstorm sub-router mounted at /api/v1/projects:
 *   POST /:projectId/brainstorm/artifacts     -- Create brainstorm artifact
 *   GET  /:projectId/brainstorm/artifacts      -- Get latest brainstorm artifact
 *   POST /:projectId/brainstorm/validate       -- Validate brainstorm artifact
 *   GET  /:projectId/brainstorm/validation     -- Get last validation result (alias)
 *   GET  /:projectId/brainstorm/readiness      -- Readiness scoring
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types';
import { type MockQueryResult, makeBrainstormArtifact, genId } from '../helpers';
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

let brainstormRouter: any;
let token: string;
let tokenHash: string;

beforeEach(async () => {
  vi.clearAllMocks();
  const session = await createTestSession();
  token = session.token;
  tokenHash = session.tokenHash;
  const mod = await import('../../src/api/brainstorm');
  brainstormRouter = mod.default;
});

function buildApp(queries: MockQueryResult[] = []) {
  const env = createMockEnv(queries);
  const app = new Hono<{ Bindings: Env }>();
  app.route('/api/v1/projects', brainstormRouter);
  const req = (path: string, init?: RequestInit) => app.request(path, init, env);
  return { app, env, req };
}

// ---------------------------------------------------------------------------
// Reusable query factories
// ---------------------------------------------------------------------------

/** Auth session lookup -- matches requireAuth's JOIN query on token_hash */
function sessionQuery(userId = 'user-1'): MockQueryResult {
  return {
    pattern: 'token_hash',
    result: { user_id: userId, id: 'sess-1', email: 'test@test.com' },
  };
}

/** Project ownership verification -- matches verifyProjectOwnership query */
function ownerQuery(projectId = 'proj-1', userId = 'user-1'): MockQueryResult {
  return {
    pattern: 'SELECT id FROM projects WHERE id',
    result: { id: projectId, owner_id: userId },
  };
}

/** A fully valid brainstorm artifact body for creation */
function validArtifactBody() {
  return {
    options: [
      {
        id: 'opt-1',
        title: 'Option Alpha',
        description: 'Build a monolith first, then decompose',
        assumptions: ['Team has monolith experience already'],
        kill_conditions: ['Latency exceeds 500ms at p99'],
      },
      {
        id: 'opt-2',
        title: 'Option Beta',
        description: 'Start with microservices from day one',
        assumptions: ['Infrastructure budget is sufficient for services'],
        kill_conditions: ['Deployment frequency drops below 1/week'],
      },
      {
        id: 'opt-3',
        title: 'Option Gamma',
        description: 'Use a serverless architecture with event-driven design',
        assumptions: ['Cloud provider offers required serverless primitives'],
        kill_conditions: ['Cold start latency exceeds 3 seconds average'],
      },
    ],
    assumptions: ['Market window is 6 months or less for launch'],
    decision_criteria: {
      criteria: [
        { name: 'Feasibility', weight: 3 },
        { name: 'Time to Market', weight: 4 },
      ],
    },
    kill_conditions: ['Budget exceeds $100000 total spend'],
    recommendation: 'NO_SELECTION',
    generated_by: 'ai',
  };
}

/** A body with only one option -- violates min-2-options rule */
function singleOptionBody() {
  return {
    options: [
      {
        id: 'opt-solo',
        title: 'Only Option',
        description: 'There is only one choice here',
        assumptions: ['We assume this is the only path forward'],
        kill_conditions: ['Revenue fails to exceed $500/month'],
      },
    ],
    assumptions: ['Global assumption about timing window'],
    decision_criteria: { criteria: [{ name: 'Cost', weight: 2 }] },
    kill_conditions: ['Overall budget exceeds $20000'],
  };
}

/** A body with zero options */
function emptyOptionsBody() {
  return {
    options: [],
    assumptions: ['Some global assumption text'],
    decision_criteria: { criteria: [{ name: 'Viability', weight: 3 }] },
    kill_conditions: ['Project cancelled by leadership team'],
  };
}

/** A body with options missing required fields (title/description) */
function incompleteOptionsBody() {
  return {
    options: [
      { id: 'opt-1', title: '', description: 'Has description but no title', assumptions: ['Something'], kill_conditions: ['Revenue below $100'] },
      { id: 'opt-2', title: 'Has title', description: '', assumptions: ['Something else'], kill_conditions: ['Churn exceeds 50%'] },
    ],
    assumptions: ['Global assumption string here'],
    decision_criteria: { criteria: [{ name: 'Quality', weight: 4 }] },
    kill_conditions: ['Budget threshold exceeded at $30000'],
  };
}

/** Body with options missing assumptions (BLOCK check B2) */
function missingAssumptionsBody() {
  return {
    options: [
      { id: 'opt-1', title: 'Option A', description: 'First approach desc', assumptions: [], kill_conditions: ['Revenue below $100'] },
      { id: 'opt-2', title: 'Option B', description: 'Second approach desc', assumptions: ['Has assumption here'], kill_conditions: ['Churn exceeds 50%'] },
    ],
    assumptions: ['Global assumption about timeline'],
    decision_criteria: { criteria: [{ name: 'Risk', weight: 3 }] },
    kill_conditions: ['Overall kill if budget exceeds $50000'],
  };
}

/** Body with options missing kill conditions (BLOCK check B3) */
function missingKillConditionsBody() {
  return {
    options: [
      { id: 'opt-1', title: 'Option A', description: 'First approach desc', assumptions: ['Has one assumption'], kill_conditions: [] },
      { id: 'opt-2', title: 'Option B', description: 'Second approach desc', assumptions: ['Has another assumption'], kill_conditions: ['Churn exceeds 50%'] },
    ],
    assumptions: ['Global assumption about timeline'],
    decision_criteria: { criteria: [{ name: 'Risk', weight: 3 }] },
    kill_conditions: ['Overall kill if budget exceeds $50000'],
  };
}

/** Body with no decision criteria (BLOCK check B4) */
function noCriteriaBody() {
  return {
    options: [
      { id: 'opt-1', title: 'Option A', description: 'First approach desc', assumptions: ['Market exists for this thing'], kill_conditions: ['Revenue below $1000'] },
      { id: 'opt-2', title: 'Option B', description: 'Second approach desc', assumptions: ['Technology is ready enough'], kill_conditions: ['Performance drops below 100ms'] },
    ],
    assumptions: ['Global assumption about budget limits'],
    decision_criteria: { criteria: [] },
    kill_conditions: ['Budget exceeds $50000 total spend'],
  };
}

/** Body with duplicate option titles (WARN check W1) */
function duplicateTitlesBody() {
  return {
    options: [
      { id: 'opt-1', title: 'Same Name', description: 'First approach desc', assumptions: ['Market exists for this thing'], kill_conditions: ['Revenue below $1000'] },
      { id: 'opt-2', title: 'Same Name', description: 'Different description', assumptions: ['Technology is available now'], kill_conditions: ['Latency exceeds 200ms at p95'] },
      { id: 'opt-3', title: 'Unique Option', description: 'Third approach with distinct name', assumptions: ['Team capacity is sufficient'], kill_conditions: ['Development time exceeds 6 months'] },
    ],
    assumptions: ['Global assumption about market timing'],
    decision_criteria: { criteria: [{ name: 'Feasibility', weight: 3 }] },
    kill_conditions: ['Budget exceeds $50000 total spend'],
  };
}

/** A stored artifact row as returned from the DB */
function storedArtifactRow(overrides: Partial<ReturnType<typeof makeBrainstormArtifact>> = {}) {
  return makeBrainstormArtifact({
    id: 'artifact-1',
    project_id: 'proj-1',
    version: 1,
    status: 'DRAFT',
    ...overrides,
  });
}

// ============================================================================
// POST /:projectId/brainstorm/artifacts -- Create artifact
// ============================================================================
describe('POST /api/v1/projects/:projectId/brainstorm/artifacts', () => {
  it('creates a new brainstorm artifact with valid options (>=2)', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // version lookup -- no existing artifact
      { pattern: 'SELECT version FROM brainstorm_artifacts', result: null },
      // INSERT
      { pattern: 'INSERT INTO brainstorm_artifacts', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/artifacts', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(validArtifactBody()),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { id: string; version: number; status: string; project_id: string };
    expect(body.version).toBe(1);
    expect(body.status).toBe('DRAFT');
    expect(body.project_id).toBe('proj-1');
    expect(body.id).toBeDefined();
  });

  it('bumps version when a previous artifact exists', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // Existing version 3
      { pattern: 'SELECT version FROM brainstorm_artifacts', result: { version: 3 } },
      // Mark old as HISTORICAL
      { pattern: 'UPDATE brainstorm_artifacts SET status', runResult: { success: true } },
      // INSERT new
      { pattern: 'INSERT INTO brainstorm_artifacts', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/artifacts', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(validArtifactBody()),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { version: number };
    expect(body.version).toBe(4);
  });

  it('creates artifact even with only 1 option (creation does not block, validation does)', async () => {
    // Note: The POST endpoint does NOT enforce min-2-options at creation time.
    // Enforcement happens at the validate/readiness endpoints.
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT version FROM brainstorm_artifacts', result: null },
      { pattern: 'INSERT INTO brainstorm_artifacts', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/artifacts', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(singleOptionBody()),
    });

    // Creation succeeds -- validation is a separate step
    expect(res.status).toBe(201);
  });

  it('returns 404 when project is not owned by user', async () => {
    const { req } = buildApp([
      sessionQuery(),
      // ownership check fails
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-other/brainstorm/artifacts', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(validArtifactBody()),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Project not found');
  });

  it('returns 401 without auth token', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/brainstorm/artifacts', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(validArtifactBody()),
    });

    expect(res.status).toBe(401);
  });

  it('marks previous DRAFT/ACTIVE artifacts as HISTORICAL on new creation', async () => {
    const { env, req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT version FROM brainstorm_artifacts', result: { version: 2 } },
      { pattern: 'UPDATE brainstorm_artifacts SET status', runResult: { success: true, changes: 1 } },
      { pattern: 'INSERT INTO brainstorm_artifacts', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/artifacts', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(validArtifactBody()),
    });

    expect(res.status).toBe(201);

    // Verify the UPDATE query was executed (marking old as HISTORICAL)
    const db = env.DB as any;
    const updateCall = db._executions.find(
      (e: { sql: string }) => e.sql.includes('HISTORICAL')
    );
    expect(updateCall).toBeDefined();
  });
});

// ============================================================================
// GET /:projectId/brainstorm/artifacts -- List/Get artifacts
// ============================================================================
describe('GET /api/v1/projects/:projectId/brainstorm/artifacts', () => {
  it('returns the latest brainstorm artifact', async () => {
    const artifact = storedArtifactRow();
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/artifacts', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { id: string; version: number; options: unknown[] };
    expect(body.id).toBe('artifact-1');
    expect(body.version).toBe(1);
    // options should be parsed from JSON string to array
    expect(Array.isArray(body.options)).toBe(true);
    expect(body.options.length).toBe(2);
  });

  it('returns 404 when no artifact exists', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/artifacts', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('No brainstorm artifact found');
  });

  it('returns 404 when project is not owned by user', async () => {
    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-other/brainstorm/artifacts', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth token', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/brainstorm/artifacts');

    expect(res.status).toBe(401);
  });

  it('parses JSON columns (options, assumptions, decision_criteria, kill_conditions)', async () => {
    const artifact = storedArtifactRow();
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/artifacts', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      options: unknown[];
      assumptions: unknown[];
      decision_criteria: { criteria: unknown[] };
      kill_conditions: unknown[];
    };

    expect(Array.isArray(body.options)).toBe(true);
    expect(Array.isArray(body.assumptions)).toBe(true);
    expect(body.decision_criteria).toHaveProperty('criteria');
    expect(Array.isArray(body.kill_conditions)).toBe(true);
  });
});

// ============================================================================
// POST /:projectId/brainstorm/validate -- Validation engine
// ============================================================================
describe('POST /api/v1/projects/:projectId/brainstorm/validate', () => {
  it('returns valid=true for a fully valid artifact', async () => {
    const body = validArtifactBody();
    const artifact = storedArtifactRow({
      options: JSON.stringify(body.options),
      assumptions: JSON.stringify(body.assumptions),
      decision_criteria: JSON.stringify(body.decision_criteria),
      kill_conditions: JSON.stringify(body.kill_conditions),
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/validate', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      valid: boolean;
      block_count: number;
      warn_count: number;
      checks: Array<{ check: string; level: string; passed: boolean }>;
      artifact_id: string;
    };
    expect(result.valid).toBe(true);
    expect(result.block_count).toBe(0);
    expect(result.artifact_id).toBe('artifact-1');
  });

  it('BLOCKS when artifact has fewer than 3 options (min-3-options rule, L-BRN)', async () => {
    const body = singleOptionBody();
    const artifact = storedArtifactRow({
      options: JSON.stringify(body.options),
      assumptions: JSON.stringify(body.assumptions),
      decision_criteria: JSON.stringify(body.decision_criteria),
      kill_conditions: JSON.stringify(body.kill_conditions),
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/validate', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      valid: boolean;
      block_count: number;
      checks: Array<{ check: string; level: string; passed: boolean; detail: string }>;
      summary: string;
    };
    expect(result.valid).toBe(false);
    expect(result.block_count).toBeGreaterThanOrEqual(1);

    const optionCheck = result.checks.find(c => c.check === 'option_count');
    expect(optionCheck).toBeDefined();
    expect(optionCheck!.passed).toBe(false);
    expect(optionCheck!.level).toBe('BLOCK');
    expect(optionCheck!.detail).toContain('minimum 3 required');
    expect(result.summary).toContain('BLOCKED');
  });

  it('BLOCKS when artifact has zero options', async () => {
    const body = emptyOptionsBody();
    const artifact = storedArtifactRow({
      options: JSON.stringify(body.options),
      assumptions: JSON.stringify(body.assumptions),
      decision_criteria: JSON.stringify(body.decision_criteria),
      kill_conditions: JSON.stringify(body.kill_conditions),
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/validate', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as { valid: boolean; block_count: number };
    expect(result.valid).toBe(false);
    expect(result.block_count).toBeGreaterThanOrEqual(1);
  });

  it('BLOCKS when options have empty title or description (B5)', async () => {
    const body = incompleteOptionsBody();
    const artifact = storedArtifactRow({
      options: JSON.stringify(body.options),
      assumptions: JSON.stringify(body.assumptions),
      decision_criteria: JSON.stringify(body.decision_criteria),
      kill_conditions: JSON.stringify(body.kill_conditions),
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/validate', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      valid: boolean;
      checks: Array<{ check: string; passed: boolean }>;
    };
    expect(result.valid).toBe(false);
    const emptyCheck = result.checks.find(c => c.check === 'no_empty_sections');
    expect(emptyCheck).toBeDefined();
    expect(emptyCheck!.passed).toBe(false);
  });

  it('BLOCKS when options are missing assumptions (B2)', async () => {
    const body = missingAssumptionsBody();
    const artifact = storedArtifactRow({
      options: JSON.stringify(body.options),
      assumptions: JSON.stringify(body.assumptions),
      decision_criteria: JSON.stringify(body.decision_criteria),
      kill_conditions: JSON.stringify(body.kill_conditions),
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/validate', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      valid: boolean;
      checks: Array<{ check: string; passed: boolean; detail: string }>;
    };
    expect(result.valid).toBe(false);
    const assumptionCheck = result.checks.find(c => c.check === 'option_assumptions');
    expect(assumptionCheck).toBeDefined();
    expect(assumptionCheck!.passed).toBe(false);
    expect(assumptionCheck!.detail).toContain('missing assumptions');
  });

  it('BLOCKS when options are missing kill conditions (B3)', async () => {
    const body = missingKillConditionsBody();
    const artifact = storedArtifactRow({
      options: JSON.stringify(body.options),
      assumptions: JSON.stringify(body.assumptions),
      decision_criteria: JSON.stringify(body.decision_criteria),
      kill_conditions: JSON.stringify(body.kill_conditions),
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/validate', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      valid: boolean;
      checks: Array<{ check: string; passed: boolean; detail: string }>;
    };
    expect(result.valid).toBe(false);
    const killCheck = result.checks.find(c => c.check === 'option_kill_conditions');
    expect(killCheck).toBeDefined();
    expect(killCheck!.passed).toBe(false);
    expect(killCheck!.detail).toContain('missing kill conditions');
  });

  it('BLOCKS when no decision criteria are present (B4)', async () => {
    const body = noCriteriaBody();
    const artifact = storedArtifactRow({
      options: JSON.stringify(body.options),
      assumptions: JSON.stringify(body.assumptions),
      decision_criteria: JSON.stringify(body.decision_criteria),
      kill_conditions: JSON.stringify(body.kill_conditions),
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/validate', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      valid: boolean;
      checks: Array<{ check: string; passed: boolean; detail: string }>;
    };
    expect(result.valid).toBe(false);
    const criteriaCheck = result.checks.find(c => c.check === 'decision_criteria_present');
    expect(criteriaCheck).toBeDefined();
    expect(criteriaCheck!.passed).toBe(false);
    expect(criteriaCheck!.detail).toContain('No decision criteria');
  });

  it('WARNs on duplicate option titles (W1) but still valid', async () => {
    const body = duplicateTitlesBody();
    const artifact = storedArtifactRow({
      options: JSON.stringify(body.options),
      assumptions: JSON.stringify(body.assumptions),
      decision_criteria: JSON.stringify(body.decision_criteria),
      kill_conditions: JSON.stringify(body.kill_conditions),
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/validate', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      valid: boolean;
      warn_count: number;
      checks: Array<{ check: string; level: string; passed: boolean }>;
    };
    // Duplicate titles is a WARN, not a BLOCK -- artifact remains valid
    expect(result.valid).toBe(true);
    expect(result.warn_count).toBeGreaterThanOrEqual(1);
    const distinctCheck = result.checks.find(c => c.check === 'options_distinct');
    expect(distinctCheck).toBeDefined();
    expect(distinctCheck!.passed).toBe(false);
    expect(distinctCheck!.level).toBe('WARN');
  });

  it('returns BLOCKED result when no artifact exists at all', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/validate', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      valid: boolean;
      block_count: number;
      checks: Array<{ check: string; passed: boolean; detail: string }>;
      summary: string;
    };
    expect(result.valid).toBe(false);
    expect(result.block_count).toBe(1);
    const existsCheck = result.checks.find(c => c.check === 'artifact_exists');
    expect(existsCheck).toBeDefined();
    expect(existsCheck!.passed).toBe(false);
    expect(result.summary).toContain('BLOCKED');
  });

  it('returns 401 without auth token', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/brainstorm/validate', {
      method: 'POST',
    });

    expect(res.status).toBe(401);
  });

  it('returns 404 for project not owned by user', async () => {
    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-other/brainstorm/validate', {
      method: 'POST',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });
});

// ============================================================================
// GET /:projectId/brainstorm/validation -- Validation alias (no body needed)
// ============================================================================
describe('GET /api/v1/projects/:projectId/brainstorm/validation', () => {
  it('returns validation result for a valid artifact', async () => {
    const body = validArtifactBody();
    const artifact = storedArtifactRow({
      options: JSON.stringify(body.options),
      assumptions: JSON.stringify(body.assumptions),
      decision_criteria: JSON.stringify(body.decision_criteria),
      kill_conditions: JSON.stringify(body.kill_conditions),
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/validation', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      valid: boolean;
      artifact_id: string;
      artifact_version: number;
      artifact_status: string;
    };
    expect(result.valid).toBe(true);
    expect(result.artifact_id).toBe('artifact-1');
    expect(result.artifact_version).toBe(1);
    expect(result.artifact_status).toBe('DRAFT');
  });

  it('returns BLOCKED when no artifact exists', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/validation', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      valid: boolean;
      artifact_id: null;
      summary: string;
    };
    expect(result.valid).toBe(false);
    expect(result.artifact_id).toBe(null);
    expect(result.summary).toContain('BLOCKED');
  });

  it('returns 401 without auth token', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/brainstorm/validation');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// GET /:projectId/brainstorm/readiness -- Readiness scoring
// ============================================================================
describe('GET /api/v1/projects/:projectId/brainstorm/readiness', () => {
  it('returns ready=true with all PASS dimensions for a complete artifact', async () => {
    const body = validArtifactBody();
    const artifact = storedArtifactRow({
      options: JSON.stringify(body.options),
      assumptions: JSON.stringify(body.assumptions),
      decision_criteria: JSON.stringify(body.decision_criteria),
      kill_conditions: JSON.stringify(body.kill_conditions),
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/readiness', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      ready: boolean;
      artifact_exists: boolean;
      dimensions: Array<{ dimension: string; status: string; detail: string }>;
      suggestion: string | null;
      artifact_id: string;
      artifact_version: number;
    };
    expect(result.ready).toBe(true);
    expect(result.artifact_exists).toBe(true);
    expect(result.artifact_id).toBe('artifact-1');
    expect(result.dimensions.length).toBe(4);

    // All dimensions should PASS
    const statuses = result.dimensions.map(d => d.status);
    expect(statuses.every(s => s === 'PASS')).toBe(true);
    expect(result.suggestion).toBeNull();
  });

  it('returns ready=false with FAIL dimension for <2 options', async () => {
    const body = singleOptionBody();
    const artifact = storedArtifactRow({
      options: JSON.stringify(body.options),
      assumptions: JSON.stringify(body.assumptions),
      decision_criteria: JSON.stringify(body.decision_criteria),
      kill_conditions: JSON.stringify(body.kill_conditions),
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/readiness', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      ready: boolean;
      dimensions: Array<{ dimension: string; status: string; detail: string }>;
      suggestion: string | null;
    };
    expect(result.ready).toBe(false);

    const optionsDim = result.dimensions.find(d => d.dimension === 'options');
    expect(optionsDim).toBeDefined();
    expect(optionsDim!.status).toBe('FAIL');
    expect(optionsDim!.detail).toContain('need at least 2');
    expect(result.suggestion).toContain('Fix required');
  });

  it('returns ready=false artifact_exists=false when no artifact exists', async () => {
    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/readiness', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      ready: boolean;
      artifact_exists: boolean;
      dimensions: unknown[];
      suggestion: string;
    };
    expect(result.ready).toBe(false);
    expect(result.artifact_exists).toBe(false);
    expect(result.dimensions).toEqual([]);
    expect(result.suggestion).toContain('No brainstorm artifact yet');
  });

  it('returns WARN dimension for duplicate titles but still ready=true', async () => {
    const body = duplicateTitlesBody();
    const artifact = storedArtifactRow({
      options: JSON.stringify(body.options),
      assumptions: JSON.stringify(body.assumptions),
      decision_criteria: JSON.stringify(body.decision_criteria),
      kill_conditions: JSON.stringify(body.kill_conditions),
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/readiness', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      ready: boolean;
      dimensions: Array<{ dimension: string; status: string }>;
      suggestion: string | null;
    };
    // Duplicates cause WARN in options dimension, but no FAIL -- still ready
    expect(result.ready).toBe(true);
    const optionsDim = result.dimensions.find(d => d.dimension === 'options');
    expect(optionsDim).toBeDefined();
    expect(optionsDim!.status).toBe('WARN');
    expect(result.suggestion).toContain('Improvements suggested');
  });

  it('returns FAIL in assumptions dimension when options have no assumptions', async () => {
    const body = missingAssumptionsBody();
    const artifact = storedArtifactRow({
      options: JSON.stringify(body.options),
      assumptions: JSON.stringify(body.assumptions),
      decision_criteria: JSON.stringify(body.decision_criteria),
      kill_conditions: JSON.stringify(body.kill_conditions),
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/readiness', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      ready: boolean;
      dimensions: Array<{ dimension: string; status: string; detail: string }>;
    };
    expect(result.ready).toBe(false);
    const assumptionDim = result.dimensions.find(d => d.dimension === 'assumptions');
    expect(assumptionDim).toBeDefined();
    expect(assumptionDim!.status).toBe('FAIL');
    expect(assumptionDim!.detail).toContain('no assumptions');
  });

  it('returns FAIL in kill_conditions dimension when options have none', async () => {
    const body = missingKillConditionsBody();
    const artifact = storedArtifactRow({
      options: JSON.stringify(body.options),
      assumptions: JSON.stringify(body.assumptions),
      decision_criteria: JSON.stringify(body.decision_criteria),
      kill_conditions: JSON.stringify(body.kill_conditions),
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/readiness', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      ready: boolean;
      dimensions: Array<{ dimension: string; status: string; detail: string }>;
    };
    expect(result.ready).toBe(false);
    const killDim = result.dimensions.find(d => d.dimension === 'kill_conditions');
    expect(killDim).toBeDefined();
    expect(killDim!.status).toBe('FAIL');
    expect(killDim!.detail).toContain('no kill conditions');
  });

  it('returns FAIL in decision_criteria dimension when criteria are empty', async () => {
    const body = noCriteriaBody();
    const artifact = storedArtifactRow({
      options: JSON.stringify(body.options),
      assumptions: JSON.stringify(body.assumptions),
      decision_criteria: JSON.stringify(body.decision_criteria),
      kill_conditions: JSON.stringify(body.kill_conditions),
    });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM brainstorm_artifacts WHERE project_id', result: artifact },
    ]);

    const res = await req('/api/v1/projects/proj-1/brainstorm/readiness', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const result = await res.json() as {
      ready: boolean;
      dimensions: Array<{ dimension: string; status: string; detail: string }>;
    };
    expect(result.ready).toBe(false);
    const criteriaDim = result.dimensions.find(d => d.dimension === 'decision_criteria');
    expect(criteriaDim).toBeDefined();
    expect(criteriaDim!.status).toBe('FAIL');
    expect(criteriaDim!.detail).toContain('No decision criteria');
  });

  it('returns 404 for project not owned by user', async () => {
    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-other/brainstorm/readiness', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth token', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/brainstorm/readiness');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Cross-cutting auth & ownership tests
// ============================================================================
describe('Auth & ownership enforcement across all brainstorm endpoints', () => {
  const endpoints = [
    { method: 'POST', path: '/api/v1/projects/proj-1/brainstorm/artifacts', body: JSON.stringify(validArtifactBody()) },
    { method: 'GET', path: '/api/v1/projects/proj-1/brainstorm/artifacts', body: undefined },
    { method: 'POST', path: '/api/v1/projects/proj-1/brainstorm/validate', body: undefined },
    { method: 'GET', path: '/api/v1/projects/proj-1/brainstorm/validation', body: undefined },
    { method: 'GET', path: '/api/v1/projects/proj-1/brainstorm/readiness', body: undefined },
  ];

  for (const { method, path, body } of endpoints) {
    it(`${method} ${path.replace('/api/v1/projects/proj-1', '...')} returns 401 without auth`, async () => {
      const { req } = buildApp();

      const res = await req(path, {
        method,
        headers: jsonHeaders,
        body,
      });

      expect(res.status).toBe(401);
    });
  }
});
