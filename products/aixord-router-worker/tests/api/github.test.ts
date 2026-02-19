/**
 * GitHub API Endpoint Tests
 *
 * Tests the GitHub sub-router mounted at /api/v1/github:
 *   GET    /status/:projectId            — Connection status
 *   DELETE /disconnect/:projectId        — Remove connection
 *   POST   /connect                      — Initiate OAuth
 *   GET    /repos                        — List repos
 *   PUT    /repo/:projectId              — Select repo
 *   PUT    /mode/:projectId              — Switch mode
 *   GET    /commits/:projectId           — List platform commits
 *
 * The sub-router applies requireAuth to all routes except /callback.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types';
import { type MockQueryResult } from '../helpers';
import { createMockEnv, createTestSession, jsonHeaders, authHeaders } from '../test-app';

// Mock crypto
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
  encryptAESGCM: vi.fn().mockResolvedValue('encrypted-token'),
  decryptAESGCM: vi.fn().mockResolvedValue('ghp_decrypted_token'),
}));

// Mock logger
vi.mock('../../src/utils/logger', () => ({
  log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// Mock github-write (used by POST /commit/:projectId via dynamic import)
vi.mock('../../src/services/github-write', () => ({
  commitFilesToGitHub: vi.fn().mockResolvedValue({
    success: true,
    commit_sha: 'abc1234567890def',
    tree_sha: 'tree123abc',
    branch: 'aixord/test-project',
    files_committed: 3,
    commit_url: 'https://github.com/testuser/my-repo/commit/abc1234567890def',
    pr_number: null,
    pr_url: null,
  }),
}));

let githubRouter: any;

beforeEach(async () => {
  vi.clearAllMocks();
  const mod = await import('../../src/api/github');
  githubRouter = mod.default;
});

function buildApp(queries: MockQueryResult[] = []) {
  const env = createMockEnv(queries);
  const app = new Hono<{ Bindings: Env }>();
  app.route('/api/v1/github', githubRouter);

  const req = (path: string, init?: RequestInit) =>
    app.request(path, init, env);

  return { app, env, req };
}

function sessionQuery(userId = 'user-1'): MockQueryResult {
  return { pattern: 'token_hash', result: { user_id: userId, id: 'sess-1', email: 'user@test.com' } };
}

function ownerQuery(): MockQueryResult {
  return { pattern: 'SELECT id FROM projects WHERE id', result: { id: 'proj-1', owner_id: 'user-1' } };
}

// ============================================================================
// Status Tests
// ============================================================================
describe('GET /api/v1/github/status/:projectId', () => {
  it('returns connected status when connection exists', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      {
        pattern: 'SELECT project_id, repo_owner, repo_name, scope, github_mode',
        result: {
          project_id: 'proj-1',
          repo_owner: 'testuser',
          repo_name: 'my-repo',
          scope: 'repo:status,read:org',
          github_mode: 'READ_ONLY',
          connected_at: '2026-01-01T00:00:00Z',
          last_sync: null,
        },
      },
    ]);

    const res = await req('/api/v1/github/status/proj-1', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { connected: boolean; repo_owner: string; github_mode: string };
    expect(body.connected).toBe(true);
    expect(body.repo_owner).toBe('testuser');
    expect(body.github_mode).toBe('READ_ONLY');
  });

  it('returns disconnected status when no connection', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT project_id, repo_owner, repo_name', result: null },
    ]);

    const res = await req('/api/v1/github/status/proj-1', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { connected: boolean; repo_owner: null };
    expect(body.connected).toBe(false);
    expect(body.repo_owner).toBeNull();
  });

  it('returns 404 for project not owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/github/status/proj-unknown', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/github/status/proj-1');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Disconnect Tests
// ============================================================================
describe('DELETE /api/v1/github/disconnect/:projectId', () => {
  it('disconnects existing connection', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // DELETE connection — 1 change
      { pattern: 'DELETE FROM github_connections', runResult: { success: true, changes: 1 } },
      // DELETE evidence
      { pattern: 'DELETE FROM github_evidence', runResult: { success: true, changes: 5 } },
    ]);

    const res = await req('/api/v1/github/disconnect/proj-1', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('returns 404 when no connection to disconnect', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // DELETE connection — 0 changes (no connection)
      { pattern: 'DELETE FROM github_connections', runResult: { success: true, changes: 0 } },
    ]);

    const res = await req('/api/v1/github/disconnect/proj-1', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('No connection');
  });

  it('returns 404 for project not owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id FROM projects WHERE id', result: null },
    ]);

    const res = await req('/api/v1/github/disconnect/proj-unknown', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/github/disconnect/proj-1', {
      method: 'DELETE',
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Connect Tests (OAuth initiation)
// ============================================================================
describe('POST /api/v1/github/connect', () => {
  it('returns auth URL for valid project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // INSERT or UPDATE oauth_states
      { pattern: 'oauth_states', runResult: { success: true, changes: 1 } },
      // INSERT or UPDATE github_connections (PENDING state)
      { pattern: 'github_connections', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/github/connect', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ project_id: 'proj-1', mode: 'READ_ONLY' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { authorization_url: string; state: string; expires_in: number };
    expect(body.authorization_url).toContain('github.com/login/oauth/authorize');
    expect(body.state).toBeDefined();
    expect(body.expires_in).toBe(600);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/github/connect', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ project_id: 'proj-1' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Commits List Tests
// ============================================================================
describe('GET /api/v1/github/commits/:projectId', () => {
  it('returns platform commits for project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      {
        pattern: 'github_commits',
        result: [
          { id: 'c1', commit_sha: 'abc123', commit_message: 'Initial scaffold', committed_at: '2026-01-01' },
          { id: 'c2', commit_sha: 'def456', commit_message: 'Add components', committed_at: '2026-01-02' },
        ],
      },
    ]);

    const res = await req('/api/v1/github/commits/proj-1', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { commits: Array<{ commit_sha: string }> };
    expect(body.commits).toHaveLength(2);
  });

  it('returns empty array when no commits', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'github_commits', result: [] },
    ]);

    const res = await req('/api/v1/github/commits/proj-1', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { commits: unknown[] };
    expect(body.commits).toEqual([]);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/github/commits/proj-1');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// POST /commit/:projectId — Commit files to GitHub (S1-T4)
// ============================================================================
describe('POST /api/v1/github/commit/:projectId', () => {
  function connectionQuery(mode = 'WORKSPACE_SYNC'): MockQueryResult {
    return {
      pattern: 'github_connections',
      result: {
        repo_owner: 'testuser',
        repo_name: 'my-repo',
        access_token_encrypted: 'encrypted-tok',
        github_mode: mode,
      },
    };
  }

  function projectNameQuery(): MockQueryResult {
    return { pattern: 'SELECT name FROM projects WHERE id', result: { name: 'Test Project' } };
  }

  function commitInsertQuery(): MockQueryResult {
    return { pattern: 'INSERT INTO github_commits', runResult: { success: true, changes: 1 } };
  }

  it('commits scaffold files and returns SHA', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      connectionQuery('WORKSPACE_SYNC'),
      projectNameQuery(),
      commitInsertQuery(),
    ]);

    const res = await req('/api/v1/github/commit/proj-1', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        files: [
          { path: 'src/index.ts', content: '// entry point' },
          { path: 'package.json', content: '{"name":"test"}' },
          { path: 'README.md', content: '# Test Project' },
        ],
        message: '[AIXORD] Initial scaffold — push local workspace to GitHub',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      success: boolean;
      commit_sha: string;
      branch: string;
      files_committed: number;
      commit_url: string;
    };
    expect(body.success).toBe(true);
    expect(body.commit_sha).toBe('abc1234567890def');
    expect(body.branch).toBe('aixord/test-project');
    expect(body.files_committed).toBe(3);
    expect(body.commit_url).toContain('github.com');
  });

  it('returns 400 when files array is empty', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/github/commit/proj-1', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        files: [],
        message: 'Empty commit',
      }),
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 when message is missing', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const res = await req('/api/v1/github/commit/proj-1', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        files: [{ path: 'test.ts', content: 'code' }],
      }),
    });

    expect(res.status).toBe(400);
  });

  it('returns 403 when mode is READ_ONLY', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      connectionQuery('READ_ONLY'),
    ]);

    const res = await req('/api/v1/github/commit/proj-1', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        files: [{ path: 'test.ts', content: 'code' }],
        message: 'Test commit',
      }),
    });

    expect(res.status).toBe(403);
    const body = await res.json() as { error: string; current_mode: string };
    expect(body.error).toContain('WORKSPACE_SYNC');
    expect(body.current_mode).toBe('READ_ONLY');
  });

  it('returns 404 when GitHub not connected', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'github_connections', result: null },
    ]);

    const res = await req('/api/v1/github/commit/proj-1', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        files: [{ path: 'test.ts', content: 'code' }],
        message: 'Test commit',
      }),
    });

    expect(res.status).toBe(404);
  });

  it('accepts scope_name for scope-level commits', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      connectionQuery('WORKSPACE_SYNC'),
      projectNameQuery(),
      commitInsertQuery(),
    ]);

    const res = await req('/api/v1/github/commit/proj-1', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        files: [{ path: 'src/components/App.tsx', content: 'export default App;' }],
        message: '[AIXORD] SCOPE: Authentication — 3 files',
        scope_name: 'Authentication',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; commit_sha: string };
    expect(body.success).toBe(true);
    expect(body.commit_sha).toBeDefined();
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/github/commit/proj-1', {
      method: 'POST',
      body: JSON.stringify({
        files: [{ path: 'test.ts', content: 'code' }],
        message: 'Test commit',
      }),
    });

    expect(res.status).toBe(401);
  });
});
