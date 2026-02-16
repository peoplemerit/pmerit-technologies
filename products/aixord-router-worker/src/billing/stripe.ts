/**
 * Stripe Integration (D8)
 *
 * Handles Stripe webhooks and subscription management.
 */

import type { SubscriptionTier } from '../types';
import { STRIPE_PRICE_TO_TIER } from '../config/tiers';

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
  console.log(`[WEBHOOK] Processing event: ${event.type} (${event.id})`);

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
      console.log(`[WEBHOOK] Ignored event type: ${event.type}`);
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
    console.error('[WEBHOOK] checkout.session.completed: No user_id in metadata or client_reference_id');
    return { success: false, message: 'No user_id found in checkout session' };
  }

  // Resolve price ID from line_items or metadata
  const priceId = session.line_items?.data?.[0]?.price?.id || session.metadata?.price_id;
  if (!priceId) {
    // Price ID may not be expanded in the webhook payload — we'll get it from
    // the subsequent customer.subscription.created event. Log but don't fail.
    console.warn('[WEBHOOK] checkout.session.completed: No price_id found, will rely on subscription.created event');
  }

  const tier = priceId ? PRICE_TO_TIER[priceId] : null;

  // Store stripe_customer_id on user (needed for future subscription.updated/deleted events)
  if (session.customer) {
    await db.prepare(
      'UPDATE users SET stripe_customer_id = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(session.customer, userId).run();
    console.log(`[WEBHOOK] Stored stripe_customer_id=${session.customer} for user=${userId}`);
  }

  // If we have tier, update everything now. Otherwise wait for subscription.created.
  if (tier) {
    // Step 1: Upsert subscriptions table
    const subId = crypto.randomUUID();
    await db.prepare(`
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
    `).bind(subId, userId, tier, session.customer, session.subscription || '').run();

    // Step 2: CRITICAL — Update users.subscription_tier
    await db.prepare(
      'UPDATE users SET subscription_tier = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(tier, userId).run();

    // Step 3: Reset usage tracking for new billing period
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    await db.prepare(
      'DELETE FROM usage_tracking WHERE user_id = ? AND period = ?'
    ).bind(userId, currentPeriod).run();

    console.log(`[WEBHOOK] Checkout completed: user=${userId}, tier=${tier}, customer=${session.customer}`);
    return { success: true, message: `Checkout completed: user=${userId} activated ${tier}` };
  }

  console.log(`[WEBHOOK] Checkout completed (tier pending): user=${userId}, customer=${session.customer}`);
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

  if (existingSub) {
    await db.prepare(`
      UPDATE subscriptions
      SET tier = ?, status = ?, period_start = ?, period_end = ?, updated_at = datetime('now')
      WHERE stripe_subscription_id = ?
    `).bind(tier, status, periodStart, periodEnd, subscription.id).run();
  } else {
    // Need to find user by Stripe customer ID
    // FIX-STRIPE-PAYMENT-01: Check both users and subscriptions tables
    let user = await db.prepare(
      'SELECT id FROM users WHERE stripe_customer_id = ?'
    ).bind(subscription.customer).first<{ id: string }>();

    if (!user) {
      // Fallback: lookup via subscriptions table (stripe_customer_id lives there too)
      const subRecord = await db.prepare(
        'SELECT user_id FROM subscriptions WHERE stripe_customer_id = ?'
      ).bind(subscription.customer).first<{ user_id: string }>();
      if (subRecord) {
        user = { id: subRecord.user_id };
        // Backfill stripe_customer_id on users table for future lookups
        await db.prepare(
          'UPDATE users SET stripe_customer_id = ?, updated_at = datetime(\'now\') WHERE id = ?'
        ).bind(subscription.customer, subRecord.user_id).run();
        console.log(`[WEBHOOK] Backfilled stripe_customer_id on users table for user=${subRecord.user_id}`);
      }
    }

    if (!user) {
      return { success: false, message: `No user found for customer: ${subscription.customer}` };
    }

    const subId = crypto.randomUUID();
    await db.prepare(`
      INSERT INTO subscriptions (id, user_id, tier, status, stripe_customer_id, stripe_subscription_id, period_start, period_end)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(subId, user.id, tier, status, subscription.customer, subscription.id, periodStart, periodEnd).run();
  }

  // CRITICAL FIX: Also update users.subscription_tier
  // FIX-STRIPE-PAYMENT-01: Check both users and subscriptions tables for user lookup
  let userForTierUpdate = await db.prepare(
    'SELECT id FROM users WHERE stripe_customer_id = ?'
  ).bind(subscription.customer).first<{ id: string }>();

  if (!userForTierUpdate) {
    // Fallback: lookup via subscriptions table
    const subRecord = await db.prepare(
      'SELECT user_id FROM subscriptions WHERE stripe_customer_id = ?'
    ).bind(subscription.customer).first<{ user_id: string }>();
    if (subRecord) {
      userForTierUpdate = { id: subRecord.user_id };
    }
  }

  if (userForTierUpdate) {
    if (status === 'active') {
      await db.prepare(
        'UPDATE users SET subscription_tier = ?, stripe_customer_id = ?, updated_at = datetime(\'now\') WHERE id = ?'
      ).bind(tier, subscription.customer, userForTierUpdate.id).run();
      console.log(`[WEBHOOK] Updated users.subscription_tier=${tier} for user=${userForTierUpdate.id}`);
    } else if (status === 'cancelled' || status === 'expired') {
      // Downgrade to TRIAL on cancellation/expiry
      await db.prepare(
        'UPDATE users SET subscription_tier = \'TRIAL\', updated_at = datetime(\'now\') WHERE id = ?'
      ).bind(userForTierUpdate.id).run();
      console.log(`[WEBHOOK] Downgraded users.subscription_tier to TRIAL for user=${userForTierUpdate.id}`);
    }
  }

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
  // Mark subscription as cancelled
  await db.prepare(`
    UPDATE subscriptions
    SET status = 'cancelled', updated_at = datetime('now')
    WHERE stripe_subscription_id = ?
  `).bind(subscription.id).run();

  // CRITICAL FIX: Downgrade user tier to TRIAL
  const user = await db.prepare(
    'SELECT user_id FROM subscriptions WHERE stripe_customer_id = ?'
  ).bind(subscription.customer).first<{ user_id: string }>();

  if (user) {
    await db.prepare(
      'UPDATE users SET subscription_tier = \'TRIAL\', updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(user.user_id).run();
    console.log(`[WEBHOOK] Subscription deleted: downgraded user=${user.user_id} to TRIAL`);
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
  console.error(`Payment failed for event: ${event.id}`);
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
