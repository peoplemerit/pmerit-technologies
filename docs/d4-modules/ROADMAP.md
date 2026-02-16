# D4-CHAT: Roadmap & Next Steps

**Module:** Immediate, short-term, and medium-term priorities (§16.1-16.3)
**Parent Manifest:** `docs/D4-CHAT_PROJECT_PLAN.md`
**Growth Class:** CAPPED (active priorities only; completed items move to IMPLEMENTATION-LOG.md)
**Last Updated:** 2026-02-16 (Session 10)

---

## 16. ROADMAP & NEXT STEPS

### 16.1 Immediate (This Week)

| Priority | Task | AIXORD Alignment | Status |
|----------|------|------------------|--------|
| ~~P0~~ | ~~API Key Masking (HANDOFF-SECURITY-CRITICAL-01)~~ | Production security | ✅ DEPLOYED (Session 56) |
| ~~P0~~ | ~~Emergency Password Reset~~ | Credential security | ✅ DONE (Session 58) |
| ~~P0~~ | ~~Credential Rotation (4 AI + 2 Stripe)~~ | Credential security | ✅ DONE (Session 58) |
| ~~P0~~ | ~~Git History Purge (pmerit-ai-platform)~~ | Credential security | ✅ DONE (Session 58) |
| ~~P0~~ | ~~Password Change Feature (full-stack)~~ | Security gap closure | ✅ DEPLOYED (Session 58) |
| ~~P1~~ | ~~Verify forgot-password email delivery~~ | Auth completion | ✅ VERIFIED (Session 10) — Resend delivering, token used within 1 min |
| ~~P1~~ | ~~Test billing flow E2E~~ | Revenue enablement | ✅ VERIFIED (Session 10) — All endpoints auth-enforced, webhook sig validated, trial expiry enforced |
| ~~P2~~ | ~~Remove legacy key naming~~ | Code cleanup | ✅ DONE (Session 9) — Consolidated to PLATFORM_* only, 4 legacy secrets deleted |

### 16.2 Short-term (Next 2 Weeks)

| Priority | Task | AIXORD Alignment | Status |
|----------|------|------------------|--------|
| ~~P1~~ | ~~Implement GS:DC Data Classification Gate~~ | L-SPG5 | ✅ UI Complete |
| ~~P1~~ | ~~Integrate D3 SDK into webapp~~ | Formula binding (L-FX) | ✅ **COMPLETE (Session 13)** |
| ~~P1~~ | ~~AI Exposure controls enforcement~~ | L-SPG3, L-SPG6 | ✅ **BACKEND COMPLETE (Session 13)** |
| ~~P2~~ | ~~Content redaction for CONFIDENTIAL~~ | L-SPG3 | ✅ **COMPLETE (Session 19 — BF-5)** |
| ~~P2~~ | ~~Definition of Done per deliverable~~ | L-GCP3 | ✅ **COMPLETE (Session 19 — PC-5, GA:DOD gate)** |
| P2 | GT2UTM Production Readiness Testing | Certification | ⚠️ 2.5/7 criteria pass (Session 10 audit) — see §16.4 |

### 16.3 Medium-term (Next Month)

| Priority | Task | AIXORD Alignment | Status |
|----------|------|------------------|--------|
| P2 | Full SPG-01 Security Gates enforcement | L-SPG1-10 | ⏳ UI done, enforcement pending |
| P2 | Manuscript redemption E2E | Business value | ⏳ Endpoints ready |
| ~~P3~~ | ~~Remove PLATFORM_*/legacy key dual naming~~ | Code hygiene | ✅ DONE (Session 9) |
| ~~P3~~ | ~~GKDL-01 Knowledge artifacts~~ | L-GKDL1-7 | ✅ DONE (Session 10) |
| ~~P3~~ | ~~D5 Companion integration~~ | Product ecosystem | ✅ DONE (Session 10) |

### 16.4 GT2UTM Readiness Audit (Session 10)

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | AI output triggers artifact commit automatically | FAIL | API exists (`POST /artifacts/commit`), no auto-trigger after AI response |
| 2 | Hash + path evidence visible | PASS | SHA256 hashing in artifacts.ts, EvidenceRibbon component displays |
| 3 | EAR-01 passes | FAIL | EnvironmentAwarenessReport.tsx exists, no backend endpoint |
| 4 | Scaffold count correct | PASS | scaffold_item_count tracked in workspace_bindings, displayed in wizard |
| 5 | Session reopening stable | FAIL | SessionList UI works, no `?session=<id>` URL parameter support |
| 6 | Phase transitions blocked without artifact evidence | PARTIAL | Phase contracts enforce L-BRN/L-PLN, no artifact commit evidence check |
| 7 | GT2UTM table in project plan | FAIL | Not documented |

**Overall: 2.5/7 (36%)** — Infrastructure exists but integration layer missing.

