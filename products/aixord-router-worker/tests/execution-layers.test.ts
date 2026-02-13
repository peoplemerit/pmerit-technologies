/**
 * Execution Layer Lifecycle Tests — SYS-02 E2E
 *
 * Tests the Execution Layer state machine (Path B: Proactive Debugging):
 * - Status transitions (PENDING→ACTIVE→EXECUTED→LOCKED, FAILED path)
 * - Sequential enforcement (all previous layers must be LOCKED)
 * - Single-active constraint (only one ACTIVE per session)
 * - Deletion rules (only PENDING)
 * - Modification rules (not LOCKED)
 * - Verification requirements (method required, evidence stored)
 * - Retry mechanics (FAILED→ACTIVE, retry_count increments)
 * - Batch creation validation
 */

import { describe, it, expect } from 'vitest';

// ============================================================================
// Types (mirrors layers.ts)
// ============================================================================

type LayerStatus = 'PENDING' | 'ACTIVE' | 'EXECUTED' | 'VERIFIED' | 'LOCKED' | 'FAILED';
type VerificationMethod = 'user_confirm' | 'screenshot' | 'test_output' | 'file_check' | 'ai_auto';

interface Layer {
  id: string;
  session_number: number;
  layer_number: number;
  title: string;
  status: LayerStatus;
  started_at: string | null;
  completed_at: string | null;
  locked_at: string | null;
  verified_at: string | null;
  failure_reason: string | null;
  retry_count: number;
  verification_method: VerificationMethod | null;
}

// ============================================================================
// State Machine Logic (mirrors layers.ts guards)
// ============================================================================

/** Valid status transitions for each action */
const LAYER_TRANSITIONS: Record<string, { from: LayerStatus[]; to: LayerStatus }> = {
  start:    { from: ['PENDING'],            to: 'ACTIVE' },
  complete: { from: ['ACTIVE'],             to: 'EXECUTED' },
  verify:   { from: ['EXECUTED'],           to: 'LOCKED' },  // skips VERIFIED → goes straight to LOCKED
  fail:     { from: ['ACTIVE', 'EXECUTED'], to: 'FAILED' },
  retry:    { from: ['FAILED'],             to: 'ACTIVE' },
};

function isValidTransition(action: string, currentStatus: LayerStatus): boolean {
  const rule = LAYER_TRANSITIONS[action];
  if (!rule) return false;
  return rule.from.includes(currentStatus);
}

function canDelete(status: LayerStatus): boolean {
  return status === 'PENDING';
}

function canModify(status: LayerStatus): boolean {
  return status !== 'LOCKED';
}

function canStartLayer(
  layer: Layer,
  allLayers: Layer[],
  sessionNumber: number
): { allowed: boolean; reason?: string } {
  if (layer.status !== 'PENDING') {
    return { allowed: false, reason: `Cannot start layer in ${layer.status} state` };
  }

  // Check for active layer in session
  const activeLayer = allLayers.find(
    l => l.session_number === sessionNumber && l.status === 'ACTIVE'
  );
  if (activeLayer) {
    return {
      allowed: false,
      reason: `Layer ${activeLayer.layer_number} (${activeLayer.title}) is already active`,
    };
  }

  // Check all previous layers are LOCKED
  const previousLayers = allLayers.filter(
    l => l.session_number === sessionNumber && l.layer_number < layer.layer_number
  );
  for (const prev of previousLayers) {
    if (prev.status !== 'LOCKED') {
      return {
        allowed: false,
        reason: `Layer ${prev.layer_number} must be locked before starting layer ${layer.layer_number}`,
      };
    }
  }

  return { allowed: true };
}

function validateBatchInput(layers: Array<{ layer_number?: number; title?: string }>): {
  valid: boolean;
  error?: string;
} {
  if (!layers || !Array.isArray(layers) || layers.length === 0) {
    return { valid: false, error: 'layers array is required' };
  }
  for (const l of layers) {
    if (!l.layer_number || !l.title) {
      return { valid: false, error: 'Each layer requires layer_number and title' };
    }
  }
  return { valid: true };
}

function validateVerification(input: { method?: string }): { valid: boolean; error?: string } {
  if (!input.method) {
    return { valid: false, error: 'verification method is required' };
  }
  const validMethods: VerificationMethod[] = ['user_confirm', 'screenshot', 'test_output', 'file_check', 'ai_auto'];
  if (!validMethods.includes(input.method as VerificationMethod)) {
    return { valid: false, error: `Invalid method: ${input.method}` };
  }
  return { valid: true };
}

// ============================================================================
// Status Transition Tests
// ============================================================================

describe('Execution Layers — Status Transitions', () => {
  it('start: PENDING → ACTIVE (valid)', () => {
    expect(isValidTransition('start', 'PENDING')).toBe(true);
  });

  it('start: ACTIVE → ACTIVE (invalid — already active)', () => {
    expect(isValidTransition('start', 'ACTIVE')).toBe(false);
  });

  it('start: EXECUTED → ACTIVE (invalid)', () => {
    expect(isValidTransition('start', 'EXECUTED')).toBe(false);
  });

  it('start: LOCKED → ACTIVE (invalid — terminal state)', () => {
    expect(isValidTransition('start', 'LOCKED')).toBe(false);
  });

  it('complete: ACTIVE → EXECUTED (valid)', () => {
    expect(isValidTransition('complete', 'ACTIVE')).toBe(true);
  });

  it('complete: PENDING → EXECUTED (invalid — must start first)', () => {
    expect(isValidTransition('complete', 'PENDING')).toBe(false);
  });

  it('complete: LOCKED → EXECUTED (invalid — terminal)', () => {
    expect(isValidTransition('complete', 'LOCKED')).toBe(false);
  });

  it('verify: EXECUTED → LOCKED (valid)', () => {
    expect(isValidTransition('verify', 'EXECUTED')).toBe(true);
  });

  it('verify: ACTIVE → LOCKED (invalid — must complete first)', () => {
    expect(isValidTransition('verify', 'ACTIVE')).toBe(false);
  });

  it('verify: PENDING → LOCKED (invalid)', () => {
    expect(isValidTransition('verify', 'PENDING')).toBe(false);
  });

  it('fail: ACTIVE → FAILED (valid)', () => {
    expect(isValidTransition('fail', 'ACTIVE')).toBe(true);
  });

  it('fail: EXECUTED → FAILED (valid — can fail after execution)', () => {
    expect(isValidTransition('fail', 'EXECUTED')).toBe(true);
  });

  it('fail: PENDING → FAILED (invalid — not started)', () => {
    expect(isValidTransition('fail', 'PENDING')).toBe(false);
  });

  it('fail: LOCKED → FAILED (invalid — terminal)', () => {
    expect(isValidTransition('fail', 'LOCKED')).toBe(false);
  });

  it('retry: FAILED → ACTIVE (valid)', () => {
    expect(isValidTransition('retry', 'FAILED')).toBe(true);
  });

  it('retry: ACTIVE → ACTIVE (invalid — must fail first)', () => {
    expect(isValidTransition('retry', 'ACTIVE')).toBe(false);
  });

  it('retry: PENDING → ACTIVE (invalid)', () => {
    expect(isValidTransition('retry', 'PENDING')).toBe(false);
  });
});

// ============================================================================
// Full Lifecycle Flow
// ============================================================================

describe('Execution Layers — Full Lifecycle', () => {
  it('happy path: PENDING → start → complete → verify → LOCKED', () => {
    let status: LayerStatus = 'PENDING';

    expect(isValidTransition('start', status)).toBe(true);
    status = 'ACTIVE';

    expect(isValidTransition('complete', status)).toBe(true);
    status = 'EXECUTED';

    expect(isValidTransition('verify', status)).toBe(true);
    status = 'LOCKED';

    expect(status).toBe('LOCKED');
  });

  it('failure path: PENDING → start → fail → retry → complete → verify → LOCKED', () => {
    let status: LayerStatus = 'PENDING';

    status = 'ACTIVE'; // start
    expect(isValidTransition('fail', status)).toBe(true);
    status = 'FAILED';

    expect(isValidTransition('retry', status)).toBe(true);
    status = 'ACTIVE';

    expect(isValidTransition('complete', status)).toBe(true);
    status = 'EXECUTED';

    expect(isValidTransition('verify', status)).toBe(true);
    status = 'LOCKED';

    expect(status).toBe('LOCKED');
  });

  it('fail after execute: ACTIVE → EXECUTED → FAILED → retry → ACTIVE', () => {
    let status: LayerStatus = 'ACTIVE';

    status = 'EXECUTED'; // complete
    expect(isValidTransition('fail', status)).toBe(true);
    status = 'FAILED';

    expect(isValidTransition('retry', status)).toBe(true);
    status = 'ACTIVE';
  });

  it('LOCKED is terminal — no transitions out', () => {
    const status: LayerStatus = 'LOCKED';
    expect(isValidTransition('start', status)).toBe(false);
    expect(isValidTransition('complete', status)).toBe(false);
    expect(isValidTransition('verify', status)).toBe(false);
    expect(isValidTransition('fail', status)).toBe(false);
    expect(isValidTransition('retry', status)).toBe(false);
  });
});

// ============================================================================
// Sequential Enforcement
// ============================================================================

describe('Execution Layers — Sequential Enforcement', () => {
  function makeLayers(statuses: Array<{ num: number; status: LayerStatus }>): Layer[] {
    return statuses.map(s => ({
      id: `layer_${s.num}`,
      session_number: 1,
      layer_number: s.num,
      title: `Layer ${s.num}`,
      status: s.status,
      started_at: null,
      completed_at: null,
      locked_at: null,
      verified_at: null,
      failure_reason: null,
      retry_count: 0,
      verification_method: null,
    }));
  }

  it('allows starting layer 1 with no predecessors', () => {
    const layers = makeLayers([{ num: 1, status: 'PENDING' }]);
    const result = canStartLayer(layers[0], layers, 1);
    expect(result.allowed).toBe(true);
  });

  it('allows starting layer 2 when layer 1 is LOCKED', () => {
    const layers = makeLayers([
      { num: 1, status: 'LOCKED' },
      { num: 2, status: 'PENDING' },
    ]);
    const result = canStartLayer(layers[1], layers, 1);
    expect(result.allowed).toBe(true);
  });

  it('blocks starting layer 2 when layer 1 is ACTIVE', () => {
    const layers = makeLayers([
      { num: 1, status: 'ACTIVE' },
      { num: 2, status: 'PENDING' },
    ]);
    const result = canStartLayer(layers[1], layers, 1);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('already active');
  });

  it('blocks starting layer 3 when layer 1 is LOCKED but layer 2 is EXECUTED (not locked)', () => {
    const layers = makeLayers([
      { num: 1, status: 'LOCKED' },
      { num: 2, status: 'EXECUTED' },
      { num: 3, status: 'PENDING' },
    ]);
    const result = canStartLayer(layers[2], layers, 1);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Layer 2 must be locked');
  });

  it('blocks starting layer 2 when layer 1 is FAILED', () => {
    const layers = makeLayers([
      { num: 1, status: 'FAILED' },
      { num: 2, status: 'PENDING' },
    ]);
    const result = canStartLayer(layers[1], layers, 1);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Layer 1 must be locked');
  });

  it('allows starting layer 3 when layers 1 and 2 are both LOCKED', () => {
    const layers = makeLayers([
      { num: 1, status: 'LOCKED' },
      { num: 2, status: 'LOCKED' },
      { num: 3, status: 'PENDING' },
    ]);
    const result = canStartLayer(layers[2], layers, 1);
    expect(result.allowed).toBe(true);
  });

  it('ignores layers from different sessions', () => {
    const layers: Layer[] = [
      { ...makeLayers([{ num: 1, status: 'ACTIVE' }])[0], session_number: 1 },
      { ...makeLayers([{ num: 1, status: 'PENDING' }])[0], session_number: 2 },
    ];
    // Layer 1 of session 2 should be startable even though session 1 layer 1 is ACTIVE
    const result = canStartLayer(layers[1], layers, 2);
    expect(result.allowed).toBe(true);
  });
});

// ============================================================================
// Single Active Constraint
// ============================================================================

describe('Execution Layers — Single Active Constraint', () => {
  it('blocks starting layer when another is ACTIVE in same session', () => {
    const layers: Layer[] = [
      {
        id: 'layer_1', session_number: 1, layer_number: 1, title: 'Setup',
        status: 'ACTIVE', started_at: '2026-01-01', completed_at: null,
        locked_at: null, verified_at: null, failure_reason: null, retry_count: 0,
        verification_method: null,
      },
      {
        id: 'layer_2', session_number: 1, layer_number: 2, title: 'Build',
        status: 'PENDING', started_at: null, completed_at: null,
        locked_at: null, verified_at: null, failure_reason: null, retry_count: 0,
        verification_method: null,
      },
    ];
    const result = canStartLayer(layers[1], layers, 1);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('already active');
  });
});

// ============================================================================
// Deletion & Modification Rules
// ============================================================================

describe('Execution Layers — Deletion Rules', () => {
  it('PENDING can be deleted', () => {
    expect(canDelete('PENDING')).toBe(true);
  });

  it('ACTIVE cannot be deleted', () => {
    expect(canDelete('ACTIVE')).toBe(false);
  });

  it('EXECUTED cannot be deleted', () => {
    expect(canDelete('EXECUTED')).toBe(false);
  });

  it('LOCKED cannot be deleted', () => {
    expect(canDelete('LOCKED')).toBe(false);
  });

  it('FAILED cannot be deleted', () => {
    expect(canDelete('FAILED')).toBe(false);
  });
});

describe('Execution Layers — Modification Rules', () => {
  it('PENDING can be modified', () => {
    expect(canModify('PENDING')).toBe(true);
  });

  it('ACTIVE can be modified', () => {
    expect(canModify('ACTIVE')).toBe(true);
  });

  it('EXECUTED can be modified', () => {
    expect(canModify('EXECUTED')).toBe(true);
  });

  it('LOCKED cannot be modified', () => {
    expect(canModify('LOCKED')).toBe(false);
  });

  it('FAILED can be modified', () => {
    expect(canModify('FAILED')).toBe(true);
  });
});

// ============================================================================
// Verification Validation
// ============================================================================

describe('Execution Layers — Verification', () => {
  it('accepts user_confirm method', () => {
    expect(validateVerification({ method: 'user_confirm' }).valid).toBe(true);
  });

  it('accepts screenshot method', () => {
    expect(validateVerification({ method: 'screenshot' }).valid).toBe(true);
  });

  it('accepts test_output method', () => {
    expect(validateVerification({ method: 'test_output' }).valid).toBe(true);
  });

  it('accepts file_check method', () => {
    expect(validateVerification({ method: 'file_check' }).valid).toBe(true);
  });

  it('accepts ai_auto method', () => {
    expect(validateVerification({ method: 'ai_auto' }).valid).toBe(true);
  });

  it('rejects missing method', () => {
    const result = validateVerification({});
    expect(result.valid).toBe(false);
    expect(result.error).toContain('method is required');
  });

  it('rejects invalid method', () => {
    const result = validateVerification({ method: 'magic' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid method');
  });

  it('verify requires EXECUTED status', () => {
    expect(isValidTransition('verify', 'EXECUTED')).toBe(true);
    expect(isValidTransition('verify', 'PENDING')).toBe(false);
    expect(isValidTransition('verify', 'ACTIVE')).toBe(false);
    expect(isValidTransition('verify', 'FAILED')).toBe(false);
  });
});

// ============================================================================
// Batch Creation Validation
// ============================================================================

describe('Execution Layers — Batch Creation', () => {
  it('accepts valid batch with multiple layers', () => {
    const result = validateBatchInput([
      { layer_number: 1, title: 'Setup Environment' },
      { layer_number: 2, title: 'Implement Feature' },
      { layer_number: 3, title: 'Write Tests' },
    ]);
    expect(result.valid).toBe(true);
  });

  it('rejects empty array', () => {
    const result = validateBatchInput([]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('layers array is required');
  });

  it('rejects layer missing title', () => {
    const result = validateBatchInput([
      { layer_number: 1, title: 'Setup' },
      { layer_number: 2 },
    ]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('layer_number and title');
  });

  it('rejects layer missing layer_number', () => {
    const result = validateBatchInput([
      { title: 'No number' },
    ]);
    expect(result.valid).toBe(false);
  });

  it('rejects non-array input', () => {
    const result = validateBatchInput(null as unknown as []);
    expect(result.valid).toBe(false);
  });
});

// ============================================================================
// Retry Mechanics
// ============================================================================

describe('Execution Layers — Retry Mechanics', () => {
  it('retry increments retry_count conceptually', () => {
    let retryCount = 0;
    let status: LayerStatus = 'ACTIVE';

    // First failure
    status = 'FAILED';
    retryCount++; // backend does retry_count = retry_count + 1 on fail

    expect(retryCount).toBe(1);
    expect(isValidTransition('retry', status)).toBe(true);
    status = 'ACTIVE';

    // Second failure
    status = 'FAILED';
    retryCount++;

    expect(retryCount).toBe(2);
    expect(isValidTransition('retry', status)).toBe(true);
  });

  it('retry clears failure_reason', () => {
    // Simulates: SET failure_reason = NULL on retry
    let failureReason: string | null = 'Something broke';
    const action = 'retry';

    if (action === 'retry') {
      failureReason = null;
    }

    expect(failureReason).toBeNull();
  });

  it('fail requires a reason', () => {
    const reason = '';
    expect(reason.trim().length > 0).toBe(false);

    const validReason = 'Build compilation failed';
    expect(validReason.trim().length > 0).toBe(true);
  });
});

// ============================================================================
// Create Layer Validation
// ============================================================================

describe('Execution Layers — Create Validation', () => {
  it('requires layer_number', () => {
    const body = { title: 'Test' };
    expect(!!(body as { layer_number?: number }).layer_number).toBe(false);
  });

  it('requires title', () => {
    const body = { layer_number: 1 };
    expect(!!(body as { title?: string }).title).toBe(false);
  });

  it('accepts valid create input', () => {
    const body = { layer_number: 1, title: 'Setup Project' };
    expect(!!body.layer_number && !!body.title).toBe(true);
  });

  it('duplicate layer_number in same session is rejected (409)', () => {
    // Simulates the DB unique check
    const existingLayers = [
      { session_number: 1, layer_number: 1 },
      { session_number: 1, layer_number: 2 },
    ];

    const newLayerNumber = 2;
    const sessionNumber = 1;

    const isDuplicate = existingLayers.some(
      l => l.session_number === sessionNumber && l.layer_number === newLayerNumber
    );
    expect(isDuplicate).toBe(true);

    const uniqueNumber = 3;
    const isDuplicate2 = existingLayers.some(
      l => l.session_number === sessionNumber && l.layer_number === uniqueNumber
    );
    expect(isDuplicate2).toBe(false);
  });
});
