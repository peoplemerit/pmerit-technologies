/**
 * Images API Endpoint Tests
 *
 * Tests the images sub-router mounted at /api/v1/projects/:projectId/images:
 *   POST   /api/v1/projects/:projectId/images              — Upload image
 *   GET    /api/v1/projects/:projectId/images               — List images for project
 *   GET    /api/v1/projects/:projectId/images/:imageId      — Get image metadata
 *   GET    /api/v1/projects/:projectId/images/:imageId/url  — Serve image data from R2
 *   GET    /api/v1/projects/:projectId/images/:imageId/base64 — Get image as base64
 *   DELETE /api/v1/projects/:projectId/images/:imageId      — Delete image
 *
 * The sub-router applies requireAuth internally via images.use('/*', requireAuth).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types';
import { type MockQueryResult } from '../helpers';
import { createMockEnv, createTestSession, jsonHeaders, authHeaders } from '../test-app';

// Mock crypto for requireAuth middleware's token hashing
vi.mock('../../src/utils/crypto', () => ({
  hashPasswordPBKDF2: vi.fn(),
  verifyPasswordPBKDF2: vi.fn(),
  hashSHA256: vi.fn().mockImplementation(async (input: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }),
}));

// Mock logger to suppress console output during tests
vi.mock('../../src/utils/logger', () => ({
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

let imagesRouter: any;

beforeEach(async () => {
  vi.clearAllMocks();
  const mod = await import('../../src/api/images');
  imagesRouter = mod.default;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a test app with the images router.
 * The router has its own requireAuth middleware, so session DB queries are needed.
 * Accepts optional R2 mock overrides to customize bucket behavior per test.
 */
function buildApp(
  queries: MockQueryResult[] = [],
  r2Overrides?: Partial<{
    put: (...args: any[]) => Promise<any>;
    get: (...args: any[]) => Promise<any>;
    delete: (...args: any[]) => Promise<any>;
    list: (...args: any[]) => Promise<any>;
  }>
) {
  const env = createMockEnv(queries);

  // Apply R2 mock overrides if provided
  if (r2Overrides) {
    const images = env.IMAGES as unknown as Record<string, unknown>;
    if (r2Overrides.put) images.put = r2Overrides.put;
    if (r2Overrides.get) images.get = r2Overrides.get;
    if (r2Overrides.delete) images.delete = r2Overrides.delete;
    if (r2Overrides.list) images.list = r2Overrides.list;
  }

  const app = new Hono<{ Bindings: Env }>();
  app.route('/api/v1/projects', imagesRouter);

  const req = (path: string, init?: RequestInit) =>
    app.request(path, init, env);

  return { app, env, req };
}

/** Session lookup query for requireAuth -- token_hash based */
function sessionQuery(userId = 'user-1', email = 'user@test.com'): MockQueryResult {
  return {
    pattern: 'token_hash',
    result: { user_id: userId, id: 'sess-1', email },
  };
}

/** Ownership verification query — verifyProjectOwnership checks projects WHERE id = ? AND owner_id = ? */
function ownerQuery(projectId = 'proj-1'): MockQueryResult {
  return {
    pattern: 'SELECT id FROM projects WHERE id',
    result: { id: projectId },
  };
}

/** Ownership verification query that returns null (not found / not owner) */
function ownerQueryNotFound(): MockQueryResult {
  return {
    pattern: 'SELECT id FROM projects WHERE id',
    result: null,
  };
}

/**
 * Create a FormData body with a mock file for upload tests.
 * Returns a Request-compatible body and headers (multipart boundary is set automatically).
 */
function createFileFormData(
  filename = 'test-image.png',
  mimeType = 'image/png',
  sizeBytes = 1024,
  extraFields?: Record<string, string>
): FormData {
  const content = new Uint8Array(sizeBytes).fill(0xFF);
  const blob = new Blob([content], { type: mimeType });
  const file = new File([blob], filename, { type: mimeType });

  const formData = new FormData();
  formData.append('file', file);

  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) {
      formData.append(key, value);
    }
  }

  return formData;
}

/** Standard image metadata row as returned from D1 */
function makeImageRow(overrides: Partial<{
  id: string;
  project_id: string;
  user_id: string;
  r2_key: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  evidence_type: string;
  caption: string | null;
  checkpoint_id: string | null;
  decision_id: string | null;
  created_at: string;
  updated_at: string;
}> = {}) {
  return {
    id: overrides.id ?? 'img-1',
    project_id: overrides.project_id ?? 'proj-1',
    user_id: overrides.user_id ?? 'user-1',
    r2_key: overrides.r2_key ?? 'projects/proj-1/images/img-1/test.png',
    filename: overrides.filename ?? 'test.png',
    mime_type: overrides.mime_type ?? 'image/png',
    size_bytes: overrides.size_bytes ?? 2048,
    evidence_type: overrides.evidence_type ?? 'GENERAL',
    caption: overrides.caption ?? null,
    checkpoint_id: overrides.checkpoint_id ?? null,
    decision_id: overrides.decision_id ?? null,
    created_at: overrides.created_at ?? '2026-01-15T00:00:00.000Z',
    updated_at: overrides.updated_at ?? '2026-01-15T00:00:00.000Z',
  };
}

// ============================================================================
// Upload Image Tests
// ============================================================================
describe('POST /api/v1/projects/:projectId/images', () => {
  it('uploads an image and returns 201', async () => {
    const { token } = await createTestSession();
    const r2Put = vi.fn().mockResolvedValue({});

    const { req } = buildApp(
      [
        sessionQuery(),
        ownerQuery(),
        // INSERT INTO images
        { pattern: 'INSERT INTO images', runResult: { success: true, changes: 1 } },
      ],
      { put: r2Put }
    );

    const formData = createFileFormData('screenshot.png', 'image/png', 2048);

    const res = await req('/api/v1/projects/proj-1/images', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    expect(res.status).toBe(201);
    const body = await res.json() as {
      id: string;
      filename: string;
      mime_type: string;
      size_bytes: number;
      evidence_type: string;
      url: string;
      created_at: string;
    };
    expect(body.id).toBeDefined();
    expect(body.filename).toBe('screenshot.png');
    expect(body.mime_type).toBe('image/png');
    expect(body.size_bytes).toBe(2048);
    expect(body.evidence_type).toBe('GENERAL');
    expect(body.url).toContain('/images/');
    expect(body.url).toContain('/url');
    expect(body.created_at).toBeDefined();

    // Verify R2 put was called
    expect(r2Put).toHaveBeenCalledTimes(1);
  });

  it('uploads with optional metadata fields', async () => {
    const { token } = await createTestSession();
    const r2Put = vi.fn().mockResolvedValue({});

    const { req } = buildApp(
      [
        sessionQuery(),
        ownerQuery(),
        { pattern: 'INSERT INTO images', runResult: { success: true, changes: 1 } },
      ],
      { put: r2Put }
    );

    const formData = createFileFormData('proof.png', 'image/png', 1024, {
      evidence_type: 'GATE_PROOF',
      caption: 'Gate passage proof screenshot',
      checkpoint_id: 'cp-1',
      decision_id: 'dec-1',
    });

    const res = await req('/api/v1/projects/proj-1/images', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { evidence_type: string };
    expect(body.evidence_type).toBe('GATE_PROOF');
  });

  it('accepts JPEG files', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp(
      [
        sessionQuery(),
        ownerQuery(),
        { pattern: 'INSERT INTO images', runResult: { success: true, changes: 1 } },
      ],
      { put: vi.fn().mockResolvedValue({}) }
    );

    const formData = createFileFormData('photo.jpg', 'image/jpeg', 4096);

    const res = await req('/api/v1/projects/proj-1/images', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { mime_type: string };
    expect(body.mime_type).toBe('image/jpeg');
  });

  it('accepts WebP files', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp(
      [
        sessionQuery(),
        ownerQuery(),
        { pattern: 'INSERT INTO images', runResult: { success: true, changes: 1 } },
      ],
      { put: vi.fn().mockResolvedValue({}) }
    );

    const formData = createFileFormData('graphic.webp', 'image/webp', 2048);

    const res = await req('/api/v1/projects/proj-1/images', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { mime_type: string };
    expect(body.mime_type).toBe('image/webp');
  });

  it('accepts GIF files', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp(
      [
        sessionQuery(),
        ownerQuery(),
        { pattern: 'INSERT INTO images', runResult: { success: true, changes: 1 } },
      ],
      { put: vi.fn().mockResolvedValue({}) }
    );

    const formData = createFileFormData('animation.gif', 'image/gif', 1024);

    const res = await req('/api/v1/projects/proj-1/images', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { mime_type: string };
    expect(body.mime_type).toBe('image/gif');
  });

  it('accepts SVG files', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp(
      [
        sessionQuery(),
        ownerQuery(),
        { pattern: 'INSERT INTO images', runResult: { success: true, changes: 1 } },
      ],
      { put: vi.fn().mockResolvedValue({}) }
    );

    const formData = createFileFormData('diagram.svg', 'image/svg+xml', 512);

    const res = await req('/api/v1/projects/proj-1/images', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { mime_type: string };
    expect(body.mime_type).toBe('image/svg+xml');
  });

  it('rejects unsupported file type with 400', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    const formData = createFileFormData('document.pdf', 'application/pdf', 1024);

    const res = await req('/api/v1/projects/proj-1/images', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Unsupported file type');
    expect(body.error).toContain('application/pdf');
  });

  it('rejects file exceeding MAX_IMAGE_SIZE with 400', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    // 10 MB + 1 byte (exceeds the 10 MB limit)
    const oversizedBytes = 10 * 1024 * 1024 + 1;
    const formData = createFileFormData('huge.png', 'image/png', oversizedBytes);

    const res = await req('/api/v1/projects/proj-1/images', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('File too large');
  });

  it('returns 400 when no file is provided', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
    ]);

    // FormData with no 'file' field
    const formData = new FormData();
    formData.append('caption', 'No file attached');

    const res = await req('/api/v1/projects/proj-1/images', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Missing file');
  });

  it('returns 404 when project not owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQueryNotFound(),
    ]);

    const formData = createFileFormData('test.png', 'image/png', 1024);

    const res = await req('/api/v1/projects/not-my-project/images', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('not found');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const formData = createFileFormData('test.png', 'image/png', 1024);

    const res = await req('/api/v1/projects/proj-1/images', {
      method: 'POST',
      body: formData,
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// List Images Tests
// ============================================================================
describe('GET /api/v1/projects/:projectId/images', () => {
  it('returns images for the project', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // SELECT * FROM images WHERE project_id = ?
      {
        pattern: 'SELECT * FROM images WHERE project_id',
        result: [
          makeImageRow({ id: 'img-1', filename: 'screenshot1.png' }),
          makeImageRow({ id: 'img-2', filename: 'screenshot2.png' }),
        ],
      },
      // SELECT COUNT(*) as total
      { pattern: 'SELECT COUNT', result: { total: 2 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/images', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      project_id: string;
      total: number;
      limit: number;
      offset: number;
      images: Array<{ id: string; filename: string }>;
    };
    expect(body.project_id).toBe('proj-1');
    expect(body.total).toBe(2);
    expect(body.images).toHaveLength(2);
    expect(body.images[0].filename).toBe('screenshot1.png');
  });

  it('returns empty array when project has no images', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM images WHERE project_id', result: [] },
      { pattern: 'SELECT COUNT', result: { total: 0 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/images', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { total: number; images: unknown[] };
    expect(body.total).toBe(0);
    expect(body.images).toEqual([]);
  });

  it('returns default pagination values', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM images WHERE project_id', result: [] },
      { pattern: 'SELECT COUNT', result: { total: 0 } },
    ]);

    const res = await req('/api/v1/projects/proj-1/images', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { limit: number; offset: number };
    expect(body.limit).toBe(50);
    expect(body.offset).toBe(0);
  });

  it('returns 404 when project not owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQueryNotFound(),
    ]);

    const res = await req('/api/v1/projects/not-my-project/images', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('not found');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/images');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Get Image Metadata Tests
// ============================================================================
describe('GET /api/v1/projects/:projectId/images/:imageId', () => {
  it('returns image metadata for valid image', async () => {
    const { token } = await createTestSession();
    const imageRow = makeImageRow({ id: 'img-42', filename: 'proof.png', evidence_type: 'GATE_PROOF' });

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      // SELECT * FROM images WHERE id = ? AND project_id = ?
      { pattern: 'SELECT * FROM images WHERE id', result: imageRow },
    ]);

    const res = await req('/api/v1/projects/proj-1/images/img-42', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      id: string;
      filename: string;
      evidence_type: string;
      project_id: string;
    };
    expect(body.id).toBe('img-42');
    expect(body.filename).toBe('proof.png');
    expect(body.evidence_type).toBe('GATE_PROOF');
    expect(body.project_id).toBe('proj-1');
  });

  it('returns 404 for non-existent image', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT * FROM images WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/images/nonexistent', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('not found');
  });

  it('returns 404 when project not owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQueryNotFound(),
    ]);

    const res = await req('/api/v1/projects/not-my-project/images/img-1', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('not found');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/images/img-1');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Get Image URL (Serve Binary) Tests
// ============================================================================
describe('GET /api/v1/projects/:projectId/images/:imageId/url', () => {
  it('serves image binary from R2 with correct headers', async () => {
    const { token } = await createTestSession();
    const imageBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47]); // PNG magic bytes

    const mockR2Object = {
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(imageBytes);
          controller.close();
        },
      }),
      arrayBuffer: async () => imageBytes.buffer,
    };

    const { req } = buildApp(
      [
        sessionQuery(),
        ownerQuery(),
        // SELECT r2_key, mime_type, filename
        {
          pattern: 'SELECT r2_key, mime_type, filename FROM images WHERE id',
          result: { r2_key: 'projects/proj-1/images/img-1/photo.png', mime_type: 'image/png', filename: 'photo.png' },
        },
      ],
      { get: vi.fn().mockResolvedValue(mockR2Object) }
    );

    const res = await req('/api/v1/projects/proj-1/images/img-1/url', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
    expect(res.headers.get('Cache-Control')).toBe('private, max-age=3600');
    expect(res.headers.get('Content-Disposition')).toContain('photo.png');
  });

  it('returns 404 when image metadata not found in D1', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT r2_key, mime_type, filename FROM images WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/images/nonexistent/url', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('not found');
  });

  it('returns 404 when R2 object is missing', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp(
      [
        sessionQuery(),
        ownerQuery(),
        {
          pattern: 'SELECT r2_key, mime_type, filename FROM images WHERE id',
          result: { r2_key: 'projects/proj-1/images/img-1/gone.png', mime_type: 'image/png', filename: 'gone.png' },
        },
      ],
      { get: vi.fn().mockResolvedValue(null) }
    );

    const res = await req('/api/v1/projects/proj-1/images/img-1/url', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('not found in storage');
  });

  it('returns 404 when project not owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQueryNotFound(),
    ]);

    const res = await req('/api/v1/projects/not-my-project/images/img-1/url', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('not found');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/images/img-1/url');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Get Image as Base64 Tests
// ============================================================================
describe('GET /api/v1/projects/:projectId/images/:imageId/base64', () => {
  it('returns base64-encoded image data', async () => {
    const { token } = await createTestSession();
    const imageBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A]);

    const mockR2Object = {
      body: new ReadableStream(),
      arrayBuffer: async () => imageBytes.buffer,
    };

    const { req } = buildApp(
      [
        sessionQuery(),
        ownerQuery(),
        {
          pattern: 'SELECT r2_key, mime_type, filename FROM images WHERE id',
          result: { r2_key: 'projects/proj-1/images/img-1/diagram.png', mime_type: 'image/png', filename: 'diagram.png' },
        },
      ],
      { get: vi.fn().mockResolvedValue(mockR2Object) }
    );

    const res = await req('/api/v1/projects/proj-1/images/img-1/base64', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as {
      base64: string;
      media_type: string;
      filename: string;
    };
    expect(body.base64).toBeDefined();
    expect(body.base64.length).toBeGreaterThan(0);
    expect(body.media_type).toBe('image/png');
    expect(body.filename).toBe('diagram.png');
  });

  it('returns 404 when image metadata not found in D1', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT r2_key, mime_type, filename FROM images WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/images/nonexistent/base64', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('not found');
  });

  it('returns 404 when R2 object is missing', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp(
      [
        sessionQuery(),
        ownerQuery(),
        {
          pattern: 'SELECT r2_key, mime_type, filename FROM images WHERE id',
          result: { r2_key: 'projects/proj-1/images/img-1/gone.png', mime_type: 'image/png', filename: 'gone.png' },
        },
      ],
      { get: vi.fn().mockResolvedValue(null) }
    );

    const res = await req('/api/v1/projects/proj-1/images/img-1/base64', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('not found in storage');
  });

  it('returns 404 when project not owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQueryNotFound(),
    ]);

    const res = await req('/api/v1/projects/not-my-project/images/img-1/base64', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('not found');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/images/img-1/base64');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Delete Image Tests
// ============================================================================
describe('DELETE /api/v1/projects/:projectId/images/:imageId', () => {
  it('deletes image from R2 and D1 and returns success', async () => {
    const { token } = await createTestSession();
    const r2Delete = vi.fn().mockResolvedValue(undefined);

    const { req } = buildApp(
      [
        sessionQuery(),
        ownerQuery(),
        // SELECT r2_key FROM images WHERE id = ? AND project_id = ? AND user_id = ?
        { pattern: 'SELECT r2_key FROM images WHERE id', result: { r2_key: 'projects/proj-1/images/img-1/test.png' } },
        // DELETE FROM images WHERE id = ? AND project_id = ?
        { pattern: 'DELETE FROM images', runResult: { success: true, changes: 1 } },
      ],
      { delete: r2Delete }
    );

    const res = await req('/api/v1/projects/proj-1/images/img-1', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { deleted: boolean; id: string };
    expect(body.deleted).toBe(true);
    expect(body.id).toBe('img-1');

    // Verify R2 delete was called with correct key
    expect(r2Delete).toHaveBeenCalledTimes(1);
    expect(r2Delete).toHaveBeenCalledWith('projects/proj-1/images/img-1/test.png');
  });

  it('returns 404 for non-existent image', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQuery(),
      { pattern: 'SELECT r2_key FROM images WHERE id', result: null },
    ]);

    const res = await req('/api/v1/projects/proj-1/images/nonexistent', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('not found');
  });

  it('returns 404 when project not owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      ownerQueryNotFound(),
    ]);

    const res = await req('/api/v1/projects/not-my-project/images/img-1', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('not found');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/projects/proj-1/images/img-1', {
      method: 'DELETE',
    });

    expect(res.status).toBe(401);
  });
});
