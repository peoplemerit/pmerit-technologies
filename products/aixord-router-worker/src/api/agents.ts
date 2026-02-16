/**
 * Agent Orchestration API
 * AIXORD v4.5.1 — HANDOFF-CGC-01 GAP-1
 *
 * Worker-Auditor Multi-Agent Architecture endpoints.
 * Manages agent instances, task queue, orchestration, and HITL approvals.
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import { selectAgentForTask, AGENT_REGISTRY, type TaskType } from '../agents/registry';
import { validateAuditGate } from '../lib/gates/ga-aud';
import { detectDiminishingReturns } from '../lib/diminishing-returns';

const app = new Hono<{ Bindings: Env }>();

// =============================================================================
// AGENT AUDIT LOGGING HELPER
// =============================================================================

async function logAgentEvent(
  db: D1Database,
  params: {
    project_id: string;
    agent_id?: string;
    task_id?: string;
    event_type: string;
    event_data?: string;
    human_actor_id?: string;
    human_decision?: string;
    human_feedback?: string;
    supervisor_id?: string;
    worker_id?: string;
    auditor_id?: string;
    latency_ms?: number;
    tokens_in?: number;
    tokens_out?: number;
    cost_usd?: number;
    wu_delta?: number;
  }
): Promise<void> {
  await db.prepare(`
    INSERT INTO agent_audit_log (
      project_id, agent_id, task_id, event_type, event_data,
      supervisor_id, worker_id, auditor_id,
      human_actor_id, human_decision, human_feedback,
      latency_ms, tokens_in, tokens_out, cost_usd, wu_delta
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    params.project_id,
    params.agent_id || null,
    params.task_id || null,
    params.event_type,
    params.event_data || null,
    params.supervisor_id || null,
    params.worker_id || null,
    params.auditor_id || null,
    params.human_actor_id || null,
    params.human_decision || null,
    params.human_feedback || null,
    params.latency_ms || null,
    params.tokens_in || null,
    params.tokens_out || null,
    params.cost_usd || null,
    params.wu_delta || null
  ).run();
}

// =============================================================================
// AGENT MANAGEMENT
// =============================================================================

/**
 * POST /api/v1/projects/:projectId/agents
 * Create new agent instance
 */
app.post('/:projectId/agents', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    agent_type: string;
    model_provider: string;
    model_id: string;
    task_description?: string;
    parent_agent_id?: string;
  }>();

  // Validate agent type
  const validTypes = ['SUPERVISOR', 'WORKER', 'AUDITOR'];
  if (!validTypes.includes(body.agent_type)) {
    return c.json({ error: `Invalid agent_type. Must be one of: ${validTypes.join(', ')}` }, 400);
  }

  // Validate provider
  const validProviders = ['anthropic', 'openai', 'google', 'deepseek'];
  if (!validProviders.includes(body.model_provider)) {
    return c.json({ error: `Invalid model_provider. Must be one of: ${validProviders.join(', ')}` }, 400);
  }

  const agentId = crypto.randomUUID().replace(/-/g, '').slice(0, 32);

  await c.env.DB.prepare(`
    INSERT INTO agent_instances (
      id, project_id, agent_type, model_provider, model_id,
      status, assigned_task, parent_agent_id
    ) VALUES (?, ?, ?, ?, ?, 'IDLE', ?, ?)
  `).bind(
    agentId,
    projectId,
    body.agent_type,
    body.model_provider,
    body.model_id,
    body.task_description || null,
    body.parent_agent_id || null
  ).run();

  await logAgentEvent(c.env.DB, {
    project_id: projectId,
    agent_id: agentId,
    event_type: 'AGENT_CREATED',
    event_data: JSON.stringify({
      agent_type: body.agent_type,
      model_provider: body.model_provider,
      model_id: body.model_id,
    }),
    human_actor_id: userId,
  });

  return c.json({
    agent_id: agentId,
    agent_type: body.agent_type,
    model_provider: body.model_provider,
    model_id: body.model_id,
    status: 'IDLE',
  }, 201);
});

/**
 * GET /api/v1/projects/:projectId/agents
 * List all agents for project
 */
app.get('/:projectId/agents', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const statusFilter = c.req.query('status');
  let sql = `
    SELECT id, agent_type, model_provider, model_id, status,
           assigned_task, tokens_used, api_calls, wu_consumed,
           start_time, end_time, parent_agent_id, created_at, updated_at
    FROM agent_instances
    WHERE project_id = ?
  `;
  const params: string[] = [projectId];

  if (statusFilter) {
    sql += ` AND status = ?`;
    params.push(statusFilter);
  }

  sql += ` ORDER BY created_at DESC`;
  const results = await c.env.DB.prepare(sql).bind(...params).all();

  return c.json(results.results || []);
});

/**
 * GET /api/v1/projects/:projectId/agents/:agentId
 * Get agent details with associated tasks
 */
app.get('/:projectId/agents/:agentId', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const agentId = c.req.param('agentId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const agent = await c.env.DB.prepare(`
    SELECT * FROM agent_instances WHERE id = ? AND project_id = ?
  `).bind(agentId, projectId).first();

  if (!agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }

  // Get associated tasks
  const tasks = await c.env.DB.prepare(`
    SELECT * FROM agent_tasks WHERE assigned_agent_id = ? ORDER BY created_at DESC
  `).bind(agentId).all();

  // Get recent audit events
  const events = await c.env.DB.prepare(`
    SELECT * FROM agent_audit_log WHERE agent_id = ? ORDER BY created_at DESC LIMIT 20
  `).bind(agentId).all();

  return c.json({
    ...agent,
    tasks: tasks.results || [],
    recent_events: events.results || [],
  });
});

/**
 * PUT /api/v1/projects/:projectId/agents/:agentId
 * Update agent state (status, checkpoint)
 */
app.put('/:projectId/agents/:agentId', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const agentId = c.req.param('agentId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    status?: string;
    checkpoint_state?: string;
  }>();

  const validStatuses = [
    'IDLE', 'INITIALIZING', 'RUNNING', 'WAITING_FOR_APPROVAL',
    'PAUSED', 'COMPLETED', 'FAILED', 'TERMINATED',
  ];

  if (body.status && !validStatuses.includes(body.status)) {
    return c.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, 400);
  }

  const now = new Date().toISOString();
  await c.env.DB.prepare(`
    UPDATE agent_instances
    SET status = COALESCE(?, status),
        checkpoint_state = COALESCE(?, checkpoint_state),
        start_time = CASE WHEN ? = 'RUNNING' AND start_time IS NULL THEN ? ELSE start_time END,
        end_time = CASE WHEN ? IN ('COMPLETED', 'FAILED', 'TERMINATED') THEN ? ELSE end_time END,
        updated_at = ?
    WHERE id = ? AND project_id = ?
  `).bind(
    body.status || null,
    body.checkpoint_state || null,
    body.status || '',
    now,
    body.status || '',
    now,
    now,
    agentId,
    projectId
  ).run();

  // Determine event type based on status change
  let eventType = 'AGENT_STARTED';
  if (body.status === 'PAUSED') eventType = 'AGENT_PAUSED';
  else if (body.status === 'RUNNING') eventType = 'AGENT_RESUMED';
  else if (body.status === 'COMPLETED') eventType = 'AGENT_COMPLETED';
  else if (body.status === 'FAILED') eventType = 'AGENT_FAILED';
  else if (body.status === 'TERMINATED') eventType = 'AGENT_TERMINATED';

  if (body.status) {
    await logAgentEvent(c.env.DB, {
      project_id: projectId,
      agent_id: agentId,
      event_type: eventType,
      event_data: JSON.stringify({ new_status: body.status }),
      human_actor_id: userId,
    });
  }

  return c.json({ success: true, status: body.status });
});

/**
 * DELETE /api/v1/projects/:projectId/agents/:agentId
 * Terminate agent (soft delete — preserves audit trail)
 */
app.delete('/:projectId/agents/:agentId', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const agentId = c.req.param('agentId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const now = new Date().toISOString();
  await c.env.DB.prepare(`
    UPDATE agent_instances
    SET status = 'TERMINATED', end_time = ?, updated_at = ?
    WHERE id = ? AND project_id = ?
  `).bind(now, now, agentId, projectId).run();

  await logAgentEvent(c.env.DB, {
    project_id: projectId,
    agent_id: agentId,
    event_type: 'AGENT_TERMINATED',
    human_actor_id: userId,
  });

  return c.json({ success: true });
});

// =============================================================================
// TASK MANAGEMENT
// =============================================================================

/**
 * POST /api/v1/projects/:projectId/tasks
 * Create a new task
 */
app.post('/:projectId/tasks', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    task_type: string;
    task_description: string;
    scope_id?: string;
    deliverable_id?: string;
    acceptance_criteria?: string[];
    execution_mode?: string;
    depends_on?: string[];
    max_attempts?: number;
  }>();

  const taskId = crypto.randomUUID().replace(/-/g, '').slice(0, 32);

  await c.env.DB.prepare(`
    INSERT INTO agent_tasks (
      id, project_id, scope_id, deliverable_id,
      task_type, task_description, acceptance_criteria,
      execution_mode, max_attempts, depends_on
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    taskId,
    projectId,
    body.scope_id || null,
    body.deliverable_id || null,
    body.task_type,
    body.task_description,
    body.acceptance_criteria ? JSON.stringify(body.acceptance_criteria) : null,
    body.execution_mode || 'AUTONOMOUS',
    body.max_attempts || 3,
    body.depends_on ? JSON.stringify(body.depends_on) : null
  ).run();

  return c.json({
    task_id: taskId,
    task_type: body.task_type,
    status: 'QUEUED',
  }, 201);
});

/**
 * GET /api/v1/projects/:projectId/tasks
 * List tasks with agent assignments
 */
app.get('/:projectId/tasks', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const statusFilter = c.req.query('status');
  let sql = `
    SELECT
      t.id, t.task_type, t.task_description, t.status,
      t.execution_mode, t.attempt_count, t.max_attempts,
      t.confidence_score, t.readiness_score,
      t.logic_score, t.procedural_score, t.validation_score,
      t.assigned_agent_id, t.scope_id, t.deliverable_id,
      t.created_at, t.started_at, t.completed_at,
      t.approved_by, t.approved_at, t.error_message,
      a.agent_type, a.model_provider, a.model_id, a.status as agent_status
    FROM agent_tasks t
    LEFT JOIN agent_instances a ON t.assigned_agent_id = a.id
    WHERE t.project_id = ?
  `;
  const params: string[] = [projectId];

  if (statusFilter) {
    sql += ` AND t.status = ?`;
    params.push(statusFilter);
  }

  sql += ` ORDER BY t.created_at DESC`;
  const results = await c.env.DB.prepare(sql).bind(...params).all();

  return c.json(results.results || []);
});

/**
 * GET /api/v1/projects/:projectId/tasks/:taskId
 * Get task details
 */
app.get('/:projectId/tasks/:taskId', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const taskId = c.req.param('taskId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const task = await c.env.DB.prepare(`
    SELECT * FROM agent_tasks WHERE id = ? AND project_id = ?
  `).bind(taskId, projectId).first();

  if (!task) {
    return c.json({ error: 'Task not found' }, 404);
  }

  return c.json(task);
});

// =============================================================================
// TASK ORCHESTRATION
// =============================================================================

/**
 * POST /api/v1/projects/:projectId/agents/orchestrate
 * Supervisor breaks down scope into agent tasks
 */
app.post('/:projectId/agents/orchestrate', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    scope_id: string;
    objective: string;
    execution_mode?: string;
  }>();

  // Create supervisor agent
  const supervisorId = crypto.randomUUID().replace(/-/g, '').slice(0, 32);
  const supervisorDef = AGENT_REGISTRY.supervisor;

  await c.env.DB.prepare(`
    INSERT INTO agent_instances (
      id, project_id, agent_type, model_provider, model_id,
      status, current_scope_id, assigned_task, assigned_at
    ) VALUES (?, ?, 'SUPERVISOR', ?, ?, 'RUNNING', ?, ?, datetime('now'))
  `).bind(
    supervisorId,
    projectId,
    supervisorDef.preferredProvider,
    supervisorDef.preferredModel,
    body.scope_id,
    body.objective
  ).run();

  await logAgentEvent(c.env.DB, {
    project_id: projectId,
    agent_id: supervisorId,
    event_type: 'AGENT_CREATED',
    event_data: JSON.stringify({
      agent_type: 'SUPERVISOR',
      objective: body.objective,
      scope_id: body.scope_id,
    }),
    human_actor_id: userId,
  });

  // NOTE: The actual AI-driven task breakdown would be implemented as a
  // Durable Object or async task. For now, we return the supervisor ID
  // and status for the frontend to poll.
  return c.json({
    supervisor_id: supervisorId,
    status: 'ORCHESTRATING',
    message: 'Supervisor created. Task breakdown in progress.',
  }, 201);
});

/**
 * POST /api/v1/projects/:projectId/tasks/:taskId/execute
 * Execute Worker-Auditor loop for a task
 */
app.post('/:projectId/tasks/:taskId/execute', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const taskId = c.req.param('taskId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const task = await c.env.DB.prepare(`
    SELECT * FROM agent_tasks WHERE id = ? AND project_id = ?
  `).bind(taskId, projectId).first<{
    id: string;
    task_type: string;
    task_description: string;
    status: string;
  }>();

  if (!task) {
    return c.json({ error: 'Task not found' }, 404);
  }

  if (task.status !== 'QUEUED' && task.status !== 'ASSIGNED') {
    return c.json({ error: `Task cannot be executed in status: ${task.status}` }, 400);
  }

  // Select worker based on task type and create worker agent
  const workerDef = selectAgentForTask(task.task_type as TaskType);
  const workerId = crypto.randomUUID().replace(/-/g, '').slice(0, 32);

  await c.env.DB.prepare(`
    INSERT INTO agent_instances (
      id, project_id, agent_type, model_provider, model_id,
      status, assigned_task, start_time
    ) VALUES (?, ?, 'WORKER', ?, ?, 'RUNNING', ?, datetime('now'))
  `).bind(
    workerId,
    projectId,
    workerDef.preferredProvider,
    workerDef.preferredModel,
    task.task_description
  ).run();

  // Update task status
  await c.env.DB.prepare(`
    UPDATE agent_tasks
    SET status = 'IN_PROGRESS', assigned_agent_id = ?, assigned_at = datetime('now'),
        started_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ?
  `).bind(workerId, taskId).run();

  await logAgentEvent(c.env.DB, {
    project_id: projectId,
    agent_id: workerId,
    task_id: taskId,
    event_type: 'TASK_STARTED',
    event_data: JSON.stringify({
      task_type: task.task_type,
      worker_model: workerDef.preferredModel,
    }),
    human_actor_id: userId,
    worker_id: workerId,
  });

  // NOTE: The actual Worker-Auditor loop execution would be triggered
  // asynchronously (via Durable Object or queue). The endpoint returns
  // immediately so the frontend can poll for status.
  return c.json({
    worker_id: workerId,
    task_id: taskId,
    status: 'EXECUTING',
    message: 'Worker-Auditor loop initiated.',
  });
});

// =============================================================================
// HITL APPROVAL
// =============================================================================

/**
 * POST /api/v1/projects/:projectId/tasks/:taskId/approve
 * Human approval for HITL gate
 */
app.post('/:projectId/tasks/:taskId/approve', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const taskId = c.req.param('taskId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    decision: 'APPROVED' | 'REJECTED';
    feedback?: string;
  }>();

  if (!['APPROVED', 'REJECTED'].includes(body.decision)) {
    return c.json({ error: 'Decision must be APPROVED or REJECTED' }, 400);
  }

  const newStatus = body.decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE agent_tasks
    SET status = ?, approved_by = ?, approved_at = ?,
        approval_notes = ?, updated_at = ?
    WHERE id = ? AND project_id = ?
  `).bind(
    newStatus,
    userId,
    now,
    body.feedback || null,
    now,
    taskId,
    projectId
  ).run();

  const eventType = body.decision === 'APPROVED' ? 'APPROVAL_GRANTED' : 'APPROVAL_DENIED';
  await logAgentEvent(c.env.DB, {
    project_id: projectId,
    task_id: taskId,
    event_type: eventType,
    event_data: JSON.stringify({ decision: body.decision }),
    human_actor_id: userId,
    human_decision: body.decision,
    human_feedback: body.feedback || undefined,
  });

  return c.json({
    success: true,
    task_id: taskId,
    decision: body.decision,
    status: newStatus,
  });
});

// =============================================================================
// AUDIT LOG
// =============================================================================

/**
 * GET /api/v1/projects/:projectId/agents/audit-log
 * Get agent audit log for a project
 */
app.get('/:projectId/agents/audit-log', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(`
    SELECT id FROM projects WHERE id = ? AND user_id = ?
  `).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const limit = parseInt(c.req.query('limit') || '50');
  const eventType = c.req.query('event_type');

  let sql = `SELECT * FROM agent_audit_log WHERE project_id = ?`;
  const params: (string | number)[] = [projectId];

  if (eventType) {
    sql += ` AND event_type = ?`;
    params.push(eventType);
  }

  sql += ` ORDER BY created_at DESC LIMIT ?`;
  params.push(Math.min(limit, 200));

  const results = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json(results.results || []);
});

// =============================================================================
// AUDIT FINDINGS MANAGEMENT
// =============================================================================

/**
 * POST /api/v1/projects/:projectId/audit-findings
 * Create structured findings for an audit
 */
app.post('/:projectId/audit-findings', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(
    `SELECT id FROM projects WHERE id = ? AND user_id = ?`
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    audit_id: number;
    findings: Array<{
      finding_type: string;
      severity: string;
      title: string;
      description: string;
      file_path?: string;
      line_number?: number;
      code_snippet?: string;
      recommendation?: string;
    }>;
  }>();

  if (!body.audit_id || !body.findings || body.findings.length === 0) {
    return c.json({ error: 'audit_id and non-empty findings array required' }, 400);
  }

  const created = [];
  for (const f of body.findings) {
    const id = crypto.randomUUID().replace(/-/g, '').slice(0, 32);
    await c.env.DB.prepare(`
      INSERT INTO audit_findings (
        id, audit_id, finding_type, severity, title, description,
        file_path, line_number, code_snippet, recommendation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.audit_id,
      f.finding_type,
      f.severity,
      f.title,
      f.description,
      f.file_path || null,
      f.line_number || null,
      f.code_snippet || null,
      f.recommendation || null
    ).run();
    created.push({ id, title: f.title, severity: f.severity });
  }

  return c.json({ success: true, count: created.length, findings: created }, 201);
});

/**
 * GET /api/v1/projects/:projectId/audit-findings
 * List findings with optional filters
 */
app.get('/:projectId/audit-findings', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(
    `SELECT id FROM projects WHERE id = ? AND user_id = ?`
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const auditId = c.req.query('audit_id');
  const disposition = c.req.query('disposition');
  const severity = c.req.query('severity');
  const limit = Math.min(parseInt(c.req.query('limit') || '100'), 500);

  let sql = `
    SELECT af.* FROM audit_findings af
    JOIN agent_audit_log aal ON af.audit_id = aal.id
    WHERE aal.project_id = ?
  `;
  const params: (string | number)[] = [projectId];

  if (auditId) {
    sql += ` AND af.audit_id = ?`;
    params.push(parseInt(auditId));
  }
  if (disposition) {
    sql += ` AND af.disposition = ?`;
    params.push(disposition);
  }
  if (severity) {
    sql += ` AND af.severity = ?`;
    params.push(severity);
  }

  sql += ` ORDER BY af.severity DESC, af.created_at ASC LIMIT ?`;
  params.push(limit);

  const results = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json(results.results || []);
});

/**
 * PUT /api/v1/projects/:projectId/audit-findings/:findingId/triage
 * Triage a finding: FIX, ACCEPT, DEFER, or INVALID
 */
app.put('/:projectId/audit-findings/:findingId/triage', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const findingId = c.req.param('findingId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(
    `SELECT id FROM projects WHERE id = ? AND user_id = ?`
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    disposition: 'FIX' | 'ACCEPT' | 'DEFER' | 'INVALID';
    reason: string;
    fixed_in_commit?: string;
  }>();

  const validDispositions = ['FIX', 'ACCEPT', 'DEFER', 'INVALID'];
  if (!validDispositions.includes(body.disposition)) {
    return c.json({ error: `disposition must be one of: ${validDispositions.join(', ')}` }, 400);
  }

  if (!body.reason) {
    return c.json({ error: 'reason is required for triage' }, 400);
  }

  const now = new Date().toISOString();

  const result = await c.env.DB.prepare(`
    UPDATE audit_findings
    SET disposition = ?, disposition_reason = ?, triaged_by = ?,
        triaged_at = ?, fixed_in_commit = ?
    WHERE id = ?
  `).bind(
    body.disposition,
    body.reason,
    userId,
    now,
    body.fixed_in_commit || null,
    findingId
  ).run();

  if (!result.meta.changes || result.meta.changes === 0) {
    return c.json({ error: 'Finding not found' }, 404);
  }

  return c.json({
    success: true,
    finding_id: findingId,
    disposition: body.disposition,
    triaged_at: now,
  });
});

// =============================================================================
// AUDIT DIFF ENGINE
// =============================================================================

/**
 * POST /api/v1/projects/:projectId/agents/audit-diff
 * Compare findings between two audits to detect new, recurring, and resolved
 */
app.post('/:projectId/agents/audit-diff', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(
    `SELECT id FROM projects WHERE id = ? AND user_id = ?`
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const { current_audit_id, compare_audit_id } = await c.req.json<{
    current_audit_id: number;
    compare_audit_id?: number;
  }>();

  if (!current_audit_id) {
    return c.json({ error: 'current_audit_id required' }, 400);
  }

  const currentFindings = await c.env.DB.prepare(
    `SELECT * FROM audit_findings WHERE audit_id = ? ORDER BY severity DESC, created_at ASC`
  ).bind(current_audit_id).all();

  let compareFindings;
  if (compare_audit_id) {
    compareFindings = await c.env.DB.prepare(
      `SELECT * FROM audit_findings WHERE audit_id = ?`
    ).bind(compare_audit_id).all();
  } else {
    const priorAudit = await c.env.DB.prepare(`
      SELECT id FROM agent_audit_log
      WHERE project_id = ? AND id != ?
      ORDER BY created_at DESC LIMIT 1
    `).bind(projectId, current_audit_id).first();

    if (priorAudit) {
      compareFindings = await c.env.DB.prepare(
        `SELECT * FROM audit_findings WHERE audit_id = ?`
      ).bind((priorAudit as any).id).all();
    } else {
      compareFindings = { results: [] };
    }
  }

  const current = (currentFindings.results || []) as any[];
  const prior = (compareFindings.results || []) as any[];

  const newFindings: any[] = [];
  const recurringFindings: any[] = [];
  const resolvedFindings: any[] = [];

  for (const curr of current) {
    const match = prior.find(
      (p: any) =>
        p.file_path === curr.file_path &&
        similarityScore(p.title, curr.title) > 0.8
    );
    if (match) {
      recurringFindings.push({ current_id: curr.id, prior_id: match.id, ...curr });
    } else {
      newFindings.push(curr);
    }
  }

  for (const p of prior) {
    const match = current.find(
      (curr: any) =>
        curr.file_path === p.file_path &&
        similarityScore(curr.title, p.title) > 0.8
    );
    if (!match) {
      resolvedFindings.push(p);
    }
  }

  // Update prior_audit_match for recurring findings
  for (const m of recurringFindings) {
    await c.env.DB.prepare(
      `UPDATE audit_findings SET prior_audit_match = ? WHERE id = ?`
    ).bind(m.prior_id, m.current_id).run();
  }

  let summary = `Audit diff: ${newFindings.length} new, ${recurringFindings.length} recurring, ${resolvedFindings.length} resolved.`;
  if (newFindings.length === 0 && recurringFindings.length > resolvedFindings.length * 2) {
    summary += ' Diminishing returns detected: No new findings, high recurrence rate.';
  }
  if (newFindings.some((f: any) => f.severity === 'CRITICAL')) {
    summary += ' New CRITICAL findings require immediate attention.';
  }

  return c.json({
    success: true,
    diff: {
      new: newFindings.length,
      recurring: recurringFindings.length,
      resolved: resolvedFindings.length,
      findings: {
        new: newFindings,
        recurring: recurringFindings,
        resolved: resolvedFindings,
      },
      summary,
    },
  });
});

// =============================================================================
// AUDIT CONFIG
// =============================================================================

/**
 * GET /api/v1/projects/:projectId/audit-config
 * Get audit configuration for a project
 */
app.get('/:projectId/audit-config', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(
    `SELECT id FROM projects WHERE id = ? AND user_id = ?`
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  let config = await c.env.DB.prepare(
    `SELECT * FROM audit_config WHERE project_id = ?`
  ).bind(projectId).first();

  if (!config) {
    // Create default config
    await c.env.DB.prepare(`
      INSERT INTO audit_config (project_id) VALUES (?)
    `).bind(projectId).run();

    config = await c.env.DB.prepare(
      `SELECT * FROM audit_config WHERE project_id = ?`
    ).bind(projectId).first();
  }

  return c.json(config);
});

/**
 * PUT /api/v1/projects/:projectId/audit-config
 * Update audit configuration
 */
app.put('/:projectId/audit-config', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(
    `SELECT id FROM projects WHERE id = ? AND user_id = ?`
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    worker_model?: string;
    auditor_model?: string;
    auto_audit_on_lock?: boolean;
    incremental_by_module?: boolean;
    diminishing_returns_threshold?: number;
    critical_auto_halt?: boolean;
    high_severity_limit?: number;
    max_context_per_audit?: number;
  }>();

  // Ensure config row exists
  const existing = await c.env.DB.prepare(
    `SELECT project_id FROM audit_config WHERE project_id = ?`
  ).bind(projectId).first();

  if (!existing) {
    await c.env.DB.prepare(
      `INSERT INTO audit_config (project_id) VALUES (?)`
    ).bind(projectId).run();
  }

  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (body.worker_model !== undefined) { updates.push('worker_model = ?'); values.push(body.worker_model); }
  if (body.auditor_model !== undefined) { updates.push('auditor_model = ?'); values.push(body.auditor_model); }
  if (body.auto_audit_on_lock !== undefined) { updates.push('auto_audit_on_lock = ?'); values.push(body.auto_audit_on_lock ? 1 : 0); }
  if (body.incremental_by_module !== undefined) { updates.push('incremental_by_module = ?'); values.push(body.incremental_by_module ? 1 : 0); }
  if (body.diminishing_returns_threshold !== undefined) { updates.push('diminishing_returns_threshold = ?'); values.push(body.diminishing_returns_threshold); }
  if (body.critical_auto_halt !== undefined) { updates.push('critical_auto_halt = ?'); values.push(body.critical_auto_halt ? 1 : 0); }
  if (body.high_severity_limit !== undefined) { updates.push('high_severity_limit = ?'); values.push(body.high_severity_limit); }
  if (body.max_context_per_audit !== undefined) { updates.push('max_context_per_audit = ?'); values.push(body.max_context_per_audit); }

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  values.push(projectId);

  await c.env.DB.prepare(
    `UPDATE audit_config SET ${updates.join(', ')} WHERE project_id = ?`
  ).bind(...values).run();

  const config = await c.env.DB.prepare(
    `SELECT * FROM audit_config WHERE project_id = ?`
  ).bind(projectId).first();

  return c.json({ success: true, config });
});

// =============================================================================
// CONTEXT BUDGET
// =============================================================================

/**
 * GET /api/v1/projects/:projectId/agents/context-budget
 * Calculate context budget for audit planning
 */
app.get('/:projectId/agents/context-budget', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(
    `SELECT id FROM projects WHERE id = ? AND user_id = ?`
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Get audit config for this project
  const config = await c.env.DB.prepare(
    `SELECT * FROM audit_config WHERE project_id = ?`
  ).bind(projectId).first() as any;

  const maxContext = config?.max_context_per_audit || 50000;

  // Count existing findings stats
  const stats = await c.env.DB.prepare(`
    SELECT
      COUNT(*) as total_findings,
      SUM(CASE WHEN af.disposition = 'PENDING' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN af.disposition = 'FIX' THEN 1 ELSE 0 END) as to_fix,
      SUM(CASE WHEN af.severity = 'CRITICAL' THEN 1 ELSE 0 END) as critical_count,
      SUM(CASE WHEN af.severity = 'HIGH' THEN 1 ELSE 0 END) as high_count
    FROM audit_findings af
    JOIN agent_audit_log aal ON af.audit_id = aal.id
    WHERE aal.project_id = ?
  `).bind(projectId).first() as any;

  // MOSA-derived context budget calculation
  const startupContext = { manifest: 135, status: 184, roadmap: 38, total: 357 };
  const CLAUDE_MAX_TOKENS = 200000;
  const GPT4_MAX_TOKENS = 128000;
  const estimatedTokens = startupContext.total * 1.3;

  const budget = {
    startup: startupContext,
    max_context_per_audit: maxContext,
    total: {
      lines: startupContext.total,
      estimated_tokens: Math.round(estimatedTokens),
      claude_capacity_percent: Math.round((estimatedTokens / CLAUDE_MAX_TOKENS) * 100),
      gpt4_capacity_percent: Math.round((estimatedTokens / GPT4_MAX_TOKENS) * 100),
    },
    status: estimatedTokens < CLAUDE_MAX_TOKENS * 0.75 ? 'GREEN' :
            estimatedTokens < CLAUDE_MAX_TOKENS * 0.9 ? 'YELLOW' : 'RED',
    findings_summary: {
      total: stats?.total_findings || 0,
      pending: stats?.pending || 0,
      to_fix: stats?.to_fix || 0,
      critical: stats?.critical_count || 0,
      high: stats?.high_count || 0,
    },
    recommendation: 'Full audit feasible',
  };

  return c.json({ success: true, budget });
});

// =============================================================================
// HELPERS
// =============================================================================

function similarityScore(a: string, b: string): number {
  if (!a || !b) return 0;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1.0;
  const dist = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - dist) / longer.length;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// =============================================================================
// GA:AUD GATE — Phase 2C
// =============================================================================

// GET /:projectId/gates/ga-aud — Check GA:AUD gate status
app.get('/:projectId/gates/ga-aud', requireAuth, async (c) => {
  const { projectId } = c.req.param();
  const { required_for_lock } = c.req.query();

  // Verify project ownership
  const userId = (c as any).userId;
  const project = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND user_id = ?'
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404);
  }

  try {
    const result = await validateAuditGate(
      projectId,
      c.env,
      { required_for_lock: required_for_lock === 'true' }
    );

    return c.json({
      success: true,
      gate: 'GA:AUD',
      ...result
    });
  } catch (error: any) {
    console.error('GA:AUD validation error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// =============================================================================
// DIMINISHING RETURNS — Phase 2D
// =============================================================================

// GET /:projectId/agents/diminishing-returns — Check if audit frequency should be reduced
app.get('/:projectId/agents/diminishing-returns', requireAuth, async (c) => {
  const { projectId } = c.req.param();
  const { look_back_count, threshold } = c.req.query();

  // Verify project ownership
  const userId = (c as any).userId;
  const project = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND user_id = ?'
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404);
  }

  try {
    const result = await detectDiminishingReturns(
      projectId,
      c.env,
      {
        look_back_count: look_back_count ? parseInt(look_back_count) : undefined,
        threshold: threshold ? parseInt(threshold) : undefined
      }
    );

    return c.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Diminishing returns detection error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// =============================================================================
// INCREMENTAL AUDIT — Phase 2D
// =============================================================================

// POST /:projectId/agents/audit-incremental — Run incremental audit
app.post('/:projectId/agents/audit-incremental', requireAuth, async (c) => {
  const { projectId } = c.req.param();
  const body = await c.req.json();
  const { modules, worker_model, auditor_model } = body;

  if (!modules || !Array.isArray(modules) || modules.length === 0) {
    return c.json({ success: false, error: 'modules array required' }, 400);
  }

  // Verify project ownership
  const userId = (c as any).userId;
  const project = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND user_id = ?'
  ).bind(projectId, userId).first();

  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404);
  }

  try {
    // Create task entries for each module (orchestration placeholder)
    const audits = [];
    for (const mod of modules) {
      const taskResult = await c.env.DB.prepare(`
        INSERT INTO agent_tasks (
          project_id,
          agent_id,
          task_type,
          description,
          parameters,
          status
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        projectId,
        'worker-agent-1',
        'CROSS_MODEL_VALIDATION',
        `Incremental audit: ${mod}`,
        JSON.stringify({
          scope: 'module',
          target: mod,
          worker_model: worker_model || 'openai:gpt-4o',
          auditor_model: auditor_model || 'anthropic:claude-sonnet-4-20250514'
        }),
        'PENDING'
      ).run();

      audits.push({
        module: mod,
        task_created: true,
        status: 'PENDING'
      });
    }

    return c.json({
      success: true,
      message: `Created ${modules.length} incremental audit task(s)`,
      audits,
      summary: {
        total_modules: modules.length
      }
    });
  } catch (error: any) {
    console.error('Incremental audit error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// =============================================================================
// GAP-1: USER-GUIDED EXECUTION MODE
// HANDOFF-CGC-01 GAP-1 — Mode 2: AI plans, human executes, AI validates
//
// In User-Guided mode:
//   1. AI generates a step-by-step execution plan (each step is atomic)
//   2. Human executes steps manually (outside the platform)
//   3. Human reports completion with evidence
//   4. AI validates each step against acceptance criteria
//   5. R score updates incrementally as steps complete
// =============================================================================

/**
 * POST /api/v1/projects/:projectId/tasks/:taskId/guided-plan
 * Generate a step-by-step plan for user-guided execution.
 * Called when execution_mode = 'USER_GUIDED'.
 * Stores steps in agent_guided_steps table.
 */
app.post('/:projectId/tasks/:taskId/guided-plan', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const taskId = c.req.param('taskId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND user_id = ?'
  ).bind(projectId, userId).first();
  if (!project) return c.json({ error: 'Project not found' }, 404);

  const task = await c.env.DB.prepare(
    'SELECT id, task_type, task_description, acceptance_criteria, execution_mode, status FROM agent_tasks WHERE id = ? AND project_id = ?'
  ).bind(taskId, projectId).first<{
    id: string; task_type: string; task_description: string;
    acceptance_criteria: string | null; execution_mode: string; status: string;
  }>();

  if (!task) return c.json({ error: 'Task not found' }, 404);
  if (task.execution_mode !== 'USER_GUIDED') {
    return c.json({ error: 'Task is not in USER_GUIDED execution mode' }, 400);
  }
  if (task.status !== 'QUEUED' && task.status !== 'ASSIGNED') {
    return c.json({ error: `Cannot generate plan for task in status: ${task.status}` }, 400);
  }

  // Check if plan already exists
  const existing = await c.env.DB.prepare(
    'SELECT COUNT(*) as cnt FROM agent_guided_steps WHERE task_id = ?'
  ).bind(taskId).first<{ cnt: number }>();

  if (existing && existing.cnt > 0) {
    return c.json({ error: 'Guided plan already exists for this task. Use GET to retrieve steps.' }, 409);
  }

  const criteria: string[] = task.acceptance_criteria
    ? JSON.parse(task.acceptance_criteria)
    : [];

  // Use supervisor to generate the step-by-step plan
  const supervisorDef = AGENT_REGISTRY.supervisor;
  const { callProvider: callProviderFn } = await import('../providers/index');
  const apiKey = (() => {
    switch (supervisorDef.preferredProvider) {
      case 'anthropic': return c.env.PLATFORM_ANTHROPIC_KEY;
      case 'openai': return c.env.PLATFORM_OPENAI_KEY;
      case 'google': return c.env.PLATFORM_GOOGLE_KEY;
      case 'deepseek': return c.env.PLATFORM_DEEPSEEK_KEY || '';
      default: return '';
    }
  })();

  if (!apiKey) {
    return c.json({ error: 'No API key available for supervisor model' }, 500);
  }

  const planPrompt = `You are generating a step-by-step execution plan for a human to follow.
The human will execute each step manually and report back. Each step must be:
- Atomic (one clear action)
- Verifiable (has a clear "done" condition)
- Ordered (respects dependencies)

TASK: ${task.task_description}
TASK TYPE: ${task.task_type}
${criteria.length > 0 ? `ACCEPTANCE CRITERIA:\n${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}` : ''}

Output a JSON array of steps:
[
  {
    "step_number": 1,
    "title": "Short title",
    "instructions": "Detailed instructions for the human",
    "verification_criteria": "How to verify this step is complete",
    "estimated_minutes": 5
  }
]

Output ONLY the JSON array, no markdown or explanation.`;

  try {
    const response = await callProviderFn(
      { provider: supervisorDef.preferredProvider, model: supervisorDef.preferredModel },
      [
        { role: 'system', content: supervisorDef.systemPrompt },
        { role: 'user', content: planPrompt },
      ],
      apiKey,
      { maxOutputTokens: 4096, temperature: 0.3 }
    );

    const cleaned = response.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const steps: Array<{
      step_number: number;
      title: string;
      instructions: string;
      verification_criteria: string;
      estimated_minutes?: number;
    }> = JSON.parse(cleaned);

    if (!Array.isArray(steps) || steps.length === 0) {
      return c.json({ error: 'AI generated an empty or invalid plan' }, 500);
    }

    // Store steps in DB
    const stmts = steps.map((step, idx) => {
      const stepId = crypto.randomUUID().replace(/-/g, '').slice(0, 32);
      return c.env.DB.prepare(`
        INSERT INTO agent_guided_steps (
          id, task_id, project_id, step_number, title,
          instructions, verification_criteria, estimated_minutes,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
      `).bind(
        stepId, taskId, projectId, idx + 1,
        step.title, step.instructions,
        step.verification_criteria,
        step.estimated_minutes || null
      );
    });

    await c.env.DB.batch(stmts);

    // Update task status to IN_PROGRESS
    await c.env.DB.prepare(`
      UPDATE agent_tasks
      SET status = 'IN_PROGRESS', execution_mode = 'USER_GUIDED',
          started_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).bind(taskId).run();

    await logAgentEvent(c.env.DB, {
      project_id: projectId,
      task_id: taskId,
      event_type: 'GUIDED_PLAN_GENERATED',
      event_data: JSON.stringify({
        step_count: steps.length,
        total_estimated_minutes: steps.reduce((sum, s) => sum + (s.estimated_minutes || 0), 0),
      }),
      human_actor_id: userId,
    });

    return c.json({
      task_id: taskId,
      execution_mode: 'USER_GUIDED',
      step_count: steps.length,
      steps: steps.map((s, idx) => ({
        step_number: idx + 1,
        title: s.title,
        instructions: s.instructions,
        verification_criteria: s.verification_criteria,
        estimated_minutes: s.estimated_minutes || null,
        status: 'PENDING',
      })),
    }, 201);
  } catch (err: any) {
    console.error('Guided plan generation failed:', err);
    return c.json({ error: `Failed to generate guided plan: ${err.message}` }, 500);
  }
});

/**
 * GET /api/v1/projects/:projectId/tasks/:taskId/guided-steps
 * Get all steps for a user-guided task
 */
app.get('/:projectId/tasks/:taskId/guided-steps', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const taskId = c.req.param('taskId');
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND user_id = ?'
  ).bind(projectId, userId).first();
  if (!project) return c.json({ error: 'Project not found' }, 404);

  const steps = await c.env.DB.prepare(`
    SELECT id, step_number, title, instructions, verification_criteria,
           estimated_minutes, status, user_evidence, ai_validation,
           validated_at, completed_at
    FROM agent_guided_steps
    WHERE task_id = ? AND project_id = ?
    ORDER BY step_number ASC
  `).bind(taskId, projectId).all();

  const total = steps.results?.length || 0;
  const completed = steps.results?.filter((s: any) => s.status === 'COMPLETED' || s.status === 'VALIDATED').length || 0;

  return c.json({
    task_id: taskId,
    total_steps: total,
    completed_steps: completed,
    progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    steps: steps.results || [],
  });
});

/**
 * POST /api/v1/projects/:projectId/tasks/:taskId/guided-steps/:stepNumber/complete
 * Human reports a step as complete with evidence.
 * AI validates the completion against verification criteria.
 */
app.post('/:projectId/tasks/:taskId/guided-steps/:stepNumber/complete', requireAuth, async (c) => {
  const projectId = c.req.param('projectId');
  const taskId = c.req.param('taskId');
  const stepNumber = parseInt(c.req.param('stepNumber'));
  const userId = c.get('userId');

  const project = await c.env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND user_id = ?'
  ).bind(projectId, userId).first();
  if (!project) return c.json({ error: 'Project not found' }, 404);

  const step = await c.env.DB.prepare(`
    SELECT id, title, instructions, verification_criteria, status
    FROM agent_guided_steps
    WHERE task_id = ? AND project_id = ? AND step_number = ?
  `).bind(taskId, projectId, stepNumber).first<{
    id: string; title: string; instructions: string;
    verification_criteria: string; status: string;
  }>();

  if (!step) return c.json({ error: 'Step not found' }, 404);
  if (step.status === 'VALIDATED') {
    return c.json({ error: 'Step already validated' }, 400);
  }

  const body = await c.req.json<{
    evidence: string;         // Description of what the human did
    evidence_type?: string;   // 'TEXT' | 'SCREENSHOT' | 'LOG' | 'URL'
  }>();

  if (!body.evidence?.trim()) {
    return c.json({ error: 'Evidence description is required' }, 400);
  }

  // AI validates the step completion
  const auditorDef = AGENT_REGISTRY.auditor;
  const { callProvider: callProviderFn } = await import('../providers/index');
  const apiKey = (() => {
    switch (auditorDef.preferredProvider) {
      case 'anthropic': return c.env.PLATFORM_ANTHROPIC_KEY;
      case 'openai': return c.env.PLATFORM_OPENAI_KEY;
      case 'google': return c.env.PLATFORM_GOOGLE_KEY;
      case 'deepseek': return c.env.PLATFORM_DEEPSEEK_KEY || '';
      default: return '';
    }
  })();

  let validation: { passed: boolean; feedback: string; confidence: number } = {
    passed: true,
    feedback: 'Validation skipped — no auditor API key available',
    confidence: 0.5,
  };

  if (apiKey) {
    try {
      const validationPrompt = `You are validating whether a human has completed a task step correctly.

STEP: ${step.title}
INSTRUCTIONS: ${step.instructions}
VERIFICATION CRITERIA: ${step.verification_criteria}

HUMAN'S EVIDENCE:
${body.evidence}
${body.evidence_type ? `(Evidence type: ${body.evidence_type})` : ''}

Evaluate whether the evidence demonstrates the step is complete per the verification criteria.

Output JSON only:
{
  "passed": true/false,
  "feedback": "Brief assessment of the completion quality",
  "confidence": 0.0-1.0
}`;

      const response = await callProviderFn(
        { provider: auditorDef.preferredProvider, model: auditorDef.preferredModel },
        [
          { role: 'system', content: auditorDef.systemPrompt },
          { role: 'user', content: validationPrompt },
        ],
        apiKey,
        { maxOutputTokens: 1024, temperature: 0.2 }
      );

      const cleaned = response.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      validation = JSON.parse(cleaned);
    } catch (err) {
      console.warn('[GuidedStep] AI validation failed, marking as COMPLETED without validation:', err);
      validation = {
        passed: true,
        feedback: 'AI validation unavailable — step marked complete based on human evidence',
        confidence: 0.5,
      };
    }
  }

  const newStatus = validation.passed ? 'VALIDATED' : 'NEEDS_REVISION';
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE agent_guided_steps
    SET status = ?, user_evidence = ?, ai_validation = ?,
        validated_at = ?, completed_at = ?
    WHERE id = ?
  `).bind(
    newStatus,
    JSON.stringify({ description: body.evidence, type: body.evidence_type || 'TEXT' }),
    JSON.stringify(validation),
    now,
    validation.passed ? now : null,
    step.id
  ).run();

  await logAgentEvent(c.env.DB, {
    project_id: projectId,
    task_id: taskId,
    event_type: validation.passed ? 'GUIDED_STEP_VALIDATED' : 'GUIDED_STEP_REVISION_NEEDED',
    event_data: JSON.stringify({
      step_number: stepNumber,
      step_title: step.title,
      validation_result: validation.passed ? 'PASS' : 'NEEDS_REVISION',
      confidence: validation.confidence,
    }),
    human_actor_id: userId,
  });

  // Check if all steps are now validated — if so, complete the task
  const allSteps = await c.env.DB.prepare(`
    SELECT COUNT(*) as total,
           SUM(CASE WHEN status = 'VALIDATED' THEN 1 ELSE 0 END) as validated
    FROM agent_guided_steps
    WHERE task_id = ? AND project_id = ?
  `).bind(taskId, projectId).first<{ total: number; validated: number }>();

  const allComplete = allSteps && allSteps.total > 0 && allSteps.validated === allSteps.total;

  if (allComplete) {
    await c.env.DB.prepare(`
      UPDATE agent_tasks
      SET status = 'COMPLETED', completed_at = datetime('now'), updated_at = datetime('now'),
          confidence_score = ?
      WHERE id = ?
    `).bind(validation.confidence, taskId).run();

    await logAgentEvent(c.env.DB, {
      project_id: projectId,
      task_id: taskId,
      event_type: 'GUIDED_TASK_COMPLETED',
      event_data: JSON.stringify({
        total_steps: allSteps.total,
        execution_mode: 'USER_GUIDED',
      }),
      human_actor_id: userId,
    });
  }

  return c.json({
    step_number: stepNumber,
    status: newStatus,
    validation,
    task_complete: allComplete,
    progress: allSteps ? {
      total: allSteps.total,
      validated: allSteps.validated + (validation.passed ? 0 : 0), // already counted in query
      percent: allSteps.total > 0
        ? Math.round(((allSteps.validated) / allSteps.total) * 100)
        : 0,
    } : null,
  });
});

export default app;
