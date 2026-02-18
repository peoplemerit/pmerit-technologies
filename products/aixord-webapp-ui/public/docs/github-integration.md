# GitHub Integration Guide

D4-CHAT integrates with GitHub in two modes to match your workflow needs.

## Two Integration Modes

### Evidence Only (Read-Only)
**Permissions:** Read commits, pull requests, releases
**Use Case:** Track development activity in the Reconciliation Triad

**What you can do:**
- View commits, PRs, releases in Evidence panel
- Auto-populate Reconciliation Triad
- Track progress without granting write access

**What you cannot do:**
- Create repositories from D4-CHAT
- Commit scaffold files to GitHub
- Push code to GitHub

---

### Full Workspace (Read-Write)
**Permissions:** Create repos, commit files, push to branches
**Use Case:** Integrated development workflow with local workspace

**What you can do:**
- Everything in Evidence Only mode, plus:
- Create GitHub repositories from project templates
- Auto-commit scaffold files when workspace is set up
- Push code to feature branches (`aixord/{project-name}`)
- Auto-create draft pull requests

**Security guarantees:**
- We **never** write to `main` or `master` branches
- All commits go to `aixord/{project-name}` branches
- All commits create **draft** pull requests for your review
- You maintain full control via GitHub's PR workflow

---

## Upgrading from Evidence Only to Full Workspace

### Why Re-Authorization is Required

GitHub's security model requires explicit permission for each access level:
1. **Evidence Only** requests read-only scopes (`repo:status`, `read:org`)
2. **Full Workspace** requests read-write scopes (`repo`, `read:org`)

You cannot upgrade an existing token's permissions — you must re-authorize to grant broader scopes.

### Upgrade Process

1. Click **"Upgrade to Full Access (Read + Write)"** button
2. Review permission comparison in modal
3. Click **"Authorize Write Access"** — redirects to GitHub
4. GitHub shows what additional permissions D4-CHAT is requesting
5. Approve on GitHub
6. Return to D4-CHAT — upgrade complete!

**This is a one-time re-authorization.** Once upgraded, you won't need to re-authorize unless you disconnect and reconnect.

---

## Frequently Asked Questions

**Q: Why does D4-CHAT need write access?**
A: To commit scaffold files, create repos, and push code as part of the governed workflow. Without write access, you'd need to manually copy/paste files.

**Q: Can D4-CHAT mess up my repository?**
A: No. We only write to `aixord/*` branches and create draft PRs. You review and merge via GitHub's standard PR workflow.

**Q: What if I don't want write access?**
A: Stay in Evidence Only mode! You'll still get commit tracking and Reconciliation Triad features.

**Q: Can I downgrade from Full Workspace to Evidence Only?**
A: Yes. Disconnect GitHub, then reconnect and choose Evidence Only mode.

**Q: Does D4-CHAT have access to my private repos?**
A: Only if you grant the `repo` scope in Full Workspace mode. Evidence Only mode uses `public_repo` which only accesses public repositories unless you specifically grant private repo access.

---

## Security & Privacy

**What we collect:**
- Repository metadata (name, URL, default branch)
- Commit SHAs, messages, authors, timestamps
- Pull request titles, numbers, states
- Release tags and notes

**What we do NOT collect:**
- File contents
- Commit diffs
- Code from your repositories
- Personal access tokens (we store OAuth tokens encrypted in our database)

**Token storage:**
- OAuth tokens are encrypted at rest using AES-256-GCM
- Tokens are never logged or exposed in API responses
- Tokens are only used server-side, never sent to your browser

**Revoking access:**
- Disconnect from GitHub in D4-CHAT Settings
- Revoke D4-CHAT's access in [GitHub Settings > Applications](https://github.com/settings/applications)
- Both actions immediately invalidate the token

---

## Troubleshooting

**"Could not connect to GitHub"**
- Check your internet connection
- Ensure you're logged into GitHub in your browser
- Try clearing browser cache and reconnecting

**"Upgrade failed"**
- Ensure you approved the permissions on GitHub
- Check that you didn't cancel the OAuth flow
- Try disconnecting and reconnecting in Full Workspace mode

**"No commits showing in Evidence panel"**
- Ensure repository is selected in Version Control step
- Check that commits exist in the selected repository
- Verify your GitHub connection is active (green checkmark)

---

**Need help?** Contact support or visit the [D4-CHAT Documentation Hub](/docs).
