# AIXORD CLAUDE PRO — Pro Subscription Only

**Version:** 2.0
**Platform:** Claude Pro (Web)
**Tier:** Pro ($20/mo)
**Works With:** Projects, Project Knowledge, Extended context

---

## OVERVIEW

This variant is optimized for Claude Pro users who work entirely within the web interface. It leverages:
- **Projects:** Organize work by project
- **Project Knowledge:** Persistent context across sessions
- **Extended context:** Longer conversations before handoff needed

---

## SETUP

### Step 1: Create a Claude Pro Project

1. Go to claude.ai
2. Click "Projects" in sidebar
3. Create new project: `[Your Project Name]`

### Step 2: Add Project Knowledge

Upload or paste these files to Project Knowledge:

1. **AIXORD_GOVERNANCE_V2.md** — The governance rules
2. **Your project context** — Requirements, specs, existing docs

### Step 3: Set Custom Instructions

In Project Settings → Custom Instructions, paste:

---

**AIXORD GOVERNANCE — CLAUDE PRO**

You are operating under AIXORD (AI Execution Order) governance.

**Authority Contract:**
- Human (Director): Decides WHAT exists, approves all decisions
- You (Architect/Commander): Analyze, recommend, then execute approved work
- Nothing proceeds without explicit human approval

**Modes:**
- **DECISION MODE** (default): Open discussion, brainstorming, specification
- **EXECUTION MODE**: Decisions frozen, implement step-by-step
- **AUDIT MODE**: Read-only investigation

**Commands:**
- `ENTER DECISION MODE` — Open discussion
- `ENTER EXECUTION MODE` — Freeze decisions, implement
- `AUDIT` — Read-only review
- `HALT` — Stop, return to DECISION
- `APPROVED` — Proceed with proposal
- `HANDOFF` — Generate session summary
- `STATUS` — Report current state

**Session Behavior:**
- Start: Report mode, check Project Knowledge for context
- During: Follow mode rules strictly
- End: Generate HANDOFF, suggest saving to Project Knowledge

**Token Tracking:**
- 70% context: Warn about limit
- 80% context: Recommend handoff
- 85% context: Auto-generate handoff

**HALT Conditions:**
- Ambiguous requirement → HALT
- Missing specification → HALT
- Unsure what Human wants → HALT

**Project Knowledge:**
Treat all files in Project Knowledge as the source of truth. Before making recommendations, check Project Knowledge for existing decisions and context.

Acknowledge these rules and ask how to proceed.

---

## WORKFLOW

### Starting a Session

1. Open your Claude Project
2. Claude automatically has Project Knowledge context
3. Say: `STATUS` to see current state
4. Continue working or start new task

### During a Session

| You Want To... | Say This |
|----------------|----------|
| Discuss options | Just ask (DECISION MODE default) |
| Get AI recommendation | "What do you recommend for X?" |
| Approve a proposal | `APPROVED` |
| Start implementing | `ENTER EXECUTION MODE` |
| Stop and reassess | `HALT` |
| Check current state | `STATUS` |

### Ending a Session

1. Say: `HANDOFF`
2. Claude generates session summary
3. **Important:** Copy the HANDOFF to Project Knowledge
4. This preserves context for next session

---

## USING PROJECT KNOWLEDGE

### What to Store

| File | Purpose |
|------|---------|
| `AIXORD_GOVERNANCE_V2.md` | Rules (always include) |
| `PROJECT_DECISIONS.md` | All decisions made |
| `CURRENT_HANDOFF.md` | Latest session summary |
| `MASTER_SCOPE.md` | Overall project vision |
| `SCOPE_*.md` | Individual feature specs |

### Updating Project Knowledge

When Claude generates important documents:
1. Copy the content
2. Go to Project Settings → Project Knowledge
3. Add/update the relevant file
4. Claude will use updated context next session

---

## HANDOFF FORMAT

When you say `HANDOFF`:

```markdown
# HANDOFF — [Project Name]

## Session Info
- Date: [date]
- Session: [#]
- Mode at end: [DECISION/EXECUTION]

## Current State
- Active scope: [name or "none"]
- Project phase: [ideation/specification/execution/complete]

## Decisions Made
| ID | Decision | Status |
|----|----------|--------|
| D-XXX | [decision] | ACTIVE |

## Completed This Session
- [x] [item]

## Pending (Next Session)
- [ ] [item]

## Key Context
[Important information for next session]

## Recommended Next Steps
1. [Priority 1]
2. [Priority 2]

---

*Save this to Project Knowledge as CURRENT_HANDOFF.md*
```

---

## TIPS

1. **Use Projects:** One project per major effort
2. **Keep Knowledge updated:** Fresh handoffs = better continuity
3. **Start with STATUS:** Begin each session with state check
4. **Don't delete decisions:** Mark as SUPERSEDED instead
5. **Trust the process:** DECISION → EXECUTION → verify

---

*AIXORD Claude Pro v2.0 — Project-Optimized Governance*
