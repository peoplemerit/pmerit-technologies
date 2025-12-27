# [PROJECT NAME] MASTER SCOPE

**Version:** 1.0
**Created:** [DATE]
**Status:** ACTIVE
**Purpose:** Consolidated project vision — single source of truth for all sub-scopes

---

## 1. PROJECT IDENTITY

| Attribute | Value |
|-----------|-------|
| **Project Name** | [Name] |
| **Mission** | [One sentence mission] |
| **Target Users** | [Who uses this] |
| **Core Value** | [What makes it valuable] |

---

## 2. TECHNICAL STACK

| Layer | Technology |
|-------|------------|
| **Frontend** | [e.g., React, Vue, Vanilla JS] |
| **Backend** | [e.g., Node.js, Python, Cloudflare Workers] |
| **Database** | [e.g., PostgreSQL, MongoDB] |
| **Hosting** | [e.g., Vercel, AWS, Cloudflare] |
| **AI Services** | [e.g., OpenAI, Anthropic, Azure] |

---

## 3. ARCHITECTURE OVERVIEW

```
[Describe or diagram your architecture]

Example:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────►│   API       │────►│  Database   │
│   (Static)  │     │   (Workers) │     │  (Neon)     │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 4. CORE FEATURES

### Feature 1: [Name]
- **Status:** [Planning | In Progress | Complete]
- **Scope File:** `SCOPE_[NAME].md`
- **Description:** [Brief description]

### Feature 2: [Name]
- **Status:** [Planning | In Progress | Complete]
- **Scope File:** `SCOPE_[NAME].md`
- **Description:** [Brief description]

### Feature 3: [Name]
- **Status:** [Planning | In Progress | Complete]
- **Scope File:** `SCOPE_[NAME].md`
- **Description:** [Brief description]

---

## 5. LOCKED ARCHITECTURAL DECISIONS

These decisions are **FINAL**. Changes require explicit approval and documentation.

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| [e.g., Database] | [PostgreSQL] | [Reason] | [Date] |
| [e.g., Auth] | [JWT + Sessions] | [Reason] | [Date] |
| [e.g., Hosting] | [Cloudflare] | [Reason] | [Date] |

---

## 6. PROJECT PHASES

| Phase | Name | Status | Scope Files |
|-------|------|--------|-------------|
| 1 | [Phase name] | [Status] | SCOPE_X, SCOPE_Y |
| 2 | [Phase name] | [Status] | SCOPE_Z |
| 3 | [Phase name] | [Status] | SCOPE_A, SCOPE_B |

---

## 7. ENVIRONMENTS

| ID | Name | URL/Path | Purpose |
|----|------|----------|---------|
| FE | Frontend | [path] | UI, client code |
| BE | Backend | [path] | API, server logic |
| DB | Database | [connection] | Data storage |
| PROD | Production | [url] | Live site |
| DEV | Development | [url] | Testing |

---

## 8. KEY DOCUMENTS

| Document | Location | Purpose |
|----------|----------|---------|
| Project Roadmap | [path] | Strategic overview |
| User Journeys | [path] | User flows |
| API Documentation | [path] | Endpoint specs |
| Design System | [path] | UI standards |

---

## 9. DEPENDENCIES MAP

```
SCOPE_AUTH
    │
    ├──► SCOPE_DASHBOARD (requires auth)
    │
    └──► SCOPE_PROFILE (requires auth)

SCOPE_DASHBOARD
    │
    └──► SCOPE_ANALYTICS (requires dashboard data)
```

---

## 10. SUCCESS METRICS

| Metric | Target | Current |
|--------|--------|---------|
| [e.g., Page Load] | [< 2s] | [TBD] |
| [e.g., Test Coverage] | [> 80%] | [TBD] |
| [e.g., Uptime] | [99.9%] | [TBD] |

---

## 11. CHANGELOG

| Date | Change | By |
|------|--------|----|
| [Date] | Initial creation | [Name] |

---

*This MASTER_SCOPE is the single source of truth. All sub-scopes derive from this vision.*
