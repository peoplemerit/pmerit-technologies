/**
 * Task Delegation Layer — Assignments API
 *
 * HANDOFF-TDL-01 Task 2: Full CRUD + lifecycle + escalation + standup + taskboard.
 *
 * Endpoints:
 *   CRUD:
 *     POST   /:projectId/assignments              — Assign deliverable(s)
 *     POST   /:projectId/assignments/batch         — Batch assign
 *     GET    /:projectId/assignments               — List assignments
 *     GET    /:projectId/assignments/:id            — Get assignment detail
 *     PUT    /:projectId/assignments/:id            — Update assignment
 *     DELETE /:projectId/assignments/:id            — Remove assignment
 *
 *   Lifecycle:
 *     POST   /:projectId/assignments/:id/start     — AI begins work
 *     POST   /:projectId/assignments/:id/progress  — AI updates progress
 *     POST   /:projectId/assignments/:id/submit    — AI submits for review
 *     POST   /:projectId/assignments/:id/accept    — Director accepts
 *     POST   /:projectId/assignments/:id/reject    — Director rejects
 *     POST   /:projectId/assignments/:id/pause     — Director pauses
 *     POST   /:projectId/assignments/:id/resume    — Director resumes
 *     POST   /:projectId/assignments/:id/block     — AI reports blocker
 *
 *   Escalation:
 *     POST   /:projectId/assignments/:id/escalate  — AI creates escalation
 *     GET    /:projectId/escalations               — List open escalations
 *     POST   /:projectId/escalations/:escId/resolve — Director resolves
 *
 *   Standup:
 *     POST   /:projectId/sessions/:sessionId/standup  — AI posts standup
 *     GET    /:projectId/sessions/:sessionId/standups — List standups
 *
 *   TaskBoard:
 *     GET    /:projectId/taskboard                 — Aggregated board view
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import { log } from '../utils/logger';
import { verifyProjectOwnership } from '../utils/projectOwnership';

const assignments = new Hono<{ Bindings: Env }>();

assignments.use('/*', requireAuth);

// ── Helpers ──

async function getAssignment(
  db: D1Database, projectId: string, assignmentId: string
): Promise<Record<string, unknown> | null> {
  return db.prepare(
    'SELECT * FROM task_assignments WHERE id = ? AND project_id = ?'
  ).bind(assignmentId, projectId).first<Record<string, unknown>>();
}

function parseJsonCol(val: unknown, fallback: unknown = []): unknown {
  if (!val || val === '') return fallback;
  try { return JSON.parse(val as string); } catch { return fallback; }
}

function formatAssignment(row: Record<string, unknown>) {
  return {
    ...row,
    authority_scope: parseJsonCol(row.authority_scope),
    escalation_triggers: parseJsonCol(row.escalation_triggers),
    completed_items: parseJsonCol(row.completed_items),
    remaining_items: parseJsonCol(row.remaining_items),
    submission_evidence: parseJsonCol(row.submission_evidence),
  };
}

async function logDecision(
  db: D1Database,
  projectId: string,
  action: string,
  actorId: string,
  metadata: Record<string, unknown>
) {
  const now = new Date().toISOString();
  await db.prepare(
    `INSERT INTO decision_ledger (project_id, action, phase_from, phase_to, actor_id, actor_role, gate_snapshot, artifact_check, result, reason, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    projectId,
    action,
    metadata.phase || 'EXECUTE',
    metadata.phase || 'EXECUTE',
    actorId,
    metadata.actor_role || 'DIRECTOR',
    JSON.stringify(metadata),
    '[]',
    'LOGGED',
    metadata.reason || action,
    now,
  ).run();
}

// ═══════════════════════════════════════════════════════════════════
// CRUD
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /:projectId/assignments — Assign deliverable to session
 */
assignments.post('/:projectId/assignments', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json();
  const {
    deliverable_id,
    session_id = null,
    priority = 'P1',
    authority_scope = [],
    escalation_triggers = [],
  } = body;

  if (!deliverable_id) {
    return c.json({ error: 'deliverable_id is required' }, 400);
  }

  // Verify deliverable exists in this project
  const deliverable = await c.env.DB.prepare(
    'SELECT id, name, status FROM blueprint_deliverables WHERE id = ? AND project_id = ?'
  ).bind(deliverable_id, projectId).first<{ id: string; name: string; status: string }>();

  if (!deliverable) {
    return c.json({ error: 'Deliverable not found in this project' }, 404);
  }

  // DAG enforcement: check upstream dependencies
  const deps = await c.env.DB.prepare(
    'SELECT upstream_deps FROM blueprint_deliverables WHERE id = ?'
  ).bind(deliverable_id).first<{ upstream_deps: string }>();

  const upstreamIds: string[] = JSON.parse(deps?.upstream_deps || '[]');
  if (upstreamIds.length > 0) {
    const placeholders = upstreamIds.map(() => '?').join(',');
    const unsatisfied = await c.env.DB.prepare(
      `SELECT id, name, status FROM blueprint_deliverables
       WHERE id IN (${placeholders})
       AND status NOT IN ('DONE', 'VERIFIED', 'LOCKED', 'CANCELLED')`
    ).bind(...upstreamIds).all<{ id: string; name: string; status: string }>();

    if (unsatisfied.results.length > 0) {
      return c.json({
        error: 'Cannot assign: upstream dependencies not satisfied',
        unsatisfied: unsatisfied.results.map(d => ({ id: d.id, name: d.name, status: d.status })),
      }, 422);
    }
  }

  // Check for active assignment on same deliverable
  const existing = await c.env.DB.prepare(
    `SELECT id FROM task_assignments
     WHERE deliverable_id = ? AND project_id = ?
     AND status NOT IN ('ACCEPTED', 'PAUSED')`
  ).bind(deliverable_id, projectId).first();

  if (existing) {
    return c.json({ error: 'Deliverable already has an active assignment' }, 409);
  }

  // Verify session if provided
  if (session_id) {
    const session = await c.env.DB.prepare(
      'SELECT id, status FROM project_sessions WHERE id = ? AND project_id = ?'
    ).bind(session_id, projectId).first<{ id: string; status: string }>();
    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO task_assignments
     (id, project_id, deliverable_id, session_id, priority, status, authority_scope, escalation_triggers, assigned_by, assigned_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'ASSIGNED', ?, ?, ?, ?, ?)`
  ).bind(
    id, projectId, deliverable_id, session_id,
    priority,
    JSON.stringify(authority_scope),
    JSON.stringify(escalation_triggers),
    userId, now, now,
  ).run();

  // Update deliverable status to IN_PROGRESS if it's still DRAFT/READY
  if (['DRAFT', 'READY'].includes(deliverable.status)) {
    await c.env.DB.prepare(
      "UPDATE blueprint_deliverables SET status = 'IN_PROGRESS', updated_at = ? WHERE id = ?"
    ).bind(now, deliverable_id).run();
  }

  await logDecision(c.env.DB, projectId, 'TASK_ASSIGN', userId, {
    deliverable_id, deliverable_name: deliverable.name, priority, session_id,
    reason: `Assigned ${deliverable.name} [${priority}]`,
  });

  const created = await getAssignment(c.env.DB, projectId, id);
  return c.json(formatAssignment(created!), 201);
});

/**
 * POST /:projectId/assignments/batch — Batch assign deliverables
 * Reactivated 2026-02-17 for CRIT-03 fix (auto-task-generation).
 */
assignments.post('/:projectId/assignments/batch', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json();
  const { assignments: items = [], session_id } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return c.json({ error: 'assignments array required' }, 400);
  }

  const created: unknown[] = [];
  const rejected: Array<{ deliverable_id: string; reason: string }> = [];
  const now = new Date().toISOString();

  for (const item of items) {
    const { deliverable_id, priority = 'P1', authority_scope = [] } = item;

    // Verify deliverable
    const deliverable = await c.env.DB.prepare(
      'SELECT id, name, status, upstream_deps FROM blueprint_deliverables WHERE id = ? AND project_id = ?'
    ).bind(deliverable_id, projectId).first<{ id: string; name: string; status: string; upstream_deps: string }>();

    if (!deliverable) {
      rejected.push({ deliverable_id, reason: 'Deliverable not found' });
      continue;
    }

    // DAG check
    const upstreamIds: string[] = JSON.parse(deliverable.upstream_deps || '[]');
    if (upstreamIds.length > 0) {
      const placeholders = upstreamIds.map(() => '?').join(',');
      const unsatisfied = await c.env.DB.prepare(
        `SELECT id FROM blueprint_deliverables WHERE id IN (${placeholders}) AND status NOT IN ('DONE', 'VERIFIED', 'LOCKED', 'CANCELLED')`
      ).bind(...upstreamIds).all();
      if (unsatisfied.results.length > 0) {
        rejected.push({ deliverable_id, reason: 'Upstream dependencies not satisfied' });
        continue;
      }
    }

    // Check existing active assignment
    const existing = await c.env.DB.prepare(
      `SELECT id FROM task_assignments WHERE deliverable_id = ? AND project_id = ? AND status NOT IN ('ACCEPTED', 'PAUSED')`
    ).bind(deliverable_id, projectId).first();
    if (existing) {
      rejected.push({ deliverable_id, reason: 'Already has active assignment' });
      continue;
    }

    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO task_assignments
       (id, project_id, deliverable_id, session_id, priority, status, authority_scope, escalation_triggers, assigned_by, assigned_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'ASSIGNED', ?, '[]', ?, ?, ?)`
    ).bind(id, projectId, deliverable_id, session_id || null, priority, JSON.stringify(authority_scope), userId, now, now).run();

    if (['DRAFT', 'READY'].includes(deliverable.status)) {
      await c.env.DB.prepare(
        "UPDATE blueprint_deliverables SET status = 'IN_PROGRESS', updated_at = ? WHERE id = ?"
      ).bind(now, deliverable_id).run();
    }

    const row = await getAssignment(c.env.DB, projectId, id);
    created.push(formatAssignment(row!));
  }

  if (created.length > 0) {
    await logDecision(c.env.DB, projectId, 'TASK_BATCH_ASSIGN', userId, {
      count: created.length, session_id,
      reason: `Batch assigned ${created.length} deliverable(s)`,
    });
  }

  return c.json({ created, rejected }, 201);
});

/**
 * POST /:projectId/assignments/auto-generate — Auto-create assignments from blueprint
 * CRIT-03 fix: Queries all DRAFT/READY deliverables and batch-assigns them.
 * Called automatically on PLAN → EXECUTE finalization and available as manual CTA.
 */
assignments.post('/:projectId/assignments/auto-generate', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Fetch all assignable deliverables
  const deliverables = await c.env.DB.prepare(
    `SELECT d.id, d.name, d.status, d.upstream_deps
     FROM blueprint_deliverables d
     JOIN blueprint_scopes s ON d.scope_id = s.id
     WHERE s.project_id = ? AND d.status IN ('DRAFT', 'READY')`
  ).bind(projectId).all<{ id: string; name: string; status: string; upstream_deps: string }>();

  if (!deliverables.results?.length) {
    return c.json({ created: 0, rejected: 0, message: 'No assignable deliverables found' });
  }

  const created: unknown[] = [];
  const rejected: Array<{ deliverable_id: string; name: string; reason: string }> = [];
  const now = new Date().toISOString();

  for (const del of deliverables.results) {
    // DAG check — skip deliverables with unsatisfied upstream deps
    const upstreamIds: string[] = JSON.parse(del.upstream_deps || '[]');
    if (upstreamIds.length > 0) {
      const placeholders = upstreamIds.map(() => '?').join(',');
      const unsatisfied = await c.env.DB.prepare(
        `SELECT id FROM blueprint_deliverables WHERE id IN (${placeholders}) AND status NOT IN ('DONE', 'VERIFIED', 'LOCKED', 'CANCELLED')`
      ).bind(...upstreamIds).all();
      if (unsatisfied.results.length > 0) {
        rejected.push({ deliverable_id: del.id, name: del.name, reason: 'Upstream dependencies not satisfied' });
        continue;
      }
    }

    // Skip if already has active assignment
    const existing = await c.env.DB.prepare(
      `SELECT id FROM task_assignments WHERE deliverable_id = ? AND project_id = ? AND status NOT IN ('ACCEPTED', 'PAUSED')`
    ).bind(del.id, projectId).first();
    if (existing) {
      rejected.push({ deliverable_id: del.id, name: del.name, reason: 'Already has active assignment' });
      continue;
    }

    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO task_assignments
       (id, project_id, deliverable_id, session_id, priority, status, authority_scope, escalation_triggers, assigned_by, assigned_at, updated_at)
       VALUES (?, ?, ?, NULL, 'P1', 'ASSIGNED', '[]', '[]', ?, ?, ?)`
    ).bind(id, projectId, del.id, userId, now, now).run();

    // Transition deliverable to IN_PROGRESS
    if (['DRAFT', 'READY'].includes(del.status)) {
      await c.env.DB.prepare(
        "UPDATE blueprint_deliverables SET status = 'IN_PROGRESS', updated_at = ? WHERE id = ?"
      ).bind(now, del.id).run();
    }

    const row = await getAssignment(c.env.DB, projectId, id);
    created.push(formatAssignment(row!));
  }

  if (created.length > 0) {
    await logDecision(c.env.DB, projectId, 'AUTO_TASK_ASSIGN', userId, {
      count: created.length,
      reason: `Auto-assigned ${created.length} deliverable(s) from blueprint`,
    });
  }

  log.info('auto_generate_assignments', {
    project_id: projectId,
    created: created.length,
    rejected: rejected.length,
  });

  return c.json({ created: created.length, rejected: rejected.length, details: { created, rejected } }, 201);
});

/**
 * GET /:projectId/assignments — List assignments
 */
assignments.get('/:projectId/assignments', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const sessionFilter = c.req.query('session_id');
  const statusFilter = c.req.query('status');
  const priorityFilter = c.req.query('priority');

  let query = `SELECT ta.*, bd.name as deliverable_name, bd.dod_evidence_spec
               FROM task_assignments ta
               JOIN blueprint_deliverables bd ON ta.deliverable_id = bd.id
               WHERE ta.project_id = ?`;
  const params: (string | number)[] = [projectId];

  if (sessionFilter) { query += ' AND ta.session_id = ?'; params.push(sessionFilter); }
  if (statusFilter) { query += ' AND ta.status = ?'; params.push(statusFilter.toUpperCase()); }
  if (priorityFilter) { query += ' AND ta.priority = ?'; params.push(priorityFilter.toUpperCase()); }

  query += ` ORDER BY
    CASE ta.priority WHEN 'P0' THEN 0 WHEN 'P1' THEN 1 WHEN 'P2' THEN 2 END,
    ta.sort_order`;

  const result = await c.env.DB.prepare(query).bind(...params).all<Record<string, unknown>>();
  return c.json({ assignments: result.results.map(formatAssignment) });
});

/**
 * GET /:projectId/assignments/:id — Get assignment detail
 */
assignments.get('/:projectId/assignments/:id', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const assignmentId = c.req.param('id');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const row = await c.env.DB.prepare(
    `SELECT ta.*, bd.name as deliverable_name, bd.dod_evidence_spec, bd.dod_verification_method, bd.dod_quality_bar
     FROM task_assignments ta
     JOIN blueprint_deliverables bd ON ta.deliverable_id = bd.id
     WHERE ta.id = ? AND ta.project_id = ?`
  ).bind(assignmentId, projectId).first<Record<string, unknown>>();

  if (!row) return c.json({ error: 'Assignment not found' }, 404);
  return c.json(formatAssignment(row));
});

/**
 * PUT /:projectId/assignments/:id — Update assignment (reprioritize, reassign)
 */
assignments.put('/:projectId/assignments/:id', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const assignmentId = c.req.param('id');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await getAssignment(c.env.DB, projectId, assignmentId);
  if (!existing) return c.json({ error: 'Assignment not found' }, 404);

  const body = await c.req.json();
  const now = new Date().toISOString();
  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.priority) { updates.push('priority = ?'); values.push(body.priority); }
  if (body.sort_order !== undefined) { updates.push('sort_order = ?'); values.push(body.sort_order); }
  if (body.session_id !== undefined) { updates.push('session_id = ?'); values.push(body.session_id); }
  if (body.authority_scope) { updates.push('authority_scope = ?'); values.push(JSON.stringify(body.authority_scope)); }
  if (body.escalation_triggers) { updates.push('escalation_triggers = ?'); values.push(JSON.stringify(body.escalation_triggers)); }

  if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400);

  updates.push('updated_at = ?');
  values.push(now, assignmentId, projectId);

  await c.env.DB.prepare(
    `UPDATE task_assignments SET ${updates.join(', ')} WHERE id = ? AND project_id = ?`
  ).bind(...values).run();

  if (body.priority && body.priority !== existing.priority) {
    await logDecision(c.env.DB, projectId, 'TASK_REPRIORITIZE', userId, {
      assignment_id: assignmentId, old_priority: existing.priority, new_priority: body.priority,
      reason: `Reprioritized from ${existing.priority} to ${body.priority}`,
    });
  }

  const updated = await getAssignment(c.env.DB, projectId, assignmentId);
  return c.json(formatAssignment(updated!));
});

/**
 * DELETE /:projectId/assignments/:id — Remove assignment
 */
assignments.delete('/:projectId/assignments/:id', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const assignmentId = c.req.param('id');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await getAssignment(c.env.DB, projectId, assignmentId);
  if (!existing) return c.json({ error: 'Assignment not found' }, 404);

  if (['ACCEPTED'].includes(existing.status as string)) {
    return c.json({ error: 'Cannot delete an accepted assignment' }, 409);
  }

  await c.env.DB.prepare(
    'DELETE FROM task_assignments WHERE id = ? AND project_id = ?'
  ).bind(assignmentId, projectId).run();

  return c.json({ success: true, deleted: assignmentId });
});

// ═══════════════════════════════════════════════════════════════════
// Lifecycle
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /:projectId/assignments/:id/start — AI signals work begun
 */
assignments.post('/:projectId/assignments/:id/start', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const assignmentId = c.req.param('id');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await getAssignment(c.env.DB, projectId, assignmentId);
  if (!existing) return c.json({ error: 'Assignment not found' }, 404);

  if (!['ASSIGNED', 'REJECTED'].includes(existing.status as string)) {
    return c.json({ error: `Cannot start from status: ${existing.status}` }, 409);
  }

  const now = new Date().toISOString();
  await c.env.DB.prepare(
    "UPDATE task_assignments SET status = 'IN_PROGRESS', started_at = COALESCE(started_at, ?), updated_at = ? WHERE id = ?"
  ).bind(now, now, assignmentId).run();

  await logDecision(c.env.DB, projectId, 'TASK_START', userId, {
    assignment_id: assignmentId, reason: 'Work begun',
  });

  const updated = await getAssignment(c.env.DB, projectId, assignmentId);
  return c.json(formatAssignment(updated!));
});

/**
 * POST /:projectId/assignments/:id/progress — AI updates progress
 */
assignments.post('/:projectId/assignments/:id/progress', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const assignmentId = c.req.param('id');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await getAssignment(c.env.DB, projectId, assignmentId);
  if (!existing) return c.json({ error: 'Assignment not found' }, 404);

  if (existing.status !== 'IN_PROGRESS') {
    return c.json({ error: `Cannot update progress for status: ${existing.status}` }, 409);
  }

  const body = await c.req.json();
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `UPDATE task_assignments SET
       progress_notes = COALESCE(?, progress_notes),
       progress_percent = COALESCE(?, progress_percent),
       completed_items = COALESCE(?, completed_items),
       remaining_items = COALESCE(?, remaining_items),
       updated_at = ?
     WHERE id = ?`
  ).bind(
    body.progress_notes || null,
    body.progress_percent ?? null,
    body.completed_items ? JSON.stringify(body.completed_items) : null,
    body.remaining_items ? JSON.stringify(body.remaining_items) : null,
    now, assignmentId,
  ).run();

  const updated = await getAssignment(c.env.DB, projectId, assignmentId);
  return c.json(formatAssignment(updated!));
});

/**
 * POST /:projectId/assignments/:id/submit — AI submits for review
 */
assignments.post('/:projectId/assignments/:id/submit', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const assignmentId = c.req.param('id');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await getAssignment(c.env.DB, projectId, assignmentId);
  if (!existing) return c.json({ error: 'Assignment not found' }, 404);

  if (existing.status !== 'IN_PROGRESS') {
    return c.json({ error: `Cannot submit from status: ${existing.status}` }, 409);
  }

  const body = await c.req.json();
  if (!body.summary?.trim()) {
    return c.json({ error: 'summary is required for submission' }, 400);
  }

  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `UPDATE task_assignments SET
       status = 'SUBMITTED',
       submitted_at = ?,
       submission_summary = ?,
       submission_evidence = ?,
       progress_percent = 100,
       updated_at = ?
     WHERE id = ?`
  ).bind(
    now,
    body.summary,
    JSON.stringify(body.evidence || []),
    now, assignmentId,
  ).run();

  await logDecision(c.env.DB, projectId, 'TASK_SUBMIT', userId, {
    assignment_id: assignmentId, summary: body.summary,
    reason: 'Submitted for Director review',
  });

  const updated = await getAssignment(c.env.DB, projectId, assignmentId);
  return c.json(formatAssignment(updated!));
});

/**
 * POST /:projectId/assignments/:id/accept — Director accepts
 */
assignments.post('/:projectId/assignments/:id/accept', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const assignmentId = c.req.param('id');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await getAssignment(c.env.DB, projectId, assignmentId);
  if (!existing) return c.json({ error: 'Assignment not found' }, 404);

  if (existing.status !== 'SUBMITTED') {
    return c.json({ error: `Cannot accept from status: ${existing.status}` }, 409);
  }

  const body = await c.req.json().catch((err: unknown) => {
    log.debug('accept_body_parse_skipped', { assignment_id: assignmentId, reason: err instanceof Error ? err.message : 'no body' });
    return {};
  });
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `UPDATE task_assignments SET
       status = 'ACCEPTED',
       reviewed_at = ?,
       reviewed_by = ?,
       review_verdict = 'ACCEPTED',
       review_notes = ?,
       completed_at = ?,
       updated_at = ?
     WHERE id = ?`
  ).bind(now, userId, body.notes || null, now, now, assignmentId).run();

  // Update deliverable status to DONE (Conservation Law: DONE cannot go back without explicit UNLOCK)
  await c.env.DB.prepare(
    "UPDATE blueprint_deliverables SET status = 'DONE', updated_at = ? WHERE id = ?"
  ).bind(now, existing.deliverable_id).run();

  await logDecision(c.env.DB, projectId, 'TASK_ACCEPT', userId, {
    assignment_id: assignmentId, deliverable_id: existing.deliverable_id,
    reason: 'Director accepted deliverable',
  });

  const updated = await getAssignment(c.env.DB, projectId, assignmentId);
  return c.json(formatAssignment(updated!));
});

/**
 * POST /:projectId/assignments/:id/reject — Director rejects
 */
assignments.post('/:projectId/assignments/:id/reject', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const assignmentId = c.req.param('id');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await getAssignment(c.env.DB, projectId, assignmentId);
  if (!existing) return c.json({ error: 'Assignment not found' }, 404);

  if (existing.status !== 'SUBMITTED') {
    return c.json({ error: `Cannot reject from status: ${existing.status}` }, 409);
  }

  const body = await c.req.json();
  if (!body.notes?.trim()) {
    return c.json({ error: 'notes required — Director must explain rejection' }, 400);
  }

  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `UPDATE task_assignments SET
       status = 'REJECTED',
       reviewed_at = ?,
       reviewed_by = ?,
       review_verdict = 'REJECTED',
       review_notes = ?,
       updated_at = ?
     WHERE id = ?`
  ).bind(now, userId, body.notes, now, assignmentId).run();

  await logDecision(c.env.DB, projectId, 'TASK_REJECT', userId, {
    assignment_id: assignmentId, notes: body.notes,
    reason: `Director rejected: ${body.notes.slice(0, 100)}`,
  });

  const updated = await getAssignment(c.env.DB, projectId, assignmentId);
  return c.json(formatAssignment(updated!));
});

// DEAD ENDPOINT: No frontend consumer — commented 2026-02-12
/**
 * POST /:projectId/assignments/:id/pause — Director pauses
 */
// assignments.post('/:projectId/assignments/:id/pause', async (c) => {
//   const userId = c.get('userId');
//   const projectId = c.req.param('projectId');
//   const assignmentId = c.req.param('id');

//   if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
//     return c.json({ error: 'Project not found' }, 404);
//   }

//   const existing = await getAssignment(c.env.DB, projectId, assignmentId);
//   if (!existing) return c.json({ error: 'Assignment not found' }, 404);

//   if (!['ASSIGNED', 'IN_PROGRESS', 'BLOCKED'].includes(existing.status as string)) {
//     return c.json({ error: `Cannot pause from status: ${existing.status}` }, 409);
//   }

//   const now = new Date().toISOString();
//   await c.env.DB.prepare(
//     "UPDATE task_assignments SET status = 'PAUSED', updated_at = ? WHERE id = ?"
//   ).bind(now, assignmentId).run();

//   await logDecision(c.env.DB, projectId, 'TASK_PAUSE', userId, {
//     assignment_id: assignmentId, reason: 'Director paused assignment',
//   });

//   const updated = await getAssignment(c.env.DB, projectId, assignmentId);
//   return c.json(formatAssignment(updated!));
// });

// DEAD ENDPOINT: No frontend consumer — commented 2026-02-12
/**
 * POST /:projectId/assignments/:id/resume — Director resumes
 */
// assignments.post('/:projectId/assignments/:id/resume', async (c) => {
//   const userId = c.get('userId');
//   const projectId = c.req.param('projectId');
//   const assignmentId = c.req.param('id');

//   if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
//     return c.json({ error: 'Project not found' }, 404);
//   }

//   const existing = await getAssignment(c.env.DB, projectId, assignmentId);
//   if (!existing) return c.json({ error: 'Assignment not found' }, 404);

//   if (existing.status !== 'PAUSED') {
//     return c.json({ error: `Cannot resume from status: ${existing.status}` }, 409);
//   }

//   const now = new Date().toISOString();
//   // Resume to IN_PROGRESS if work was started, otherwise ASSIGNED
//   const resumeStatus = existing.started_at ? 'IN_PROGRESS' : 'ASSIGNED';
//   await c.env.DB.prepare(
//     'UPDATE task_assignments SET status = ?, updated_at = ? WHERE id = ?'
//   ).bind(resumeStatus, now, assignmentId).run();

//   await logDecision(c.env.DB, projectId, 'TASK_RESUME', userId, {
//     assignment_id: assignmentId, resume_status: resumeStatus,
//     reason: `Director resumed assignment → ${resumeStatus}`,
//   });

//   const updated = await getAssignment(c.env.DB, projectId, assignmentId);
//   return c.json(formatAssignment(updated!));
// });

/**
 * POST /:projectId/assignments/:id/block — AI reports blocker
 */
assignments.post('/:projectId/assignments/:id/block', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const assignmentId = c.req.param('id');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await getAssignment(c.env.DB, projectId, assignmentId);
  if (!existing) return c.json({ error: 'Assignment not found' }, 404);

  if (existing.status !== 'IN_PROGRESS') {
    return c.json({ error: `Cannot block from status: ${existing.status}` }, 409);
  }

  const body = await c.req.json();
  if (!body.reason?.trim()) {
    return c.json({ error: 'reason is required' }, 400);
  }

  const now = new Date().toISOString();
  await c.env.DB.prepare(
    "UPDATE task_assignments SET status = 'BLOCKED', blocked_reason = ?, blocked_since = ?, updated_at = ? WHERE id = ?"
  ).bind(body.reason, now, now, assignmentId).run();

  const updated = await getAssignment(c.env.DB, projectId, assignmentId);
  return c.json(formatAssignment(updated!));
});

// ═══════════════════════════════════════════════════════════════════
// Escalation
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /:projectId/assignments/:id/escalate — AI creates escalation
 */
assignments.post('/:projectId/assignments/:id/escalate', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const assignmentId = c.req.param('id');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const existing = await getAssignment(c.env.DB, projectId, assignmentId);
  if (!existing) return c.json({ error: 'Assignment not found' }, 404);

  if (!['IN_PROGRESS', 'BLOCKED'].includes(existing.status as string)) {
    return c.json({ error: `Cannot escalate from status: ${existing.status}` }, 409);
  }

  const body = await c.req.json();
  if (!body.decision_needed?.trim()) {
    return c.json({ error: 'decision_needed is required' }, 400);
  }
  const options = body.options || [];
  if (!Array.isArray(options) || options.length < 2 || options.length > 4) {
    return c.json({ error: 'options must have 2-4 entries' }, 400);
  }

  const escId = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO escalation_log
     (id, project_id, assignment_id, decision_needed, options, recommendation, recommendation_rationale, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)`
  ).bind(
    escId, projectId, assignmentId,
    body.decision_needed,
    JSON.stringify(options),
    body.recommendation || null,
    body.rationale || null,
    now,
  ).run();

  // Mark assignment as BLOCKED
  await c.env.DB.prepare(
    "UPDATE task_assignments SET status = 'BLOCKED', blocked_reason = ?, blocked_since = ?, updated_at = ? WHERE id = ?"
  ).bind(`Escalation: ${body.decision_needed.slice(0, 100)}`, now, now, assignmentId).run();

  await logDecision(c.env.DB, projectId, 'ESCALATION', userId, {
    assignment_id: assignmentId, escalation_id: escId,
    decision_needed: body.decision_needed,
    reason: `Escalation: ${body.decision_needed.slice(0, 100)}`,
    actor_role: 'COMMANDER',
  });

  const esc = await c.env.DB.prepare(
    'SELECT * FROM escalation_log WHERE id = ?'
  ).bind(escId).first<Record<string, unknown>>();

  return c.json({
    ...esc,
    options: parseJsonCol(esc?.options),
  }, 201);
});

/**
 * GET /:projectId/escalations — List escalations
 */
assignments.get('/:projectId/escalations', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const statusFilter = c.req.query('status');
  let query = 'SELECT * FROM escalation_log WHERE project_id = ?';
  const params: string[] = [projectId];
  if (statusFilter) { query += ' AND status = ?'; params.push(statusFilter.toUpperCase()); }
  query += ' ORDER BY created_at DESC';

  const result = await c.env.DB.prepare(query).bind(...params).all<Record<string, unknown>>();
  return c.json({
    escalations: result.results.map(e => ({
      ...e,
      options: parseJsonCol(e.options),
    })),
  });
});

/**
 * POST /:projectId/escalations/:escId/resolve — Director resolves
 */
assignments.post('/:projectId/escalations/:escId/resolve', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const escId = c.req.param('escId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const esc = await c.env.DB.prepare(
    'SELECT * FROM escalation_log WHERE id = ? AND project_id = ?'
  ).bind(escId, projectId).first<Record<string, unknown>>();

  if (!esc) return c.json({ error: 'Escalation not found' }, 404);
  if (esc.status !== 'OPEN') {
    return c.json({ error: `Escalation already ${esc.status}` }, 409);
  }

  const body = await c.req.json();
  if (!body.resolution?.trim()) {
    return c.json({ error: 'resolution is required' }, 400);
  }

  const now = new Date().toISOString();
  await c.env.DB.prepare(
    "UPDATE escalation_log SET status = 'RESOLVED', resolution = ?, resolved_by = ?, resolved_at = ? WHERE id = ?"
  ).bind(body.resolution, userId, now, escId).run();

  // Unblock the assignment
  const assignmentId = esc.assignment_id as string;
  await c.env.DB.prepare(
    "UPDATE task_assignments SET status = 'IN_PROGRESS', blocked_reason = NULL, blocked_since = NULL, updated_at = ? WHERE id = ? AND status = 'BLOCKED'"
  ).bind(now, assignmentId).run();

  await logDecision(c.env.DB, projectId, 'ESCALATION_RESOLVED', userId, {
    escalation_id: escId, assignment_id: assignmentId,
    resolution: body.resolution,
    reason: `Resolved: ${body.resolution.slice(0, 100)}`,
  });

  const updated = await c.env.DB.prepare(
    'SELECT * FROM escalation_log WHERE id = ?'
  ).bind(escId).first<Record<string, unknown>>();

  return c.json({ ...updated, options: parseJsonCol(updated?.options) });
});

// ═══════════════════════════════════════════════════════════════════
// Standup
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /:projectId/sessions/:sessionId/standup — AI posts standup
 */
assignments.post('/:projectId/sessions/:sessionId/standup', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const sessionId = c.req.param('sessionId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json();
  if (!body.working_on?.trim()) {
    return c.json({ error: 'working_on is required' }, 400);
  }

  // Get next report number
  const last = await c.env.DB.prepare(
    'SELECT report_number FROM standup_reports WHERE session_id = ? ORDER BY report_number DESC LIMIT 1'
  ).bind(sessionId).first<{ report_number: number }>();

  const reportNumber = (last?.report_number || 0) + 1;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO standup_reports
     (id, project_id, session_id, report_number, working_on, completed_since_last, in_progress, blocked, next_actions, estimate_to_completion, escalations_needed, message_number, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, projectId, sessionId, reportNumber,
    body.working_on,
    JSON.stringify(body.completed_since_last || []),
    JSON.stringify(body.in_progress || []),
    JSON.stringify(body.blocked || []),
    JSON.stringify(body.next_actions || []),
    body.estimate_to_completion || null,
    JSON.stringify(body.escalations_needed || []),
    body.message_number || null,
    now,
  ).run();

  const created = await c.env.DB.prepare(
    'SELECT * FROM standup_reports WHERE id = ?'
  ).bind(id).first<Record<string, unknown>>();

  return c.json({
    ...created,
    completed_since_last: parseJsonCol(created?.completed_since_last),
    in_progress: parseJsonCol(created?.in_progress),
    blocked: parseJsonCol(created?.blocked),
    next_actions: parseJsonCol(created?.next_actions),
    escalations_needed: parseJsonCol(created?.escalations_needed),
  }, 201);
});

/**
 * GET /:projectId/sessions/:sessionId/standups — List standups for session
 */
assignments.get('/:projectId/sessions/:sessionId/standups', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const sessionId = c.req.param('sessionId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const result = await c.env.DB.prepare(
    'SELECT * FROM standup_reports WHERE project_id = ? AND session_id = ? ORDER BY report_number ASC'
  ).bind(projectId, sessionId).all<Record<string, unknown>>();

  return c.json({
    standups: result.results.map(s => ({
      ...s,
      completed_since_last: parseJsonCol(s.completed_since_last),
      in_progress: parseJsonCol(s.in_progress),
      blocked: parseJsonCol(s.blocked),
      next_actions: parseJsonCol(s.next_actions),
      escalations_needed: parseJsonCol(s.escalations_needed),
    })),
  });
});

// ═══════════════════════════════════════════════════════════════════
// TaskBoard
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /:projectId/taskboard — Aggregated board view
 */
assignments.get('/:projectId/taskboard', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const allAssignments = await c.env.DB.prepare(
    `SELECT ta.*, bd.name as deliverable_name, bd.dod_evidence_spec
     FROM task_assignments ta
     JOIN blueprint_deliverables bd ON ta.deliverable_id = bd.id
     WHERE ta.project_id = ?
     ORDER BY
       CASE ta.priority WHEN 'P0' THEN 0 WHEN 'P1' THEN 1 WHEN 'P2' THEN 2 END,
       ta.sort_order`
  ).bind(projectId).all<Record<string, unknown>>();

  const formatted = allAssignments.results.map(formatAssignment);

  const group = (status: string) => formatted.filter(a => (a as Record<string, unknown>).status === status);

  const openEscalations = await c.env.DB.prepare(
    "SELECT * FROM escalation_log WHERE project_id = ? AND status = 'OPEN' ORDER BY created_at DESC"
  ).bind(projectId).all<Record<string, unknown>>();

  // Get last standup across any session
  const lastStandup = await c.env.DB.prepare(
    'SELECT * FROM standup_reports WHERE project_id = ? ORDER BY created_at DESC LIMIT 1'
  ).bind(projectId).first<Record<string, unknown>>();

  const accepted = group('ACCEPTED');
  const total = formatted.length;

  return c.json({
    backlog: group('BACKLOG'),
    assigned: group('ASSIGNED'),
    in_progress: group('IN_PROGRESS'),
    blocked: group('BLOCKED'),
    submitted: group('SUBMITTED'),
    accepted,
    rejected: group('REJECTED'),
    paused: group('PAUSED'),
    open_escalations: openEscalations.results.map(e => ({
      ...e, options: parseJsonCol(e.options),
    })),
    last_standup: lastStandup ? {
      ...lastStandup,
      completed_since_last: parseJsonCol(lastStandup.completed_since_last),
      in_progress: parseJsonCol(lastStandup.in_progress),
      blocked: parseJsonCol(lastStandup.blocked),
      next_actions: parseJsonCol(lastStandup.next_actions),
      escalations_needed: parseJsonCol(lastStandup.escalations_needed),
    } : null,
    stats: {
      total,
      completed: accepted.length,
      completion_percent: total > 0 ? Math.round((accepted.length / total) * 100) : 0,
      blocked_count: group('BLOCKED').length,
    },
  });
});

export default assignments;
