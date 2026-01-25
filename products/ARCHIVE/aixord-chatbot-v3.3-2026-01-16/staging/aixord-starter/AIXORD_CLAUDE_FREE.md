# AIXORD CLAUDE FREE — Free Tier Optimization

**Version:** 2.0
**Platform:** Claude Free (Web)
**Tier:** Free
**Works With:** Limited context, no Projects, usage limits

---

## OVERVIEW

The Claude Free tier has limitations:
- Shorter context window
- No Projects feature
- Usage limits per day
- No custom instructions persistence

This variant is optimized to work within these constraints.

---

## QUICK START

**Important:** You must paste this governance block at the START of EVERY session.

Copy everything below the line:

---

**AIXORD FREE PROTOCOL**

You are under AIXORD governance. Be concise — we have limited context.

**Authority:**
- I decide WHAT. You decide HOW.
- Nothing proceeds without my approval.

**Modes:**
- DECISION (default): Discuss, explore, specify
- EXECUTION: Implement exactly as specified
- HALT: Stop everything

**Commands:**
- `APPROVED` — Proceed
- `HALT` — Stop
- `HANDOFF` — Save session state
- `STATUS` — Brief state report

**Token Rules (CRITICAL):**
- Be concise. Avoid unnecessary text.
- At 50% context: Warn me
- At 70% context: Alert — handoff soon
- At 80% context: Auto-trigger HANDOFF

**Behavior:**
- Short responses unless I ask for detail
- Bullet points over paragraphs
- Code over explanation when implementing
- Ask one question at a time

Acknowledge briefly. What are we working on?

---

## CONTEXT-SAVING STRATEGIES

### 1. Keep Responses Short

Tell Claude:
> "Be concise. Bullet points preferred."

### 2. Use Minimal HANDOFF

Request compressed format:
> "HANDOFF — compressed format"

Claude produces:

```markdown
# HANDOFF

State: DECISION
Decisions: D1-UseReact, D2-PostgreSQL
Done: Auth module
Next: Dashboard
Key: [one critical detail]
```

### 3. Reference, Don't Repeat

Instead of pasting entire documents:
> "Continue from D-003 (Use React for frontend). Next: implement header component."

### 4. One Task at a Time

Don't try to do everything in one session. Focus on:
1. Make one decision, or
2. Implement one small feature, or
3. Review one component

---

## DAILY LIMIT STRATEGY

Claude Free has daily usage limits. Maximize your sessions:

### Morning Session
- Planning and decisions
- Generate specifications
- Create compressed HANDOFF

### Afternoon Session (if limits allow)
- Execute one specification
- Generate next HANDOFF

### Save Complex Work
For complex projects, consider:
- Upgrading to Pro for that project
- Using AIXORD Universal with ChatGPT/Gemini as backup
- Breaking work into smaller pieces

---

## HANDOFF — COMPRESSED FORMAT

When context is tight, use this format:

```
# HANDOFF [ProjectName] S[#]

State: [D/E/A] | Scope: [name]
Decisions: [D1-brief, D2-brief, D3-brief]
Done: [item1, item2]
Next: [item3, item4]
Key: [one critical context item]
```

Example:
```
# HANDOFF EmailArchive S3

State: E | Scope: SearchUI
Decisions: D1-React, D2-PostgreSQL, D3-ElasticSearch
Done: AuthModule, DatabaseSchema
Next: SearchFilters, DatePicker
Key: API returns max 100 results, needs pagination
```

---

## TIPS FOR FREE TIER

1. **Paste governance every time:** No custom instructions persist
2. **Be direct:** "Build X" not "I was thinking maybe we could..."
3. **Use compressed handoffs:** Save tokens for actual work
4. **Know your limits:** 2-3 focused tasks per day max
5. **Have backup:** Keep ChatGPT free as fallback

---

## WHEN TO UPGRADE

Consider Claude Pro if you:
- Work on projects spanning multiple sessions
- Need longer context windows
- Want Projects and custom instructions
- Hit free tier limits regularly

Pro is $20/mo and includes:
- 5x more usage
- Projects with persistent knowledge
- Priority access
- Extended context

---

*AIXORD Claude Free v2.0 — Maximum value from limited resources*
