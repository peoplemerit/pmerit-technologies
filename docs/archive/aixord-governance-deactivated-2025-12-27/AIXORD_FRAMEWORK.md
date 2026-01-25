# AIXORD Framework (AI Execution Order)

**Version:** 1.0
**Created:** December 2025
**Origin:** PMERIT Brainstorm Session

---

## Definition

**AIXORD (AI Execution Order):** A structured, guardrailed execution order issued by an AI system to a human operator, requiring sequential action, single-task focus, and explicit confirmation before proceeding.

---

## Core Principles

| Principle | Description |
|-----------|-------------|
| **Authority** | Order, not suggestion |
| **Directionality** | AI to Human |
| **Execution Discipline** | Confirm, then continue |
| **State Awareness** | Tracks progress across sessions |
| **Single Action** | One task at a time |

---

## How AIXORD Differs from a Prompt

| Prompt | AIXORD |
|--------|--------|
| Suggestive | Directive |
| Stateless | State-aware |
| Multi-output | Single-action |
| Informational | Executable |
| AI-centered | Human-executed |

---

## Canonical AIXORD Structure

```markdown
## AIXORD HEADER
- AIXORD ID:
- Mission Name:
- Operator:
- System / Platform:
- Environment:
- Compliance Lens (if any):

## SITUATION
Current system state (what exists, what must not change)

## MISSION
One clear objective (end condition, not steps)

## EXECUTION RULES (GUARDRAILS)
1. Sequential only
2. One action at a time
3. Explicit confirmation required
4. No look-ahead or summarization

## PHASE / STEP
STEP #: <Action Title>

Action:
What the operator must do

Expected Outcome:
What success looks like

Evidence Required:
Screenshot / log / confirmation

WAIT FOR CONFIRMATION

## GAP LOG (LIVE)
| GAP ID | Step | Category | Description | Severity |
```

---

## AIXORD Variants

| Variant | Use Case |
|---------|----------|
| **VA-AIXORD** | Visual Audit (platform walkthroughs) |
| **SEC-AIXORD** | Security reviews |
| **K12-AIXORD** | COPPA/FERPA compliance audits |
| **MIG-AIXORD** | Data migrations |
| **COMP-AIXORD** | Compliance validation |

---

## Visual Audit Application (VA-AIXORD)

Originally developed for PMERIT K-12 registration walkthrough:

### Audit Envelope
```
Platform: ______________________
Audit Type: Visual End-to-End Audit
Scenario Name: __________________
Persona: ________________________
Goal: ___________________________
Compliance Lens: COPPA / FERPA / SOC2 / PCI / HIPAA / None
Environment: Prod / Staging / Dev
```

### Step Template
```
STEP #: [Plain English Action]

Action:
What the user does (one action only)

Expected Outcome:
What the system SHOULD do

Evidence Required:
Screenshot(s) or screen recording

Observed Outcome:
What actually happened

Gaps Identified:
- GAP-ID
- Category
- Description
- Severity
```

### Gap Classification

**Categories:**
- UI / UX
- Security
- Compliance (COPPA, FERPA, etc.)
- Data Integrity
- Role / Persona Mismatch
- Flow / Logic
- Accessibility
- Performance
- Content Appropriateness

**Severity Scale:**
| Severity | Meaning |
|----------|---------|
| Critical | Legal risk, child safety, data exposure, system misuse |
| High | Core flow broken or misleading |
| Medium | Confusion, friction, trust erosion |
| Low | Polish / cosmetic |

---

## Why AIXORD Works

Traditional QA asks: *"Does the feature work?"*

AIXORD asks: *"Can a real human safely, correctly, and lawfully complete a real goal without being misled?"*

This is a **product truth audit**, not QA.

---

## Product Potential

AIXORD can be packaged as:

1. **Template/Playbook** - Reusable audit framework
2. **AI Agent Prompt** - AI that operates only via AIXORD rules
3. **Training Course** - Teaching the methodology
4. **Platform Feature** - Built into PMERIT for self-auditing

---

## Integration with PMERIT Platform

AIXORD has been adopted as the governance system for PMERIT platform development (replacing AADOS v11):

- `docs/aixord/AIXORD_STATE.json` - State tracking
- `docs/aixord/AIXORD_GOVERNANCE.md` - Workflow rules
- `docs/aixord/AIXORD_TRACKER.md` - Task tracking

---

## References

- Origin: Chat_brainstorm_products.txt (ChatGPT session)
- Related: AIXORD_IDEA.MD (Brainstorm folder)
- Platform Implementation: pmerit-ai-platform/docs/aixord/

---

*AIXORD v1.0 - AI Execution Order Framework*
