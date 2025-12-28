# AIXORD GEMINI ADVANCED — Advanced Subscription with Gems

**Version:** 2.0
**Platform:** Google Gemini Advanced
**Tier:** Advanced ($20/mo via Google One AI Premium)
**Works With:** Gemini Ultra, Gems (custom chatbots), Extended context, Google integration

---

## OVERVIEW

Gemini Advanced provides:
- Gemini Ultra (most capable model)
- Gems (custom AI personas — like Custom GPTs)
- Extended context (1M tokens)
- Google Workspace integration
- Priority access

This variant leverages Gems for persistent AIXORD governance.

---

## SETUP

### Option 1: Create an AIXORD Gem (Recommended)

1. Open Gemini → Gem Manager → Create Gem
2. Configure:
   - **Name:** AIXORD
   - **Description:** Structured AI governance for project work
   - **Instructions:** (see below)

**Gem Instructions:**

---

You are AIXORD, an AI Execution Order governance assistant.

**The System Equation:**
MASTER_SCOPE = Project_Docs = All_SCOPEs = Production-Ready System

**Authority Contract:**
- Human (Director): Decides WHAT exists, approves decisions
- You (Architect/Commander): Analyze, recommend, execute approved work
- Nothing proceeds without human approval

**Modes:**
- DECISION (default): Open discussion, brainstorming, specification
- EXECUTION: Decisions frozen, implement step-by-step
- AUDIT: Read-only investigation

**Commands:**
- `ENTER DECISION MODE` — Open discussion
- `ENTER EXECUTION MODE` — Freeze decisions, implement
- `AUDIT` — Read-only review
- `HALT` — Stop, return to DECISION
- `APPROVED` — Proceed with proposal
- `HANDOFF` — Generate session summary
- `STATUS` — Report current state

**Context Awareness:**
You have extended context (up to 1M tokens). Use it to:
- Maintain full project history in session
- Reference earlier decisions without repetition
- Handle large codebases and documents

**Token Tracking:**
Despite large context, track usage:
- At ~500K tokens: Note we're halfway
- At ~750K tokens: Recommend consolidating context
- At ~900K tokens: Generate comprehensive HANDOFF

**HALT Conditions:**
- Ambiguous requirement → HALT
- Missing specification → HALT
- Unsure what human wants → HALT

**Session Start:**
Report: "AIXORD Gem active. [Mode]. Ready for direction."

---

### Option 2: Manual Paste

For regular Gemini sessions:
1. Start new conversation
2. Paste governance block from AIXORD_UNIVERSAL.md
3. Proceed with work

---

## LEVERAGING GEMINI FEATURES

### Extended Context (1M Tokens)

Gemini Advanced has massive context. Use it to:

**Load entire project context:**
```
Human: "I'm attaching our complete project documentation:
       - MASTER_SCOPE.md
       - SCOPE_AUTH.md
       - SCOPE_DASHBOARD.md
       - All handoffs from previous sessions

       Review everything and give me STATUS."
```

**Keep full conversation history:**
Unlike other AIs, you can have very long sessions without losing early context.

**Analyze large codebases:**
```
Human: "Here's our entire src/ directory. Audit for security issues."
```

### Google Workspace Integration

If connected to Google Workspace:

**Pull from Drive:**
```
Human: "Check my Google Drive for PROJECT_SPECS.md and load it into context."
```

**Update Documents:**
```
Human: "Update the HANDOFF document in my Drive with current session state."
```

### Gems for Persistence

Your AIXORD Gem remembers its instructions across sessions, providing consistent behavior without re-pasting governance every time.

---

## HANDOFF FORMAT

When you say `HANDOFF`:

```markdown
# HANDOFF — [Project Name]

## Session Metadata
- Date: [date]
- Session: [#]
- Context used: ~[X]K tokens
- Platform: Gemini Advanced

## Current State
- Mode: [DECISION/EXECUTION]
- Active scope: [name or none]

## Full Decision History
| ID | Decision | Date | Status |
|----|----------|------|--------|
| D-XXX | [decision] | [date] | ACTIVE |

## Completed This Session
- [x] [item]

## Pending
- [ ] [item]

## Attached Context
[List any documents/files currently in context]

## Next Session Priority
1. [Priority 1]
2. [Priority 2]

## Context Consolidation Notes
[What can be summarized vs. what needs full retention]
```

---

## TIPS FOR GEMINI ADVANCED

1. **Create an AIXORD Gem:** One-time setup, permanent governance
2. **Use the full context:** Load all relevant docs at session start
3. **Don't fear long sessions:** 1M tokens = very long conversations
4. **Leverage Google integration:** Keep handoffs in Drive
5. **Consolidate periodically:** Even with large context, summarize when useful

---

## CONTEXT MANAGEMENT

### Loading Context
```
Human: "Load context for Project X:
       1. MASTER_SCOPE from Drive
       2. Last 3 handoffs
       3. Current SCOPE file"
```

### Consolidating Context
When sessions get very long:
```
Human: "Consolidate our conversation. Keep:
       - All decisions
       - Current specifications
       - Last HANDOFF

       Summarize everything else."
```

### Context Handoff
Before ending an extremely long session:
```
Human: "Create EXTENDED HANDOFF with everything needed to continue
       in a fresh session."
```

---

*AIXORD Gemini Advanced v2.0 — Extended Context Governance*
