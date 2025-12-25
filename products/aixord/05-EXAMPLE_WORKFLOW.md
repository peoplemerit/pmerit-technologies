# Scope Order System — Example Workflow (v3)

**Purpose:** A complete, real-world example of the Scope Order v3 workflow in action, demonstrating living documents, decision logging, and file locking.

---

## Scenario

You're building **TaskTracker**, a simple task management app. You want to add user authentication.

---

## Step 1: Audit Reality (Direct Approach)

**v3 Change:** No need to create empty file first — just run the audit directly.

**Director → Claude Code:**
```
AUDIT SCOPE: AUTH
```

**Claude Code Response:**

Claude Code creates both the scope file and linked handoff, then populates the AUDIT_REPORT:

```markdown
# SCOPE: AUTH

**Created:** 2025-01-15
**Last Updated:** 2025-01-15
**Status:** PLANNING
**Progress:** 0/5 tasks
**Linked Handoff:** HANDOFF_AUTH.md

---

## DECISION LOG (Permanent)

| Decision | Date | Rationale | Status |
|----------|------|-----------|--------|
| — | — | — | — |

---

## CURRENT STATE

### Planned Tasks
- [ ] Create database schema
- [ ] Implement backend endpoints
- [ ] Create frontend auth context
- [ ] Build login/signup pages
- [ ] Add protected routes

### Identified Gaps
| Gap | Severity | Status |
|-----|----------|--------|
| No users table | HIGH | OPEN |
| No JWT library | MEDIUM | OPEN |
| No auth pages | HIGH | OPEN |

---

## AUDIT_REPORT

### Last Audit: 2025-01-15

**Existing Auth-Related Code:**
- None found — this is a new feature

**Database Status:**
- Using PostgreSQL via Neon
- No users table exists yet

**Frontend Status:**
- React app with React Router
- No login/signup pages exist
- No auth context or hooks

**Backend Status:**
- Express API running on port 3001
- No auth endpoints exist
- No session/JWT middleware

**Dependencies Available:**
- bcryptjs (installed but unused)
- No JWT library installed

**Recommendations:**
1. Need to add `jsonwebtoken` package
2. Need to create users table in database
3. Need auth context for React frontend
```

---

## Step 2: Share with Claude Web

**Director Action:** Copy the AUDIT_REPORT section and share it with Claude Web.

**Director → Claude Web:**
```
Here's the auth audit from Claude Code:

[Paste AUDIT_REPORT content]

Let's brainstorm the auth system. I'm thinking:
- Email/password signup and login
- JWT tokens for API auth
- React context for frontend state

What do you think?
```

---

## Step 3: Brainstorm with Claude Web

**Claude Web Response:**

"Good foundation! Here are my recommendations:

**Authentication Flow:**
1. User signs up with email/password
2. Password hashed with bcrypt (already installed)
3. JWT issued on login, stored in httpOnly cookie
4. Frontend context tracks auth state

**Database Schema:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints:**
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

**Decision:** I recommend JWT over sessions for scalability.

Should I write the full specification?"

**Director:** "Yes, please write the HANDOFF_DOCUMENT."

---

## Step 4: Claude Web Writes Specification

**v3 Change:** Claude Web updates the HANDOFF_DOCUMENT section in place (not appending).

**Claude Web** updates the scope file:

```markdown
## HANDOFF_DOCUMENT

### Last Updated: 2025-01-15

### Feature: User Authentication

**Priority:** P1 - Critical

---

### Requirements

#### R1: Database Schema
Create users table with email, password_hash, created_at.

#### R2: Backend Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/auth/signup | POST | Create new user |
| /api/auth/login | POST | Authenticate, return JWT |
| /api/auth/logout | POST | Invalidate session |
| /api/auth/me | GET | Get current user |

#### R3: Frontend Components
- `src/context/AuthContext.jsx`
- `src/hooks/useAuth.js`
- `src/pages/LoginPage.jsx`
- `src/pages/SignupPage.jsx`
- `src/components/ProtectedRoute.jsx`

#### R4: Security Requirements
- Passwords hashed with bcrypt (cost factor 12)
- JWT expires in 7 days
- httpOnly cookies for token storage

---

### Acceptance Criteria
- [ ] User can sign up with email/password
- [ ] User can log in and receive token
- [ ] User can log out
- [ ] Protected routes redirect to login
- [ ] Auth state persists on page refresh
```

---

## Step 5: Implement with Claude Code

**Director → Claude Code:**
```
SCOPE UPDATED: AUTH
```

**Claude Code reads the spec and responds:**

"I've reviewed the HANDOFF_DOCUMENT for AUTH.

**Recommendation:** I suggest adding rate limiting to the auth endpoints to prevent brute force attacks. This wasn't in the spec but is best practice.

**Decision to Log:**
| Decision | Rationale | Suggested Status |
|----------|-----------|------------------|
| Rate limiting on auth | Prevent brute force | EXPERIMENTAL |

Should I add rate limiting, and should I log this decision as EXPERIMENTAL?"

**Director:** "Yes to both."

**Claude Code implements and updates the DECISION LOG:**

```markdown
## DECISION LOG (Permanent)

| Decision | Date | Rationale | Status |
|----------|------|-----------|--------|
| JWT over sessions | 2025-01-15 | Stateless, scalable | ACTIVE |
| Rate limiting 3/min | 2025-01-15 | Prevent brute force | EXPERIMENTAL |
| bcrypt cost 12 | 2025-01-15 | Security standard | ACTIVE |
```

---

## Step 6: Living Document Updates

**v3 Change:** RESEARCH_FINDINGS is replaced each session, not appended.

After Session 1 implementation, Claude Code updates:

```markdown
## RESEARCH_FINDINGS

### Latest Session: 1 — 2025-01-15

**Completed:**
- [x] Created users table migration
- [x] Ran migrations successfully
- [x] Installed jsonwebtoken

**Files Created:**
- `migrations/001_create_users.sql`
- `src/middleware/auth.js`

**Next Steps:**
- [ ] Implement endpoints
- [ ] Create frontend components
```

After Session 2, the RESEARCH_FINDINGS is **replaced** (not appended):

```markdown
## RESEARCH_FINDINGS

### Latest Session: 2 — 2025-01-16

**Completed:**
- [x] Implemented all 4 endpoints
- [x] Added rate limiting (3/min)
- [x] Created AuthContext

**Files Created:**
- `src/routes/auth.js`
- `src/context/AuthContext.jsx`
- `src/hooks/useAuth.js`

**Next Steps:**
- [ ] Create login/signup pages
- [ ] Add ProtectedRoute
```

**Old session content is archived:**
```
docs/archive/SCOPE_AUTH/
└── 2025-01-15_session1_research.md
```

---

## Step 7: Feature Complete — Lock Files

After Session 3, all acceptance criteria pass. Claude Code:

1. Updates scope status to COMPLETE
2. Logs final decision
3. Adds locked files

```markdown
## DECISION LOG (Permanent)

| Decision | Date | Rationale | Status |
|----------|------|-----------|--------|
| JWT over sessions | 2025-01-15 | Stateless, scalable | ACTIVE |
| Rate limiting 3/min | 2025-01-15 | Prevent brute force | ACTIVE |
| bcrypt cost 12 | 2025-01-15 | Security standard | ACTIVE |
| MD5 for passwords | 2025-01-15 | Insecure | NO-GO |

---

## LOCKED FILES

| File | Last Working Commit | Lock Date | Verified By |
|------|---------------------|-----------|-------------|
| src/middleware/auth.js | a1b2c3d | 2025-01-17 | Session 3 |
| src/routes/auth.js | a1b2c3d | 2025-01-17 | Session 3 |
| src/context/AuthContext.jsx | a1b2c3d | 2025-01-17 | Session 3 |
```

---

## Step 8: Archive Cleanup Prompt

**v3 Change:** When scope reaches COMPLETE, Claude Code prompts:

```
🧹 SCOPE AUTH is COMPLETE.

Archive files found:
- 2025-01-15_session1_research.md (2 days old)
- 2025-01-16_session2_research.md (1 day old)

Suggest: Delete archive files? Feature is stable.
[YES] [KEEP 30 MORE DAYS] [KEEP FOREVER]
```

**Director:** "Delete them."

**Claude Code:** Archives deleted. Scope fully cleaned.

---

## Step 9: Future Modification (Locked File)

A month later, you need to change the auth middleware.

**Director → Claude Code:**
```
Update the auth middleware to add refresh tokens.
```

**Claude Code Response:**
```
⚠️ FILE LOCKED: src/middleware/auth.js

This file is protected by SCOPE_AUTH.md
Last working commit: a1b2c3d
Lock date: 2025-01-17

To proceed, please issue: UNLOCK: src/middleware/auth.js
```

**Director:**
```
UNLOCK: src/middleware/auth.js
```

**Claude Code:**
1. Makes changes
2. Verifies original auth still works
3. Updates UNLOCK HISTORY in scope
4. Prompts: "Changes verified. RELOCK: src/middleware/auth.js?"

**Director:** "Yes"

**Claude Code:** File re-locked. UNLOCK HISTORY updated:

```markdown
### Unlock History

| Date | File | Reason | Outcome | Session |
|------|------|--------|---------|---------|
| 2025-02-15 | auth.js | Add refresh tokens | ✅ Success | 15 |
```

---

## Summary: The Complete v3 Cycle

```
1. CLAUDE CODE: "AUDIT SCOPE: AUTH" → created scope + handoff, populated AUDIT_REPORT
2. DIRECTOR → CLAUDE WEB: Shared audit, brainstormed requirements
3. CLAUDE WEB: Updated HANDOFF_DOCUMENT (replaced, not appended)
4. DIRECTOR → CLAUDE CODE: "SCOPE UPDATED: AUTH"
5. CLAUDE CODE: Recommended rate limiting, logged decision as EXPERIMENTAL
6. CLAUDE CODE: Implemented, updated RESEARCH_FINDINGS (replaced each session)
7. CLAUDE CODE: Archived old session content
8. CLAUDE CODE: Marked COMPLETE, locked critical files
9. CLAUDE CODE: Prompted archive cleanup
10. FUTURE: UNLOCK → modify → RELOCK cycle for changes
```

---

## Key v3 Takeaways

1. **Living Documents** — AUDIT_REPORT and RESEARCH_FINDINGS replaced, not appended
2. **Decision Log** — NO-GO decisions prevent circular discussions ("We tried MD5, it's insecure")
3. **File Locking** — Critical files protected after COMPLETE
4. **Lifecycle Archive** — Old content cleaned up automatically
5. **Linked Handoffs** — One HANDOFF_AUTH.md paired with SCOPE_AUTH.md

---

*This is how Scope Order v3 works in practice — living documents, permanent decisions, protected code.*
