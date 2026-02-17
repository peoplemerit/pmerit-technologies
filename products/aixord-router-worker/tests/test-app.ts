/**
 * Test App Factory — Creates a Hono app instance with mock Env bindings
 * for HTTP-layer integration tests.
 *
 * Usage:
 *   const { app, env } = createTestApp(mockQueries);
 *   const res = await app.request('/api/v1/auth/login', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ email: 'test@test.com', password: 'password123' }),
 *   });
 */

import { createMockDB, type MockQueryResult } from './helpers';
import type { Env } from '../src/types';

/**
 * Creates a mock Env with a pattern-based D1 mock and stub R2 bucket.
 * All secrets are set to test-safe defaults.
 */
export function createMockEnv(queries: MockQueryResult[] = []): Env {
  const mockDB = createMockDB(queries);
  const mockR2: Record<string, unknown> = {
    put: async () => ({}),
    get: async () => null,
    delete: async () => {},
    list: async () => ({ objects: [], truncated: false }),
  };

  return {
    // D1 Database
    DB: mockDB as unknown as D1Database,

    // R2 Bucket
    IMAGES: mockR2 as unknown as R2Bucket,

    // Platform API keys (test stubs — never called in unit tests)
    PLATFORM_ANTHROPIC_KEY: 'test-anthropic-key',
    PLATFORM_OPENAI_KEY: 'test-openai-key',
    PLATFORM_GOOGLE_KEY: 'test-google-key',
    PLATFORM_DEEPSEEK_KEY: 'test-deepseek-key',

    // Auth
    AUTH_SALT: 'test-salt-for-unit-tests',

    // Billing (stubs)
    STRIPE_SECRET_KEY: 'sk_test_mock',
    STRIPE_WEBHOOK_SECRET: 'whsec_test_mock',
    GUMROAD_PRODUCT_ID: 'test-gumroad-product',
    KDP_CODE_SECRET: 'test-kdp-secret',

    // Email
    RESEND_API_KEY: '', // Empty = dev mode (no emails sent)

    // GitHub OAuth
    GITHUB_CLIENT_ID: 'test-github-client',
    GITHUB_CLIENT_SECRET: 'test-github-secret',
    GITHUB_REDIRECT_URI: 'http://localhost:8787/api/v1/github/callback',
    GITHUB_TOKEN_ENCRYPTION_KEY: 'test-github-enc-key-0123456789abcdef',

    // BYOK
    API_KEY_ENCRYPTION_KEY: 'test-api-key-enc-key-0123456789ab',

    // Frontend URL
    FRONTEND_URL: 'http://localhost:5173',

    // Environment
    ENVIRONMENT: 'test',
  };
}

/**
 * Creates a fully-wired Hono test app with mock Env.
 * Imports the real app from src/index.ts so all routes and middleware are active.
 *
 * NOTE: We import the auth sub-router directly for focused auth testing,
 * since the main app's global middleware (CORS, rate limiting) adds complexity.
 * For full integration tests, import the default app from src/index.ts.
 */
export async function createTestApp(queries: MockQueryResult[] = []) {
  const env = createMockEnv(queries);
  // Dynamic import to avoid circular dependencies
  const { default: app } = await import('../src/index');
  return { app, env };
}

/**
 * Helper: Create a valid session token and its SHA-256 hash
 * for testing authenticated endpoints.
 */
export async function createTestSession(): Promise<{ token: string; tokenHash: string }> {
  const token = 'test-token-' + Math.random().toString(36).slice(2);
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return { token, tokenHash };
}

/**
 * Helper: Create a test user row object
 */
export function createTestUser(overrides: Partial<{
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
  hash_algorithm: string;
  email_verified: number;
  subscription_tier: string;
  username: string | null;
  name: string | null;
}> = {}) {
  return {
    id: overrides.id ?? 'test-user-' + Math.random().toString(36).slice(2),
    email: overrides.email ?? 'test@example.com',
    password_hash: overrides.password_hash ?? 'mock-hash',
    password_salt: overrides.password_salt ?? 'mock-salt',
    hash_algorithm: overrides.hash_algorithm ?? 'pbkdf2',
    email_verified: overrides.email_verified ?? 1,
    subscription_tier: overrides.subscription_tier ?? 'TRIAL',
    username: overrides.username ?? null,
    name: overrides.name ?? null,
  };
}

/**
 * Helper: Make an authenticated request
 */
export function authHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Helper: JSON request headers (no auth)
 */
export const jsonHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
};
