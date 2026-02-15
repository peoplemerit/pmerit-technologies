# D4-CHAT: Deployment & Recovery

**Module:** Recovery commands, deployment procedures (§17)
**Parent Manifest:** `docs/D4-CHAT_PROJECT_PLAN.md`
**Growth Class:** SEMI-STATIC
**Last Updated:** 2026-02-15 (Session 53)

---

## 17. RECOVERY COMMANDS

### 17.1 Resume D4-CHAT Work

```
TECH CONTINUE
Project: D4-CHAT
Status: Backend 100%, Frontend ~100% (all API methods wired to UI)
Governance: AIXORD v4.5.6 (Fifth Audit Triage)
Phase Enforcement: Tier 1 ACTIVE (hard gate blocking + Finalize Phase + brainstorm validation + work order injection + continuity conflict detection)
APIs Working: Auth (9), Projects (5), State (5), Decisions (2), Messages (4), Sessions (7), Router (4), GitHub (5), Evidence (3), Images (5), Security (8), CCS (11), Layers (5), Engineering (35), Knowledge (7), Usage (3), Blueprint (12), Workspace (4), Brainstorm (4), Assignments (20), Continuity (7), Agents (14)
Completed: All prior handoffs + HANDOFF-CGC-01 + HANDOFF-COPILOT-AUDIT-01 + Second Audit Remediation + Third Audit Triage + Fourth Audit Triage (COPILOT-AUDIT-04) + Fifth Audit Triage (COPILOT-AUDIT-05)
Remaining: HANDOFF-VD-CI-01 Sessions 4+ (B1-B6), Tier 2 (extended phases), Tier 3 (artifact contracts), Path B Phase 3 (telemetry), E2E billing test, data population, 2FA (deferred to pre-launch)
Last Session: Session 53 (Fifth Audit Triage — ResetPassword.tsx fix, App.css deletion, 63 deliverables)
```

### 17.2 AIXORD Continue Format

Per AIXORD v4.5-C:

```
PMERIT CONTINUE | Session:[N] | Seq:[SSC:SEQ] | Prev:[SSC:PREV]
Project: D4-CHAT
Phase: EXECUTE
Reality: GREENFIELD
Formula: Bound to D4-CHAT Master Scope
Gates: LIC=1, DIS=1, TIR=1, ENV=1, OBJ=1, RA=1
Security: GS:DC=1, GS:DP=1, GS:AC=1, GS:AI=1, GS:JR=1, GS:RT=1, GS:SA=1
```

### 17.3 Deployment Commands

```bash
# Backend
cd C:\dev\pmerit\pmerit-technologies\products\aixord-router-worker
npx wrangler deploy

# Frontend
cd C:\dev\pmerit\pmerit-technologies\products\aixord-webapp-ui
npm run build
npx wrangler pages deploy dist --project-name=aixord-webapp-ui
```

---

