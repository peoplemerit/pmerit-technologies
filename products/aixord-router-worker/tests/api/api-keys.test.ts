/**
 * API Keys Endpoint Tests
 *
 * Tests the api-keys sub-router mounted at /api/v1/api-keys:
 *   GET    /                — List masked API keys
 *   POST   /                — Add/update API key
 *   POST   /:id/reveal      — Reveal full key (password-protected)
 *   DELETE /:provider        — Delete key by provider
 *   POST   /test             — Test key validity
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types';
import { type MockQueryResult } from '../helpers';
import { createMockEnv, createTestSession, jsonHeaders, authHeaders } from '../test-app';

vi.mock('../../src/utils/crypto', () => ({
  hashPasswordPBKDF2: vi.fn(),
  verifyPasswordPBKDF2: vi.fn().mockResolvedValue(true),
  hashSHA256: vi.fn().mockImplementation(async (input: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }),
  encryptAESGCM: vi.fn().mockResolvedValue('encrypted-key-data'),
  decryptAESGCM: vi.fn().mockResolvedValue('sk-real-api-key-12345'),
  maskApiKey: vi.fn().mockResolvedValue('sk-ant...5678'),
}));

let apiKeysRouter: any;

beforeEach(async () => {
  vi.clearAllMocks();
  const mod = await import('../../src/api/api-keys');
  apiKeysRouter = mod.default;
});

function buildApp(queries: MockQueryResult[] = []) {
  const env = createMockEnv(queries);
  const app = new Hono<{ Bindings: Env }>();
  app.route('/api/v1/api-keys', apiKeysRouter);

  const req = (path: string, init?: RequestInit) =>
    app.request(path, init, env);

  return { app, env, req };
}

function sessionQuery(userId = 'user-1'): MockQueryResult {
  return { pattern: 'token_hash', result: { user_id: userId, id: 'sess-1', email: 'user@test.com' } };
}

// ============================================================================
// List API Keys Tests
// ============================================================================
describe('GET /api/v1/api-keys', () => {
  it('returns masked keys for authenticated user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      {
        pattern: 'SELECT id, provider, api_key, label',
        result: [
          { id: 'key-1', provider: 'anthropic', api_key: 'encrypted-key-data', label: 'My Anthropic Key', created_at: '2026-01-01', updated_at: '2026-01-01' },
        ],
      },
    ]);

    const res = await req('/api/v1/api-keys', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; keys: Array<{ provider: string }> };
    expect(body.success).toBe(true);
    expect(body.keys).toHaveLength(1);
    expect(body.keys[0].provider).toBe('anthropic');
  });

  it('returns empty array when no keys', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT id, provider, api_key', result: [] },
    ]);

    const res = await req('/api/v1/api-keys', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; keys: unknown[] };
    expect(body.keys).toEqual([]);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/api-keys');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Add/Update API Key Tests
// ============================================================================
describe('POST /api/v1/api-keys', () => {
  it('stores encrypted API key', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      // Check existing key
      { pattern: 'SELECT id FROM user_api_keys WHERE user_id', result: null },
      // INSERT key
      { pattern: 'INSERT INTO user_api_keys', runResult: { success: true, changes: 1 } },
      // Clear cache
      { pattern: 'DELETE FROM api_key_cache', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/api-keys', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ provider: 'anthropic', apiKey: 'sk-ant-api03-' + 'a'.repeat(40) }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; provider: string };
    expect(body.success).toBe(true);
    expect(body.provider).toBe('anthropic');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/api-keys', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ provider: 'anthropic', apiKey: 'sk-ant-api03-test' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Delete API Key Tests
// ============================================================================
describe('DELETE /api/v1/api-keys/:provider', () => {
  it('deletes key by provider', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      // DELETE key
      { pattern: 'DELETE FROM user_api_keys', runResult: { success: true, changes: 1 } },
      // Clear cache
      { pattern: 'DELETE FROM api_key_cache', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/api-keys/anthropic', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; provider: string };
    expect(body.success).toBe(true);
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/api-keys/anthropic', {
      method: 'DELETE',
    });

    expect(res.status).toBe(401);
  });
});
