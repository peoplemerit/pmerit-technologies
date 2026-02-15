/**
 * Auth Middleware
 *
 * Validates Bearer token and attaches user context to request.
 * HANDOFF-COPILOT-AUDIT-01: Uses SHA-256 token hash for DB lookup
 * with transparent fallback to plaintext for migration period.
 */

import { Context, Next } from 'hono';
import type { Env } from '../types';
import { hashSHA256 } from '../utils/crypto';

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

  if (!session) {
    // Fallback: plaintext token lookup (legacy sessions)
    session = await c.env.DB.prepare(`
      SELECT s.user_id, s.id, u.email
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `).bind(token).first<{ user_id: string; id: string; email: string }>();

    // Backfill token_hash for transparent migration
    if (session) {
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
