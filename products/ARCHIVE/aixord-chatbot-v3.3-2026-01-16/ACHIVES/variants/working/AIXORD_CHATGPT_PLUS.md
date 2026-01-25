# AIXORD for ChatGPT Plus — Quick Start Guide

**Version:** 3.2 | **Platform:** ChatGPT Plus ($20/month) | **PMERIT LLC**

---

## ✅ YOUR TIER FEATURES

As a ChatGPT Plus subscriber, you have access to:

| Feature | AIXORD Use |
|---------|------------|
| ✅ Custom GPTs | **Recommended:** Create AIXORD GPT for persistent setup |
| ✅ Projects | Alternative: Use Projects with governance in Instructions |
| ✅ Agent Mode | Enhanced EXECUTE phase capabilities |
| ✅ Codex | Code generation and execution |
| ✅ Extended Context | Longer sessions before handoff needed |
| ✅ Memory | Persistent user preferences |

---

## 🚀 SETUP OPTIONS

### OPTION A: Custom GPT (Recommended)

**Why Recommended:**
- One-time setup
- Persistent across all conversations
- Share with others
- Professional workflow

**Setup Steps:**

1. **Go to GPT Builder**
   - Click your profile → "My GPTs" → "Create"

2. **Configure GPT**
   ```
   Name: AIXORD Governance
   Description: AI Execution Order framework for structured AI collaboration
   ```

3. **Paste Instructions**
   - Copy contents of `AIXORD_GOVERNANCE_CHATGPT_GPT.md`
   - Paste into "Instructions" field

4. **Upload Knowledge Files**
   - Click "Upload files" under Knowledge
   - Upload: `AIXORD_PHASE_DETAILS.md`
   - Upload: `AIXORD_STATE_V3.2.json`

5. **Configure Capabilities**
   - ✅ Web Browsing (for reference discovery)
   - ✅ Code Interpreter (for Codex features)
   - ❌ DALL-E (not needed)

6. **Save GPT**
   - Click "Create" or "Update"

7. **Start Using**
   - Open your AIXORD GPT
   - Say: "PMERIT CONTINUE"
   - Complete setup flow

---

### OPTION B: Projects

**When to Use:**
- Quick setup for single project
- Don't want permanent GPT
- Testing AIXORD

**Setup Steps:**

1. **Create Project**
   - Sidebar → Projects → "New project"
   - Name: Your project name

2. **Add Instructions**
   - Click ⚙️ (settings) on project
   - Select "Instructions"
   - Paste contents of `AIXORD_GOVERNANCE_CHATGPT_GPT.md`

3. **Upload Files**
   - Click "Add files" on project
   - Upload: `AIXORD_STATE_V3.2.json`
   - Upload: Your PROJECT_DOCUMENT.md (if exists)

4. **Start Chat in Project**
   - Click "New chat" within project
   - Say: "PMERIT CONTINUE"

---

## 📁 RECOMMENDED FOLDER STRUCTURE

Create this on your computer:

```
[PROJECT_NAME]/
├── 1_GOVERNANCE/
│   ├── AIXORD_GOVERNANCE_CHATGPT_GPT.md
│   └── AIXORD_GOVERNANCE_CHATGPT_V3.2.md
├── 2_STATE/
│   └── AIXORD_STATE.json
├── 3_PROJECT/
│   └── PROJECT_DOCUMENT.md
├── 4_HANDOFFS/
│   ├── HANDOFF_001.md
│   └── HANDOFF_002.md
├── 5_OUTPUTS/
│   └── (your deliverables)
└── 6_RESEARCH/
    └── (videos, repos, references)
```

---

## ⚡ AGENT MODE INTEGRATION

ChatGPT Plus includes Agent Mode. AIXORD can leverage this in EXECUTE phase:

**Supported Actions:**
- File operations (create, edit, organize)
- Web research for reference discovery
- Code execution via Codex
- External tool integration

**How to Use:**
During EXECUTE phase, say:
- "Use agent mode to [action]"
- Agent mode will execute and report back
- You (Director) approve next steps

---

## 🎬 REFERENCE DISCOVERY

With Plus tier's web access, AIXORD can:

1. **Auto-search YouTube** when you describe a project
2. **Find GitHub repos** with relevant code
3. **Provide specific timestamps** in videos
4. **Link directly** to resources

**To manually trigger:**
- "FIND VIDEOS: [topic]"
- "FIND CODE: [topic]"
- "EXAMPLE PROJECT"

---

## 📊 SESSION LIMITS (Plus Tier)

| Metric | Threshold | Action |
|--------|-----------|--------|
| Messages | 30 | Handoff recommended |
| Active Tasks | 3 max | Decompose if more |
| EXECUTE Tasks | 1 at a time | Complete before next |

---

## 🔧 TROUBLESHOOTING

### GPT Won't Save
- Instructions may be too long
- Try condensed version only
- Upload full governance to Knowledge instead

### Agent Mode Not Working
- Check capabilities are enabled in GPT settings
- Some actions require explicit approval
- Try: "Enable agent mode for this task"

### Instructions Ignored
- Say: "PROTOCOL CHECK"
- Say: "RE-READ RULES"
- Say: "DRIFT WARNING"
- Consider starting new session

### Citations Not Appearing
- Verify citation mode: "CITATION: STRICT"
- Web browsing must be enabled
- Say: "SOURCE CHECK"

---

## 📋 QUICK COMMAND REFERENCE

| Command | What It Does |
|---------|--------------|
| PMERIT CONTINUE | Activate AIXORD |
| CHECKPOINT | Save progress |
| PROTOCOL CHECK | Verify compliance |
| DRIFT WARNING | Flag off-track |
| FIND VIDEOS: [topic] | Search YouTube |
| FIND CODE: [topic] | Search GitHub |
| HALT | Stop and reset |

---

## ✅ ACTIVATION CHECKLIST

- [ ] Created Custom GPT OR Project
- [ ] Pasted condensed governance into Instructions
- [ ] Uploaded Phase Details to Knowledge (if GPT)
- [ ] Created local folder structure
- [ ] Said "PMERIT CONTINUE"
- [ ] Completed license validation
- [ ] Accepted terms (I ACCEPT: [identifier])
- [ ] Confirmed tier (Plus)
- [ ] Set folder structure preference
- [ ] Set citation mode
- [ ] Enabled/disabled references
- [ ] Ready to work!

---

## 📞 SUPPORT

Full documentation: DISCLAIMER.md, LICENSE.md in your package
Issues: Check troubleshooting above first

---

© 2026 PMERIT LLC. All rights reserved.
AIXORD — Authority. Execution. Confirmation.
