# AIXORD for Agile Teams

**AI Execution Governance Integrated with Scrum Methodology**

**Version:** 1.0  
**AIXORD Version:** 3.3  
**Publisher:** PMERIT LLC  
**Date:** January 2026

---

## Executive Summary

### The Problem

Agile teams have refined methodologies for iterative, human-driven development. But when teams adopt AI assistants (ChatGPT, Claude, Gemini, Copilot), they lose the discipline that makes Agile work:

- **No sprint boundaries** — AI doesn't respect iteration limits
- **No Definition of Done** — AI declares "complete" without acceptance criteria
- **No backlog discipline** — AI scope creeps within conversations
- **No retrospective learning** — AI doesn't carry lessons forward

The result: AI becomes a source of technical debt, half-finished features, and violated sprint commitments.

### The Solution

**AIXORD** (AI Execution Order) brings governance to AI-assisted work. AIXORD v3.3 introduces features that map directly to Scrum:

| Scrum Concept | AIXORD v3.3 Feature |
|---------------|---------------------|
| **Product Backlog** | MASTER_SCOPE (all deliverables) |
| **Sprint Backlog** | Active SCOPE (current focus) |
| **Sprint Planning** | Ideation Kingdom phases |
| **Sprint Commitment** | 🚪 IDEATION GATE |
| **Sprint Execution** | Realization Kingdom |
| **Definition of Done** | VERIFY + LOCK |
| **Sprint Review** | AUDIT phase |
| **Retrospective** | HANDOFF carryforward |

### Why AI Needs Agile Governance

Without AIXORD, AI assistants will:
- Start implementing before requirements are clear
- Change scope mid-task without approval
- Skip testing and validation
- Forget context between sessions

With AIXORD, AI assistants:
- Cannot execute until sprint backlog is locked
- Stay focused on committed scope
- Verify acceptance criteria before marking complete
- Document learnings for next iteration

---

## Part 1: AIXORD Fundamentals for Agile Practitioners

### 1.1 The Authority Model

Scrum has defined roles (Product Owner, Scrum Master, Development Team). AIXORD maps these for AI interaction:

| AIXORD Role | Scrum Equivalent | Responsibility |
|-------------|------------------|----------------|
| **Director** (Human) | Product Owner | Decides WHAT to build, approves all scope |
| **AI Assistant** | Development Team | Recommends HOW, executes approved work |
| **AIXORD Governance** | Scrum Master | Enforces process, prevents violations |

**Golden Rule:** The AI is never the Product Owner. You decide what gets built. The AI decides how to build what you've approved.

### 1.2 The Two Kingdoms Framework

AIXORD v3.3 introduces a hard separation between planning and doing — philosophically identical to Scrum's sprint boundary.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        IDEATION KINGDOM                                 │
│                                                                         │
│   Purpose: Define WHAT to build this sprint                             │
│   Scrum Equivalent: Sprint Planning + Backlog Refinement                │
│                                                                         │
│   Phases: DECISION → DISCOVER → BRAINSTORM → OPTIONS → ASSESS           │
│                                                                         │
│   Output: MASTER_SCOPE with prioritized, estimated deliverables         │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
                      ┌────────────────────────────────┐
                      │      🚪 IDEATION GATE          │
                      │                                │
                      │    SPRINT COMMITMENT           │
                      │                                │
                      │  "We commit to these stories"  │
                      └────────────────┬───────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       REALIZATION KINGDOM                               │
│                                                                         │
│   Purpose: Build what was committed                                     │
│   Scrum Equivalent: Sprint Execution                                    │
│                                                                         │
│   Phases: EXECUTE → AUDIT → VERIFY → LOCK                               │
│                                                                         │
│   Rule: No scope changes without UNLOCK (protect the sprint)            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Sessions = Sprints

AIXORD structures work into **Sessions**, which function like Sprints:

| Sprint Concept | AIXORD Session Equivalent |
|----------------|---------------------------|
| Sprint timebox | Token/message limits trigger CHECKPOINT |
| Sprint goal | PROJECT OBJECTIVE |
| Sprint backlog | Active SCOPEs |
| Daily standup | Response Headers (status every message) |
| Sprint burndown | Message count tracking |
| Sprint boundary | HANDOFF (clean break, documented state) |

---

## Part 2: Scrum-to-AIXORD Mapping

### 2.1 Product Backlog → MASTER_SCOPE

**Scrum Activity:**
- Maintain prioritized list of all work
- Refine stories with acceptance criteria
- Estimate complexity

**AIXORD Equivalent:**

```
Director: "PMERIT CONTINUE"
AI: [Activates AIXORD, requests license validation]

Director: "PROJECT OBJECTIVE: Build a customer feedback portal with 
          surveys, analytics dashboard, and email notifications"

AI: 
┌──────────────────────────────────┐
│ 📍 Phase: DECISION               │
│ 🎯 Task: Define product backlog  │
│ 🔒 Scope: FEEDBACK_PORTAL        │
└──────────────────────────────────┘

PROJECT OBJECTIVE LOCKED:
"Customer feedback portal with surveys, analytics, notifications"

Let me decompose this into a MASTER_SCOPE (Product Backlog):

MASTER_SCOPE: FEEDBACK_PORTAL
├── D₁: SCOPE_AUTH (User authentication)
├── D₂: SCOPE_SURVEYS (Survey creation & responses)
├── D₃: SCOPE_ANALYTICS (Dashboard & reports)
├── D₄: SCOPE_NOTIFICATIONS (Email system)
└── D₅: SCOPE_ADMIN (Admin panel)

Each Deliverable (D) = Epic
Each will decompose into Steps (S) = User Stories

Ready to refine D₁ first, or prioritize the backlog?
```

**Key AIXORD Features Used:**
- `MASTER_SCOPE` — Product Backlog equivalent
- `Deliverables (D)` — Epics
- `Steps (S)` — User Stories
- `DAG Dependencies` — Story dependencies

### 2.2 Backlog Refinement → BRAINSTORM + OPTIONS

**Scrum Activity:**
- Break epics into stories
- Define acceptance criteria
- Estimate story points

**AIXORD Equivalent:**

```
Director: "Refine SCOPE_SURVEYS"

AI:
┌──────────────────────────────────┐
│ 📍 Phase: BRAINSTORM             │
│ 🎯 Task: Refine SCOPE_SURVEYS    │
│ 🔒 Scope: FEEDBACK_PORTAL        │
└──────────────────────────────────┘

SCOPE_SURVEYS BREAKDOWN:

User Stories (Steps):
┌─────────────────────────────────────────────────────────────────────────┐
│ S₁: Survey Builder                                                      │
│                                                                         │
│ As a: Admin                                                             │
│ I want to: Create surveys with multiple question types                  │
│ So that: I can gather structured feedback                               │
│                                                                         │
│ Acceptance Criteria:                                                    │
│ ☐ Support text, multiple choice, rating scale questions                │
│ ☐ Drag-and-drop question ordering                                      │
│ ☐ Preview before publishing                                            │
│ ☐ Save as draft                                                        │
│                                                                         │
│ Complexity: Medium (3-5 points)                                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ S₂: Survey Response Collection                                          │
│                                                                         │
│ As a: Customer                                                          │
│ I want to: Complete surveys on any device                               │
│ So that: I can provide feedback conveniently                            │
│                                                                         │
│ Acceptance Criteria:                                                    │
│ ☐ Mobile-responsive design                                             │
│ ☐ Progress indicator                                                   │
│ ☐ Save and continue later                                              │
│ ☐ Confirmation on submission                                           │
│                                                                         │
│ Complexity: Medium (3-5 points)                                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ S₃: Response Analytics                                                  │
│                                                                         │
│ As a: Admin                                                             │
│ I want to: See aggregated survey results                                │
│ So that: I can identify trends                                          │
│                                                                         │
│ Acceptance Criteria:                                                    │
│ ☐ Real-time response counts                                            │
│ ☐ Charts for each question type                                        │
│ ☐ Export to CSV                                                        │
│ ☐ Filter by date range                                                 │
│                                                                         │
│ Complexity: High (5-8 points)                                          │
└─────────────────────────────────────────────────────────────────────────┘

Total for SCOPE_SURVEYS: 11-18 story points

Want to refine acceptance criteria further, or move to OPTIONS 
for implementation approach?
```

**Key AIXORD Features Used:**
- `BRAINSTORM` phase — Story decomposition
- User Story format — As a / I want / So that
- Acceptance Criteria — Definition of Done inputs
- Complexity estimation — Story point equivalent

### 2.3 Sprint Planning → ASSESS + IDEATION GATE

**Scrum Activity:**
- Select stories for sprint
- Team commits to sprint goal
- Sprint begins

**AIXORD Equivalent:**

```
Director: "Let's plan a sprint. I want SCOPE_AUTH and S₁ from SCOPE_SURVEYS"

AI:
┌──────────────────────────────────┐
│ 📍 Phase: ASSESS                 │
│ 🎯 Task: Sprint planning         │
│ 🔒 Scope: FEEDBACK_PORTAL        │
└──────────────────────────────────┘

SPRINT BACKLOG PROPOSAL:

Sprint Goal: "Users can log in and admins can create surveys"

Selected Items:
┌─────────────────────────────────────────────────────────────────────────┐
│ SCOPE_AUTH (Full)                                                       │
│ ├── S₁: User registration                    │ 3 pts │ No deps        │
│ ├── S₂: Login/logout                         │ 2 pts │ Depends: S₁    │
│ ├── S₃: Password reset                       │ 2 pts │ Depends: S₁    │
│ └── S₄: Session management                   │ 3 pts │ Depends: S₂    │
│                                              │       │                │
│ SCOPE_SURVEYS (Partial)                                                │
│ └── S₁: Survey Builder                       │ 5 pts │ Depends: AUTH  │
│                                                                        │
│ TOTAL: 15 story points                                                 │
└─────────────────────────────────────────────────────────────────────────┘

DAG Execution Order:
1. AUTH:S₁ (registration) ← Start here
2. AUTH:S₂ (login) 
3. AUTH:S₃ (password reset) ← Can parallel with S₂
4. AUTH:S₄ (sessions)
5. SURVEYS:S₁ (builder) ← Requires AUTH complete

QUALITY CHECK (7 Dimensions):
☑ Best Practices: OAuth 2.0 standard
☑ Completeness: All auth flows covered
☑ Accuracy: Acceptance criteria clear
☑ Sustainability: Standard patterns
☑ Reliability: Error handling defined
☑ User-Friendliness: Mobile-first
☐ Accessibility: Need to verify WCAG

One dimension incomplete. Run "QUALITY CHECK: accessibility" 
or "GATE OVERRIDE: accessibility deferred to next sprint"?

Director: "GATE OVERRIDE: accessibility deferred to next sprint"

AI:
┌─────────────────────────────────────────────────────────────────────────┐
│ ⚠️ GATE OVERRIDE LOGGED                                                 │
│                                                                         │
│ Dimension: Accessibility                                                │
│ Reason: Deferred to next sprint                                         │
│ Approved by: Director                                                   │
│                                                                         │
│ This will appear in HANDOFF for next sprint planning.                  │
└─────────────────────────────────────────────────────────────────────────┘

Ready to commit. Type "FINALIZE PLAN" to lock sprint backlog.

Director: "FINALIZE PLAN"

AI:
┌─────────────────────────────────────────────────────────────────────────┐
│ ✅ IDEATION GATE PASSED — SPRINT COMMITTED                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Sprint Backlog: LOCKED                                                  │
│ Sprint Goal: "Users can log in and admins can create surveys"          │
│                                                                         │
│ Committed Stories: 5                                                    │
│ Story Points: 15                                                        │
│                                                                         │
│ Entering REALIZATION KINGDOM (Sprint Execution)                         │
│                                                                         │
│ First eligible story: AUTH:S₁ (User registration)                      │
│                                                                         │
│ Command: "UNLOCK: AUTH:S₁" to begin                                    │
│                                                                         │
│ ⚠️ Sprint is protected. No scope changes without REASSESS command.     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key AIXORD Features Used:**
- `ASSESS` phase — Sprint planning
- `FINALIZE PLAN` — Sprint commitment
- `IDEATION GATE` — Protects sprint from scope creep
- `DAG` — Story dependencies and execution order
- `GATE OVERRIDE` — Documented technical debt

### 2.4 Sprint Execution → EXECUTE (Realization Kingdom)

**Scrum Activity:**
- Implement committed stories
- Daily standups
- Maintain sprint burndown

**AIXORD Equivalent:**

```
Director: "UNLOCK: AUTH:S₁"

AI:
┌──────────────────────────────────┐
│ 📍 Phase: EXECUTE                │
│ 🎯 Task: AUTH:S₁ (Registration)  │
│ 🔒 Scope: Sprint 1               │
│ 🏰 Kingdom: REALIZATION          │
│ 📊 Progress: 1/5 stories         │
│ 💬 Msg: 12/25 threshold          │
└──────────────────────────────────┘

STORY: User Registration
ACCEPTANCE CRITERIA:
☐ Email/password registration
☐ Email validation
☐ Password strength requirements
☐ Duplicate email prevention

IMPLEMENTATION APPROACH:

1. Database schema for users table
2. Registration API endpoint
3. Email validation service integration
4. Frontend registration form

Proceeding with step 1...

[AI implements, then reports]

STEP 1 COMPLETE: Database schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Proceeding with step 2...

[Continues through implementation]

AUTH:S₁ IMPLEMENTATION COMPLETE

Acceptance Criteria Status:
☑ Email/password registration — Implemented
☑ Email validation — Integrated with SendGrid
☑ Password strength — Min 8 chars, 1 number, 1 special
☑ Duplicate email prevention — Unique constraint + API check

Ready for AUDIT. Command: "AUDIT: AUTH:S₁"
```

**Key AIXORD Features Used:**
- `EXECUTE` phase — Implementation only
- Response Header — Daily standup equivalent (status every message)
- Progress tracking — Burndown visibility
- Acceptance Criteria checklist — Definition of Done tracking

### 2.5 Definition of Done → AUDIT + VERIFY + LOCK

**Scrum Activity:**
- Verify story meets acceptance criteria
- Demo to Product Owner
- Mark as Done

**AIXORD Equivalent:**

```
Director: "AUDIT: AUTH:S₁"

AI:
┌──────────────────────────────────┐
│ 📍 Phase: AUDIT                  │
│ 🎯 Task: Verify AUTH:S₁          │
│ 🔒 Scope: Sprint 1               │
└──────────────────────────────────┘

DEFINITION OF DONE CHECK:

Story: User Registration

ACCEPTANCE CRITERIA:
☑ Email/password registration    │ PASS │ Tested with 3 scenarios
☑ Email validation              │ PASS │ Verification email sends
☑ Password strength             │ PASS │ Validation working
☑ Duplicate email prevention    │ PASS │ Returns 409 Conflict

CODE QUALITY:
☑ No hardcoded values
☑ Error handling present
☑ Input validation complete
☑ SQL injection prevented

DOCUMENTATION:
☑ API endpoint documented
☑ Database schema documented
☐ User-facing help text — MISSING

AUDIT RESULT: ⚠️ CONDITIONAL PASS

One documentation item missing. Options:
A) Fix now: Add help text
B) Accept: "VERIFY: AUTH:S₁" (document in tech debt)

Director: "Fix now"

AI: 
[Adds help text to registration form]

DOCUMENTATION:
☑ User-facing help text — ADDED

AUDIT RESULT: ✅ PASS

All acceptance criteria met. Command: "LOCK: AUTH:S₁" to mark Done.

Director: "LOCK: AUTH:S₁"

AI:
┌──────────────────────────────────┐
│ 🔒 AUTH:S₁: DONE                 │
│                                  │
│ Status: VERIFIED + LOCKED        │
│ Story Points: 3 ✅               │
│                                  │
│ Sprint Progress: 3/15 points     │
│ Stories: 1/5 complete            │
│                                  │
│ Next eligible: AUTH:S₂ (Login)   │
└──────────────────────────────────┘
```

**Key AIXORD Features Used:**
- `AUDIT` — Story verification
- Definition of Done checklist — Comprehensive quality gate
- `LOCK` — Story marked Done, immutable
- Progress tracking — Sprint burndown update

### 2.6 Sprint Review → Session Summary

**Scrum Activity:**
- Demo completed work
- Gather feedback
- Update product backlog

**AIXORD Equivalent:**

```
Director: "CHECKPOINT"

AI:
┌─────────────────────────────────────────────────────────────────────────┐
│ 📊 SPRINT CHECKPOINT — Session Summary                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ SPRINT GOAL: "Users can log in and admins can create surveys"          │
│                                                                         │
│ COMPLETED (LOCKED):                                                     │
│ ☑ AUTH:S₁ — User registration         │ 3 pts │ DONE                  │
│ ☑ AUTH:S₂ — Login/logout              │ 2 pts │ DONE                  │
│ ☑ AUTH:S₃ — Password reset            │ 2 pts │ DONE                  │
│ ☑ AUTH:S₄ — Session management        │ 3 pts │ DONE                  │
│                                                                        │
│ IN PROGRESS:                                                           │
│ ◐ SURVEYS:S₁ — Survey Builder         │ 5 pts │ 60% complete          │
│                                                                        │
│ VELOCITY THIS SESSION: 10 points complete, 3 in progress               │
│                                                                         │
│ BLOCKERS: None                                                          │
│                                                                         │
│ DEFERRED ITEMS (Tech Debt):                                            │
│ • Accessibility audit (logged at gate)                                 │
│                                                                         │
│ DECISIONS MADE:                                                         │
│ • OAuth 2.0 for authentication                                         │
│ • SendGrid for email                                                   │
│ • PostgreSQL for database                                              │
│                                                                         │
│ Continue working, or "HANDOFF" to end sprint?                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.7 Retrospective → HANDOFF Carryforward

**Scrum Activity:**
- What went well?
- What needs improvement?
- Action items for next sprint

**AIXORD Equivalent:**

```
Director: "HANDOFF"

AI:
┌─────────────────────────────────────────────────────────────────────────┐
│ 📋 SPRINT HANDOFF — Retrospective + Carryforward                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ SPRINT RESULTS:                                                         │
│ • Goal: ⚠️ PARTIAL (Auth complete, Surveys incomplete)                 │
│ • Committed: 15 points                                                  │
│ • Completed: 10 points                                                  │
│ • Velocity: 67%                                                        │
│                                                                         │
│ WHAT WENT WELL:                                                         │
│ ✅ Auth implementation was smooth                                       │
│ ✅ DAG dependencies prevented blocked work                             │
│ ✅ All acceptance criteria were testable                               │
│                                                                         │
│ WHAT NEEDS IMPROVEMENT:                                                 │
│ ⚠️ Survey builder was underestimated (5 pts → actually 8)             │
│ ⚠️ Accessibility deferred — needs to be Sprint 2 priority             │
│                                                                         │
│ CARRYFORWARD (Next Sprint Must Address):                               │
│ 1. SURVEYS:S₁ — 40% remaining                                          │
│ 2. Accessibility audit for AUTH                                        │
│ 3. Re-estimate remaining SURVEYS stories                               │
│                                                                         │
│ RESEARCH FINDINGS (Learnings):                                          │
│ • SendGrid rate limits: 100 emails/day on free tier                    │
│ • Survey builder drag-drop needs specific library                      │
│                                                                         │
│ NEXT SPRINT RECOMMENDED FOCUS:                                          │
│ • Complete SURVEYS:S₁ (carryover)                                      │
│ • SURVEYS:S₂ (response collection)                                     │
│ • Accessibility remediation                                            │
│                                                                         │
│ SESSION STATE SAVED                                                     │
│ Next session: "RECOVER" to resume from this point                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key AIXORD Features Used:**
- `HANDOFF` — Sprint retrospective + state preservation
- `CARRYFORWARD` — Explicit items for next sprint
- `RESEARCH_FINDINGS` — Learnings preserved
- Velocity tracking — Improves estimation over time

---

## Part 3: DAG Dependencies = Story Dependencies

### 3.1 Why Dependencies Matter

Scrum teams use dependency mapping to prevent blocked work. AIXORD uses DAGs for the same purpose:

```
Sprint Backlog DAG:

         ┌──────────────┐
         │ AUTH:S₁      │ ← Start here (no dependencies)
         │ Registration │
         └──────┬───────┘
                │
      ┌─────────┼─────────┐
      ▼         ▼         ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│AUTH:S₂  │ │AUTH:S₃  │ │         │
│ Login   │ │Password │ │(parallel│
│         │ │ Reset   │ │eligible)│
└────┬────┘ └─────────┘ └─────────┘
     │
     ▼
┌─────────┐
│AUTH:S₄  │
│Sessions │
└────┬────┘
     │
     ▼
┌─────────────┐
│SURVEYS:S₁   │ ← Requires AUTH complete
│Survey Build │
└─────────────┘
```

### 3.2 DAG Commands for Sprint Management

| Command | Effect | Scrum Equivalent |
|---------|--------|------------------|
| `SHOW DAG` | Display dependency graph | Dependency board |
| `DAG STATUS` | Show unblocked stories | Available work |
| `CHECK DEPENDENCIES: [story]` | Verify prerequisites | Blocked check |

### 3.3 Parallel Execution

When multiple stories have no dependencies on each other, AI identifies parallel opportunities:

```
Director: "DAG STATUS"

AI:
CURRENT DAG STATUS:

✅ COMPLETE (LOCKED):
• AUTH:S₁ (Registration)

🟢 ELIGIBLE (No blockers):
• AUTH:S₂ (Login) — depends on S₁ ✅
• AUTH:S₃ (Password Reset) — depends on S₁ ✅

⏸️ BLOCKED:
• AUTH:S₄ (Sessions) — waiting on S₂
• SURVEYS:S₁ (Builder) — waiting on AUTH complete

PARALLEL OPPORTUNITY:
AUTH:S₂ and AUTH:S₃ can be worked simultaneously.
```

---

## Part 4: Handling Scope Changes (Without Breaking Sprints)

### 4.1 The Problem

Scrum protects sprints from scope creep. But reality sometimes requires changes. AIXORD provides controlled mechanisms:

### 4.2 Three Levels of Change

| Level | Command | When to Use | Scrum Equivalent |
|-------|---------|-------------|------------------|
| **Story Fix** | `REASSESS: [STORY]` | One story needs rework | Re-open story |
| **Sprint Pivot** | `GATE REOPEN: [reason]` | Sprint goal compromised | Sprint cancellation |
| **Fresh Start** | `RESET: DECISION` | Product direction changed | New product backlog |

### 4.3 Example: Story Reassessment

```
Director: "The login story needs OAuth integration, not just 
          email/password. We missed this requirement."

Director: "REASSESS: AUTH:S₂"

AI:
┌──────────────────────────────────┐
│ ⚠️ STORY REASSESSMENT            │
│ AUTH:S₂ unlocked for replanning  │
└──────────────────────────────────┘

What blocked progress on AUTH:S₂?
□ Requirements changed?
□ Technical blocker?
□ Dependency issue?

Director: "Requirements changed — need Google OAuth, not just email/password"

AI:
┌──────────────────────────────────┐
│ 📍 Phase: OPTIONS                │
│ 🎯 Task: Reassess AUTH:S₂        │
│ ⚠️ Status: REASSESSMENT MODE     │
└──────────────────────────────────┘

REVISED OPTIONS:

Option A: Add OAuth alongside email/password
├── Impact: +3 story points
├── Sprint impact: May not complete SURVEYS:S₁
└── Risk: Low

Option B: Replace email/password with OAuth only
├── Impact: +1 story point
├── Sprint impact: Minimal
└── Risk: Medium (some users prefer email)

Option C: Defer OAuth to Sprint 2
├── Impact: No change to Sprint 1
├── Sprint impact: None
└── Risk: Technical debt

Director approval required. Sprint commitment will be updated.

Director: "Option A — we need both"

AI:
┌──────────────────────────────────────────────────────────────────────────┐
│ 📋 SPRINT COMMITMENT UPDATED                                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ CHANGE: AUTH:S₂ expanded (+3 points)                                    │
│                                                                          │
│ Original commitment: 15 points                                           │
│ New commitment: 18 points                                                │
│                                                                          │
│ IMPACT ASSESSMENT:                                                       │
│ • SURVEYS:S₁ may not complete this sprint                               │
│ • Recommend: Move SURVEYS:S₁ to Sprint 2                                │
│                                                                          │
│ REASSESSMENT LOGGED in Decision Ledger                                  │
│                                                                          │
│ AUTH:S₂ re-locked with new acceptance criteria.                         │
│ Continue with "UNLOCK: AUTH:S₂"                                         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Anti-Abuse Safeguards

To prevent reassessment from destroying sprint discipline:

1. **Reason required** — Cannot change without explaining why
2. **Logged permanently** — All changes in Decision Ledger
3. **Impact shown** — Sprint commitment recalculated
4. **Escalating friction** — 3rd change triggers "sprint health" warning

---

## Part 5: Daily Workflow Integration

### 5.1 AIXORD Response Header = Daily Standup

Every AI response includes status:

```
┌──────────────────────────────────┐
│ 📍 Phase: EXECUTE                │  ← What I'm doing
│ 🎯 Task: AUTH:S₂ (Login)         │  ← Current story
│ 📊 Progress: 2/5 stories         │  ← Sprint burndown
│ 🔒 Scope: Sprint 1               │  ← Sprint context
│ 💬 Msg: 18/25 threshold          │  ← Session health
└──────────────────────────────────┘
```

This mirrors standup questions:
- What did I do? (Phase + Task)
- What will I do? (Current story)
- Any blockers? (DAG STATUS shows blocks)

### 5.2 Message Thresholds = Sprint Timebox

| Messages | Action | Scrum Equivalent |
|----------|--------|------------------|
| 1-10 | Work normally | Sprint in progress |
| 15 | ⚠️ "Consider CHECKPOINT soon" | Mid-sprint |
| 20 | 🚨 "Strongly recommend CHECKPOINT" | Sprint nearing end |
| 25 | "Quality may degrade. CHECKPOINT now." | Sprint end |
| 30 | Auto-generate CHECKPOINT | Forced sprint close |

### 5.3 Recommended Session Structure

| Activity | Command | Duration |
|----------|---------|----------|
| Start session | `PMERIT CONTINUE` or `RECOVER` | 1 min |
| Review state | (automatic status display) | 2 min |
| Work on stories | `UNLOCK`, `EXECUTE`, `AUDIT`, `LOCK` | Main work |
| Mid-session check | `CHECKPOINT` | 5 min |
| End session | `HANDOFF` | 5 min |

---

## Part 6: The AIXORD Trail — Sprint Documentation That Persists

### 6.1 Why Trail Matters for Agile Teams

Agile values "working software over comprehensive documentation" — but that doesn't mean NO documentation. AIXORD produces just-enough documentation automatically:

| Agile Need | AIXORD Artifact | Generated When |
|------------|-----------------|----------------|
| Product Vision | PROJECT OBJECTIVE | Session start |
| Backlog | MASTER_SCOPE | Planning phases |
| Sprint Commitment | Ideation Gate record | FINALIZE PLAN |
| Story Completion | LOCK status per story | After AUDIT |
| Velocity Data | Message/point tracking | Per session |
| Retrospective Notes | HANDOFF carryforward | Session end |
| Definition of Done Evidence | AUDIT results | Verification phase |

### 6.2 Trail Artifacts for Scrum Teams

| Artifact | Content | Scrum Equivalent |
|----------|---------|------------------|
| **Decision Ledger** | Every APPROVED decision | Sprint decisions |
| **HANDOFF Documents** | Session state, carryover items | Retrospective output |
| **STATE.json** | Current sprint snapshot | Sprint burndown data |
| **SCOPE Files** | Story specs, acceptance criteria | User story documentation |
| **Reasoning Traces** | Why AI recommended approaches | Technical decision records |
| **CHECKPOINT Documents** | Mid-sprint saves | Sprint checkpoints |

### 6.3 Solving Agile Documentation Gaps

**Problem:** Agile teams often have poor institutional memory.

| Common Agile Gap | AIXORD Solution |
|------------------|-----------------|
| "Why did we build it this way?" | Decision Ledger with reasoning |
| "What did we try that didn't work?" | HANDOFF carryforward captures failures |
| "What was the original requirement?" | SCOPE files preserve original specs |
| "Who approved this change?" | All approvals timestamped |
| Sprint knowledge lost between teams | HANDOFF enables clean handoffs |

### 6.4 Async Team Collaboration

For distributed teams, the trail enables:

```
Team Member A (US Timezone)
├── Works on SCOPE_AUTH
├── Completes stories, runs AUDIT
├── Creates HANDOFF at end of day
└── HANDOFF includes: what's done, what's blocked, next steps

Team Member B (EU Timezone)
├── Reads HANDOFF_SESSION_1.md
├── Instantly knows current state
├── Continues from exact stopping point
└── No "sync meeting" needed
```

### 6.5 Sample Sprint Trail

After a sprint, your AIXORD trail includes:

```
SPRINT 1: User Authentication
├── MASTER_SCOPE.md             ← Product backlog snapshot
├── DECISION_LEDGER.md          ← All sprint decisions
├── SPRINT_COMMITMENT.md        ← What was committed at gate
├── SCOPE_AUTH/
│   ├── S1_REGISTRATION/
│   │   ├── ACCEPTANCE_CRITERIA.md
│   │   ├── AUDIT_RESULTS.md
│   │   └── STATUS: LOCKED ✅
│   ├── S2_LOGIN/
│   │   └── STATUS: LOCKED ✅
│   └── S3_PASSWORD_RESET/
│       └── STATUS: LOCKED ✅
├── HANDOFF_SPRINT_1.md         ← Retrospective + carryforward
├── VELOCITY: 10 points
└── STATE.json                  ← Sprint end state
```

### 6.6 Value for Agile at Scale

For SAFe, LeSS, or multi-team Scrum:

| Scale Challenge | Trail Solution |
|-----------------|----------------|
| Cross-team dependencies | DAG shows dependencies across teams |
| Program-level visibility | Roll up SCOPE status across teams |
| Audit requirements | Automatic compliance documentation |
| New team onboarding | Read trail, understand history |

---

## Part 7: Implementation Guide

### 7.1 Prerequisites

| Requirement | Details |
|-------------|---------|
| AI Platform | ChatGPT Plus/Pro, Claude Pro, Gemini Advanced, or Copilot |
| Agile Knowledge | Scrum fundamentals recommended |
| AIXORD Package | Platform-specific governance files |

### 7.2 Setup Steps

1. **Download** AIXORD package for your AI platform
2. **Configure** AI with governance file (Custom GPT, Claude Project, or Gem)
3. **Activate** with "PMERIT CONTINUE" command
4. **Validate** license and accept disclaimer
5. **Set** project objective (your product vision)

### 7.3 Mapping Your Existing Backlog

If you have an existing Jira/Trello/Azure DevOps backlog:

```
Director: "I have an existing backlog. Here are my epics:
          1. User Authentication
          2. Payment Processing  
          3. Reporting Dashboard
          
          Import these as MASTER_SCOPE"

AI: 
MASTER_SCOPE imported:
├── D₁: SCOPE_AUTH (User Authentication)
├── D₂: SCOPE_PAYMENTS (Payment Processing)
├── D₃: SCOPE_REPORTS (Reporting Dashboard)

Ready to refine each into stories. Start with D₁?
```

---

## Part 8: Command Reference for Agile Teams

### Backlog Commands (Ideation Kingdom)

| Command | Effect | Scrum Equivalent |
|---------|--------|------------------|
| `PROJECT OBJECTIVE: [text]` | Set product vision | Product goal |
| `BRAINSTORM` | Decompose into stories | Backlog refinement |
| `OPTIONS` | Evaluate approaches | Technical planning |
| `ASSESS` | Sprint planning | Sprint planning |
| `FINALIZE PLAN` | Commit to sprint | Sprint commitment |

### Sprint Commands (Realization Kingdom)

| Command | Effect | Scrum Equivalent |
|---------|--------|------------------|
| `UNLOCK: [STORY]` | Begin work on story | Pull from backlog |
| `EXECUTE` | Implementation mode | Development |
| `AUDIT: [STORY]` | Verify acceptance criteria | Story review |
| `LOCK: [STORY]` | Mark as Done | Definition of Done |
| `SHOW DAG` | Display dependencies | Dependency board |

### Session Commands

| Command | Effect | Scrum Equivalent |
|---------|--------|------------------|
| `CHECKPOINT` | Save state, continue | Mid-sprint save |
| `HANDOFF` | End sprint, document state | Sprint retrospective |
| `RECOVER` | Resume from handoff | Next sprint start |

### Change Commands

| Command | Effect | Scrum Equivalent |
|---------|--------|------------------|
| `REASSESS: [STORY]` | Unlock story for replanning | Re-open story |
| `GATE REOPEN: [reason]` | Return to planning | Sprint cancellation |
| `RESET: DECISION` | Fresh product backlog | New product |

---

## Appendix A: Scrum ↔ AIXORD Quick Reference

```
┌─────────────────────────────────────────────────────────────────────────┐
│ SCRUM → AIXORD MAPPING                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ARTIFACTS                                                               │
│ ┌─────────────────┐   ┌─────────────────┐                              │
│ │ Product Backlog │ → │ MASTER_SCOPE    │  All deliverables            │
│ └─────────────────┘   └─────────────────┘                              │
│ ┌─────────────────┐   ┌─────────────────┐                              │
│ │ Sprint Backlog  │ → │ Active SCOPEs   │  Committed work              │
│ └─────────────────┘   └─────────────────┘                              │
│ ┌─────────────────┐   ┌─────────────────┐                              │
│ │ Increment       │ → │ LOCKED Stories  │  Done work                   │
│ └─────────────────┘   └─────────────────┘                              │
│                                                                         │
│ EVENTS                                                                  │
│ ┌─────────────────┐   ┌─────────────────┐                              │
│ │ Sprint Planning │ → │ ASSESS + GATE   │  Commit to scope             │
│ └─────────────────┘   └─────────────────┘                              │
│ ┌─────────────────┐   ┌─────────────────┐                              │
│ │ Daily Standup   │ → │ Response Header │  Status every message        │
│ └─────────────────┘   └─────────────────┘                              │
│ ┌─────────────────┐   ┌─────────────────┐                              │
│ │ Sprint Review   │ → │ CHECKPOINT      │  Demo completed work         │
│ └─────────────────┘   └─────────────────┘                              │
│ ┌─────────────────┐   ┌─────────────────┐                              │
│ │ Retrospective   │ → │ HANDOFF         │  Lessons + carryforward      │
│ └─────────────────┘   └─────────────────┘                              │
│                                                                         │
│ ROLES                                                                   │
│ ┌─────────────────┐   ┌─────────────────┐                              │
│ │ Product Owner   │ → │ Director        │  Decides WHAT                │
│ └─────────────────┘   └─────────────────┘                              │
│ ┌─────────────────┐   ┌─────────────────┐                              │
│ │ Dev Team        │ → │ AI Assistant    │  Implements HOW              │
│ └─────────────────┘   └─────────────────┘                              │
│ ┌─────────────────┐   ┌─────────────────┐                              │
│ │ Scrum Master    │ → │ AIXORD Governance│  Enforces process           │
│ └─────────────────┘   └─────────────────┘                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix B: Sprint Template

Use this template for each AIXORD-powered sprint:

```
SPRINT: [Number]
DATES: [Start] - [End]
AIXORD SESSION: [Session ID]

SPRINT GOAL:
[One sentence describing sprint objective]

COMMITTED STORIES:
| Story | Points | Dependencies | Status |
|-------|--------|--------------|--------|
|       |        |              |        |

TOTAL POINTS: [X]

DEFINITION OF DONE:
☐ Acceptance criteria met
☐ Code reviewed
☐ Tests passing
☐ Documentation updated
☐ AUDIT passed
☐ LOCKED in AIXORD

RETROSPECTIVE:
What went well:
- 

What needs improvement:
- 

CARRYFORWARD:
- 

VELOCITY: [X] points completed
```

---

## Appendix C: Obtaining AIXORD

### Available Packages

| Platform | Product | Price |
|----------|---------|-------|
| Claude | AIXORD for Claude | $9.99 |
| ChatGPT | AIXORD for ChatGPT | $9.99 |
| Gemini | AIXORD for Gemini | $7.99 |
| Copilot | AIXORD for Copilot | $7.99 |
| All Platforms | AIXORD Professional | $19.99 |

### Download

Visit: **pmerit.gumroad.com**

### Discount for This Guide

Use code: **AX-AGILE-SPRINT** for 20% off any AIXORD package.

---

*AIXORD for Agile Teams — Bringing sprint discipline to AI-assisted development.*

*© 2026 PMERIT LLC. All rights reserved.*
