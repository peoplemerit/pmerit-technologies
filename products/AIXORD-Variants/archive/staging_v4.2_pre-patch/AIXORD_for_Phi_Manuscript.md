# AIXORD for Phi

## Microsoft Open-Weight Governance

### A Complete Framework for Structured Human-AI Collaboration

---

**Version:** 4.2
**Platform:** Microsoft Phi Family (Phi-2, Phi-3, Phi-4)
**Publisher:** PMERIT LLC
**Edition:** Phi Variant

---

## Dedication

To every developer, entrepreneur, and creator who has lost hours of work
to forgotten context, reversed decisions, and AI conversations that went nowhere.

This framework exists because chaos is optional.

To my wife and children — you deserve all of me, always. You called for
my time and attention — rightfully so — but instead, you made space. You
left daddy alone, not because you had to, but because you believed in the mission.
Your sacrifice, patience, and quiet strength made this book possible.

This is our shared creation. Thank you — for everything.

---

## Table of Contents

1. Introduction to AIXORD
2. Understanding Microsoft Phi Models
3. The Authority Model
4. The AIXORD Formula
5. Working with Phi's Strengths
6. Managing Phi's Limitations
7. Session Management and Setup
8. Phases and Kingdoms
9. Artifact Management
10. Quality Assurance
11. Handoffs and Continuity
12. Commands Reference
13. Best Practices for Phi
14. Troubleshooting Guide
15. Quick Start Guide

---

# Chapter 1: Introduction to AIXORD

## What Is AIXORD?

AIXORD (AI Execution Order) is a governance framework designed to transform chaotic AI conversations into structured, productive project execution. Adapted from military OPORD (Operations Order) methodology, AIXORD establishes clear roles, enforces decision gates, and maintains project continuity across sessions.

At its core, AIXORD is a workflow methodology—not a technical enforcement layer. It works through discipline, clear communication, and mutual understanding between you (the human) and your AI assistant. Think of it as a project management framework specifically designed for human-AI collaboration.

## Why AIXORD Matters for Phi Users

Microsoft Phi models are remarkable achievements in efficient AI design. They deliver impressive capabilities in compact packages, making advanced AI accessible in resource-constrained environments. However, this efficiency comes with trade-offs that require thoughtful management.

Without a governance framework, Phi conversations can:

- Drift from the original objective
- Accumulate conflicting decisions
- Lose critical context across sessions
- Produce outputs that require excessive revision
- Waste time on misaligned efforts

AIXORD addresses these challenges by providing:

- Clear role definitions (who decides what)
- Structured progression through project phases
- Mandatory checkpoints and artifact saves
- Explicit approval requirements before execution
- Session continuity through handoff protocols

## The Philosophy Behind AIXORD

AIXORD operates on a fundamental principle: **Documents ARE the system.**

This means that your project documentation, decisions, and artifacts are not just records—they are the authoritative source of truth. When you capture a decision in a document, that decision governs all subsequent work. When you save an artifact, that artifact becomes the reference point for quality assessment.

This approach has profound implications:

1. **Nothing is assumed.** Every decision must be explicit and documented.
2. **Authority flows from documentation.** No execution happens without documented approval.
3. **Continuity requires artifacts.** Session transitions depend on saved handoffs.
4. **Quality is measurable.** Deliverables are assessed against documented criteria.

For Phi users specifically, this documentation-centric approach compensates for the model's limited context window and memory capabilities by ensuring critical information is preserved externally.

---

# Chapter 2: Understanding Microsoft Phi Models

## The Phi Family

Microsoft's Phi models represent a different philosophy in AI development. While many AI systems pursue maximum capability through massive scale, Phi models achieve impressive results through efficient design and carefully curated training data. The family includes:

- **Phi-2:** The original small language model breakthrough
- **Phi-3:** Enhanced capabilities with multiple size variants
- **Phi-4:** The latest generation with improved reasoning

These models excel at specific tasks while remaining deployable in environments where larger models would be impractical.

## Phi's Strengths

Understanding what Phi does well helps you leverage AIXORD effectively:

**Efficiency:** Phi models deliver remarkable capability per parameter, enabling deployment on consumer hardware, edge devices, and resource-limited environments.

**Predictable Behavior:** Trained on curated, high-quality data, Phi models exhibit consistent patterns that work well within structured frameworks like AIXORD.

**Task Execution:** For well-defined, bounded tasks, Phi performs admirably, making it excellent for step-by-step project execution.

**Code Generation:** Phi models show particular strength in code-related tasks, especially when requirements are clearly specified.

**Instruction Following:** When given clear, structured instructions—exactly what AIXORD provides—Phi executes reliably.

## Phi's Limitations

Equally important is understanding where Phi requires careful management:

**Limited Factual Knowledge:** Phi's training on curated data means narrower world knowledge. Always verify factual claims and provide context when working in specialized domains.

**Short-Horizon Reasoning:** Complex, multi-step reasoning chains can degrade. AIXORD's requirement to decompose work into atomic steps directly addresses this limitation.

**Constrained Context:** With smaller context windows than larger models, Phi benefits from AIXORD's chunking requirements and external artifact storage.

**Lower Abstraction Ceiling:** Open-ended, philosophical, or highly abstract tasks may produce less satisfying results. AIXORD's task classification helps route work appropriately.

**Hallucination Risk:** When uncertain, Phi may generate confident-sounding but incorrect information. AIXORD's confidence declaration requirements make this visible.

**No Multimodal Capability:** Phi processes text only. Any image, audio, or video content must be converted to textual descriptions.

## The Component Model

Under AIXORD governance, Phi operates as a **component**, not a controller. This distinction is crucial:

- Phi does not initiate execution autonomously
- Phi does not make scope decisions
- Phi does not override human authority
- Phi executes approved work within defined boundaries

This component model aligns with Phi's actual capabilities while preventing the frustration that comes from expecting autonomous agent behavior from a model not designed for it.

---

# Chapter 3: The Authority Model

## Roles and Responsibilities

AIXORD defines three distinct roles in the human-AI collaboration:

### Director (Human)

You, the human user, are the Director. This role carries supreme authority over:

- **What** gets built
- **When** work proceeds
- **Whether** outputs are accepted
- **Which** scope boundaries apply

The Director makes all final decisions. AI provides analysis, recommendations, and execution—but never decides independently.

### Architect (AI)

In the Architect role, Phi analyzes requirements, recommends approaches, and specifies solutions. The Architect:

- Evaluates options
- Identifies risks
- Proposes structures
- Specifies deliverables

However, the Architect recommends; it does not decide. Every Architect output requires Director review before becoming authoritative.

### Commander (AI)

When executing approved work, Phi operates as Commander. In this role, it:

- Implements approved specifications
- Follows documented requirements
- Reports execution status
- Flags blockers or deviations

The Commander executes within bounds. It cannot expand scope, modify requirements, or make unilateral decisions.

## The Approval Grammar

AIXORD uses explicit approval language to prevent miscommunication:

**Valid Approvals (Execution Authorized):**
- "APPROVED"
- "APPROVED: [specific scope]"
- "EXECUTE"
- "DO IT"
- "YES, PROCEED"

**Invalid (Requires Clarification):**
- "Looks good"
- "Fine"
- "OK"
- "Sure"
- Thumbs up emoji
- Silence

If your response could be interpreted multiple ways, Phi should request clarification rather than assuming approval. This prevents the common problem of AI systems proceeding based on ambiguous feedback.

## Silence Protocol

By default, silence equals halt—not approval. If you don't respond, Phi should not proceed with execution.

However, you can pre-authorize specific categories:

"AUTO-APPROVE: formatting decisions"
"AUTO-APPROVE: minor refactors under 10 lines"

Pre-authorizations must be explicit, scoped, and recorded. You can revoke them at any time with "REVOKE AUTO-APPROVE: [category]."

## Risk Override

When Phi identifies material risk but you wish to proceed anyway, AIXORD uses explicit risk acknowledgment:

The AI presents the risk clearly, then requires: "OVERRIDE ACCEPTED: [risk summary]"

This preserves your authority while ensuring risks are consciously acknowledged, not overlooked.

---

# Chapter 4: The AIXORD Formula

## The Transformation Chain

At the heart of AIXORD lies a mandatory transformation chain that governs all execution:

**Project_Docs → Master_Scope → Deliverables → Steps → Production-Ready System**

This is not a suggestion—it's the canonical law of AIXORD. Every project must traverse this chain. Skipping elements is forbidden.

Let's understand each element:

### Project_Docs

Your project documentation captures intent, context, requirements, and constraints. These documents become the authoritative reference for all subsequent work. Without Project_Docs, there is no foundation for scope definition.

### Master_Scope

The Master_Scope defines everything that will be built. It contains all deliverables, their relationships, and their dependencies. Nothing exists outside the Master_Scope—if it's not documented here, it's not part of the project.

### Deliverables

Deliverables are enumerable units of completion. Each deliverable represents something you can point to and say "this is done" or "this is not done." Deliverables decompose into steps.

### Steps

Steps are atomic units of execution—the smallest meaningful actions that advance a deliverable toward completion. For Phi specifically, steps should be simple and bounded; complex steps must be decomposed further.

### Production-Ready System

The end state: a working, verified, locked system that meets documented requirements. Not "mostly done" or "good enough"—production-ready means it passes quality gates and is approved for use.

## Conservation Law

AIXORD enforces a conservation law: execution output cannot exceed documented and governed input.

Mathematically: **EXECUTION_TOTAL = VERIFIED_REALITY + FORMULA_EXECUTION**

This means:
- You can't build what isn't specified
- You can't modify what isn't unlocked
- You can't claim completion without verification

For Phi users, this conservation law prevents the model from exceeding its bounded execution role.

## Why the Formula Matters for Phi

The Formula directly addresses Phi's reasoning limitations by:

1. **Decomposing complexity:** Long reasoning chains become sequences of simple steps
2. **Creating checkpoints:** Each deliverable is a verification point
3. **Externalizing state:** Documents preserve what Phi's context window cannot
4. **Enforcing structure:** Clear progression prevents drift

---

# Chapter 5: Working with Phi's Strengths

## Leveraging Efficiency

Phi's compact design means faster response times and lower resource consumption. Use this to your advantage:

**Rapid Iteration:** Quick turnaround enables more review cycles. Don't accept first outputs—iterate.

**Parallel Exploration:** Run multiple simple queries rather than one complex request. Synthesize results externally.

**Frequent Checkpoints:** Phi's speed makes regular checkpoints practical. Save state often.

## Maximizing Predictability

Phi's training on curated data creates predictable response patterns. Work with this:

**Clear Specifications:** Phi excels when requirements are explicit. Vague requests produce vague results.

**Structured Prompts:** Use consistent formats. Phi responds well to templates and conventions.

**Bounded Tasks:** Define start and end conditions clearly. "Fix this function" works better than "improve the codebase."

## Code Generation Excellence

Phi performs particularly well on code tasks:

**Unit-Level Work:** Individual functions, focused components, specific algorithms—Phi handles these well.

**Clear Interfaces:** Specify inputs, outputs, and constraints. Phi generates better code with explicit contracts.

**Test Coverage:** Request tests alongside implementations. Phi produces useful test cases when asked.

## Instruction Following

AIXORD's structured approach plays directly to Phi's instruction-following strength:

**Command Recognition:** Phi reliably recognizes AIXORD commands when formatted consistently.

**Role Adherence:** With clear role definitions, Phi maintains appropriate boundaries.

**Protocol Compliance:** Phi follows documented protocols when they're clearly stated.

---

# Chapter 6: Managing Phi's Limitations

## Handling Limited Knowledge

Phi's curated training means gaps in factual coverage. Manage this proactively:

**Provide Context:** Don't assume Phi knows domain-specific information. Include relevant background.

**Verify Claims:** Treat factual outputs as requiring verification, especially for specialized domains or recent events.

**Use Citations:** When possible, provide sources that Phi can reference rather than relying on its training.

**Explicit Unknowns:** Encourage Phi to acknowledge uncertainty rather than filling gaps with plausible-sounding content.

## Managing Reasoning Depth

Complex reasoning chains can degrade in quality. Mitigate this:

**Decompose Problems:** Break multi-step reasoning into single-step queries. Build chains externally.

**Show Work:** Ask Phi to explain reasoning steps individually. Review each before proceeding.

**Chunk Processing:** For long documents, process sections separately. Synthesize across chunks yourself.

**Reset Context:** For complex sessions, periodically summarize state and restart with fresh context.

## Context Window Management

Phi's limited context requires active management:

**Aggressive Chunking:** Don't try to fit everything in one prompt. Divide and process.

**External Storage:** Save important information to documents. Don't rely on in-context memory.

**Selective Inclusion:** Include only what's necessary for the current task. Prune ruthlessly.

**Regular Handoffs:** Create handoffs frequently to preserve state externally.

## Abstraction Boundaries

Recognize tasks that push Phi's limits:

**Ideation as Input:** Treat brainstorming outputs as raw material, not finished analysis.

**Synthesis Review:** Complex synthesis requires human review and integration.

**Creative Constraints:** For open-ended creative work, provide structure and boundaries.

## Confidence and Hallucination

Make uncertainty visible:

**Confidence Levels:** AIXORD requires confidence declarations. Use them.

- HIGH: Multiple sources, verified information
- MEDIUM: Single source or strong inference
- LOW: Reasoning only, requires verification
- UNVERIFIED: No source, flag for review

**Verification Gates:** Before locking any deliverable, verify factual claims independently.

**Flag Patterns:** Watch for confident language without supporting detail—a hallucination indicator.

---

# Chapter 7: Session Management and Setup

## The Nine-Step Startup

Every AIXORD session begins with a mandatory nine-step setup sequence. This isn't bureaucracy—it's infrastructure that enables everything that follows.

### Step 1: License Check

The AI asks for your license email or authorization code. Valid formats include:
- Your registered email address
- Standard license keys (PMERIT-XXXX-XXXX format)
- Gift codes (PMERIT-GIFT-XXXX format)

Without valid authorization, no work proceeds.

### Step 2: Disclaimer Affirmation

You must acknowledge six key terms:

1. **Director Responsibility:** You make final decisions and own outcomes
2. **No Guarantee of Results:** AIXORD doesn't guarantee success
3. **AI Limitations:** AI may make mistakes; verify critical information
4. **Not Professional Advice:** AIXORD output isn't legal, financial, or medical advice
5. **Limitation of Liability:** PMERIT LLC liability is limited to purchase price
6. **Indemnification:** You hold PMERIT LLC harmless from claims

Acknowledge with: "I ACCEPT: [your email or code]"

### Step 3: Tier Detection

Specify your deployment context. Unlike cloud platforms with subscription tiers, Phi deployments vary by:
- Local deployment specifications
- API hosting configuration
- Integration environment

Record what's relevant for your context.

### Step 4: Environment Configuration

Accept default settings with "ENV-CONFIRMED" or request custom configuration with "ENV-MODIFY."

### Step 5: Folder Structure

Choose your artifact storage approach:
- **AIXORD Standard Structure:** Predefined folders for organized storage
- **User-Controlled:** You manage your own organization

### Step 6: Citation Mode

Select your citation requirements:
- **STRICT:** Every claim cited (recommended for Phi given knowledge limitations)
- **STANDARD:** Key recommendations cited
- **MINIMAL:** Sources on request only (not recommended for Phi)

### Step 7: Continuity Mode

Choose how sessions connect:
- **STANDARD:** Normal conversational continuity
- **STRICT-CONTINUITY:** Enforced handoffs, recovery commands (recommended for Phi)
- **AUTO-HANDOFF:** Automatic handoff generation on risk or ambiguity

### Step 8: Project Objective Declaration

State your project objective in one to two sentences. This bounds all subsequent work.

### Step 9: Reality Classification

Declare your project's reality:
- **GREENFIELD:** No prior verified execution exists
- **BROWNFIELD-EXTEND:** Verified work exists; extend without rebuilding
- **BROWNFIELD-REPLACE:** Verified work exists; replacement authorized

For brownfield projects, list conserved or replaceable scopes explicitly.

## Session Configuration Summary

After completing all nine steps, you receive a locked configuration summary. This configuration governs the entire session. Changes require explicit Director commands.

---

# Chapter 8: Phases and Kingdoms

## The Three Kingdoms

AIXORD organizes work into three kingdoms, each serving a distinct purpose:

### IDEATION Kingdom

Purpose: Explore, discover, and evaluate options.

In IDEATION, you're gathering information, exploring possibilities, and making decisions about direction. Nothing is committed yet. Outputs from IDEATION are explicitly non-binding—they inform decisions but don't constitute approved specifications.

Phases in IDEATION:
- **DISCOVER:** Gather information and context
- **BRAINSTORM:** Generate and explore options

### BLUEPRINT Kingdom

Purpose: Convert intent into buildable specifications.

BLUEPRINT takes your decisions from IDEATION and transforms them into detailed, actionable specifications. Here you define exactly what will be built and how.

Phases in BLUEPRINT:
- **PLAN:** Analyze and structure the approach
- **BLUEPRINT:** Create detailed specifications
- **SCOPE:** Define boundaries and dependencies

### REALIZATION Kingdom

Purpose: Build, verify, and lock deliverables.

REALIZATION is where execution happens. Specifications become implementations, implementations get verified, and verified work gets locked as complete.

Phases in REALIZATION:
- **EXECUTE:** Implement approved specifications
- **AUDIT:** Review implementation quality
- **VERIFY:** Confirm requirements are met
- **LOCK:** Finalize as complete

## Phase Progression

The canonical phase order:

**SETUP → DISCOVER → BRAINSTORM → PLAN → BLUEPRINT → SCOPE → EXECUTE → AUDIT → VERIFY → LOCK**

You can move backward (regression) when needed, but this requires explicit acknowledgment. Moving forward requires completing gate requirements.

## Kingdom Transitions

Moving between kingdoms requires gate completion. You can't enter BLUEPRINT without completing IDEATION gates. You can't enter REALIZATION without completing BLUEPRINT gates.

For Phi specifically, these gates provide essential checkpoints that compensate for limited context continuity.

---

# Chapter 9: Artifact Management

## The Core Rule

**No saved artifact → No progression.**

This rule is fundamental to AIXORD. Artifacts must exist outside the chat—in your filesystem, in cloud storage, in version control. They cannot exist only in conversation history.

## Required Artifacts and Gates

AIXORD defines specific artifacts with corresponding gates:

**Project_Docs (GA:PD):** Created and saved at the end of BRAINSTORM phase.

**Reality Classification (GA:RA):** Declared after Project_Docs; no default—must be explicit.

**Formula (GA:FX):** Created, approved, and bound before BLUEPRINT phase.

**Plan Review (GA:PR):** Completed after Formula.

**Blueprint (GA:BP):** Approved and saved after Plan Review.

**Master_Scope + DAG (GA:MS):** Saved with valid dependency graph after Blueprint.

**Evidence/Visual Audit (GA:VA):** Required before VERIFY→LOCK transition.

**HANDOFF (GA:HO):** Required at session end.

## Confirmation Methods

You can confirm artifact saves through any of these methods:

- **Visual:** Screenshot or file explorer image showing the saved file
- **Textual:** Paste file contents or directory listing
- **Hash:** Provide checksum (e.g., md5sum output)
- **Platform:** Share link (Google Drive, GitHub, Dropbox)
- **Attestation:** Statement "ATTESTED: [artifact] saved to [path]" (lowest assurance)

## Artifact Binding

This is crucial: artifacts don't automatically persist across sessions. When resuming work:

1. Identify which artifacts are being resumed
2. Confirm each through an approved method
3. Bind the artifact to the current session
4. Only then proceed with work that references it

For Phi, with its limited context, artifact binding is essential. The model cannot "remember" files from previous sessions—they must be explicitly re-bound.

## Platform Awareness

Phi deployments often lack persistent file systems. Be aware:

- Local chat UIs may not save conversations
- API integrations may not preserve state
- Edge deployments may have no storage

AIXORD requires you to save artifacts externally. Don't rely on platform features that may not exist in your deployment.

---

# Chapter 10: Quality Assurance

## The Seven Dimensions

Every deliverable is assessed across seven quality dimensions:

### 1. Best Practices
Are industry-standard approaches applied? Does the implementation follow established patterns and conventions?

### 2. Completeness
Are all requirements addressed? Is anything missing from the specification?

### 3. Accuracy
Is the output factually correct? For Phi specifically, have claims been verified?

### 4. Sustainability
Is this maintainable long-term? Can future developers understand and modify it?

### 5. Reliability
Does it handle errors and edge cases? Is failure behavior defined and appropriate?

### 6. User-Friendliness
Is it intuitive and well-documented? Can users accomplish their goals efficiently?

### 7. Accessibility
Is the design inclusive? Does it accommodate users with different abilities?

## Assessment Requirements

Each dimension must include:
- **Status:** PASS / ACCEPTABLE / FAIL
- **Evidence:** Specific justification for the status

A "PASS" without evidence is invalid. Quality claims require support.

## Blocking and Waivers

Any FAIL status blocks progression to LOCK phase. However, the Director can issue explicit waivers:

"WAIVER: [Dimension] - [Justification]"

Waivers are recorded and traceable. They're not escapes—they're conscious decisions to accept known limitations.

## OSS-First Priority

When selecting solutions, AIXORD recommends this priority order:

1. Free Open Source (best)
2. Freemium Open Source
3. Free Proprietary
4. Paid Open Source
5. Paid Proprietary (requires justification)

This isn't dogma—it's a default that prevents vendor lock-in when open alternatives exist.

---

# Chapter 11: Handoffs and Continuity

## What Is a Handoff?

A HANDOFF is a governance-carrying authority artifact. It's not a summary—it's a complete package that enables session resumption with full context.

## Mandatory Contents

Every HANDOFF must include:

- **Authority Declaration:** Who has Director authority
- **Objective and Scope:** What we're building and boundaries
- **Reality Classification:** Greenfield or brownfield status
- **Formula Status:** Is the formula bound?
- **Current State:** Phase, kingdom, gate status
- **DAG Status:** Dependency graph state
- **Artifact Locations:** Where documents are saved
- **Explicit Next Action:** What happens next
- **Resume Instruction:** How to continue
- **Artifact Rebind Checklist:** What needs rebinding

## The Rebind Requirement

This is critical: HANDOFFs transfer authority and intent, not artifact state. When you resume:

1. Present the HANDOFF
2. Rebind each required artifact
3. Confirm bindings before execution

For Phi, this explicit rebinding compensates for the model's inability to persist file references across sessions.

## Continuity Commands

**PMERIT CONTINUE:** Resume from HANDOFF with artifact rebinding.

**PMERIT RECOVER:** Rebuild state when normal resume isn't possible. No execution until re-verified.

## Creating Effective Handoffs

Good handoffs are:
- **Complete:** Nothing essential is omitted
- **Current:** Reflects actual state, not stale information
- **Clear:** Unambiguous about next steps
- **Portable:** Path-safe, using variables not raw paths

---

# Chapter 12: Commands Reference

## Activation Commands

| Command | Effect |
|---------|--------|
| PMERIT CONTINUE | Start or resume AIXORD session |
| CHECKPOINT | Quick save, continue working |
| HANDOFF | Full save, end session |
| RECOVER | Rebuild state from HANDOFF |

## Phase Commands

| Command | Effect |
|---------|--------|
| HALT | Stop execution, return to DECISION |
| APPROVED | Authorize proposed action |
| APPROVED: [scope] | Authorize specific scope only |
| RESET: [PHASE] | Return to specific phase |

## Scope Commands

| Command | Effect |
|---------|--------|
| EXPAND SCOPE: [topic] | Request scope expansion |
| SHOW SCOPE | Display current boundaries |
| UNLOCK: [item] | Unlock for modification |

## Quality Commands

| Command | Effect |
|---------|--------|
| QUALITY CHECK | Seven-dimension evaluation |
| SOURCE CHECK | Request source citations |

## Artifact Commands

| Command | Effect |
|---------|--------|
| BIND: [artifact] | Confirm artifact, bind to session |
| REBIND ALL | Re-confirm all required artifacts |
| SHOW BINDINGS | Display binding status |

## Navigation Commands

| Command | Effect |
|---------|--------|
| SHOW STATE | Display current state summary |
| SHOW SCOPES | List all scopes and status |
| SHOW DAG | Display dependency graph |
| HELP | Show available commands |
| HELP: [cmd] | Explain specific command |

## Convenience Commands

| Command | Effect |
|---------|--------|
| BRIEF | Request shorter responses |
| DETAIL | Request expanded responses |
| RETRY | Re-attempt last action |
| WRAP UP | CHECKPOINT + HANDOFF |

---

# Chapter 13: Best Practices for Phi

## Session Management

**Start Clean:** Begin each session with PMERIT CONTINUE and complete setup. Don't skip steps.

**Checkpoint Frequently:** With Phi's limited context, frequent checkpoints prevent context loss.

**Explicit Handoffs:** Always create handoffs before ending sessions. Don't rely on conversation history.

**Rebind Deliberately:** When resuming, explicitly rebind each artifact. Confirm before proceeding.

## Task Design

**Decompose Aggressively:** If a task feels complex, break it down further. Phi performs better on simple, bounded tasks.

**One Thing at a Time:** Focus queries on single concerns. Avoid compound requests.

**Provide Context:** Don't assume Phi knows your domain. Include relevant background.

**Specify Outputs:** Be explicit about expected format, length, and structure.

## Quality Management

**Verify Factual Claims:** Cross-reference substantive claims against authoritative sources.

**Request Confidence:** Ask Phi to declare confidence levels. Act on low-confidence flags.

**Review Before Locking:** The AUDIT and VERIFY phases exist for a reason. Use them.

**Document Waivers:** If you accept known limitations, document why.

## Communication Patterns

**Use Explicit Approvals:** "APPROVED" not "looks good." Clarity prevents misalignment.

**Acknowledge Uncertainty:** When Phi flags low confidence, don't ignore it.

**Question Confident Outputs:** Especially in domains where Phi's training may be sparse.

**Provide Feedback:** If outputs miss the mark, explain why. Phi improves with clear guidance.

---

# Chapter 14: Troubleshooting Guide

## Common Issues and Solutions

### "Phi isn't following AIXORD protocol"

**Cause:** Model may not have the governance file loaded.
**Solution:** Ensure AIXORD_LEGEND_CORE_Phi_v4.2.md is in the system context.

### "Session state seems lost"

**Cause:** Phi doesn't persist state across conversation turns automatically.
**Solution:** Create checkpoints. Use handoffs. Rebind artifacts on resume.

### "Outputs drift from the objective"

**Cause:** Scope creep or unclear boundaries.
**Solution:** Explicitly invoke SHOW SCOPE. Redirect with HALT if needed.

### "Factual claims are incorrect"

**Cause:** Phi's limited knowledge or hallucination.
**Solution:** Request SOURCE CHECK. Use STRICT citation mode. Verify independently.

### "Complex tasks produce poor results"

**Cause:** Task exceeds Phi's reasoning depth.
**Solution:** Decompose into smaller steps. Process sequentially.

### "Context seems truncated"

**Cause:** Exceeding Phi's context window.
**Solution:** Chunk inputs. Process sections separately. Use external documents.

### "Phi attempts autonomous execution"

**Cause:** Governance violation.
**Solution:** Issue HALT. Remind of Authority Model. Require explicit approval.

## Recovery Procedures

### State Corruption

If session state becomes inconsistent:

1. Issue HALT
2. Create HANDOFF of current known state
3. Start new session with PMERIT RECOVER
4. Rebind artifacts explicitly
5. Verify state before proceeding

### Artifact Loss

If a required artifact is unavailable:

1. Check external storage for backups
2. If recoverable: BIND and continue
3. If not: Assess whether to recreate or reset to earlier phase

### Gate Failure

If a gate cannot be satisfied:

1. Identify missing requirement
2. Return to appropriate phase to address
3. Complete gate requirement
4. Proceed with phase transition

---

# Chapter 15: Quick Start Guide

## Your First AIXORD Session with Phi

### Before You Begin

1. Have your license email or code ready
2. Know your deployment context (local, API, etc.)
3. Have a clear project objective
4. Have a place to save artifacts (folder, cloud storage, etc.)

### Starting the Session

Type: **PMERIT CONTINUE**

Phi will begin the nine-step setup. Follow each step:

1. **License:** Enter your email or code
2. **Disclaimer:** Review terms, type "I ACCEPT: [your identifier]"
3. **Tier:** Describe your deployment context
4. **Environment:** Type ENV-CONFIRMED or ENV-MODIFY
5. **Folder:** Choose AIXORD Standard or User-Controlled
6. **Citation:** Choose STRICT (recommended), STANDARD, or MINIMAL
7. **Continuity:** Choose STANDARD, STRICT-CONTINUITY, or AUTO-HANDOFF
8. **Objective:** State your project goal in 1-2 sentences
9. **Reality:** Choose GREENFIELD, BROWNFIELD-EXTEND, or BROWNFIELD-REPLACE

### Your First Work Cycle

After setup, you're in DECISION phase. To begin work:

1. **Discover:** Ask Phi to gather information about your objective
2. **Brainstorm:** Explore approaches and options
3. **Create Project_Docs:** Document decisions, requirements, constraints
4. **Save Externally:** Save Project_Docs to your artifact location
5. **Confirm:** Tell Phi you've saved (method: visual, textual, hash, platform, attestation)

### Creating Your First Checkpoint

When you want to pause:

Type: **CHECKPOINT**

Phi will summarize current state. Save this summary externally.

### Ending Your Session

When you're done for now:

Type: **HANDOFF**

Phi will generate a complete handoff document. Save this externally. It's your key to resuming later.

### Resuming Later

In a new session:

Type: **PMERIT CONTINUE**

Complete setup, then:
1. Paste or reference your HANDOFF
2. Rebind each artifact when prompted
3. Confirm bindings
4. Continue work

---


---

## Additional AIXORD Concepts

The following sections provide deeper coverage of key AIXORD concepts that apply across all AI platforms.


### The Seven Quality Dimensions

AIXORD includes a comprehensive quality assessment framework that evaluates every deliverable across seven dimensions. This framework ensures professional-grade output regardless of which AI assistant you use.

**Dimension 1: Best Practices**

Every deliverable must follow industry-standard approaches. This means using established patterns, following security guidelines, and applying proven methodologies. AI assistants are instructed to aggregate their knowledge and proactively apply best practices rather than waiting for you to specify them.

**Dimension 2: Completeness**

All requirements must be addressed. A deliverable cannot be marked complete if it only partially fulfills the specification. AIXORD forces explicit tracking of requirements against implementation.

**Dimension 3: Accuracy**

Information must be factually correct and verified. When certainty varies, AIXORD requires the AI to communicate confidence levels:
- HIGH confidence: Multiple authoritative sources confirm
- MEDIUM confidence: Single source or inference
- LOW confidence: AI reasoning only
- UNVERIFIED: Recommend external verification

**Dimension 4: Sustainability**

Deliverables must be maintainable long-term. This dimension evaluates whether the work can be understood, modified, and extended by others. Code without documentation, clever but obscure solutions, and tightly coupled components fail sustainability assessment.

**Dimension 5: Reliability**

Work must handle errors and edge cases gracefully. Systems that crash under unusual conditions, ignore error states, or assume perfect inputs fail reliability assessment.

**Dimension 6: User-Friendliness**

Output must be intuitive and well-documented. Technical excellence means nothing if users cannot understand or use the result effectively.

**Dimension 7: Accessibility**

Deliverables must follow inclusive design principles. This applies to documentation, interfaces, and any user-facing components.

**Quality Enforcement**

Any dimension marked FAIL blocks progression unless the Director explicitly accepts the trade-off. Each assessment requires evidence or justification — unsupported "PASS" ratings are invalid.



### Task Classification System

Not every task requires full AIXORD ceremony. The framework recognizes that a simple typo fix shouldn't require the same governance as a platform migration.

**TRIVIAL Tasks**

Criteria: Less than 5 minutes, fully reversible, no dependencies.
Required governance: Director approval only.
Example: "Fix typo in README"

**SIMPLE Tasks**

Criteria: Less than 1 hour, single deliverable.
Required governance: Deliverable definition plus steps.
Example: "Add logout button"

**STANDARD Tasks**

Criteria: Multiple deliverables with dependencies.
Required governance: Full AIXORD formula.
Example: "Build authentication system"

**COMPLEX Tasks**

Criteria: Multi-session, high risk, significant dependencies.
Required governance: Full formula plus risk assessment.
Example: "Platform migration"

The classification flow works as follows:
1. AI proposes task class based on scope analysis
2. Director confirms or overrides the classification
3. Classification is recorded in STATE
4. Governance scales accordingly

This prevents the framework from becoming bureaucratic overhead while ensuring complex work receives appropriate structure.



### Artifact Binding and Persistence

One of the most critical concepts in AIXORD is artifact binding. This addresses a fundamental limitation of AI chat systems: they do not reliably persist files or remember generated content across sessions.

**The Core Problem**

When you ask an AI to create a document, that document exists only in the chat window. If you start a new session, the AI has no memory of what it created. If the platform loses the conversation, the document is gone.

Worse, many AI systems will confidently act as if they remember files they generated previously. They will reference non-existent documents, claim to see folder structures that were never created, and proceed with work based on artifacts that no longer exist.

**The Artifact Binding Solution**

AIXORD requires explicit artifact binding. This means:

1. When the AI generates any artifact intended for future use, it must instruct you to save it externally
2. You must confirm the save before the AI considers the artifact "bound"
3. On resume, all artifacts must be re-bound by providing confirmation they still exist
4. The AI cannot act on unbound artifacts

**Binding Methods**

AIXORD accepts several confirmation methods:
- VISUAL: Screenshot or file explorer image showing the saved file
- TEXTUAL: Pasting the file contents or directory listing
- HASH: Providing a cryptographic hash of the file
- PLATFORM: Sharing a link (Google Drive, GitHub, Dropbox)
- ATTESTATION: Simple statement that the file was saved (low assurance)

**Why This Matters**

Without artifact binding, AI conversations eventually collapse. The AI makes assumptions about what exists, acts on those assumptions, and produces work that conflicts with reality. Artifact binding prevents this failure mode by requiring explicit verification.



### The Conservation Law

AIXORD v4.2 introduces the Conservation Law, an accounting-grade principle that prevents AI systems from producing more than was documented and approved.

**The Equation**

```
EXECUTION_TOTAL = VERIFIED_REALITY + FORMULA_EXECUTION
```

This means that everything that exists or will exist must equal what was already verified plus what the AIXORD formula authorizes.

**Why This Matters**

Without conservation, AI systems tend toward scope creep. They add features you didn't request, modify systems that were working fine, and produce parallel implementations instead of extensions.

The Conservation Law makes this structurally impossible. If something isn't in the verified reality or the approved formula, it cannot be executed.

**Brownfield vs Greenfield**

The Conservation Law distinguishes between two types of projects:

GREENFIELD: No verified execution exists. The formula governs the entire system. You're building from scratch.

BROWNFIELD-EXTEND: Verified execution exists and must be preserved. The formula governs only the delta — the new work being added.

BROWNFIELD-REPLACE: Verified execution exists but replacement is authorized. Specific scopes are unlocked for modification.

**Practical Application**

When you start an AIXORD session, you declare your reality classification. If you're extending an existing system, you list the scopes that must be conserved. Any attempt to rebuild a conserved scope triggers a HALT — the AI cannot proceed without explicit unlock authorization.

This prevents the common failure mode where an AI, lacking context about what already works, cheerfully rebuilds your entire system from scratch.



### Phases and Kingdoms

AIXORD organizes work into three kingdoms, each containing specific phases. This structure ensures you always know where you are in the project lifecycle.

**The Three Kingdoms**

**IDEATION Kingdom**
Purpose: Explore, discover, decide
Phases: DISCOVER, BRAINSTORM
Activities: Research, idea generation, requirements gathering

**BLUEPRINT Kingdom**
Purpose: Convert intent to buildable form
Phases: PLAN, BLUEPRINT, SCOPE
Activities: Architecture, specification, dependency mapping

**REALIZATION Kingdom**
Purpose: Execute, verify, lock
Phases: EXECUTE, AUDIT, VERIFY, LOCK
Activities: Implementation, testing, quality assessment, completion

**Phase Flow**

The canonical phase order is:
```
SETUP → DISCOVER → BRAINSTORM → PLAN → BLUEPRINT → SCOPE → EXECUTE → AUDIT → VERIFY → LOCK
```

**Transition Rules**

Moving to EXECUTE requires explicit Director approval. You cannot accidentally start building — the AI must wait for your go-ahead.

Kingdom transitions require gate completion. You cannot enter BLUEPRINT kingdom without completing IDEATION gates. You cannot enter REALIZATION without completing BLUEPRINT gates.

Regression — moving backward in phases — requires Director acknowledgment. This ensures intentional navigation rather than drift.



### Execution Modes

AIXORD supports three execution modes that balance control with efficiency.

**STRICT Mode**

Every action requires explicit approval. The AI proposes, you approve, the AI executes. Nothing happens without your explicit authorization.

Use STRICT mode for:
- Production systems
- Critical infrastructure
- High-risk changes
- Learning the framework

**SUPERVISED Mode**

Batch approval is allowed. You can approve a set of related actions at once rather than one-by-one.

Use SUPERVISED mode for:
- Testing and iteration
- Low-risk changes
- Established patterns

**SANDBOX Mode**

Pre-authorized exploration within defined boundaries. You declare a sandbox scope (for example: "experiment with CSS, no backend changes"), and the AI operates freely within those bounds.

Use SANDBOX mode for:
- Creative exploration
- Prototyping
- Learning new technologies

**Sandbox Rules**

When in SANDBOX mode:
- All actions are logged
- AI cannot modify outside sandbox scope
- Auto-expires after time or action limit
- Director reviews summary at session end

The default mode is STRICT. This ensures maximum control until you explicitly relax governance for specific contexts.



### Command Reference

AIXORD uses explicit commands to control session behavior. These commands are case-insensitive and typo-tolerant.

**Activation Commands**

- `PMERIT CONTINUE` — Start or resume an AIXORD session
- `CHECKPOINT` — Save current progress and continue working
- `HANDOFF` — Full save with session end
- `RECOVER` — Rebuild state from HANDOFF document

**Approval Commands**

- `APPROVED` — Authorize the proposed action
- `APPROVED: [scope]` — Authorize only the specified scope
- `EXECUTE` or `DO IT` — Authorize execution
- `YES, PROCEED` — Explicit confirmation

**Control Commands**

- `HALT` — Stop execution and return to decision mode
- `RESET: [PHASE]` — Return to a specific phase
- `EXPAND SCOPE: [topic]` — Request scope expansion
- `SHOW SCOPE` — Display current scope boundaries

**Quality Commands**

- `QUALITY CHECK` — Trigger seven-dimension evaluation
- `SOURCE CHECK` — Request sources for claims

**Navigation Commands**

- `SHOW DAG` — Display the dependency graph
- `DAG STATUS` — Show current DAG state
- `SHOW STATE` — Display current session state

Understanding these commands allows you to maintain precise control over your AI collaboration sessions.



### Practical Tips for Success

After working with AIXORD across hundreds of projects, certain patterns consistently lead to success.

**Start with Clear Objectives**

Vague objectives produce vague results. "Make my app better" gives the AI no boundaries. "Add user authentication with email/password login" gives it a target. Spend time crafting a precise objective before starting work.

**Trust the Process**

The phases and gates exist for reasons. Skipping BLUEPRINT to jump into EXECUTE feels faster but leads to rework. The few minutes spent in proper planning save hours of fixing mistakes.

**Use Checkpoints Liberally**

Don't wait for perfect stopping points. CHECKPOINT every time you complete something meaningful. Context degradation is real — the AI's responses become less accurate as conversations grow longer.

**Verify Artifacts Exist**

When the AI says it created a file, verify the file actually exists before moving forward. Screenshot, paste contents, or use the verification scripts. Assumptions about artifact persistence cause project failures.

**Classify Reality Honestly**

If you have existing code that works, declare BROWNFIELD-EXTEND. Don't let the AI rebuild what already functions. The Conservation Law only works if you're honest about what exists.

**Match Mode to Task**

Use STRICT mode for important work, SANDBOX mode for exploration. Fighting the framework's ceremony on trivial tasks creates friction; applying insufficient governance to critical tasks creates risk.

**Read the Handoffs**

Before starting a new session, actually read the previous HANDOFF document. Don't just say "PMERIT CONTINUE" and expect the AI to magically remember everything. You are the continuity guarantee.



---

## Additional AIXORD Concepts

The following sections provide deeper coverage of key AIXORD concepts that apply across all AI platforms.


### The Seven Quality Dimensions

AIXORD includes a comprehensive quality assessment framework that evaluates every deliverable across seven dimensions. This framework ensures professional-grade output regardless of which AI assistant you use.

**Dimension 1: Best Practices**

Every deliverable must follow industry-standard approaches. This means using established patterns, following security guidelines, and applying proven methodologies. AI assistants are instructed to aggregate their knowledge and proactively apply best practices rather than waiting for you to specify them.

**Dimension 2: Completeness**

All requirements must be addressed. A deliverable cannot be marked complete if it only partially fulfills the specification. AIXORD forces explicit tracking of requirements against implementation.

**Dimension 3: Accuracy**

Information must be factually correct and verified. When certainty varies, AIXORD requires the AI to communicate confidence levels:
- HIGH confidence: Multiple authoritative sources confirm
- MEDIUM confidence: Single source or inference
- LOW confidence: AI reasoning only
- UNVERIFIED: Recommend external verification

**Dimension 4: Sustainability**

Deliverables must be maintainable long-term. This dimension evaluates whether the work can be understood, modified, and extended by others. Code without documentation, clever but obscure solutions, and tightly coupled components fail sustainability assessment.

**Dimension 5: Reliability**

Work must handle errors and edge cases gracefully. Systems that crash under unusual conditions, ignore error states, or assume perfect inputs fail reliability assessment.

**Dimension 6: User-Friendliness**

Output must be intuitive and well-documented. Technical excellence means nothing if users cannot understand or use the result effectively.

**Dimension 7: Accessibility**

Deliverables must follow inclusive design principles. This applies to documentation, interfaces, and any user-facing components.

**Quality Enforcement**

Any dimension marked FAIL blocks progression unless the Director explicitly accepts the trade-off. Each assessment requires evidence or justification — unsupported "PASS" ratings are invalid.



---

## Additional AIXORD Concepts

The following sections provide deeper coverage of key AIXORD concepts that apply across all AI platforms.


### The Seven Quality Dimensions

AIXORD includes a comprehensive quality assessment framework that evaluates every deliverable across seven dimensions. This framework ensures professional-grade output regardless of which AI assistant you use.

**Dimension 1: Best Practices**

Every deliverable must follow industry-standard approaches. This means using established patterns, following security guidelines, and applying proven methodologies. AI assistants are instructed to aggregate their knowledge and proactively apply best practices rather than waiting for you to specify them.

**Dimension 2: Completeness**

All requirements must be addressed. A deliverable cannot be marked complete if it only partially fulfills the specification. AIXORD forces explicit tracking of requirements against implementation.

**Dimension 3: Accuracy**

Information must be factually correct and verified. When certainty varies, AIXORD requires the AI to communicate confidence levels:
- HIGH confidence: Multiple authoritative sources confirm
- MEDIUM confidence: Single source or inference
- LOW confidence: AI reasoning only
- UNVERIFIED: Recommend external verification

**Dimension 4: Sustainability**

Deliverables must be maintainable long-term. This dimension evaluates whether the work can be understood, modified, and extended by others. Code without documentation, clever but obscure solutions, and tightly coupled components fail sustainability assessment.

**Dimension 5: Reliability**

Work must handle errors and edge cases gracefully. Systems that crash under unusual conditions, ignore error states, or assume perfect inputs fail reliability assessment.

**Dimension 6: User-Friendliness**

Output must be intuitive and well-documented. Technical excellence means nothing if users cannot understand or use the result effectively.

**Dimension 7: Accessibility**

Deliverables must follow inclusive design principles. This applies to documentation, interfaces, and any user-facing components.

**Quality Enforcement**

Any dimension marked FAIL blocks progression unless the Director explicitly accepts the trade-off. Each assessment requires evidence or justification — unsupported "PASS" ratings are invalid.



### Task Classification System

Not every task requires full AIXORD ceremony. The framework recognizes that a simple typo fix shouldn't require the same governance as a platform migration.

**TRIVIAL Tasks**

Criteria: Less than 5 minutes, fully reversible, no dependencies.
Required governance: Director approval only.
Example: "Fix typo in README"

**SIMPLE Tasks**

Criteria: Less than 1 hour, single deliverable.
Required governance: Deliverable definition plus steps.
Example: "Add logout button"

**STANDARD Tasks**

Criteria: Multiple deliverables with dependencies.
Required governance: Full AIXORD formula.
Example: "Build authentication system"

**COMPLEX Tasks**

Criteria: Multi-session, high risk, significant dependencies.
Required governance: Full formula plus risk assessment.
Example: "Platform migration"

The classification flow works as follows:
1. AI proposes task class based on scope analysis
2. Director confirms or overrides the classification
3. Classification is recorded in STATE
4. Governance scales accordingly

This prevents the framework from becoming bureaucratic overhead while ensuring complex work receives appropriate structure.


## Appendix A: Phi Deployment Contexts

### Local Deployment

Running Phi locally on your machine:
- Save artifacts to local folders
- Consider version control for history
- Manage your own backup strategy

### API Integration

Using Phi through an API:
- Save artifacts to accessible storage
- Consider API response logging
- Implement retry logic for reliability

### Edge Deployment

Running Phi on edge devices:
- Plan for limited storage
- Use compressed artifact formats if needed
- Consider central backup for important work

---

## Appendix B: AIXORD Folder Structure

If using AIXORD Standard Structure:

```
{AIXORD_HOME}/
├── 01_Project_Docs/
│   └── (Project documentation)
├── 02_Master_Scope_and_DAG/
│   └── (Scope definitions, dependency graphs)
├── 03_Deliverables/
│   └── (In-progress work)
├── 04_Artifacts/
│   └── (Completed outputs)
├── 05_Handoffs/
│   └── (Session handoff documents)
└── 99_Archive/
    └── (Historical versions)
```

---

## Appendix C: Path Security

AIXORD protects your privacy by using path variables:

| Variable | Meaning |
|----------|---------|
| {AIXORD_HOME} | Your AIXORD installation |
| {PROJECT_ROOT} | Current project directory |
| {LOCAL_ROOT} | Your machine's base path |

Never share raw file paths (like C:\Users\YourName\...) in conversations. They reveal personal information and create portability issues.

---

## Appendix D: Legal Documents

This product includes separate legal documents:

- **LICENSE.md:** Terms of license agreement
- **DISCLAIMER.md:** Full disclaimer text

Review these documents in your product package.

---

## Appendix E: Getting Help

**Purchase and License Issues:**
- Email: support@pmerit.com
- Store: https://pmerit.gumroad.com

**Documentation:**
- Review this manuscript
- Reference the included baseline document

**Feedback:**
Your input helps improve AIXORD. Share your experience at support@pmerit.com.

---

## About PMERIT LLC

PMERIT (People Merit) develops frameworks for structured human-AI collaboration. Our mission is to transform chaotic AI interactions into productive, governed workflows that respect human authority while leveraging AI capability.

---

*AIXORD for Phi — Authority. Formula. Conservation. Verification.*
*Phi Edition — Component Governance for Microsoft Open-Weight Models.*

*© 2026 PMERIT LLC. All rights reserved.*
