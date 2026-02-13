/**
 * Lightweight validation schemas without zod dependency.
 * Each schema exposes a .parse(data) method that throws on invalid input.
 * Shape mirrors zod for drop-in replacement if zod is added later.
 */

interface ValidationError {
  errors: Array<{ path: (string | number)[]; message: string }>;
}

function fail(path: string, message: string): never {
  const err: ValidationError = { errors: [{ path: [path], message }] };
  throw err;
}

function makeSchema<T>(validator: (data: unknown) => T) {
  return { parse: validator };
}

// Auth schemas
export const loginSchema = makeSchema((data: unknown) => {
  const d = data as Record<string, unknown>;
  if (typeof d?.email !== 'string' || !d.email.includes('@')) fail('email', 'Valid email required');
  if (typeof d?.password !== 'string' || d.password.length < 8) fail('password', 'Password min 8 chars');
  return d as { email: string; password: string };
});

export const registerSchema = makeSchema((data: unknown) => {
  const d = data as Record<string, unknown>;
  if (typeof d?.email !== 'string' || !d.email.includes('@')) fail('email', 'Valid email required');
  if (typeof d?.password !== 'string' || d.password.length < 8) fail('password', 'Password min 8 chars');
  return d as { email: string; password: string; name?: string };
});

// Project schemas
export const createProjectSchema = makeSchema((data: unknown) => {
  const d = data as Record<string, unknown>;
  if (typeof d?.name !== 'string' || d.name.length === 0) fail('name', 'Name required');
  return d as { name: string; description?: string; objective?: string };
});

export const updateProjectSchema = makeSchema((data: unknown) => {
  const d = data as Record<string, unknown>;
  return d as { name?: string; description?: string; objective?: string };
});

// Decision schemas
export const createDecisionSchema = makeSchema((data: unknown) => {
  const d = data as Record<string, unknown>;
  if (typeof d?.title !== 'string' || d.title.length === 0) fail('title', 'Title required');
  return d as { title: string; description?: string; type?: string; phase?: string };
});

// Message schemas
export const sendMessageSchema = makeSchema((data: unknown) => {
  const d = data as Record<string, unknown>;
  if (typeof d?.content !== 'string' || d.content.length === 0) fail('content', 'Content required');
  return d as { content: string; role?: string };
});

// Billing schemas
export const checkoutSchema = makeSchema((data: unknown) => {
  const d = data as Record<string, unknown>;
  if (typeof d?.priceId !== 'string' || d.priceId.length === 0) fail('priceId', 'Price ID required');
  return d as { priceId: string; userId?: string };
});

export const activateSchema = makeSchema((data: unknown) => {
  const d = data as Record<string, unknown>;
  if (typeof d?.licenseKey !== 'string') fail('licenseKey', 'License key required');
  if (typeof d?.product !== 'string') fail('product', 'Product required');
  return d as { licenseKey: string; product: string };
});
