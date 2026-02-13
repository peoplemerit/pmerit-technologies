/**
 * Readiness Scoring Engine — Mathematical Governance
 *
 * Implements the R = L × P × V readiness formula:
 *   L = Logic Score (0–1): Blueprint quality
 *   P = Procedural Score (0–1): Execution progress
 *   V = Validation Score (0–1): DMAIC-based verification
 *
 * Also implements:
 *   - WU Conservation: EXECUTION_TOTAL = FORMULA_EXECUTION + VERIFIED_REALITY
 *   - WU Transfer: wu_transferred = allocated_wu × R
 *   - Reconciliation Triad: PLANNED vs CLAIMED vs VERIFIED
 */

// ─── DMAIC Phase → V Score Mapping ──────────────────────────────────

const DMAIC_V_MAP: Record<string, number> = {
  'DEFINE':  0.2,
  'MEASURE': 0.4,
  'ANALYZE': 0.6,
  'IMPROVE': 0.8,
  'CONTROL': 1.0,
};

// ─── Types ──────────────────────────────────────────────────────────

export interface ScopeReadiness {
  scope_id: string;
  scope_name: string;
  L: number;
  P: number;
  V: number;
  R: number;
  allocated_wu: number;
  verified_wu: number;
  deliverable_count: number;
  deliverables_done: number;
  dmaic_breakdown: Record<string, number>;
}

export interface ProjectReadiness {
  project_id: string;
  scopes: ScopeReadiness[];
  project_R: number;          // Weighted average R across scopes
  conservation: ConservationSnapshot;
}

export interface ConservationSnapshot {
  total: number;
  formula: number;
  verified: number;
  delta: number;
  valid: boolean;             // |delta| < 0.01
}

export interface TransferResult {
  scope_id: string;
  R: number;
  wu_transferred: number;
  new_verified_wu: number;
  conservation: ConservationSnapshot;
}

export interface ReconciliationEntry {
  scope_id: string;
  scope_name: string;
  planned_wu: number;
  claimed_wu: number;
  verified_wu: number;
  delta: number;
  divergence_pct: number;
  requires_attention: boolean;
}

export interface ReconciliationResult {
  project_id: string;
  entries: ReconciliationEntry[];
  has_divergences: boolean;
  max_divergence_pct: number;
  conservation: ConservationSnapshot;
}

// ─── Core Functions ─────────────────────────────────────────────────

/**
 * Compute readiness for a single scope.
 *
 * L (Logic): Blueprint quality
 *   - Scope has purpose + boundary → 0.5 base
 *   - All deliverables have DoD (evidence_spec + verification_method) → +0.25
 *   - Latest integrity validation passes → +0.25
 *
 * P (Procedural): Execution progress
 *   - Ratio of deliverables in DONE/VERIFIED/LOCKED state to total
 *
 * V (Validation): DMAIC-based verification
 *   - Average of DMAIC V-scores across deliverables in this scope
 *
 * R = L × P × V (weakest-link multiplication)
 */
export async function computeScopeReadiness(
  db: D1Database,
  projectId: string,
  scopeId: string
): Promise<ScopeReadiness> {
  // Get scope details
  const scope = await db.prepare(
    'SELECT id, name, purpose, boundary, allocated_wu, verified_wu FROM blueprint_scopes WHERE id = ? AND project_id = ?'
  ).bind(scopeId, projectId).first<{
    id: string; name: string; purpose: string | null; boundary: string | null;
    allocated_wu: number; verified_wu: number;
  }>();

  if (!scope) {
    return {
      scope_id: scopeId, scope_name: 'Unknown', L: 0, P: 0, V: 0, R: 0,
      allocated_wu: 0, verified_wu: 0, deliverable_count: 0, deliverables_done: 0,
      dmaic_breakdown: {},
    };
  }

  // Get deliverables for this scope
  const delResult = await db.prepare(
    `SELECT id, status, dod_evidence_spec, dod_verification_method, dmaic_phase
     FROM blueprint_deliverables WHERE scope_id = ? AND project_id = ?`
  ).bind(scopeId, projectId).all();

  const deliverables = (delResult.results || []) as Array<{
    id: string; status: string;
    dod_evidence_spec: string | null; dod_verification_method: string | null;
    dmaic_phase: string | null;
  }>;

  // Also get deliverables from child scopes (tier 2)
  const childDelResult = await db.prepare(
    `SELECT bd.id, bd.status, bd.dod_evidence_spec, bd.dod_verification_method, bd.dmaic_phase
     FROM blueprint_deliverables bd
     JOIN blueprint_scopes bs ON bs.id = bd.scope_id
     WHERE bs.parent_scope_id = ? AND bd.project_id = ?`
  ).bind(scopeId, projectId).all();

  const childDeliverables = (childDelResult.results || []) as Array<{
    id: string; status: string;
    dod_evidence_spec: string | null; dod_verification_method: string | null;
    dmaic_phase: string | null;
  }>;

  const allDeliverables = [...deliverables, ...childDeliverables];
  const totalCount = allDeliverables.length;

  // ── L (Logic Score) ──
  let L = 0;
  // Base: scope has purpose AND boundary
  if (scope.purpose && scope.purpose.trim().length > 0 &&
      scope.boundary && scope.boundary.trim().length > 0) {
    L += 0.5;
  } else if (scope.purpose && scope.purpose.trim().length > 0) {
    L += 0.25; // Partial credit for purpose only
  }

  // +0.25 if all deliverables have DoD
  if (totalCount > 0) {
    const withDoD = allDeliverables.filter(d =>
      d.dod_evidence_spec && d.dod_evidence_spec.trim().length > 0 &&
      d.dod_verification_method && d.dod_verification_method.trim().length > 0
    );
    if (withDoD.length === totalCount) {
      L += 0.25;
    } else if (withDoD.length > 0) {
      L += 0.25 * (withDoD.length / totalCount); // Proportional
    }
  }

  // +0.25 if latest integrity validation passes
  const integrityReport = await db.prepare(
    'SELECT all_passed FROM blueprint_integrity_reports WHERE project_id = ? ORDER BY run_at DESC LIMIT 1'
  ).bind(projectId).first<{ all_passed: number }>();

  if (integrityReport?.all_passed) {
    L += 0.25;
  }

  L = Math.min(L, 1.0);

  // ── P (Procedural Score) ──
  let P = 0;
  if (totalCount > 0) {
    const doneStatuses = ['DONE', 'VERIFIED', 'LOCKED'];
    const doneCount = allDeliverables.filter(d => doneStatuses.includes(d.status)).length;
    P = doneCount / totalCount;
  }

  // ── V (Validation Score — DMAIC average) ──
  let V = 0;
  const dmaicBreakdown: Record<string, number> = {};

  if (totalCount > 0) {
    let vSum = 0;
    for (const d of allDeliverables) {
      const phase = d.dmaic_phase || 'DEFINE';
      const vScore = DMAIC_V_MAP[phase] || 0.2;
      vSum += vScore;
      dmaicBreakdown[phase] = (dmaicBreakdown[phase] || 0) + 1;
    }
    V = vSum / totalCount;
  }

  // ── R = L × P × V ──
  const R = L * P * V;

  // Persist computed scores to blueprint_scopes
  await db.prepare(
    `UPDATE blueprint_scopes
     SET logic_score = ?, procedural_score = ?, validation_score = ?
     WHERE id = ? AND project_id = ?`
  ).bind(L, P, V, scopeId, projectId).run();

  return {
    scope_id: scopeId,
    scope_name: scope.name,
    L: Math.round(L * 1000) / 1000,
    P: Math.round(P * 1000) / 1000,
    V: Math.round(V * 1000) / 1000,
    R: Math.round(R * 1000) / 1000,
    allocated_wu: scope.allocated_wu || 0,
    verified_wu: scope.verified_wu || 0,
    deliverable_count: totalCount,
    deliverables_done: allDeliverables.filter(d => ['DONE', 'VERIFIED', 'LOCKED'].includes(d.status)).length,
    dmaic_breakdown: dmaicBreakdown,
  };
}

/**
 * Compute readiness for an entire project (all tier-1 scopes).
 * Returns weighted-average R and conservation status.
 */
export async function computeProjectReadiness(
  db: D1Database,
  projectId: string
): Promise<ProjectReadiness> {
  // Get all tier-1 scopes
  const scopeResult = await db.prepare(
    'SELECT id FROM blueprint_scopes WHERE project_id = ? AND tier = 1'
  ).bind(projectId).all();

  const scopeIds = (scopeResult.results || []).map((s: Record<string, unknown>) => s.id as string);

  // Compute readiness for each scope
  const scopes: ScopeReadiness[] = [];
  for (const sid of scopeIds) {
    const sr = await computeScopeReadiness(db, projectId, sid);
    scopes.push(sr);
  }

  // Weighted average R (weighted by allocated_wu, or equal if all zero)
  const totalAllocated = scopes.reduce((sum, s) => sum + s.allocated_wu, 0);
  let projectR = 0;
  if (totalAllocated > 0) {
    projectR = scopes.reduce((sum, s) => sum + s.R * s.allocated_wu, 0) / totalAllocated;
  } else if (scopes.length > 0) {
    projectR = scopes.reduce((sum, s) => sum + s.R, 0) / scopes.length;
  }

  // Conservation check
  const conservation = await getConservationSnapshot(db, projectId);

  return {
    project_id: projectId,
    scopes,
    project_R: Math.round(projectR * 1000) / 1000,
    conservation,
  };
}

/**
 * Get current WU conservation snapshot for a project.
 */
export async function getConservationSnapshot(
  db: D1Database,
  projectId: string
): Promise<ConservationSnapshot> {
  const project = await db.prepare(
    'SELECT execution_total_wu, formula_execution_wu, verified_reality_wu FROM projects WHERE id = ?'
  ).bind(projectId).first<{
    execution_total_wu: number;
    formula_execution_wu: number;
    verified_reality_wu: number;
  }>();

  if (!project) {
    return { total: 0, formula: 0, verified: 0, delta: 0, valid: true };
  }

  const total = project.execution_total_wu || 0;
  const formula = project.formula_execution_wu || 0;
  const verified = project.verified_reality_wu || 0;
  const delta = total - (formula + verified);

  return {
    total,
    formula,
    verified,
    delta: Math.round(delta * 100) / 100,
    valid: Math.abs(delta) < 0.01,
  };
}

/**
 * Transfer work units from FORMULA_EXECUTION to VERIFIED_REALITY for a scope.
 *
 * Formula: wu_transferred = allocated_wu × R
 *
 * Constraints:
 *   - Cannot transfer negative amounts
 *   - Cannot transfer if scope is LOCKED (immutable)
 *   - Cannot transfer more than remaining formula WU
 *   - Conservation must hold after transfer
 */
export async function transferWorkUnits(
  db: D1Database,
  projectId: string,
  scopeId: string,
  actorId: string
): Promise<TransferResult> {
  // Compute current readiness
  const readiness = await computeScopeReadiness(db, projectId, scopeId);

  // Get scope details
  const scope = await db.prepare(
    'SELECT status, allocated_wu, verified_wu FROM blueprint_scopes WHERE id = ? AND project_id = ?'
  ).bind(scopeId, projectId).first<{
    status: string; allocated_wu: number; verified_wu: number;
  }>();

  if (!scope) {
    throw new Error('Scope not found');
  }

  // Immutability check
  if (scope.status === 'LOCKED' || scope.status === 'CANCELLED') {
    throw new Error(`Cannot transfer WU for ${scope.status} scope`);
  }

  // Calculate transfer amount
  const allocatedWU = scope.allocated_wu || 0;
  const currentVerified = scope.verified_wu || 0;
  const wuCandidate = allocatedWU * readiness.R;

  // Only transfer the delta (avoid double-counting)
  const wuToTransfer = Math.max(0, wuCandidate - currentVerified);

  if (wuToTransfer <= 0) {
    const conservation = await getConservationSnapshot(db, projectId);
    return {
      scope_id: scopeId,
      R: readiness.R,
      wu_transferred: 0,
      new_verified_wu: currentVerified,
      conservation,
    };
  }

  // Get current project WU
  const project = await db.prepare(
    'SELECT formula_execution_wu FROM projects WHERE id = ?'
  ).bind(projectId).first<{ formula_execution_wu: number }>();

  const formulaWU = project?.formula_execution_wu || 0;

  // Cannot transfer more than remaining formula WU
  const actualTransfer = Math.min(wuToTransfer, formulaWU);

  if (actualTransfer <= 0) {
    const conservation = await getConservationSnapshot(db, projectId);
    return {
      scope_id: scopeId,
      R: readiness.R,
      wu_transferred: 0,
      new_verified_wu: currentVerified,
      conservation,
    };
  }

  const newVerified = currentVerified + actualTransfer;
  const now = new Date().toISOString();

  // Update scope verified_wu
  await db.prepare(
    'UPDATE blueprint_scopes SET verified_wu = ? WHERE id = ? AND project_id = ?'
  ).bind(newVerified, scopeId, projectId).run();

  // Update project conservation (atomic: move from formula → verified)
  await db.prepare(
    `UPDATE projects
     SET formula_execution_wu = formula_execution_wu - ?,
         verified_reality_wu = verified_reality_wu + ?
     WHERE id = ?`
  ).bind(actualTransfer, actualTransfer, projectId).run();

  // Get final conservation snapshot
  const conservation = await getConservationSnapshot(db, projectId);

  // Log to audit trail
  await db.prepare(
    `INSERT INTO wu_audit_log
     (project_id, scope_id, event_type, wu_amount, readiness_score,
      logic_score, procedural_score, validation_score,
      snapshot_total, snapshot_formula, snapshot_verified, conservation_valid, actor_id, created_at)
     VALUES (?, ?, 'WU_TRANSFERRED', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    projectId, scopeId, actualTransfer, readiness.R,
    readiness.L, readiness.P, readiness.V,
    conservation.total, conservation.formula, conservation.verified,
    conservation.valid ? 1 : 0, actorId, now
  ).run();

  return {
    scope_id: scopeId,
    R: readiness.R,
    wu_transferred: Math.round(actualTransfer * 100) / 100,
    new_verified_wu: Math.round(newVerified * 100) / 100,
    conservation,
  };
}

/**
 * Allocate WU to a scope from the project total.
 * Validates that sum(allocated) <= execution_total.
 */
export async function allocateWorkUnits(
  db: D1Database,
  projectId: string,
  scopeId: string,
  amount: number,
  actorId: string
): Promise<{ success: boolean; error?: string; allocated_wu: number; conservation: ConservationSnapshot }> {
  if (amount < 0) {
    return { success: false, error: 'WU amount must be non-negative', allocated_wu: 0, conservation: await getConservationSnapshot(db, projectId) };
  }

  // Get project total
  const project = await db.prepare(
    'SELECT execution_total_wu FROM projects WHERE id = ?'
  ).bind(projectId).first<{ execution_total_wu: number }>();

  const totalWU = project?.execution_total_wu || 0;

  // Sum current allocations (excluding this scope)
  const sumResult = await db.prepare(
    'SELECT COALESCE(SUM(allocated_wu), 0) as total_allocated FROM blueprint_scopes WHERE project_id = ? AND tier = 1 AND id != ?'
  ).bind(projectId, scopeId).first<{ total_allocated: number }>();

  const currentAllocated = sumResult?.total_allocated || 0;

  if (currentAllocated + amount > totalWU) {
    return {
      success: false,
      error: `WU allocation exceeds project total. Available: ${totalWU - currentAllocated}, Requested: ${amount}`,
      allocated_wu: 0,
      conservation: await getConservationSnapshot(db, projectId),
    };
  }

  // Update scope allocation
  await db.prepare(
    'UPDATE blueprint_scopes SET allocated_wu = ? WHERE id = ? AND project_id = ?'
  ).bind(amount, scopeId, projectId).run();

  const now = new Date().toISOString();
  const conservation = await getConservationSnapshot(db, projectId);

  // Log
  await db.prepare(
    `INSERT INTO wu_audit_log
     (project_id, scope_id, event_type, wu_amount,
      snapshot_total, snapshot_formula, snapshot_verified, conservation_valid, actor_id, created_at)
     VALUES (?, ?, 'WU_ALLOCATED', ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    projectId, scopeId, amount,
    conservation.total, conservation.formula, conservation.verified,
    conservation.valid ? 1 : 0, actorId, now
  ).run();

  return { success: true, allocated_wu: amount, conservation };
}

/**
 * Reconciliation Triad: PLANNED vs CLAIMED vs VERIFIED
 *
 * For each scope:
 *   PLANNED = allocated_wu (what was planned)
 *   CLAIMED = count of deliverables in DONE+ status × scope WU / total deliverables
 *   VERIFIED = verified_wu (what actually passed R-score transfer)
 *
 * Divergences indicate governance issues:
 *   - CLAIMED >> VERIFIED → work claimed done but not verified
 *   - PLANNED >> CLAIMED → scopes falling behind
 */
export async function computeReconciliation(
  db: D1Database,
  projectId: string
): Promise<ReconciliationResult> {
  const scopeResult = await db.prepare(
    'SELECT id, name, allocated_wu, verified_wu FROM blueprint_scopes WHERE project_id = ? AND tier = 1'
  ).bind(projectId).all();

  const scopes = (scopeResult.results || []) as Array<{
    id: string; name: string; allocated_wu: number; verified_wu: number;
  }>;

  const entries: ReconciliationEntry[] = [];
  let maxDivergence = 0;

  for (const scope of scopes) {
    const planned = scope.allocated_wu || 0;
    const verified = scope.verified_wu || 0;

    // CLAIMED: proportional WU based on deliverable completion
    const delStats = await db.prepare(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN status IN ('DONE', 'VERIFIED', 'LOCKED') THEN 1 ELSE 0 END) as done
       FROM blueprint_deliverables WHERE scope_id = ? AND project_id = ?`
    ).bind(scope.id, projectId).first<{ total: number; done: number }>();

    // Also check child scope deliverables
    const childDelStats = await db.prepare(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN bd.status IN ('DONE', 'VERIFIED', 'LOCKED') THEN 1 ELSE 0 END) as done
       FROM blueprint_deliverables bd
       JOIN blueprint_scopes bs ON bs.id = bd.scope_id
       WHERE bs.parent_scope_id = ? AND bd.project_id = ?`
    ).bind(scope.id, projectId).first<{ total: number; done: number }>();

    const totalDels = (delStats?.total || 0) + (childDelStats?.total || 0);
    const doneDels = (delStats?.done || 0) + (childDelStats?.done || 0);

    const claimed = totalDels > 0 ? planned * (doneDels / totalDels) : 0;
    const delta = planned - verified;
    const divergencePct = planned > 0 ? Math.abs(delta) / planned * 100 : 0;
    const requiresAttention = divergencePct > 20;

    if (divergencePct > maxDivergence) {
      maxDivergence = divergencePct;
    }

    entries.push({
      scope_id: scope.id,
      scope_name: scope.name,
      planned_wu: Math.round(planned * 100) / 100,
      claimed_wu: Math.round(claimed * 100) / 100,
      verified_wu: Math.round(verified * 100) / 100,
      delta: Math.round(delta * 100) / 100,
      divergence_pct: Math.round(divergencePct * 10) / 10,
      requires_attention: requiresAttention,
    });
  }

  const conservation = await getConservationSnapshot(db, projectId);

  return {
    project_id: projectId,
    entries,
    has_divergences: entries.some(e => e.requires_attention),
    max_divergence_pct: Math.round(maxDivergence * 10) / 10,
    conservation,
  };
}
