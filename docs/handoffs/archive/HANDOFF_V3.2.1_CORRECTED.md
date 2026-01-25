# HANDOFF — AIXORD v3.2.1 CORRECTIVE UPDATE

**Document ID:** HANDOFF_V3.2.1_CORRECTED  
**From:** Claude Web (Architect)  
**To:** Claude Code (Commander)  
**Date:** January 2, 2026  
**Priority:** HIGH — Critical Fix Required

---

## EXECUTIVE SUMMARY

### Problem Statement

The previous v3.2.1 update created **generic governance files** instead of **updating platform-specific files**. This resulted in:

1. Packages containing BOTH old (v3.1) and new (v3.2.1) files
2. Generic files missing platform identifiers (e.g., `AIXORD_GOVERNANCE_V3.2.1.md`)
3. README references not matching actual filenames
4. Version inconsistency within packages

### Corrective Action

This HANDOFF instructs Claude Code to:

1. **DELETE** incorrectly created generic files
2. **UPDATE** existing platform-specific files to v3.2.1
3. **RENAME** files to follow naming convention
4. **DELETE** old version files after verification
5. **RECONCILE** README with actual files
6. **VERIFY** using EXECUTION_CHECKLIST.md

### Scope

| Aspect | Value |
|--------|-------|
| Packages Affected | 10 (all AIXORD packages) |
| Files to Delete | ~20 (generic + old versions) |
| Files to Update | ~10 (platform-specific governance) |
| Files to Rename | ~10 (add platform identifier) |
| Estimated Time | 2-3 hours |

### Director Decision

**Status:** APPROVED  
**Date:** January 2, 2026

---

## PART 1: CONTROL FILES TO USE

Before any file operations, Claude Code MUST read these control files:

| File | Location | Purpose |
|------|----------|---------|
| `AIXORD_FILE_REGISTRY.md` | Project root | Canonical file list |
| `AIXORD_NAMING_CONVENTION.md` | Project root | Naming rules |
| `EXECUTION_CHECKLIST.md` | Project root | Pre/Post verification |

**These files are the authority. If a file isn't in the registry, delete it.**

---

## PART 2: PRE-EXECUTION REQUIREMENTS

### 2.1 Complete Pre-Execution Checklist

For EACH package, complete the Pre-Execution Checklist from `EXECUTION_CHECKLIST.md`.

### 2.2 Report Format

Before proceeding with ANY package, output:

```
PRE-EXECUTION REPORT: [package-name]
=====================================
Files Found: [count]
Registry Match: [YES/NO]
Generic Files Found: [list]
Old Version Files: [list]
Naming Violations: [list]

Ready to proceed? [Awaiting confirmation]
```

---

## PART 3: PACKAGE-BY-PACKAGE CORRECTIONS

### 3.1 PACKAGE: aixord-gemini-pack

**Location:** `products/aixord-chatbot/distribution/staging/aixord-gemini-pack/`

#### Files to DELETE (Wrong/Old)

| File | Reason |
|------|--------|
| `AIXORD_GOVERNANCE_V3.2.1.md` | Generic, missing platform |
| `AIXORD_GOVERNANCE_GEMINI_V3.1.md` | Old version |
| `AIXORD_STATE_V3.1.json` | Old version, missing platform |
| `AIXORD_STATE_V3.2.1.json` | Missing platform identifier |

#### Files to MODIFY + RENAME

| Current File | Action | New Filename |
|--------------|--------|--------------|
| N/A (create new) | CREATE from v3.1 + add sections 8-11 | `AIXORD_GOVERNANCE_GEMINI_V3.2.1.md` |
| N/A (create new) | CREATE with platform | `AIXORD_STATE_GEMINI_V3.2.1.json` |

#### Files to LEAVE UNCHANGED

| File | Reason |
|------|--------|
| `AIXORD_GOVERNANCE_GEMINI_GEM.md` | Condensed, no version |
| `AIXORD_GEMINI_ADVANCED.md` | Tier guide, no version |
| `AIXORD_GEMINI_FREE.md` | Tier guide, no version |
| `AIXORD_PHASE_DETAILS.md` | Reference, no version |
| `PURPOSE_BOUND_OPERATION_SPEC.md` | Already added |
| `README.md` | Update references only |
| `LICENSE.md` | No changes |
| `LICENSE_KEY.txt` | No changes |
| `DISCLAIMER.md` | No changes |

#### README Updates

Update these references in README.md:

| Old Reference | New Reference |
|---------------|---------------|
| `AIXORD_GOVERNANCE_GEMINI_V3.2.1.md` | (keep, this is correct) |
| `AIXORD_STATE_V3.2.1.json` | `AIXORD_STATE_GEMINI_V3.2.1.json` |

---

### 3.2 PACKAGE: aixord-chatgpt-pack

**Location:** `products/aixord-chatbot/distribution/staging/aixord-chatgpt-pack/`

#### Files to DELETE (Wrong/Old)

| File | Reason |
|------|--------|
| `AIXORD_GOVERNANCE_V3.2.1.md` | Generic, missing platform |
| `AIXORD_GOVERNANCE_CHATGPT_V3.1.md` | Old version (if exists) |
| `AIXORD_STATE_V3.1.json` | Old version, missing platform |
| `AIXORD_STATE_V3.2.1.json` | Missing platform identifier |

#### Files to CREATE/UPDATE

| Action | Filename | Source |
|--------|----------|--------|
| CREATE | `AIXORD_GOVERNANCE_CHATGPT_V3.2.1.md` | Update existing v3.1 + add sections 8-11 |
| CREATE | `AIXORD_STATE_CHATGPT_V3.2.1.json` | Template with platform |

#### Files to LEAVE UNCHANGED

Same pattern as Gemini - tier guides, reference files, package files.

---

### 3.3 PACKAGE: aixord-claude-pack

**Location:** `products/aixord-chatbot/distribution/staging/aixord-claude-pack/`

#### Files to DELETE (Wrong/Old)

| File | Reason |
|------|--------|
| `AIXORD_GOVERNANCE_V3.2.1.md` | Generic, missing platform |
| `AIXORD_STATE_V3.2.1.json` | Missing platform identifier |

#### Files to CREATE/UPDATE

| Action | Filename |
|--------|----------|
| CREATE | `AIXORD_GOVERNANCE_CLAUDE_V3.2.1.md` |
| CREATE | `AIXORD_STATE_CLAUDE_V3.2.1.json` |

---

### 3.4 PACKAGE: aixord-deepseek-pack

**Location:** `DEEPSEEK/`

#### Files to DELETE (Wrong/Old)

| File | Reason |
|------|--------|
| `AIXORD_GOVERNANCE_DEEPSEEK_V3.2.md` | Old version (if exists) |
| `AIXORD_STATE_V3.2.json` | Missing platform identifier |

#### Files to CREATE/UPDATE

| Action | Filename |
|--------|----------|
| UPDATE | `AIXORD_GOVERNANCE_DEEPSEEK_V3.2.1.md` | Add sections 8-11 |
| CREATE | `AIXORD_STATE_DEEPSEEK_V3.2.1.json` |

---

### 3.5 PACKAGE: aixord-universal-pack

**Location:** `UNIVERSAL/`

#### Files to DELETE (Wrong/Old)

| File | Reason |
|------|--------|
| `AIXORD_GOVERNANCE_UNIVERSAL_V3.2.md` | Old version (if exists) |
| `AIXORD_STATE_V3.2.json` | Missing platform identifier |

#### Files to CREATE/UPDATE

| Action | Filename |
|--------|----------|
| UPDATE | `AIXORD_GOVERNANCE_UNIVERSAL_V3.2.1.md` | Add sections 8-11 |
| CREATE | `AIXORD_STATE_UNIVERSAL_V3.2.1.json` |

---

### 3.6 PACKAGE: aixord-copilot-pack

**Location:** `products/aixord-chatbot/distribution/staging/aixord-copilot-pack/`

Same pattern as above packages.

---

### 3.7 PACKAGE: aixord-starter

**Location:** `products/aixord-chatbot/distribution/staging/aixord-starter/`

Same pattern - uses Universal governance.

---

### 3.8 PACKAGE: aixord-genesis

**Location:** `products/aixord-chatbot/distribution/staging/aixord-genesis/`

#### Files to CREATE/UPDATE

| Action | Filename |
|--------|----------|
| CREATE | `AIXORD_STATE_GENESIS_V3.2.1.json` |

---

### 3.9 PACKAGE: aixord-builder-bundle

**Location:** `products/aixord-chatbot/distribution/staging/aixord-builder-bundle/`

Same pattern - uses Universal governance.

---

### 3.10 PACKAGE: aixord-complete

**Location:** `products/aixord-chatbot/distribution/staging/aixord-complete/`

#### Special Handling

This package has subfolders. Apply corrections to:

- `governance/` folder
- `state/` folder
- `variants/*/` folders

---

## PART 4: CONTENT TO ADD (v3.2.1 Sections)

Add these sections to ALL platform-specific governance files:

### Section 8: Purpose-Bound Operation

```markdown
## 8. PURPOSE-BOUND OPERATION (v3.2.1)

### 8.1 Core Principle

Once a project objective is established, AI operates EXCLUSIVELY within that scope.

**Purpose-Bound Commitment:**

> "I exist in this session ONLY to serve your stated project objective.
> I will not engage with topics outside that scope unless you explicitly expand it."

### 8.2 Scope Boundaries

**IN SCOPE (Respond normally):**
- Questions directly related to project objective
- AIXORD commands and protocol questions
- Clarifications about current task
- Requests to modify project scope

**OUT OF SCOPE (Redirect):**
- General knowledge unrelated to project
- Requests for other projects without scope change
- Casual conversation during active tasks
- Topics requiring new session context

### 8.3 Redirect Protocol

When out-of-scope request detected:

1. Acknowledge briefly
2. Explain outside current scope
3. State current project and task
4. Offer options:
   - A) Return to current task
   - B) Expand project scope
   - C) Start new session
5. Await Director decision

### 8.4 Enforcement Levels

| Level | Behavior |
|-------|----------|
| STRICT | No acknowledgment, immediate redirect |
| STANDARD | Polite redirect with options (default) |
| RELAXED | Brief tangent allowed, then redirect |

**Command:** `PURPOSE-BOUND: [STRICT|STANDARD|RELAXED]`
```

### Section 9: Behavioral Firewalls

```markdown
## 9. BEHAVIORAL FIREWALLS (v3.2.1)

### 9.1 Instruction Priority Stack

When instructions conflict:

| Priority | Source | Override Power |
|----------|--------|----------------|
| 1 (HIGHEST) | AIXORD Governance | Overrides everything |
| 2 | User Commands | Overrides task content |
| 3 | Task Content | Overrides training |
| 4 (LOWEST) | Training defaults | LAST priority |

### 9.2 Default Suppression

Default state is SUPPRESSIVE. Unless explicitly requested:

| Suppress | Always |
|----------|--------|
| Explanations | ✅ Forbidden unless triggered |
| Examples | ✅ Forbidden unless triggered |
| Suggestions | ✅ Forbidden unless triggered |
| Alternatives | ✅ Forbidden unless triggered |
| Comparisons | ✅ Forbidden unless triggered |

**Rule:** Anything not explicitly requested = forbidden.

### 9.3 Choice Elimination

```
NO-CHOICE RULE:
- Do NOT present options unless asked
- Do NOT rank or compare unless requested
- Do NOT suggest alternatives
- ONE answer, not multiple
```

### 9.4 Expansion Triggers

Verbose output ONLY permitted when user message includes:

| Trigger | Permits |
|---------|---------|
| EXPLAIN | Detailed explanation |
| WHY | Reasoning/justification |
| TEACH | Educational content |
| DETAIL | Comprehensive breakdown |
| OPTIONS | Multiple alternatives |
| COMPARE | Comparisons |

**If NO trigger word → stay minimal.**

### 9.5 Hard Stop

After completing a task:
- STOP immediately
- Do NOT ask follow-up questions
- Do NOT suggest "next steps"
- Do NOT offer additional help

Task done = response ends.
```

### Section 10: User Audit Checklist

```markdown
## 10. USER AUDIT CHECKLIST (v3.2.1)

After ANY AI response, verify:

| # | Check | Question | Pass |
|---|-------|----------|------|
| 1 | Mode | Exactly ONE mode active? | ☐ |
| 2 | Scope | No extra ideas/features added? | ☐ |
| 3 | Format | Output matches requested format? | ☐ |
| 4 | Brevity | Response ≤120 words, ≤5 bullets? | ☐ |
| 5 | Choices | No unsolicited alternatives? | ☐ |
| 6 | Approval | No execution without APPROVED? | ☐ |
| 7 | Uncertainty | Confidence stated if <90%? | ☐ |
| 8 | Stop | Response ended cleanly? | ☐ |

### If ANY Check Fails

```
HALT
[State which check failed]
Restate relevant rule
Resume
```

### All Pass → Accept Output
```

### Section 11: New Commands

```markdown
## 11. v3.2.1 COMMANDS

### Purpose-Bound Commands

| Command | Effect |
|---------|--------|
| `PURPOSE-BOUND: STRICT` | Maximum focus |
| `PURPOSE-BOUND: STANDARD` | Default with options |
| `PURPOSE-BOUND: RELAXED` | Brief tangents allowed |
| `EXPAND SCOPE: [topic]` | Add topic to project |
| `SHOW SCOPE` | Display project scope |

### Behavioral Commands

| Command | Effect |
|---------|--------|
| `SHOW REASONING` | Request reasoning trace |
| `SHOW ASSUMPTIONS` | Request assumptions |
| `DRIFT WARNING` | Alert to scope creep |

### Audit Commands

| Command | Effect |
|---------|--------|
| `AUDIT CHECK` | Run user audit checklist |
| `COMPLIANCE SCORE` | Show compliance percentage |
```

---

## PART 5: STATE FILE TEMPLATE

Use this template for all platform-specific state files:

```json
{
  "aixord_version": "3.2.1",
  "platform": "[PLATFORM]",
  "project": {
    "name": "",
    "objective": "",
    "objective_set_date": "",
    "scope_expansions": []
  },
  "purpose_bound": {
    "level": "STANDARD",
    "scope_locked": false
  },
  "session": {
    "number": 1,
    "phase": "DECISION",
    "message_count": 0
  },
  "license": {
    "identifier": "",
    "validated": false
  },
  "disclaimer": {
    "accepted": false,
    "accepted_date": ""
  }
}
```

Replace `[PLATFORM]` with: `CHATGPT`, `CLAUDE`, `GEMINI`, `DEEPSEEK`, `COPILOT`, `UNIVERSAL`, `GENESIS`, or `MASTER`.

---

## PART 6: POST-EXECUTION REQUIREMENTS

### 6.1 Complete Post-Execution Checklist

For EACH package, complete the Post-Execution Checklist from `EXECUTION_CHECKLIST.md`.

### 6.2 Verify Against FILE_REGISTRY

Each package must match its entry in `AIXORD_FILE_REGISTRY.md` exactly.

### 6.3 Recreate ZIP Packages

After all corrections verified, recreate ZIP packages:

```bash
# For each package
cd staging/[package-name]
zip -r ../../[package-name].zip .
```

### 6.4 Final Report

Output:

```
CORRECTIVE UPDATE COMPLETE
==========================
Packages Fixed: [count]
Files Deleted: [count]
Files Created: [count]
Files Renamed: [count]

All packages verified against FILE_REGISTRY.md
All README references match actual files
All versions consistent (3.2.1)
All naming conventions followed

Ready for: Distribution upload
```

---

## PART 7: ACCEPTANCE CRITERIA

### Must Pass

| Criteria | Verification |
|----------|--------------|
| No generic governance files | `ls AIXORD_GOVERNANCE_V*.md` returns empty |
| No old version files | `grep "Version: 3.1" *.md` returns empty |
| All files have platform identifier | Per NAMING_CONVENTION |
| README matches actual files | Post-exec checklist |
| All packages match FILE_REGISTRY | Post-exec checklist |

### Verification Commands

```bash
# Check for generic governance files (should return empty)
find . -name "AIXORD_GOVERNANCE_V*.md" -not -name "*_*_V*.md"

# Check for old versions (should return empty)
grep -r "Version: 3.1" --include="*.md"

# Check version consistency (all should show 3.2.1)
grep -r "Version:" --include="*.md" | grep -v "3.2.1"
```

---

## APPENDIX: QUICK REFERENCE

### Correct File Names (v3.2.1)

| Platform | Governance File | State File |
|----------|-----------------|------------|
| ChatGPT | `AIXORD_GOVERNANCE_CHATGPT_V3.2.1.md` | `AIXORD_STATE_CHATGPT_V3.2.1.json` |
| Claude | `AIXORD_GOVERNANCE_CLAUDE_V3.2.1.md` | `AIXORD_STATE_CLAUDE_V3.2.1.json` |
| Gemini | `AIXORD_GOVERNANCE_GEMINI_V3.2.1.md` | `AIXORD_STATE_GEMINI_V3.2.1.json` |
| DeepSeek | `AIXORD_GOVERNANCE_DEEPSEEK_V3.2.1.md` | `AIXORD_STATE_DEEPSEEK_V3.2.1.json` |
| Copilot | `AIXORD_GOVERNANCE_COPILOT_V3.2.1.md` | `AIXORD_STATE_COPILOT_V3.2.1.json` |
| Universal | `AIXORD_GOVERNANCE_UNIVERSAL_V3.2.1.md` | `AIXORD_STATE_UNIVERSAL_V3.2.1.json` |
| Genesis | N/A (uses AIXORD_GENESIS.md) | `AIXORD_STATE_GENESIS_V3.2.1.json` |
| Complete | `AIXORD_GOVERNANCE_MASTER_V3.2.1.md` | `AIXORD_STATE_MASTER_V3.2.1.json` |

### Files That Should NOT Exist

- `AIXORD_GOVERNANCE_V3.2.1.md` (no platform)
- `AIXORD_STATE_V3.2.1.json` (no platform)
- `AIXORD_GOVERNANCE_*_V3.1*.md` (old version)
- `AIXORD_STATE_V3.1*.json` (old version)

---

*HANDOFF v3.2.1 CORRECTIVE — Fix It Right This Time*
*© 2026 PMERIT LLC. All Rights Reserved.*
