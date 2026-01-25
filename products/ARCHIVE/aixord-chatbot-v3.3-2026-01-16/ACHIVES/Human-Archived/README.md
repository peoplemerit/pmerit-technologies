# AIXORD Chatbot Edition

**Version:** 1.1 (Hardened)
**Status:** Manuscript Complete
**Target:** ChatGPT/Gemini FREE users

---

## Product Overview

AIXORD Chatbot Edition is a single-file methodology for structured AI-human collaboration, designed for users who only have access to basic chat interfaces with file upload capability.

**Key Innovation:** Two operating modes (DECISION → EXECUTION) that transform the AI from a helpful assistant into a disciplined project commander.

---

## Key Differentiator

| Full AIXORD | Chatbot Edition |
|-------------|-----------------|
| Multiple files & folders | Single uploadable file |
| Claude Code + folder access | Any chatbot with file upload |
| Requires Claude Pro | Works with FREE chatbots |
| Complex setup | 15-minute setup |
| $9.99 | $4.99 |

---

## Target Audience

- ChatGPT Free users
- Google Gemini users
- Any chatbot with file upload
- Users who can't afford premium subscriptions
- Multi-session project workers

---

## Package Contents

```
aixord-chatbot/
├── MANUSCRIPT_AIXORD_CHATBOT_v1.md  ← Complete methodology book (v1.1 Hardened)
├── 02-QUICK_START_GUIDE.md          ← 15-minute setup guide (v1.1)
├── 03-SALES_PAGE.md                 ← Marketing copy
├── README.md                        ← This file
└── templates/
    └── AIXORD_CHATBOT_TEMPLATE.md   ← Customer download (v1.1 Hardened)
```

---

## Core Concepts

### Two Operating Modes

| Mode | AI Behavior | User Behavior |
|------|-------------|---------------|
| **DECISION** | Analyst — discuss, recommend, question | Decide, approve, reject |
| **EXECUTION** | Commander — issue orders, no suggestions | Execute, confirm with "DONE" |

### Mode Transition

```
DECISION MODE
     │
     │ "APPROVED. BEGIN EXECUTION."
     ▼
EXECUTION MODE (Decisions FROZEN)
     │
     │ "HALT. RETURN TO DECISION MODE."
     ▼
DECISION MODE (Reopened)
```

### Two-Section Architecture

```
┌─────────────────────────────────────┐
│  TOP SECTION (Dynamic)              │
│  • Operating mode                   │
│  • Role instructions                │
│  • Current scope tasks              │
│  • Active decisions                 │
├─────────────────────────────────────┤
│  BOTTOM SECTION (Cumulative)        │
│  • Handoff document                 │
│  • Completed tasks (LOCKED)         │
│  • Decision log (PERMANENT)         │
│  • Research findings                │
└─────────────────────────────────────┘
```

### Hardened Workflow

1. Create project file (once)
2. Upload at session start
3. "[PROJECT] CONTINUE"
4. DECISION MODE: Discuss, decide
5. "APPROVED. BEGIN EXECUTION."
6. EXECUTION MODE: AI issues commands
7. "DONE" after each instruction
8. "HANDOFF" at session end
9. Update file, save
10. Repeat

---

## Commands

### Mode Transition

| Command | Effect |
|---------|--------|
| `APPROVED. BEGIN EXECUTION.` | Lock decisions, switch to Commander |
| `HALT. RETURN TO DECISION MODE.` | Pause, reopen discussion |

### Execution

| Command | Action |
|---------|--------|
| `[PROJECT] CONTINUE` | Start session |
| `DONE` | Instruction complete |
| `BLOCKED: [reason]` | Flag blocker |
| `HANDOFF` | End session |

### State

| Command | Action |
|---------|--------|
| `DECISION: [choice]` | Record decision |
| `UNLOCK: [item]` | Unlock locked item |

---

## Pricing

| Format | Price | Platform |
|--------|-------|----------|
| eBook | $4.99 | Amazon KDP |
| Template only | $2.99 | Gumroad |

---

## Distribution

- **Amazon KDP:** eBook with embedded Gumroad link
- **Gumroad:** Template package download

---

## Development Status

- [x] Manuscript complete (v1.1 Hardened)
- [x] Template complete (v1.1 Hardened)
- [x] Quick Start Guide complete (v1.1)
- [x] Sales copy complete
- [ ] KDP formatting (DOCX/PDF)
- [ ] Gumroad listing
- [ ] Amazon listing

---

## Related Products

| Product | Target | Price |
|---------|--------|-------|
| **AIXORD Full** | Claude Pro users | $9.99 |
| **AIXORD Chatbot** | Free chatbot users | $4.99 |
| **VA-AIXORD** | QA/Audit teams | $9.99 |

---

*AIXORD Chatbot Edition v1.1 (Hardened)*
*Authority. Execution. Confirmation.*
*Stop suggesting. Start commanding.*
