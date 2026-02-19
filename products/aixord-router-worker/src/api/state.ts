/**
 * State API
 *
 * AIXORD governance state persistence per project.
 *
 * Endpoints:
 * - GET  /api/v1/state/:projectId
 * - PUT  /api/v1/state/:projectId
 * - PUT  /api/v1/state/:projectId/gates/:gateId
 * - PUT  /api/v1/state/:projectId/phase
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import { log } from '../utils/logger';
import { evaluateAllGates } from '../services/gateRules';
import { validateBrainstormArtifact } from './brainstorm';
import type { BrainstormOption, BrainstormDecisionCriteria } from '../types';
import {
  computeProjectReadiness,
  getConservationSnapshot,
  transferWorkUnits,
  computeReconciliation,
} from '../services/readinessEngine';
import { validatePhaseTransition } from '../governance/phaseContracts';
import { verifyProjectOwnership } from '../utils/projectOwnership';

const state = new Hono<{ Bindings: Env }>();

// All routes require auth
state.use('/*', requireAuth);

/**
 * Normalize phase to full name format (BRAINSTORM, PLAN, EXECUTE, REVIEW)
 * Accepts both short codes (B, P, E, R) and full names
 */
function normalizePhase(phase: string): string | null {
  if (!phase) return null;
  const p = phase.trim().toUpperCase();
  const phaseMap: Record<string, string> = {
    'B': 'BRAINSTORM', 'P': 'PLAN', 'E': 'EXECUTE', 'R': 'REVIEW',
    'BRAINSTORM': 'BRAINSTORM', 'PLAN': 'PLAN', 'EXECUTE': 'EXECUTE', 'REVIEW': 'REVIEW'
  };
  return phaseMap[p] || null;
}

/**
 * Validate phase string
 */
function isValidPhase(phase: string): boolean {
  const validPhases = ['B', 'P', 'E', 'R', 'BRAINSTORM', 'PLAN', 'EXECUTE', 'REVIEW'];
  return validPhases.includes(phase.toUpperCase());
}

/**
 * Phase ordering for transition validation
 */
const PHASE_ORDER: Record<string, number> = {
  'BRAINSTORM': 0, 'PLAN': 1, 'EXECUTE': 2, 'REVIEW': 3,
};

/**
 * Phase exit gate requirements — gates that must be passed before
 * leaving the current phase (forward transitions only).
 *
 * Backward transitions are always allowed (going back to fix things).
 */
const PHASE_EXIT_REQUIREMENTS: Record<string, { gates: string[]; label: string }> = {
  'BRAINSTORM': {
    gates: ['GA:LIC', 'GA:DIS', 'GA:TIR'],
    label: 'License, Disclaimer, and Tier gates required to exit Brainstorm',
  },
  'PLAN': {
    gates: ['GA:ENV', 'GA:FLD', 'GA:BP', 'GA:IVL'],
    label: 'Environment, Folder, Blueprint, and Integrity Validation gates required to exit Plan',
  },
  'EXECUTE': {
    gates: ['GW:PRE', 'GW:VAL', 'GW:VER'],
    label: 'Prerequisites, Validation, and Verification gates required to exit Execute',
  },
  // REVIEW has no exit requirements (terminal phase)
};

/**
 * Check if a phase transition is allowed based on gate requirements.
 * Returns { allowed, missingGates, message } tuple.
 */
function checkPhaseTransition(
  currentPhase: string,
  targetPhase: string,
  gates: Record<string, boolean>
): { allowed: boolean; missingGates: string[]; message: string | null } {
  const currentOrder = PHASE_ORDER[currentPhase] ?? -1;
  const targetOrder = PHASE_ORDER[targetPhase] ?? -1;

  // Backward transitions always allowed
  if (targetOrder <= currentOrder) {
    return { allowed: true, missingGates: [], message: null };
  }

  // Check exit requirements for current phase
  const requirements = PHASE_EXIT_REQUIREMENTS[currentPhase];
  if (!requirements) {
    return { allowed: true, missingGates: [], message: null };
  }

  const missingGates = requirements.gates.filter(g => !gates[g]);
  if (missingGates.length > 0) {
    return {
      allowed: false,
      missingGates,
      message: requirements.label,
    };
  }

  return { allowed: true, missingGates: [], message: null };
}

/**
 * GET /api/v1/state/:projectId
 */
state.get('/:projectId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const projectState = await c.env.DB.prepare(
    'SELECT * FROM project_state WHERE project_id = ?'
  ).bind(projectId).first<{
    project_id: string;
    phase: string;
    gates: string;
    capsule: string;
    updated_at: string;
  }>();

  if (!projectState) {
    return c.json({ error: 'State not found' }, 404);
  }

  const capsule = JSON.parse(projectState.capsule || '{}');

  // Enrich capsule with authoritative security_gates from DB table
  // The capsule JSON can become stale when security gates are updated
  // via the security API — always read the source-of-truth table.
  const secGates = await c.env.DB.prepare(
    'SELECT gs_dc, gs_dp, gs_ac, gs_ai, gs_jr, gs_rt FROM security_gates WHERE project_id = ?'
  ).bind(projectId).first<{
    gs_dc: number; gs_dp: number; gs_ac: number;
    gs_ai: number; gs_jr: number; gs_rt: number;
  }>();

  if (secGates) {
    capsule.security_gates = {
      GS_DC: !!secGates.gs_dc,
      GS_DP: !!secGates.gs_dp,
      GS_AC: !!secGates.gs_ac,
      GS_AI: !!secGates.gs_ai,
      GS_JR: !!secGates.gs_jr,
      GS_RT: !!secGates.gs_rt,
    };
  }

  // FIX-PLAN-SYNC: Ensure capsule.session.phase matches the authoritative
  // project_state.phase. The capsule JSON can become stale when phase
  // transitions happen (e.g., BRAINSTORM → PLAN) because the capsule
  // is only updated on explicit PUT, not during phase finalization.
  // Without this, the frontend sends stale phase to the router, which
  // causes the AI to miss phase-specific context injection.
  if (capsule.session && projectState.phase) {
    capsule.session.phase = projectState.phase;
  }

  return c.json({
    project_id: projectState.project_id,
    phase: projectState.phase,
    gates: JSON.parse(projectState.gates || '{}'),
    capsule,
    updated_at: projectState.updated_at
  });
});

/**
 * PUT /api/v1/state/:projectId
 */
state.put('/:projectId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    phase?: string;
    gates?: Record<string, boolean>;
    capsule?: Record<string, unknown>;
    // FIX 2 (Session 13C): Accept data_classification and security_gates from frontend
    data_classification?: {
      pii?: string;
      phi?: string;
      financial?: string;
      legal?: string;
      minor_data?: string;
      ai_exposure?: string;
    };
    security_gates?: Record<string, boolean>;
  }>();
  const { phase, gates, capsule, data_classification, security_gates } = body;

  // Validate and normalize phase if provided
  let normalizedPhaseValue: string | null = null;
  if (phase) {
    if (!isValidPhase(phase)) {
      return c.json({ error: 'Invalid phase. Must be B/P/E/R or BRAINSTORM/PLAN/EXECUTE/REVIEW' }, 400);
    }
    normalizedPhaseValue = normalizePhase(phase);
  }

  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE project_state
    SET phase = COALESCE(?, phase),
        gates = COALESCE(?, gates),
        capsule = COALESCE(?, capsule),
        updated_at = ?
    WHERE project_id = ?
  `).bind(
    normalizedPhaseValue,
    gates ? JSON.stringify(gates) : null,
    capsule ? JSON.stringify(capsule) : null,
    now,
    projectId
  ).run();

  // FIX 2 (Session 13C): Save data_classification if provided
  if (data_classification) {
    const existing = await c.env.DB.prepare(
      'SELECT project_id FROM data_classification WHERE project_id = ?'
    ).bind(projectId).first();

    if (existing) {
      await c.env.DB.prepare(`
        UPDATE data_classification
        SET pii = COALESCE(?, pii),
            phi = COALESCE(?, phi),
            financial = COALESCE(?, financial),
            legal = COALESCE(?, legal),
            minor_data = COALESCE(?, minor_data),
            ai_exposure = COALESCE(?, ai_exposure),
            declared_by = ?,
            declared_at = ?,
            updated_at = ?
        WHERE project_id = ?
      `).bind(
        data_classification.pii || null,
        data_classification.phi || null,
        data_classification.financial || null,
        data_classification.legal || null,
        data_classification.minor_data || null,
        data_classification.ai_exposure || null,
        userId,
        now,
        now,
        projectId
      ).run();
    } else {
      await c.env.DB.prepare(`
        INSERT INTO data_classification
          (project_id, pii, phi, financial, legal, minor_data, jurisdiction, regulations, ai_exposure, declared_by, declared_at)
        VALUES (?, ?, ?, ?, ?, ?, 'US', '[]', ?, ?, ?)
      `).bind(
        projectId,
        data_classification.pii || 'UNKNOWN',
        data_classification.phi || 'UNKNOWN',
        data_classification.financial || 'UNKNOWN',
        data_classification.legal || 'UNKNOWN',
        data_classification.minor_data || 'UNKNOWN',
        data_classification.ai_exposure || 'INTERNAL',
        userId,
        now
      ).run();
    }
  }

  // FIX 2 (Session 13C): Save security_gates if provided
  if (security_gates) {
    const existing = await c.env.DB.prepare(
      'SELECT project_id FROM security_gates WHERE project_id = ?'
    ).bind(projectId).first();

    if (existing) {
      // Update individual gates
      for (const [gate, passed] of Object.entries(security_gates)) {
        const gateColumn = gate.toLowerCase().replace(':', '_'); // GS:DC -> gs_dc
        const passedAtColumn = `${gateColumn}_passed_at`;
        // Use dynamic column names safely by checking against known gates
        const validGates = ['gs_dc', 'gs_dp', 'gs_ac', 'gs_ai', 'gs_jr', 'gs_rt'];
        if (validGates.includes(gateColumn)) {
          await c.env.DB.prepare(`
            UPDATE security_gates
            SET ${gateColumn} = ?, ${passedAtColumn} = ?, updated_at = ?
            WHERE project_id = ?
          `).bind(passed, passed ? now : null, now, projectId).run();
        }
      }
    } else {
      // Create new security_gates record with defaults
      await c.env.DB.prepare(`
        INSERT INTO security_gates
          (project_id, gs_dc, gs_dp, gs_ac, gs_ai, gs_jr, gs_rt, updated_at)
        VALUES (?, ?, FALSE, TRUE, ?, FALSE, FALSE, ?)
      `).bind(
        projectId,
        security_gates['GS:DC'] || security_gates['gs_dc'] || false,
        security_gates['GS:AI'] || security_gates['gs_ai'] || false,
        now
      ).run();
    }
  }

  return c.json({ success: true, updated_at: now });
});

/**
 * PUT /api/v1/state/:projectId/gates/:gateId
 */
state.put('/:projectId/gates/:gateId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const gateId = c.req.param('gateId');
  try {

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{ enabled: boolean }>();
  const { enabled } = body;

  if (typeof enabled !== 'boolean') {
    return c.json({ error: 'enabled must be a boolean' }, 400);
  }

  // Gate auto-check: GA:ENV requires confirmed workspace binding
  if (gateId === 'GA:ENV' && enabled) {
    const binding = await c.env.DB.prepare(
      'SELECT binding_confirmed FROM workspace_bindings WHERE project_id = ?'
    ).bind(projectId).first<{ binding_confirmed: number }>();

    if (!binding || !binding.binding_confirmed) {
      return c.json({ error: 'GA:ENV requires completing Workspace Setup (bind project folder and confirm)', gate: 'GA:ENV' }, 403);
    }
  }

  // Gate auto-check: GA:FLD requires linked folder in workspace binding
  if (gateId === 'GA:FLD' && enabled) {
    const binding = await c.env.DB.prepare(
      'SELECT folder_name FROM workspace_bindings WHERE project_id = ?'
    ).bind(projectId).first<{ folder_name: string | null }>();

    if (!binding || !binding.folder_name) {
      return c.json({ error: 'GA:FLD requires linking a project folder via Workspace Setup', gate: 'GA:FLD' }, 403);
    }
  }

  // Gate auto-check: GA:BP requires blueprint structure to exist
  if (gateId === 'GA:BP' && enabled) {
    const scopeCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM blueprint_scopes WHERE project_id = ?'
    ).bind(projectId).first<{ count: number }>();
    const deliverableCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM blueprint_deliverables WHERE project_id = ?'
    ).bind(projectId).first<{ count: number }>();
    const missingDoD = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM blueprint_deliverables WHERE project_id = ? AND (dod_evidence_spec IS NULL OR dod_evidence_spec = '' OR dod_verification_method IS NULL OR dod_verification_method = '')"
    ).bind(projectId).first<{ count: number }>();

    if (!scopeCount?.count || scopeCount.count === 0) {
      return c.json({ error: 'GA:BP requires at least one blueprint scope', gate: 'GA:BP' }, 403);
    }
    if (!deliverableCount?.count || deliverableCount.count === 0) {
      return c.json({ error: 'GA:BP requires at least one deliverable with Definition of Done', gate: 'GA:BP' }, 403);
    }
    if (missingDoD?.count && missingDoD.count > 0) {
      return c.json({ error: `GA:BP blocked: ${missingDoD.count} deliverable(s) missing Definition of Done`, gate: 'GA:BP' }, 403);
    }
  }

  // Gate auto-check: GA:IVL requires passing integrity report
  if (gateId === 'GA:IVL' && enabled) {
    const latestReport = await c.env.DB.prepare(
      'SELECT all_passed FROM blueprint_integrity_reports WHERE project_id = ? ORDER BY run_at DESC LIMIT 1'
    ).bind(projectId).first<{ all_passed: number }>();

    if (!latestReport) {
      return c.json({ error: 'GA:IVL requires running Integrity Validation first', gate: 'GA:IVL' }, 403);
    }
    if (!latestReport.all_passed) {
      return c.json({ error: 'GA:IVL blocked: latest Integrity Validation did not pass all 5 checks', gate: 'GA:IVL' }, 403);
    }
  }

  // Get current gates
  const current = await c.env.DB.prepare(
    'SELECT gates FROM project_state WHERE project_id = ?'
  ).bind(projectId).first<{ gates: string }>();

  const gates = JSON.parse(current?.gates || '{}');
  gates[gateId] = enabled;

  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE project_state
    SET gates = ?, updated_at = ?
    WHERE project_id = ?
  `).bind(JSON.stringify(gates), now, projectId).run();

  return c.json({ success: true, gates, updated_at: now });
  } catch (err) {
    log.error('gate_toggle_error', { project_id: projectId, gate_id: gateId, error: err instanceof Error ? err.message : String(err) });
    return c.json({ error: 'Gate toggle failed' }, 500);
  }
});

/**
 * PUT /api/v1/state/:projectId/phase
 */
state.put('/:projectId/phase', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    phase: string;
    force?: boolean;
    reassess_reason?: string;
    review_summary?: string;
  }>();
  const { phase, force, reassess_reason, review_summary } = body;

  if (!isValidPhase(phase)) {
    return c.json({ error: 'Invalid phase. Must be B/P/E/R or BRAINSTORM/PLAN/EXECUTE/REVIEW' }, 400);
  }

  const normalizedPhaseValue = normalizePhase(phase);

  // Get current state for transition validation
  const currentState = await c.env.DB.prepare(
    'SELECT phase, gates FROM project_state WHERE project_id = ?'
  ).bind(projectId).first<{ phase: string; gates: string }>();

  const currentPhase = currentState?.phase || 'BRAINSTORM';
  const gates = JSON.parse(currentState?.gates || '{}');

  // Detect regression (GFB-01 Task 3 — REASSESS Protocol)
  const currentOrder = PHASE_ORDER[currentPhase] ?? 0;
  const targetOrder = PHASE_ORDER[normalizedPhaseValue!] ?? 0;
  const isRegression = targetOrder < currentOrder;

  if (isRegression && !force) {
    // Determine REASSESS level
    // Kingdom boundaries: BRAINSTORM=IDEATION, PLAN=BLUEPRINT, EXECUTE/REVIEW=REALIZATION
    const KINGDOM: Record<string, string> = {
      'BRAINSTORM': 'IDEATION', 'PLAN': 'BLUEPRINT', 'EXECUTE': 'REALIZATION', 'REVIEW': 'REALIZATION',
    };
    const currentKingdom = KINGDOM[currentPhase] || 'UNKNOWN';
    const targetKingdom = KINGDOM[normalizedPhaseValue!] || 'UNKNOWN';
    const crossesKingdom = currentKingdom !== targetKingdom;

    // Get reassess count
    let reassessCount = 0;
    try {
      const countRow = await c.env.DB.prepare(
        'SELECT reassess_count FROM project_state WHERE project_id = ?'
      ).bind(projectId).first<{ reassess_count: number }>();
      reassessCount = countRow?.reassess_count || 0;
    } catch (e) { log.warn('reassess_count_read_failed', { error: e instanceof Error ? e.message : String(e) }); }

    let level = 1; // Surgical Fix (same kingdom)
    if (crossesKingdom) level = 2; // Major Pivot
    if (reassessCount >= 2) level = 3; // Fresh Start (3rd+ reassessment)

    // Require reason
    if (!reassess_reason || reassess_reason.length < 20) {
      return c.json({
        error: 'REASSESS_REASON_REQUIRED',
        message: `Phase regression requires a reason (min 20 characters). Level ${level} reassessment.`,
        level,
        reassess_count: reassessCount + 1,
        cross_kingdom: crossesKingdom,
        phase_from: currentPhase,
        phase_to: normalizedPhaseValue,
      }, 400);
    }

    // Level 3: require review summary
    if (level === 3 && (!review_summary || review_summary.length < 50)) {
      return c.json({
        error: 'REASSESS_REVIEW_REQUIRED',
        message: `This is reassessment #${reassessCount + 1}. A review summary (min 50 chars) explaining the pattern is required.`,
        level: 3,
        reassess_count: reassessCount + 1,
        phase_from: currentPhase,
        phase_to: normalizedPhaseValue,
      }, 400);
    }

    // Artifact impact for Level 2+
    let artifactImpact = 'none';
    const now = new Date().toISOString();

    if (level >= 2) {
      try {
        await c.env.DB.prepare(
          `UPDATE brainstorm_artifacts SET status = 'SUPERSEDED', updated_at = ?
           WHERE project_id = ? AND status = 'ACTIVE'`
        ).bind(now, projectId).run();
        artifactImpact = 'active_artifacts_superseded';
      } catch (e) { log.warn('artifact_supersede_failed', { level: 2, error: e instanceof Error ? e.message : String(e) }); }
    }
    if (level === 3) {
      try {
        await c.env.DB.prepare(
          `UPDATE brainstorm_artifacts SET status = 'SUPERSEDED', updated_at = ?
           WHERE project_id = ? AND status = 'DRAFT'`
        ).bind(now, projectId).run();
        artifactImpact = 'all_non_frozen_superseded';
      } catch (e) { log.warn('artifact_supersede_failed', { level: 3, error: e instanceof Error ? e.message : String(e) }); }
    }

    // Log to reassessment_log
    try {
      await c.env.DB.prepare(
        `INSERT INTO reassessment_log
         (project_id, level, phase_from, phase_to, reason, review_summary, artifact_impact)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(projectId, level, currentPhase, normalizedPhaseValue,
             reassess_reason, review_summary || null, artifactImpact).run();
    } catch (e) { log.warn('reassessment_log_insert_failed', { error: e instanceof Error ? e.message : String(e) }); }

    // Increment reassess_count
    try {
      await c.env.DB.prepare(
        `UPDATE project_state SET reassess_count = COALESCE(reassess_count, 0) + 1
         WHERE project_id = ?`
      ).bind(projectId).run();
    } catch (e) { log.warn('reassess_count_increment_failed', { error: e instanceof Error ? e.message : String(e) }); }

    // Log to decision_ledger
    try {
      await c.env.DB.prepare(
        `INSERT INTO decision_ledger
         (project_id, action, phase_from, phase_to, actor_id, actor_role,
          gate_snapshot, artifact_check, result, reason, created_at)
         VALUES (?, ?, ?, ?, ?, 'DIRECTOR', ?, ?, 'APPROVED', ?, ?)`
      ).bind(
        projectId,
        `REASSESS_L${level}`,
        currentPhase,
        normalizedPhaseValue,
        userId,
        JSON.stringify({}),
        JSON.stringify({ artifact_impact: artifactImpact, level }),
        reassess_reason,
        now,
      ).run();
    } catch (e) { log.warn('decision_ledger_insert_failed', { error: e instanceof Error ? e.message : String(e) }); }

    // Fall through to phase update below
  }

  // Validate forward phase transition (unless force=true for admin override)
  if (!isRegression && !force && normalizedPhaseValue !== currentPhase) {
    const check = checkPhaseTransition(currentPhase, normalizedPhaseValue!, gates);
    if (!check.allowed) {
      return c.json({
        error: 'Phase transition blocked',
        message: check.message,
        currentPhase,
        targetPhase: normalizedPhaseValue,
        missingGates: check.missingGates,
      }, 403);
    }
  }

  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE project_state
    SET phase = ?, updated_at = ?
    WHERE project_id = ?
  `).bind(normalizedPhaseValue, now, projectId).run();

  return c.json({
    success: true,
    phase: normalizedPhaseValue,
    updated_at: now,
    ...(isRegression ? { reassessment: true, level: body.reassess_reason ? undefined : undefined } : {}),
  });
});

/**
 * POST /api/v1/state/:projectId/phases/:phase/finalize
 *
 * Phase 4 — Finalize Phase Transaction
 * Formal governance transaction that:
 * 1. Validates authority (must be project owner / Director)
 * 2. Validates phase (must match current phase)
 * 3. Validates all exit gates are satisfied
 * 4. Validates phase-specific artifacts exist
 * 5. Logs to decision_ledger for audit trail
 * 6. Advances to next phase
 * 7. Locks the finalized phase (prevents re-entry without explicit unlock)
 *
 * This is NOT the same as PUT /phase — that's a soft transition.
 * Finalize is a governance-grade, audited, artifact-validated transition.
 */
state.post('/:projectId/phases/:phase/finalize', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const requestedPhase = c.req.param('phase').toUpperCase();

  // Parse optional override flags for quality warnings (body is optional for finalize)
  const body: { override_warnings?: boolean; override_reason?: string } = await c.req.json<{
    override_warnings?: boolean;
    override_reason?: string;
  }>().catch((err: unknown) => {
    log.debug('finalize_body_parse_skipped', {
      project_id: projectId,
      reason: err instanceof Error ? err.message : 'no body',
    });
    return {};
  });

  // ROOT-CAUSE-FIX: Top-level try/catch for the entire finalize handler.
  // Without this, any uncaught DB exception (missing column, constraint violation,
  // transient D1 error) falls through to Hono's global app.onError handler,
  // returning a generic "Internal server error" with no diagnostic context.
  // This was the root cause of the undebugable 500 errors reported by testers.
  try {

  // 1. Authority check — must be project owner (Director)
  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Unauthorized — only the project Director can finalize phases' }, 403);
  }

  // 2. Phase validation — must match current phase
  const currentState = await c.env.DB.prepare(
    'SELECT phase, gates, phase_locked FROM project_state WHERE project_id = ?'
  ).bind(projectId).first<{ phase: string; gates: string; phase_locked: number }>();

  if (!currentState) {
    return c.json({ error: 'Project state not found' }, 404);
  }

  const currentPhase = (currentState.phase || 'BRAINSTORM').toUpperCase();
  const normalizedRequested = normalizePhase(requestedPhase);

  if (!normalizedRequested) {
    return c.json({ error: `Invalid phase: ${requestedPhase}` }, 400);
  }

  if (normalizedRequested !== currentPhase) {
    return c.json({
      error: `Cannot finalize ${normalizedRequested} — project is currently in ${currentPhase}`,
      currentPhase,
      requestedPhase: normalizedRequested,
    }, 409);
  }

  // 3. Gate validation — all exit gates must be satisfied
  const gates: Record<string, boolean> = JSON.parse(currentState.gates || '{}');
  const exitReq = PHASE_EXIT_REQUIREMENTS[currentPhase];
  const missingGates = exitReq
    ? exitReq.gates.filter(g => !gates[g])
    : [];

  // 3b. Phase contract validation (L-BRN, L-PLN, L-BPX, L-IVL — HANDOFF-CGC-01 GAP-3)
  const nextPhaseOrder = PHASE_ORDER[currentPhase] !== undefined ? PHASE_ORDER[currentPhase] + 1 : -1;
  const nextPhaseName = Object.entries(PHASE_ORDER).find(([_, v]) => v === nextPhaseOrder)?.[0] || 'LOCK';
  const contractValidation = await validatePhaseTransition(
    c.env.DB, projectId, currentPhase, nextPhaseName
  );
  const contractViolations = contractValidation.violations;

  // 4. Artifact validation — phase-specific checks
  const artifactChecks: Array<{ check: string; passed: boolean; detail: string }> = [];
  const warnChecks: Array<{ check: string; passed: boolean; detail: string }> = [];

  // Add contract violations as artifact checks
  for (const v of contractViolations) {
    if (v.severity === 'BLOCKING') {
      artifactChecks.push({ check: `contract_${v.law}`, passed: false, detail: v.description });
    } else {
      warnChecks.push({ check: `contract_${v.law}`, passed: false, detail: v.description });
    }
  }

  if (currentPhase === 'BRAINSTORM') {
    // B0: Must have a defined objective
    const project = await c.env.DB.prepare(
      'SELECT objective FROM projects WHERE id = ?'
    ).bind(projectId).first<{ objective: string }>();
    const hasObjective = !!(project?.objective && project.objective.trim().length > 10);
    artifactChecks.push({
      check: 'objective_defined',
      passed: hasObjective,
      detail: hasObjective ? 'Project objective is defined' : 'Project objective is missing or too short (min 10 chars)',
    });

    // B1-B5: Structured brainstorm artifact validation (HANDOFF-VD-CI-01 A2)
    const artifactRow = await c.env.DB.prepare(
      'SELECT * FROM brainstorm_artifacts WHERE project_id = ? ORDER BY version DESC LIMIT 1'
    ).bind(projectId).first<Record<string, unknown>>();

    if (!artifactRow) {
      artifactChecks.push({
        check: 'brainstorm_artifact_exists',
        passed: false,
        detail: 'No brainstorm artifact found — AI must generate a structured artifact with options, assumptions, and kill conditions',
      });
    } else {
      artifactChecks.push({
        check: 'brainstorm_artifact_exists',
        passed: true,
        detail: `Brainstorm artifact v${artifactRow.version} (${artifactRow.status})`,
      });

      // Run full validation engine
      const options: BrainstormOption[] = JSON.parse(artifactRow.options as string || '[]');
      const assumptions: string[] = JSON.parse(artifactRow.assumptions as string || '[]');
      const decisionCriteria: BrainstormDecisionCriteria = JSON.parse(artifactRow.decision_criteria as string || '{}');
      const killConditions: string[] = JSON.parse(artifactRow.kill_conditions as string || '[]');

      const validation = validateBrainstormArtifact(options, assumptions, decisionCriteria, killConditions);

      // Separate BLOCK checks (prevent finalize) from WARN checks (quality warnings)
      for (const check of validation.checks) {
        if (check.level === 'BLOCK') {
          artifactChecks.push({
            check: `brainstorm_${check.check}`,
            passed: check.passed,
            detail: check.detail,
          });
        } else if (check.level === 'WARN' && !check.passed) {
          warnChecks.push({
            check: `brainstorm_${check.check}`,
            passed: false,
            detail: check.detail,
          });
        }
      }
    }
  }

  if (currentPhase === 'PLAN') {
    // P1: Must have blueprint scopes
    const scopeCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM blueprint_scopes WHERE project_id = ?'
    ).bind(projectId).first<{ count: number }>();
    // P2: Must have deliverables
    const deliverableCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM blueprint_deliverables WHERE project_id = ?'
    ).bind(projectId).first<{ count: number }>();
    // P3: Integrity validation must pass
    const integrityReport = await c.env.DB.prepare(
      'SELECT all_passed FROM blueprint_integrity_reports WHERE project_id = ? ORDER BY run_at DESC LIMIT 1'
    ).bind(projectId).first<{ all_passed: number }>();

    artifactChecks.push({
      check: 'blueprint_scopes',
      passed: (scopeCount?.count || 0) > 0,
      detail: `${scopeCount?.count || 0} scope(s) defined`,
    });
    artifactChecks.push({
      check: 'blueprint_deliverables',
      passed: (deliverableCount?.count || 0) > 0,
      detail: `${deliverableCount?.count || 0} deliverable(s) defined`,
    });
    artifactChecks.push({
      check: 'integrity_validation',
      passed: !!integrityReport?.all_passed,
      detail: integrityReport ? (integrityReport.all_passed ? 'Integrity validation passed' : 'Integrity validation failed') : 'No integrity validation run',
    });

    // P4: Every scope must have a defined boundary
    const scopesNoBoundary = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM blueprint_scopes
       WHERE project_id = ? AND (boundary IS NULL OR boundary = '')`
    ).bind(projectId).first<{ count: number }>();
    artifactChecks.push({
      check: 'scope_boundaries_defined',
      passed: (scopesNoBoundary?.count || 0) === 0,
      detail: (scopesNoBoundary?.count || 0) === 0
        ? 'All scopes have defined boundaries'
        : `${scopesNoBoundary?.count} scope(s) missing boundary definition`,
    });

    // P5: Every deliverable must have a Definition of Done
    const delivsNoDod = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM blueprint_deliverables
       WHERE project_id = ? AND (dod_evidence_spec IS NULL OR dod_evidence_spec = '')`
    ).bind(projectId).first<{ count: number }>();
    artifactChecks.push({
      check: 'deliverables_have_dod',
      passed: (delivsNoDod?.count || 0) === 0,
      detail: (delivsNoDod?.count || 0) === 0
        ? 'All deliverables have Definition of Done'
        : `${delivsNoDod?.count} deliverable(s) missing Definition of Done (dod_evidence_spec)`,
    });

    // P6: No orphan deliverables (every deliverable must belong to a valid scope)
    const orphanDelivs = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM blueprint_deliverables bd
       LEFT JOIN blueprint_scopes bs ON bs.id = bd.scope_id AND bs.project_id = bd.project_id
       WHERE bd.project_id = ? AND bs.id IS NULL`
    ).bind(projectId).first<{ count: number }>();
    artifactChecks.push({
      check: 'no_orphan_deliverables',
      passed: (orphanDelivs?.count || 0) === 0,
      detail: (orphanDelivs?.count || 0) === 0
        ? 'All deliverables belong to valid scopes'
        : `${orphanDelivs?.count} deliverable(s) not linked to any scope`,
    });
  }

  if (currentPhase === 'EXECUTE') {
    // E1: Must have at least one AI-assisted message (work was done)
    const messageCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM messages WHERE project_id = ? AND role = \'assistant\''
    ).bind(projectId).first<{ count: number }>();
    artifactChecks.push({
      check: 'execution_messages_exist',
      passed: (messageCount?.count || 0) > 0,
      detail: `${messageCount?.count || 0} AI-assisted message(s) in project`,
    });

    // E2-E4: Task assignment checks (only when TDL is in use)
    const assignmentStats = await c.env.DB.prepare(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status IN ('ASSIGNED', 'IN_PROGRESS') THEN 1 ELSE 0 END) as unresolved,
         SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted,
         SUM(CASE WHEN status = 'BLOCKED' THEN 1 ELSE 0 END) as blocked
       FROM task_assignments WHERE project_id = ?`
    ).bind(projectId).first<{ total: number; unresolved: number; accepted: number; blocked: number }>();

    const totalAssignments = assignmentStats?.total || 0;
    if (totalAssignments > 0) {
      // E2: All assignments must be resolved (no ASSIGNED or IN_PROGRESS remaining)
      const unresolved = assignmentStats?.unresolved || 0;
      const blocked = assignmentStats?.blocked || 0;
      artifactChecks.push({
        check: 'assignments_resolved',
        passed: unresolved === 0 && blocked === 0,
        detail: unresolved === 0 && blocked === 0
          ? `All ${totalAssignments} assignment(s) resolved`
          : `${unresolved} unfinished + ${blocked} blocked assignment(s) remain — must be SUBMITTED/ACCEPTED/REJECTED before finalization`,
      });

      // E3: At least one deliverable must have been accepted
      const accepted = assignmentStats?.accepted || 0;
      artifactChecks.push({
        check: 'deliverables_accepted',
        passed: accepted > 0,
        detail: accepted > 0
          ? `${accepted} deliverable(s) accepted by Director`
          : 'No deliverables accepted — at least one must be reviewed and accepted',
      });

      // E4: All submitted/accepted assignments must have submission evidence
      const noEvidence = await c.env.DB.prepare(
        `SELECT COUNT(*) as count FROM task_assignments
         WHERE project_id = ? AND status IN ('SUBMITTED', 'ACCEPTED')
           AND (submission_evidence IS NULL OR submission_evidence = '' OR submission_evidence = '[]')`
      ).bind(projectId).first<{ count: number }>();
      artifactChecks.push({
        check: 'submission_evidence_exists',
        passed: (noEvidence?.count || 0) === 0,
        detail: (noEvidence?.count || 0) === 0
          ? 'All submitted work includes evidence'
          : `${noEvidence?.count} submission(s) missing evidence — each submission must include verification artifacts`,
      });
    }

    // ── Mathematical Governance Checks (EXECUTE → REVIEW) ──

    // E-GOV1: WU Conservation must hold
    const execConservation = await getConservationSnapshot(c.env.DB, projectId);
    if (execConservation.total > 0) {
      artifactChecks.push({
        check: 'wu_conservation_valid',
        passed: execConservation.valid,
        detail: execConservation.valid
          ? `WU conservation holds: total=${execConservation.total}, formula=${execConservation.formula}, verified=${execConservation.verified}`
          : `Conservation violation: delta=${execConservation.delta} (total=${execConservation.total} ≠ formula=${execConservation.formula} + verified=${execConservation.verified})`,
      });
    }

    // E-GOV2: Project readiness must meet minimum threshold (R ≥ 0.6)
    const execReadiness = await computeProjectReadiness(c.env.DB, projectId);
    if (execReadiness.scopes.length > 0) {
      const meetsThreshold = execReadiness.project_R >= 0.6;
      artifactChecks.push({
        check: 'project_readiness_threshold',
        passed: meetsThreshold,
        detail: meetsThreshold
          ? `Project readiness R=${execReadiness.project_R} meets ≥0.6 threshold`
          : `Project readiness R=${execReadiness.project_R} below 0.6 threshold — scopes need higher L×P×V scores`,
      });

      // E-GOV3: Auto-transfer WU for scopes that qualify (R > 0)
      // This is an action, not a check — non-blocking, runs on successful finalize
      // (Deferred to post-approval section below)

      // E-GOV4: Reconciliation divergence check (warning, not blocking)
      const execReconciliation = await computeReconciliation(c.env.DB, projectId);
      if (execReconciliation.has_divergences) {
        const divergent = execReconciliation.entries.filter(e => e.requires_attention);
        warnChecks.push({
          check: 'reconciliation_divergences',
          passed: false,
          detail: `${divergent.length} scope(s) with >20% reconciliation divergence: ${divergent.map(e => `${e.scope_name}(${e.divergence_pct}%)`).join(', ')}`,
        });
      }
    }
  }

  if (currentPhase === 'REVIEW') {
    // R1: Must have review activity (at least 2 assistant messages in REVIEW-phase sessions)
    const reviewMsgCount = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM messages m
       JOIN project_sessions ps ON ps.id = m.session_id AND ps.project_id = m.project_id
       WHERE m.project_id = ? AND m.role = 'assistant' AND ps.phase IN ('REVIEW', 'R')`
    ).bind(projectId).first<{ count: number }>();
    artifactChecks.push({
      check: 'review_activity',
      passed: (reviewMsgCount?.count || 0) >= 2,
      detail: (reviewMsgCount?.count || 0) >= 2
        ? `${reviewMsgCount?.count} review message(s) — sufficient review activity`
        : `Only ${reviewMsgCount?.count || 0} review message(s) — at least 2 required to confirm review was conducted`,
    });

    // R2: Active REVIEW session should have a summary
    const reviewSession = await c.env.DB.prepare(
      `SELECT summary FROM project_sessions
       WHERE project_id = ? AND phase IN ('REVIEW', 'R') AND status = 'ACTIVE'
       ORDER BY session_number DESC LIMIT 1`
    ).bind(projectId).first<{ summary: string | null }>();
    const hasSummary = !!(reviewSession?.summary && reviewSession.summary.trim().length >= 20);
    artifactChecks.push({
      check: 'review_summary_exists',
      passed: hasSummary,
      detail: hasSummary
        ? 'Review session has summary'
        : 'Review session summary missing or too short (min 20 chars) — summarize review findings before finalizing',
    });

    // ── Mathematical Governance Checks (REVIEW terminal finalization) ──

    // R-GOV1: Project readiness must be ≥ 0.8 for terminal finalization
    const reviewReadiness = await computeProjectReadiness(c.env.DB, projectId);
    if (reviewReadiness.scopes.length > 0 && reviewReadiness.conservation.total > 0) {
      artifactChecks.push({
        check: 'project_readiness_final',
        passed: reviewReadiness.project_R >= 0.8,
        detail: reviewReadiness.project_R >= 0.8
          ? `Project readiness R=${reviewReadiness.project_R} meets ≥0.8 final threshold`
          : `Project readiness R=${reviewReadiness.project_R} below 0.8 final threshold — not ready for closure`,
      });

      // R-GOV2: All scopes with allocated WU must have verified WU
      const unverifiedScopes = reviewReadiness.scopes.filter(s => s.allocated_wu > 0 && s.verified_wu === 0);
      if (unverifiedScopes.length > 0) {
        warnChecks.push({
          check: 'all_scopes_verified',
          passed: false,
          detail: `${unverifiedScopes.length} scope(s) have allocated WU but zero verified: ${unverifiedScopes.map(s => s.scope_name).join(', ')}`,
        });
      }

      // R-GOV3: Conservation must hold
      artifactChecks.push({
        check: 'final_conservation_valid',
        passed: reviewReadiness.conservation.valid,
        detail: reviewReadiness.conservation.valid
          ? `Final conservation holds: total=${reviewReadiness.conservation.total}`
          : `Final conservation violation: delta=${reviewReadiness.conservation.delta}`,
      });

      // R-GOV4: Final reconciliation check
      const finalRecon = await computeReconciliation(c.env.DB, projectId);
      if (finalRecon.has_divergences) {
        const divergent = finalRecon.entries.filter(e => e.requires_attention);
        warnChecks.push({
          check: 'final_reconciliation',
          passed: false,
          detail: `Final reconciliation: ${divergent.length} scope(s) with >20% divergence: ${divergent.map(e => `${e.scope_name}(${e.divergence_pct}%)`).join(', ')}`,
        });
      }
    }
  }

  // 4b. Fitness function validation (GFB-01 Task 1 — R2)
  // EXECUTE phase: failing fitness dimensions become quality warnings (overridable)
  // PLAN phase: missing fitness dimensions become informational warnings
  const FITNESS_PHASE_POLICY: Record<string, 'WARN' | 'BLOCK'> = {
    'EXECUTE': 'WARN',
  };
  const fitnessPolicy = FITNESS_PHASE_POLICY[currentPhase];
  if (fitnessPolicy) {
    try {
      const fitnessResult = await c.env.DB.prepare(
        `SELECT dimension, metric_name, target_value, current_value, status
         FROM fitness_functions WHERE project_id = ?`
      ).bind(projectId).all();
      const fitnessFunctions = fitnessResult?.results || [];

      if (fitnessFunctions.length > 0) {
        const failing = fitnessFunctions.filter((ff: Record<string, unknown>) => ff.status === 'FAILING');
        if (failing.length > 0) {
          for (const ff of failing) {
            const ffr = ff as Record<string, unknown>;
            warnChecks.push({
              check: `fitness_${(ffr.dimension as string || 'unknown').toLowerCase()}`,
              passed: false,
              detail: `${ffr.metric_name}: current ${ffr.current_value || '?'} / target ${ffr.target_value} — FAILING`,
            });
          }
        }
      }
    } catch (e) { log.warn('fitness_functions_query_failed', { error: e instanceof Error ? e.message : String(e) }); }
  }

  const failedArtifacts = artifactChecks.filter(a => !a.passed);
  const allGatesPassed = missingGates.length === 0;
  const allArtifactsPassed = failedArtifacts.length === 0;
  const hasWarnings = warnChecks.length > 0;

  // Determine next phase
  const PHASE_NEXT: Record<string, string | null> = {
    'BRAINSTORM': 'PLAN', 'PLAN': 'EXECUTE', 'EXECUTE': 'REVIEW', 'REVIEW': null,
  };
  const nextPhase = PHASE_NEXT[currentPhase];
  const now = new Date().toISOString();

  // Three-way decision:
  // 1. REJECTED — BLOCK checks or gate checks fail (hard stop)
  // 2. WARNINGS — BLOCKs pass but WARN checks fail, no override provided (soft stop)
  // 3. APPROVED — all pass, or warnings overridden with reason
  const canFinalize = allGatesPassed && allArtifactsPassed;
  const warningsOverridden = hasWarnings && body.override_warnings && body.override_reason?.trim();

  // 5. Log to decision ledger (regardless of success/failure)
  await c.env.DB.prepare(
    `INSERT INTO decision_ledger (project_id, action, phase_from, phase_to, actor_id, actor_role, gate_snapshot, artifact_check, result, reason, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    projectId,
    'FINALIZE_PHASE',
    currentPhase,
    canFinalize ? (nextPhase || currentPhase) : currentPhase,
    userId,
    'DIRECTOR',
    JSON.stringify({ missing: missingGates, total_gates: exitReq?.gates.length || 0 }),
    JSON.stringify(artifactChecks),
    canFinalize ? 'APPROVED' : 'REJECTED',
    canFinalize
      ? `Phase ${currentPhase} finalized successfully`
      : `Blocked: ${missingGates.length} missing gate(s), ${failedArtifacts.length} failed artifact check(s)`,
    now,
  ).run();

  // If BLOCK-level checks fail, return hard rejection
  if (!canFinalize) {
    const rejectionMessage = `Cannot finalize ${currentPhase}: ${missingGates.length > 0 ? `${missingGates.length} exit gate(s) unsatisfied` : ''}${missingGates.length > 0 && failedArtifacts.length > 0 ? ', ' : ''}${failedArtifacts.length > 0 ? `${failedArtifacts.length} artifact check(s) failed` : ''}`;
    return c.json({
      success: false,
      result: 'REJECTED',
      error: rejectionMessage,
      phase: currentPhase,
      missing_gates: missingGates,
      artifact_checks: artifactChecks,
      warnings: warnChecks,
      message: rejectionMessage,
    }, 422);
  }

  // If warnings exist and no override provided, return soft stop for Director confirmation
  if (hasWarnings && !warningsOverridden) {
    return c.json({
      success: false,
      result: 'WARNINGS',
      phase: currentPhase,
      can_finalize: true,
      warnings: warnChecks,
      artifact_checks: artifactChecks,
      message: `Phase ${currentPhase} has ${warnChecks.length} quality warning(s). Override with reason to proceed.`,
    }, 200);
  }

  // If warnings overridden, log the quality override to decision_ledger
  if (warningsOverridden) {
    await c.env.DB.prepare(
      `INSERT INTO decision_ledger (project_id, action, phase_from, phase_to, actor_id, actor_role, gate_snapshot, artifact_check, result, reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      projectId,
      'QUALITY_OVERRIDE',
      currentPhase,
      nextPhase || currentPhase,
      userId,
      'DIRECTOR',
      JSON.stringify({ overridden_warnings: warnChecks.map(w => w.check) }),
      JSON.stringify(warnChecks),
      'APPROVED',
      body.override_reason!.trim(),
      now,
    ).run();
  }

  // 6. Advance to next phase (or mark REVIEW as complete)
  if (nextPhase) {
    await c.env.DB.prepare(
      'UPDATE project_state SET phase = ?, phase_locked = 0, updated_at = ? WHERE project_id = ?'
    ).bind(nextPhase, now, projectId).run();
  } else {
    // REVIEW is terminal — mark locked but don't change phase
    await c.env.DB.prepare(
      'UPDATE project_state SET phase_locked = 1, updated_at = ? WHERE project_id = ?'
    ).bind(now, projectId).run();
  }

  // ── CRIT-03 Fix: Auto-generate task assignments on PLAN → EXECUTE ──
  if (currentPhase === 'PLAN') {
    try {
      const assignableDeliverables = await c.env.DB.prepare(
        `SELECT d.id, d.status
         FROM blueprint_deliverables d
         JOIN blueprint_scopes s ON d.scope_id = s.id
         WHERE s.project_id = ? AND d.status IN ('DRAFT', 'READY')`
      ).bind(projectId).all<{ id: string; status: string }>();

      if (assignableDeliverables.results?.length) {
        let assignedCount = 0;
        for (const del of assignableDeliverables.results) {
          // Skip if already has an active assignment
          const existing = await c.env.DB.prepare(
            `SELECT id FROM task_assignments WHERE deliverable_id = ? AND project_id = ? AND status NOT IN ('ACCEPTED', 'PAUSED')`
          ).bind(del.id, projectId).first();
          if (existing) continue;

          await c.env.DB.prepare(
            `INSERT INTO task_assignments
             (id, project_id, deliverable_id, session_id, priority, status, authority_scope, escalation_triggers, assigned_by, assigned_at, updated_at)
             VALUES (?, ?, ?, NULL, 'P1', 'ASSIGNED', '[]', '[]', ?, ?, ?)`
          ).bind(crypto.randomUUID(), projectId, del.id, userId, now, now).run();

          // Transition deliverable to IN_PROGRESS
          if (['DRAFT', 'READY'].includes(del.status)) {
            await c.env.DB.prepare(
              "UPDATE blueprint_deliverables SET status = 'IN_PROGRESS', updated_at = ? WHERE id = ?"
            ).bind(now, del.id).run();
          }
          assignedCount++;
        }

        if (assignedCount > 0) {
          await c.env.DB.prepare(
            `INSERT INTO decision_ledger (project_id, action, phase_from, phase_to, actor_id, actor_role, result, reason, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            projectId, 'AUTO_TASK_ASSIGN', currentPhase, nextPhase || currentPhase,
            userId, 'SYSTEM', 'LOGGED',
            `Auto-assigned ${assignedCount} deliverable(s) on PLAN → EXECUTE finalization`,
            now
          ).run();
        }
        log.info('auto_assign_on_finalize', { project_id: projectId, assigned: assignedCount });
      }
    } catch (err) {
      log.warn('auto_assign_failed', { project_id: projectId, error: err instanceof Error ? err.message : String(err) });
    }
  }

  // ── Auto-log phase transition to decision_ledger ──
  try {
    await c.env.DB.prepare(
      `INSERT INTO decision_ledger (project_id, action, phase_from, phase_to, actor_id, actor_role, gate_snapshot, result, reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      projectId, 'PHASE_FINALIZE', currentPhase, nextPhase || currentPhase,
      userId, 'DIRECTOR',
      JSON.stringify({ missing: missingGates, warnings: warnChecks.length }),
      'APPROVED',
      `Finalized ${currentPhase} → ${nextPhase || 'COMPLETE'}`,
      now
    ).run();
  } catch (err) {
    log.warn('phase_decision_log_failed', { project_id: projectId, error: err instanceof Error ? err.message : String(err) });
  }

  // 7. Artifact state transitions (GFB-01 Task 2)
  // On BRAINSTORM finalize: DRAFT → ACTIVE (artifact becomes governing)
  if (currentPhase === 'BRAINSTORM') {
    try {
      await c.env.DB.prepare(
        `UPDATE brainstorm_artifacts SET status = 'ACTIVE', updated_at = ?
         WHERE project_id = ? AND status = 'DRAFT'`
      ).bind(now, projectId).run();
    } catch (e) { log.warn('artifact_state_update_failed', { error: e instanceof Error ? e.message : String(e) }); }
  }
  // On REVIEW finalize (terminal): ACTIVE → FROZEN (artifact locked)
  if (currentPhase === 'REVIEW') {
    try {
      await c.env.DB.prepare(
        `UPDATE brainstorm_artifacts SET status = 'FROZEN', updated_at = ?
         WHERE project_id = ? AND status = 'ACTIVE'`
      ).bind(now, projectId).run();
    } catch (err) {
      log.warn('brainstorm_freeze_failed', { project_id: projectId, error: err instanceof Error ? err.message : String(err) });
    }
  }

  // ── Mathematical Governance: Post-Finalization WU Operations ──

  // On EXECUTE finalize: Auto-transfer WU for all qualifying scopes
  if (currentPhase === 'EXECUTE') {
    try {
      const readiness = await computeProjectReadiness(c.env.DB, projectId);
      for (const scope of readiness.scopes) {
        if (scope.R > 0 && scope.allocated_wu > 0) {
          await transferWorkUnits(c.env.DB, projectId, scope.scope_id, userId).catch((err: unknown) => {
            log.warn('wu_transfer_failed', { project_id: projectId, scope_id: scope.scope_id, error: err instanceof Error ? err.message : String(err) });
          });
        }
      }
    } catch (err) {
      log.warn('wu_batch_transfer_failed', { project_id: projectId, phase: currentPhase, error: err instanceof Error ? err.message : String(err) });
    }
  }

  // On REVIEW finalize: Lock scopes with R=1.0 and create final reconciliation snapshot
  if (currentPhase === 'REVIEW') {
    try {
      const readiness = await computeProjectReadiness(c.env.DB, projectId);
      // Lock high-readiness scopes
      for (const scope of readiness.scopes) {
        if (scope.R >= 1.0) {
          await c.env.DB.prepare(
            "UPDATE blueprint_scopes SET status = 'LOCKED' WHERE id = ? AND project_id = ?"
          ).bind(scope.scope_id, projectId).run();
        }
      }
      // Log final reconciliation snapshot
      const finalRecon = await computeReconciliation(c.env.DB, projectId);
      await c.env.DB.prepare(
        `INSERT INTO wu_audit_log
         (project_id, event_type, wu_amount, snapshot_total, snapshot_formula, snapshot_verified, conservation_valid, actor_id, notes, created_at)
         VALUES (?, 'CONSERVATION_CHECK', 0, ?, ?, ?, ?, ?, 'REVIEW finalization — final reconciliation snapshot', ?)`
      ).bind(
        projectId,
        finalRecon.conservation.total, finalRecon.conservation.formula, finalRecon.conservation.verified,
        finalRecon.conservation.valid ? 1 : 0, userId, now
      ).run();
    } catch (e) { log.warn('conservation_validation_failed', { error: e instanceof Error ? e.message : String(e) }); }
  }

  // ── HIGH-02 Fix: Check security classification and build warnings ──
  const warnings: string[] = [];
  try {
    const classification = await c.env.DB.prepare(
      'SELECT project_id FROM data_classification WHERE project_id = ?'
    ).bind(projectId).first();
    if (!classification) {
      warnings.push('Security classification not set. Project defaults to maximum restriction (L-SPG4). Classify your project data to unlock AI features.');
    }
  } catch {
    // Non-blocking — just skip warning
  }

  // ── HIGH-06 Fix: Check deliverable completion on EXECUTE finalize ──
  if (currentPhase === 'EXECUTE') {
    try {
      const totalDels = await c.env.DB.prepare(
        `SELECT COUNT(*) as total FROM blueprint_deliverables d
         JOIN blueprint_scopes s ON d.scope_id = s.id
         WHERE s.project_id = ?`
      ).bind(projectId).first<{ total: number }>();
      const doneDels = await c.env.DB.prepare(
        `SELECT COUNT(*) as done FROM blueprint_deliverables d
         JOIN blueprint_scopes s ON d.scope_id = s.id
         WHERE s.project_id = ? AND d.status IN ('DONE', 'VERIFIED', 'LOCKED')`
      ).bind(projectId).first<{ done: number }>();
      const total = totalDels?.total || 0;
      const done = doneDels?.done || 0;
      if (total > 0 && done < total) {
        warnings.push(`${done} of ${total} deliverables complete. ${total - done} deliverable(s) not yet finished.`);
      }
    } catch {
      // Non-blocking
    }
  }

  return c.json({
    success: true,
    result: 'APPROVED',
    phase_from: currentPhase,
    phase_to: nextPhase || currentPhase,
    artifact_checks: artifactChecks,
    ledger_logged: true,
    warnings: warnings.length > 0 ? warnings : undefined,
    message: nextPhase
      ? `Phase ${currentPhase} finalized. Advanced to ${nextPhase}.`
      : `Phase ${currentPhase} finalized. Project complete.`,
  });

  } catch (err) {
    // ROOT-CAUSE-FIX: Capture detailed error context for debugging.
    // Previously, uncaught exceptions here produced a generic "Internal server error"
    // via app.onError with no way to diagnose the failure remotely.
    const errMsg = err instanceof Error ? err.message : String(err);
    const errStack = err instanceof Error ? err.stack?.split('\n').slice(0, 5).join(' | ') : undefined;
    log.error('finalize_error', { project_id: projectId, phase: requestedPhase, error: errMsg, stack: errStack });
    return c.json({
      error: 'Phase finalization failed',
      detail: errMsg,
      phase: requestedPhase,
      projectId,
    }, 500);
  }
});

/**
 * POST /api/v1/state/:projectId/gates/evaluate
 *
 * AI-Governance Integration — Phase 2: Auto-Satisfaction Rules Engine
 * Re-evaluates all gate preconditions and auto-flips satisfied gates.
 * Uses declarative rules from services/gateRules.ts.
 * Idempotent: calling twice with no data changes produces zero writes.
 *
 * Now evaluates ALL gate rules including:
 *   - GA:LIC, GA:DIS, GA:TIR (Brainstorm exit)
 *   - GA:ENV, GA:FLD, GA:BP, GA:IVL (Plan exit)
 */
state.post('/:projectId/gates/evaluate', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  try {
    const result = await evaluateAllGates(c.env.DB, projectId, userId);
    return c.json(result);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    log.error('gate_evaluate_error', { project_id: projectId });
    return c.json({ error: 'Gate evaluation failed' }, 500);
  }
});

export default state;
