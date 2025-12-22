# SCOPE: [FEATURE NAME]

**Created:** [DATE]
**Last Updated:** [DATE]
**Status:** PLANNING | IN_PROGRESS | STABILIZING | COMPLETE
**Progress:** 0/N tasks
**Linked Handoff:** HANDOFF_[NAME].md

---

## SCOPE IDENTITY

| Attribute | Value |
|-----------|-------|
| **Feature** | [e.g., User Authentication] |
| **Pages** | [e.g., login.html, register.html] |
| **JavaScript** | [e.g., auth.js, session.js] |
| **CSS** | [e.g., auth.css] |
| **API Endpoints** | [e.g., /api/v1/auth/*] |
| **Database Tables** | [e.g., users, sessions] |

---

## DECISION LOG (Permanent)

Track all architectural decisions for this scope. This section is NEVER deleted.

| Decision | Date | Rationale | Status |
|----------|------|-----------|--------|
| [e.g., Use JWT tokens] | [date] | [Stateless auth, scalable] | ACTIVE |
| [e.g., Use sessions] | [date] | [Server-side state required] | NO-GO |

**Decision Status Values:**

| Status | Meaning | Action |
|--------|---------|--------|
| `ACTIVE` | Currently in use | Keep in document |
| `NO-GO` | Bad idea, won't revisit | Keep for reference, never implement |
| `EXPERIMENTAL` | Testing, may change | Archive if replaced |

---

## CURRENT STATE

### Planned Tasks

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Completed Tasks

- [x] Task 1 — [date completed]

### Identified Gaps

| Gap | Severity | Status |
|-----|----------|--------|
| [e.g., No password reset] | HIGH | OPEN |
| [e.g., Missing mobile styles] | MEDIUM | RESOLVED |

---

## AUDIT_REPORT

*Populated by Claude Code when running `AUDIT SCOPE: [name]`*
*This section is continuously updated each audit — old content archived*

### Current Production Status

```
[Claude Code fills this section with actual findings]
```

### Existing Implementation

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| [Component] | [Exists/Missing] | [path] | [notes] |

### Technical Debt

- [ ] [Issue 1]
- [ ] [Issue 2]

### Last Audit: [DATE]

---

## HANDOFF_DOCUMENT

*Populated by Claude Web after reviewing AUDIT_REPORT*
*Updated in place — this is a living section, not append-only*

### Feature Requirements

#### Requirement 1: [Name]
- **Priority:** [High/Medium/Low]
- **Description:** [What needs to be done]
- **Acceptance Criteria:**
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]

### User Flow

```
1. User does [action]
2. System responds with [response]
3. User sees [result]
```

### Technical Approach

[Describe the implementation approach]

### Out of Scope

- [Thing 1 that is NOT included]
- [Thing 2 that is NOT included]

### Last Updated: [DATE]

---

## RESEARCH_FINDINGS

*Populated by Claude Code after implementation*
*Continuously updated — obsolete content archived or deleted*

### Latest Session: [#] — [DATE]

**Completed:**
- [x] [Task 1]
- [x] [Task 2]

**Files Changed:**
- `path/to/file1.js` — [What changed]
- `path/to/file2.css` — [What changed]

**Issues Found:**
- [Issue 1] — [How resolved]

**Next Steps:**
- [ ] [Next task 1]
- [ ] [Next task 2]

---

## LOCKED FILES

*When scope reaches COMPLETE status, critical files are locked*

| File | Last Working Commit | Lock Date | Verified By |
|------|---------------------|-----------|-------------|
| [path/to/file.js] | [commit hash] | [date] | Session [#] |

### Unlock History

| Date | File | Reason | Outcome | Session |
|------|------|--------|---------|---------|
| [date] | [file] | [reason] | ✅/❌ | [#] |

---

## DEPENDENCIES

| Direction | Scope | Reason |
|-----------|-------|--------|
| **Requires** | SCOPE_X | [Why this scope needs X] |
| **Enables** | SCOPE_Z | [What this scope enables] |

---

## VERIFICATION CHECKLIST

| # | Requirement | Status | Evidence |
|---|-------------|--------|----------|
| 1 | [From HANDOFF_DOCUMENT] | [ ] | [Link/Screenshot] |
| 2 | [From HANDOFF_DOCUMENT] | [ ] | [Link/Screenshot] |

---

## ARCHIVE CLEANUP

*When scope reaches COMPLETE, Claude Code prompts for archive cleanup*

**Archive Location:** `docs/archive/SCOPE_[NAME]/`

| Archived Item | Date | Reason |
|---------------|------|--------|
| [Old audit report] | [date] | [Superseded by new audit] |
| [Obsolete research] | [date] | [Implementation changed] |

---

*Scope Order System v3.0 — Living Documents + Lifecycle Archive*
