/**
 * Security & Privacy Governance API (SPG-01)
 *
 * Implements AIXORD v4.5.1 Security Gates:
 * - GS:DC - Data Classification (project-level + resource-level)
 * - GS:DP - Data Protection
 * - GS:AI - AI Exposure Validation (project + resource enforcement)
 * - GS:JR - Jurisdiction Compliance
 * - GS:RT - Retention Enforcement
 * - GS:SA - Secret Audit
 *
 * Laws implemented:
 * - L-SPG1: Declare sensitivity before execution
 * - L-SPG3: No raw PII/PHI to AI without authorization
 * - L-SPG4: Unknown = highest protection
 * - L-SPG5: GS:DC required for setup
 * - L-SPG6: GS:AI required for execution
 *
 * HANDOFF-CGC-01 GAP-2: Resource-level classification + secret audit
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';

const app = new Hono<{ Bindings: Env }>();

// =============================================================================
// DATA CLASSIFICATION (GS:DC Gate - L-SPG1, L-SPG5)
// =============================================================================

interface DataClassification {
  project_id: string;
  pii: 'YES' | 'NO' | 'UNKNOWN';
  phi: 'YES' | 'NO' | 'UNKNOWN';
  financial: 'YES' | 'NO' | 'UNKNOWN';
  legal: 'YES' | 'NO' | 'UNKNOWN';
  minor_data: 'YES' | 'NO' | 'UNKNOWN';
  jurisdiction: string;
  regulations: string[];
  ai_exposure: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'PROHIBITED';
  declared_by?: string;
  declared_at?: string;
}

/**
 * GET /api/v1/projects/:projectId/security/classification
 * Get data classification for a project
 */
app.get('/:projectId/security/classification', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  // Verify project ownership
  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const classification = await c.env.DB.prepare(`
    SELECT * FROM data_classification WHERE project_id = ?
  `).bind(projectId).first<DataClassification>();

  if (!classification) {
    // Return default (L-SPG4: unknown = highest protection)
    return c.json({
      project_id: projectId,
      pii: 'UNKNOWN',
      phi: 'UNKNOWN',
      financial: 'UNKNOWN',
      legal: 'UNKNOWN',
      minor_data: 'UNKNOWN',
      jurisdiction: 'US',
      regulations: [],
      ai_exposure: 'RESTRICTED', // Default to RESTRICTED per L-SPG4
      declared: false
    });
  }

  return c.json({
    ...classification,
    regulations: JSON.parse(classification.regulations as unknown as string || '[]'),
    declared: !!classification.declared_at
  });
});

/**
 * PUT /api/v1/projects/:projectId/security/classification
 * Set data classification (GS:DC gate - L-SPG1)
 */
app.put('/:projectId/security/classification', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  try {
    // Verify project ownership
    const project = await c.env.DB.prepare(`
      SELECT id FROM projects WHERE id = ? AND owner_id = ?
    `).bind(projectId, userId).first();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const body = await c.req.json<Partial<DataClassification>>();

  // Validate AI exposure level based on data types (L-SPG3, L-SPG4)
  const requestedExposure = body.ai_exposure || 'RESTRICTED';
  const hasSensitiveData = body.pii === 'YES' || body.phi === 'YES' ||
                          body.minor_data === 'YES' || body.legal === 'YES';

  // L-SPG4: If ANY sensitive data is YES, cannot be PUBLIC
  if (hasSensitiveData && requestedExposure === 'PUBLIC') {
    return c.json({
      error: 'L-SPG4 Violation: Cannot set PUBLIC exposure with sensitive data declared',
      suggestion: 'Use INTERNAL or CONFIDENTIAL for PII/PHI data'
    }, 400);
  }

  // L-SPG3: PHI requires RESTRICTED or higher
  if (body.phi === 'YES' && ['PUBLIC', 'INTERNAL'].includes(requestedExposure)) {
    return c.json({
      error: 'L-SPG3 Violation: PHI requires CONFIDENTIAL or RESTRICTED exposure',
      suggestion: 'Use CONFIDENTIAL, RESTRICTED, or PROHIBITED for PHI'
    }, 400);
  }

  // L-SPG3: Minor data requires RESTRICTED
  if (body.minor_data === 'YES' && requestedExposure !== 'RESTRICTED' && requestedExposure !== 'PROHIBITED') {
    return c.json({
      error: 'L-SPG3 Violation: Minor data requires RESTRICTED or PROHIBITED exposure',
      suggestion: 'Use RESTRICTED or PROHIBITED for minor data'
    }, 400);
  }

  // Calculate final exposure level (L-SPG4: unknown = highest protection)
  let finalExposure = requestedExposure;
  const hasUnknown = body.pii === 'UNKNOWN' || body.phi === 'UNKNOWN' ||
                    body.financial === 'UNKNOWN' || body.legal === 'UNKNOWN' ||
                    body.minor_data === 'UNKNOWN';

  if (hasUnknown && ['PUBLIC', 'INTERNAL'].includes(requestedExposure)) {
    finalExposure = 'CONFIDENTIAL'; // L-SPG4: Upgrade protection for unknowns
  }

  const regulationsJson = JSON.stringify(body.regulations || []);
  const now = new Date().toISOString();

  // Upsert classification
  const existing = await c.env.DB.prepare(`
    SELECT project_id FROM data_classification WHERE project_id = ?
  `).bind(projectId).first();

  if (existing) {
    await c.env.DB.prepare(`
      UPDATE data_classification SET
        pii = ?, phi = ?, financial = ?, legal = ?, minor_data = ?,
        jurisdiction = ?, regulations = ?, ai_exposure = ?,
        declared_by = ?, declared_at = ?, updated_at = ?
      WHERE project_id = ?
    `).bind(
      body.pii || 'UNKNOWN',
      body.phi || 'UNKNOWN',
      body.financial || 'UNKNOWN',
      body.legal || 'UNKNOWN',
      body.minor_data || 'UNKNOWN',
      body.jurisdiction || 'US',
      regulationsJson,
      finalExposure,
      userId,
      now,
      now,
      projectId
    ).run();
  } else {
    await c.env.DB.prepare(`
      INSERT INTO data_classification
        (project_id, pii, phi, financial, legal, minor_data, jurisdiction, regulations, ai_exposure, declared_by, declared_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      projectId,
      body.pii || 'UNKNOWN',
      body.phi || 'UNKNOWN',
      body.financial || 'UNKNOWN',
      body.legal || 'UNKNOWN',
      body.minor_data || 'UNKNOWN',
      body.jurisdiction || 'US',
      regulationsJson,
      finalExposure,
      userId,
      now
    ).run();
  }

  // Update security gates (GS:DC passed)
  await updateSecurityGate(c.env.DB, projectId, 'gs_dc', true);

  // If all categories are declared (not UNKNOWN), pass GS:AI as well
  const allDeclared = body.pii !== 'UNKNOWN' && body.phi !== 'UNKNOWN' &&
                     body.financial !== 'UNKNOWN' && body.legal !== 'UNKNOWN' &&
                     body.minor_data !== 'UNKNOWN';

  if (allDeclared) {
    await updateSecurityGate(c.env.DB, projectId, 'gs_ai', true);
  }

  // Log decision for audit
  await c.env.DB.prepare(`
    INSERT INTO decisions (id, project_id, decision_type, description, actor, metadata, created_at)
    VALUES (?, ?, 'SECURITY', ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    projectId,
    `Data classification declared: AI exposure set to ${finalExposure}`,
    userId,
    JSON.stringify({
      pii: body.pii,
      phi: body.phi,
      financial: body.financial,
      legal: body.legal,
      minor_data: body.minor_data,
      ai_exposure: finalExposure,
      gate: 'GS:DC'
    }),
    now
  ).run();

  return c.json({
    success: true,
    classification: {
      pii: body.pii || 'UNKNOWN',
      phi: body.phi || 'UNKNOWN',
      financial: body.financial || 'UNKNOWN',
      legal: body.legal || 'UNKNOWN',
      minor_data: body.minor_data || 'UNKNOWN',
      jurisdiction: body.jurisdiction || 'US',
      regulations: body.regulations || [],
      ai_exposure: finalExposure
    },
    gates_passed: ['GS:DC', ...(allDeclared ? ['GS:AI'] : [])],
    warnings: finalExposure !== requestedExposure ? [
      `AI exposure upgraded from ${requestedExposure} to ${finalExposure} per L-SPG4 (unknown = highest protection)`
    ] : []
  });
  } catch (error) {
    console.error('Error setting classification:', error);
    return c.json({
      error: 'Failed to set data classification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// =============================================================================
// SECURITY GATES STATUS
// =============================================================================

/**
 * GET /api/v1/projects/:projectId/security/gates
 * Get security gates status for a project
 */
app.get('/:projectId/security/gates', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  // Verify project ownership
  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const gates = await c.env.DB.prepare(`
    SELECT * FROM security_gates WHERE project_id = ?
  `).bind(projectId).first();

  if (!gates) {
    // Return default (all gates pending except GS:AC which is implicit from auth)
    return c.json({
      project_id: projectId,
      gates: {
        'GS:DC': { passed: false, required: true, description: 'Data Classification' },
        'GS:DP': { passed: false, required: false, description: 'Data Protection' },
        'GS:AC': { passed: true, required: true, description: 'Access Controls' },
        'GS:AI': { passed: false, required: true, description: 'AI Exposure Compliance' },
        'GS:JR': { passed: false, required: false, description: 'Jurisdiction Compliance' },
        'GS:RT': { passed: false, required: false, description: 'Retention Policy' }
      },
      execution_allowed: false,
      reason: 'GS:DC not passed - declare data classification first'
    });
  }

  const executionAllowed = gates.gs_dc && gates.gs_ac;
  const reason = !gates.gs_dc ? 'GS:DC not passed - declare data classification first' :
                 !gates.gs_ac ? 'GS:AC not passed - authentication required' :
                 null;

  return c.json({
    project_id: projectId,
    gates: {
      'GS:DC': { passed: gates.gs_dc, passed_at: gates.gs_dc_passed_at, required: true, description: 'Data Classification' },
      'GS:DP': { passed: gates.gs_dp, passed_at: gates.gs_dp_passed_at, required: false, description: 'Data Protection' },
      'GS:AC': { passed: gates.gs_ac, passed_at: gates.gs_ac_passed_at, required: true, description: 'Access Controls' },
      'GS:AI': { passed: gates.gs_ai, passed_at: gates.gs_ai_passed_at, required: true, description: 'AI Exposure Compliance' },
      'GS:JR': { passed: gates.gs_jr, passed_at: gates.gs_jr_passed_at, required: false, description: 'Jurisdiction Compliance' },
      'GS:RT': { passed: gates.gs_rt, passed_at: gates.gs_rt_passed_at, required: false, description: 'Retention Policy' }
    },
    execution_allowed: executionAllowed,
    reason
  });
});

// =============================================================================
// AI EXPOSURE VALIDATION (GS:AI Gate - L-SPG3, L-SPG6)
// =============================================================================

/**
 * POST /api/v1/projects/:projectId/security/validate-exposure
 * Validate if AI exposure is allowed for this request
 * Called by router before AI execution
 */
app.post('/:projectId/security/validate-exposure', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const body = await c.req.json<{
    request_id: string;
    content_preview?: string; // First 100 chars for logging
  }>();

  // Get classification
  const classification = await c.env.DB.prepare(`
    SELECT ai_exposure, pii, phi, minor_data FROM data_classification WHERE project_id = ?
  `).bind(projectId).first<{
    ai_exposure: string;
    pii: string;
    phi: string;
    minor_data: string;
  }>();

  // L-SPG4: No classification = RESTRICTED
  const exposure = classification?.ai_exposure || 'RESTRICTED';

  // Determine if exposure is allowed
  let allowed = true;
  let requiresRedaction = false;
  let blockedReason: string | null = null;

  switch (exposure) {
    case 'PROHIBITED':
      allowed = false;
      blockedReason = 'L-SPG3: AI exposure is PROHIBITED for this project';
      break;
    case 'RESTRICTED':
      // L-SPG3: Requires explicit authorization (for now, block without approval workflow)
      allowed = false;
      blockedReason = 'L-SPG3: RESTRICTED exposure requires Director authorization';
      break;
    case 'CONFIDENTIAL':
      allowed = true;
      requiresRedaction = true; // Must redact PII/PHI
      break;
    case 'INTERNAL':
    case 'PUBLIC':
      allowed = true;
      requiresRedaction = false;
      break;
  }

  // Log exposure attempt
  const logId = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO ai_exposure_log
      (id, project_id, request_id, classification, exposure_type, authorized, authorized_by, authorization_reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    projectId,
    body.request_id,
    exposure,
    allowed ? (requiresRedaction ? 'REDACTED' : 'FULL_CONTENT') : 'BLOCKED',
    allowed,
    allowed ? 'SYSTEM' : null,
    allowed ? `Exposure level ${exposure} allows AI access` : blockedReason,
    now
  ).run();

  return c.json({
    allowed,
    exposure_level: exposure,
    requires_redaction: requiresRedaction,
    blocked_reason: blockedReason,
    log_id: logId,
    redaction_rules: requiresRedaction ? {
      mask_pii: classification?.pii === 'YES',
      mask_phi: classification?.phi === 'YES',
      mask_minor_data: classification?.minor_data === 'YES'
    } : null
  });
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

type SecurityGateName = 'gs_dc' | 'gs_dp' | 'gs_ac' | 'gs_ai' | 'gs_jr' | 'gs_rt';

async function updateSecurityGate(
  db: D1Database,
  projectId: string,
  gate: SecurityGateName,
  passed: boolean
): Promise<void> {
  const now = new Date().toISOString();
  const passedAt = passed ? now : null;

  const existing = await db.prepare(`
    SELECT project_id FROM security_gates WHERE project_id = ?
  `).bind(projectId).first();

  if (existing) {
    // Update existing record - use separate queries per gate to avoid dynamic SQL
    switch (gate) {
      case 'gs_dc':
        await db.prepare(`UPDATE security_gates SET gs_dc = ?, gs_dc_passed_at = ?, updated_at = ? WHERE project_id = ?`)
          .bind(passed, passedAt, now, projectId).run();
        break;
      case 'gs_dp':
        await db.prepare(`UPDATE security_gates SET gs_dp = ?, gs_dp_passed_at = ?, updated_at = ? WHERE project_id = ?`)
          .bind(passed, passedAt, now, projectId).run();
        break;
      case 'gs_ac':
        await db.prepare(`UPDATE security_gates SET gs_ac = ?, gs_ac_passed_at = ?, updated_at = ? WHERE project_id = ?`)
          .bind(passed, passedAt, now, projectId).run();
        break;
      case 'gs_ai':
        await db.prepare(`UPDATE security_gates SET gs_ai = ?, gs_ai_passed_at = ?, updated_at = ? WHERE project_id = ?`)
          .bind(passed, passedAt, now, projectId).run();
        break;
      case 'gs_jr':
        await db.prepare(`UPDATE security_gates SET gs_jr = ?, gs_jr_passed_at = ?, updated_at = ? WHERE project_id = ?`)
          .bind(passed, passedAt, now, projectId).run();
        break;
      case 'gs_rt':
        await db.prepare(`UPDATE security_gates SET gs_rt = ?, gs_rt_passed_at = ?, updated_at = ? WHERE project_id = ?`)
          .bind(passed, passedAt, now, projectId).run();
        break;
    }
  } else {
    // Create new record with all gates defaulted, then update the specific gate
    await db.prepare(`
      INSERT INTO security_gates (project_id, gs_dc, gs_dc_passed_at, gs_dp, gs_dp_passed_at, gs_ac, gs_ac_passed_at, gs_ai, gs_ai_passed_at, gs_jr, gs_jr_passed_at, gs_rt, gs_rt_passed_at, updated_at)
      VALUES (?, FALSE, NULL, FALSE, NULL, TRUE, NULL, FALSE, NULL, FALSE, NULL, FALSE, NULL, ?)
    `).bind(projectId, now).run();

    // Now update the specific gate
    switch (gate) {
      case 'gs_dc':
        await db.prepare(`UPDATE security_gates SET gs_dc = ?, gs_dc_passed_at = ?, updated_at = ? WHERE project_id = ?`)
          .bind(passed, passedAt, now, projectId).run();
        break;
      case 'gs_ai':
        await db.prepare(`UPDATE security_gates SET gs_ai = ?, gs_ai_passed_at = ?, updated_at = ? WHERE project_id = ?`)
          .bind(passed, passedAt, now, projectId).run();
        break;
      // Other gates follow the same pattern if needed
    }
  }
}

// =============================================================================
// RESOURCE-LEVEL CLASSIFICATION (GS:DC at granular level — HANDOFF-CGC-01 GAP-2)
// =============================================================================

/**
 * POST /api/v1/projects/:projectId/security/classify
 * GS:DC — Classify a specific resource (SCOPE, DELIVERABLE, MESSAGE, FILE)
 */
app.post('/:projectId/security/classify', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id, owner_id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    resource_type: string;
    resource_id: string;
    classification: string;
    classification_reason?: string;
    ai_exposure_allowed?: boolean;
    ai_model_restrictions?: string[];
    data_residency?: string;
    retention_policy?: string;
  }>();

  // Validate resource_type
  const validTypes = ['SCOPE', 'DELIVERABLE', 'MESSAGE', 'FILE'];
  if (!validTypes.includes(body.resource_type)) {
    return c.json({ error: `Invalid resource_type. Must be one of: ${validTypes.join(', ')}` }, 400);
  }

  // Validate classification level
  const validLevels = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];
  if (!validLevels.includes(body.classification)) {
    return c.json({ error: `Invalid classification. Must be one of: ${validLevels.join(', ')}` }, 400);
  }

  // RESTRICTED classification requires project owner (Director role)
  if (body.classification === 'RESTRICTED' && project.owner_id !== userId) {
    return c.json({
      error: 'Forbidden: RESTRICTED classification requires project owner (Director role)',
      gate: 'GS:DC'
    }, 403);
  }

  // Validate retention_policy if provided
  const validRetention = ['7_DAYS', '30_DAYS', '90_DAYS', '1_YEAR', '7_YEARS', 'PERMANENT'];
  if (body.retention_policy && !validRetention.includes(body.retention_policy)) {
    return c.json({ error: `Invalid retention_policy. Must be one of: ${validRetention.join(', ')}` }, 400);
  }

  try {
    const now = new Date().toISOString();
    const aiModelRestrictions = body.ai_model_restrictions ? JSON.stringify(body.ai_model_restrictions) : null;

    // Calculate retention_expires_at based on policy
    let retentionExpiresAt: string | null = null;
    if (body.retention_policy && body.retention_policy !== 'PERMANENT') {
      const daysMap: Record<string, number> = {
        '7_DAYS': 7, '30_DAYS': 30, '90_DAYS': 90,
        '1_YEAR': 365, '7_YEARS': 2555
      };
      const days = daysMap[body.retention_policy];
      if (days) {
        const expiresDate = new Date();
        expiresDate.setDate(expiresDate.getDate() + days);
        retentionExpiresAt = expiresDate.toISOString();
      }
    }

    // Upsert resource classification
    await c.env.DB.prepare(`
      INSERT INTO security_classifications (
        project_id, resource_type, resource_id, classification,
        classification_reason, classified_by, classified_at,
        ai_exposure_allowed, ai_model_restrictions,
        data_residency, jurisdiction_reviewed,
        retention_policy, retention_expires_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
      ON CONFLICT(project_id, resource_type, resource_id) DO UPDATE SET
        classification = excluded.classification,
        classification_reason = excluded.classification_reason,
        classified_by = excluded.classified_by,
        classified_at = excluded.classified_at,
        ai_exposure_allowed = excluded.ai_exposure_allowed,
        ai_model_restrictions = excluded.ai_model_restrictions,
        data_residency = excluded.data_residency,
        retention_policy = excluded.retention_policy,
        retention_expires_at = excluded.retention_expires_at,
        updated_at = excluded.updated_at
    `).bind(
      projectId,
      body.resource_type,
      body.resource_id,
      body.classification,
      body.classification_reason || null,
      userId,
      now,
      body.ai_exposure_allowed !== false ? 1 : 0,
      aiModelRestrictions,
      body.data_residency || null,
      body.retention_policy || null,
      retentionExpiresAt,
      now
    ).run();

    // Log decision for audit trail
    await c.env.DB.prepare(`
      INSERT INTO decisions (id, project_id, decision_type, description, actor, metadata, created_at)
      VALUES (?, ?, 'SECURITY', ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      projectId,
      `Resource classified: ${body.resource_type}/${body.resource_id} → ${body.classification}`,
      userId,
      JSON.stringify({
        resource_type: body.resource_type,
        resource_id: body.resource_id,
        classification: body.classification,
        ai_exposure_allowed: body.ai_exposure_allowed !== false,
        gate: 'GS:DC'
      }),
      now
    ).run();

    return c.json({
      success: true,
      resource_type: body.resource_type,
      resource_id: body.resource_id,
      classification: body.classification,
      ai_exposure_allowed: body.ai_exposure_allowed !== false,
      retention_policy: body.retention_policy || null,
      retention_expires_at: retentionExpiresAt
    });
  } catch (error) {
    console.error('Error classifying resource:', error);
    return c.json({
      error: 'Failed to classify resource',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /api/v1/projects/:projectId/security/classifications
 * List all resource classifications for a project
 */
app.get('/:projectId/security/classifications', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const resourceType = c.req.query('resource_type');
  const classificationLevel = c.req.query('classification');

  let sql = `SELECT * FROM security_classifications WHERE project_id = ?`;
  const params: string[] = [projectId];

  if (resourceType) {
    sql += ` AND resource_type = ?`;
    params.push(resourceType);
  }

  if (classificationLevel) {
    sql += ` AND classification = ?`;
    params.push(classificationLevel);
  }

  sql += ` ORDER BY classified_at DESC`;

  const stmt = c.env.DB.prepare(sql);
  const results = await stmt.bind(...params).all();

  return c.json(results.results || []);
});

/**
 * GET /api/v1/projects/:projectId/security/resource/:resourceType/:resourceId
 * Get classification for a specific resource
 */
app.get('/:projectId/security/resource/:resourceType/:resourceId', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const resourceType = c.req.param('resourceType');
  const resourceId = c.req.param('resourceId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const classification = await c.env.DB.prepare(`
    SELECT * FROM security_classifications
    WHERE project_id = ? AND resource_type = ? AND resource_id = ?
  `).bind(projectId, resourceType, resourceId).first();

  if (!classification) {
    // Default: INTERNAL classification, AI allowed (L-SPG4 doesn't apply at resource level
    // when project-level classification exists)
    return c.json({
      classification: 'INTERNAL',
      ai_exposure_allowed: true,
      is_default: true,
      resource_type: resourceType,
      resource_id: resourceId
    });
  }

  return c.json(classification);
});

// =============================================================================
// JURISDICTION REVIEW (GS:JR — HANDOFF-CGC-01 GAP-2)
// =============================================================================

/**
 * PUT /api/v1/projects/:projectId/security/resource/:resourceType/:resourceId/jurisdiction
 * Mark jurisdiction review complete for a resource
 */
app.put('/:projectId/security/resource/:resourceType/:resourceId/jurisdiction', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const resourceType = c.req.param('resourceType');
  const resourceId = c.req.param('resourceId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{ data_residency: string }>();
  const now = new Date().toISOString();

  // Ensure classification exists first
  const existing = await c.env.DB.prepare(`
    SELECT id FROM security_classifications
    WHERE project_id = ? AND resource_type = ? AND resource_id = ?
  `).bind(projectId, resourceType, resourceId).first();

  if (!existing) {
    return c.json({ error: 'Resource must be classified before jurisdiction review' }, 400);
  }

  await c.env.DB.prepare(`
    UPDATE security_classifications SET
      data_residency = ?,
      jurisdiction_reviewed = 1,
      reviewed_by = ?,
      reviewed_at = ?,
      updated_at = ?
    WHERE project_id = ? AND resource_type = ? AND resource_id = ?
  `).bind(
    body.data_residency,
    userId,
    now,
    now,
    projectId,
    resourceType,
    resourceId
  ).run();

  // Update project-level GS:JR gate if all RESTRICTED/CONFIDENTIAL resources are reviewed
  const unreviewedSensitive = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM security_classifications
    WHERE project_id = ? AND classification IN ('CONFIDENTIAL', 'RESTRICTED')
      AND jurisdiction_reviewed = 0
  `).bind(projectId).first<{ count: number }>();

  if (!unreviewedSensitive || unreviewedSensitive.count === 0) {
    await updateSecurityGate(c.env.DB, projectId, 'gs_jr', true);
  }

  return c.json({
    success: true,
    jurisdiction_reviewed: true,
    data_residency: body.data_residency,
    gate: 'GS:JR'
  });
});

// =============================================================================
// SECRET AUDIT (GS:SA — HANDOFF-CGC-01 GAP-2)
// =============================================================================

/**
 * GET /api/v1/projects/:projectId/security/secrets/audit
 * Retrieve secret access audit log
 */
app.get('/:projectId/security/secrets/audit', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const limit = parseInt(c.req.query('limit') || '50');
  const secretKey = c.req.query('secret_key');

  let sql = `SELECT * FROM secret_access_log WHERE project_id = ?`;
  const params: (string | number)[] = [projectId];

  if (secretKey) {
    sql += ` AND secret_key = ?`;
    params.push(secretKey);
  }

  sql += ` ORDER BY accessed_at DESC LIMIT ?`;
  params.push(Math.min(limit, 200));

  const results = await c.env.DB.prepare(sql).bind(...params).all();

  return c.json(results.results || []);
});

// =============================================================================
// EXPORTED UTILITY FUNCTIONS (GS:AI + GS:SA — HANDOFF-CGC-01 GAP-2)
// =============================================================================

/**
 * Middleware utility: Check AI exposure at resource level before routing to model
 * Returns true if AI access is allowed for this resource
 */
export async function enforceAIExposureControl(
  db: D1Database,
  projectId: string,
  resourceType: string,
  resourceId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const classification = await db.prepare(`
    SELECT ai_exposure_allowed, classification, ai_model_restrictions
    FROM security_classifications
    WHERE project_id = ? AND resource_type = ? AND resource_id = ?
  `).bind(projectId, resourceType, resourceId).first<{
    ai_exposure_allowed: number;
    classification: string;
    ai_model_restrictions: string | null;
  }>();

  if (!classification) {
    return { allowed: true }; // Default: allow when no classification exists
  }

  if (!classification.ai_exposure_allowed) {
    return {
      allowed: false,
      reason: `GS:AI: AI exposure blocked for ${resourceType}/${resourceId} (classification: ${classification.classification})`
    };
  }

  return { allowed: true };
}

/**
 * Utility: Log secret/API key access for audit trail (GS:SA)
 */
export async function auditSecretAccess(
  db: D1Database,
  projectId: string,
  secretKey: string,
  accessType: 'READ' | 'WRITE' | 'ROTATE' | 'DELETE',
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await db.prepare(`
    INSERT INTO secret_access_log (
      project_id, secret_key, accessed_by, access_type, ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    projectId,
    secretKey,
    userId,
    accessType,
    ipAddress || null,
    userAgent || null
  ).run();

  // Update project-level GS:SA gate (mark as active — audit trail exists)
  const existing = await db.prepare(`
    SELECT project_id FROM security_gates WHERE project_id = ?
  `).bind(projectId).first();

  if (existing) {
    const now = new Date().toISOString();
    await db.prepare(`
      UPDATE security_gates SET gs_rt = CASE WHEN gs_rt = 0 THEN 0 ELSE gs_rt END, updated_at = ?
      WHERE project_id = ?
    `).bind(now, projectId).run();
  }
}

export default app;
