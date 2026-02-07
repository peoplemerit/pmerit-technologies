# AIXORD Companion

Free Chrome Side Panel Extension for AI Governance Workflows.

## Features

- **Project Setup**: Define and track your project context
- **Phase Selector**: Navigate through BRAINSTORM, PLAN, EXECUTE, REVIEW phases
- **Gate Tracker**: Visual progress through the 10-gate AIXORD system
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
│   ├── sidepanel/          # React side panel app
│   │   ├── components/     # UI components
│   │   ├── hooks/          # React hooks
│   │   ├── App.tsx         # Main app
│   │   └── styles.ts       # Theme styles
│   └── types/              # TypeScript types
├── icons/                   # Extension icons
├── manifest.json           # Chrome manifest
├── sidepanel.html          # Side panel HTML
└── build.mjs               # Build script
```

## AIXORD Gate Chain

The extension tracks progress through the 10 AIXORD gates:

1. **LIC** - License accepted
2. **DIS** - Disclaimer acknowledged
3. **TIR** - Tier selected
4. **ENV** - Environment confirmed
5. **OBJ** - Objective defined
6. **RA** - Risk acknowledged
7. **FX** - Feasibility checked
8. **PD** - Plan defined
9. **BP** - Blueprint approved
10. **MS** - Milestone set

## Phase Requirements

- **BRAINSTORM**: LIC, DIS, TIR, ENV, OBJ, RA
- **PLAN**: + FX, PD
- **EXECUTE**: + BP
- **REVIEW**: + MS

## License

Copyright (c) 2026 PMERIT TECHNOLOGIES LLC. All rights reserved.

---

*Part of the AIXORD Platform by [PMERIT](https://pmerit.com)*
