/**
 * E2E: Pricing page
 *
 * Tests plan display, pricing information, and CTA buttons.
 * This page is public — no auth needed.
 */

import { test, expect } from '@playwright/test';

test.describe('Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
  });

  test('renders pricing page with plan names', async ({ page }) => {
    // Check that the major plan tiers are displayed
    await expect(page.locator('text=Free Trial')).toBeVisible();
    await expect(page.locator('text=Standard')).toBeVisible();
    await expect(page.locator('text=Pro')).toBeVisible();
    await expect(page.locator('text=Enterprise')).toBeVisible();
  });

  test('displays prices for plans', async ({ page }) => {
    // Free trial should show $0
    await expect(page.locator('text=$0')).toBeVisible();
    // At least one paid plan price should be visible
    const pricePattern = page.locator('text=/\\$\\d+\\.\\d{2}/');
    const count = await pricePattern.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('shows feature lists for plans', async ({ page }) => {
    // AI requests/month should appear in feature lists
    await expect(page.locator('text=/AI requests/i').first()).toBeVisible();
    // Projects should be mentioned
    await expect(page.locator('text=/project/i').first()).toBeVisible();
  });

  test('has CTA buttons for each plan', async ({ page }) => {
    // Free trial CTA
    await expect(page.locator('text=Start Free')).toBeVisible();
    // Subscribe buttons for paid plans
    const subscribeButtons = page.locator('text=Subscribe');
    const count = await subscribeButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);
    // Enterprise CTA
    await expect(page.locator('text=Contact Sales')).toBeVisible();
  });

  test('Subscribe button is clickable', async ({ page }) => {
    // Click on a Subscribe button — should either redirect to login or open Stripe
    const subscribeButton = page.locator('text=Subscribe').first();
    await expect(subscribeButton).toBeEnabled();
    // We verify it's clickable but don't proceed (would require auth/Stripe)
  });
});
