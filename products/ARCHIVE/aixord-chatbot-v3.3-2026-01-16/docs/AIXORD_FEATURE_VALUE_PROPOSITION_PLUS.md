# AIXORD — Feature Value Proposition Plus

**Version:** 3.2.1+ | **Publisher:** PMERIT LLC | **Date:** January 2026
**Document Type:** Comprehensive Product Reference (Marketing + Technical Spec + Roadmap + Patch Guide)

---

## Executive Summary

AIXORD (AI Execution Order) is the first comprehensive governance framework that transforms chaotic AI conversations into structured, productive projects. Unlike generic prompt templates, AIXORD implements a complete **authority model**, **behavioral controls**, **session continuity system**, and **algorithmic project execution methodology** that works across all major AI platforms.

This document serves as:
- **Marketing Material** — Value propositions for product descriptions
- **Technical Specification** — What's implemented in v3.2.1
- **Roadmap** — What's planned for v3.3+
- **Patch Guide** — What's missing and needs to be added

---

## Table of Contents

1. [The Problem AIXORD Solves](#the-problem-aixord-solves)
2. [Core Value Propositions (10)](#core-value-propositions)
3. [Category 1: Project Composition & Structure](#category-1-project-composition--structure-critical)
4. [Category 2: Genesis Pattern](#category-2-genesis-pattern-high-priority)
5. [Category 3: Behavioral Controls](#category-3-behavioral-controls-implemented)
6. [Category 4: Reasoning & Transparency](#category-4-reasoning--transparency-partial)
7. [Category 5: Enforcement & Compliance](#category-5-enforcement--compliance-implemented)
8. [Category 6: Audit & Verification](#category-6-audit--verification-critical)
9. [Category 7: Algorithmic System Properties](#category-7-algorithmic-system-properties-high-priority)
10. [Category 8: State Management Advanced](#category-8-state-management-advanced-medium)
11. [Complete Command Reference](#complete-command-reference)
12. [Platform-Specific Optimizations](#platform-specific-optimizations)
13. [Feature Comparison: AIXORD vs Generic Prompts](#feature-comparison-aixord-vs-generic-prompts)
14. [Pricing & Packages](#pricing--packages)
15. [Feature Status Summary](#feature-status-summary)

---

## The Problem AIXORD Solves

| Pain Point | Without AIXORD | With AIXORD |
|------------|----------------|-------------|
| **Lost Context** | AI forgets everything between sessions | HANDOFF protocol preserves state |
| **Scope Creep** | AI suggests endless alternatives | Choice Elimination enforces single answers |
| **Verbose Responses** | Pages of unwanted explanation | Default Suppression keeps responses minimal |
| **No Accountability** | Who decided what? When? | Decision Ledger tracks all approvals |
| **Contradicted Work** | AI reverses earlier decisions | Phase Discipline prevents regression |
| **Missing Sources** | "Trust me" responses | Citation Protocol with confidence levels |
| **No Project Structure** | Flat, unorganized work | Decomposition Formula structures projects |
| **Assumed Functionality** | AI claims "done" without proof | Visual Audit Protocol requires evidence |
| **Foundation Rot** | Building on untested foundations | Build-Upon Protocol verifies before extending |

---

## Core Value Propositions

### 1. YOU STAY IN CONTROL

**The Authority Model:**
```
┌─────────────────────────────────────────────────┐
│  DIRECTOR (You)                                 │
│  • Makes ALL decisions                          │
│  • Approves ALL execution                       │
│  • Owns ALL outcomes                            │
├─────────────────────────────────────────────────┤
│  ARCHITECT (AI)                                 │
│  • Analyzes and recommends                      │
│  • Awaits approval before acting                │
│  • Never implements without "APPROVED"          │
└─────────────────────────────────────────────────┘
```

**Key Differentiator:** Unlike other prompts that make AI "helpful," AIXORD makes AI **accountable**.

**Status:** ✅ Implemented in v3.2.1

---

### 2. NOTHING GETS LOST

**Session Continuity System:**

| Feature | What It Does |
|---------|--------------|
| **STATE.json** | Machine-readable project state that survives sessions |
| **HANDOFF Protocol** | Complete knowledge transfer between sessions |
| **CHECKPOINT** | Mid-session saves without ending |
| **RECOVER** | Rebuild context from handoffs |
| **Decision Ledger** | Permanent record of all approvals |

**Result:** Start Monday, continue Wednesday, finish Friday — no context lost.

**Status:** ✅ Implemented in v3.2.1

---

### 3. AI DOES WHAT YOU WANT (AND ONLY WHAT YOU WANT)

**Behavioral Firewalls (v3.2.1):**

| Firewall | What It Blocks |
|----------|----------------|
| **Default Suppression** | Unwanted explanations, examples, suggestions |
| **Choice Elimination** | "Here are 5 options..." scope creep |
| **Mode Locking** | Mixed behaviors that cause chaos |
| **Triggered Expansion** | Detail only when YOU ask for it |
| **Hard Stop** | "Anything else?" follow-up loops |

**The Rule:** Anything not explicitly requested = forbidden.

**Status:** ✅ Implemented in v3.2.1

---

### 4. ABSOLUTE PROJECT FOCUS

**Purpose-Bound Operation (v3.2.1):**

Once you state your project objective, the AI commits:

> *"I exist in this session ONLY to serve your stated project objective. I will not engage with topics outside that scope unless you explicitly expand it."*

**Enforcement Levels:**

| Level | Behavior |
|-------|----------|
| **STRICT** | Zero tolerance — immediate redirect |
| **STANDARD** | Polite redirect with options (default) |
| **RELAXED** | Brief tangent allowed, then redirect |

**Command:** `PURPOSE-BOUND: STRICT`

**Status:** ✅ Implemented in v3.2.1

---

### 5. TRUST BUT VERIFY

**Citation Protocol (v3.2.1):**

| Mode | Behavior | Use Case |
|------|----------|----------|
| **STRICT** | Every claim cited with source + confidence | Legal, medical, financial |
| **STANDARD** | Key recommendations cited | General projects |
| **MINIMAL** | Sources on request only | Casual work |

**Confidence Indicators:**

| Level | Indicator | Meaning |
|-------|-----------|---------|
| 🟢 HIGH | Multiple authoritative sources | Highly reliable |
| 🟡 MEDIUM | Single source or inference | Verify important claims |
| 🔴 LOW | AI reasoning only | Treat as suggestion |
| ⚠️ UNVERIFIED | Cannot confirm | Requires your verification |

**Commands:**
- `SOURCE CHECK` — Show sources for last response
- `VERIFY: [claim]` — Verify specific claim

**Status:** ✅ Implemented in v3.2.1

---

### 6. TRANSPARENT REASONING

**Reasoning Transparency (v3.2.1):**

When AI makes decisions, you see the path:

```
📋 REASONING TRACE
Step 1: [Observation]
Step 2: [Analysis]
Step 3: [Conclusion]

⚠️ ASSUMPTIONS MADE:
- [Assumption 1]
- [Assumption 2]

📅 RECENCY NOTE: This information is from [date].
Verify current status if critical.
```

**Commands:**
- `SHOW REASONING` — Request reasoning trace
- `SHOW ASSUMPTIONS` — Expose hidden assumptions

**Status:** ✅ Implemented in v3.2.1

---

### 7. STRUCTURED WORKFLOW

**6-Phase System:**

```
┌─────────────────────────────────────────────────────────┐
│                      PHASE FLOW                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   DECISION ──► DISCOVER ──► BRAINSTORM ──► OPTIONS     │
│       │                                       │         │
│       │                                       ▼         │
│       │                                   EXECUTE       │
│       │                                       │         │
│       │                                       ▼         │
│       └───────────────────────────────────  AUDIT       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

| Phase | Purpose | Entry Trigger |
|-------|---------|---------------|
| **DECISION** | Awaiting direction | Default state |
| **DISCOVER** | Clarify unclear ideas | "Help me figure out..." |
| **BRAINSTORM** | Generate possibilities | "Let's brainstorm..." |
| **OPTIONS** | Compare alternatives | "What are my options?" |
| **EXECUTE** | Implement approved plan | **"APPROVED"** (explicit) |
| **AUDIT** | Review completed work | "Review this" |

**Critical Rule:** EXECUTE requires explicit "APPROVED" — AI never implements without permission.

**Status:** ✅ Implemented in v3.2.1

---

### 8. QUICK COMPLIANCE VERIFICATION

**User Audit Checklist (10-Second Check):**

```
🔍 QUICK CHECK (Yes / No)
□ Mode Correct?
□ Scope Respected?
□ Output Contract Met?
□ Verbosity Controlled?
□ Choices Avoided?
□ Approval Honored?
□ Uncertainty Declared?
□ Hard Stop Applied?
```

**Command:** `AUDIT CHECK` — Display checklist with current status

**Status:** ✅ Implemented in v3.2.1

---

### 9. LEGAL PROTECTION

**Disclaimer Affirmation Gate:**

Before any work begins, users must acknowledge:

1. **Director Responsibility** — You make decisions, you own outcomes
2. **No Guarantee of Results** — AI is a tool, not a guarantee
3. **AI Limitations** — AI can make mistakes
4. **Not Professional Advice** — Not a substitute for lawyers, doctors, accountants
5. **Limitation of Liability** — PMERIT LLC liability capped
6. **Indemnification** — User holds PMERIT harmless

**Gate Rule:** Cannot proceed until typed acceptance: `I ACCEPT: [identifier]`

**Status:** ✅ Implemented in v3.2.1

---

### 10. 5-LAYER ENFORCEMENT ARCHITECTURE

| Layer | Mechanism | Purpose |
|-------|-----------|---------|
| **Layer 1** | Mandatory Response Header | Every response shows status |
| **Layer 2** | Compliance Self-Check | AI verifies itself every 5 responses |
| **Layer 3** | Message-Based Thresholds | Warnings at 15, 20, 25 messages |
| **Layer 4** | Task Limits | Max 3 active tasks, 1 EXECUTE at a time |
| **Layer 5** | User Enforcement Commands | PROTOCOL CHECK, DRIFT WARNING, etc. |

**Response Header (Every Response):**

```
┌──────────────────────────────────┐
│ 📍 Phase: [PHASE]                │
│ 🎯 Task: [Current task]          │
│ 📊 Progress: [X/Y]               │
│ ⚡ Citation: [Mode]              │
│ 🔒 Scope: [PROJECT_NAME]         │
│ 💬 Msg: [#/threshold]            │
└──────────────────────────────────┘
```

**Status:** ✅ Implemented in v3.2.1

---

## Category 1: Project Composition & Structure [CRITICAL]

**Status:** ⚠️ MISSING — Requires patch to all variants

### 1.1 The AIXORD Project Composition Formula

**Formal Formula:**
```
Project_Docs → [ Master_Scope : { Σ(Deliverable₁, Deliverable₂,...Dₙ) }
                 where each Deliverable : { Σ(Step₁, Step₂,...Sₙ) } ]
→ Production-Ready_System
```

**Simplified Formula (Time Analogy):**
```
Steps (Seconds) → Deliverables (Minutes) → Master_Scope (The Hour) = Production-Ready_System
```

**Hierarchy:**
| Level | Equivalent | Description |
|-------|------------|-------------|
| Steps | SUB-SCOPEs | Atomic implementation units |
| Deliverables | SCOPEs | Functional components |
| Master_Scope | Project | Complete system |

**Implementation Status:** ⚠️ MISSING — Must be added to all governance files

---

### 1.2 The 4-State Locking System

**State Machine:**
```
🧊 [LOCKED | PLANNED]     →  Plan complete, implementation not begun
        ↓
🔓 [UNLOCKED | ACTIVE]    →  Under active development
        ↓
✅ [LOCKED | IMPLEMENTED] →  Development complete, ready for audit
        ↓
🛡️ [LOCKED | VERIFIED]    →  Audited, part of stable system base
```

**Rules:**
1. Cannot execute on PLANNED — must UNLOCK first
2. Cannot modify IMPLEMENTED — must RE-UNLOCK for changes
3. Cannot build upon unless VERIFIED
4. VERIFIED elements form stable foundation

**Implementation Status:** ⚠️ MISSING — Must be added to Status Ledger system

---

### 1.3 RAG Technical Formula (State Management)

**Formula:**
```
Final_Answer = LLM ( User_Query + Retrieve ( User_Query, Vector_Index ( Project_Files ) ) )
```

**What This Means:**
- Transforms stateless chatbot into state-aware project partner
- AI answers based on YOUR project files, not general training
- Requires proper file organization (governance, state, scopes)

**Implementation Status:** ⚠️ MISSING — Conceptual, needs documentation

---

### 1.4 Project Blueprint Template

**Required Elements:**
```
PROJECT BLUEPRINT
─────────────────────────────────────────────
📛 Project Name: [Name]
🎯 Project Objective: [The "Why"]
📁 Key Project Files (Source of Truth):
   - GOVERNANCE.md
   - STATE.json
   - MASTER_SCOPE.md
   - SCOPE_*.md files
```

**Implementation Status:** ⚠️ MISSING — Template exists in Genesis but not formalized

---

### 1.5 Status Ledger Structure

**Tabular Format:**
```
| Phase | SCOPE (Deliverable) | SUB-SCOPE (Step) | Status | Owner |
|-------|---------------------|------------------|--------|-------|
| 1     | Authentication      | Login Form       | 🛡️ VERIFIED | AI |
| 1     | Authentication      | OAuth Integration| 🔓 ACTIVE | AI |
| 2     | Dashboard           | Charts Widget    | 🧊 PLANNED | — |
```

**Implementation Status:** ⚠️ MISSING — Partial in STATE.json, needs full specification

---

### 1.6 Decomposition Triggers

**When to Split a SCOPE into SUB-SCOPEs:**
- More than 1000 lines of code expected
- More than 3 distinct components
- Different technology stacks required
- Different lifecycle phases (build once vs. iterate)
- Different team members responsible

**Implementation Status:** ⚠️ MISSING — Not documented

---

### 1.7 Dependency-Based Ordering

**Principle:** Foundation → Functional → Polish

**Example:**
```
1. [FOUNDATION] Database Schema        → Must exist first
2. [FOUNDATION] API Endpoints          → Requires database
3. [FUNCTIONAL] User Interface         → Requires API
4. [FUNCTIONAL] Business Logic         → Requires UI + API
5. [POLISH]     Performance Optimization → Requires working system
```

**Implementation Status:** ⚠️ MISSING — Implied but not explicit

---

## Category 2: Genesis Pattern [HIGH PRIORITY]

**Status:** ⚠️ PARTIAL — Exists in Genesis variant, not formalized

### 2.1 Metamorphosis Workflow

**The Journey:**
```
💡 Idea → 📋 Decisions → 🔍 Research → 📐 Scopes → 🏗️ System
```

**Stages:**
1. **Idea** — Vague concept, no clear shape
2. **Decisions** — Key choices made (technology, approach, scope)
3. **Research** — Validated assumptions, found resources
4. **Scopes** — Structured deliverables and steps
5. **System** — Production-ready output

**Implementation Status:** ⚠️ PARTIAL — In Genesis, needs formalization

---

### 2.2 Minimal Start Principle

**What You Need to Begin:**
```
GOVERNANCE.md + "I want to build [brief idea]" = Sufficient to Start
```

**AI Commits To:**
- Guide discovery process
- Help clarify the idea
- Structure the project
- Never require more input than necessary

**Implementation Status:** ⚠️ PARTIAL — Implied, not explicit

---

### 2.3 Emergent Structure Pattern

**Files That Emerge During Discovery:**
```
Session 1: GOVERNANCE.md + idea
Session 2: + HANDOFF_001.md + RESEARCH_FINDINGS.md
Session 3: + MASTER_SCOPE.md
Session 4: + SCOPE_FEATURE_1.md
Session N: + Production files
```

**Implementation Status:** ⚠️ MISSING — Not documented

---

### 2.4 Session Evolution Tracking

**Format:**
```
SESSION EVOLUTION
─────────────────────────────────────────────
Session 1: Discovery — Clarified project objective
Session 2: Research — Found 3 key resources, made 2 decisions
Session 3: Scoping — Created MASTER_SCOPE with 4 deliverables
Session 4: Execution — Completed Deliverable 1 (3 steps)
```

**Implementation Status:** ⚠️ MISSING — Not documented

---

### 2.5 Brainstorming → Project Document Algorithm

**The Algorithm:**
```
INPUT: Vague idea
PROCESS:
  1. Clarifying questions (max 5)
  2. Domain exploration
  3. Feasibility assessment
  4. Option generation
  5. Decision forcing
  6. Structure creation
OUTPUT: Concrete, feasible Project Document Plan
```

**Critical Requirement:** Brainstorming MUST produce a concrete, feasible plan before proceeding

**Implementation Status:** ⚠️ MISSING — Critical gap, needs full specification

---

## Category 3: Behavioral Controls [IMPLEMENTED]

**Status:** ✅ Implemented in v3.2.1

### 3.1 Default Suppression
- AI operates in SUPPRESSIVE state unless explicitly triggered
- No unsolicited explanations, examples, or suggestions
- **Trigger Words:** EXPLAIN, WHY, TEACH, DETAIL, HOW DOES

### 3.2 Choice Elimination
- NO-CHOICE RULE: One answer only
- Never "Here are 5 options..."
- Recommend, don't enumerate

### 3.3 Expansion Triggers
- Detail provided ONLY when requested
- Explicit keywords required: EXPLAIN, EXAMPLE, ELABORATE

### 3.4 Instruction Priority Stack
```
Governance Instructions > User Commands > Task Context > AI Training
```

### 3.5 Hard Stop Condition
```
Deliver → State completion → STOP
```
- No "Anything else?"
- No follow-up suggestions
- No continuation prompts

### 3.6 Hijack General Behavior
- Override AI defaults for project focus
- Suppress AI's natural verbosity
- Enforce project-specific patterns

---

## Category 4: Reasoning & Transparency [PARTIAL]

**Status:** ✅ Partially Implemented in v3.2.1 | ⏳ Deferred features for v3.3

### Implemented in v3.2.1:
- Reasoning Trace (Step 1 → Step 2 → Step 3)
- Assumption Disclosure
- Knowledge Recency Protocol

### Deferred to v3.3:

#### 4.1 Constitutional Guardrails
**Concept:** Safety check before EXECUTE phase
```
BEFORE EXECUTE:
  ☐ Safety impact assessed
  ☐ Reversibility confirmed
  ☐ Scope alignment verified

IF UNSAFE: SAFETY HALT — Cannot proceed without Director override
```

**Implementation Status:** ⏳ Planned for v3.3

---

#### 4.2 Phase-Specific Thinking Modes

| Phase | Thinking Mode | Behavior |
|-------|---------------|----------|
| DISCOVER | Curious | Ask questions, explore possibilities |
| BRAINSTORM | Divergent | Generate many options |
| OPTIONS | Analytical | Compare trade-offs |
| EXECUTE | Precise | Exact implementation |
| AUDIT | Skeptical | Question everything |

**Implementation Status:** ⏳ Planned for v3.3

---

#### 4.3 Verification Waterfall

**Priority Order:**
```
[WEB] Official Documentation
  ↓
[DOC] Project Documents
  ↓
[KB] Knowledge Base (uploaded files)
  ↓
[TRAIN] Training Data
  ↓
[INFERENCE] AI Reasoning (lowest confidence)
```

**Implementation Status:** ⏳ Planned for v3.3

---

## Category 5: Enforcement & Compliance [IMPLEMENTED]

**Status:** ✅ Implemented in v3.2.1

### 5.1 Setup Completion Gate
- MUST complete all 8 setup steps before work begins
- Cannot skip steps
- Gate blocks progress until complete

### 5.2 Header Persistence Rule
- NEVER drop response headers
- Every response shows status
- Compliance self-check every 5 responses

### 5.3 Divergence Redirect Protocol
```
IF off-topic:
  1. Acknowledge briefly
  2. Redirect to project
  3. Re-display current step
```

### 5.4 Platform Weakness Matrix
- Different enforcement per platform
- ChatGPT: Stronger suppression needed
- Claude: Header persistence focus
- Gemini: Scope drift prevention

### 5.5 5-Layer Enforcement Architecture
- Layer 1: Mandatory Response Header
- Layer 2: Compliance Self-Check
- Layer 3: Message-Based Thresholds
- Layer 4: Task Limits
- Layer 5: User Enforcement Commands

---

## Category 6: Audit & Verification [CRITICAL]

**Status:** ⚠️ MISSING — Requires patch to all variants

### 6.1 Visual Audit Protocol

**Requirement:** User provides screenshot → AI verifies functionality

**Workflow:**
```
1. AI implements feature
2. AI requests: "Please provide screenshot of [feature] in action"
3. User uploads screenshot
4. AI analyzes screenshot
5. AI confirms: "VERIFIED — [feature] functions as specified"
   OR
   AI reports: "ISSUE FOUND — [description], please fix and re-submit"
```

**Critical Rule:** AI MUST NOT assume functionality works without visual evidence

**Implementation Status:** ⚠️ MISSING — Critical gap

---

### 6.2 Element-Based Execution Workflow

**Per-Element State Machine:**
```
🧊 PLANNED
    ↓ [UNLOCK command]
🔓 ACTIVE (implementation in progress)
    ↓ [implementation complete]
✅ IMPLEMENTED (ready for audit)
    ↓ [visual audit passed]
🛡️ VERIFIED (stable, locked)
```

**Rules:**
- Only ONE element ACTIVE at a time
- Cannot proceed to next until current VERIFIED
- Failures return to ACTIVE state

**Implementation Status:** ⚠️ MISSING — Critical gap

---

### 6.3 Build-Upon Protocol

**Requirement:** Must audit foundation before extending

**Before Building On Existing Element:**
```
1. AUDIT underlying foundation
2. VERIFY foundation still functions
3. CONFIRM no regressions
4. THEN proceed with extension

IF foundation verification fails:
  - HALT extension
  - Fix foundation first
  - Re-verify
  - Then continue
```

**Implementation Status:** ⚠️ MISSING — Critical gap

---

### 6.4 Anti-Assumption Enforcement

**Core Principle:** AI must VERIFY, not ASSUME

**Forbidden Assumptions:**
- "This should work" — Must test
- "Based on earlier..." — Must re-verify
- "Assuming the API..." — Must confirm
- "This is done" — Must show evidence

**Required Evidence:**
- Screenshots
- Test output
- Command results
- User confirmation

**Implementation Status:** ⚠️ MISSING — Critical gap

---

### 6.5 Post-Fix Re-Verification Protocol

**After "FIXED" Report:**
```
☐ Request CURRENT files (not cached)
☐ Perform FRESH audit (no carried-forward findings)
☐ Verify with ACTUAL file inspection
☐ Confirm with COMMAND OUTPUT
☐ THEN mark as PASS
```

**Forbidden:**
- Carrying forward earlier findings
- Assuming fix was applied
- Trusting verbal confirmation alone

**Implementation Status:** ⚠️ MISSING — Identified during audit session

---

### 6.6 Evidence-Based Progression

**Cannot Claim "Done" Without:**
- Verification output (test results, screenshots)
- Command execution proof
- User confirmation
- Visual audit passed

**Implementation Status:** ⚠️ MISSING — Critical gap

---

## Category 7: Algorithmic System Properties [HIGH PRIORITY]

**Status:** ⚠️ MISSING — Conceptual foundation needs documentation

### 7.1 AIXORD = Algorithm

**Proof That AIXORD Is An Algorithm:**

| Property | AIXORD Implementation |
|----------|----------------------|
| Finite steps | Phases are finite, termination defined |
| Deterministic | Same input → same behavior |
| Input/Output | User input → governed output |
| State tracking | STATE.json + Decision Ledger |
| Conditionals | IF off-topic THEN redirect |
| Termination | HANDOFF = session end |

**Implementation Status:** ⚠️ MISSING — Not articulated in product

---

### 7.2 Algorithm Flowchart

```
┌─────────────┐
│   INPUT     │  User provides governance + objective
└──────┬──────┘
       ↓
┌─────────────┐
│  PROCESS    │  Phase-based workflow with enforcement
└──────┬──────┘
       ↓
┌─────────────┐
│   OUTPUT    │  Governed, accountable responses
└─────────────┘
```

**Implementation Status:** ⚠️ MISSING — Visual not included

---

### 7.3 Formula Expression

```
GOVERNED_OUTPUT = f(
    PURPOSE_BOUND,
    AUTHORITY_MODEL,
    PHASE_LOGIC,
    BEHAVIORAL_FIREWALLS,
    ENFORCEMENT_LAYERS
)
```

**Implementation Status:** ⚠️ MISSING — Formula not expressed

---

### 7.4 Principle Statement

> **Human Authority + AI Capability = Governed Collaboration**

**Implementation Status:** ⚠️ MISSING — Tagline not formalized

---

### 7.5 Doctrine Statement

> **Director decides. AI advises. Discipline over freedom.**

**Implementation Status:** ⚠️ MISSING — Doctrine not stated

---

## Category 8: State Management Advanced [MEDIUM]

**Status:** ⚠️ PARTIAL — Basic state exists, advanced features missing

### 8.1 Governance Hash Enforcement

**Concept:** SHA256 hash to detect governance drift

```json
{
  "governance_hash": "sha256:abc123...",
  "hash_verified": true,
  "last_verification": "2026-01-03T12:00:00Z"
}
```

**Purpose:** Detect if governance file was modified between sessions

**Implementation Status:** ⚠️ MISSING

---

### 8.2 HALT Types Taxonomy

| HALT Type | Trigger | Resolution |
|-----------|---------|------------|
| SCOPE_HALT | Off-topic request | Redirect or expand scope |
| APPROVAL_HALT | Needs Director decision | Director provides APPROVED |
| SAFETY_HALT | Potentially harmful action | Director override required |
| RESOURCE_HALT | Token limit approaching | HANDOFF required |
| ERROR_HALT | Implementation failed | Debug and retry |
| DEPENDENCY_HALT | Waiting on external | External action required |
| FOUNDATION_HALT | Foundation not verified | Audit foundation first |

**Implementation Status:** ⚠️ PARTIAL — Some halts exist, not comprehensive

---

### 8.3 Confirmation Entry Format

```json
{
  "confirmations": [
    {
      "id": "CONF-001",
      "type": "SCOPE_APPROVAL",
      "content": "Authentication scope approved",
      "timestamp": "2026-01-03T12:00:00Z",
      "session": 3
    }
  ]
}
```

**Implementation Status:** ⚠️ MISSING — Not structured

---

### 8.4 Attempt Tracking Format

```json
{
  "implementation_attempts": {
    "scope": "SCOPE_AUTH",
    "attempts": 2,
    "max_attempts": 3,
    "last_error": "API timeout",
    "extended": false
  }
}
```

**Implementation Status:** ⚠️ PARTIAL — Tracking exists, format not standardized

---

## Complete Command Reference

### Activation & Control
| Command | Effect |
|---------|--------|
| `PMERIT CONTINUE` | Activate AIXORD |
| `CHECKPOINT` | Save state without ending |
| `HANDOFF` | Full handoff, end session |
| `RECOVER` | Rebuild from last handoff |
| `HALT` | Stop everything, return to DECISION |
| `APPROVED` | Enter EXECUTE phase |

### Purpose-Bound
| Command | Effect |
|---------|--------|
| `PURPOSE-BOUND: STRICT` | Zero tolerance for off-topic |
| `PURPOSE-BOUND: STANDARD` | Polite redirects (default) |
| `PURPOSE-BOUND: RELAXED` | Brief tangents allowed |
| `EXPAND SCOPE: [topic]` | Request scope expansion |
| `SHOW SCOPE` | Display current project scope |

### Citation & Reasoning
| Command | Effect |
|---------|--------|
| `CITATION: STRICT/STANDARD/MINIMAL` | Change citation mode |
| `SOURCE CHECK` | Request sources for last response |
| `VERIFY: [claim]` | Verify specific claim |
| `SHOW REASONING` | Request reasoning trace |
| `SHOW ASSUMPTIONS` | Request assumptions disclosure |

### Enforcement
| Command | Effect |
|---------|--------|
| `PROTOCOL CHECK` | Force compliance verification |
| `DRIFT WARNING` | Flag off-track behavior |
| `AUDIT CHECK` | Show user audit checklist |
| `COMPLIANCE SCORE` | Show compliance percentage |
| `ENFORCE FORMAT` | Demand structured response |

### Element Management (PROPOSED)
| Command | Effect |
|---------|--------|
| `UNLOCK: [element]` | Begin work on element |
| `LOCK: [element]` | Complete work on element |
| `AUDIT: [element]` | Request visual audit |
| `VERIFY: [element]` | Mark element as verified |
| `STATUS` | Show all element states |

### Reference Discovery
| Command | Effect |
|---------|--------|
| `FIND VIDEOS: [topic]` | Search YouTube |
| `FIND CODE: [topic]` | Search GitHub |
| `EXAMPLE PROJECT` | Find similar projects |

---

## Platform-Specific Optimizations

| Platform | Unique Features | Variant |
|----------|-----------------|---------|
| **Claude** | Projects, Knowledge Upload, Claude Code | AIXORD_CLAUDE_*.md |
| **ChatGPT** | Custom GPTs, Code Interpreter | AIXORD_CHATGPT_*.md |
| **Gemini** | Gems, Google Workspace Integration | AIXORD_GEMINI_*.md |
| **Copilot** | IDE Integration, Repository Context | AIXORD_COPILOT.md |
| **DeepSeek** | Strong Reasoning, Code Focus | AIXORD_DEEPSEEK_*.md |
| **Any AI** | Universal Compatibility | AIXORD_UNIVERSAL.md |

---

## Feature Comparison: AIXORD vs Generic Prompts

| Generic Prompts | AIXORD |
|-----------------|--------|
| Single-use templates | Complete governance framework |
| "Be helpful" instructions | Authority model with accountability |
| Hope AI remembers context | STATE.json + HANDOFF protocol |
| Trust AI output | Citation Protocol with confidence levels |
| Accept verbose responses | Behavioral Firewalls suppress defaults |
| AI decides what to do | Director approves, AI executes |
| No compliance verification | 5-layer enforcement architecture |
| Generic prompts | Platform-specific optimizations |
| No project structure | Decomposition Formula |
| Assume functionality works | Visual Audit Protocol |
| Build on untested foundations | Build-Upon Verification |

---

## Pricing & Packages

| Package | Price | Best For |
|---------|-------|----------|
| **Starter** | $4.99 | First-time users, free-tier AI |
| **Platform Packs** | $4.99-$9.99 | Users of specific AI platforms |
| **Genesis** | $12.99 | Building projects from scratch |
| **Builder Bundle** | $17.99 | Templates and tools collection |
| **Complete** | $29.99 | Everything — all variants, all tools |

---

## Feature Status Summary

### By Implementation Status

| Status | Count | Categories |
|--------|-------|------------|
| ✅ Implemented | ~20 | Behavioral Controls, Enforcement, Core Value Props |
| ⚠️ Missing/Partial | ~27 | Project Composition, Genesis, Audit, Algorithmic |
| ⏳ Deferred to v3.3 | ~3 | Constitutional Guardrails, Thinking Modes, Verification Waterfall |

### By Priority

| Priority | Count | Categories |
|----------|-------|------------|
| CRITICAL | 13 | Project Composition, Audit & Verification |
| HIGH | 10 | Genesis Pattern, Algorithmic Properties |
| MEDIUM | 4 | State Management Advanced |
| LOW | 3 | v3.3 Deferred Features |

### Patch Requirements

| Patch Target | Features Needed |
|--------------|-----------------|
| All Governance Files | Decomposition Formula, Locking System, Audit Protocol |
| All State Files | Enhanced status ledger, attempt tracking |
| Genesis Variant | Brainstorming algorithm, metamorphosis workflow |
| Documentation | Algorithm expression, doctrine statement |

---

## Appendix: Feature Origins

| Feature | Discovered Through | Problem Solved |
|---------|-------------------|----------------|
| Purpose-Bound Operation | Director Directive | AI wandering off-topic |
| Default Suppression | ChatGPT Self-Analysis | Over-verbosity |
| Choice Elimination | ChatGPT Self-Analysis | Scope creep via options |
| Expansion Triggers | ChatGPT Self-Analysis | Unwanted detail |
| Instruction Priority | ChatGPT Self-Analysis | Conflicting instructions |
| Hard Stop | ChatGPT Self-Analysis | "Anything else?" loops |
| Reasoning Trace | DeepSeek Self-Analysis | Hidden AI reasoning |
| Assumption Disclosure | DeepSeek Self-Analysis | Hidden assumptions |
| Knowledge Recency | DeepSeek Self-Analysis | Outdated information |
| Setup Completion Gate | Universal Testing | Incomplete setup |
| Header Persistence | Universal Testing | Dropped status indicators |
| Disclaimer Gate | Legal Requirement | Liability protection |
| Citation Protocol | Quality Requirement | Unverified claims |
| User Audit Checklist | Usability Testing | Quick compliance check |
| Decomposition Formula | Director Research | Unstructured projects |
| Locking System | Director Research | Unverified implementations |
| Visual Audit | Director Research | Assumed functionality |
| Build-Upon Protocol | Director Research | Foundation rot |
| Post-Fix Verification | Audit Session | Cached findings error |

---

*AIXORD v3.2.1+ — Authority. Execution. Confirmation. Verification.*
*Transform chaotic AI conversations into structured, productive projects.*

**© 2026 PMERIT LLC. All Rights Reserved.**
