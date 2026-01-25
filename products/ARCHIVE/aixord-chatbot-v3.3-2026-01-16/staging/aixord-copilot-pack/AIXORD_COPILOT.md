# AIXORD COPILOT — GitHub/Microsoft Copilot

**Version:** 2.0
**Platform:** Microsoft Copilot / GitHub Copilot
**Tier:** Free / Pro / Enterprise
**Works With:** Bing integration, Microsoft 365, GitHub, VS Code

---

## OVERVIEW

Microsoft Copilot variants:
- **Microsoft Copilot (free):** Bing-powered, web interface
- **Microsoft Copilot Pro ($20/mo):** Priority access, Microsoft 365 integration
- **GitHub Copilot ($10-19/mo):** Code-focused, IDE integration

AIXORD adapts to each variant.

---

## MICROSOFT COPILOT (WEB)

### Quick Start

Paste at session start:

---

**AIXORD PROTOCOL**

You are under AIXORD (AI Execution Order) governance.

**Authority:**
- I (Human) decide WHAT exists and approve all decisions.
- You recommend HOW and execute approved work.
- Nothing proceeds without my explicit approval.

**Modes:**
- DECISION (default): Open discussion, brainstorming
- EXECUTION: Decisions frozen, implement step-by-step
- HALT: Stop everything

**Commands:**
- APPROVED — Proceed with proposal
- HALT — Stop, return to DECISION
- HANDOFF — Generate session summary
- STATUS — Report current state

**Behavior:**
- Wait for my approval before significant actions
- Ask when requirements are unclear
- Track context usage and warn before limits

Acknowledge and ask what we're working on.

---

### Microsoft 365 Integration (Pro)

If using Copilot Pro with Microsoft 365:

**Word/Documents:**
- Draft specifications directly in Word
- "Create HANDOFF document in Word format"

**Excel:**
- Track decisions in spreadsheets
- "Add this decision to the project decision log"

**Teams:**
- Share handoffs via Teams
- Reference meeting notes for context

---

## GITHUB COPILOT

GitHub Copilot is code-focused. Use AIXORD for structured development:

### VS Code / IDE Integration

In your project, create `.github/copilot-instructions.md`:

```markdown
# AIXORD Commander Instructions

This project uses AIXORD governance.

## Current Mode: EXECUTION

The human has approved the following specification. Implement exactly as specified.

## Active SCOPE: [SCOPE_NAME]

## Specifications:
[Paste current HANDOFF specifications here]

## Rules:
- Follow specifications exactly
- Do not add features not specified
- Ask if anything is ambiguous
- Report completion of each step
```

### Copilot Chat

When using Copilot Chat in IDE:

```
Human: "AIXORD EXECUTION MODE. Implement auth module per spec:
       - JWT tokens
       - 24hr expiry
       - Refresh token support

       Start with token generation."

Copilot: [Implements token generation]
         [Asks for approval to proceed to next step]
```

### Code Review with AIXORD

```
Human: "AIXORD AUDIT. Review this PR against SCOPE_AUTH specification:
       [paste specification]

       Report any deviations."

Copilot: [Reviews code against spec]
         [Lists conforming and non-conforming items]
```

---

## HANDOFF FORMAT

### Microsoft Copilot

```markdown
# HANDOFF — [Project]

## Session
- Date: [date]
- Mode: [DECISION/EXECUTION]

## Decisions
| Decision | Status |
|----------|--------|
| [decision] | ACTIVE |

## Completed
- [x] [item]

## Next
- [ ] [item]

## Context
[Key information for next session]
```

### GitHub Copilot

For code projects, include implementation status:

```markdown
# HANDOFF — [Project] SCOPE_[Name]

## Implementation Status
| Component | Status | Notes |
|-----------|--------|-------|
| [component] | DONE | [notes] |
| [component] | IN_PROGRESS | [notes] |
| [component] | TODO | [notes] |

## Code References
- `src/auth/token.ts` — Token generation (DONE)
- `src/auth/refresh.ts` — Refresh logic (IN_PROGRESS)

## Next Steps
1. Complete refresh token logic
2. Add unit tests
3. Integration testing

## Blockers
- [any blocking issues]
```

---

## VARIANT COMPARISON

| Feature | Copilot Free | Copilot Pro | GitHub Copilot |
|---------|--------------|-------------|----------------|
| Context persistence | No | Somewhat | Via project files |
| Code generation | Limited | Better | Excellent |
| Microsoft 365 | No | Yes | No |
| IDE integration | No | No | Yes |
| Best for | General chat | Office work | Development |

---

## TIPS

### Microsoft Copilot
1. **Use Bing for research:** Good for DECISION mode research
2. **Save handoffs locally:** No persistence between sessions
3. **Pro for Office:** Worth it if you use Microsoft 365

### GitHub Copilot
1. **Project instructions:** Use `.github/copilot-instructions.md`
2. **Specification in comments:** Comment specs above code sections
3. **Iterative development:** Small steps, frequent commits
4. **Combine with Claude Code:** Copilot for inline, Claude for architecture

---

## MULTI-TOOL WORKFLOW

AIXORD works across tools:

```
1. Claude Pro (DECISION) → Write specifications
2. Create HANDOFF document
3. GitHub Copilot (EXECUTION) → Implement in IDE
4. Claude Code (AUDIT) → Verify implementation
5. Return to Claude Pro → Next SCOPE
```

---

*AIXORD Copilot v2.0 — Microsoft & GitHub Integration*
