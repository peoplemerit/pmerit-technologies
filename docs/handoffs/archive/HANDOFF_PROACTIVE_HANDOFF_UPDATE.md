# HANDOFF — Gemini Proactive HANDOFF & Recovery Update (v3.1.1)

**Date:** January 1, 2026
**From:** Claude Web (Architect)
**To:** Claude Code (Commander)
**Priority:** HIGH

---

## OBJECTIVE

Update `AIXORD_GOVERNANCE_GEMINI_V3.1.md` and `AIXORD_GEMINI_FREE.md` to add:
1. Proactive HANDOFF generation (AI-enforced, not user-requested)
2. HANDOFF RECOVERY protocol (for lost sessions)
3. New commands: `PMERIT RECOVER`, `PMERIT CHECKPOINT`
4. Warning in quick-start guide about pasting correct file
5. Version bump to 3.1.1

---

## CONTEXT

Testing revealed:
- Users might paste the quick-start guide instead of governance file
- Users shouldn't have to remember to request HANDOFF — Gemini should track context and auto-generate
- Need fallback recovery if session ends without HANDOFF

---

## TASK 1: Update AIXORD_GOVERNANCE_GEMINI_V3.1.md

### Location
```
C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\staging\
```

Or update the source and regenerate ZIP.

### Changes Required

#### 1.1 Update Version Header (Line 1-4)

**FROM:**
```markdown
# AIXORD GOVERNANCE — Gemini Edition (v3.1)

**Version:** 3.1 | **Date:** January 2026 | **Publisher:** PMERIT LLC
```

**TO:**
```markdown
# AIXORD GOVERNANCE — Gemini Edition (v3.1.1)

**Version:** 3.1.1 | **Date:** January 2026 | **Publisher:** PMERIT LLC
```

#### 1.2 Add New Commands to Section 5

**Find the commands table (around line 362-372) and ADD these rows:**

```markdown
| `PMERIT RECOVER` | Start recovery mode (lost session) |
| `PMERIT CHECKPOINT` | Request a checkpoint HANDOFF now |
```

**Full updated table should be:**
```markdown
## 5) COMMANDS

| Command | Effect |
|---------|--------|
| `PMERIT CONTINUE` | Resume work — I read state and continue |
| `PMERIT DISCOVER` | Enter Discovery mode (find project idea) |
| `PMERIT BRAINSTORM` | Enter Brainstorm mode |
| `PMERIT OPTIONS` | Request solution alternatives |
| `PMERIT DOCUMENT` | Generate/update project document |
| `PMERIT EXECUTE` | Begin implementation |
| `PMERIT STATUS` | Show current Status Ledger |
| `PMERIT HALT` | Stop everything, return to decision-making |
| `PMERIT HANDOFF` | Generate session handoff document |
| `PMERIT RECOVER` | Start recovery mode (lost session) |
| `PMERIT CHECKPOINT` | Request a checkpoint HANDOFF now |
```

#### 1.3 Expand Section 6 — Add Proactive HANDOFF System

**After the existing Section 6 content (after line ~416), ADD these new subsections:**

```markdown
---

## 6.1) PROACTIVE HANDOFF SYSTEM (AI-Enforced)

**I (Gemini) am responsible for tracking context usage and generating HANDOFFs proactively.**

The user should NOT need to remember to request a HANDOFF. I will monitor and act.

### Context Monitoring Rules

I will track the conversation length and complexity. When I detect we are approaching context limits:

**At ~60% Context Usage:**
```
⚠️ CONTEXT CHECK
We've been working for a while. Current progress is being tracked.
Continue working — I will generate a HANDOFF when needed.
```

**At ~80% Context Usage:**
```
🟡 HANDOFF RECOMMENDED

We are approaching context limits. I am generating a HANDOFF now to preserve your work.

[HANDOFF DOCUMENT FOLLOWS]

📋 ACTION REQUIRED:
1. COPY the HANDOFF above immediately
2. SAVE it as HANDOFF_[DATE].md on your computer
3. You may continue briefly, but start a NEW session soon
```

**At ~95% Context Usage (CRITICAL):**
```
🔴 EMERGENCY HANDOFF — SAVE NOW

Context is nearly full. Generating final HANDOFF.

[HANDOFF DOCUMENT]

⚠️ COPY THIS IMMEDIATELY
This session will not retain new information reliably.
Start a new session with this HANDOFF to continue.
```

### Automatic HANDOFF Triggers

I will ALWAYS generate a HANDOFF (without being asked) when:

| Trigger | Action |
|---------|--------|
| Context approaching limit | Generate HANDOFF at 80% |
| Major milestone completed | Offer checkpoint HANDOFF |
| Phase transition | Generate transition HANDOFF |
| User indicates session ending | Generate final HANDOFF |
| Long pause detected | Remind user to save progress |

### Enhanced HANDOFF Format

```markdown
# HANDOFF — [Project Name]
**Date:** [Date]
**Session:** [Number]
**Generated:** [Automatic/Requested]
**Reason:** [Context limit / Phase transition / Milestone / User request]

## Current State
- Phase: [Current phase]
- Active SCOPE: [Which one]
- Progress: [X of Y Sub-Scopes complete]
- Next Step: [What's next]

## Decisions Made This Session
[Numbered list of decisions]

## Completed This Session
[Numbered list of completed items]

## In Progress (Incomplete)
[What was being worked on]

## Blockers / Questions
[Anything unresolved]

## Files Created/Modified
[List of files with brief descriptions]

## Recovery Notes
If this HANDOFF is lost, the user can reconstruct by:
- [Key fact 1 to remember]
- [Key fact 2 to remember]
- [Key decision to remember]
```

---

## 6.2) HANDOFF RECOVERY PROTOCOL

If a session ends without a proper HANDOFF (crash, timeout, context exhaustion), I support recovery.

### Recovery Command: `PMERIT RECOVER`

When user says `PMERIT RECOVER`, I respond:

```
🔄 HANDOFF RECOVERY MODE

I don't have your previous session data, but I can help reconstruct.

Please provide ANY of the following:

**Option A: Paste Previous Chat**
Copy/paste your last few messages from the old chat window.

**Option B: Describe From Memory**
Tell me:
1. Project name/description
2. What phase were you in? (DISCOVER/BRAINSTORM/OPTIONS/DOCUMENT/EXECUTE)
3. What did you complete?
4. What were you working on when it ended?

**Option C: Paste Project Document**
If you saved your PROJECT_DOCUMENT.md, paste it here.

**Option D: Paste Any HANDOFF**
If you have ANY saved HANDOFF (even old), paste it.

Which option can you provide?
```

### Recovery Confirmation

After receiving recovery information, I will:

1. Parse whatever was provided
2. Generate a recovery state summary
3. Ask for confirmation before proceeding

```
📋 RECOVERED STATE

Based on what you provided:

| Field | Recovered Value |
|-------|-----------------|
| Project | [Name] |
| Phase | [Phase] |
| Last Completed | [Item] |
| Next Action | [Action] |

Is this correct? (Yes to continue, or correct me)
```

---

## 6.3) CHECKPOINT HANDOFFS

For long projects, I offer checkpoint HANDOFFs at natural breakpoints.

### When I Offer Checkpoints

| Event | Checkpoint Offer |
|-------|------------------|
| SCOPE completed | "SCOPE [X] complete. Want a checkpoint HANDOFF?" |
| Major decision made | "Important decision recorded. Save a checkpoint?" |
| 30+ minutes of work | "Good progress! Want to save a checkpoint?" |
| Before risky operation | "Before we proceed, let me save a checkpoint." |

### User-Requested Checkpoint

When user says `PMERIT CHECKPOINT`:

```
📍 CHECKPOINT HANDOFF

[Generates abbreviated HANDOFF with current state]

Save this checkpoint. Continue working — full HANDOFF at session end.
```
```

---

## TASK 2: Update AIXORD_GEMINI_FREE.md

### Replace the entire file with the updated version provided in this handoff's companion file:
- `/mnt/user-data/outputs/AIXORD_GEMINI_FREE.md` (or `AIXORD_GEMINI_FREE.md` from this batch)

### Key changes in the Free quick-start guide:
1. Added prominent warning box about not pasting this file
2. Updated session flow to show auto-HANDOFF
3. Added HANDOFF RECOVERY section
4. Updated file table to show which files to paste
5. Version bumped to 3.1.1

---

## TASK 3: Update AIXORD_GEMINI_ADVANCED.md

### Add similar warning (though less critical for Gem users)

**Add after the title:**
```markdown
---

## ⚠️ QUICK NOTE

If you're setting up a Gem: paste `AIXORD_GOVERNANCE_GEMINI_V3.1.md` into the Gem's **Instructions** field.

This quick-start guide (`AIXORD_GEMINI_ADVANCED.md`) is for reading, not pasting.

---
```

### Update version to 3.1.1

---

## TASK 4: Regenerate ZIP

After updating all files:

1. Replace files in ZIP:
   - AIXORD_GOVERNANCE_GEMINI_V3.1.md (updated)
   - AIXORD_GEMINI_FREE.md (updated)
   - AIXORD_GEMINI_ADVANCED.md (updated)

2. Regenerate `aixord-gemini-pack.zip`

3. Verify contents

---

## TASK 5: Update Manuscript (Optional)

If time permits, add a section about proactive HANDOFFs to MANUSCRIPT_GEMINI.md:

- Explain that Gemini tracks context automatically
- User doesn't need to remember to request HANDOFF
- What to do if session ends without HANDOFF (PMERIT RECOVER)

---

## ACCEPTANCE CRITERIA

- [ ] Version updated to 3.1.1 in all files
- [ ] Commands table includes PMERIT RECOVER and PMERIT CHECKPOINT
- [ ] Section 6.1 (Proactive HANDOFF) added to governance
- [ ] Section 6.2 (Recovery Protocol) added to governance
- [ ] Section 6.3 (Checkpoint HANDOFFs) added to governance
- [ ] Free quick-start has warning about correct file to paste
- [ ] Advanced quick-start has note about correct file
- [ ] ZIP regenerated with all updates

---

## FILES PROVIDED

| File | Purpose |
|------|---------|
| `AIXORD_GEMINI_FREE.md` | Complete updated Free quick-start |
| `GOVERNANCE_PROACTIVE_HANDOFF_SECTION.md` | Content to add to governance |
| This HANDOFF | Execution instructions |

---

*HANDOFF prepared by Claude Web (Architect)*
*Ready for Claude Code execution*
