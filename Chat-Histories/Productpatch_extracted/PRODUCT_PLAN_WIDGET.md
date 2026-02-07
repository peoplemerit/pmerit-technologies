# AIXORD WIDGET — Product Plan

**Document ID:** PRODUCT_PLAN_WIDGET
**Status:** APPROVED FOR ROADMAP
**Date:** January 8, 2026
**Priority:** Future Development (After v3.3.1 Ships)

---

## Executive Summary

**AIXORD Widget** is a desktop application that sits between users and AI providers, automatically injecting AIXORD governance into every interaction and persisting all conversations locally.

**Value Proposition**: Users open AI through the Widget → Governance always active → State always saved → User controls all data.

---

## Problem Solved

| Without Widget | With Widget |
|----------------|-------------|
| Paste governance manually | Automatic injection |
| Remember to save HANDOFFs | Auto-saved locally |
| Lose context across sessions | Persistent memory |
| Locked to one AI provider | Multi-provider support |
| AI company stores data | User controls storage |

---

## Product Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AIXORD WIDGET                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐     │
│  │   Chat UI    │   │  Governance  │   │   Storage    │     │
│  │              │   │   Engine     │   │   Manager    │     │
│  └──────────────┘   └──────────────┘   └──────────────┘     │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   API Router                         │    │
│  │  DeepSeek | OpenAI | Anthropic | Gemini | Local LLM │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              USER-CONTROLLED LOCAL STORAGE                   │
│  Hard Drive | External Drive | Flash Drive | NAS | Cloud    │
└─────────────────────────────────────────────────────────────┘
```

---

## Product Tiers

| Feature | Basic ($49) | Pro ($99) | Enterprise ($299) |
|---------|-------------|-----------|-------------------|
| Chat interface | ✅ | ✅ | ✅ |
| Governance injection | ✅ | ✅ | ✅ |
| Local storage | ✅ | ✅ | ✅ |
| Choose storage location | ✅ | ✅ | ✅ |
| One AI provider | ✅ | — | — |
| Multiple AI providers | — | ✅ | ✅ |
| Local encryption | — | ✅ | ✅ |
| RAG search (past convos) | — | ✅ | ✅ |
| Decision Ledger export | — | ✅ | ✅ |
| Team shared storage | — | — | ✅ |
| Compliance audit logs | — | — | ✅ |
| SSO integration | — | — | ✅ |

---

## Technical Stack (Recommended)

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Electron or Tauri | Cross-platform desktop |
| Database | SQLite | Local, portable, reliable |
| Search | SQLite FTS5 or local embeddings | Fast full-text search |
| Encryption | AES-256-GCM | Industry standard |
| RAG (Pro) | sentence-transformers + FAISS | Local semantic search |

---

## Development Phases

| Phase | Timeline | Deliverables |
|-------|----------|--------------|
| **Phase 1: MVP** | 8-12 weeks | Electron app, local storage, DeepSeek API, governance injection |
| **Phase 2: Multi-Provider** | 4-6 weeks | OpenAI, Anthropic, Gemini support |
| **Phase 3: Pro Features** | 6-8 weeks | Encryption, RAG search, decision export |
| **Phase 4: Enterprise** | 8-12 weeks | Team features, audit logs, SSO |

---

## Business Model

| Revenue Stream | Model |
|----------------|-------|
| Widget sales | One-time purchase ($49-$299) |
| Template bundles | Current variants as starter templates |
| Support packages | Annual support (Enterprise) |
| Training | Optional onboarding |

---

## Legal Advantage

**One-time software sale** = Minimal legal burden

| SaaS Model | Widget Model |
|------------|--------------|
| GDPR compliance | Not applicable (user's local data) |
| Data processing agreements | Not needed |
| Breach notification | Not your data |
| Cross-border transfers | User controls location |

---

## Market Positioning

| Competitor | Their Model | Widget Advantage |
|------------|-------------|------------------|
| ChatGPT Plus | $20/mo subscription | One-time purchase |
| Claude Pro | $20/mo subscription | Multi-provider |
| Custom GPTs | Platform-locked | Works with any AI |
| Enterprise AI | Complex contracts | Download and use |

---

## Success Metrics

| Metric | Target (Year 1) |
|--------|-----------------|
| Units sold | 1,000+ |
| Revenue | $50,000+ |
| Customer satisfaction | 4.5+ stars |
| Support tickets | <5% of customers |

---

## Dependencies

| Dependency | Status |
|------------|--------|
| AIXORD v3.3.1 governance | In progress |
| Self-contained HANDOFF format | In progress |
| API integrations research | Not started |
| UI/UX design | Not started |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI API changes | Breaking changes | Abstraction layer, version pinning |
| Competition | Market share | First-mover, unique governance |
| Support burden | Costs | Good docs, community forum |
| Platform updates | Electron/Tauri issues | Regular updates, testing |

---

## Next Steps

1. ✅ Approve Widget for roadmap (DONE)
2. ⏳ Complete v3.3.1 self-contained HANDOFFs
3. ⏳ Publish 10 variants to Gumroad/KDP
4. 🔜 Begin Widget Phase 1 development
5. 🔜 Create Widget landing page
6. 🔜 Beta testing with AIXORD customers

---

## Appendix: User Flow

```
1. User downloads Widget
2. User enters AI API key (their own)
3. User chooses storage location
4. User creates new project
5. Widget injects governance into every API call
6. Widget saves all conversations locally
7. User can search past conversations
8. User can export decision ledger
9. User can switch AI providers
10. User data never leaves their machine
```

---

*AIXORD Widget — Your AI, Your Rules, Your Files*
*Approved for Future Roadmap: January 8, 2026*
