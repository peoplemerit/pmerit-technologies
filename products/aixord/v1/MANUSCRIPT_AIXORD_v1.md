# AIXORD

## AI Execution Order Framework

**A Complete Methodology for Structured AI-Human Collaboration**

---

**Version:** 1.0 (First Edition)
**Author:** Idowu J Gabriel, Sr.
**Publisher:** PMERIT LLC
**Published:** December 2025

---

## Copyright

Copyright 2025 PMERIT LLC. All Rights Reserved.

This book and its accompanying templates are protected by copyright. You may use the templates in your own projects but may not redistribute or resell them.

**AI Usage Disclosure:** This book was developed with the assistance of AI tools (Claude, ChatGPT) used for drafting, iteration, and refinement. All final decisions, structure, methodology design, and intellectual ownership remain solely with the author.

**Trademark Notice:** All third-party product names and trademarks mentioned in this book (including Claude, ChatGPT, GitHub Copilot, Amazon KDP) are the property of their respective owners and are used for identification and descriptive purposes only.

---

## Template Access

Your purchase includes downloadable templates.

**Access your templates at:**
https://meritwise0.gumroad.com/l/nbkkha

Use your Amazon order confirmation email to verify your purchase.

---

## What is AIXORD?

**AIXORD (AI Execution Order)** is a structured methodology for AI-human collaboration, inspired by military OPORD (Operations Order) doctrine.

> **Definition:** A guardrailed execution order issued by an AI system to a human operator, requiring sequential action, single-task focus, and explicit confirmation before proceeding.

**Core Principles:**
- **Authority** — Orders, not suggestions
- **Execution** — Sequential, confirmable tasks
- **Confirmation** — Evidence before proceeding

---

## Table of Contents

1. [Introduction](#introduction)
2. [Part I: The Problem and Solution](#part-i-the-problem-and-solution)
3. [Part II: AIXORD Principles](#part-ii-aixord-principles)
   - [Authority Rules (Critical)](#authority-rules-critical)
   - [AIXORD Power Rules](#aixord-power-rules-memorize-these)
4. [Part III: Complete Setup Guide](#part-iii-complete-setup-guide)
5. [Part IV: Living Documents System](#part-iv-living-documents-system)
6. [Part V: Template Reference](#part-v-template-reference)
7. [Part VI: Example Workflow](#part-vi-example-workflow)
8. [Part VII: Tiered Consent Model](#part-vii-tiered-consent-model)
9. [Part VIII: AIXORD Variants](#part-viii-aixord-variants)
10. [Troubleshooting](#troubleshooting)
11. [Conclusion: Your Next Steps](#conclusion-your-next-steps)
12. [About the Author](#about-the-author)

---

# Introduction

## What's In This Book

**AIXORD** is a methodology and template pack for developers who use AI assistants and need:

- Structured execution orders from AI to human
- Sequential, confirmable workflows
- Reality-first auditing before specifications
- Session continuity without losing progress
- Clear role separation (Architect vs Implementer)
- Decision tracking for architectural choices
- Risk mitigation through tiered consent

## Who This Book Is For

- Solo developers using AI-augmented development
- Small teams coordinating multiple AI tools
- Freelancers managing complex client projects
- Anyone frustrated with AI context limits
- Teams who want AI governance, not AI chaos

## Who This Book Is NOT For

- **Complete beginners to programming** — AIXORD assumes basic coding familiarity
- **Those seeking fully autonomous AI** — AIXORD is human-in-the-loop by design
- **Users who want AI to "just figure it out"** — AIXORD requires structured interaction
- **Those allergic to documentation** — Living documents are core to the methodology

If you prefer unstructured, ad-hoc AI conversations and don't need session continuity, AIXORD may feel overly rigid. This methodology is for those who need predictable, repeatable results across complex projects.

## What You'll Learn

By the end of this book, you'll have:

1. A complete understanding of AIXORD principles
2. A working AIXORD setup in your project
3. Templates ready to use immediately
4. Knowledge to maintain context across unlimited sessions
5. A system for tracking and preserving decisions
6. Risk mitigation frameworks for edge-case features

---

# Part I: The Problem and Solution

## The Problem

Developers using AI assistants face critical challenges:

### 1. Context Fragmentation

- Claude Web knows your strategy but can't see your code
- Claude Code can implement but doesn't know the big picture
- GitHub Copilot suggests code without understanding your architecture
- **Result:** Inconsistent implementations, repeated explanations

### 2. Specification Drift

- You write specs, then implement
- Implementation reveals issues with specs
- Specs become outdated
- Next session, you work from wrong assumptions
- **Result:** Wasted work, regressions, confusion

### 3. Session Continuity Loss

- AI assistants forget everything between sessions
- You re-explain context every time
- Progress notes scattered across chat logs
- **Result:** Slow startups, lost decisions, repeated work

### 4. Role Confusion

- When should AI plan vs implement?
- Who approves changes?
- Where do decisions get recorded?
- **Result:** Chaotic workflow, unclear ownership

### 5. No Execution Discipline

- AI provides suggestions, not orders
- No confirmation gates
- No evidence requirements
- **Result:** Missed steps, incomplete implementations

---

## The Solution: AIXORD

A **methodology + template pack** that creates structured execution orders between you and your AI assistants.

### The System Equation

> **MASTER_SCOPE = Project_Docs = All_SCOPEs = Production-Ready, Functioning System**

This is the core invariant of AIXORD:
- **If it's not documented, it doesn't exist.**
- Documents are not artifacts that *describe* the system — they *are* the authoritative representation of the system.
- Your vision and objectives must be on paper before you start, with the understanding that they may evolve during the process.

### How AIXORD Differs from Prompts

| Prompt | AIXORD |
|--------|--------|
| Suggestive | Directive |
| Stateless | State-aware |
| Multi-output | Single-action |
| Informational | Executable |
| AI-centered | Human-executed |

### Core Concept: Reality-First Workflow

```
Traditional (Spec-First):
  Write Spec → Implement → Discover spec was wrong → Redo

AIXORD (Reality-First):
  Audit Reality → Write Spec Based on Facts → Implement → Update Findings
```

### Three-Way Team Structure

**CLAUDE WEB (Architect)** <---> **YOU (Director)** <---> **CLAUDE CODE (Implementer)**

| Role | Responsibilities |
|------|------------------|
| Claude Web (Architect) | Strategy, Brainstorming, Specifications |
| You (Director) | Decisions, Approvals, Coordination |
| Claude Code (Implementer) | Execution, Quality Review, Implementation |

### Role Transition Rule

> During brainstorming, research, and specification, the AI operates as an **analyst and architect**.
> Once decisions are approved, the AI transitions into **execution authority** and issues explicit instructions for the human operator to carry out.
> At this stage, instructions are not suggestions, and execution proceeds sequentially with confirmation gates.

**The human decides *what* should be done; the AI decides *how* it is executed.**

### Hierarchical Scope Management

**MASTER_SCOPE.md** — Project vision (single source of truth)

Feature Scopes (each links to a handoff):

| Scope File | Feature | Linked Handoff |
|------------|---------|----------------|
| SCOPE_AUTH.md | Authentication | HANDOFF_AUTH.md |
| SCOPE_DASHBOARD.md | Dashboard | HANDOFF_DASHBOARD.md |
| SCOPE_PAYMENTS.md | Payments | HANDOFF_PAYMENTS.md |

Each scope contains:
- **DECISION LOG** — Permanent record (NEVER deleted)
- **AUDIT_REPORT** — Current reality (replaced each audit)
- **HANDOFF_DOCUMENT** — Specifications (updated in place)
- **RESEARCH_FINDINGS** — Latest session notes
- **LOCKED FILES** — Protection for complete features

---

# Part II: AIXORD Principles

## The Military Analogy

AIXORD is inspired by military OPORD (Operations Order) doctrine:

| OPORD Concept | AIXORD Equivalent |
|---------------|-------------------|
| Situation | System Context |
| Mission | Objective |
| Execution | Step-by-Step Tasks |
| Constraints | Guardrails |
| Command & Signal | Confirmation Rules |

## The Five AIXORD Principles

### 1. Authority

AIXORD issues **orders**, not suggestions. The AI tells you what to do, not options to consider.

```
❌ "You might want to consider checking the database connection..."
✅ "STEP 1: Verify database connection. Run: npm run db:check"
```

### 2. Directionality

AIXORD flows AI → Human. The AI is the commander; you are the executor.

```
AI issues order → Human executes → Human confirms completion
```

### 3. Sequential Execution

One action at a time. Never multiple steps in parallel.

```
❌ "Do steps 1, 2, and 3..."
✅ "STEP 1: [action]. WAIT FOR CONFIRMATION."
```

### 4. Explicit Confirmation

No progress without evidence. Every step requires confirmation.

```
"STEP 1 complete. Evidence: [screenshot/output/confirmation]"
```

### 5. State Awareness

AIXORD tracks progress across sessions. No re-explaining.

```
Session 1: Steps 1-5 complete
Session 2: Resumes at Step 6 (not Step 1)
```

---

## Authority Rules (Critical)

These rules eliminate ambiguity about who controls what and when:

### Decision Authority vs Execution Authority

| Authority Type | Controlled By | When |
|----------------|---------------|------|
| **Decision Authority** | Human (Director) | During brainstorming and specification |
| **Execution Authority** | AI (Commander) | After decisions are approved |

> **Decisions are frozen before execution begins.**
> During execution, the AI does not revisit decisions; it only enforces them.

### Execution Discipline

During execution:
- **One instruction at a time** — No batching
- **No optimization** — Execute as written
- **No reinterpretation** — Human discretion does not override execution authority

If an instruction is unclear or incorrect:
1. Execution halts
2. Issue is escalated back to decision phase
3. No workaround is allowed

### Scope Locking Rule

> **All scopes are locked by default.**
> A scope may only be unlocked when all declared prerequisite scopes are complete and have passed audit verification.

This prevents:
- Parallel work that violates dependencies
- Opening scopes prematurely
- Skipping prerequisite audits

### Completed Task Locking

> **Completion is a locked state, not a feeling.**

When a scope or task is completed and verified:
1. It enters a **locked state** in AIXORD_STATE.json
2. A locked task cannot be modified or reopened without documented prerequisite change
3. Before reopening, underlying principles and best practices must be re-verified

### Failure Handling Loop

If expected outcome ≠ observed reality:
1. Execution stops
2. Evidence is recorded
3. Findings are documented
4. System re-enters audit mode
5. Decisions are updated if required
6. Affected scopes are re-verified

**Failure is not an error — it is signal.**

### AI Compliance Enforcement

AIXORD is a protocol **imposed on** the AI, not a suggestion for it to follow.

If the AI violates AIXORD rules:
1. The operator resets context
2. Governance files are reloaded
3. Execution resumes only after compliance confirmation

---

## AIXORD Structure

### Canonical AIXORD Format

```
## AIXORD HEADER
- AIXORD ID: [unique identifier]
- Mission Name: [what we're doing]
- Operator: [human name]
- System/Platform: [what we're working on]
- Environment: Prod / Staging / Dev

## SITUATION
Current system state (what exists, what must not change)

## MISSION
One clear objective (end condition, not steps)

## EXECUTION RULES (GUARDRAILS)
1. Sequential only
2. One action at a time
3. Explicit confirmation required
4. No look-ahead or summarization
5. Instructions issued by AI are derived from approved decisions and are to be executed as written

## PHASE / STEP
STEP #: [Action Title]

Action:
What the operator must do

Expected Outcome:
What success looks like

Evidence Required:
Screenshot / log / confirmation

WAIT FOR CONFIRMATION
```

---

## AIXORD Power Rules (Memorize These)

These single-sentence rules reinforce the methodology. Post them where you work:

1. **"If it's not documented, it doesn't exist."**
2. **"Completion is a locked state, not a feeling."**
3. **"Decisions are frozen before execution begins."**
4. **"Scopes open only when prerequisites are verified."**
5. **"Execution enforces decisions; it does not revisit them."**
6. **"Only one AI may issue execution orders at a time."**

---

# Part III: Complete Setup Guide

## Step 1: Create Directory Structure

```bash
mkdir -p .claude/scopes
mkdir -p docs/aixord
mkdir -p docs/handoffs
mkdir -p docs/archive
```

## Step 2: Copy Templates

Place the template files:

```
.claude/
├── CLAUDE.md              ← Claude Code instructions
├── CLAUDE_WEB_SYNC.md     ← Claude Web mirror
└── scopes/
    └── MASTER_SCOPE.md    ← Project vision

docs/
├── aixord/
│   ├── AIXORD_STATE.json  ← State tracking
│   ├── AIXORD_GOVERNANCE.md ← Workflow rules
│   └── AIXORD_TRACKER.md  ← Task status
├── handoffs/              ← One per scope
└── archive/               ← Obsolete content
```

## Step 3: Customize Templates

Replace all `[BRACKETED]` placeholders:

| Placeholder | Replace With | Example |
|-------------|--------------|---------|
| `[PROJECT NAME]` | Your project name | MyApp |
| `[PROJECT]` | Short command prefix | MYAPP |
| `[DATE]` | Today's date | 2025-01-15 |

## Step 4: Fill Out MASTER_SCOPE.md

Define your project vision:

- Project identity and mission
- Technical architecture decisions
- Track/phase structure
- Dependencies

## Step 5: Create First Scope

Prompt Claude Code directly:
```
AUDIT SCOPE: AUTH
```

Claude Code will:
1. Check existing code
2. Document current state
3. Identify gaps
4. Populate AUDIT_REPORT

## Step 6: Start Working

```
MYAPP CONTINUE
```

Claude Code will:
1. Read governance files (AIXORD_STATE.json first)
2. Check active scope
3. Verify git sync
4. Output status
5. Resume work

---

# Part IV: Living Documents System

## The Problem with Append-Only

Traditional documentation appends new content:

```markdown
## Session 1 - Jan 1
Audit findings...

## Session 2 - Jan 5
New audit findings...

## Session 3 - Jan 10
Even more audit findings...
```

**Problems:**
- Which audit is current?
- 90% of content is outdated
- Context window bloated
- Contradictions between sections

## Living Document Approach

Update in place:

```markdown
## AUDIT_REPORT
Last Audit: Jan 10

[Current findings only]
```

**Benefits:**
- Always current
- Minimal context needed
- No contradictions
- Easy to find information

## What Gets Updated vs Archived

| Section | Update Behavior |
|---------|-----------------|
| DECISION LOG | **NEVER** deleted or archived |
| AUDIT_REPORT | Replaced each audit |
| HANDOFF_DOCUMENT | Updated with new requirements |
| RESEARCH_FINDINGS | Latest session only |

---

# Part V: Template Reference

## What's Included

### Templates (8 Files)

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Instructions for Claude Code (Implementer role) |
| `CLAUDE_WEB_SYNC.md` | Mirror for Claude Web (Architect role) |
| `MASTER_SCOPE.md` | Project vision template |
| `SCOPE_TEMPLATE.md` | Per-feature scope template |
| `AIXORD_STATE.json` | Machine-readable state tracking |
| `AIXORD_GOVERNANCE.md` | Workflow rules and protocols |
| `AIXORD_TRACKER.md` | Task tracking |
| `SYSTEM_GUIDE.md` | Complete operational documentation |

### AIXORD Commands

| Command | Effect |
|---------|--------|
| `[PROJECT] CONTINUE` | Full session startup protocol |
| `AUDIT SCOPE: [name]` | Claude Code audits reality |
| `SCOPE UPDATED: [name]` | Claude Code implements specs |
| `SCOPE: [name]` | Load existing scope context |
| `DONE` | Confirm task completion |
| `UNLOCK: [file]` | Unlock file for modification |
| `RELOCK: [file]` | Re-lock file after changes |

---

# Part VI: Example Workflow

## Scenario: Adding User Authentication

### Day 1: Audit

**You:** `AUDIT SCOPE: AUTH`

**Claude Code:**
1. Checks existing code
2. Documents current state
3. Identifies gaps
4. Populates AUDIT_REPORT

**Result:** SCOPE_AUTH.md has reality-based findings

### Day 2: Specification

**You → Claude Web:** Share audit report

**Claude Web:**
1. Reviews findings
2. Proposes approach
3. Documents requirements
4. Updates HANDOFF_DOCUMENT

**Result:** SCOPE_AUTH.md has specifications

### Day 3: Implementation

**You:** `SCOPE UPDATED: AUTH`

**Claude Code:**
1. Reviews specifications
2. Recommends improvements
3. Implements approved solution
4. Updates RESEARCH_FINDINGS
5. Records decisions in DECISION LOG

> **Note:** After specifications are finalized, Claude Code switches from advisory mode to instruction mode and issues step-by-step execution orders.

**Result:** Feature implemented, documented

### Day 4: Completion

**You:** Mark scope COMPLETE

**Claude Code:**
1. Locks critical files
2. Updates AIXORD_STATE.json
3. Prompts for archive cleanup

**Result:** Feature protected, docs cleaned

### Dependency Example

Because AUTH is a prerequisite for PAYMENTS:
- The PAYMENTS scope **remains locked** until AUTH passes audit and is marked production-ready
- You cannot open PAYMENTS prematurely, even "just to look"
- Scopes open only when prerequisites are verified

---

# Part VII: Tiered Consent Model

## Philosophy

> *"There's no perfection in life, but we walk around fire rather than walking through it. Just because something doesn't work for one person doesn't mean it will not work for others."*

AIXORD includes a risk mitigation framework for products that might venture into sensitive territory (legal guidance, tax assistance, etc.).

## The Three Tiers

| Tier | Name | Description | Consent |
|------|------|-------------|---------|
| **1** | Open Access | General information, templates, education | None required |
| **2** | Informed Consent Zone | Edge services with full disclosure | User acknowledges limitations + signs waiver |
| **3** | Hard Boundary | Truly prohibited services | System blocks regardless of consent |

## When to Apply

The Tiered Consent Model applies when building:
- Professional service assistants (Tax, Legal)
- Products with liability risk
- Tools that could be misused

## The Fool Filter

The consent process itself filters users:

| User Type | Behavior | Outcome |
|-----------|----------|---------|
| Sophisticated User | Reads disclaimer | Benefits from tool |
| Fool | Ignores warnings | BUT: Signed waiver limits liability |

---

# Part VIII: AIXORD Variants

## VA-AIXORD (Visual Audit)

For platform audits with visual evidence:

```
STEP #: [Plain English Action]

Action:
What the user does (one action only)

Expected Outcome:
What the system SHOULD do

Evidence Required:
Screenshot(s) or screen recording

Observed Outcome:
What actually happened

Gaps Identified:
- GAP-ID
- Category
- Description
- Severity
```

## Chatbot Edition

For ChatGPT/Gemini users without folder access:
- Single-file template system
- Token-aware handoff tracking
- All context in one uploadable file

## Professional Service Variants

- **TAX-AIXORD** — Tax preparation workflows
- **LEGAL-AIXORD** — Legal document preparation
- **PROJECT-AIXORD** — Project management

---

# Troubleshooting

## Q: What if I need to modify a locked file?

**A:** Use the unlock command:
```
UNLOCK: path/to/file.js
```

Make changes, verify functionality, then:
```
RELOCK: path/to/file.js
```

## Q: How do I handle multiple features in parallel?

**A:** Each feature gets its own scope. Set `active_scope` in AIXORD_STATE.json to switch context.

## Q: Can I use AIXORD with ChatGPT instead of Claude?

**A:** Yes. Upload the templates as files. The methodology works with any AI that accepts file uploads.

## Q: What if the AI ignores the AIXORD rules?

**A:** AIXORD is a protocol imposed on the AI, not a suggestion. If the AI violates rules:
1. Reset the context (new session or reload governance files)
2. Re-upload CLAUDE.md and AIXORD_STATE.json
3. State explicitly: "You are operating under AIXORD protocol. Sequential execution only. Wait for my confirmation before proceeding."
4. Resume only after the AI confirms compliance

The human enforces compliance by controlling context.

---

# About the Author

**Idowu J Gabriel, Sr.** is the founder of PMERIT LLC, a nonprofit-LLC hybrid focused on accessible global education.

AIXORD was developed while building the PMERIT AI Educational Platform from scratch with just 2 semesters of Java experience and AI assistance. After 75+ sessions of AI-augmented development, the need for structured governance became clear.

The name "AIXORD" emerged from connecting the workflow to military OPORD (Operations Order) doctrine — emphasizing authority, execution discipline, and confirmation gates.

**What started as survival became methodology. What became methodology became product.**

---

# Conclusion: Your Next Steps

You now have everything you need to implement AIXORD in your projects.

## What You Have

1. **A complete methodology** — AIXORD principles for structured AI-human collaboration
2. **Ready-to-use templates** — Download from Gumroad using your purchase confirmation
3. **A governance system** — STATE.json, TRACKER.md, and GOVERNANCE.md for session continuity
4. **Risk mitigation** — The Tiered Consent Model for edge-case features
5. **Practical examples** — Real workflows you can adapt immediately

## Deploy AIXORD Today

**Step 1:** Download templates from https://meritwise0.gumroad.com/l/nbkkha

**Step 2:** Create your directory structure:
```
.claude/scopes/
docs/aixord/
docs/handoffs/
```

**Step 3:** Customize CLAUDE.md with your project name and commands

**Step 4:** Fill out MASTER_SCOPE.md with your project vision

**Step 5:** Start your first session with `[PROJECT] CONTINUE`

## Future Versions

AIXORD is a living methodology. Future editions will include:
- Additional variants (TAX-AIXORD, LEGAL-AIXORD)
- Case studies from production deployments
- Integration guides for specific AI tools
- Community templates and patterns

Join the community at https://github.com/peoplemerit for updates.

---

## Support

For questions or issues:
- Website: https://pmerit.com
- GitHub: https://github.com/peoplemerit
- Email: support@pmerit.com

---

*AIXORD v1.0 — Authority. Execution. Confirmation.*
*Copyright 2025 PMERIT LLC. All Rights Reserved.*
