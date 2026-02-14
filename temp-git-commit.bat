@echo off
cd /d C:\dev\pmerit\pmerit-technologies
git add products\aixord-webapp-ui\src\pages\Settings.tsx
git commit -m "feat(p0): Add DELETE logic for API key removal

- Detect empty key fields as delete intent
- Send DELETE requests to backend /api-keys/:provider
- Update UI after successful deletion
- Dispatch api-keys-updated event for cache refresh

Fixes: Users unable to remove/rotate API keys
Priority: P0 - Blocks GT2UTM Section 1.D
Session: D4 Session 3
Handoff: HANDOFF-API-KEY-DELETE-P0

Backend DELETE endpoint already exists (Session D4.2)
This completes the frontend integration for full CRUD."
git status --short
