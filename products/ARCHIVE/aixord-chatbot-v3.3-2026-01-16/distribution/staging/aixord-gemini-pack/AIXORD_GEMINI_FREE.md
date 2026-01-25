# AIXORD for Gemini Free — Quick Start Guide

**Version:** 3.3 | **Platform:** Google Gemini (Free Tier)

---

## IMPORTANT: THIS FILE IS A GUIDE, NOT THE GOVERNANCE FILE

```
+-------------------------------------------------------------+
|  DO NOT PASTE THIS FILE INTO GEMINI                         |
|                                                             |
|  This is a GUIDE that teaches you how to use AIXORD.        |
|                                                             |
|  The file you paste into Gemini is:                         |
|  -> AIXORD_GOVERNANCE_GEMINI_V3.3.md                        |
|                                                             |
|  Look for the file that starts with "# AIXORD GOVERNANCE"   |
+-------------------------------------------------------------+
```

---

## WHAT'S NEW IN v3.3

| Feature | Description |
|---------|-------------|
| **Two Kingdoms** | Clear separation between planning (Ideation) and building (Realization) |
| **Ideation Gate** | Mandatory checkpoint before implementation begins |
| **7 Quality Dimensions** | Evaluate every deliverable for quality |
| **DAG Dependencies** | Visual dependency tracking between SCOPEs |
| **MOSA Principles** | Modular, open, replaceable architecture |
| **Open-Source Priority** | Prefer free and open solutions |
| **Multi-Signal Handoff** | Message counting replaces token tracking |
| **Environment Variables** | No hardcoded paths in commands |
| **Command Instructions** | Copy-paste ready commands |

---

## WHAT YOU NEED TO KNOW

Gemini Free doesn't have the **Gems** feature, so you'll paste the governance document at the start of each session. This guide shows you exactly how.

---

## SETUP (Each Session, ~2 Minutes)

### Step 1: Start Fresh
1. Go to [gemini.google.com](https://gemini.google.com)
2. Click **"New chat"** in the left sidebar

### Step 2: Activate AIXORD
Copy and paste this **activation message** into the chat:

```
You are now operating under the AIXORD governance framework v3.3.
Read and follow ALL instructions below as your operating rules.
When I say "PMERIT CONTINUE", activate this framework.
```

### Step 3: Paste Governance
Immediately after the activation message (in the same input), paste the **ENTIRE** contents of `AIXORD_GOVERNANCE_GEMINI_V3.3.md`.

**Paste the GOVERNANCE file, not this quick-start guide!**

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

## COMPLETE SESSION FLOW

```
+-------------------------------------------------------------+
| SESSION START                                                |
+-------------------------------------------------------------+
| 1. Open Gemini -> New Chat                                  |
| 2. Paste: Activation message + GOVERNANCE file + Confirmation|
|    (Use AIXORD_GOVERNANCE_GEMINI_V3.3.md, NOT this guide)   |
| 3. Gemini says: "AIXORD ACTIVATED"                          |
| 4. You say: "PMERIT CONTINUE"                               |
| 5. Enter license email/code when asked                       |
| 6. Say "Free" when asked about tier                          |
| 7. Set environment variables when prompted (v3.3)            |
| 8. Work in IDEATION KINGDOM first (plan your project)        |
| 9. Pass IDEATION GATE with "FINALIZE PLAN"                   |
| 10. Enter REALIZATION KINGDOM to build                       |
+-------------------------------------------------------------+
| SESSION END (Gemini handles this automatically)              |
+-------------------------------------------------------------+
| 11. At message 22/25: Warning appears                        |
| 12. At message 25/25: HANDOFF required                       |
| 13. Copy the handoff document when provided                  |
| 14. Save as HANDOFF_[DATE].md on your computer               |
|                                                             |
| If session ends unexpectedly without HANDOFF:               |
| -> See "HANDOFF RECOVERY" section below                      |
+-------------------------------------------------------------+

+-------------------------------------------------------------+
| NEXT SESSION (Continuing a Project)                          |
+-------------------------------------------------------------+
| 1. Open Gemini -> New Chat                                  |
| 2. Paste: Activation + GOVERNANCE + Confirmation             |
| 3. After "AIXORD ACTIVATED", paste your HANDOFF document     |
| 4. Type: "PMERIT CONTINUE"                                   |
| 5. Gemini restores context and continues                     |
+-------------------------------------------------------------+
```

---

## TWO KINGDOMS (v3.3 Key Concept)

AIXORD v3.3 divides all work into two kingdoms:

### IDEATION KINGDOM (Planning)
- **Purpose:** Define WHAT to build
- **Activities:** Discover, Brainstorm, Compare Options, Document
- **Forbidden:** Any implementation or coding
- **Output:** MASTER_SCOPE with all deliverables defined

### REALIZATION KINGDOM (Building)
- **Purpose:** Build WHAT was defined
- **Activities:** Execute, Audit, Verify, Lock
- **Forbidden:** Changing specifications without UNLOCK
- **Input:** Locked MASTER_SCOPE from Ideation

### The Ideation Gate
Between the kingdoms is a **mandatory checkpoint**. Before you can start building:
1. All deliverables must be enumerated
2. Dependencies must be mapped (DAG)
3. Quality dimensions must be evaluated
4. Director must type: `FINALIZE PLAN`

---

## NEW v3.3 COMMANDS

### Kingdom & Gate Commands
| Command | Effect |
|---------|--------|
| `FINALIZE PLAN` | Attempt to pass Ideation Gate |
| `GATE STATUS` | Show gate checklist |
| `GATE OVERRIDE: [reason]` | Skip gate with documented reason |

### Quality Commands
| Command | Effect |
|---------|--------|
| `QUALITY CHECK: [deliverable]` | Run 7 Quality Dimensions |
| `MOSA CHECK` | Check modular architecture compliance |
| `COST CHECK` | Evaluate open-source vs paid options |

### DAG Commands
| Command | Effect |
|---------|--------|
| `SHOW DAG` | Display dependency graph |
| `DAG STATUS` | Show which SCOPEs can be worked on |

### Session Commands
| Command | Effect |
|---------|--------|
| `SESSION STATUS` | Show message count and signals |
| `CHECKPOINT` | Save state, continue working |
| `EXTEND 5` | Add 5 more messages (once per session) |

---

## HANDOFF RECOVERY (If Session Ended Without HANDOFF)

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
   - Which kingdom you were in (IDEATION/REALIZATION)
   - What you completed
   - What was next
4. Gemini will help rebuild

### Option C: You Have Project Files
1. Start new session (paste governance)
2. Type: `PMERIT RECOVER`
3. Paste your PROJECT_DOCUMENT.md (if you saved it)
4. Gemini will resume from that state

**Prevention Tip:** Gemini will warn you at message 22/25. When you see a warning, consider saving a CHECKPOINT.

---

## PROJECT FOLDER STRUCTURE

After license validation, you'll choose your folder approach:

- **Option A (Recommended):** Absolute AIXORD Structure with screenshot verification
- **Option B:** User-controlled structure

Option A helps ensure you always know where to find your HANDOFFs and project files.

### Recommended Structure (Option A)

```
[YOUR_PROJECT_NAME]/
+-- 1_GOVERNANCE/
|   +-- AIXORD_GOVERNANCE_GEMINI_V3.3.md
+-- 2_STATE/
|   +-- AIXORD_STATE.json
+-- 3_PROJECT/
|   +-- PROJECT_DOCUMENT.md
|   +-- MASTER_SCOPE.md
+-- 4_HANDOFFS/
|   +-- (session handoffs saved here)
+-- 5_OUTPUTS/
|   +-- (your deliverables)
+-- 6_RESEARCH/
    +-- (reference materials)
```

**Why numbered folders?** They sort in logical order in your file browser.

Gemini will verify this structure with a screenshot before you begin work.

---

## ENVIRONMENT VARIABLES (v3.3)

Before Gemini can generate file commands, set these variables:

### PowerShell
```powershell
$env:AIXORD_ROOT = "C:\YourPath\YourProject\.aixord"
$env:AIXORD_PROJECT = "C:\YourPath\YourProject"
$env:AIXORD_SHELL = "powershell"
```

### Bash
```bash
export AIXORD_ROOT="/your/path/project/.aixord"
export AIXORD_PROJECT="/your/path/project"
export AIXORD_SHELL="bash"
```

After setting these, tell Gemini: `ENVIRONMENT CONFIGURED`

---

## COPY-PASTE TEMPLATE

Save this template for easy session starts:

```
You are now operating under the AIXORD governance framework v3.3.
Read and follow ALL instructions below as your operating rules.
When I say "PMERIT CONTINUE", activate this framework.

[PASTE ENTIRE AIXORD_GOVERNANCE_GEMINI_V3.3.md HERE -- NOT the quick-start guide]

Confirm you understand by saying "AIXORD ACTIVATED" and then wait for my command.
```

---

## TIPS FOR FREE TIER

### Message Counting Replaces Token Tracking (v3.3)
You don't need to estimate tokens anymore. Gemini will:
- Count your messages (threshold: 25)
- Warn you at 22 messages
- Require HANDOFF at 25 messages
- Allow one `EXTEND 5` per session

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

## TROUBLESHOOTING

### "Gemini says something unrelated"
- You may have pasted the wrong file (this guide instead of governance)
- Start a new chat and paste `AIXORD_GOVERNANCE_GEMINI_V3.3.md`

### "Gemini loses track mid-session"
- Message limit was hit (25 messages)
- If you got a HANDOFF, save it and start fresh
- If no HANDOFF, use HANDOFF RECOVERY (above)

### "Gemini didn't generate a HANDOFF"
- Type: `PMERIT HANDOFF` to request one manually
- Or use HANDOFF RECOVERY in next session

### "Gate keeps blocking me"
- Run `GATE STATUS` to see what's missing
- Complete the required checks (QUALITY CHECK, MOSA CHECK, etc.)
- Or use `GATE OVERRIDE: [your reason]` if justified

### "This is tedious"
- Yes, Free tier requires more manual work
- The tradeoff is $0/month cost
- Upgrade path: Gemini Advanced for $19.99/mo removes this friction

---

## INCLUDED FILES

| File | Purpose | Paste into Gemini? |
|------|---------|-------------------|
| `AIXORD_GOVERNANCE_GEMINI_V3.3.md` | Main governance | YES -- paste this one |
| `AIXORD_GEMINI_FREE.md` | This quick-start guide | NO -- read only |
| `AIXORD_STATE_GEMINI_V3.3.json` | State template (optional) | NO |
| `AIXORD_PHASE_DETAILS_V3.3.md` | Detailed phase behaviors | NO -- reference |
| `README.md` | Package overview | NO |

---

## YOUR FIRST SESSION

1. Open Gemini -> New Chat
2. Paste: Activation + **AIXORD_GOVERNANCE_GEMINI_V3.3.md** + Confirmation
3. Wait for: "AIXORD ACTIVATED"
4. Type: `PMERIT CONTINUE`
5. Enter your license email/code
6. Say: `Free` when asked about tier
7. Set environment variables when prompted
8. Choose:
   - `PMERIT DISCOVER` — Find a project idea
   - `PMERIT BRAINSTORM` — Shape an existing idea
   - `PMERIT EXECUTE` — Build from a plan (requires passing Ideation Gate first)

---

*AIXORD v3.3 — Gemini Free Edition*
*Two Kingdoms. DAG Dependencies. Quality-Driven.*
*© 2026 PMERIT LLC. All Rights Reserved.*
