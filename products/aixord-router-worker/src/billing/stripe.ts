/**
 * Stripe Integration (D8)
 *
 * Handles Stripe webhooks and subscription management.
 */

import type { SubscriptionTier } from '../types';

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

interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: StripeSubscription | StripeCustomer;
  };
}

// =============================================================================
// PRICE TO TIER MAPPING
// =============================================================================

// Map Stripe price IDs to subscription tiers
// Production price IDs from Stripe Dashboard (configured Session 12)
const PRICE_TO_TIER: Record<string, SubscriptionTier> = {
  // AIXORD Standard (BYOK) - $9.99/month
  'price_1SwVtL1Uy2Gsjci2w3a8b5hX': 'BYOK_STANDARD',

  // AIXORD Standard - $19.99/month
  'price_1SwVsN1Uy2Gsjci2CHVecrv9': 'PLATFORM_STANDARD',

  // AIXORD Pro - $49.99/month
  'price_1SwVq61Uy2Gsjci2Wd6gxdAe': 'PLATFORM_PRO',

  // Enterprise - Custom (future)
  'price_enterprise_monthly': 'ENTERPRISE'
};

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
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      return handleSubscriptionUpdate(event.data.object as StripeSubscription, db);

    case 'customer.subscription.deleted':
      return handleSubscriptionDeleted(event.data.object as StripeSubscription, db);

    case 'invoice.payment_failed':
      return handlePaymentFailed(event, db);

    default:
      return { success: true, message: `Ignored event type: ${event.type}` };
  }
}

/**
 * Handle subscription created/updated
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
    const user = await db.prepare(`
      SELECT id FROM users WHERE stripe_customer_id = ?
    `).bind(subscription.customer).first<{ id: string }>();

    if (!user) {
      return { success: false, message: `No user found for customer: ${subscription.customer}` };
    }

    const subId = crypto.randomUUID();
    await db.prepare(`
      INSERT INTO subscriptions (id, user_id, tier, status, stripe_customer_id, stripe_subscription_id, period_start, period_end)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(subId, user.id, tier, status, subscription.customer, subscription.id, periodStart, periodEnd).run();
  }

  return { success: true, message: `Subscription ${subscription.id} updated to ${tier} (${status})` };
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(
  subscription: StripeSubscription,
  db: D1Database
): Promise<{ success: boolean; message: string }> {
  await db.prepare(`
    UPDATE subscriptions
    SET status = 'cancelled', updated_at = datetime('now')
    WHERE stripe_subscription_id = ?
  `).bind(subscription.id).run();

  return { success: true, message: `Subscription ${subscription.id} cancelled` };
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
      'metadata[user_id]': userId
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
