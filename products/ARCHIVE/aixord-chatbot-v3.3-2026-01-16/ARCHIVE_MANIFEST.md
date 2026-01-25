# ARCHIVE MANIFEST — AIXORD Chatbot v3.3

**Archived:** 2026-01-16
**Reason:** Repository restructuring to align with PMERIT organizational structure
**Archived By:** Claude Code (Commander)
**Authorized By:** Director

---

## ARCHIVE CONTENTS

### Summary Statistics

| Category | Count |
|----------|-------|
| Total Files | 355 |
| Distribution Bundles | 11 |
| ZIP Packages | 23 (12 active + 11 archived) |
| Manuscripts | 67 files |
| Governance Documents | 20+ |
| Platforms Covered | 10 |

### Distribution Bundles (staging/)

| Bundle | Description | Version |
|--------|-------------|---------|
| aixord-builder-bundle | Platform-agnostic builder framework | v3.3 |
| aixord-chatgpt-pack | ChatGPT variants (Free, Plus, Pro) | v3.3 |
| aixord-claude-pack | Claude variants (Free, Pro, Dual) | v3.3 |
| aixord-gemini-pack | Gemini variants (Free, Advanced) | v3.3 |
| aixord-copilot-pack | Microsoft Copilot variant | v3.3 |
| aixord-deepseek-pack | DeepSeek variant | v3.3 |
| aixord-enterprise | Enterprise with integrations | v3.3 |
| aixord-genesis | Foundational variant | v3.3 |
| aixord-starter | Entry-level free tiers | v3.3 |
| aixord-universal-pack | Platform-agnostic | v3.2.1 |
| aixord-complete | Complete framework | v3.3 |

### Manuscripts

| Type | Count | Location |
|------|-------|----------|
| Current (V3.3) | 18 | manuscripts/kdp/, md-sources/ |
| Archive (V1) | 16 | manuscripts/archive/ |
| KDP Legacy | 13 | manuscripts/kdp/ARCHIVE/ |

### Key Documentation

- `CHANGELOG.md` - Version history
- `FOLDER_STRUCTURE.md` - Directory layout
- `VARIANT_QA_PROTOCOL.md` - QA procedures
- `HANDOFF_*.md` - Session handoff documents
- `MASTER_FIX_MANIFEST_V3.1.md` - Pending updates manifest

---

## RESTORATION INSTRUCTIONS

To restore this archive:

```powershell
# Move back to products folder
Move-Item -Path 'C:\dev\pmerit\Pmerit_Product_Development\products\ARCHIVE\aixord-chatbot-v3.3-2026-01-16' -Destination 'C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot'
```

---

## VERSION HISTORY

| Version | Status | Notes |
|---------|--------|-------|
| v3.3 | Current | Latest governance version |
| v3.2.1 | Deprecated | Universal pack only |
| v3.2 | Deprecated | In ACHIVES/variants/working/ |
| v3.1 | Deprecated | In INTERSESSION_CHAT_ACCESS/ |
| v1 | Archived | In manuscripts/archive/ |

---

## NOTES

- This archive contains ALL AIXORD chatbot product variants
- The MASTER_FIX_MANIFEST_V3.1.md was pending execution at archive time
- Gumroad products may still reference these files
- Consider updating Gumroad listings if products are discontinued

---

*Archived as part of PMERIT Product Repository restructuring initiative.*
*AIXORD v2.1 — Authority. Execution. Confirmation.*
