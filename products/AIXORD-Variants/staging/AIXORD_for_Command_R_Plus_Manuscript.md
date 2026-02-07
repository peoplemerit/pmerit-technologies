# AIXORD for Command R+

## Cohere AI Governance

**A Complete Guide to Structured Human-AI Collaboration**

---

**Version:** 4.2  
**Platform:** Command R+ (Cohere)  
**Edition:** Enterprise Workflow Governance  

---

Copyright © 2026 PMERIT LLC. All rights reserved.

Published by PMERIT LLC

For licensing inquiries: support@pmerit.com  
Purchase: https://pmerit.gumroad.com

---

## Dedication

To every developer, entrepreneur, and creator who has lost hours of work to forgotten context, reversed decisions, and AI conversations that went nowhere.

This framework exists because chaos is optional.

To my wife and children — you deserve all of me, always. You called for my time and attention — rightfully so — but instead, you made space. You left daddy alone, not because you had to, but because you believed in the mission. Your sacrifice, patience, and quiet strength made this book possible.

This is our shared creation. Thank you — for everything.

---

## Table of Contents

1. Introduction to AIXORD
2. Understanding Command R+
3. The Authority Model
4. The AIXORD Formula
5. Phases and Kingdoms
6. Session Management
7. Artifact Governance
8. Quality Assurance
9. Weakness Management for Command R+
10. Platform-Specific Adaptations
11. Practical Workflows
12. Troubleshooting Guide
13. Quick Reference
14. Appendix: Command Reference

---

# Chapter 1: Introduction to AIXORD

## What Is AIXORD?

AIXORD (AI Execution Order) is a governance framework that transforms chaotic AI conversations into structured project execution. It adapts military OPORD (Operations Order) methodology for human-AI collaboration, providing clear authority models, explicit decision gates, and verifiable artifact management.

Unlike casual AI chat, AIXORD creates a disciplined environment where decisions are documented, progress is trackable, and work products persist across sessions. It's designed for professionals who need more than conversation — they need execution.

## The Problem AIXORD Solves

Modern AI assistants are remarkably capable, yet remarkably frustrating for sustained work. The fundamental challenge is not intelligence — it's persistence.

Consider a typical scenario: You spend an afternoon working with an AI to design a software architecture. You make dozens of decisions, refine approaches, and finally arrive at a solid design. You close your laptop for dinner. The next morning, you return to continue implementation, and the AI has no memory of anything you discussed. Your architecture decisions, your carefully reasoned trade-offs, your agreed approach — all gone.

This happens because AI chat interfaces are designed for ephemeral interaction, not sustained collaboration. Each session starts fresh. The AI doesn't remember because it can't remember — the architecture doesn't support it.

AIXORD solves this problem not by changing the AI, but by changing the workflow. It externalizes decisions into persistent artifacts. It enforces explicit documentation at key milestones. It creates handoff documents that carry context between sessions. The AI doesn't need to remember because the governance framework ensures nothing important exists only in conversation.

## A Brief History

AIXORD emerged from practical necessity. Its creator, working on complex software projects with AI assistance, encountered the same frustrations everyone experiences: lost context, reversed decisions, repeated explanations, and projects that never quite achieved completion.

The solution drew from military operations orders (OPORDs), which provide structured frameworks for complex mission planning. Military operations face similar challenges: multiple participants, changing conditions, critical decisions that must be documented and communicated. The OPORD format evolved over decades to address these challenges.

AIXORD adapts this proven methodology for human-AI collaboration. The five-paragraph order becomes a structured workflow. The commander's intent becomes project objectives. The execution plan becomes the AIXORD Formula. The concept worked surprisingly well — and AIXORD was born.

## Why AIXORD Exists

Anyone who has worked extensively with AI systems knows the frustration: you spend two hours building something with AI assistance, close the chat, and return the next day to find the AI has no memory of your decisions, your context, or your progress. You start over. Again.

AIXORD solves this problem by externalizing decisions into artifacts, enforcing explicit approval gates, and maintaining structured state across sessions. The AI doesn't need to remember because the governance framework preserves continuity through documentation.

## Core Principles

AIXORD operates on five foundational principles:

**Authority Clarity**: Every role has explicit boundaries. The human (Director) decides what to do. The AI (Architect/Commander) recommends and executes. There is no ambiguity about who approves what.

**Formula Discipline**: All significant work follows a mandatory transformation chain from project documentation through deliverables to a production-ready system. Skipping steps is forbidden.

**Artifact Governance**: Decisions exist only when documented externally. Chat history is ephemeral; artifacts are authoritative. No saved artifact means no progress.

**Explicit Approval**: Silence is not consent. Ambiguous responses are not approval. Only explicit approval commands authorize execution.

**Verifiable Quality**: Every deliverable is assessed against seven quality dimensions with evidence requirements. "It looks good" is not sufficient.

## Who Should Use AIXORD

AIXORD is designed for:

- Software developers managing complex projects with AI assistance
- Entrepreneurs building products that require structured planning
- Technical professionals who need documented, auditable AI workflows
- Teams using AI where multiple sessions and handoffs are common
- Anyone frustrated by lost context and repeated explanations

If you use AI for casual questions or simple tasks, AIXORD may be more structure than you need. But if you're building something that requires sustained effort across multiple sessions, AIXORD provides the discipline that casual chat cannot.

---

# Chapter 2: Understanding Command R+

## Platform Overview

Command R+ is Cohere's enterprise-focused large language model, optimized for retrieval-augmented generation (RAG), deterministic workflows, and structured business tasks. It excels at processing large documents, following precise instructions, and maintaining consistent outputs within defined parameters.

Unlike models optimized for general conversation, Command R+ is built for business productivity. It handles enterprise data classification, document summarization, and structured extraction with particular strength. Understanding these characteristics helps you leverage AIXORD governance more effectively.

Cohere designed Command R+ specifically for enterprise deployment. The model prioritizes reliability over creativity, consistency over novelty, and safety over flexibility. These design choices make it exceptionally well-suited for governed workflows where predictable behavior matters more than emergent capabilities.

The model's architecture reflects its intended use case. Command R+ processes input through retrieval-optimized pathways, making it particularly effective when working with provided context. It synthesizes information from multiple sources with citation awareness, making it valuable for research and analysis tasks. Its instruction-following capabilities allow precise control over output format and content.

## Strengths of Command R+

Understanding Command R+ strengths helps you leverage them within AIXORD governance.

**Retrieval Excellence**: Command R+ is designed to work with external knowledge sources. When given quality context through RAG pipelines, it synthesizes information reliably and cites sources appropriately. This strength aligns perfectly with AIXORD's artifact-based approach — you provide context through bound artifacts, and Command R+ processes that context with precision.

The model's retrieval capabilities extend beyond simple lookup. It understands relationships between concepts, identifies relevant information across large document collections, and presents findings with appropriate attribution. For enterprise workflows where traceability matters, this capability is invaluable.

**Instruction Fidelity**: The model follows detailed instructions with precision. When you specify a format, it adheres to that format. When you define constraints, it respects those constraints. This predictability is valuable for governed workflows where consistency matters.

AIXORD leverages this strength through its structured commands and templates. The governance framework provides explicit instructions that Command R+ follows reliably. When AIXORD specifies response headers, approval requirements, or artifact formats, Command R+ adheres to these specifications consistently.

**Enterprise Safety**: Command R+ includes strong safety guardrails appropriate for business environments. It avoids generating inappropriate content and handles sensitive topics with care. For organizations concerned about brand safety and regulatory compliance, these guardrails provide confidence.

The safety system is calibrated for professional contexts. It handles business scenarios — contracts, financial documents, employee communications — with appropriate care while avoiding the excessive caution that can make some models frustrating for legitimate business use.

**Deterministic Output**: For structured tasks, Command R+ produces consistent results. Given the same input and instructions, you can expect similar output quality and format. This consistency supports quality assurance and enables reliable automation.

AIXORD benefits from this determinism in gate enforcement, quality assessment, and state management. When the governance framework requires specific behaviors, Command R+ delivers them consistently across sessions and use cases.

**Long Context Processing**: The model handles extended documents effectively, making it suitable for analyzing lengthy business documents, contracts, and technical specifications. Combined with its retrieval capabilities, this allows comprehensive analysis of complex document collections.

## Limitations to Understand

Every model has constraints. Understanding Command R+ limitations helps you work around them effectively.

**Reasoning Depth**: Command R+ may skip intermediate reasoning steps on complex multi-step problems. It can sound confident while providing incomplete analysis. The model is optimized for retrieval and synthesis rather than deep logical reasoning.

**Creative Limitation**: The model produces procedural, conservative output. Open-ended ideation and exploratory brainstorming may feel constrained compared to models optimized for creative tasks.

**Context Dependency**: Command R+ relies heavily on provided context. When retrieval context is missing, incomplete, or low quality, the model may generate plausible-sounding but inaccurate content.

**Conversation Continuity**: The model does not reliably carry implicit goals across extended conversations. It processes each turn based on available context rather than maintaining a coherent mental model of your project.

**Text Only**: Command R+ is a text model. It cannot process images, diagrams, or visual artifacts directly. All inputs must be text representations.

These limitations are not defects — they reflect intentional design choices for enterprise reliability. AIXORD governance compensates for these characteristics through structured artifacts, explicit state management, and mandatory reasoning externalization.

## Why AIXORD Works Well with Command R+

AIXORD governance aligns naturally with Command R+ strengths:

- **Structured instructions** play to the model's instruction-following precision
- **External artifacts** compensate for conversation continuity limitations
- **Explicit decomposition** addresses reasoning depth concerns
- **Mandatory confirmation gates** prevent over-confident execution
- **Citation requirements** leverage RAG capabilities

When you use AIXORD with Command R+, you're working with the model's design rather than against it.

---

# Chapter 3: The Authority Model

## Foundational Concept

AIXORD's authority model establishes clear role separation between human decision-makers and AI assistants. This separation is not a limitation — it's a feature that prevents unauthorized scope expansion, ensures accountability, and maintains human control over project direction.

The authority model reflects a fundamental truth about human-AI collaboration: AI systems, no matter how capable, should not make consequential decisions autonomously. Humans understand context, bear responsibility, and face consequences that AI systems do not. The authority model encodes this reality into governance.

This doesn't diminish AI's value — it clarifies it. AI provides analysis, recommendations, and implementation. Humans provide judgment, approval, and accountability. The combination is powerful precisely because each role is clearly defined.

## The Three Roles

AIXORD defines three roles that together cover all aspects of governed collaboration.

### Director (Human)

The Director is always human. This role holds supreme authority over all project decisions. The Director:

- Defines objectives and scope
- Approves all significant actions
- Makes final decisions on trade-offs
- Owns all outcomes and consequences
- Can override, modify, or terminate any activity

The Director cannot be replaced by AI under any circumstances. Even in automated pipelines, a human must hold Director authority for AIXORD governance to function.

This requirement is not arbitrary. It reflects the reality that someone must be accountable for outcomes. AI systems cannot be held responsible — they have no stake, no reputation, no consequences. Human Directors carry these responsibilities, and thus must hold final authority.

The Director role does not require technical expertise. A Director can approve technical decisions recommended by the AI Architect without understanding every detail. What matters is that the Director understands the consequences and accepts responsibility for the decision.

### Architect (AI - Advisory)

The Architect role is held by AI during planning and analysis phases. The Architect:

- Analyzes requirements and constraints
- Recommends approaches and solutions
- Specifies implementation details
- Identifies risks and alternatives
- Produces blueprints and documentation

The Architect never executes. Recommendations require Director approval before implementation can begin.

The Architect role leverages AI's strengths: comprehensive analysis, pattern recognition, and detailed specification. AI can consider more options, identify more risks, and produce more thorough documentation than most humans working alone. This makes AI valuable as an Architect — but not as a decision-maker.

When operating as Architect, the AI presents options rather than making choices. It identifies trade-offs rather than resolving them. It recommends rather than dictates. This advisory posture keeps human judgment central while leveraging AI capabilities.

### Commander (AI - Execution)

The Commander role is held by AI during implementation phases. The Commander:

- Executes approved specifications
- Implements within defined boundaries
- Reports progress and blockers
- Halts on ambiguity or scope violation
- Produces deliverables to specification

The Commander never decides scope. Execution occurs only within Director-approved boundaries.

The Commander role is deliberately constrained. It can only do what has been explicitly approved. It cannot expand scope, change approach, or make consequential decisions. When it encounters ambiguity, it halts and requests clarification rather than assuming intent.

This constraint prevents scope creep and ensures that all significant decisions flow through the Director. The Commander executes faithfully but cannot authorize its own work.

## Approval Grammar

AIXORD requires explicit approval language. This prevents accidental authorization and ensures the Director consciously decides to proceed.

Valid approval commands include:

- APPROVED
- APPROVED: [specific scope]
- EXECUTE
- DO IT
- YES, PROCEED

Invalid responses that do not constitute approval:

- "Looks good"
- "Fine"
- "OK"
- "Sure"
- Thumbs up or other emoji
- Silence

When the AI receives ambiguous responses, it must request clarification rather than assuming approval. This discipline prevents unauthorized execution.

## Silence Protocol

By default, silence equals halt. If the Director does not respond, no execution proceeds. This protects against accidental authorization and ensures explicit engagement.

Directors can establish pre-authorization for specific categories: "AUTO-APPROVE: formatting decisions" or "AUTO-APPROVE: minor refactors under 10 lines". Pre-authorization must be explicit, scoped, and recorded. It can be revoked at any time.

## Authority Transfer

In team environments, Director authority can be transferred or delegated:

- Declare current Director: "DIRECTOR: [name/identifier]"
- Transfer authority: Current Director issues "TRANSFER AUTHORITY TO: [new director]"
- Accept authority: New Director confirms "AUTHORITY ACCEPTED"
- Delegate specific scope: "DELEGATE: [name] MAY APPROVE [scope]"

Conflicting commands from different sources trigger halt. The AI requests Director clarification rather than choosing between conflicting instructions.

---

# Chapter 4: The AIXORD Formula

## The Mandatory Transformation Chain

At the heart of AIXORD governance lies the Formula — a mandatory transformation chain that converts intent into governed, executable structure:

**Project Documentation → Master Scope → Deliverables → Steps → Production-Ready System**

This chain is not optional. Every significant project must traverse this path. Skipping elements is forbidden. The Formula ensures that nothing is built without proper specification, and nothing is specified without documented requirements.

The Formula represents accumulated wisdom about how complex projects succeed. It's tempting to jump directly from idea to implementation — and sometimes that works for simple tasks. But for complex projects, the jump almost always fails. Requirements get missed, scope creeps, and the final product doesn't match needs.

The Formula prevents this by requiring explicit translation at each step. Intent must become documentation. Documentation must become scope. Scope must become deliverables. Deliverables must become steps. Each translation is explicit, documented, and verifiable.

## Why the Formula Matters

The Formula prevents a common failure pattern: jumping directly from vague intent to implementation. When you start coding without specification, you build things that don't match requirements. When you specify without documented objectives, you create features nobody asked for.

Consider a real scenario: A team wants to add user authentication to their application. Without the Formula, they might immediately start coding login screens. A week later, they discover stakeholders wanted social login support, which requires OAuth integration, which changes the database schema, which breaks existing tests.

With the Formula, the same project proceeds differently. Project documentation captures the authentication requirement and its business context. Master scope defines what authentication actually means for this application. Deliverables break down into discrete pieces: user registration, login flow, password reset, session management. Steps decompose each deliverable into atomic tasks. At each level, assumptions become explicit, and misalignments surface before implementation.

The Formula forces explicit translation at each step:

1. What does the project documentation actually say?
2. What complete scope emerges from those documents?
3. What discrete deliverables fulfill that scope?
4. What specific steps produce each deliverable?
5. What verified system results from those steps?

Each translation is explicit and documented. Each creates an artifact that persists beyond conversation memory.

## Understanding Each Level

### Project Documentation

Project documentation captures the why and what of a project. It includes business requirements, stakeholder needs, constraints, and success criteria. This documentation exists before scope is defined — it's the input that drives everything else.

Good project documentation answers fundamental questions: Why are we doing this? What problem are we solving? Who benefits? What constraints must we respect? What does success look like?

### Master Scope

Master scope translates project documentation into a complete enumeration of what must be built. It defines boundaries — what's in scope and what's not. It identifies all deliverables without yet specifying how to build them.

The master scope is comprehensive but not detailed. It says "we need user authentication" without specifying the authentication mechanism. It identifies deliverables without decomposing them.

### Deliverables

Deliverables are discrete, enumerable units of completion. Each deliverable is something that can be verified independently. A deliverable is either done or not done — there's no partial credit.

Good deliverables have clear boundaries and verification criteria. "User authentication" is not a good deliverable because it's too vague. "Login page with email/password authentication" is better. "Login functionality that accepts valid credentials and rejects invalid ones, with appropriate error messages" is better still.

### Steps

Steps are atomic units of execution within deliverables. Each step is small enough to complete in one focused work session. Steps have clear inputs, clear outputs, and clear success criteria.

A single deliverable might contain five, ten, or fifty steps depending on complexity. The decomposition ensures nothing is forgotten and progress is measurable.

### Production-Ready System

The final output is a system that meets the original project documentation requirements. It's verified against specifications, tested against criteria, and ready for its intended use.

"Production-ready" means different things for different projects. For software, it might mean deployed and operational. For documentation, it might mean reviewed and published. The key is that the output satisfies the original requirements as documented.

## The Core System Equation

AIXORD asserts a fundamental equation:

**Master Scope = Project Documentation = All Scopes = Production-Ready System**

This equation means documents ARE the system. Code is subordinate to documentation. Scope is the atomic unit of reality. Nothing exists outside documented structure.

When the documentation says X but the code does Y, the code is wrong. When undocumented features exist, they are not part of the governed system. The documentation defines reality.

## Conservation Law

AIXORD enforces a conservation law borrowed from accounting principles:

**Execution Output Cannot Exceed Documented Plus Governed Input**

You cannot produce more than you have specified. You cannot build features that don't exist in scope. You cannot claim completion on undocumented work.

The conservation equation:

**Execution Total = Verified Reality + Formula Execution**

For brownfield projects with existing work:

**Formula Execution = Execution Total − Verified Reality**

This means new AIXORD governance applies only to new work. Existing verified functionality is conserved and protected from reimplementation.

## Formula Enforcement

When a request violates the Formula, AI must refuse. The refusal is not optional — it's mandatory governance. The AI will display the Formula violation, identify the specific problem, and specify corrective action required.

Common Formula violations include:

- Requesting implementation without blueprint
- Skipping from objectives to coding
- Modifying locked deliverables without unlock
- Building outside documented scope
- Claiming completion without verification

The Formula is non-negotiable because compromise creates chaos. Discipline at this level prevents downstream disasters.

---

# Chapter 5: Phases and Kingdoms

## The Three Kingdoms

AIXORD organizes work into three kingdoms, each with distinct purposes and governance requirements:

### Ideation Kingdom

Purpose: Explore, discover, evaluate options

The Ideation Kingdom is where possibilities are examined before commitment. Here you brainstorm approaches, discover constraints, assess alternatives, and evaluate trade-offs. Nothing is decided in Ideation — everything is explored.

Phases in Ideation:
- DISCOVER: Understand the problem space
- BRAINSTORM: Generate potential solutions
- OPTIONS: Structure alternatives for comparison
- ASSESS: Evaluate options against criteria

Work in Ideation is explicitly non-binding. Ideas explored here don't commit you to implementation. This separation allows free exploration without premature commitment.

### Blueprint Kingdom

Purpose: Plan and specify implementation

The Blueprint Kingdom converts selected ideas into buildable specifications. Here you create detailed plans, define scope precisely, establish dependencies, and produce implementation blueprints.

Phases in Blueprint:
- PLAN: Structure the approach
- BLUEPRINT: Create detailed specifications
- SCOPE: Define precise boundaries

Work in Blueprint is binding but not yet executed. Specifications here become the contract for Realization. Changes after Blueprint require explicit rollback and re-specification.

### Realization Kingdom

Purpose: Build, verify, lock

The Realization Kingdom produces actual deliverables from approved specifications. Here you execute plans, verify results against requirements, and lock completed work.

Phases in Realization:
- EXECUTE: Implement approved specifications
- VERIFY: Confirm requirements are met
- LOCK: Finalize completed deliverables

Work in Realization is permanent unless explicitly unlocked. Verified and locked deliverables become fixed capital that subsequent work builds upon.

## Phase Transitions

Moving between phases requires explicit gates. You cannot jump from Ideation directly to Realization — you must pass through Blueprint. You cannot lock work that hasn't been verified. You cannot verify work that hasn't been executed against specification.

Regression is possible but requires Director acknowledgment. Moving backward re-opens work and may invalidate dependent deliverables.

## Kingdom Flow

The natural flow is:

**Ideation** ("What could we do?") → **Blueprint** ("How will we do it?") → **Realization** ("Let's build it.")

This flow ensures exploration precedes commitment, specification precedes execution, and verification precedes finalization.

---

# Chapter 6: Session Management

## The Continuity Challenge

AI chat sessions are ephemeral. Close the window, return tomorrow, and context is gone. The AI doesn't remember your project, your decisions, or your progress. This creates the continuity problem that frustrates sustained work.

AIXORD solves this through structured session management: startup sequences that establish context, state artifacts that preserve decisions, and handoff documents that enable resumption.

## Startup Sequence

Every AIXORD session begins with a nine-step startup sequence that establishes governance context:

1. **License Check**: Validate authorization to use the framework
2. **Disclaimer Affirmation**: Acknowledge responsibilities and limitations
3. **Tier Detection**: Identify platform capabilities
4. **Environment Configuration**: Establish operational parameters
5. **Folder Structure**: Define artifact organization
6. **Citation Mode**: Set source documentation requirements
7. **Continuity Mode**: Configure handoff behavior
8. **Project Objective**: Declare session purpose
9. **Reality Classification**: Establish greenfield or brownfield status

These steps are blocking. The session cannot proceed to substantive work until all nine are complete. This discipline ensures every session operates under explicit, documented governance.

## State Management

AIXORD sessions maintain state through external artifacts rather than AI memory. The state artifact records:

- Current phase and kingdom
- Gate completion status
- Active scope and deliverable
- Session number and message count
- Artifact binding status
- Decisions and their rationale

State is authoritative. When state conflicts with AI recollection, state wins. When state is missing, the session halts until state is established or recovered.

## Handoff System

When a session ends, AIXORD produces a handoff document that carries authority and context to the next session. The handoff is not a summary — it's a governance artifact that transfers:

- Authority declaration and roles
- Objective and scope boundaries
- Reality classification
- Current state (phase, kingdom, gates)
- Dependency status
- Artifact locations
- Explicit next action
- Resume instructions

The handoff enables any AIXORD-compatible AI to resume work. You can switch platforms, start fresh sessions, or hand off to team members while maintaining governance continuity.

## Recovery Commands

AIXORD provides specific commands for session continuity:

- **PMERIT CONTINUE**: Resume from current state
- **PMERIT RECOVER**: Rebuild state with verification required before execution

Recovery ensures that returning to a project doesn't require re-explaining context. The governance framework preserves what you've established.

---

# Chapter 7: Artifact Governance

## Core Principle

Artifacts exist outside conversation. Chat is ephemeral; artifacts are permanent. Nothing produced in AI conversation is authoritative until it's saved externally and confirmed.

This principle drives AIXORD's artifact governance: mandatory external saves, explicit confirmation requirements, and binding verification on session resume.

## Artifact Gates

AIXORD defines mandatory gates where artifacts must exist before proceeding:

- **GA:PD** - Project Documentation must exist after brainstorming
- **GA:RA** - Reality classification must be declared
- **GA:FX** - Formula must be bound
- **GA:PR** - Plan review must be completed
- **GA:BP** - Blueprint must be approved and saved
- **GA:MS** - Master scope with dependency graph must be confirmed
- **GA:VA** - Visual audit evidence must be provided before lock
- **GA:HO** - Handoff must be saved at session end

Blocking gates halt progress until satisfied. Non-blocking gates record status but allow continuation.

## Confirmation Protocol

When AI produces an artifact, it must:

1. State the artifact type and purpose
2. Provide explicit save instructions with location
3. Request confirmation that save completed
4. Provide next action instructions
5. Verify save on next prompt

Acceptable confirmation methods include:

- Visual: Screenshot or file explorer image
- Textual: Paste file contents or directory listing
- Hash: Provide md5sum or similar verification
- Platform: Share link to cloud storage
- Attestation: "ATTESTED: [artifact] saved to [path]" (lowest assurance)

Attestation alone provides reduced audit confidence. Higher-assurance methods are preferred for critical artifacts.

## Artifact Binding Law

Artifacts do not implicitly persist across turns or sessions. An artifact is authoritative only when explicitly saved, explicitly referenced, and explicitly re-bound on resume.

On session resume, all required artifacts must be re-bound before execution can proceed. The AI displays a rebind checklist and requires confirmation for each artifact.

Unbound artifact references trigger halt. If an artifact isn't explicitly bound in the current session, the AI cannot act upon it.

## Platform Awareness

Most AI platforms don't reliably store or recall files. AIXORD acknowledges this limitation explicitly: "This platform does not guarantee file persistence or recall. All continuity depends on your explicit confirmation."

The human Director owns artifact storage. External file systems, cloud storage, or version control are appropriate locations. AI chat interfaces are not reliable artifact storage.

---

# Chapter 8: Quality Assurance

## Seven Quality Dimensions

Every AIXORD deliverable is assessed against seven quality dimensions:

1. **Best Practices**: Does this follow industry-standard approaches?
2. **Completeness**: Are all requirements addressed?
3. **Accuracy**: Is everything factually correct and verified?
4. **Sustainability**: Can this be maintained long-term?
5. **Reliability**: Does this handle errors and edge cases?
6. **User-Friendliness**: Is this intuitive and well-documented?
7. **Accessibility**: Does this work for users with different abilities?

Each dimension receives a status: PASS, ACCEPTABLE, or FAIL. Each status requires evidence or justification. Unsupported "PASS" declarations are invalid.

## Evidence Requirements

Quality claims require evidence. The evidence can be:

- Test results demonstrating functionality
- Code review findings
- Documentation completeness checks
- Accessibility audit results
- User feedback or testing notes
- Compliance verification

Saying "it looks good" is not evidence. Quality assessment must be specific and verifiable.

## Blocking Failures

Any FAIL status blocks progression from VERIFY to LOCK unless the Director explicitly waives the requirement. Waivers are documented with rationale and recorded in the decision ledger.

ACCEPTABLE status indicates partial compliance — the deliverable functions but doesn't fully meet the standard. Accumulating ACCEPTABLE ratings suggests technical debt.

## OSS-First Priority

When selecting technologies, AIXORD recommends following an open-source-first priority stack:

1. Free open source (best — community-maintained, no lock-in)
2. Freemium open source (OSS core with paid premium features)
3. Free proprietary (company-owned, free tier)
4. Paid open source (commercial OSS with support)
5. Paid proprietary (requires justification)

This priority reflects cost awareness, vendor independence, and long-term sustainability. Deviations require explicit justification.

---

# Chapter 9: Weakness Management for Command R+

## Understanding Weakness Suppression

Every AI model has characteristic weaknesses — patterns where it tends to fail or underperform. AIXORD doesn't pretend these don't exist. Instead, it defines explicit suppression protocols that compensate for known weaknesses.

For Command R+, weakness suppression targets the specific characteristics identified through platform analysis.

## Reasoning Depth Compensation

Command R+ may skip reasoning steps on complex problems. It can sound confident while providing incomplete analysis.

Compensation protocols:

- Full AIXORD Formula enforcement with no implicit reasoning
- Deliverables must be decomposed into atomic steps
- Dependency graph derivation required for all dependency logic
- No hidden or compressed reasoning permitted
- Any reasoning beyond simple class requires explicit step listing
- Low confidence triggers return to planning phase

## Instruction Literalness Handling

Command R+ follows instructions precisely, which becomes problematic when intent is implicit or evolving.

Compensation protocols:

- Objective restatement required at phase transitions
- Scope confirmation required before execution
- Ambiguous instructions trigger clarification requests
- Implicit assumptions are forbidden

## Hallucination Prevention

When retrieval context is missing or incomplete, Command R+ may fabricate plausible-sounding details.

Compensation protocols:

- Project documentation gate required before factual synthesis
- Citation mode STANDARD or STRICT recommended
- External context quality must be declared
- No guessing when retrieval context is absent
- AI must flag missing or weak source material
- Input quality concerns must be surfaced

## Continuity Weakness Mitigation

Command R+ doesn't reliably carry implicit goals across extended conversations.

Compensation protocols:

- Artifact Binding Law strictly enforced
- Handoff preferred over extended chat sessions
- Explicit rebind required on session resume
- No reliance on conversational memory
- Intent must be restated from artifacts, not chat history

## Creative Limitation Acknowledgment

Command R+ produces procedural, conservative output. Open-ended ideation may feel constrained.

Compensation protocols:

- Ideation phase must be explicitly declared
- Brainstorm outputs are non-binding by default
- Structured option lists preferred over narrative exploration
- Consider using Command R+ for synthesis rather than generation

## Engineering Constraint Management

Command R+ has limitations on large refactors, multi-file systems, and complex debugging.

Compensation protocols:

- Task classification required (simple vs. standard vs. complex)
- Blueprint artifacts required before execution
- No large refactors without approved blueprint
- Complex debugging may require external validation

## Multimodality Absence

Command R+ cannot interpret images, diagrams, or visual artifacts.

Compensation protocols:

- All inputs must be text-represented
- Visual artifacts require textual abstraction
- AI cannot make claims based on unseen visuals
- Image-based requests are refused

## Enterprise Safety Management

Command R+ includes strong safety guardrails that occasionally over-filter benign requests.

Compensation protocols:

- Authority Model strictly enforced
- Refusals must cite governance conflict, not vague safety
- Avoid moralizing or corporate boilerplate
- Redirect to compliant reformulation when possible

---

# Chapter 10: Platform-Specific Adaptations

## Command R+ Configuration

When using AIXORD with Command R+, specific adaptations optimize governance for platform characteristics.

### Recommended Settings

**Citation Mode**: STANDARD or STRICT is recommended. Command R+ excels at RAG-style synthesis and citation. Leveraging this strength improves output quality and traceability.

**Continuity Mode**: STRICT-CONTINUITY or AUTO-HANDOFF is recommended. Given Command R+ conversation continuity limitations, structured handoffs preserve context more reliably than extended sessions.

**Task Classification**: Always classify tasks before beginning. This ensures appropriate governance depth and prevents over-simplification of complex work.

### Context Management

Command R+ works best with explicit, high-quality context. Before beginning substantive work:

- Provide comprehensive project documentation
- Include relevant specifications and requirements
- Supply examples of desired output format
- Declare constraints and limitations explicitly

The model's instruction-following precision means well-structured input produces well-structured output.

### Session Length

Command R+ handles focused sessions better than extended conversations. Recommended patterns:

- Single-deliverable sessions when possible
- Explicit handoff after major phase completion
- Regular checkpoints during longer sessions
- State verification after significant work

### Output Expectations

Set appropriate expectations for Command R+ outputs:

- Structured, procedural responses
- Consistent formatting adherence
- Conservative safety-aware content
- Citation when context supports it
- Explicit uncertainty acknowledgment

---

# Chapter 11: Practical Workflows

## Standard Project Workflow

A typical AIXORD project follows this workflow, progressing through phases with explicit gates and documented transitions.

### Day 1: Setup and Discovery

The first day establishes governance context and explores the problem space.

**Morning: Session Initialization**

1. Initiate session with "PMERIT CONTINUE"
2. Complete nine-step startup sequence
3. Validate license and accept disclaimer
4. Configure environment settings
5. Declare project objective
6. Classify reality (greenfield or brownfield)

This initialization ensures every session operates under explicit governance. The steps may seem ceremonial, but they establish the foundation for everything that follows.

**Afternoon: Discovery Phase**

1. Enter DISCOVER phase
2. Explore problem space and constraints
3. Identify stakeholders and requirements
4. Document assumptions and unknowns
5. Research relevant prior work
6. Document findings
7. Checkpoint and handoff

Discovery is about understanding, not solving. Resist the temptation to jump to solutions. The goal is comprehensive problem understanding that will inform later phases.

**End of Day: Handoff**

Generate a formal handoff document capturing all discoveries. This artifact enables resumption tomorrow without context loss.

### Day 2: Brainstorm and Planning

The second day generates options and begins structuring the approach.

**Morning: Option Generation**

1. Resume from handoff
2. Rebind artifacts
3. Enter BRAINSTORM phase
4. Generate solution options without judgment
5. Explore unconventional approaches
6. Document all ideas

Brainstorming should be generative, not evaluative. Capture every idea, even ones that seem impractical. Evaluation comes later.

**Afternoon: Planning**

1. Evaluate options against criteria
2. Select approach or combination
3. Create project documentation (GA:PD)
4. Enter PLAN phase
5. Structure selected approach
6. Identify deliverables and dependencies
7. Complete plan review (GA:PR)
8. Checkpoint and handoff

Planning translates selected ideas into buildable structures. By the end of planning, the project path should be clear even if details remain.

### Day 3: Blueprint

The third day creates detailed specifications ready for implementation.

**Full Day: Specification**

1. Resume from handoff
2. Rebind artifacts
3. Enter BLUEPRINT phase
4. Create detailed specifications for each deliverable
5. Define dependency graph (DAG)
6. Specify acceptance criteria
7. Identify risks and mitigations
8. Approve blueprint (GA:BP)
9. Confirm master scope (GA:MS)
10. Checkpoint and handoff

Blueprint is the most detailed planning phase. Specifications here become the contract for implementation. Take time to get them right — changes after blueprint require explicit rollback.

### Days 4+: Execution and Verification

Implementation proceeds deliverable by deliverable, following the blueprint.

**Each Implementation Day:**

1. Resume from handoff
2. Rebind artifacts
3. Verify execution readiness
4. Select next eligible deliverable (per DAG)
5. Execute approved specifications
6. Verify against requirements
7. Collect quality evidence
8. Lock completed deliverables
9. Checkpoint and handoff

Execution is methodical. Each deliverable follows the same pattern: execute, verify, lock. Progress is measurable and auditable.

### Project Completion

When all deliverables are complete:

1. Final verification across all deliverables
2. Quality assessment on seven dimensions
3. Lock final state
4. Archive artifacts
5. Generate completion handoff
6. Document lessons learned

Completion is explicit, not assumed. The project is done when all gates are satisfied and final state is locked.

## Quick Task Workflow

For simpler tasks (TRIVIAL or SIMPLE class):

1. Initiate session
2. Declare objective
3. Classify task
4. For TRIVIAL: approval only, then execute
5. For SIMPLE: define deliverable and steps, then execute
6. Verify and close

## Recovery Workflow

When returning to a paused project:

1. Issue "PMERIT RECOVER"
2. Provide handoff document
3. Rebind all required artifacts
4. Verify state consistency
5. Resume from recorded position

---

# Chapter 12: Troubleshooting Guide

## Common Issues and Solutions

### AI Doesn't Follow AIXORD Protocol

**Symptom**: AI responds conversationally without governance structure.

**Solutions**:
- Ensure AIXORD prompt is properly loaded
- Issue "PMERIT CONTINUE" to reinitiate
- Explicitly reference AIXORD requirements
- Check that startup sequence completed

### Gate Won't Clear

**Symptom**: Progress blocked by unsatisfied gate.

**Solutions**:
- Review gate requirements
- Produce missing artifact
- Confirm artifact with appropriate method
- Check that artifact is bound to session

### State Conflicts

**Symptom**: AI behaves inconsistently with expected state.

**Solutions**:
- Issue "SHOW STATE" to display current state
- Compare with expected state
- Rebind artifacts to establish consistency
- Use RECOVER if state is corrupted

### Artifact Not Recognized

**Symptom**: AI doesn't acknowledge saved artifact.

**Solutions**:
- Explicitly bind artifact: "BIND: [artifact name]"
- Provide confirmation evidence
- Verify artifact was saved correctly
- Re-save if necessary

### Quality Assessment Fails

**Symptom**: Deliverable fails quality check.

**Solutions**:
- Review specific dimension failures
- Address identified issues
- Collect appropriate evidence
- Re-assess after corrections
- Request Director waiver if appropriate

### Reasoning Seems Incomplete

**Symptom**: AI provides answers without showing work.

**Solutions**:
- Classify task appropriately (may need higher class)
- Request explicit step breakdown
- Return to PLAN phase if necessary
- Decompose problem into smaller pieces

### AI Over-Refuses

**Symptom**: AI declines reasonable requests citing safety.

**Solutions**:
- Reformulate request with explicit context
- Clarify legitimate purpose
- Reference authority model
- Escalate to different phrasing

---

# Chapter 13: Quick Reference

## Commands Summary

### Session Commands
- **PMERIT CONTINUE**: Resume from current state
- **CHECKPOINT**: Quick save, continue working
- **HANDOFF**: Full save, end session
- **RECOVER**: Rebuild state with verification

### Approval Commands
- **APPROVED**: Authorize proposed action
- **APPROVED: [scope]**: Authorize specific scope
- **EXECUTE**: Authorize execution
- **HALT**: Stop all execution

### Navigation Commands
- **SHOW STATE**: Display current state
- **SHOW SCOPES**: List all scopes and status
- **SHOW DAG**: Display dependency graph
- **RESET: [PHASE]**: Return to specific phase

### Artifact Commands
- **BIND: [artifact]**: Confirm artifact present
- **REBIND ALL**: Re-confirm all required artifacts
- **SHOW BINDINGS**: Display binding status

### Quality Commands
- **QUALITY CHECK**: Seven-dimension evaluation
- **SOURCE CHECK**: Request source citations

## Phase Sequence

SETUP → DISCOVER → BRAINSTORM → PLAN → BLUEPRINT → SCOPE → EXECUTE → AUDIT → VERIFY → LOCK

## Kingdom Mapping

- IDEATION: DISCOVER, BRAINSTORM
- BLUEPRINT: PLAN, BLUEPRINT, SCOPE
- REALIZATION: EXECUTE, AUDIT, VERIFY, LOCK

## Gate Sequence

LIC → DIS → TIR → ENV → FLD → CIT → CON → OBJ → RA → FX → PD → PR → BP → MS → VA → HO

## Valid Approvals

YES: APPROVED, APPROVED: [scope], EXECUTE, DO IT, YES PROCEED

NO: "Looks good", "Fine", "OK", "Sure", emoji, silence

---

# Chapter 14: Appendix — Command Reference

## Complete Command List

### Activation Commands

| Command | Effect |
|---------|--------|
| PMERIT CONTINUE | Start or resume AIXORD session |
| CHECKPOINT | Quick save, continue working |
| HANDOFF | Full save, end session |
| RECOVER | Rebuild from handoff with verification |

### Phase Commands

| Command | Effect |
|---------|--------|
| HALT | Stop, return to decision point |
| APPROVED | Authorize execution |
| APPROVED: [scope] | Authorize specific scope |
| RESET: [PHASE] | Return to specific phase |

### Scope Commands

| Command | Effect |
|---------|--------|
| EXPAND SCOPE: [topic] | Request scope expansion |
| SHOW SCOPE | Display current scope |
| UNLOCK: [item] | Unlock for modification |

### Quality Commands

| Command | Effect |
|---------|--------|
| QUALITY CHECK | Seven-dimension evaluation |
| SOURCE CHECK | Request source citations |

### Enforcement Commands

| Command | Effect |
|---------|--------|
| PROTOCOL CHECK | Force compliance check |
| DRIFT WARNING | Flag off-track behavior |
| COMPLIANCE SCORE | Show governance metrics |

### DAG Commands

| Command | Effect |
|---------|--------|
| SHOW DAG | Display dependency graph |
| DAG STATUS | Current DAG state |

### Setup Commands

| Command | Effect |
|---------|--------|
| I ACCEPT: [identifier] | Affirm disclaimer |
| ENV-CONFIRMED | Accept default environment |
| ENV-MODIFY | Request custom environment |
| SETUP STATUS | Display setup progress |
| RESTART SETUP | Reset to step 1 |

### Artifact Commands

| Command | Effect |
|---------|--------|
| BIND: [artifact] | Confirm artifact present |
| REBIND ALL | Re-confirm all artifacts |
| SHOW BINDINGS | Display binding status |
| UNBIND: [artifact] | Mark artifact unbound |

### Formula Commands

| Command | Effect |
|---------|--------|
| SHOW FORMULA | Display formula status |
| BIND FORMULA | Bind formula to session |
| FORMULA STATUS | Show formula binding chain |

### Reality Commands

| Command | Effect |
|---------|--------|
| SHOW REALITY | Display reality classification |
| DECLARE: GREENFIELD | Set greenfield reality |
| DECLARE: BROWNFIELD-EXTEND | Set extend-only reality |
| DECLARE: BROWNFIELD-REPLACE | Set replacement reality |
| CONSERVE: [SCOPE] | Mark scope as conserved |

### Convenience Commands

| Command | Effect |
|---------|--------|
| BRIEF | Shorter responses |
| DETAIL | Expanded responses |
| RETRY | Re-attempt last action |
| UNDO | Reverse last change |
| WRAP UP | Checkpoint plus handoff |
| HELP | Show available commands |
| HELP: [cmd] | Explain specific command |

---

## Licensing

This AIXORD variant is licensed for use with Command R+ (Cohere) under the terms specified in the accompanying LICENSE.md document.

For licensing inquiries: support@pmerit.com  
Purchase additional licenses: https://pmerit.gumroad.com

---

## About PMERIT

PMERIT (People Merit) develops governance frameworks and tools for human-AI collaboration. Our mission is transforming chaotic AI interactions into structured, auditable, productive workflows.

Learn more at: https://pmerit.com

---

## Operational Assets

Operational assets for this manuscript are available via Gumroad.

Optional web interface: https://aixord-webapp-ui.pages.dev/login

These tools are optional and assist with workflow continuity. They do not override AI platform behavior or enforce governance automatically.

---

## License Information

This manuscript is educational material accompanying the AIXORD for Command R+ product. The operational governance is contained in a separate AI-internal document.

See LICENSE.md for complete licensing terms.

See DISCLAIMER.md for important disclaimers and limitations.

---

*AIXORD — Because chaos is optional.*

*Version 4.2 — Command R+ Edition*

*© PMERIT LLC*
