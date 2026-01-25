# AIXORD for Gemini Free — Quick Start Guide

**Version:** 3.1.3 | **Platform:** Google Gemini (Free Tier)

---

## ⚠️ IMPORTANT: THIS FILE IS A GUIDE, NOT THE GOVERNANCE FILE

```
┌─────────────────────────────────────────────────────────────────┐
│  DO NOT PASTE THIS FILE INTO GEMINI                             │
│                                                                 │
│  This is a GUIDE that teaches you how to use AIXORD.            │
│                                                                 │
│  The file you paste into Gemini is:                             │
│  → AIXORD_GOVERNANCE_GEMINI_V3.1.md                             │
│                                                                 │
│  Look for the file that starts with "# AIXORD GOVERNANCE"       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 WHAT YOU NEED TO KNOW

Gemini Free doesn't have the **Gems** feature, so you'll paste the governance document at the start of each session. This guide shows you exactly how.

---

## ⚡ SETUP (Each Session, ~2 Minutes)

### Step 1: Start Fresh
1. Go to [gemini.google.com](https://gemini.google.com)
2. Click **"New chat"** in the left sidebar

### Step 2: Activate AIXORD
Copy and paste this **activation message** into the chat:

```
You are now operating under the AIXORD governance framework. 
Read and follow ALL instructions below as your operating rules.
When I say "PMERIT CONTINUE", activate this framework.
```

### Step 3: Paste Governance
Immediately after the activation message (in the same input), paste the **ENTIRE** contents of `AIXORD_GOVERNANCE_GEMINI_V3.1.md`.

**⚠️ Paste the GOVERNANCE file, not this quick-start guide!**

### Step 4: Confirm Activation
At the very end, add this line:

```
Confirm you understand by saying "AIXORD ACTIVATED" and then wait for my command.
```

### Step 5: Send and Wait
- Send the message
- Wait for Gemini to respond: **"AIXORD ACTIVATED"**
- Now type: `PMERIT CONTINUE`

---

## 🔄 COMPLETE SESSION FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│ SESSION START                                                    │
├─────────────────────────────────────────────────────────────────┤
│ 1. Open Gemini → New Chat                                       │
│ 2. Paste: Activation message + GOVERNANCE file + Confirmation   │
│    ⚠️ Use AIXORD_GOVERNANCE_GEMINI_V3.1.md (NOT this guide)     │
│ 3. Gemini says: "AIXORD ACTIVATED"                              │
│ 4. You say: "PMERIT CONTINUE"                                   │
│ 5. Enter license email/code when asked                          │
│ 6. Say "Free" when asked about tier                             │
│ 7. Work on your project                                         │
├─────────────────────────────────────────────────────────────────┤
│ SESSION END (Gemini handles this automatically)                  │
├─────────────────────────────────────────────────────────────────┤
│ 8. Gemini will AUTO-GENERATE a HANDOFF when context is filling  │
│ 9. Copy the handoff document when provided                      │
│ 10. Save as HANDOFF_[DATE].md on your computer                  │
│                                                                 │
│ If session ends unexpectedly without HANDOFF:                   │
│ → See "HANDOFF RECOVERY" section below                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ NEXT SESSION (Continuing a Project)                              │
├─────────────────────────────────────────────────────────────────┤
│ 1. Open Gemini → New Chat                                       │
│ 2. Paste: Activation + GOVERNANCE + Confirmation                │
│ 3. After "AIXORD ACTIVATED", paste your HANDOFF document        │
│ 4. Type: "PMERIT CONTINUE"                                      │
│ 5. Gemini restores context and continues                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 HANDOFF RECOVERY (If Session Ended Without HANDOFF)

If your session ended unexpectedly (browser crash, timeout, context exhausted):

### Option A: You Saved the Chat
1. Start new session (paste governance)
2. Type: `PMERIT RECOVER`
3. Copy/paste your last few messages from the old chat
4. Gemini will reconstruct context

### Option B: You Remember the Project
1. Start new session (paste governance)
2. Type: `PMERIT RECOVER`
3. Describe from memory:
   - Project name
   - What phase you were in (DISCOVER/BRAINSTORM/EXECUTE)
   - What you completed
   - What was next
4. Gemini will help rebuild

### Option C: You Have Project Files
1. Start new session (paste governance)
2. Type: `PMERIT RECOVER`
3. Paste your PROJECT_DOCUMENT.md (if you saved it)
4. Gemini will resume from that state

**Prevention Tip:** Gemini will proactively generate HANDOFFs before context fills. When you see one, ALWAYS save it immediately.

---

## 📁 PROJECT FOLDER STRUCTURE

After license validation, you'll choose your folder approach:

- **Option A (Recommended):** Absolute AIXORD Structure with screenshot verification
- **Option B:** User-controlled structure

Option A helps ensure you always know where to find your HANDOFFs and project files.

### Recommended Structure (Option A)

```
[YOUR_PROJECT_NAME]/
├── 1_GOVERNANCE/
│   └── AIXORD_GOVERNANCE_GEMINI_V3.1.md
├── 2_STATE/
│   └── AIXORD_STATE.json
├── 3_PROJECT/
│   └── PROJECT_DOCUMENT.md
├── 4_HANDOFFS/
│   └── (session handoffs saved here)
├── 5_OUTPUTS/
│   └── (your deliverables)
└── 6_RESEARCH/
    └── (reference materials)
```

**Why numbered folders?** They sort in logical order in your file browser.

Gemini will verify this structure with a screenshot before you begin work.

---

## 📝 COPY-PASTE TEMPLATE

Save this template for easy session starts:

```
You are now operating under the AIXORD governance framework. 
Read and follow ALL instructions below as your operating rules.
When I say "PMERIT CONTINUE", activate this framework.

[PASTE ENTIRE AIXORD_GOVERNANCE_GEMINI_V3.1.md HERE — NOT the quick-start guide]

Confirm you understand by saying "AIXORD ACTIVATED" and then wait for my command.
```

---

## 💡 TIPS FOR FREE TIER

### Gemini Tracks Context For You
You don't need to count messages or tokens. Gemini will:
- Monitor context usage automatically
- Generate a HANDOFF before context fills
- Alert you when it's time to save and start fresh

### Save HANDOFFs Immediately
When Gemini generates a HANDOFF, copy and save it RIGHT AWAY. Don't continue working — start a new session with the HANDOFF.

### Keep Sessions Focused
Work on one SCOPE or Sub-Scope per session. This keeps context manageable.

### Store Everything Locally
Without Gems, your computer is your project database:
- Save all HANDOFF files
- Save all generated code/documents
- Keep PROJECT_DOCUMENT.md updated

### Consider Upgrading
If you use AIXORD frequently, Gemini Advanced ($19.99/mo) with Gems eliminates the paste-every-session workflow. See `AIXORD_GEMINI_ADVANCED.md` for setup.

---

## 🔧 TROUBLESHOOTING

### "Gemini says something unrelated"
- You may have pasted the wrong file (this guide instead of governance)
- Start a new chat and paste `AIXORD_GOVERNANCE_GEMINI_V3.1.md`

### "Gemini loses track mid-session"
- Gemini Free context limits were hit
- If you got a HANDOFF, save it and start fresh
- If no HANDOFF, use HANDOFF RECOVERY (above)

### "Gemini didn't generate a HANDOFF"
- Type: `PMERIT HANDOFF` to request one manually
- Or use HANDOFF RECOVERY in next session

### "This is tedious"
- Yes, Free tier requires more manual work
- The tradeoff is $0/month cost
- Upgrade path: Gemini Advanced for $19.99/mo removes this friction

---

## 📚 INCLUDED FILES

| File | Purpose | Paste into Gemini? |
|------|---------|-------------------|
| `AIXORD_GOVERNANCE_GEMINI_V3.1.md` | Main governance | ✅ YES — paste this one |
| `AIXORD_GEMINI_FREE.md` | This quick-start guide | ❌ NO — read only |
| `AIXORD_STATE_V3.1.json` | State template (optional) | ❌ NO |
| `README.md` | Package overview | ❌ NO |

---

## 🎓 YOUR FIRST SESSION

1. Open Gemini → New Chat
2. Paste: Activation + **AIXORD_GOVERNANCE_GEMINI_V3.1.md** + Confirmation
3. Wait for: "AIXORD ACTIVATED"
4. Type: `PMERIT CONTINUE`
5. Enter your license email/code
6. Say: `Free` when asked about tier
7. Choose:
   - `PMERIT DISCOVER` — Find a project idea
   - `PMERIT BRAINSTORM` — Shape an existing idea
   - `PMERIT EXECUTE` — Build from a plan

---

*AIXORD v3.1.3 — Gemini Free Edition*
*© 2025 PMERIT LLC. All Rights Reserved.*
