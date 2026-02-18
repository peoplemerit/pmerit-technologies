/**
 * Messages API Endpoint Tests
 *
 * Tests the messages sub-router:
 *   GET    /api/v1/projects/:projectId/messages — List messages
 *   POST   /api/v1/projects/:projectId/messages — Create message
 *   DELETE /api/v1/projects/:projectId/messages — Clear messages
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types';
import { type MockQueryResult } from '../helpers';
import { createMockEnv, createTestSession, jsonHeaders, authHeaders } from '../test-app';

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

// Mock gate evaluation (triggered on user messages via waitUntil)
vi.mock('../../src/services/gateRules', () => ({
  triggerGateEvaluation: vi.fn().mockResolvedValue(undefined),
}));

let messagesRouter: any;

beforeEach(async () => {
  vi.clearAllMocks();
  const mod = await import('../../src/api/messages');
  messagesRouter = mod.default;
});

function buildApp(queries: MockQueryResult[] = []) {
  const env = createMockEnv(queries);
  const app = new Hono<{ Bindings: Env }>();

  // Provide mock executionCtx for waitUntil (used in POST for gate evaluation)
  app.use('/*', async (c, next) => {
    Object.defineProperty(c, 'executionCtx', {
      get: () => ({ waitUntil: (_p: Promise<unknown>) => {} }),
    });
    await next();
  });

  app.route('/api/v1/projects', messagesRouter);

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
// List Messages Tests
// ============================================================================
describe('GET /api/v1/projects/:projectId/messages', () => {
  it('returns messages for project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      {
        pattern: 'SELECT',
        result: [
          { id: 'msg-1', project_id: 'proj-1', role: 'user', content: 'Hello', metadata: '{}', created_at: '2026-01-01' },
          { id: 'msg-2', project_id: 'proj-1', role: 'assistant', content: 'Hi there', metadata: '{}', created_at: '2026-01-01' },
        ],
      },
    ]);

    const res = await req('/api/v1/projects/proj-1/messages', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { messages: Array<{ id: string; role: string }> };
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].role).toBe('user');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/messages');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Create Message Tests
// ============================================================================
describe('POST /api/v1/projects/:projectId/messages', () => {
  it('creates a user message', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // INSERT message
      { pattern: 'INSERT INTO messages', runResult: { success: true, changes: 1 } },
      // Gate evaluation queries (triggered for user messages)
      { pattern: 'SELECT', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/messages', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ role: 'user', content: 'What should I build?' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { id: string; role: string; content: string };
    expect(body.id).toBeDefined();
    expect(body.role).toBe('user');
    expect(body.content).toBe('What should I build?');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/messages', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ role: 'user', content: 'Hello' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Clear Messages Tests
// ============================================================================
describe('DELETE /api/v1/projects/:projectId/messages', () => {
  it('clears all project messages', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // DELETE messages
      { pattern: 'DELETE FROM messages', runResult: { success: true, changes: 10 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/messages', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/messages', {
      method: 'DELETE',
    });

    expect(res.status).toBe(401);
  });
});
