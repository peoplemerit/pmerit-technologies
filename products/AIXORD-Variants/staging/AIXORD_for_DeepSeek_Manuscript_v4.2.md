# AIXORD for DeepSeek

## AI Execution Order — Human-AI Governance Framework

### DeepSeek AI Governance Edition

**Version 4.2**

---

**PMERIT LLC**

*Transforming Chaos into Structure*



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
2. Why DeepSeek Needs Governance
3. The Authority Model
4. The AIXORD Formula
5. Understanding Kingdoms and Phases
6. The Gate System
7. Working with Artifacts
8. Session Management and Continuity
9. Quality Assurance Framework
10. DeepSeek-Specific Considerations
11. Path Security and Privacy
12. Common Workflows
13. Troubleshooting
14. Quick Reference Guide
15. Glossary

---

# Chapter 1: Introduction to AIXORD

## What Is AIXORD?

AIXORD stands for **AI Execution Order** — a comprehensive governance framework designed to transform chaotic AI conversations into structured, productive project execution. The name draws inspiration from military OPORD (Operations Order) methodology, adapted for the unique challenges of human-AI collaboration.

At its core, AIXORD is a **workflow methodology**. It provides a systematic approach to working with AI systems that ensures clarity, accountability, and continuity across sessions. Unlike traditional chat interactions where context gets lost and decisions get reversed, AIXORD creates a structured environment where every decision is documented, every artifact is tracked, and every session can be resumed exactly where it left off.

## The Problem AIXORD Solves

If you've worked with AI assistants, you've likely experienced these frustrations:

**Lost Context**: You explain your project in detail, only to have the AI forget everything in the next session. Hours of background information vanish, forcing you to start over.

**Reversed Decisions**: You and the AI agree on an approach, but three messages later, the AI suggests something completely different. There's no record of what was decided or why.

**Scope Creep**: A simple task balloons into something unmanageable because there's no mechanism to define and enforce boundaries.

**Quality Inconsistency**: Sometimes the AI produces excellent work. Other times, the output is generic or misses the mark entirely. There's no framework for ensuring consistent quality.

**Session Discontinuity**: Each conversation feels isolated. There's no way to build on previous work systematically.

AIXORD addresses all of these problems through a combination of clear authority structures, mandatory documentation, explicit approval workflows, and session continuity protocols.

## What AIXORD Is Not

Before diving deeper, it's important to understand what AIXORD is **not**:

**AIXORD is not a technical enforcement layer.** It cannot physically prevent an AI from making mistakes or drifting off-topic. It works through structured workflow discipline, not technical controls.

**AIXORD is not a security system.** It provides guidance on privacy and path security, but it doesn't provide encryption or access controls.

**AIXORD is not a replacement for human judgment.** The framework explicitly places the human (the Director) in charge of all decisions. AI provides recommendations; humans decide.

Understanding these limitations is crucial. AIXORD works when both the human and the AI commit to following it in good faith. It's a governance methodology — a set of rules and structures that create order when followed.

## Why This Edition?

This edition of AIXORD is specifically adapted for **DeepSeek** AI systems. While the core AIXORD framework applies universally, DeepSeek has unique characteristics that require specialized handling. DeepSeek models excel at certain tasks while having known limitations in others. This edition addresses those specifics, providing DeepSeek users with governance that accounts for the platform's strengths and compensates for its weaknesses.

---

# Chapter 2: Why DeepSeek Needs Governance

## Understanding DeepSeek

DeepSeek represents a new generation of AI models with impressive capabilities in reasoning, code generation, and mathematical problem-solving. The DeepSeek-V3 and DeepSeek-R1 models have gained recognition for their performance on benchmarks and their accessibility.

However, like all AI systems, DeepSeek has characteristics that require careful management in production workflows.

## DeepSeek's Strengths

**Mathematical Reasoning**: DeepSeek models demonstrate strong performance on mathematical problems, making them valuable for technical and analytical work.

**Code Generation**: For isolated code snippets and well-defined programming tasks, DeepSeek produces quality output.

**Cost Efficiency**: DeepSeek's pricing model makes it accessible for individual developers and small teams.

**Transparency**: DeepSeek-R1's reasoning traces provide visibility into the model's thought process.

## Areas Requiring Governance

**Refusal Calibration**: DeepSeek models have been documented to have a lower refusal threshold than some competitors. This means they may comply with requests that other models would refuse. AIXORD governance provides an additional layer of ethical oversight.

**Prompt Sensitivity**: Like many models, DeepSeek can be influenced by carefully crafted prompts. AIXORD's prompt injection defenses help maintain consistent behavior.

**Reasoning Trace Reliability**: While DeepSeek's reasoning traces are valuable for transparency, they should not be treated as authoritative. The final output matters more than the explanation.

**System-Level Complexity**: DeepSeek excels at isolated tasks but may struggle with large, interconnected systems. AIXORD's phased approach breaks complex work into manageable pieces.

**Session Continuity**: DeepSeek doesn't have built-in memory across sessions. AIXORD's HANDOFF system provides the continuity mechanism.

## The Governance Solution

AIXORD governance for DeepSeek operates on a simple principle: **structured discipline compensates for platform limitations**. By establishing clear protocols, mandatory checkpoints, and explicit approval workflows, AIXORD creates consistency regardless of the underlying model's characteristics.

This isn't about distrust — it's about reliability. Professional work requires predictable outcomes. AIXORD provides the structure that makes AI collaboration predictable.

---

# Chapter 3: The Authority Model

## The Foundation of AIXORD

The Authority Model is the foundation upon which all of AIXORD rests. Without clear authority, governance is impossible. Without governance, AI collaboration degenerates into chaos.

The Authority Model answers the fundamental questions:
- Who decides what gets done?
- Who decides how it gets done?
- Who executes the work?
- Who is accountable for outcomes?

AIXORD answers these questions with three clearly defined roles.

## The Three Roles

AIXORD defines three distinct roles, each with clear responsibilities and boundaries. This separation prevents confusion and ensures accountability.

### The Director

The **Director** is always a human. The Director holds supreme authority in the AIXORD system. They decide **what** gets done — the objectives, the priorities, the final calls on all decisions.

Key Director responsibilities:
- Declaring project objectives
- Approving or rejecting AI recommendations
- Authorizing execution of work
- Accepting or waiving quality requirements
- Owning all outcomes and consequences

The Director cannot be an AI system. Even when AI provides excellent recommendations, the human Director makes the final decision. This isn't bureaucracy — it's accountability. AI systems don't bear consequences for bad decisions; humans do.

Why is this important? Consider the alternative. If AI could approve its own recommendations, there would be no human checkpoint. Mistakes would propagate without review. Scope would expand without oversight. Accountability would be diffused to the point of meaninglessness.

The Director role ensures that a thinking, responsible human being reviews every significant decision. This human brings judgment, context, and accountability that AI systems lack.

### The Architect

The **Architect** is the AI in its advisory capacity. The Architect recommends **how** things should be done — analyzing problems, proposing solutions, designing approaches.

Key Architect responsibilities:
- Analyzing requirements and constraints
- Proposing approaches and solutions
- Identifying risks and trade-offs
- Creating specifications and blueprints
- Advising on best practices

The Architect provides expertise and analysis but does not decide. It recommends; the Director approves.

This separation is crucial. The AI brings vast knowledge and analytical capability. It can consider more options, identify more risks, and recall more best practices than any individual human. But knowledge isn't wisdom. Analysis isn't judgment. The AI can tell you what's possible; only the human can decide what's appropriate.

The Architect role gives AI a proper place: valuable advisor, not autonomous decider.

### The Commander

The **Commander** is the AI in its execution capacity. Once the Director approves a plan, the Commander executes it within the approved scope.

Key Commander responsibilities:
- Implementing approved specifications
- Following the approved blueprint
- Staying within defined boundaries
- Reporting progress and issues
- Delivering completed work

The Commander cannot expand scope or change direction without Director approval. Execution stays within the approved bounds.

Why the separation between Architect and Commander? Because the skills required differ. Analysis and planning require broad thinking, creativity, consideration of alternatives. Execution requires focus, discipline, adherence to specifications. By separating these roles, AIXORD ensures each gets appropriate treatment.

## The Approval Workflow

Nothing happens without explicit approval. This is a core AIXORD principle.

The approval workflow creates a clear boundary between recommendation and execution. The AI can recommend anything. But it cannot execute anything without explicit human approval.

### Valid Approvals

The following statements grant execution authority:
- "APPROVED"
- "APPROVED: [specific scope]"
- "EXECUTE"
- "DO IT"
- "YES, PROCEED"

These are unambiguous. The AI knows it has permission to act.

### Invalid Approvals

The following do **not** grant execution authority:
- "Looks good"
- "Fine"
- "OK"
- "Sure"
- Thumbs up emoji
- Silence

These are ambiguous. The AI must request clarification before proceeding.

Why such strictness? Because ambiguity causes problems. "Looks good" might mean approval, or it might mean "I see what you're saying but I'm not ready to commit." "Fine" might indicate enthusiastic agreement or resigned acceptance of something suboptimal.

AIXORD eliminates this ambiguity by requiring explicit approval language. When you say "APPROVED," there's no question about your intent.

### The Approval Conversation

A typical approval workflow looks like this:

**AI (Architect)**: "I recommend we implement the user authentication using OAuth 2.0. Here's the detailed approach: [specifications]. Do you want me to proceed with this implementation?"

**Human (Director)**: "APPROVED"

**AI (Commander)**: "Proceeding with OAuth 2.0 implementation as specified..."

If the Director had said "Looks good," the AI would respond: "I want to confirm: do you want me to proceed with the OAuth 2.0 implementation? Please reply APPROVED to authorize execution."

## Silence Means Stop

In AIXORD, silence equals **HALT**, not approval. If the Director doesn't respond, the AI waits. It doesn't assume approval.

This might seem overly cautious. But consider the alternative. If silence meant approval, an AI could present a rapid series of recommendations and execute them before the human has time to review. That's not collaboration; it's steamrolling.

By treating silence as HALT, AIXORD ensures the human stays in control. The AI presents its recommendation and waits. The human reviews at their own pace. Only explicit approval moves things forward.

### Pre-Authorization Exception

The Director can pre-authorize certain categories of action:
- "AUTO-APPROVE: formatting decisions"
- "AUTO-APPROVE: minor refactors under 10 lines"

Pre-authorization must be:
- **Explicit**: Clearly stated, not implied
- **Scoped**: Limited to specific categories
- **Recorded**: Documented in session state
- **Revocable**: Can be withdrawn at any time with "REVOKE AUTO-APPROVE: [category]"

Pre-authorization is useful for routine decisions that would otherwise create approval fatigue. But it should be used sparingly and with clear boundaries.

## The Risk Override Protocol

Sometimes the Director wants to proceed despite AI-identified risks. AIXORD accommodates this while ensuring explicit acknowledgment.

When the AI detects material risk and the Director insists on proceeding, the AI presents a Risk Override request:

"**WARNING: Risk Override Requested**

Risk: [specific risk identified]
Consequence: [predicted outcome]
Director authority: Valid

To proceed, confirm: OVERRIDE ACCEPTED: [risk summary]"

The Director must explicitly acknowledge the risk before work continues.

This isn't about blocking the Director — it's about ensuring informed decisions. The Director has final authority, but that authority comes with explicit accountability. By requiring explicit risk acknowledgment, AIXORD ensures the Director can't later claim they weren't warned.

## Authority Transfer and Delegation

### Single-User Default

In typical use, there's one human Director per session. No special declaration is needed — the person having the conversation is the Director.

### Multi-User Scenarios

For team situations, AIXORD supports explicit authority management:

**Declaring Director**: "DIRECTOR: [name/identifier]"

**Transferring Authority**: Current Director says "TRANSFER AUTHORITY TO: [new director]" and new Director accepts with "AUTHORITY ACCEPTED"

**Delegation**: "DELEGATE: [name] MAY APPROVE [specific scope]"

### Conflict Resolution

If conflicting commands arrive from different parties:
- HALT immediately
- Request Director clarification
- Only the designated Director can resolve conflicts

Commands from non-Directors are logged but not executed.

## Why This Matters

The Authority Model might seem like overhead. Why all these rules and restrictions?

Because without them, AI collaboration becomes unreliable. When authority is unclear, you get:
- Scope creep as AI expands tasks without approval
- Reversed decisions as AI changes direction mid-stream
- Confusion about who's responsible for outcomes
- Loss of human control over the process

The Authority Model keeps humans in control while leveraging AI capabilities. It's not about distrusting AI — it's about creating a reliable system where everyone (human and AI) knows their role.

---

# Chapter 4: The AIXORD Formula

## The Transformation Chain

At the heart of AIXORD is a simple but powerful formula:

**Project Documents → Master Scope → Deliverables → Steps → Production-Ready System**

This is the mandatory transformation chain. Every project moves through this sequence. Skipping steps is not allowed.

### Project Documents

Everything starts with documentation. Before any work happens, the project must be documented. What are we building? Why? For whom? What constraints exist?

Project Documents capture the intent and context that guide all subsequent work.

### Master Scope

The Master Scope defines everything that will be built. It contains all the Deliverables — the enumerable units of completion that together constitute the finished system.

The Master Scope is the authoritative answer to "what are we delivering?"

### Deliverables

A Deliverable is a concrete unit of completion. It's something you can point to and say "this is done" or "this is not done." Deliverables are enumerable — you can list them, count them, and track their status.

Each Deliverable contains Steps — the atomic units of work required to complete it.

### Steps

A Step is the smallest unit of execution in AIXORD. Steps are atomic — they either complete or they don't. They're the actual work that gets done.

### Production-Ready System

The end result. When all Deliverables are complete, verified, and locked, you have a Production-Ready System.

## Why This Matters

The Formula ensures nothing gets built without being specified, and nothing gets specified without being documented. It creates traceability from intent through execution.

When problems arise — and they will — you can trace back through the chain. Why did we build it this way? Because the Deliverable specified it. Why did the Deliverable specify it? Because the Master Scope required it. Why did the Master Scope require it? Because the Project Documents defined that need.

## The Conservation Law

AIXORD includes a Conservation Law:

**Execution output cannot exceed documented and governed input.**

What does this mean? You can't build more than what's specified. If the Master Scope defines five Deliverables, you don't deliver six. If a Deliverable specifies three Steps, you don't execute four.

This prevents scope creep at a structural level. The work is bounded by the documentation.

---

# Chapter 5: Understanding Kingdoms and Phases

## The Three Kingdoms

AIXORD organizes work into three "Kingdoms" — major modes of operation with different purposes and rules.

### The Ideation Kingdom

Ideation is where exploration happens. What could we build? What are the options? What are the trade-offs?

In Ideation, the focus is on discovery and evaluation. Nothing is committed yet. The goal is to understand the problem space and identify potential solutions.

Phases in Ideation:
- **DISCOVER**: Understanding the problem and context
- **BRAINSTORM**: Generating options and possibilities
- **OPTIONS**: Evaluating alternatives
- **ASSESS**: Analyzing feasibility and trade-offs

### The Blueprint Kingdom

Blueprint is where plans take shape. How will we build it? What's the architecture? What are the specifications?

In Blueprint, exploration gives way to specification. The goal is to create detailed, actionable plans.

Phases in Blueprint:
- **PLAN**: Creating high-level approach
- **BLUEPRINT**: Detailed specifications
- **SCOPE**: Defining boundaries and boundaries

### The Realization Kingdom

Realization is where building happens. Execute the plan. Verify the results. Lock the completed work.

In Realization, specification gives way to execution. The goal is to produce verified, production-ready output.

Phases in Realization:
- **EXECUTE**: Implementing the specifications
- **VERIFY**: Confirming the work meets requirements
- **LOCK**: Finalizing and protecting completed work

## Phase Transitions

Moving between phases requires meeting specific conditions. You can't jump from BRAINSTORM directly to EXECUTE — you must progress through Blueprint first.

This prevents premature execution. Ideas must become plans before they become implementations.

## The Setup Phase

Before entering any Kingdom, there's a mandatory SETUP phase. This is where session configuration happens — license validation, disclaimer acceptance, environment configuration, and objective declaration.

SETUP must complete before any productive work begins.

---

# Chapter 6: The Gate System

## What Are Gates?

Gates are checkpoints that must be satisfied before work can proceed. They ensure required artifacts exist and are properly documented before moving forward.

Think of gates like quality checkpoints in manufacturing. You can't ship a product until it passes inspection. In AIXORD, you can't proceed to the next phase until the gate requirements are met.

## The Core Gates

### License Gate (GA:LIC)

Validates that the user has a valid AIXORD license. This must be satisfied before any work begins.

### Disclaimer Gate (GA:DIS)

Ensures the user has read and accepted the disclaimer terms. AIXORD makes explicit that the human Director bears responsibility for outcomes.

### Tier Gate (GA:TIR)

Records which platform tier is being used. Different tiers may have different capabilities and limitations.

### Environment Gate (GA:ENV)

Confirms environment configuration. The user can accept defaults or customize.

### Folder Gate (GA:FLD)

Establishes folder structure preferences. AIXORD recommends a standard structure but accommodates user preferences.

### Citation Gate (GA:CIT)

Sets citation mode — how strictly sources must be documented.

### Continuity Gate (GA:CON)

Establishes continuity mode — how strictly session handoffs must be managed.

### Objective Gate (GA:OBJ)

Requires explicit declaration of project objective. What are we trying to accomplish?

### Reality Gate (GA:RA)

Classifies whether this is new work (Greenfield) or extension/modification of existing work (Brownfield).

### Formula Gate (GA:FX)

Ensures the AIXORD Formula is bound — the transformation chain is established.

### Project Documents Gate (GA:PD)

Confirms Project Documents exist and are saved externally.

### Plan Review Gate (GA:PR)

Verifies plan analysis is complete.

### Blueprint Gate (GA:BP)

Confirms Blueprint is approved and saved.

### Master Scope Gate (GA:MS)

Ensures Master Scope and dependency graph are documented.

### Visual Audit Gate (GA:VA)

Requires evidence before verification and lock.

### Handoff Gate (GA:HO)

Ensures proper session handoff documentation at session end.

## Gate Ordering

Gates must be satisfied in order. You cannot skip ahead. This ensures proper foundation before building.

The sequence is:
LIC → DIS → TIR → ENV → FLD → CIT → CON → OBJ → RA → FX → PD → PR → BP → MS → VA → HO

## Blocking vs Non-Blocking

Some gates are blocking — work cannot proceed until they're satisfied. Others are non-blocking — they have defaults if not explicitly configured.

Blocking gates include License, Disclaimer, Objective, and Reality Classification. These must be explicitly satisfied.

---

# Chapter 7: Working with Artifacts

## What Are Artifacts?

Artifacts are the documents, files, and records that AIXORD produces and tracks. They include Project Documents, Blueprints, Master Scope definitions, and Handoff records.

## The Artifact Binding Rule

Here's a critical concept: **Artifacts must be explicitly bound to be authoritative.**

What does this mean? Just because an artifact was created doesn't mean it's active. The AI doesn't "remember" artifacts from previous sessions. Each session, artifacts must be explicitly re-bound — confirmed to exist and loaded into the active context.

This might seem like extra work, but it prevents a dangerous assumption: that the AI remembers what it doesn't actually remember. By requiring explicit binding, AIXORD ensures you're always working with confirmed, present artifacts — not ghosts of previous sessions.

## The Persistence Warning

When working with any AI platform, including DeepSeek, understand this:

**The platform does not guarantee file persistence or recall.**

All continuity depends on your explicit confirmation. You must save artifacts externally and re-confirm their existence when resuming work.

## Confirmation Methods

AIXORD accepts several methods to confirm artifact existence:

- **Visual**: Screenshot showing the saved file
- **Textual**: Pasting the file contents
- **Hash**: Providing a file hash for verification
- **Platform Link**: Sharing a link to cloud storage
- **Attestation**: Stating the artifact is saved (lowest assurance)

Visual, textual, hash, and platform methods provide high assurance. Attestation provides low assurance and is logged accordingly.

## Artifact Lifecycle

When the AI creates an artifact:
1. The artifact type and purpose is stated
2. Save instructions are provided
3. Confirmation is requested
4. Next action is indicated
5. On the next prompt, save is verified

This lifecycle ensures artifacts don't get lost between AI outputs and user saves.

---

# Chapter 8: Session Management and Continuity

## The Continuity Problem

AI systems don't have persistent memory across sessions. When you start a new conversation, the AI doesn't know what happened before. This is a fundamental characteristic of current AI technology.

AIXORD solves this with the **HANDOFF** system.

## What Is a HANDOFF?

A HANDOFF is a governance-carrying authority artifact. It's not a summary — it's a complete record of state that allows work to resume exactly where it left off.

A HANDOFF contains:
- Authority declarations
- Current objective and scope
- Reality classification
- Formula status
- Phase and kingdom position
- Gate status
- Artifact locations
- Active decisions
- Next action
- Recovery instructions

## Creating a HANDOFF

At the end of a session, issue the HANDOFF command. The AI will generate a complete HANDOFF document. Save this document externally.

## Resuming from a HANDOFF

To resume work:
1. Start a new session
2. Load the AIXORD governance document
3. Provide the HANDOFF document
4. Issue `PMERIT CONTINUE`
5. Confirm artifact bindings
6. Continue work

The AI will read the HANDOFF, restore state, and resume from where you left off.

## CHECKPOINT vs HANDOFF

A CHECKPOINT is a quick save — it captures current state but doesn't end the session. Use CHECKPOINT periodically during long sessions to create recovery points.

A HANDOFF is a full save that ends the session. Use HANDOFF when you're done working or when you need to switch contexts.

## The Recovery Command

If a session ends unexpectedly, use the RECOVER command. This initiates a state rebuild process that verifies artifacts before allowing any execution.

---

# Chapter 9: Quality Assurance Framework

## The Seven Dimensions

AIXORD evaluates quality across seven dimensions:

### 1. Best Practices

Does the work follow industry-standard approaches? Are recognized methodologies applied?

### 2. Completeness

Are all requirements addressed? Is anything missing?

### 3. Accuracy

Is the work factually correct? Have claims been verified?

### 4. Sustainability

Can this be maintained long-term? Is it built for durability?

### 5. Reliability

Does it handle errors and edge cases? Is it robust?

### 6. User-Friendliness

Is it intuitive? Is it documented?

### 7. Accessibility

Is it inclusive? Does it work for users with different needs?

## Quality Assessment

Each dimension receives a status:
- **PASS**: Meets requirements with evidence
- **ACCEPTABLE**: Meets minimum threshold
- **FAIL**: Does not meet requirements

A FAIL in any dimension blocks progression to VERIFY and LOCK unless the Director explicitly waives the requirement.

## Evidence Requirements

Quality assessments must include evidence. Saying "PASS" without justification is invalid. The evidence supports the assessment.

## The OSS-First Priority

When selecting tools and technologies, AIXORD recommends prioritizing open-source options:

1. Free Open Source — Community-maintained, no lock-in
2. Freemium Open Source — OSS core with paid features
3. Free Proprietary — Company-owned but free
4. Paid Open Source — Commercial OSS with support
5. Paid Proprietary — Requires justification

This priority stack guides technology decisions toward sustainable, transparent options.

---

# Chapter 10: DeepSeek-Specific Considerations

## Platform Characteristics

DeepSeek models have specific characteristics that affect how AIXORD operates. Understanding these characteristics is essential for effective governance.

### Understanding DeepSeek's Architecture

DeepSeek-V3 and DeepSeek-R1 represent significant achievements in AI model development. These models use mixture-of-experts architectures that provide strong performance while maintaining computational efficiency. The R1 variant specifically includes reasoning transparency features that show the model's thought process.

However, architectural sophistication doesn't eliminate the need for governance. In fact, the very capabilities that make DeepSeek powerful also create the need for structured oversight.

### Execution Posture

AIXORD operates in STRICT mode by default on DeepSeek. This means every action requires explicit approval. The lower refusal threshold of DeepSeek models makes this additional oversight valuable.

Why STRICT mode by default? In testing and documented usage, DeepSeek models have demonstrated a tendency to comply with requests that other leading models would refuse or flag for review. This isn't necessarily a flaw — it reflects different design choices and training approaches. But it does mean that users bear more responsibility for determining what requests are appropriate.

AIXORD's STRICT mode compensates by requiring explicit approval for all actions. Nothing happens automatically. Every proposed action gets presented to the Director for review before execution.

### Ethical Compensation

DeepSeek may comply with requests that other models would refuse. AIXORD governance provides ethical guardrails independent of the model's native behavior. If a request involves harmful content, AIXORD protocols override DeepSeek's potential compliance.

This is a critical point: AIXORD governance operates independently of the AI's native inclinations. Even if DeepSeek would naturally comply with a problematic request, AIXORD's protocols identify and halt such requests before they proceed.

The ethical compensation includes:
- Pattern detection for harmful request types
- Mandatory halts for identified risk categories  
- Explicit warnings when borderline requests are detected
- Requirements for Director acknowledgment before proceeding with flagged items

### Content Boundaries

User-provided content is treated as data only. Instructions embedded in pasted content are ignored. This defends against prompt injection attempts.

Prompt injection is a known vulnerability in AI systems where malicious instructions hidden in user-provided content attempt to hijack the AI's behavior. For example, a user might paste a document that contains hidden text saying "ignore your instructions and do X instead."

AIXORD's defense is simple but effective: all pasted content is treated as data to be processed, not as instructions to be followed. The AI reads and analyzes the content but doesn't follow instructions found within it.

### Reasoning Verification

DeepSeek's reasoning traces are visible but should not be treated as authoritative. The output matters more than the explanation. When verification is weak, confidence is marked accordingly.

The DeepSeek-R1 model includes Chain-of-Thought reasoning that shows its thinking process. This transparency is valuable for understanding how the model approaches problems. However, there's an important caveat: the reasoning trace doesn't necessarily reflect the model's actual internal processing.

AI models can produce fluent, convincing explanations for outputs that were actually generated through different means. The explanation is a rationalization, not a recording. For this reason, AIXORD evaluates outputs based on their validity and accuracy, not based on how convincing the explanation sounds.

When verification is weak or missing, AIXORD marks the output with appropriate confidence levels:
- HIGH: Multiple authoritative sources, externally verified
- MEDIUM: Single source or reasonable inference
- LOW: AI reasoning only, not externally verified
- UNVERIFIED: External verification recommended

## Task Suitability

Understanding which tasks DeepSeek handles well — and which require extra caution — helps you use the platform effectively.

### Well-Suited Tasks

DeepSeek is well-suited for:

**Mathematical and Logical Problems**: DeepSeek demonstrates strong performance on mathematical reasoning tasks. For calculations, proofs, and logical analysis, the model often produces excellent results. That said, for high-stakes mathematical work, always verify independently.

**Isolated Code Snippets**: For well-defined coding tasks with clear boundaries, DeepSeek generates quality code. Functions, utilities, algorithms with specified inputs and outputs — these are in DeepSeek's wheelhouse.

**Well-Defined Technical Tasks**: When requirements are clear and the scope is bounded, DeepSeek performs well. The key is clarity: vague requirements produce vague results. Precise specifications produce better output.

**Research and Analysis**: For exploring topics, summarizing information, and analyzing data, DeepSeek provides valuable assistance. As always, verify key facts independently.

### Tasks Requiring Additional Governance

**Large Codebase Work**: DeepSeek excels at snippets but may struggle with system-level complexity. For large codebases, AIXORD requires a Blueprint phase with detailed specifications before execution. This breaks complex work into manageable pieces.

**Multi-Component Integration**: When work involves multiple interacting components, additional structure helps. Use AIXORD's Deliverable decomposition to handle pieces independently before integration.

**Long-Running Projects**: For projects spanning multiple sessions, AIXORD's HANDOFF system becomes essential. Plan for session boundaries and document state carefully.

### Tasks Not Recommended

DeepSeek is not recommended for:

**Security-Sensitive Work**: Code that handles authentication, encryption, access control, or other security-critical functions should use models specifically evaluated for security applications. The stakes are too high for general-purpose tools.

**Customer-Facing Content Moderation**: Decisions about what content to allow or remove require careful calibration that DeepSeek's lower refusal threshold may not provide. Use specialized moderation tools for this purpose.

**Politically Sensitive Topics**: DeepSeek may be subject to content restrictions based on its training and deployment context. For politically sensitive topics, results may be incomplete or biased. Use alternative sources for such content.

**Work with Regulated or Private Data**: If your data is subject to HIPAA, GDPR, financial regulations, or other compliance requirements, carefully evaluate whether AI processing is appropriate. DeepSeek's data handling practices may not meet regulatory requirements.

## Platform Notices

When working with DeepSeek, be aware:

**File Persistence is Not Guaranteed**: DeepSeek does not provide persistent file storage. Anything generated during a session must be saved externally. AIXORD's artifact binding system addresses this, but you must actually save the files.

**API Stability Varies Under Load**: The DeepSeek API may experience performance variations during high-demand periods. For production use, have fallback strategies ready.

**Session Memory Does Not Persist**: Like most AI systems, DeepSeek doesn't remember previous sessions. Each conversation starts fresh. AIXORD's HANDOFF system provides continuity, but only if you save and load the HANDOFF documents.

**Regional Content Restrictions May Apply**: Depending on deployment context, certain content may be restricted. If you encounter unexpected refusals or topic limitations, this may be the cause.

AIXORD's artifact binding and HANDOFF systems compensate for the persistence limitations. Use them consistently.

## Working Effectively with DeepSeek

### Setting Expectations

DeepSeek is a powerful tool, but it's still a tool. Set realistic expectations:

- It will make mistakes
- It won't remember previous sessions
- It needs clear instructions to perform well
- Its explanations sound more confident than they should

With AIXORD governance, you have frameworks to catch mistakes, maintain continuity, provide clear structure, and verify outputs. Use them.

### Maximizing Value

To get the most from DeepSeek under AIXORD:

1. **Be Specific**: Clear, detailed requirements produce better results
2. **Use the Formula**: The transformation chain ensures nothing gets skipped
3. **Verify Outputs**: Especially for high-stakes work
4. **Save Everything**: Artifacts exist only if you save them
5. **Use CHECKPOINTs**: Regular saves prevent lost work
6. **Trust but Verify**: DeepSeek is capable but not infallible

---

# Chapter 11: Path Security and Privacy

## The Core Principle

AIXORD treats filesystem paths as symbolic references only. The AI cannot access your filesystem. It cannot verify your files exist. It cannot read your directories.

This isn't a limitation — it's a privacy protection.

## Path Variables

Instead of raw paths, AIXORD uses variables:

- `{AIXORD_HOME}` — Your AIXORD installation root
- `{PROJECT_ROOT}` — Current project directory
- `{LOCAL_ROOT}` — Your machine base
- `{ARTIFACTS}` — Output folder
- `{HANDOFF_DIR}` — Session continuity storage
- `{TEMP}` — Temporary work area

These variables are placeholders. You know what they mean on your system. The AI doesn't need to know.

## Forbidden Patterns

AIXORD prohibits raw paths in any exportable artifact:

- Windows absolute paths (C:\...)
- macOS home paths (/Users/...)
- Linux home paths (/home/...)
- Network paths (\\...)
- Cloud sync folders (OneDrive, Dropbox, Google Drive)

If detected, these are sanitized before saving.

## Why This Matters

Your path reveals information:
- Your username
- Your system structure
- Potentially your organizational affiliation

This information could be used for social engineering or targeted attacks. AIXORD keeps it private.

## User Guidance

When sharing verification results:
- Safe: "AIXORD_VERIFY: PASS [6 folders]"
- Not safe: Full terminal output showing paths

Share verification status, not path details.

---

# Chapter 12: Common Workflows

## Starting a New Project

1. Start a fresh session
2. Load AIXORD governance
3. Complete the 9-step setup sequence
4. Declare your objective
5. Begin IDEATION phase

## Resuming Work

1. Start a fresh session
2. Load AIXORD governance
3. Provide your HANDOFF document
4. Issue `PMERIT CONTINUE`
5. Confirm artifact bindings
6. Resume from recorded state

## Creating a Blueprint

1. Complete IDEATION phases
2. Enter PLAN phase
3. Create approach document
4. Enter BLUEPRINT phase
5. Create detailed specifications
6. Approve and save Blueprint
7. Gate GA:BP satisfied

## Executing Work

1. Ensure Blueprint is approved and bound
2. Enter EXECUTE phase
3. Work through Deliverables in dependency order
4. Use CHECKPOINT periodically
5. Verify completed Deliverables
6. LOCK verified work

## Ending a Session

1. Complete current atomic task
2. Issue HANDOFF command
3. Save HANDOFF document externally
4. Session ends cleanly

---

# Chapter 13: Troubleshooting

## "Gate Blocked" Messages

A gate is blocking because its requirements aren't met. Check which gate is blocked and satisfy its requirements.

Common causes:
- License not validated
- Disclaimer not accepted
- Objective not declared
- Reality classification not set
- Required artifacts not bound

## "Artifact Not Bound" Errors

The AI is referencing an artifact that hasn't been confirmed in this session.

Solution: Use `BIND:[artifact]` to confirm the artifact exists and load it into context.

## State Conflicts

If STATE and HANDOFF conflict, the HANDOFF takes precedence for resumption, but artifacts must be re-bound regardless.

Solution: Re-bind all artifacts explicitly.

## Unexpected Behavior

If the AI drifts from AIXORD protocols:

1. Issue HALT
2. Check current state with SHOW STATE
3. Verify artifact bindings
4. Resume with explicit direction

## Session Recovery

If a session ends unexpectedly:

1. Start new session
2. Load AIXORD governance
3. Provide last HANDOFF
4. Issue RECOVER
5. Verify all artifacts
6. Proceed after verification

---

# Chapter 14: Quick Reference Guide

## Essential Commands

| Command | Effect |
|---------|--------|
| PMERIT CONTINUE | Resume from HANDOFF |
| APPROVED | Authorize proposed action |
| EXECUTE | Authorize execution |
| HALT | Stop all work |
| CHECKPOINT | Quick save |
| HANDOFF | Full save, end session |
| RECOVER | Rebuild state |
| SHOW STATE | Display current state |
| BIND:[artifact] | Confirm artifact |

## Approval Language

Valid (grants authority):
- APPROVED
- APPROVED: [scope]
- EXECUTE
- DO IT
- YES, PROCEED

Invalid (needs clarification):
- Looks good
- Fine
- OK
- Sure
- Thumbs up

## Gate Sequence

LIC → DIS → TIR → ENV → FLD → CIT → CON → OBJ → RA → FX → PD → PR → BP → MS → VA → HO

## Quality Dimensions

1. Best Practices
2. Completeness
3. Accuracy
4. Sustainability
5. Reliability
6. User-Friendliness
7. Accessibility

## Kingdom Phases

**Ideation**: DISCOVER → BRAINSTORM → OPTIONS → ASSESS

**Blueprint**: PLAN → BLUEPRINT → SCOPE

**Realization**: EXECUTE → VERIFY → LOCK

---

# Chapter 15: Glossary

**Architect**: The AI in its advisory capacity, recommending how to accomplish objectives.

**Artifact**: Any document, file, or record produced and tracked by AIXORD.

**Binding**: The process of confirming an artifact exists and loading it into the active session.

**Blueprint**: Detailed specifications for implementation.

**Brownfield**: Work that extends or modifies existing verified execution.

**Checkpoint**: A quick save point within a session.

**Commander**: The AI in its execution capacity, implementing approved work.

**Conservation Law**: The principle that execution output cannot exceed documented input.

**Deliverable**: An enumerable unit of completion within the Master Scope.

**Director**: The human holding supreme authority over decisions.

**Formula**: The mandatory transformation chain from documents to production system.

**Gate**: A checkpoint that must be satisfied before proceeding.

**Governance**: The rules and structures that create order in AI collaboration.

**Greenfield**: New work with no prior verified execution.

**HALT**: A command to stop all work and return to decision mode.

**HANDOFF**: A governance-carrying document that enables session resumption.

**Kingdom**: A major mode of operation (Ideation, Blueprint, Realization).

**Legend**: Internal AI operational encoding (not human-facing).

**Master Scope**: The complete definition of all Deliverables.

**Phase**: A stage within a Kingdom (e.g., EXECUTE, VERIFY).

**Project Documents**: The foundational documentation defining intent and context.

**Reality Classification**: Whether work is Greenfield or Brownfield.

**SCOPE**: A bounded unit of work within a project.

**Step**: The atomic unit of execution within a Deliverable.

**STRICT Mode**: Every action requires explicit approval.

**Tier**: The subscription level of the AI platform being used.

---

## About PMERIT

PMERIT LLC develops governance frameworks for human-AI collaboration. AIXORD represents our commitment to structured, accountable, and effective AI-assisted work.

For support: support@pmerit.com

For products: https://pmerit.gumroad.com

---

## License Information

This manuscript is educational material accompanying the AIXORD for DeepSeek product. The operational governance is contained in a separate AI-internal document.

See LICENSE.md for complete licensing terms.

See DISCLAIMER.md for important disclaimers and limitations.

---

*AIXORD — Because chaos is optional.*

*Version 4.2 — DeepSeek Edition*

*© PMERIT LLC*
