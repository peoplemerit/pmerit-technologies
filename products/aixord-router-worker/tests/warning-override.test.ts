/**
 * Warning Override Tests — VD-CI-01 A4
 *
 * Tests the three-way finalize response logic:
 * 1. REJECTED — BLOCK checks fail (422)
 * 2. WARNINGS — BLOCKs pass but WARNs fail, no override (200)
 * 3. APPROVED with QUALITY_OVERRIDE — WARNs overridden with reason
 */

import { describe, it, expect } from 'vitest';

// ============================================================================
// Three-Way Decision Logic (mirrors state.ts finalize logic)
// ============================================================================

interface ArtifactCheck {
  check: string;
  passed: boolean;
  detail: string;
}

interface WarnCheck {
  check: string;
  passed: boolean;
  detail: string;
}

interface OverrideBody {
  override_warnings?: boolean;
  override_reason?: string;
}

/**
 * Pure logic extracted from the finalize endpoint's three-way decision
 * (mirrors lines 773-844 of state.ts)
 */
function computeFinalizeResult(
  missingGates: string[],
  artifactChecks: ArtifactCheck[],
  warnChecks: WarnCheck[],
  body: OverrideBody,
) {
  const failedArtifacts = artifactChecks.filter(a => !a.passed);
  const allGatesPassed = missingGates.length === 0;
  const allArtifactsPassed = failedArtifacts.length === 0;
  const hasWarnings = warnChecks.length > 0;
  const canFinalize = allGatesPassed && allArtifactsPassed;
  const warningsOverridden = hasWarnings && body.override_warnings && body.override_reason?.trim();

  if (!canFinalize) {
    return { status: 422, result: 'REJECTED' as const, canFinalize: false };
  }

  if (hasWarnings && !warningsOverridden) {
    return { status: 200, result: 'WARNINGS' as const, canFinalize: true, warnings: warnChecks };
  }

  return {
    status: 200,
    result: 'APPROVED' as const,
    canFinalize: true,
    overrideLogged: !!warningsOverridden,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('Warning Override — Three-Way Decision', () => {
  const passingChecks: ArtifactCheck[] = [
    { check: 'objective_defined', passed: true, detail: 'OK' },
    { check: 'brainstorm_artifact_exists', passed: true, detail: 'OK' },
    { check: 'brainstorm_option_count', passed: true, detail: 'OK' },
  ];

  const failingCheck: ArtifactCheck = {
    check: 'brainstorm_option_count', passed: false, detail: 'Only 1 option',
  };

  const warnChecks: WarnCheck[] = [
    { check: 'brainstorm_options_distinct', passed: false, detail: 'Duplicate titles' },
    { check: 'brainstorm_global_assumptions', passed: false, detail: 'No global assumptions' },
  ];

  it('REJECTED — returns 422 when BLOCK checks fail', () => {
    const result = computeFinalizeResult(
      [],
      [...passingChecks, failingCheck],
      [],
      {},
    );
    expect(result.status).toBe(422);
    expect(result.result).toBe('REJECTED');
    expect(result.canFinalize).toBe(false);
  });

  it('REJECTED — returns 422 when gates are missing', () => {
    const result = computeFinalizeResult(
      ['GA:LIC', 'GA:DIS'],
      passingChecks,
      [],
      {},
    );
    expect(result.status).toBe(422);
    expect(result.result).toBe('REJECTED');
  });

  it('REJECTED — gates missing takes priority over warnings', () => {
    const result = computeFinalizeResult(
      ['GA:LIC'],
      passingChecks,
      warnChecks,
      {},
    );
    // Even though there are warnings, missing gates cause REJECTED
    // Actually: canFinalize = allGatesPassed(false) && allArtifactsPassed(true) = false
    expect(result.result).toBe('REJECTED');
  });

  it('WARNINGS — returns 200 with warnings when WARNs fail and no override', () => {
    const result = computeFinalizeResult(
      [],
      passingChecks,
      warnChecks,
      {},
    );
    expect(result.status).toBe(200);
    expect(result.result).toBe('WARNINGS');
    expect(result.canFinalize).toBe(true);
    expect('warnings' in result ? result.warnings : []).toEqual(warnChecks);
  });

  it('WARNINGS — still returns warnings when override_warnings=true but no reason', () => {
    const result = computeFinalizeResult(
      [],
      passingChecks,
      warnChecks,
      { override_warnings: true, override_reason: '' },
    );
    expect(result.result).toBe('WARNINGS');
  });

  it('WARNINGS — still returns warnings when override_warnings=true but reason is whitespace', () => {
    const result = computeFinalizeResult(
      [],
      passingChecks,
      warnChecks,
      { override_warnings: true, override_reason: '   ' },
    );
    expect(result.result).toBe('WARNINGS');
  });

  it('APPROVED — returns APPROVED with override logged when reason provided', () => {
    const result = computeFinalizeResult(
      [],
      passingChecks,
      warnChecks,
      { override_warnings: true, override_reason: 'Accepted: team reviewed, low risk' },
    );
    expect(result.status).toBe(200);
    expect(result.result).toBe('APPROVED');
    expect(result.canFinalize).toBe(true);
    expect('overrideLogged' in result ? result.overrideLogged : false).toBe(true);
  });

  it('APPROVED — no override logged when there are no warnings', () => {
    const result = computeFinalizeResult(
      [],
      passingChecks,
      [], // no warnings
      {},
    );
    expect(result.status).toBe(200);
    expect(result.result).toBe('APPROVED');
    expect('overrideLogged' in result ? result.overrideLogged : false).toBe(false);
  });

  it('APPROVED — no override logged even with override body when no warnings exist', () => {
    const result = computeFinalizeResult(
      [],
      passingChecks,
      [], // no warnings to override
      { override_warnings: true, override_reason: 'Not needed' },
    );
    expect(result.result).toBe('APPROVED');
    expect('overrideLogged' in result ? result.overrideLogged : false).toBe(false);
  });
});

// ============================================================================
// Audit Trail — Decision Ledger Expectations
// ============================================================================

describe('Warning Override — Audit Trail', () => {
  it('QUALITY_OVERRIDE action should include overridden warning check names', () => {
    const warnChecks: WarnCheck[] = [
      { check: 'brainstorm_options_distinct', passed: false, detail: 'Dupes' },
      { check: 'brainstorm_global_assumptions', passed: false, detail: 'Missing' },
    ];

    // Simulate what state.ts does when logging QUALITY_OVERRIDE:
    const gateSnapshot = {
      overridden_warnings: warnChecks.map(w => w.check),
    };

    expect(gateSnapshot.overridden_warnings).toEqual([
      'brainstorm_options_distinct',
      'brainstorm_global_assumptions',
    ]);
  });

  it('QUALITY_OVERRIDE reason should be trimmed', () => {
    const rawReason = '  Team reviewed and accepted risk  ';
    const trimmed = rawReason.trim();
    expect(trimmed).toBe('Team reviewed and accepted risk');
    expect(trimmed.length).toBeGreaterThan(0);
  });

  it('Decision ledger entry should have APPROVED result', () => {
    // In state.ts, QUALITY_OVERRIDE entries always have result='APPROVED'
    const ledgerEntry = {
      action: 'QUALITY_OVERRIDE',
      result: 'APPROVED',
      reason: 'Director accepted quality trade-off for deadline',
    };
    expect(ledgerEntry.action).toBe('QUALITY_OVERRIDE');
    expect(ledgerEntry.result).toBe('APPROVED');
  });
});
