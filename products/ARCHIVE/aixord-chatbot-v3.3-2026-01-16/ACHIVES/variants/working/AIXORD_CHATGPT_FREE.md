# AIXORD for ChatGPT Free — Quick Start Guide

**Version:** 3.2 | **Platform:** ChatGPT Free | **PMERIT LLC**

---

## ✅ YOUR TIER FEATURES

As a ChatGPT Free user, you have access to:

| Feature | Status | AIXORD Use |
|---------|--------|------------|
| ✅ Projects | Available | Store governance + files |
| ✅ Project Instructions | Available | Paste condensed governance |
| ✅ Project Files | Available | Upload STATE.json |
| ❌ Custom GPTs | Not Available | Use Projects instead |
| ❌ Agent Mode | Not Available | Manual execution |
| ⚠️ Web Search | Limited | Reference discovery may be limited |
| ⚠️ Context | Standard | Earlier handoffs recommended |

---

## 🚀 SETUP METHOD: Projects

ChatGPT Free includes Projects — this is your AIXORD setup method.

### Step-by-Step Setup

**Step 1: Create a Project**

1. Open ChatGPT (chatgpt.com)
2. Look at the left sidebar
3. Find "Projects" section
4. Click "New project"
5. Name it: `AIXORD - [Your Project Name]`

**Step 2: Add Instructions**

1. Click the ⚙️ (gear icon) next to your project name
2. Click "Instructions"
3. Open `AIXORD_GOVERNANCE_CHATGPT_GPT.md` in a text editor
4. Copy ALL the text (Ctrl+A, then Ctrl+C)
5. Paste into the Instructions field (Ctrl+V)
6. Click "Save"

**Step 3: Upload Files**

1. Click "Add files" in your project
2. Upload these files:
   - `AIXORD_STATE_V3.2.json`
   - Your `PROJECT_DOCUMENT.md` (if you have one)
3. Files will be available to ChatGPT in this project

**Step 4: Start a Chat**

1. Make sure you're inside your AIXORD project
2. Click "New chat"
3. Type: `PMERIT CONTINUE`
4. Follow the setup flow

---

## 📁 RECOMMENDED FOLDER STRUCTURE

Create this on your computer for file organization:

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
│   └── (your project deliverables)
└── 6_RESEARCH/
    └── (saved references)
```

---

## ⚠️ FREE TIER LIMITATIONS

### Context Window
- Standard context means shorter effective sessions
- **Recommendation:** Handoff at 25 messages (not 30)
- Use CHECKPOINT frequently

### No Custom GPTs
- Cannot create persistent AIXORD GPT
- Must use Projects (still effective!)
- Instructions persist within project

### Limited Web Search
- Reference discovery may be limited
- Videos/code examples may require manual search
- Provide your own reference links when possible

### No Agent Mode
- Cannot use agent for external actions
- Manual file operations required
- Copy/paste workflow for code

---

## 📊 SESSION LIMITS (Free Tier)

| Metric | Threshold | Action |
|--------|-----------|--------|
| Messages | **25** | Handoff recommended |
| Active Tasks | 3 max | Decompose if more |
| EXECUTE Tasks | 1 at a time | Complete before next |

**Important:** Free tier degrades faster. Use CHECKPOINT at message 15-20.

---

## 🔄 HANDOFF WORKFLOW (Critical for Free)

Since sessions are shorter, master the handoff process:

### Creating a Handoff
```
You: "CHECKPOINT"

ChatGPT will generate a handoff document with:
- Current state
- Decisions made
- Pending tasks
- Recovery instructions
```

### Saving the Handoff
1. Copy the entire handoff text
2. Save to `4_HANDOFFS/HANDOFF_[number].md`
3. Keep handoffs organized by date/session

### Recovering from Handoff
```
1. Start new chat in your Project
2. Say: "PMERIT CONTINUE"
3. Complete abbreviated setup
4. Say: "RECOVER"
5. Paste your last handoff
6. Continue from where you left off
```

---

## 💡 TIPS FOR FREE TIER SUCCESS

### Tip 1: Front-load Important Work
- Do complex thinking early in session
- Save routine tasks for later
- Quality often declines around message 20+

### Tip 2: Use CHECKPOINT Liberally
- Every 10 messages is not too often
- Better to have too many checkpoints than lose work
- Checkpoints are quick to create

### Tip 3: Prepare References Manually
- Find YouTube videos yourself and share links
- Find GitHub repos yourself and share links
- Say: "Here's a reference: [URL]"

### Tip 4: Keep Tasks Small
- Break big tasks into tiny steps
- One deliverable per session
- Complex projects = multiple sessions

### Tip 5: Update STATE.json Manually
- Download from project files periodically
- Update on your computer
- Re-upload with changes

---

## 🔧 TROUBLESHOOTING

### Project Instructions Not Working
- Make sure you're chatting INSIDE the project
- Check instructions were saved (click gear, verify text)
- Try: "PROTOCOL CHECK" to verify

### ChatGPT Ignoring Rules
- Say: "RE-READ RULES"
- Say: "DRIFT WARNING"
- Create CHECKPOINT and start new chat

### Running Out of Context
- CHECKPOINT immediately
- Start new chat
- RECOVER from checkpoint
- Continue work

### Can't Find Previous Work
- Check your 4_HANDOFFS folder
- Look for CHECKPOINT files
- Use RECOVER command with last handoff

---

## 📋 QUICK COMMAND REFERENCE

| Command | What It Does |
|---------|--------------|
| PMERIT CONTINUE | Activate AIXORD |
| CHECKPOINT | Save progress (use often!) |
| RECOVER | Resume from handoff |
| PROTOCOL CHECK | Verify rules followed |
| DRIFT WARNING | Flag off-track behavior |
| HALT | Stop and reset |

---

## ✅ ACTIVATION CHECKLIST

- [ ] Created Project in ChatGPT
- [ ] Pasted governance into Project Instructions
- [ ] Uploaded STATE.json to Project Files
- [ ] Created local folder structure (6 folders)
- [ ] Started chat in Project
- [ ] Said "PMERIT CONTINUE"
- [ ] Completed license validation
- [ ] Accepted terms (I ACCEPT: [identifier])
- [ ] Confirmed tier (Free)
- [ ] Set folder structure preference
- [ ] Set citation mode
- [ ] Set reference preferences
- [ ] Ready to work!

---

## 🆙 CONSIDER UPGRADING

If you find Free tier limiting, ChatGPT Plus ($20/month) offers:

- Custom GPTs (one-time AIXORD setup)
- Agent Mode (automated execution)
- Extended context (longer sessions)
- Full web search (better references)
- Codex (code execution)

The same AIXORD package works on Plus — just more capabilities.

---

© 2026 PMERIT LLC. All rights reserved.
AIXORD — Authority. Execution. Confirmation.
