/**
 * Workspace Binding API — Unified GA:ENV + GA:FLD
 *
 * Server-side metadata for workspace bindings.
 * Client-side folder handles persist in IndexedDB (fileSystem.ts).
 * This API enables backend gate auto-checks without client involvement.
 *
 * Endpoints:
 *   - GET    /:projectId/workspace               — Get workspace binding
 *   - PUT    /:projectId/workspace               — Create/update binding
 *   - DELETE /:projectId/workspace               — Remove binding
 *   - GET    /:projectId/workspace/status         — Quick status for ribbon
 *   - POST   /:projectId/workspace/confirm-test   — Environment confirmation probes
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import { triggerGateEvaluation } from '../services/gateRules';
import { ROUTING_TABLE } from '../routing/table';

const workspace = new Hono<{ Bindings: Env }>();

workspace.use('/*', requireAuth);

async function verifyProjectOwnership(
  db: D1Database,
  projectId: string,
  userId: string
): Promise<boolean> {
  const project = await db.prepare(
    'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
  ).bind(projectId, userId).first();
  return !!project;
}

/**
 * GET /:projectId/workspace
 */
workspace.get('/:projectId/workspace', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const binding = await c.env.DB.prepare(
    'SELECT * FROM workspace_bindings WHERE project_id = ?'
  ).bind(projectId).first();

  if (!binding) {
    return c.json({ binding: null });
  }

  return c.json({ binding });
});

/**
 * PUT /:projectId/workspace
 * Create or update workspace binding
 */
workspace.put('/:projectId/workspace', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<{
    folder_name?: string;
    folder_template?: string;
    permission_level?: string;
    scaffold_generated?: boolean;
    github_connected?: boolean;
    github_repo?: string;
    binding_confirmed?: boolean;
  }>();

  const now = new Date().toISOString();

  // Check if binding exists
  const existing = await c.env.DB.prepare(
    'SELECT id FROM workspace_bindings WHERE project_id = ?'
  ).bind(projectId).first();

  if (existing) {
    // Update existing binding
    await c.env.DB.prepare(`
      UPDATE workspace_bindings
      SET folder_name = COALESCE(?, folder_name),
          folder_template = COALESCE(?, folder_template),
          permission_level = COALESCE(?, permission_level),
          scaffold_generated = COALESCE(?, scaffold_generated),
          github_connected = COALESCE(?, github_connected),
          github_repo = COALESCE(?, github_repo),
          binding_confirmed = COALESCE(?, binding_confirmed),
          bound_at = COALESCE(bound_at, ?),
          updated_at = ?
      WHERE project_id = ?
    `).bind(
      body.folder_name ?? null,
      body.folder_template ?? null,
      body.permission_level ?? null,
      body.scaffold_generated !== undefined ? (body.scaffold_generated ? 1 : 0) : null,
      body.github_connected !== undefined ? (body.github_connected ? 1 : 0) : null,
      body.github_repo ?? null,
      body.binding_confirmed !== undefined ? (body.binding_confirmed ? 1 : 0) : null,
      now,
      now,
      projectId
    ).run();
  } else {
    // Create new binding
    const id = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO workspace_bindings
        (id, project_id, folder_name, folder_template, permission_level,
         scaffold_generated, github_connected, github_repo, binding_confirmed, bound_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      projectId,
      body.folder_name ?? null,
      body.folder_template ?? null,
      body.permission_level ?? 'readwrite',
      body.scaffold_generated ? 1 : 0,
      body.github_connected ? 1 : 0,
      body.github_repo ?? null,
      body.binding_confirmed ? 1 : 0,
      now,
      now
    ).run();
  }

  // Phase 2: Auto-evaluate gates after workspace binding change (GA:ENV, GA:FLD)
  c.executionCtx.waitUntil(triggerGateEvaluation(c.env.DB, projectId, userId));

  return c.json({ success: true, updated_at: now });
});

/**
 * DELETE /:projectId/workspace
 */
workspace.delete('/:projectId/workspace', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM workspace_bindings WHERE project_id = ?'
  ).bind(projectId).run();

  return c.json({ success: true });
});

/**
 * GET /:projectId/workspace/status
 * Quick status for ribbon display
 */
workspace.get('/:projectId/workspace/status', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const binding = await c.env.DB.prepare(
    'SELECT folder_name, folder_template, permission_level, scaffold_generated, github_connected, github_repo, binding_confirmed FROM workspace_bindings WHERE project_id = ?'
  ).bind(projectId).first<{
    folder_name: string | null;
    folder_template: string | null;
    permission_level: string;
    scaffold_generated: number;
    github_connected: number;
    github_repo: string | null;
    binding_confirmed: number;
  }>();

  if (!binding) {
    return c.json({
      bound: false,
      folder_linked: false,
      github_connected: false,
      confirmed: false,
    });
  }

  return c.json({
    bound: true,
    folder_linked: !!binding.folder_name,
    folder_name: binding.folder_name,
    folder_template: binding.folder_template,
    permission_level: binding.permission_level,
    scaffold_generated: !!binding.scaffold_generated,
    github_connected: !!binding.github_connected,
    github_repo: binding.github_repo,
    confirmed: !!binding.binding_confirmed,
  });
});

// =============================================================================
// Environment Confirmation Test
// =============================================================================

interface EnvTestResult {
  test_id: string;
  name: string;
  passed: boolean;
  latency_ms: number;
  evidence: Record<string, unknown>;
  error?: string;
}

async function runD1ReadTest(
  db: D1Database, projectId: string, userId: string
): Promise<EnvTestResult> {
  const start = Date.now();
  try {
    const row = await db.prepare(
      'SELECT id, name FROM projects WHERE id = ? AND owner_id = ?'
    ).bind(projectId, userId).first<{ id: string; name: string }>();
    return {
      test_id: 'D1_READ',
      name: 'Database Read',
      passed: !!row,
      latency_ms: Date.now() - start,
      evidence: { project_found: !!row, project_name: row?.name ?? null },
    };
  } catch (err: unknown) {
    return {
      test_id: 'D1_READ',
      name: 'Database Read',
      passed: false,
      latency_ms: Date.now() - start,
      evidence: {},
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function runD1WriteTest(
  db: D1Database, projectId: string
): Promise<EnvTestResult> {
  const start = Date.now();
  const probeId = crypto.randomUUID();
  try {
    // Clean up stale probes first (older than 1 hour)
    await db.prepare(
      "DELETE FROM env_probes WHERE created_at < datetime('now', '-1 hour')"
    ).run();

    // INSERT
    await db.prepare(
      'INSERT INTO env_probes (id, project_id) VALUES (?, ?)'
    ).bind(probeId, projectId).run();

    // SELECT back
    const readBack = await db.prepare(
      'SELECT id FROM env_probes WHERE id = ?'
    ).bind(probeId).first<{ id: string }>();

    // DELETE
    await db.prepare(
      'DELETE FROM env_probes WHERE id = ?'
    ).bind(probeId).run();

    return {
      test_id: 'D1_WRITE',
      name: 'Database Write',
      passed: !!readBack,
      latency_ms: Date.now() - start,
      evidence: { probe_id: probeId, written: true, read_back: !!readBack, cleaned: true },
    };
  } catch (err: unknown) {
    // Attempt cleanup on failure
    try { await db.prepare('DELETE FROM env_probes WHERE id = ?').bind(probeId).run(); } catch { /* ignore */ }
    return {
      test_id: 'D1_WRITE',
      name: 'Database Write',
      passed: false,
      latency_ms: Date.now() - start,
      evidence: { probe_id: probeId },
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function runR2ListTest(
  bucket: R2Bucket, projectId: string
): Promise<EnvTestResult> {
  const start = Date.now();
  try {
    const list = await bucket.list({ prefix: `projects/${projectId}/`, limit: 1 });
    return {
      test_id: 'R2_LIST',
      name: 'Storage Access',
      passed: true,
      latency_ms: Date.now() - start,
      evidence: { accessible: true, objects_found: list.objects.length, truncated: list.truncated },
    };
  } catch (err: unknown) {
    return {
      test_id: 'R2_LIST',
      name: 'Storage Access',
      passed: false,
      latency_ms: Date.now() - start,
      evidence: {},
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

function runRouterHealthTest(): EnvTestResult {
  const start = Date.now();
  try {
    // Verify routing table is loaded and has entries
    const modelClasses = Object.keys(ROUTING_TABLE);
    const totalProviders = Object.values(ROUTING_TABLE).reduce(
      (sum, providers) => sum + providers.length, 0
    );
    return {
      test_id: 'ROUTER',
      name: 'Model Router',
      passed: modelClasses.length > 0 && totalProviders > 0,
      latency_ms: Date.now() - start,
      evidence: { healthy: true, model_classes: modelClasses.length, providers: totalProviders },
    };
  } catch (err: unknown) {
    return {
      test_id: 'ROUTER',
      name: 'Model Router',
      passed: false,
      latency_ms: Date.now() - start,
      evidence: {},
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

function runEnvConfigTest(env: Env): EnvTestResult {
  const start = Date.now();
  try {
    const providers = [
      !!env.ANTHROPIC_API_KEY,
      !!env.OPENAI_API_KEY,
      !!env.GOOGLE_API_KEY,
      !!env.DEEPSEEK_API_KEY,
    ].filter(Boolean).length;
    const hasEnv = !!env.ENVIRONMENT;
    return {
      test_id: 'ENV_CONFIG',
      name: 'Environment Config',
      passed: hasEnv && providers > 0,
      latency_ms: Date.now() - start,
      evidence: { environment: env.ENVIRONMENT || 'unset', ai_providers: providers },
    };
  } catch (err: unknown) {
    return {
      test_id: 'ENV_CONFIG',
      name: 'Environment Config',
      passed: false,
      latency_ms: Date.now() - start,
      evidence: {},
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * POST /:projectId/workspace/confirm-test
 * Run environment confirmation probes after workspace binding
 */
workspace.post('/:projectId/workspace/confirm-test', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const startTime = Date.now();

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Run all 5 tests in parallel
  const results = await Promise.allSettled([
    runD1ReadTest(c.env.DB, projectId, userId),
    runD1WriteTest(c.env.DB, projectId),
    runR2ListTest(c.env.IMAGES, projectId),
    Promise.resolve(runRouterHealthTest()),
    Promise.resolve(runEnvConfigTest(c.env)),
  ]);

  const tests: EnvTestResult[] = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    const fallbackIds = ['D1_READ', 'D1_WRITE', 'R2_LIST', 'ROUTER', 'ENV_CONFIG'];
    const fallbackNames = ['Database Read', 'Database Write', 'Storage Access', 'Model Router', 'Environment Config'];
    return {
      test_id: fallbackIds[i],
      name: fallbackNames[i],
      passed: false,
      latency_ms: 0,
      evidence: {},
      error: r.reason?.message || 'Unknown error',
    };
  });

  return c.json({
    project_id: projectId,
    ran_at: new Date().toISOString(),
    all_passed: tests.every(t => t.passed),
    duration_ms: Date.now() - startTime,
    tests,
  });
});

export default workspace;
