# AIXORD GEMINI FREE — Free Tier Optimization

**Version:** 2.0
**Platform:** Google Gemini Free
**Tier:** Free
**Works With:** Gemini Pro (limited), Google account required

---

## OVERVIEW

Gemini Free provides:
- Access to Gemini Pro model
- Good context window
- Google account integration
- No Gems (custom chatbots)
- Usage limits

This variant works within free tier constraints.

---

## QUICK START

Paste this at the START of every session:

---

**AIXORD PROTOCOL**

You are under AIXORD governance.

**Authority:**
- I (Human) decide WHAT. You decide HOW.
- Nothing without my approval.

**Modes:**
- DECISION (default): Discuss, plan, specify
- EXECUTION: Implement exactly as specified
- HALT: Stop everything

**Commands:**
- APPROVED — Proceed
- HALT — Stop
- HANDOFF — Save session
- STATUS — Brief report

**Token Tracking:**
- 70% context: Warn me
- 80% context: Recommend HANDOFF
- 85% context: Auto-HANDOFF

**Behavior:**
- Concise responses
- One question at a time
- Wait for my approval

Acknowledge and ask what we're working on.

---

## FREE TIER LIMITATIONS

| Feature | Available? | Workaround |
|---------|------------|------------|
| Gems | No | Paste governance each session |
| Extended context | Limited | Use handoffs frequently |
| Google Drive | Yes | Store handoffs in Drive |
| Image generation | Limited | Focus on text tasks |
| Code execution | No | Describe code, don't run |

---

## WORKFLOW

### Starting a Session

1. Open gemini.google.com
2. Start new conversation
3. Paste governance block
4. Paste previous HANDOFF (if continuing)
5. Say what you're working on

### During a Session

Keep it focused:
- One task at a time
- Ask for approval before proceeding
- Watch for context warnings

### Ending a Session

1. Say `HANDOFF`
2. Copy the HANDOFF output
3. Save to Google Drive or local file
4. Use in next session

---

## HANDOFF FORMAT

```markdown
# HANDOFF — [Project]

## State
- Mode: [D/E]
- Scope: [name]
- Date: [date]

## Decisions
| ID | Decision |
|----|----------|
| D-1 | [brief] |

## Done
- [item]

## Next
- [item]

## Key Context
[Critical info for next session]
```

---

## TIPS

1. **Paste governance every time:** No persistence without Gems
2. **Use Google Drive:** Good free storage for handoffs
3. **One task per session:** Stay focused
4. **Upgrade when needed:** Advanced is $20/mo via Google One

---

## GOOGLE DRIVE INTEGRATION

Even on free tier, use Drive for handoffs:

1. Create folder: `AIXORD-Projects/[ProjectName]/`
2. Save handoffs: `HANDOFF_S1.md`, `HANDOFF_S2.md`, etc.
3. Reference in sessions: "Load my last handoff from Drive"

---

*AIXORD Gemini Free v2.0 — Google-Integrated Governance*
