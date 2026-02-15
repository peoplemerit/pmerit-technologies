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

export default app;
