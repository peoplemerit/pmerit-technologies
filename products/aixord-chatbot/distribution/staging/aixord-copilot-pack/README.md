# AIXORD Copilot Pack

**Version:** 2.0
**License:** See LICENSE.md

---

## What's Included

- `AIXORD_COPILOT.md` — For GitHub/Microsoft Copilot
- `AIXORD_STATE_V2.json` — State tracking template
- `LICENSE.md` — Usage terms

---

## Copilot Variants Covered

### Microsoft Copilot (Web)
General-purpose AI assistant with Bing integration.

### Microsoft Copilot Pro ($20/mo)
Enhanced with Microsoft 365 integration:
- Create specs in Word
- Track decisions in Excel
- Share handoffs via Teams

### GitHub Copilot ($10-19/mo)
Code-focused IDE integration:
- VS Code, JetBrains, etc.
- Inline code suggestions
- Copilot Chat for discussion

---

## Quick Start (GitHub Copilot)

### Method 1: Project Instructions

Create `.github/copilot-instructions.md` in your repo:

```markdown
# AIXORD Commander Instructions

This project uses AIXORD governance.

## Current Mode: EXECUTION

[Paste current HANDOFF specifications here]

## Rules:
- Follow specifications exactly
- Do not add features not specified
- Ask if anything is ambiguous
```

### Method 2: Copilot Chat

In Copilot Chat (IDE):

```
AIXORD EXECUTION MODE. Implement auth module per spec:
- JWT tokens
- 24hr expiry
- Refresh token support

Start with token generation.
```

---

## Quick Start (Microsoft Copilot)

1. Open Copilot (web or Windows)
2. Paste the AIXORD governance block
3. Work with structured commands
4. Save handoffs for next session

---

## Commands

| Command | Effect |
|---------|--------|
| `ENTER DECISION MODE` | Open discussion |
| `ENTER EXECUTION MODE` | Freeze decisions, implement |
| `AUDIT` | Read-only review |
| `HALT` | Stop everything |
| `STATUS` | Report current state |
| `HANDOFF` | Generate session summary |

---

## Multi-Tool Workflow

AIXORD works across tools:

```
1. Claude Pro (DECISION) → Write specifications
2. Create HANDOFF document
3. GitHub Copilot (EXECUTION) → Implement in IDE
4. Claude Code (AUDIT) → Verify implementation
5. Return to Claude Pro → Next SCOPE
```

---

## Support

- **Book:** "AIXORD: The AI Execution Order" on Amazon
- **Website:** pmerit.com
- **Email:** info@pmerit.com

---

*© 2025 PMERIT LLC. All rights reserved.*
