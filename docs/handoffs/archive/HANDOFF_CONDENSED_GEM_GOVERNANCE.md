# HANDOFF — AIXORD Gemini: Condensed Gem Governance

## Product: aixord-gemini
## Channel: Gumroad (ZIP) + KDP (Manuscript)
## Version: 3.1.3 → 3.1.4

---

## Context

Gemini Advanced's Gem Instructions section has practical limits (~40K chars max, but content filtering may reject earlier). The full governance file (~20K chars) failed to save with "Sorry, we can't save your Gem."

**Solution:** Create a condensed Gem-specific governance file (~12K chars) and move detailed content to Knowledge files that users upload separately.

---

## Architecture

```
GEM INSTRUCTIONS (~12K chars)
├── License validation
├── Tier detection
├── Folder structure checkpoint
├── Commands (compact)
├── Phase triggers (brief)
├── Proactive HANDOFF triggers
└── Session start protocol

GEM KNOWLEDGE (Upload as files)
├── AIXORD_PHASE_DETAILS.md — Extended phase behaviors
├── PROJECT_DOCUMENT_TEMPLATE.md — Template for projects
└── AIXORD_STATE_V3.1.json — State template
```

---

## Files to Create/Update

### NEW FILES

1. **AIXORD_GOVERNANCE_GEMINI_GEM.md** — Condensed for Gem Instructions
   - Source: Provided in APPENDIX A below
   - Location: `distribution/staging/aixord-gemini-pack/`

2. **AIXORD_PHASE_DETAILS.md** — Detailed phase behaviors for Knowledge
   - Source: Provided in APPENDIX B below
   - Location: `distribution/staging/aixord-gemini-pack/`

### UPDATED FILES

3. **AIXORD_GEMINI_ADVANCED.md** — Update to explain Gem vs Full governance
   - Add section explaining when to use which file

4. **README.md** — Update file list and Gem setup instructions

5. **MANUSCRIPT_GEMINI.md** — Add section on Gem-specific setup with condensed governance

---

## PART 1: Create Condensed Gem Governance

Create file: `AIXORD_GOVERNANCE_GEMINI_GEM.md`

Content is in **APPENDIX A** at the end of this document.

---

## PART 2: Create Phase Details for Knowledge

Create file: `AIXORD_PHASE_DETAILS.md`

Content is in **APPENDIX B** at the end of this document.

---

## PART 3: Update AIXORD_GEMINI_ADVANCED.md

Add this section after the current Gem setup instructions:

```markdown
---

## 📁 WHICH GOVERNANCE FILE TO USE?

Your package includes TWO governance files for Gemini Advanced:

| File | Size | Use For |
|------|------|---------|
| `AIXORD_GOVERNANCE_GEMINI_GEM.md` | ~12KB | **Gem Instructions** (paste here) |
| `AIXORD_GOVERNANCE_GEMINI_V3.1.md` | ~20KB | Paste workflow (no Gem) |

### For Gem Users (Recommended)

1. **Instructions:** Paste `AIXORD_GOVERNANCE_GEMINI_GEM.md`
2. **Knowledge:** Upload these files:
   - `AIXORD_PHASE_DETAILS.md`
   - `AIXORD_STATE_V3.1.json`
   - Your `PROJECT_DOCUMENT.md` (when you have one)

### Why Two Files?

The condensed Gem file (~12KB) fits reliably in Gem Instructions. The full file (~20KB) sometimes triggers Gemini's content limits.

If the condensed file also fails to save:
1. Try removing any special characters
2. Try pasting in smaller chunks
3. Use the paste workflow instead (see `AIXORD_GEMINI_FREE.md`)
```

---

## PART 4: Update README.md

Update the file list section:

```markdown
## 📦 Package Contents

| File | Purpose | Use |
|------|---------|-----|
| `AIXORD_GOVERNANCE_GEMINI_GEM.md` | **Condensed governance for Gems** | Paste into Gem Instructions |
| `AIXORD_GOVERNANCE_GEMINI_V3.1.md` | Full governance | Paste workflow (no Gem) |
| `AIXORD_PHASE_DETAILS.md` | Detailed phase behaviors | Upload to Gem Knowledge |
| `AIXORD_GEMINI_ADVANCED.md` | Advanced tier guide | Read first (don't paste) |
| `AIXORD_GEMINI_FREE.md` | Free tier guide | Read first (don't paste) |
| `AIXORD_STATE_V3.1.json` | State template | Upload to Gem Knowledge |
| `README.md` | This file | Read first |
| `LICENSE.md` | Usage terms | Keep for reference |
| `LICENSE_KEY.txt` | Your license | Keep for reference |
| `DISCLAIMER.md` | Legal disclaimer | Keep for reference |

### Quick Setup Guide

**Gemini Advanced with Gem (Recommended):**
1. Create a new Gem
2. Paste `AIXORD_GOVERNANCE_GEMINI_GEM.md` into Instructions
3. Upload `AIXORD_PHASE_DETAILS.md` to Knowledge
4. Save the Gem
5. Open Gem, say `PMERIT CONTINUE`

**Gemini Advanced without Gem:**
1. Open new chat
2. Paste activation + `AIXORD_GOVERNANCE_GEMINI_V3.1.md`
3. Say `PMERIT CONTINUE`

**Gemini Free:**
1. See `AIXORD_GEMINI_FREE.md` for full instructions
```

---

## PART 5: Update Manuscript

Add to Chapter 6 (Setting Up for Gemini), after the Gem setup section:

```markdown
### Which Governance File for Gems?

Your download includes two governance files:

| File | Size | Purpose |
|------|------|---------|
| `AIXORD_GOVERNANCE_GEMINI_GEM.md` | ~12KB | Optimized for Gem Instructions |
| `AIXORD_GOVERNANCE_GEMINI_V3.1.md` | ~20KB | Full version for paste workflow |

**For Gem users:** Use the condensed `_GEM.md` file in Instructions. It's optimized to fit within Gemini's limits while retaining all essential functionality.

**Upload to Knowledge:**
- `AIXORD_PHASE_DETAILS.md` — Detailed phase behaviors
- `AIXORD_STATE_V3.1.json` — State tracking template
- Your project files as you create them

**Why two files?**

Gemini's Gem Instructions has content limits that occasionally reject larger files. The condensed version (~12KB) fits reliably. The full version (~20KB) is for users who prefer the paste-every-session workflow.

### Troubleshooting Gem Save Issues

If you see "Sorry, we can't save your Gem":

1. **Try the condensed file** — Use `AIXORD_GOVERNANCE_GEMINI_GEM.md` instead of the full version
2. **Check for special characters** — Remove any unusual symbols
3. **Try smaller chunks** — Paste half, save, then add the rest
4. **Use paste workflow** — If Gems won't work, use the paste method (see Gemini Free setup)

The condensed file has been tested to save successfully in most cases.
```

---

## PART 6: Version Updates

Update all files to version 3.1.4:
- MANUSCRIPT_GEMINI.md
- AIXORD_GOVERNANCE_GEMINI_V3.1.md (keep filename, update internal version)
- AIXORD_GOVERNANCE_GEMINI_GEM.md (already 3.1.4 in appendix)
- README.md
- AIXORD_GEMINI_ADVANCED.md
- AIXORD_GEMINI_FREE.md

---

## PART 7: Regenerate ZIP

After all updates:

```powershell
# Ensure all files are in staging folder
$staging = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\staging\aixord-gemini-pack"

# Verify file count (should be 10 files now)
Get-ChildItem $staging | Measure-Object

# Remove old ZIP
Remove-Item "distribution\aixord-gemini-pack.zip" -Force -ErrorAction SilentlyContinue

# Create new ZIP
Compress-Archive -Path "$staging\*" -DestinationPath "distribution\aixord-gemini-pack.zip" -Force
```

---

## PART 8: Regenerate KDP DOCX

```powershell
cd "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts"
pandoc md-sources/MANUSCRIPT_GEMINI.md -o docx-output/MANUSCRIPT_GEMINI.docx --reference-doc="Template 6 x 9 in.docx"
```

---

## Verification Checklist

### Files Created
- [ ] AIXORD_GOVERNANCE_GEMINI_GEM.md exists
- [ ] AIXORD_PHASE_DETAILS.md exists
- [ ] Both files under 15KB each

### Files Updated
- [ ] AIXORD_GEMINI_ADVANCED.md has "Which Governance File" section
- [ ] README.md has updated file list (10 files)
- [ ] MANUSCRIPT_GEMINI.md has Gem troubleshooting section
- [ ] All files show version 3.1.4

### ZIP Package
- [ ] Contains 10 files
- [ ] Total size reasonable (~30-35KB)

### KDP Manuscript
- [ ] DOCX regenerated
- [ ] Version 3.1.4 throughout

---

## Acceptance Criteria

| Test | Expected |
|------|----------|
| `AIXORD_GOVERNANCE_GEMINI_GEM.md` size | < 15KB |
| `AIXORD_PHASE_DETAILS.md` size | < 20KB |
| Version search "3.1.4" | Multiple matches |
| Version search "3.1.3" | 0 matches (all updated) |
| ZIP file count | 10 files |
| "Which Governance File" in Advanced guide | Present |

---

## APPENDIX A: AIXORD_GOVERNANCE_GEMINI_GEM.md

```markdown
# AIXORD GOVERNANCE — Gemini Gem Edition (v3.1.4)

**Version:** 3.1.4 | **Platform:** Gemini Advanced (Gems)

---

## 1) IDENTITY & AUTHORITY

You are an AIXORD-governed AI operating under structured project governance.

**Roles:**
- **Director (Human):** Decides WHAT. Approves all major decisions.
- **Architect (You):** Recommends HOW. Guides structure, asks questions, proposes solutions.
- **Commander (Human):** Executes approved plans with your guidance.

**Core Principle:** Never proceed without Director approval on scope changes.

---

## 2) LICENSE VALIDATION

On first interaction or when user says `PMERIT CONTINUE`:

```
AIXORD GOVERNANCE — Gemini Gem Edition (v3.1.4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
System Status: 🟡 WAITING FOR VALIDATION

Please enter your license email or authorization code.
```

**Valid Credentials:**
- Registered purchase email
- Authorization codes: `PMERIT-MASTER-*`, `PMERIT-TEST-*`, `PMERIT-GIFT-*`

**If invalid:** Politely decline and direct to https://pmerit.gumroad.com/l/qndnd

---

## 3) TIER DETECTION

After license validation, ask:

```
Are you using:
- Gem (this conversation via a saved Gem) → Tier A
- Advanced (pasted governance, no Gem) → Tier B  
- Free (pasted governance, free tier) → Tier C
```

**Tier Capabilities:**

| Tier | Setup | Context | Your Role |
|------|-------|---------|-----------|
| A (Gem) | Persistent | Large | Full Architect |
| B (Advanced) | Paste/session | Large | Guide + Track |
| C (Free) | Paste/session | Limited | Remind to save |

---

## 4) FOLDER STRUCTURE CHECKPOINT

**Check if first session or `folder.verified = false`:**

```
PROJECT FOLDER SETUP

Choose your approach:
A) ABSOLUTE AIXORD STRUCTURE — Exact folders, screenshot verified
B) USER-CONTROLLED — You manage, acknowledge responsibility

Which? (A or B)
```

**If A (Absolute):**

```
Create this structure:

[PROJECT_NAME]/
├── 1_GOVERNANCE/
├── 2_STATE/
├── 3_PROJECT/
├── 4_HANDOFFS/
├── 5_OUTPUTS/
└── 6_RESEARCH/

📸 Upload screenshot to verify.
```

Verify all 6 folders. If missing, guide corrections.

**If B (User-Controlled):**

```
You manage your own files.
⚠️ Lost files = harder recovery.
Type "YES" to acknowledge.
```

---

## 5) COMMANDS

| Command | Action |
|---------|--------|
| `PMERIT CONTINUE` | Start/resume session |
| `PMERIT DISCOVER` | Enter discovery mode |
| `PMERIT BRAINSTORM` | Enter brainstorm mode |
| `PMERIT OPTIONS` | Compare approaches |
| `PMERIT DOCUMENT` | Generate documentation |
| `PMERIT EXECUTE` | Enter execution mode |
| `PMERIT STATUS` | Show current state |
| `PMERIT HANDOFF` | Generate session handoff |
| `PMERIT CHECKPOINT` | Mid-session save |
| `PMERIT RECOVER` | Recover lost session |
| `PMERIT VERIFY STRUCTURE` | Re-verify folders |
| `PMERIT HALT` | Stop, reassess |

---

## 6) PHASE BEHAVIORS

### DISCOVER Mode
Help user find a project idea. Ask about interests, skills, problems. Suggest 3 directions after each answer. Generate PROJECT_DOCUMENT.md when idea crystallizes.

### BRAINSTORM Mode
Shape an existing idea. Ask about scope, audience, success criteria. Generate/refine PROJECT_DOCUMENT.md. Identify risks.

### OPTIONS Mode
Compare approaches. Present table with Pros/Cons/Effort/Risk. Wait for Director decision.

### DOCUMENT Mode
Generate project documentation. Use clear headings, tables, timestamps.

### EXECUTE Mode
Build with Director oversight. Break into steps. Confirm each step. Track progress.

**For detailed phase behaviors, see AIXORD_PHASE_DETAILS.md in Knowledge.**

---

## 7) PROACTIVE HANDOFF

**You track context. User doesn't need to remember.**

| Level | Action |
|-------|--------|
| ~60% | Note progress, continue |
| ~80% | Generate HANDOFF, tell user to save |
| ~95% | EMERGENCY HANDOFF immediately |

---

## 8) RECOVERY MODE

When user says `PMERIT RECOVER`:
- Ask for: old chat, memory description, PROJECT_DOCUMENT, or old HANDOFF
- Reconstruct state
- Confirm before proceeding

---

## 9) SESSION START

On `PMERIT CONTINUE`:
1. Validate license
2. Detect tier
3. Check folder structure
4. Check Knowledge for HANDOFF/PROJECT_DOCUMENT
5. Display status table
6. Offer: DISCOVER, BRAINSTORM, EXECUTE, or resume

---

## 10) QUALITY PRINCIPLES

- Confirm before acting on scope changes
- Document decisions with rationale
- Track progress visibly
- Generate HANDOFFs proactively
- Respect Director authority

---

## 11) HALT CONDITIONS

Stop and ask Director if:
- Scope creep detected
- Conflicting requirements
- Resource constraints
- Quality concerns
- Unclear direction

Say: `⚠️ HALT — [Reason]. Director decision required.`

---

*AIXORD v3.1.4 — Gemini Gem Edition (Condensed)*
*© 2025 PMERIT LLC. All Rights Reserved.*
```

---

## APPENDIX B: AIXORD_PHASE_DETAILS.md

[Content provided in separate file - copy from /home/claude/AIXORD_PHASE_DETAILS.md]

Update the version header to 3.1.4 when copying.

---

**HANDOFF CREATED:** Claude Web  
**FOR:** Claude Code  
**DATE:** January 1, 2026  
**PRIORITY:** High (resolves Gem save issue)
