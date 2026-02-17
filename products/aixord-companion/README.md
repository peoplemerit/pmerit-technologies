# AIXORD Companion

Free Chrome Side Panel Extension for AI Governance Workflows.

## Features

- **Project Setup**: Define and track your project context
- **Phase Selector**: Navigate through BRAINSTORM, PLAN, EXECUTE, REVIEW phases
- **Gate Tracker**: Visual progress through the 17-gate AIXORD v4.3 system
- **D4-CHAT Cloud Sync**: Authenticate and sync projects, state, and decisions with the D4-CHAT platform
- **Prompt Templates**: Quick prompts and custom templates per phase
- **Session Notes**: Capture decisions and context for continuity
- **HANDOFF Generator**: Generate markdown handoffs for session continuity

## Installation

### Development

1. Install dependencies:
   ```bash
   cd pmerit-technologies/products/aixord-companion
   npm install
   ```

2. Build the extension:
   ```bash
   npm run build
   ```

3. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

### Watch Mode

For development with auto-rebuild:
```bash
npm run watch
```

## Tech Stack

- React 19
- TypeScript 5.9
- esbuild
- Chrome Extension Manifest V3
- Chrome Side Panel API
- Chrome Storage API

## Project Structure

```
aixord-companion/
├── src/
│   ├── background/          # Service worker
│   ├── lib/                 # D4-CHAT API client
│   ├── sidepanel/          # React side panel app
│   │   ├── components/     # UI components (8 modules)
│   │   ├── hooks/          # React hooks (useStorage, useD4ChatSync)
│   │   ├── App.tsx         # Main app
│   │   └── styles.ts       # Theme styles
│   └── types/              # TypeScript types
├── icons/                   # Extension icons (16/32/48/128px)
├── manifest.json           # Chrome manifest
├── sidepanel.html          # Side panel HTML
└── build.mjs               # Build script
```

## AIXORD v4.3 Gate System (17 gates)

### Setup Gates (10)

| Gate | Name | Description |
|------|------|-------------|
| **LIC** | License | Director has accepted governance terms |
| **DIS** | Disclosure | AI limitations and risks acknowledged |
| **TIR** | Tier | Subscription tier selected and validated |
| **ENV** | Environment | Working environment configured |
| **FLD** | Folder | Project folder/workspace established |
| **CIT** | Citation | Citation and source requirements defined |
| **CON** | Constraints | Project constraints and boundaries documented |
| **OBJ** | Objective | Project objective clearly defined |
| **RA** | Reality | Reality classification completed (GREENFIELD/BROWNFIELD) |
| **DC** | Data Class. | Data sensitivity classification completed |

### Work Gates (7)

| Gate | Name | Description |
|------|------|-------------|
| **FX** | Fix | Issue or requirement identified for resolution |
| **PD** | Project Doc | Project document artifact created |
| **PR** | Progress | Meaningful progress checkpoint reached |
| **BP** | Blueprint | Technical blueprint artifact locked |
| **MS** | Master Scope | Master scope artifact approved |
| **VA** | Validation | Output validated against requirements |
| **HO** | Handoff | Handoff artifact created for transition |

## Phase Requirements

- **BRAINSTORM**: All 10 Setup Gates (LIC → DC)
- **PLAN**: Setup Gates + FX, PD, PR
- **EXECUTE**: Setup Gates + FX, PD, PR, BP, MS
- **REVIEW**: All 17 Gates

## D4-CHAT Integration

The extension syncs with the D4-CHAT platform backend:

- **Authentication**: Email/password login with Bearer token
- **Project sync**: Create, list, and update projects
- **State sync**: Push/pull phase and gate state
- **Decision logging**: Record governance decisions

**API Base**: `https://aixord-router-worker.peoplemerit.workers.dev/api/v1`

## License

Copyright (c) 2026 PMERIT TECHNOLOGIES LLC. All rights reserved.

---

*Part of the AIXORD Platform by [PMERIT](https://pmerit.com)*
