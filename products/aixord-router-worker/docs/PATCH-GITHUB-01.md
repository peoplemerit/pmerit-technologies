# PATCH-GITHUB-01: GitHub Evidence Integration

**Version:** 1.0.0
**Date:** 2026-02-01
**Status:** IMPLEMENTED
**Governance:** AIXORD v4.4

---

## Overview

PATCH-GITHUB-01 introduces read-only GitHub integration for evidence tracking in the AIXORD D4-CHAT platform. External evidence from GitHub repositories (commits, PRs, releases, issues, milestones) automatically maps to the Reconciliation Triad to provide auditable proof of project progress.

### Key Principle

> **Evidence INFORMS, never OVERRIDES.**
>
> GitHub data augments the Reconciliation Triad but does not replace user decisions or governance rules. All evidence is read-only and advisory.

---

## Architecture

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| GitHub OAuth API | `src/api/github.ts` | OAuth flow, connection management |
| Evidence API | `src/api/evidence.ts` | Evidence sync and retrieval |
| Evidence Fetch Service | `src/services/evidence-fetch.ts` | GitHub API integration, triad mapping |
| Database Migration | `migrations/005_github_evidence.sql` | Schema for connections & evidence |
| Frontend Components | `src/components/GitHubConnect.tsx`, `EvidencePanel.tsx` | UI for GitHub integration |
| Settings: Assistance Mode | `src/contexts/UserSettingsContext.tsx`, `Settings.tsx` | User preference for visibility |

### Data Flow

```
GitHub API → Evidence Fetch Service → D1 Database → Evidence API → Frontend
                    ↓
            Reconciliation Triad Mapping
            (Issues/Milestones → PLANNED)
            (Commits/PRs → CLAIMED)
            (Releases/CI → VERIFIED)
```

---

## API Endpoints

### GitHub OAuth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/github/connect` | Initiate OAuth flow |
| GET | `/api/v1/github/callback` | OAuth callback handler |
| GET | `/api/v1/github/status/:projectId` | Get connection status |
| DELETE | `/api/v1/github/disconnect/:projectId` | Remove connection |
| GET | `/api/v1/github/repos` | List user's repos |
| PUT | `/api/v1/github/repo/:projectId` | Select repo for project |

### Evidence

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/evidence/sync/:projectId` | Trigger evidence sync |
| GET | `/api/v1/evidence/:projectId` | Get all evidence |
| GET | `/api/v1/evidence/:projectId/triad` | Get evidence by triad category |
| GET | `/api/v1/evidence/:projectId/stale` | Get stale evidence (debug) |

---

## Database Schema

### `github_connections`

Stores OAuth tokens and connection metadata per project.

```sql
CREATE TABLE github_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'READ_ONLY',
  connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_sync DATETIME
);
```

### `github_evidence`

Stores evidence records with triad mapping.

```sql
CREATE TABLE github_evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'GITHUB',
  evidence_type TEXT NOT NULL,       -- COMMIT, PR, RELEASE, CI_STATUS, ISSUE, MILESTONE
  triad_category TEXT NOT NULL,      -- PLANNED, CLAIMED, VERIFIED
  ref_id TEXT NOT NULL,              -- commit SHA, PR number, release tag
  ref_url TEXT NOT NULL,             -- Direct link to GitHub
  status TEXT NOT NULL DEFAULT 'PENDING',
  verified_at DATETIME,
  stale_after DATETIME NOT NULL,
  title TEXT,
  author TEXT,
  evidence_timestamp DATETIME,
  deliverable_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, source, evidence_type, ref_id)
);
```

### `oauth_states`

CSRF protection for OAuth flow.

```sql
CREATE TABLE oauth_states (
  state TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  expires_at DATETIME NOT NULL
);
```

---

## Triad Mapping Rules

| Evidence Type | Triad Category | Rationale |
|---------------|----------------|-----------|
| ISSUE | PLANNED | Issues represent planned work |
| MILESTONE | PLANNED | Milestones define planned deliverables |
| COMMIT | CLAIMED | Commits represent claimed work |
| PR | CLAIMED | PRs represent claimed features |
| RELEASE | VERIFIED | Releases prove delivery |
| CI_STATUS | VERIFIED | CI confirms verification |

---

## Security

### Access Tokens

- GitHub OAuth tokens encrypted with AES-GCM before storage
- Encryption key stored in Cloudflare secrets (`GITHUB_TOKEN_ENCRYPTION_KEY`)
- Tokens never logged or exposed in responses

### OAuth Scopes

Minimal read-only scopes requested:
- `repo:status` - Access commit status
- `read:org` - Read org membership
- `public_repo` - Access public repos

### CSRF Protection

- Random state token generated per OAuth flow
- State stored in DB with 10-minute expiration
- State validated on callback before token exchange

---

## Assistance Mode

Controls GitHub evidence visibility in the UI. Governance is unchanged regardless of mode.

| Mode | Description | Default State |
|------|-------------|---------------|
| **GUIDED** | Minimal visibility, evidence hidden by default | Panel collapsed |
| **ASSISTED** | Moderate visibility, evidence shown when relevant | Panel shows contextually |
| **EXPERT** | Full visibility, all evidence always displayed | Panel expanded |

---

## Environment Variables

Add to `wrangler.toml` or Cloudflare dashboard:

```toml
[vars]
GITHUB_CLIENT_ID = "your-github-oauth-app-id"
GITHUB_REDIRECT_URI = "https://aixord-router.pmerit.workers.dev/api/v1/github/callback"

# Secrets (use `wrangler secret put`)
# GITHUB_CLIENT_SECRET
# GITHUB_TOKEN_ENCRYPTION_KEY
```

---

## Usage

### Connecting GitHub

1. User navigates to project settings
2. Clicks "Connect GitHub"
3. Redirected to GitHub OAuth authorization
4. After approval, selects repository
5. Evidence automatically synced

### Viewing Evidence

1. Open project
2. Expand Evidence panel (visibility depends on Assistance Mode)
3. Click category tabs (PLANNED/CLAIMED/VERIFIED)
4. Click evidence item to open in GitHub

### Syncing Evidence

- Automatic: On project open (if stale)
- Manual: Click "Sync" button in Evidence panel
- Background: Scheduled sync every 15 minutes (future)

---

## Migration

Run the migration to add GitHub evidence tables:

```bash
cd pmerit-technologies/products/aixord-router-worker
npx wrangler d1 execute AIXORD_DB --file=migrations/005_github_evidence.sql
```

---

## Files Changed

### Backend (aixord-router-worker)

- `src/types.ts` - Added GitHub evidence types
- `src/api/github.ts` - **NEW** OAuth endpoints
- `src/api/evidence.ts` - **NEW** Evidence API
- `src/services/evidence-fetch.ts` - **NEW** GitHub fetch service
- `src/index.ts` - Route registration
- `migrations/005_github_evidence.sql` - **NEW** Database schema

### Frontend (aixord-webapp-ui)

- `src/lib/api.ts` - Added githubApi and evidenceApi
- `src/components/GitHubConnect.tsx` - **NEW** Connection UI
- `src/components/EvidencePanel.tsx` - **NEW** Evidence display
- `src/contexts/UserSettingsContext.tsx` - Added AssistanceMode
- `src/pages/Settings.tsx` - Added Assistance Mode selector

---

## Testing

### Manual Testing

1. Create a test project
2. Connect GitHub (use test repo)
3. Verify OAuth flow completes
4. Verify evidence appears in panel
5. Verify triad mapping is correct
6. Test sync functionality
7. Test disconnect

### API Testing

```bash
# Get connection status
curl -H "Authorization: Bearer $TOKEN" \
  https://aixord-router.pmerit.workers.dev/api/v1/github/status/$PROJECT_ID

# Trigger sync
curl -X POST -H "Authorization: Bearer $TOKEN" \
  https://aixord-router.pmerit.workers.dev/api/v1/evidence/sync/$PROJECT_ID

# Get evidence by triad
curl -H "Authorization: Bearer $TOKEN" \
  https://aixord-router.pmerit.workers.dev/api/v1/evidence/$PROJECT_ID/triad
```

---

## Future Enhancements

1. **CI Status Integration** - Fetch GitHub Actions workflow status
2. **Deliverable Linking** - Link evidence to specific deliverables
3. **Webhook Support** - Real-time evidence updates
4. **GitLab/Jira Support** - Additional evidence sources
5. **Evidence Scoring** - Quality metrics for evidence completeness

---

*AIXORD — Authority. Execution. Verification.*
