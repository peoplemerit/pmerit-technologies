/**
 * Stripe Integration (D8)
 *
 * Handles Stripe webhooks and subscription management.
 */

import type { SubscriptionTier } from '../types';
import { STRIPE_PRICE_TO_TIER } from '../config/tiers';
import { log } from '../utils/logger';

// =============================================================================
// STRIPE TYPES
// =============================================================================

interface StripeSubscription {
  id: string;
  customer: string;
  status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing' | 'unpaid';
  current_period_start: number;
  current_period_end: number;
  items: {
    data: Array<{
      price: {
        id: string;
        product: string;
      };
    }>;
  };
}

interface StripeCustomer {
  id: string;
  email: string;
  metadata: {
    user_id?: string;
  };
}

interface StripeCheckoutSession {
  id: string;
  customer: string;
  subscription: string | null;
  client_reference_id: string | null;
  metadata: {
    user_id?: string;
    price_id?: string;
  };
  line_items?: {
    data: Array<{
      price: {
        id: string;
      };
    }>;
  };
}

interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: StripeSubscription | StripeCustomer | StripeCheckoutSession;
  };
}

// =============================================================================
// PRICE TO TIER MAPPING — Imported from config/tiers.ts (Single Source of Truth)
// STRIPE_PRICE_TO_TIER is derived from TIER_DEFINITIONS.stripePriceId
// =============================================================================

// Alias for backward compatibility within this file
const PRICE_TO_TIER = STRIPE_PRICE_TO_TIER;

// =============================================================================
// WEBHOOK HANDLER
// =============================================================================

/**
 * Verify Stripe webhook signature
 */
export async function verifyStripeSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): Promise<boolean> {
  // In production, use Stripe's signature verification
  // For now, basic HMAC verification
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const signatureBuffer = hexToBuffer(signature.split(',').find(s => s.startsWith('v1='))?.slice(3) || '');
  const timestampMatch = signature.match(/t=(\d+)/);
  const timestamp = timestampMatch ? timestampMatch[1] : '';

  const signedPayload = `${timestamp}.${payload}`;

  return crypto.subtle.verify(
    'HMAC',
    key,
    signatureBuffer,
    encoder.encode(signedPayload)
  );
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

/**
 * Handle Stripe webhook event
 */
export async function handleStripeWebhook(
  event: StripeWebhookEvent,
  db: D1Database
): Promise<{ success: boolean; message: string }> {
  log.info('webhook_event_received', { type: event.type, eventId: event.id });

  switch (event.type) {
    case 'checkout.session.completed':
      return handleCheckoutCompleted(event.data.object as StripeCheckoutSession, db);

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      return handleSubscriptionUpdate(event.data.object as StripeSubscription, db);

    case 'customer.subscription.deleted':
      return handleSubscriptionDeleted(event.data.object as StripeSubscription, db);

    case 'invoice.payment_failed':
      return handlePaymentFailed(event, db);

    default:
      log.info('webhook_event_ignored', { type: event.type });
      return { success: true, message: `Ignored event type: ${event.type}` };
  }
}

/**
 * Handle checkout.session.completed — First-time subscription activation
 *
 * CRITICAL: This is when a user first pays. We must:
 * 1. Resolve the tier from the price ID
 * 2. Upsert the subscriptions table
 * 3. Update users.subscription_tier (THE MISSING STEP that caused 24h of debugging)
 * 4. Store stripe_customer_id on the user for future webhook lookups
 */
async function handleCheckoutCompleted(
  session: StripeCheckoutSession,
  db: D1Database
): Promise<{ success: boolean; message: string }> {
  // Resolve user ID from metadata or client_reference_id
  const userId = session.metadata?.user_id || session.client_reference_id;
  if (!userId) {
    log.error('checkout_no_user_id', { sessionId: session.id });
    return { success: false, message: 'No user_id found in checkout session' };
  }

  // Resolve price ID from line_items or metadata
  const priceId = session.line_items?.data?.[0]?.price?.id || session.metadata?.price_id;
  if (!priceId) {
    // Price ID may not be expanded in the webhook payload — we'll get it from
    // the subsequent customer.subscription.created event. Log but don't fail.
    log.warn('checkout_no_price_id', { sessionId: session.id, fallback: 'subscription.created' });
  }

  const tier = priceId ? PRICE_TO_TIER[priceId] : null;

  // Store stripe_customer_id on user (needed for future subscription.updated/deleted events)
  if (session.customer) {
    await db.prepare(
      'UPDATE users SET stripe_customer_id = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(session.customer, userId).run();
    log.info('checkout_customer_id_stored', { userId: userId.slice(0, 8), customerId: session.customer.slice(0, 8) });
  }

  // If we have tier, update everything atomically. Otherwise wait for subscription.created.
  if (tier) {
    // Phase 1.2: Use db.batch() for atomic multi-table updates.
    // Prevents partial state where subscriptions is updated but users.subscription_tier is not
    // (the original "24h debugging" bug was exactly this split-brain scenario).
    const subId = crypto.randomUUID();
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    await db.batch([
      // Step 1: Upsert subscriptions table
      db.prepare(`
        INSERT INTO subscriptions (id, user_id, tier, status, stripe_customer_id, stripe_subscription_id, period_start, period_end)
        VALUES (?, ?, ?, 'active', ?, ?, datetime('now'), datetime('now', '+30 days'))
        ON CONFLICT(user_id) DO UPDATE SET
          tier = excluded.tier,
          status = 'active',
          stripe_customer_id = excluded.stripe_customer_id,
          stripe_subscription_id = excluded.stripe_subscription_id,
          period_start = datetime('now'),
          period_end = datetime('now', '+30 days'),
          updated_at = datetime('now')
      `).bind(subId, userId, tier, session.customer, session.subscription || ''),
      // Step 2: CRITICAL — Update users.subscription_tier
      db.prepare(
        'UPDATE users SET subscription_tier = ?, updated_at = datetime(\'now\') WHERE id = ?'
      ).bind(tier, userId),
      // Step 3: Reset usage tracking for new billing period
      db.prepare(
        'DELETE FROM usage_tracking WHERE user_id = ? AND period = ?'
      ).bind(userId, currentPeriod),
    ]);

    log.info('checkout_completed_atomic', { userId: userId.slice(0, 8), tier, customerId: session.customer.slice(0, 8) });
    return { success: true, message: `Checkout completed: user=${userId} activated ${tier}` };
  }

  log.info('checkout_completed_tier_pending', { userId: userId.slice(0, 8), customerId: session.customer.slice(0, 8) });
  return { success: true, message: `Checkout completed: customer stored, tier will be set by subscription.created` };
}

/**
 * Handle subscription created/updated
 *
 * FIXED: Now also updates users.subscription_tier (was the #1 subscription bug)
 */
async function handleSubscriptionUpdate(
  subscription: StripeSubscription,
  db: D1Database
): Promise<{ success: boolean; message: string }> {
  const priceId = subscription.items.data[0]?.price?.id;
  if (!priceId) {
    return { success: false, message: 'No price ID found in subscription' };
  }

  const tier = PRICE_TO_TIER[priceId];
  if (!tier) {
    return { success: false, message: `Unknown price ID: ${priceId}` };
  }

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    'active': 'active',
    'trialing': 'active',
    'past_due': 'past_due',
    'canceled': 'cancelled',
    'unpaid': 'past_due',
    'incomplete': 'past_due'
  };

  const status = statusMap[subscription.status] || 'expired';

  // Update or insert subscription
  const existingSub = await db.prepare(`
    SELECT id FROM subscriptions WHERE stripe_subscription_id = ?
  `).bind(subscription.id).first();

  const periodStart = new Date(subscription.current_period_start * 1000).toISOString();
  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

  // Phase 1.2: Resolve user ID first (reads), then batch all writes atomically.
  // FIX-STRIPE-PAYMENT-01: Check both users and subscriptions tables for user lookup
  let resolvedUserId: string | null = null;

  const userByCustomer = await db.prepare(
    'SELECT id FROM users WHERE stripe_customer_id = ?'
  ).bind(subscription.customer).first<{ id: string }>();

  if (userByCustomer) {
    resolvedUserId = userByCustomer.id;
  } else {
    // Fallback: lookup via subscriptions table (stripe_customer_id lives there too)
    const subRecord = await db.prepare(
      'SELECT user_id FROM subscriptions WHERE stripe_customer_id = ?'
    ).bind(subscription.customer).first<{ user_id: string }>();
    if (subRecord) {
      resolvedUserId = subRecord.user_id;
    }
  }

  // Build batch of write statements
  const batchStatements: D1PreparedStatement[] = [];

  if (existingSub) {
    batchStatements.push(
      db.prepare(`
        UPDATE subscriptions
        SET tier = ?, status = ?, period_start = ?, period_end = ?, updated_at = datetime('now')
        WHERE stripe_subscription_id = ?
      `).bind(tier, status, periodStart, periodEnd, subscription.id)
    );
  } else {
    if (!resolvedUserId) {
      return { success: false, message: `No user found for customer: ${subscription.customer}` };
    }

    const subId = crypto.randomUUID();
    batchStatements.push(
      db.prepare(`
        INSERT INTO subscriptions (id, user_id, tier, status, stripe_customer_id, stripe_subscription_id, period_start, period_end)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(subId, resolvedUserId, tier, status, subscription.customer, subscription.id, periodStart, periodEnd)
    );
  }

  // CRITICAL: Also update users.subscription_tier atomically in the same batch
  if (resolvedUserId) {
    if (status === 'active') {
      batchStatements.push(
        db.prepare(
          'UPDATE users SET subscription_tier = ?, stripe_customer_id = ?, updated_at = datetime(\'now\') WHERE id = ?'
        ).bind(tier, subscription.customer, resolvedUserId)
      );
      log.info('subscription_tier_batch_update', { userId: resolvedUserId.slice(0, 8), tier });
    } else if (status === 'cancelled' || status === 'expired') {
      batchStatements.push(
        db.prepare(
          'UPDATE users SET subscription_tier = \'TRIAL\', updated_at = datetime(\'now\') WHERE id = ?'
        ).bind(resolvedUserId)
      );
      log.info('subscription_tier_batch_downgrade', { userId: resolvedUserId.slice(0, 8), tier: 'TRIAL' });
    }

    // Backfill stripe_customer_id if it was missing from users table
    if (!userByCustomer && resolvedUserId) {
      batchStatements.push(
        db.prepare(
          'UPDATE users SET stripe_customer_id = ?, updated_at = datetime(\'now\') WHERE id = ?'
        ).bind(subscription.customer, resolvedUserId)
      );
      log.info('subscription_customer_id_backfill', { userId: resolvedUserId.slice(0, 8) });
    }
  }

  // Execute all writes atomically
  await db.batch(batchStatements);
  log.info('subscription_updated_atomic', { subscriptionId: subscription.id.slice(0, 8), tier, status, batchOps: batchStatements.length });

  return { success: true, message: `Subscription ${subscription.id} updated to ${tier} (${status})` };
}

/**
 * Handle subscription deleted (cancellation)
 *
 * FIXED: Now also downgrades users.subscription_tier to TRIAL
 */
async function handleSubscriptionDeleted(
  subscription: StripeSubscription,
  db: D1Database
): Promise<{ success: boolean; message: string }> {
  // Phase 1.2: Look up user first, then batch the cancellation + downgrade atomically
  const user = await db.prepare(
    'SELECT user_id FROM subscriptions WHERE stripe_customer_id = ?'
  ).bind(subscription.customer).first<{ user_id: string }>();

  if (user) {
    // Atomic: cancel subscription + downgrade user tier in one batch
    await db.batch([
      db.prepare(`
        UPDATE subscriptions
        SET status = 'cancelled', updated_at = datetime('now')
        WHERE stripe_subscription_id = ?
      `).bind(subscription.id),
      db.prepare(
        'UPDATE users SET subscription_tier = \'TRIAL\', updated_at = datetime(\'now\') WHERE id = ?'
      ).bind(user.user_id),
    ]);
    log.info('subscription_deleted_atomic', { userId: user.user_id.slice(0, 8), downgradedTo: 'TRIAL' });
  } else {
    // No user found — still mark subscription as cancelled
    await db.prepare(`
      UPDATE subscriptions
      SET status = 'cancelled', updated_at = datetime('now')
      WHERE stripe_subscription_id = ?
    `).bind(subscription.id).run();
    log.warn('subscription_deleted_no_user', { customerId: subscription.customer.slice(0, 8) });
  }

  return { success: true, message: `Subscription ${subscription.id} cancelled, user downgraded to TRIAL` };
}

/**
 * Handle payment failure
 */
async function handlePaymentFailed(
  event: StripeWebhookEvent,
  db: D1Database
): Promise<{ success: boolean; message: string }> {
  // Could send notification email, update status, etc.
  log.error('payment_failed', { eventId: event.id });
  return { success: true, message: 'Payment failure logged' };
}

// =============================================================================
// SUBSCRIPTION MANAGEMENT
// =============================================================================

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  stripeSecretKey: string
): Promise<{ url: string }> {
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'mode': 'subscription',
      'payment_method_types[0]': 'card',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'success_url': successUrl,
      'cancel_url': cancelUrl,
      'client_reference_id': userId,
      'metadata[user_id]': userId,
      'metadata[price_id]': priceId,
      'subscription_data[metadata][user_id]': userId
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stripe error: ${error}`);
  }

  const session = await response.json() as { url: string };
  return { url: session.url };
}

/**
 * Create customer portal session
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string,
  stripeSecretKey: string
): Promise<{ url: string }> {
  const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'customer': customerId,
      'return_url': returnUrl
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stripe portal error: ${error}`);
  }

  const session = await response.json() as { url: string };
  return { url: session.url };
}
