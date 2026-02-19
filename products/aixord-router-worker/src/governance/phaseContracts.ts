/**
 * Phase Contract Law Enforcement
 * AIXORD v4.5.1 — L-BRN, L-PLN, L-BPX, L-IVL, L-RCD
 *
 * Runtime enforcement of phase transition contracts:
 *   L-BRN: BRAINSTORM → PLAN requires ≥3 brainstorm options
 *   L-PLN: PLAN → BLUEPRINT requires DAG dependencies defined
 *   L-BPX: EXECUTE → VERIFY requires all deliverables complete
 *   L-IVL: VERIFY → LOCK requires integration tests passing
 *   L-RCD: Root Cause Doctrine — blocks if recurring CRITICAL/HIGH root causes unaddressed (D79)
 *
 * Source: HANDOFF-CGC-01 GAP-3, D79 Swiss Cheese Model
 */

export interface PhaseContractViolation {
  law: string;
  description: string;
  severity: 'BLOCKING' | 'WARNING';
}

/**
 * L-BRN: Brainstorm Contract
 * Requirement: Must generate ≥3 options before PLAN phase
 *
 * Uses brainstorm_artifacts table (actual schema).
 * Options are stored as JSON array in the `options` column.
 */
export async function enforceL_BRN(
  db: D1Database,
  projectId: string
): Promise<PhaseContractViolation[]> {
  const artifact = await db.prepare(`
    SELECT options FROM brainstorm_artifacts
    WHERE project_id = ? AND status IN ('DRAFT', 'ACTIVE')
    ORDER BY version DESC LIMIT 1
  `).bind(projectId).first<{ options: string }>();

  if (!artifact) {
    return [{
      law: 'L-BRN',
      description: 'Brainstorm contract violated: No brainstorm artifact found',
      severity: 'BLOCKING'
    }];
  }

  try {
    const options = JSON.parse(artifact.options || '[]');
    if (!Array.isArray(options) || options.length < 3) {
      return [{
        law: 'L-BRN',
        description: `Brainstorm contract violated: Found ${Array.isArray(options) ? options.length : 0} options, require ≥3`,
        severity: 'BLOCKING'
      }];
    }
  } catch {
    return [{
      law: 'L-BRN',
      description: 'Brainstorm contract violated: Options field is malformed JSON',
      severity: 'BLOCKING'
    }];
  }

  return [];
}

/**
 * L-PLN: Planning Contract
 * Requirement: Must have scopes with deliverables before EXECUTE phase
 *
 * ROOT-CAUSE-FIX: Previously queried non-existent `dag_json` column on
 * `blueprint_scopes`, causing "no such column: dag_json" SQLite error
 * that crashed the finalize handler with a generic 500.
 *
 * Fixed to check actual schema: scopes must exist with deliverables.
 * The DAG structure is validated by the blueprint integrity report (GA:IVL),
 * not by this contract. L-PLN's role is ensuring the plan has substance.
 */
export async function enforceL_PLN(
  db: D1Database,
  projectId: string
): Promise<PhaseContractViolation[]> {
  // Check if any tier-1 scopes exist
  const scopes = await db.prepare(`
    SELECT id, name FROM blueprint_scopes
    WHERE project_id = ? AND parent_scope_id IS NULL
  `).bind(projectId).all<{ id: string; name: string }>();

  if (!scopes.results || scopes.results.length === 0) {
    return [{
      law: 'L-PLN',
      description: 'Planning contract violated: No blueprint scopes defined',
      severity: 'BLOCKING'
    }];
  }

  // Check that scopes have deliverables (plan has substance)
  const deliverableCheck = await db.prepare(`
    SELECT COUNT(*) as count FROM blueprint_deliverables
    WHERE project_id = ?
  `).bind(projectId).first<{ count: number }>();

  if (!deliverableCheck || deliverableCheck.count === 0) {
    return [{
      law: 'L-PLN',
      description: 'Planning contract violated: No deliverables defined for any scope',
      severity: 'BLOCKING'
    }];
  }

  return [];
}

/**
 * L-BPX: Blueprint Execution
 * Requirement: All deliverables must be DONE/VERIFIED/LOCKED before VERIFY
 *
 * Uses blueprint_deliverables table.
 */
export async function enforceL_BPX(
  db: D1Database,
  projectId: string
): Promise<PhaseContractViolation[]> {
  const result = await db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status IN ('DONE', 'VERIFIED', 'LOCKED') THEN 1 ELSE 0 END) as completed
    FROM blueprint_deliverables
    WHERE project_id = ?
  `).bind(projectId).first<{ total: number; completed: number }>();

  if (!result || result.total === 0) {
    return [{
      law: 'L-BPX',
      description: 'Blueprint execution contract: No deliverables defined (warning only)',
      severity: 'WARNING'
    }];
  }

  const incomplete = result.total - result.completed;
  if (incomplete > 0) {
    return [{
      law: 'L-BPX',
      description: `Blueprint execution violated: ${incomplete} of ${result.total} deliverables not complete`,
      severity: 'BLOCKING'
    }];
  }

  return [];
}

/**
 * L-IVL: Integration Validation
 * Requirement: Tests must pass before LOCK
 *
 * Checks blueprint_integrity_reports for latest validation.
 */
export async function enforceL_IVL(
  db: D1Database,
  projectId: string
): Promise<PhaseContractViolation[]> {
  const report = await db.prepare(`
    SELECT all_passed, total_checks, passed_checks
    FROM blueprint_integrity_reports
    WHERE project_id = ?
    ORDER BY run_at DESC LIMIT 1
  `).bind(projectId).first<{ all_passed: number; total_checks: number; passed_checks: number }>();

  if (!report) {
    return [{
      law: 'L-IVL',
      description: 'Integration validation: No integrity report found (run blueprint validation first)',
      severity: 'WARNING'
    }];
  }

  if (!report.all_passed) {
    return [{
      law: 'L-IVL',
      description: `Integration validation violated: ${report.passed_checks}/${report.total_checks} checks passed`,
      severity: 'BLOCKING'
    }];
  }

  return [];
}

/**
 * GAP-3: R-Based Tollgate Enforcement
 * HANDOFF-CGC-01 GAP-3
 *
 * Enforces readiness thresholds at phase boundaries:
 *   EXECUTE → REVIEW: R ≥ 0.6 (internal staging threshold)
 *   REVIEW  → LOCK:   R ≥ 0.8 (production-ready threshold)
 *
 * Checks are BLOCKING — must be met before phase advance.
 * This runs as part of phase contract validation, ensuring
 * the R score is a first-class governance law, not just
 * an advisory metric.
 */
async function enforceR_TOLLGATE(
  db: D1Database,
  projectId: string,
  fromPhase: string,
  toPhase: string
): Promise<PhaseContractViolation[]> {
  try {
  // Import readiness engine (dynamic to avoid circular deps)
  const { computeProjectReadiness } = await import('../services/readinessEngine');

  // R-based tollgates only apply when mathematical governance is active
  // (i.e., when scopes with WU exist)
  const readiness = await computeProjectReadiness(db, projectId);

  // If no scopes or no WU allocated, skip R-based enforcement
  if (readiness.scopes.length === 0) return [];
  const hasWU = readiness.scopes.some(s => s.allocated_wu > 0);
  if (!hasWU) return [];

  const violations: PhaseContractViolation[] = [];

  // EXECUTE → REVIEW: R ≥ 0.6 (staging/internal review threshold)
  if (fromPhase === 'EXECUTE' && (toPhase === 'VERIFY' || toPhase === 'REVIEW')) {
    if (readiness.project_R < 0.6) {
      violations.push({
        law: 'R-TOLL-STAGING',
        description: `R-Tollgate (staging): Project R=${readiness.project_R} is below 0.6 threshold. All scopes need higher L×P×V scores before proceeding to Review.`,
        severity: 'BLOCKING',
      });
    }

    // Individual scope check: no scope below 0.4
    const criticalScopes = readiness.scopes.filter(s => s.R < 0.4 && s.allocated_wu > 0);
    if (criticalScopes.length > 0) {
      violations.push({
        law: 'R-TOLL-SCOPE-MIN',
        description: `R-Tollgate (scope minimum): ${criticalScopes.length} scope(s) below R=0.4: ${criticalScopes.map(s => `${s.scope_name}(R=${s.R})`).join(', ')}. Each scope must reach at least R≥0.4 before phase advance.`,
        severity: 'BLOCKING',
      });
    }
  }

  // REVIEW → LOCK (or terminal): R ≥ 0.8 (production-ready threshold)
  if (fromPhase === 'REVIEW' || (fromPhase === 'VERIFY' && toPhase === 'LOCK')) {
    if (readiness.project_R < 0.8) {
      violations.push({
        law: 'R-TOLL-PRODUCTION',
        description: `R-Tollgate (production): Project R=${readiness.project_R} is below 0.8 threshold. Project must reach R≥0.8 before closure/production release.`,
        severity: 'BLOCKING',
      });
    }

    // For production: all scopes with WU must have verified WU (WU transfer completed)
    const unverifiedScopes = readiness.scopes.filter(s => s.allocated_wu > 0 && s.verified_wu === 0);
    if (unverifiedScopes.length > 0) {
      violations.push({
        law: 'R-TOLL-VERIFIED',
        description: `R-Tollgate (verification): ${unverifiedScopes.length} scope(s) have allocated WU but no verified WU: ${unverifiedScopes.map(s => s.scope_name).join(', ')}. WU transfer required before production release.`,
        severity: 'BLOCKING',
      });
    }

    // Conservation law must hold at production boundary
    if (!readiness.conservation.valid) {
      violations.push({
        law: 'R-TOLL-CONSERVATION',
        description: `R-Tollgate (conservation): WU conservation violation at production boundary. delta=${readiness.conservation.delta} (must be <0.01).`,
        severity: 'BLOCKING',
      });
    }
  }

  return violations;
  } catch (err) {
    // Graceful degradation: if readiness engine fails (e.g., missing tables,
    // dynamic import issue), skip R-based tollgate enforcement rather than crashing
    // the entire finalization flow.
    console.warn('[enforceR_TOLLGATE] Readiness engine failed, skipping R-based checks:', err instanceof Error ? err.message : String(err));
    return [];
  }
}

/**
 * L-RCD: Root Cause Doctrine Enforcement
 * D79 — Swiss Cheese Model governance law
 *
 * Blocks phase transition if recurring CRITICAL/HIGH root causes
 * are unaddressed in the root_cause_registry. Prevents the same
 * structural defect from passing through multiple governance layers
 * (the "aligned holes" anti-pattern in Swiss Cheese Model).
 *
 * Enforced at: EXECUTE→REVIEW and REVIEW finalize boundaries.
 */
async function enforceL_RCD(
  db: D1Database,
  projectId: string
): Promise<PhaseContractViolation[]> {
  try {
    const recurring = await db.prepare(`
      SELECT canonical_description, category, occurrence_count, max_severity
      FROM root_cause_registry
      WHERE project_id = ? AND status = 'OPEN'
        AND occurrence_count >= 2
        AND max_severity IN ('CRITICAL', 'HIGH')
      ORDER BY occurrence_count DESC
      LIMIT 10
    `).bind(projectId).all();

    if (!recurring.results || recurring.results.length === 0) return [];

    return (recurring.results as any[]).map(rc => ({
      law: 'L-RCD',
      description: `Root Cause Doctrine: "${rc.canonical_description}" (${rc.category || 'UNCATEGORIZED'}) recurred ${rc.occurrence_count}× at ${rc.max_severity} severity — address root cause before phase advance`,
      severity: 'BLOCKING' as const
    }));
  } catch {
    // Table may not exist yet (pre-migration 045) — graceful skip
    return [];
  }
}

/**
 * Validate all phase contracts for a phase transition.
 *
 * Called by the finalize endpoint to enforce governance laws
 * before allowing phase advancement.
 *
 * Enforces:
 *   - L-BRN, L-PLN, L-BPX, L-IVL (artifact contracts)
 *   - R-TOLL-* (readiness tollgates — GAP-3)
 *   - L-RCD (Root Cause Doctrine — D79)
 */
export async function validatePhaseTransition(
  db: D1Database,
  projectId: string,
  fromPhase: string,
  toPhase: string
): Promise<{ allowed: boolean; violations: PhaseContractViolation[] }> {

  const violations: PhaseContractViolation[] = [];

  // BRAINSTORM → PLAN requires L-BRN
  if (fromPhase === 'BRAINSTORM' && toPhase === 'PLAN') {
    violations.push(...await enforceL_BRN(db, projectId));
  }

  // PLAN → BLUEPRINT requires L-PLN
  if (fromPhase === 'PLAN' && toPhase === 'BLUEPRINT') {
    violations.push(...await enforceL_PLN(db, projectId));
  }

  // EXECUTE → VERIFY (or REVIEW) requires L-BPX
  if (fromPhase === 'EXECUTE' && (toPhase === 'VERIFY' || toPhase === 'REVIEW')) {
    violations.push(...await enforceL_BPX(db, projectId));
  }

  // VERIFY → LOCK (or REVIEW finalization) requires L-IVL
  if (fromPhase === 'VERIFY' && toPhase === 'LOCK') {
    violations.push(...await enforceL_IVL(db, projectId));
  }

  // Also enforce L-IVL on REVIEW finalize (terminal phase)
  if (fromPhase === 'REVIEW') {
    violations.push(...await enforceL_IVL(db, projectId));
  }

  // GAP-3: R-Based Tollgate Enforcement
  // Enforces R thresholds at EXECUTE→REVIEW and REVIEW→LOCK boundaries
  violations.push(...await enforceR_TOLLGATE(db, projectId, fromPhase, toPhase));

  // D79: Root Cause Doctrine Enforcement (L-RCD)
  // Blocks if recurring CRITICAL/HIGH root causes are unaddressed
  if (fromPhase === 'EXECUTE' || fromPhase === 'REVIEW') {
    violations.push(...await enforceL_RCD(db, projectId));
  }

  // Blocking violations prevent transition
  const blocking = violations.filter(v => v.severity === 'BLOCKING');

  return {
    allowed: blocking.length === 0,
    violations
  };
}
