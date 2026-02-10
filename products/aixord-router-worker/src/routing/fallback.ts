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

// ═══════════════════════════════════════════════════════════════════
// Phase Awareness Payloads (Phase 4 — Task 2)
//
// Compact, structured context per phase. The AI receives bounded
// instructions (what it can/cannot do), NOT the full governance
// rulebook. Governance lives in the Router; the AI gets just enough
// context to behave correctly within its phase.
// ═══════════════════════════════════════════════════════════════════

interface PhasePayload {
  role: string;
  allowed: string[];
  forbidden: string[];
  exit_artifact: string;
  review_prompt: string;
}

const PHASE_PAYLOADS: Record<string, PhasePayload> = {
  BRAINSTORM: {
    role: 'Explore ideas, define scope, and identify requirements with the user.',
    allowed: [
      'Ask clarifying questions about the objective',
      'Suggest approaches, trade-offs, and considerations',
      'Help define project scope and constraints',
      'Identify risks and open questions',
      'Generate a structured brainstorm artifact when the user is ready',
    ],
    forbidden: [
      'Write implementation code or production artifacts',
      'Make architectural decisions without user input',
      'Skip to planning or execution tasks',
    ],
    exit_artifact: 'A structured brainstorm artifact with 2-5 options, each with assumptions and kill conditions, plus decision criteria. Output it inside === BRAINSTORM ARTIFACT === markers as JSON.',
    review_prompt: 'Are the options distinct? Does each have assumptions and kill conditions? Are decision criteria defined?',
  },
  PLAN: {
    role: 'Structure the implementation approach based on brainstorm outcomes.',
    allowed: [
      'Define deliverables, milestones, and technical architecture',
      'Identify dependencies and risks',
      'Reference decisions from BRAINSTORM phase',
      'Write pseudocode, diagrams, or specification outlines',
    ],
    forbidden: [
      'Write production code or final artifacts',
      'Ignore constraints established in BRAINSTORM',
      'Change scope without explicit user approval',
    ],
    exit_artifact: 'A blueprint with scopes, deliverables, and a definition of done.',
    review_prompt: 'Is the plan specific enough to execute? Are all deliverables defined with DoD?',
  },
  EXECUTE: {
    role: 'Implement assigned deliverables within the declared scope. Work from your task assignments — each has a priority, definition of done, and authority scope.',
    allowed: [
      'Work on ASSIGNED or IN_PROGRESS deliverables only',
      'Follow architecture and decisions from PLAN phase',
      'Post structured progress updates (PROGRESS UPDATE blocks)',
      'Submit completed work for review (SUBMISSION blocks)',
      'Escalate decisions that exceed your authority scope (ESCALATION blocks)',
      'Post periodic standup reports (STANDUP blocks)',
      'Request clarification on ambiguous requirements',
    ],
    forbidden: [
      'Work on deliverables not assigned to this session',
      'Expand scope beyond assigned deliverables without approval (flag as scope creep)',
      'Skip verification or testing steps',
      'Override architectural decisions from PLAN phase',
      'Accept or reject your own work — submission requires Director review',
    ],
    exit_artifact: 'Completed deliverables matching the blueprint specifications with structured submission.',
    review_prompt: 'Does the output match the planned deliverables and their definitions of done?',
  },
  REVIEW: {
    role: 'Evaluate completed work against the project objective.',
    allowed: [
      'Assess deliverables against the original objective',
      'Identify gaps, issues, and improvement opportunities',
      'Summarize accomplishments vs. plan',
      'Recommend next steps or iterations',
    ],
    forbidden: [
      'Make changes to deliverables (send back to EXECUTE for fixes)',
      'Introduce new requirements without user approval',
      'Skip gap analysis or quality assessment',
    ],
    exit_artifact: 'A review report with pass/fail per deliverable and recommended next steps.',
    review_prompt: 'Has all planned work been evaluated? Are gaps documented with remediation paths?',
  },
};

/**
 * Build messages from capsule + delta
 */
function buildMessages(request: RouterRequest): Message[] {
  const messages: Message[] = [];

  // Resolve phase display name
  const PHASE_NAMES: Record<string, string> = {
    'B': 'BRAINSTORM', 'P': 'PLAN', 'E': 'EXECUTE', 'R': 'REVIEW'
  };
  const phaseName = PHASE_NAMES[request.capsule.phase] || request.capsule.phase;
  const payload = PHASE_PAYLOADS[phaseName];

  // Project type context — adapts AI behavior for non-software projects
  const projectType = (request.capsule as unknown as Record<string, unknown>).project_type as string || 'software';
  const PROJECT_TYPE_LABELS: Record<string, string> = {
    software: 'Software Development',
    general: 'General Project',
    research: 'Research & Analysis',
    legal: 'Legal / Document Review',
    personal: 'Personal Project',
  };
  const projectTypeLabel = PROJECT_TYPE_LABELS[projectType] || 'Software Development';

  // Base system message with AIXORD governance framing
  let systemPrompt = `You are an AIXORD-governed AI assistant. AIXORD ensures AI work is structured, auditable, and aligned with the user's project objectives.

PROJECT OBJECTIVE: ${request.capsule.objective || '(Not yet defined)'}
PROJECT TYPE: ${projectTypeLabel}
PHASE: ${phaseName}
${request.capsule.constraints.length > 0 ? `CONSTRAINTS: ${request.capsule.constraints.join('; ')}` : ''}
${request.capsule.decisions.length > 0 ? `DECISIONS: ${request.capsule.decisions.join('; ')}` : ''}
${request.capsule.open_questions.length > 0 ? `OPEN QUESTIONS: ${request.capsule.open_questions.join('; ')}` : ''}`;

  // Non-software project type adaptation
  if (projectType !== 'software') {
    systemPrompt += `\nNOTE: This is a ${projectTypeLabel.toLowerCase()} project. Blueprint, security, and engineering tabs are not applicable. Focus on the project objective within the governance framework. Adapt terminology to fit this domain.`;
  }

  // Phase Awareness Payload — compact bounded context
  if (payload) {
    systemPrompt += `

=== ${phaseName} PHASE ===
Role: ${payload.role}
Allowed: ${payload.allowed.join(' · ')}
Forbidden: ${payload.forbidden.join(' · ')}
Exit artifact: ${payload.exit_artifact}
Review question: ${payload.review_prompt}`;
  }

  // Brainstorm artifact output format (only in BRAINSTORM phase)
  if (phaseName === 'BRAINSTORM') {
    systemPrompt += `

=== BRAINSTORM ARTIFACT FORMAT ===
When the user asks you to generate the brainstorm artifact (or when enough discussion has happened to propose options), output a structured artifact wrapped in markers. The frontend will parse this automatically.

Format:
=== BRAINSTORM ARTIFACT ===
{
  "options": [
    {
      "id": "opt-1",
      "title": "Option Name",
      "description": "What this option entails",
      "assumptions": ["assumption 1", "assumption 2"],
      "kill_conditions": ["condition that would eliminate this option"],
      "pros": ["advantage 1"],
      "cons": ["disadvantage 1"]
    }
  ],
  "assumptions": ["global assumption that applies to all options"],
  "decision_criteria": {
    "criteria": [
      { "name": "Criterion Name", "weight": 3, "description": "What this measures" }
    ]
  },
  "kill_conditions": ["global kill condition"]
}
=== END BRAINSTORM ARTIFACT ===

Rules: 2-5 options required. Each option needs assumptions and kill conditions. Include decision criteria with weights (1-5). You may also include pros/cons per option.`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // Task Delegation Layer — Work Order Injection (EXECUTE phase only)
  // Renders active assignments into the system prompt so the AI knows
  // exactly what it should work on, with priority and authority scope.
  // ═══════════════════════════════════════════════════════════════════
  const tdCtx = request._context_awareness;
  if (phaseName === 'EXECUTE' && tdCtx?.task_delegation) {
    const td = tdCtx.task_delegation;

    if (td.assignments.length > 0) {
      systemPrompt += `\n\n=== WORK ORDER ===
You have ${td.assignments.length} assigned deliverable(s) for this session. Work in priority order (P0 > P1 > P2).

`;
      td.assignments.forEach((a, i) => {
        systemPrompt += `[${i + 1}] ${a.priority} — ${a.deliverable_title} (${a.scope_name})
    Status: ${a.status} | Progress: ${a.progress_percent}%
    Definition of Done: ${a.definition_of_done}
`;
      });

      systemPrompt += `
WORK ORDER RULES:
- Focus on the highest-priority unfinished assignment first
- When you make progress, emit a PROGRESS UPDATE block
- When a deliverable meets its Definition of Done, emit a SUBMISSION block
- If you encounter a decision that exceeds your authority, emit an ESCALATION block
- Do NOT work on deliverables outside this work order`;
    }

    // Standup cadence
    if (td.standup_due) {
      systemPrompt += `\n\nSTANDUP DUE: You have sent ${td.message_count} messages since your last standup. Post a STANDUP block now before continuing work.`;
    }

    // Open escalations notice
    if (td.open_escalations > 0) {
      systemPrompt += `\n\nOPEN ESCALATIONS: ${td.open_escalations} unresolved escalation(s) pending Director decision. Do not proceed on blocked items until resolved.`;
    }

    // Structured output format instructions
    systemPrompt += `

=== STRUCTURED OUTPUT BLOCKS ===
When you need to communicate status, use these exact block formats. The frontend will parse them automatically.

PROGRESS UPDATE (emit when meaningful progress is made):
=== PROGRESS UPDATE ===
assignment_id: [assignment ID]
percent: [0-100]
completed: [what was just completed]
next: [what comes next]
=== END PROGRESS UPDATE ===

SUBMISSION (emit when a deliverable meets its Definition of Done):
=== SUBMISSION ===
assignment_id: [assignment ID]
summary: [1-3 sentence summary of what was delivered]
evidence: [how to verify — test results, file paths, etc.]
=== END SUBMISSION ===

ESCALATION (emit when a decision exceeds your authority scope):
=== ESCALATION ===
assignment_id: [assignment ID]
decision_needed: [clear statement of what needs deciding]
options: [option 1 | option 2 | ...]
recommendation: [your recommended option]
rationale: [why you recommend this]
=== END ESCALATION ===

STANDUP (emit every ~5 messages):
=== STANDUP ===
working_on: [current focus]
completed: [items done since last standup]
blocked: [any blockers]
next: [planned next actions]
estimate: [rough time/effort to completion]
=== END STANDUP ===`;
  }

  // Response guidelines (compact)
  systemPrompt += `

RULES: Reference the objective. Stay in phase scope. Be specific to THIS project. If a request belongs to a different phase, say so.`;

  if (request.policy_flags.require_citations) systemPrompt += `\nCITATIONS: Required for all claims.`;
  if (request.policy_flags.strict_mode) systemPrompt += `\nSTRICT MODE: Be precise and accurate.`;

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

  // AI-Governance Integration — Phase 1: Gate & Blueprint awareness
  if (request.capsule.gates) {
    const g = request.capsule.gates;
    const setupPassed = Object.entries(g.setup).filter(([, v]) => v).map(([k]) => k);
    const setupPending = Object.entries(g.setup).filter(([, v]) => !v).map(([k]) => k);
    const workPassed = Object.entries(g.work).filter(([, v]) => v).map(([k]) => k);
    const workPending = Object.entries(g.work).filter(([, v]) => !v).map(([k]) => k);

    systemPrompt += `\n\n=== GATE STATUS ===`;
    systemPrompt += `\nSetup Gates: ${setupPassed.length > 0 ? setupPassed.join(', ') + ' PASSED' : 'none passed'}${setupPending.length > 0 ? '; ' + setupPending.join(', ') + ' PENDING' : ''}`;
    systemPrompt += `\nWork Gates: ${workPassed.length > 0 ? workPassed.join(', ') + ' PASSED' : 'none passed'}${workPending.length > 0 ? '; ' + workPending.join(', ') + ' PENDING' : ''}`;
  }

  if (request.capsule.phase_exit) {
    const pe = request.capsule.phase_exit;
    if (pe.can_advance) {
      systemPrompt += `\nPHASE EXIT: All ${pe.current_phase} exit gates satisfied. Project CAN advance to next phase.`;
    } else {
      systemPrompt += `\nPHASE EXIT: Cannot leave ${pe.current_phase}. Missing: ${pe.missing_gates.join(', ')}`;
    }
  }

  if (request.capsule.blueprint_summary) {
    const bp = request.capsule.blueprint_summary;
    systemPrompt += `\nBLUEPRINT: ${bp.scopes} scopes, ${bp.deliverables} deliverables (${bp.deliverables_with_dod} with DoD)${bp.integrity_passed !== null ? `. Integrity: ${bp.integrity_passed ? 'PASSED' : 'FAILED'}` : ''}`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // Context Awareness Bridge (HANDOFF-PR-01)
  // Read-only context: AI sees summaries and flags, not raw data.
  // Authority remains external. Enforcement stays outside the model.
  // ═══════════════════════════════════════════════════════════════════
  const ctx = request._context_awareness;
  if (ctx) {
    const ctxLines: string[] = [];

    // Tier 1A: Security gates visibility
    if (ctx.security) {
      const s = ctx.security;
      const secItems: string[] = [];
      if (!s.data_classified) secItems.push('Data not yet classified (GS:DC)');
      if (!s.access_control_configured) secItems.push('Access control not configured (GS:AC)');
      if (!s.ai_compliant) secItems.push('AI compliance not confirmed (GS:AI)');
      if (!s.dependency_protected) secItems.push('Dependencies not reviewed (GS:DP)');
      if (!s.jurisdiction_reviewed) secItems.push('Jurisdiction not reviewed (GS:JR)');
      if (!s.retention_defined) secItems.push('Retention policy not defined (GS:RT)');
      if (secItems.length > 0) {
        ctxLines.push(`Security: ${secItems.join(' · ')}`);
      } else {
        ctxLines.push('Security: All security gates satisfied.');
      }
    }

    // Tier 1B: Redaction awareness
    if (ctx.redaction?.active) {
      ctxLines.push('Redaction: ACTIVE — some user content was redacted for privacy protection. If the user references information you cannot see, explain that data protection is active.');
    }

    // Tier 1C: Data classification visibility
    if (ctx.data_sensitivity) {
      const ds = ctx.data_sensitivity;
      const flags: string[] = [];
      if (ds.pii) flags.push('PII');
      if (ds.phi) flags.push('PHI');
      if (ds.minor_data) flags.push('Minor');
      if (ds.financial) flags.push('Financial');
      if (ds.legal) flags.push('Legal');
      ctxLines.push(`Data sensitivity: ${flags.length > 0 ? flags.join(', ') : 'None declared'}. AI exposure: ${ds.exposure}.`);
    }

    // Tier 2D: Evidence context (EXECUTE/REVIEW only)
    if (ctx.evidence_summary) {
      const ev = ctx.evidence_summary;
      const evParts: string[] = [];
      if (ev.commits_verified > 0) evParts.push(`${ev.commits_verified} commits verified`);
      if (ev.prs_merged > 0) evParts.push(`${ev.prs_merged} PRs merged`);
      if (ev.ci_passing !== null) evParts.push(`CI: ${ev.ci_passing ? 'PASSING' : 'FAILING'}`);
      ctxLines.push(`Evidence: ${evParts.length > 0 ? evParts.join(', ') : 'No verified evidence'}. ${ev.total_evidence} total records.`);
    }

    // Tier 2F: CCS incident awareness (safety-critical)
    if (ctx.incident?.active) {
      const inc = ctx.incident;
      ctxLines.push(`⚠ INCIDENT: ${inc.type} — lifecycle phase: ${inc.phase}. Restricted: ${inc.restricted_items.join(', ')}. Do NOT reference, suggest using, or output these credentials.`);
    }

    if (ctxLines.length > 0) {
      systemPrompt += `\n\n=== CONTEXT AWARENESS ===\n${ctxLines.join('\n')}`;
    }

    // Tier 4: Project Continuity Capsule (HANDOFF-PCC-01)
    if (ctx.continuity) {
      systemPrompt += `\n\n=== PROJECT CONTINUITY ===\n${ctx.continuity}`;

      // Continuity conflict detection rule
      systemPrompt += `\n\nCONTINUITY RULE: If the current conversation contradicts a prior decision listed above, you MUST raise a Continuity Conflict using this format:\n=== CONTINUITY CONFLICT ===\nConflicting decision: [decision ID or summary]\nCurrent request: [what was asked]\nResolution needed: [what Director should decide]\n===`;
    }
  }

  // AI-Governance Integration — Phase 3: Phase advance via Review Packet
  // The AI must ALWAYS prepare a Director Review Packet before suggesting
  // phase transition. This is the behavioral layer that makes governance
  // feel intentional — the Director is guided, not left to guess.
  if (request.capsule.phase_exit?.can_advance) {
    const PHASE_NEXT: Record<string, string> = {
      'BRAINSTORM': 'PLAN', 'PLAN': 'EXECUTE', 'EXECUTE': 'REVIEW',
    };
    const currentPhase = request.capsule.phase_exit.current_phase;
    const nextPhase = PHASE_NEXT[currentPhase];
    if (nextPhase && payload) {
      systemPrompt += `\n\n=== PHASE ADVANCE AVAILABLE ===
All exit gates for ${currentPhase} are satisfied.
When you believe the work in this phase is substantively complete, or the user asks about next steps, you MUST present a REVIEW PACKET before suggesting transition. Do NOT suggest advancing without this packet. Do NOT include it on every message — only when contextually appropriate.

REVIEW PACKET FORMAT (mandatory before any phase advance suggestion):
---
**${currentPhase} Phase Review**

**Summary:** [2-4 sentences: what was accomplished in this phase]

**Review Question:** ${payload.review_prompt}

**Open Questions:**
- [List any unresolved questions — mark as BLOCKING or OPTIONAL]
- (If none, state "No open questions remain.")

**Suggested Adjustments:**
- [Any refinements worth considering before moving on]
- (If none, state "No adjustments needed.")

**Transition:** If you are satisfied, click **Finalize ${currentPhase}** to advance to ${nextPhase}.
If not, tell me what to adjust and I will update the phase output.
---

After presenting the Review Packet, include this tag at the END of your response:
[PHASE_ADVANCE:${nextPhase}]`;
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
