# AIXORD Sprint Template

**Sprint Number:** [#]  
**Sprint Dates:** [Start Date] — [End Date]  
**AIXORD Session ID:** [From HANDOFF]  
**AIXORD Version:** 3.3

---

## Sprint Goal

> [One sentence describing what this sprint will achieve]

---

## Sprint Planning (Ideation Kingdom)

### Committed Stories

| # | Story ID | Story Title | Points | Dependencies | Status |
|---|----------|-------------|--------|--------------|--------|
| 1 | | | | | ☐ TODO |
| 2 | | | | | ☐ TODO |
| 3 | | | | | ☐ TODO |
| 4 | | | | | ☐ TODO |
| 5 | | | | | ☐ TODO |

**Total Committed Points:** [X]  
**Team Velocity (Last Sprint):** [X]  
**Capacity This Sprint:** [X]

### DAG Dependency Map

```
[Paste from SHOW DAG command or draw manually]

Example:
         ┌──────────┐
         │ Story 1  │ ← No dependencies (start here)
         └────┬─────┘
              │
        ┌─────┴─────┐
        ▼           ▼
   ┌─────────┐ ┌─────────┐
   │ Story 2 │ │ Story 3 │  ← Can run in parallel
   └────┬────┘ └────┬────┘
        │           │
        └─────┬─────┘
              ▼
         ┌─────────┐
         │ Story 4 │
         └─────────┘
```

### Sprint Commitment Gate

**AIXORD Ideation Gate Checklist:**
- ☐ All stories have acceptance criteria
- ☐ Dependencies mapped (DAG)
- ☐ Estimates validated
- ☐ 7 Quality Dimensions considered
- ☐ Director typed: `FINALIZE PLAN`

**Gate Status:** ☐ PASSED — Sprint Committed

---

## Sprint Execution (Realization Kingdom)

### Daily Progress Tracker

| Day | Stories In Progress | Stories Completed | Points Done | Blockers |
|-----|---------------------|-------------------|-------------|----------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |
| 9 | | | | |
| 10 | | | | |

### Story Detail Tracking

#### Story 1: [Title]

**AIXORD Commands:** `UNLOCK: [story]` → `EXECUTE` → `AUDIT` → `LOCK`

| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 1 | | ☐ | |
| 2 | | ☐ | |
| 3 | | ☐ | |

**Acceptance Criteria:**
- ☐ [Criterion 1]
- ☐ [Criterion 2]
- ☐ [Criterion 3]

**AUDIT Result:** ☐ PASS  ☐ CONDITIONAL  ☐ FAIL

**Status:** ☐ TODO  ☐ IN PROGRESS  ☐ DONE (LOCKED)

---

#### Story 2: [Title]

**AIXORD Commands:** `UNLOCK: [story]` → `EXECUTE` → `AUDIT` → `LOCK`

| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 1 | | ☐ | |
| 2 | | ☐ | |
| 3 | | ☐ | |

**Acceptance Criteria:**
- ☐ [Criterion 1]
- ☐ [Criterion 2]
- ☐ [Criterion 3]

**AUDIT Result:** ☐ PASS  ☐ CONDITIONAL  ☐ FAIL

**Status:** ☐ TODO  ☐ IN PROGRESS  ☐ DONE (LOCKED)

---

#### Story 3: [Title]

**AIXORD Commands:** `UNLOCK: [story]` → `EXECUTE` → `AUDIT` → `LOCK`

| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 1 | | ☐ | |
| 2 | | ☐ | |
| 3 | | ☐ | |

**Acceptance Criteria:**
- ☐ [Criterion 1]
- ☐ [Criterion 2]
- ☐ [Criterion 3]

**AUDIT Result:** ☐ PASS  ☐ CONDITIONAL  ☐ FAIL

**Status:** ☐ TODO  ☐ IN PROGRESS  ☐ DONE (LOCKED)

---

*(Copy story section as needed for additional stories)*

---

## Sprint Burndown

```
Points │
  15   │ ●
       │   ●
  12   │     ●
       │       ●
   9   │         ●
       │           ●
   6   │             ●
       │               ●
   3   │                 ●
       │                   ●
   0   │─────────────────────●
       └─────────────────────────
         1  2  3  4  5  6  7  8  9  10
                    Days
         
● = Actual    ─ = Ideal
```

**Burndown Data:**
| Day | Ideal Remaining | Actual Remaining |
|-----|-----------------|------------------|
| 0 | [Total] | [Total] |
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |
| 6 | | |
| 7 | | |
| 8 | | |
| 9 | | |
| 10 | 0 | |

---

## Mid-Sprint Checkpoint

**AIXORD Command:** `CHECKPOINT`

**Date:** [YYYY-MM-DD]

| Metric | Status |
|--------|--------|
| Stories completed | [X] of [Y] |
| Points completed | [X] of [Y] |
| Blockers | [count] |
| Sprint goal at risk? | ☐ Yes ☐ No |

**Action Items:**
- 

---

## Sprint Changes Log

| Date | Change Type | Story Affected | Reason | Approved By |
|------|-------------|----------------|--------|-------------|
| | `REASSESS:` | | | |
| | Scope added | | | |
| | Scope removed | | | |

**Note:** Each change should be logged with AIXORD command used.

---

## Sprint Review

**Date:** [YYYY-MM-DD]

### Completed Work (Demo)

| Story | Points | Demo Notes | Stakeholder Feedback |
|-------|--------|------------|---------------------|
| | | | |
| | | | |

### Incomplete Work

| Story | Points | % Complete | Reason | Next Sprint? |
|-------|--------|------------|--------|--------------|
| | | | | ☐ Yes ☐ No |

### Sprint Metrics

| Metric | Planned | Actual | Variance |
|--------|---------|--------|----------|
| Stories | | | |
| Points | | | |
| Velocity | (last sprint) | (this sprint) | |

---

## Sprint Retrospective

**AIXORD Command:** `HANDOFF`

### What Went Well ✅
- 
- 
- 

### What Needs Improvement ⚠️
- 
- 
- 

### Action Items for Next Sprint
| Action | Owner | Due |
|--------|-------|-----|
| | | |
| | | |

### AIXORD-Specific Learnings

**Commands that helped:**
- 

**Process improvements:**
- 

**Estimation accuracy:**
- 

---

## Carryforward to Next Sprint

**From AIXORD HANDOFF:**

### Incomplete Stories
| Story | Remaining Points | Priority |
|-------|------------------|----------|
| | | |

### Technical Debt
| Item | Source | Priority |
|------|--------|----------|
| | Gate Override | |
| | Deferred | |

### Research Findings (Preserve for Next Sprint)
- 
- 

### Blockers to Address
- 

---

## AIXORD Session Summary

| Session | Messages | Duration | Outcomes |
|---------|----------|----------|----------|
| 1 | /25 | | |
| 2 | /25 | | |
| 3 | /25 | | |

**Total AIXORD Sessions This Sprint:** [X]

**HANDOFF Documents Created:**
- [ ] HANDOFF_SPRINT_[X]_SESSION_1.md
- [ ] HANDOFF_SPRINT_[X]_SESSION_2.md

---

## Sprint Sign-Off

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Product Owner (Director) | | ☐ | |
| Scrum Master | | ☐ | |
| Dev Team Lead | | ☐ | |

**Sprint Status:** ☐ CLOSED

---

*Template Version 1.0 | AIXORD v3.3 | PMERIT LLC*
