/**
 * Phase Contract Enforcement Tests
 *
 * Tests AIXORD v4.5.1 governance laws: L-BRN, L-PLN, L-BPX, L-IVL, L-RCD
 * and the validatePhaseTransition orchestrator.
 */

import { describe, it, expect, vi } from 'vitest';
import { createMockDB, type MockQueryResult, makeBrainstormArtifact } from '../helpers';
import {
  enforceL_BRN,
  enforceL_PLN,
  enforceL_BPX,
  enforceL_IVL,
  validatePhaseTransition,
} from '../../src/governance/phaseContracts';

// ============================================================================
// L-BRN: Brainstorm Contract (≥3 options required)
// ============================================================================
describe('enforceL_BRN', () => {
  it('passes when brainstorm has ≥3 options', async () => {
    const options = JSON.stringify([
      { id: '1', title: 'A' },
      { id: '2', title: 'B' },
      { id: '3', title: 'C' },
    ]);
    const db = createMockDB([
      { pattern: 'SELECT options FROM brainstorm_artifacts', result: { options } },
    ]) as unknown as D1Database;

    const violations = await enforceL_BRN(db, 'proj-1');
    expect(violations).toEqual([]);
  });

  it('blocks when no brainstorm artifact exists', async () => {
    const db = createMockDB([
      { pattern: 'SELECT options FROM brainstorm_artifacts', result: null },
    ]) as unknown as D1Database;

    const violations = await enforceL_BRN(db, 'proj-1');
    expect(violations).toHaveLength(1);
    expect(violations[0].law).toBe('L-BRN');
    expect(violations[0].severity).toBe('BLOCKING');
    expect(violations[0].description).toContain('No brainstorm artifact');
  });

  it('blocks when fewer than 3 options', async () => {
    const options = JSON.stringify([{ id: '1', title: 'A' }, { id: '2', title: 'B' }]);
    const db = createMockDB([
      { pattern: 'SELECT options FROM brainstorm_artifacts', result: { options } },
    ]) as unknown as D1Database;

    const violations = await enforceL_BRN(db, 'proj-1');
    expect(violations).toHaveLength(1);
    expect(violations[0].law).toBe('L-BRN');
    expect(violations[0].severity).toBe('BLOCKING');
    expect(violations[0].description).toContain('2 options');
  });

  it('blocks when options field is malformed JSON', async () => {
    const db = createMockDB([
      { pattern: 'SELECT options FROM brainstorm_artifacts', result: { options: 'not-json{' } },
    ]) as unknown as D1Database;

    const violations = await enforceL_BRN(db, 'proj-1');
    expect(violations).toHaveLength(1);
    expect(violations[0].description).toContain('malformed JSON');
  });

  it('blocks when options is empty array', async () => {
    const db = createMockDB([
      { pattern: 'SELECT options FROM brainstorm_artifacts', result: { options: '[]' } },
    ]) as unknown as D1Database;

    const violations = await enforceL_BRN(db, 'proj-1');
    expect(violations).toHaveLength(1);
    expect(violations[0].description).toContain('0 options');
  });
});

// ============================================================================
// L-PLN: Planning Contract (scopes + deliverables required)
// ============================================================================
describe('enforceL_PLN', () => {
  it('passes when scopes and deliverables exist', async () => {
    const db = createMockDB([
      { pattern: 'SELECT id, name FROM blueprint_scopes', result: [{ id: 's1', name: 'Scope 1' }] },
      { pattern: 'SELECT COUNT', result: { count: 5 } },
    ]) as unknown as D1Database;

    const violations = await enforceL_PLN(db, 'proj-1');
    expect(violations).toEqual([]);
  });

  it('blocks when no scopes defined', async () => {
    const db = createMockDB([
      { pattern: 'SELECT id, name FROM blueprint_scopes', result: [] },
    ]) as unknown as D1Database;

    const violations = await enforceL_PLN(db, 'proj-1');
    expect(violations).toHaveLength(1);
    expect(violations[0].law).toBe('L-PLN');
    expect(violations[0].severity).toBe('BLOCKING');
    expect(violations[0].description).toContain('No blueprint scopes');
  });

  it('blocks when scopes exist but no deliverables', async () => {
    const db = createMockDB([
      { pattern: 'SELECT id, name FROM blueprint_scopes', result: [{ id: 's1', name: 'Scope 1' }] },
      { pattern: 'SELECT COUNT', result: { count: 0 } },
    ]) as unknown as D1Database;

    const violations = await enforceL_PLN(db, 'proj-1');
    expect(violations).toHaveLength(1);
    expect(violations[0].law).toBe('L-PLN');
    expect(violations[0].description).toContain('No deliverables');
  });
});

// ============================================================================
// L-BPX: Blueprint Execution (all deliverables complete)
// ============================================================================
describe('enforceL_BPX', () => {
  it('passes when all deliverables are DONE/VERIFIED/LOCKED', async () => {
    const db = createMockDB([
      { pattern: 'SELECT', result: { total: 5, completed: 5 } },
    ]) as unknown as D1Database;

    const violations = await enforceL_BPX(db, 'proj-1');
    expect(violations).toEqual([]);
  });

  it('blocks when some deliverables are incomplete', async () => {
    const db = createMockDB([
      { pattern: 'SELECT', result: { total: 5, completed: 3 } },
    ]) as unknown as D1Database;

    const violations = await enforceL_BPX(db, 'proj-1');
    expect(violations).toHaveLength(1);
    expect(violations[0].law).toBe('L-BPX');
    expect(violations[0].severity).toBe('BLOCKING');
    expect(violations[0].description).toContain('2 of 5');
  });

  it('returns WARNING (not BLOCKING) when no deliverables exist', async () => {
    const db = createMockDB([
      { pattern: 'SELECT', result: { total: 0, completed: 0 } },
    ]) as unknown as D1Database;

    const violations = await enforceL_BPX(db, 'proj-1');
    expect(violations).toHaveLength(1);
    expect(violations[0].severity).toBe('WARNING');
  });
});

// ============================================================================
// L-IVL: Integration Validation (tests must pass)
// ============================================================================
describe('enforceL_IVL', () => {
  it('passes when all integrity checks pass', async () => {
    const db = createMockDB([
      { pattern: 'SELECT all_passed', result: { all_passed: 1, total_checks: 10, passed_checks: 10 } },
    ]) as unknown as D1Database;

    const violations = await enforceL_IVL(db, 'proj-1');
    expect(violations).toEqual([]);
  });

  it('blocks when integrity checks fail', async () => {
    const db = createMockDB([
      { pattern: 'SELECT all_passed', result: { all_passed: 0, total_checks: 10, passed_checks: 7 } },
    ]) as unknown as D1Database;

    const violations = await enforceL_IVL(db, 'proj-1');
    expect(violations).toHaveLength(1);
    expect(violations[0].law).toBe('L-IVL');
    expect(violations[0].severity).toBe('BLOCKING');
    expect(violations[0].description).toContain('7/10');
  });

  it('returns WARNING when no integrity report exists', async () => {
    const db = createMockDB([
      { pattern: 'SELECT all_passed', result: null },
    ]) as unknown as D1Database;

    const violations = await enforceL_IVL(db, 'proj-1');
    expect(violations).toHaveLength(1);
    expect(violations[0].severity).toBe('WARNING');
    expect(violations[0].description).toContain('No integrity report');
  });
});

// ============================================================================
// validatePhaseTransition — Orchestrator
// ============================================================================
describe('validatePhaseTransition', () => {
  it('BRAINSTORM → PLAN checks L-BRN (blocks on < 3 options)', async () => {
    const db = createMockDB([
      // L-BRN check: only 2 options
      { pattern: 'SELECT options FROM brainstorm_artifacts', result: { options: '[{"id":"1"},{"id":"2"}]' } },
    ]) as unknown as D1Database;

    const result = await validatePhaseTransition(db, 'proj-1', 'BRAINSTORM', 'PLAN');
    expect(result.allowed).toBe(false);
    expect(result.violations.some(v => v.law === 'L-BRN')).toBe(true);
  });

  it('BRAINSTORM → PLAN passes with ≥3 options', async () => {
    const db = createMockDB([
      { pattern: 'SELECT options FROM brainstorm_artifacts', result: { options: '[{"id":"1"},{"id":"2"},{"id":"3"}]' } },
    ]) as unknown as D1Database;

    const result = await validatePhaseTransition(db, 'proj-1', 'BRAINSTORM', 'PLAN');
    expect(result.allowed).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it('PLAN → BLUEPRINT checks L-PLN', async () => {
    const db = createMockDB([
      // No scopes
      { pattern: 'SELECT id, name FROM blueprint_scopes', result: [] },
    ]) as unknown as D1Database;

    const result = await validatePhaseTransition(db, 'proj-1', 'PLAN', 'BLUEPRINT');
    expect(result.allowed).toBe(false);
    expect(result.violations.some(v => v.law === 'L-PLN')).toBe(true);
  });

  it('EXECUTE → REVIEW checks L-BPX + L-RCD (no root causes = passes)', async () => {
    const db = createMockDB([
      // L-BPX: all deliverables complete
      { pattern: 'SUM(CASE WHEN status', result: { total: 3, completed: 3 } },
      // R-TOLLGATE: no scopes with WU (skip R check)
      { pattern: 'blueprint_scopes', result: [] },
      // L-RCD: no recurring root causes
      { pattern: 'root_cause_registry', result: [] },
    ]) as unknown as D1Database;

    const result = await validatePhaseTransition(db, 'proj-1', 'EXECUTE', 'REVIEW');
    expect(result.allowed).toBe(true);
  });

  it('allowed is true when only WARNING violations exist (no BLOCKING)', async () => {
    const db = createMockDB([
      // L-BPX: no deliverables → WARNING
      { pattern: 'SUM(CASE WHEN status', result: { total: 0, completed: 0 } },
      // R-TOLLGATE: no scopes
      { pattern: 'blueprint_scopes', result: [] },
      // L-RCD: no root causes
      { pattern: 'root_cause_registry', result: [] },
    ]) as unknown as D1Database;

    const result = await validatePhaseTransition(db, 'proj-1', 'EXECUTE', 'REVIEW');
    // WARNING violations exist but allowed is true (only BLOCKING prevents)
    expect(result.allowed).toBe(true);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations.every(v => v.severity === 'WARNING')).toBe(true);
  });
});
