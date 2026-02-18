/**
 * Gate Auto-Satisfaction Rules Engine — Tests
 *
 * Tests the declarative gate rules that auto-flip gates based on D1 state.
 * Covers all 10 gates: GA:LIC, GA:DIS, GA:TIR, GA:ENV, GA:FLD, GA:BP,
 * GA:IVL, GW:PRE, GW:VAL, GW:VER plus evaluateAllGates orchestrator.
 *
 * Source: src/services/gateRules.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockDB, type MockQueryResult } from '../helpers';

// ---------------------------------------------------------------------------
// Mock external dependencies before importing the module under test
// ---------------------------------------------------------------------------

// Mock readinessEngine — GW:PRE, GW:VAL, GW:VER delegate to these
vi.mock('../../src/services/readinessEngine', () => ({
  computeProjectReadiness: vi.fn(),
  getConservationSnapshot: vi.fn(),
  computeReconciliation: vi.fn(),
}));

// Mock logger to silence output during tests
vi.mock('../../src/utils/logger', () => ({
  log: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// Mock readinessEscalation (dynamic import in triggerGateEvaluation)
vi.mock('../../src/services/readinessEscalation', () => ({
  checkReadinessEscalation: vi.fn(),
}));

import {
  GATE_RULES,
  GATE_FAILURE_META,
  evaluateAllGates,
  triggerGateEvaluation,
  type GateEvalContext,
  type GateEvalResult,
} from '../../src/services/gateRules';

import {
  computeProjectReadiness,
  getConservationSnapshot,
  computeReconciliation,
} from '../../src/services/readinessEngine';

// Typed mock references
const mockComputeProjectReadiness = computeProjectReadiness as ReturnType<typeof vi.fn>;
const mockGetConservationSnapshot = getConservationSnapshot as ReturnType<typeof vi.fn>;
const mockComputeReconciliation = computeReconciliation as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PROJECT_ID = 'proj_test_001';
const USER_ID = 'user_test_001';

function makeCtx(queries: MockQueryResult[]): GateEvalContext {
  return {
    db: createMockDB(queries) as unknown as D1Database,
    projectId: PROJECT_ID,
    userId: USER_ID,
  };
}

/** Shorthand to evaluate a single gate rule by ID */
async function evalGate(
  gateId: string,
  queries: MockQueryResult[],
): Promise<GateEvalResult> {
  const rule = GATE_RULES[gateId];
  if (!rule) throw new Error(`Unknown gate: ${gateId}`);
  const ctx = makeCtx(queries);
  return rule.evaluate(ctx);
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// ==========================================================================
// GA:LIC — License Gate
// ==========================================================================

describe('GA:LIC — License gate', () => {
  it('passes when user has a valid subscription tier', async () => {
    const result = await evalGate('GA:LIC', [
      { pattern: 'subscription_tier', result: { subscription_tier: 'TRIAL' } },
    ]);
    expect(result.satisfied).toBe(true);
    expect(result.reason).toContain('TRIAL');
  });

  it('fails when user has no subscription tier', async () => {
    const result = await evalGate('GA:LIC', [
      { pattern: 'subscription_tier', result: { subscription_tier: null } },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toContain('No valid subscription tier');
  });

  it('fails when user row does not exist', async () => {
    const result = await evalGate('GA:LIC', [
      { pattern: 'subscription_tier', result: null },
    ]);
    expect(result.satisfied).toBe(false);
  });
});

// ==========================================================================
// GA:DIS — Disclaimer / Engagement Gate
// ==========================================================================

describe('GA:DIS — Disclaimer gate', () => {
  it('passes when user has sent at least one message', async () => {
    const result = await evalGate('GA:DIS', [
      { pattern: 'FROM messages', result: { cnt: 3 } },
    ]);
    expect(result.satisfied).toBe(true);
    expect(result.reason).toContain('3 message(s)');
  });

  it('fails when no user messages exist', async () => {
    const result = await evalGate('GA:DIS', [
      { pattern: 'FROM messages', result: { cnt: 0 } },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toContain('No user messages');
  });

  it('fails when messages query returns null', async () => {
    const result = await evalGate('GA:DIS', [
      { pattern: 'FROM messages', result: null },
    ]);
    expect(result.satisfied).toBe(false);
  });
});

// ==========================================================================
// GA:TIR — Tier Gate
// ==========================================================================

describe('GA:TIR — Tier gate', () => {
  it('passes with active subscription tier', async () => {
    const result = await evalGate('GA:TIR', [
      { pattern: 'subscription_tier', result: { subscription_tier: 'PLATFORM_PRO' } },
    ]);
    expect(result.satisfied).toBe(true);
    expect(result.reason).toContain('Active tier: PLATFORM_PRO');
  });

  it('fails with no subscription', async () => {
    const result = await evalGate('GA:TIR', [
      { pattern: 'subscription_tier', result: { subscription_tier: null } },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toContain('No active subscription tier');
  });
});

// ==========================================================================
// GA:ENV — Environment / Workspace Binding Gate
// ==========================================================================

describe('GA:ENV — Environment gate', () => {
  it('passes when workspace binding is confirmed', async () => {
    const result = await evalGate('GA:ENV', [
      { pattern: 'binding_confirmed', result: { binding_confirmed: 1 } },
    ]);
    expect(result.satisfied).toBe(true);
    expect(result.reason).toBe('Workspace binding confirmed');
  });

  it('fails when binding_confirmed is 0', async () => {
    const result = await evalGate('GA:ENV', [
      { pattern: 'binding_confirmed', result: { binding_confirmed: 0 } },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toBe('Workspace binding not confirmed');
  });

  it('fails when no workspace binding exists', async () => {
    const result = await evalGate('GA:ENV', [
      { pattern: 'binding_confirmed', result: null },
    ]);
    expect(result.satisfied).toBe(false);
  });
});

// ==========================================================================
// GA:FLD — Folder Gate
// ==========================================================================

describe('GA:FLD — Folder gate', () => {
  it('passes when a folder is linked', async () => {
    const result = await evalGate('GA:FLD', [
      { pattern: 'folder_name', result: { folder_name: 'my-project-folder' } },
    ]);
    expect(result.satisfied).toBe(true);
    expect(result.reason).toContain('Folder linked: my-project-folder');
  });

  it('fails when folder_name is null', async () => {
    const result = await evalGate('GA:FLD', [
      { pattern: 'folder_name', result: { folder_name: null } },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toBe('No folder linked');
  });

  it('fails when no workspace binding row exists', async () => {
    const result = await evalGate('GA:FLD', [
      { pattern: 'folder_name', result: null },
    ]);
    expect(result.satisfied).toBe(false);
  });
});

// ==========================================================================
// GA:BP — Blueprint Gate
// ==========================================================================

describe('GA:BP — Blueprint gate', () => {
  it('passes when scopes + deliverables exist with complete DoDs', async () => {
    const result = await evalGate('GA:BP', [
      { pattern: 'FROM blueprint_scopes', result: { cnt: 2 } },
      { pattern: /FROM blueprint_deliverables WHERE project_id = \? AND \(dod/, result: { cnt: 0 } },
      { pattern: /FROM blueprint_deliverables WHERE project_id = \?$/, result: { cnt: 4 } },
    ]);
    expect(result.satisfied).toBe(true);
    expect(result.reason).toContain('2 scope(s)');
    expect(result.reason).toContain('4 deliverable(s)');
    expect(result.reason).toContain('all DoDs complete');
  });

  it('fails when no scopes exist', async () => {
    const result = await evalGate('GA:BP', [
      { pattern: 'FROM blueprint_scopes', result: { cnt: 0 } },
      { pattern: 'dod_evidence_spec IS NULL', result: { cnt: 0 } },
      { pattern: /FROM blueprint_deliverables WHERE project_id = \?$/, result: { cnt: 0 } },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toBe('No scopes created');
  });

  it('fails when scopes exist but no deliverables', async () => {
    const result = await evalGate('GA:BP', [
      { pattern: 'FROM blueprint_scopes', result: { cnt: 2 } },
      { pattern: 'dod_evidence_spec IS NULL', result: { cnt: 0 } },
      { pattern: /FROM blueprint_deliverables WHERE project_id = \?$/, result: { cnt: 0 } },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toBe('No deliverables created');
  });

  it('fails when deliverables lack DoD evidence spec', async () => {
    const result = await evalGate('GA:BP', [
      { pattern: 'FROM blueprint_scopes', result: { cnt: 1 } },
      { pattern: 'dod_evidence_spec IS NULL', result: { cnt: 3 } },
      { pattern: /FROM blueprint_deliverables WHERE project_id = \?$/, result: { cnt: 5 } },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toContain('3 deliverable(s) missing DoD');
  });

  it('fails when deliverables have empty DoD strings', async () => {
    // The SQL checks for both NULL and empty string ''
    const result = await evalGate('GA:BP', [
      { pattern: 'FROM blueprint_scopes', result: { cnt: 1 } },
      { pattern: 'dod_evidence_spec IS NULL', result: { cnt: 1 } },
      { pattern: /FROM blueprint_deliverables WHERE project_id = \?$/, result: { cnt: 2 } },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toContain('1 deliverable(s) missing DoD');
  });

  it('handles null query results gracefully (defaults to failing)', async () => {
    const result = await evalGate('GA:BP', [
      { pattern: 'FROM blueprint_scopes', result: null },
      { pattern: 'dod_evidence_spec IS NULL', result: null },
      { pattern: /FROM blueprint_deliverables WHERE project_id = \?$/, result: null },
    ]);
    // scopeCount null => cnt defaults to 0 => "No scopes created"
    expect(result.satisfied).toBe(false);
    expect(result.reason).toBe('No scopes created');
  });
});

// ==========================================================================
// GA:IVL — Integrity Validation Layer Gate
// ==========================================================================

describe('GA:IVL — Integrity Validation gate', () => {
  it('passes when latest integrity report has all_passed = 1', async () => {
    const result = await evalGate('GA:IVL', [
      { pattern: 'blueprint_integrity_reports', result: { all_passed: 1 } },
    ]);
    expect(result.satisfied).toBe(true);
    expect(result.reason).toContain('passed all 5 checks');
  });

  it('fails when latest integrity report has all_passed = 0', async () => {
    const result = await evalGate('GA:IVL', [
      { pattern: 'blueprint_integrity_reports', result: { all_passed: 0 } },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toContain('has failures');
  });

  it('fails when no integrity report exists', async () => {
    const result = await evalGate('GA:IVL', [
      { pattern: 'blueprint_integrity_reports', result: null },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toBe('No integrity validation run yet');
  });
});

// ==========================================================================
// GW:PRE — Pre-Execution Gate
// ==========================================================================

describe('GW:PRE — Pre-execution gate', () => {
  it('passes when WU initialized, conservation valid, scopes allocated, layers exist', async () => {
    mockGetConservationSnapshot.mockResolvedValue({
      total: 100, formula: 100, verified: 0, delta: 0, valid: true,
    });

    const result = await evalGate('GW:PRE', [
      { pattern: 'execution_total_wu', result: { execution_total_wu: 100 } },
      // Conservation is mocked via the vi.mock above
      { pattern: /FROM blueprint_scopes WHERE project_id = \? AND tier = 1/, result: { total: 2, allocated: 2 } },
      { pattern: 'FROM execution_layers', result: { cnt: 4 } },
    ]);
    expect(result.satisfied).toBe(true);
    expect(result.reason).toContain('2 scope(s) with WU allocated');
    expect(result.reason).toContain('conservation valid');
    expect(result.reason).toContain('4 execution layer(s)');
  });

  it('fails when WU budget is not initialized (0)', async () => {
    const result = await evalGate('GW:PRE', [
      { pattern: 'execution_total_wu', result: { execution_total_wu: 0 } },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toBe('Project WU budget not initialized');
  });

  it('fails when project row is missing', async () => {
    const result = await evalGate('GW:PRE', [
      { pattern: 'execution_total_wu', result: null },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toBe('Project WU budget not initialized');
  });

  it('fails when conservation is violated', async () => {
    mockGetConservationSnapshot.mockResolvedValue({
      total: 100, formula: 80, verified: 10, delta: 10, valid: false,
    });

    const result = await evalGate('GW:PRE', [
      { pattern: 'execution_total_wu', result: { execution_total_wu: 100 } },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toContain('Conservation violation');
    expect(result.reason).toContain('delta=10');
  });

  it('fails when no scopes are defined', async () => {
    mockGetConservationSnapshot.mockResolvedValue({
      total: 100, formula: 100, verified: 0, delta: 0, valid: true,
    });

    const result = await evalGate('GW:PRE', [
      { pattern: 'execution_total_wu', result: { execution_total_wu: 100 } },
      { pattern: /FROM blueprint_scopes WHERE project_id = \? AND tier = 1/, result: { total: 0, allocated: 0 } },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toBe('No scopes defined');
  });

  it('fails when some scopes lack WU allocation', async () => {
    mockGetConservationSnapshot.mockResolvedValue({
      total: 100, formula: 100, verified: 0, delta: 0, valid: true,
    });

    const result = await evalGate('GW:PRE', [
      { pattern: 'execution_total_wu', result: { execution_total_wu: 100 } },
      { pattern: /FROM blueprint_scopes WHERE project_id = \? AND tier = 1/, result: { total: 3, allocated: 1 } },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toContain('2 of 3 scope(s) have no WU allocated');
  });

  it('fails when no execution layers exist', async () => {
    mockGetConservationSnapshot.mockResolvedValue({
      total: 100, formula: 100, verified: 0, delta: 0, valid: true,
    });

    const result = await evalGate('GW:PRE', [
      { pattern: 'execution_total_wu', result: { execution_total_wu: 100 } },
      { pattern: /FROM blueprint_scopes WHERE project_id = \? AND tier = 1/, result: { total: 2, allocated: 2 } },
      { pattern: 'FROM execution_layers', result: { cnt: 0 } },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toBe('No execution layers created');
  });
});

// ==========================================================================
// GW:VAL — Validation Gate
// ==========================================================================

describe('GW:VAL — Validation gate', () => {
  it('passes when all scopes R >= 0.6 and no FAILED layers', async () => {
    mockComputeProjectReadiness.mockResolvedValue({
      project_id: PROJECT_ID,
      scopes: [
        { scope_name: 'Auth', R: 0.7, allocated_wu: 50, verified_wu: 35 },
        { scope_name: 'Dashboard', R: 0.65, allocated_wu: 50, verified_wu: 30 },
      ],
      project_R: 0.675,
      conservation: { total: 100, formula: 35, verified: 65, delta: 0, valid: true },
    });

    const result = await evalGate('GW:VAL', [
      { pattern: "status = 'FAILED'", result: { cnt: 0 } },
    ]);
    expect(result.satisfied).toBe(true);
    expect(result.reason).toContain('All 2 scope(s) R');
    expect(result.reason).toContain('no failing layers');
  });

  it('fails when no scopes exist', async () => {
    mockComputeProjectReadiness.mockResolvedValue({
      project_id: PROJECT_ID,
      scopes: [],
      project_R: 0,
      conservation: { total: 0, formula: 0, verified: 0, delta: 0, valid: true },
    });

    const result = await evalGate('GW:VAL', []);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toBe('No scopes to validate');
  });

  it('fails when a scope is below R >= 0.6 threshold', async () => {
    mockComputeProjectReadiness.mockResolvedValue({
      project_id: PROJECT_ID,
      scopes: [
        { scope_name: 'Auth', R: 0.8, allocated_wu: 50, verified_wu: 40 },
        { scope_name: 'Payments', R: 0.4, allocated_wu: 50, verified_wu: 20 },
      ],
      project_R: 0.6,
      conservation: { total: 100, formula: 40, verified: 60, delta: 0, valid: true },
    });

    const result = await evalGate('GW:VAL', []);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toContain('1 scope(s) below R');
    expect(result.reason).toContain('Payments(R=0.4)');
  });

  it('fails when FAILED execution layers exist', async () => {
    mockComputeProjectReadiness.mockResolvedValue({
      project_id: PROJECT_ID,
      scopes: [
        { scope_name: 'Auth', R: 0.8, allocated_wu: 100, verified_wu: 80 },
      ],
      project_R: 0.8,
      conservation: { total: 100, formula: 20, verified: 80, delta: 0, valid: true },
    });

    const result = await evalGate('GW:VAL', [
      { pattern: "status = 'FAILED'", result: { cnt: 2 } },
    ]);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toContain('2 execution layer(s) in FAILED state');
  });
});

// ==========================================================================
// GW:VER — Verification Gate
// ==========================================================================

describe('GW:VER — Verification gate', () => {
  it('passes when R >= 0.8, all verified, conservation valid, no divergences', async () => {
    mockComputeProjectReadiness.mockResolvedValue({
      project_id: PROJECT_ID,
      scopes: [
        { scope_name: 'Auth', R: 0.85, allocated_wu: 50, verified_wu: 42 },
        { scope_name: 'Dashboard', R: 0.9, allocated_wu: 50, verified_wu: 45 },
      ],
      project_R: 0.875,
      conservation: { total: 100, formula: 13, verified: 87, delta: 0, valid: true },
    });
    mockComputeReconciliation.mockResolvedValue({
      project_id: PROJECT_ID,
      entries: [],
      has_divergences: false,
      max_divergence_pct: 0,
      conservation: { total: 100, formula: 13, verified: 87, delta: 0, valid: true },
    });

    const result = await evalGate('GW:VER', []);
    expect(result.satisfied).toBe(true);
    expect(result.reason).toContain('R=0.875');
    expect(result.reason).toContain('all scopes verified');
    expect(result.reason).toContain('conservation valid');
  });

  it('fails when project R is below 0.8', async () => {
    mockComputeProjectReadiness.mockResolvedValue({
      project_id: PROJECT_ID,
      scopes: [{ scope_name: 'Auth', R: 0.5, allocated_wu: 100, verified_wu: 50 }],
      project_R: 0.5,
      conservation: { total: 100, formula: 50, verified: 50, delta: 0, valid: true },
    });

    const result = await evalGate('GW:VER', []);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toContain('R=0.5 is below 0.8');
  });

  it('fails when scopes have allocated WU but zero verified WU', async () => {
    mockComputeProjectReadiness.mockResolvedValue({
      project_id: PROJECT_ID,
      scopes: [
        { scope_name: 'Auth', R: 0.9, allocated_wu: 50, verified_wu: 45 },
        { scope_name: 'Payments', R: 0.85, allocated_wu: 50, verified_wu: 0 },
      ],
      project_R: 0.875,
      conservation: { total: 100, formula: 55, verified: 45, delta: 0, valid: true },
    });

    const result = await evalGate('GW:VER', []);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toContain('1 scope(s) have allocated WU but no verified WU');
    expect(result.reason).toContain('Payments');
  });

  it('fails when conservation is violated', async () => {
    mockComputeProjectReadiness.mockResolvedValue({
      project_id: PROJECT_ID,
      scopes: [{ scope_name: 'Auth', R: 0.9, allocated_wu: 100, verified_wu: 90 }],
      project_R: 0.9,
      conservation: { total: 100, formula: 5, verified: 90, delta: 5, valid: false },
    });

    const result = await evalGate('GW:VER', []);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toContain('Conservation violation');
    expect(result.reason).toContain('delta=5');
  });

  it('fails when reconciliation has divergences > 20%', async () => {
    mockComputeProjectReadiness.mockResolvedValue({
      project_id: PROJECT_ID,
      scopes: [
        { scope_name: 'Auth', R: 0.9, allocated_wu: 50, verified_wu: 45 },
        { scope_name: 'Payments', R: 0.85, allocated_wu: 50, verified_wu: 42 },
      ],
      project_R: 0.875,
      conservation: { total: 100, formula: 13, verified: 87, delta: 0, valid: true },
    });
    mockComputeReconciliation.mockResolvedValue({
      project_id: PROJECT_ID,
      entries: [
        { scope_name: 'Payments', divergence_pct: 25, requires_attention: true },
      ],
      has_divergences: true,
      max_divergence_pct: 25,
      conservation: { total: 100, formula: 13, verified: 87, delta: 0, valid: true },
    });

    const result = await evalGate('GW:VER', []);
    expect(result.satisfied).toBe(false);
    expect(result.reason).toContain('Reconciliation divergences >20%');
    expect(result.reason).toContain('Payments(25%)');
  });
});

// ==========================================================================
// GATE_FAILURE_META — Static metadata map
// ==========================================================================

describe('GATE_FAILURE_META', () => {
  it('covers all GATE_RULES keys', () => {
    for (const gateId of Object.keys(GATE_RULES)) {
      expect(GATE_FAILURE_META).toHaveProperty(gateId);
    }
  });

  it('assigns correct phaseGroup for brainstorm gates', () => {
    expect(GATE_FAILURE_META['GA:LIC'].phaseGroup).toBe('brainstorm');
    expect(GATE_FAILURE_META['GA:DIS'].phaseGroup).toBe('brainstorm');
    expect(GATE_FAILURE_META['GA:TIR'].phaseGroup).toBe('brainstorm');
  });

  it('assigns correct phaseGroup for plan gates', () => {
    expect(GATE_FAILURE_META['GA:ENV'].phaseGroup).toBe('plan');
    expect(GATE_FAILURE_META['GA:FLD'].phaseGroup).toBe('plan');
    expect(GATE_FAILURE_META['GA:BP'].phaseGroup).toBe('plan');
    expect(GATE_FAILURE_META['GA:IVL'].phaseGroup).toBe('plan');
  });

  it('assigns correct phaseGroup for execute gates', () => {
    expect(GATE_FAILURE_META['GW:PRE'].phaseGroup).toBe('execute');
    expect(GATE_FAILURE_META['GW:VAL'].phaseGroup).toBe('execute');
    expect(GATE_FAILURE_META['GW:VER'].phaseGroup).toBe('execute');
  });

  it('provides non-empty action strings', () => {
    for (const [gateId, meta] of Object.entries(GATE_FAILURE_META)) {
      expect(meta.action.length).toBeGreaterThan(0);
    }
  });
});

// ==========================================================================
// evaluateAllGates — Orchestrator
// ==========================================================================

describe('evaluateAllGates', () => {
  function buildAllGatesDB(overrides: {
    projectState?: { gates: string; phase: string } | null;
    user?: { subscription_tier: string | null } | null;
    messageCount?: number;
    workspaceBinding?: { binding_confirmed: number; folder_name: string | null } | null;
    scopeCount?: number;
    deliverableCount?: number;
    missingDoD?: number;
    integrityReport?: { all_passed: number } | null;
    executionTotalWU?: number;
    scopeAllocation?: { total: number; allocated: number };
    layerCount?: number;
    failedLayers?: number;
  }): MockQueryResult[] {
    const queries: MockQueryResult[] = [];

    // project_state
    queries.push({
      pattern: 'FROM project_state',
      result: overrides.projectState ?? { gates: '{}', phase: 'BRAINSTORM' },
    });

    // UPDATE project_state (for persisting changes)
    queries.push({
      pattern: 'UPDATE project_state',
      result: null,
      runResult: { success: true, changes: 1 },
    });

    // subscription_tier (GA:LIC and GA:TIR both query this)
    queries.push({
      pattern: 'subscription_tier',
      result: overrides.user ?? { subscription_tier: 'TRIAL' },
    });

    // messages (GA:DIS)
    queries.push({
      pattern: 'FROM messages',
      result: { cnt: overrides.messageCount ?? 1 },
    });

    // workspace_bindings — binding_confirmed (GA:ENV) and folder_name (GA:FLD)
    queries.push({
      pattern: 'FROM workspace_bindings',
      result: overrides.workspaceBinding !== undefined ? overrides.workspaceBinding : { binding_confirmed: 1, folder_name: 'project-folder' },
    });

    // blueprint_scopes count (GA:BP)
    queries.push({
      pattern: /FROM blueprint_scopes WHERE project_id = \?$/,
      result: { cnt: overrides.scopeCount ?? 1 },
    });

    // blueprint_deliverables count (GA:BP — total)
    queries.push({
      pattern: /FROM blueprint_deliverables WHERE project_id = \?$/,
      result: { cnt: overrides.deliverableCount ?? 2 },
    });

    // blueprint_deliverables missing DoD (GA:BP)
    queries.push({
      pattern: 'dod_evidence_spec IS NULL',
      result: { cnt: overrides.missingDoD ?? 0 },
    });

    // integrity reports (GA:IVL)
    queries.push({
      pattern: 'blueprint_integrity_reports',
      result: overrides.integrityReport ?? { all_passed: 1 },
    });

    // projects — execution_total_wu (GW:PRE)
    queries.push({
      pattern: 'execution_total_wu',
      result: { execution_total_wu: overrides.executionTotalWU ?? 100 },
    });

    // blueprint_scopes allocation (GW:PRE — tier=1)
    queries.push({
      pattern: /FROM blueprint_scopes WHERE project_id = \? AND tier = 1/,
      result: overrides.scopeAllocation ?? { total: 2, allocated: 2 },
    });

    // execution_layers count (GW:PRE)
    queries.push({
      pattern: /FROM execution_layers WHERE project_id = \?$/,
      result: { cnt: overrides.layerCount ?? 3 },
    });

    // failed layers (GW:VAL)
    queries.push({
      pattern: "status = 'FAILED'",
      result: { cnt: overrides.failedLayers ?? 0 },
    });

    return queries;
  }

  beforeEach(() => {
    // Default mocks for readiness engine functions
    mockGetConservationSnapshot.mockResolvedValue({
      total: 100, formula: 100, verified: 0, delta: 0, valid: true,
    });
    mockComputeProjectReadiness.mockResolvedValue({
      project_id: PROJECT_ID,
      scopes: [
        { scope_name: 'Auth', R: 0.9, allocated_wu: 100, verified_wu: 90 },
      ],
      project_R: 0.9,
      conservation: { total: 100, formula: 10, verified: 90, delta: 0, valid: true },
    });
    mockComputeReconciliation.mockResolvedValue({
      project_id: PROJECT_ID,
      entries: [],
      has_divergences: false,
      max_divergence_pct: 0,
      conservation: { total: 100, formula: 10, verified: 90, delta: 0, valid: true },
    });
  });

  it('returns empty results when project_state row is missing', async () => {
    const db = createMockDB([
      { pattern: 'FROM project_state', result: null },
    ]);

    const result = await evaluateAllGates(
      db as unknown as D1Database,
      PROJECT_ID,
      USER_ID,
    );

    expect(result.evaluated).toEqual([]);
    expect(result.changed).toEqual([]);
    expect(result.gates).toEqual({});
    expect(result.phase).toBe('BRAINSTORM');
  });

  it('evaluates all gate rules and reports changes from false to true', async () => {
    const queries = buildAllGatesDB({
      projectState: { gates: '{}', phase: 'PLAN' },
    });
    const db = createMockDB(queries);

    const result = await evaluateAllGates(
      db as unknown as D1Database,
      PROJECT_ID,
      USER_ID,
    );

    // All gates in GATE_RULES should be evaluated
    expect(result.evaluated).toEqual(Object.keys(GATE_RULES));

    // Since initial gates were all {} (false), satisfying gates flip to true
    const changedIds = result.changed.map(c => c.gateId);
    expect(changedIds).toContain('GA:LIC');
    expect(changedIds).toContain('GA:BP');
    expect(changedIds).toContain('GA:IVL');

    // All changed gates should go from false to true
    for (const change of result.changed) {
      expect(change.from).toBe(false);
      expect(change.to).toBe(true);
    }
  });

  it('does not report changes when gates are already satisfied', async () => {
    const allTrue: Record<string, boolean> = {};
    for (const gateId of Object.keys(GATE_RULES)) {
      allTrue[gateId] = true;
    }

    const queries = buildAllGatesDB({
      projectState: { gates: JSON.stringify(allTrue), phase: 'EXECUTE' },
    });
    const db = createMockDB(queries);

    const result = await evaluateAllGates(
      db as unknown as D1Database,
      PROJECT_ID,
      USER_ID,
    );

    expect(result.evaluated.length).toBe(Object.keys(GATE_RULES).length);
    // No changes since all were already true and evaluators return true
    expect(result.changed).toEqual([]);
  });

  it('detects gate flipping from true to false (regression)', async () => {
    const allTrue: Record<string, boolean> = {};
    for (const gateId of Object.keys(GATE_RULES)) {
      allTrue[gateId] = true;
    }

    // GA:BP will fail because no scopes
    const queries = buildAllGatesDB({
      projectState: { gates: JSON.stringify(allTrue), phase: 'PLAN' },
      scopeCount: 0,
      deliverableCount: 0,
    });
    const db = createMockDB(queries);

    const result = await evaluateAllGates(
      db as unknown as D1Database,
      PROJECT_ID,
      USER_ID,
    );

    const bpChange = result.changed.find(c => c.gateId === 'GA:BP');
    expect(bpChange).toBeDefined();
    expect(bpChange!.from).toBe(true);
    expect(bpChange!.to).toBe(false);
    expect(result.gates['GA:BP']).toBe(false);
  });

  it('persists changed gates to D1 via UPDATE', async () => {
    const queries = buildAllGatesDB({
      projectState: { gates: '{}', phase: 'BRAINSTORM' },
    });
    const db = createMockDB(queries);

    await evaluateAllGates(db as unknown as D1Database, PROJECT_ID, USER_ID);

    // The UPDATE should have been called since gates changed
    const executions = (db as any)._executions as Array<{ sql: string; params: unknown[] }>;
    const updateCall = executions.find(e => e.sql.includes('UPDATE project_state'));
    expect(updateCall).toBeDefined();
    // First param is the serialized gates JSON
    const parsedGates = JSON.parse(updateCall!.params[0] as string);
    expect(typeof parsedGates['GA:LIC']).toBe('boolean');
  });

  it('enriches gate_details with blocking status for current phase', async () => {
    const queries = buildAllGatesDB({
      projectState: { gates: '{}', phase: 'PLAN' },
      workspaceBinding: null, // GA:ENV and GA:FLD will fail
    });
    const db = createMockDB(queries);

    const result = await evaluateAllGates(
      db as unknown as D1Database,
      PROJECT_ID,
      USER_ID,
    );

    expect(result.phase).toBe('PLAN');

    // GA:ENV is in 'plan' phaseGroup and not satisfied => blocking
    expect(result.gate_details['GA:ENV'].blocking).toBe(true);
    expect(result.gate_details['GA:ENV'].satisfied).toBe(false);
    expect(result.gate_details['GA:ENV'].action).toBeTruthy();

    // GA:LIC is in 'brainstorm' phaseGroup — not blocking during PLAN
    expect(result.gate_details['GA:LIC'].blocking).toBe(false);
  });

  it('handles evaluation errors gracefully without flipping gates', async () => {
    // Create a DB that throws for GA:BP query
    const errorDB = {
      prepare(sql: string) {
        const stmt = {
          bind: (..._args: unknown[]) => stmt,
          first: async () => {
            if (sql.includes('FROM project_state')) {
              return { gates: '{"GA:BP": true}', phase: 'PLAN' };
            }
            if (sql.includes('FROM blueprint_scopes')) {
              throw new Error('D1 connection lost');
            }
            // Return a valid user for GA:LIC/GA:TIR
            if (sql.includes('subscription_tier')) {
              return { subscription_tier: 'TRIAL' };
            }
            if (sql.includes('FROM messages')) return { cnt: 1 };
            if (sql.includes('FROM workspace_bindings')) {
              return { binding_confirmed: 1, folder_name: 'f' };
            }
            if (sql.includes('blueprint_integrity_reports')) return { all_passed: 1 };
            if (sql.includes('execution_total_wu')) return { execution_total_wu: 100 };
            if (sql.includes('tier = 1')) return { total: 1, allocated: 1 };
            if (sql.includes('execution_layers')) return { cnt: 1 };
            if (sql.includes('FAILED')) return { cnt: 0 };
            return null;
          },
          all: async () => ({ results: [] }),
          run: async () => ({ success: true, meta: { changes: 0 } }),
        };
        return stmt;
      },
    } as unknown as D1Database;

    const result = await evaluateAllGates(errorDB, PROJECT_ID, USER_ID);

    // GA:BP should remain true (its original value) — error does NOT flip it
    expect(result.gates['GA:BP']).toBe(true);
    // GA:BP should NOT appear in changed list
    const bpChange = result.changed.find(c => c.gateId === 'GA:BP');
    expect(bpChange).toBeUndefined();
  });
});

// ==========================================================================
// triggerGateEvaluation — Fire-and-forget wrapper
// ==========================================================================

describe('triggerGateEvaluation', () => {
  it('does not throw even when evaluateAllGates fails', async () => {
    // DB that fails on project_state query
    const failDB = {
      prepare() {
        return {
          bind: () => ({
            first: async () => { throw new Error('DB offline'); },
            all: async () => { throw new Error('DB offline'); },
            run: async () => { throw new Error('DB offline'); },
          }),
        };
      },
    } as unknown as D1Database;

    // Should not throw — errors are swallowed
    await expect(
      triggerGateEvaluation(failDB, PROJECT_ID, USER_ID),
    ).resolves.toBeUndefined();
  });
});

// ==========================================================================
// Edge Cases
// ==========================================================================

describe('Edge cases', () => {
  it('GA:BP with 1 scope, 1 deliverable, all DoD complete is satisfied', async () => {
    const result = await evalGate('GA:BP', [
      { pattern: 'FROM blueprint_scopes', result: { cnt: 1 } },
      { pattern: 'dod_evidence_spec IS NULL', result: { cnt: 0 } },
      { pattern: /FROM blueprint_deliverables WHERE project_id = \?$/, result: { cnt: 1 } },
    ]);
    expect(result.satisfied).toBe(true);
  });

  it('GA:DIS passes with exactly 1 message (boundary)', async () => {
    const result = await evalGate('GA:DIS', [
      { pattern: 'FROM messages', result: { cnt: 1 } },
    ]);
    expect(result.satisfied).toBe(true);
    expect(result.reason).toContain('1 message(s)');
  });

  it('GA:FLD treats empty string folder_name as falsy', async () => {
    const result = await evalGate('GA:FLD', [
      { pattern: 'folder_name', result: { folder_name: '' } },
    ]);
    // JavaScript: !!'' === false
    expect(result.satisfied).toBe(false);
  });

  it('GATE_RULES exports exactly 10 gates', () => {
    expect(Object.keys(GATE_RULES).length).toBe(10);
  });

  it('all gate rules have a non-empty description', () => {
    for (const [gateId, rule] of Object.entries(GATE_RULES)) {
      expect(rule.description.length).toBeGreaterThan(0);
    }
  });

  it('all gate rules have an evaluate function', () => {
    for (const [gateId, rule] of Object.entries(GATE_RULES)) {
      expect(typeof rule.evaluate).toBe('function');
    }
  });
});
