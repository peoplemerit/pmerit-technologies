# AIXORD Governance — Product Development Repo

**Version:** 1.0
**Updated:** December 25, 2025
**Repo:** Pmerit_Product_Development

---

## Purpose

This document governs how AIXORD (AI Execution Order) methodology is applied to the Product Development repository.

---

## AIXORD Principles Applied

| Principle | Application |
|-----------|-------------|
| **Authority** | Clear product scopes define what to build |
| **Execution** | Gated workflow: Ideation → Design → Development → Launch |
| **Confirmation** | User confirms each phase before proceeding |

---

## Repo-Specific Commands

| Command | Action |
|---------|--------|
| `PRODUCT CONTINUE` | Resume from current state (read STATE.json first) |
| `NEW PRODUCT: [name]` | Start new product ideation |
| `SCOPE: [product]` | Load product scope |
| `LAUNCH: [product]` | Start Amazon KDP launch workflow |
| `BRAINSTORM` | Open brainstorming mode |
| `PRODUCT STATUS` | Show all products and phases |
| `DONE` | Confirm current step complete |

---

## Session Startup Protocol

When starting a session with `PRODUCT CONTINUE`:

1. **Read** `docs/aixord/AIXORD_STATE.json`
2. **Check** active product scope in `.claude/scopes/`
3. **Review** recent `Chat-Histories/Brainstorm/` if relevant
4. **Check** `products/` for in-progress work
5. **Output** status and next action
6. **Wait** for user direction

---

## Product Lifecycle Phases

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: IDEATION                                          │
│  • Brainstorm with user                                     │
│  • Document in Chat-Histories/                              │
│  • Create handoff document                                  │
│  GATE: User approves concept                                │
├─────────────────────────────────────────────────────────────┤
│  PHASE 2: DESIGN                                            │
│  • Create product scope file                                │
│  • Define structure, templates, deliverables                │
│  • Plan distribution pipeline                               │
│  GATE: User approves scope                                  │
├─────────────────────────────────────────────────────────────┤
│  PHASE 3: DEVELOPMENT                                       │
│  • Write manuscript                                         │
│  • Create templates                                         │
│  • Build distribution package (ZIP)                         │
│  GATE: User approves deliverables                           │
├─────────────────────────────────────────────────────────────┤
│  PHASE 4: LAUNCH                                            │
│  • Setup Gumroad product                                    │
│  • Create Amazon KDP listing                                │
│  • Upload and publish                                       │
│  GATE: User confirms live listing                           │
├─────────────────────────────────────────────────────────────┤
│  PHASE 5: ITERATE                                           │
│  • Gather feedback                                          │
│  • Update product                                           │
│  • Push updates to distribution                             │
│  GATE: User approves iteration                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Decision States

For product decisions, use:

| State | Meaning | Action |
|-------|---------|--------|
| **ACTIVE** | Currently in use | Keep in scope |
| **NO-GO** | Rejected, won't revisit | Delete from scope |
| **EXPERIMENTAL** | Testing, may pivot | Archive if replaced |

---

## File Organization

```
Pmerit_Product_Development/
├── .claude/
│   ├── CLAUDE.md              ← Product dev instructions
│   └── scopes/                ← Product scope files
├── products/                  ← Product folders
├── Chat-Histories/            ← Brainstorm sessions
├── docs/
│   ├── aixord/                ← Governance (this folder)
│   ├── methodology/           ← Frameworks (AIXORD, Tiered Consent)
│   └── reference/             ← Reference materials
└── templates/                 ← Shared templates
```

---

## Guardrails

### Do
- Follow product lifecycle phases in order
- Document decisions in scope files
- Wait for user confirmation at gates
- Update STATE.json after each session

### Don't
- Skip phases without user approval
- Launch without completing all deliverables
- Modify published products without explicit request
- Mix product work with platform work

---

## Repo Separation

| This Repo | Platform Repo |
|-----------|---------------|
| Manuscripts | Source code |
| Templates (for sale) | Platform templates |
| Distribution packages | API workers |
| Brainstorms | Governance docs |
| Product scopes | Feature scopes |

---

*AIXORD Governance for Product Development v1.0*
