/**
 * Gumroad License & KDP Code Activation Tests
 *
 * Tests the billing/gumroad.ts module: Gumroad license verification,
 * activation, and KDP book purchase code redemption.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockDB, type MockQueryResult } from '../helpers';
import {
  verifyGumroadLicense,
  activateGumroadLicense,
  verifyKdpCode,
} from '../../src/billing/gumroad';

// Mock global fetch for Gumroad API calls
const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

// ============================================================================
// Gumroad License Verification Tests
// ============================================================================
describe('verifyGumroadLicense', () => {
  it('returns valid for a good license key', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        success: true,
        uses: 0,
        purchase: {
          id: 'purchase-123',
          product_id: 'test-product',
          email: 'buyer@example.com',
          created_at: '2026-01-01T00:00:00Z',
          refunded: false,
          chargebacked: false,
        },
      }),
    });

    const result = await verifyGumroadLicense('LICENSE-KEY-123', 'test-product');

    expect(result.valid).toBe(true);
    expect(result.email).toBe('buyer@example.com');
    expect(result.purchaseId).toBe('purchase-123');
  });

  it('returns invalid for bad license key', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        success: false,
        message: 'That license does not exist for the provided product.',
      }),
    });

    const result = await verifyGumroadLicense('BAD-KEY', 'test-product');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid license key');
  });

  it('returns invalid for refunded purchase', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        success: true,
        uses: 1,
        purchase: {
          id: 'purchase-456',
          product_id: 'test-product',
          email: 'refunded@example.com',
          created_at: '2026-01-01T00:00:00Z',
          refunded: true,
          chargebacked: false,
        },
      }),
    });

    const result = await verifyGumroadLicense('REFUNDED-KEY', 'test-product');

    expect(result.valid).toBe(false);
    expect(result.error).toContain('refunded');
  });

  it('returns invalid for chargebacked purchase', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        success: true,
        uses: 1,
        purchase: {
          id: 'purchase-789',
          product_id: 'test-product',
          email: 'chargeback@example.com',
          created_at: '2026-01-01T00:00:00Z',
          refunded: false,
          chargebacked: true,
        },
      }),
    });

    const result = await verifyGumroadLicense('CHARGEBACK-KEY', 'test-product');

    expect(result.valid).toBe(false);
    expect(result.error).toContain('charged back');
  });

  it('handles network errors gracefully', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network timeout'));

    const result = await verifyGumroadLicense('KEY', 'product');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Verification failed');
  });
});

// ============================================================================
// Gumroad License Activation Tests
// ============================================================================
describe('activateGumroadLicense', () => {
  it('activates license and creates new subscription', async () => {
    // First call: verifyGumroadLicense (increment_uses_count=false)
    // Second call: activateGumroadLicense (increment_uses_count=true)
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          uses: 0,
          purchase: {
            id: 'purchase-abc',
            product_id: 'test-product',
            email: 'buyer@example.com',
            created_at: '2026-01-01T00:00:00Z',
            refunded: false,
            chargebacked: false,
          },
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          uses: 1,
          purchase: {
            id: 'purchase-abc',
            product_id: 'test-product',
            email: 'buyer@example.com',
            created_at: '2026-01-01T00:00:00Z',
            refunded: false,
            chargebacked: false,
          },
        }),
      });

    const db = createMockDB([
      // Check if license already used by another user
      { pattern: 'SELECT user_id FROM subscriptions WHERE gumroad_sale_id', result: null },
      // Check existing subscription for this user
      { pattern: 'SELECT id FROM subscriptions WHERE user_id', result: null },
      // Insert new subscription
      { pattern: 'INSERT INTO subscriptions', runResult: { success: true, changes: 1 } },
    ]) as unknown as D1Database;

    const result = await activateGumroadLicense('LICENSE-KEY', 'test-product', db, 'user-123');

    expect(result.success).toBe(true);
  });

  it('rejects license already used by another user', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        success: true,
        uses: 1,
        purchase: {
          id: 'purchase-abc',
          product_id: 'test-product',
          email: 'original@example.com',
          created_at: '2026-01-01T00:00:00Z',
          refunded: false,
          chargebacked: false,
        },
      }),
    });

    const db = createMockDB([
      // License already used by different user
      { pattern: 'SELECT user_id FROM subscriptions WHERE gumroad_sale_id', result: { user_id: 'other-user-456' } },
    ]) as unknown as D1Database;

    const result = await activateGumroadLicense('LICENSE-KEY', 'test-product', db, 'user-123');

    expect(result.success).toBe(false);
    expect(result.error).toContain('already in use');
  });

  it('updates existing subscription when user already has one', async () => {
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          uses: 0,
          purchase: {
            id: 'purchase-abc',
            product_id: 'test-product',
            email: 'buyer@example.com',
            created_at: '2026-01-01T00:00:00Z',
            refunded: false,
            chargebacked: false,
          },
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          uses: 1,
          purchase: {
            id: 'purchase-abc',
            product_id: 'test-product',
            email: 'buyer@example.com',
            created_at: '2026-01-01T00:00:00Z',
            refunded: false,
            chargebacked: false,
          },
        }),
      });

    const db = createMockDB([
      // License not used by another user
      { pattern: 'SELECT user_id FROM subscriptions WHERE gumroad_sale_id', result: null },
      // User already has a subscription
      { pattern: 'SELECT id FROM subscriptions WHERE user_id', result: { id: 'existing-sub' } },
      // Update subscription
      { pattern: 'UPDATE subscriptions', runResult: { success: true, changes: 1 } },
    ]) as unknown as D1Database;

    const result = await activateGumroadLicense('LICENSE-KEY', 'test-product', db, 'user-123');

    expect(result.success).toBe(true);
  });
});

// ============================================================================
// KDP Code Verification Tests
// ============================================================================
describe('verifyKdpCode', () => {
  it('rejects invalid code format', async () => {
    const db = createMockDB([]) as unknown as D1Database;

    const result = await verifyKdpCode('INVALID-FORMAT', db, 'user-123');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid code format');
  });

  it('rejects code with wrong prefix', async () => {
    const db = createMockDB([]) as unknown as D1Database;

    const result = await verifyKdpCode('WRONG-ABCD-EFGH-IJKL', db, 'user-123');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid code format');
  });

  it('redeems valid KDP code and creates subscription', async () => {
    const db = createMockDB([
      // Code not already redeemed via subscriptions
      { pattern: 'SELECT user_id FROM subscriptions WHERE kdp_code', result: null },
      // Code exists in kdp_codes table and is unused
      { pattern: 'SELECT code FROM kdp_codes WHERE code', result: { code: 'AIXORD-AB12-CD34-EF56' } },
      // Mark code as used
      { pattern: 'UPDATE kdp_codes SET used', runResult: { success: true, changes: 1 } },
      // No existing subscription for user
      { pattern: 'SELECT id FROM subscriptions WHERE user_id', result: null },
      // Insert new subscription
      { pattern: 'INSERT INTO subscriptions', runResult: { success: true, changes: 1 } },
    ]) as unknown as D1Database;

    const result = await verifyKdpCode('AIXORD-AB12-CD34-EF56', db, 'user-123');

    expect(result.success).toBe(true);
  });

  it('returns success when code already redeemed by same user', async () => {
    const db = createMockDB([
      // Code already redeemed by this same user
      { pattern: 'SELECT user_id FROM subscriptions WHERE kdp_code', result: { user_id: 'user-123' } },
    ]) as unknown as D1Database;

    const result = await verifyKdpCode('AIXORD-AB12-CD34-EF56', db, 'user-123');

    expect(result.success).toBe(true);
  });

  it('rejects code already redeemed by different user', async () => {
    const db = createMockDB([
      // Code redeemed by different user
      { pattern: 'SELECT user_id FROM subscriptions WHERE kdp_code', result: { user_id: 'other-user-456' } },
    ]) as unknown as D1Database;

    const result = await verifyKdpCode('AIXORD-AB12-CD34-EF56', db, 'user-123');

    expect(result.success).toBe(false);
    expect(result.error).toContain('already been redeemed');
  });

  it('rejects code not found in kdp_codes table', async () => {
    const db = createMockDB([
      // Code not redeemed via subscriptions
      { pattern: 'SELECT user_id FROM subscriptions WHERE kdp_code', result: null },
      // Code not found in kdp_codes (invalid or already used)
      { pattern: 'SELECT code FROM kdp_codes WHERE code', result: null },
    ]) as unknown as D1Database;

    const result = await verifyKdpCode('AIXORD-XX99-YY88-ZZ77', db, 'user-123');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid or expired');
  });

  it('updates existing subscription when user already has one', async () => {
    const db = createMockDB([
      // Code not redeemed
      { pattern: 'SELECT user_id FROM subscriptions WHERE kdp_code', result: null },
      // Valid unused code
      { pattern: 'SELECT code FROM kdp_codes WHERE code', result: { code: 'AIXORD-AB12-CD34-EF56' } },
      // Mark code used
      { pattern: 'UPDATE kdp_codes SET used', runResult: { success: true, changes: 1 } },
      // User has existing subscription
      { pattern: 'SELECT id FROM subscriptions WHERE user_id', result: { id: 'existing-sub' } },
      // Update subscription
      { pattern: 'UPDATE subscriptions', runResult: { success: true, changes: 1 } },
    ]) as unknown as D1Database;

    const result = await verifyKdpCode('AIXORD-AB12-CD34-EF56', db, 'user-123');

    expect(result.success).toBe(true);
  });
});
