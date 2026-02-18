/**
 * Project Continuity Capsule API (HANDOFF-PCC-01)
 *
 * Endpoints:
 * - GET  /:projectId/continuity                    — Full computed capsule
 * - GET  /:projectId/continuity/sessions/:sessionId — Session detail retrieval
 * - GET  /:projectId/continuity/decisions           — Decision lookup
 * - GET  /:projectId/continuity/artifacts           — Artifact retrieval
 * - GET  /:projectId/continuity/pins                — List pinned items
 * - POST /:projectId/continuity/pins                — Pin an item
 * - DELETE /:projectId/continuity/pins/:pinId       — Unpin an item
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { log } from '../utils/logger';
import { requireAuth } from '../middleware/requireAuth';

const continuity = new Hono<{ Bindings: Env }>();

continuity.use('/*', requireAuth);

// ============================================================================
// Types
// ============================================================================

export interface ProjectContinuityCapsule {
  project_id: string;
  objective: string;
  current_phase: string;
  phase_since: string;
  sessions_in_phase: number;

  session_timeline: Array<{
    number: number;
    type: string;
    status: string;
    summary: string | null;
    phase: string;
    message_count: number;
    closed_at: string | null;
  }>;

  selected_approach: {
    option_name: string;
    rationale: string;
  } | null;

  rejected_approaches: Array<{
    option_name: string;
    kill_reason: string;
  }>;

  key_decisions: Array<{
    id: string;
    action: string;
    summary: string | null;
    result: string;
    reason: string;
    created_at: string;
  }>;

  active_work: Array<{
    deliverable_name: string;
    status: string;
    priority: string;
    progress_percent: number;
  }>;

  open_escalations: Array<{
    deliverable_name: string;
    decision_needed: string;
  }>;

  known_constraints: string[];

  total_sessions: number;
  total_decisions: number;
  total_deliverables: number;
  completed_deliverables: number;

  pinned_items: Array<{
    id: string;
    pin_type: string;
    target_id: string;
    label: string | null;
    pinned_at: string;
  }>;
}

// ============================================================================
// Helpers
// ============================================================================

async function verifyProjectAccess(
  db: D1Database,
  projectId: string,
  userId: string
): Promise<boolean> {
  const project = await db.prepare(
    'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
  ).bind(projectId, userId).first();
  return !!project;
}

function parseJsonSafe<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ============================================================================
// GET /:projectId/continuity — Full computed capsule
// ============================================================================

continuity.get('/:projectId/continuity', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectAccess(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Q1: Project basics
  const project = await c.env.DB.prepare(
    'SELECT id, name, objective FROM projects WHERE id = ?'
  ).bind(projectId).first<{ id: string; name: string; objective: string }>();

  // Q2: Current phase
  const state = await c.env.DB.prepare(
    'SELECT phase, updated_at FROM project_state WHERE project_id = ?'
  ).bind(projectId).first<{ phase: string; updated_at: string }>();

  const currentPhase = state?.phase || 'BRAINSTORM';

  // Q3: Phase start date (from last FINALIZE_PHASE decision that moved to current phase)
  const phaseStart = await c.env.DB.prepare(
    `SELECT created_at FROM decision_ledger
     WHERE project_id = ? AND action = 'FINALIZE_PHASE' AND phase_to = ?
     ORDER BY created_at DESC LIMIT 1`
  ).bind(projectId, currentPhase).first<{ created_at: string }>();

  // Q4: Session timeline (last 5)
  const sessionRows = await c.env.DB.prepare(
    `SELECT session_number, session_type, status, summary, phase, message_count, closed_at
     FROM project_sessions
     WHERE project_id = ?
     ORDER BY session_number DESC LIMIT 5`
  ).bind(projectId).all<{
    session_number: number; session_type: string; status: string;
    summary: string | null; phase: string; message_count: number; closed_at: string | null;
  }>();

  // Q5: Sessions in current phase
  const sessionsInPhase = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM project_sessions WHERE project_id = ? AND phase = ?`
  ).bind(projectId, currentPhase).first<{ count: number }>();

  // Q6: Total sessions
  const totalSessions = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM project_sessions WHERE project_id = ?`
  ).bind(projectId).first<{ count: number }>();

  // Q7: Brainstorm artifact (selected + rejected approaches)
  let selectedApproach: ProjectContinuityCapsule['selected_approach'] = null;
  const rejectedApproaches: ProjectContinuityCapsule['rejected_approaches'] = [];

  const artifact = await c.env.DB.prepare(
    `SELECT options, recommendation, kill_conditions
     FROM brainstorm_artifacts WHERE project_id = ? AND status = 'FINALIZED'
     ORDER BY version DESC LIMIT 1`
  ).bind(projectId).first<{ options: string; recommendation: string; kill_conditions: string }>();

  if (artifact) {
    const options = parseJsonSafe<Array<{ id: string; title: string; kill_conditions: string[] }>>(artifact.options, []);
    if (artifact.recommendation && artifact.recommendation !== 'NO_SELECTION') {
      const selected = options.find(o => o.id === artifact.recommendation);
      if (selected) {
        selectedApproach = {
          option_name: selected.title,
          rationale: 'Selected by Director during BRAINSTORM finalization',
        };
      }
    }
    // Non-selected options are "rejected approaches" (negative knowledge)
    for (const opt of options) {
      if (opt.id !== artifact.recommendation) {
        rejectedApproaches.push({
          option_name: opt.title,
          kill_reason: opt.kill_conditions?.[0] || 'Not selected',
        });
      }
    }
  }

  // Q8: Key decisions (last 10)
  const decisionRows = await c.env.DB.prepare(
    `SELECT id, action, summary, result, reason, created_at
     FROM decision_ledger
     WHERE project_id = ? AND (supersedes_decision_id IS NULL OR supersedes_decision_id = '')
     ORDER BY created_at DESC LIMIT 10`
  ).bind(projectId).all<{
    id: string; action: string; summary: string | null; result: string;
    reason: string; created_at: string;
  }>();

  // Q9: Total decisions
  const totalDecisions = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM decision_ledger WHERE project_id = ?`
  ).bind(projectId).first<{ count: number }>();

  // Q10: Active work (TDL)
  const activeWork = await c.env.DB.prepare(
    `SELECT ta.status, ta.priority, ta.progress_percent, bd.name as deliverable_name
     FROM task_assignments ta
     JOIN blueprint_deliverables bd ON ta.deliverable_id = bd.id AND bd.project_id = ta.project_id
     WHERE ta.project_id = ? AND ta.status NOT IN ('ACCEPTED', 'PAUSED', 'REJECTED')
     ORDER BY CASE ta.priority WHEN 'P0' THEN 0 WHEN 'P1' THEN 1 ELSE 2 END`
  ).bind(projectId).all<{
    status: string; priority: string; progress_percent: number; deliverable_name: string;
  }>();

  // Q11: Open escalations
  const escalations = await c.env.DB.prepare(
    `SELECT el.decision_needed, bd.name as deliverable_name
     FROM escalation_log el
     JOIN task_assignments ta ON ta.id = el.assignment_id AND ta.project_id = el.project_id
     JOIN blueprint_deliverables bd ON ta.deliverable_id = bd.id AND bd.project_id = ta.project_id
     WHERE el.project_id = ? AND el.status = 'OPEN'`
  ).bind(projectId).all<{ decision_needed: string; deliverable_name: string }>();

  // Q12: Known constraints (scope boundaries)
  const constraintRows = await c.env.DB.prepare(
    `SELECT boundary FROM blueprint_scopes
     WHERE project_id = ? AND boundary IS NOT NULL AND boundary != ''
     LIMIT 10`
  ).bind(projectId).all<{ boundary: string }>();

  // Q13: Deliverable stats
  const delivStats = await c.env.DB.prepare(
    `SELECT COUNT(*) as total,
            SUM(CASE WHEN status IN ('DONE', 'VERIFIED', 'LOCKED', 'CANCELLED') THEN 1 ELSE 0 END) as completed
     FROM blueprint_deliverables WHERE project_id = ?`
  ).bind(projectId).first<{ total: number; completed: number }>();

  // Q14: Pinned items
  const pinRows = await c.env.DB.prepare(
    `SELECT id, pin_type, target_id, label, pinned_at
     FROM continuity_pins WHERE project_id = ?
     ORDER BY pinned_at DESC`
  ).bind(projectId).all<{
    id: string; pin_type: string; target_id: string; label: string | null; pinned_at: string;
  }>();

  const capsule: ProjectContinuityCapsule = {
    project_id: projectId,
    objective: project?.objective || '',
    current_phase: currentPhase,
    phase_since: phaseStart?.created_at || state?.updated_at || '',
    sessions_in_phase: sessionsInPhase?.count || 0,

    session_timeline: (sessionRows.results || []).map(r => ({
      number: r.session_number,
      type: r.session_type,
      status: r.status,
      summary: r.summary,
      phase: r.phase,
      message_count: r.message_count,
      closed_at: r.closed_at,
    })),

    selected_approach: selectedApproach,
    rejected_approaches: rejectedApproaches,

    key_decisions: (decisionRows.results || []).map(r => ({
      id: r.id,
      action: r.action,
      summary: r.summary,
      result: r.result,
      reason: r.reason,
      created_at: r.created_at,
    })),

    active_work: (activeWork.results || []).map(r => ({
      deliverable_name: r.deliverable_name,
      status: r.status,
      priority: r.priority,
      progress_percent: r.progress_percent || 0,
    })),

    open_escalations: (escalations.results || []).map(r => ({
      deliverable_name: r.deliverable_name,
      decision_needed: r.decision_needed,
    })),

    known_constraints: (constraintRows.results || []).map(r => r.boundary),

    total_sessions: totalSessions?.count || 0,
    total_decisions: totalDecisions?.count || 0,
    total_deliverables: delivStats?.total || 0,
    completed_deliverables: delivStats?.completed || 0,

    pinned_items: (pinRows.results || []).map(r => ({
      id: r.id,
      pin_type: r.pin_type,
      target_id: r.target_id,
      label: r.label,
      pinned_at: r.pinned_at,
    })),
  };

  return c.json(capsule);
});

// ============================================================================
// GET /:projectId/continuity/sessions/:sessionId — Session detail retrieval
// ============================================================================

continuity.get('/:projectId/continuity/sessions/:sessionId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const sessionId = c.req.param('sessionId');

  if (!await verifyProjectAccess(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const session = await c.env.DB.prepare(
    `SELECT session_number, session_type, status, summary, phase, message_count, closed_at, created_at
     FROM project_sessions WHERE project_id = ? AND id = ?`
  ).bind(projectId, sessionId).first<{
    session_number: number; session_type: string; status: string;
    summary: string | null; phase: string; message_count: number;
    closed_at: string | null; created_at: string;
  }>();

  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }

  // Get decisions made during this session
  const decisions = await c.env.DB.prepare(
    `SELECT id, action, summary, result, reason, created_at
     FROM decision_ledger WHERE project_id = ?
     ORDER BY created_at DESC`
  ).bind(projectId).all<{
    id: string; action: string; summary: string | null; result: string; reason: string; created_at: string;
  }>();

  return c.json({
    session,
    decisions: decisions.results || [],
  });
});

// ============================================================================
// GET /:projectId/continuity/decisions — Decision lookup
// ============================================================================

continuity.get('/:projectId/continuity/decisions', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectAccess(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const actionFilter = c.req.query('action');
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50);

  let sql = `SELECT id, action, phase_from, phase_to, actor_id, actor_role,
                    result, reason, summary, supersedes_decision_id, created_at
             FROM decision_ledger WHERE project_id = ?`;
  const params: unknown[] = [projectId];

  if (actionFilter) {
    sql += ' AND action = ?';
    params.push(actionFilter.toUpperCase());
  }

  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);

  const stmt = c.env.DB.prepare(sql);
  const rows = await stmt.bind(...params).all();

  return c.json({ decisions: rows.results || [] });
});

// ============================================================================
// GET /:projectId/continuity/artifacts — Artifact retrieval
// ============================================================================

continuity.get('/:projectId/continuity/artifacts', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectAccess(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const typeFilter = c.req.query('type');

  if (typeFilter === 'brainstorm') {
    const artifact = await c.env.DB.prepare(
      `SELECT * FROM brainstorm_artifacts WHERE project_id = ? ORDER BY version DESC LIMIT 1`
    ).bind(projectId).first();
    return c.json({ artifact: artifact || null });
  }

  // Default: return all artifact types summary
  const brainstorm = await c.env.DB.prepare(
    `SELECT id, version, status, created_at, updated_at
     FROM brainstorm_artifacts WHERE project_id = ? ORDER BY version DESC LIMIT 5`
  ).bind(projectId).all();

  return c.json({
    brainstorm_artifacts: brainstorm.results || [],
  });
});

// ============================================================================
// Continuity Pins CRUD
// ============================================================================

// GET /:projectId/continuity/pins
continuity.get('/:projectId/continuity/pins', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectAccess(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const pins = await c.env.DB.prepare(
    `SELECT id, pin_type, target_id, label, pinned_by, pinned_at
     FROM continuity_pins WHERE project_id = ?
     ORDER BY pinned_at DESC`
  ).bind(projectId).all();

  return c.json({ pins: pins.results || [] });
});

// POST /:projectId/continuity/pins
continuity.post('/:projectId/continuity/pins', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectAccess(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    pin_type: string;
    target_id: string;
    label?: string;
  }>();

  if (!body.pin_type || !body.target_id) {
    return c.json({ error: 'pin_type and target_id are required' }, 400);
  }

  const validTypes = ['decision', 'artifact', 'constraint', 'session'];
  if (!validTypes.includes(body.pin_type)) {
    return c.json({ error: `Invalid pin_type. Must be one of: ${validTypes.join(', ')}` }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await c.env.DB.prepare(
      `INSERT INTO continuity_pins (id, project_id, pin_type, target_id, label, pinned_by, pinned_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, projectId, body.pin_type, body.target_id, body.label || null, userId, now).run();
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      return c.json({ error: 'Item is already pinned' }, 409);
    }
    throw err;
  }

  return c.json({
    id,
    project_id: projectId,
    pin_type: body.pin_type,
    target_id: body.target_id,
    label: body.label || null,
    pinned_by: userId,
    pinned_at: now,
  }, 201);
});

// DELETE /:projectId/continuity/pins/:pinId
continuity.delete('/:projectId/continuity/pins/:pinId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const pinId = c.req.param('pinId');

  if (!await verifyProjectAccess(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  await c.env.DB.prepare(
    `DELETE FROM continuity_pins WHERE id = ? AND project_id = ?`
  ).bind(pinId, projectId).run();

  return c.body(null, 204);
});

// ============================================================================
// Compact Continuity for System Prompt (≤500 tokens)
// ============================================================================

/**
 * Builds a compact string representation of the project continuity
 * suitable for injection into the AI system prompt.
 * Token budget: ≤500 tokens (~2000 chars)
 */
export async function getProjectContinuityCompact(
  db: D1Database,
  projectId: string,
): Promise<string | null> {
  try {
    // Q1: Project + phase
    const project = await db.prepare(
      'SELECT objective FROM projects WHERE id = ?'
    ).bind(projectId).first<{ objective: string }>();

    if (!project) return null;

    let currentPhase = 'BRAINSTORM';
    try {
      const state = await db.prepare(
        'SELECT phase, updated_at FROM project_state WHERE project_id = ?'
      ).bind(projectId).first<{ phase: string; updated_at: string }>();
      currentPhase = state?.phase || 'BRAINSTORM';
    } catch (e) { log.warn('continuity_query_failed', { query: 'project_state', error: e instanceof Error ? e.message : String(e) }); }

    // Q2: Session timeline (last 3, compressed)
    let sessionList: Array<{ session_number: number; session_type: string; status: string; summary: string | null; phase: string }> = [];
    try {
      const sessionRows = await db.prepare(
        `SELECT session_number, session_type, status, summary, phase
         FROM project_sessions WHERE project_id = ?
         ORDER BY session_number DESC LIMIT 3`
      ).bind(projectId).all();
      sessionList = (sessionRows?.results as typeof sessionList) || [];
    } catch (e) { log.warn('continuity_query_failed', { query: 'project_sessions', error: e instanceof Error ? e.message : String(e) }); }

    // Q3: Key decisions (last 5, non-superseded)
    let decisionList: Array<{ action: string; summary: string | null; reason: string; result: string; created_at: string }> = [];
    try {
      const decisionRows = await db.prepare(
        `SELECT action, summary, reason, result, created_at
         FROM decision_ledger WHERE project_id = ?
           AND (supersedes_decision_id IS NULL OR supersedes_decision_id = '')
         ORDER BY created_at DESC LIMIT 5`
      ).bind(projectId).all();
      decisionList = (decisionRows?.results as typeof decisionList) || [];
    } catch (e) { log.warn('continuity_query_failed', { query: 'decision_ledger', error: e instanceof Error ? e.message : String(e) }); }

    // Q4: Active work (TDL, top 3)
    let activeList: Array<{ status: string; priority: string; progress_percent: number; deliverable_name: string }> = [];
    try {
      const activeWork = await db.prepare(
        `SELECT ta.status, ta.priority, ta.progress_percent, bd.name as deliverable_name
         FROM task_assignments ta
         JOIN blueprint_deliverables bd ON ta.deliverable_id = bd.id AND bd.project_id = ta.project_id
         WHERE ta.project_id = ? AND ta.status NOT IN ('ACCEPTED', 'PAUSED', 'REJECTED')
         ORDER BY CASE ta.priority WHEN 'P0' THEN 0 WHEN 'P1' THEN 1 ELSE 2 END
         LIMIT 3`
      ).bind(projectId).all();
      activeList = (activeWork?.results as typeof activeList) || [];
    } catch (e) { log.warn('continuity_query_failed', { query: 'task_assignments', error: e instanceof Error ? e.message : String(e) }); }

    // Q5: Open escalations
    let escalationList: Array<{ decision_needed: string }> = [];
    try {
      const escalations = await db.prepare(
        `SELECT el.decision_needed
         FROM escalation_log el
         WHERE el.project_id = ? AND el.status = 'OPEN'
         LIMIT 3`
      ).bind(projectId).all();
      escalationList = (escalations?.results as typeof escalationList) || [];
    } catch (e) { log.warn('continuity_query_failed', { query: 'escalation_log', error: e instanceof Error ? e.message : String(e) }); }

    // Q6: Pinned items (compressed)
    let pinList: Array<{ pin_type: string; label: string | null }> = [];
    try {
      const pins = await db.prepare(
        `SELECT pin_type, label FROM continuity_pins WHERE project_id = ? LIMIT 5`
      ).bind(projectId).all();
      pinList = (pins?.results as typeof pinList) || [];
    } catch (e) { log.warn('continuity_query_failed', { query: 'continuity_pins', error: e instanceof Error ? e.message : String(e) }); }

    // Q7: Deliverable progress
    let delivTotal = 0;
    let delivCompleted = 0;
    try {
      const delivStats = await db.prepare(
        `SELECT COUNT(*) as total,
                SUM(CASE WHEN status IN ('DONE', 'VERIFIED', 'LOCKED', 'CANCELLED') THEN 1 ELSE 0 END) as completed
         FROM blueprint_deliverables WHERE project_id = ?`
      ).bind(projectId).first<{ total: number; completed: number }>();
      delivTotal = delivStats?.total || 0;
      delivCompleted = delivStats?.completed || 0;
    } catch (e) { log.warn('continuity_query_failed', { query: 'blueprint_deliverables', error: e instanceof Error ? e.message : String(e) }); }

    // FIX-5: Brainstorm selected approach (~20 tokens)
    // Gives downstream phases minimal awareness of the chosen brainstorm option
    let selectedApproachName: string | null = null;
    try {
      const bsArtifact = await db.prepare(
        `SELECT options, recommendation FROM brainstorm_artifacts
         WHERE project_id = ? ORDER BY version DESC LIMIT 1`
      ).bind(projectId).first<{ options: string; recommendation: string | null }>();
      if (bsArtifact?.recommendation && bsArtifact.recommendation !== 'NO_SELECTION') {
        const opts = JSON.parse(bsArtifact.options || '[]') as Array<{ id: string; title: string }>;
        const selected = opts.find(o => o.id === bsArtifact.recommendation);
        selectedApproachName = selected?.title || bsArtifact.recommendation;
      }
    } catch (e) { log.warn('continuity_query_failed', { query: 'brainstorm_artifacts', error: e instanceof Error ? e.message : String(e) }); }

    // Build compact string
    const lines: string[] = [];

    // Objective + phase (~30 tokens)
    const objText = project.objective || 'No objective set';
    const objTruncated = objText.length > 120 ? objText.slice(0, 120) + '...' : objText;
    lines.push(`Objective: ${objTruncated}`);
    lines.push(`Phase: ${currentPhase}`);

    // Selected brainstorm approach (~10 tokens)
    if (selectedApproachName) {
      lines.push(`Approach: ${selectedApproachName}`);
    }

    // Session timeline (~50 tokens)
    if (sessionList.length > 0) {
      lines.push('Sessions:');
      for (const s of sessionList) {
        const summary = s.summary ? ` — ${s.summary.slice(0, 60)}` : '';
        lines.push(`  S${s.session_number} ${s.session_type} [${s.status}]${summary}`);
      }
    }

    // Key decisions (~80 tokens)
    if (decisionList.length > 0) {
      lines.push('Decisions:');
      for (const d of decisionList) {
        const label = d.summary || (d.reason ? d.reason.slice(0, 60) : 'No reason');
        lines.push(`  ${d.action} (${d.result}): ${label}`);
      }
    }

    // Active work (~40 tokens)
    if (activeList.length > 0) {
      lines.push('Active work:');
      for (const a of activeList) {
        lines.push(`  ${a.deliverable_name} [${a.status}, ${a.progress_percent || 0}%]`);
      }
    }

    // Escalations (~20 tokens)
    if (escalationList.length > 0) {
      lines.push(`Escalations: ${escalationList.map(e => (e.decision_needed || '').slice(0, 40)).join('; ')}`);
    }

    // Pinned items (~20 tokens)
    if (pinList.length > 0) {
      lines.push(`Pinned: ${pinList.map(p => p.label || `[${p.pin_type}]`).join(', ')}`);
    }

    // Progress (~10 tokens)
    if (delivTotal > 0) {
      lines.push(`Progress: ${delivCompleted}/${delivTotal} deliverables complete`);
    }

    return lines.join('\n');
  } catch (err) {
    log.error('pcc_compact_failed');
    return null;
  }
}

export default continuity;
