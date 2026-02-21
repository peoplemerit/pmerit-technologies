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
import type { Env, BrainstormOption, BrainstormDecisionCriteria, BrainstormValidationCheck, BrainstormValidationResult, BrainstormReadiness, ReadinessDimension, ReadinessDimensionStatus } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import { verifyProjectOwnership } from '../utils/projectOwnership';

const brainstorm = new Hono<{ Bindings: Env }>();

brainstorm.use('/*', requireAuth);

// ═══════════════════════════════════════════════════════════════════
// S3-T1: Defensive parsing helpers for brainstorm artifact fields
// AI may store flat schemas (name instead of title, string[] criteria, etc.)
// These helpers normalize DB rows to the types validators expect.
// ═══════════════════════════════════════════════════════════════════

function safeParseOptions(raw: string): BrainstormOption[] {
  try {
    const parsed = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map((opt: Record<string, unknown>, i: number) => ({
      id: String(opt.id || `opt-${i + 1}`),
      title: String(opt.title || opt.name || `Option ${i + 1}`),
      description: String(opt.description || ''),
      assumptions: Array.isArray(opt.assumptions) ? opt.assumptions.map(String) : [],
      kill_conditions: Array.isArray(opt.kill_conditions) ? opt.kill_conditions.map(String) : [],
      pros: Array.isArray(opt.pros) ? opt.pros.map(String) : [],
      cons: Array.isArray(opt.cons) ? opt.cons.map(String) : [],
    }));
  } catch {
    return [];
  }
}

function safeParseDecisionCriteria(raw: string): BrainstormDecisionCriteria {
  try {
    const parsed = JSON.parse(raw || '{}');
    // AI may send string[] instead of { criteria: [...] }
    if (Array.isArray(parsed)) {
      return {
        criteria: parsed.map((c: unknown) => ({
          name: typeof c === 'string' ? c : String(c),
          weight: 3,
          description: '',
        })),
      };
    }
    if (parsed.criteria && Array.isArray(parsed.criteria)) {
      return parsed as BrainstormDecisionCriteria;
    }
    return { criteria: [] };
  } catch {
    return { criteria: [] };
  }
}

function safeParseStringArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
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

  // B1: Must have 3-5 options (aligned with L-BRN governance law: ≥3 required)
  const optionCount = options.length;
  checks.push({
    check: 'option_count',
    level: 'BLOCK',
    passed: optionCount >= 3 && optionCount <= 5,
    detail: optionCount < 3
      ? `Only ${optionCount} option(s) — minimum 3 required for L-BRN governance contract`
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
  // Normalize kill conditions: handle both string and structured {label, detail} formats
  const normalizedKillConditions = allKillConditions.map(kc =>
    typeof kc === 'string' ? kc : (typeof kc === 'object' && kc !== null ? ((kc as Record<string, unknown>).detail || (kc as Record<string, unknown>).description || JSON.stringify(kc)) as string : String(kc))
  );
  const unmeasurable = normalizedKillConditions.filter(kc => !measurablePattern.test(kc));
  checks.push({
    check: 'kill_conditions_measurable',
    level: 'WARN',
    passed: unmeasurable.length === 0,
    detail: unmeasurable.length === 0
      ? 'All kill conditions appear measurable'
      : `${unmeasurable.length} kill condition(s) may not be measurable`,
  });

  // W3: Assumptions should be verifiable (heuristic: non-trivial length)
  // Handle both string[] and structured {label, detail}[] formats from AI output
  const allAssumptions = [
    ...assumptions,
    ...options.flatMap(o => o.assumptions || []),
  ];
  const normalizedAssumptions = allAssumptions.map(a =>
    typeof a === 'string' ? a : (typeof a === 'object' && a !== null ? ((a as Record<string, unknown>).detail || (a as Record<string, unknown>).description || JSON.stringify(a)) as string : String(a))
  );
  const trivialAssumptions = normalizedAssumptions.filter(a => a.trim().length < 15);
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
// Readiness Scoring (HANDOFF-BQL-01 Layer 2a)
//
// Returns a per-dimension quality vector instead of BLOCK/WARN.
// Consumed by Tier 5B (system prompt) and frontend indicator.
// ═══════════════════════════════════════════════════════════════════

function computeBrainstormReadiness(
  options: BrainstormOption[],
  assumptions: string[],
  decisionCriteria: BrainstormDecisionCriteria,
  killConditions: string[]
): BrainstormReadiness {
  const dimensions: ReadinessDimension[] = [];

  // ── OPTIONS dimension ──
  const optionCount = options.length;
  const emptyOptions = options.filter(o => !o.title?.trim() || !o.description?.trim());
  const titles = options.map(o => o.title?.trim().toLowerCase());
  const uniqueTitles = new Set(titles);
  const hasDuplicates = uniqueTitles.size < titles.length;

  let optionsStatus: ReadinessDimensionStatus;
  let optionsDetail: string;
  if (optionCount < 2 || emptyOptions.length > 0) {
    optionsStatus = 'FAIL';
    optionsDetail = optionCount < 2
      ? `Only ${optionCount} option(s) — need at least 2`
      : `${emptyOptions.length} option(s) missing title or description`;
  } else if (optionCount > 5 || hasDuplicates) {
    optionsStatus = 'WARN';
    optionsDetail = optionCount > 5
      ? `${optionCount} options — consider narrowing to 5 or fewer`
      : `${titles.length - uniqueTitles.size} duplicate title(s) detected`;
  } else {
    optionsStatus = 'PASS';
    optionsDetail = `${optionCount} distinct options defined`;
  }
  dimensions.push({ dimension: 'options', status: optionsStatus, detail: optionsDetail });

  // ── ASSUMPTIONS dimension ──
  const allAssumptions = [
    ...assumptions,
    ...options.flatMap(o => o.assumptions || []),
  ];
  const optionsMissingAssumptions = options.filter(o => !o.assumptions || o.assumptions.length === 0);
  const trivialAssumptions = allAssumptions.filter(a => a.trim().length < 15);

  let assumptionsStatus: ReadinessDimensionStatus;
  let assumptionsDetail: string;
  if (optionsMissingAssumptions.length > 0) {
    assumptionsStatus = 'FAIL';
    assumptionsDetail = `${optionsMissingAssumptions.length} option(s) have no assumptions`;
  } else if (assumptions.length === 0 || trivialAssumptions.length > 0) {
    assumptionsStatus = 'WARN';
    assumptionsDetail = assumptions.length === 0
      ? 'No global assumptions — add cross-cutting assumptions'
      : `${trivialAssumptions.length} assumption(s) may be too brief to verify`;
  } else {
    assumptionsStatus = 'PASS';
    assumptionsDetail = `${allAssumptions.length} assumption(s) — all substantive`;
  }
  dimensions.push({ dimension: 'assumptions', status: assumptionsStatus, detail: assumptionsDetail });

  // ── KILL CONDITIONS dimension ──
  const allKillConditions = [
    ...killConditions,
    ...options.flatMap(o => o.kill_conditions || []),
  ];
  const optionsMissingKills = options.filter(o => !o.kill_conditions || o.kill_conditions.length === 0);
  const measurablePattern = /\d|exceed|below|above|less|more|fail|drop|increase|decrease|threshold/i;
  const unmeasurable = allKillConditions.filter(kc => !measurablePattern.test(kc));

  let killStatus: ReadinessDimensionStatus;
  let killDetail: string;
  if (optionsMissingKills.length > 0) {
    killStatus = 'FAIL';
    killDetail = `${optionsMissingKills.length} option(s) have no kill conditions`;
  } else if (unmeasurable.length > 0) {
    killStatus = 'WARN';
    killDetail = `${unmeasurable.length} kill condition(s) lack measurable thresholds`;
  } else {
    killStatus = 'PASS';
    killDetail = `${allKillConditions.length} kill condition(s) — all measurable`;
  }
  dimensions.push({ dimension: 'kill_conditions', status: killStatus, detail: killDetail });

  // ── DECISION CRITERIA dimension ──
  const hasCriteria = decisionCriteria?.criteria && decisionCriteria.criteria.length > 0;
  const criteriaWithWeights = hasCriteria
    ? decisionCriteria.criteria.filter(c => c.weight >= 1 && c.weight <= 5)
    : [];

  let criteriaStatus: ReadinessDimensionStatus;
  let criteriaDetail: string;
  if (!hasCriteria) {
    criteriaStatus = 'FAIL';
    criteriaDetail = 'No decision criteria defined';
  } else if (criteriaWithWeights.length < decisionCriteria.criteria.length) {
    criteriaStatus = 'WARN';
    criteriaDetail = `${decisionCriteria.criteria.length - criteriaWithWeights.length} criteria missing valid weight (1-5)`;
  } else {
    criteriaStatus = 'PASS';
    criteriaDetail = `${criteriaWithWeights.length} criteria with weights`;
  }
  dimensions.push({ dimension: 'decision_criteria', status: criteriaStatus, detail: criteriaDetail });

  // ── Overall readiness ──
  const hasFail = dimensions.some(d => d.status === 'FAIL');
  const hasWarn = dimensions.some(d => d.status === 'WARN');

  let suggestion: string | null = null;
  if (hasFail) {
    const failDims = dimensions.filter(d => d.status === 'FAIL').map(d => d.dimension);
    suggestion = `Fix required: ${failDims.join(', ')}. Ask the AI to regenerate with these improvements.`;
  } else if (hasWarn) {
    const warnDims = dimensions.filter(d => d.status === 'WARN').map(d => d.dimension);
    suggestion = `Improvements suggested: ${warnDims.join(', ')}. You can finalize now or ask the AI to refine.`;
  }

  return {
    ready: !hasFail,
    artifact_exists: true,
    dimensions,
    suggestion,
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

  // GFB-01 Task 2: Mark previous DRAFT/ACTIVE artifacts as HISTORICAL
  // (SUPERSEDED is reserved for explicit REASSESS-driven replacement)
  if (latest) {
    await c.env.DB.prepare(
      `UPDATE brainstorm_artifacts SET status = 'HISTORICAL', superseded_by = ?, updated_at = ?
       WHERE project_id = ? AND status IN ('DRAFT', 'ACTIVE')`
    ).bind(id, now, projectId).run();
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

  // S3-T1: Use defensive parsing to handle AI-generated schema variations
  const options: BrainstormOption[] = safeParseOptions(row.options as string);
  const assumptions: string[] = safeParseStringArray(row.assumptions as string);
  const decisionCriteria: BrainstormDecisionCriteria = safeParseDecisionCriteria(row.decision_criteria as string);
  const killConditions: string[] = safeParseStringArray(row.kill_conditions as string);

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

  // S3-T1: Use defensive parsing to handle AI-generated schema variations
  const options: BrainstormOption[] = safeParseOptions(row.options as string);
  const assumptions: string[] = safeParseStringArray(row.assumptions as string);
  const decisionCriteria: BrainstormDecisionCriteria = safeParseDecisionCriteria(row.decision_criteria as string);
  const killConditions: string[] = safeParseStringArray(row.kill_conditions as string);

  const result = validateBrainstormArtifact(options, assumptions, decisionCriteria, killConditions);

  return c.json({
    ...result,
    artifact_id: row.id,
    artifact_version: row.version,
    artifact_status: row.status,
  });
});

/**
 * GET /:projectId/brainstorm/readiness
 *
 * HANDOFF-BQL-01 Layer 2a: Readiness scoring endpoint.
 * Returns a per-dimension quality vector consumed by:
 *   - Tier 5B system prompt injection (index.ts)
 *   - Frontend readiness indicator (Project.tsx)
 */
brainstorm.get('/:projectId/brainstorm/readiness', async (c) => {
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
      ready: false,
      artifact_exists: false,
      dimensions: [],
      suggestion: 'No brainstorm artifact yet. Continue brainstorming with the AI to generate a structured artifact.',
    } satisfies BrainstormReadiness);
  }

  // S3-T1: Use defensive parsing to handle AI-generated schema variations
  const options: BrainstormOption[] = safeParseOptions(row.options as string);
  const assumptions: string[] = safeParseStringArray(row.assumptions as string);
  const decisionCriteria: BrainstormDecisionCriteria = safeParseDecisionCriteria(row.decision_criteria as string);
  const killConditions: string[] = safeParseStringArray(row.kill_conditions as string);

  const readiness = computeBrainstormReadiness(options, assumptions, decisionCriteria, killConditions);

  return c.json({
    ...readiness,
    artifact_id: row.id,
    artifact_version: row.version,
  });
});

// Export the validateBrainstormArtifact function for use in state.ts finalize
export { validateBrainstormArtifact, computeBrainstormReadiness, safeParseOptions, safeParseDecisionCriteria, safeParseStringArray };
export default brainstorm;
