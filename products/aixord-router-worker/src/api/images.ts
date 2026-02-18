/**
 * Image API (ENH-4: Path C — Image Evidence)
 *
 * Endpoints for uploading, retrieving, and managing image evidence.
 * Images are stored in R2 (aixord-images bucket), metadata in D1.
 *
 * Endpoints:
 * - POST   /:projectId/images           - Upload image
 * - GET    /:projectId/images            - List images for project
 * - GET    /:projectId/images/:imageId   - Get image metadata
 * - GET    /:projectId/images/:imageId/url - Get direct R2 URL for image data
 * - DELETE /:projectId/images/:imageId   - Delete image
 */

import { Hono } from 'hono';
import type { Env, ImageEvidenceType, ImageMetadata, ImageUploadResponse } from '../types';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import { log } from '../utils/logger';
import { verifyProjectOwnership } from '../utils/projectOwnership';

const images = new Hono<{ Bindings: Env }>();

// All routes require auth
images.use('/*', requireAuth);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build the R2 object key: projects/<projectId>/images/<imageId>/<filename> */
function buildR2Key(projectId: string, imageId: string, filename: string): string {
  // Sanitize filename: keep alphanumeric, dots, hyphens, underscores
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `projects/${projectId}/images/${imageId}/${safe}`;
}

// ---------------------------------------------------------------------------
// POST /:projectId/images — Upload image
// ---------------------------------------------------------------------------

images.post('/:projectId/images', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');

    if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Parse multipart form data
    const formData = await c.req.formData();
    const rawFile = formData.get('file');

    if (!rawFile || typeof rawFile === 'string') {
      return c.json({ error: 'Missing file in form data' }, 400);
    }

    // Cast to File — Workers runtime provides File objects from FormData
    const file = rawFile as unknown as File;

    // Validate MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      return c.json({
        error: `Unsupported file type: ${file.type}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`
      }, 400);
    }

    // Validate size
    if (file.size > MAX_IMAGE_SIZE) {
      return c.json({
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Max: ${MAX_IMAGE_SIZE / 1024 / 1024} MB`
      }, 400);
    }

    // Optional metadata from form fields
    const evidenceType = (formData.get('evidence_type') as ImageEvidenceType) || 'GENERAL';
    const caption = formData.get('caption') as string | null;
    const checkpointId = formData.get('checkpoint_id') as string | null;
    const decisionId = formData.get('decision_id') as string | null;

    // Generate ID and R2 key
    const imageId = crypto.randomUUID();
    const r2Key = buildR2Key(projectId, imageId, file.name);
    const now = new Date().toISOString();

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await c.env.IMAGES.put(r2Key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        projectId,
        userId,
        imageId,
        evidenceType,
      },
    });

    // Store metadata in D1
    await c.env.DB.prepare(`
      INSERT INTO images (id, project_id, user_id, r2_key, filename, mime_type, size_bytes,
                          evidence_type, caption, checkpoint_id, decision_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      imageId, projectId, userId, r2Key, file.name, file.type, file.size,
      evidenceType, caption, checkpointId, decisionId, now, now
    ).run();

    const response: ImageUploadResponse = {
      id: imageId,
      filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      evidence_type: evidenceType,
      url: `/api/v1/projects/${projectId}/images/${imageId}/url`,
      created_at: now,
    };

    return c.json(response, 201);

  } catch (error) {
    log.error('image_upload_failed', { error: error instanceof Error ? error.message : String(error) });
    return c.json({
      error: 'Failed to upload image',
      error_code: 'INTERNAL_ERROR'
    }, 500);
  }
});

// ---------------------------------------------------------------------------
// GET /:projectId/images — List images for project
// ---------------------------------------------------------------------------

images.get('/:projectId/images', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');

    if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Optional filters
    const evidenceType = c.req.query('evidence_type');
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
    const offset = parseInt(c.req.query('offset') || '0');

    let sql = 'SELECT * FROM images WHERE project_id = ?';
    const params: any[] = [projectId];

    if (evidenceType) {
      sql += ' AND evidence_type = ?';
      params.push(evidenceType);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await c.env.DB.prepare(sql).bind(...params).all<ImageMetadata>();

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM images WHERE project_id = ?';
    const countParams: any[] = [projectId];
    if (evidenceType) {
      countSql += ' AND evidence_type = ?';
      countParams.push(evidenceType);
    }
    const countResult = await c.env.DB.prepare(countSql)
      .bind(...countParams).first<{ total: number }>();

    return c.json({
      project_id: projectId,
      total: countResult?.total || 0,
      limit,
      offset,
      images: result.results,
    });

  } catch (error) {
    log.error('image_list_failed', { error: error instanceof Error ? error.message : String(error) });
    return c.json({
      error: 'Failed to list images',
      error_code: 'INTERNAL_ERROR'
    }, 500);
  }
});

// ---------------------------------------------------------------------------
// GET /:projectId/images/:imageId — Get image metadata
// ---------------------------------------------------------------------------

images.get('/:projectId/images/:imageId', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');
    const imageId = c.req.param('imageId');

    if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const image = await c.env.DB.prepare(
      'SELECT * FROM images WHERE id = ? AND project_id = ?'
    ).bind(imageId, projectId).first<ImageMetadata>();

    if (!image) {
      return c.json({ error: 'Image not found' }, 404);
    }

    return c.json(image);

  } catch (error) {
    log.error('image_metadata_failed', { error: error instanceof Error ? error.message : String(error) });
    return c.json({
      error: 'Failed to get image metadata',
      error_code: 'INTERNAL_ERROR'
    }, 500);
  }
});

// ---------------------------------------------------------------------------
// GET /:projectId/images/:imageId/url — Serve image data from R2
// ---------------------------------------------------------------------------

images.get('/:projectId/images/:imageId/url', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');
    const imageId = c.req.param('imageId');

    if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Get metadata for R2 key
    const image = await c.env.DB.prepare(
      'SELECT r2_key, mime_type, filename FROM images WHERE id = ? AND project_id = ?'
    ).bind(imageId, projectId).first<{ r2_key: string; mime_type: string; filename: string }>();

    if (!image) {
      return c.json({ error: 'Image not found' }, 404);
    }

    // Fetch from R2
    const object = await c.env.IMAGES.get(image.r2_key);
    if (!object) {
      return c.json({ error: 'Image data not found in storage' }, 404);
    }

    // Return the image binary directly
    const headers = new Headers();
    headers.set('Content-Type', image.mime_type);
    headers.set('Cache-Control', 'private, max-age=3600');
    headers.set('Content-Disposition', `inline; filename="${image.filename}"`);

    return new Response(object.body, { headers });

  } catch (error) {
    log.error('image_url_failed', { error: error instanceof Error ? error.message : String(error) });
    return c.json({
      error: 'Failed to get image',
      error_code: 'INTERNAL_ERROR'
    }, 500);
  }
});

// ---------------------------------------------------------------------------
// GET /:projectId/images/:imageId/base64 — Get image as base64 for AI vision
// ---------------------------------------------------------------------------

images.get('/:projectId/images/:imageId/base64', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');
    const imageId = c.req.param('imageId');

    if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Get metadata for R2 key
    const image = await c.env.DB.prepare(
      'SELECT r2_key, mime_type, filename FROM images WHERE id = ? AND project_id = ?'
    ).bind(imageId, projectId).first<{ r2_key: string; mime_type: string; filename: string }>();

    if (!image) {
      return c.json({ error: 'Image not found' }, 404);
    }

    // Fetch from R2
    const object = await c.env.IMAGES.get(image.r2_key);
    if (!object) {
      return c.json({ error: 'Image data not found in storage' }, 404);
    }

    // Convert to base64
    const arrayBuffer = await object.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    return c.json({
      base64,
      media_type: image.mime_type,
      filename: image.filename,
    });

  } catch (error) {
    log.error('image_base64_failed', { error: error instanceof Error ? error.message : String(error) });
    return c.json({
      error: 'Failed to get image as base64',
      error_code: 'INTERNAL_ERROR'
    }, 500);
  }
});

// ---------------------------------------------------------------------------
// DELETE /:projectId/images/:imageId — Delete image
// ---------------------------------------------------------------------------

images.delete('/:projectId/images/:imageId', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');
    const imageId = c.req.param('imageId');

    if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Get R2 key before deleting metadata
    const image = await c.env.DB.prepare(
      'SELECT r2_key FROM images WHERE id = ? AND project_id = ? AND user_id = ?'
    ).bind(imageId, projectId, userId).first<{ r2_key: string }>();

    if (!image) {
      return c.json({ error: 'Image not found' }, 404);
    }

    // Delete from R2 and D1 (R2 first — if D1 delete fails, orphaned metadata is recoverable)
    await c.env.IMAGES.delete(image.r2_key);
    await c.env.DB.prepare(
      'DELETE FROM images WHERE id = ? AND project_id = ?'
    ).bind(imageId, projectId).run();

    return c.json({ deleted: true, id: imageId });

  } catch (error) {
    log.error('image_delete_failed', { error: error instanceof Error ? error.message : String(error) });
    return c.json({
      error: 'Failed to delete image',
      error_code: 'INTERNAL_ERROR'
    }, 500);
  }
});

export default images;
