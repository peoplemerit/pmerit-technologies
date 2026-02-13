/**
 * AIXORD Model Router Worker
 *
 * Cost-aware AI model routing service.
 *
 * Endpoints:
 * - POST /v1/router/execute - Execute AI request with routing
 * - GET  /v1/router/health  - Health check
 * - GET  /v1/router/models  - List available models
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env, RouterResponse, RouterIntent, Provider } from './types';
import { RouterError } from './types';
import { validateRequest } from './schemas/router';
import { getModelClass, isClassAllowedForTier } from './routing/intent-map';
import { executeWithFallback } from './routing/fallback';
import { validateSubscription, incrementUsage as incrementLegacyUsage } from './routing/subscription';
import { incrementUsage as incrementMeteringUsage, getTierLimit } from './middleware/entitlement';
import { estimateCostCents } from './utils/cost';
import { ROUTING_TABLE } from './routing/table';
// PATCH-MOD-01: Affinity-based selection
import { selectWithAffinity } from './routing/affinity-selector';
import { logModelSelection } from './routing/selection-log';
import {
  verifyStripeSignature,
  handleStripeWebhook,
  createCheckoutSession,
  createPortalSession,
  activateGumroadLicense,
  verifyKdpCode
} from './billing';
import { requireAuth } from './middleware/requireAuth';
import { rateLimit } from './middleware/rateLimit';

// Backend API imports
import auth from './api/auth';
import projects from './api/projects';
import state from './api/state';
import decisions from './api/decisions';
import messages from './api/messages';
import github from './api/github';
import evidence from './api/evidence';
import knowledge from './api/knowledge';
import ccs from './api/ccs';
import security from './api/security';
import { usage } from './api/usage';
import images from './api/images';
import sessions from './api/sessions';
import layers from './api/layers';
import engineering from './api/engineering';
import blueprint from './api/blueprint';
import workspace from './api/workspace';
import brainstorm, { computeBrainstormReadiness } from './api/brainstorm';
import assignments from './api/assignments';
import continuity, { getProjectContinuityCompact } from './api/continuity';
import conversations from './api/conversations';
import governance from './api/governance';
import artifacts from './api/artifacts';

const app = new Hono<{ Bindings: Env }>();

// CORS middleware (PATCH-CORS-01: Updated for new domains, LOW-07: localhost conditional)
app.use('*', async (c, next) => {
  const prodOrigins = [
    'https://aixord-webapp-ui.pages.dev',
    'https://aixord.pmerit.com',
    'https://aixord.ai',
  ];
  // Include localhost origins only in non-production environments
  // In production, use `wrangler dev --local` for CORS passthrough
  const allowedOrigins = c.env.ENVIRONMENT === 'production'
    ? prodOrigins
    : [...prodOrigins, 'http://localhost:5173', 'http://localhost:3000'];

  const corsMiddleware = cors({
    origin: allowedOrigins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// =============================================================================
// RATE LIMITING
// =============================================================================

// Global rate limit: 200 requests per minute for general API access
app.use('/api/*', rateLimit({ windowMs: 60000, maxRequests: 200 }));
app.use('/v1/*', rateLimit({ windowMs: 60000, maxRequests: 200 }));

// Stricter rate limits for sensitive endpoints
// Auth endpoints: 10 requests per minute (prevent brute force)
app.use('/api/v1/auth/login', rateLimit({ windowMs: 60000, maxRequests: 10 }));
app.use('/api/v1/auth/register', rateLimit({ windowMs: 60000, maxRequests: 10 }));
app.use('/api/v1/auth/*', rateLimit({ windowMs: 60000, maxRequests: 20 }));

// Router execute: 30 requests per minute (prevent API abuse)
app.use('/v1/router/execute', rateLimit({ windowMs: 60000, maxRequests: 30 }));

// Billing endpoints: 20 requests per minute (prevent payment fraud attempts)
app.use('/api/v1/billing/*', rateLimit({ windowMs: 60000, maxRequests: 20 }));

// Health check
app.get('/v1/router/health', (c) => {
  return c.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// List available models
app.get('/v1/router/models', (c) => {
  const models: Record<string, Array<{ provider: string; model: string }>> = {};

  for (const [classKey, candidates] of Object.entries(ROUTING_TABLE)) {
    models[classKey] = candidates.map(c => ({
      provider: c.provider,
      model: c.model
    }));
  }

  return c.json({
    classes: models,
    timestamp: new Date().toISOString()
  });
});

// Main execute endpoint
app.post('/v1/router/execute', async (c) => {
  const startTime = Date.now();

  try {
    // Parse and validate request
    const body = await c.req.json();
    const request = validateRequest(body);

    // Validate subscription and usage limits
    await validateSubscription(request, c.env.DB);

    // H1/H2: Entitlement check - trial expiration and usage limits
    const userId = request.trace.user_id;
    if (userId) {
      const user = await c.env.DB.prepare(
        'SELECT subscription_tier, trial_expires_at FROM users WHERE id = ?'
      ).bind(userId).first<{
        subscription_tier: string;
        trial_expires_at: string | null;
      }>();

      if (user) {
        const tier = user.subscription_tier || 'TRIAL';
        const now = new Date();
        const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // Check trial expiration
        if (tier === 'TRIAL' && user.trial_expires_at) {
          const expiresAt = new Date(user.trial_expires_at);
          if (now > expiresAt) {
            throw new RouterError(
              'TRIAL_EXPIRED',
              'Your 14-day trial has expired. Please upgrade to continue.',
              403
            );
          }
        }

        // Check usage limits
        const usage = await c.env.DB.prepare(
          'SELECT request_count FROM usage_tracking WHERE user_id = ? AND period = ?'
        ).bind(userId, currentPeriod).first<{ request_count: number }>();

        const requestCount = usage?.request_count || 0;
        const limit = getTierLimit(tier);

        if (requestCount >= limit) {
          throw new RouterError(
            'ALLOWANCE_EXHAUSTED',
            `You've used all ${limit} requests for this period. Upgrade for more.`,
            429
          );
        }
      }
    }

    // SPG-01: AI Exposure Validation (L-SPG3, L-SPG6)
    // Check if project has data classification and if AI exposure is allowed
    const projectId = request.trace.project_id;

    // FIX 1 (Session 13C): Phase-aware exposure bypass
    // During exploratory phases (BRAINSTORM/PLAN), skip AI exposure validation
    // to allow ideation without requiring full data classification
    const requestPhase = (request.capsule?.phase || '').toUpperCase();
    const isExploratoryPhase = requestPhase === 'BRAINSTORM' || requestPhase === 'B' ||
                               requestPhase === 'PLAN' || requestPhase === 'P' ||
                               requestPhase === 'DISCOVER';

    if (isExploratoryPhase) {
      // Phase-based bypass — no logging needed in production
    } else if (projectId) {
      const classification = await c.env.DB.prepare(`
        SELECT ai_exposure, pii, phi, minor_data FROM data_classification WHERE project_id = ?
      `).bind(projectId).first<{
        ai_exposure: string;
        pii: string;
        phi: string;
        minor_data: string;
      }>();

      // L-SPG4: No classification = RESTRICTED (highest protection for unknown)
      const aiExposure = classification?.ai_exposure || 'RESTRICTED';

      // Block PROHIBITED and RESTRICTED without explicit authorization
      if (aiExposure === 'PROHIBITED') {
        throw new RouterError(
          'AI_EXPOSURE_PROHIBITED',
          'L-SPG3: AI exposure is PROHIBITED for this project. Data classification prevents AI access.',
          403
        );
      }

      if (aiExposure === 'RESTRICTED') {
        throw new RouterError(
          'AI_EXPOSURE_RESTRICTED',
          'L-SPG3: AI exposure is RESTRICTED for this project. Declare data classification or request Director authorization.',
          403
        );
      }

      // Log AI exposure for audit (fire-and-forget)
      const logId = crypto.randomUUID();
      c.env.DB.prepare(`
        INSERT INTO ai_exposure_log
          (id, project_id, request_id, classification, exposure_type, authorized, authorized_by, authorization_reason, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        logId,
        projectId,
        request.trace.request_id,
        aiExposure,
        aiExposure === 'CONFIDENTIAL' ? 'REDACTED' : 'FULL_CONTENT',
        true,
        'SYSTEM',
        `AI exposure level ${aiExposure} allows access`,
        new Date().toISOString()
      ).run();

      // SPG-01: Content redaction for CONFIDENTIAL level (L-SPG3)
      if (aiExposure === 'CONFIDENTIAL') {
        request._redaction_config = {
          enabled: true,
          mask_pii: classification?.pii === 'YES',
          mask_phi: classification?.phi === 'YES',
          mask_minor_data: classification?.minor_data === 'YES',
        };
      }
    }

    // Enrich capsule with authoritative security_gates from DB
    // Fixes: capsule security_gates can be stale when sent from client
    // FIX-2: Wrapped in try/catch to prevent cold-start 500 when table is empty
    if (projectId && request.capsule) {
      try {
        const secGates = await c.env.DB.prepare(
          'SELECT gs_dc, gs_dp, gs_ac, gs_ai, gs_jr, gs_rt FROM security_gates WHERE project_id = ?'
        ).bind(projectId).first<{
          gs_dc: number; gs_dp: number; gs_ac: number;
          gs_ai: number; gs_jr: number; gs_rt: number;
        }>();

        if (secGates) {
          const enriched = {
            GS_DC: !!secGates.gs_dc,
            GS_DP: !!secGates.gs_dp,
            GS_AC: !!secGates.gs_ac,
            GS_AI: !!secGates.gs_ai,
            GS_JR: !!secGates.gs_jr,
            GS_RT: !!secGates.gs_rt,
          };
          // Update both legacy field and typed gates.security
          request.capsule.security_gates = enriched;
          if (!request.capsule.gates) {
            request.capsule.gates = { setup: {}, work: {}, security: enriched };
          } else {
            request.capsule.gates.security = enriched;
          }
        }
      } catch (err) {
        console.error('Security gates enrichment failed (non-fatal):', err);
        // Continue without enriched gates — capsule will use client-sent values
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // CONTEXT AWARENESS BRIDGE (HANDOFF-PR-01)
    // Enrich RouterRequest with read-only context for the AI system prompt.
    // AI sees summaries and flags — never raw secrets or authority.
    // ═══════════════════════════════════════════════════════════════════
    if (projectId) {
      const ctx: import('./types').ContextAwareness = {};

      // Tier 1A: Security gates visibility (already fetched above as secGates)
      if (request.capsule.gates?.security) {
        const s = request.capsule.gates.security;
        ctx.security = {
          data_classified: !!s.GS_DC,
          access_control_configured: !!s.GS_AC,
          dependency_protected: !!s.GS_DP,
          ai_compliant: !!s.GS_AI,
          jurisdiction_reviewed: !!s.GS_JR,
          retention_defined: !!s.GS_RT,
        };
      }

      // Tier 1B: Redaction awareness
      if (request._redaction_config?.enabled) {
        ctx.redaction = {
          active: true,
          reason: 'PII_PHI_PROTECTION',
        };
      }

      // Tier 1C: Data classification visibility (re-use classification query result)
      try {
        const dcRow = await c.env.DB.prepare(
          'SELECT pii, phi, minor_data, financial, legal, ai_exposure FROM data_classification WHERE project_id = ?'
        ).bind(projectId).first<{
          pii: string; phi: string; minor_data: string;
          financial: string; legal: string; ai_exposure: string;
        }>();
        if (dcRow) {
          ctx.data_sensitivity = {
            pii: dcRow.pii === 'YES',
            phi: dcRow.phi === 'YES',
            minor_data: dcRow.minor_data === 'YES',
            financial: dcRow.financial === 'YES',
            legal: dcRow.legal === 'YES',
            exposure: dcRow.ai_exposure || 'INTERNAL',
          };
        }
      } catch (err) {
        console.error('Tier 1C data classification query failed (non-fatal):', err);
      }

      // Tier 2D: Evidence context (EXECUTE/REVIEW phases only — keeps prompt lean)
      const phase = (request.capsule?.phase || '').toUpperCase();
      if (phase === 'E' || phase === 'R' || phase === 'EXECUTE' || phase === 'REVIEW') {
        try {
          const evRow = await c.env.DB.prepare(
            `SELECT COUNT(*) as total, SUM(CASE WHEN evidence_type = 'COMMIT' AND status = 'VERIFIED' THEN 1 ELSE 0 END) as commits_verified, SUM(CASE WHEN evidence_type = 'PR' AND status = 'VERIFIED' THEN 1 ELSE 0 END) as prs_merged, MAX(updated_at) as last_sync FROM external_evidence_log WHERE project_id = ?`
          ).bind(projectId).first<{
            total: number; commits_verified: number; prs_merged: number; last_sync: string | null;
          }>();

          // CI status: check latest CI_STATUS evidence
          const ciRow = await c.env.DB.prepare(
            `SELECT title FROM external_evidence_log WHERE project_id = ? AND evidence_type = 'CI_STATUS' ORDER BY updated_at DESC LIMIT 1`
          ).bind(projectId).first<{ title: string }>();

          if (evRow && evRow.total > 0) {
            ctx.evidence_summary = {
              commits_verified: evRow.commits_verified || 0,
              prs_merged: evRow.prs_merged || 0,
              ci_passing: ciRow ? ciRow.title.toLowerCase().includes('pass') || ciRow.title.toLowerCase().includes('success') : null,
              total_evidence: evRow.total || 0,
              last_sync: evRow.last_sync,
            };
          }
        } catch (err) {
          console.error('Tier 2D evidence query failed (non-fatal):', err);
        }
      }

      // Tier 2F: CCS incident awareness (safety-critical)
      try {
        const ccsRow = await c.env.DB.prepare(
          `SELECT id, phase, credential_name, credential_type FROM ccs_incidents WHERE project_id = ? AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1`
        ).bind(projectId).first<{
          id: string; phase: string; credential_name: string; credential_type: string;
        }>();
        if (ccsRow) {
          ctx.incident = {
            active: true,
            type: 'CREDENTIAL_COMPROMISE',
            phase: ccsRow.phase,
            restricted_items: [ccsRow.credential_name],
          };
        }
      } catch (err) {
        console.error('Tier 2F CCS query failed (non-fatal):', err);
      }

      // ═══════════════════════════════════════════════════════════════
      // Tier 3: Task Delegation Layer (HANDOFF-TDL-01)
      // EXECUTE/REVIEW phases: Enrich with active assignments, escalations,
      // and standup cadence so the AI knows its work order.
      // ═══════════════════════════════════════════════════════════════
      const sessionId = request.trace?.session_id;
      if (sessionId && (phase === 'E' || phase === 'EXECUTE')) {
        try {
          // Fetch active assignments for this session with deliverable + scope info
          const assignmentRows = await c.env.DB.prepare(
            `SELECT ta.id, ta.deliverable_id, ta.priority, ta.status, ta.progress_percent,
                    bd.title as deliverable_title, bd.definition_of_done,
                    bs.name as scope_name
             FROM task_assignments ta
             JOIN blueprint_deliverables bd ON bd.id = ta.deliverable_id
             JOIN blueprint_scopes bs ON bs.id = bd.scope_id
             WHERE ta.session_id = ? AND ta.status IN ('ASSIGNED', 'IN_PROGRESS', 'BLOCKED')
             ORDER BY CASE ta.priority WHEN 'P0' THEN 0 WHEN 'P1' THEN 1 WHEN 'P2' THEN 2 END, ta.sort_order`
          ).bind(sessionId).all<{
            id: string; deliverable_id: string; priority: string; status: string;
            progress_percent: number; deliverable_title: string; definition_of_done: string;
            scope_name: string;
          }>();

          // Count open escalations for this session's assignments
          const escRow = await c.env.DB.prepare(
            `SELECT COUNT(*) as cnt FROM escalation_log el
             JOIN task_assignments ta ON ta.id = el.assignment_id
             WHERE ta.session_id = ? AND el.status = 'OPEN'`
          ).bind(sessionId).first<{ cnt: number }>();

          // Get last standup and message count for cadence check
          const standupRow = await c.env.DB.prepare(
            `SELECT MAX(message_number) as last_msg, MAX(created_at) as last_at
             FROM standup_reports WHERE session_id = ?`
          ).bind(sessionId).first<{ last_msg: number | null; last_at: string | null }>();

          // Current message number from session graph
          const currentMsgCount = request.capsule.session_graph?.current?.messageCount || 0;
          const lastStandupMsg = standupRow?.last_msg || 0;
          const messagesSinceStandup = currentMsgCount - lastStandupMsg;

          if (assignmentRows.results && assignmentRows.results.length > 0) {
            ctx.task_delegation = {
              assignments: assignmentRows.results.map(r => ({
                id: r.id,
                deliverable_id: r.deliverable_id,
                deliverable_title: r.deliverable_title || 'Untitled',
                scope_name: r.scope_name || 'Unknown Scope',
                priority: r.priority,
                status: r.status,
                progress_percent: r.progress_percent || 0,
                definition_of_done: r.definition_of_done || '(not defined)',
              })),
              open_escalations: escRow?.cnt || 0,
              standup_due: messagesSinceStandup >= 5,
              message_count: messagesSinceStandup,
              last_standup_at: standupRow?.last_at || null,
            };
          }
        } catch (err) {
          console.error('Tier 3 TDL query failed (non-fatal):', err);
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // Tier 4: Project Continuity Capsule (HANDOFF-PCC-01)
      // Injects compact project-level awareness: session timeline,
      // key decisions, active work, constraints (≤500 tokens).
      // ═══════════════════════════════════════════════════════════════
      try {
        const compactContinuity = await getProjectContinuityCompact(c.env.DB, projectId);
        if (compactContinuity) {
          ctx.continuity = compactContinuity;
        }
      } catch (err) {
        console.error('Tier 4 PCC error (non-fatal):', err);
      }

      // ═══════════════════════════════════════════════════════════════
      // Tier 5: Brainstorm Artifact Status (HANDOFF-PTX-01)
      // Tells the AI whether a brainstorm artifact has been saved,
      // preventing it from restarting brainstorming after Director approval.
      // ═══════════════════════════════════════════════════════════════
      try {
        let artifactRow = await c.env.DB.prepare(
          `SELECT COUNT(*) as count,
                  (SELECT status FROM brainstorm_artifacts WHERE project_id = ? ORDER BY version DESC LIMIT 1) as latest_status
           FROM brainstorm_artifacts WHERE project_id = ?`
        ).bind(projectId, projectId).first<{ count: number; latest_status: string | null }>();

        // DPF-01 Task 2: Retry once if no artifact found but conversation is substantial
        // Addresses D1 write propagation timing on immediate post-save messages
        const messageCount = request.capsule.session_graph?.current?.messageCount || 0;
        if ((!artifactRow || (artifactRow.count || 0) === 0) && messageCount > 5) {
          await new Promise(r => setTimeout(r, 200));
          artifactRow = await c.env.DB.prepare(
            `SELECT COUNT(*) as count,
                    (SELECT status FROM brainstorm_artifacts WHERE project_id = ? ORDER BY version DESC LIMIT 1) as latest_status
             FROM brainstorm_artifacts WHERE project_id = ?`
          ).bind(projectId, projectId).first<{ count: number; latest_status: string | null }>();
        }

        ctx.brainstorm_artifact_saved = (artifactRow?.count || 0) > 0;
        ctx.brainstorm_artifact_state = artifactRow?.latest_status || null;
      } catch {
        ctx.brainstorm_artifact_saved = false;
        ctx.brainstorm_artifact_state = null;
      }

      // ═══════════════════════════════════════════════════════════════
      // Tier 5B: Brainstorm Readiness Vector (HANDOFF-BQL-01)
      // Only computed during BRAINSTORM phase when an artifact exists.
      // Gives AI per-dimension quality feedback to guide improvements.
      // ═══════════════════════════════════════════════════════════════
      const capsulePhase = (request.capsule?.phase || '').toUpperCase();
      if (ctx.brainstorm_artifact_saved && (capsulePhase === 'BRAINSTORM' || capsulePhase === 'B')) {
        try {
          const artifactRow = await c.env.DB.prepare(
            'SELECT options, assumptions, decision_criteria, kill_conditions FROM brainstorm_artifacts WHERE project_id = ? ORDER BY version DESC LIMIT 1'
          ).bind(projectId).first<Record<string, string>>();
          if (artifactRow) {
            const options = JSON.parse(artifactRow.options || '[]');
            const assumptions = JSON.parse(artifactRow.assumptions || '[]');
            const decisionCriteria = JSON.parse(artifactRow.decision_criteria || '{}');
            const killConditions = JSON.parse(artifactRow.kill_conditions || '[]');
            ctx.brainstorm_readiness = computeBrainstormReadiness(options, assumptions, decisionCriteria, killConditions);
          }
        } catch {
          ctx.brainstorm_readiness = null;
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // Tier 5C: Brainstorm Artifact Content for Downstream Phases (FIX-1)
      // When phase is PLAN, EXECUTE, or REVIEW and a finalized/active
      // brainstorm artifact exists, inject the FULL artifact content
      // so the AI can produce project-specific output.
      // Without this, the AI has no knowledge of what was brainstormed.
      // ═══════════════════════════════════════════════════════════════
      if (ctx.brainstorm_artifact_saved && capsulePhase !== 'BRAINSTORM' && capsulePhase !== 'B') {
        try {
          const artifactContentRow = await c.env.DB.prepare(
            `SELECT options, assumptions, decision_criteria, kill_conditions, recommendation
             FROM brainstorm_artifacts WHERE project_id = ?
             ORDER BY version DESC LIMIT 1`
          ).bind(projectId).first<{
            options: string; assumptions: string; decision_criteria: string;
            kill_conditions: string; recommendation: string | null;
          }>();
          if (artifactContentRow) {
            ctx.brainstorm_artifact_content = {
              options: JSON.parse(artifactContentRow.options || '[]'),
              assumptions: JSON.parse(artifactContentRow.assumptions || '[]'),
              decision_criteria: JSON.parse(artifactContentRow.decision_criteria || '{}'),
              kill_conditions: JSON.parse(artifactContentRow.kill_conditions || '[]'),
              recommendation: artifactContentRow.recommendation || null,
            };
          }
        } catch (err) {
          console.error('Tier 5C brainstorm content query failed (non-fatal):', err);
          ctx.brainstorm_artifact_content = null;
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // Tier 6: Unsatisfied Gate Labels (HANDOFF-PTX-01)
      // Provides human-readable gate labels to the AI so it can guide
      // the Director on what's needed for phase advancement.
      // ═══════════════════════════════════════════════════════════════
      try {
        const gateRow = await c.env.DB.prepare(
          'SELECT phase, gates FROM project_state WHERE project_id = ?'
        ).bind(projectId).first<{ phase: string; gates: string }>();
        if (gateRow) {
          const phase = (gateRow.phase || 'BRAINSTORM').toUpperCase();
          const gateMap: Record<string, boolean> = JSON.parse(gateRow.gates || '{}');
          const GATE_LABELS: Record<string, string> = {
            'GA:LIC': 'License acknowledgment',
            'GA:DIS': 'Disclaimer acceptance',
            'GA:TIR': 'Subscription tier active',
            'GA:ENV': 'Workspace bound',
            'GA:FLD': 'Project folder selected',
            'GA:BP':  'Blueprint with scopes + deliverables',
            'GA:IVL': 'Blueprint integrity validation passed',
          };
          const PHASE_GATES: Record<string, string[]> = {
            BRAINSTORM: ['GA:LIC', 'GA:DIS', 'GA:TIR'],
            PLAN: ['GA:LIC', 'GA:DIS', 'GA:TIR', 'GA:ENV'],
            EXECUTE: ['GA:LIC', 'GA:DIS', 'GA:TIR', 'GA:ENV', 'GA:BP', 'GA:IVL'],
            REVIEW: ['GA:LIC', 'GA:DIS', 'GA:TIR', 'GA:ENV', 'GA:BP', 'GA:IVL'],
          };
          const required = PHASE_GATES[phase] || [];
          const unsatisfied = required.filter(g => !gateMap[g]).map(g => GATE_LABELS[g] || g);
          ctx.unsatisfied_gates = unsatisfied.length > 0 ? unsatisfied : null;
        }
      } catch {
        ctx.unsatisfied_gates = null;
      }

      // ═══════════════════════════════════════════════════════════════
      // Tier 6B: Fitness Function Status (GFB-01 Task 1)
      // Provides AI visibility into quality dimension scores.
      // ═══════════════════════════════════════════════════════════════
      try {
        const fitnessRows = await c.env.DB.prepare(
          `SELECT dimension, metric_name, target_value, current_value, status
           FROM fitness_functions WHERE project_id = ?`
        ).bind(projectId).all();
        const ffs = fitnessRows?.results || [];
        if (ffs.length > 0) {
          const failing = ffs
            .filter((f: Record<string, unknown>) => f.status === 'FAILING')
            .map((f: Record<string, unknown>) => ({
              dimension: f.dimension as string,
              metric: f.metric_name as string,
              target: f.target_value as string,
              current: (f.current_value as string) || null,
            }));
          const passing = ffs.filter((f: Record<string, unknown>) => f.status === 'PASSING').length;
          ctx.fitness_status = { total: ffs.length, passing, failing };
        }
      } catch {
        ctx.fitness_status = null;
      }

      // ═══════════════════════════════════════════════════════════════
      // Tier 6C: Reassessment History (GFB-01 Task 3)
      // Provides AI visibility into phase regression history.
      // ═══════════════════════════════════════════════════════════════
      try {
        const reassessRow = await c.env.DB.prepare(
          'SELECT reassess_count FROM project_state WHERE project_id = ?'
        ).bind(projectId).first<{ reassess_count: number }>();
        const count = reassessRow?.reassess_count || 0;
        if (count > 0) {
          ctx.reassess_count = count;
          const lastReassess = await c.env.DB.prepare(
            `SELECT level, phase_from, phase_to, reason
             FROM reassessment_log WHERE project_id = ?
             ORDER BY created_at DESC LIMIT 1`
          ).bind(projectId).first<{ level: number; phase_from: string; phase_to: string; reason: string }>();
          ctx.last_reassessment = lastReassess || null;
        }
      } catch {
        ctx.reassess_count = 0;
        ctx.last_reassessment = null;
      }

      // ═══════════════════════════════════════════════════════════════
      // Tier 7: GitHub Repository Context (FIX-WSC)
      // Fetches the repo file tree and key files (README, package.json)
      // via the GitHub API using the stored encrypted token.
      // This gives the AI actual knowledge of the codebase structure.
      // Only fetches when GitHub is connected and no workspace_context
      // was provided by the frontend (to avoid duplicate data).
      // ═══════════════════════════════════════════════════════════════
      if (!request.delta.workspace_context?.file_tree) {
        try {
          const ghConn = await c.env.DB.prepare(
            `SELECT repo_owner, repo_name, access_token_encrypted
             FROM github_connections WHERE project_id = ?`
          ).bind(projectId).first<{
            repo_owner: string; repo_name: string; access_token_encrypted: string;
          }>();

          if (ghConn?.repo_owner && ghConn?.repo_name && ghConn?.access_token_encrypted) {
            const encKey = c.env.GITHUB_TOKEN_ENCRYPTION_KEY || 'default-key-change-in-production';
            // Decrypt token inline (same pattern as evidence-fetch.ts)
            const decoder = new TextDecoder();
            const encoder = new TextEncoder();
            const keyData = encoder.encode(encKey.padEnd(32, '0').slice(0, 32));
            const combined = Uint8Array.from(atob(ghConn.access_token_encrypted), ch => ch.charCodeAt(0));
            const iv = combined.slice(0, 12);
            const encrypted = combined.slice(12);
            const cryptoKey = await crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, ['decrypt']);
            const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, encrypted);
            const ghToken = decoder.decode(decrypted);

            const repoPath = `${ghConn.repo_owner}/${ghConn.repo_name}`;

            // Fetch repo tree (top-level only to save tokens)
            const treeResp = await fetch(
              `https://api.github.com/repos/${repoPath}/git/trees/HEAD?recursive=false`,
              {
                headers: {
                  'Accept': 'application/vnd.github.v3+json',
                  'Authorization': `Bearer ${ghToken}`,
                  'User-Agent': 'AIXORD-Platform',
                },
              }
            );

            if (treeResp.ok) {
              const treeData = await treeResp.json() as {
                tree: Array<{ path: string; type: string; size?: number }>;
              };

              // Build file tree string
              const treeLines = treeData.tree
                .map(t => `${t.type === 'tree' ? '[DIR]' : '[FILE]'} ${t.path}${t.size ? ` (${t.size}b)` : ''}`)
                .join('\n');

              // Initialize workspace_context if not present
              if (!request.delta.workspace_context) {
                request.delta.workspace_context = {};
              }
              request.delta.workspace_context.file_tree = `GitHub: ${repoPath}\n${treeLines}`;

              // Fetch key files (README, package.json) — small, high-value context
              const KEY_FILES = ['README.md', 'package.json', 'wrangler.toml', 'wrangler.json', 'tsconfig.json'];
              const keyFiles: Array<{ path: string; content: string }> = [];

              for (const fname of KEY_FILES) {
                const exists = treeData.tree.find(t => t.path === fname);
                if (exists && exists.type === 'blob' && (exists.size || 0) < 5000) {
                  try {
                    const fileResp = await fetch(
                      `https://api.github.com/repos/${repoPath}/contents/${fname}`,
                      {
                        headers: {
                          'Accept': 'application/vnd.github.v3.raw',
                          'Authorization': `Bearer ${ghToken}`,
                          'User-Agent': 'AIXORD-Platform',
                        },
                      }
                    );
                    if (fileResp.ok) {
                      const content = await fileResp.text();
                      keyFiles.push({ path: fname, content: content.slice(0, 3000) });
                    }
                  } catch {
                    // Individual file fetch failed — skip silently
                  }
                }
              }

              if (keyFiles.length > 0) {
                request.delta.workspace_context.key_files = [
                  ...(request.delta.workspace_context.key_files || []),
                  ...keyFiles,
                ];
              }
            }
          }
        } catch (err) {
          console.error('Tier 7 GitHub context fetch failed (non-fatal):', err);
        }
      }

      request._context_awareness = ctx;
    }

    // ═══════════════════════════════════════════════════════════════════
    // HARD GATE ENFORCEMENT (Phase 4)
    // AI model is NOT called when required gates for the current phase fail.
    // Governance lives outside the model — in the Router, not in prompts.
    // FIX-2: Wrapped in try/catch to prevent cold-start 500 when
    // project_state doesn't exist yet for brand-new projects.
    // ═══════════════════════════════════════════════════════════════════
    if (projectId) {
      try {
      // Look up project_type alongside gate check (single extra query)
      const projectRow = await c.env.DB.prepare(
        'SELECT project_type FROM projects WHERE id = ?'
      ).bind(projectId).first<{ project_type: string }>();
      if (projectRow?.project_type) {
        (request.capsule as unknown as Record<string, unknown>).project_type = projectRow.project_type;
      }

      const phaseRow = await c.env.DB.prepare(
        'SELECT phase, gates FROM project_state WHERE project_id = ?'
      ).bind(projectId).first<{ phase: string; gates: string }>();

      if (phaseRow) {
        const currentPhase = (phaseRow.phase || 'BRAINSTORM').toUpperCase();
        const gateMap: Record<string, boolean> = JSON.parse(phaseRow.gates || '{}');

        // Per-phase required gates (cumulative — later phases inherit earlier requirements)
        const PHASE_REQUIRED_GATES: Record<string, string[]> = {
          BRAINSTORM: ['GA:LIC', 'GA:DIS', 'GA:TIR'],
          PLAN:       ['GA:LIC', 'GA:DIS', 'GA:TIR', 'GA:ENV'],
          EXECUTE:    ['GA:LIC', 'GA:DIS', 'GA:TIR', 'GA:ENV', 'GA:BP', 'GA:IVL'],
          REVIEW:     ['GA:LIC', 'GA:DIS', 'GA:TIR', 'GA:ENV', 'GA:BP', 'GA:IVL'],
        };

        const GATE_ACTIONS: Record<string, string> = {
          'GA:LIC': 'Confirm your license/subscription tier',
          'GA:DIS': 'Acknowledge the platform disclaimer',
          'GA:TIR': 'Subscription tier must be active',
          'GA:ENV': 'Bind a workspace in the Workspace Wizard',
          'GA:FLD': 'Select a project folder',
          'GA:BP':  'Create at least one scope with deliverables in the Blueprint tab',
          'GA:IVL': 'Pass integrity validation on your blueprint',
        };

        const required = PHASE_REQUIRED_GATES[currentPhase] || [];
        const failedGates = required
          .filter(key => !gateMap[key])
          .map(key => ({
            key,
            label: key.replace('GA:', ''),
            action: GATE_ACTIONS[key] || 'Satisfy this gate requirement',
          }));

        if (failedGates.length > 0) {
          // DO NOT CALL THE AI MODEL — return governance block
          return c.json({
            type: 'governance_block',
            failed_gates: failedGates,
            phase: currentPhase,
            message: `Blocked by AIXORD Governance — ${failedGates.length} required gate(s) unsatisfied for ${currentPhase} phase.`,
          } as Record<string, unknown>, 200);
        }
      }
      } catch (err) {
        // FIX-2: Gate enforcement failure is non-fatal on cold start
        // If project_state doesn't exist yet, skip gate enforcement and let AI respond
        console.error('Hard gate enforcement failed (non-fatal — cold start safe):', err);
      }
    }

    // PATCH-MOD-01: Determine effective intent for affinity-based selection
    // If router_intent is provided, use it; otherwise default from base intent
    const effectiveRouterIntent: RouterIntent = request.router_intent || (request.intent as RouterIntent);

    // Get available providers (simplified - in production would check key availability)
    const availableProviders: Provider[] = ['anthropic', 'openai', 'google', 'deepseek'];

    // PATCH-MOD-01: Use affinity-based selection
    const affinitySelection = selectWithAffinity(
      effectiveRouterIntent,
      request.subscription.tier,
      request.mode,
      availableProviders
    );

    const modelClass = affinitySelection.modelClass;

    // Verify class is allowed for tier (BYOK users bypass — they provide their own key)
    const isBYOK = request.subscription?.key_mode === 'BYOK' && request.subscription?.user_api_key;
    if (!isBYOK && !isClassAllowedForTier(request.subscription.tier, modelClass)) {
      throw new RouterError(
        'CLASS_NOT_ALLOWED',
        `Model class ${modelClass} is not allowed for tier ${request.subscription.tier}`,
        403
      );
    }

    // Execute with fallback
    const response = await executeWithFallback(request, modelClass, c.env);

    // PATCH-MOD-01: Add model selection metadata to response
    if (response.router_debug) {
      response.router_debug.model_selection = {
        router_intent: effectiveRouterIntent,
        affinity_used: affinitySelection.affinityUsed,
        preferred_provider: affinitySelection.preferredProvider,
        rationale: affinitySelection.rationale
      };
    }

    // PATCH-MOD-01: Log model selection for audit (fire-and-forget)
    logModelSelection(c.env.DB, {
      request_id: request.trace.request_id,
      timestamp: new Date().toISOString(),
      intent: effectiveRouterIntent,
      mode: request.mode,
      tier: request.subscription.tier,
      affinity_matched: affinitySelection.affinityUsed,
      selected_provider: response.model_used.provider,
      selected_model: response.model_used.model,
      rationale: affinitySelection.rationale
    });

    // Increment usage (legacy table)
    await incrementLegacyUsage(
      request,
      response.usage.input_tokens,
      response.usage.output_tokens,
      response.usage.cost_usd,
      c.env.DB
    );

    // H2: Increment usage_tracking (new metering system)
    const meteringUserId = request.trace.user_id;
    if (meteringUserId) {
      const totalTokens = response.usage.input_tokens + response.usage.output_tokens;
      const costCents = estimateCostCents(response.model_used.model, totalTokens);
      await incrementMeteringUsage(c.env.DB, meteringUserId, totalTokens, costCents, false);
    }

    return c.json(response);

  } catch (error) {
    const latencyMs = Date.now() - startTime;

    if (error instanceof RouterError) {
      console.error(JSON.stringify({
        type: 'router_error',
        error_code: error.code,
        error_message: error.message,
        latency_ms: latencyMs
      }));

      const errorResponse: RouterResponse = {
        status: 'ERROR',
        content: '',
        model_used: { provider: 'anthropic', model: 'unknown' },
        usage: {
          input_tokens: 0,
          output_tokens: 0,
          cost_usd: 0,
          latency_ms: latencyMs
        },
        error: `${error.code}: ${error.message}`
      };

      return c.json(errorResponse, error.statusCode as 400 | 401 | 403 | 404 | 429 | 500);
    }

    // Unknown error — FIX-2: Enhanced diagnostics for cold-start debugging
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : undefined;
    console.error('Unexpected error:', JSON.stringify({
      message: errMsg,
      stack: errStack,
      type: error?.constructor?.name || 'unknown',
      latency_ms: latencyMs,
    }));

    const errorResponse: RouterResponse = {
      status: 'ERROR',
      content: '',
      model_used: { provider: 'anthropic', model: 'unknown' },
      usage: {
        input_tokens: 0,
        output_tokens: 0,
        cost_usd: 0,
        latency_ms: latencyMs
      },
      error: 'Something went wrong processing your request. Please try sending your message again.'
    };

    return c.json(errorResponse, 500);
  }
});

// Quote endpoint (optional - estimate without executing)
app.post('/v1/router/quote', async (c) => {
  try {
    const body = await c.req.json();
    const request = validateRequest(body);

    const modelClass = getModelClass(
      request.subscription.tier,
      request.intent,
      request.mode
    );

    // Get primary model for quote
    const candidates = ROUTING_TABLE[modelClass];
    const primary = candidates?.[0];

    if (!primary) {
      throw new RouterError('NO_CANDIDATES', `No models for class ${modelClass}`, 500);
    }

    // Rough token estimate (4 chars per token)
    const inputChars = request.delta.user_input.length +
      request.capsule.objective.length +
      (request.capsule.constraints?.join(' ')?.length || 0);
    const estimatedInputTokens = Math.ceil(inputChars / 4);
    const estimatedOutputTokens = request.budget.max_output_tokens || 1000;

    // Import estimateCost
    const { estimateCost } = await import('./providers');
    const estimatedCost = estimateCost(
      primary.provider,
      primary.model,
      estimatedInputTokens,
      estimatedOutputTokens
    );

    return c.json({
      model_class: modelClass,
      primary_model: primary,
      estimated: {
        input_tokens: estimatedInputTokens,
        output_tokens: estimatedOutputTokens,
        cost_usd: estimatedCost
      }
    });

  } catch (error) {
    if (error instanceof RouterError) {
      return c.json({ error: `${error.code}: ${error.message}` }, error.statusCode as 400 | 401 | 403 | 404 | 429 | 500);
    }
    return c.json({ error: 'INTERNAL_ERROR' }, 500);
  }
});

// =============================================================================
// BILLING ENDPOINTS (D8)
// =============================================================================

// Stripe webhook
app.post('/v1/billing/webhook/stripe', async (c) => {
  const signature = c.req.header('stripe-signature') || '';
  const payload = await c.req.text();

  // Verify signature
  const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return c.json({ error: 'Webhook not configured' }, 500);
  }

  const valid = await verifyStripeSignature(payload, signature, webhookSecret);
  if (!valid) {
    return c.json({ error: 'Invalid signature' }, 400);
  }

  try {
    const event = JSON.parse(payload);
    const result = await handleStripeWebhook(event, c.env.DB);
    return c.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// Create checkout session
app.post('/v1/billing/checkout', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json() as {
      price_id: string;
      success_url: string;
      cancel_url: string;
    };

    const stripeKey = c.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return c.json({ error: 'Stripe not configured' }, 500);
    }

    const session = await createCheckoutSession(
      userId,
      body.price_id,
      body.success_url,
      body.cancel_url,
      stripeKey
    );

    return c.json(session);
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return c.json({ error: message }, 500);
  }
});

// Create customer portal session
app.post('/v1/billing/portal', requireAuth, async (c) => {
  try {
    const body = await c.req.json() as {
      customer_id: string;
      return_url: string;
    };

    const stripeKey = c.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return c.json({ error: 'Stripe not configured' }, 500);
    }

    const session = await createPortalSession(
      body.customer_id,
      body.return_url,
      stripeKey
    );

    return c.json(session);
  } catch (error) {
    console.error('Portal error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create portal session';
    return c.json({ error: message }, 500);
  }
});

// Activate Gumroad license
app.post('/v1/billing/activate/gumroad', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json() as {
      license_key: string;
    };

    const productId = c.env.GUMROAD_PRODUCT_ID;
    if (!productId) {
      return c.json({ error: 'Gumroad not configured' }, 500);
    }

    const result = await activateGumroadLicense(
      body.license_key,
      productId,
      c.env.DB,
      userId
    );

    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    return c.json({ success: true, tier: 'MANUSCRIPT_BYOK' });
  } catch (error) {
    console.error('Gumroad activation error:', error);
    return c.json({ error: 'Failed to activate license' }, 500);
  }
});

// Activate KDP code
app.post('/v1/billing/activate/kdp', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json() as {
      code: string;
    };

    const kdpSecret = c.env.KDP_CODE_SECRET;
    if (!kdpSecret) {
      return c.json({ error: 'KDP codes not configured' }, 500);
    }

    const result = await verifyKdpCode(
      body.code,
      kdpSecret,
      c.env.DB,
      userId
    );

    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    return c.json({ success: true, tier: 'MANUSCRIPT_BYOK' });
  } catch (error) {
    console.error('KDP activation error:', error);
    return c.json({ error: 'Failed to activate code' }, 500);
  }
});

// =============================================================================
// BACKEND API ENDPOINTS (D4-CHAT Enablement)
// =============================================================================

// Auth routes
app.route('/api/v1/auth', auth);

// Projects routes
app.route('/api/v1/projects', projects);

// State routes
app.route('/api/v1/state', state);

// Decisions routes (nested under projects)
app.route('/api/v1/projects', decisions);

// Messages routes (nested under projects)
app.route('/api/v1/projects', messages);

// GitHub routes (PATCH-GITHUB-01)
app.route('/api/v1/github', github);

// Evidence routes (PATCH-GITHUB-01)
app.route('/api/v1/evidence', evidence);

// Knowledge Artifacts routes (GKDL-01)
app.route('/api/v1/projects', knowledge);

// CCS routes (PATCH-CCS-01)
app.route('/api/v1/projects', ccs);

// Security routes (SPG-01)
app.route('/api/v1/projects', security);

// Usage routes (H1/H2 - Trial and Metering)
app.route('/api/v1/usage', usage);

// Image routes (ENH-4: Path C — Image Evidence)
app.route('/api/v1/projects', images);

// Session Graph routes (AIXORD v4.4 — Session Governance)
app.route('/api/v1/projects', sessions);

// Execution Layers routes (Path B: Proactive Debugging)
app.route('/api/v1', layers);

// Engineering Governance routes (AIXORD v4.5 — Part XIV)
app.route('/api/v1/projects', engineering);

// Blueprint Governance routes (AIXORD v4.5 — L-BPX, L-IVL)
app.route('/api/v1/projects', blueprint);

// Workspace Binding routes (Unified GA:ENV + GA:FLD)
app.route('/api/v1/projects', workspace);

// Brainstorm Artifact routes (HANDOFF-VD-CI-01)
app.route('/api/v1/projects', brainstorm);

// Task Delegation Layer routes (HANDOFF-TDL-01)
app.route('/api/v1/projects', assignments);

// Project Continuity Capsule routes (HANDOFF-PCC-01)
app.route('/api/v1/projects', continuity);

// Conversation persistence routes (SYS-01)
app.route('/api/v1/conversations', conversations);

// Mathematical Governance routes (WU conservation, readiness, reconciliation)
app.route('/api/v1/projects', governance);

// Artifact Commit Layer routes (L-AB — persistence tracking)
app.route('/api/v1/projects', artifacts);

export default app;
