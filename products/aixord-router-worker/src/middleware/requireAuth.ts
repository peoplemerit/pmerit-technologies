/**
 * Auth Middleware
 *
 * Validates Bearer token and attaches user context to request.
 * HANDOFF-COPILOT-AUDIT-01: Uses SHA-256 token hash for DB lookup
 * with transparent fallback to plaintext for migration period.
 *
 * MIGRATION DEADLINE: 2026-03-15
 * After this date, plaintext token fallback is removed.
 * All sessions created after 2026-02-15 already use token_hash.
 * The 30-day window covers max session lifetime (7 days) with margin.
 */

import { Context, Next } from 'hono';
import type { Env } from '../types';
import { hashSHA256 } from '../utils/crypto';
import { log } from '../utils/logger';

// Deadline after which plaintext token fallback is removed
const LEGACY_TOKEN_DEADLINE = new Date('2026-03-15T00:00:00Z').getTime();

// Extend Hono context to include user info
declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    userEmail: string;
  }
}

export async function requireAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const token = authHeader.slice(7);
  const tokenHash = await hashSHA256(token);

  // Try hashed lookup first (HANDOFF-COPILOT-AUDIT-01)
  let session = await c.env.DB.prepare(`
    SELECT s.user_id, s.id, u.email
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token_hash = ? AND s.expires_at > datetime('now')
  `).bind(tokenHash).first<{ user_id: string; id: string; email: string }>();

  if (!session && Date.now() < LEGACY_TOKEN_DEADLINE) {
    // Fallback: plaintext token lookup (legacy sessions — expires 2026-03-15)
    session = await c.env.DB.prepare(`
      SELECT s.user_id, s.id, u.email
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `).bind(token).first<{ user_id: string; id: string; email: string }>();

    // Backfill token_hash for transparent migration + log for tracking
    if (session) {
      log.warn('legacy_plaintext_token_used', {
        user_id: session.user_id.substring(0, 8) + '...',
        session_id: session.id.substring(0, 8) + '...',
        days_until_deadline: Math.ceil((LEGACY_TOKEN_DEADLINE - Date.now()) / 86400000),
      });
      await c.env.DB.prepare(
        'UPDATE sessions SET token_hash = ? WHERE id = ?'
      ).bind(tokenHash, session.id).run();
    }
  }

  if (!session) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  c.set('userId', session.user_id);
  c.set('userEmail', session.email);

  await next();
}
