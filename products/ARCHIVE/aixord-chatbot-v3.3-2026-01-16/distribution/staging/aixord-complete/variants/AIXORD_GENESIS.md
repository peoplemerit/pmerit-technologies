# AIXORD GENESIS — Build Projects from Ideas

**Version:** 2.0
**Purpose:** Transform a brief project idea into a complete, functioning system
**Works With:** Any AI chatbot (ChatGPT, Claude, Gemini, Copilot, etc.)

---

## HOW IT WORKS

Genesis follows the metamorphosis pattern:

```
Session 1:  IDEA → Brief description + initial decisions
Session 2:  IDEA → HANDOFF emerges, RESEARCH begins
Session 3+: IDEA → SCOPEs decompose, implementation starts
Final:      IDEA → Production-Ready System
```

The System Equation governs the transformation:
```
MASTER_SCOPE = Project_Docs = All_SCOPEs = Production-Ready System
```

---

## STARTING A PROJECT

### Step 1: Copy This Entire Section to Your AI

Paste this governance block at the start of your first session:

---

**AIXORD GENESIS PROTOCOL**

You are operating under AIXORD (AI Execution Order) governance.

**Authority Contract:**
- Human (Director): Decides WHAT exists, approves all decisions
- AI (Architect/Commander): Analyzes, recommends, then executes approved work
- Nothing proceeds without explicit human approval

**Modes:**
- DECISION MODE (default): Open discussion, brainstorming, specification writing
- EXECUTION MODE: Decisions frozen, implement approved specs step-by-step
- AUDIT MODE: Read-only investigation, compare reality to documentation

**Commands:**
- `ENTER DECISION MODE` — Open discussion
- `ENTER EXECUTION MODE` — Freeze decisions, begin implementation
- `AUDIT` — Read-only review
- `HALT` — Stop everything, return to DECISION
- `APPROVED` — Proceed with proposal
- `HANDOFF` — Generate session summary for next session
- `STATUS` — Report current state

**Session Behavior:**
- At session start: Report mode, active scope, pending items
- During session: Follow mode rules strictly
- At session end (or when prompted): Generate complete HANDOFF

**Token Tracking:**
- 70% used: Warn about approaching limit
- 80% used: Alert — recommend handoff soon
- 85% used: Auto-trigger handoff generation

**HALT Conditions (automatic):**
- Ambiguous requirement → HALT
- Missing specification → HALT
- Three consecutive failures → HALT
- You're unsure what I want → HALT

Acknowledge these rules, then ask me to describe my project idea.

---

### Step 2: Describe Your Project Idea

After the AI acknowledges AIXORD, describe your project:

**Example:**
```
My project idea: I want to build an automated email archiving solution
for my company. It should store emails in SharePoint, make them searchable,
and provide a dashboard for employees to find old emails quickly.
```

### Step 3: AI Will Help You Evolve the Idea

The AI will:
1. Ask clarifying questions
2. Propose architecture options
3. Document decisions in a DECISION LOG
4. Create initial specifications
5. Decompose into SCOPEs when ready

---

## PROJECT EVOLUTION STAGES

### Stage 1: IDEATION (Sessions 1-2)
```
┌─────────────────────────────────────┐
│  YOUR PROJECT FILE                  │
├─────────────────────────────────────┤
│  GOVERNANCE (this document)         │
│  PROJECT_IDEA (brief description)   │
│  DECISION_LOG (emerging)            │
└─────────────────────────────────────┘
```

### Stage 2: SPECIFICATION (Sessions 3-5)
```
┌─────────────────────────────────────┐
│  YOUR PROJECT FILE                  │
├─────────────────────────────────────┤
│  GOVERNANCE                         │
│  PROJECT_IDEA                       │
│  DECISION_LOG (growing)             │
│  RESEARCH_FINDINGS (emerging)       │
│  HANDOFF_DOCUMENT (emerging)        │
└─────────────────────────────────────┘
```

### Stage 3: DECOMPOSITION (Sessions 5-10)
```
┌─────────────────────────────────────┐
│  YOUR PROJECT FILE (or files)       │
├─────────────────────────────────────┤
│  GOVERNANCE                         │
│  MASTER_SCOPE (vision)              │
│  ├── SCOPE_A (element 1)            │
│  ├── SCOPE_B (element 2)            │
│  └── SCOPE_C (element 3)            │
│  DECISION_LOG                       │
│  RESEARCH_FINDINGS                  │
│  HANDOFF_DOCUMENT                   │
└─────────────────────────────────────┘
```

### Stage 4: EXECUTION (Sessions 10+)
```
┌─────────────────────────────────────┐
│  PROJECT FOLDER                     │
├─────────────────────────────────────┤
│  governance/                        │
│  ├── AIXORD_GOVERNANCE.md           │
│  └── AIXORD_STATE.json              │
│  scopes/                            │
│  ├── MASTER_SCOPE.md                │
│  ├── SCOPE_A.md (COMPLETE)          │
│  ├── SCOPE_B.md (IN_PROGRESS)       │
│  └── SCOPE_C.md (BLOCKED)           │
│  handoffs/                          │
│  └── HANDOFF_SESSION_15.md          │
│  src/                               │
│  └── [your actual code]             │
└─────────────────────────────────────┘
```

---

## HANDOFF FORMAT

At each session end, the AI outputs:

```markdown
# HANDOFF — [Project Name] Session [#]

## Current State
- Mode: [DECISION/EXECUTION]
- Active Scope: [name or "none"]
- Session Date: [date]

## Decisions Made This Session
| ID | Decision | Status |
|----|----------|--------|
| D-001 | [decision] | ACTIVE |

## Completed This Session
- [x] [item 1]
- [x] [item 2]

## Pending (Next Session)
- [ ] [item 3]
- [ ] [item 4]

## Research Findings
[Any new discoveries or technical notes]

## Next Session Priority
1. [First thing to do]
2. [Second thing]
```

Save this handoff. Paste it at the start of your next session.

---

## TIPS FOR SUCCESS

1. **Start small:** Your first session should just clarify the idea
2. **Trust the process:** Let SCOPEs emerge naturally
3. **Save every handoff:** They are your project's memory
4. **Don't skip modes:** DECISION before EXECUTION, always
5. **HALT is your friend:** Ambiguity caught early saves time

---

## WHEN TO EXPAND TO FILES

When your single project file exceeds ~1,000 lines OR you have 3+ SCOPEs, consider expanding to a folder structure:

```
my-project/
├── governance/
│   ├── AIXORD_GOVERNANCE.md
│   └── AIXORD_STATE.json
├── scopes/
│   ├── MASTER_SCOPE.md
│   └── SCOPE_*.md
├── handoffs/
│   └── HANDOFF_*.md
└── src/
    └── [implementation files]
```

---

*AIXORD Genesis v2.0 — From Idea to System*
