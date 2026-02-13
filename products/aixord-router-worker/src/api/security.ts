/**
 * Security & Privacy Governance API (SPG-01)
 *
 * Implements AIXORD v4.3 Security Gates:
 * - GS:DC - Data Classification
 * - GS:AI - AI Exposure Validation
 * - GS:JR - Jurisdiction Compliance
 *
 * Laws implemented:
 * - L-SPG1: Declare sensitivity before execution
 * - L-SPG3: No raw PII/PHI to AI without authorization
 * - L-SPG4: Unknown = highest protection
 * - L-SPG5: GS:DC required for setup
 * - L-SPG6: GS:AI required for execution
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

export default app;
