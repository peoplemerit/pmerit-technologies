/**
 * Rate Limiting Middleware Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { rateLimit } from '../src/middleware/rateLimit';
import type { Env } from '../src/types';

// Mock D1 Database
// Simulates the atomic INSERT ... ON CONFLICT ... RETURNING request_count upsert
const createMockDB = () => {
  const store = new Map<string, { request_count: number }>();

  return {
    prepare: (query: string) => ({
      bind: (...args: unknown[]) => ({
        first: async () => {
          // Handle atomic upsert: INSERT ... ON CONFLICT DO UPDATE SET request_count = request_count + 1 RETURNING
          if (query.includes('INSERT') && query.includes('ON CONFLICT') && query.includes('RETURNING')) {
            const compositeKey = args[0] as string;
            const existing = store.get(compositeKey);
            if (existing) {
              existing.request_count += 1;
              return { request_count: existing.request_count };
            } else {
              store.set(compositeKey, { request_count: 1 });
              return { request_count: 1 };
            }
          }
          // Fallback for plain SELECT queries
          const key = `${args[0]}:${args[1]}`;
          return store.get(key) || null;
        },
        run: async () => {
          return { meta: { changes: 1 } };
        },
      }),
    }),
  } as unknown as D1Database;
};

describe('Rate Limiting Middleware', () => {
  let app: Hono<{ Bindings: Env }>;

  beforeEach(() => {
    app = new Hono<{ Bindings: Env }>();
    app.use('*', async (c, next) => {
      c.env = { DB: createMockDB() } as unknown as Env;
      await next();
    });
  });

  it('should allow requests within limit', async () => {
    app.use('*', rateLimit({ windowMs: 60000, maxRequests: 5 }));
    app.get('/test', (c) => c.json({ success: true }));

    // First request should succeed
    const res1 = await app.request('/test', {
      headers: { 'cf-connecting-ip': '1.2.3.4' },
    });

    expect(res1.status).toBe(200);
    expect(res1.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(res1.headers.get('X-RateLimit-Remaining')).toBe('4');
  });

  it('should block requests exceeding limit', async () => {
    const mockDB = createMockDB();
    app.use('*', async (c, next) => {
      c.env = { DB: mockDB } as unknown as Env;
      await next();
    });

    app.use('*', rateLimit({ windowMs: 60000, maxRequests: 2 }));
    app.get('/test', (c) => c.json({ success: true }));

    // Make 3 requests with same IP
    const headers = { 'cf-connecting-ip': '1.2.3.4' };

    const res1 = await app.request('/test', { headers });
    expect(res1.status).toBe(200);

    const res2 = await app.request('/test', { headers });
    expect(res2.status).toBe(200);

    const res3 = await app.request('/test', { headers });
    expect(res3.status).toBe(429);

    const body = await res3.json();
    expect(body).toMatchObject({
      error: 'Rate limit exceeded',
    });
    expect(res3.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(res3.headers.get('Retry-After')).toBeTruthy();
  });

  it('should use custom key generator', async () => {
    app.use('*', async (c, next) => {
      c.set('userId', 'user123');
      await next();
    });

    app.use(
      '*',
      rateLimit({
        windowMs: 60000,
        maxRequests: 3,
        keyGenerator: (c) => c.get('userId'),
      })
    );

    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');
    expect(res.status).toBe(200);
  });

  it('should handle different IPs independently', async () => {
    const mockDB = createMockDB();
    app.use('*', async (c, next) => {
      c.env = { DB: mockDB } as unknown as Env;
      await next();
    });

    app.use('*', rateLimit({ windowMs: 60000, maxRequests: 1 }));
    app.get('/test', (c) => c.json({ success: true }));

    // Request from IP1
    const res1 = await app.request('/test', {
      headers: { 'cf-connecting-ip': '1.1.1.1' },
    });
    expect(res1.status).toBe(200);

    // Request from IP2 should also succeed (different key)
    const res2 = await app.request('/test', {
      headers: { 'cf-connecting-ip': '2.2.2.2' },
    });
    expect(res2.status).toBe(200);

    // Second request from IP1 should be blocked
    const res3 = await app.request('/test', {
      headers: { 'cf-connecting-ip': '1.1.1.1' },
    });
    expect(res3.status).toBe(429);
  });

  it('should include proper rate limit headers', async () => {
    app.use('*', rateLimit({ windowMs: 60000, maxRequests: 10 }));
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test', {
      headers: { 'cf-connecting-ip': '1.2.3.4' },
    });

    expect(res.headers.get('X-RateLimit-Limit')).toBe('10');
    expect(res.headers.get('X-RateLimit-Remaining')).toBeTruthy();
    expect(res.headers.get('X-RateLimit-Reset')).toBeTruthy();
  });
});
