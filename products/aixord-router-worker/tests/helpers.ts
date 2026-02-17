/**
 * Test Helpers — Mock D1 & Factory Functions
 *
 * Provides a lightweight mock D1Database that returns configurable results
 * for each SQL pattern, plus factory functions for common test entities.
 */

export type MockQueryResult = {
  pattern: RegExp | string;
  result: unknown;
  runResult?: { success: boolean; changes?: number };
};

/**
 * Creates a mock D1Database that matches SQL queries against patterns
 * and returns preconfigured results.
 */
export function createMockDB(queries: MockQueryResult[] = []) {
  const executions: Array<{ sql: string; params: unknown[] }> = [];

  function findResult(sql: string): MockQueryResult | undefined {
    return queries.find(q =>
      typeof q.pattern === 'string'
        ? sql.includes(q.pattern)
        : q.pattern.test(sql)
    );
  }

  const mockDB = {
    _executions: executions,

    prepare(sql: string) {
      let boundParams: unknown[] = [];

      const stmt = {
        bind(...params: unknown[]) {
          boundParams = params;
          return stmt;
        },
        async first<T = unknown>(): Promise<T | null> {
          executions.push({ sql, params: boundParams });
          const match = findResult(sql);
          return (match?.result ?? null) as T | null;
        },
        async all<T = unknown>(): Promise<{ results: T[] }> {
          executions.push({ sql, params: boundParams });
          const match = findResult(sql);
          const results = match?.result;
          if (Array.isArray(results)) return { results: results as T[] };
          return { results: results ? [results as T] : [] };
        },
        async run() {
          executions.push({ sql, params: boundParams });
          const match = findResult(sql);
          const rr = match?.runResult ?? { success: true, changes: 1 };
          // D1's run() returns { success, meta: { changes, ... } }
          return { success: rr.success, meta: { changes: rr.changes ?? 0 } };
        },
      };

      return stmt;
    },

    /**
     * Mock D1 batch() — Phase 1.2: Webhook handlers now use db.batch()
     * for atomic multi-table updates. This executes each prepared statement's
     * run() method sequentially (matching real D1 batch behavior).
     */
    async batch(statements: Array<{ run: () => Promise<unknown> }>) {
      const results = [];
      for (const stmt of statements) {
        results.push(await stmt.run());
      }
      return results;
    },
  };

  return mockDB;
}

// ============================================================================
// Factory Functions
// ============================================================================

let idCounter = 0;
export function genId(prefix = 'test'): string {
  return `${prefix}_${++idCounter}_${Math.random().toString(36).slice(2, 8)}`;
}

export function resetIdCounter() {
  idCounter = 0;
}

/** Create a project row */
export function makeProject(overrides: Partial<{
  id: string;
  name: string;
  objective: string;
  owner_id: string;
}> = {}) {
  return {
    id: overrides.id ?? genId('proj'),
    name: overrides.name ?? 'Test Project',
    objective: overrides.objective ?? 'A well-defined project objective for testing purposes',
    owner_id: overrides.owner_id ?? 'user_owner_001',
  };
}

/** Create a project_state row */
export function makeProjectState(overrides: Partial<{
  project_id: string;
  phase: string;
  gates: string;
  phase_locked: number;
}> = {}) {
  return {
    project_id: overrides.project_id ?? genId('proj'),
    phase: overrides.phase ?? 'BRAINSTORM',
    gates: overrides.gates ?? '{}',
    phase_locked: overrides.phase_locked ?? 0,
  };
}

/** Create a brainstorm artifact row */
export function makeBrainstormArtifact(overrides: Partial<{
  id: string;
  project_id: string;
  version: number;
  status: string;
  options: string;
  assumptions: string;
  decision_criteria: string;
  kill_conditions: string;
}> = {}) {
  const defaultOptions = [
    {
      id: 'opt_1', title: 'Option A', description: 'First approach',
      assumptions: ['Market exists for this'], kill_conditions: ['Revenue below $1000/mo'],
    },
    {
      id: 'opt_2', title: 'Option B', description: 'Second approach',
      assumptions: ['Technology is mature enough'], kill_conditions: ['Performance drops below 100ms'],
    },
  ];

  return {
    id: overrides.id ?? genId('artifact'),
    project_id: overrides.project_id ?? genId('proj'),
    version: overrides.version ?? 1,
    status: overrides.status ?? 'DRAFT',
    options: overrides.options ?? JSON.stringify(defaultOptions),
    assumptions: overrides.assumptions ?? JSON.stringify(['Global assumption about market timing']),
    decision_criteria: overrides.decision_criteria ?? JSON.stringify({
      criteria: [{ name: 'Feasibility', weight: 0.5 }, { name: 'Impact', weight: 0.5 }],
    }),
    kill_conditions: overrides.kill_conditions ?? JSON.stringify(['Overall kill if budget exceeds $50000']),
  };
}

/** Create a task_assignment row */
export function makeAssignment(overrides: Partial<{
  id: string;
  project_id: string;
  deliverable_id: string;
  session_id: string;
  priority: string;
  status: string;
  assigned_by: string;
  started_at: string | null;
  submitted_at: string | null;
  completed_at: string | null;
  submission_summary: string | null;
  submission_evidence: string;
  progress_percent: number;
  review_verdict: string | null;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
}> = {}) {
  return {
    id: overrides.id ?? genId('assign'),
    project_id: overrides.project_id ?? genId('proj'),
    deliverable_id: overrides.deliverable_id ?? genId('deliv'),
    session_id: overrides.session_id ?? genId('sess'),
    priority: overrides.priority ?? 'P1',
    status: overrides.status ?? 'ASSIGNED',
    assigned_by: overrides.assigned_by ?? 'user_owner_001',
    started_at: overrides.started_at ?? null,
    submitted_at: overrides.submitted_at ?? null,
    completed_at: overrides.completed_at ?? null,
    submission_summary: overrides.submission_summary ?? null,
    submission_evidence: overrides.submission_evidence ?? '[]',
    progress_percent: overrides.progress_percent ?? 0,
    review_verdict: overrides.review_verdict ?? null,
    review_notes: overrides.review_notes ?? null,
    reviewed_by: overrides.reviewed_by ?? null,
    reviewed_at: overrides.reviewed_at ?? null,
    authority_scope: '[]',
    escalation_triggers: '[]',
    completed_items: '[]',
    remaining_items: '[]',
    assigned_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/** Create a blueprint_scope row */
export function makeScope(overrides: Partial<{
  id: string;
  project_id: string;
  name: string;
  boundary: string;
}> = {}) {
  return {
    id: overrides.id ?? genId('scope'),
    project_id: overrides.project_id ?? genId('proj'),
    name: overrides.name ?? 'Test Scope',
    boundary: overrides.boundary ?? 'Well-defined scope boundary',
  };
}

/** Create a blueprint_deliverable row */
export function makeDeliverable(overrides: Partial<{
  id: string;
  project_id: string;
  scope_id: string;
  name: string;
  status: string;
  dod_evidence_spec: string;
  upstream_deps: string;
}> = {}) {
  return {
    id: overrides.id ?? genId('deliv'),
    project_id: overrides.project_id ?? genId('proj'),
    scope_id: overrides.scope_id ?? genId('scope'),
    name: overrides.name ?? 'Test Deliverable',
    status: overrides.status ?? 'OPEN',
    dod_evidence_spec: overrides.dod_evidence_spec ?? 'Unit tests passing with 80% coverage',
    upstream_deps: overrides.upstream_deps ?? '[]',
  };
}
