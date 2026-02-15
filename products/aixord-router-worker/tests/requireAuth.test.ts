/**
 * Auth Middleware Tests
 *
 * Tests for requireAuth middleware: token validation, legacy fallback,
 * and LEGACY_TOKEN_DEADLINE behavior.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { requireAuth } from '../src/middleware/requireAuth';
import type { Env } from '../src/types';

// Mock hashSHA256 to return a deterministic value
vi.mock('../src/utils/crypto', () => ({
  hashSHA256: vi.fn(async (input: string) => `hashed_${input}`),
}));

interface MockSession {
  user_id: string;
  id: string;
  email: string;
}

const createMockDB = (opts: {
  hashSession?: MockSession | null;
  plaintextSession?: MockSession | null;
  backfillCalled?: { called: boolean };
}) => {
  return {
    prepare: (query: string) => ({
      bind: (..._args: unknown[]) => ({
        first: async () => {
          if (query.includes('token_hash')) {
            return opts.hashSession ?? null;
          }
          if (query.includes('WHERE s.token = ?')) {
            return opts.plaintextSession ?? null;
          }
          return null;
        },
        run: async () => {
          if (query.includes('UPDATE sessions SET token_hash')) {
            if (opts.backfillCalled) opts.backfillCalled.called = true;
          }
          return { meta: { changes: 1 } };
        },
      }),
    }),
  } as unknown as D1Database;
};

describe('requireAuth middleware', () => {
  let app: Hono<{ Bindings: Env }>;

  it('should reject requests without Authorization header', async () => {
    app = new Hono<{ Bindings: Env }>();
    app.use('*', requireAuth);
    app.get('/test', (c) => c.json({ ok: true }));

    const res = await app.request('/test');
    expect(res.status).toBe(401);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('Authentication required');
  });

  it('should reject requests with non-Bearer auth', async () => {
    app = new Hono<{ Bindings: Env }>();
    app.use('*', requireAuth);
    app.get('/test', (c) => c.json({ ok: true }));

    const res = await app.request('/test', {
      headers: { Authorization: 'Basic abc123' },
    });
    expect(res.status).toBe(401);
  });

  it('should accept valid hashed token session', async () => {
    const session: MockSession = { user_id: 'u1', id: 's1', email: 'test@example.com' };
    const db = createMockDB({ hashSession: session });

    app = new Hono<{ Bindings: Env }>();
    app.use('*', async (c, next) => {
      c.env = { DB: db } as unknown as Env;
      await next();
    });
    app.use('*', requireAuth);
    app.get('/test', (c) => {
      return c.json({ userId: c.get('userId'), email: c.get('userEmail') });
    });

    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer valid-token' },
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ userId: string; email: string }>();
    expect(body.userId).toBe('u1');
    expect(body.email).toBe('test@example.com');
  });

  it('should reject invalid token (no session found)', async () => {
    const db = createMockDB({ hashSession: null, plaintextSession: null });

    app = new Hono<{ Bindings: Env }>();
    app.use('*', async (c, next) => {
      c.env = { DB: db } as unknown as Env;
      await next();
    });
    app.use('*', requireAuth);
    app.get('/test', (c) => c.json({ ok: true }));

    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer invalid-token' },
    });
    expect(res.status).toBe(401);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('Invalid or expired token');
  });

  it('should fallback to plaintext and backfill hash (before deadline)', async () => {
    const backfillTracker = { called: false };
    const session: MockSession = { user_id: 'u2', id: 's2', email: 'legacy@example.com' };
    const db = createMockDB({
      hashSession: null,
      plaintextSession: session,
      backfillCalled: backfillTracker,
    });

    app = new Hono<{ Bindings: Env }>();
    app.use('*', async (c, next) => {
      c.env = { DB: db } as unknown as Env;
      await next();
    });
    app.use('*', requireAuth);
    app.get('/test', (c) => {
      return c.json({ userId: c.get('userId') });
    });

    // This test runs before 2026-03-15, so plaintext fallback is active
    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer legacy-plaintext-token' },
    });
    expect(res.status).toBe(200);
    expect(backfillTracker.called).toBe(true);
  });
});
