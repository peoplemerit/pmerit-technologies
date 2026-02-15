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

export default app;
