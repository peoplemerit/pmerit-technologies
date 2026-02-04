# Stripe Payment Setup Guide

**Document:** STRIPE-SETUP
**Version:** 1.0
**Date:** 2026-02-02
**Status:** Ready for Configuration

---

## Overview

This guide covers setting up Stripe payments for the AIXORD D4-CHAT platform.

## 1. Stripe Dashboard Setup

### Create Products and Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Click **Add Product** for each tier:

| Product Name | Price | Billing | Description |
|--------------|-------|---------|-------------|
| AIXORD Standard (BYOK) | $9.99/month | Recurring | 1000 requests/month, 10 projects, BYOK only |
| AIXORD Standard | $19.99/month | Recurring | 500 requests/month, 10 projects, Platform keys |
| AIXORD Pro | $49.99/month | Recurring | 2000 requests/month, Unlimited projects |

3. After creating each product, copy the **Price ID** (starts with `price_`)

### Configure Webhook

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Set endpoint URL: `https://aixord-router-worker.peoplemerit.workers.dev/v1/billing/webhook/stripe`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Webhook Signing Secret** (starts with `whsec_`)

### Configure Customer Portal

1. Go to [Customer Portal Settings](https://dashboard.stripe.com/settings/billing/portal)
2. Enable:
   - Update payment methods
   - Cancel subscriptions
   - View invoices
3. Save changes

## 2. Set Cloudflare Worker Secrets

```bash
cd C:\dev\pmerit\pmerit-technologies\products\aixord-router-worker

# Set Stripe secret key (from Stripe Dashboard > Developers > API keys)
npx wrangler secret put STRIPE_SECRET_KEY
# Paste: sk_live_... (or sk_test_... for test mode)

# Set webhook secret (from step 1.2)
npx wrangler secret put STRIPE_WEBHOOK_SECRET
# Paste: whsec_...
```

## 3. Update Price IDs

### Option A: Environment Variables (Recommended)

Create `.env` file in frontend:

```env
VITE_STRIPE_PRICE_BYOK_STANDARD=price_xxxxx
VITE_STRIPE_PRICE_PLATFORM_STANDARD=price_xxxxx
VITE_STRIPE_PRICE_PLATFORM_PRO=price_xxxxx
```

### Option B: Direct Code Update

Update `src/pages/Pricing.tsx` and `src/pages/Settings.tsx`:

```typescript
const STRIPE_PRICES: Record<SubscriptionTier, string | null> = {
  TRIAL: null,
  MANUSCRIPT_BYOK: null,
  BYOK_STANDARD: 'price_YOUR_ACTUAL_BYOK_STANDARD_ID',
  PLATFORM_STANDARD: 'price_YOUR_ACTUAL_PLATFORM_STANDARD_ID',
  PLATFORM_PRO: 'price_YOUR_ACTUAL_PLATFORM_PRO_ID',
  ENTERPRISE: null,
};
```

## 4. Backend Price Mapping

Update `src/billing/stripe.ts`:

```typescript
const PRICE_TO_TIER: Record<string, SubscriptionTier> = {
  'price_YOUR_ACTUAL_BYOK_STANDARD_ID': 'BYOK_STANDARD',
  'price_YOUR_ACTUAL_PLATFORM_STANDARD_ID': 'PLATFORM_STANDARD',
  'price_YOUR_ACTUAL_PLATFORM_PRO_ID': 'PLATFORM_PRO',
  // Add live and test price IDs
};
```

## 5. Testing

### Test Mode

1. Use Stripe test keys (`sk_test_...`, `pk_test_...`)
2. Use test card: `4242 4242 4242 4242` (any future date, any CVC)
3. Test the full flow:
   - Go to `/pricing`
   - Select a plan
   - Complete checkout
   - Verify subscription in Settings

### Production Mode

1. Switch to live keys (`sk_live_...`, `pk_live_...`)
2. Update webhook endpoint to use live signing secret
3. Test with a real card (can refund immediately)

## 6. Verification Checklist

- [ ] Stripe products created
- [ ] Prices configured
- [ ] Webhook endpoint added
- [ ] Customer portal enabled
- [ ] `STRIPE_SECRET_KEY` set in Cloudflare
- [ ] `STRIPE_WEBHOOK_SECRET` set in Cloudflare
- [ ] Price IDs updated in frontend
- [ ] Price IDs mapped in backend
- [ ] Test checkout flow works
- [ ] Test webhook receives events
- [ ] Test customer portal access

## Files Reference

| File | Purpose |
|------|---------|
| `src/billing/stripe.ts` | Stripe API integration |
| `src/index.ts` | Billing endpoints registration |
| `migrations/0001_subscriptions.sql` | Subscription table schema |
| `frontend/src/pages/Pricing.tsx` | Public pricing page |
| `frontend/src/pages/Settings.tsx` | Subscription management |
| `frontend/src/lib/api.ts` | billingApi client |

## Support

For issues with Stripe integration:
- Check Cloudflare Worker logs: `npx wrangler tail`
- Check Stripe webhook logs in Dashboard
- Verify secrets are set: `npx wrangler secret list`
