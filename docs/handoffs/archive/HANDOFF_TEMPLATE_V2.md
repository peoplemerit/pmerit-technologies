# HANDOFF TEMPLATE (v2.0) — Enhanced File Operations

**Template ID:** HANDOFF_TEMPLATE_V2  
**Version:** 2.0  
**Date:** January 2026  
**Purpose:** Prevent file operation errors through explicit specification

---

## 🔒 TEMPLATE REQUIREMENTS

Every HANDOFF document MUST include:

1. **PART 1:** Executive Summary
2. **PART 2:** Pre-Execution Checklist (MANDATORY)
3. **PART 3:** File Operations (EXPLICIT)
4. **PART 4:** Content Specifications
5. **PART 5:** Post-Execution Verification (MANDATORY)
6. **PART 6:** Acceptance Criteria

---

# HANDOFF — [TITLE]

**Document ID:** HANDOFF_[IDENTIFIER]  
**From:** [Source Role]  
**To:** [Target Role]  
**Date:** [Date]  
**Priority:** [HIGH | MEDIUM | LOW]

---

## PART 1: EXECUTIVE SUMMARY

### Purpose
[One paragraph describing what this handoff accomplishes]

### Scope
| Aspect | Value |
|--------|-------|
| Packages Affected | [list] |
| Files Modified | [count] |
| Files Created | [count] |
| Files Deleted | [count] |
| Estimated Time | [minutes] |

### Director Decision
**Status:** [APPROVED | PENDING]  
**Date:** [approval date]

---

## PART 2: PRE-EXECUTION CHECKLIST (MANDATORY)

**Claude Code MUST complete this checklist BEFORE any file operations:**

### 2.1 Directory Audit

```
☐ 1. Navigate to target directory
☐ 2. List ALL existing files: ls -la
☐ 3. Record file count: [___]
☐ 4. Record unexpected files: [list or "None"]
```

### 2.2 Registry Comparison

```
☐ 5. Read AIXORD_FILE_REGISTRY.md
☐ 6. Compare existing files against registry
☐ 7. Files in registry but missing: [list or "None"]
☐ 8. Files existing but not in registry: [list or "None"]
```

### 2.3 Version Check

```
☐ 9. Check current version in governance files
☐ 10. Current version found: [X.X.X]
☐ 11. Target version: [X.X.X]
☐ 12. Version mismatch files: [list or "None"]
```

### 2.4 Pre-Execution Report

**Output this report before proceeding:**

```
PRE-EXECUTION AUDIT REPORT
==========================
Directory: [path]
Files Found: [count]
Registry Match: [YES/NO]
Unexpected Files: [list]
Missing Files: [list]
Current Version: [X.X.X]
Target Version: [X.X.X]

Ready to proceed? [Awaiting Director confirmation]
```

**HALT if:**
- Unexpected files found (may indicate previous failed operation)
- Registry mismatch > 20% of files
- Version mismatch detected

---

## PART 3: FILE OPERATIONS (EXPLICIT)

### 3.1 Files to MODIFY (Update in Place)

| # | Current Filename | Action | New Filename | Notes |
|---|------------------|--------|--------------|-------|
| 1 | `[exact current name]` | UPDATE + RENAME | `[exact new name]` | [what changes] |
| 2 | `[exact current name]` | UPDATE ONLY | `[same name]` | [what changes] |

**For each MODIFY operation:**
- Read the ENTIRE existing file first
- Preserve platform-specific content
- Update only specified sections
- Verify file exists before modifying

### 3.2 Files to CREATE (New Files)

| # | New Filename | Template/Source | Location | Notes |
|---|--------------|-----------------|----------|-------|
| 1 | `[exact name]` | [source] | [folder] | [purpose] |

**For each CREATE operation:**
- Verify file does NOT already exist
- Follow AIXORD_NAMING_CONVENTION.md
- Verify against FILE_REGISTRY.md

### 3.3 Files to DELETE (After Verification)

| # | Filename | Reason | Replacement |
|---|----------|--------|-------------|
| 1 | `[exact name]` | [why delete] | `[new file or "N/A"]` |

**For each DELETE operation:**
- ONLY delete AFTER replacement verified
- Backup before delete (optional)
- Verify file exists before attempting delete

### 3.4 Files to LEAVE UNCHANGED

| # | Filename | Reason |
|---|----------|--------|
| 1 | `[exact name]` | [why no changes] |

**These files should NOT be modified in this operation.**

---

## PART 4: CONTENT SPECIFICATIONS

### 4.1 Section Additions

**Add the following sections to [TARGET FILE]:**

```markdown
## [Section Number]: [Section Title]

[Content to add]
```

**Insert Location:** After [existing section] / At end of file

### 4.2 Section Updates

**Update the following in [TARGET FILE]:**

| Section | Current | New |
|---------|---------|-----|
| Version header | `Version: 3.1.x` | `Version: 3.2.1` |
| [other] | [old] | [new] |

### 4.3 Section Removals

**Remove the following from [TARGET FILE]:**

| Section | Reason |
|---------|--------|
| [section name] | [why remove] |

---

## PART 5: POST-EXECUTION VERIFICATION (MANDATORY)

**Claude Code MUST complete this checklist AFTER all file operations:**

### 5.1 File Count Verification

```
☐ 1. List ALL files in directory: ls -la
☐ 2. Count files: [___]
☐ 3. Expected count: [___]
☐ 4. Match: [YES/NO]
```

### 5.2 Registry Reconciliation

```
☐ 5. Compare files against FILE_REGISTRY.md
☐ 6. All registry files present: [YES/NO]
☐ 7. Extra files found: [list or "None"]
☐ 8. Missing files: [list or "None"]
```

### 5.3 README ↔ Files Reconciliation

```
☐ 9. Read README.md
☐ 10. Extract all file references
☐ 11. Verify each referenced file exists
☐ 12. Mismatches: [list or "None"]
```

### 5.4 Version Consistency

```
☐ 13. Check version in all governance files
☐ 14. Check version in all state files
☐ 15. All versions match: [YES/NO]
☐ 16. Mismatches: [list or "None"]
```

### 5.5 Naming Convention Check

```
☐ 17. Run naming validator
☐ 18. All AIXORD files have platform identifier: [YES/NO]
☐ 19. Violations: [list or "None"]
```

### 5.6 Post-Execution Report

**Output this report after completion:**

```
POST-EXECUTION VERIFICATION REPORT
==================================
Directory: [path]
Files After: [count]
Registry Match: [YES/NO]
README Match: [YES/NO]
Version Consistent: [YES/NO]
Naming Valid: [YES/NO]

ISSUES FOUND: [list or "None"]

Verification: [PASS/FAIL]
```

**If FAIL:**
- List all issues
- Do NOT proceed to packaging
- Report to Director for decision

---

## PART 6: ACCEPTANCE CRITERIA

### Must Pass (Required)

| Criteria | Verification |
|----------|--------------|
| All registry files present | Post-exec check 5.2 |
| No extra files | Post-exec check 5.2 |
| README matches actual files | Post-exec check 5.3 |
| All versions consistent | Post-exec check 5.4 |
| Naming convention compliant | Post-exec check 5.5 |

### Should Pass (Recommended)

| Criteria | Verification |
|----------|--------------|
| File sizes reasonable | Manual check |
| Content properly formatted | Spot check |
| Links/references valid | Spot check |

### Final Sign-Off

```
HANDOFF COMPLETE
================
Executor: [Claude Code]
Date: [timestamp]
Verification: [PASS]

All acceptance criteria met.
Ready for: [next step - packaging/upload/etc.]
```

---

## APPENDIX: COMMON ERRORS TO AVOID

### Error 1: Creating Generic Files Instead of Platform-Specific

```
❌ WRONG: Created AIXORD_GOVERNANCE_V3.2.1.md (generic)
   alongside AIXORD_GOVERNANCE_GEMINI_V3.1.md (platform-specific)

✅ RIGHT: Updated AIXORD_GOVERNANCE_GEMINI_V3.1.md
   to AIXORD_GOVERNANCE_GEMINI_V3.2.1.md
```

### Error 2: Leaving Old Version Files

```
❌ WRONG: Package contains both V3.1 and V3.2.1 files

✅ RIGHT: Old V3.1 files deleted after V3.2.1 verified
```

### Error 3: README References Don't Match

```
❌ WRONG: README says "AIXORD_GOVERNANCE_GEMINI_V3.2.1.md"
   but package contains "AIXORD_GOVERNANCE_V3.2.1.md"

✅ RIGHT: README references match actual filenames exactly
```

### Error 4: Skipping Pre-Execution Audit

```
❌ WRONG: Started modifying files without checking current state

✅ RIGHT: Complete pre-execution checklist, report to Director,
   THEN proceed with file operations
```

---

*HANDOFF TEMPLATE v2.0 — Explicit Operations, Verified Results*
*© 2026 PMERIT LLC. All Rights Reserved.*
