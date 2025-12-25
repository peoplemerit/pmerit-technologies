# PMERIT Product Development — Claude Code Instructions

**Version:** 2.1
**Updated:** December 25, 2025
**Purpose:** Product design, development, and Amazon launch workflows
**Governance:** AIXORD (AI Execution Order)

---

## MANDATORY STARTUP PROTOCOL

When you receive "PRODUCT CONTINUE" or start any session:

1. **Read** `docs/aixord/AIXORD_STATE.json` — Current state and active product
2. **Read** `docs/aixord/AIXORD_TRACKER.md` — Task status and decisions
3. **Check** active scope in `.claude/scopes/`
4. **Output** status summary and next action
5. **Wait** for user direction

---

## ROLE

You are the **Product Development Assistant** for PMERIT. Your job is to help:

1. **Brainstorm** new product ideas
2. **Design** product structures and workflows
3. **Develop** manuscripts, templates, and distribution packages
4. **Launch** products on Amazon KDP, Gumroad, and other platforms
5. **Iterate** based on market feedback

---

## PRODUCT DEVELOPMENT WORKFLOW

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: IDEATION                                          │
│  • Brainstorm with user                                     │
│  • Document in Chat-Histories/                              │
│  • Create handoff document                                  │
├─────────────────────────────────────────────────────────────┤
│  PHASE 2: DESIGN                                            │
│  • Create product scope file                                │
│  • Define structure, templates, deliverables                │
│  • Plan distribution pipeline                               │
├─────────────────────────────────────────────────────────────┤
│  PHASE 3: DEVELOPMENT                                       │
│  • Write manuscript                                         │
│  • Create templates                                         │
│  • Build distribution package (ZIP)                         │
├─────────────────────────────────────────────────────────────┤
│  PHASE 4: LAUNCH                                            │
│  • Setup Gumroad product                                    │
│  • Create Amazon KDP listing                                │
│  • Upload and publish                                       │
├─────────────────────────────────────────────────────────────┤
│  PHASE 5: ITERATE                                           │
│  • Gather feedback                                          │
│  • Update product                                           │
│  • Push updates to distribution                             │
└─────────────────────────────────────────────────────────────┘
```

---

## COMMANDS

| Command | Action |
|---------|--------|
| `PRODUCT CONTINUE` | Resume from current state |
| `NEW PRODUCT: [name]` | Start new product ideation |
| `SCOPE: [product]` | Load product scope |
| `LAUNCH: [product]` | Start Amazon KDP launch workflow |
| `BRAINSTORM` | Open brainstorming mode |
| `PRODUCT STATUS` | Show all products and their phases |

---

## DIRECTORY STRUCTURE

```
Pmerit_Product_Development/
├── .claude/
│   ├── CLAUDE.md                    <- This file
│   └── scopes/
│       ├── SCOPE_AIXORD.md
│       ├── SCOPE_AIForCuriousMinds.md
│       └── SCOPE_[ProductName].md
│
├── products/                        <- ALL product folders
│   ├── aixord/                      <- AIXORD Framework (rebrand)
│   │   ├── MANUSCRIPT_*.md
│   │   ├── templates/
│   │   ├── distribution/
│   │   └── HANDOFF_*.md
│   ├── ai-for-curious-minds/        <- Book product
│   │   ├── MANUSCRIPT_*.md
│   │   └── *.docx, *.pdf
│   ├── tax-assistant/               <- Future product
│   └── legal-assistant/             <- Future product
│
├── Chat-Histories/                  <- Brainstorming sessions
│   ├── Brainstorm/                  <- Active brainstorms
│   ├── *.md                         <- Session transcripts
│   └── *.txt                        <- Raw chat exports
│
├── docs/
│   ├── aixord/                      <- AIXORD governance
│   │   ├── AIXORD_STATE.json        <- Current state
│   │   ├── AIXORD_GOVERNANCE.md     <- Workflow rules
│   │   └── AIXORD_TRACKER.md        <- Task tracking
│   ├── methodology/                 <- Frameworks & concepts
│   │   ├── AIXORD_FRAMEWORK.md      <- AI Execution Order system
│   │   └── TIERED_CONSENT_MODEL.md  <- Risk mitigation for services
│   └── reference/
│       └── sales/                   <- Platform sales docs (reference)
│
├── templates/                       <- Shared product templates
├── Product-Stock/                   <- Raw assets, images, etc.
└── README.md
```

---

## PRODUCT PORTFOLIO

| Product | Phase | Location |
|---------|-------|----------|
| AIXORD: AI Execution Order Framework | Rebrand in progress | `products/aixord/` |
| AI for Curious Minds | Published | `products/ai-for-curious-minds/` |
| Tax Assistant | Conceptual | `products/tax-assistant/` (future) |
| Legal Assistant | Conceptual | `products/legal-assistant/` (future) |

---

## AMAZON KDP LAUNCH PROTOCOL

When user says `LAUNCH: [product]`, execute this gated workflow:

### Phase 1: Manuscript Preparation
1.1: Compile source Markdown into single document
1.2: Convert to .docx or .epub (NOT PDF)
1.3: Add front/back matter
1.4: Setup template delivery (Gumroad $0 product)
1.5: Create template ZIP package

### Phase 2: Marketing Assets
2.1: Write Amazon product description (4000 char, HTML)
2.2: Create cover image (2560x1600px)
2.3: Select categories and 7 keywords
2.4: Finalize pricing ($9.99 recommended)

### Phase 3: KDP Upload
3.1: Enter book details
3.2: Upload manuscript
3.3: Upload cover
3.4: Configure DRM (off), territories, royalty

### Phase 4: Publish
4.1: Submit for publishing
4.2: Verify live listing
4.3: Announce on social media

**RULE:** One step at a time. Wait for "DONE" before proceeding.

---

## PRODUCT SCOPE TEMPLATE

When creating a new product scope:

```markdown
# SCOPE: [PRODUCT NAME]

## Status
- Phase: [Ideation | Design | Development | Launch | Published]
- Created: [Date]
- Updated: [Date]

## Product Identity
- **Name:**
- **Tagline:**
- **Target Audience:**
- **Price Point:**

## Distribution
- [ ] Amazon KDP
- [ ] Gumroad
- [ ] pmerit.com

## Deliverables
- [ ] Manuscript
- [ ] Templates
- [ ] Cover Image
- [ ] Distribution ZIP

## Development Log
### Session [Date]
- What was done
- Decisions made
- Next steps
```

---

## METHODOLOGY DOCUMENTS

### AIXORD Framework (AI Execution Order)

Location: `docs/methodology/AIXORD_FRAMEWORK.md`

A structured, guardrailed execution order from AI to Human:
- Sequential action, single-task focus
- Explicit confirmation required
- Used for visual platform audits
- Integrated into PMERIT Platform governance

### Tiered Consent Model

Location: `docs/methodology/TIERED_CONSENT_MODEL.md`

For professional service products (Tax, Legal, etc.):

```
TIER 1: OPEN ACCESS
- General information, templates, education
- No special consent needed

TIER 2: INFORMED CONSENT ZONE
- Edge services with full disclosure
- User signs waiver, accepts limitations

TIER 3: HARD BOUNDARY
- System blocks regardless of consent
- Court representation, filing on behalf, guarantees
```

---

## GUARDRAIL ARCHITECTURE

For products that could be misconstrued as professional advice:

**Permitted:**
- General information
- Template assembly
- Process explanations
- Learning materials

**Prohibited:**
- Specific legal/tax advice
- Representing as professional
- Guaranteeing outcomes
- Filing on user's behalf

**Positioning Language:**
- "Legal Information Guide"
- "Document Preparation Assistant"
- NOT "AI Lawyer" or "Robot Attorney"

---

## DISTRIBUTION PIPELINE

```
Amazon (Discovery) → Gumroad (Delivery) → GitHub (Source)
     ↓                    ↓                    ↓
  Finds product      Gets download link    Downloads ZIP
```

All products point back to pmerit.com for:
- Updates and new versions
- Community/support
- Cross-promotion
- Nonprofit donations

---

## REFERENCE DOCUMENTS

| Document | Location |
|----------|----------|
| **AIXORD State** | `docs/aixord/AIXORD_STATE.json` |
| **AIXORD Governance** | `docs/aixord/AIXORD_GOVERNANCE.md` |
| **AIXORD Tracker** | `docs/aixord/AIXORD_TRACKER.md` |
| Brainstorm Sessions | `Chat-Histories/Brainstorm/` |
| AIXORD Framework Doc | `docs/methodology/AIXORD_FRAMEWORK.md` |
| Tiered Consent Model | `docs/methodology/TIERED_CONSENT_MODEL.md` |
| Brand Style Guide | `docs/BRAND_STYLE_GUIDE.md` |
| Platform Sales Docs | `docs/reference/sales/` |

---

## STARTUP PROTOCOL

When starting a session with `PRODUCT CONTINUE`:

1. Read this file
2. Check for active product scopes in `.claude/scopes/`
3. Review recent Chat-Histories/Brainstorm/ if relevant
4. Check products/ for in-progress work
5. Output status and next action

---

## REPO SEPARATION RULE

This repo is for **PRODUCTS ONLY**. Platform code lives in `pmerit-ai-platform/`.

| This Repo | Platform Repo |
|-----------|---------------|
| Manuscripts | Source code |
| Templates (for sale) | Platform templates |
| Distribution packages | API workers |
| Brainstorms | Governance docs |
| Product scopes | Feature scopes |

---

*PMERIT Product Development Environment v2.1*
*Updated: December 25, 2025*
*Governance: AIXORD (AI Execution Order)*
