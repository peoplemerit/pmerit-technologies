# AIXORD EXECUTION CHECKLIST (v1.0)

**Document ID:** EXECUTION_CHECKLIST  
**Version:** 1.0  
**Date:** January 2026  
**Purpose:** Pre/Post verification requirements for Claude Code execution

---

## 🔒 CHECKLIST AUTHORITY

This checklist is **MANDATORY** for all AIXORD file operations.

**Claude Code MUST:**
1. Complete PRE-EXECUTION before any file operations
2. Report findings to Director before proceeding
3. Complete POST-EXECUTION after all file operations
4. Report results before marking task complete

**Skipping any checklist item = VIOLATION**

---

## 📋 PRE-EXECUTION CHECKLIST

### Phase 1: Environment Verification

```
☐ 1.1 Confirm working directory
      Command: pwd
      Expected: [specific path]
      Actual: _____________

☐ 1.2 Verify git status
      Command: git status
      Expected: Clean working tree
      Issues: _____________

☐ 1.3 Verify branch
      Command: git branch --show-current
      Expected: main (or specified branch)
      Actual: _____________
```

### Phase 2: File Inventory

```
☐ 2.1 List all files in target directory
      Command: ls -la [target_path]
      File count: _____

☐ 2.2 Record all AIXORD files
      Command: ls AIXORD_*.md AIXORD_*.json 2>/dev/null
      List:
      - _______________
      - _______________
      - _______________
      [add more as needed]

☐ 2.3 Record all other files
      List:
      - _______________
      - _______________
```

### Phase 3: Registry Comparison

```
☐ 3.1 Read FILE_REGISTRY.md for target package
      Registry file count: _____
      Actual file count: _____
      Match: [YES/NO]

☐ 3.2 Files in registry but MISSING from directory
      List:
      - _______________
      - _______________
      (or "None")

☐ 3.3 Files in directory but NOT in registry
      List:
      - _______________
      - _______________
      (or "None")
```

### Phase 4: Version Analysis

```
☐ 4.1 Extract version from each governance file
      Command: grep "Version:" AIXORD_GOVERNANCE_*.md
      
      File: _____________ → Version: _____
      File: _____________ → Version: _____
      File: _____________ → Version: _____

☐ 4.2 Extract version from each state file
      Command: grep "aixord_version" AIXORD_STATE_*.json
      
      File: _____________ → Version: _____
      File: _____________ → Version: _____

☐ 4.3 Version consistency check
      All versions match: [YES/NO]
      Mismatches: _____________
```

### Phase 5: Naming Convention Check

```
☐ 5.1 Check for files missing platform identifier
      Command: ls AIXORD_GOVERNANCE_V*.md AIXORD_STATE_V*.json 2>/dev/null
      
      Violations found: [YES/NO]
      List:
      - _______________
      (or "None")

☐ 5.2 Check for incorrect naming patterns
      Command: ls AIXORD_*.md | grep -v "_[A-Z]*_"
      
      Violations found: [YES/NO]
      List:
      - _______________
      (or "None")
```

### Phase 6: README Verification

```
☐ 6.1 Read README.md
      Command: cat README.md

☐ 6.2 Extract file references from README
      Files referenced:
      - _______________
      - _______________
      - _______________

☐ 6.3 Verify each referenced file exists
      Missing files: _____________
      (or "None")
```

### Pre-Execution Report Template

```
╔══════════════════════════════════════════════════════════════════╗
║              PRE-EXECUTION AUDIT REPORT                          ║
╠══════════════════════════════════════════════════════════════════╣
║ Target Directory: [path]                                         ║
║ Date: [timestamp]                                                ║
║ Executor: Claude Code                                            ║
╠══════════════════════════════════════════════════════════════════╣
║ ENVIRONMENT                                                      ║
║   Working Directory: [path]                                      ║
║   Git Status: [clean/dirty]                                      ║
║   Branch: [branch name]                                          ║
╠══════════════════════════════════════════════════════════════════╣
║ FILE INVENTORY                                                   ║
║   Total Files: [count]                                           ║
║   AIXORD Files: [count]                                          ║
║   Other Files: [count]                                           ║
╠══════════════════════════════════════════════════════════════════╣
║ REGISTRY COMPARISON                                              ║
║   Registry Files: [count]                                        ║
║   Actual Files: [count]                                          ║
║   Match: [YES/NO]                                                ║
║   Missing from Directory: [list or "None"]                       ║
║   Not in Registry: [list or "None"]                              ║
╠══════════════════════════════════════════════════════════════════╣
║ VERSION ANALYSIS                                                 ║
║   Current Version: [X.X.X]                                       ║
║   Target Version: [X.X.X]                                        ║
║   Version Consistent: [YES/NO]                                   ║
║   Mismatches: [list or "None"]                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ NAMING CONVENTION                                                ║
║   All Files Compliant: [YES/NO]                                  ║
║   Violations: [list or "None"]                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ README RECONCILIATION                                            ║
║   References in README: [count]                                  ║
║   All Files Exist: [YES/NO]                                      ║
║   Mismatches: [list or "None"]                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ ISSUES REQUIRING ATTENTION                                       ║
║   [List issues or "None"]                                        ║
╠══════════════════════════════════════════════════════════════════╣
║ RECOMMENDATION: [PROCEED / HALT / ESCALATE]                      ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 📋 POST-EXECUTION CHECKLIST

### Phase 1: File Operation Verification

```
☐ 1.1 Verify files CREATED
      For each file in "Files to CREATE":
      - File exists: [YES/NO]
      - Naming correct: [YES/NO]
      - Content valid: [YES/NO]
      
      Created files verified:
      ☐ _______________
      ☐ _______________

☐ 1.2 Verify files MODIFIED
      For each file in "Files to MODIFY":
      - File updated: [YES/NO]
      - Renamed correctly: [YES/NO]
      - Content correct: [YES/NO]
      
      Modified files verified:
      ☐ _______________
      ☐ _______________

☐ 1.3 Verify files DELETED
      For each file in "Files to DELETE":
      - Old file removed: [YES/NO]
      - Replacement exists: [YES/NO]
      
      Deleted files verified:
      ☐ _______________
      ☐ _______________
```

### Phase 2: Registry Reconciliation

```
☐ 2.1 Re-read FILE_REGISTRY.md for target package
      Registry file count: _____

☐ 2.2 List all files in directory
      Command: ls -la
      Actual file count: _____

☐ 2.3 Compare registry vs actual
      All registry files present: [YES/NO]
      Extra files (not in registry): [list or "None"]
```

### Phase 3: README Reconciliation

```
☐ 3.1 Read updated README.md
      (or verify README unchanged if not modified)

☐ 3.2 Extract ALL file references from README

☐ 3.3 For each reference, verify file exists
      Mismatches:
      - README says: _____________ | Actual: _____________
      (or "All match")
```

### Phase 4: Version Consistency

```
☐ 4.1 Check version in ALL governance files
      Command: grep "Version:" AIXORD_GOVERNANCE_*.md
      
      All show: [version]
      Inconsistencies: [list or "None"]

☐ 4.2 Check version in ALL state files
      Command: grep "aixord_version" AIXORD_STATE_*.json
      
      All show: [version]
      Inconsistencies: [list or "None"]

☐ 4.3 Check version in README
      Version shown: _____
      Matches files: [YES/NO]
```

### Phase 5: Naming Convention Final Check

```
☐ 5.1 List all AIXORD files
      Command: ls AIXORD_*.md AIXORD_*.json

☐ 5.2 Verify NO files without platform identifier
      Command: ls AIXORD_GOVERNANCE_V*.md AIXORD_STATE_V*.json 2>/dev/null
      Result: [Empty = PASS / Files listed = FAIL]

☐ 5.3 Verify all files follow naming convention
      Violations: [list or "None"]
```

### Phase 6: Content Spot Check

```
☐ 6.1 Open primary governance file
      Verify:
      - Version header correct: [YES/NO]
      - Platform identifier in header: [YES/NO]
      - New sections present: [YES/NO]

☐ 6.2 Open state file
      Verify:
      - Version correct: [YES/NO]
      - Platform field correct: [YES/NO]
      - New fields present: [YES/NO]

☐ 6.3 Open README
      Verify:
      - Version correct: [YES/NO]
      - File references accurate: [YES/NO]
```

### Post-Execution Report Template

```
╔══════════════════════════════════════════════════════════════════╗
║              POST-EXECUTION VERIFICATION REPORT                  ║
╠══════════════════════════════════════════════════════════════════╣
║ Target Directory: [path]                                         ║
║ Date: [timestamp]                                                ║
║ Executor: Claude Code                                            ║
╠══════════════════════════════════════════════════════════════════╣
║ FILE OPERATIONS                                                  ║
║   Files Created: [count] - Verified: [YES/NO]                    ║
║   Files Modified: [count] - Verified: [YES/NO]                   ║
║   Files Deleted: [count] - Verified: [YES/NO]                    ║
╠══════════════════════════════════════════════════════════════════╣
║ REGISTRY RECONCILIATION                                          ║
║   Registry Files: [count]                                        ║
║   Actual Files: [count]                                          ║
║   All Registry Files Present: [YES/NO]                           ║
║   Extra Files: [list or "None"]                                  ║
╠══════════════════════════════════════════════════════════════════╣
║ README RECONCILIATION                                            ║
║   File References in README: [count]                             ║
║   All Referenced Files Exist: [YES/NO]                           ║
║   Mismatches: [list or "None"]                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ VERSION CONSISTENCY                                              ║
║   Target Version: [X.X.X]                                        ║
║   All Files Consistent: [YES/NO]                                 ║
║   Mismatches: [list or "None"]                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ NAMING CONVENTION                                                ║
║   All Files Compliant: [YES/NO]                                  ║
║   Violations: [list or "None"]                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ CONTENT VERIFICATION                                             ║
║   Primary Governance: [PASS/FAIL]                                ║
║   State File: [PASS/FAIL]                                        ║
║   README: [PASS/FAIL]                                            ║
╠══════════════════════════════════════════════════════════════════╣
║ OVERALL VERIFICATION: [PASS / FAIL]                              ║
║                                                                  ║
║ Issues Found: [list or "None"]                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 🚨 HALT CONDITIONS

**HALT execution and report to Director if:**

### Pre-Execution HALT Triggers

| Condition | Action |
|-----------|--------|
| Unexpected files found (>2) | HALT - may indicate failed previous operation |
| Registry mismatch >20% | HALT - investigate before proceeding |
| Multiple versions in package | HALT - clean up required first |
| Naming violations found | HALT - fix naming before operations |
| README references non-existent files | HALT - investigate discrepancy |

### Post-Execution HALT Triggers

| Condition | Action |
|-----------|--------|
| Created file missing | HALT - operation failed |
| Registry mismatch after operations | HALT - incomplete execution |
| Version inconsistency | HALT - partial update |
| Naming violations introduced | HALT - rollback required |
| README mismatches | HALT - update README |

---

## ✅ SIGN-OFF

### Pre-Execution Sign-Off

```
PRE-EXECUTION COMPLETE
======================
Executor: Claude Code
Date: [timestamp]
Checklist: [X/X] items completed
Issues: [list or "None"]
Recommendation: [PROCEED/HALT/ESCALATE]

Awaiting Director confirmation to proceed.
```

### Post-Execution Sign-Off

```
POST-EXECUTION COMPLETE
=======================
Executor: Claude Code
Date: [timestamp]
Checklist: [X/X] items completed
Verification: [PASS/FAIL]
Issues: [list or "None"]

Ready for: [next step - packaging/upload/etc.]
```

---

*EXECUTION CHECKLIST v1.0 — Verified Operations, Zero Errors*
*© 2026 PMERIT LLC. All Rights Reserved.*
