/**
 * CCS API (PATCH-CCS-01)
 *
 * Credential Compromise & Sanitization Governance
 * Implements GA:CCS gate and CCS lifecycle per AIXORD v4.4
 *
 * Endpoints:
 * - POST   /api/v1/projects/:projectId/ccs/incidents       - Create incident (activates GA:CCS)
 * - GET    /api/v1/projects/:projectId/ccs/incidents       - List incidents
 * - GET    /api/v1/projects/:projectId/ccs/incidents/:id   - Get incident
 * - PUT    /api/v1/projects/:projectId/ccs/incidents/:id/phase - Update phase
 * - POST   /api/v1/projects/:projectId/ccs/incidents/:id/artifacts - Add artifact
 * - GET    /api/v1/projects/:projectId/ccs/incidents/:id/artifacts - List artifacts
 * - POST   /api/v1/projects/:projectId/ccs/incidents/:id/verify    - Add verification test
 * - GET    /api/v1/projects/:projectId/ccs/incidents/:id/verify    - Get verification tests
 * - POST   /api/v1/projects/:projectId/ccs/incidents/:id/attest    - Director attestation
 * - POST   /api/v1/projects/:projectId/ccs/incidents/:id/unlock    - Release GA:CCS
 * - GET    /api/v1/projects/:projectId/ccs/status          - Get GA:CCS status
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import type {
  CCSPhase,
  CCSArtifactType,
  CreateCCSIncidentRequest,
  UpdateCCSPhaseRequest,
  CCSAttestationRequest,
} from '../types';
import { requireAuth } from '../middleware/requireAuth';

const ccs = new Hono<{ Bindings: Env }>();

// All routes require auth
ccs.use('/*', requireAuth);

// Phase order for validation (L-CCS3: Lifecycle is mandatory)
const PHASE_ORDER: CCSPhase[] = [
  'DETECT', 'CONTAIN', 'ROTATE', 'INVALIDATE', 'VERIFY', 'ATTEST', 'UNLOCK'
];

// Required artifacts per phase
const REQUIRED_ARTIFACTS: Record<string, CCSArtifactType[]> = {
  DETECT: ['CCS-01'],
  CONTAIN: ['CCS-02'],
  ROTATE: [],
  INVALIDATE: [],
  VERIFY: ['CCS-03'],
  ATTEST: ['CCS-04'],
  UNLOCK: ['CCS-05'],
};

/**
 * Verify project ownership
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

/**
 * Generate incident number: CCS-YYYY-MM-DD-NNN
 */
async function generateIncidentNumber(db: D1Database): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  const prefix = `CCS-${today}`;

  const result = await db.prepare(`
    SELECT COUNT(*) as count FROM ccs_incidents
    WHERE incident_number LIKE ?
  `).bind(`${prefix}%`).first();

  const count = ((result?.count as number) || 0) + 1;
  return `${prefix}-${count.toString().padStart(3, '0')}`;
}

/**
 * Update project's GA:CCS gate status in capsule
 */
async function updateGACCS(
  db: D1Database,
  projectId: string,
  active: boolean,
  phase: CCSPhase,
  incidentId: string | null
): Promise<void> {
  const current = await db.prepare(
    'SELECT capsule FROM project_state WHERE project_id = ?'
  ).bind(projectId).first();

  const capsule = JSON.parse((current?.capsule as string) || '{}');
  capsule.credential_gate = {
    GA_CCS: active ? 1 : 0,
    ccs_phase: phase,
    incident_id: incidentId,
  };

  await db.prepare(`
    UPDATE project_state SET capsule = ?, updated_at = ?
    WHERE project_id = ?
  `).bind(JSON.stringify(capsule), new Date().toISOString(), projectId).run();
}

/**
 * POST /api/v1/projects/:projectId/ccs/incidents
 * Create a CCS incident - ACTIVATES GA:CCS gate (L-CCS1)
 */
ccs.post('/:projectId/ccs/incidents', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const body = await c.req.json<CreateCCSIncidentRequest>();
  const {
    credential_type,
    credential_name,
    exposure_source,
    exposure_description,
    impact_assessment,
    affected_systems,
  } = body;

  if (!credential_type || !credential_name || !exposure_source || !exposure_description || !impact_assessment) {
    return c.json({ error: 'Missing required fields: credential_type, credential_name, exposure_source, exposure_description, impact_assessment' }, 400);
  }

  const id = crypto.randomUUID();
  const incidentNumber = await generateIncidentNumber(c.env.DB);
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO ccs_incidents (
      id, project_id, incident_number, phase, status,
      credential_type, credential_name, exposure_source, exposure_description, exposure_detected_at,
      impact_assessment, affected_systems,
      created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    projectId,
    incidentNumber,
    'DETECT',
    'ACTIVE',
    credential_type,
    credential_name,
    exposure_source,
    exposure_description,
    now,
    impact_assessment,
    affected_systems ? JSON.stringify(affected_systems) : null,
    userId,
    now,
    now
  ).run();

  // L-CCS1: IF credential.exposed=TRUE → GA:CCS activates immediately (blocking)
  await updateGACCS(c.env.DB, projectId, true, 'DETECT', id);

  return c.json({
    id,
    incident_number: incidentNumber,
    phase: 'DETECT',
    status: 'ACTIVE',
    ga_ccs: 1,
    message: '⚠️ GA:CCS ACTIVATED - All execution blocked until sanitization complete',
  }, 201);
});

/**
 * GET /api/v1/projects/:projectId/ccs/incidents
 * List all CCS incidents for a project
 */
ccs.get('/:projectId/ccs/incidents', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const statusFilter = c.req.query('status');

  let query = 'SELECT * FROM ccs_incidents WHERE project_id = ?';
  const params: string[] = [projectId];

  if (statusFilter) {
    query += ' AND status = ?';
    params.push(statusFilter);
  }

  query += ' ORDER BY created_at DESC';

  const result = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({
    incidents: result.results.map(r => ({
      ...r,
      affected_systems: r.affected_systems ? JSON.parse(r.affected_systems as string) : [],
    })),
    total: result.results.length,
  });
});

/**
 * GET /api/v1/projects/:projectId/ccs/incidents/:incidentId
 * Get detailed incident with artifacts and verification tests
 */
ccs.get('/:projectId/ccs/incidents/:incidentId', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const incidentId = c.req.param('incidentId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const incident = await c.env.DB.prepare(
    'SELECT * FROM ccs_incidents WHERE id = ? AND project_id = ?'
  ).bind(incidentId, projectId).first();

  if (!incident) {
    return c.json({ error: 'Incident not found' }, 404);
  }

  // Get artifacts
  const artifacts = await c.env.DB.prepare(
    'SELECT * FROM ccs_artifacts WHERE incident_id = ? ORDER BY created_at ASC'
  ).bind(incidentId).all();

  // Get verification tests
  const tests = await c.env.DB.prepare(
    'SELECT * FROM ccs_verification_tests WHERE incident_id = ? ORDER BY tested_at ASC'
  ).bind(incidentId).all();

  return c.json({
    ...incident,
    affected_systems: incident.affected_systems ? JSON.parse(incident.affected_systems as string) : [],
    artifacts: artifacts.results,
    verification_tests: tests.results.map(t => ({
      ...t,
      passed: t.passed === 1,
    })),
  });
});

/**
 * PUT /api/v1/projects/:projectId/ccs/incidents/:incidentId/phase
 * Transition to next CCS phase (L-CCS3: Lifecycle is mandatory)
 */
ccs.put('/:projectId/ccs/incidents/:incidentId/phase', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const incidentId = c.req.param('incidentId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const incident = await c.env.DB.prepare(
    'SELECT * FROM ccs_incidents WHERE id = ? AND project_id = ?'
  ).bind(incidentId, projectId).first();

  if (!incident) {
    return c.json({ error: 'Incident not found' }, 404);
  }

  if (incident.status !== 'ACTIVE') {
    return c.json({ error: 'Cannot update phase of resolved incident' }, 400);
  }

  const body = await c.req.json<UpdateCCSPhaseRequest>();
  const { phase } = body;

  const currentPhaseIndex = PHASE_ORDER.indexOf(incident.phase as CCSPhase);
  const newPhaseIndex = PHASE_ORDER.indexOf(phase);

  // L-CCS3: CCS Lifecycle is mandatory - must be sequential
  if (newPhaseIndex !== currentPhaseIndex + 1) {
    return c.json({
      error: 'Invalid phase transition. CCS lifecycle is sequential.',
      current_phase: incident.phase,
      requested_phase: phase,
      next_valid_phase: PHASE_ORDER[currentPhaseIndex + 1] || 'COMPLETE',
    }, 400);
  }

  // L-CCS4: IF any CCS phase incomplete → GA:CCS remains blocking
  // Check required artifacts for current phase before transitioning
  const requiredArtifacts = REQUIRED_ARTIFACTS[incident.phase as string] || [];
  if (requiredArtifacts.length > 0) {
    const placeholders = requiredArtifacts.map(() => '?').join(',');
    const artifacts = await c.env.DB.prepare(`
      SELECT artifact_type FROM ccs_artifacts
      WHERE incident_id = ? AND artifact_type IN (${placeholders})
    `).bind(incidentId, ...requiredArtifacts).all();

    const foundTypes = artifacts.results.map(a => a.artifact_type);
    const missing = requiredArtifacts.filter(t => !foundTypes.includes(t));

    if (missing.length > 0) {
      return c.json({
        error: 'Missing required artifacts for phase transition',
        current_phase: incident.phase,
        missing_artifacts: missing,
      }, 400);
    }
  }

  // Special check for VERIFY → ATTEST transition (L-CCS6, L-CCS7)
  if (incident.phase === 'VERIFY') {
    const tests = await c.env.DB.prepare(`
      SELECT test_type, passed FROM ccs_verification_tests WHERE incident_id = ?
    `).bind(incidentId).all();

    const requiredTests = ['OLD_REJECTED', 'NEW_SUCCESS'];
    const passedTests = tests.results.filter(t => t.passed === 1).map(t => t.test_type);
    const missingTests = requiredTests.filter(t => !passedTests.includes(t));

    if (missingTests.length > 0) {
      return c.json({
        error: 'Required verification tests not passed (L-CCS6, L-CCS7)',
        missing_tests: missingTests,
        message: 'Old credential MUST test as rejected and new credential MUST test as functional',
      }, 400);
    }
  }

  const now = new Date().toISOString();
  const phaseCompletionField = `${(incident.phase as string).toLowerCase()}_completed_at`;

  await c.env.DB.prepare(`
    UPDATE ccs_incidents
    SET phase = ?, ${phaseCompletionField} = ?, updated_at = ?
    WHERE id = ?
  `).bind(phase, now, now, incidentId).run();

  // Update GA:CCS state (still blocking until UNLOCK)
  await updateGACCS(c.env.DB, projectId, phase !== 'UNLOCK', phase, incidentId);

  return c.json({
    id: incidentId,
    phase,
    previous_phase: incident.phase,
    transition_completed_at: now,
    ga_ccs: phase !== 'UNLOCK' ? 1 : 0,
  });
});

/**
 * POST /api/v1/projects/:projectId/ccs/incidents/:incidentId/artifacts
 * Add a CCS artifact (CCS-01 through CCS-05) (L-CCS9: Evidence is mandatory)
 */
ccs.post('/:projectId/ccs/incidents/:incidentId/artifacts', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const incidentId = c.req.param('incidentId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const incident = await c.env.DB.prepare(
    'SELECT id, status FROM ccs_incidents WHERE id = ? AND project_id = ?'
  ).bind(incidentId, projectId).first();

  if (!incident) {
    return c.json({ error: 'Incident not found' }, 404);
  }

  if (incident.status !== 'ACTIVE') {
    return c.json({ error: 'Cannot add artifacts to resolved incident' }, 400);
  }

  const body = await c.req.json<{
    artifact_type: CCSArtifactType;
    title: string;
    content: string;
  }>();

  const { artifact_type, title, content } = body;

  if (!artifact_type || !title || !content) {
    return c.json({ error: 'artifact_type, title, and content required' }, 400);
  }

  const validTypes: CCSArtifactType[] = ['CCS-01', 'CCS-02', 'CCS-03', 'CCS-04', 'CCS-05'];
  if (!validTypes.includes(artifact_type)) {
    return c.json({ error: `Invalid artifact_type. Must be one of: ${validTypes.join(', ')}` }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO ccs_artifacts (id, incident_id, artifact_type, title, content, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, incidentId, artifact_type, title, content, userId, now).run();

  return c.json({
    id,
    artifact_type,
    title,
    created_at: now,
  }, 201);
});

/**
 * GET /api/v1/projects/:projectId/ccs/incidents/:incidentId/artifacts
 * List all artifacts for an incident
 */
ccs.get('/:projectId/ccs/incidents/:incidentId/artifacts', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const incidentId = c.req.param('incidentId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const incident = await c.env.DB.prepare(
    'SELECT id FROM ccs_incidents WHERE id = ? AND project_id = ?'
  ).bind(incidentId, projectId).first();

  if (!incident) {
    return c.json({ error: 'Incident not found' }, 404);
  }

  const result = await c.env.DB.prepare(
    'SELECT * FROM ccs_artifacts WHERE incident_id = ? ORDER BY created_at ASC'
  ).bind(incidentId).all();

  return c.json({
    artifacts: result.results,
    total: result.results.length,
  });
});

/**
 * POST /api/v1/projects/:projectId/ccs/incidents/:incidentId/verify
 * Add a verification test result (L-CCS6, L-CCS7)
 */
ccs.post('/:projectId/ccs/incidents/:incidentId/verify', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const incidentId = c.req.param('incidentId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const incident = await c.env.DB.prepare(
    'SELECT phase, status FROM ccs_incidents WHERE id = ? AND project_id = ?'
  ).bind(incidentId, projectId).first();

  if (!incident) {
    return c.json({ error: 'Incident not found' }, 404);
  }

  if (incident.status !== 'ACTIVE') {
    return c.json({ error: 'Cannot add tests to resolved incident' }, 400);
  }

  if (incident.phase !== 'VERIFY') {
    return c.json({
      error: 'Verification tests only allowed in VERIFY phase',
      current_phase: incident.phase,
    }, 400);
  }

  const body = await c.req.json<{
    test_type: 'OLD_REJECTED' | 'NEW_SUCCESS' | 'DEPENDENT_SYSTEM';
    target_system: string;
    expected_result: string;
    actual_result: string;
    passed: boolean;
  }>();

  const { test_type, target_system, expected_result, actual_result, passed } = body;

  if (!test_type || !target_system || !expected_result || !actual_result || typeof passed !== 'boolean') {
    return c.json({ error: 'test_type, target_system, expected_result, actual_result, and passed required' }, 400);
  }

  const validTestTypes = ['OLD_REJECTED', 'NEW_SUCCESS', 'DEPENDENT_SYSTEM'];
  if (!validTestTypes.includes(test_type)) {
    return c.json({ error: `Invalid test_type. Must be one of: ${validTestTypes.join(', ')}` }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO ccs_verification_tests (id, incident_id, test_type, target_system, expected_result, actual_result, passed, tested_by, tested_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, incidentId, test_type, target_system, expected_result, actual_result, passed ? 1 : 0, userId, now).run();

  return c.json({
    id,
    test_type,
    target_system,
    passed,
    tested_at: now,
  }, 201);
});

/**
 * GET /api/v1/projects/:projectId/ccs/incidents/:incidentId/verify
 * Get all verification tests for an incident
 */
ccs.get('/:projectId/ccs/incidents/:incidentId/verify', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const incidentId = c.req.param('incidentId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const incident = await c.env.DB.prepare(
    'SELECT id FROM ccs_incidents WHERE id = ? AND project_id = ?'
  ).bind(incidentId, projectId).first();

  if (!incident) {
    return c.json({ error: 'Incident not found' }, 404);
  }

  const result = await c.env.DB.prepare(
    'SELECT * FROM ccs_verification_tests WHERE incident_id = ? ORDER BY tested_at ASC'
  ).bind(incidentId).all();

  return c.json({
    tests: result.results.map(t => ({
      ...t,
      passed: t.passed === 1,
    })),
    total: result.results.length,
  });
});

/**
 * POST /api/v1/projects/:projectId/ccs/incidents/:incidentId/attest
 * Director attestation (CCS-04) (L-CCS5: Director attestation required)
 */
ccs.post('/:projectId/ccs/incidents/:incidentId/attest', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const incidentId = c.req.param('incidentId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const incident = await c.env.DB.prepare(
    'SELECT phase, status FROM ccs_incidents WHERE id = ? AND project_id = ?'
  ).bind(incidentId, projectId).first();

  if (!incident) {
    return c.json({ error: 'Incident not found' }, 404);
  }

  if (incident.status !== 'ACTIVE') {
    return c.json({ error: 'Cannot attest resolved incident' }, 400);
  }

  if (incident.phase !== 'ATTEST') {
    return c.json({
      error: 'Attestation only allowed in ATTEST phase',
      current_phase: incident.phase,
    }, 400);
  }

  // Verify all required verification tests passed (L-CCS6, L-CCS7)
  const tests = await c.env.DB.prepare(`
    SELECT test_type, passed FROM ccs_verification_tests WHERE incident_id = ?
  `).bind(incidentId).all();

  const requiredTests = ['OLD_REJECTED', 'NEW_SUCCESS'];
  const passedTests = tests.results.filter(t => t.passed === 1).map(t => t.test_type);
  const missingTests = requiredTests.filter(t => !passedTests.includes(t));

  if (missingTests.length > 0) {
    return c.json({
      error: 'Required verification tests not passed before attestation',
      missing_tests: missingTests,
    }, 400);
  }

  const body = await c.req.json<CCSAttestationRequest>();
  const { attestation_statement } = body;

  if (!attestation_statement) {
    return c.json({ error: 'attestation_statement required' }, 400);
  }

  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE ccs_incidents
    SET attested_by = ?, attestation_statement = ?, attest_completed_at = ?, updated_at = ?
    WHERE id = ?
  `).bind(userId, attestation_statement, now, now, incidentId).run();

  return c.json({
    id: incidentId,
    attested: true,
    attested_by: userId,
    attested_at: now,
    message: 'Director attestation recorded. CCS-04 artifact should be created. Ready for UNLOCK phase.',
  });
});

/**
 * POST /api/v1/projects/:projectId/ccs/incidents/:incidentId/unlock
 * Release GA:CCS gate (L-CCS10: All 5 artifacts required)
 */
ccs.post('/:projectId/ccs/incidents/:incidentId/unlock', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');
  const incidentId = c.req.param('incidentId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const incident = await c.env.DB.prepare(
    'SELECT * FROM ccs_incidents WHERE id = ? AND project_id = ?'
  ).bind(incidentId, projectId).first();

  if (!incident) {
    return c.json({ error: 'Incident not found' }, 404);
  }

  if (incident.status !== 'ACTIVE') {
    return c.json({ error: 'Incident already resolved' }, 400);
  }

  // Must be in ATTEST phase with attestation complete (L-CCS5)
  if (incident.phase !== 'ATTEST' || !incident.attested_by) {
    return c.json({
      error: 'Cannot unlock: Director attestation required (L-CCS5)',
      phase: incident.phase,
      attested: !!incident.attested_by,
    }, 400);
  }

  // L-CCS10: GA:CCS release requires all 5 CCS artifacts complete
  const artifacts = await c.env.DB.prepare(`
    SELECT DISTINCT artifact_type FROM ccs_artifacts WHERE incident_id = ?
  `).bind(incidentId).all();

  const requiredArtifacts: CCSArtifactType[] = ['CCS-01', 'CCS-02', 'CCS-03', 'CCS-04', 'CCS-05'];
  const foundArtifacts = artifacts.results.map(a => a.artifact_type);
  const missingArtifacts = requiredArtifacts.filter(t => !foundArtifacts.includes(t));

  if (missingArtifacts.length > 0) {
    return c.json({
      error: 'Cannot unlock: Missing required CCS artifacts (L-CCS10)',
      missing: missingArtifacts,
      found: foundArtifacts,
    }, 400);
  }

  const now = new Date().toISOString();

  // Update incident to UNLOCK and RESOLVED
  await c.env.DB.prepare(`
    UPDATE ccs_incidents
    SET phase = 'UNLOCK', status = 'RESOLVED', unlock_completed_at = ?, resolved_at = ?, updated_at = ?
    WHERE id = ?
  `).bind(now, now, now, incidentId).run();

  // RELEASE GA:CCS GATE
  await updateGACCS(c.env.DB, projectId, false, 'INACTIVE', null);

  return c.json({
    id: incidentId,
    phase: 'UNLOCK',
    status: 'RESOLVED',
    ga_ccs: 0,
    message: '✅ GA:CCS RELEASED - Normal operations may resume',
    unlocked_at: now,
  });
});

/**
 * GET /api/v1/projects/:projectId/ccs/status
 * Get current GA:CCS gate status
 */
ccs.get('/:projectId/ccs/status', async (c) => {
  const userId = c.get('userId');
  const projectId = c.req.param('projectId');

  if (!await verifyProjectOwnership(c.env.DB, projectId, userId)) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Get capsule for gate status
  const state = await c.env.DB.prepare(
    'SELECT capsule FROM project_state WHERE project_id = ?'
  ).bind(projectId).first();

  const capsule = JSON.parse((state?.capsule as string) || '{}');
  const gateState = capsule.credential_gate || {
    GA_CCS: 0,
    ccs_phase: 'INACTIVE',
    incident_id: null,
  };

  // Get active incidents count
  const activeIncidents = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM ccs_incidents
    WHERE project_id = ? AND status = 'ACTIVE'
  `).bind(projectId).first();

  // Get current active incident details if blocking
  let activeIncident = null;
  if (gateState.incident_id) {
    activeIncident = await c.env.DB.prepare(
      'SELECT incident_number, phase, credential_name, credential_type FROM ccs_incidents WHERE id = ?'
    ).bind(gateState.incident_id).first();
  }

  return c.json({
    ...gateState,
    active_incidents: activeIncidents?.count || 0,
    blocking: gateState.GA_CCS === 1,
    active_incident: activeIncident,
  });
});

export default ccs;
