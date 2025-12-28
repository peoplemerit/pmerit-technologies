# AIXORD CHATGPT FREE — Free Tier Optimization

**Version:** 2.0
**Platform:** ChatGPT Free
**Tier:** Free
**Works With:** GPT-4o-mini (limited), GPT-3.5, Basic features

---

## OVERVIEW

ChatGPT Free tier limitations:
- Limited GPT-4o access (few messages per day)
- Primarily GPT-3.5 or GPT-4o-mini
- No Custom GPTs
- No Memory feature
- No Code Interpreter
- Slower during peak times

This variant works within these constraints.

---

## QUICK START

Copy and paste this at the START of every session:

---

**AIXORD GOVERNANCE**

You are under AIXORD rules. Be brief — limited context.

**Rules:**
- I decide WHAT. You recommend HOW.
- Nothing without my approval.

**Modes:**
- DECISION: Discuss and plan
- EXECUTION: Implement exactly
- HALT: Stop everything

**Commands:**
- APPROVED — Go ahead
- HALT — Stop
- HANDOFF — Save state
- STATUS — Brief report

**Be Concise:**
- Short responses
- Bullets over paragraphs
- Ask one question at a time

**Context Warning:**
- 60% used: Warn me
- 75% used: Trigger HANDOFF

Acknowledge briefly. What's the task?

---

## LIMITATIONS & WORKAROUNDS

### No Memory
**Problem:** ChatGPT forgets between sessions
**Solution:** Save HANDOFF documents locally. Paste at session start.

### No Custom GPT
**Problem:** Can't save governance instructions
**Solution:** Paste governance block every session (it's short)

### Limited GPT-4o
**Problem:** Only a few GPT-4o messages per day
**Solution:**
- Use GPT-4o for complex decisions only
- Use GPT-3.5/4o-mini for routine tasks
- Save your GPT-4o allowance for important moments

### Shorter Context
**Problem:** Hits context limit faster
**Solution:**
- Compressed handoffs
- One task per session
- Reference, don't repeat

---

## COMPRESSED HANDOFF FORMAT

Use this minimal format to save tokens:

```
HANDOFF [Project] S[#]
Mode: D/E | Scope: [name]
Decisions: D1-[brief], D2-[brief]
Done: [item1], [item2]
Next: [item3]
Key: [one critical note]
```

Example:
```
HANDOFF WebApp S4
Mode: E | Scope: Login
Decisions: D1-React, D2-Firebase
Done: Signup, EmailVerify
Next: PasswordReset
Key: Must support OAuth
```

---

## SESSION STRATEGIES

### Strategy 1: One Task Per Session

Don't try to do everything. Each session:
1. Paste governance (30 seconds)
2. Paste compressed HANDOFF (if continuing)
3. Complete ONE focused task
4. Generate compressed HANDOFF
5. End session

### Strategy 2: Strategic GPT-4o Usage

You get limited GPT-4o messages. Use them for:
- Complex architectural decisions
- Difficult debugging
- Specification writing

Use GPT-3.5/4o-mini for:
- Routine Q&A
- Simple code generation
- Status checks

### Strategy 3: External Documentation

Since ChatGPT can't remember:
1. Keep a local markdown file
2. Record all decisions there
3. Paste relevant sections when needed

```markdown
# My Project Decisions

## D-001: Use React
Decided: 2025-12-25
Reason: Team expertise

## D-002: PostgreSQL
Decided: 2025-12-25
Reason: JSON support needed
```

---

## TIPS

1. **Always paste governance:** Every. Single. Session.
2. **Keep handoffs tiny:** 5-10 lines max
3. **One task focus:** Don't multi-task
4. **Save GPT-4o:** Use for what matters
5. **Local backup:** Keep decisions in a file

---

## UPGRADE PATH

Consider upgrading when:
- You need multi-session continuity (Memory)
- Projects get complex (Custom GPTs)
- You need code execution (Code Interpreter)
- Free tier limits frustrate you

ChatGPT Plus is $20/mo — same as Claude Pro.

---

*AIXORD ChatGPT Free v2.0 — Maximum efficiency, minimum resources*
