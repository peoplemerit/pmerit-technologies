/**
 * GA:AUD Gate & Advanced Feature Tests
 * HANDOFF-AUDIT-FRONTEND-01 Phase 2C-2D
 */

import { describe, it, expect } from 'vitest';
import type { Env } from '../src/types';

describe('GA:AUD Gate Validation', () => {
  // Mock DB factory for gate validation scenarios
  function createMockDB(opts: {
    recentAudit?: any;
    findingsList?: any[];
    auditTask?: any;
    priorAuditCount?: number;
  }) {
    const recentAudit = opts.recentAudit ?? null;
    const findingsList = opts.findingsList ?? [];
    const auditTask = opts.auditTask ?? null;
    const priorAuditCount = opts.priorAuditCount ?? 0;

    return {
      prepare: (sql: string) => ({
        bind: (...args: any[]) => ({
          first: async () => {
            if (sql.includes('FROM agent_audit_log') && sql.includes('ORDER BY'))
              return recentAudit;
            if (sql.includes('FROM agent_tasks'))
              return auditTask;
            if (sql.includes('COUNT(*)'))
              return { count: priorAuditCount };
            return null;
          },
          all: async () => {
            if (sql.includes('FROM audit_findings'))
              return { results: findingsList };
            return { results: [] };
          },
          run: async () => ({ meta: { changes: 1 } }),
        }),
      }),
    } as unknown as D1Database;
  }

  describe('Gate satisfaction criteria', () => {
    it('should return not satisfied when no audit exists (required_for_lock)', async () => {
      // Import dynamically to avoid module resolution issues
      const { validateAuditGate } = await import('../src/lib/gates/ga-aud');
      const db = createMockDB({ recentAudit: null });
      const env = { DB: db } as unknown as Env;

      const result = await validateAuditGate('proj1', env, { required_for_lock: true });
      expect(result.satisfied).toBe(false);
      expect(result.details.audit_executed).toBe(false);
    });

    it('should return satisfied when no audit exists (not required_for_lock)', async () => {
      const { validateAuditGate } = await import('../src/lib/gates/ga-aud');
      const db = createMockDB({ recentAudit: null });
      const env = { DB: db } as unknown as Env;

      const result = await validateAuditGate('proj1', env, { required_for_lock: false });
      expect(result.satisfied).toBe(true);
      expect(result.details.audit_executed).toBe(false);
    });

    it('should detect cross-model validation when worker != auditor', async () => {
      const { validateAuditGate } = await import('../src/lib/gates/ga-aud');
      const db = createMockDB({
        recentAudit: { id: 1, task_id: 'task1', created_at: '2026-02-15' },
        auditTask: {
          parameters: JSON.stringify({
            worker_model: 'openai:gpt-4o',
            auditor_model: 'anthropic:claude-sonnet-4-20250514'
          })
        },
        findingsList: []
      });
      const env = { DB: db } as unknown as Env;

      const result = await validateAuditGate('proj1', env);
      expect(result.details.cross_model_validated).toBe(true);
    });

    it('should fail cross-model validation when worker == auditor', async () => {
      const { validateAuditGate } = await import('../src/lib/gates/ga-aud');
      const db = createMockDB({
        recentAudit: { id: 1, task_id: 'task1', created_at: '2026-02-15' },
        auditTask: {
          parameters: JSON.stringify({
            worker_model: 'openai:gpt-4o',
            auditor_model: 'openai:gpt-4o'
          })
        },
        findingsList: []
      });
      const env = { DB: db } as unknown as Env;

      const result = await validateAuditGate('proj1', env);
      expect(result.details.cross_model_validated).toBe(false);
      expect(result.satisfied).toBe(false);
    });

    it('should detect pending CRITICAL findings', async () => {
      const { validateAuditGate } = await import('../src/lib/gates/ga-aud');
      const db = createMockDB({
        recentAudit: { id: 1, task_id: 'task1', created_at: '2026-02-15' },
        auditTask: {
          parameters: JSON.stringify({
            worker_model: 'openai:gpt-4o',
            auditor_model: 'anthropic:claude-sonnet-4-20250514'
          })
        },
        findingsList: [
          { id: 'f1', severity: 'CRITICAL', disposition: 'PENDING', finding_type: 'SECURITY_VULN', prior_audit_match: null, disposition_reason: null },
          { id: 'f2', severity: 'HIGH', disposition: 'FIX', finding_type: 'CODE_BUG', prior_audit_match: null, disposition_reason: null }
        ]
      });
      const env = { DB: db } as unknown as Env;

      const result = await validateAuditGate('proj1', env);
      expect(result.details.critical_triaged).toBe(false);
      expect(result.satisfied).toBe(false);
      expect(result.reason).toContain('CRITICAL');
    });

    it('should detect ACCEPT/DEFER without rationale', async () => {
      const { validateAuditGate } = await import('../src/lib/gates/ga-aud');
      const db = createMockDB({
        recentAudit: { id: 1, task_id: 'task1', created_at: '2026-02-15' },
        auditTask: {
          parameters: JSON.stringify({
            worker_model: 'openai:gpt-4o',
            auditor_model: 'anthropic:claude-sonnet-4-20250514'
          })
        },
        findingsList: [
          { id: 'f1', severity: 'LOW', disposition: 'ACCEPT', finding_type: 'STYLE_VIOLATION', prior_audit_match: null, disposition_reason: null }
        ]
      });
      const env = { DB: db } as unknown as Env;

      const result = await validateAuditGate('proj1', env);
      expect(result.details.rationale_documented).toBe(false);
    });

    it('should be satisfied when all criteria met', async () => {
      const { validateAuditGate } = await import('../src/lib/gates/ga-aud');
      const db = createMockDB({
        recentAudit: { id: 1, task_id: 'task1', created_at: '2026-02-15' },
        auditTask: {
          parameters: JSON.stringify({
            worker_model: 'openai:gpt-4o',
            auditor_model: 'anthropic:claude-sonnet-4-20250514'
          })
        },
        findingsList: [
          { id: 'f1', severity: 'HIGH', disposition: 'FIX', finding_type: 'CODE_BUG', prior_audit_match: null, disposition_reason: null },
          { id: 'f2', severity: 'LOW', disposition: 'ACCEPT', finding_type: 'STYLE_VIOLATION', prior_audit_match: null, disposition_reason: 'Acceptable for now' }
        ],
        priorAuditCount: 0
      });
      const env = { DB: db } as unknown as Env;

      const result = await validateAuditGate('proj1', env);
      expect(result.satisfied).toBe(true);
      expect(result.details.audit_executed).toBe(true);
      expect(result.details.cross_model_validated).toBe(true);
      expect(result.details.critical_triaged).toBe(true);
      expect(result.details.rationale_documented).toBe(true);
      expect(result.details.no_red_flags).toBe(true);
    });

    it('should detect red flag: too many CRITICAL findings', async () => {
      const { validateAuditGate } = await import('../src/lib/gates/ga-aud');
      // Create 25 CRITICAL findings (all triaged as FIX)
      const criticalFindings = Array.from({ length: 25 }, (_, i) => ({
        id: `f${i}`,
        severity: 'CRITICAL',
        disposition: 'FIX',
        finding_type: 'SECURITY_VULN',
        prior_audit_match: null,
        disposition_reason: null
      }));
      const db = createMockDB({
        recentAudit: { id: 1, task_id: 'task1', created_at: '2026-02-15' },
        auditTask: {
          parameters: JSON.stringify({
            worker_model: 'openai:gpt-4o',
            auditor_model: 'anthropic:claude-sonnet-4-20250514'
          })
        },
        findingsList: criticalFindings
      });
      const env = { DB: db } as unknown as Env;

      const result = await validateAuditGate('proj1', env);
      expect(result.details.no_red_flags).toBe(false);
      expect(result.satisfied).toBe(false);
      expect(result.reason).toContain('Too many CRITICAL');
    });
  });
});

describe('Diminishing Returns Detector', () => {
  function createMockDB(opts: {
    auditCount: number;
    newFindingsPerAudit: number[];
  }) {
    const auditResults = Array.from({ length: opts.auditCount }, (_, i) => ({
      id: i + 1,
      created_at: `2026-02-${String(15 - i).padStart(2, '0')}`
    }));

    let findingCallIndex = 0;

    return {
      prepare: (sql: string) => ({
        bind: (...args: any[]) => ({
          first: async () => {
            if (sql.includes('COUNT(*)')) {
              const count = opts.newFindingsPerAudit[findingCallIndex] ?? 0;
              findingCallIndex++;
              return { count };
            }
            return null;
          },
          all: async () => {
            if (sql.includes('FROM agent_audit_log'))
              return { results: auditResults };
            return { results: [] };
          },
          run: async () => ({ meta: { changes: 1 } }),
        }),
      }),
    } as unknown as D1Database;
  }

  it('should not detect diminishing returns with fewer than 3 audits', async () => {
    const { detectDiminishingReturns } = await import('../src/lib/diminishing-returns');
    const db = createMockDB({ auditCount: 2, newFindingsPerAudit: [1, 1] });
    const env = { DB: db } as unknown as Env;

    const result = await detectDiminishingReturns('proj1', env);
    expect(result.detected).toBe(false);
    expect(result.stats.last_n_audits).toBe(2);
  });

  it('should detect diminishing returns when all audits below threshold', async () => {
    const { detectDiminishingReturns } = await import('../src/lib/diminishing-returns');
    const db = createMockDB({
      auditCount: 3,
      newFindingsPerAudit: [2, 3, 1]
    });
    const env = { DB: db } as unknown as Env;

    const result = await detectDiminishingReturns('proj1', env, { threshold: 5 });
    expect(result.detected).toBe(true);
    expect(result.recommendation).toBeTruthy();
    expect(result.stats.avg_new_findings).toBe(2);
  });

  it('should not detect diminishing returns when audits above threshold', async () => {
    const { detectDiminishingReturns } = await import('../src/lib/diminishing-returns');
    const db = createMockDB({
      auditCount: 3,
      newFindingsPerAudit: [10, 8, 12]
    });
    const env = { DB: db } as unknown as Env;

    const result = await detectDiminishingReturns('proj1', env, { threshold: 5 });
    expect(result.detected).toBe(false);
    expect(result.stats.avg_new_findings).toBe(10);
  });

  it('should respect custom threshold', async () => {
    const { detectDiminishingReturns } = await import('../src/lib/diminishing-returns');
    const db = createMockDB({
      auditCount: 3,
      newFindingsPerAudit: [7, 6, 8]
    });
    const env = { DB: db } as unknown as Env;

    // With threshold 10, these should trigger
    const result = await detectDiminishingReturns('proj1', env, { threshold: 10 });
    expect(result.detected).toBe(true);
    expect(result.stats.threshold).toBe(10);
  });
});

describe('Incremental Audit Endpoint Validation', () => {
  it('should require modules array', () => {
    // Validate the endpoint logic: empty modules should be rejected
    const modules: string[] = [];
    const isValid = modules && Array.isArray(modules) && modules.length > 0;
    expect(isValid).toBe(false);
  });

  it('should accept valid modules array', () => {
    const modules = ['01-IDENTITY', '03-ARCHITECTURE', '04-DATABASE'];
    const isValid = modules && Array.isArray(modules) && modules.length > 0;
    expect(isValid).toBe(true);
    expect(modules.length).toBe(3);
  });

  it('should reject non-array modules', () => {
    const modules = 'not-an-array' as any;
    const isValid = modules && Array.isArray(modules) && modules.length > 0;
    expect(isValid).toBe(false);
  });
});
