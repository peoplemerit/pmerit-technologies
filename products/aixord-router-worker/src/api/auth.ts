/**
 * Auth API
 *
 * Endpoints:
 * - POST /api/v1/auth/register
 * - POST /api/v1/auth/login
 * - GET  /api/v1/auth/me
 * - POST /api/v1/auth/logout
 * - POST /api/v1/auth/verify-email
 * - POST /api/v1/auth/resend-verification
 * - POST /api/v1/auth/forgot-password
 * - POST /api/v1/auth/reset-password
 * - POST /api/v1/auth/recover-username
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { validateBody } from '../middleware/validateBody';
import { loginSchema, registerSchema } from '../schemas/common';

const auth = new Hono<{ Bindings: Env }>();

/**
 * Hash password using SHA-256 with salt
 */
async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Send email via Resend API
 * Uses noreply@pmerit.com as the sender address
 * Requires RESEND_API_KEY environment variable
 */
async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  env: Env
): Promise<boolean> {
  const resendApiKey = env.RESEND_API_KEY;

  // If no API key configured, allow flow to continue (dev mode)
  if (!resendApiKey) {
    return true; // Allow registration flow to continue in dev
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AIXORD <noreply@pmerit.com>',
        to: [to],
        subject: subject,
        html: htmlContent,
      }),
    });

    const result = await response.json() as { id?: string; message?: string; error?: unknown };

    if (response.ok && result.id) {
      return true;
    }

    console.error(JSON.stringify({
      type: 'email_send_failed',
      to,
      subject,
      status: response.status,
      error: result.message || result.error,
      timestamp: new Date().toISOString(),
    }));
    return false;

  } catch (error) {
    console.error(JSON.stringify({
      type: 'email_send_error',
      to,
      subject,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }));
    return false;
  }
}

/**
 * POST /api/v1/auth/register
 * Creates user account and sends verification email
 */
auth.post('/register', validateBody(registerSchema), async (c) => {
  const body = await c.req.json<{ email?: string; password?: string; username?: string; name?: string }>();
  const { email, password, username, name } = body;

  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400);
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json({ error: 'Invalid email format' }, 400);
  }

  // Password validation
  if (password.length < 6) {
    return c.json({ error: 'Password must be at least 6 characters' }, 400);
  }

  // Username validation (optional)
  if (username) {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return c.json({ error: 'Username must be 3-30 characters, alphanumeric with _ or -' }, 400);
    }

    // Check if username is taken
    const existingUsername = await c.env.DB.prepare(
      'SELECT id FROM users WHERE username = ?'
    ).bind(username.toLowerCase()).first();

    if (existingUsername) {
      return c.json({ error: 'Username already taken' }, 409);
    }
  }

  // Check if user exists
  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first();

  if (existing) {
    return c.json({ error: 'Email already registered' }, 409);
  }

  // Hash password
  const salt = c.env.AUTH_SALT || 'default-salt-change-in-production';
  const passwordHash = await hashPassword(password, salt);

  const userId = crypto.randomUUID();

  // Calculate 14-day trial expiration (H1: Time-Limited Trial)
  const trialExpiresAt = new Date();
  trialExpiresAt.setDate(trialExpiresAt.getDate() + 14);

  // Sanitize display name (trim, cap length)
  const sanitizedName = name ? name.trim().slice(0, 100) : null;

  // Insert user with email_verified = 1 (successful registration = valid email ownership)
  await c.env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, username, name, email_verified, subscription_tier, trial_expires_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)'
  ).bind(userId, email.toLowerCase(), passwordHash, username?.toLowerCase() || null, sanitizedName, 'TRIAL', trialExpiresAt.toISOString()).run();

  // Create email verification token
  const verificationToken = generateToken();
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

  await c.env.DB.prepare(
    'INSERT INTO email_verification_tokens (id, user_id, token, email, expires_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), userId, verificationToken, email.toLowerCase(), tokenExpiry).run();

  // Send verification email
  const frontendUrl = c.env.FRONTEND_URL || 'https://aixord.ai';
  const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

  await sendEmail(
    email,
    'Verify your AIXORD account',
    `
    <h2>Welcome to AIXORD!</h2>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href="${verifyUrl}">Verify Email Address</a></p>
    <p>Or copy and paste this URL into your browser:</p>
    <p>${verifyUrl}</p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't create an account, you can safely ignore this email.</p>
    `,
    c.env
  );

  // Create session (user can log in but some features may be restricted until verified)
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  await c.env.DB.prepare(
    'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), userId, token, expiresAt).run();

  return c.json({
    user: { id: userId, email: email.toLowerCase(), name: sanitizedName, emailVerified: true },
    token,
    expires_at: expiresAt,
    message: 'Account created successfully.'
  }, 201);
});

/**
 * POST /api/v1/auth/login
 */
auth.post('/login', validateBody(loginSchema), async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400);
  }

  // Hash password
  const salt = c.env.AUTH_SALT || 'default-salt-change-in-production';
  const passwordHash = await hashPassword(password, salt);

  // Find user
  const user = await c.env.DB.prepare(
    'SELECT id, email, email_verified FROM users WHERE email = ? AND password_hash = ?'
  ).bind(email.toLowerCase(), passwordHash).first<{ id: string; email: string; email_verified: number }>();

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Auto-verify email on successful login (successful auth = valid email ownership)
  if (user.email_verified !== 1) {
    await c.env.DB.prepare(
      'UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?'
    ).bind(new Date().toISOString(), user.id).run();
  }

  // Create session
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await c.env.DB.prepare(
    'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), user.id, token, expiresAt).run();

  return c.json({
    user: { id: user.id, email: user.email, emailVerified: true },
    token,
    expires_at: expiresAt
  });
});

/**
 * GET /api/v1/auth/me
 */
auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }

  const token = authHeader.slice(7);

  const session = await c.env.DB.prepare(`
    SELECT s.*, u.email, u.email_verified
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).bind(token).first<{ user_id: string; email: string; email_verified: number }>();

  if (!session) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  return c.json({
    user: { id: session.user_id, email: session.email, emailVerified: session.email_verified === 1 }
  });
});

// DEAD ENDPOINT: No frontend consumer — commented 2026-02-12
/**
 * POST /api/v1/auth/logout
 */
// auth.post('/logout', async (c) => {
//   const authHeader = c.req.header('Authorization');
//   if (authHeader?.startsWith('Bearer ')) {
//     const token = authHeader.slice(7);
//     await c.env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
//   }
//   return c.json({ success: true });
// });

/**
 * GET /api/v1/auth/subscription
 * Returns the current user's subscription tier from the database
 */
auth.get('/subscription', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }

  const token = authHeader.slice(7);

  const session = await c.env.DB.prepare(`
    SELECT s.user_id
    FROM sessions s
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).bind(token).first<{ user_id: string }>();

  if (!session) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Get subscription for this user
  const subscription = await c.env.DB.prepare(`
    SELECT tier, status, period_start, period_end, stripe_customer_id
    FROM subscriptions
    WHERE user_id = ?
    ORDER BY updated_at DESC
    LIMIT 1
  `).bind(session.user_id).first<{
    tier: string;
    status: string;
    period_start: string;
    period_end: string;
    stripe_customer_id: string | null;
  }>();

  if (!subscription) {
    // No subscription found, return default TRIAL with PLATFORM keys
    // TRIAL users get platform-provided keys (dual-mode: BYOK optional)
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    c.header('Pragma', 'no-cache');
    c.header('Expires', '0');

    return c.json({
      tier: 'TRIAL',
      status: 'active',
      keyMode: 'PLATFORM',
      periodEnd: null,
      stripeCustomerId: null
    });
  }

  // Determine key mode based on tier
  // TRIAL is excluded from BYOK-only tiers — trial users use platform keys by default
  const byokTiers = ['MANUSCRIPT_BYOK', 'BYOK_STANDARD'];
  const keyMode = byokTiers.includes(subscription.tier) ? 'BYOK' : 'PLATFORM';

  // Set no-cache headers to prevent stale subscription data
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');

  return c.json({
    tier: subscription.tier,
    status: subscription.status,
    keyMode,
    periodEnd: subscription.period_end,
    stripeCustomerId: subscription.stripe_customer_id
  });
});

/**
 * POST /api/v1/auth/verify-email
 * Verifies email using token from email link
 */
auth.post('/verify-email', async (c) => {
  const body = await c.req.json<{ token?: string }>();
  const { token } = body;

  if (!token) {
    return c.json({ error: 'Verification token required' }, 400);
  }

  // Find valid token
  const tokenRecord = await c.env.DB.prepare(`
    SELECT id, user_id, email, expires_at, used_at
    FROM email_verification_tokens
    WHERE token = ?
  `).bind(token).first<{
    id: string;
    user_id: string;
    email: string;
    expires_at: string;
    used_at: string | null;
  }>();

  if (!tokenRecord) {
    return c.json({ error: 'Invalid verification token' }, 400);
  }

  if (tokenRecord.used_at) {
    return c.json({ error: 'This verification link has already been used' }, 400);
  }

  if (new Date(tokenRecord.expires_at) < new Date()) {
    return c.json({ error: 'Verification link has expired. Please request a new one.' }, 400);
  }

  // Mark token as used
  await c.env.DB.prepare(
    'UPDATE email_verification_tokens SET used_at = ? WHERE id = ?'
  ).bind(new Date().toISOString(), tokenRecord.id).run();

  // Update user's email_verified status
  await c.env.DB.prepare(
    'UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?'
  ).bind(new Date().toISOString(), tokenRecord.user_id).run();

  return c.json({
    success: true,
    message: 'Email verified successfully! You can now log in.'
  });
});

/**
 * POST /api/v1/auth/resend-verification
 * Resends verification email to user
 */
auth.post('/resend-verification', async (c) => {
  const body = await c.req.json<{ email?: string }>();
  const { email } = body;

  if (!email) {
    return c.json({ error: 'Email required' }, 400);
  }

  // Find user
  const user = await c.env.DB.prepare(
    'SELECT id, email, email_verified FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first<{ id: string; email: string; email_verified: number }>();

  // Always return success to prevent email enumeration
  if (!user) {
    return c.json({
      success: true,
      message: 'If an account exists with this email, a verification link has been sent.'
    });
  }

  if (user.email_verified === 1) {
    return c.json({
      success: true,
      message: 'Email is already verified.'
    });
  }

  // Invalidate existing tokens
  await c.env.DB.prepare(
    'UPDATE email_verification_tokens SET used_at = ? WHERE user_id = ? AND used_at IS NULL'
  ).bind(new Date().toISOString(), user.id).run();

  // Create new verification token
  const verificationToken = generateToken();
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await c.env.DB.prepare(
    'INSERT INTO email_verification_tokens (id, user_id, token, email, expires_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), user.id, verificationToken, user.email, tokenExpiry).run();

  // Send verification email
  const frontendUrl = c.env.FRONTEND_URL || 'https://aixord.ai';
  const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

  await sendEmail(
    user.email,
    'Verify your AIXORD account',
    `
    <h2>Email Verification</h2>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href="${verifyUrl}">Verify Email Address</a></p>
    <p>Or copy and paste this URL into your browser:</p>
    <p>${verifyUrl}</p>
    <p>This link will expire in 24 hours.</p>
    `,
    c.env
  );

  return c.json({
    success: true,
    message: 'If an account exists with this email, a verification link has been sent.'
  });
});

/**
 * POST /api/v1/auth/forgot-password
 * Sends password reset email
 */
auth.post('/forgot-password', async (c) => {
  const body = await c.req.json<{ email?: string }>();
  const { email } = body;

  if (!email) {
    return c.json({ error: 'Email required' }, 400);
  }

  // Find user
  const user = await c.env.DB.prepare(
    'SELECT id, email FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first<{ id: string; email: string }>();

  // Always return success to prevent email enumeration
  if (!user) {
    return c.json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.'
    });
  }

  // Invalidate existing reset tokens
  await c.env.DB.prepare(
    'UPDATE password_reset_tokens SET used_at = ? WHERE user_id = ? AND used_at IS NULL'
  ).bind(new Date().toISOString(), user.id).run();

  // Create password reset token
  const resetToken = generateToken();
  const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(); // 1 hour

  await c.env.DB.prepare(
    'INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), user.id, resetToken, tokenExpiry).run();

  // Send password reset email
  const frontendUrl = c.env.FRONTEND_URL || 'https://aixord.ai';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  await sendEmail(
    user.email,
    'Reset your AIXORD password',
    `
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password. Click the link below to set a new password:</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>Or copy and paste this URL into your browser:</p>
    <p>${resetUrl}</p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    `,
    c.env
  );

  return c.json({
    success: true,
    message: 'If an account exists with this email, password reset instructions have been sent.'
  });
});

/**
 * POST /api/v1/auth/reset-password
 * Resets password using token from email
 */
auth.post('/reset-password', async (c) => {
  const body = await c.req.json<{ token?: string; password?: string }>();
  const { token, password } = body;

  if (!token || !password) {
    return c.json({ error: 'Token and new password required' }, 400);
  }

  // Password validation
  if (password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400);
  }

  // Find valid token
  const tokenRecord = await c.env.DB.prepare(`
    SELECT id, user_id, expires_at, used_at
    FROM password_reset_tokens
    WHERE token = ?
  `).bind(token).first<{
    id: string;
    user_id: string;
    expires_at: string;
    used_at: string | null;
  }>();

  if (!tokenRecord) {
    return c.json({ error: 'Invalid reset token' }, 400);
  }

  if (tokenRecord.used_at) {
    return c.json({ error: 'This reset link has already been used' }, 400);
  }

  if (new Date(tokenRecord.expires_at) < new Date()) {
    return c.json({ error: 'Reset link has expired. Please request a new one.' }, 400);
  }

  // Hash new password
  const salt = c.env.AUTH_SALT || 'default-salt-change-in-production';
  const passwordHash = await hashPassword(password, salt);

  // Update password
  await c.env.DB.prepare(
    'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?'
  ).bind(passwordHash, new Date().toISOString(), tokenRecord.user_id).run();

  // Mark token as used
  await c.env.DB.prepare(
    'UPDATE password_reset_tokens SET used_at = ? WHERE id = ?'
  ).bind(new Date().toISOString(), tokenRecord.id).run();

  // Invalidate all existing sessions for security
  await c.env.DB.prepare(
    'DELETE FROM sessions WHERE user_id = ?'
  ).bind(tokenRecord.user_id).run();

  return c.json({
    success: true,
    message: 'Password reset successfully! Please log in with your new password.'
  });
});

/**
 * POST /api/v1/auth/recover-username
 * Sends username reminder to email
 */
auth.post('/recover-username', async (c) => {
  const body = await c.req.json<{ email?: string }>();
  const { email } = body;

  if (!email) {
    return c.json({ error: 'Email required' }, 400);
  }

  // Find user
  const user = await c.env.DB.prepare(
    'SELECT email, username FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first<{ email: string; username: string | null }>();

  // Always return success to prevent email enumeration
  if (!user) {
    return c.json({
      success: true,
      message: 'If an account exists with this email, username information has been sent.'
    });
  }

  // Send username reminder email
  const usernameInfo = user.username
    ? `Your username is: <strong>${user.username}</strong>`
    : `Your account does not have a username set. You can log in using your email address: <strong>${user.email}</strong>`;

  const frontendUrl = c.env.FRONTEND_URL || 'https://aixord.ai';

  await sendEmail(
    user.email,
    'Your AIXORD account information',
    `
    <h2>Account Information</h2>
    <p>You requested your account information for AIXORD.</p>
    <p>${usernameInfo}</p>
    <p><a href="${frontendUrl}/login">Log in to AIXORD</a></p>
    <p>If you didn't request this information, you can safely ignore this email.</p>
    `,
    c.env
  );

  return c.json({
    success: true,
    message: 'If an account exists with this email, username information has been sent.'
  });
});

export default auth;
