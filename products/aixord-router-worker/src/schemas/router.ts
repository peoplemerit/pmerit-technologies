/**
 * Router Request/Response Validation
 *
 * Validates incoming requests and normalizes data.
 */

import type { RouterRequest, Product, Intent, Mode, SubscriptionTier, KeyMode, RouterIntent } from '../types';
import { RouterError } from '../types';

const VALID_PRODUCTS: Product[] = ['AIXORD_COPILOT', 'PMERIT_CHATBOT'];
const VALID_INTENTS: Intent[] = ['CHAT', 'VERIFY', 'EXTRACT', 'CLASSIFY', 'RAG_VERIFY'];
const VALID_MODES: Mode[] = ['ECONOMY', 'BALANCED', 'PREMIUM'];
const VALID_TIERS: SubscriptionTier[] = [
  'TRIAL', 'MANUSCRIPT_BYOK', 'BYOK_STANDARD',
  'PLATFORM_STANDARD', 'PLATFORM_PRO', 'ENTERPRISE'
];
const VALID_KEY_MODES: KeyMode[] = ['PLATFORM', 'BYOK'];
const VALID_PHASES = ['B', 'P', 'E', 'R', 'BRAINSTORM', 'PLAN', 'EXECUTE', 'REVIEW', 'DISCOVER'];
const PHASE_NORMALIZE: Record<string, string> = {
  'B': 'B', 'P': 'P', 'E': 'E', 'R': 'R',
  'BRAINSTORM': 'B', 'PLAN': 'P', 'EXECUTE': 'E', 'REVIEW': 'R', 'DISCOVER': 'B'
};

// PATCH-MOD-01: Extended intents for affinity-based routing
const VALID_ROUTER_INTENTS: RouterIntent[] = [
  'CHAT', 'VERIFY', 'EXTRACT', 'CLASSIFY', 'BRAINSTORM',
  'SUMMARIZE', 'IMPLEMENT', 'AUDIT', 'RAG_VERIFY'
];

/**
 * Validate router request
 */
export function validateRequest(body: unknown): RouterRequest {
  if (!body || typeof body !== 'object') {
    throw new RouterError('INVALID_REQUEST', 'Request body must be an object', 400);
  }

  const req = body as Record<string, unknown>;

  // Required fields
  if (!req.product || !VALID_PRODUCTS.includes(req.product as Product)) {
    throw new RouterError(
      'INVALID_PRODUCT',
      `product must be one of: ${VALID_PRODUCTS.join(', ')}`,
      400
    );
  }

  if (!req.intent || !VALID_INTENTS.includes(req.intent as Intent)) {
    throw new RouterError(
      'INVALID_INTENT',
      `intent must be one of: ${VALID_INTENTS.join(', ')}`,
      400
    );
  }

  if (!req.mode || !VALID_MODES.includes(req.mode as Mode)) {
    throw new RouterError(
      'INVALID_MODE',
      `mode must be one of: ${VALID_MODES.join(', ')}`,
      400
    );
  }

  // Subscription validation
  const subscription = req.subscription as Record<string, unknown> | undefined;
  if (!subscription || typeof subscription !== 'object') {
    throw new RouterError('INVALID_SUBSCRIPTION', 'subscription object is required', 400);
  }

  if (!subscription.tier || !VALID_TIERS.includes(subscription.tier as SubscriptionTier)) {
    throw new RouterError(
      'INVALID_TIER',
      `subscription.tier must be one of: ${VALID_TIERS.join(', ')}`,
      400
    );
  }

  if (!subscription.key_mode || !VALID_KEY_MODES.includes(subscription.key_mode as KeyMode)) {
    throw new RouterError(
      'INVALID_KEY_MODE',
      `subscription.key_mode must be one of: ${VALID_KEY_MODES.join(', ')}`,
      400
    );
  }

  // Capsule validation
  const capsule = req.capsule as Record<string, unknown> | undefined;
  if (!capsule || typeof capsule !== 'object') {
    throw new RouterError('INVALID_CAPSULE', 'capsule object is required', 400);
  }

  if (typeof capsule.objective !== 'string') {
    throw new RouterError('INVALID_CAPSULE', 'capsule.objective must be a string', 400);
  }

  const rawPhase = (capsule.phase as string || '').toUpperCase();
  if (!rawPhase || !VALID_PHASES.includes(rawPhase)) {
    throw new RouterError(
      'INVALID_CAPSULE',
      `capsule.phase must be one of: B, P, E, R, BRAINSTORM, PLAN, EXECUTE, REVIEW`,
      400
    );
  }
  // Normalize to short code for internal use
  capsule.phase = PHASE_NORMALIZE[rawPhase] || rawPhase;

  // Delta validation
  const delta = req.delta as Record<string, unknown> | undefined;
  if (!delta || typeof delta !== 'object') {
    throw new RouterError('INVALID_DELTA', 'delta object is required', 400);
  }

  if (typeof delta.user_input !== 'string' || !delta.user_input.trim()) {
    throw new RouterError('INVALID_DELTA', 'delta.user_input must be a non-empty string', 400);
  }

  // Trace validation
  const trace = req.trace as Record<string, unknown> | undefined;
  if (!trace || typeof trace !== 'object') {
    throw new RouterError('INVALID_TRACE', 'trace object is required', 400);
  }

  if (!trace.project_id || typeof trace.project_id !== 'string') {
    throw new RouterError('INVALID_TRACE', 'trace.project_id is required', 400);
  }

  if (!trace.session_id || typeof trace.session_id !== 'string') {
    throw new RouterError('INVALID_TRACE', 'trace.session_id is required', 400);
  }

  if (!trace.request_id || typeof trace.request_id !== 'string') {
    throw new RouterError('INVALID_TRACE', 'trace.request_id is required', 400);
  }

  if (!trace.user_id || typeof trace.user_id !== 'string') {
    throw new RouterError('INVALID_TRACE', 'trace.user_id is required', 400);
  }

  // PATCH-MOD-01: Validate optional router_intent
  let routerIntent: RouterIntent | undefined = undefined;
  if (req.router_intent !== undefined && req.router_intent !== null) {
    if (!VALID_ROUTER_INTENTS.includes(req.router_intent as RouterIntent)) {
      throw new RouterError(
        'INVALID_ROUTER_INTENT',
        `router_intent must be one of: ${VALID_ROUTER_INTENTS.join(', ')}`,
        400
      );
    }
    routerIntent = req.router_intent as RouterIntent;
  }

  // Build validated request with defaults
  return {
    product: req.product as Product,
    intent: req.intent as Intent,
    mode: req.mode as Mode,
    subscription: {
      tier: subscription.tier as SubscriptionTier,
      key_mode: subscription.key_mode as KeyMode,
      user_api_key: subscription.user_api_key as string | undefined
    },
    capsule: {
      objective: capsule.objective as string,
      phase: capsule.phase as 'B' | 'P' | 'E' | 'R',
      constraints: Array.isArray(capsule.constraints) ? capsule.constraints : [],
      decisions: Array.isArray(capsule.decisions) ? capsule.decisions : [],
      open_questions: Array.isArray(capsule.open_questions) ? capsule.open_questions : []
    },
    delta: {
      user_input: delta.user_input as string,
      selection_ids: Array.isArray(delta.selection_ids) ? delta.selection_ids : undefined,
      changed_constraints: Array.isArray(delta.changed_constraints) ? delta.changed_constraints : undefined,
      artifact_refs: Array.isArray(delta.artifact_refs) ? delta.artifact_refs : undefined
    },
    budget: {
      max_cost_usd: typeof req.budget === 'object' && req.budget
        ? (req.budget as Record<string, unknown>).max_cost_usd as number | undefined
        : undefined,
      max_input_tokens: typeof req.budget === 'object' && req.budget
        ? (req.budget as Record<string, unknown>).max_input_tokens as number | undefined
        : undefined,
      max_output_tokens: typeof req.budget === 'object' && req.budget
        ? (req.budget as Record<string, unknown>).max_output_tokens as number | undefined
        : 4096,
      max_latency_ms: typeof req.budget === 'object' && req.budget
        ? (req.budget as Record<string, unknown>).max_latency_ms as number | undefined
        : undefined
    },
    policy_flags: {
      require_citations: typeof req.policy_flags === 'object' && req.policy_flags
        ? (req.policy_flags as Record<string, unknown>).require_citations as boolean | undefined
        : false,
      strict_mode: typeof req.policy_flags === 'object' && req.policy_flags
        ? (req.policy_flags as Record<string, unknown>).strict_mode as boolean | undefined
        : false,
      allow_retry: typeof req.policy_flags === 'object' && req.policy_flags
        ? (req.policy_flags as Record<string, unknown>).allow_retry as boolean | undefined
        : true
    },
    trace: {
      project_id: trace.project_id as string,
      session_id: trace.session_id as string,
      request_id: trace.request_id as string,
      user_id: trace.user_id as string
    },
    // PATCH-MOD-01: Optional extended intent for affinity-based routing
    router_intent: routerIntent
  };
}
