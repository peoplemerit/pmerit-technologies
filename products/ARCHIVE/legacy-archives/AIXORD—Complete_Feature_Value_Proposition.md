# AIXORD — Complete Feature Value Proposition

**Version:** 3.2.1+ | **Publisher:** PMERIT LLC | **January 2026**
**Document Type:** Marketing + Technical Specification + Roadmap

---

## Executive Summary

AIXORD (AI Execution Order) is the first **comprehensive algorithmic governance framework** that transforms chaotic AI conversations into structured, production-ready projects. Unlike generic prompt templates, AIXORD implements:

- A **complete authority model** (Director → Architect → Commander)
- **Behavioral control systems** (Firewalls, Suppression, Priority Stack)
- **Session continuity protocol** (STATE.json, HANDOFF, CHECKPOINT)
- **Project decomposition methodology** (Master Scope → Deliverables → Steps)
- **Verification architecture** (Visual Audit, Locking, Anti-Assumption)

**Core Formula:**
```
MASTER_SCOPE = Project_Docs = All_SCOPEs = Production-Ready System
```

---

# PART 1: THE PROBLEM AIXORD SOLVES

## 6 Critical Pain Points

| Pain Point | Without AIXORD | With AIXORD |
|------------|----------------|-------------|
| **Lost Context** | AI forgets everything between sessions | HANDOFF protocol preserves complete state |
| **Scope Creep** | AI suggests endless alternatives | Choice Elimination enforces single answers |
| **Verbose Responses** | Pages of unwanted explanation | Default Suppression keeps responses minimal |
| **No Accountability** | Who decided what? When? | Decision Ledger tracks all approvals |
| **Contradicted Work** | AI reverses earlier decisions | Phase Discipline prevents regression |
| **Assumed Functionality** | AI claims "done" without proof | Visual Audit + Locking requires verification |

---

# PART 2: IMPLEMENTED FEATURES (v3.2.1)

## 2.1 Authority Model — YOU STAY IN CONTROL

```
┌─────────────────────────────────────────────────┐
│  DIRECTOR (Human)                               │
│  • Makes ALL decisions                          │
│  • Approves ALL execution                       │
│  • Owns ALL outcomes                            │
├─────────────────────────────────────────────────┤
│  ARCHITECT (AI)                                 │
│  • Analyzes and recommends                      │
│  • Awaits approval before acting                │
│  • Never implements without "APPROVED"          │
├─────────────────────────────────────────────────┤
│  COMMANDER (Claude Code / Execution AI)         │
│  • Executes approved specifications             │
│  • Reports progress and blockers                │
│  • Returns to Architect for decisions           │
└─────────────────────────────────────────────────┘
```

**Key Differentiator:** Other prompts make AI "helpful." AIXORD makes AI **accountable**.

---

## 2.2 Session Continuity — NOTHING GETS LOST

| Feature | What It Does |
|---------|--------------|
| **STATE.json** | Machine-readable project state that survives sessions |
| **HANDOFF Protocol** | Complete knowledge transfer between sessions |
| **CHECKPOINT** | Mid-session saves without ending |
| **RECOVER** | Rebuild context from handoffs |
| **Decision Ledger** | Permanent record of all approvals |
| **Carryforward Items** | Tasks explicitly passed to next session |

**Result:** Start Monday, continue Wednesday, finish Friday — no context lost.

---

## 2.3 Behavioral Firewalls — AI DOES WHAT YOU WANT

### 5 Firewalls Model

| Firewall | What It Blocks |
|----------|----------------|
| **Default Suppression** | Unwanted explanations, examples, suggestions |
| **Choice Elimination** | "Here are 5 options..." scope creep |
| **Mode Locking** | Mixed behaviors that cause chaos |
| **Triggered Expansion** | Detail only when YOU ask for it |
| **Hard Stop** | "Anything else?" follow-up loops |

### Instruction Priority Stack

| Priority | Source | Override Power |
|----------|--------|----------------|
| 1 (HIGHEST) | AIXORD Governance | Overrides everything |
| 2 | User Commands (APPROVED, HALT) | Overrides task content |
| 3 | Task Content | Overrides training |
| 4 (LOWEST) | Training defaults | LAST priority |

**The Rule:** Anything not explicitly requested = forbidden.

---

## 2.4 Purpose-Bound Operation — ABSOLUTE PROJECT FOCUS

Once you state your project objective, the AI commits:

> *"I exist in this session ONLY to serve your stated project objective. I will not engage with topics outside that scope unless you explicitly expand it."*

### Enforcement Levels

| Level | Behavior |
|-------|----------|
| **STRICT** | Zero tolerance — immediate redirect |
| **STANDARD** | Polite redirect with options (default) |
| **RELAXED** | Brief tangent allowed, then redirect |

### Redirect Protocol

1. Acknowledge briefly
2. Explain outside current scope
3. State current project and task
4. Offer options (return, expand scope, new session)
5. Await Director decision

---

## 2.5 Citation Protocol — TRUST BUT VERIFY

### Three Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| **STRICT** | Every claim cited with source + confidence | Legal, medical, financial |
| **STANDARD** | Key recommendations cited | General projects |
| **MINIMAL** | Sources on request only | Casual work |

### Confidence Indicators

| Level | Indicator | Meaning |
|-------|-----------|---------|
| 🟢 HIGH | Multiple authoritative sources | Highly reliable |
| 🟡 MEDIUM | Single source or inference | Verify important claims |
| 🔴 LOW | AI reasoning only | Treat as suggestion |
| ⚠️ UNVERIFIED | Cannot confirm | Requires your verification |

### Source Types

| Type | Label | Description |
|------|-------|-------------|
| Web Search | [WEB] | Retrieved from internet |
| User Document | [DOC] | From uploaded files |
| Knowledge Base | [KB] | From system knowledge |
| Training Data | [TRAIN] | General AI knowledge |
| Inference | [INFERENCE] | AI reasoning |

---

## 2.6 Reasoning Transparency — SEE THE AI'S THINKING

### Reasoning Trace Format

```
📋 REASONING TRACE
Step 1: [Observation]
Step 2: [Analysis]
Step 3: [Conclusion]

**Alternatives Considered:**
- [Alternative A] — Rejected because: [reason]
- [Alternative B] — Rejected because: [reason]
```

### Assumption Disclosure

```
⚠️ ASSUMPTIONS MADE:
- [Assumption 1] — Confidence: HIGH/MEDIUM/LOW
- [Assumption 2] — Confidence: HIGH/MEDIUM/LOW

If any assumption is incorrect, this recommendation may not apply.
```

### Knowledge Recency Flag

```
📅 RECENCY NOTICE:
This information is current as of [date/knowledge cutoff].
For time-sensitive decisions: VERIFICATION RECOMMENDED
```

---

## 2.7 6-Phase System — STRUCTURED WORKFLOW

```
DECISION ──► DISCOVER ──► BRAINSTORM ──► OPTIONS
    │                                       │
    │                                       ▼
    │                                   EXECUTE
    │                                       │
    │                                       ▼
    └───────────────────────────────────  AUDIT
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

---

## 2.8 5-Layer Enforcement Architecture

| Layer | Mechanism | Purpose |
|-------|-----------|---------|
| **Layer 1** | Mandatory Response Header | Every response shows status |
| **Layer 2** | Compliance Self-Check | AI verifies itself every 5 responses |
| **Layer 3** | Message-Based Thresholds | Warnings at 15, 20, 25 messages |
| **Layer 4** | Task Limits | Max 3 active tasks, 1 EXECUTE at a time |
| **Layer 5** | User Enforcement Commands | PROTOCOL CHECK, DRIFT WARNING, etc. |

### Mandatory Response Header

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

---

## 2.9 User Audit Checklist — 10-SECOND VERIFICATION

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

---

## 2.10 Legal Protection — DISCLAIMER AFFIRMATION GATE

Before any work begins, users must acknowledge:

1. **Director Responsibility** — You make decisions, you own outcomes
2. **No Guarantee of Results** — AI is a tool, not a guarantee
3. **AI Limitations** — AI can make mistakes
4. **Not Professional Advice** — Not a substitute for lawyers, doctors, accountants
5. **Limitation of Liability** — PMERIT LLC liability capped
6. **Indemnification** — User holds PMERIT harmless

**Gate Rule:** Cannot proceed until typed acceptance: `I ACCEPT: [identifier]`

---

# PART 3: PROJECT EXECUTION METHODOLOGY (CRITICAL)

## 3.1 The System Equation

```
MASTER_SCOPE = Project_Docs = All_SCOPEs = Production-Ready System
```

**What this means:**

| Component | Definition | Relationship |
|-----------|------------|--------------|
| **MASTER_SCOPE** | Complete project vision | Sum of all SCOPEs |
| **Project_Docs** | Living documentation | Documents ARE the system |
| **All_SCOPEs** | Decomposed implementable units | Each SCOPE = one deliverable |
| **Production-Ready System** | Verified reality | Documents + Execution + Verification |

**Key Insight:** "If it's not documented, it doesn't exist" — but also, if it IS documented, it MUST exist in reality.

---

## 3.2 Formal Decomposition Formula

```
Project_Docs → [ Master_Scope : { Σ(Deliverable₁, Deliverable₂,...Dₙ) }
                 where each Deliverable : { Σ(Step₁, Step₂,...Sₙ) } ]
→ Production-Ready_System
```

### Time Analogy (Intuitive Understanding)

```
Steps (Seconds) → Deliverables (Minutes) → Master_Scope (The Hour) = Production-Ready System
```

### Hierarchy Structure

```
MASTER_SCOPE.md (The complete vision)
├── SCOPE_A.md (Deliverable 1)
│   ├── SUB-SCOPE_A1.md (Step 1)
│   └── SUB-SCOPE_A2.md (Step 2)
├── SCOPE_B.md (Deliverable 2)
│   └── SUB-SCOPE_B1.md (Step 1)
└── SCOPE_C.md (Deliverable 3)
```

---

## 3.3 4-State Locking System

| State | Symbol | Meaning |
|-------|--------|---------|
| `[LOCKED \| PLANNED]` | 🧊 | Plan complete, implementation not begun |
| `[UNLOCKED \| ACTIVE]` | 🔓 | Under active development |
| `[LOCKED \| IMPLEMENTED]` | ✅ | Development complete, ready for audit |
| `[LOCKED \| VERIFIED]` | 🛡️ | Audited, part of stable system base |

### SCOPE Lifecycle States (Expanded)

```
EMPTY → AUDITED → SPECIFIED → IN_PROGRESS → VISUAL_AUDIT → COMPLETE → LOCKED
  │        │          │            │              │            │          │
  │        │          │            │              │            │          └─ No changes without UNLOCK
  │        │          │            │              │            └─ All requirements verified
  │        │          │            │              └─ Visual verification in progress
  │        │          │            └─ Execution in progress
  │        │          └─ HANDOFF_DOCUMENT written
  │        └─ AUDIT_REPORT populated
  └─ File created, no content
```

### State Transition Rules

| From | To | Trigger | Who |
|------|----|---------|-----|
| EMPTY | AUDITED | `AUDIT SCOPE: [name]` completes | Commander |
| AUDITED | SPECIFIED | HANDOFF_DOCUMENT written | Architect |
| SPECIFIED | IN_PROGRESS | `ENTER EXECUTION MODE` | Human |
| IN_PROGRESS | VISUAL_AUDIT | UI implementation ready | Commander/Human |
| VISUAL_AUDIT | IN_PROGRESS | Discrepancies found | Automatic |
| VISUAL_AUDIT | COMPLETE | All visual checks PASS | Commander |
| COMPLETE | LOCKED | Human approval | Human |
| LOCKED | IN_PROGRESS | `UNLOCK: [scope]` | Human only |

---

## 3.4 SCOPE Prerequisites & Dependencies

SCOPEs may depend on other SCOPEs:

```markdown
## DEPENDENCIES

| Prerequisite | Required State | Reason |
|--------------|----------------|--------|
| SCOPE_AUTH | COMPLETE | Need user system first |
| SCOPE_DATABASE | LOCKED | Schema must be stable |
```

**Dependency-Gated Rule:** A SCOPE cannot enter IN_PROGRESS until all prerequisites reach their required states.

**AIXORD vs Gantt:**

| Gantt | AIXORD |
|-------|--------|
| Time-based | Dependency + verification-based |
| Tasks can overlap | Scopes are gated |
| Completion can be estimated | Completion must be audited |
| Visual planning tool | Execution governance system |

---

## 3.5 Brainstorming → Project Document Plan Algorithm

### The Genesis Pattern

For users who don't have a clear project idea, AIXORD provides a structured discovery process:

**Session 1 (Minimal Start):**
```
┌─────────────────────────────────────────┐
│  GOVERNANCE (Condensed Authority Rules) │
│  + Brief Project Idea Description       │
└─────────────────────────────────────────┘
```

**Sessions 2-N (Metamorphosis):**
```
┌─────────────────────────────────────────┐
│  GOVERNANCE                             │
│  ├── HANDOFF_DOCUMENT (emerges)         │
│  ├── RESEARCH_FINDINGS (grows)          │
│  ├── DECISION_LOG (accumulates)         │
│  └── SCOPE_* files (decomposed)         │
└─────────────────────────────────────────┘
```

**Final State:**
```
MASTER_SCOPE = Project_Docs = All_SCOPEs = Production-Ready System
```

### Brainstorm Output Requirements

The BRAINSTORM phase MUST produce:

1. **Concrete Project Objective** — Clear, measurable
2. **Feasibility Assessment** — Can this be done?
3. **Decomposed Deliverables** — Broken into SCOPEs
4. **Dependency Map** — Which SCOPEs depend on which
5. **LOCKED SCOPE** — Cannot change without explicit UNLOCK

**Gate Rule:** Cannot proceed to EXECUTE until BRAINSTORM produces complete project document plan.

---

## 3.6 Element-Based Execution Workflow

### Per-Element State Machine

For each element (SCOPE/SUB-SCOPE) in the project document:

```
1. ELEMENT is 🧊 LOCKED | PLANNED
2. Director says "UNLOCK: [element]"
3. ELEMENT becomes 🔓 UNLOCKED | ACTIVE
4. Commander implements element
5. Commander reports "IMPLEMENTATION COMPLETE"
6. ELEMENT becomes ✅ LOCKED | IMPLEMENTED
7. Visual Audit (if UI) or Code Audit (if backend)
8. If PASS → ELEMENT becomes 🛡️ LOCKED | VERIFIED
9. If FAIL → Return to step 3 (fix discrepancies)
```

### Execution Tracking Table

| Element | Status | Implemented | Audited | Verified |
|---------|--------|-------------|---------|----------|
| SCOPE_AUTH | 🛡️ VERIFIED | ✅ | ✅ | ✅ |
| SCOPE_DASHBOARD | 🔓 ACTIVE | 🔄 In Progress | ⏳ | ⏳ |
| SCOPE_PAYMENTS | 🧊 PLANNED | ⏳ | ⏳ | ⏳ |

---

## 3.7 Visual Audit Protocol

### When Required

| SCOPE Type | Visual Audit Required? |
|------------|------------------------|
| UI Feature | ✅ REQUIRED |
| Form | ✅ REQUIRED |
| Dashboard | ✅ REQUIRED |
| User Flow | ✅ REQUIRED |
| API / Backend | ❌ Code audit only |
| Database | ❌ Schema verification only |

### Visual Audit Process

```
1. CAPTURE — Human provides screenshots of implemented feature
2. COMPARE — AI compares visuals against SCOPE requirements
3. DOCUMENT — Findings recorded in VISUAL_AUDIT_REPORT
4. VERDICT — PASS (matches spec) or DISCREPANCY (gaps identified)
5. ITERATE — If discrepancies, return to EXECUTION for fixes
```

### Visual Audit Report Format

```markdown
## VISUAL AUDIT REPORT

**Date:** [date]
**SCOPE:** SCOPE_[name]
**Screenshots Reviewed:** [count]

| Requirement | Screenshot | Status | Notes |
|-------------|------------|--------|-------|
| [Spec item] | [filename] | ✅ PASS | [observation] |
| [Spec item] | [filename] | ⚠️ DISCREPANCY | [what's wrong] |
| [Spec item] | [filename] | ❌ MISSING | [not implemented] |

**Overall Verdict:** [PASS / DISCREPANCY FOUND]
**Action Required:** [None / List fixes needed]
```

### What AI Examines

| Category | Checks |
|----------|--------|
| **Layout** | Matches specification, proper alignment, spacing |
| **Content** | Text correct, images present, data displayed |
| **States** | Empty, loading, error, success all handled |
| **Responsive** | Mobile, tablet, desktop breakpoints |
| **Accessibility** | Visible focus states, contrast, labels |
| **Consistency** | Matches design system, no visual regressions |

### What AI Cannot Verify (Human Must Confirm)

- Actual interactivity (clicks work, forms submit)
- Performance and load times
- Cross-browser rendering differences
- Color accuracy on calibrated displays
- Animation smoothness
- Sound/audio feedback

---

## 3.8 Build-Upon Protocol — FOUNDATION VERIFICATION

### The Problem

AI models often assume previous functionality still works when building new features on top of existing ones. This leads to:
- Regressions going unnoticed
- Features built on broken foundations
- "It worked before" assumptions

### The Rule

**Before building on ANY existing element, the underlying foundation MUST be audited.**

```
BEFORE extending SCOPE_B which depends on SCOPE_A:

1. AUDIT SCOPE_A (even if previously VERIFIED)
2. Confirm SCOPE_A still functions correctly
3. Document any changes to SCOPE_A since last verification
4. ONLY THEN proceed with SCOPE_B extension
```

### Build-Upon Checklist

```
☐ Foundation SCOPE identified
☐ Foundation SCOPE audited (visual or code)
☐ Foundation SCOPE confirmed functional
☐ Dependencies documented
☐ THEN proceed with extension
```

---

## 3.9 Anti-Assumption Enforcement — VERIFY, DON'T ASSUME

### The Core Principle

**AI MUST NOT assume functionality works. AI MUST verify and confirm.**

### What This Means

| ❌ ASSUMPTION (Wrong) | ✅ VERIFICATION (Right) |
|-----------------------|-------------------------|
| "This should work" | "Screenshot shows it works" |
| "I implemented it" | "Tests pass, audit complete" |
| "It worked before" | "Re-audit confirms still working" |
| "The user said it's fine" | "Visual audit documented" |
| "Carried forward from last session" | "Fresh audit of current state" |

### Enforcement Commands

| Command | Effect |
|---------|--------|
| `VERIFY: [claim]` | Request proof for specific claim |
| `AUDIT: [scope]` | Force fresh audit of scope |
| `SHOW EVIDENCE` | Request documentation of functionality |

---

## 3.10 Post-Fix Re-Verification Protocol

### The Problem Solved

When Claude Code (or any executor) reports "FIXED," the verifying agent (Claude Web) must not carry forward earlier findings. Fresh verification is required.

### The Protocol

```markdown
## MANDATORY RE-VERIFICATION AFTER HANDOFF EXECUTION

When Claude Code reports "FIXED":

1. Claude Web MUST NOT carry forward earlier findings
2. Claude Web MUST request current files for re-audit
3. Claude Web MUST verify with actual file inspection

### Verification Script (Standard)
Before marking ANY item as PASS/CONDITIONAL:
```bash
# Always run on CURRENT files, not cached results
grep -o "AX-[A-Z]*-[A-Z0-9]*" [file]
unzip -l [package.zip]
grep -c "[pattern]" [target.md]
```

### Handoff Completion Checklist
☐ Claude Code reports completion
☐ User uploads UPDATED files
☐ Claude Web re-audits UPDATED files (not cached)
☐ Claude Web confirms with actual command output
☐ THEN mark as PASS
```

---

# PART 4: ALGORITHMIC SYSTEM PROPERTIES

## 4.1 AIXORD = Algorithm

AIXORD is not just a set of rules — it's a **complete algorithmic system**:

| Property | AIXORD Implementation |
|----------|----------------------|
| **Finite Steps** | 6 phases, 8 setup steps, defined transitions |
| **Deterministic** | Same input → same behavior |
| **Input/Output** | User query → Governed response |
| **State Tracking** | STATE.json maintains context |
| **Conditionals** | Phase logic, enforcement triggers |
| **Termination** | CHECKPOINT, HANDOFF, HALT |

### The Algorithm Formula

```
GOVERNED_OUTPUT = f(PURPOSE_BOUND, AUTHORITY_MODEL, PHASE_LOGIC, 
                    BEHAVIORAL_FIREWALLS, ENFORCEMENT)
```

### Algorithm Flowchart

```
INPUT (User Message)
       │
       ▼
┌─────────────────┐
│ PURPOSE-BOUND   │ ──── Outside scope? ──── REDIRECT
│ CHECK           │
└────────┬────────┘
         │ IN SCOPE
         ▼
┌─────────────────┐
│ PHASE ROUTER    │
│ (6 phases)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ BEHAVIORAL      │ ◄── Suppression, Triggers, Firewalls
│ FIREWALLS       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ RESPONSE        │ ◄── Header, Content, Citation
│ GENERATION      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ STATE UPDATE    │ ◄── Message count, Phase, Progress
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ THRESHOLD       │────►│ EXCEEDED?       │
│ CHECK           │     │ CHECKPOINT      │
└────────┬────────┘     └─────────────────┘
         │
         ▼
      OUTPUT
```

---

## 4.2 Core Principles

| Principle | Statement |
|-----------|-----------|
| **Authority** | Human Authority + AI Capability = Governed Collaboration |
| **Discipline** | Director decides, AI advises, Discipline over freedom |
| **Documentation** | Documents ARE the system, not descriptions of it |
| **Verification** | Verify, don't assume; Evidence, not claims |
| **Continuity** | State persists; Context survives sessions |

---

# PART 5: COMPLETE COMMAND REFERENCE

## Activation & Control

| Command | Effect |
|---------|--------|
| `PMERIT CONTINUE` | Activate AIXORD |
| `CHECKPOINT` | Save state without ending |
| `HANDOFF` | Full handoff, end session |
| `RECOVER` | Rebuild from last handoff |
| `HALT` | Stop everything, return to DECISION |
| `APPROVED` | Enter EXECUTE phase |

## Purpose-Bound

| Command | Effect |
|---------|--------|
| `PURPOSE-BOUND: STRICT` | Zero tolerance for off-topic |
| `PURPOSE-BOUND: STANDARD` | Polite redirects (default) |
| `PURPOSE-BOUND: RELAXED` | Brief tangents allowed |
| `EXPAND SCOPE: [topic]` | Request scope expansion |
| `SHOW SCOPE` | Display current project scope |

## Citation & Reasoning

| Command | Effect |
|---------|--------|
| `CITATION: STRICT/STANDARD/MINIMAL` | Change citation mode |
| `SOURCE CHECK` | Request sources for last response |
| `VERIFY: [claim]` | Verify specific claim |
| `SHOW REASONING` | Request reasoning trace |
| `SHOW ASSUMPTIONS` | Request assumptions disclosure |

## Enforcement

| Command | Effect |
|---------|--------|
| `PROTOCOL CHECK` | Force compliance verification |
| `DRIFT WARNING` | Flag off-track behavior |
| `AUDIT CHECK` | Show user audit checklist |
| `COMPLIANCE SCORE` | Show compliance percentage |
| `ENFORCE FORMAT` | Demand structured response |

## SCOPE Management

| Command | Effect |
|---------|--------|
| `AUDIT SCOPE: [name]` | Audit scope reality |
| `UNLOCK: [scope]` | Unlock scope for work |
| `LOCK: [scope]` | Lock scope after verification |
| `SHOW STATUS` | Display all scope states |

## Reference Discovery

| Command | Effect |
|---------|--------|
| `FIND VIDEOS: [topic]` | Search YouTube |
| `FIND CODE: [topic]` | Search GitHub |
| `EXAMPLE PROJECT` | Find similar projects |

---

# PART 6: PLATFORM-SPECIFIC OPTIMIZATIONS

| Platform | Unique Features | Primary Weakness | Mitigation |
|----------|-----------------|------------------|------------|
| **Claude** | Projects, Knowledge Upload, Claude Code | Context window limits | CHECKPOINT reminders |
| **ChatGPT** | Custom GPTs, Code Interpreter | Verbosity, scope creep | Aggressive Default Suppression |
| **Gemini** | Gems, Google Workspace | Setup complexity | Clear tier detection |
| **Copilot** | IDE Integration, Repository Context | IDE context confusion | Clear workspace boundaries |
| **DeepSeek** | Strong Reasoning, Code Focus | Knowledge recency | Mandatory recency flags |
| **Opera Aria** | Browser Integration | Protocol drift | STRICT enforcement default |

---

# PART 7: WHAT MAKES AIXORD DIFFERENT

| Other Prompts | AIXORD |
|---------------|--------|
| Single-use templates | Complete governance framework |
| "Be helpful" instructions | Authority model with accountability |
| Hope AI remembers context | STATE.json + HANDOFF protocol |
| Trust AI output | Citation Protocol with confidence levels |
| Accept verbose responses | Behavioral Firewalls suppress defaults |
| AI decides what to do | Director approves, AI executes |
| No compliance verification | 5-layer enforcement architecture |
| Generic prompts | Platform-specific optimizations |
| Assume functionality works | Visual Audit + Locking system |
| Carry forward old findings | Post-Fix Re-Verification Protocol |

---

# PART 8: PRICING & PACKAGES

| Package | Price | Best For |
|---------|-------|----------|
| **Starter** | $4.99 | First-time users, free-tier AI |
| **Platform Packs** | $4.99-$9.99 | Users of specific AI platforms |
| **Genesis** | $12.99 | Building projects from scratch |
| **Builder Bundle** | $17.99 | Templates and tools collection |
| **Complete** | $29.99 | Everything — all variants, all tools |

---

# PART 9: FEATURE ORIGIN MATRIX

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
| 4-State Locking | Director Requirement | Regression prevention |
| Visual Audit | Director Requirement | Assumed functionality |
| Build-Upon Protocol | Director Requirement | Foundation verification |
| Post-Fix Re-Verification | Session 5 Discovery | Cached findings errors |

---

# PART 10: FEATURES DEFERRED TO v3.3

| Feature | Description | Complexity |
|---------|-------------|------------|
| Constitutional Guardrails | Safety checks before EXECUTE + SAFETY HALT | High |
| Phase-Specific Thinking Modes | DISCOVER=Curious, BRAINSTORM=Divergent, EXECUTE=Precise, AUDIT=Skeptic | Medium |
| Verification Waterfall | [WEB] > [DOC] > [KB] > [TRAIN] > [INFERENCE] priority | Medium |
| Governance Hash Enforcement | SHA256 hash to detect governance drift | Medium |
| HALT Types Taxonomy | 12+ specific HALT types with triggers | Low |

---

# APPENDIX A: THE AIXORD GUARANTEE

1. **Works Across Platforms** — Claude, ChatGPT, Gemini, Copilot, DeepSeek, and more
2. **Session Continuity** — Never lose work between conversations
3. **Behavioral Control** — AI does what you want, nothing more
4. **Full Transparency** — See reasoning, sources, and assumptions
5. **Legal Protection** — Built-in disclaimer and responsibility framework
6. **Project Completion** — Decomposition → Execution → Verification → Production

---

# APPENDIX B: QUICK START

1. **Purchase** your variant from Gumroad or Amazon KDP
2. **Paste** the governance file into your AI conversation
3. **Type** `PMERIT CONTINUE`
4. **Accept** the disclaimer
5. **State** your project objective
6. **Work** with a disciplined, accountable AI

---

*AIXORD v3.2.1+ — Authority. Execution. Verification.*
*Transform chaotic AI conversations into production-ready projects.*

**© 2026 PMERIT LLC. All Rights Reserved.**