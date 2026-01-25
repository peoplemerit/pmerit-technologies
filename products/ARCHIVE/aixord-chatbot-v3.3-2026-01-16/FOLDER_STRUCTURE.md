# AIXORD Chatbot Product - Folder Structure

**Version:** 3.2.1 | **Updated:** January 2, 2026

---

## Authoritative Folders (Current)

| Folder | Purpose | Contents |
|--------|---------|----------|
| `distribution/staging/` | Source files for all 8 packages | Platform-specific governance, state, templates |
| `distribution/zips/` | Final ZIP packages for Gumroad | 8 ready-to-upload ZIP files |
| `manuscripts/` | Markdown manuscript files | 8 MANUSCRIPT_*.md files |
| `manuscripts/kdp/` | KDP-ready DOCX files | 8 converted DOCX files |

---

## Distribution Packages

### Staging Folders (Source of Truth)

```
distribution/staging/
├── aixord-gemini-pack/      <- Gemini platform pack
├── aixord-chatgpt-pack/     <- ChatGPT platform pack
├── aixord-claude-pack/      <- Claude platform pack
├── aixord-copilot-pack/     <- Copilot platform pack
├── aixord-starter/          <- Universal starter pack
├── aixord-genesis/          <- Idea-to-system pack
├── aixord-builder-bundle/   <- Multi-platform builder pack
└── aixord-complete/         <- Complete all-in-one pack
```

### ZIP Files (For Gumroad Upload)

```
distribution/zips/
├── aixord-gemini-pack.zip
├── aixord-chatgpt-pack.zip
├── aixord-claude-pack.zip
├── aixord-copilot-pack.zip
├── aixord-starter.zip
├── aixord-genesis.zip
├── aixord-builder-bundle.zip
└── aixord-complete.zip
```

---

## Manuscripts

### Source Files (Markdown)

```
manuscripts/
├── MANUSCRIPT_GEMINI.md
├── MANUSCRIPT_CHATGPT.md
├── MANUSCRIPT_CLAUDE.md
├── MANUSCRIPT_COPILOT.md
├── MANUSCRIPT_STARTER.md
├── MANUSCRIPT_GENESIS.md
├── MANUSCRIPT_BUILDER.md
└── MANUSCRIPT_COMPLETE.md
```

### KDP Output (DOCX)

```
manuscripts/kdp/
├── AIXORD_FOR_GEMINI_USERS.docx
├── AIXORD_FOR_CHATGPT_USERS.docx
├── AIXORD_FOR_CLAUDE_USERS.docx
├── AIXORD_FOR_COPILOT_USERS.docx
├── AIXORD_STARTER_GUIDE.docx
├── AIXORD_GENESIS.docx
├── AIXORD_BUILDERS_TOOLKIT.docx
└── AIXORD_THE_COMPLETE_FRAMEWORK.docx
```

---

## Archived Folders

| Folder | Status | Notes |
|--------|--------|-------|
| `archived-2026-01-02/` | Archived | Old standalone folders (governance, variants, etc.) |
| `distribution/archives/` | Historical | Previous package versions |
| `Human-Archived/` | User archived | Manually archived by user |

---

## Workflow

### To Update Packages

1. Edit files in `distribution/staging/<package-name>/`
2. Recreate ZIP: `Compress-Archive -Path "staging/<package>/*" -DestinationPath "zips/<package>.zip" -Force`
3. Upload to Gumroad

### To Update Manuscripts

1. Edit `manuscripts/MANUSCRIPT_<NAME>.md`
2. Convert to DOCX: `pandoc <input>.md -o kdp/<output>.docx`
3. Upload to KDP

---

## Naming Conventions

### Governance Files
- Full: `AIXORD_GOVERNANCE_<PLATFORM>_V3.2.1.md`
- Condensed: `AIXORD_GOVERNANCE_<PLATFORM>_<DESCRIPTOR>.md`
  - GPT (ChatGPT)
  - PROJECT (Claude)
  - GEM (Gemini)

### State Files
- `AIXORD_STATE_<PLATFORM>_V3.2.1.json`

### Platforms
- CHATGPT, CLAUDE, GEMINI, COPILOT, UNIVERSAL, GENESIS, MASTER

---

*Last updated: January 2, 2026*
