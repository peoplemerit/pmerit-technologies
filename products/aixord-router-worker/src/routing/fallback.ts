/**
 * Fallback Execution Logic
 *
 * Handles retries and fallbacks across providers.
 */

import type {
  RouterRequest,
  RouterResponse,
  ModelClass,
  Message,
  Env,
  ProviderModel
} from '../types';
import { RouterError } from '../types';
import { getCandidates } from './table';
import { resolveApiKey, isProviderAvailable } from './key-resolver';
import { callProvider, estimateCost } from '../providers';
import { redactContent } from '../utils/redaction';

/**
 * Build layered execution system prompt (Path B: Proactive Debugging)
 * Added during Execute phase when execution_layer context is provided
 */
function buildLayeredExecutionPrompt(layer: NonNullable<RouterRequest['delta']['execution_layer']>): string {
  const expectedInputs = layer.expected_inputs
    ? Object.entries(layer.expected_inputs).map(([k, v]) => `  - ${k}: ${v}`).join('\n')
    : '  (No specific inputs declared)';

  const expectedOutputs = layer.expected_outputs
    ? Object.entries(layer.expected_outputs).map(([k, v]) => `  - ${k}: ${v}`).join('\n')
    : '  (No specific outputs declared)';

  return `

=== LAYERED EXECUTION MODE ===

You are executing in LAYERED EXECUTION MODE. Work is divided into discrete layers that must be verified before proceeding.

CURRENT LAYER: ${layer.layer_number} - ${layer.title}
LAYER STATUS: ${layer.status}
PROGRESS: ${layer.locked_layers_count} locked, ${layer.failed_layers_count} failed, ${layer.total_layers} total

EXPECTED INPUTS for this layer:
${expectedInputs}

EXPECTED OUTPUTS for this layer:
${expectedOutputs}

=== LAYERED EXECUTION RULES ===

1. FOCUS ONLY on this layer's scope - do not work on tasks from other layers
2. DO NOT reference or modify work from locked layers (they are immutable)
3. DECLARE any inputs you need that aren't available by saying "LAYER_BLOCKED: [reason]"
4. At completion, SUMMARIZE what you produced vs. what was expected:
   - List each expected output and whether it was achieved
   - Note any enhancements beyond the expected outputs
   - Note any deviations or partial completions
5. CONCLUDE with a verification prompt asking the user to confirm before proceeding

If you cannot complete this layer due to missing prerequisites, respond with:
LAYER_BLOCKED: [detailed reason including what is missing]

=== END LAYERED EXECUTION MODE ===`;
}

/**
 * Build messages from capsule + delta
 */
function buildMessages(request: RouterRequest): Message[] {
  const messages: Message[] = [];

  // Base system message with capsule context
  let systemPrompt = `You are an AI assistant operating under AIXORD governance.

Current context:
- Objective: ${request.capsule.objective}
- Phase: ${request.capsule.phase}
- Constraints: ${request.capsule.constraints.join(', ') || 'None'}
- Key decisions: ${request.capsule.decisions.join(', ') || 'None'}
- Open questions: ${request.capsule.open_questions.join(', ') || 'None'}

${request.policy_flags.require_citations ? 'IMPORTANT: Provide citations for all claims.' : ''}
${request.policy_flags.strict_mode ? 'IMPORTANT: Strict mode enabled. Be precise and accurate.' : ''}`;

  // Session graph context (v4.4)
  if (request.capsule.session_graph) {
    const sg = request.capsule.session_graph;
    systemPrompt += `\n\nSession context:
- Current session: #${sg.current.number} (${sg.current.type}, ${sg.current.messageCount} messages)
- Total sessions: ${sg.total}`;
    if (sg.lineage?.length) {
      systemPrompt += `\n- Prior sessions: ${sg.lineage.map(l => `#${l.number} ${l.type} [${l.edgeType}]${l.summary ? ': ' + l.summary.slice(0, 100) : ''}`).join('; ')}`;
    }
  }

  // Workspace binding context (v4.4 — Session 24)
  if (request.capsule.workspace) {
    const ws = request.capsule.workspace;
    if (ws.bound) {
      systemPrompt += `\n\nWorkspace:
- Folder: ${ws.folder_name || 'linked'}
- Template: ${ws.template || 'unknown'}
- Permission: ${ws.permission_level || 'readwrite'}
- Scaffold: ${ws.scaffold_generated ? 'generated' : 'not generated'}
- GitHub: ${ws.github_connected ? (ws.github_repo || 'connected') : 'not connected'}`;
    } else {
      systemPrompt += `\n\nWorkspace: not bound (no local folder linked)`;
    }
  }

  // Path B: Add layered execution instructions during Execute phase
  if (request.capsule.phase === 'E' && request.delta.execution_layer) {
    systemPrompt += buildLayeredExecutionPrompt(request.delta.execution_layer);
  }

  messages.push({ role: 'system', content: systemPrompt });

  // User message with delta
  let userContent = request.delta.user_input;

  if (request.delta.selection_ids?.length) {
    userContent += `\n\nSelected options: ${request.delta.selection_ids.join(', ')}`;
  }

  if (request.delta.changed_constraints?.length) {
    userContent += `\n\nUpdated constraints: ${request.delta.changed_constraints.join(', ')}`;
  }

  if (request.delta.artifact_refs?.length) {
    userContent += `\n\nReferenced artifacts: ${request.delta.artifact_refs.map(a => `${a.id} (${a.type})`).join(', ')}`;
  }

  // SPG-01: Apply content redaction for CONFIDENTIAL classification (L-SPG3)
  if (request._redaction_config?.enabled) {
    const { redacted, redactionCount, redactedTypes } = redactContent(
      userContent,
      request._redaction_config
    );
    userContent = redacted;
    if (redactionCount > 0) {
      console.log(JSON.stringify({
        type: 'spg01_content_redacted',
        request_id: request.trace.request_id,
        redaction_count: redactionCount,
        redacted_types: redactedTypes,
      }));
    }
  }

  messages.push({ role: 'user', content: userContent });

  return messages;
}

/**
 * Execute request with fallback across providers
 */
export async function executeWithFallback(
  request: RouterRequest,
  modelClass: ModelClass,
  env: Env
): Promise<RouterResponse> {
  const candidates = getCandidates(modelClass);

  if (candidates.length === 0) {
    throw new RouterError(
      'NO_CANDIDATES',
      `No models configured for class ${modelClass}`,
      500
    );
  }

  // Filter to available providers
  const availableCandidates = candidates.filter(c =>
    isProviderAvailable(request.subscription, c.provider, env)
  );

  if (availableCandidates.length === 0) {
    throw new RouterError(
      'NO_AVAILABLE_PROVIDERS',
      `No available providers for class ${modelClass}. Check API keys.`,
      503
    );
  }

  const messages = buildMessages(request);
  let lastError: Error | null = null;
  let fallbackCount = 0;

  for (const candidate of availableCandidates) {
    const startTime = Date.now();

    try {
      const apiKey = resolveApiKey(request.subscription, candidate.provider, env);

      const response = await callProvider(
        candidate,
        messages,
        apiKey,
        {
          maxOutputTokens: request.budget.max_output_tokens,
          maxLatencyMs: request.budget.max_latency_ms
        },
        request.delta.images // ENH-4: Pass images for vision API
      );

      const latencyMs = Date.now() - startTime;
      const costUsd = estimateCost(
        candidate.provider,
        candidate.model,
        response.usage.input_tokens,
        response.usage.output_tokens
      );

      // Check budget constraints
      if (request.budget.max_cost_usd && costUsd > request.budget.max_cost_usd) {
        throw new RouterError(
          'BUDGET_EXCEEDED',
          `Cost ${costUsd.toFixed(4)} exceeds budget ${request.budget.max_cost_usd}`,
          402
        );
      }

      return {
        status: fallbackCount > 0 ? 'RETRIED' : 'OK',
        content: response.content,
        model_used: {
          provider: candidate.provider,
          model: candidate.model,
          class: modelClass
        },
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
          cost_usd: costUsd,
          latency_ms: latencyMs
        },
        router_debug: {
          route: `${modelClass}->${candidate.provider}/${candidate.model}`,
          fallbacks: fallbackCount
        }
      };
    } catch (error) {
      lastError = error as Error;
      fallbackCount++;

      // Don't retry on budget/policy errors
      if (error instanceof RouterError) {
        if (['BUDGET_EXCEEDED', 'BYOK_KEY_MISSING', 'BYOK_REQUIRED'].includes(error.code)) {
          throw error;
        }
      }

      // Check if retry is allowed
      if (!request.policy_flags.allow_retry) {
        throw error;
      }

      // Continue to next candidate
      console.log(`[Router] Fallback ${fallbackCount}: ${candidate.provider}/${candidate.model} failed, trying next...`);
    }
  }

  // All candidates failed
  throw new RouterError(
    'ALL_PROVIDERS_FAILED',
    `All providers failed for class ${modelClass}. Last error: ${lastError?.message}`,
    503
  );
}
