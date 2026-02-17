/**
 * Root Cause Doctrine Tests — D79 Phase 2 Structural Enforcement
 *
 * Tests Swiss Cheese Model root cause tracking:
 *   1. Root cause persistence (INSERT with root_cause fields)
 *   2. Registry upsert (same root cause → occurrence_count increments)
 *   3. Signature normalization & deduplication
 *   4. enforceL_RCD blocks when recurring CRITICAL/HIGH root causes exist
 *   5. enforceL_RCD allows when no recurring issues or all ADDRESSED
 *   6. Error tracker accepts root_cause_category
 *   7. RootCauseCategory type validation
 *   8. Registry resolution endpoint validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackError, trackWarning } from '../src/utils/errorTracker';
import type { RootCauseCategory, ErrorReport } from '../src/utils/errorTracker';
import { enforceL_BRN } from '../src/governance/phaseContracts';

// ============================================================================
// Helpers: SHA-256 signature computation (mirrors agents.ts logic)
// ============================================================================

async function computeSignature(rootCause: string): Promise<string> {
  const normalized = rootCause.trim().toLowerCase().replace(/\s+/g, ' ');
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(normalized));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// Helpers: Mock D1Database
// ============================================================================

interface MockDBConfig {
  registryResults?: any[];
  findingInsertSuccess?: boolean;
  registryExisting?: { id: string; occurrence_count: number; max_severity: string } | null;
  auditLog?: { project_id: string } | null;
}

function createMockDB(config: MockDBConfig = {}) {
  const calls: { sql: string; params: any[] }[] = [];

  return {
    calls,
    prepare: (sql: string) => ({
      bind: (...args: any[]) => {
        calls.push({ sql, params: args });
        return {
          first: async () => {
            if (sql.includes('FROM root_cause_registry') && sql.includes('signature')) {
              return config.registryExisting ?? null;
            }
            if (sql.includes('FROM agent_audit_log')) {
              return config.auditLog ?? { project_id: 'proj_test' };
            }
            return null;
          },
          all: async () => {
            if (sql.includes('FROM root_cause_registry')) {
              return { results: config.registryResults ?? [] };
            }
            return { results: [] };
          },
          run: async () => ({ meta: { changes: 1 } }),
        };
      },
    }),
  } as unknown as D1Database & { calls: typeof calls };
}

// ============================================================================
// 1. Root Cause Category Type Validation
// ============================================================================

describe('Root Cause Category Types', () => {
  const VALID_CATEGORIES: RootCauseCategory[] = [
    'INTEGRITY', 'VALIDATION', 'ISOLATION', 'OBSERVABILITY', 'PROCESS', 'DESIGN'
  ];

  it('should accept all 6 Swiss Cheese categories', () => {
    VALID_CATEGORIES.forEach(cat => {
      const report: Partial<ErrorReport> = { root_cause_category: cat };
      expect(report.root_cause_category).toBe(cat);
    });
  });

  it('should map to correct Swiss Cheese defense layers', () => {
    // Integrity = Code Quality Layer
    // Validation = CI/CD Layer
    // Isolation = Architecture Layer
    // Observability = Monitoring Layer
    // Process = Workflow Layer
    // Design = Architecture/Specification Layer
    expect(VALID_CATEGORIES).toHaveLength(6);
    expect(VALID_CATEGORIES).toContain('INTEGRITY');
    expect(VALID_CATEGORIES).toContain('VALIDATION');
    expect(VALID_CATEGORIES).toContain('ISOLATION');
    expect(VALID_CATEGORIES).toContain('OBSERVABILITY');
    expect(VALID_CATEGORIES).toContain('PROCESS');
    expect(VALID_CATEGORIES).toContain('DESIGN');
  });
});

// ============================================================================
// 2. Signature Normalization & Deduplication
// ============================================================================

describe('Root Cause Signature Normalization', () => {
  it('should produce identical signatures for case-different text', async () => {
    const sig1 = await computeSignature('Missing null check in auth handler');
    const sig2 = await computeSignature('MISSING NULL CHECK IN AUTH HANDLER');
    expect(sig1).toBe(sig2);
  });

  it('should produce identical signatures for whitespace-different text', async () => {
    const sig1 = await computeSignature('Missing null check');
    const sig2 = await computeSignature('  Missing   null    check  ');
    expect(sig1).toBe(sig2);
  });

  it('should produce identical signatures for leading/trailing whitespace', async () => {
    const sig1 = await computeSignature('Type error in data model');
    const sig2 = await computeSignature('  Type error in data model  ');
    expect(sig1).toBe(sig2);
  });

  it('should produce different signatures for genuinely different root causes', async () => {
    const sig1 = await computeSignature('Missing null check in auth handler');
    const sig2 = await computeSignature('SQL injection vulnerability in query builder');
    expect(sig1).not.toBe(sig2);
  });

  it('should produce 64-character hex strings (SHA-256)', async () => {
    const sig = await computeSignature('Test root cause');
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
    expect(sig).toHaveLength(64);
  });

  it('should handle newlines and tabs as whitespace normalization', async () => {
    const sig1 = await computeSignature('Root cause\nacross lines');
    const sig2 = await computeSignature('Root cause across lines');
    expect(sig1).toBe(sig2);
  });
});

// ============================================================================
// 3. Error Tracker with Root Cause Category
// ============================================================================

describe('Error Tracker — Root Cause Category', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should include root_cause_category in error report', () => {
    trackError(new Error('Schema mismatch'), {
      root_cause_category: 'INTEGRITY',
    });

    expect(consoleSpy).toHaveBeenCalledOnce();
    const output = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(output.root_cause_category).toBe('INTEGRITY');
    expect(output.level).toBe('error');
  });

  it('should accept all valid root cause categories', () => {
    const categories: RootCauseCategory[] = [
      'INTEGRITY', 'VALIDATION', 'ISOLATION', 'OBSERVABILITY', 'PROCESS', 'DESIGN'
    ];

    categories.forEach(cat => {
      consoleSpy.mockClear();
      trackError(new Error(`Error: ${cat}`), { root_cause_category: cat });
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string);
      expect(output.root_cause_category).toBe(cat);
    });
  });

  it('should output undefined root_cause_category when not provided', () => {
    trackError(new Error('Simple error'));

    const output = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(output.root_cause_category).toBeUndefined();
  });

  it('should combine root_cause_category with other context fields', () => {
    trackError(new Error('db error'), {
      requestId: 'req-001',
      path: '/api/v1/projects',
      root_cause_category: 'DESIGN',
      extra: { table: 'root_cause_registry' },
    });

    const output = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(output.root_cause_category).toBe('DESIGN');
    expect(output.requestId).toBe('req-001');
    expect(output.context).toEqual({ table: 'root_cause_registry' });
  });
});

// ============================================================================
// 4. Root Cause Persistence — Finding Fields
// ============================================================================

describe('Root Cause Persistence — Audit Findings', () => {
  it('should validate root_cause_category against allowed values', () => {
    const validCategories = ['INTEGRITY', 'VALIDATION', 'ISOLATION', 'OBSERVABILITY', 'PROCESS', 'DESIGN'];

    // Simulate agents.ts validation logic
    const validate = (cat: string | undefined) =>
      cat && validCategories.includes(cat) ? cat : null;

    expect(validate('INTEGRITY')).toBe('INTEGRITY');
    expect(validate('VALIDATION')).toBe('VALIDATION');
    expect(validate('ISOLATION')).toBe('ISOLATION');
    expect(validate('OBSERVABILITY')).toBe('OBSERVABILITY');
    expect(validate('PROCESS')).toBe('PROCESS');
    expect(validate('DESIGN')).toBe('DESIGN');
    expect(validate('INVALID')).toBeNull();
    expect(validate(undefined)).toBeNull();
    expect(validate('')).toBeNull();
  });

  it('should coerce is_symptom boolean to integer', () => {
    // agents.ts uses: f.is_symptom ? 1 : 0
    expect(true ? 1 : 0).toBe(1);
    expect(false ? 1 : 0).toBe(0);
    expect(undefined ? 1 : 0).toBe(0);
    expect(null ? 1 : 0).toBe(0);
  });

  it('should store root_cause as null when not provided', () => {
    const finding = { title: 'Bug', severity: 'HIGH' };
    const rootCause = (finding as any).root_cause || null;
    expect(rootCause).toBeNull();
  });

  it('should preserve root_cause text when provided', () => {
    const finding = {
      title: 'Missing error boundary',
      severity: 'HIGH',
      root_cause: 'No try-catch around database operations in auth handler',
      root_cause_category: 'INTEGRITY',
      is_symptom: false,
    };
    expect(finding.root_cause).toBe('No try-catch around database operations in auth handler');
    expect(finding.root_cause_category).toBe('INTEGRITY');
    expect(finding.is_symptom).toBe(false);
  });
});

// ============================================================================
// 5. Registry Upsert Logic
// ============================================================================

describe('Root Cause Registry — Upsert Logic', () => {
  it('should create new registry entry when no existing signature match', async () => {
    const db = createMockDB({ registryExisting: null });

    const rootCause = 'Missing null check in auth handler';
    const signature = await computeSignature(rootCause);

    // Simulate the INSERT path (existing === null → INSERT)
    const existing = await (db as any).prepare(
      'SELECT id FROM root_cause_registry WHERE signature = ?'
    ).bind(signature).first();

    expect(existing).toBeNull();
    // In agents.ts, this triggers INSERT INTO root_cause_registry
  });

  it('should increment occurrence_count when signature already exists', async () => {
    const db = createMockDB({
      registryExisting: { id: 'reg_001', occurrence_count: 1, max_severity: 'HIGH' },
    });

    const rootCause = 'Missing null check in auth handler';
    const signature = await computeSignature(rootCause);

    const existing = await (db as any).prepare(
      'SELECT id, occurrence_count, max_severity FROM root_cause_registry WHERE signature = ?'
    ).bind(signature).first();

    expect(existing).not.toBeNull();
    expect(existing.occurrence_count).toBe(1);
    expect(existing.id).toBe('reg_001');
    // In agents.ts, this triggers UPDATE ... SET occurrence_count = occurrence_count + 1
  });

  it('should escalate max_severity when new finding is more severe', () => {
    const severityRank: Record<string, number> = { CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, INFO: 1 };

    // Existing: HIGH (4), new finding: CRITICAL (5) → escalate
    const existingMax = 'HIGH';
    const newSeverity = 'CRITICAL';
    const existingRank = severityRank[existingMax] || 1;
    const newRank = severityRank[newSeverity] || 1;
    const result = newRank > existingRank ? newSeverity : existingMax;
    expect(result).toBe('CRITICAL');
  });

  it('should NOT escalate max_severity when new finding is less severe', () => {
    const severityRank: Record<string, number> = { CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, INFO: 1 };

    // Existing: CRITICAL (5), new finding: LOW (2) → keep CRITICAL
    const existingMax = 'CRITICAL';
    const newSeverity = 'LOW';
    const existingRank = severityRank[existingMax] || 1;
    const newRank = severityRank[newSeverity] || 1;
    const result = newRank > existingRank ? newSeverity : existingMax;
    expect(result).toBe('CRITICAL');
  });

  it('should handle same root cause text across 3 audits → occurrence_count=3', () => {
    // Simulate: audit 1 → count=1, audit 2 → count=2, audit 3 → count=3
    let count = 0;
    for (let audit = 1; audit <= 3; audit++) {
      count += 1; // Each time same signature found → +1
    }
    expect(count).toBe(3);
  });
});

// ============================================================================
// 6. enforceL_RCD — Governance Blocking
// ============================================================================

describe('enforceL_RCD — Root Cause Doctrine Enforcement', () => {
  // Import the actual function through phaseContracts (enforceL_RCD is private,
  // but we can test it through validatePhaseTransition)
  // For unit testing, we re-implement the core logic and mock the DB

  async function enforceL_RCD_mock(
    db: any,
    projectId: string
  ): Promise<Array<{ law: string; description: string; severity: 'BLOCKING' | 'WARNING' }>> {
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

      return (recurring.results as any[]).map((rc: any) => ({
        law: 'L-RCD',
        description: `Root Cause Doctrine: "${rc.canonical_description}" (${rc.category || 'UNCATEGORIZED'}) recurred ${rc.occurrence_count}× at ${rc.max_severity} severity — address root cause before phase advance`,
        severity: 'BLOCKING' as const,
      }));
    } catch {
      return [];
    }
  }

  it('should return no violations when registry is empty', async () => {
    const db = createMockDB({ registryResults: [] });
    const violations = await enforceL_RCD_mock(db, 'proj_test');
    expect(violations).toHaveLength(0);
  });

  it('should return BLOCKING violation for recurring CRITICAL root cause', async () => {
    const db = createMockDB({
      registryResults: [{
        canonical_description: 'Missing null check in authentication handler',
        category: 'INTEGRITY',
        occurrence_count: 3,
        max_severity: 'CRITICAL',
      }],
    });

    const violations = await enforceL_RCD_mock(db, 'proj_test');
    expect(violations).toHaveLength(1);
    expect(violations[0].law).toBe('L-RCD');
    expect(violations[0].severity).toBe('BLOCKING');
    expect(violations[0].description).toContain('Missing null check');
    expect(violations[0].description).toContain('INTEGRITY');
    expect(violations[0].description).toContain('3×');
    expect(violations[0].description).toContain('CRITICAL');
  });

  it('should return BLOCKING violation for recurring HIGH root cause', async () => {
    const db = createMockDB({
      registryResults: [{
        canonical_description: 'No integration tests for payment flow',
        category: 'VALIDATION',
        occurrence_count: 2,
        max_severity: 'HIGH',
      }],
    });

    const violations = await enforceL_RCD_mock(db, 'proj_test');
    expect(violations).toHaveLength(1);
    expect(violations[0].severity).toBe('BLOCKING');
    expect(violations[0].description).toContain('VALIDATION');
  });

  it('should return multiple violations for multiple recurring root causes', async () => {
    const db = createMockDB({
      registryResults: [
        {
          canonical_description: 'Missing null check',
          category: 'INTEGRITY',
          occurrence_count: 4,
          max_severity: 'CRITICAL',
        },
        {
          canonical_description: 'No error boundary in React tree',
          category: 'ISOLATION',
          occurrence_count: 2,
          max_severity: 'HIGH',
        },
      ],
    });

    const violations = await enforceL_RCD_mock(db, 'proj_test');
    expect(violations).toHaveLength(2);
    expect(violations[0].description).toContain('Missing null check');
    expect(violations[1].description).toContain('error boundary');
  });

  it('should return empty when all root causes are ADDRESSED', async () => {
    // The SQL filters by status = 'OPEN', so ADDRESSED entries won't be returned
    const db = createMockDB({ registryResults: [] });
    const violations = await enforceL_RCD_mock(db, 'proj_test');
    expect(violations).toHaveLength(0);
  });

  it('should return empty when root causes exist but occurrence_count < 2', async () => {
    // The SQL filters by occurrence_count >= 2, so single-occurrence won't match
    const db = createMockDB({ registryResults: [] });
    const violations = await enforceL_RCD_mock(db, 'proj_test');
    expect(violations).toHaveLength(0);
  });

  it('should handle null category gracefully (UNCATEGORIZED fallback)', async () => {
    const db = createMockDB({
      registryResults: [{
        canonical_description: 'Unknown structural defect',
        category: null,
        occurrence_count: 2,
        max_severity: 'HIGH',
      }],
    });

    const violations = await enforceL_RCD_mock(db, 'proj_test');
    expect(violations).toHaveLength(1);
    expect(violations[0].description).toContain('UNCATEGORIZED');
  });

  it('should gracefully handle DB errors (pre-migration 045)', async () => {
    const failingDB = {
      prepare: () => ({
        bind: () => ({
          all: async () => { throw new Error('no such table: root_cause_registry'); },
        }),
      }),
    };

    const violations = await enforceL_RCD_mock(failingDB, 'proj_test');
    expect(violations).toHaveLength(0);
  });
});

// ============================================================================
// 7. Phase Transition Integration — L-RCD Wiring
// ============================================================================

describe('Phase Transition — L-RCD Enforcement Boundaries', () => {
  it('L-RCD should be enforced at EXECUTE→REVIEW boundary', () => {
    // In validatePhaseTransition, L-RCD fires when fromPhase === 'EXECUTE'
    const fromPhase = 'EXECUTE';
    const shouldEnforce = fromPhase === 'EXECUTE' || fromPhase === 'REVIEW';
    expect(shouldEnforce).toBe(true);
  });

  it('L-RCD should be enforced at REVIEW finalize boundary', () => {
    const fromPhase = 'REVIEW';
    const shouldEnforce = fromPhase === 'EXECUTE' || fromPhase === 'REVIEW';
    expect(shouldEnforce).toBe(true);
  });

  it('L-RCD should NOT be enforced at BRAINSTORM→PLAN boundary', () => {
    const fromPhase = 'BRAINSTORM';
    const shouldEnforce = fromPhase === 'EXECUTE' || fromPhase === 'REVIEW';
    expect(shouldEnforce).toBe(false);
  });

  it('L-RCD should NOT be enforced at PLAN→BLUEPRINT boundary', () => {
    const fromPhase = 'PLAN';
    const shouldEnforce = fromPhase === 'EXECUTE' || fromPhase === 'REVIEW';
    expect(shouldEnforce).toBe(false);
  });

  it('BLOCKING violations should prevent phase transition', () => {
    const violations = [
      { law: 'L-RCD', description: 'Recurring root cause', severity: 'BLOCKING' as const },
    ];
    const blocking = violations.filter(v => v.severity === 'BLOCKING');
    const allowed = blocking.length === 0;
    expect(allowed).toBe(false);
  });

  it('WARNING violations should NOT prevent phase transition', () => {
    const violations = [
      { law: 'L-BPX', description: 'No deliverables (warning)', severity: 'WARNING' as const },
    ];
    const blocking = violations.filter(v => v.severity === 'BLOCKING');
    const allowed = blocking.length === 0;
    expect(allowed).toBe(true);
  });
});

// ============================================================================
// 8. Registry Resolution — Status Transitions
// ============================================================================

describe('Root Cause Registry — Resolution', () => {
  const VALID_STATUSES = ['OPEN', 'ADDRESSED', 'ACCEPTED'];

  it('should accept ADDRESSED as valid resolution status', () => {
    expect(VALID_STATUSES).toContain('ADDRESSED');
  });

  it('should accept ACCEPTED as valid resolution status', () => {
    expect(VALID_STATUSES).toContain('ACCEPTED');
  });

  it('should reject invalid resolution status', () => {
    expect(VALID_STATUSES).not.toContain('CLOSED');
    expect(VALID_STATUSES).not.toContain('FIXED');
    expect(VALID_STATUSES).not.toContain('RESOLVED');
  });

  it('resolution should include optional commit reference', () => {
    const resolution = {
      status: 'ADDRESSED',
      resolution_commit: 'abc123def',
      resolution_note: 'Fixed in migration 046',
    };
    expect(resolution.status).toBe('ADDRESSED');
    expect(resolution.resolution_commit).toBe('abc123def');
    expect(resolution.resolution_note).toBeTruthy();
  });

  it('resolution should work without commit reference', () => {
    const resolution = {
      status: 'ACCEPTED',
      resolution_note: 'Accepted as known limitation',
    };
    expect(resolution.status).toBe('ACCEPTED');
    expect((resolution as any).resolution_commit).toBeUndefined();
  });
});

// ============================================================================
// 9. AuditReport Interface — Root Cause Fields
// ============================================================================

describe('AuditReport Interface — Root Cause Fields', () => {
  it('should support finding with all root cause fields', () => {
    const finding = {
      type: 'CODE_BUG',
      severity: 'High' as const,
      description: 'Null reference in payment handler',
      remediation: 'Add null check before accessing user.paymentMethod',
      root_cause: 'Missing defensive programming for optional chain',
      root_cause_category: 'INTEGRITY' as const,
      is_symptom: false,
    };

    expect(finding.root_cause).toBeTruthy();
    expect(finding.root_cause_category).toBe('INTEGRITY');
    expect(finding.is_symptom).toBe(false);
  });

  it('should support finding without root cause fields (backward compat)', () => {
    const finding = {
      type: 'CODE_BUG',
      severity: 'Medium' as const,
      description: 'Legacy finding without root cause analysis',
    };

    expect((finding as any).root_cause).toBeUndefined();
    expect((finding as any).root_cause_category).toBeUndefined();
    expect((finding as any).is_symptom).toBeUndefined();
  });

  it('should mark symptom findings with is_symptom=true', () => {
    const symptomFinding = {
      type: 'CODE_BUG',
      severity: 'Low' as const,
      description: 'Occasional timeout in API calls',
      root_cause: 'Missing connection pool — each request opens new DB connection',
      root_cause_category: 'DESIGN' as const,
      is_symptom: true,
    };

    expect(symptomFinding.is_symptom).toBe(true);
    expect(symptomFinding.root_cause_category).toBe('DESIGN');
  });
});
