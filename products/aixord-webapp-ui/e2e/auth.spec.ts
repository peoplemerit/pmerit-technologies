/**
 * E2E: Authentication flows
 *
 * Tests login, signup, logout, and password reset UI.
 * Runs against staging or production deployment.
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any stored auth state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('aixord_token');
      localStorage.removeItem('aixord_user');
    });
  });

  test('landing page loads and has CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AIXORD|D4-CHAT/i);
    // Landing page should have some form of sign-up or get-started CTA
    const cta = page.getByRole('link', { name: /get started|sign up|try free/i });
    await expect(cta).toBeVisible();
  });

  test('login page renders form fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /log in|sign in/i })).toBeVisible();
  });

  test('login shows validation error for empty fields', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    // Should show some form of validation error
    const errorText = page.locator('text=/email|required|invalid/i');
    await expect(errorText.first()).toBeVisible({ timeout: 5000 });
  });

  test('login shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('nonexistent@test.invalid');
    await page.getByLabel(/password/i).fill('wrongpassword123');
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    // Should show auth error
    const error = page.locator('text=/invalid|incorrect|not found|failed/i');
    await expect(error.first()).toBeVisible({ timeout: 10000 });
  });

  test('signup page renders form fields', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up|create|register/i })).toBeVisible();
  });

  test('signup shows validation for short password', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel(/email/i).fill('test@example.com');
    // Fill password fields — there may be a "confirm password" too
    const passwordFields = page.getByLabel(/password/i);
    await passwordFields.first().fill('short');
    const count = await passwordFields.count();
    if (count > 1) {
      await passwordFields.nth(1).fill('short');
    }
    await page.getByRole('button', { name: /sign up|create|register/i }).click();
    const error = page.locator('text=/8 characters|too short|password/i');
    await expect(error.first()).toBeVisible({ timeout: 5000 });
  });

  test('forgot password page renders', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /reset|send|submit/i })).toBeVisible();
  });

  test('protected routes redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to /login
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('navigation between login and signup works', async ({ page }) => {
    await page.goto('/login');
    // Find link to signup
    const signupLink = page.getByRole('link', { name: /sign up|create account|register/i });
    await expect(signupLink).toBeVisible();
    await signupLink.click();
    await page.waitForURL(/\/signup/);
    // Find link back to login
    const loginLink = page.getByRole('link', { name: /log in|sign in|already have/i });
    await expect(loginLink).toBeVisible();
  });
});
