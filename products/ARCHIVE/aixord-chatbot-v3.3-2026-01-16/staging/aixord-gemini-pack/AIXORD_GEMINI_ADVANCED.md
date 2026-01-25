# AIXORD for Gemini Advanced — Quick Start Guide

**Version:** 3.3 | **Platform:** Google Gemini Advanced ($19.99/mo)

---

## QUICK NOTE

**Setting up a Gem?** Paste `AIXORD_GOVERNANCE_GEMINI_GEM_V3.3.md` into the Gem's **Instructions** field.

This quick-start guide is for **reading**, not pasting into Gemini.

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
| **Multi-Signal Handoff** | Message counting (25 threshold) replaces token tracking |
| **Environment Variables** | No hardcoded paths in commands |
| **Command Instructions** | Copy-paste ready commands |

---

## WHICH GOVERNANCE FILE TO USE?

Your package includes TWO governance files for Gemini Advanced:

| File | Size | Use For |
|------|------|---------|
| `AIXORD_GOVERNANCE_GEMINI_GEM_V3.3.md` | ~12KB | **Gem Instructions** (paste here) |
| `AIXORD_GOVERNANCE_GEMINI_V3.3.md` | ~45KB | Paste workflow (no Gem) |

### For Gem Users (Recommended)

1. **Instructions:** Paste `AIXORD_GOVERNANCE_GEMINI_GEM_V3.3.md`
2. **Knowledge:** Upload these files:
   - `AIXORD_PHASE_DETAILS_V3.3.md`
   - `AIXORD_STATE_GEMINI_V3.3.json`
   - Your `PROJECT_DOCUMENT.md` (when you have one)

### Why Two Files?

The condensed Gem file (~12KB) fits reliably in Gem Instructions. The full file (~45KB) sometimes triggers Gemini's content limits.

---

## YOUR ADVANTAGE: GEMS

As a Gemini Advanced subscriber, you have access to **Gems** — custom AI personas with persistent instructions and knowledge. This means you can create an **AIXORD Gem** that remembers governance rules, so you never have to paste the governance file again.

---

## SETUP (One-Time, ~5 Minutes)

### Step 1: Open Gems
1. Go to [gemini.google.com](https://gemini.google.com)
2. Click **"Gems"** in the left sidebar
3. Click **"+ New Gem"** (or "Create Gem")

### Step 2: Configure Your AIXORD Gem

| Field | What to Enter |
|-------|---------------|
| **Name** | `AIXORD v3.3` (or your project name) |
| **Instructions** | Paste `AIXORD_GOVERNANCE_GEMINI_GEM_V3.3.md` (condensed version) |

**Paste the GOVERNANCE file, NOT this quick-start guide!**

**Tip:** Upload `AIXORD_PHASE_DETAILS_V3.3.md` to Knowledge for detailed phase behaviors.

### Step 3: Add Knowledge Files (Optional but Recommended)
Click **"Add files"** and upload:
- `AIXORD_PHASE_DETAILS_V3.3.md` (detailed phase behaviors)
- `AIXORD_STATE_GEMINI_V3.3.json` (state template)
- Your PROJECT_DOCUMENT.md (if you have one)
- Previous HANDOFF files
- Reference materials for your project

### Step 4: Save
Click **"Save"** — your AIXORD Gem is ready!

---

## USING YOUR AIXORD GEM

### Starting a Session
1. Click your **AIXORD Gem** in the Gems sidebar
2. Type: `PMERIT CONTINUE`
3. Enter your license email or code when prompted
4. Say: `Gem` (to confirm Tier A setup)
5. Set environment variables when prompted (first time only)
6. Start working!

### Session Flow
```
You: PMERIT CONTINUE
Gemini: [Asks for license]
You: [your-email@example.com or authorization code]
Gemini: [Asks for tier]
You: Gem
Gemini: [Asks for environment variables]
You: ENVIRONMENT CONFIGURED
Gemini: [Shows session status with Kingdom, Phase, DAG status]
You: [Your directive - DISCOVER, BRAINSTORM, or EXECUTE]
```

### Ending a Session
Your context is saved within the Gem. Just close the tab.

**However:** Gemini will proactively generate HANDOFFs when message count approaches 25. When you see one, save it locally as backup.

---

## TWO KINGDOMS (v3.3 Key Concept)

AIXORD v3.3 divides all work into two kingdoms:

### IDEATION KINGDOM (Planning)
- **Purpose:** Define WHAT to build
- **Phases:** DECISION -> DISCOVER -> BRAINSTORM -> OPTIONS -> ASSESS
- **Forbidden:** Any implementation or coding
- **Output:** MASTER_SCOPE with all deliverables defined

### REALIZATION KINGDOM (Building)
- **Purpose:** Build WHAT was defined
- **Phases:** EXECUTE -> AUDIT -> VERIFY -> LOCK
- **Forbidden:** Changing specifications without UNLOCK
- **Input:** Locked MASTER_SCOPE from Ideation

### The Ideation Gate
Between the kingdoms is a **mandatory checkpoint**:

```
IDEATION GATE CHECKLIST
[ ] MASTER_SCOPE defined with clear objective
[ ] All Deliverables enumerated
[ ] All Steps per Deliverable defined
[ ] DAG dependencies mapped
[ ] 7 Quality Dimensions evaluated
[ ] MOSA compliance checked
[ ] Open-source options prioritized
[ ] Director typed: FINALIZE PLAN

Gate Status: BLOCKED / OPEN
```

### Passing the Gate
1. Run `GATE STATUS` to see what's missing
2. Complete any missing checks (`QUALITY CHECK`, `MOSA CHECK`, `SHOW DAG`)
3. Type `FINALIZE PLAN` to pass the gate
4. Or `GATE OVERRIDE: [reason]` if justified

---

## NEW v3.3 COMMANDS

### Kingdom & Gate Commands
| Command | Effect |
|---------|--------|
| `FINALIZE PLAN` | Attempt to pass Ideation Gate |
| `GATE STATUS` | Show gate checklist |
| `GATE OVERRIDE: [reason]` | Skip gate with documented reason |
| `ENTER IDEATION` | Return to planning |
| `ENTER REALIZATION` | Move to building (requires gate) |

### Quality Commands
| Command | Effect |
|---------|--------|
| `QUALITY CHECK: [deliverable]` | Run 7 Quality Dimensions |
| `MOSA CHECK` | Check modular architecture compliance |
| `COST CHECK` | Evaluate open-source vs paid options |
| `SHOW MASTER_SCOPE` | Display current scope structure |

### DAG Commands
| Command | Effect |
|---------|--------|
| `SHOW DAG` | Display dependency graph |
| `DAG STATUS` | Show which SCOPEs are eligible |
| `CHECK DEPENDENCIES: [scope]` | Verify prerequisites |

### Session Commands
| Command | Effect |
|---------|--------|
| `SESSION STATUS` | Show message count and signals |
| `CHECKPOINT` | Save state, continue working |
| `EXTEND 5` | Add 5 more messages (once per session) |
| `HANDOFF` | Generate full handoff document |

### Environment Commands
| Command | Effect |
|---------|--------|
| `ENVIRONMENT CONFIGURED` | Confirm variables set |
| `SHOW ENVIRONMENT` | Display expected variables |
| `GENERATE SETUP COMMANDS` | Output folder creation commands |

---

## ENVIRONMENT VARIABLES (v3.3)

Before Gemini generates CLI commands, set these:

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

## MULTI-SIGNAL HANDOFF (v3.3)

Even with Gems, Gemini tracks multiple signals:

| Signal | Threshold | Action |
|--------|-----------|--------|
| Message count | 22/25 | Warning |
| Message count | 25/25 | HANDOFF required |
| Complexity | 3+ SCOPEs | Checkpoint suggested |

**You don't need to remember to request HANDOFFs** — Gemini handles this for you.

### When Gemini Generates HANDOFFs

| Trigger | What Happens |
|---------|--------------|
| Message 22/25 | Warning with CHECKPOINT suggestion |
| Message 25/25 | HANDOFF required (or EXTEND 5 once) |
| Major milestone | Checkpoint offered |
| Phase transition | Transition HANDOFF generated |

---

## RECOVERY (If Session Lost)

If your Gem session ends unexpectedly:

1. Open your AIXORD Gem
2. Type: `PMERIT RECOVER`
3. Describe what you were working on OR paste your last HANDOFF
4. Gemini will reconstruct context (including Kingdom state and DAG)

---

## PROJECT FOLDER STRUCTURE

After license validation, you'll choose your folder approach:

- **Option A (Recommended):** Absolute AIXORD Structure with screenshot verification
- **Option B:** User-controlled structure

For Gem users, Option A is especially valuable—you can upload your entire organized project folder to the Gem's Knowledge section.

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

### Uploading to Gem Knowledge

Upload these files to your Gem's Knowledge section:

| File | Purpose | When to Add |
|------|---------|-------------|
| `PROJECT_DOCUMENT.md` | Project specs & status | After DOCUMENT phase |
| `MASTER_SCOPE.md` | Complete scope with DAG | After passing Ideation Gate |
| `HANDOFF_[DATE].md` | Session continuity | After each major session |
| `REFERENCE_*.md` | Project-specific docs | As needed |

---

## WITH GEM vs WITHOUT GEM

| Experience | Without Gem | With Gem |
|------------|-------------|----------|
| Session start | Paste governance (30 sec) | Just open Gem (instant) |
| Project context | Paste HANDOFF | Already in Knowledge |
| Governance rules | Re-loaded each time | Persistent |
| Setup effort | Every session | One time |
| HANDOFF tracking | Manual | Automatic |

**Verdict:** If you have Gemini Advanced, always use a Gem for AIXORD projects.

---

## TROUBLESHOOTING

### "Gemini doesn't recognize PMERIT CONTINUE"
- Make sure you opened your AIXORD **Gem**, not regular Gemini chat
- Verify governance is in the Gem's Instructions field

### "Gemini forgets my project context"
- Upload your PROJECT_DOCUMENT.md to Gem Knowledge
- Save HANDOFF backups locally for critical milestones

### "I want to work on multiple projects"
- Create one Gem per project (e.g., "AIXORD - Website", "AIXORD - App")
- Each Gem has its own Instructions and Knowledge

### "Session ended without HANDOFF"
- Open your Gem and type: `PMERIT RECOVER`
- Describe what you were working on
- Gemini will help reconstruct

### "Gate keeps blocking me"
- Run `GATE STATUS` to see what's missing
- Complete the required checks
- Or use `GATE OVERRIDE: [your reason]` if justified

---

## INCLUDED FILES

| File | Purpose | Paste into Gem? |
|------|---------|-----------------|
| `AIXORD_GOVERNANCE_GEMINI_GEM_V3.3.md` | **Condensed governance for Gems** | YES — paste into Instructions |
| `AIXORD_GOVERNANCE_GEMINI_V3.3.md` | Full governance (paste workflow) | For paste workflow only |
| `AIXORD_PHASE_DETAILS_V3.3.md` | Detailed phase behaviors | Upload to Knowledge |
| `AIXORD_GEMINI_ADVANCED.md` | This quick-start guide | NO — read only |
| `AIXORD_STATE_GEMINI_V3.3.json` | State template | Upload to Knowledge (optional) |
| `README.md` | Package overview | NO |

---

## NEXT STEPS

1. Create your AIXORD Gem (above)
2. Open the Gem
3. Type: `PMERIT CONTINUE`
4. Enter your license when prompted
5. Say: `Gem` when asked about your tier
6. Set environment variables: `ENVIRONMENT CONFIGURED`
7. Choose your starting point:
   - `PMERIT DISCOVER` — Find a project idea
   - `PMERIT BRAINSTORM` — Shape an existing idea
   - `FINALIZE PLAN` — Pass Ideation Gate to start building
   - `PMERIT EXECUTE` — Build from a plan (requires passing gate first)

---

*AIXORD v3.3 — Gemini Advanced Edition*
*Two Kingdoms. DAG Dependencies. Quality-Driven.*
*© 2026 PMERIT LLC. All Rights Reserved.*
