/**
 * Rate Limiting Middleware
 *
 * Provides request rate limiting using D1 database for tracking.
 * Supports configurable time windows and request limits.
 */

import { Context, Next, MiddlewareHandler } from 'hono';
import type { Env } from '../types';

export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Optional custom key generator function */
  keyGenerator?: (c: Context<{ Bindings: Env }>) => string;
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
}

/**
 * Rate limiter middleware factory
 *
 * Usage:
 *   app.use('/api/*', rateLimit({ windowMs: 60000, maxRequests: 100 }));
 *
 * Default key: userId from auth context, fallback to IP address
 */
export function rateLimit(config: RateLimitConfig): MiddlewareHandler {
  const { windowMs, maxRequests, keyGenerator } = config;

  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    try {
      // Generate rate limit key
      const key = keyGenerator
        ? keyGenerator(c)
        : c.get('userId') || c.req.header('cf-connecting-ip') || 'unknown';

      // Calculate current window key (floor division by windowMs)
      const now = Date.now();
      const windowKey = Math.floor(now / windowMs).toString();
      const compositeKey = `${key}:${windowKey}`;

      // Calculate window reset time
      const windowStart = Math.floor(now / windowMs) * windowMs;
      const windowEnd = windowStart + windowMs;
      const resetTimestamp = Math.floor(windowEnd / 1000);

      // Check current count
      const existing = await c.env.DB.prepare(`
        SELECT request_count
        FROM rate_limits
        WHERE key = ? AND window_key = ?
      `)
        .bind(compositeKey, windowKey)
        .first<{ request_count: number }>();

      const currentCount = existing?.request_count || 0;

      // Check if limit exceeded
      if (currentCount >= maxRequests) {
        const retryAfter = Math.ceil((windowEnd - now) / 1000);

        c.header('X-RateLimit-Limit', maxRequests.toString());
        c.header('X-RateLimit-Remaining', '0');
        c.header('X-RateLimit-Reset', resetTimestamp.toString());
        c.header('Retry-After', retryAfter.toString());

        return c.json(
          {
            error: 'Rate limit exceeded',
            retryAfter,
            limit: maxRequests,
            reset: resetTimestamp,
          },
          429
        );
      }

      // Increment counter (upsert)
      if (existing) {
        await c.env.DB.prepare(`
          UPDATE rate_limits
          SET request_count = request_count + 1
          WHERE key = ? AND window_key = ?
        `)
          .bind(compositeKey, windowKey)
          .run();
      } else {
        await c.env.DB.prepare(`
          INSERT INTO rate_limits (key, window_key, request_count, created_at)
          VALUES (?, ?, 1, datetime('now'))
        `)
          .bind(compositeKey, windowKey)
          .run();
      }

      // Set rate limit headers
      const remaining = maxRequests - currentCount - 1;
      c.header('X-RateLimit-Limit', maxRequests.toString());
      c.header('X-RateLimit-Remaining', Math.max(0, remaining).toString());
      c.header('X-RateLimit-Reset', resetTimestamp.toString());

      await next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // On error, allow request through (fail open)
      await next();
    }
  };
}

/**
 * Cleanup old rate limit records (optional maintenance function)
 *
 * Call periodically to prevent table growth.
 * Removes records older than 24 hours.
 */
export async function cleanupRateLimits(db: D1Database): Promise<number> {
  const result = await db
    .prepare(`
      DELETE FROM rate_limits
      WHERE created_at < datetime('now', '-24 hours')
    `)
    .run();

  return result.meta.changes || 0;
}
