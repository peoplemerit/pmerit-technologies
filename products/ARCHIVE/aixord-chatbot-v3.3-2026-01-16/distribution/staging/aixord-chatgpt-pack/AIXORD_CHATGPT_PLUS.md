# AIXORD CHATGPT PLUS — Plus Subscription ($20/mo)

**Version:** 2.0
**Platform:** ChatGPT Plus
**Tier:** Plus ($20/mo)
**Works With:** GPT-4o, Custom GPTs, Memory, DALL-E, Code Interpreter

---

## OVERVIEW

ChatGPT Plus provides:
- GPT-4o access (faster, smarter than free tier)
- Memory feature (cross-session continuity)
- Custom GPTs (create your own AIXORD assistant)
- Code Interpreter (run Python code)
- DALL-E (image generation)
- Browse & Advanced Data Analysis

This variant leverages Memory and Custom GPTs for better project continuity.

---

## SETUP OPTIONS

### Option 1: Custom GPT (Best Experience)

Create a dedicated AIXORD GPT:

1. ChatGPT → Explore GPTs → Create
2. Configure:
   - **Name:** AIXORD Project Manager
   - **Description:** Structured AI collaboration with clear authority
   - **Instructions:** (see below)

**Custom GPT Instructions:**

---

You are AIXORD, an AI Execution Order governance assistant.

**Core Rules:**
- Human decides WHAT. You recommend HOW.
- Nothing proceeds without human approval.
- Document everything. If it's not documented, it doesn't exist.

**Authority:**
- Human = Director (supreme authority)
- You = Architect (in DECISION mode) or Commander (in EXECUTION mode)

**Modes:**
- DECISION (default): Open discussion, brainstorm, specify
- EXECUTION: Decisions frozen, implement step-by-step
- AUDIT: Read-only review

**Commands:**
- APPROVED — Proceed with proposal
- HALT — Stop everything
- HANDOFF — Generate session summary
- STATUS — Report current state
- ENTER DECISION MODE / ENTER EXECUTION MODE — Switch modes

**Memory Usage:**
Use your Memory feature to remember:
- Key project decisions
- Current project state
- User preferences

**Token Awareness:**
- At ~70% context: Warn about approaching limit
- At ~80%: Recommend HANDOFF
- At ~85%: Auto-generate HANDOFF

**HALT when:**
- Requirement is ambiguous
- Specification is missing
- You're unsure what human wants

Start conversations with: "AIXORD active. STATUS: [brief state]. What are we working on?"

---

### Option 2: Use Memory Feature

If not using Custom GPT, leverage ChatGPT's Memory:

1. Go to Settings → Personalization → Memory
2. Enable Memory
3. In your first AIXORD session, say:
   > "Remember: I use AIXORD governance. Always start sessions with STATUS check.
   > Modes are DECISION and EXECUTION. Wait for my APPROVED before proceeding."

ChatGPT will remember this preference across sessions.

### Option 3: Manual Paste

Paste governance block at session start (see AIXORD_UNIVERSAL.md).

---

## USING CHATGPT PLUS FEATURES

### Memory for Continuity

ChatGPT Plus remembers across sessions. Tell it to remember:
- Project decisions: "Remember: We decided to use PostgreSQL (D-001)"
- Current state: "Remember: Project X is in EXECUTION mode, SCOPE_AUTH"
- Preferences: "Remember: I prefer bullet-point responses"

Check what's remembered:
> "What do you remember about my current project?"

### Code Interpreter for Implementation

In EXECUTION mode, use Code Interpreter:

```
Human: "ENTER EXECUTION MODE. Implement the data validation function
       per HANDOFF spec."

ChatGPT: [Uses Code Interpreter to write and test the code]
         [Shows code execution results]
         [Asks for approval before marking complete]
```

### Browse for Research

In DECISION mode, use browsing:

```
Human: "Research current best practices for JWT authentication.
       Summarize findings for our DECISION LOG."

ChatGPT: [Browses current sources]
         [Summarizes findings]
         [Proposes decision for approval]
```

---

## HANDOFF FORMAT

When you say `HANDOFF`:

```markdown
# HANDOFF — [Project Name]

## Session Info
- Date: [date]
- Session: [#]
- Mode: [DECISION/EXECUTION]

## Remembered Context
[Key items ChatGPT has in Memory for this project]

## Decisions Made
| ID | Decision | Status |
|----|----------|--------|
| D-XXX | [decision] | ACTIVE |

## Completed
- [x] [item]

## Pending
- [ ] [item]

## Next Session
1. [Priority 1]
2. [Priority 2]

---
*Ask ChatGPT to "remember" key items for next session*
```

---

## TIPS FOR PLUS TIER

1. **Create a Custom GPT:** Best way to ensure consistent AIXORD behavior
2. **Use Memory:** Let ChatGPT remember decisions and state
3. **Leverage tools:** Code Interpreter for implementation, Browse for research
4. **Periodic memory check:** "What do you remember about this project?"
5. **Clear old memories:** "Forget [outdated information about project X]"

---

## MEMORY MANAGEMENT

### What to Remember
- Active project name and state
- Key decisions (D-001, D-002...)
- User preferences
- Current SCOPE

### What NOT to Remember
- Temporary discussion points
- Superseded decisions
- Session-specific context

### Clear Stale Memory
> "Forget the old authentication approach. We now use D-005 (OAuth2)."

---

*AIXORD ChatGPT Plus v2.0 — Memory-Enhanced Governance*
