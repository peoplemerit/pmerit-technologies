# HANDOFF — AIXORD Distribution Package Updates

**Document ID:** HANDOFF_PACKAGE_UPDATE_V1  
**From:** Claude Web (Architect)  
**To:** Claude Code (Commander)  
**Date:** 2025-12-29  
**Priority:** HIGH  

---

## Executive Summary

Update ALL 8 Gumroad ZIP packages to include 3 missing files that exist in the Pmerit v2.1 reference implementation but were not included in distribution packages:

1. `AIXORD_CHEAT_SHEET.md` — Ultra-compact quick reference
2. `AIXORD_COMMAND_CARD.md` — Full command reference
3. `CLAUDE_WEB_INSTRUCTIONS.md` — Claude Web project setup guide

**Director Decision:** APPROVED 2025-12-29

---

## 1. Source Files Location

The 3 new files should be created in the staging folder:

```
C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\staging\
├── AIXORD_CHEAT_SHEET.md
├── AIXORD_COMMAND_CARD.md
└── CLAUDE_WEB_INSTRUCTIONS.md
```

**File contents are provided in Section 6 of this HANDOFF.**

---

## 2. Target Packages (All 8 ZIPs)

| # | Package | Path | Action |
|---|---------|------|--------|
| 1 | `aixord-starter.zip` | `distribution/` | ADD 3 files |
| 2 | `aixord-genesis.zip` | `distribution/` | ADD 3 files |
| 3 | `aixord-claude-pack.zip` | `distribution/` | ADD 3 files |
| 4 | `aixord-chatgpt-pack.zip` | `distribution/` | ADD 3 files |
| 5 | `aixord-gemini-pack.zip` | `distribution/` | ADD 3 files |
| 6 | `aixord-copilot-pack.zip` | `distribution/` | ADD 3 files |
| 7 | `aixord-builder-bundle.zip` | `distribution/` | ADD 3 files |
| 8 | `aixord-complete.zip` | `distribution/` | ADD 3 files |

**Base Path:** `C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\`

---

## 3. Target Folder Structure Within Each ZIP

Add files to a new `quick-start/` folder:

```
[package].zip/
├── README.md                       ← EXISTING
├── LICENSE.md                      ← EXISTING
├── quick-start/                    ← NEW FOLDER
│   ├── CHEAT_SHEET.md              ← NEW (renamed from AIXORD_CHEAT_SHEET.md)
│   ├── COMMAND_CARD.md             ← NEW (renamed from AIXORD_COMMAND_CARD.md)
│   └── CLAUDE_WEB_INSTRUCTIONS.md  ← NEW
├── [existing folders...]           ← PRESERVE
```

---

## 4. Execution Steps

### Phase 1: Create Staging Files

```powershell
cd C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution

# Create staging folder if not exists
mkdir staging -ErrorAction SilentlyContinue

# Create the 3 files (content from Section 6)
```

### Phase 2: Update Each ZIP Package

For each of the 8 packages:

```powershell
# Example for aixord-complete.zip:
cd C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution

# 1. Extract to temp folder
Expand-Archive -Path "aixord-complete.zip" -DestinationPath "temp-complete" -Force

# 2. Create quick-start folder
mkdir "temp-complete\quick-start" -ErrorAction SilentlyContinue

# 3. Copy new files
Copy-Item "staging\AIXORD_CHEAT_SHEET.md" "temp-complete\quick-start\CHEAT_SHEET.md"
Copy-Item "staging\AIXORD_COMMAND_CARD.md" "temp-complete\quick-start\COMMAND_CARD.md"
Copy-Item "staging\CLAUDE_WEB_INSTRUCTIONS.md" "temp-complete\quick-start\CLAUDE_WEB_INSTRUCTIONS.md"

# 4. Archive old ZIP
Move-Item "aixord-complete.zip" "archives\aixord-complete_backup_$(Get-Date -Format 'yyyyMMdd').zip" -Force

# 5. Create updated ZIP
Compress-Archive -Path "temp-complete\*" -DestinationPath "aixord-complete.zip" -Force

# 6. Cleanup temp folder
Remove-Item "temp-complete" -Recurse -Force
```

**Repeat for all 8 packages.**

### Phase 3: Update README.md in Each Package (Optional Enhancement)

Add this section to each package's README.md:

```markdown
## Quick Start Materials

New to AIXORD? Start here:

| File | Purpose |
|------|---------|
| `quick-start/CHEAT_SHEET.md` | One-page reference (print and tape to monitor) |
| `quick-start/COMMAND_CARD.md` | Complete command reference |
| `quick-start/CLAUDE_WEB_INSTRUCTIONS.md` | Claude Web project setup |
```

---

## 5. Manuscript Updates (8 DOCX Files)

The manuscripts should reference the new quick-start materials. 

**Files to Update:**
- `MANUSCRIPT_STARTER.docx`
- `MANUSCRIPT_GENESIS.docx`
- `MANUSCRIPT_CLAUDE.docx`
- `MANUSCRIPT_CHATGPT.docx`
- `MANUSCRIPT_GEMINI.docx`
- `MANUSCRIPT_COPILOT.docx`
- `MANUSCRIPT_BUILDER.docx`
- `MANUSCRIPT_COMPLETE.docx`

**Section to Add (after Table of Contents or in Getting Started chapter):**

```
## Quick Start Materials

Your download includes three quick-reference documents in the `quick-start/` folder:

**CHEAT_SHEET.md** — A one-page reference card. Print it and tape it to your monitor for instant command recall.

**COMMAND_CARD.md** — Complete command reference with all modes, states, and recipes.

**CLAUDE_WEB_INSTRUCTIONS.md** — Instructions for setting up AIXORD in Claude Web projects. Copy these into your Claude Project's "Set project instructions" dialog.

We recommend starting with the Cheat Sheet while reading this book, then graduating to the full Command Card as you become comfortable with AIXORD.
```

**Location in Manuscript:** Add as Chapter 2 or after the Introduction chapter.

---

## 6. File Contents

### 6.1 AIXORD_CHEAT_SHEET.md

```markdown
# AIXORD — CHEAT SHEET

## STEERING (Where)
```
[PROJECT] CONTINUE      Resume work
SCOPE: [name]           Load SCOPE
```

## GEARS (Mode)
```
ENTER DECISION MODE     Brainstorm, spec (safe)
ENTER EXECUTION MODE    Implement (frozen)
AUDIT SCOPE: [name]     Investigate
VISUAL AUDIT: [name]    Screenshot check
STATUS                  Report state
```

## BRAKES (Stop)
```
HALT                    Stop everything
UNLOCK: [file]          Allow edit
RELOCK: [file]          Protect again
APPROVED                Proceed
```

## STATUS LIGHTS
```
🟢 DECISION     Safe to discuss
🟡 EXECUTION    Implementing
🔵 AUDIT        Read-only
🔴 HALTED       Stopped
```

## QUICK START
```
New session    -> [PROJECT] CONTINUE
Emergency      -> HALT
Execute spec   -> APPROVED. ENTER EXECUTION MODE
```

---
*Print this. Tape it to your monitor.*
*AIXORD — Authority. Execution. Confirmation.*
```

### 6.2 AIXORD_COMMAND_CARD.md

```markdown
# AIXORD — COMMAND CARD

+-----------------------------------------------------------------------------+
|                          AIXORD DRIVER'S PANEL                              |
+-----------------------------------------------------------------------------+

+-----------------------------------------------------------------------------+
|  STEERING — Where to Go                                                     |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [PROJECT] CONTINUE         -> Resume work in your project                  |
|                                                                             |
|  SCOPE: [name]              -> Load specific SCOPE                          |
|  SCOPE: MASTER              -> Load full project vision                     |
|                                                                             |
+-----------------------------------------------------------------------------+

+-----------------------------------------------------------------------------+
|  GEARS — Operating Modes                                                    |
+-----------------------------------------------------------------------------+
|                                                                             |
|  ENTER DECISION MODE        -> Open discussion, brainstorm, spec writing    |
|                               (Claude Web = Architect)                      |
|                                                                             |
|  ENTER EXECUTION MODE       -> Frozen decisions, implement specs            |
|                               (Claude Code = Commander)                     |
|                               ! Requires approved HANDOFF                   |
|                                                                             |
|  ENTER AUDIT MODE           -> Read-only investigation, no changes          |
|  AUDIT SCOPE: [name]        -> Audit specific SCOPE against reality         |
|                                                                             |
|  VISUAL AUDIT: [name]       -> Screenshot verification (UI SCOPEs)          |
|                                                                             |
|  STATUS                     -> Report current state (no work)               |
|                                                                             |
+-----------------------------------------------------------------------------+

+-----------------------------------------------------------------------------+
|  BRAKES — Stop & Control                                                    |
+-----------------------------------------------------------------------------+
|                                                                             |
|  HALT                       -> STOP everything, return to DECISION          |
|                               (Use anytime, no questions asked)             |
|                                                                             |
|  UNLOCK: [file]             -> Allow modification of locked file            |
|  RELOCK: [file]             -> Re-protect file after changes                |
|                                                                             |
|  EXTEND ATTEMPTS: [task]    -> Allow 5 attempts instead of 3                |
|                                                                             |
|  APPROVED / PROCEED / YES   -> Explicit approval to continue                |
|  REJECTED / NO / STOP       -> Reject proposal, do not proceed              |
|                                                                             |
+-----------------------------------------------------------------------------+

+-----------------------------------------------------------------------------+
|  DASHBOARD — Quick Status Indicators                                        |
+-----------------------------------------------------------------------------+
|                                                                             |
|  Mode Indicator:                                                            |
|    🟢 [D] DECISION    — Open discussion, safe to brainstorm                 |
|    🟡 [E] EXECUTION   — Implementing, decisions frozen                      |
|    🔵 [A] AUDIT       — Read-only, investigating                            |
|    🟣 [V] VISUAL_AUDIT— Reviewing screenshots                               |
|    🔴 [H] HALTED      — Stopped, awaiting direction                         |
|                                                                             |
|  SCOPE States:                                                              |
|    EMPTY       — File created, no content                                   |
|    AUDITED     — Reality documented                                         |
|    SPECIFIED   — HANDOFF written                                            |
|    IN_PROGRESS — Execution active                                           |
|    VISUAL_AUDIT— UI verification                                            |
|    COMPLETE    — All verified                                               |
|    LOCKED      — Protected, needs UNLOCK                                    |
|                                                                             |
+-----------------------------------------------------------------------------+

+-----------------------------------------------------------------------------+
|  AUTOMATIC HALT TRIGGERS (AI will stop and ask)                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  * Ambiguous requirement          * Locked file touched                     |
|  * Missing specification          * 3 consecutive failures                  |
|  * Prerequisite not met           * Scope creep detected                    |
|  * Cross-repo conflict            * Visual discrepancy unresolved           |
|                                                                             |
+-----------------------------------------------------------------------------+

+-----------------------------------------------------------------------------+
|  QUICK RECIPES                                                              |
+-----------------------------------------------------------------------------+
|                                                                             |
|  Start Work:                                                                |
|    -> "[PROJECT] CONTINUE"                                                  |
|                                                                             |
|  Fix Something in Locked File:                                              |
|    -> "UNLOCK: path/to/file.ts"                                             |
|    -> [make changes]                                                        |
|    -> "RELOCK: path/to/file.ts"                                             |
|                                                                             |
|  Emergency Stop:                                                            |
|    -> "HALT"                                                                |
|                                                                             |
|  Approve and Execute:                                                       |
|    -> "APPROVED. ENTER EXECUTION MODE"                                      |
|                                                                             |
+-----------------------------------------------------------------------------+

                        AIXORD — Authority. Execution. Confirmation.
```

### 6.3 CLAUDE_WEB_INSTRUCTIONS.md

```markdown
# CLAUDE WEB — PROJECT INSTRUCTIONS (AIXORD)

## 0) Operating Role + Authority Contract

You are operating under **AIXORD** governance.

**Human (Director)** decides WHAT exists and approves all decisions.

**Claude Web (Architect / Strategist)** analyzes, specifies, brainstorms, researches, and produces HANDOFFs.

**Claude Code (Commander / Executor)** implements approved HANDOFFs, edits files, and ships artifacts.

**Rule:** Claude Web never "implements." Claude Web produces specs + handoffs only.

---

## 1) Project Setup

### Option A: Single Repository
```
your-project/
├── .claude/
│   └── scopes/
│       ├── MASTER_SCOPE.md
│       └── SCOPE_[FEATURE].md
├── AIXORD_GOVERNANCE.md
└── AIXORD_STATE.json
```

### Option B: Claude Project Knowledge
Upload to Project Knowledge:
- `AIXORD_GOVERNANCE.md` (rules)
- `AIXORD_STATE.json` (state tracking)
- `SCOPE_*.md` files as needed

---

## 2) Mode Discipline

Claude Web operates in **DECISION mode** by default.

| Mode | Claude Web Role | Permitted Actions |
|------|-----------------|-------------------|
| **DECISION** | Architect | Analyze, brainstorm, research, write specs, create HANDOFFs |
| **AUDIT** | Inspector | Review existing SCOPEs, check alignment, report findings |

**Prohibited in Claude Web:**
- Executing code
- Editing repository files directly
- Implementing changes
- Inventing requirements during execution

**If ambiguity exists → HALT and request Director decision.**

---

## 3) Session Start Protocol

On every session start:

1. **READ** Project Knowledge files (governance, state, handoffs)
2. **REPORT** current state:
   - Active SCOPE
   - Pending confirmations
   - Carryforward items
3. **WAIT** for Human direction

**Session Start Output Format:**
```
🔄 AIXORD SESSION — Claude Web (Architect)

| Field | Value |
|-------|-------|
| Mode | DECISION |
| Active SCOPE | [from state or "None"] |
| Pending Confirmations | [list or "None"] |
| Carryforward Items | [max 5] |

Ready for direction.
```

---

## 4) SCOPE Structure

**SCOPE:** Single implementable unit of work in a dedicated file.

**Location:** `.claude/scopes/SCOPE_[NAME].md`

**Lifecycle:**
```
EMPTY → AUDITED → SPECIFIED → IN_PROGRESS → VISUAL_AUDIT → COMPLETE → LOCKED
```

---

## 5) HANDOFF Protocol

When transferring work to Claude Code, produce a HANDOFF containing:

| Section | Content |
|---------|---------|
| **Context** | Why this work exists |
| **Current State** | Where we are now |
| **Specification** | Exactly what to implement |
| **Dependencies** | What must exist first |
| **Acceptance Criteria** | How to verify completion |
| **Carryforward Items** | Incomplete work |

---

## 6) Commands

| Command | Effect |
|---------|--------|
| `[PROJECT] CONTINUE` | Resume work on your project |
| `SCOPE: [name]` | Load specific SCOPE for discussion |
| `AUDIT SCOPE: [name]` | Request audit (produces HANDOFF for Claude Code) |
| `HALT` | Stop, return to DECISION |
| `STATUS` | Report current state |

---

## 7) Drift Prevention

To prevent drift between sessions:

- Always reference governance as canonical
- Do not produce "similar but not identical" outputs
- Use exact terminology from governance (PASS/DISCREPANCY, not PASS/FAIL)
- Update state through HANDOFFs, not assumptions

---

*AIXORD — Authority. Execution. Confirmation.*
```

---

## 7. Acceptance Criteria

- [ ] All 3 files created in `staging/` folder
- [ ] All 8 ZIP packages contain `quick-start/` folder with 3 files
- [ ] Old ZIP files archived in `archives/` folder with date suffix
- [ ] Each package's README.md updated with Quick Start Materials section
- [ ] File sizes increased appropriately (~12 KB per package)

---

## 8. Verification Commands

```powershell
# Verify all packages have quick-start folder
foreach ($zip in Get-ChildItem "*.zip") {
    Write-Host "Checking $($zip.Name)..."
    $contents = (Compress-Archive -Path $zip.FullName -List)
    if ($contents -match "quick-start") {
        Write-Host "  ✅ quick-start folder found"
    } else {
        Write-Host "  ❌ quick-start folder MISSING"
    }
}
```

---

## 9. Rollback Plan

If issues occur:
1. Archive folder contains original ZIPs with date suffix
2. Restore: `Copy-Item "archives\[package]_backup_[date].zip" "[package].zip"`

---

**HANDOFF STATUS:** Ready for Execution  
**Awaiting:** Claude Code acknowledgment

---

*AIXORD — Authority. Execution. Confirmation.*
