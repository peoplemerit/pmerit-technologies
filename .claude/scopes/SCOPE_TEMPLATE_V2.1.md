# SCOPE_[NAME]

**Version:** 1.0  
**Status:** EMPTY  
**Repository:** [frontend | backend | products]  
**Created:** [YYYY-MM-DD]  
**Last Updated:** [YYYY-MM-DD]

---

## SCOPE IDENTITY

| Field | Value |
|-------|-------|
| **Name** | SCOPE_[NAME] |
| **Description** | [Brief description of what this SCOPE accomplishes] |
| **Repository** | [Which repo this SCOPE belongs to] |
| **Type** | [UI | API | Database | Integration | Product] |
| **Has SUB-SCOPEs** | [Yes/No] |
| **Parent SCOPE** | [None | SCOPE_[PARENT]] |

---

## DEPENDENCIES

| Prerequisite | Repository | Required State | Reason |
|--------------|------------|----------------|--------|
| [SCOPE_X] | [repo] | [COMPLETE/LOCKED] | [Why needed] |

---

## SUB-SCOPES

> Remove this section if SCOPE is not decomposed.

| SUB-SCOPE | State | Owner | Last Updated |
|-----------|-------|-------|--------------|
| SUB-SCOPE_[NAME_A] | EMPTY | — | [date] |
| SUB-SCOPE_[NAME_B] | EMPTY | — | [date] |

**Rollup Rule:** This SCOPE cannot be COMPLETE until ALL SUB-SCOPEs are COMPLETE.

**SUB-SCOPE Files Location:**
```
.claude/scopes/SCOPE_[NAME]/
├── SCOPE_[NAME].md              ← This file (parent overview)
├── SUB-SCOPE_[NAME_A].md
└── SUB-SCOPE_[NAME_B].md
```

---

## DECISION LOG

> Append-only. NEVER delete entries. Mark superseded decisions.

| ID | Date | Decision | Status | Rationale |
|----|------|----------|--------|-----------|
| D-001 | [date] | [Decision made] | ACTIVE | [Why this decision] |

---

## AUDIT_REPORT

> Replaced each audit. Shows current reality.

**Last Audit:** [Never | YYYY-MM-DD]  
**Audited By:** [Commander | Manual]

### Current State

[Describe what actually exists in the codebase for this SCOPE]

### Files Involved

| File | Exists | Status | Notes |
|------|--------|--------|-------|
| [path/to/file] | Yes/No | [status] | [observations] |

### Discrepancies

| Expected | Actual | Severity | Action |
|----------|--------|----------|--------|
| [What should exist] | [What exists] | [High/Med/Low] | [Fix needed] |

---

## VISUAL_AUDIT_REPORT

> For UI SCOPEs only. Replaced each visual audit.

**Last Visual Audit:** [Never | YYYY-MM-DD]  
**Screenshots Reviewed:** [count]

| Requirement | Screenshot | Status | Notes |
|-------------|------------|--------|-------|
| [Spec item] | [filename] | ✅ PASS | [observation] |
| [Spec item] | [filename] | ⚠️ DISCREPANCY | [what's wrong] |
| [Spec item] | [filename] | ❌ MISSING | [not implemented] |

**Overall Verdict:** [PASS | DISCREPANCY FOUND]  
**Action Required:** [None | List fixes needed]

---

## HANDOFF_DOCUMENT

> Specifications for implementation. Updated in place.

### Context

[Why this SCOPE exists. What problem it solves.]

### Requirements

#### Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | [Requirement description] | [Must/Should/Could] | [Pending/Done] |

#### Non-Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| NFR-01 | [Performance/Security/etc.] | [Must/Should/Could] | [Pending/Done] |

### Technical Specification

[Detailed technical approach, architecture decisions, patterns to use]

### Implementation Steps

| Step | Description | Estimated Effort |
|------|-------------|------------------|
| 1 | [First step] | [hours/days] |
| 2 | [Second step] | [hours/days] |

### Acceptance Criteria

- [ ] [Criterion 1 - measurable/verifiable]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

---

## RESEARCH_FINDINGS

> Latest session implementation notes only.

**Session:** [N]  
**Date:** [YYYY-MM-DD]

### What Was Tried

[Document approaches attempted]

### What Worked

[Document successful approaches]

### What Didn't Work

[Document failed approaches and why]

### Open Questions

- [ ] [Question needing resolution]

---

## LOCKED FILES

> Files protected from modification without UNLOCK.

| File | Locked Since | Reason | Locked By |
|------|--------------|--------|-----------|
| [path/to/file] | [date] | [Security/Stability/etc.] | [SCOPE_X] |

---

## CHANGELOG

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | [date] | Initial creation | [Human/AI] |

---

*AIXORD v2.1 — Authority. Execution. Confirmation. Genesis.*
