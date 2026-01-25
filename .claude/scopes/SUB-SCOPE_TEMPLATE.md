# SUB-SCOPE_[NAME]

**Version:** 1.0  
**Status:** EMPTY  
**Parent SCOPE:** SCOPE_[PARENT_NAME]  
**Repository:** [frontend | backend | products]  
**Created:** [YYYY-MM-DD]  
**Last Updated:** [YYYY-MM-DD]

---

## SUB-SCOPE IDENTITY

| Field | Value |
|-------|-------|
| **Name** | SUB-SCOPE_[NAME] |
| **Parent** | SCOPE_[PARENT_NAME] |
| **Description** | [Brief description of this specific unit of work] |
| **Repository** | [Inherited from parent] |
| **Type** | [UI Component | API Endpoint | Service | Integration] |

---

## RELATIONSHIP TO PARENT

**Parent SCOPE:** SCOPE_[PARENT_NAME]  
**Sibling SUB-SCOPEs:**
- SUB-SCOPE_[SIBLING_A]
- SUB-SCOPE_[SIBLING_B]

**Parallel Execution:** [Yes/No - Can this run in parallel with siblings?]

---

## DEPENDENCIES

### Internal Dependencies (Within Parent SCOPE)

| SUB-SCOPE | Required State | Reason |
|-----------|----------------|--------|
| SUB-SCOPE_[X] | [COMPLETE] | [Why needed first] |

### External Dependencies (Other SCOPEs)

| SCOPE | Repository | Required State | Reason |
|-------|------------|----------------|--------|
| SCOPE_[X] | [repo] | [COMPLETE/LOCKED] | [Why needed] |

---

## DECISION LOG

> Append-only. NEVER delete entries.

| ID | Date | Decision | Status | Rationale |
|----|------|----------|--------|-----------|
| D-001 | [date] | [Decision made] | ACTIVE | [Why this decision] |

---

## AUDIT_REPORT

> Replaced each audit. Shows current reality for this SUB-SCOPE.

**Last Audit:** [Never | YYYY-MM-DD]  
**Audited By:** [Commander | Manual]

### Current State

[What actually exists for this specific SUB-SCOPE]

### Files Involved

| File | Exists | Status | Notes |
|------|--------|--------|-------|
| [path/to/file] | Yes/No | [status] | [observations] |

### Discrepancies

| Expected | Actual | Severity |
|----------|--------|----------|
| [What should exist] | [What exists] | [High/Med/Low] |

---

## VISUAL_AUDIT_REPORT

> For UI SUB-SCOPEs only.

**Last Visual Audit:** [Never | YYYY-MM-DD]  
**Screenshots Reviewed:** [count]

| Requirement | Screenshot | Status | Notes |
|-------------|------------|--------|-------|
| [Spec item] | [filename] | ✅ PASS | [observation] |

**Verdict:** [PASS | DISCREPANCY FOUND]

---

## HANDOFF_DOCUMENT

> Specifications for this SUB-SCOPE implementation.

### Context

[What this SUB-SCOPE accomplishes within the parent SCOPE]

### Scope Boundaries

**In Scope:**
- [What IS included in this SUB-SCOPE]

**Out of Scope:**
- [What is NOT included - belongs to other SUB-SCOPEs]

### Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| R-01 | [Requirement] | [Must/Should/Could] | [Pending/Done] |

### Technical Specification

[Technical approach specific to this SUB-SCOPE]

### Implementation Steps

| Step | Description | Effort |
|------|-------------|--------|
| 1 | [Step] | [hours] |

### Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]

---

## RESEARCH_FINDINGS

> Latest session notes.

**Session:** [N]  
**Date:** [YYYY-MM-DD]

[Implementation notes, what worked, what didn't]

---

## LOCKED FILES

| File | Locked Since | Reason |
|------|--------------|--------|
| [path] | [date] | [reason] |

---

## CHANGELOG

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | [date] | Initial creation |

---

*AIXORD v2.1 — SUB-SCOPE of SCOPE_[PARENT_NAME]*
