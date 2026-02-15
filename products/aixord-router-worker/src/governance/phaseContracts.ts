/**
 * Phase Contract Law Enforcement
 * AIXORD v4.5.1 — L-BRN, L-PLN, L-BPX, L-IVL
 *
 * Runtime enforcement of phase transition contracts:
 *   L-BRN: BRAINSTORM → PLAN requires ≥3 brainstorm options
 *   L-PLN: PLAN → BLUEPRINT requires DAG dependencies defined
 *   L-BPX: EXECUTE → VERIFY requires all deliverables complete
 *   L-IVL: VERIFY → LOCK requires integration tests passing
 *
 * Source: HANDOFF-CGC-01 GAP-3
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
 * Requirement: Must include DAG before BLUEPRINT phase
 *
 * Checks blueprint_scopes for DAG dependencies on tier-1 scopes.
 */
export async function enforceL_PLN(
  db: D1Database,
  projectId: string
): Promise<PhaseContractViolation[]> {
  // Check if any tier-1 scopes exist
  const scopes = await db.prepare(`
    SELECT id, name, dag_json FROM blueprint_scopes
    WHERE project_id = ? AND parent_scope_id IS NULL
  `).bind(projectId).all<{ id: string; name: string; dag_json: string | null }>();

  if (!scopes.results || scopes.results.length === 0) {
    return [{
      law: 'L-PLN',
      description: 'Planning contract violated: No blueprint scopes defined',
      severity: 'BLOCKING'
    }];
  }

  // Check that at least one scope has a DAG
  const withDAG = scopes.results.filter(s => {
    if (!s.dag_json) return false;
    try {
      const dag = JSON.parse(s.dag_json);
      return Array.isArray(dag) && dag.length > 0;
    } catch {
      return false;
    }
  });

  if (withDAG.length === 0) {
    return [{
      law: 'L-PLN',
      description: 'Planning contract violated: No scopes have DAG dependencies defined',
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
 * Validate all phase contracts for a phase transition.
 *
 * Called by the finalize endpoint to enforce governance laws
 * before allowing phase advancement.
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

  // Blocking violations prevent transition
  const blocking = violations.filter(v => v.severity === 'BLOCKING');

  return {
    allowed: blocking.length === 0,
    violations
  };
}
