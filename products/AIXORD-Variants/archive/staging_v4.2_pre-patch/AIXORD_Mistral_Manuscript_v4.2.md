# AIXORD for Mistral

## AI Governance Framework for Mistral AI Models

**Version:** 4.2  
**Platform:** Mistral (7B, Mixtral 8x7B, Mistral Large)  
**Classification:** Human-Readable Manuscript  
**Publisher:** PMERIT LLC

---

# Dedication

To every developer, entrepreneur, and creator who has lost hours of work
to forgotten context, reversed decisions, and AI conversations that went nowhere.

This framework exists because chaos is optional.

To my wife and children — you deserve all of me, always. You called for
my time and attention — rightfully so — but instead, you made space. You
left daddy alone, not because you had to, but because you believed in the mission.
Your sacrifice, patience, and quiet strength made this book possible.

This is our shared creation. Thank you — for everything.

---

# Table of Contents

1. Introduction to AIXORD
2. Why Mistral Needs Governance
3. The Authority Model
4. The AIXORD Formula
5. Phases and Kingdoms
6. Session Setup Process
7. Gates and Checkpoints
8. Artifacts and Continuity
9. Mistral-Specific Considerations
10. Quality Dimensions
11. Commands Reference
12. Path Security
13. Getting Started
14. Troubleshooting
15. Appendix: Templates

---

# Chapter 1: Introduction to AIXORD

## What Is AIXORD?

AIXORD (AI Execution Order) is a comprehensive governance framework designed to transform chaotic AI conversations into structured, productive project execution. Inspired by military operations orders (OPORDs), AIXORD provides the discipline and structure necessary to achieve complex goals through human-AI collaboration.

At its core, AIXORD is not a technical enforcement layer—it is a workflow methodology. Think of it as a project management framework, similar to Agile or Scrum, but specifically designed for the unique challenges of working with AI assistants.

## The Problem AIXORD Solves

Anyone who has spent significant time working with AI assistants has experienced these frustrations:

**Lost Context:** You return to a conversation only to find the AI has forgotten critical decisions made earlier, forcing you to re-explain your entire project.

**Scope Creep:** What started as a simple request expands into something entirely different, with the AI enthusiastically pursuing tangents that waste your time.

**Reversed Decisions:** The AI contradicts advice it gave you yesterday, leaving you uncertain about which guidance to follow.

**Assumption Overload:** Rather than asking for clarification, the AI fills in gaps with assumptions that may not match your actual requirements.

**No Accountability:** When something goes wrong, there's no clear record of what was decided, when, or why.

AIXORD addresses each of these problems through explicit structure, mandatory checkpoints, and a clear authority model that keeps the human in control while leveraging the AI's capabilities.

## The Philosophy Behind AIXORD

AIXORD operates on several key principles:

**Human Authority:** The human (called the Director in AIXORD terminology) always maintains decision-making authority. The AI advises and implements, but never decides autonomously on matters of consequence.

**Explicit Over Implicit:** Nothing is assumed. Decisions are documented. Artifacts are saved externally. Continuity depends on explicit confirmation, not AI memory.

**Structured Progression:** Work moves through defined phases, with gates that must be satisfied before proceeding. This prevents premature execution and ensures thorough preparation.

**Conservation of Verified Work:** Once something is verified and locked, it is protected from accidental modification or rebuilding.

## Who Should Use AIXORD?

AIXORD is designed for anyone undertaking projects with AI assistance that require:

- Multiple sessions to complete
- Complex decision-making
- Deliverables that must meet quality standards
- Collaboration across team members
- Audit trails and accountability

Whether you're building software, writing a book, planning an event, or designing a business strategy, AIXORD provides the structure to keep your work on track.

---

# Chapter 2: Why Mistral Needs Governance

## Understanding Mistral's Strengths

Mistral AI models represent a significant achievement in efficient AI development. The Mistral family—including Mistral 7B, Mixtral 8x7B, and Mistral Large—delivers impressive capabilities in a resource-efficient package:

**Fast Response Times:** Mistral models excel at quick, responsive interactions. For drafting, brainstorming, and rapid iteration, they're remarkably capable.

**Coding Assistance:** Code completion, simple script generation, and conceptual explanations are areas where Mistral performs well.

**Multilingual Capability:** Strong performance in English and French, with reasonable capabilities in other languages.

**Self-Hosting Options:** The open-weight nature of some Mistral models allows for deployment on your own infrastructure.

## Recognizing Mistral's Limitations

However, Mistral models also exhibit documented behavioral patterns that governance helps address:

**Reasoning Depth:** Mistral tends toward shallower multi-step reasoning compared to frontier models. Complex logical chains may produce inconsistent results.

**Instruction Following:** On long or highly constrained prompts, Mistral's instruction-following can degrade. The model may miss constraints or drift from specified formats.

**Context Window Behavior:** While Mistral has reasonable context windows, information from earlier in long conversations may be recalled inconsistently.

**Factual Confidence:** Mistral may present uncertain information with unwarranted confidence. Hallucination rates are higher than some alternatives, particularly in specialized domains.

**Safety Alignment:** Mistral's lighter safety alignment means it may produce outputs that other models would decline, requiring additional governance consideration.

**Tool Use:** Mistral is not optimized for agentic workflows involving multi-tool orchestration or autonomous execution chains.

## How AIXORD Compensates

AIXORD addresses these limitations through structural controls:

**For Reasoning Limitations:** The framework mandates decomposition of complex tasks into smaller steps, with explicit verification at each stage.

**For Instruction Drift:** Regular governance checks and the response header system help detect and correct when Mistral strays from constraints.

**For Context Limitations:** External artifacts and the HANDOFF system ensure critical information persists regardless of context window behavior.

**For Hallucination Risk:** The confidence indicator system and mandatory evidence requirements help surface uncertain claims.

**For Safety Gaps:** The governance structure itself provides guardrails, with explicit approval requirements before consequential actions.

---

# Chapter 3: The Authority Model

## The Three Roles

AIXORD defines three distinct roles that govern every interaction:

### Director (Human)

The Director is always a human. This role holds supreme authority within the AIXORD framework. The Director:

- Decides WHAT will be done
- Approves all consequential actions
- Owns all outcomes and decisions
- Can modify, override, or halt any AI action
- Declares project objectives and scope

The Director is not a passive recipient of AI output—the Director is the project owner who happens to be assisted by AI.

### Architect (AI)

When working in advisory mode, the AI operates as Architect. In this role, the AI:

- Recommends HOW objectives might be achieved
- Analyzes requirements and constraints
- Proposes solutions and alternatives
- Identifies risks and dependencies
- Specifies deliverables and steps

The Architect advises but does not execute. All Architect recommendations require Director approval before proceeding.

### Commander (AI)

When authorized to execute, the AI operates as Commander. In this role, the AI:

- Executes APPROVED work within defined bounds
- Implements specifications created as Architect
- Reports completion status and issues
- Cannot expand scope without Director authorization

The Commander only acts on what has been explicitly approved. Autonomous scope expansion is forbidden.

## Approval Grammar

AIXORD defines a specific vocabulary for granting execution authority:

**Valid Approvals (Grants Authority):**
- APPROVED
- APPROVED: [specific scope]
- EXECUTE
- DO IT
- YES, PROCEED

**Invalid (Requires Clarification):**
- "Looks good"
- "Fine"
- "OK"
- "Sure"
- Thumbs up emoji
- Silence

When the AI receives ambiguous approval, it must request explicit confirmation before proceeding. This prevents misunderstandings that lead to unwanted work.

## The Silence Protocol

By default, silence equals HALT. If the Director does not respond, the AI does not proceed. This is a safety measure that prevents the AI from continuing work based on assumptions about intent.

However, the Director may grant pre-authorization for specific categories:

```
AUTO-APPROVE: formatting decisions
AUTO-APPROVE: minor refactors under 10 lines
```

Pre-authorizations must be:
- Explicit
- Scoped to specific categories
- Recorded for reference
- Revocable at any time

## Execution Modes

AIXORD supports three execution modes:

**STRICT Mode:** Every action requires explicit approval. This is the default mode and is recommended for production work, critical systems, and unfamiliar domains.

**SUPERVISED Mode:** Batch approval is permitted. The AI may present multiple proposed actions for collective approval. Suitable for testing and iteration.

**SANDBOX Mode:** Within declared boundaries, the AI may execute without per-action approval. All actions are still logged. Cannot modify anything outside the sandbox scope. Auto-expires after defined limits.

---

# Chapter 4: The AIXORD Formula

## The Transformation Chain

At the heart of AIXORD lies a simple but powerful concept: the transformation chain that converts intent into governed, executable structure.

```
Project_Docs → Master_Scope → Deliverables → Steps → Production-Ready System
```

This chain is mandatory. Every AIXORD project traverses it. Attempting to skip elements triggers a governance violation.

## Understanding Each Element

### Project Documents

Project documents capture the fundamental decisions about what you're building. They include:

- Project objectives
- Constraints and requirements
- Stakeholder information
- Success criteria
- Out-of-scope declarations

These documents are created during the IDEATION kingdom and must be saved as external artifacts before proceeding.

### Master Scope

The Master Scope is the complete definition of what will be delivered. It is expressed as a collection of Deliverables:

```
Master_Scope = {D1, D2, D3, ... Dn}
```

Each Deliverable is an enumerable unit of completion—something you can point to and say "this is done" or "this is not done."

### Deliverables

Each Deliverable breaks down into Steps:

```
D = {S1, S2, S3, ... Sn}
```

Steps are atomic units of execution. They should be small enough to complete in a single focused session, clear enough that completion is unambiguous, and independent enough to verify in isolation.

### Production-Ready System

The end result of traversing the formula is a production-ready system—not a prototype, not a draft, but a complete, verified, quality-assessed deliverable.

## The Conservation Law

AIXORD enforces a conservation principle:

```
EXECUTION_TOTAL = VERIFIED_REALITY + FORMULA_EXECUTION
```

This means:
- You cannot execute more than is documented and governed
- Verified work (brownfield) is conserved unless explicitly unlocked
- New execution is authorized only through the formula

This prevents both scope creep and accidental demolition of working systems.

---

# Chapter 5: Phases and Kingdoms

## The Three Kingdoms

AIXORD organizes work into three kingdoms, each with a distinct purpose:

### IDEATION Kingdom

Purpose: Explore, discover, decide

This is where you figure out what you're building. The IDEATION kingdom includes:
- Discovering requirements and constraints
- Brainstorming approaches and solutions
- Evaluating options and trade-offs
- Making decisions about direction

The output of IDEATION is documented decisions and project documentation—not code, not deliverables.

### BLUEPRINT Kingdom

Purpose: Convert intent to buildable form

This is where you plan how to build what you decided. The BLUEPRINT kingdom includes:
- Planning the work structure
- Creating the formal blueprint
- Defining scope and dependencies

The output of BLUEPRINT is a complete plan with clear deliverables, steps, and dependencies—ready for execution but not yet executed.

### REALIZATION Kingdom

Purpose: Execute, verify, lock

This is where building happens. The REALIZATION kingdom includes:
- Executing approved work
- Auditing completed deliverables
- Verifying against quality standards
- Locking completed work

The output of REALIZATION is verified, production-ready deliverables.

## The Phase Sequence

Within these kingdoms, work progresses through phases:

```
SETUP → DISCOVER → BRAINSTORM → PLAN → BLUEPRINT → SCOPE → EXECUTE → AUDIT → VERIFY → LOCK
```

Each phase has specific entry and exit criteria. Kingdom transitions require gate completion. Phase regression requires explicit Director acknowledgment.

### Phase Mapping

| Phase | Kingdom |
|-------|---------|
| SETUP | Pre-Kingdom |
| DISCOVER | IDEATION |
| BRAINSTORM | IDEATION |
| PLAN | BLUEPRINT |
| BLUEPRINT | BLUEPRINT |
| SCOPE | BLUEPRINT |
| EXECUTE | REALIZATION |
| AUDIT | REALIZATION |
| VERIFY | REALIZATION |
| LOCK | REALIZATION |

---

# Chapter 6: Session Setup Process

## The Nine-Step Startup Sequence

Every AIXORD session begins with a structured setup process. This is not optional—all nine steps must be completed before substantive work begins.

### Step 1: License Validation

The session begins with license verification. You'll be asked to provide your license email or authorization code. Valid formats include:
- Your registered email address
- Standard license keys (PMERIT-XXXX-XXXX format)
- Gift codes for promotional access

### Step 2: Disclaimer Affirmation

Before proceeding, you must acknowledge six key terms:

1. **Director Responsibility:** You are solely responsible for all decisions and outcomes. The AI provides suggestions; you make final calls.

2. **No Guarantee of Results:** AIXORD does not guarantee project success, timeline accuracy, or fitness for any particular purpose.

3. **AI Limitations:** AI may make mistakes, provide outdated information, or misunderstand requirements. Always verify critical information.

4. **Not Professional Advice:** AIXORD output is not legal, financial, medical, or other professional advice. Consult appropriate professionals.

5. **Limitation of Liability:** PMERIT LLC liability is limited to the purchase price paid.

6. **Indemnification:** You agree to hold PMERIT LLC harmless from claims arising from your use of AIXORD.

You affirm by typing: `I ACCEPT: [your email or code]`

### Step 3: Tier Detection

Indicate which Mistral tier you're using:
- Free tier
- Pro tier
- Self-hosted

This helps calibrate expectations around context window and capability.

### Step 4: Environment Configuration

Choose to accept default environment settings or customize:
- `ENV-CONFIRMED` — Accept defaults
- `ENV-MODIFY` — Specify custom preferences

### Step 5: Folder Structure

Select your artifact storage approach:
- **AIXORD Standard Structure** — Use the recommended folder hierarchy
- **User-Controlled** — Manage your own structure

### Step 6: Citation Mode

Choose how citations should be handled:
- **STRICT** — Every claim cited
- **STANDARD** — Key recommendations cited (default)
- **MINIMAL** — Sources on request only

### Step 7: Continuity Mode

Select your continuity preference:
- **STANDARD** — Normal conversational continuity
- **STRICT-CONTINUITY** — Enforced handoffs, recovery commands
- **AUTO-HANDOFF** — Automatic handoff on risk/ambiguity

### Step 8: Project Objective Declaration

State your project objective in 1-2 sentences. All work will be constrained to this declared objective.

### Step 9: Reality Classification

Declare the state of existing work:
- **GREENFIELD** — No prior execution exists; formula governs entire system
- **BROWNFIELD-EXTEND** — Verified execution exists; must extend, not rebuild
- **BROWNFIELD-REPLACE** — Verified execution exists; replacement authorized

For brownfield projects, you must list conserved or replaceable scopes.

---

# Chapter 7: Gates and Checkpoints

## Understanding Gates

Gates are mandatory checkpoints that must be satisfied before progression. AIXORD defines several key gates:

### License Gate (GA:LIC)
Validates that a proper license is in place. Blocking—cannot proceed without.

### Disclaimer Gate (GA:DIS)
Confirms disclaimer acceptance. Blocking—cannot proceed without.

### Reality Absorption Gate (GA:RA)
Requires explicit reality classification. Blocking—cannot proceed without declaring greenfield or brownfield status.

### Formula Gate (GA:FX)
Ensures the formula is properly bound. Blocking—cannot proceed to execution without.

### Project Docs Gate (GA:PD)
Confirms project documentation is created and saved externally.

### Plan Review Gate (GA:PR)
Confirms plan analysis is complete.

### Blueprint Gate (GA:BP)
Validates blueprint creation and approval.

### Master Scope Gate (GA:MS)
Confirms master scope and dependency graph are established.

### Visual Audit Gate (GA:VA)
Requires evidence before verify-to-lock transition.

### Handoff Gate (GA:HO)
Ensures proper handoff documentation at session end.

## The Gate Chain

Gates must be satisfied in order:

```
LIC → DIS → RA → FX → PD → PR → BP → MS → VA → HO
```

Skipping gates triggers HALT. Gates that are not yet applicable show as pending.

## Message Thresholds

AIXORD monitors message count and provides warnings:

| Messages | Action |
|----------|--------|
| 1-10 | Work normally |
| 10 | Silent compliance check |
| 15 | Warning: "Consider CHECKPOINT soon" |
| 20 | Strong warning: "Strongly recommend CHECKPOINT" |
| 25 | Critical: "Quality may degrade. CHECKPOINT now." |
| 30 | Auto-generate CHECKPOINT |

These thresholds are particularly important for Mistral, where context window limitations make regular checkpoints essential.

---

# Chapter 8: Artifacts and Continuity

## Why External Artifacts Matter

The single most important practice in AIXORD is saving artifacts externally. AI platforms do not reliably persist files or recall information across sessions. The only reliable continuity is what YOU save outside the conversation.

## Required Artifacts

AIXORD requires these artifacts to be saved at specific gates:

| Artifact | Gate | Purpose |
|----------|------|---------|
| Project_Docs | GA:PD | Captures project decisions |
| Formula | GA:FX | Defines transformation structure |
| Blueprint | GA:BP | Documents the plan |
| Master_Scope | GA:MS | Specifies all deliverables |
| HANDOFF | GA:HO | Enables session continuity |

## The Artifact Binding Law

Artifacts do not implicitly persist across turns or sessions. An artifact is only authoritative when it is:

1. Explicitly saved by you
2. Explicitly referenced in conversation
3. Explicitly re-bound on resume

The AI will never assume an artifact exists. On resume, you must confirm which artifacts are being continued.

## Confirmation Methods

When confirming artifact saves, use any of these methods:

| Method | Description | Assurance |
|--------|-------------|-----------|
| VISUAL | Screenshot, file explorer image | HIGH |
| TEXTUAL | Paste file contents or directory listing | HIGH |
| HASH | Provide md5sum output | HIGH |
| PLATFORM | Share link (Drive, GitHub, etc.) | HIGH |
| ATTESTATION | "ATTESTED: [artifact] saved to [path]" | LOW |

## The HANDOFF System

A HANDOFF is a governance-carrying authority artifact—not a summary. It transfers:

- Authority declaration
- Objective and scope
- Reality classification
- Formula status
- Current state (phase, kingdom, gates)
- DAG status
- Artifact locations
- Explicit next action
- Resume instruction
- Artifact rebind checklist

To resume from a HANDOFF, use: `PMERIT CONTINUE`

To rebuild state from scratch: `PMERIT RECOVER`

---

# Chapter 9: Mistral-Specific Considerations

## Working Within Mistral's Strengths

When using AIXORD with Mistral, leverage what Mistral does well:

**Fast Drafting:** Use Mistral for rapid iteration on content, specifications, and documentation. It excels at producing first drafts quickly.

**Code Completion:** For straightforward coding tasks—simple scripts, boilerplate, and code completion—Mistral is efficient and capable.

**Conceptual Explanations:** Mistral handles general explanations well. Use it for documenting concepts and creating educational content.

**Quick Responses:** When you need responsive back-and-forth, Mistral's speed is an advantage.

## Compensating for Mistral's Limitations

Apply these practices to address Mistral's documented weaknesses:

### For Reasoning Depth

- Decompose complex reasoning into explicit steps
- Verify each step before proceeding
- Don't trust long logical chains—require demonstration

### For Instruction Following

- Keep instructions shorter and more explicit
- Limit simultaneous constraints
- Use checkpoints to detect drift
- Restate constraints when drift is detected

### For Hallucination Risk

- Treat factual outputs as UNVERIFIED by default
- Require external validation for legal, medical, or historical claims
- Don't accept citations without independent verification

### For Context Limitations

- Use more frequent CHECKPOINTs
- Re-anchor constraints regularly
- Keep long-context conclusions provisional
- Prefer external artifacts over in-context state

### For Safety Gaps

- Maintain STRICT mode for sensitive work
- Review borderline outputs carefully
- Apply governance constraints to compensate for lighter alignment

## Task Restrictions

Based on Mistral's characteristics, some tasks are better suited than others:

**Allowed (Default):**
- Fast drafting and iteration
- Code completion and simple scripts
- Conceptual explanations
- Documentation generation

**Use with Caution:**
- Structured pipelines (format may drift)
- Non-English outputs (quality varies)
- Long creative narratives (consistency may degrade)

**Not Recommended:**
- Long-document analysis (context loss likely)
- Autonomous agents (tool limitations)
- High-risk factual domains (hallucination risk)
- Multi-tool orchestration (weak agentic behavior)
- Security-critical code without review

---

# Chapter 10: Quality Dimensions

## The Seven Dimensions

AIXORD assesses quality across seven dimensions:

### 1. Best Practices

Are industry-standard approaches being applied? This includes:
- Following established conventions
- Using proven patterns
- Avoiding anti-patterns
- Adhering to style guidelines

### 2. Completeness

Are all requirements addressed? Check that:
- Every stated requirement is covered
- Edge cases are considered
- Nothing specified is missing
- Dependencies are complete

### 3. Accuracy

Is the work factually correct? Verify that:
- Technical details are accurate
- References are valid
- Calculations are correct
- Claims are supported

### 4. Sustainability

Can the work be maintained long-term? Consider:
- Code readability
- Documentation quality
- Dependency health
- Future modification ease

### 5. Reliability

Does the work handle errors and edge cases? Evaluate:
- Error handling
- Edge case coverage
- Failure modes
- Recovery paths

### 6. User-Friendliness

Is the work intuitive and well-documented? Assess:
- Interface clarity
- Documentation completeness
- Learning curve
- Help availability

### 7. Accessibility

Does the work follow inclusive design? Check:
- Accessibility standards compliance
- Alternative text and descriptions
- Keyboard navigation
- Screen reader compatibility

## Quality Assessment Rules

- Each dimension receives: PASS, ACCEPTABLE, or FAIL
- Evidence must support the assessment
- Any FAIL blocks progression to LOCK unless explicitly waived
- Unsupported PASS assessments are invalid

## OSS-First Priority

AIXORD recommends prioritizing solutions in this order:

1. Free Open Source — Community-maintained, no lock-in
2. Freemium Open Source — OSS core, paid premium
3. Free Proprietary — Company-owned, free tier
4. Paid Open Source — Commercial OSS with support
5. Paid Proprietary — Requires justification

---

# Chapter 11: Commands Reference

## Activation Commands

| Command | Effect |
|---------|--------|
| `PMERIT CONTINUE` | Start/resume AIXORD session |
| `CHECKPOINT` | Quick save, continue working |
| `HANDOFF` | Full save, end session |
| `RECOVER` | Rebuild state from HANDOFF |

## Phase Commands

| Command | Effect |
|---------|--------|
| `HALT` | Stop, return to DECISION |
| `APPROVED` | Authorize execution |
| `RESET: [PHASE]` | Return to specific phase |

## Scope Commands

| Command | Effect |
|---------|--------|
| `EXPAND SCOPE: [topic]` | Request scope expansion |
| `SHOW SCOPE` | Display current scope |
| `UNLOCK: [item]` | Unlock for modification |

## Quality Commands

| Command | Effect |
|---------|--------|
| `QUALITY CHECK` | Trigger 7-dimension evaluation |
| `SOURCE CHECK` | Request source citations |

## Enforcement Commands

| Command | Effect |
|---------|--------|
| `PROTOCOL CHECK` | Force compliance check |
| `DRIFT WARNING` | Flag off-track behavior |
| `COMPLIANCE SCORE` | Show governance metrics |

## Artifact Commands

| Command | Effect |
|---------|--------|
| `BIND: [artifact]` | Confirm artifact present |
| `REBIND ALL` | Re-confirm all artifacts |
| `SHOW BINDINGS` | Display binding status |

## Reality Commands

| Command | Effect |
|---------|--------|
| `SHOW REALITY` | Display classification |
| `DECLARE: GREENFIELD` | Set greenfield mode |
| `DECLARE: BROWNFIELD-EXTEND` | Set extend-only mode |
| `UNLOCK: [SCOPE] WITH JUSTIFICATION: [reason]` | Unlock conserved scope |

## Navigation Commands

| Command | Effect |
|---------|--------|
| `SHOW STATE` | Display current state |
| `SHOW DAG` | Display dependency graph |
| `HELP` | Show available commands |

---

# Chapter 12: Path Security

## Why Path Security Matters

Filesystem paths can reveal sensitive information about your system, including usernames, directory structures, and potentially exploitable details. AIXORD implements strict path security to protect your privacy.

## The Path Variable System

Instead of raw filesystem paths, AIXORD uses logical variables:

| Variable | Purpose |
|----------|---------|
| `{AIXORD_HOME}` | Your AIXORD installation root |
| `{PROJECT_ROOT}` | Current project directory |
| `{LOCAL_ROOT}` | Your machine base |
| `{ARTIFACTS}` | Output/distribution folder |
| `{HANDOFF_DIR}` | Session continuity storage |
| `{TEMP}` | Temporary work |

## Forbidden Patterns

The following path patterns are forbidden in AIXORD artifacts:

- Windows absolute paths (C:\, D:\, etc.)
- macOS home paths (/Users/)
- Linux home paths (/home/)
- UNC network paths (\\)
- Cloud sync folders (OneDrive, Dropbox, Google Drive)
- Environment variables (%USERPROFILE%, $HOME)

## Safe Sharing Practices

**Safe to share:**
- "AIXORD_VERIFY: PASS [6 folders]"
- "Structure created"
- "Setup complete"

**Do NOT share:**
- Full terminal output showing your username
- Screenshots showing folder locations
- Complete paths like "C:\Users\YourName\..."

## Scam Pattern Detection

AIXORD includes tripwire detection for suspicious patterns. If a conversation combines path references with:
- Urgency
- Credential requests
- Payment requests
- Identity document requests

The AI will halt and warn about potential social engineering.

---

# Chapter 13: Getting Started

## Quick Start Guide

### Step 1: Prepare Your Environment

Create your AIXORD folder structure:
```
{AIXORD_HOME}/
  01_Project_Docs/
  02_Master_Scope_and_DAG/
  03_Deliverables/
  04_Artifacts/
  05_Handoffs/
  99_Archive/
```

### Step 2: Start Your First Session

Begin with: `PMERIT CONTINUE`

Complete the 9-step setup:
1. Enter license information
2. Accept the disclaimer
3. Select your Mistral tier
4. Confirm environment
5. Choose folder structure
6. Set citation mode
7. Set continuity mode
8. Declare your objective
9. Classify reality (greenfield/brownfield)

### Step 3: Work Through IDEATION

In the IDEATION kingdom:
- Discover requirements
- Brainstorm approaches
- Document decisions
- Save Project_Docs externally

### Step 4: Progress to BLUEPRINT

In the BLUEPRINT kingdom:
- Create your plan
- Define deliverables
- Map dependencies
- Save Blueprint externally

### Step 5: Execute in REALIZATION

In the REALIZATION kingdom:
- Execute approved work
- Audit completions
- Verify against quality
- Lock finished deliverables

### Step 6: End with HANDOFF

Before ending:
- Generate HANDOFF document
- Save externally
- Verify all artifacts listed
- Confirm rebind checklist

---

# Chapter 14: Advanced Concepts

## Understanding the Two Kingdoms Framework

AIXORD's kingdom system reflects a fundamental truth about project work: thinking and doing require different mental modes. The framework enforces clean separation between these modes to prevent the chaos that occurs when ideation bleeds into execution.

### The Ideation Mindset

In IDEATION, everything is possible. The goal is exploration, not commitment. Questions dominate over answers. This is where you ask:

- What problem are we actually solving?
- What approaches might work?
- What constraints exist?
- What risks should we consider?
- What have others done in similar situations?

The outputs of IDEATION are decisions and documentation—specifically, the Project Documents that capture your conclusions. No code is written. No deliverables are produced. The only tangible output is agreement on direction.

### The Blueprint Mindset

In BLUEPRINT, possibilities narrow to plans. The goal is specification, not exploration. Answers dominate over questions. This is where you ask:

- How will we structure this work?
- What are the dependencies?
- What sequence makes sense?
- What resources are required?
- How will we verify completion?

The outputs of BLUEPRINT are specifications—the Blueprint, Master Scope, and DAG that define exactly what will be built and in what order. Still no execution. The only tangible output is a complete, approved plan.

### The Realization Mindset

In REALIZATION, plans become reality. The goal is implementation within bounds. Action dominates over planning. This is where you:

- Execute approved work
- Track progress against plan
- Verify completed deliverables
- Lock finished work

The outputs of REALIZATION are deliverables—actual, tangible results that satisfy the specifications created in BLUEPRINT.

### Why Separation Matters

Without kingdom separation, projects suffer predictable problems:

**Premature Execution:** Starting to build before understanding what you're building leads to rework and waste.

**Scope Drift During Execution:** Exploring new ideas while executing corrupts both the exploration and the execution.

**Verification Confusion:** Without clear specifications, how do you know when something is done?

**Context Collapse:** Trying to hold exploration, specification, and execution in the same mental space exhausts cognitive capacity.

AIXORD's kingdoms force clean transitions between modes, with explicit gates ensuring each phase completes before the next begins.

## The DAG and Dependency Management

The Directed Acyclic Graph (DAG) is one of AIXORD's most powerful concepts. Understanding it deeply improves your ability to plan and execute complex projects.

### What the DAG Represents

The DAG shows dependencies between deliverables. If Deliverable B depends on Deliverable A, then A must be completed and verified before B can begin. The graph is:

- **Directed:** Dependencies have direction (A must come before B, not the other way around)
- **Acyclic:** No circular dependencies (if A depends on B, B cannot depend on A)

### Why Acyclic Matters

Circular dependencies are project killers. Consider:
- Task A requires output from Task B
- Task B requires output from Task A

Neither can start until the other finishes. This is a deadlock that can only be resolved by breaking the cycle—recognizing that one dependency is artificial or that a task must be split.

AIXORD enforces acyclic validation. If you create a circular dependency, the framework will detect it and require resolution before proceeding.

### Eligibility and Blocking

A deliverable is ELIGIBLE for execution only when:
- All its dependencies are VERIFIED
- All external dependencies are CONFIRMED
- The Formula is bound
- Reality classification permits it

If any of these conditions fails, the deliverable is BLOCKED. You cannot skip ahead. You must either complete the blocking dependencies or restructure the DAG.

### DAG as Communication Tool

The DAG serves as a powerful communication tool. When someone asks "why can't we start on X?", the DAG provides the answer: "Because Y and Z aren't complete yet." This removes personal judgment from prioritization decisions—the structure itself determines what's possible.

## Conservation and Brownfield Projects

The Conservation Law is one of AIXORD's most distinctive features. Understanding it deeply helps you work effectively with existing systems.

### The Problem AIXORD Solves

AI systems, by default, tend toward greenfield thinking. Ask an AI to help with a feature, and it may propose rebuilding the entire system. This creates several problems:

- Verified, working code gets discarded
- Institutional knowledge embedded in code is lost
- Migration complexity multiplies
- Risk of regression increases dramatically

### How Conservation Works

The Conservation Law states:

```
EXECUTION_TOTAL = VERIFIED_REALITY + FORMULA_EXECUTION
```

This means the total of what exists (or will exist) equals what already works (verified reality) plus what new work creates (formula execution).

For brownfield projects, this implies:

```
FORMULA_EXECUTION = EXECUTION_TOTAL − VERIFIED_REALITY
```

The Formula governs only the delta—the difference between where you are and where you want to be. Verified reality is conserved unless explicitly unlocked.

### Declaring Brownfield Status

When you select BROWNFIELD-EXTEND or BROWNFIELD-REPLACE during setup, you're telling AIXORD that verified work exists. You must then declare which scopes are conserved and which are replaceable:

- **CONSERVED:** Cannot be rebuilt without explicit unlock and justification
- **REPLACEABLE:** Authorized for rebuild if needed

This explicit declaration prevents accidental demolition of working systems while still allowing intentional replacement when needed.

### Unlocking Conserved Scopes

If you need to modify a conserved scope, you must:

1. Issue: `UNLOCK: [SCOPE_NAME] WITH JUSTIFICATION: [reason]`
2. Provide clear justification for why rebuild is necessary
3. Receive explicit acknowledgment of the unlock

This friction is intentional. Rebuilding verified work should require deliberate decision-making, not casual default.

## Artifact Management Best Practices

Effective artifact management is the difference between AIXORD providing value and AIXORD providing frustration. These practices will help you succeed.

### The External Storage Imperative

No AI platform reliably persists files across sessions. This includes platforms with file handling features—those features are conveniences, not guarantees. The only reliable persistence is what you save outside the conversation.

Save early. Save often. Save externally.

### Naming Conventions

Use consistent naming that includes:
- Project identifier
- Artifact type
- Version or date
- Status (if applicable)

Example: `ProjectX_Blueprint_v2_2026-01-18.md`

This makes artifacts findable, sortable, and identifiable even without opening them.

### The Rebind Ritual

When resuming a session, treat rebinding as a ritual:

1. State which artifacts you're continuing
2. Confirm each artifact exists
3. Provide confirmation (paste, hash, link, or attestation)
4. Wait for binding acknowledgment

Rushing through rebinding leads to confusion later when the AI references artifacts it believes are bound but aren't.

### Checkpoint Discipline

Checkpoints are your safety net. Use them:
- After significant decisions
- Before attempting risky operations
- At natural pause points
- When you notice context degradation

A checkpoint takes seconds. Recovering from lost context takes much longer.

---

# Chapter 15: Troubleshooting

## Common Issues

### "Unbound artifact referenced"

**Cause:** You referenced an artifact that hasn't been confirmed in this session.

**Solution:** Use `BIND: [artifact name]` and provide confirmation (paste contents, share link, or attest).

### "Gate blocked"

**Cause:** A required gate has not been satisfied.

**Solution:** Check which gate is blocking with `SHOW STATE`. Complete the required action for that gate.

### "Formula violation"

**Cause:** You attempted to skip steps in the transformation chain.

**Solution:** Back up to the missing element. Project_Docs must exist before Master_Scope, Master_Scope before Deliverables, etc.

### "Conservation law violated"

**Cause:** You attempted to rebuild something marked as conserved.

**Solution:** Either unlock it with `UNLOCK: [scope] WITH JUSTIFICATION: [reason]` or work within the extend-only constraint.

### AI seems confused or off-track

**Cause:** Context degradation or instruction drift (common with Mistral).

**Solution:** Issue `PROTOCOL CHECK` to force a compliance check. Consider `CHECKPOINT` to refresh context.

### Session ending unexpectedly

**Cause:** Approaching message or context limits.

**Solution:** When you see threshold warnings, complete the current unit and issue `HANDOFF`.

---

# Chapter 16: Working with Mistral Effectively

## Leveraging Mistral's Speed

Mistral's response speed is a genuine advantage. Use it strategically:

### Rapid Iteration Cycles

Mistral's quick responses enable tight feedback loops. Use this for:
- Drafting content with immediate refinement
- Testing different approaches quickly
- Generating multiple options for comparison

Instead of asking for one "perfect" solution, ask for three quick options. Evaluate them. Ask for refinement of the best one. This iterative approach often produces better results than single-shot prompting.

### Real-Time Collaboration

The speed makes Mistral feel more like a conversation partner than a query-response system. Take advantage of this for:
- Brainstorming sessions
- Real-time problem solving
- Interactive planning

Don't overthink individual prompts. The speed allows for course correction.

## Managing Mistral's Limitations

Understanding and working within Mistral's limitations produces better outcomes than fighting against them.

### Keeping Prompts Focused

Mistral performs best with clear, focused instructions. Avoid:
- Multiple unrelated requests in one message
- Extensive background context before the actual request
- Ambiguous or open-ended prompts without guidance

Instead:
- One clear request per message
- Essential context only
- Explicit format expectations

### Chunking Complex Tasks

For complex tasks, break them into explicit phases:

```
Phase 1: Let me understand the requirements
- [list requirements]
- [confirm understanding]

Phase 2: Let me propose an approach
- [wait for approval]

Phase 3: Let me execute
- [implement with verification points]
```

Each phase gets explicit confirmation before proceeding.

### Verification Checkpoints

Build verification into your workflow:

After factual claims: "What's your confidence level on that?"
After technical details: "Can you confirm the accuracy of [specific detail]?"
After multi-step reasoning: "Let me verify each step..."

Don't assume correctness. Verify actively.

## Session Management Strategies

Effective session management maximizes productivity while avoiding common pitfalls.

### The 20-Message Rule

For Mistral, context degradation becomes noticeable around 20 messages. Plan for this:

- At message 10: Consider whether a CHECKPOINT makes sense
- At message 15: Actively prepare for session wrap-up
- At message 20: Complete current work unit and HANDOFF

Don't push past these thresholds expecting stable context.

### Fresh Session Strategy

For truly complex work, consider starting fresh sessions more frequently than the thresholds would require. A new session with a good HANDOFF is often more productive than a long session with degraded context.

### Context Anchoring

Every few messages, re-anchor critical context:

- "Our current phase is BLUEPRINT"
- "We're working on Deliverable 3"
- "The objective is [restate]"

This keeps Mistral aligned even as context naturally degrades.

## Common Patterns and Anti-Patterns

### Effective Patterns

**The Specification Pattern:**
1. State what you need
2. State the constraints
3. Ask for a proposal
4. Approve or refine
5. Execute

**The Verification Pattern:**
1. Complete a unit of work
2. State what was completed
3. Request quality check
4. Address any issues
5. Confirm completion

**The Recovery Pattern:**
1. Notice confusion or drift
2. Issue PROTOCOL CHECK
3. Review current state
4. Correct course
5. Continue

### Anti-Patterns to Avoid

**The Context Dump:**
Pasting massive amounts of context "just in case" often backfires. Mistral may lose the actual request amid the noise. Provide minimum necessary context.

**The Assumption Chain:**
Building on prior responses without verification creates compound errors. Each step should be verified before building on it.

**The Patience Trap:**
Waiting for Mistral to "figure it out" when it's clearly confused. Intervene early. Correct course. Don't hope the AI will self-correct.

---

# Chapter 17: Appendix — Templates

## HANDOFF Template

When creating HANDOFFs, include:

```
# HANDOFF — [Project] — Session [N]

## Authority
- Director: [Your identifier]
- Platform: Mistral
- Session: [N]

## Active State
- Phase: [Current phase]
- Kingdom: [Current kingdom]
- Reality: [GREENFIELD/BROWNFIELD-EXTEND/BROWNFIELD-REPLACE]
- Focus: [Current deliverable]
- Blockers: [List or None]

## Artifacts (Require Rebind)
- [ ] Project_Docs: {AIXORD_HOME}/01_Project_Docs/[file]
- [ ] Blueprint: {AIXORD_HOME}/02_Master_Scope_and_DAG/[file]
- [ ] Master_Scope: {AIXORD_HOME}/02_Master_Scope_and_DAG/[file]

## DAG Status
[List deliverables with status and dependencies]

## Recent Decisions
[Last 5-10 decisions made]

## Next Action
[Explicit next step]

## Resume Command
PMERIT CONTINUE
Session: [N]
Phase: [Phase]
Reality: [Classification]
```

## Quality Assessment Template

```
QUALITY ASSESSMENT: [Deliverable Name]

Profile: [PRODUCTION/INTERNAL/MVP/PROTOTYPE]
Domain: [TECHNICAL/CREATIVE/RESEARCH/PROCESS]

| Dimension | Status | Evidence | Confidence |
|-----------|--------|----------|------------|
| Best Practices | [P/A/F] | [evidence] | [H/M/L] |
| Completeness | [P/A/F] | [evidence] | [H/M/L] |
| Accuracy | [P/A/F] | [evidence] | [H/M/L] |
| Sustainability | [P/A/F] | [evidence] | [H/M/L] |
| Reliability | [P/A/F] | [evidence] | [H/M/L] |
| User-Friendliness | [P/A/F] | [evidence] | [H/M/L] |
| Accessibility | [P/A/F] | [evidence] | [H/M/L] |

Trade-Offs: [List or None]
Waivers: [List or None]

GATE RESULT: [PASS/BLOCKED]
Blockers: [List or None]
```

---

# Legal Notice

## License Reference

This product is licensed under terms specified in the accompanying LICENSE.md file. Your use is subject to those terms.

## Disclaimer Reference

Full disclaimer terms are specified in the accompanying DISCLAIMER.md file. By using AIXORD, you acknowledge acceptance of those terms.



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


## Contact

For support inquiries: support@pmerit.com
For license issues: https://pmerit.gumroad.com

---

*AIXORD v4.2 — Authority. Formula. Conservation. Verification.*
*Mistral Edition — Structured Governance for Efficient AI*

**© 2026 PMERIT LLC. All rights reserved.**
