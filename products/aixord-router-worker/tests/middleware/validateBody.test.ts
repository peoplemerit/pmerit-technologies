/**
 * validateBody Middleware Tests
 *
 * Tests the schema-based body validation middleware.
 */

import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { validateBody } from '../../src/middleware/validateBody';
import type { Env } from '../../src/types';

// ============================================================================
// Helper: Build a Hono app with validateBody applied to a test route
// ============================================================================
function buildApp(schema: { parse: (data: unknown) => unknown }) {
  const app = new Hono<{ Bindings: Env }>();

  app.post('/test', validateBody(schema), (c) => {
    const body = (c.req as unknown as Record<string, unknown>).validatedBody;
    return c.json({ validated: body });
  });

  return app;
}

// ============================================================================
// Tests
// ============================================================================
describe('validateBody', () => {
  it('passes validated body to downstream handler', async () => {
    const schema = {
      parse: (data: unknown) => {
        const d = data as { name: string };
        if (!d.name) throw new Error('name required');
        return { name: d.name.trim() };
      },
    };
    const app = buildApp(schema);

    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '  Alice  ' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { validated: { name: string } };
    expect(body.validated.name).toBe('Alice');
  });

  it('returns 400 with validation error details (zod-like format)', async () => {
    const schema = {
      parse: () => {
        const err: { errors: Array<{ path: (string | number)[]; message: string }> } = {
          errors: [
            { path: ['email'], message: 'Invalid email format' },
            { path: ['password'], message: 'Too short' },
          ],
        };
        throw err;
      },
    };
    const app = buildApp(schema);

    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad', password: 'x' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as {
      error: string;
      details: Array<{ path: string; message: string }>;
    };
    expect(body.error).toBe('Validation failed');
    expect(body.details).toHaveLength(2);
    expect(body.details[0].path).toBe('email');
    expect(body.details[0].message).toBe('Invalid email format');
    expect(body.details[1].path).toBe('password');
    expect(body.details[1].message).toBe('Too short');
  });

  it('returns 400 "Invalid request body" for non-validation errors', async () => {
    const schema = {
      parse: () => {
        throw new Error('unexpected error');
      },
    };
    const app = buildApp(schema);

    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anything: true }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Invalid request body');
  });

  it('returns 400 for invalid JSON body', async () => {
    const schema = { parse: (d: unknown) => d };
    const app = buildApp(schema);

    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{{{',
    });

    expect(res.status).toBe(400);
  });

  it('handles nested path in validation errors', async () => {
    const schema = {
      parse: () => {
        const err: { errors: Array<{ path: (string | number)[]; message: string }> } = {
          errors: [
            { path: ['settings', 'theme', 0], message: 'Invalid theme' },
          ],
        };
        throw err;
      },
    };
    const app = buildApp(schema);

    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: { theme: ['bad'] } }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as {
      error: string;
      details: Array<{ path: string; message: string }>;
    };
    expect(body.details[0].path).toBe('settings.theme.0');
  });
});
