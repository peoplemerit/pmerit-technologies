# SCOPE_[NAME] — [Brief Description]

**Version:** 1.0
**Status:** [EMPTY / AUDITED / SPECIFIED / IN_PROGRESS / VISUAL_AUDIT / COMPLETE / LOCKED]
**Parent:** MASTER_SCOPE
**Created:** [YYYY-MM-DD]
**Last Updated:** [YYYY-MM-DD]

---

## 1. SCOPE IDENTITY

### 1.1 Purpose
[What this SCOPE accomplishes]

### 1.2 Boundaries
**In Scope:**
- [What's included]

**Out of Scope:**
- [What's excluded — handled by other SCOPEs]

### 1.3 Dependencies

| Prerequisite | Required State | Reason |
|--------------|----------------|--------|
| SCOPE_X | COMPLETE | [why needed] |

### 1.4 Dependents
These SCOPEs depend on this one:
- SCOPE_Y (requires COMPLETE)
- SCOPE_Z (requires LOCKED)

---

## 2. DECISION LOG

| ID | Date | Decision | Status | Rationale |
|----|------|----------|--------|-----------|
| D-001 | [date] | [decision] | ACTIVE | [why] |

**Note:** Decisions are append-only. Never delete entries.

---

## 3. AUDIT_REPORT

**Last Audit:** [date]
**Audited By:** [who]
**Mode:** Code Audit

### Findings

| Item | Expected | Actual | Status |
|------|----------|--------|--------|
| [item] | [expected] | [actual] | MATCH / DISCREPANCY |

### Summary
[Overall audit findings]

### Recommendations
- [Recommendation 1]
- [Recommendation 2]

---

## 4. VISUAL_AUDIT_REPORT

**Last Visual Audit:** [date]
**Screenshots Reviewed:** [count]

### Visual Checks

| Requirement | Screenshot | Status | Notes |
|-------------|------------|--------|-------|
| [UI spec item] | [filename] | PASS / DISCREPANCY / MISSING | [notes] |

### Overall Verdict
- [ ] PASS — All visual requirements met
- [ ] DISCREPANCY — Issues found (list in Notes)

### Remediation Required
- [Fix 1]
- [Fix 2]

---

## 5. HANDOFF_DOCUMENT

### 5.1 Context
[Why this work exists, business context]

### 5.2 Specifications

#### Functional Requirements
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

#### Non-Functional Requirements
- Performance: [requirement]
- Security: [requirement]
- Accessibility: [requirement]

#### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

### 5.3 Visual Requirements (for UI SCOPEs)

#### Layouts
[Describe expected layouts or reference wireframes]

#### Required Screenshots
- [ ] [State 1: e.g., "Empty state"]
- [ ] [State 2: e.g., "Loaded with data"]
- [ ] [State 3: e.g., "Error state"]

#### Design System References
- Colors: [reference]
- Typography: [reference]
- Components: [reference]

### 5.4 Execution Instructions

#### Step 1: [Action]
[Detailed instructions]

**Verify:** [How to confirm success]

#### Step 2: [Action]
[Detailed instructions]

**Verify:** [How to confirm success]

#### Step 3: [Action]
[Detailed instructions]

**Verify:** [How to confirm success]

### 5.5 Verification Commands
```bash
# Run tests
npm test

# Build check
npm run build

# Type check
npm run typecheck
```

### 5.6 Rollback Procedure
If implementation fails:
1. [Step 1]
2. [Step 2]

---

## 6. RESEARCH_FINDINGS

**Last Updated:** [date]

### Technical Notes
[Implementation discoveries, API behaviors, gotchas]

### Resources
- [Link 1]
- [Link 2]

### Open Questions
- [ ] [Question 1]
- [ ] [Question 2]

---

## 7. LOCKED FILES

| File | Locked Since | Reason |
|------|--------------|--------|
| [path/to/file] | [date] | [reason] |

**To modify locked files:** Human must issue `UNLOCK: [filename]`

---

## 8. IMPLEMENTATION STATUS

### Files Modified
| File | Action | Status |
|------|--------|--------|
| [path] | Create | DONE / IN_PROGRESS / TODO |
| [path] | Edit | DONE / IN_PROGRESS / TODO |

### Test Coverage
- Unit tests: [%]
- Integration tests: [%]

---

## 9. LIFECYCLE HISTORY

| Date | From State | To State | Trigger | By |
|------|------------|----------|---------|-----|
| [date] | EMPTY | AUDITED | AUDIT SCOPE | Commander |
| [date] | AUDITED | SPECIFIED | HANDOFF written | Architect |

---

## 10. NOTES

[Any additional context, warnings, or reminders]

---

*SCOPE Template — AIXORD v2.0*
