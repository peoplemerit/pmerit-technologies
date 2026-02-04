/**
 * Auth Middleware
 *
 * Validates Bearer token and attaches user context to request.
 */

import { Context, Next } from 'hono';
import type { Env } from '../types';

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

  const session = await c.env.DB.prepare(`
    SELECT s.user_id, u.email
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).bind(token).first<{ user_id: string; email: string }>();

  if (!session) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  c.set('userId', session.user_id);
  c.set('userEmail', session.email);

  await next();
}
