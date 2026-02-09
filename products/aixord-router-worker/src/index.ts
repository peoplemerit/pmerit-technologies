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

const app = new Hono<{ Bindings: Env }>();

// CORS middleware (PATCH-CORS-01: Updated for new domains)
app.use('*', cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://aixord-webapp-ui.pages.dev',
    'https://aixord.pmerit.com',
    'https://aixord.ai',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

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
      // Log phase-based bypass
      console.log(JSON.stringify({
        type: 'spg01_phase_bypass',
        project_id: projectId,
        request_id: request.trace.request_id,
        phase: requestPhase,
        message: 'AI exposure check bypassed - exploratory phase'
      }));
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
        console.log(JSON.stringify({
          type: 'spg01_redaction_active',
          project_id: projectId,
          request_id: request.trace.request_id,
          mask_pii: classification?.pii === 'YES',
          mask_phi: classification?.phi === 'YES',
          mask_minor_data: classification?.minor_data === 'YES',
        }));
      }
    }

    // Enrich capsule with authoritative security_gates from DB
    // Fixes: capsule security_gates can be stale when sent from client
    if (projectId && request.capsule) {
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
    }

    // ═══════════════════════════════════════════════════════════════════
    // HARD GATE ENFORCEMENT (Phase 4)
    // AI model is NOT called when required gates for the current phase fail.
    // Governance lives outside the model — in the Router, not in prompts.
    // ═══════════════════════════════════════════════════════════════════
    if (projectId) {
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
          console.log(JSON.stringify({
            type: 'governance_block',
            project_id: projectId,
            phase: currentPhase,
            failed_gates: failedGates.map(g => g.key),
            request_id: request.trace.request_id,
          }));

          return c.json({
            type: 'governance_block',
            failed_gates: failedGates,
            phase: currentPhase,
            message: `Blocked by AIXORD Governance — ${failedGates.length} required gate(s) unsatisfied for ${currentPhase} phase.`,
          } as Record<string, unknown>, 200);
        }
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

    // Log for observability
    console.log(JSON.stringify({
      type: 'router_execution',
      trace: request.trace,
      product: request.product,
      tier: request.subscription.tier,
      intent: request.intent,
      router_intent: effectiveRouterIntent,
      mode: request.mode,
      model_class: modelClass,
      model_used: response.model_used,
      affinity_used: affinitySelection.affinityUsed,
      usage: response.usage,
      fallbacks: response.router_debug?.fallbacks || 0,
      total_latency_ms: Date.now() - startTime
    }));

    return c.json(response);

  } catch (error) {
    const latencyMs = Date.now() - startTime;

    if (error instanceof RouterError) {
      console.log(JSON.stringify({
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

      return c.json(errorResponse, error.statusCode);
    }

    // Unknown error
    console.error('Unexpected error:', error);

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
      error: 'INTERNAL_ERROR: An unexpected error occurred'
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
      return c.json({ error: `${error.code}: ${error.message}` }, error.statusCode);
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
app.post('/v1/billing/checkout', async (c) => {
  try {
    const body = await c.req.json() as {
      user_id: string;
      price_id: string;
      success_url: string;
      cancel_url: string;
    };

    const stripeKey = c.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return c.json({ error: 'Stripe not configured' }, 500);
    }

    const session = await createCheckoutSession(
      body.user_id,
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
app.post('/v1/billing/portal', async (c) => {
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
app.post('/v1/billing/activate/gumroad', async (c) => {
  try {
    const body = await c.req.json() as {
      user_id: string;
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
      body.user_id
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
app.post('/v1/billing/activate/kdp', async (c) => {
  try {
    const body = await c.req.json() as {
      user_id: string;
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
      body.user_id
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

export default app;
