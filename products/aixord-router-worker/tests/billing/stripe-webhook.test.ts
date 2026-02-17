/**
 * Stripe Webhook Handler Tests
 *
 * Tests the Stripe webhook signature verification and event handlers.
 * These test the billing/stripe.ts module directly (unit-level).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockDB, type MockQueryResult } from '../helpers';
import {
  verifyStripeSignature,
  handleStripeWebhook,
} from '../../src/billing/stripe';

// Helper to create a valid Stripe signature for testing
async function createValidSignature(
  payload: string,
  secret: string,
  timestamp?: number
): Promise<string> {
  const ts = timestamp ?? Math.floor(Date.now() / 1000);
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signedPayload = `${ts}.${payload}`;
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `t=${ts},v1=${hex}`;
}

// ============================================================================
// Signature Verification Tests
// ============================================================================
describe('verifyStripeSignature', () => {
  const secret = 'whsec_test_secret_123';

  it('returns true for a valid signature', async () => {
    const payload = '{"id":"evt_test","type":"checkout.session.completed"}';
    const sig = await createValidSignature(payload, secret);
    const result = await verifyStripeSignature(payload, sig, secret);
    expect(result).toBe(true);
  });

  it('returns false for a tampered payload', async () => {
    const payload = '{"id":"evt_test","type":"checkout.session.completed"}';
    const sig = await createValidSignature(payload, secret);
    const tampered = '{"id":"evt_evil","type":"checkout.session.completed"}';
    const result = await verifyStripeSignature(tampered, sig, secret);
    expect(result).toBe(false);
  });

  it('returns false for wrong secret', async () => {
    const payload = '{"id":"evt_test"}';
    const sig = await createValidSignature(payload, secret);
    const result = await verifyStripeSignature(payload, sig, 'whsec_wrong_secret');
    expect(result).toBe(false);
  });

  it('returns false for malformed signature header', async () => {
    const payload = '{"id":"evt_test"}';
    // Missing v1= prefix
    const result = await verifyStripeSignature(payload, 't=123,invalid', secret);
    expect(result).toBe(false);
  });
});

// ============================================================================
// handleStripeWebhook — checkout.session.completed
// ============================================================================
describe('handleStripeWebhook — checkout.session.completed', () => {
  it('activates subscription when user_id and price_id are present', async () => {
    const db = createMockDB([
      // Store stripe_customer_id on user
      { pattern: 'UPDATE users SET stripe_customer_id', runResult: { success: true, changes: 1 } },
      // Upsert subscription
      { pattern: 'INSERT INTO subscriptions', runResult: { success: true, changes: 1 } },
      // Update users.subscription_tier
      { pattern: 'UPDATE users SET subscription_tier', runResult: { success: true, changes: 1 } },
      // Reset usage tracking
      { pattern: 'DELETE FROM usage_tracking', runResult: { success: true, changes: 0 } },
    ]) as unknown as D1Database;

    const result = await handleStripeWebhook({
      id: 'evt_test',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test',
          customer: 'cus_test123',
          subscription: 'sub_test',
          client_reference_id: 'user-abc',
          metadata: { user_id: 'user-abc', price_id: 'price_1SwVtL1Uy2Gsjci2w3a8b5hX' },
          line_items: { data: [{ price: { id: 'price_1SwVtL1Uy2Gsjci2w3a8b5hX' } }] },
        },
      },
    }, db);

    expect(result.success).toBe(true);
    expect(result.message).toContain('BYOK_STANDARD');
  });

  it('returns failure when no user_id found', async () => {
    const db = createMockDB([]) as unknown as D1Database;

    const result = await handleStripeWebhook({
      id: 'evt_test',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test',
          customer: 'cus_test',
          subscription: null,
          client_reference_id: null,
          metadata: {},
        },
      },
    }, db);

    expect(result.success).toBe(false);
    expect(result.message).toContain('No user_id');
  });

  it('stores stripe_customer_id even when price_id is missing', async () => {
    const db = createMockDB([
      { pattern: 'UPDATE users SET stripe_customer_id', runResult: { success: true, changes: 1 } },
    ]) as unknown as D1Database;

    const result = await handleStripeWebhook({
      id: 'evt_test',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test',
          customer: 'cus_test',
          subscription: null,
          client_reference_id: 'user-abc',
          metadata: { user_id: 'user-abc' },
          // No line_items, no price_id in metadata
        },
      },
    }, db);

    expect(result.success).toBe(true);
    expect(result.message).toContain('tier will be set by subscription.created');
  });
});

// ============================================================================
// handleStripeWebhook — customer.subscription.updated
// ============================================================================
describe('handleStripeWebhook — subscription.updated', () => {
  it('updates existing subscription and user tier', async () => {
    const db = createMockDB([
      // Find existing subscription by stripe_subscription_id
      { pattern: 'SELECT id FROM subscriptions WHERE stripe_subscription_id', result: { id: 'sub-existing' } },
      // Update subscription
      { pattern: 'UPDATE subscriptions', runResult: { success: true, changes: 1 } },
      // Lookup user by stripe_customer_id for tier update
      { pattern: 'SELECT id FROM users WHERE stripe_customer_id', result: { id: 'user-abc' } },
      // Update user tier
      { pattern: 'UPDATE users SET subscription_tier', runResult: { success: true, changes: 1 } },
    ]) as unknown as D1Database;

    const result = await handleStripeWebhook({
      id: 'evt_test',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_stripe_123',
          customer: 'cus_test',
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 2592000,
          items: { data: [{ price: { id: 'price_1SwVsN1Uy2Gsjci2CHVecrv9', product: 'prod_test' } }] },
        },
      },
    }, db);

    expect(result.success).toBe(true);
    expect(result.message).toContain('PLATFORM_STANDARD');
  });

  it('returns failure for unknown price ID', async () => {
    const db = createMockDB([]) as unknown as D1Database;

    const result = await handleStripeWebhook({
      id: 'evt_test',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_test',
          customer: 'cus_test',
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 2592000,
          items: { data: [{ price: { id: 'price_unknown', product: 'prod_test' } }] },
        },
      },
    }, db);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Unknown price ID');
  });

  it('creates new subscription when none exists and finds user by customer ID', async () => {
    const db = createMockDB([
      // No existing subscription
      { pattern: 'SELECT id FROM subscriptions WHERE stripe_subscription_id', result: null },
      // Find user by stripe_customer_id
      { pattern: 'SELECT id FROM users WHERE stripe_customer_id', result: { id: 'user-abc' } },
      // Insert new subscription
      { pattern: 'INSERT INTO subscriptions', runResult: { success: true, changes: 1 } },
      // Update user tier
      { pattern: 'UPDATE users SET subscription_tier', runResult: { success: true, changes: 1 } },
    ]) as unknown as D1Database;

    const result = await handleStripeWebhook({
      id: 'evt_test',
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_new',
          customer: 'cus_test',
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 2592000,
          items: { data: [{ price: { id: 'price_1SwVq61Uy2Gsjci2Wd6gxdAe', product: 'prod_test' } }] },
        },
      },
    }, db);

    expect(result.success).toBe(true);
    expect(result.message).toContain('PLATFORM_PRO');
  });

  it('falls back to subscriptions table for user lookup', async () => {
    const db = createMockDB([
      // No existing subscription by stripe_subscription_id
      { pattern: 'SELECT id FROM subscriptions WHERE stripe_subscription_id', result: null },
      // User NOT found in users table
      { pattern: 'SELECT id FROM users WHERE stripe_customer_id', result: null },
      // Fallback: Find user via subscriptions table
      { pattern: 'SELECT user_id FROM subscriptions WHERE stripe_customer_id', result: { user_id: 'user-abc' } },
      // Backfill stripe_customer_id on users
      { pattern: 'UPDATE users SET stripe_customer_id', runResult: { success: true } },
      // Insert subscription
      { pattern: 'INSERT INTO subscriptions', runResult: { success: true, changes: 1 } },
      // Update user tier
      { pattern: 'UPDATE users SET subscription_tier', runResult: { success: true, changes: 1 } },
    ]) as unknown as D1Database;

    const result = await handleStripeWebhook({
      id: 'evt_test',
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_new',
          customer: 'cus_test',
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 2592000,
          items: { data: [{ price: { id: 'price_1SwVtL1Uy2Gsjci2w3a8b5hX', product: 'prod_test' } }] },
        },
      },
    }, db);

    expect(result.success).toBe(true);
    expect(result.message).toContain('BYOK_STANDARD');
  });
});

// ============================================================================
// handleStripeWebhook — customer.subscription.deleted
// ============================================================================
describe('handleStripeWebhook — subscription.deleted', () => {
  it('cancels subscription and downgrades user to TRIAL', async () => {
    const db = createMockDB([
      // Mark subscription cancelled
      { pattern: 'UPDATE subscriptions', runResult: { success: true, changes: 1 } },
      // Find user via subscriptions
      { pattern: 'SELECT user_id FROM subscriptions WHERE stripe_customer_id', result: { user_id: 'user-abc' } },
      // Downgrade user tier
      { pattern: 'UPDATE users SET subscription_tier', runResult: { success: true, changes: 1 } },
    ]) as unknown as D1Database;

    const result = await handleStripeWebhook({
      id: 'evt_test',
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_cancelled',
          customer: 'cus_test',
          status: 'canceled',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 2592000,
          items: { data: [{ price: { id: 'price_test', product: 'prod_test' } }] },
        },
      },
    }, db);

    expect(result.success).toBe(true);
    expect(result.message).toContain('cancelled');
    expect(result.message).toContain('downgraded to TRIAL');
  });
});

// ============================================================================
// handleStripeWebhook — invoice.payment_failed
// ============================================================================
describe('handleStripeWebhook — invoice.payment_failed', () => {
  it('logs payment failure and returns success', async () => {
    const db = createMockDB([]) as unknown as D1Database;

    const result = await handleStripeWebhook({
      id: 'evt_test',
      type: 'invoice.payment_failed',
      data: { object: {} as any },
    }, db);

    expect(result.success).toBe(true);
    expect(result.message).toContain('Payment failure logged');
  });
});

// ============================================================================
// handleStripeWebhook — unknown event type
// ============================================================================
describe('handleStripeWebhook — ignored events', () => {
  it('ignores unknown event types gracefully', async () => {
    const db = createMockDB([]) as unknown as D1Database;

    const result = await handleStripeWebhook({
      id: 'evt_test',
      type: 'some.unknown.event',
      data: { object: {} as any },
    }, db);

    expect(result.success).toBe(true);
    expect(result.message).toContain('Ignored event type');
  });
});
