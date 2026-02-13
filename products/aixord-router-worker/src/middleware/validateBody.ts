import type { Context, Next } from 'hono';
import type { Env } from '../types';

/**
 * Lightweight body validation middleware.
 * Uses a schema-like interface (parse + error shape) without requiring zod at runtime.
 * Compatible with zod schemas if zod is installed.
 */
interface SchemaLike<T = unknown> {
  parse(data: unknown): T;
}

interface ValidationError {
  errors: Array<{ path: (string | number)[]; message: string }>;
}

function isValidationError(err: unknown): err is ValidationError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'errors' in err &&
    Array.isArray((err as ValidationError).errors)
  );
}

export function validateBody<T>(schema: SchemaLike<T>) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    try {
      const body = await c.req.json();
      const validated = schema.parse(body);
      // Store validated body on request for downstream handlers
      (c.req as unknown as Record<string, unknown>).validatedBody = validated;
      await next();
    } catch (err: unknown) {
      if (isValidationError(err)) {
        return c.json({
          error: 'Validation failed',
          details: err.errors.map((e: { path: (string | number)[]; message: string }) => ({
            path: e.path.join('.'),
            message: e.message
          }))
        }, 400);
      }
      return c.json({ error: 'Invalid request body' }, 400);
    }
  };
}
