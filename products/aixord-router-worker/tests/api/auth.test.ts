/**
 * Auth API Endpoint Tests
 *
 * Tests the auth sub-router mounted at /api/v1/auth/*
 * Uses Hono's app.request(path, init, Env) pattern for injecting mock bindings.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types';
import { type MockQueryResult } from '../helpers';
import { createMockEnv, createTestSession, createTestUser, jsonHeaders, authHeaders } from '../test-app';

// Mock crypto.subtle for PBKDF2 — deterministic test results.
vi.mock('../../src/utils/crypto', () => ({
  hashPasswordPBKDF2: vi.fn().mockResolvedValue({
    hash: 'pbkdf2-mock-hash-abc123',
    salt: 'pbkdf2-mock-salt-def456',
  }),
  verifyPasswordPBKDF2: vi.fn().mockResolvedValue(true),
  hashSHA256: vi.fn().mockImplementation(async (input: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }),
}));

import { verifyPasswordPBKDF2, hashSHA256 } from '../../src/utils/crypto';
const mockVerifyPassword = vi.mocked(verifyPasswordPBKDF2);
const mockHashSHA256 = vi.mocked(hashSHA256);

// We need to dynamically import auth after mocking
let authRouter: any;

beforeEach(async () => {
  vi.clearAllMocks();
  mockVerifyPassword.mockResolvedValue(true);
  const authModule = await import('../../src/api/auth');
  authRouter = authModule.default;
});

/**
 * Build a test app with auth router and mock env.
 * Returns { app, env, req } where req() auto-passes env as Hono's 3rd arg.
 */
function buildApp(queries: MockQueryResult[] = []) {
  const env = createMockEnv(queries);
  const app = new Hono<{ Bindings: Env }>();

  // Mount auth router at same path as production
  app.route('/api/v1/auth', authRouter);

  // Convenience: req() wraps app.request() to always pass env
  const req = (path: string, init?: RequestInit) =>
    app.request(path, init, env);

  return { app, env, req };
}

// ============================================================================
// Registration Tests
// ============================================================================
describe('POST /api/v1/auth/register', () => {
  it('creates user account and returns token on success', async () => {
    const { req } = buildApp([
      // Check username doesn't exist
      { pattern: 'SELECT id FROM users WHERE username', result: null },
      // Check email doesn't exist
      { pattern: 'SELECT id FROM users WHERE email', result: null },
      // INSERT user
      { pattern: 'INSERT INTO users', runResult: { success: true, changes: 1 } },
      // INSERT subscription
      { pattern: 'INSERT INTO subscriptions', runResult: { success: true, changes: 1 } },
      // INSERT email verification token
      { pattern: 'INSERT INTO email_verification_tokens', runResult: { success: true, changes: 1 } },
      // INSERT session
      { pattern: 'INSERT INTO sessions', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/auth/register', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'StrongPass123',
        name: 'Test User',
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { user: { email: string }; token: string; expires_at: string };
    expect(body.user.email).toBe('new@example.com');
    expect(body.token).toBeDefined();
    expect(body.expires_at).toBeDefined();
  });

  it('returns 409 for duplicate email', async () => {
    const { req } = buildApp([
      { pattern: 'SELECT id FROM users WHERE email', result: { id: 'existing-user' } },
    ]);

    const res = await req('/api/v1/auth/register', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email: 'existing@example.com', password: 'StrongPass123' }),
    });

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('already registered');
  });

  it('returns 409 for duplicate username', async () => {
    const { req } = buildApp([
      { pattern: 'SELECT id FROM users WHERE username', result: { id: 'existing-user' } },
    ]);

    const res = await req('/api/v1/auth/register', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'StrongPass123',
        username: 'taken_name',
      }),
    });

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Username already taken');
  });

  it('returns 400 for missing email', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/auth/register', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ password: 'StrongPass123' }),
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 for short password', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/auth/register', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email: 'test@test.com', password: 'short' }),
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email format', async () => {
    const { req } = buildApp([
      { pattern: 'SELECT id FROM users WHERE email', result: null },
    ]);

    const res = await req('/api/v1/auth/register', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email: 'not-an-email', password: 'StrongPass123' }),
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid username format', async () => {
    const { req } = buildApp([
      { pattern: 'SELECT id FROM users WHERE email', result: null },
    ]);

    const res = await req('/api/v1/auth/register', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'StrongPass123',
        username: 'ab', // Too short — must be 3-30 chars
      }),
    });

    expect(res.status).toBe(400);
  });
});

// ============================================================================
// Login Tests
// ============================================================================
describe('POST /api/v1/auth/login', () => {
  it('returns token on valid credentials', async () => {
    const user = createTestUser({ email: 'user@test.com', hash_algorithm: 'pbkdf2', password_salt: 'salt123' });

    const { req } = buildApp([
      { pattern: 'SELECT id, email, email_verified, password_hash, password_salt, hash_algorithm FROM users', result: user },
      { pattern: 'UPDATE users SET email_verified', runResult: { success: true } },
      { pattern: 'INSERT INTO sessions', runResult: { success: true, changes: 1 } },
    ]);

    mockVerifyPassword.mockResolvedValue(true);

    const res = await req('/api/v1/auth/login', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email: 'user@test.com', password: 'ValidPass123' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { user: { email: string }; token: string };
    expect(body.token).toBeDefined();
    expect(body.user.email).toBe('user@test.com');
  });

  it('returns 401 for wrong password', async () => {
    const user = createTestUser({ hash_algorithm: 'pbkdf2', password_salt: 'salt123' });

    const { req } = buildApp([
      { pattern: 'SELECT id, email, email_verified, password_hash', result: user },
    ]);

    mockVerifyPassword.mockResolvedValue(false);

    const res = await req('/api/v1/auth/login', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email: 'user@test.com', password: 'WrongPass123' }),
    });

    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Invalid credentials');
  });

  it('returns 401 for non-existent user', async () => {
    const { req } = buildApp([
      { pattern: 'SELECT id, email, email_verified, password_hash', result: null },
    ]);

    const res = await req('/api/v1/auth/login', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email: 'nonexistent@test.com', password: 'ValidPass123' }),
    });

    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Invalid credentials');
  });

  it('returns 400 for missing credentials', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/auth/login', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email: 'user@test.com' }),
    });

    expect(res.status).toBe(400);
  });
});

// ============================================================================
// Me (Session Check) Tests
// ============================================================================
describe('GET /api/v1/auth/me', () => {
  it('returns user data for valid session', async () => {
    const { token, tokenHash } = await createTestSession();

    const { req } = buildApp([
      { pattern: 'token_hash', result: { user_id: 'user-123', email: 'user@test.com', email_verified: 1, id: 'sess-1' } },
    ]);

    const res = await req('/api/v1/auth/me', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { user: { id: string; email: string; emailVerified: boolean } };
    expect(body.user.id).toBe('user-123');
    expect(body.user.email).toBe('user@test.com');
    expect(body.user.emailVerified).toBe(true);
  });

  it('returns 401 for missing auth header', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/auth/me');

    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('No token');
  });

  it('returns 401 for expired/invalid token', async () => {
    const { req } = buildApp([
      // Both hash and plaintext lookups return null
      { pattern: 'token_hash', result: null },
      { pattern: 'token =', result: null },
    ]);

    const res = await req('/api/v1/auth/me', {
      headers: authHeaders('invalid-token-value'),
    });

    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Invalid or expired');
  });
});

// ============================================================================
// Logout Tests
// ============================================================================
describe('POST /api/v1/auth/logout', () => {
  it('deletes session and returns success', async () => {
    const { req } = buildApp([
      { pattern: 'DELETE FROM sessions WHERE token_hash', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/auth/logout', {
      method: 'POST',
      headers: authHeaders('valid-token'),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('returns success even without auth header', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/auth/logout', {
      method: 'POST',
      headers: jsonHeaders,
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });
});

// ============================================================================
// Email Verification Tests
// ============================================================================
describe('POST /api/v1/auth/verify-email', () => {
  it('verifies email with valid token', async () => {
    const { req } = buildApp([
      {
        pattern: 'SELECT id, user_id, email, expires_at, used_at',
        result: {
          id: 'tok-1', user_id: 'user-1', email: 'user@test.com',
          expires_at: new Date(Date.now() + 86400000).toISOString(), used_at: null,
        },
      },
      // Mark token used
      { pattern: 'UPDATE email_verification_tokens', runResult: { success: true } },
      // Update user
      { pattern: 'UPDATE users SET email_verified', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/auth/verify-email', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ token: 'valid-verification-token' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('returns 400 for invalid token', async () => {
    const { req } = buildApp([
      { pattern: 'SELECT id, user_id, email, expires_at', result: null },
    ]);

    const res = await req('/api/v1/auth/verify-email', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ token: 'bad-token' }),
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 for already-used token', async () => {
    const { req } = buildApp([
      {
        pattern: 'SELECT id, user_id, email, expires_at, used_at',
        result: {
          id: 'tok-1', user_id: 'user-1', email: 'user@test.com',
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          used_at: new Date().toISOString(),
        },
      },
    ]);

    const res = await req('/api/v1/auth/verify-email', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ token: 'used-token' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('already been used');
  });

  it('returns 400 for expired token', async () => {
    const { req } = buildApp([
      {
        pattern: 'SELECT id, user_id, email, expires_at, used_at',
        result: {
          id: 'tok-1', user_id: 'user-1', email: 'user@test.com',
          expires_at: new Date(Date.now() - 86400000).toISOString(), // Past
          used_at: null,
        },
      },
    ]);

    const res = await req('/api/v1/auth/verify-email', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ token: 'expired-token' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('expired');
  });

  it('returns 400 for missing token', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/auth/verify-email', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
  });
});

// ============================================================================
// Password Reset Tests
// ============================================================================
describe('POST /api/v1/auth/forgot-password', () => {
  it('returns success for existing user (prevents email enumeration)', async () => {
    const { req } = buildApp([
      { pattern: 'SELECT id, email FROM users WHERE email', result: { id: 'user-1', email: 'user@test.com' } },
      { pattern: 'UPDATE password_reset_tokens', runResult: { success: true } },
      { pattern: 'INSERT INTO password_reset_tokens', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email: 'user@test.com' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('returns success for non-existent user (prevents email enumeration)', async () => {
    const { req } = buildApp([
      { pattern: 'SELECT id, email FROM users WHERE email', result: null },
    ]);

    const res = await req('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email: 'nobody@test.com' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });
});

describe('POST /api/v1/auth/reset-password', () => {
  it('resets password with valid token', async () => {
    const { req } = buildApp([
      {
        pattern: 'SELECT id, user_id, expires_at, used_at',
        result: {
          id: 'rst-1', user_id: 'user-1',
          expires_at: new Date(Date.now() + 3600000).toISOString(), used_at: null,
        },
      },
      // UPDATE users (new password)
      { pattern: 'UPDATE users SET password_hash', runResult: { success: true } },
      // Mark token used
      { pattern: 'UPDATE password_reset_tokens', runResult: { success: true } },
      // Invalidate sessions
      { pattern: 'DELETE FROM sessions WHERE user_id', runResult: { success: true } },
    ]);

    const res = await req('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ token: 'valid-reset-token', password: 'NewStrongPass123' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('returns 400 for short new password', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ token: 'tok', password: 'short' }),
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 for used reset token', async () => {
    const { req } = buildApp([
      {
        pattern: 'SELECT id, user_id, expires_at, used_at',
        result: {
          id: 'rst-1', user_id: 'user-1',
          expires_at: new Date(Date.now() + 3600000).toISOString(),
          used_at: new Date().toISOString(),
        },
      },
    ]);

    const res = await req('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ token: 'used-token', password: 'NewStrongPass123' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('already been used');
  });
});

// ============================================================================
// Change Password Tests
// ============================================================================
describe('POST /api/v1/auth/change-password', () => {
  it('changes password for authenticated user', async () => {
    const { token, tokenHash } = await createTestSession();
    const user = createTestUser({ hash_algorithm: 'pbkdf2', password_salt: 'salt123' });

    const { req } = buildApp([
      // Session lookup
      { pattern: 'token_hash', result: { user_id: user.id } },
      // User lookup
      { pattern: 'SELECT id, email, password_hash, password_salt, hash_algorithm FROM users', result: user },
      // Update password
      { pattern: 'UPDATE users SET password_hash', runResult: { success: true } },
      // Delete sessions
      { pattern: 'DELETE FROM sessions WHERE user_id', runResult: { success: true } },
    ]);

    mockVerifyPassword.mockResolvedValue(true);

    const res = await req('/api/v1/auth/change-password', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ current_password: 'OldPass123', new_password: 'NewPass456' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('returns 401 for wrong current password', async () => {
    const { token } = await createTestSession();
    const user = createTestUser({ hash_algorithm: 'pbkdf2', password_salt: 'salt123' });

    const { req } = buildApp([
      { pattern: 'token_hash', result: { user_id: user.id } },
      { pattern: 'SELECT id, email, password_hash', result: user },
    ]);

    mockVerifyPassword.mockResolvedValue(false);

    const res = await req('/api/v1/auth/change-password', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ current_password: 'WrongPass', new_password: 'NewPass456' }),
    });

    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('incorrect');
  });

  it('returns 401 without auth header', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/auth/change-password', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ current_password: 'OldPass', new_password: 'NewPass456' }),
    });

    expect(res.status).toBe(401);
  });

  it('returns 400 when new password same as current', async () => {
    const { token } = await createTestSession();
    const user = createTestUser();

    const { req } = buildApp([
      { pattern: 'token_hash', result: { user_id: user.id } },
      { pattern: 'SELECT id, email, password_hash', result: user },
    ]);

    const res = await req('/api/v1/auth/change-password', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ current_password: 'SamePass123', new_password: 'SamePass123' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('different');
  });
});

// ============================================================================
// Resend Verification Tests
// ============================================================================
describe('POST /api/v1/auth/resend-verification', () => {
  it('returns success for existing unverified user', async () => {
    const { req } = buildApp([
      {
        pattern: 'SELECT id, email, email_verified FROM users WHERE email',
        result: { id: 'user-1', email: 'user@test.com', email_verified: 0 },
      },
      // Invalidate existing tokens
      { pattern: 'UPDATE email_verification_tokens SET used_at', runResult: { success: true } },
      // Create new token
      { pattern: 'INSERT INTO email_verification_tokens', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/auth/resend-verification', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email: 'user@test.com' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; message: string };
    expect(body.success).toBe(true);
    expect(body.message).toContain('verification link');
  });

  it('returns success for non-existent user (prevents enumeration)', async () => {
    const { req } = buildApp([
      { pattern: 'SELECT id, email, email_verified FROM users WHERE email', result: null },
    ]);

    const res = await req('/api/v1/auth/resend-verification', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email: 'nobody@test.com' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; message: string };
    expect(body.success).toBe(true);
    expect(body.message).toContain('verification link');
  });

  it('returns success for already-verified user', async () => {
    const { req } = buildApp([
      {
        pattern: 'SELECT id, email, email_verified FROM users WHERE email',
        result: { id: 'user-1', email: 'user@test.com', email_verified: 1 },
      },
    ]);

    const res = await req('/api/v1/auth/resend-verification', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email: 'user@test.com' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; message: string };
    expect(body.success).toBe(true);
    expect(body.message).toContain('already verified');
  });

  it('returns 400 for missing email', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/auth/resend-verification', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Email required');
  });
});

// ============================================================================
// Recover Username Tests
// ============================================================================
describe('POST /api/v1/auth/recover-username', () => {
  it('returns success for existing user (sends email)', async () => {
    const { req } = buildApp([
      {
        pattern: 'SELECT email, username FROM users WHERE email',
        result: { email: 'user@test.com', username: 'testuser' },
      },
    ]);

    const res = await req('/api/v1/auth/recover-username', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email: 'user@test.com' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; message: string };
    expect(body.success).toBe(true);
    expect(body.message).toContain('username information');
  });

  it('returns success for non-existent user (prevents enumeration)', async () => {
    const { req } = buildApp([
      { pattern: 'SELECT email, username FROM users WHERE email', result: null },
    ]);

    const res = await req('/api/v1/auth/recover-username', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email: 'nobody@test.com' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; message: string };
    expect(body.success).toBe(true);
    expect(body.message).toContain('username information');
  });

  it('returns 400 for missing email', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/auth/recover-username', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Email required');
  });
});

// ============================================================================
// Subscription Endpoint Tests
// ============================================================================
describe('GET /api/v1/auth/subscription', () => {
  it('returns subscription data for authenticated user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      // Session lookup via token_hash
      { pattern: 'token_hash', result: { user_id: 'user-1', id: 'sess-1' } },
      // Subscription lookup
      {
        pattern: 'SELECT tier, status, period_start, period_end, stripe_customer_id',
        result: {
          tier: 'PRO',
          status: 'active',
          period_start: '2026-01-01T00:00:00Z',
          period_end: '2026-02-01T00:00:00Z',
          stripe_customer_id: 'cus_test123',
        },
      },
    ]);

    const res = await req('/api/v1/auth/subscription', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { tier: string; status: string; keyMode: string };
    expect(body.tier).toBe('PRO');
    expect(body.status).toBe('active');
    expect(body.keyMode).toBeDefined();
  });

  it('returns user tier when no subscription record exists', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      // Session lookup
      { pattern: 'token_hash', result: { user_id: 'user-1', id: 'sess-1' } },
      // No subscription record
      { pattern: 'SELECT tier, status, period_start, period_end, stripe_customer_id', result: null },
      // User table fallback
      { pattern: 'SELECT subscription_tier FROM users', result: { subscription_tier: 'TRIAL' } },
    ]);

    const res = await req('/api/v1/auth/subscription', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { tier: string; status: string };
    expect(body.tier).toBe('TRIAL');
    expect(body.status).toBe('active');
  });

  it('auto-upgrades NONE tier to TRIAL', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      // Session lookup
      { pattern: 'token_hash', result: { user_id: 'user-1', id: 'sess-1' } },
      // No subscription record
      { pattern: 'SELECT tier, status, period_start, period_end, stripe_customer_id', result: null },
      // User has NONE tier
      { pattern: 'SELECT subscription_tier FROM users', result: { subscription_tier: 'NONE' } },
      // Auto-upgrade UPDATE
      { pattern: "UPDATE users SET subscription_tier = 'TRIAL'", runResult: { success: true } },
      // Auto-upgrade INSERT subscription
      { pattern: 'INSERT INTO subscriptions', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/auth/subscription', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { tier: string };
    expect(body.tier).toBe('TRIAL');
  });

  it('returns 401 without auth header', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/auth/subscription');

    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('No token');
  });

  it('returns 401 for invalid token', async () => {
    const { req } = buildApp([
      { pattern: 'token_hash', result: null },
      { pattern: 'token =', result: null },
    ]);

    const res = await req('/api/v1/auth/subscription', {
      headers: authHeaders('bad-token'),
    });

    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Invalid or expired');
  });
});

// ============================================================================
// GDPR Export Tests
// Note: The /export endpoint uses c.get('userId') which requires requireAuth
// middleware. In production, this middleware must be applied upstream.
// These tests use a buildAuthenticatedApp helper that includes requireAuth.
// ============================================================================

/**
 * Build an app with requireAuth middleware applied before the auth router.
 * This mirrors the intended production setup for endpoints that use c.get('userId').
 */
function buildAuthenticatedApp(queries: MockQueryResult[] = []) {
  const env = createMockEnv(queries);
  const app = new Hono<{ Bindings: Env }>();

  // Apply requireAuth before auth routes (middleware sets userId/userEmail)
  app.use('/api/v1/auth/export', async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Authentication required' }, 401);
    }
    const token = authHeader.slice(7);
    const tokenHash = await mockHashSHA256(token);
    const session = await c.env.DB.prepare(
      "SELECT s.user_id, s.id, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token_hash = ? AND s.expires_at > datetime('now')"
    ).bind(tokenHash).first<{ user_id: string; id: string; email: string }>();
    if (!session) return c.json({ error: 'Invalid or expired token' }, 401);
    c.set('userId', session.user_id);
    c.set('userEmail', session.email);
    await next();
  });

  app.use('/api/v1/auth/account', async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Authentication required' }, 401);
    }
    const token = authHeader.slice(7);
    const tokenHash = await mockHashSHA256(token);
    const session = await c.env.DB.prepare(
      "SELECT s.user_id, s.id, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token_hash = ? AND s.expires_at > datetime('now')"
    ).bind(tokenHash).first<{ user_id: string; id: string; email: string }>();
    if (!session) return c.json({ error: 'Invalid or expired token' }, 401);
    c.set('userId', session.user_id);
    c.set('userEmail', session.email);
    await next();
  });

  app.route('/api/v1/auth', authRouter);

  const req = (path: string, init?: RequestInit) =>
    app.request(path, init, env);

  return { app, env, req };
}

describe('GET /api/v1/auth/export', () => {
  it('returns all user data for authenticated user', async () => {
    const { token } = await createTestSession();

    const { req } = buildAuthenticatedApp([
      // Session lookup (for middleware)
      {
        pattern: 'sessions s JOIN users u',
        result: { user_id: 'user-1', id: 'sess-1', email: 'user@test.com' },
      },
      // User data
      {
        pattern: 'SELECT id, email, name, username, subscription_tier',
        result: {
          id: 'user-1', email: 'user@test.com', name: 'Test User',
          username: 'testuser', subscription_tier: 'PRO',
          trial_expires_at: null, email_verified: 1,
          created_at: '2026-01-01', updated_at: '2026-02-01',
        },
      },
      // Subscriptions
      { pattern: 'FROM subscriptions WHERE user_id', result: [] },
      // Projects
      { pattern: 'FROM projects WHERE user_id', result: [] },
      // Sessions
      { pattern: 'FROM sessions WHERE user_id', result: [] },
      // Usage tracking
      { pattern: 'FROM usage_tracking WHERE user_id', result: [] },
      // API keys
      { pattern: 'FROM user_api_keys WHERE user_id', result: [] },
    ]);

    const res = await req('/api/v1/auth/export', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      exported_at: string;
      user: { id: string; email: string };
      subscriptions: unknown[];
      projects: unknown[];
      sessions: unknown[];
      usage: unknown[];
      api_keys: unknown[];
    };
    expect(body.exported_at).toBeDefined();
    expect(body.user.id).toBe('user-1');
    expect(body.user.email).toBe('user@test.com');
    expect(body.subscriptions).toEqual([]);
    expect(body.projects).toEqual([]);
    expect(body.api_keys).toEqual([]);
  });

  it('returns 401 without auth header', async () => {
    const { req } = buildAuthenticatedApp();

    const res = await req('/api/v1/auth/export');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// GDPR Account Deletion Tests
// ============================================================================
describe('DELETE /api/v1/auth/account', () => {
  it('deletes account with correct password confirmation', async () => {
    const { token } = await createTestSession();
    const user = createTestUser({ id: 'user-1', hash_algorithm: 'pbkdf2', password_salt: 'salt123' });

    const { req } = buildAuthenticatedApp([
      // Session lookup (for middleware)
      {
        pattern: 'sessions s JOIN users u',
        result: { user_id: 'user-1', id: 'sess-1', email: 'user@test.com' },
      },
      // User lookup for password verification
      {
        pattern: 'SELECT id, password_hash, password_salt, hash_algorithm FROM users WHERE id',
        result: user,
      },
      // Cascade deletions
      { pattern: 'DELETE FROM sessions WHERE user_id', runResult: { success: true, changes: 2 } },
      { pattern: 'DELETE FROM user_api_keys WHERE user_id', runResult: { success: true, changes: 0 } },
      { pattern: 'DELETE FROM usage_tracking WHERE user_id', runResult: { success: true, changes: 3 } },
      { pattern: 'DELETE FROM usage WHERE user_id', runResult: { success: true, changes: 5 } },
      { pattern: 'DELETE FROM subscriptions WHERE user_id', runResult: { success: true, changes: 1 } },
      { pattern: 'DELETE FROM email_verification_tokens WHERE user_id', runResult: { success: true, changes: 1 } },
      { pattern: 'DELETE FROM password_reset_tokens WHERE user_id', runResult: { success: true, changes: 0 } },
      { pattern: 'DELETE FROM rate_limits WHERE user_id', runResult: { success: true, changes: 0 } },
      // Delete projects
      { pattern: 'DELETE FROM projects WHERE user_id', runResult: { success: true, changes: 2 } },
      // Delete user record
      { pattern: 'DELETE FROM users WHERE id', runResult: { success: true, changes: 1 } },
    ]);

    mockVerifyPassword.mockResolvedValue(true);

    const res = await req('/api/v1/auth/account', {
      method: 'DELETE',
      headers: authHeaders(token),
      body: JSON.stringify({ password: 'CorrectPass123' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; message: string };
    expect(body.success).toBe(true);
    expect(body.message).toContain('permanently deleted');
  });

  it('returns 401 for incorrect password', async () => {
    const { token } = await createTestSession();
    const user = createTestUser({ id: 'user-1', hash_algorithm: 'pbkdf2', password_salt: 'salt123' });

    const { req } = buildAuthenticatedApp([
      // Session lookup (for middleware)
      {
        pattern: 'sessions s JOIN users u',
        result: { user_id: 'user-1', id: 'sess-1', email: 'user@test.com' },
      },
      // User lookup
      {
        pattern: 'SELECT id, password_hash, password_salt, hash_algorithm FROM users WHERE id',
        result: user,
      },
    ]);

    mockVerifyPassword.mockResolvedValue(false);

    const res = await req('/api/v1/auth/account', {
      method: 'DELETE',
      headers: authHeaders(token),
      body: JSON.stringify({ password: 'WrongPass123' }),
    });

    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Incorrect password');
  });

  it('returns 400 for missing password', async () => {
    const { token } = await createTestSession();

    const { req } = buildAuthenticatedApp([
      // Session lookup (for middleware)
      {
        pattern: 'sessions s JOIN users u',
        result: { user_id: 'user-1', id: 'sess-1', email: 'user@test.com' },
      },
    ]);

    const res = await req('/api/v1/auth/account', {
      method: 'DELETE',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Password confirmation required');
  });

  it('returns 401 without auth header', async () => {
    const { req } = buildAuthenticatedApp();

    const res = await req('/api/v1/auth/account', {
      method: 'DELETE',
      headers: jsonHeaders,
      body: JSON.stringify({ password: 'SomePass123' }),
    });

    expect(res.status).toBe(401);
  });
});
