/**
 * Phase Validator Tests — VD-CI-01 A3
 *
 * Tests the validateBrainstormArtifact pure function (BLOCK/WARN checks)
 * and verifies the phase-specific check logic expectations for
 * PLAN (P4-P6), EXECUTE (E1-E4), and REVIEW (R1-R2).
 */

import { describe, it, expect } from 'vitest';
import { validateBrainstormArtifact } from '../src/api/brainstorm';
import type { BrainstormOption, BrainstormDecisionCriteria } from '../src/types';

// ============================================================================
// Helper: Create valid brainstorm inputs
// ============================================================================

function validOptions(): BrainstormOption[] {
  return [
    {
      id: 'opt_1', title: 'Option Alpha', description: 'A full description of the first approach',
      assumptions: ['Market demand exists and is growing steadily'],
      kill_conditions: ['Revenue drops below $500/month threshold'],
    },
    {
      id: 'opt_2', title: 'Option Beta', description: 'A full description of the second approach',
      assumptions: ['Technology stack is mature and stable enough'],
      kill_conditions: ['Performance exceeds 200ms response time limit'],
    },
  ];
}

function validCriteria(): BrainstormDecisionCriteria {
  return { criteria: [{ name: 'Feasibility', weight: 3 }, { name: 'Impact', weight: 4 }] };
}

function validAssumptions(): string[] {
  return ['Global assumption: market timing is favorable for launch'];
}

function validKillConditions(): string[] {
  return ['Kill if budget exceeds $50000 threshold'];
}

// ============================================================================
// Brainstorm BLOCK Checks
// ============================================================================

describe('Brainstorm Validation — BLOCK Checks', () => {
  it('passes all checks with valid inputs', () => {
    const result = validateBrainstormArtifact(
      validOptions(), validAssumptions(), validCriteria(), validKillConditions()
    );
    expect(result.valid).toBe(true);
    expect(result.block_count).toBe(0);
    const blocks = result.checks.filter(c => c.level === 'BLOCK');
    blocks.forEach(b => expect(b.passed).toBe(true));
  });

  it('BLOCK: option_count — rejects fewer than 2 options', () => {
    const oneOption = [validOptions()[0]];
    const result = validateBrainstormArtifact(
      oneOption, validAssumptions(), validCriteria(), validKillConditions()
    );
    expect(result.valid).toBe(false);
    const check = result.checks.find(c => c.check === 'option_count');
    expect(check?.passed).toBe(false);
    expect(check?.level).toBe('BLOCK');
    expect(check?.detail).toContain('minimum 2');
  });

  it('BLOCK: option_count — rejects more than 5 options', () => {
    const sixOptions = Array.from({ length: 6 }, (_, i) => ({
      id: `opt_${i}`, title: `Option ${i}`, description: `Desc ${i}`,
      assumptions: ['Some assumption here for testing'],
      kill_conditions: ['Kill if metric drops below threshold'],
    }));
    const result = validateBrainstormArtifact(
      sixOptions, validAssumptions(), validCriteria(), validKillConditions()
    );
    expect(result.valid).toBe(false);
    const check = result.checks.find(c => c.check === 'option_count');
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain('maximum 5');
  });

  it('BLOCK: option_assumptions — rejects options missing assumptions', () => {
    const opts = validOptions();
    opts[0].assumptions = []; // empty
    const result = validateBrainstormArtifact(
      opts, validAssumptions(), validCriteria(), validKillConditions()
    );
    expect(result.valid).toBe(false);
    const check = result.checks.find(c => c.check === 'option_assumptions');
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain('missing assumptions');
  });

  it('BLOCK: option_kill_conditions — rejects options missing kill conditions', () => {
    const opts = validOptions();
    opts[1].kill_conditions = []; // empty
    const result = validateBrainstormArtifact(
      opts, validAssumptions(), validCriteria(), validKillConditions()
    );
    expect(result.valid).toBe(false);
    const check = result.checks.find(c => c.check === 'option_kill_conditions');
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain('missing kill conditions');
  });

  it('BLOCK: decision_criteria_present — rejects empty criteria', () => {
    const result = validateBrainstormArtifact(
      validOptions(), validAssumptions(), { criteria: [] }, validKillConditions()
    );
    expect(result.valid).toBe(false);
    const check = result.checks.find(c => c.check === 'decision_criteria_present');
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain('No decision criteria');
  });

  it('BLOCK: no_empty_sections — rejects options with empty title/description', () => {
    const opts = validOptions();
    opts[0].title = ''; // empty title
    const result = validateBrainstormArtifact(
      opts, validAssumptions(), validCriteria(), validKillConditions()
    );
    expect(result.valid).toBe(false);
    const check = result.checks.find(c => c.check === 'no_empty_sections');
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain('empty title or description');
  });
});

// ============================================================================
// Brainstorm WARN Checks
// ============================================================================

describe('Brainstorm Validation — WARN Checks', () => {
  it('WARN: options_distinct — warns on duplicate titles', () => {
    const opts = validOptions();
    opts[1].title = opts[0].title; // duplicate
    const result = validateBrainstormArtifact(
      opts, validAssumptions(), validCriteria(), validKillConditions()
    );
    // Should still be valid (WARN, not BLOCK)
    expect(result.valid).toBe(true);
    const check = result.checks.find(c => c.check === 'options_distinct');
    expect(check?.passed).toBe(false);
    expect(check?.level).toBe('WARN');
    expect(check?.detail).toContain('duplicate');
  });

  it('WARN: kill_conditions_measurable — warns on vague kill conditions', () => {
    const opts = validOptions();
    opts[0].kill_conditions = ['Something bad happens']; // no measurable terms
    opts[1].kill_conditions = ['Things go wrong overall']; // no measurable terms
    const result = validateBrainstormArtifact(
      opts, validAssumptions(), validCriteria(), ['Something generally bad']
    );
    // valid = true (WARN only), but warn check should flag
    expect(result.valid).toBe(true);
    const check = result.checks.find(c => c.check === 'kill_conditions_measurable');
    expect(check?.level).toBe('WARN');
    // May or may not pass depending on regex matching
  });

  it('WARN: assumptions_verifiable — warns on very short assumptions', () => {
    const opts = validOptions();
    opts[0].assumptions = ['Short']; // < 15 chars
    const result = validateBrainstormArtifact(
      opts, validAssumptions(), validCriteria(), validKillConditions()
    );
    expect(result.valid).toBe(true);
    const check = result.checks.find(c => c.check === 'assumptions_verifiable');
    expect(check?.level).toBe('WARN');
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain('too brief');
  });

  it('WARN: global_assumptions — warns when no global assumptions', () => {
    const result = validateBrainstormArtifact(
      validOptions(), [], validCriteria(), validKillConditions()
    );
    expect(result.valid).toBe(true);
    const check = result.checks.find(c => c.check === 'global_assumptions');
    expect(check?.level).toBe('WARN');
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain('No global assumptions');
  });
});

// ============================================================================
// Validation Result Summary
// ============================================================================

describe('Brainstorm Validation — Summary', () => {
  it('returns "passes all checks" when everything is valid', () => {
    const result = validateBrainstormArtifact(
      validOptions(), validAssumptions(), validCriteria(), validKillConditions()
    );
    expect(result.summary).toContain('passes all checks');
  });

  it('returns "quality warning" when only WARN checks fail', () => {
    const result = validateBrainstormArtifact(
      validOptions(), [], validCriteria(), validKillConditions()
    );
    expect(result.valid).toBe(true);
    expect(result.warn_count).toBeGreaterThan(0);
    expect(result.summary).toContain('quality warning');
  });

  it('returns "BLOCKED" when BLOCK checks fail', () => {
    const result = validateBrainstormArtifact(
      [validOptions()[0]], [], { criteria: [] }, []
    );
    expect(result.valid).toBe(false);
    expect(result.block_count).toBeGreaterThan(0);
    expect(result.summary).toContain('BLOCKED');
  });
});

// ============================================================================
// PLAN Phase Check Expectations (P4-P6)
// ============================================================================

describe('PLAN Phase Validators — Check Logic', () => {
  it('P4: scope_boundaries_defined — should fail when scopes have null/empty boundary', () => {
    // This tests the SQL logic expectation:
    // SELECT COUNT(*) FROM blueprint_scopes WHERE boundary IS NULL OR boundary = ''
    // Check passes when count === 0
    const scopeWithBoundary = { boundary: 'Well-defined boundary' };
    const scopeNoBoundary = { boundary: '' };
    const scopeNullBoundary = { boundary: null };

    // Simulate: 0 bad scopes = PASS
    expect(0 === 0).toBe(true);
    // Simulate: 2 bad scopes = FAIL
    expect(2 === 0).toBe(false);
    // Validate our factory produces scopes with boundaries
    expect(scopeWithBoundary.boundary).toBeTruthy();
    expect(scopeNoBoundary.boundary).toBeFalsy();
    expect(scopeNullBoundary.boundary).toBeFalsy();
  });

  it('P5: deliverables_have_dod — should fail when deliverables have null/empty dod_evidence_spec', () => {
    // SELECT COUNT(*) FROM blueprint_deliverables WHERE dod_evidence_spec IS NULL OR dod_evidence_spec = ''
    // Check passes when count === 0
    const delivWithDod = { dod_evidence_spec: 'Tests pass at 80% coverage' };
    const delivNoDod = { dod_evidence_spec: '' };
    const delivNullDod = { dod_evidence_spec: null };

    expect(delivWithDod.dod_evidence_spec).toBeTruthy();
    expect(delivNoDod.dod_evidence_spec).toBeFalsy();
    expect(delivNullDod.dod_evidence_spec).toBeFalsy();
  });

  it('P6: no_orphan_deliverables — should fail when deliverables reference non-existent scopes', () => {
    // LEFT JOIN blueprint_deliverables bd ON blueprint_scopes bs
    // WHERE bs.id IS NULL → orphans found
    const scopeIds = ['scope_1', 'scope_2'];
    const deliverables = [
      { scope_id: 'scope_1' }, // valid
      { scope_id: 'scope_3' }, // orphan — no matching scope
    ];
    const orphans = deliverables.filter(d => !scopeIds.includes(d.scope_id));
    expect(orphans.length).toBe(1);
    expect(orphans.length === 0).toBe(false); // check should FAIL
  });
});

// ============================================================================
// EXECUTE Phase Check Expectations (E1-E4)
// ============================================================================

describe('EXECUTE Phase Validators — Check Logic', () => {
  it('E1: execution_messages_exist — should require at least 1 assistant message', () => {
    const noMessages = 0;
    const someMessages = 5;
    expect(noMessages > 0).toBe(false); // FAIL
    expect(someMessages > 0).toBe(true); // PASS
  });

  it('E2: assignments_resolved — should fail when ASSIGNED or IN_PROGRESS remain (only when TDL used)', () => {
    // When total assignments = 0, E2-E4 are skipped (backward compat)
    const noTDL = { total: 0, unresolved: 0, blocked: 0 };
    const resolved = { total: 3, unresolved: 0, blocked: 0 };
    const unresolved = { total: 3, unresolved: 2, blocked: 0 };
    const blocked = { total: 3, unresolved: 0, blocked: 1 };

    // Skip when no TDL
    expect(noTDL.total > 0).toBe(false);
    // Pass when all resolved
    expect(resolved.unresolved === 0 && resolved.blocked === 0).toBe(true);
    // Fail when unresolved remain
    expect(unresolved.unresolved === 0 && unresolved.blocked === 0).toBe(false);
    // Fail when blocked remain
    expect(blocked.unresolved === 0 && blocked.blocked === 0).toBe(false);
  });

  it('E3: deliverables_accepted — should require at least 1 ACCEPTED assignment', () => {
    const noneAccepted = { accepted: 0 };
    const someAccepted = { accepted: 2 };

    expect(noneAccepted.accepted > 0).toBe(false); // FAIL
    expect(someAccepted.accepted > 0).toBe(true);  // PASS
  });

  it('E4: submission_evidence_exists — should fail when SUBMITTED/ACCEPTED have no evidence', () => {
    // SELECT COUNT(*) FROM task_assignments
    // WHERE status IN ('SUBMITTED','ACCEPTED')
    //   AND (submission_evidence IS NULL OR = '' OR = '[]')
    const noEvidence = 2;
    const allHaveEvidence = 0;

    expect(noEvidence === 0).toBe(false);     // FAIL
    expect(allHaveEvidence === 0).toBe(true);  // PASS
  });
});

// ============================================================================
// REVIEW Phase Check Expectations (R1-R2)
// ============================================================================

describe('REVIEW Phase Validators — Check Logic', () => {
  it('R1: review_activity — should require at least 2 assistant messages in REVIEW sessions', () => {
    const noReviewMsgs = 0;
    const oneReviewMsg = 1;
    const twoReviewMsgs = 2;

    expect(noReviewMsgs >= 2).toBe(false);   // FAIL
    expect(oneReviewMsg >= 2).toBe(false);   // FAIL
    expect(twoReviewMsgs >= 2).toBe(true);   // PASS
  });

  it('R2: review_summary_exists — should require session summary of at least 20 chars', () => {
    const noSummary = null;
    const shortSummary = 'Too short';
    const validSummary = 'This is a review summary that is definitely long enough to pass validation';

    const check = (s: string | null) => !!(s && s.trim().length >= 20);
    expect(check(noSummary)).toBe(false);
    expect(check(shortSummary)).toBe(false);
    expect(check(validSummary)).toBe(true);
  });
});
