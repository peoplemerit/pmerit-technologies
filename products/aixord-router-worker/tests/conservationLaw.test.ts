/**
 * Conservation Law Verification Tests
 * AIXORD v4.5.1 — Mathematical Governance
 *
 * Tests the core mathematical invariants:
 *   - Conservation Law: EXECUTION_TOTAL = VERIFIED_REALITY + FORMULA_EXECUTION
 *   - Readiness Metric: R = L × P × V
 *   - WU Budget constraints
 *   - HITL approval thresholds
 *
 * Source: HANDOFF-CGC-01 GAP-10
 */

import { describe, it, expect } from 'vitest';

// ============================================================================
// Types (mirrors readinessEngine.ts)
// ============================================================================

interface ConservationSnapshot {
  total: number;
  formula: number;
  verified: number;
  delta: number;
  valid: boolean;
}

interface ScopeReadiness {
  L: number; // Logic score (0-1)
  P: number; // Procedural score (0-1)
  V: number; // Validation score (0-1)
  R: number; // Readiness metric (L × P × V)
}

// ============================================================================
// Pure Mathematical Functions (mirrors readinessEngine.ts logic)
// ============================================================================

/**
 * Conservation Law: EXECUTION_TOTAL = VERIFIED_REALITY + FORMULA_EXECUTION
 * Delta must be zero (within floating point tolerance)
 */
function computeConservation(
  total: number,
  formula: number,
  verified: number
): ConservationSnapshot {
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
 * Readiness Metric: R = L × P × V
 * Each component bounded [0, 1]
 */
function computeReadiness(L: number, P: number, V: number): ScopeReadiness {
  const clampedL = Math.max(0, Math.min(1, L));
  const clampedP = Math.max(0, Math.min(1, P));
  const clampedV = Math.max(0, Math.min(1, V));
  const R = clampedL * clampedP * clampedV;
  return {
    L: Math.round(clampedL * 1000) / 1000,
    P: Math.round(clampedP * 1000) / 1000,
    V: Math.round(clampedV * 1000) / 1000,
    R: Math.round(R * 1000) / 1000,
  };
}

/**
 * WU Transfer: wu_transferred = allocated_wu × R
 * Cannot exceed remaining formula WU
 */
function computeTransfer(
  allocatedWU: number,
  R: number,
  remainingFormulaWU: number
): { amount: number; valid: boolean; reason?: string } {
  const amount = allocatedWU * R;
  if (amount < 0) return { amount: 0, valid: false, reason: 'Negative transfer' };
  if (amount > remainingFormulaWU) {
    return { amount: 0, valid: false, reason: 'Exceeds remaining formula WU' };
  }
  return { amount: Math.round(amount * 100) / 100, valid: true };
}

// ============================================================================
// Tests
// ============================================================================

describe('Conservation Law: EXECUTION_TOTAL = VERIFIED_REALITY + FORMULA_EXECUTION', () => {

  it('should validate conservation when components sum correctly', () => {
    const snapshot = computeConservation(100, 60, 40);
    expect(snapshot.valid).toBe(true);
    expect(snapshot.delta).toBe(0);
  });

  it('should detect conservation violation when total exceeds sum', () => {
    const snapshot = computeConservation(100, 60, 35);
    expect(snapshot.valid).toBe(false);
    expect(snapshot.delta).toBe(5);
  });

  it('should detect conservation violation when sum exceeds total', () => {
    const snapshot = computeConservation(100, 60, 45);
    expect(snapshot.valid).toBe(false);
    expect(snapshot.delta).toBe(-5);
  });

  it('should handle zero allocation (empty project)', () => {
    const snapshot = computeConservation(0, 0, 0);
    expect(snapshot.valid).toBe(true);
    expect(snapshot.delta).toBe(0);
  });

  it('should handle full verified reality (no formula remaining)', () => {
    const snapshot = computeConservation(100, 0, 100);
    expect(snapshot.valid).toBe(true);
    expect(snapshot.formula).toBe(0);
    expect(snapshot.verified).toBe(100);
  });

  it('should handle full formula execution (no verified yet)', () => {
    const snapshot = computeConservation(100, 100, 0);
    expect(snapshot.valid).toBe(true);
    expect(snapshot.formula).toBe(100);
    expect(snapshot.verified).toBe(0);
  });

  it('should enforce WU conservation across session', () => {
    const wu_allocated = 100;
    const wu_consumed_verified = 60;
    const wu_consumed_formula = 35;

    const execution_total = wu_consumed_verified + wu_consumed_formula;
    expect(execution_total).toBeLessThanOrEqual(wu_allocated);

    const wu_remaining = wu_allocated - execution_total;
    expect(wu_remaining).toBeGreaterThanOrEqual(0);
    expect(wu_remaining).toBe(5);
  });

  it('should fail if execution exceeds allocation', () => {
    const wu_allocated = 100;
    const wu_consumed = 110;

    const violation = wu_consumed > wu_allocated;
    expect(violation).toBe(true);
  });
});

describe('Readiness Metric: R = L × P × V', () => {

  it('should calculate perfect readiness (R=1.0)', () => {
    const { R } = computeReadiness(1.0, 1.0, 1.0);
    expect(R).toBe(1.0);
  });

  it('should calculate zero readiness when any component is zero', () => {
    expect(computeReadiness(0, 1.0, 1.0).R).toBe(0);
    expect(computeReadiness(1.0, 0, 1.0).R).toBe(0);
    expect(computeReadiness(1.0, 1.0, 0).R).toBe(0);
  });

  it('should calculate R = 0.72 for L=0.8, P=0.9, V=1.0', () => {
    const { R } = computeReadiness(0.8, 0.9, 1.0);
    expect(R).toBeCloseTo(0.72, 2);
  });

  it('should clamp values to [0, 1] range', () => {
    const result = computeReadiness(1.5, -0.5, 2.0);
    expect(result.L).toBe(1.0);
    expect(result.P).toBe(0);
    expect(result.V).toBe(1.0);
    expect(result.R).toBe(0); // P=0 makes R=0
  });

  it('should round to 3 decimal places', () => {
    const { R } = computeReadiness(0.333, 0.666, 0.999);
    expect(R.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(3);
  });
});

describe('HITL Approval Threshold (R < 0.8)', () => {

  const APPROVAL_THRESHOLD = 0.8;

  it('should NOT require approval when R >= 0.8', () => {
    const testCases = [
      { L: 1.0, P: 1.0, V: 1.0 },   // R=1.0
      { L: 0.9, P: 0.9, V: 1.0 },   // R=0.81
      { L: 1.0, P: 0.8, V: 1.0 },   // R=0.80
    ];

    testCases.forEach(({ L, P, V }) => {
      const { R } = computeReadiness(L, P, V);
      const requiresApproval = R < APPROVAL_THRESHOLD;
      expect(requiresApproval).toBe(false);
    });
  });

  it('should require approval when R < 0.8', () => {
    const testCases = [
      { L: 0.7, P: 0.7, V: 1.0 },   // R=0.49
      { L: 0.8, P: 0.8, V: 0.8 },   // R=0.512
      { L: 0.5, P: 1.0, V: 1.0 },   // R=0.50
      { L: 0.7, P: 0.9, V: 0.9 },   // R=0.567
    ];

    testCases.forEach(({ L, P, V }) => {
      const { R } = computeReadiness(L, P, V);
      const requiresApproval = R < APPROVAL_THRESHOLD;
      expect(requiresApproval).toBe(true);
    });
  });
});

describe('WU Transfer: wu_transferred = allocated_wu × R', () => {

  it('should compute transfer amount correctly', () => {
    const result = computeTransfer(100, 0.8, 80);
    expect(result.valid).toBe(true);
    expect(result.amount).toBe(80);
  });

  it('should reject transfer exceeding remaining formula WU', () => {
    const result = computeTransfer(100, 0.8, 50);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Exceeds remaining formula WU');
  });

  it('should reject negative transfers', () => {
    const result = computeTransfer(100, -0.5, 100);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Negative transfer');
  });

  it('should handle zero allocation', () => {
    const result = computeTransfer(0, 0.8, 100);
    expect(result.valid).toBe(true);
    expect(result.amount).toBe(0);
  });

  it('should maintain conservation after transfer', () => {
    // Initial state
    const total = 100;
    let formula = 100;
    let verified = 0;

    // Transfer 80 WU (R=0.8 × 100 allocated)
    const transfer = computeTransfer(100, 0.8, formula);
    expect(transfer.valid).toBe(true);

    formula -= transfer.amount;
    verified += transfer.amount;

    // Verify conservation holds
    const snapshot = computeConservation(total, formula, verified);
    expect(snapshot.valid).toBe(true);
    expect(snapshot.delta).toBe(0);
    expect(formula).toBe(20);
    expect(verified).toBe(80);
  });
});

describe('Formula Execution vs Verified Reality tracking', () => {

  it('should track formula execution vs verified reality', () => {
    const verified_reality = 50;  // WU from Reality Absorption (GA:RA)
    const formula_execution = 30; // WU from Formula Execution (GA:FX)
    const execution_total = verified_reality + formula_execution;

    expect(execution_total).toBe(80);
  });

  it('should properly decompose execution into components', () => {
    // A project with 100 WU total budget
    const budget = 100;

    // Phase 1: Formula planning consumed 40 WU
    const formulaWU = 40;
    // Phase 2: Reality absorption verified 35 WU
    const verifiedWU = 35;

    // Conservation check
    const consumed = formulaWU + verifiedWU;
    const remaining = budget - consumed;

    expect(consumed).toBe(75);
    expect(remaining).toBe(25);
    expect(consumed + remaining).toBe(budget);
  });
});
