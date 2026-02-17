/**
 * Entitlement Middleware Tests
 *
 * Tests checkEntitlement middleware, incrementUsage, and getTierLimit
 * using mock D1 and Hono's sub-router test pattern.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { createMockDB, type MockQueryResult } from '../helpers';
import { createMockEnv } from '../test-app';
import type { Env } from '../../src/types';
import {
  checkEntitlement,
  incrementUsage,
  getTierLimit,
} from '../../src/middleware/entitlement';

// ============================================================================
// getTierLimit — Pure function tests
// ============================================================================
describe('getTierLimit', () => {
  it('returns 50 for TRIAL', () => {
    expect(getTierLimit('TRIAL')).toBe(50);
  });

  it('returns 500 for MANUSCRIPT_BYOK', () => {
    expect(getTierLimit('MANUSCRIPT_BYOK')).toBe(500);
  });

  it('returns 1000 for BYOK_STANDARD', () => {
    expect(getTierLimit('BYOK_STANDARD')).toBe(1000);
  });

  it('returns 500 for PLATFORM_STANDARD', () => {
    expect(getTierLimit('PLATFORM_STANDARD')).toBe(500);
  });

  it('returns 2000 for PLATFORM_PRO', () => {
    expect(getTierLimit('PLATFORM_PRO')).toBe(2000);
  });

  it('returns -1 for ENTERPRISE (unlimited)', () => {
    expect(getTierLimit('ENTERPRISE')).toBe(-1);
  });

  it('returns 50 (trial default) for unknown tier', () => {
    expect(getTierLimit('UNKNOWN_TIER')).toBe(50);
  });
});

// ============================================================================
// incrementUsage — DB interaction
// ============================================================================
describe('incrementUsage', () => {
  it('executes upsert with correct parameters', async () => {
    const db = createMockDB([
      { pattern: 'INSERT INTO usage_tracking', runResult: { success: true, changes: 1 } },
    ]);

    await incrementUsage(db as unknown as D1Database, 'user-1', 1500, 3, false);

    expect(db._executions).toHaveLength(1);
    expect(db._executions[0].sql).toContain('INSERT INTO usage_tracking');
    expect(db._executions[0].sql).toContain('ON CONFLICT');
    // Params: userId, period, tokensUsed, estimatedCostCents, isCodeTask(0),
    //         tokensUsed(dup), estimatedCostCents(dup), isCodeTask(dup)
    expect(db._executions[0].params[0]).toBe('user-1');
    // period is YYYY-MM
    expect(db._executions[0].params[1]).toMatch(/^\d{4}-\d{2}$/);
    expect(db._executions[0].params[2]).toBe(1500); // tokensUsed
    expect(db._executions[0].params[3]).toBe(3);    // estimatedCostCents
    expect(db._executions[0].params[4]).toBe(0);    // isCodeTask = false → 0
  });

  it('passes isCodeTask=1 when code task is true', async () => {
    const db = createMockDB([
      { pattern: 'INSERT INTO usage_tracking', runResult: { success: true, changes: 1 } },
    ]);

    await incrementUsage(db as unknown as D1Database, 'user-1', 500, 1, true);

    expect(db._executions[0].params[4]).toBe(1); // isCodeTask = true → 1
  });
});

// ============================================================================
// checkEntitlement — Hono middleware integration
// ============================================================================
describe('checkEntitlement', () => {
  // Build a minimal Hono app that uses checkEntitlement middleware
  function buildApp(queries: MockQueryResult[] = [], userId?: string) {
    const env = createMockEnv(queries);

    const app = new Hono<{ Bindings: Env }>();

    // Simulate auth middleware setting userId
    app.use('*', async (c, next) => {
      if (userId) {
        c.set('userId', userId);
      }
      await next();
    });

    // Apply entitlement middleware
    app.use('/api/v1/router/*', checkEntitlement);

    // Downstream handler
    app.post('/api/v1/router/execute', (c) => {
      return c.json({ ok: true });
    });

    const req = (path: string, init?: RequestInit) =>
      app.request(path, init, env);

    return { app, env, req };
  }

  it('returns 401 when no userId is set', async () => {
    const { req } = buildApp([], undefined);
    const res = await req('/api/v1/router/execute', { method: 'POST' });
    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('UNAUTHORIZED');
  });

  it('returns 404 when user not found in DB', async () => {
    const { req } = buildApp([
      { pattern: 'SELECT subscription_tier', result: null },
    ], 'user-1');

    const res = await req('/api/v1/router/execute', { method: 'POST' });
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('USER_NOT_FOUND');
  });

  it('returns 403 NO_ACTIVE_SUBSCRIPTION for NONE tier', async () => {
    const { req } = buildApp([
      {
        pattern: 'SELECT subscription_tier',
        result: { subscription_tier: 'NONE', trial_expires_at: null },
      },
    ], 'user-1');

    const res = await req('/api/v1/router/execute', { method: 'POST' });
    expect(res.status).toBe(403);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('NO_ACTIVE_SUBSCRIPTION');
  });

  it('returns 403 NO_ACTIVE_SUBSCRIPTION for invalid tier', async () => {
    const { req } = buildApp([
      {
        pattern: 'SELECT subscription_tier',
        result: { subscription_tier: 'BOGUS', trial_expires_at: null },
      },
    ], 'user-1');

    const res = await req('/api/v1/router/execute', { method: 'POST' });
    expect(res.status).toBe(403);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('NO_ACTIVE_SUBSCRIPTION');
  });

  it('returns 403 TRIAL_EXPIRED when trial has expired', async () => {
    const expired = new Date(Date.now() - 86400000).toISOString(); // 1 day ago
    const { req } = buildApp([
      {
        pattern: 'SELECT subscription_tier',
        result: { subscription_tier: 'TRIAL', trial_expires_at: expired },
      },
    ], 'user-1');

    const res = await req('/api/v1/router/execute', { method: 'POST' });
    expect(res.status).toBe(403);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('TRIAL_EXPIRED');
  });

  it('returns 429 ALLOWANCE_EXHAUSTED when request limit reached', async () => {
    const future = new Date(Date.now() + 86400000 * 7).toISOString(); // 7 days future
    const { req } = buildApp([
      {
        pattern: 'SELECT subscription_tier',
        result: { subscription_tier: 'TRIAL', trial_expires_at: future },
      },
      {
        pattern: 'SELECT request_count',
        result: { request_count: 50, code_task_count: 0 },
      },
    ], 'user-1');

    const res = await req('/api/v1/router/execute', { method: 'POST' });
    expect(res.status).toBe(429);
    const body = await res.json() as { error: string; usage: { used: number; limit: number } };
    expect(body.error).toBe('ALLOWANCE_EXHAUSTED');
    expect(body.usage.used).toBe(50);
    expect(body.usage.limit).toBe(50);
  });

  it('passes through when trial is active and under limit', async () => {
    const future = new Date(Date.now() + 86400000 * 7).toISOString();
    const { req } = buildApp([
      {
        pattern: 'SELECT subscription_tier',
        result: { subscription_tier: 'TRIAL', trial_expires_at: future },
      },
      {
        pattern: 'SELECT request_count',
        result: { request_count: 10, code_task_count: 0 },
      },
    ], 'user-1');

    const res = await req('/api/v1/router/execute', { method: 'POST' });
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it('passes through for PLATFORM_PRO with usage under limit', async () => {
    const { req } = buildApp([
      {
        pattern: 'SELECT subscription_tier',
        result: { subscription_tier: 'PLATFORM_PRO', trial_expires_at: null },
      },
      {
        pattern: 'SELECT request_count',
        result: { request_count: 500, code_task_count: 10 },
      },
    ], 'user-1');

    const res = await req('/api/v1/router/execute', { method: 'POST' });
    expect(res.status).toBe(200);
  });

  it('passes through when no usage record exists (first request)', async () => {
    const { req } = buildApp([
      {
        pattern: 'SELECT subscription_tier',
        result: { subscription_tier: 'BYOK_STANDARD', trial_expires_at: null },
      },
      {
        pattern: 'SELECT request_count',
        result: null, // No usage record yet
      },
    ], 'user-1');

    const res = await req('/api/v1/router/execute', { method: 'POST' });
    expect(res.status).toBe(200);
  });

  it('does not check trial expiration for non-TRIAL tiers', async () => {
    // Even if trial_expires_at is in the past, non-TRIAL tiers should pass
    const expired = new Date(Date.now() - 86400000).toISOString();
    const { req } = buildApp([
      {
        pattern: 'SELECT subscription_tier',
        result: { subscription_tier: 'PLATFORM_STANDARD', trial_expires_at: expired },
      },
      {
        pattern: 'SELECT request_count',
        result: { request_count: 0, code_task_count: 0 },
      },
    ], 'user-1');

    const res = await req('/api/v1/router/execute', { method: 'POST' });
    expect(res.status).toBe(200);
  });
});
