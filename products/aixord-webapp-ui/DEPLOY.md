# AIXORD Web App UI — Deployment

## Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or higher
- Cloudflare account with Pages access

## Build

```bash
pnpm install
pnpm build
```

Build output goes to `dist/`.

## Local Preview

```bash
pnpm preview
```

## Deploy to Cloudflare Pages

### First-time setup

```bash
npx wrangler pages project create aixord-webapp-ui
```

### Deploy

```bash
npx wrangler pages deploy dist --project-name=aixord-webapp-ui
```

### Production URL

https://aixord-webapp-ui.pages.dev

## SPA Routing

The `public/_redirects` file handles client-side routing for React Router:

```
/*    /index.html   200
```

This ensures all routes serve `index.html` and let React Router handle navigation.

## Environment Variables

None required. The app connects to the production D4 API at:
- `https://aixord-webapp.peoplemerit.workers.dev`

## Privacy Policy

Privacy policy for Chrome Web Store is hosted at:
- `https://aixord-webapp-ui.pages.dev/privacy-policy.html`

## CI/CD

Manual deployment via `wrangler pages deploy`.

For automated deployments, connect the GitHub repository to Cloudflare Pages dashboard.
