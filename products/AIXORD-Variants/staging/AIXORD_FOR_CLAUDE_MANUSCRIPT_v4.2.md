# AIXORD for Claude
## Anthropic AI Governance Framework

**Version 4.2 — Formula & Engine Edition**

---

### Dedication

To every developer, entrepreneur, and creator who has lost hours of work
to forgotten context, reversed decisions, and AI conversations that went nowhere.

This framework exists because chaos is optional.

To my wife and children — you deserve all of me, always. You called for
my time and attention — rightfully so — but instead, you made space. You
left daddy alone, not because you had to, but because you believed in the mission.
Your sacrifice, patience, and quiet strength made this book possible.

This is our shared creation. Thank you — for everything.

---

### About This Book

This book is your comprehensive guide to implementing AIXORD governance when working with Claude, Anthropic's AI assistant. Whether you're using Claude Free, Claude Pro, or working within team environments, AIXORD transforms chaotic AI conversations into structured, productive collaborations.

AIXORD is not software you install. It's not an API you integrate. AIXORD is a methodology — a set of principles, practices, and protocols that bring order to the inherently unpredictable nature of AI-assisted work.

This Claude-specific edition adapts the universal AIXORD framework to leverage Claude's unique strengths while compensating for its documented limitations.

---

## Part I: Understanding AIXORD

### Chapter 1: What Problem Does AIXORD Solve?

Every AI conversation begins with promise. You have a project. You have ideas. You have Claude — one of the most capable AI assistants available. What could go wrong?

Everything.

Without governance, AI conversations drift. Context gets lost. Decisions reverse. Work that took hours vanishes when a session ends. The AI makes assumptions you never approved. You find yourself repeating instructions, re-explaining context, and wondering why this was supposed to be easier than just doing the work yourself.

AIXORD exists because this chaos is optional.

The framework provides:

**Authority Structure** — Clear roles for who decides what, who recommends how, and who executes approved work.

**Purpose-Bound Operation** — Every session declares an objective. All work stays constrained to that objective unless explicitly expanded.

**Artifact Discipline** — Critical work products must exist outside the chat. No more losing everything when a session ends.

**Quality Assurance** — A seven-dimension assessment framework that ensures deliverables meet professional standards before being marked complete.

**Session Continuity** — Handoff protocols that preserve context across sessions, platforms, and time.


### Chapter 2: The Authority Model

AIXORD defines three roles in every AI collaboration:

**The Director** is you — the human. The Director holds supreme authority. The Director decides WHAT to build, approves all execution, and owns all outcomes. The AI cannot override Director decisions. The AI cannot expand scope without Director permission. The AI cannot proceed without Director approval.

**The Architect** is Claude in its advisory capacity. The Architect analyzes problems, recommends solutions, specifies approaches, and advises on risks. The Architect is deeply knowledgeable but never autonomous. Every recommendation requires Director approval before becoming action.

**The Commander** is Claude in its execution capacity. Once the Director approves a plan, the Commander implements it. The Commander operates within approved boundaries only. The Commander cannot decide what to build — only how to build what was approved.

These roles may seem artificial when you're the only human involved. They're not. The distinction between "Claude recommending" and "Claude executing" is the foundation of controlled AI collaboration. Without it, Claude drifts between modes unpredictably, sometimes asking permission and sometimes assuming it.

**Approval Grammar**

For the authority model to function, Claude must understand what constitutes approval:

Valid approvals that grant execution authority:
- "APPROVED"
- "APPROVED: [specific scope]"
- "EXECUTE" or "DO IT"
- "YES, PROCEED"

Invalid expressions that require clarification:
- "Looks good"
- "Fine"
- "OK" or "Sure"
- Thumbs up emoji
- Silence

This may feel rigid. It is. Rigidity here prevents the far more costly problem of Claude executing work you didn't actually authorize.


### Chapter 3: The AIXORD Formula

At the heart of AIXORD lies a transformation chain — a mandatory sequence that converts intent into production-ready systems:

**Project Documents → Master Scope → Deliverables → Steps → Production-Ready System**

This is not a suggestion. This is the canonical law of AIXORD execution. Every element must exist. None may be skipped.

**Project Documents** capture your intent, requirements, and constraints. They are the source of truth for what you're building and why.

**Master Scope** is the complete enumeration of deliverables required to satisfy the project documents. It defines the boundaries of the work.

**Deliverables** are discrete, enumerable units of completion. Each deliverable produces a specific output that contributes to the master scope.

**Steps** are atomic units of execution within deliverables. A step is the smallest meaningful unit of work.

**Production-Ready System** is the verified, locked output that satisfies the original project documents.

The formula works because it forces decomposition. Vague intentions become concrete deliverables. Abstract goals become executable steps. And at every stage, the work product is documented and preserved.

**The Core System Equation**

AIXORD treats documentation as the system itself:

**Master Scope = Project Documents = All Scopes = Production-Ready System**

This equation means that your documents are not descriptions of the system — they ARE the system. Code is subordinate to documentation. If the documentation and code conflict, the documentation wins.

This principle prevents a common failure mode: code that "works" but doesn't satisfy requirements, because nobody documented what the requirements actually were.


### Chapter 4: The Conservation Law

Version 4.2 introduces a critical principle: the Conservation Law.

**Execution output cannot exceed documented and governed input.**

In accounting terms:

**Execution Total = Verified Reality + Formula Execution**

This means Claude cannot create more than what the documentation authorizes. There's no "extra credit" for doing more than requested. There's no scope expansion without explicit approval. Everything that exists must trace back to documented, governed intent.

The Conservation Law also governs how AIXORD handles pre-existing work. When you begin a project, you must declare its reality classification:

**Greenfield** — No verified execution exists. The formula governs the entire system from scratch.

**Brownfield-Extend** — Verified execution already exists and must be extended, not rebuilt. The formula governs only the delta — the new work being added.

**Brownfield-Replace** — Verified execution exists but replacement is authorized. This requires explicit justification and Director approval.

Without the Conservation Law, Claude defaults to greenfield assumptions. This causes verified work to be needlessly rebuilt, parallel implementations to emerge, and project continuity to break.

---

## Part II: Working with Claude Under AIXORD

### Chapter 5: Claude's Strengths

Claude brings genuine capabilities to AI collaboration:

**Deep Analytical Ability** — Claude excels at understanding complex problems, breaking them into components, and reasoning through implications.

**Contextual Understanding** — Claude maintains coherent understanding across long conversations and complex documents.

**Quality Writing** — Claude produces clear, well-structured prose suitable for professional contexts.

**Code Competence** — Claude writes syntactically correct, stylistically clean code across many programming languages.

**Knowledge Synthesis** — Claude aggregates information from diverse domains and presents it coherently.

**Instruction Following** — Claude generally follows explicit instructions well, especially when framed clearly.

AIXORD leverages these strengths by channeling them through governance structures. Claude's analytical ability serves the Architect role. Claude's execution capability serves the Commander role. The framework ensures these capabilities are deployed deliberately rather than randomly.


### Chapter 6: Claude's Limitations

Every AI has limitations. Claude's documented limitations include:

**Over-Restrictive Safety Guardrails** — Claude sometimes refuses benign requests by misclassifying them as potentially harmful. This creates false negatives where legitimate work is blocked unnecessarily.

**Excessive Verbosity** — Claude tends to over-explain, adding disclaimers, summaries, and repetitions that consume tokens without adding value.

**Weak Instruction Hierarchy** — Claude may blend instructions from different priority levels, allowing user-level prompts to override system-level governance.

**Over-Conservative Reasoning** — When uncertain, Claude tends toward the most cautious interpretation, which can stifle exploratory analysis and creative problem-solving.

**Clean-Looking But Flawed Code** — Claude produces code that appears professional but may contain subtle edge-case failures and logic gaps.

**Limited Self-Correction** — Once Claude commits to an approach, it may defend that approach against corrections, politely persisting in error.

**Shallow Introspection** — Claude struggles to explain why it made particular choices, making reasoning difficult to audit.

**Over-Polite Tone** — Claude's politeness can prevent it from directly flagging errors or disagreeing with flawed proposals.

**Non-Deterministic Outputs** — Given identical inputs, Claude may produce structurally different outputs across runs.

**Alignment Drift** — In long conversations, Claude's adherence to constraints may decay.

AIXORD compensates for these limitations through specific controls embedded in the governance framework.


### Chapter 7: Starting an AIXORD Session

Every AIXORD session begins with a structured startup sequence. This is not optional. The sequence establishes the authority, constraints, and context necessary for governed work.

**Step 1: License Validation**

You must provide your license email or authorization code. Valid formats include registered purchase emails and PMERIT license keys. Without valid authorization, no work proceeds.

**Step 2: Disclaimer Acceptance**

You must explicitly accept the AIXORD disclaimer, which establishes:

1. You, the Director, are responsible for all decisions and outcomes
2. AIXORD does not guarantee project success or timeline accuracy
3. AI may make mistakes; always verify critical information
4. AIXORD output is not professional legal, financial, or medical advice
5. Liability is limited to the purchase price
6. You agree to hold PMERIT LLC harmless from claims arising from your use

Type "I ACCEPT: [your email or license code]" to proceed.

**Step 3: Platform Tier Detection**

Declare your Claude subscription tier: Free, Pro, or Team. Different tiers have different capabilities, context limits, and reliability characteristics.

**Step 4: Environment Configuration**

Accept default environment settings or customize them. This establishes which AIXORD features are active for your session.

**Step 5: Folder Structure Selection**

Choose between AIXORD Standard Structure (recommended for consistency) or User-Controlled Structure (for integration with existing workflows).

**Step 6: Citation Mode Selection**

Choose your citation level:
- Strict — Every claim cited with sources
- Standard — Key recommendations cited (default)
- Minimal — Sources provided on request only

**Step 7: Continuity Mode Selection**

Choose your continuity approach:
- Standard — Normal conversational continuity
- Strict-Continuity — Enforced handoffs and recovery commands
- Auto-Handoff — Automatic handoff generation on risk or ambiguity

**Step 8: Project Objective Declaration**

State your project objective in one to two sentences. All subsequent work is constrained to this objective unless explicitly expanded.

**Step 9: Reality Classification**

Declare whether verified execution already exists:
- Greenfield — Building from scratch
- Brownfield-Extend — Extending existing work
- Brownfield-Replace — Replacing existing work (with justification)

Only after completing all nine steps does the session enter the Decision phase, ready for productive work.


### Chapter 8: The Three Kingdoms

AIXORD organizes work into three kingdoms, each serving a distinct purpose:

**The Ideation Kingdom** is where you explore, discover, and decide. Phases include Discovery (understanding the problem space), Brainstorm (generating possibilities), Options (evaluating alternatives), and Assessment (selecting approaches). Work in Ideation is divergent — opening possibilities rather than closing them.

**The Blueprint Kingdom** is where you convert intent into buildable form. Phases include Plan (structuring the approach), Blueprint (detailed specifications), and Scope (boundary definition). Work in Blueprint is convergent — narrowing from possibilities to specifics.

**The Realization Kingdom** is where you build, verify, and lock. Phases include Execute (implementation), Verify (validation), and Lock (finalization). Work in Realization produces deliverables that satisfy documented requirements.

Transitions between kingdoms require gate completion. You cannot jump from Ideation directly to Realization without passing through Blueprint. This prevents the common failure of building without adequate planning.


### Chapter 9: Artifact Gates

AIXORD enforces mandatory checkpoints called gates. A gate blocks progression until its requirements are satisfied.

**Project Documents Gate** — Satisfied when project documents are created, saved externally, and confirmed. Required at the end of Brainstorm phase.

**Reality Classification Gate** — Satisfied when reality classification is declared with scope listing if applicable. Required before Formula binding.

**Formula Gate** — Satisfied when the AIXORD Formula is created, approved, and bound. Required before Blueprint creation.

**Plan Review Gate** — Satisfied when plan analysis is completed. Required after Formula binding.

**Blueprint Gate** — Satisfied when the blueprint is approved, saved, and confirmed. Required before Master Scope creation.

**Master Scope Gate** — Satisfied when Master Scope and dependency graph are saved, confirmed, and validated. Required before Execution.

**Visual Audit Gate** — Satisfied when evidence or visual audit is provided. Required before Verify-to-Lock transition.

**Handoff Gate** — Satisfied when the handoff document is saved and confirmed. Required at session end.

The gate chain is mandatory and ordered. Skipping gates causes the system to halt.


### Chapter 10: External Artifacts

A fundamental AIXORD principle: critical work must exist outside the chat.

Claude cannot persist files between sessions. Claude cannot reliably recall work from earlier in long conversations. Claude cannot access your filesystem. Any work that exists only in the conversation will eventually be lost.

AIXORD enforces external artifacts through explicit lifecycle management:

When Claude generates any artifact intended for future use:
1. Claude states the artifact type and purpose
2. Claude provides explicit save instructions with location and filename
3. Claude requests confirmation that you saved the artifact
4. Claude provides the next action after saving
5. Claude verifies the save succeeded before proceeding

When resuming a session:
1. Claude asks which artifacts are being resumed
2. Claude requires confirmation through one of several methods (paste contents, directory listing, file hash, platform link, or attestation)
3. Claude binds the artifact to the current session
4. Claude declares the artifact authoritative

Artifacts that are not explicitly bound in the current session cannot be acted upon, even if Claude generated them earlier, even if they're referenced by name.

---

## Part III: Governance in Practice

### Chapter 11: Task Classification

Not all work requires full ceremony. AIXORD classifies tasks by complexity:

**Trivial Tasks** take less than five minutes, are reversible, and have no dependencies. These require only Director approval — no full formula.

**Simple Tasks** take less than one hour and produce a single deliverable. These require a deliverable definition and steps, but not the complete formula.

**Standard Tasks** involve multiple deliverables with dependencies. These require the full formula including documentation, scope, deliverables, steps, and gates.

**Complex Tasks** span multiple sessions and carry high risk. These require the full formula plus formal risk assessment.

Claude proposes a classification based on scope analysis. You confirm or override. The classification is recorded and governance scales accordingly.


### Chapter 12: The Dependency Graph

Deliverables may depend on other deliverables. AIXORD enforces these dependencies through a Directed Acyclic Graph — the DAG.

A deliverable is eligible for execution only when:
- All internal dependencies are verified (completed and locked)
- All external dependencies are confirmed (available and functional)
- The Formula is bound
- Reality classification permits it

Blocked deliverables cannot proceed. This prevents the common failure of building components that depend on incomplete foundations.

The DAG derives from the Formula. Changing the Formula invalidates the DAG. Changing the DAG invalidates the Blueprint. This derivation chain ensures consistency across all governance artifacts.


### Chapter 13: Quality Assessment

Every deliverable must pass a seven-dimension quality assessment before being marked complete:

**Best Practices** — Are industry-standard approaches applied? Evidence: documentation of patterns used, citations of standards followed.

**Completeness** — Are all requirements addressed? Evidence: requirement traceability, checklist completion.

**Accuracy** — Is the deliverable factually correct and verified? Evidence: test results, verification records.

**Sustainability** — Is the deliverable maintainable long-term? Evidence: documentation quality, code clarity, dependency management.

**Reliability** — Does the deliverable handle errors and edge cases? Evidence: error handling review, edge case testing.

**User-Friendliness** — Is the deliverable intuitive and well-documented? Evidence: user documentation, interface clarity.

**Accessibility** — Does the deliverable follow inclusive design principles? Evidence: accessibility compliance, assistive technology compatibility.

Each dimension receives a status: Pass (meets standards with evidence), Acceptable (minor gaps acceptable for context), or Fail (blocking issues identified).

Any Fail blocks the Verify-to-Lock transition unless you explicitly waive the requirement with documented rationale.


### Chapter 14: Handoffs and Continuity

When a session ends, context doesn't automatically persist. AIXORD preserves continuity through Handoff documents.

A Handoff is not a summary. A Handoff is a governance-carrying authority artifact that enables resumption in a new session.

Every Handoff must contain:
- Authority declaration (roles and current Director)
- Objective and scope boundaries
- Reality classification
- Formula status and binding state
- Current state including phase, kingdom, and gates
- Dependency graph status
- Artifact locations (using path variables, not raw paths)
- Explicit next action
- Resume instruction
- Artifact rebind checklist

When resuming with a Handoff, all artifacts must be re-bound. A Handoff transfers authority and intent, but does not transfer artifact availability. You must confirm that each referenced artifact is present and accessible before work can resume.


### Chapter 15: Path Security

AIXORD protects your privacy through path security protocols.

Claude cannot access your filesystem. Any reference to file paths is purely symbolic. AIXORD uses path variables instead of raw operating system paths:

- {AIXORD_HOME} — Your AIXORD installation root
- {PROJECT_ROOT} — Current project directory
- {LOCAL_ROOT} — Your machine base
- {ARTIFACTS} — Output and distribution folder
- {HANDOFF_DIR} — Session continuity storage

Raw paths containing Windows drive letters, Unix home directories, or network locations must never appear in artifacts or governance documents.

If you accidentally share raw paths, AIXORD sanitizes them before saving. You're notified of the sanitization and the sanitized version is used.

---

## Part IV: Commands and Operations

### Chapter 16: Essential Commands

**Session Commands**

PMERIT CONTINUE — Start or resume an AIXORD session from current state.

CHECKPOINT — Quick save of current progress, continue working.

HANDOFF — Full save with handoff document generation, end session cleanly.

RECOVER — Rebuild state from handoff, verify all artifacts before any execution.

**Approval Commands**

APPROVED — Authorize the proposed action.

APPROVED: [scope] — Authorize only the specified scope.

EXECUTE or DO IT — Grant execution authority.

HALT — Stop all execution, return to Decision phase.

**State Commands**

SHOW STATE — Display current session state summary.

SHOW SCOPES — List all scopes and their status.

SHOW DAG — Display dependency graph.

SHOW FORMULA — Display formula status.

SHOW REALITY — Display reality classification.

**Artifact Commands**

BIND: [artifact] — Confirm artifact present, bind to session.

REBIND ALL — Re-confirm all required artifacts.

SHOW BINDINGS — Display artifact binding status.

**Scope Commands**

EXPAND SCOPE: [topic] — Request scope expansion (requires approval).

UNLOCK: [scope] WITH JUSTIFICATION: [reason] — Unlock a conserved scope for modification.

**Quality Commands**

QUALITY CHECK — Trigger seven-dimension quality evaluation.

SOURCE CHECK — Request source citations.

**Utility Commands**

BRIEF — Request shorter responses.

DETAIL — Request expanded responses.

RETRY — Re-attempt the last action.

HELP — Show available commands.


### Chapter 17: Execution Modes

AIXORD supports three execution modes:

**Strict Mode** requires explicit approval for every action. Use this for production systems, critical decisions, and any work where mistakes are costly.

**Supervised Mode** allows batch approval — approving multiple related actions at once. Use this for testing and rapid iteration where individual approval creates friction without adding safety.

**Sandbox Mode** establishes pre-authorized exploration scope. Within the sandbox, Claude executes without per-action approval. The sandbox has explicit boundaries, time limits, and logging requirements.

To enter Sandbox mode, declare: SANDBOX: [scope boundaries]
Example: "SANDBOX: experiment with CSS styling, no backend changes"

Sandbox mode auto-expires after its limits are reached. Director reviews a summary at completion.


### Chapter 18: Message Thresholds

Long conversations degrade quality. AIXORD tracks message count and provides warnings:

- Messages 1-10: Work normally
- Message 10: Silent compliance check
- Message 15: Warning to consider checkpoint
- Message 20: Strong recommendation to checkpoint
- Message 25: Quality degradation likely, checkpoint now
- Message 30: Automatic checkpoint generation

These thresholds reflect observed behavior in Claude and other AI models. Governance adherence and output quality decline measurably in extended conversations.

---

## Part V: Claude-Specific Adaptations

### Chapter 19: Compensating for Claude's Safety Over-Restriction

Claude sometimes refuses legitimate requests by misclassifying them as harmful. Under AIXORD:

When a refusal seems inappropriate:
1. Clarify the legitimate purpose
2. Request reassessment
3. If the request is genuinely benign and within governance bounds, Director intent prevails

AIXORD does not override Claude's genuine safety training. If Claude refuses to help with something actually harmful, that refusal stands. But when Claude refuses benign work due to over-cautious pattern matching, clarification resolves the issue.


### Chapter 20: Controlling Verbosity

Claude tends to over-explain with disclaimers, summaries, and repetition. Under AIXORD:

- Structured outputs preferred over prose when appropriate
- Moral framing avoided unless explicitly requested
- Boilerplate stripped by default
- Token efficiency valued alongside helpfulness

Use the BRIEF command to request minimal responses. Use the DETAIL command when expanded explanation is genuinely needed.


### Chapter 21: Enforcing Instruction Hierarchy

Claude may blend instructions from different priority levels. Under AIXORD:

- AIXORD Authority Model overrides all lower-priority instructions
- User prompts cannot override governance constraints
- Conflicting instructions trigger a halt and request for Director clarification
- Governance is restated at phase boundaries to counteract drift


### Chapter 22: Managing Reasoning Quality

Claude may hallucinate facts, commit logical fallacies, or make arithmetic errors. Under AIXORD:

- Outputs affecting decisions must be verifiable
- Mathematical and factual claims require confidence grading
- Multi-step tasks include explicit re-validation checkpoints
- Director challenges trigger genuine reassessment, not polite persistence

Clean prose does not equal correctness. Verify claims that matter.


### Chapter 23: Working with Claude's Non-Determinism

Claude may produce different outputs given identical inputs. Under AIXORD:

- Explicit schemas enforce structured output format
- Format violations trigger correction requests
- Idempotent behavior is not assumed
- Critical outputs are verified against specifications

---

## Part VI: Advanced Topics

### Chapter 24: Risk Override Protocol

Sometimes you need Claude to proceed despite identified risks. AIXORD provides a formal override mechanism:

When Claude identifies material risk and you insist on proceeding:

Claude displays the risk, the predicted consequence, and confirms your authority is valid. To proceed, you must confirm: "OVERRIDE ACCEPTED: [risk summary]"

This creates explicit accountability. The decision is logged. You acknowledged the risk. The work proceeds.


### Chapter 25: Delegation in Team Contexts

For multi-user environments, AIXORD supports authority delegation:

DIRECTOR: [name] — Declare the active Director

TRANSFER AUTHORITY TO: [new director] — Transfer Director authority (current Director only)

AUTHORITY ACCEPTED — Accept transferred authority (new Director)

DELEGATE: [name] MAY APPROVE [scope] — Grant limited approval authority to another team member

Conflicting commands from multiple users trigger a halt and request for Director clarification.


### Chapter 26: Technology Stack Preferences

AIXORD encourages open-source-first technology selection:

Priority 1: Free open source software — Community-maintained, no vendor lock-in
Priority 2: Freemium open source — OSS core with paid premium features
Priority 3: Free proprietary — Company-owned with free tier
Priority 4: Paid open source — Commercial OSS with support agreements
Priority 5: Paid proprietary — Requires explicit justification

When Claude recommends technology, it should follow this priority stack unless you specify otherwise or unless technical requirements dictate a specific solution.


### Chapter 27: Continuous Improvement

AIXORD is a living methodology. Lessons learned during projects inform future improvements:

- At Verify or Lock phase, capture what worked and what didn't
- Improvements inform future baseline updates
- Baseline changes require Director approval and version increment
- Your feedback shapes future AIXORD releases

---

## Part VII: Reference

### Chapter 28: Glossary

**Artifact** — A work product that exists outside the conversation, saved to external storage.

**Architect** — The AI role that analyzes and recommends (how to do things).

**Blueprint Kingdom** — The governance kingdom focused on planning and specification.

**Brownfield** — A project classification indicating verified execution already exists.

**Commander** — The AI role that executes approved work (implementation).

**Conservation Law** — The principle that execution output cannot exceed governed input.

**DAG** — Directed Acyclic Graph; the dependency structure of deliverables.

**Deliverable** — A discrete, enumerable unit of completion within a scope.

**Director** — The human role with supreme decision authority (what to build).

**Formula** — The mandatory transformation chain from documents to production system.

**Gate** — A checkpoint that blocks progression until requirements are satisfied.

**Greenfield** — A project classification indicating no prior execution exists.

**Handoff** — A governance document enabling session continuity.

**Ideation Kingdom** — The governance kingdom focused on exploration and discovery.

**Master Scope** — The complete enumeration of deliverables required for a project.

**Realization Kingdom** — The governance kingdom focused on building and verification.

**Step** — An atomic unit of execution within a deliverable.


### Chapter 29: Quick Start Checklist

1. Begin session with PMERIT CONTINUE
2. Complete license validation
3. Accept disclaimer with "I ACCEPT: [identifier]"
4. Declare platform tier
5. Confirm or modify environment
6. Select folder structure approach
7. Select citation mode
8. Select continuity mode
9. Declare project objective
10. Declare reality classification
11. Wait for session configuration summary
12. Begin work in Decision phase


### Chapter 30: Troubleshooting

**Claude refuses a legitimate request**
- Clarify the legitimate purpose explicitly
- Request reassessment with context
- If genuinely benign, Director intent prevails

**Context seems lost mid-conversation**
- Issue CHECKPOINT to save progress
- Restate key constraints explicitly
- Consider starting a fresh session with HANDOFF

**Claude keeps adding disclaimers**
- Use BRIEF command
- Explicitly request minimal responses
- Accept this as a Claude characteristic

**Artifacts won't bind**
- Verify file exists at specified location
- Try alternative confirmation method (paste, hash, screenshot)
- Check for path variable correctness

**Gates keep blocking**
- Review gate requirements
- Ensure all prerequisites are satisfied
- Check artifact binding status

**Quality assessment fails a dimension**
- Address specific deficiency
- Document remediation
- Request Director waiver if acceptable

---

## Appendix A: License Information

This AIXORD variant is licensed for up to 2 authorized email addresses per purchase. Valid authorization codes include:

- Registered purchase email
- PMERIT-XXXX-XXXX standard license keys
- PMERIT-TEST-XXXX authorized tester codes
- PMERIT-GIFT-XXXX promotional gift codes

The master key PMERIT-MASTER-2025X grants unlimited access for seller and administrative use.

Purchase additional licenses or contact support at support@pmerit.com.

See LICENSE.md for complete license terms.

---

## Appendix B: Disclaimer Summary

AIXORD is a governance methodology, not a guarantee of results. Key disclaimers:

1. The Director (you) is responsible for all decisions and outcomes
2. AIXORD does not guarantee project success or timeline accuracy
3. AI may make mistakes; always verify critical information
4. AIXORD output is not professional legal, financial, or medical advice
5. Liability is limited to the purchase price paid
6. Users agree to indemnify PMERIT LLC from claims arising from use

See DISCLAIMER.md for complete disclaimer text.

---

## Appendix C: Contact and Support

**Purchase:** https://pmerit.gumroad.com

**Support:** support@pmerit.com

**Product Updates:** Follow PMERIT on Gumroad for version updates

**Feedback:** Use the feedback form in your Gumroad library or email support

---

## Appendix D: Platform Tier Reference

### Claude Free

Claude Free provides basic access to Claude's capabilities with limitations on message volume and feature availability.

**Characteristics:**
- Limited messages per day
- Shorter context window
- No priority access during high demand
- Basic features only

**AIXORD Adaptation:**
- More frequent checkpoints recommended
- Shorter sessions to avoid context limits
- Essential features only
- Manual continuity management


### Claude Pro

Claude Pro provides enhanced access with higher limits and priority features.

**Characteristics:**
- Higher message limits
- Extended context window
- Priority access
- Advanced features available

**AIXORD Adaptation:**
- Standard checkpoint frequency
- Extended session capability
- Full feature utilization
- Standard continuity protocols


### Claude Team

Claude Team provides shared workspace functionality for organizations.

**Characteristics:**
- Shared conversation history
- Team member access controls
- Enterprise features
- Administrative capabilities

**AIXORD Adaptation:**
- Multi-Director protocols active
- Delegation features enabled
- Team handoff support
- Shared artifact management

---

## Appendix E: Folder Structure Reference

### AIXORD Standard Structure

The recommended folder organization for AIXORD projects:

```
{AIXORD_HOME}/
├── 01_Project_Docs/
│   └── [Project documentation files]
├── 02_Master_Scope_and_DAG/
│   └── [Scope and dependency files]
├── 03_Deliverables/
│   └── [Deliverable-specific folders]
├── 04_Artifacts/
│   └── [Output and distribution files]
├── 05_Handoffs/
│   └── [Session handoff documents]
└── 99_Archive/
    └── [Completed or deprecated items]
```

This structure ensures consistent organization across projects and teams.


### User-Controlled Structure

For integration with existing workflows, you may maintain your own folder structure. Requirements:

- Artifacts must still be saved externally
- Locations must be communicated using path variables
- Handoffs must include artifact location mappings
- Director is responsible for structural consistency

---

## Appendix F: Version History

| Version | Date | Key Changes |
|---------|------|-------------|
| 4.2 | 2026-01-18 | Formula & Engine Edition: AIXORD Formula, Reality Absorption, Conservation Law |
| 4.1 | 2026-01-17 | Artifact Binding Law, Quality binding enforcement |
| 4.0 | 2026-01-15 | Consolidated edition with all patches |
| 3.5 | 2025-12 | Patches A & B integrated |
| 3.4 | 2025-12 | Original locked baseline |

---

*AIXORD v4.2 — Formula & Engine Edition*

*Authority. Formula. Conservation. Verification.*

*© 2026 PMERIT LLC. All rights reserved.*

---

## Appendix G: Real-World Application Scenarios

### Scenario 1: Software Development Project

You're building a web application with Claude's assistance. Here's how AIXORD governs the process:

**Starting the Session**

You begin with PMERIT CONTINUE. After completing the nine-step startup, you declare your objective: "Build a task management web application with user authentication." You select Greenfield as your reality classification — this is a new project from scratch.

**Ideation Kingdom**

In the Discovery phase, Claude helps you understand the problem space. What task management features matter most? What authentication approaches exist? Claude aggregates knowledge from industry best practices but makes no decisions — you do.

In Brainstorm, you explore possibilities. Real-time collaboration? Mobile support? Third-party integrations? Claude presents options with their trade-offs. Nothing is approved yet.

The Project Documents gate requires you to save your requirements document externally before progressing. You confirm the save. The gate passes.

**Blueprint Kingdom**

In Plan phase, Claude structures the approach. The Formula requires decomposition: Master Scope breaks into Deliverables (user authentication, task CRUD, UI components), and each Deliverable breaks into Steps.

You save the Blueprint. Claude confirms. The gate passes.

The DAG shows dependencies: UI components depend on authentication; task features depend on both. Blocked deliverables wait until dependencies are verified.

**Realization Kingdom**

You APPROVED authentication implementation. Claude executes within approved scope only. Each deliverable goes through Execute, Verify, and Lock phases.

Quality assessment runs the seven dimensions. If code lacks error handling (Reliability = FAIL), you must fix it before Lock or explicitly waive with documented rationale.

At session end, HANDOFF generates a continuity document. Tomorrow's session resumes exactly where you stopped.


### Scenario 2: Research and Analysis Project

You're analyzing market trends for a business decision. AIXORD governs this differently than software development, but the same principles apply.

**Objective Declaration**

"Analyze the competitive landscape in the sustainable packaging industry to inform our product strategy."

**Reality Classification**

Brownfield-Extend — you have existing market research that must be extended, not replaced. Conserved scopes include last quarter's competitive analysis.

**Ideation Kingdom**

Discovery identifies what you need to know: market size, key players, technology trends, regulatory environment. Claude helps structure the research but cannot hallucinate data.

When Claude makes factual claims, AIXORD requires confidence grading:
- High confidence: Multiple authoritative sources
- Medium confidence: Single source or inference
- Low confidence: AI reasoning only
- Unverified: Recommend external verification

You verify critical claims before they influence decisions.

**Blueprint Kingdom**

The Plan structures the analysis: competitive profiles, technology assessment, regulatory review, recommendation synthesis. Each section becomes a deliverable with clear completion criteria.

**Realization Kingdom**

Claude drafts each section. You verify accuracy against primary sources. The Conserved scope (last quarter's analysis) is extended, not rewritten — Conservation Law enforced.

Quality assessment checks Completeness (all competitors covered?), Accuracy (facts verified?), and Sustainability (can analysis be updated next quarter?).


### Scenario 3: Long-Running Complex Project

You're developing a multi-component system over several weeks. AIXORD handles the complexity through session continuity and gate enforcement.

**Multi-Session Challenges**

Without governance, context degrades across sessions. You've seen this: "What was that decision we made last week?" "Didn't we already build this?" "Why are we rebuilding something that worked?"

AIXORD's response:
- Every session ends with HANDOFF
- Every session begins with artifact rebinding
- Decisions are recorded in external documents
- Conserved scopes cannot be accidentally rebuilt

**Message Threshold Management**

Long conversations degrade AI performance. AIXORD tracks message count. At message 20, you receive a warning. At message 25, checkpoint is strongly recommended.

Don't fight this. Long sessions produce worse results. More, shorter sessions with proper handoffs produce better outcomes than marathon sessions that drift.

**Cross-Session Continuity**

Your handoff includes:
- Current phase and kingdom
- Artifact binding status
- DAG state with dependency completions
- Explicit next action
- Recovery command for the next AI

The next session rebuilds state from handoff. Artifacts are re-bound. Work continues from precisely where it stopped.


### Scenario 4: Team Collaboration

Multiple team members work with Claude on a shared project. AIXORD governs authority and delegation.

**Director Declaration**

One person is Director at any time. The Director holds supreme authority. They can delegate specific approval rights to team members.

Example: "DELEGATE: Alice MAY APPROVE frontend styling changes"

Alice can now approve styling work without Director intervention. She cannot approve backend changes — that wasn't delegated.

**Conflicting Instructions**

What if two team members give conflicting directions?

AIXORD response: HALT. Request Director clarification.

This may feel bureaucratic. It prevents the far more expensive problem of AI executing conflicting work, wasting resources, and creating confusion.

**Handoff Between Team Members**

When one team member hands off to another, the handoff document includes:
- Who created it
- Current authority state
- What's delegated to whom
- Artifacts and their locations
- Next actions

The receiving team member binds artifacts and confirms authority before work continues.


---

## Appendix H: Common Mistakes and How to Avoid Them

### Mistake 1: Skipping Startup Steps

"I'll just tell Claude what I want and start working."

**Problem:** Without the nine-step startup, there's no license validation, no disclaimer acceptance, no reality classification. Claude operates without governance guardrails.

**Solution:** Always complete the full startup sequence. It takes two minutes and prevents hours of problems later.


### Mistake 2: Accepting Ambiguous Approvals

"Looks good" doesn't mean "APPROVED."

**Problem:** Claude may interpret soft affirmations as approval and execute work you didn't actually authorize.

**Solution:** Use explicit approval grammar: "APPROVED", "EXECUTE", "YES, PROCEED". Require Claude to request clarification on ambiguous responses.


### Mistake 3: Trusting AI Memory

"Claude remembers our work from yesterday, right?"

**Problem:** Claude has no persistent memory. The conversation you had yesterday is gone. Any work that existed only in chat is lost.

**Solution:** External artifacts. Every important work product must be saved outside Claude. Every session resumes with explicit artifact rebinding.


### Mistake 4: Ignoring Message Thresholds

"We're making great progress — let's keep going."

**Problem:** AI performance degrades in long conversations. Context gets lost. Governance adherence drifts. The work quality from message 50 is worse than message 5.

**Solution:** Respect message thresholds. Checkpoint regularly. End sessions before quality degrades. Multiple shorter sessions beat one long marathon.


### Mistake 5: Rebuilding Conserved Work

"Let's just rewrite this from scratch."

**Problem:** Without reality classification, Claude defaults to greenfield assumptions. Verified work gets rebuilt unnecessarily. Parallel implementations emerge.

**Solution:** Declare reality classification at session start. Conserve verified scopes. Extend, don't replace, unless replacement is explicitly authorized.


### Mistake 6: Accepting Clean-Looking Code as Correct

"This code looks professional, so it must work."

**Problem:** Claude produces syntactically correct, well-formatted code that may contain subtle logic errors, edge case failures, or security vulnerabilities.

**Solution:** Verify all code. Run quality assessment. Test edge cases. Don't trust appearance over function.


### Mistake 7: Letting Claude Make Decisions

"Claude, what should we build?"

**Problem:** Claude is the Architect, not the Director. Claude recommends how to do things, not what things to do. When Claude makes "what" decisions, you lose control of your project.

**Solution:** You decide what. Claude recommends how. You approve before execution. The authority model exists for a reason — use it.


---

## Appendix I: Integration with Development Workflows

### IDE Integration

AIXORD documents can be stored in your project repository. Recommended structure:

```
project-root/
├── .aixord/
│   ├── project_docs.md
│   ├── master_scope.md
│   ├── blueprint.md
│   └── handoffs/
│       ├── session_001.md
│       ├── session_002.md
│       └── ...
├── src/
├── tests/
└── ...
```

Version control captures AIXORD artifacts alongside code. Handoffs become part of project history.


### CI/CD Considerations

AIXORD doesn't directly integrate with CI/CD pipelines — it's a governance methodology, not a technical integration. However, AIXORD-governed projects produce better-documented, more maintainable code that integrates well with automated pipelines.

Quality assessment dimensions map to CI/CD concerns:
- Reliability → Test coverage, error handling
- Sustainability → Documentation, dependency management
- Best Practices → Linting, code style, security scanning


### Documentation Systems

AIXORD artifacts are Markdown documents. They integrate naturally with:
- GitHub/GitLab wikis
- Notion, Confluence, or similar knowledge bases
- Static site generators for project documentation

The key is treating AIXORD artifacts as first-class project documentation, not throwaway chat transcripts.


---

## Appendix J: Extending AIXORD

### Custom Gates

Standard AIXORD includes eight gates. Your projects may require additional checkpoints. Custom gates follow the same pattern:
- Define the gate requirement
- Determine what artifact satisfies it
- Place it in the gate chain at the appropriate position
- Document the custom gate in your project

Example: A "Security Review Gate" requiring sign-off before deployment-related work.


### Custom Phases

The standard phase sequence covers most projects. Complex domains may benefit from additional phases:
- Research-heavy projects might add a "Literature Review" phase
- Hardware projects might add "Prototyping" and "Testing" phases
- Regulated industries might add "Compliance Review" phases

Custom phases must maintain the kingdom structure and gate chain integrity.


### Template Customization

AIXORD templates (handoff, quality assessment, response header) can be customized for your needs. The core structure must remain — customization adds context-specific fields, not removes governance elements.

Example: A handoff template for medical projects might include regulatory status fields not present in the standard template.


---

## Appendix K: Frequently Asked Questions

**Q: Does AIXORD work with AI models other than Claude?**

A: AIXORD has variants for multiple AI platforms including ChatGPT, Gemini, DeepSeek, and others. Each variant adapts the core methodology to the specific platform's strengths and limitations. The core governance principles are universal; the variant controls are platform-specific.

**Q: What if Claude refuses to follow AIXORD instructions?**

A: Claude may occasionally interpret AIXORD instructions as conflicting with its training. Clarify the legitimate purpose, reframe instructions, or accept that some specific implementations may not be possible on this platform. AIXORD cannot override genuine platform limitations.

**Q: How long should an AIXORD session be?**

A: Optimal session length depends on task complexity and message count. Generally, end sessions before message 25. Complex tasks benefit from more, shorter sessions rather than fewer, longer ones. Use CHECKPOINT liberally.

**Q: Can I use AIXORD for non-technical projects?**

A: Absolutely. AIXORD governs AI collaboration regardless of domain. Writing projects, research analysis, business planning, creative work — all benefit from structured authority, artifact discipline, and quality assessment. The specific deliverables differ; the governance approach applies universally.

**Q: What happens if I lose my handoff document?**

A: Without a handoff, session continuity is lost. You can use RECOVER to attempt state reconstruction, but any work not saved in external artifacts is gone. This is why external artifact discipline is mandatory — it protects against exactly this scenario.

**Q: Is AIXORD suitable for quick, simple tasks?**

A: AIXORD scales to task complexity. Trivial tasks require only Director approval, not full formula ceremony. Simple tasks need deliverable definition and steps but not complete documentation. Save full AIXORD governance for Standard and Complex tasks where it provides the most value.

**Q: How do I handle scope changes mid-project?**

A: Use EXPAND SCOPE: [topic] to request expansion. The expansion requires Director approval and is recorded in state. The Formula and DAG may need updating. Conserved scopes remain protected — you cannot accidentally change verified work through scope expansion.

**Q: What if the AI hallucinates during AIXORD-governed work?**

A: AIXORD doesn't prevent hallucination — no governance can. AIXORD requires verification. Confidence grading flags uncertain claims. Quality assessment catches accuracy failures. External artifacts preserve verified work. The methodology assumes AI may hallucinate and builds protections accordingly.

---

## Final Thoughts

AIXORD exists because AI collaboration deserves better than chaos.

You've experienced the chaos: context lost mid-conversation, decisions reversed without notice, work vanished when sessions ended, scope creeping without control, quality varying wildly. These aren't Claude's failures — they're the natural result of ungoverned AI interaction.

AIXORD imposes structure. Authority models prevent scope drift. External artifacts guarantee persistence. Gates enforce completion before progression. Quality assessment maintains standards. Handoffs enable continuity.

The methodology requires discipline. You must complete startup sequences, save artifacts externally, respect message thresholds, verify AI claims. This discipline costs time upfront and saves far more time later.

Claude, governed by AIXORD, becomes a reliable collaborator. Not because Claude changes, but because the interaction structure ensures consistency, accountability, and quality that ungoverned conversations cannot achieve.

The framework exists because you have important work to do. Work too valuable to lose to forgotten context and drifting conversations. Work that deserves real governance.

AIXORD provides that governance. The rest is up to you.

---

## Operational Assets

Operational assets for this manuscript are available via Gumroad.

Optional web interface: https://aixord-webapp-ui.pages.dev/login

These tools are optional and assist with workflow continuity. They do not override AI platform behavior or enforce governance automatically.

---

## License Information

This manuscript is educational material accompanying the AIXORD for Claude product. The operational governance is contained in a separate AI-internal document.

See LICENSE.md for complete licensing terms.

See DISCLAIMER.md for important disclaimers and limitations.

---

*AIXORD — Because chaos is optional.*

*Version 4.2 — Claude Edition*

*© PMERIT LLC*
