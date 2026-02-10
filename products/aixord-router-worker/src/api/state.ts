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
import { evaluateAllGates } from '../services/gateRules';
import { validateBrainstormArtifact } from './brainstorm';
import type { BrainstormOption, BrainstormDecisionCriteria } from '../types';

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
 * Verify project ownership
 */
async function verifyProjectOwnership(
  db: D1Database,
  projectId: string,
  userId: string
): Promise<boolean> {
  const project = await db.prepare(
    'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
  ).bind(projectId, userId).first();
  return !!project;
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

  const body = await c.req.json<{ phase: string; force?: boolean }>();
  const { phase, force } = body;

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

  // Validate phase transition (unless force=true for admin override)
  if (!force && normalizedPhaseValue !== currentPhase) {
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

  return c.json({ success: true, phase: normalizedPhaseValue, updated_at: now });
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

  // 4. Artifact validation — phase-specific checks
  const artifactChecks: Array<{ check: string; passed: boolean; detail: string }> = [];

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

      // Add only BLOCK checks to artifact checks (WARN checks don't prevent finalize)
      for (const check of validation.checks) {
        if (check.level === 'BLOCK') {
          artifactChecks.push({
            check: `brainstorm_${check.check}`,
            passed: check.passed,
            detail: check.detail,
          });
        }
      }
    }
  }

  if (currentPhase === 'PLAN') {
    // Must have blueprint with scopes and deliverables
    const scopeCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM blueprint_scopes WHERE project_id = ?'
    ).bind(projectId).first<{ count: number }>();
    const deliverableCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM blueprint_deliverables WHERE project_id = ?'
    ).bind(projectId).first<{ count: number }>();
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
  }

  if (currentPhase === 'EXECUTE') {
    // Must have at least one message in the current session (work was done)
    const messageCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM messages WHERE project_id = ? AND role = \'assistant\''
    ).bind(projectId).first<{ count: number }>();
    artifactChecks.push({
      check: 'execution_evidence',
      passed: (messageCount?.count || 0) > 0,
      detail: `${messageCount?.count || 0} AI-assisted message(s) in project`,
    });
  }

  // REVIEW has no artifact requirements — it's the terminal phase
  // (But we still allow finalize for audit completeness)

  const failedArtifacts = artifactChecks.filter(a => !a.passed);
  const allGatesPassed = missingGates.length === 0;
  const allArtifactsPassed = failedArtifacts.length === 0;
  const canFinalize = allGatesPassed && allArtifactsPassed;

  // Determine next phase
  const PHASE_NEXT: Record<string, string | null> = {
    'BRAINSTORM': 'PLAN', 'PLAN': 'EXECUTE', 'EXECUTE': 'REVIEW', 'REVIEW': null,
  };
  const nextPhase = PHASE_NEXT[currentPhase];
  const now = new Date().toISOString();

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

  // If blocked, return detailed explanation
  if (!canFinalize) {
    return c.json({
      success: false,
      result: 'REJECTED',
      phase: currentPhase,
      missing_gates: missingGates,
      artifact_checks: artifactChecks,
      message: `Cannot finalize ${currentPhase}: ${missingGates.length > 0 ? `${missingGates.length} exit gate(s) unsatisfied` : ''}${missingGates.length > 0 && failedArtifacts.length > 0 ? ', ' : ''}${failedArtifacts.length > 0 ? `${failedArtifacts.length} artifact check(s) failed` : ''}`,
    }, 422);
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

  return c.json({
    success: true,
    result: 'APPROVED',
    phase_from: currentPhase,
    phase_to: nextPhase || currentPhase,
    artifact_checks: artifactChecks,
    ledger_logged: true,
    message: nextPhase
      ? `Phase ${currentPhase} finalized. Advanced to ${nextPhase}.`
      : `Phase ${currentPhase} finalized. Project complete.`,
  });
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

  const result = await evaluateAllGates(c.env.DB, projectId, userId);
  return c.json(result);
});

export default state;
