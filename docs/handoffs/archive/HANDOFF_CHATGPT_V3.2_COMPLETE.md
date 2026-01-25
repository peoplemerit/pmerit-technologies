# HANDOFF — AIXORD ChatGPT v3.2 Complete Package

**Generated:** 2026-01-01
**From:** Claude Web (Architect)
**To:** Claude Code (Executor)
**Priority:** HIGH
**Product:** AIXORD for ChatGPT

---

## EXECUTIVE SUMMARY

Create the complete AIXORD for ChatGPT distribution package including:
1. ZIP package for Gumroad (11 files)
2. KDP manuscript (DOCX format, 24+ pages)
3. Reconciliation verification between ZIP and manuscript

**Version:** 3.2
**New Features:** Citation Protocol, Video/GitHub Discovery, Enhanced Enforcement, Disclaimer Affirmation Gate

---

## PART 1: ZIP PACKAGE CREATION

### 1.1 Source Files Location

All source files are in `/home/claude/` (created by Claude Web):

| File | Size | Purpose |
|------|------|---------|
| `AIXORD_GOVERNANCE_CHATGPT_GPT.md` | 10.6 KB | Condensed for GPT Instructions |
| `AIXORD_GOVERNANCE_CHATGPT_V3.2.md` | 41.5 KB | Full governance |
| `AIXORD_PHASE_DETAILS.md` | 14.2 KB | GPT Knowledge file |
| `AIXORD_STATE_V3.2.json` | 1.5 KB | State template |
| `AIXORD_CHATGPT_FREE.md` | 6.4 KB | Free tier guide |
| `AIXORD_CHATGPT_PLUS.md` | 5.4 KB | Plus tier guide |
| `AIXORD_CHATGPT_PRO.md` | 8.9 KB | Pro tier guide |
| `README.md` | 5.3 KB | Package overview |
| `DISCLAIMER.md` | 6.1 KB | Legal terms |
| `LICENSE.md` | 2.7 KB | Usage rights |
| `LICENSE_KEY.txt` | 5.3 KB | License certificate |

### 1.2 ZIP Creation Command

```bash
cd /home/claude
zip -r aixord-chatgpt-pack.zip \
  AIXORD_GOVERNANCE_CHATGPT_GPT.md \
  AIXORD_GOVERNANCE_CHATGPT_V3.2.md \
  AIXORD_PHASE_DETAILS.md \
  AIXORD_STATE_V3.2.json \
  AIXORD_CHATGPT_FREE.md \
  AIXORD_CHATGPT_PLUS.md \
  AIXORD_CHATGPT_PRO.md \
  README.md \
  DISCLAIMER.md \
  LICENSE.md \
  LICENSE_KEY.txt
```

### 1.3 ZIP Verification

After creation, verify:
```bash
unzip -l aixord-chatgpt-pack.zip
```

Expected: 11 files, ~108 KB total

---

## PART 2: KDP MANUSCRIPT CREATION

### 2.1 Manuscript Structure (14 Chapters)

```
FRONT MATTER
├── Title Page
├── Copyright Page
├── DISCLAIMER (Full legal terms)
├── Table of Contents

PART 1: UNDERSTANDING AIXORD
├── Chapter 1: What is AIXORD?
├── Chapter 2: The Authority Model
├── Chapter 3: Understanding Phases

PART 2: SETUP & CONFIGURATION
├── Chapter 4: ChatGPT Tier Comparison
├── Chapter 5: Setting Up for ChatGPT
├── Chapter 6: Understanding Your Download Files (FILE GUIDE)
├── Chapter 7: Your First AIXORD Session

PART 3: CORE FEATURES
├── Chapter 8: Citation Protocol (NEW v3.2)
├── Chapter 9: Reference Discovery (NEW v3.2)
├── Chapter 10: Commands Reference

PART 4: ADVANCED TOPICS
├── Chapter 11: Enhanced Enforcement (NEW v3.2)
├── Chapter 12: Handoff & Recovery
├── Chapter 13: Troubleshooting

BACK MATTER
├── Appendix A: Quick Reference Card
├── Appendix B: Discount Code (AX-GPT-3W7J)
├── About the Author
```

### 2.2 Chapter Content Requirements

#### Chapter 1: What is AIXORD?
- Definition of AI Execution Order
- Problem it solves (AI chaos, no governance)
- Core principles: Authority, Execution, Confirmation
- Brief history (OPORD methodology adaptation)
- Who AIXORD is for

#### Chapter 2: The Authority Model
- Director (Human) - Supreme authority
- AI Assistant - Advisory role only
- The fundamental rules:
  - Director decides everything
  - AI recommends only
  - Explicit approval required
  - No autonomous decisions
- Why this matters (accountability, safety)

#### Chapter 3: Understanding Phases
- DECISION phase (default)
- DISCOVER phase (clarify ideas)
- BRAINSTORM phase (generate options)
- OPTIONS phase (compare alternatives)
- EXECUTE phase (implement approved plans)
- AUDIT phase (review work)
- Phase transitions and rules

#### Chapter 4: ChatGPT Tier Comparison
- Free tier features and limitations
- Plus tier ($20/mo) - GPTs, Agent Mode, Codex
- Pro tier ($200/mo) - Full capabilities
- Business tier ($25/mo) - Team features
- Which tier is right for you
- Feature comparison table

#### Chapter 5: Setting Up for ChatGPT
- Free: Projects setup (step-by-step with screenshots concept)
- Plus: Custom GPT setup (recommended)
- Pro: Full capabilities setup
- Business: Team deployment
- Folder structure options (Absolute vs User-controlled)

#### Chapter 6: Understanding Your Download Files (CRITICAL - FILE GUIDE)

**THIS CHAPTER MUST EXPLAIN EVERY FILE IN THE ZIP:**

```markdown
## Your Download Contains 11 Files

When you unzip `aixord-chatgpt-pack.zip`, you'll find:

### Core Governance Files (USE THESE)

| File | What It Is | How to Use |
|------|-----------|------------|
| `AIXORD_GOVERNANCE_CHATGPT_GPT.md` | **Condensed governance** (~10KB) | Paste into GPT Instructions OR Project Instructions |
| `AIXORD_GOVERNANCE_CHATGPT_V3.2.md` | **Full governance** (~41KB) | Reference document, or paste for Projects |
| `AIXORD_PHASE_DETAILS.md` | **Extended phase behaviors** | Upload to GPT Knowledge section |
| `AIXORD_STATE_V3.2.json` | **State tracking template** | Upload to GPT Knowledge OR Project Files |

### Tier-Specific Guides (READ THESE)

| File | Who It's For |
|------|--------------|
| `AIXORD_CHATGPT_FREE.md` | Free tier users — Projects-only setup |
| `AIXORD_CHATGPT_PLUS.md` | Plus subscribers — GPT + Agent Mode guide |
| `AIXORD_CHATGPT_PRO.md` | Pro subscribers — Full capabilities guide |

⚠️ **Important:** These guides teach you HOW to set up AIXORD. 
Do NOT paste these into ChatGPT. 
Paste `AIXORD_GOVERNANCE_CHATGPT_GPT.md` instead.

### Documentation & Legal (KEEP FOR REFERENCE)

| File | Purpose |
|------|---------|
| `README.md` | Package overview — Start here |
| `DISCLAIMER.md` | Full legal terms you'll accept |
| `LICENSE.md` | Your usage rights |
| `LICENSE_KEY.txt` | Your license certificate |

### Quick Decision Tree

```
Which file do I paste into ChatGPT?
│
├─ Creating a Custom GPT (Plus/Pro)?
│  └─ Paste: AIXORD_GOVERNANCE_CHATGPT_GPT.md (into Instructions)
│  └─ Upload: AIXORD_PHASE_DETAILS.md (to Knowledge)
│  └─ Upload: AIXORD_STATE_V3.2.json (to Knowledge)
│
├─ Using Projects (Free/Plus)?
│  └─ Paste: AIXORD_GOVERNANCE_CHATGPT_GPT.md (into Project Instructions)
│  └─ Upload: AIXORD_STATE_V3.2.json (to Project Files)
│
└─ Not sure?
   └─ Read your tier guide first (FREE/PLUS/PRO.md)
```

### File Extension Reference

| Extension | What It Means | How to Open |
|-----------|---------------|-------------|
| `.md` | Markdown text | Notepad, VS Code, any text editor |
| `.json` | Structured data | Notepad, VS Code, any text editor |
| `.txt` | Plain text | Notepad, any text editor |

**Tip:** All files are plain text. You can open them with any text editor.
```

#### Chapter 7: Your First AIXORD Session
- The complete setup flow (8 steps):
  1. ACTIVATION ("PMERIT CONTINUE")
  2. LICENSE VALIDATION (email or key)
  3. DISCLAIMER AFFIRMATION ("I ACCEPT: [identifier]")
  4. TIER DETECTION (Free/Plus/Pro/Business)
  5. FOLDER STRUCTURE (Absolute or User-controlled)
  6. CITATION MODE (Strict/Standard/Minimal)
  7. REFERENCE PREFERENCES (Videos/GitHub)
  8. SESSION READY
- Sample session transcript
- Common first-session issues

#### Chapter 8: Citation Protocol (NEW v3.2)
- Why citations matter (reduce hallucinations)
- Three citation modes:
  - STRICT: Every claim cited
  - STANDARD: Key recommendations cited
  - MINIMAL: Sources on request
- Source types: [WEB], [DOC], [KB], [TRAIN], [INFERENCE], [UNVERIFIED]
- Confidence levels: HIGH, MEDIUM, LOW, UNVERIFIED
- How to change modes mid-session
- Commands: SOURCE CHECK, VERIFY: [claim]

#### Chapter 9: Reference Discovery (NEW v3.2)
- What reference discovery does
- Video discovery:
  - Auto-searches YouTube
  - Provides 1-2 relevant videos
  - Includes timestamps for relevant sections
- Code discovery:
  - Auto-searches GitHub
  - Finds relevant repositories
  - Notes key files to examine
- Commands: FIND VIDEOS: [topic], FIND CODE: [topic], EXAMPLE PROJECT
- How to enable/disable

#### Chapter 10: Commands Reference
- Complete command table with examples
- Activation commands
- Phase commands
- Enforcement commands
- Citation commands
- Reference commands
- Folder commands

#### Chapter 11: Enhanced Enforcement (NEW v3.2)
- Why ChatGPT needs enhanced enforcement
- Mandatory response header
- Compliance checks (every 5 responses)
- Message-based thresholds (tier-specific)
- Violation tracking
- User enforcement commands:
  - PROTOCOL CHECK
  - DRIFT WARNING
  - ENFORCE FORMAT
  - RE-READ RULES
  - SHOW VIOLATIONS
  - COMPLIANCE SCORE

#### Chapter 12: Handoff & Recovery
- What is a handoff?
- When to create handoffs
- CHECKPOINT vs HANDOFF
- Handoff document structure
- Recovery process (RECOVER command)
- Best practices for continuity

#### Chapter 13: Troubleshooting
- ChatGPT ignoring instructions
- Missing response headers
- Citation mode not working
- Reference discovery issues
- Session degradation
- Context overflow
- Tier-specific issues

#### Appendix A: Quick Reference Card
- One-page command summary
- Setup checklist
- Phase diagram

#### Appendix B: Discount Code
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THANK YOU FOR PURCHASING THIS BOOK!

As a book buyer, you're entitled to a special discount
on the AIXORD for ChatGPT digital template pack.

YOUR DISCOUNT CODE: AX-GPT-3W7J

Redeem at: https://pmerit.gumroad.com/l/aixord-chatgpt

This code provides [X]% off the digital package,
which includes all template files ready to use.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2.3 Manuscript Generation

Use Pandoc with KDP-ready template:

```bash
# Read the SKILL.md first for best practices
cat /mnt/skills/public/docx/SKILL.md

# Generate DOCX with proper styling
pandoc MANUSCRIPT_CHATGPT.md \
  -o MANUSCRIPT_CHATGPT.docx \
  --reference-doc=/path/to/kdp-template.docx \
  -f markdown \
  -t docx \
  --toc \
  --toc-depth=2
```

### 2.4 KDP Formatting Requirements

| Requirement | Value |
|-------------|-------|
| Page Size | 6" × 9" |
| Top Margin | 0.6" |
| Bottom Margin | 0.6" |
| Inside Margin | 0.76" |
| Outside Margin | 0.6" |
| Body Font | 11-12pt serif (Garamond/Georgia) |
| Line Spacing | 1.15 - 1.5 |
| Chapter Titles | 18-24pt |
| Section Heads | 14-16pt |
| Minimum Pages | 24 |

---

## PART 3: RECONCILIATION CHECKLIST

### 3.1 ZIP ↔ Manuscript Consistency

Verify these match between ZIP contents and manuscript descriptions:

| Check | ZIP | Manuscript | Match? |
|-------|-----|------------|--------|
| File count | 11 files | Chapter 6 lists 11 files | ☐ |
| File names | Exact names | Chapter 6 table | ☐ |
| Version numbers | v3.2 | All references say v3.2 | ☐ |
| Discount code | N/A | AX-GPT-3W7J in Appendix B | ☐ |
| Tier names | FREE/PLUS/PRO guides | Chapter 4 tier names | ☐ |
| Setup steps | 8 steps in governance | Chapter 7 lists 8 steps | ☐ |
| Commands | Commands in governance | Chapter 10 matches | ☐ |
| Citation modes | 3 modes in governance | Chapter 8 describes 3 | ☐ |
| Phase names | 6 phases in governance | Chapter 3 lists 6 | ☐ |

### 3.2 File Guide Reconciliation (Chapter 6)

The manuscript MUST accurately describe how to use each file:

| File | Manuscript Must Explain |
|------|------------------------|
| `AIXORD_GOVERNANCE_CHATGPT_GPT.md` | Paste into GPT Instructions or Project Instructions |
| `AIXORD_GOVERNANCE_CHATGPT_V3.2.md` | Full reference, alternative for Projects |
| `AIXORD_PHASE_DETAILS.md` | Upload to GPT Knowledge section |
| `AIXORD_STATE_V3.2.json` | Upload to GPT Knowledge or Project Files |
| `AIXORD_CHATGPT_FREE.md` | READ this guide, don't paste |
| `AIXORD_CHATGPT_PLUS.md` | READ this guide, don't paste |
| `AIXORD_CHATGPT_PRO.md` | READ this guide, don't paste |
| `README.md` | Start here, package overview |
| `DISCLAIMER.md` | Legal terms, keep for reference |
| `LICENSE.md` | Usage rights, keep for reference |
| `LICENSE_KEY.txt` | License certificate, keep for records |

### 3.3 Version Consistency

All files must show version 3.2:
- [ ] AIXORD_GOVERNANCE_CHATGPT_GPT.md header
- [ ] AIXORD_GOVERNANCE_CHATGPT_V3.2.md header
- [ ] AIXORD_PHASE_DETAILS.md header
- [ ] AIXORD_STATE_V3.2.json "aixord_version" field
- [ ] All tier guides mention v3.2
- [ ] README.md shows v3.2
- [ ] LICENSE_KEY.txt shows v3.2
- [ ] Manuscript title page shows v3.2
- [ ] Manuscript references throughout

---

## PART 4: ACCEPTANCE CRITERIA

### 4.1 ZIP Package
- [ ] Contains exactly 11 files
- [ ] All files readable (no corruption)
- [ ] Total size reasonable (~100-120 KB)
- [ ] No hidden files or folders
- [ ] Version numbers consistent (3.2)

### 4.2 Manuscript
- [ ] DOCX format, valid Word document
- [ ] 24+ pages minimum
- [ ] Table of Contents functional
- [ ] All 14 chapters present
- [ ] DISCLAIMER in front matter
- [ ] Discount code in Appendix B (AX-GPT-3W7J)
- [ ] Chapter 6 FILE GUIDE complete and accurate
- [ ] Version 3.2 throughout

### 4.3 Reconciliation
- [ ] ZIP file list matches Chapter 6
- [ ] Setup steps match between governance and Chapter 7
- [ ] Commands match between governance and Chapter 10
- [ ] All v3.2 features documented in manuscript

### 4.4 Output Files
Place final files in `/mnt/user-data/outputs/`:
- [ ] `aixord-chatgpt-pack.zip`
- [ ] `MANUSCRIPT_CHATGPT.docx`

---

## PART 5: EXECUTION STEPS

### Step 1: Verify Source Files
```bash
ls -la /home/claude/*.md /home/claude/*.json /home/claude/*.txt
```
Confirm all 11 files exist.

### Step 2: Create ZIP Package
```bash
cd /home/claude
zip -r aixord-chatgpt-pack.zip \
  AIXORD_GOVERNANCE_CHATGPT_GPT.md \
  AIXORD_GOVERNANCE_CHATGPT_V3.2.md \
  AIXORD_PHASE_DETAILS.md \
  AIXORD_STATE_V3.2.json \
  AIXORD_CHATGPT_FREE.md \
  AIXORD_CHATGPT_PLUS.md \
  AIXORD_CHATGPT_PRO.md \
  README.md \
  DISCLAIMER.md \
  LICENSE.md \
  LICENSE_KEY.txt
```

### Step 3: Verify ZIP
```bash
unzip -l aixord-chatgpt-pack.zip
```

### Step 4: Read DOCX Skill
```bash
cat /mnt/skills/public/docx/SKILL.md
```

### Step 5: Create Manuscript Markdown
Create `/home/claude/MANUSCRIPT_CHATGPT.md` with full content following Chapter structure above.

### Step 6: Convert to DOCX
Follow DOCX skill instructions for KDP-ready output.

### Step 7: Verify Manuscript
- Open DOCX, check page count (must be 24+)
- Verify TOC works
- Check formatting

### Step 8: Run Reconciliation Checklist
Go through Part 3 checklist item by item.

### Step 9: Copy to Outputs
```bash
cp /home/claude/aixord-chatgpt-pack.zip /mnt/user-data/outputs/
cp /home/claude/MANUSCRIPT_CHATGPT.docx /mnt/user-data/outputs/
```

### Step 10: Present Files
Use present_files tool to share with Director.

---

## PART 6: PRODUCT DETAILS (For Gumroad/KDP)

### Gumroad Product
- **Name:** AIXORD ChatGPT Pack — AI Governance Framework
- **Price:** $9.99
- **Discount Code (book buyers):** AX-GPT-3W7J

### Gumroad Description
```
Structured AI governance for ChatGPT.

**Version 3.2** — Now with Citation Protocol, Reference Discovery, and Enhanced Enforcement!

📦 **Package Contents (11 Files):**

**Governance Files:**
✅ AIXORD_GOVERNANCE_CHATGPT_GPT.md — Condensed for GPT Instructions
✅ AIXORD_GOVERNANCE_CHATGPT_V3.2.md — Full governance reference
✅ AIXORD_PHASE_DETAILS.md — Extended phase behaviors (GPT Knowledge)
✅ AIXORD_STATE_V3.2.json — State tracking template

**Tier-Specific Guides:**
✅ AIXORD_CHATGPT_FREE.md — Free tier setup
✅ AIXORD_CHATGPT_PLUS.md — Plus tier with Agent Mode
✅ AIXORD_CHATGPT_PRO.md — Pro tier full capabilities

**Documentation:**
✅ README.md, LICENSE.md, LICENSE_KEY.txt, DISCLAIMER.md

---

**NEW in v3.2:**
🔍 Citation Protocol — Source-backed recommendations with confidence scoring
🎬 Reference Discovery — Auto-find YouTube tutorials and GitHub repos
🛡️ Enhanced Enforcement — ChatGPT-specific compliance mechanisms
⚖️ Disclaimer Affirmation — Legal protection with recorded acceptance

**Works with:** ChatGPT Free, Plus, Pro, and Business tiers.

Book buyers: Use code **AX-GPT-3W7J** for discount.

AIXORD — Authority. Execution. Confirmation.
```

### KDP Book Details
- **Title:** AIXORD: The AI Execution Order for ChatGPT
- **Subtitle:** A Governance Framework for AI-Human Collaboration
- **Author:** Idowu Gabriel
- **Publisher:** PMERIT LLC
- **Categories:** Computer Science > AI, Business > Project Management
- **Keywords:** AI governance, ChatGPT, prompt engineering, AI collaboration, project management, AI framework, GPT productivity

---

## HANDOFF METADATA

| Field | Value |
|-------|-------|
| Created | 2026-01-01 |
| Product | AIXORD for ChatGPT |
| Version | 3.2 |
| Files to Create | ZIP (11 files) + Manuscript (DOCX) |
| Priority | HIGH |
| Estimated Effort | Medium-High |

---

## NOTES FOR CLAUDE CODE

1. **DOCX Skill is Critical** — Read `/mnt/skills/public/docx/SKILL.md` before creating manuscript

2. **Chapter 6 is Critical** — The file guide must accurately explain every file and how users should use them. This prevents confusion.

3. **Page Count** — Manuscript must be 24+ pages. Add content if needed (examples, expanded troubleshooting, detailed walkthroughs).

4. **Reconciliation** — The ZIP contents and manuscript descriptions MUST match exactly. Users will be confused if the book says one thing and the ZIP contains something different.

5. **Version Consistency** — Every file, every reference must say v3.2.

---

**END OF HANDOFF**

*AIXORD — Authority. Execution. Confirmation.*
