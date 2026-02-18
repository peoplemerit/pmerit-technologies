/**
 * Billing API Endpoint Tests
 *
 * Tests the billing endpoints defined inline in src/index.ts:
 *   POST /v1/billing/checkout
 *   POST /v1/billing/portal
 *   POST /v1/billing/activate/gumroad
 *   POST /v1/billing/activate/kdp
 *   POST /v1/billing/activate/trial
 *
 * All endpoints use requireAuth middleware. We inline a simplified auth
 * middleware in the test app to set userId/userEmail from a mock session lookup.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types';
import { type MockQueryResult } from '../helpers';
import { createMockEnv, createTestSession, jsonHeaders, authHeaders } from '../test-app';

// Mock billing service functions
vi.mock('../../src/billing/stripe', () => ({
  createCheckoutSession: vi.fn(),
  createPortalSession: vi.fn(),
  handleStripeWebhook: vi.fn(),
}));

vi.mock('../../src/billing/gumroad', () => ({
  activateGumroadLicense: vi.fn(),
  verifyKdpCode: vi.fn(),
}));

// Mock crypto for token hashing
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

import { createCheckoutSession, createPortalSession } from '../../src/billing/stripe';
import { activateGumroadLicense, verifyKdpCode } from '../../src/billing/gumroad';
import { hashSHA256 } from '../../src/utils/crypto';

const mockCheckout = vi.mocked(createCheckoutSession);
const mockPortal = vi.mocked(createPortalSession);
const mockGumroad = vi.mocked(activateGumroadLicense);
const mockKdp = vi.mocked(verifyKdpCode);
const mockHashSHA256 = vi.mocked(hashSHA256);

beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * Build a test app that mirrors the billing route handlers from index.ts.
 * Includes a simplified requireAuth middleware that reads sessions from mock DB.
 */
function buildBillingApp(queries: MockQueryResult[] = []) {
  const env = createMockEnv(queries);
  const app = new Hono<{ Bindings: Env }>();

  // Simplified requireAuth middleware
  const requireAuth = async (c: any, next: any) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Authentication required' }, 401);
    }
    const token = authHeader.slice(7);
    const tokenHash = await mockHashSHA256(token);
    const session = await c.env.DB.prepare(
      "SELECT s.user_id, s.id, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token_hash = ?"
    ).bind(tokenHash).first();
    if (!session) return c.json({ error: 'Invalid or expired token' }, 401);
    c.set('userId', session.user_id);
    c.set('userEmail', session.email);
    await next();
  };

  // Checkout endpoint
  app.post('/v1/billing/checkout', requireAuth, async (c) => {
    try {
      const userId = c.get('userId');
      const body = await c.req.json() as {
        price_id: string;
        success_url: string;
        cancel_url: string;
      };

      const stripeKey = c.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return c.json({ error: 'Stripe not configured' }, 500);
      }

      const session = await createCheckoutSession(
        userId,
        body.price_id,
        body.success_url,
        body.cancel_url,
        stripeKey
      );

      return c.json(session);
    } catch {
      return c.json({ error: 'Failed to create checkout session' }, 500);
    }
  });

  // Portal endpoint
  app.post('/v1/billing/portal', requireAuth, async (c) => {
    try {
      const body = await c.req.json() as {
        customer_id: string;
        return_url: string;
      };

      const stripeKey = c.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return c.json({ error: 'Stripe not configured' }, 500);
      }

      const session = await createPortalSession(
        body.customer_id,
        body.return_url,
        stripeKey
      );

      return c.json(session);
    } catch {
      return c.json({ error: 'Failed to create portal session' }, 500);
    }
  });

  // Gumroad activation
  app.post('/v1/billing/activate/gumroad', requireAuth, async (c) => {
    try {
      const userId = c.get('userId');
      const body = await c.req.json() as { license_key: string };

      const productId = c.env.GUMROAD_PRODUCT_ID;
      if (!productId) {
        return c.json({ error: 'Gumroad not configured' }, 500);
      }

      const result = await activateGumroadLicense(
        body.license_key,
        productId,
        c.env.DB,
        userId
      );

      if (!result.success) {
        return c.json({ error: result.error }, 400);
      }

      return c.json({ success: true, tier: 'MANUSCRIPT_BYOK' });
    } catch {
      return c.json({ error: 'Failed to activate license' }, 500);
    }
  });

  // KDP activation
  app.post('/v1/billing/activate/kdp', requireAuth, async (c) => {
    try {
      const userId = c.get('userId');
      const body = await c.req.json() as { code: string };

      const kdpSecret = c.env.KDP_CODE_SECRET;
      if (!kdpSecret) {
        return c.json({ error: 'KDP codes not configured' }, 500);
      }

      const result = await verifyKdpCode(
        body.code,
        kdpSecret,
        c.env.DB,
        userId
      );

      if (!result.success) {
        return c.json({ error: result.error }, 400);
      }

      return c.json({ success: true, tier: 'MANUSCRIPT_BYOK' });
    } catch {
      return c.json({ error: 'Failed to activate code' }, 500);
    }
  });

  // Trial activation
  app.post('/v1/billing/activate/trial', requireAuth, async (c) => {
    try {
      const userId = c.get('userId');

      const user = await c.env.DB.prepare(
        'SELECT subscription_tier FROM users WHERE id = ?'
      ).bind(userId).first<{ subscription_tier: string | null }>();

      const currentTier = user?.subscription_tier;
      if (currentTier && currentTier !== 'NONE' && currentTier !== 'TRIAL') {
        return c.json({ error: 'Already subscribed', tier: currentTier }, 400);
      }

      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 14);

      await c.env.DB.prepare(
        "UPDATE users SET subscription_tier = ?, trial_expires_at = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind('TRIAL', trialExpiresAt.toISOString(), userId).run();

      await c.env.DB.prepare(`
        INSERT INTO subscriptions (id, user_id, tier, status, period_start, period_end)
        VALUES (?, ?, 'TRIAL', 'active', datetime('now'), ?)
        ON CONFLICT(user_id) DO UPDATE SET
          tier = 'TRIAL', status = 'active',
          period_end = excluded.period_end,
          updated_at = datetime('now')
      `).bind(crypto.randomUUID(), userId, trialExpiresAt.toISOString()).run();

      return c.json({ success: true, tier: 'TRIAL', expires_at: trialExpiresAt.toISOString() });
    } catch {
      return c.json({ error: 'Failed to activate trial' }, 500);
    }
  });

  const req = (path: string, init?: RequestInit) =>
    app.request(path, init, env);

  return { app, env, req };
}

/** Standard session mock query for auth middleware */
const sessionQuery: MockQueryResult = {
  pattern: 'sessions s JOIN users u',
  result: { user_id: 'user-1', id: 'sess-1', email: 'user@test.com' },
};

// ============================================================================
// Checkout Tests
// ============================================================================
describe('POST /v1/billing/checkout', () => {
  it('returns checkout URL on success', async () => {
    const { token } = await createTestSession();
    mockCheckout.mockResolvedValue({ url: 'https://checkout.stripe.com/test' });

    const { req } = buildBillingApp([sessionQuery]);

    const res = await req('/v1/billing/checkout', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        price_id: 'price_test',
        success_url: 'https://app.test/success',
        cancel_url: 'https://app.test/cancel',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { url: string };
    expect(body.url).toBe('https://checkout.stripe.com/test');
    expect(mockCheckout).toHaveBeenCalledWith(
      'user-1', 'price_test', 'https://app.test/success', 'https://app.test/cancel', 'sk_test_mock'
    );
  });

  it('returns 500 when Stripe throws', async () => {
    const { token } = await createTestSession();
    mockCheckout.mockRejectedValue(new Error('Stripe API error'));

    const { req } = buildBillingApp([sessionQuery]);

    const res = await req('/v1/billing/checkout', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        price_id: 'price_test',
        success_url: 'https://app.test/success',
        cancel_url: 'https://app.test/cancel',
      }),
    });

    expect(res.status).toBe(500);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('checkout session');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildBillingApp();

    const res = await req('/v1/billing/checkout', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ price_id: 'price_test' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Portal Tests
// ============================================================================
describe('POST /v1/billing/portal', () => {
  it('returns portal URL on success', async () => {
    const { token } = await createTestSession();
    mockPortal.mockResolvedValue({ url: 'https://billing.stripe.com/portal/test' });

    const { req } = buildBillingApp([sessionQuery]);

    const res = await req('/v1/billing/portal', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        customer_id: 'cus_test123',
        return_url: 'https://app.test/settings',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { url: string };
    expect(body.url).toBe('https://billing.stripe.com/portal/test');
  });

  it('returns 500 when Stripe throws', async () => {
    const { token } = await createTestSession();
    mockPortal.mockRejectedValue(new Error('Stripe error'));

    const { req } = buildBillingApp([sessionQuery]);

    const res = await req('/v1/billing/portal', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        customer_id: 'cus_test123',
        return_url: 'https://app.test/settings',
      }),
    });

    expect(res.status).toBe(500);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('portal session');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildBillingApp();

    const res = await req('/v1/billing/portal', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ customer_id: 'cus_test' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Gumroad License Activation Tests
// ============================================================================
describe('POST /v1/billing/activate/gumroad', () => {
  it('returns success and tier on valid license', async () => {
    const { token } = await createTestSession();
    mockGumroad.mockResolvedValue({ success: true });

    const { req } = buildBillingApp([sessionQuery]);

    const res = await req('/v1/billing/activate/gumroad', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ license_key: 'ABCD-1234-5678' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; tier: string };
    expect(body.success).toBe(true);
    expect(body.tier).toBe('MANUSCRIPT_BYOK');
  });

  it('returns 400 for invalid license', async () => {
    const { token } = await createTestSession();
    mockGumroad.mockResolvedValue({ success: false, error: 'Invalid license key' });

    const { req } = buildBillingApp([sessionQuery]);

    const res = await req('/v1/billing/activate/gumroad', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ license_key: 'BAD-KEY' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Invalid license');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildBillingApp();

    const res = await req('/v1/billing/activate/gumroad', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ license_key: 'KEY' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// KDP Code Activation Tests
// ============================================================================
describe('POST /v1/billing/activate/kdp', () => {
  it('returns success and tier on valid code', async () => {
    const { token } = await createTestSession();
    mockKdp.mockResolvedValue({ success: true });

    const { req } = buildBillingApp([sessionQuery]);

    const res = await req('/v1/billing/activate/kdp', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ code: 'AIXORD-ABCD-1234-5678' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; tier: string };
    expect(body.success).toBe(true);
    expect(body.tier).toBe('MANUSCRIPT_BYOK');
  });

  it('returns 400 for invalid code', async () => {
    const { token } = await createTestSession();
    mockKdp.mockResolvedValue({ success: false, error: 'Invalid code format' });

    const { req } = buildBillingApp([sessionQuery]);

    const res = await req('/v1/billing/activate/kdp', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ code: 'BAD-CODE' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Invalid code');
  });

  it('returns 400 for already-redeemed code', async () => {
    const { token } = await createTestSession();
    mockKdp.mockResolvedValue({ success: false, error: 'This code has already been redeemed' });

    const { req } = buildBillingApp([sessionQuery]);

    const res = await req('/v1/billing/activate/kdp', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ code: 'AIXORD-USED-CODE-1234' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('already been redeemed');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildBillingApp();

    const res = await req('/v1/billing/activate/kdp', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ code: 'AIXORD-ABCD-1234-5678' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Trial Activation Tests
// ============================================================================
describe('POST /v1/billing/activate/trial', () => {
  it('activates trial for NONE-tier user', async () => {
    const { token } = await createTestSession();

    const { req } = buildBillingApp([
      sessionQuery,
      // User has NONE tier
      { pattern: 'SELECT subscription_tier FROM users', result: { subscription_tier: 'NONE' } },
      // UPDATE users
      { pattern: 'UPDATE users SET subscription_tier', runResult: { success: true } },
      // INSERT subscription
      { pattern: 'INSERT INTO subscriptions', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/v1/billing/activate/trial', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; tier: string; expires_at: string };
    expect(body.success).toBe(true);
    expect(body.tier).toBe('TRIAL');
    expect(body.expires_at).toBeDefined();
  });

  it('activates trial for new user with null tier', async () => {
    const { token } = await createTestSession();

    const { req } = buildBillingApp([
      sessionQuery,
      { pattern: 'SELECT subscription_tier FROM users', result: { subscription_tier: null } },
      { pattern: 'UPDATE users SET subscription_tier', runResult: { success: true } },
      { pattern: 'INSERT INTO subscriptions', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/v1/billing/activate/trial', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; tier: string };
    expect(body.success).toBe(true);
    expect(body.tier).toBe('TRIAL');
  });

  it('returns 400 for already-subscribed user', async () => {
    const { token } = await createTestSession();

    const { req } = buildBillingApp([
      sessionQuery,
      { pattern: 'SELECT subscription_tier FROM users', result: { subscription_tier: 'PRO' } },
    ]);

    const res = await req('/v1/billing/activate/trial', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string; tier: string };
    expect(body.error).toContain('Already subscribed');
    expect(body.tier).toBe('PRO');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildBillingApp();

    const res = await req('/v1/billing/activate/trial', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(401);
  });
});
