/**
 * AIXORD Web App API Client - Billing
 */

import { APIError } from './core';

/**
 * Billing base URL (same worker, different endpoint path)
 */
const BILLING_BASE = `${import.meta.env.VITE_ROUTER_URL || 'https://aixord-router-worker.peoplemerit.workers.dev'}/v1/billing`;

/**
 * Subscription tier type
 */
export type SubscriptionTier = 'TRIAL' | 'MANUSCRIPT_BYOK' | 'BYOK_STANDARD' | 'PLATFORM_STANDARD' | 'PLATFORM_PRO' | 'ENTERPRISE';

/**
 * Subscription status type
 */
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';

/**
 * Subscription info
 */
export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  keyMode: 'PLATFORM' | 'BYOK';
  periodStart?: string;
  periodEnd?: string;
  stripeCustomerId?: string;
}

// CRIT-05 FIX: Helper to get auth headers for billing requests
export function getBillingAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const token = localStorage.getItem('aixord_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    // localStorage may be blocked
  }
  return headers;
}

export const billingApi = {
  /**
   * Create a Stripe checkout session for subscription upgrade
   * Returns URL to redirect user to Stripe checkout
   */
  async createCheckout(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ url: string }> {
    const response = await fetch(`${BILLING_BASE}/checkout`, {
      method: 'POST',
      headers: getBillingAuthHeaders(),
      body: JSON.stringify({
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });

    const data = await response.json() as { url?: string; error?: string };

    if (!response.ok) {
      throw new APIError(response.status, 'BILLING_ERROR', data.error || 'Failed to create checkout session');
    }

    if (!data.url) {
      throw new APIError(500, 'BILLING_ERROR', 'No checkout URL received from billing service');
    }

    return { url: data.url };
  },

  /**
   * Create a Stripe customer portal session for subscription management
   * Returns URL to redirect user to Stripe customer portal
   */
  async createPortal(
    customerId: string,
    returnUrl: string
  ): Promise<{ url: string }> {
    const response = await fetch(`${BILLING_BASE}/portal`, {
      method: 'POST',
      headers: getBillingAuthHeaders(),
      body: JSON.stringify({
        customer_id: customerId,
        return_url: returnUrl,
      }),
    });

    const data = await response.json() as { url?: string; error?: string };

    if (!response.ok) {
      throw new APIError(response.status, 'BILLING_ERROR', data.error || 'Failed to create portal session');
    }

    if (!data.url) {
      throw new APIError(500, 'BILLING_ERROR', 'No portal URL received from billing service');
    }

    return { url: data.url };
  },

  /**
   * Activate a Gumroad license (one-time purchase)
   */
  async activateGumroad(
    userId: string,
    licenseKey: string
  ): Promise<{ success: boolean; tier: SubscriptionTier }> {
    const response = await fetch(`${BILLING_BASE}/activate/gumroad`, {
      method: 'POST',
      headers: getBillingAuthHeaders(),
      body: JSON.stringify({
        license_key: licenseKey,
      }),
    });

    const data = await response.json() as { success?: boolean; tier?: SubscriptionTier; error?: string };

    if (!response.ok) {
      throw new APIError(response.status, 'BILLING_ERROR', data.error || 'Failed to activate license');
    }

    return { success: true, tier: data.tier || 'MANUSCRIPT_BYOK' };
  },

  /**
   * Activate a KDP book code (one-time purchase)
   */
  async activateKdp(
    userId: string,
    code: string
  ): Promise<{ success: boolean; tier: SubscriptionTier }> {
    const response = await fetch(`${BILLING_BASE}/activate/kdp`, {
      method: 'POST',
      headers: getBillingAuthHeaders(),
      body: JSON.stringify({
        code: code,
      }),
    });

    const data = await response.json() as { success?: boolean; tier?: SubscriptionTier; error?: string };

    if (!response.ok) {
      throw new APIError(response.status, 'BILLING_ERROR', data.error || 'Failed to activate code');
    }

    return { success: true, tier: data.tier || 'MANUSCRIPT_BYOK' };
  },
};
