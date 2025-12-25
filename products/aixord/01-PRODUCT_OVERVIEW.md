# AIXORD: AI Execution Order Framework — Product Overview

---

## What is AIXORD?

**AIXORD (AI Execution Order)** is a structured methodology for AI-human collaboration, inspired by military OPORD (Operations Order) doctrine.

> **AIXORD Definition:** A guardrailed execution order issued by an AI system to a human operator, requiring sequential action, single-task focus, and explicit confirmation before proceeding.

**Core Principles:**
- **Authority** — Orders, not suggestions
- **Execution** — Sequential, confirmable tasks
- **Confirmation** — Evidence before proceeding

---

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

---

## The Solution: AIXORD Framework

A **methodology + template pack** that creates structured execution orders between you and your AI assistants.

### Core Concept: Reality-First Workflow

```
Traditional (Spec-First):
  Write Spec → Implement → Discover spec was wrong → Redo

AIXORD (Reality-First):
  Audit Reality → Write Spec Based on Facts → Implement → Update Findings
```

### How AIXORD Differs from Prompts

| Prompt | AIXORD |
|--------|--------|
| Suggestive | Directive |
| Stateless | State-aware |
| Multi-output | Single-action |
| Informational | Executable |
| AI-centered | Human-executed |

### Three-Way Team Structure

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ CLAUDE WEB  │◄────►│     YOU     │◄────►│ CLAUDE CODE │
│ (Architect) │      │ (Director)  │      │(Implementer)│
└─────────────┘      └─────────────┘      └─────────────┘
     │                     │                     │
     │ Strategy            │ Decisions           │ Execution
     │ Brainstorming       │ Approvals           │ Quality Review
     │ Specifications      │ Coordination        │ Implementation
```

### Hierarchical Scope Management

```
MASTER_SCOPE.md          ← Project vision (single source of truth)
    │
    ├── SCOPE_AUTH.md        ← Authentication feature
    ├── SCOPE_DASHBOARD.md   ← Dashboard feature
    ├── SCOPE_PAYMENTS.md    ← Payments feature
    └── ...
```

Each scope contains:
- **AUDIT_REPORT** — Current reality (populated by Claude Code)
- **HANDOFF_DOCUMENT** — Specifications (populated by Claude Web)
- **RESEARCH_FINDINGS** — Implementation notes (populated by Claude Code)
- **DECISION_LOG** — Decisions with ACTIVE/NO-GO/EXPERIMENTAL states

---

## AIXORD Execution Flow

### Step 1: Director Creates Empty Scope
```
You: Create SCOPE_FEATURE.md in .claude/scopes/
You: Commit to repo
```

### Step 2: Claude Code Audits Reality
```
You → Claude Code: "AUDIT SCOPE: FEATURE"
Claude Code: Examines codebase, populates AUDIT_REPORT
```

### Step 3: Director Shares with Architect
```
You → Claude Web: "Here's the audit report for FEATURE"
```

### Step 4: Architect + Director Collaborate
```
Claude Web + You: Brainstorm based on FACTS
Claude Web: Updates SCOPE_FEATURE.md with HANDOFF_DOCUMENT
```

### Step 5: Director Triggers Implementation
```
You → Claude Code: "SCOPE UPDATED: FEATURE"
Claude Code: Reads specs, recommends alternatives if better, implements
```

### Step 6: Claude Code Updates Findings
```
Claude Code: Updates RESEARCH_FINDINGS with what was done
```

### Step 7: Confirm and Repeat
```
You: Verify completion, provide "DONE" confirmation
REPEAT until feature complete
```

---

## What's Included

### Templates
| File | Purpose |
|------|---------|
| `CLAUDE.md` | Instructions for Claude Code (Implementer role) |
| `CLAUDE_WEB_SYNC.md` | Mirror of Claude Web instructions |
| `MASTER_SCOPE.md` | Project vision template |
| `SCOPE_TEMPLATE.md` | Per-feature scope template |
| `STATE.json` | Machine-readable state tracking |
| `GOVERNANCE.md` | Workflow rules and protocols |
| `SYSTEM_GUIDE.md` | Complete operational documentation |
| `TASK_TRACKER.md` | Task tracking template |

### AIXORD Commands
| Command | Effect |
|---------|--------|
| `[PROJECT] CONTINUE` | Full session startup protocol |
| `AUDIT SCOPE: [name]` | Claude Code audits reality |
| `SCOPE UPDATED: [name]` | Claude Code implements specs |
| `SCOPE: [name]` | Load existing scope context |
| `DONE` | Confirm task completion |

### Documentation
- Quick Start Guide (15 minutes to setup)
- Complete System Guide (deep reference)
- Example Workflow (real-world usage)

---

## Benefits

| Before AIXORD | After AIXORD |
|---------------|--------------|
| Re-explain context every session | Context persists in scope files |
| Specs become outdated | Reality-first prevents drift |
| Unclear who does what | Clear role separation |
| Progress lost in chat logs | RESEARCH_FINDINGS captures everything |
| Context window overload | Load only active scope |
| Random implementations | Architectural decisions locked |
| Chaotic multi-tool workflows | Structured execution orders |

---

## Who Is This For?

### Ideal Customer
- Solo developer or small team (1-5 people)
- Uses Claude Web AND Claude Code (or similar AI tools)
- Works on projects with multiple features/components
- Frustrated with AI context limits and session resets
- Values documentation and structured workflows
- Wants AI governance, not AI chaos

### Not For
- Teams with existing robust project management
- Developers who don't use AI assistants
- One-off scripts or tiny projects

---

## Technical Requirements

- Git repository (any hosting)
- Claude Pro or Team subscription (for Claude Code)
- Claude.ai account (for Claude Web)
- Text editor (VS Code recommended)

**No additional software required.** The system is pure documentation + workflow.

---

## Origin Story

AIXORD was developed through **75+ real development sessions** on the PMERIT AI Educational Platform — a production web application with:
- Frontend (HTML/CSS/JS)
- Backend API (Cloudflare Workers)
- Database (Neon PostgreSQL)
- AI integrations (OpenAI, Azure TTS)

The methodology evolved from necessity: managing complex features across multiple AI assistants without losing context or creating duplicate work.

The name "AIXORD" emerged from connecting the workflow to military OPORD (Operations Order) doctrine — emphasizing authority, execution discipline, and confirmation gates.

---

## Next Steps

1. **[Quick Start Guide](./02-QUICK_START_GUIDE.md)** — Setup in 15 minutes
2. **[Templates](./templates/)** — Ready-to-use files
3. **[System Guide](./templates/SYSTEM_GUIDE.md)** — Complete reference
4. **[Example Workflow](./05-EXAMPLE_WORKFLOW.md)** — See it in action

---

*AIXORD — Authority. Execution. Confirmation.*
