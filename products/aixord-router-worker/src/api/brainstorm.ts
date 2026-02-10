/**
 * Brainstorm Artifact API
 *
 * HANDOFF-VD-CI-01 Tasks A1 + A2:
 * - Structured brainstorm output storage (A1)
 * - Validation engine with BLOCK/WARN checks (A2)
 *
 * Endpoints:
 * - POST /:projectId/brainstorm/artifacts     — Create/update brainstorm artifact
 * - GET  /:projectId/brainstorm/artifacts      — Get latest brainstorm artifact
 * - POST /:projectId/brainstorm/validate       — Validate brainstorm artifact
 * - GET  /:projectId/brainstorm/validation     — Get last validation result
 */

import { Hono } from 'hono';
import type { Env, BrainstormOption, BrainstormDecisionCriteria, BrainstormValidationCheck, BrainstormValidationResult } from '../types';
import { requireAuth } from '../middleware/requireAuth';

const brainstorm = new Hono<{ Bindings: Env }>();

brainstorm.use('/*', requireAuth);

/**
 * Verify project ownership (local helper — same pattern as state.ts)
 */
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

// ═══════════════════════════════════════════════════════════════════
// Validation Engine (Task A2)
//
// Two tiers:
//   BLOCK — Structural checks. Must pass for finalize.
//   WARN  — Quality checks. Director can override with justification.
// ═══════════════════════════════════════════════════════════════════

function validateBrainstormArtifact(
  options: BrainstormOption[],
  assumptions: string[],
  decisionCriteria: BrainstormDecisionCriteria,
  killConditions: string[]
): BrainstormValidationResult {
  const checks: BrainstormValidationCheck[] = [];

  // ── BLOCK checks (structural) ──

  // B1: Must have 2-5 options
  const optionCount = options.length;
  checks.push({
    check: 'option_count',
    level: 'BLOCK',
    passed: optionCount >= 2 && optionCount <= 5,
    detail: optionCount < 2
      ? `Only ${optionCount} option(s) — minimum 2 required`
      : optionCount > 5
        ? `${optionCount} options — maximum 5 allowed`
        : `${optionCount} option(s) defined`,
  });

  // B2: Every option must have at least one assumption
  const optionsMissingAssumptions = options.filter(o => !o.assumptions || o.assumptions.length === 0);
  checks.push({
    check: 'option_assumptions',
    level: 'BLOCK',
    passed: optionsMissingAssumptions.length === 0,
    detail: optionsMissingAssumptions.length === 0
      ? 'All options have assumptions'
      : `${optionsMissingAssumptions.length} option(s) missing assumptions: ${optionsMissingAssumptions.map(o => o.title).join(', ')}`,
  });

  // B3: Every option must have at least one kill condition
  const optionsMissingKills = options.filter(o => !o.kill_conditions || o.kill_conditions.length === 0);
  checks.push({
    check: 'option_kill_conditions',
    level: 'BLOCK',
    passed: optionsMissingKills.length === 0,
    detail: optionsMissingKills.length === 0
      ? 'All options have kill conditions'
      : `${optionsMissingKills.length} option(s) missing kill conditions: ${optionsMissingKills.map(o => o.title).join(', ')}`,
  });

  // B4: Decision criteria must be present with at least one criterion
  const hasCriteria = decisionCriteria?.criteria && decisionCriteria.criteria.length > 0;
  checks.push({
    check: 'decision_criteria_present',
    level: 'BLOCK',
    passed: !!hasCriteria,
    detail: hasCriteria
      ? `${decisionCriteria.criteria.length} decision criteria defined`
      : 'No decision criteria defined',
  });

  // B5: No empty sections — options must have title + description
  const emptyOptions = options.filter(o => !o.title?.trim() || !o.description?.trim());
  checks.push({
    check: 'no_empty_sections',
    level: 'BLOCK',
    passed: emptyOptions.length === 0,
    detail: emptyOptions.length === 0
      ? 'All options have title and description'
      : `${emptyOptions.length} option(s) with empty title or description`,
  });

  // ── WARN checks (quality) ──

  // W1: Options should be distinct (no duplicate titles)
  const titles = options.map(o => o.title?.trim().toLowerCase());
  const uniqueTitles = new Set(titles);
  checks.push({
    check: 'options_distinct',
    level: 'WARN',
    passed: uniqueTitles.size === titles.length,
    detail: uniqueTitles.size === titles.length
      ? 'All option titles are unique'
      : `${titles.length - uniqueTitles.size} duplicate title(s) detected`,
  });

  // W2: Kill conditions should be measurable (heuristic: contains a number or comparison word)
  const measurablePattern = /\d|exceed|below|above|less|more|fail|drop|increase|decrease|threshold/i;
  const allKillConditions = [
    ...killConditions,
    ...options.flatMap(o => o.kill_conditions || []),
  ];
  const unmeasurable = allKillConditions.filter(kc => !measurablePattern.test(kc));
  checks.push({
    check: 'kill_conditions_measurable',
    level: 'WARN',
    passed: unmeasurable.length === 0,
    detail: unmeasurable.length === 0
      ? 'All kill conditions appear measurable'
      : `${unmeasurable.length} kill condition(s) may not be measurable`,
  });

  // W3: Assumptions should be verifiable (heuristic: non-trivial length)
  const allAssumptions = [
    ...assumptions,
    ...options.flatMap(o => o.assumptions || []),
  ];
  const trivialAssumptions = allAssumptions.filter(a => a.trim().length < 15);
  checks.push({
    check: 'assumptions_verifiable',
    level: 'WARN',
    passed: trivialAssumptions.length === 0,
    detail: trivialAssumptions.length === 0
      ? 'All assumptions appear substantive'
      : `${trivialAssumptions.length} assumption(s) may be too brief to verify`,
  });

  // W4: Global assumptions should exist
  checks.push({
    check: 'global_assumptions',
    level: 'WARN',
    passed: assumptions.length > 0,
    detail: assumptions.length > 0
      ? `${assumptions.length} global assumption(s) defined`
      : 'No global assumptions — consider adding cross-cutting assumptions',
  });

  // Summarize
  const blockFailed = checks.filter(c => c.level === 'BLOCK' && !c.passed);
  const warnFailed = checks.filter(c => c.level === 'WARN' && !c.passed);

  return {
    valid: blockFailed.length === 0,
    checks,
    block_count: blockFailed.length,
    warn_count: warnFailed.length,
    summary: blockFailed.length === 0
      ? warnFailed.length === 0
        ? 'Brainstorm artifact passes all checks'
        : `Passes structural checks. ${warnFailed.length} quality warning(s)`
      : `BLOCKED: ${blockFailed.length} structural check(s) failed`,
  };
}

// ═══════════════════════════════════════════════════════════════════
// Endpoints
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /:projectId/brainstorm/artifacts
 *
 * Create or update a brainstorm artifact.
 * If a DRAFT already exists, it bumps the version.
 */
brainstorm.post('/:projectId/brainstorm/artifacts', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json();
  const {
    options = [],
    assumptions = [],
    decision_criteria = { criteria: [] },
    kill_conditions = [],
    recommendation = 'NO_SELECTION',
    generated_by = 'ai',
  } = body;

  // Get current max version
  const latest = await c.env.DB.prepare(
    'SELECT version FROM brainstorm_artifacts WHERE project_id = ? ORDER BY version DESC LIMIT 1'
  ).bind(projectId).first<{ version: number }>();

  const newVersion = (latest?.version || 0) + 1;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Mark previous DRAFT as SUPERSEDED
  if (latest) {
    await c.env.DB.prepare(
      "UPDATE brainstorm_artifacts SET status = 'SUPERSEDED', updated_at = ? WHERE project_id = ? AND status = 'DRAFT'"
    ).bind(now, projectId).run();
  }

  await c.env.DB.prepare(
    `INSERT INTO brainstorm_artifacts (id, project_id, version, options, assumptions, decision_criteria, kill_conditions, recommendation, generated_by, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?)`
  ).bind(
    id,
    projectId,
    newVersion,
    JSON.stringify(options),
    JSON.stringify(assumptions),
    JSON.stringify(decision_criteria),
    JSON.stringify(kill_conditions),
    recommendation,
    generated_by,
    now,
    now,
  ).run();

  return c.json({
    id,
    project_id: projectId,
    version: newVersion,
    status: 'DRAFT',
    created_at: now,
  }, 201);
});

/**
 * GET /:projectId/brainstorm/artifacts
 *
 * Get the latest brainstorm artifact for a project.
 * Query params: ?version=N for a specific version, ?status=DRAFT|FINALIZED
 */
brainstorm.get('/:projectId/brainstorm/artifacts', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const requestedVersion = c.req.query('version');
  const requestedStatus = c.req.query('status');

  let query = 'SELECT * FROM brainstorm_artifacts WHERE project_id = ?';
  const params: (string | number)[] = [projectId];

  if (requestedVersion) {
    query += ' AND version = ?';
    params.push(parseInt(requestedVersion, 10));
  }
  if (requestedStatus) {
    query += ' AND status = ?';
    params.push(requestedStatus.toUpperCase());
  }

  query += ' ORDER BY version DESC LIMIT 1';

  const row = await c.env.DB.prepare(query).bind(...params).first<Record<string, unknown>>();

  if (!row) {
    return c.json({ error: 'No brainstorm artifact found' }, 404);
  }

  // Parse JSON columns
  return c.json({
    ...row,
    options: JSON.parse(row.options as string || '[]'),
    assumptions: JSON.parse(row.assumptions as string || '[]'),
    decision_criteria: JSON.parse(row.decision_criteria as string || '{}'),
    kill_conditions: JSON.parse(row.kill_conditions as string || '[]'),
  });
});

/**
 * POST /:projectId/brainstorm/validate
 *
 * Run the validation engine on the latest brainstorm artifact.
 * Returns BLOCK/WARN checks and overall validity.
 */
brainstorm.post('/:projectId/brainstorm/validate', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Get the latest artifact
  const row = await c.env.DB.prepare(
    'SELECT * FROM brainstorm_artifacts WHERE project_id = ? ORDER BY version DESC LIMIT 1'
  ).bind(projectId).first<Record<string, unknown>>();

  if (!row) {
    return c.json({
      valid: false,
      checks: [{
        check: 'artifact_exists',
        level: 'BLOCK',
        passed: false,
        detail: 'No brainstorm artifact found — AI must generate a structured artifact first',
      }],
      block_count: 1,
      warn_count: 0,
      summary: 'BLOCKED: No brainstorm artifact exists',
    });
  }

  const options: BrainstormOption[] = JSON.parse(row.options as string || '[]');
  const assumptions: string[] = JSON.parse(row.assumptions as string || '[]');
  const decisionCriteria: BrainstormDecisionCriteria = JSON.parse(row.decision_criteria as string || '{}');
  const killConditions: string[] = JSON.parse(row.kill_conditions as string || '[]');

  const result = validateBrainstormArtifact(options, assumptions, decisionCriteria, killConditions);

  return c.json({
    ...result,
    artifact_id: row.id,
    artifact_version: row.version,
    artifact_status: row.status,
  });
});

/**
 * GET /:projectId/brainstorm/validation
 *
 * Run validation on the latest artifact and return the result.
 * (Convenience alias — same logic as POST validate, no body needed.)
 */
brainstorm.get('/:projectId/brainstorm/validation', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const row = await c.env.DB.prepare(
    'SELECT * FROM brainstorm_artifacts WHERE project_id = ? ORDER BY version DESC LIMIT 1'
  ).bind(projectId).first<Record<string, unknown>>();

  if (!row) {
    return c.json({
      valid: false,
      checks: [{
        check: 'artifact_exists',
        level: 'BLOCK',
        passed: false,
        detail: 'No brainstorm artifact found',
      }],
      block_count: 1,
      warn_count: 0,
      summary: 'BLOCKED: No brainstorm artifact exists',
      artifact_id: null,
    });
  }

  const options: BrainstormOption[] = JSON.parse(row.options as string || '[]');
  const assumptions: string[] = JSON.parse(row.assumptions as string || '[]');
  const decisionCriteria: BrainstormDecisionCriteria = JSON.parse(row.decision_criteria as string || '{}');
  const killConditions: string[] = JSON.parse(row.kill_conditions as string || '[]');

  const result = validateBrainstormArtifact(options, assumptions, decisionCriteria, killConditions);

  return c.json({
    ...result,
    artifact_id: row.id,
    artifact_version: row.version,
    artifact_status: row.status,
  });
});

// Export the validateBrainstormArtifact function for use in state.ts finalize
export { validateBrainstormArtifact };
export default brainstorm;
