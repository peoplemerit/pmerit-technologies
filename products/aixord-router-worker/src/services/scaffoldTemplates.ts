/**
 * Scaffold Template Engine — CRIT-01/CRIT-02 Fix
 *
 * Generates project skeleton templates from blueprint data.
 * Templates include infrastructure files (package.json, index.html,
 * build config, entry point, integration layer) that the execution
 * engine writes BEFORE component files.
 *
 * Template variants: pwa, spa, api, library
 */

import { log } from '../utils/logger';

// ─── Types ───────────────────────────────────────────────────────────

export interface TemplateNode {
  path: string;
  type: 'file' | 'directory';
  content?: string;
  /** If true, this file should be regenerated after component writes to wire imports */
  integration?: boolean;
}

export interface ScaffoldTemplate {
  template_type: 'pwa' | 'spa' | 'api' | 'library';
  nodes: TemplateNode[];
  design_tokens?: DesignTokens;
}

export interface DesignTokens {
  primary_color: string;
  secondary_color: string;
  font_family: string;
  border_radius: string;
}

interface BlueprintData {
  project_name: string;
  project_description: string;
  scopes: Array<{ title: string; description: string }>;
  deliverables: Array<{ name: string; description: string }>;
}

// ─── Template Detection ──────────────────────────────────────────────

function detectTemplateType(data: BlueprintData): 'pwa' | 'spa' | 'api' | 'library' {
  const allText = [
    data.project_name,
    data.project_description,
    ...data.scopes.map(s => s.title + ' ' + s.description),
    ...data.deliverables.map(d => d.name + ' ' + d.description),
  ].join(' ').toLowerCase();

  if (allText.includes('pwa') || allText.includes('progressive web') ||
      allText.includes('offline') || allText.includes('service worker') ||
      allText.includes('manifest') || allText.includes('installable')) {
    return 'pwa';
  }
  if (allText.includes('api') || allText.includes('backend') ||
      allText.includes('server') || allText.includes('endpoint')) {
    return 'api';
  }
  if (allText.includes('library') || allText.includes('package') ||
      allText.includes('npm module') || allText.includes('sdk')) {
    return 'library';
  }
  return 'spa';
}

function detectDependencies(data: BlueprintData): Record<string, string> {
  const allText = [
    data.project_name,
    data.project_description,
    ...data.scopes.map(s => s.title + ' ' + s.description),
    ...data.deliverables.map(d => d.name + ' ' + d.description),
  ].join(' ').toLowerCase();

  const deps: Record<string, string> = {};

  // Common detection patterns
  if (allText.includes('barcode') || allText.includes('scanner') || allText.includes('quagga')) {
    deps['@ericblade/quagga2'] = '^1.8.4';
  }
  if (allText.includes('chart') || allText.includes('graph') || allText.includes('visualization')) {
    deps['chart.js'] = '^4.4.0';
  }
  if (allText.includes('indexeddb') || allText.includes('idb')) {
    deps['idb'] = '^8.0.0';
  }
  if (allText.includes('encrypt') || allText.includes('crypto')) {
    deps['crypto-js'] = '^4.2.0';
  }
  if (allText.includes('react')) {
    deps['react'] = '^18.3.0';
    deps['react-dom'] = '^18.3.0';
  }

  return deps;
}

function extractDesignTokens(data: BlueprintData): DesignTokens {
  // Default tokens — blueprint can override via description keywords
  const allText = data.project_description.toLowerCase();

  let primary = '#2563eb'; // Default blue
  if (allText.includes('green') || allText.includes('nature') || allText.includes('eco')) {
    primary = '#10B981';
  } else if (allText.includes('red') || allText.includes('alert') || allText.includes('emergency')) {
    primary = '#EF4444';
  } else if (allText.includes('purple') || allText.includes('premium')) {
    primary = '#8B5CF6';
  }

  return {
    primary_color: primary,
    secondary_color: '#64748b',
    font_family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    border_radius: '8px',
  };
}

// ─── Template Generators ─────────────────────────────────────────────

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function generatePackageJson(data: BlueprintData, type: string, extraDeps: Record<string, string>): string {
  const slug = slugify(data.project_name);
  const deps: Record<string, string> = { ...extraDeps };
  const devDeps: Record<string, string> = {
    'vite': '^5.4.0',
  };

  if (type === 'pwa') {
    devDeps['vite-plugin-pwa'] = '^0.20.0';
    devDeps['workbox-core'] = '^7.0.0';
    devDeps['workbox-precaching'] = '^7.0.0';
  }

  return JSON.stringify({
    name: slug,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: deps,
    devDependencies: devDeps,
  }, null, 2);
}

function generateIndexHtml(data: BlueprintData, tokens: DesignTokens): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="${tokens.primary_color}" />
  <title>${data.project_name}</title>
  <link rel="stylesheet" href="/src/styles/design-tokens.css" />
  <link rel="stylesheet" href="/src/styles/global.css" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;
}

function generateViteConfig(type: string): string {
  if (type === 'pwa') {
    return `import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: false, // We provide our own manifest.json
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});`;
  }
  return `import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});`;
}

function generateManifestJson(data: BlueprintData, tokens: DesignTokens): string {
  const slug = slugify(data.project_name);
  return JSON.stringify({
    name: data.project_name,
    short_name: slug,
    description: data.project_description || data.project_name,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: tokens.primary_color,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }, null, 2);
}

function generateDesignTokensCss(tokens: DesignTokens): string {
  return `:root {
  /* Design tokens — locked from blueprint. All components reference these. */
  --color-primary: ${tokens.primary_color};
  --color-secondary: ${tokens.secondary_color};
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --font-family: ${tokens.font_family};
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --radius: ${tokens.border_radius};
  --radius-sm: 4px;
  --radius-lg: 12px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
}`;
}

function generateGlobalCss(): string {
  return `/* Global styles — references design tokens */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  color: var(--color-text);
  background-color: var(--color-background);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

button {
  font-family: inherit;
  cursor: pointer;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}`;
}

function generateMainJs(data: BlueprintData): string {
  return `/**
 * ${data.project_name} — Entry Point
 *
 * This file initializes the application and sets up routing.
 * Generated by AIXORD scaffold engine.
 * Component imports will be auto-updated as files are written.
 */

import { App } from './App.js';

// Initialize the application
const app = new App(document.getElementById('app'));
app.mount();

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed — app works without it
    });
  });
}`;
}

function generateAppJs(data: BlueprintData): string {
  const componentNames = data.deliverables
    .map(d => d.name.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean);

  return `/**
 * ${data.project_name} — App Shell
 *
 * Integration layer that mounts components, manages routing,
 * and wires shared state.
 *
 * INTEGRATION MARKER: This file is regenerated when new components are written.
 * Component imports below will be auto-updated by the execution engine.
 */

// ── Component Imports (auto-updated) ──
// SCAFFOLD_IMPORTS_START
// Components will be imported here as they are generated
// SCAFFOLD_IMPORTS_END

// ── Shared State ──
const state = {
  currentView: 'home',
  data: {},
};

export class App {
  constructor(rootElement) {
    this.root = rootElement;
    this.views = {};
    this.setupViews();
  }

  setupViews() {
    // Views will be registered here as components are generated
    // SCAFFOLD_VIEWS_START
    this.views['home'] = () => \`
      <div class="container" style="padding-top: var(--spacing-8);">
        <h1 style="font-size: var(--font-size-2xl); margin-bottom: var(--spacing-4);">
          ${data.project_name}
        </h1>
        <p style="color: var(--color-text-muted);">
          ${data.project_description || 'Welcome to your application.'}
        </p>
        <nav style="margin-top: var(--spacing-6); display: flex; gap: var(--spacing-3);">
          <!-- Navigation links will be added as components are generated -->
        </nav>
      </div>
    \`;
    // SCAFFOLD_VIEWS_END
  }

  mount() {
    this.render();
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1) || 'home';
      this.navigate(hash);
    });
  }

  navigate(view) {
    state.currentView = view;
    this.render();
  }

  render() {
    const viewFn = this.views[state.currentView] || this.views['home'];
    if (viewFn) {
      this.root.innerHTML = viewFn(state);
      this.bindEvents();
    }
  }

  bindEvents() {
    // Event binding for navigation links
    this.root.querySelectorAll('[data-navigate]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = el.getAttribute('data-navigate');
        window.location.hash = target;
      });
    });
  }
}`;
}

function generateServiceWorker(): string {
  return `// Service Worker — PWA offline support
// This is a basic service worker. Vite PWA plugin can replace this with Workbox.

const CACHE_NAME = 'app-cache-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});`;
}

function generateReadme(data: BlueprintData): string {
  const slug = slugify(data.project_name);
  return `# ${data.project_name}

${data.project_description || ''}

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Tech Stack

- Vite (build tool)
- Vanilla JavaScript (ES modules)

## Project Structure

\`\`\`
${slug}/
  public/           # Static assets
  src/
    components/     # UI components
    services/       # Business logic
    storage/        # Data persistence
    utils/          # Helper utilities
    styles/         # CSS (design tokens + global)
    main.js         # Entry point
    App.js          # App shell + routing
  index.html        # HTML entry
  package.json      # Dependencies
  vite.config.js    # Build config
\`\`\`

## Architecture

Generated by AIXORD scaffold engine from project blueprint.
`;
}

// ─── Main Generator ──────────────────────────────────────────────────

export async function generateScaffoldFromBlueprint(
  db: D1Database,
  projectId: string
): Promise<ScaffoldTemplate> {
  // 1. Fetch blueprint data
  const project = await db.prepare(
    'SELECT name, description FROM projects WHERE id = ?'
  ).bind(projectId).first<{ name: string; description: string }>();

  const scopes = await db.prepare(
    'SELECT title, description FROM blueprint_scopes WHERE project_id = ?'
  ).bind(projectId).all<{ title: string; description: string }>();

  const deliverables = await db.prepare(
    'SELECT name, description FROM blueprint_deliverables WHERE project_id = ?'
  ).bind(projectId).all<{ name: string; description: string }>();

  const data: BlueprintData = {
    project_name: project?.name || 'My Project',
    project_description: project?.description || '',
    scopes: scopes.results || [],
    deliverables: deliverables.results || [],
  };

  // 2. Detect template type and dependencies
  const templateType = detectTemplateType(data);
  const extraDeps = detectDependencies(data);
  const tokens = extractDesignTokens(data);

  log.info('scaffold_generating', {
    project_id: projectId,
    template_type: templateType,
    dep_count: Object.keys(extraDeps).length,
    scope_count: data.scopes.length,
    deliverable_count: data.deliverables.length,
  });

  // 3. Build template nodes
  const nodes: TemplateNode[] = [
    // Directories
    { path: 'public', type: 'directory' },
    { path: 'public/icons', type: 'directory' },
    { path: 'src', type: 'directory' },
    { path: 'src/components', type: 'directory' },
    { path: 'src/services', type: 'directory' },
    { path: 'src/storage', type: 'directory' },
    { path: 'src/utils', type: 'directory' },
    { path: 'src/styles', type: 'directory' },
    { path: 'src/models', type: 'directory' },
    { path: 'tests', type: 'directory' },
    { path: 'docs', type: 'directory' },

    // Infrastructure files
    { path: 'package.json', type: 'file', content: generatePackageJson(data, templateType, extraDeps) },
    { path: 'index.html', type: 'file', content: generateIndexHtml(data, tokens) },
    { path: 'vite.config.js', type: 'file', content: generateViteConfig(templateType) },
    { path: 'README.md', type: 'file', content: generateReadme(data) },

    // Design system
    { path: 'src/styles/design-tokens.css', type: 'file', content: generateDesignTokensCss(tokens) },
    { path: 'src/styles/global.css', type: 'file', content: generateGlobalCss() },

    // Entry point + App shell (integration layer)
    { path: 'src/main.js', type: 'file', content: generateMainJs(data) },
    { path: 'src/App.js', type: 'file', content: generateAppJs(data), integration: true },
  ];

  // PWA-specific files
  if (templateType === 'pwa') {
    nodes.push(
      { path: 'public/manifest.json', type: 'file', content: generateManifestJson(data, tokens) },
      { path: 'public/sw.js', type: 'file', content: generateServiceWorker() },
    );
  }

  // Placeholder test file
  nodes.push({
    path: 'tests/app.test.js',
    type: 'file',
    content: `// ${data.project_name} — Tests\n// Add tests for your components and services here.\n\nimport { describe, it, expect } from 'vitest';\n\ndescribe('App', () => {\n  it('should be defined', () => {\n    expect(true).toBe(true);\n  });\n});\n`,
  });

  // Docs placeholder
  nodes.push({
    path: 'docs/architecture.md',
    type: 'file',
    content: `# ${data.project_name} — Architecture\n\nGenerated from AIXORD blueprint.\n\n## Scopes\n\n${data.scopes.map(s => `- **${s.title}**: ${s.description || 'No description'}`).join('\n')}\n\n## Deliverables\n\n${data.deliverables.map(d => `- **${d.name}**: ${d.description || 'No description'}`).join('\n')}\n`,
  });

  return {
    template_type: templateType,
    nodes,
    design_tokens: tokens,
  };
}
