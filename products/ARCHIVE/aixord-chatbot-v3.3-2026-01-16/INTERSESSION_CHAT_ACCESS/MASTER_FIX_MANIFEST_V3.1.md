# MASTER FIX MANIFEST — AIXORD Product Suite v3.1 Update

**Date:** December 31, 2025
**Prepared by:** Claude Web (Architect)
**For:** Claude Code (Commander) + Director Approval

---

## EXECUTIVE SUMMARY

This manifest consolidates ALL identified issues into a single, comprehensive fix package. 

**Total Issues:** 24
**New Governance Version:** 3.1 (Intelligent Project Architect)
**Affected Products:** 8 ZIP packages + 8 Manuscripts
**New Features:** PMERIT branding, 2-email licensing, Master credentials

---

## ISSUE REGISTRY (Complete — 24 Issues)

### MANUSCRIPT CONTENT ISSUES

| # | Issue | Fix |
|---|-------|-----|
| 1 | No prerequisites chapter | Add "Before You Begin" chapter |
| 2 | Appendix says "Claude, ChatGPT, etc." | Change to Claude-specific text |
| 3 | No version/date | Add version footer to manuscripts |
| 4 | No "check for updates" notice | Add updates section |
| 5 | Gap: download to working setup | Bridge instructions in new chapter |
| 6 | "README" not explained | Add "Key Terms" section |

### MANUSCRIPT FORMATTING ISSUES

| # | Issue | Fix |
|---|-------|-----|
| 15 | Wrong page size (A4 instead of 6×9) | Reformat to 6" × 9" |
| 16 | Wrong margins | Apply KDP margins |
| 17 | No mirror margins for binding | Enable mirror margins |

### ZIP PACKAGE ISSUES

| # | Issue | Fix |
|---|-------|-----|
| 7 | CLAUDE_WEB_INSTRUCTIONS is governance only | Replace with v3.1 (includes setup) |
| 8 | No step-by-step setup walkthrough | Built into v3.1 governance |
| 9 | README may not be detailed enough | Update README with setup flow |

### SETUP FLOW ISSUES

| # | Issue | Fix |
|---|-------|-----|
| 10 | How to CREATE Claude Project | Documented in v3.1 Section 7 |
| 11 | WHERE to paste instructions | Documented in v3.1 Section 7 |
| 12 | WHAT to upload to Project Knowledge | Documented in v3.1 Section 7 |
| 13 | First command not obvious | `PMERIT CONTINUE` prominent in v3.1 |

### GOVERNANCE ISSUES

| # | Issue | Fix |
|---|-------|-----|
| 14 | No DISCOVERY mode for users without projects | Added as Phase 1 in v3.1 |
| 18 | v3.0 refinements not in distribution | Integrated into v3.1 (formulas, status locking) |

### BRANDING & LICENSING ISSUES

| # | Issue | Fix |
|---|-------|-----|
| 19 | Generic trigger command | Changed to `PMERIT CONTINUE` (brand-forward) |
| 20 | No buyer accountability | Add LICENSE_KEY.txt with buyer watermark |
| 21 | No license reminder in product | Added to governance file header |
| 22 | No value incentive for registration | Added "Registered Buyer Benefits" section |
| 23 | No usage limit per license | Added 2-email license check in governance |
| 24 | No seller override for testers/gifts | Added Master/Tester/Gift credential bypass |

---

## FIX 1: NEW GOVERNANCE FILE

**File:** `AIXORD_GOVERNANCE_V3.1.md`
**Location:** Replace `quick-start/CLAUDE_WEB_INSTRUCTIONS.md` in all ZIPs
**Also:** Add to ZIP root as `AIXORD_GOVERNANCE_V3.1.md`

**New Features in v3.1:**
- Environment detection (Pro+Code, Pro only, Free)
- DISCOVERY mode for users without project ideas
- BRAINSTORM mode with structured questioning
- OPTIONS mode with cost/benefit alternatives
- DOCUMENT mode auto-generates project plans
- Session continuity with HANDOFF protocol
- Claude Code setup guide (Section 7)
- Free tier manual setup guide (Section 8)
- Project Composition Formula (sophisticated + simple)
- Status Locking System
- Quality principles built into decision-making

---

## FIX 2: UPDATED README.md

Replace README.md in all ZIP packages with:

```markdown
# AIXORD for Claude Users

**Version:** 3.1 | **Updated:** December 2025

---

## What is AIXORD?

AIXORD (AI Execution Order) transforms chaotic AI conversations into structured, productive projects. You stay in control as the Director while Claude serves as your intelligent Architect.

---

## Quick Start (5 Minutes)

### Step 1: Know Your Setup

| If You Have... | Your Tier | Setup Method |
|----------------|-----------|--------------|
| Claude Pro + Claude Code | Tier A | Full automation |
| Claude Pro only | Tier B | Guided manual |
| Claude Free | Tier C | Fully manual |

### Step 2: Setup by Tier

**TIER A (Pro + Code):**
1. Create a Claude Project at claude.ai
2. Open Project Settings → "Set project instructions"
3. Paste the ENTIRE contents of `AIXORD_GOVERNANCE_V3.1.md`
4. Upload `AIXORD_STATE.json` to Project Knowledge
5. Start a conversation and type: `PMERIT CONTINUE`

**TIER B (Pro Only):**
1. Create a Claude Project at claude.ai
2. Open Project Settings → "Set project instructions"
3. Paste the ENTIRE contents of `AIXORD_GOVERNANCE_V3.1.md`
4. Start a conversation and type: `PMERIT CONTINUE`
5. Claude will guide you through manual implementation steps

**TIER C (Free):**
1. Open Claude at claude.ai
2. Copy the ENTIRE contents of `AIXORD_GOVERNANCE_V3.1.md`
3. Paste it at the START of your conversation
4. Type: `PMERIT CONTINUE`
5. At session end, ask for `HANDOFF` and save it locally
6. Next session: paste governance + handoff to continue

### Step 3: Tell Claude What You Need

- **Have a project idea?** → "I want to build [description]"
- **No idea yet?** → "I don't know what to build, help me discover"
- **Have a plan already?** → "I have a plan, help me implement it"

That's it. AIXORD guides you from there.

---

## What's In This Package

| File/Folder | What It Is | What To Do |
|-------------|------------|------------|
| `AIXORD_GOVERNANCE_V3.1.md` | The brain — paste into Claude | **START HERE** |
| `AIXORD_STATE.json` | State tracking template | Upload to Project Knowledge |
| `quick-start/CHEAT_SHEET.md` | One-page command reference | Print and keep handy |
| `quick-start/COMMAND_CARD.md` | Full command reference | Detailed reference |
| `templates/` | Scope and handoff templates | Use as needed |
| `DISCLAIMER.md` | Terms of use | Read before using |
| `LICENSE.md` | License terms | Read before using |

---

## Key Terms (For Non-Technical Users)

| Term | Meaning |
|------|---------|
| **README** | "Read Me" — this file. Always read first. |
| **.md files** | Markdown files — plain text you can open in any text editor |
| **.json files** | Data files — store structured information |
| **ZIP file** | Compressed folder — extract before using |
| **Extract** | Unpack the ZIP (Windows: Right-click → Extract All) |
| **Project Knowledge** | Claude Pro feature — upload files for Claude to reference |

---

## Need Help?

- **Email:** support@pmerit.com
- **Updates:** Visit pmerit.com/aixord
- **Full Documentation:** See the AIXORD book you purchased

---

*AIXORD v3.1 — Authority. Execution. Confirmation.*
*© 2025 PMERIT LLC. All Rights Reserved.*
```

---

## FIX 3: MANUSCRIPT CONTENT ADDITIONS

### 3.1 New Chapter: "Before You Begin"

Insert AFTER Dedication, BEFORE Table of Contents:

```
BEFORE YOU BEGIN

This chapter ensures you have everything needed to succeed with AIXORD.

WHAT YOU NEED

Required (All Users):
□ Claude account at claude.ai (free accounts work)
□ Internet connection
□ Ability to download and extract ZIP files
□ Basic copy/paste skills

For Best Experience (Claude Pro — $20/month):
□ Enables "Projects" feature
□ Enables "Project Knowledge" for file uploads
□ Persistent instructions across conversations
□ Recommended for serious projects

For Maximum Power (Claude Pro + Claude Code):
□ Full file system access
□ Automated implementation
□ Best for software development projects

WHAT'S NOT REQUIRED

You do NOT need:
× Programming experience
× Project management certification
× Prior AI framework knowledge
× Technical writing skills

AIXORD is designed for anyone who wants structured AI collaboration.

KEY TERMS

Before diving in, understand these terms:

README — Short for "Read Me." This is always the FIRST file you 
should open in any software package. It contains essential 
instructions for getting started.

.md files — Markdown files. These are plain text documents you can 
open with any text editor (Notepad on Windows, TextEdit on Mac, 
or VS Code). They use simple formatting like *bold* and # headers.

.json files — Data files that store structured information. For 
AIXORD, these track your project state. Open only when instructed; 
editing incorrectly can cause issues.

ZIP file — A compressed folder containing multiple files. Before you 
can use the files inside, you must EXTRACT (unpack) it:
  • Windows: Right-click the ZIP → "Extract All"
  • Mac: Double-click the ZIP file

Once extracted, open the README.md file first.

THREE WAYS TO USE AIXORD

AIXORD adapts to your Claude subscription:

Tier A: Claude Pro + Claude Code
Full automation. Claude Web plans, Claude Code implements. 
Best for: Software development, complex technical projects.

Tier B: Claude Pro Only  
Guided implementation. Claude plans and provides step-by-step 
instructions. You execute manually.
Best for: Most users, content projects, planning.

Tier C: Claude Free
Fully manual with guidance. Paste governance each session.
Save handoffs locally between conversations.
Best for: Trying AIXORD before subscribing, simple projects.

The governance file (AIXORD_GOVERNANCE_V3.1.md) automatically 
detects your tier and adapts its behavior.

CHECK FOR UPDATES

AIXORD is actively developed. For the latest:
• Templates: Check your Gumroad library for updated downloads
• Documentation: Visit pmerit.com/aixord
• Support: Email support@pmerit.com

This Book: Version 3.1 (December 2025)
```

### 3.2 Fix Appendix B Text

**Change FROM:**
> "Open your AI assistant (Claude, ChatGPT, etc.)"

**Change TO:**
> "Open Claude at claude.ai"

### 3.3 Add Version Footer

Add to copyright page:
```
Product Version: 3.1
Published: December 2025
```

---

## FIX 4: MANUSCRIPT FORMATTING (KDP 6×9)

Apply these settings to ALL 8 manuscripts:

### Page Setup
```
Page Size:       6" × 9" (Custom)
Orientation:     Portrait
Mirror Margins:  YES

Margins:
  Top:           0.6"
  Bottom:        0.6"
  Inside:        0.76" (binding gutter)
  Outside:       0.6"
  Header:        0.35"
  Footer:        0.35"
```

### Typography
```
Body Text:
  Font:          Georgia or Garamond
  Size:          11pt
  Line Spacing:  1.15 or 1.3
  Alignment:     Justified
  First Line:    0.3" indent (except after headings)

Chapter Titles:
  Font:          Same as body, Bold
  Size:          18-20pt
  Spacing Before: 72pt (starts new page)
  Spacing After:  24pt

Section Headings:
  Font:          Same as body, Bold
  Size:          14pt
  Spacing Before: 18pt
  Spacing After:  6pt
```

### Page Breaks
- New chapter = New page (Insert Page Break)
- Title page, Copyright, Dedication, TOC = Each on own page
- No widows/orphans (at least 2 lines at page top/bottom)

---

## FIX 5: ZIP PACKAGE UPDATES

### Files to Update in ALL 8 ZIPs:

| Action | File | Notes |
|--------|------|-------|
| REPLACE | `quick-start/CLAUDE_WEB_INSTRUCTIONS.md` | With v3.1 governance |
| ADD | `AIXORD_GOVERNANCE_V3.1.md` | At ZIP root (main file) |
| REPLACE | `README.md` | With new version above |
| KEEP | All other files | No changes |

### File Naming in ZIPs:
```
[package].zip/
├── README.md                          ← UPDATED
├── AIXORD_GOVERNANCE_V3.1.md          ← NEW (main governance)
├── LICENSE_KEY.txt                    ← NEW (buyer watermark)
├── LICENSE.md
├── DISCLAIMER.md
├── AIXORD_STATE.json                  ← Rename from V2 if needed
├── quick-start/
│   ├── CHEAT_SHEET.md
│   ├── COMMAND_CARD.md
│   └── CLAUDE_WEB_INSTRUCTIONS.md     ← REPLACED with v3.1
├── templates/
├── examples/
└── variants/
```

---

## FIX 6: STATE FILE UPDATE

Update `AIXORD_STATE.json` to v3.1 format:

```json
{
  "version": "3.1",
  "project": {
    "name": "[Your Project Name]",
    "created": "[Date]",
    "description": "[One-line description]"
  },
  "environment": {
    "tier": "[A|B|C]",
    "claude_pro": false,
    "claude_code": false
  },
  "phase": "DISCOVERY",
  "session": {
    "number": 1,
    "last_updated": "[Timestamp]"
  },
  "decisions": [],
  "status_ledger": {
    "scopes": []
  },
  "carryforward": []
}
```

---

## FIX 7: LICENSE_KEY.txt (New File for ZIPs)

Add this file to ALL ZIP packages. Gumroad will replace `{{variables}}` with actual buyer data.

```
═══════════════════════════════════════════════════════════════════════════════
                         AIXORD LICENSE CERTIFICATE
═══════════════════════════════════════════════════════════════════════════════

  Licensed To:      {{buyer_email}}
  Purchase Date:    {{sale_timestamp}}
  Product:          {{product_name}}
  License ID:       {{sale_id}}

───────────────────────────────────────────────────────────────────────────────

  LICENSE TERMS:
  
  ✓ This license covers UP TO 2 email addresses
  ✓ Primary: {{buyer_email}} (automatically registered)
  ✓ Secondary: Contact support@pmerit.com to register
  
  ✗ This license is NON-TRANSFERABLE
  ✗ Redistribution and resale are PROHIBITED
  ✗ Unauthorized sharing is traceable

───────────────────────────────────────────────────────────────────────────────

  REGISTERED BUYER BENEFITS:
  
  • Free updates (check your Gumroad library)
  • Email support: support@pmerit.com
  • Community access (coming soon)

───────────────────────────────────────────────────────────────────────────────

  SUPPORT:     support@pmerit.com
  PIRACY:      legal@pmerit.com
  UPDATES:     https://pmerit.gumroad.com

═══════════════════════════════════════════════════════════════════════════════
                    © 2025 PMERIT LLC. All Rights Reserved.
═══════════════════════════════════════════════════════════════════════════════
```

---

## FIX 8: MASTER CREDENTIALS (Seller Reference — Do NOT Include in Products)

Keep this reference for your use only:

### Master Override (Your Personal Bypass)
```
Code: PMERIT-MASTER-2025X
Access: Unlimited
Use: When you need to test products or demo
```

### Tester Credentials (Generate as Needed)
```
Format: PMERIT-TEST-[TESTER_NAME]-[DATE]
Example: PMERIT-TEST-BLESSING-1231
Access: Full (suggest time limit verbally)
Use: For authorized testers under NDA
```

### Gift Credentials (Generate as Needed)
```
Format: PMERIT-GIFT-[PURPOSE]-[CODE]
Example: PMERIT-GIFT-CHARITY-2025A
Access: Full
Use: For charity donations, promotional gifts
```

### How to Issue Credentials:
1. Generate a unique code using format above
2. Tell recipient the code verbally or via secure channel
3. Log issued codes in your records:

| Code | Issued To | Date | Purpose | Expires |
|------|-----------|------|---------|---------|
| PMERIT-TEST-BLESSING-1231 | Blessing Aluge | 2025-12-31 | NDA Tester | 2026-01-31 |
| PMERIT-TEST-OLUFIKAYO-1231 | Olufikayo Sofolahan | 2025-12-31 | NDA Tester | 2026-01-31 |

---

## EXECUTION CHECKLIST (Updated)

### Phase 1: File Creation
- [ ] Create `AIXORD_GOVERNANCE_V3.1.md` ✅ (provided in this package)
- [ ] Create updated `README.md` template ✅ (provided above)
- [ ] Create updated `AIXORD_STATE.json` template
- [ ] Create `LICENSE_KEY.txt` template ✅ (provided above)

### Phase 2: ZIP Package Updates (All 8)
- [ ] aixord-starter.zip
- [ ] aixord-genesis.zip
- [ ] aixord-claude-pack.zip
- [ ] aixord-chatgpt-pack.zip
- [ ] aixord-gemini-pack.zip
- [ ] aixord-copilot-pack.zip
- [ ] aixord-builder-bundle.zip
- [ ] aixord-complete.zip

For each:
- [ ] Extract ZIP
- [ ] Add AIXORD_GOVERNANCE_V3.1.md to root
- [ ] Add LICENSE_KEY.txt to root (with Gumroad variables)
- [ ] Replace quick-start/CLAUDE_WEB_INSTRUCTIONS.md with v3.1 governance
- [ ] Replace README.md
- [ ] Update AIXORD_STATE.json
- [ ] Re-create ZIP
- [ ] Verify contents

### Phase 3: Manuscript Updates (All 8)
- [ ] MANUSCRIPT_STARTER.docx
- [ ] MANUSCRIPT_GENESIS.docx
- [ ] MANUSCRIPT_CLAUDE.docx
- [ ] MANUSCRIPT_CHATGPT.docx
- [ ] MANUSCRIPT_GEMINI.docx
- [ ] MANUSCRIPT_COPILOT.docx
- [ ] MANUSCRIPT_BUILDER.docx
- [ ] MANUSCRIPT_COMPLETE.docx

For each:
- [ ] Change page size to 6" × 9"
- [ ] Set KDP margins
- [ ] Enable mirror margins
- [ ] Add "Before You Begin" chapter
- [ ] Fix Appendix B text
- [ ] Add version to copyright page
- [ ] Review typography
- [ ] Verify page breaks

### Phase 4: Verification
- [ ] Each ZIP extracts cleanly
- [ ] GOVERNANCE file opens and is complete
- [ ] README provides clear setup path
- [ ] Manuscripts open without errors
- [ ] Page count meets KDP minimum (24+)
- [ ] Discount codes still present and correct

---

## ROLLBACK PLAN

If issues arise:
1. All original files are in `archives/` folder with date suffix
2. Restore from `archives/[filename]_[DATE].ext`
3. Report specific issue for targeted fix

---

## ESTIMATED EFFORT

| Task | Time |
|------|------|
| Create v3.1 files | ✅ Done (in this manifest) |
| Update 8 ZIPs | ~45 minutes |
| Update 8 manuscripts | ~2 hours |
| Verification | ~30 minutes |
| **Total** | **~3.5 hours** |

---

## APPROVAL

**Director Approval Required Before Execution**

- [ ] Approve AIXORD_GOVERNANCE_V3.1.md content
- [ ] Approve `PMERIT CONTINUE` as trigger command
- [ ] Approve 2-email license check system
- [ ] Approve Master/Tester/Gift credential codes
- [ ] Approve LICENSE_KEY.txt content
- [ ] Approve README.md content
- [ ] Approve "Before You Begin" chapter content
- [ ] Approve manuscript formatting specs
- [ ] Authorize Claude Code to execute

---

*HANDOFF prepared by Claude Web (Architect)*
*Awaiting Director approval*
