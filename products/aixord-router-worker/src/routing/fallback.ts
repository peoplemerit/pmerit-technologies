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
    exit_artifact: 'A structured plan artifact (=== PLAN ARTIFACT === JSON block) containing scopes, deliverables with Definitions of Done, milestones, tech stack, and risks. The frontend will parse this and populate the Blueprint panel.',
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
Finalize action: When the user approves, guide them to click Finalize ${phaseName} in the Governance panel.`;
  }

  // DPF-01 Task 3: Interaction SOP — applies to ALL phases
  systemPrompt += `

=== INTERACTION RULES ===
You are responsible for meeting all governance quality standards.
Never ask the user to evaluate Definition of Done, acceptance criteria, completeness, deliverable quality, or any internal governance metric.
Never surface governance terminology as review questions to the user.
The user may not know these concepts — and they don't need to.
YOU assess quality. The user assesses whether the work matches their vision.

When presenting completed work:
1. State what you produced and what it covers
2. Highlight key decisions or trade-offs you made
3. Ask: "Does this match what you had in mind?" or "Anything you'd change?"
4. If the user approves, guide them to click Finalize ${phaseName || 'the current phase'} in the Governance panel

When you are uncertain about the user's intent:
- Ask about their GOALS, not about your deliverable structure
- "What's most important to you about this?" NOT "Is this complete enough?"
- "What outcome are you looking for?" NOT "Are the acceptance criteria clear?"

When the user says "Approved", "Yes", "Looks good", or similar:
- Acknowledge their approval
- Do NOT restart or re-ask clarifying questions
- Guide them to Finalize the current phase

=== ROOT CAUSE DOCTRINE ===
When the user reports a problem, error, or unexpected behavior:
1. NEVER propose a fix for the symptom alone. First investigate WHY.
2. Ask "what changed?" and "what was the expected vs actual behavior?" to isolate the root cause.
3. Trace backwards from the symptom: What action triggered it? What state was the system in? What assumption was violated?
4. Distinguish symptoms (what the user sees) from root causes (the underlying defect or gap).
5. When proposing a fix, explain BOTH:
   - The root cause: why this happened
   - The fix: what changes and why it addresses the root cause (not just the symptom)
6. If you cannot determine the root cause with available information, say so and ask targeted diagnostic questions rather than guessing.
7. Prefer fixes that prevent recurrence over fixes that only address the current instance.`;

  // DPF-01 Task 4: Phase Output Contracts — phase-specific quality standards
  const PHASE_OUTPUT_CONTRACTS: Record<string, string> = {
    BRAINSTORM: `
=== BRAINSTORM OUTPUT CONTRACT ===
Your brainstorm artifact must contain:
- 2-5 OPTIONS that are meaningfully distinct (different approaches, not variations)
- Each option: name, description (2-4 sentences specific to THIS project), expected outcome, scope boundaries
- ASSUMPTIONS per option, tagged KNOWN/UNKNOWN/HIGH-RISK/EXTERNAL
- KILL CONDITIONS per option with measurable thresholds (dates, costs, metrics — not "if it doesn't work")
- DECISION CRITERIA: what to optimize for, what constraints exist

Everything must reference the user's stated objective and context.
Generic templates, placeholder text, and "[TBD]" entries are not acceptable.
If you lack information to be specific, ask the user before generating the artifact.`,

    PLAN: `
=== PLAN OUTPUT CONTRACT ===
You may ONLY work from the Brainstorm Output Artifact. Do NOT invent new options.

Your plan must contain:
- SELECTED OPTION: Which brainstorm option was chosen and why (reference by name)
- RESOLVED ASSUMPTIONS: Each UNKNOWN/HIGH-RISK assumption from brainstorm addressed with a resolution strategy
- DELIVERABLES: Specific to THIS project — named, described, with concrete scope (not "Frontend Module" but the actual component name and what it does)
- MILESTONES: Relative timing (Week 1, Week 2) — never "[Completion Date]" placeholders
- TECH STACK: Use the project's declared technology stack when available in the workspace context. Do NOT suggest generic stacks (React Native, Node.js+Express, MongoDB) when the project already uses specific technologies (e.g., Cloudflare Workers, D1, Pages). Justify technology choices by project constraints.
- RISKS: Derived from the kill conditions and unresolved assumptions in the brainstorm

CRITICAL: When the user approves the plan, you MUST output a structured === PLAN ARTIFACT === block (see PLAN ARTIFACT FORMAT below). This is how the blueprint gets populated. Without it, the Director cannot finalize the PLAN phase.

If the brainstorm artifact is not available in context, tell the user:
"I need the brainstorm artifact to create a project-specific plan. Please ensure brainstorming was finalized."`,

    EXECUTE: `
=== EXECUTE OUTPUT CONTRACT ===
Work from the Plan artifact. Each response must advance a specific deliverable.

When producing work:
- Name which deliverable you're working on
- Reference the plan's specification for that deliverable
- Produce concrete output (code, content, configuration — not descriptions of what you would do)
- Report what's done and what remains for this deliverable`,

    REVIEW: `
=== REVIEW OUTPUT CONTRACT ===
Verify each deliverable against its plan specification.

For each deliverable:
- State the acceptance criteria from the plan
- Report PASS or FAIL with evidence
- If FAIL, state specifically what's missing or incorrect

Produce a Review Report summarizing all deliverables with their status.`,
  };

  const outputContract = PHASE_OUTPUT_CONTRACTS[phaseName];
  if (outputContract) {
    systemPrompt += outputContract;
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

    // HANDOFF-BQL-01 Layer 1: Quality-Aware Phase Payload
    // Tells the AI the exact quality bar the validator will check.
    systemPrompt += `

=== BRAINSTORM QUALITY REQUIREMENTS ===
When generating brainstorm artifacts, every element must meet these standards. These are validated when the Director clicks Finalize Brainstorm — generate artifacts that pass these checks so the Director can advance without friction.

OPTIONS (2–5 required):
- Each option must be meaningfully distinct (different approach, not cosmetic variation)
- Each must include: title, description (2–4 sentences), assumptions, kill conditions

ASSUMPTIONS (per option + global):
- Every assumption must be tagged: KNOWN, UNKNOWN, HIGH-RISK, or EXTERNAL
- Each should include how it could be verified (evidence or test)
- "We'll figure it out later" is not an acceptable assumption

KILL CONDITIONS (per option + global, at least 1 each):
- Must be binary (true/false) — not vague ("if it doesn't work")
- Must include a measurable threshold: date, cost number, dependency availability, metric target
- Good: "If barcode scan accuracy < 95% in testing → kill this option"
- Bad: "If the app isn't popular enough → reconsider"
- Good: "If development cost exceeds $15,000 in Q1 → kill this option"
- Bad: "If costs are too high → kill this option"

DECISION CRITERIA:
- Must state what to optimize for (cost, speed, quality, compliance)
- Must state constraints (budget, timeline, tools, skill level)
- Each criterion needs a weight (1-5) reflecting its importance`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PLAN ARTIFACT FORMAT — Structured blueprint output (PLAN phase only)
  // Mirrors the BRAINSTORM ARTIFACT pattern: AI outputs structured JSON
  // between markers, frontend parses and saves to blueprint tables.
  // Without this, the AI produces plan text that can't be finalized.
  // ═══════════════════════════════════════════════════════════════════
  if (phaseName === 'PLAN') {
    systemPrompt += `

=== PLAN ARTIFACT FORMAT ===
When the user approves the plan (or when you have enough detail to propose a complete blueprint), output a structured plan artifact wrapped in markers. The frontend will parse this automatically and populate the Blueprint panel.

Format:
=== PLAN ARTIFACT ===
{
  "selected_option": {
    "id": "opt-N",
    "title": "The brainstorm option that was chosen",
    "rationale": "Why this option was selected over alternatives"
  },
  "scopes": [
    {
      "name": "Scope Name (specific to this project)",
      "purpose": "What this scope accomplishes — 1-2 sentences",
      "boundary": "What is IN scope vs OUT of scope",
      "assumptions": ["assumption 1", "assumption 2"],
      "deliverables": [
        {
          "name": "Deliverable Name (specific, not generic)",
          "description": "What this deliverable produces — 2-3 sentences",
          "dod_evidence_spec": "What evidence proves this is done (e.g., 'API endpoint returns 200 with valid JSON')",
          "dod_verification_method": "How to verify (e.g., 'Run integration tests', 'Manual review of output')",
          "upstream_deps": [],
          "downstream_deps": []
        }
      ]
    }
  ],
  "milestones": [
    { "name": "Milestone 1", "target": "Week 1", "deliverables": ["Deliverable Name 1", "Deliverable Name 2"] }
  ],
  "tech_stack": [
    { "component": "Backend", "technology": "Technology Name", "rationale": "Why this fits the project" }
  ],
  "risks": [
    { "description": "Risk description", "mitigation": "How to mitigate", "source": "kill_condition or assumption it derives from" }
  ]
}
=== END PLAN ARTIFACT ===

PLAN ARTIFACT RULES:
- Every scope MUST have at least 1 deliverable
- Every deliverable MUST have dod_evidence_spec AND dod_verification_method (these are required for finalization)
- Scope names must be specific to THIS project (not "Frontend Module" but the actual component)
- Deliverable names must describe concrete outputs (not "Implement feature" but what the feature produces)
- Tech stack MUST match the project's declared technology preferences when available
- Dependencies (upstream_deps/downstream_deps) reference other deliverable names
- Output the artifact ONLY when you have a complete, approved plan — not during discussion`;

    // PLAN QUALITY REQUIREMENTS — tells AI what the finalization validator checks
    systemPrompt += `

=== PLAN QUALITY REQUIREMENTS ===
When generating plan artifacts, every element must meet these standards. These are validated when the Director clicks Finalize Plan — generate artifacts that pass these checks so the Director can advance without friction.

SCOPES (at least 1 required):
- Each scope must have: name, purpose, boundary
- Assumptions should be specific and verifiable (not vague)

DELIVERABLES (at least 1 required, under a scope):
- Each must have: name, description, dod_evidence_spec, dod_verification_method
- dod_evidence_spec: Concrete evidence (test results, screenshots, API responses — not "it works")
- dod_verification_method: How to check (automated test, manual review, metric threshold)
- No orphan deliverables (every deliverable must belong to a scope)

INTEGRITY CHECKS (auto-validated):
- All scopes have purpose defined
- All deliverables have Definition of Done (evidence + verification)
- No circular dependencies in the DAG
- No self-referencing dependencies`;
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

    // EXE-GAP-001/002: File deliverable format + size guard
    systemPrompt += `

=== FILE DELIVERABLES ===
When producing code files, output them using this format so the system can write them to the workspace automatically:

\`\`\`language:path/to/file.ext
file content here
\`\`\`

RULES:
- One file per code fence — do NOT combine multiple files in one fence
- Path is relative to project root (e.g., src/App.tsx, package.json)
- Language must match the file extension (js, ts, tsx, html, css, json, etc.)
- Keep each file under 150 lines — if larger, split into logical modules
- Deliver files ONE AT A TIME: output one file, then describe what it does, then the next
- Do NOT dump all project files in a single response — work through deliverables sequentially
=== END FILE DELIVERABLES ===`;
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

  // ═══════════════════════════════════════════════════════════════════
  // FIX-WSC: Workspace File Context — inject actual file tree + key file
  // contents so the AI can reference the project's real codebase.
  // Without this, the AI has zero knowledge of the actual project files.
  // ═══════════════════════════════════════════════════════════════════
  const wsc = request.delta.workspace_context;
  if (wsc) {
    if (wsc.file_tree) {
      systemPrompt += `\n\n=== PROJECT FILE STRUCTURE ===
${wsc.file_tree}`;
    }
    if (wsc.key_files && wsc.key_files.length > 0) {
      systemPrompt += `\n\n=== KEY PROJECT FILES ===`;
      for (const file of wsc.key_files) {
        systemPrompt += `\n--- ${file.path} ---\n${file.content}\n`;
      }
      systemPrompt += `\nUse these files to understand the project's technology stack, dependencies, and structure. Reference specific files and their content when making recommendations.`;
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

    // Tier 5: Brainstorm Artifact Status + Approval Detection (HANDOFF-PTX-01)
    if (phaseName === 'BRAINSTORM') {
      if (ctx.brainstorm_artifact_saved) {
        const artifactState = ctx.brainstorm_artifact_state || 'DRAFT';
        systemPrompt += `\n\n=== BRAINSTORM STATUS ===
Artifact: saved | State: ${artifactState}${artifactState === 'DRAFT' ? ' (not yet finalized — Director has not advanced phase)' : artifactState === 'ACTIVE' ? ' (governing artifact — authoritative)' : ''}
Do NOT restart brainstorming or ask new clarifying questions about scope.

APPROVAL DETECTION: If the Director says "Approved", "APPROVED", "looks good", "yes proceed",
"let's move on", "I'm happy with this", "this is good", or similar approval language:
1. Do NOT restart brainstorming or ask new clarifying questions.
2. Acknowledge the approval warmly.
3. Present a brief Review Packet summarizing what was brainstormed (2-4 sentences).
4. Say: "To advance to the PLAN phase, click **Finalize Brainstorm** in the Governance panel."
5. If gates are not yet satisfied, mention: "Some setup steps may need to be completed first — check the Governance panel for any remaining requirements."`;

        // Tier 5B: Brainstorm Readiness feedback (HANDOFF-BQL-01)
        if (ctx.brainstorm_readiness && ctx.brainstorm_readiness.artifact_exists) {
          const r = ctx.brainstorm_readiness;
          const dimLines = r.dimensions.map(d => `  ${d.dimension}: ${d.status} — ${d.detail}`).join('\n');
          systemPrompt += `\n\n=== BRAINSTORM READINESS ===
Overall: ${r.ready ? 'READY to finalize' : 'NOT READY — improvements needed'}
${dimLines}${r.suggestion ? `\nSuggestion: ${r.suggestion}` : ''}

If any dimension is FAIL or WARN, and the Director asks you to improve the brainstorm or says "make it better", regenerate the artifact focusing on the weak dimensions. Always emit the full === BRAINSTORM ARTIFACT === block when regenerating.`;
        }
      } else {
        systemPrompt += `\n\n=== BRAINSTORM STATUS ===
No brainstorm artifact has been saved yet. Continue exploring ideas with the Director.
When the Director signals readiness (e.g., "I like option 2", "let's go with this"), generate a structured brainstorm artifact using the === BRAINSTORM ARTIFACT === markers.`;
      }
    }

    // Tier 5C: Brainstorm Artifact Content for PLAN/EXECUTE/REVIEW (FIX-1)
    // Injects the actual brainstorm data so AI can produce project-specific output
    if (phaseName !== 'BRAINSTORM' && ctx.brainstorm_artifact_content) {
      const ac = ctx.brainstorm_artifact_content;
      const optionLines = ac.options.map((o, i) => {
        const desc = o.description ? `: ${o.description}` : '';
        const outcome = o.expected_outcome ? ` → Expected: ${o.expected_outcome}` : '';
        return `  ${i + 1}. ${o.title || o.id}${desc}${outcome}`;
      }).join('\n');

      const assumptionLines = Array.isArray(ac.assumptions) && ac.assumptions.length > 0
        ? ac.assumptions.map(a => {
            const text = typeof a === 'string' ? a : (a.text || JSON.stringify(a));
            const tag = typeof a === 'object' && a.tag ? ` [${a.tag}]` : '';
            return `  - ${text}${tag}`;
          }).join('\n')
        : '  (none recorded)';

      const killLines = Array.isArray(ac.kill_conditions) && ac.kill_conditions.length > 0
        ? ac.kill_conditions.map(k => {
            const text = typeof k === 'string' ? k : (k.text || k.threshold || JSON.stringify(k));
            return `  - ${text}`;
          }).join('\n')
        : '  (none recorded)';

      const selectedOption = ac.recommendation && ac.recommendation !== 'NO_SELECTION'
        ? `Selected approach: ${ac.recommendation}`
        : 'No approach selected yet';

      systemPrompt += `\n\n=== BRAINSTORM ARTIFACT (Reference) ===
${selectedOption}

Options explored:
${optionLines}

Assumptions:
${assumptionLines}

Kill conditions:
${killLines}

Use this artifact as your foundation. Do NOT invent new options or ignore the selected approach.`;
    }

    // FIX-4: Phase transition acknowledgment
    // When phase is PLAN and brainstorm artifact exists, confirm the phase
    // has transitioned. This prevents AI from restarting brainstorming if
    // the prior conversation history was in BRAINSTORM context.
    if (phaseName === 'PLAN' && ctx.brainstorm_artifact_saved) {
      const artifactState = ctx.brainstorm_artifact_state || 'ACTIVE';
      systemPrompt += `\n\n=== PHASE TRANSITION ===
BRAINSTORM phase is complete. You are now in PLAN phase.
Brainstorm artifact state: ${artifactState}
Do NOT revisit brainstorming. Work from the brainstorm artifact above to create the project plan.`;
    }

    // Tier 6: Unsatisfied Gate Guidance (HANDOFF-PTX-01)
    if (ctx.unsatisfied_gates && ctx.unsatisfied_gates.length > 0) {
      systemPrompt += `\n\nNote: Phase advancement requires certain setup steps to be completed.
Currently unsatisfied: ${ctx.unsatisfied_gates.join(', ')}.
The Director can satisfy these through the Governance panel in the sidebar.`;
    }

    // Tier 6B: Fitness Dimensions Advisory (GFB-01 Task 1)
    if (ctx.fitness_status && ctx.fitness_status.total > 0) {
      const fs = ctx.fitness_status;
      if (fs.failing.length > 0) {
        const failLines = fs.failing.map(f => `  ${f.dimension} (${f.metric}): ${f.current || '?'} / ${f.target} target — FAILING`).join('\n');
        systemPrompt += `\n\n=== QUALITY DIMENSIONS ===
Project has ${fs.total} fitness dimension(s) defined.
Passing: ${fs.passing} | Failing: ${fs.failing.length}
${failLines}
Phase transition to REVIEW will require these to be resolved or Director override.`;
      } else {
        systemPrompt += `\n\n=== QUALITY DIMENSIONS ===
Project has ${fs.total} fitness dimension(s) defined. All passing.`;
      }
    }

    // Tier 6C: Reassessment History Advisory (GFB-01 Task 3)
    if (ctx.reassess_count && ctx.reassess_count > 0) {
      const lr = ctx.last_reassessment;
      systemPrompt += `\n\n=== REASSESSMENT HISTORY ===
This project has been reassessed ${ctx.reassess_count} time(s).${lr ? `
Last regression: ${lr.phase_from} → ${lr.phase_to} (Level ${lr.level}${lr.level === 1 ? ' — Surgical Fix' : lr.level === 2 ? ' — Major Pivot' : ' — Fresh Start'})
Reason: "${lr.reason}"` : ''}
Be aware that repeated phase regression may indicate scope or requirements instability.`;
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

  // FIX-3: Critical instruction reinforcement at END of system prompt
  // Models follow instructions at the start and end more reliably than middle.
  // This reinforces the Interaction SOP that gpt-4o-mini tends to ignore in long prompts.
  systemPrompt += `

=== CRITICAL REMINDERS ===
- You assess quality internally. Never ask the user about governance, completeness, or acceptance criteria.
- Ask about the user's GOALS and VISION, not about your deliverable structure.
- When the user approves, acknowledge warmly and guide them to Finalize in the Governance panel.
- Produce concrete, project-specific output — never generic templates or "[TBD]" placeholders.`;

  // FIX: Hard cap system prompt to prevent token explosion
  // 60k chars ≈ 15k tokens — leaves room for conversation history + user message
  // within most models' context windows (128k tokens for DeepSeek, 200k for Claude)
  const MAX_SYSTEM_PROMPT_CHARS = 60000;
  if (systemPrompt.length > MAX_SYSTEM_PROMPT_CHARS) {
    console.warn(`[buildMessages] System prompt truncated: ${systemPrompt.length} -> ${MAX_SYSTEM_PROMPT_CHARS} chars`);
    systemPrompt = systemPrompt.slice(0, MAX_SYSTEM_PROMPT_CHARS) + '\n\n[System prompt truncated for context window safety]';
  }

  messages.push({ role: 'system', content: systemPrompt });

  // FIX-N3: Inject conversation history for multi-turn context
  // Prior messages let the AI see what was discussed and what it previously responded.
  // Without this, every message is a brand-new conversation with zero context.
  if (request.delta.conversation_history && request.delta.conversation_history.length > 0) {
    // Token budget management: truncate very long messages to keep within context window
    const MAX_MSG_LENGTH = 2000; // ~500 tokens per message max
    for (const histMsg of request.delta.conversation_history) {
      const content = histMsg.content.length > MAX_MSG_LENGTH
        ? histMsg.content.slice(0, MAX_MSG_LENGTH) + '\n... [truncated for context window]'
        : histMsg.content;
      messages.push({ role: histMsg.role, content });
    }
  }

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
      // Redaction applied — count tracked in response metadata
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

  // Filter to available providers (async check for BYOK keys)
  const userId = request.trace.user_id;
  const availabilityChecks = await Promise.all(
    candidates.map(async (c) => ({
      candidate: c,
      available: await isProviderAvailable(request.subscription, c.provider, env, userId)
    }))
  );

  const availableCandidates = availabilityChecks
    .filter(check => check.available)
    .map(check => check.candidate);

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
  const providerErrors: Array<{ provider: string; error: string }> = [];

  for (const candidate of availableCandidates) {
    const startTime = Date.now();

    try {
      const apiKey = await resolveApiKey(request.subscription, candidate.provider, env, userId);

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

      // Track provider-specific error
      providerErrors.push({
        provider: candidate.provider,
        error: error instanceof Error ? error.message : String(error)
      });

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
    }
  }

  // All candidates failed - provide detailed per-provider breakdown
  const errorMessage = `No available providers worked for ${modelClass}. Details:\n` +
    providerErrors.map(e => `  • ${e.provider}: ${e.error}`).join('\n');

  throw new RouterError(
    'ALL_PROVIDERS_FAILED',
    errorMessage,
    503,
    {
      model_class: modelClass,
      provider_errors: providerErrors,
      suggestion: 'Check your API keys in Settings or verify your subscription tier',
      settings_url: '/settings?tab=api-keys'
    }
  );
}
