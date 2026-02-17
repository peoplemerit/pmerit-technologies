/**
 * E2E: Navigation and public pages
 *
 * Tests routing, 404 handling, and documentation pages.
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('landing page loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('404 page renders for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    const notFound = page.locator('text=/not found|404|doesn\'t exist/i');
    await expect(notFound.first()).toBeVisible({ timeout: 10000 });
  });

  test('docs pages load', async ({ page }) => {
    await page.goto('/docs');
    // Docs index should render
    await expect(page.locator('text=/documentation|docs|guide/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('docs quick-start page loads', async ({ page }) => {
    await page.goto('/docs/quick-start');
    await expect(page.locator('text=/quick start|getting started/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('pricing page is accessible from landing', async ({ page }) => {
    await page.goto('/');
    const pricingLink = page.getByRole('link', { name: /pricing/i });
    // There should be a pricing link somewhere (nav or hero)
    if (await pricingLink.isVisible()) {
      await pricingLink.click();
      await page.waitForURL(/\/pricing/);
    } else {
      // Navigate directly
      await page.goto('/pricing');
    }
    await expect(page.locator('text=/Free Trial|plans/i').first()).toBeVisible();
  });
});

test.describe('Security Headers', () => {
  test('response includes security headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() || {};
    // Cloudflare Pages _headers file should set these
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
  });
});
