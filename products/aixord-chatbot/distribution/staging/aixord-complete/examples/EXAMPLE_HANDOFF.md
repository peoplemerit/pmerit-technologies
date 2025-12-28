# HANDOFF — Email Archive Dashboard

**From:** Claude Pro (Architect)
**To:** Claude Code (Commander)
**Date:** 2025-12-27
**Session:** 5
**Priority:** HIGH
**Mode:** EXECUTION (decisions frozen)

---

## CONTEXT

We are building an email archive dashboard for ACME Corp. The system stores emails in SharePoint and provides a searchable interface for employees. This HANDOFF covers the search UI implementation.

**Business Need:** Employees spend 2+ hours/week searching for old emails. This dashboard will reduce that to minutes.

---

## CURRENT STATE

- **Active SCOPE:** SCOPE_SEARCH_UI
- **Mode:** EXECUTION
- **Previous SCOPEs Complete:** SCOPE_DATABASE, SCOPE_AUTH

---

## DECISIONS MADE (Do Not Change)

| ID | Decision | Status |
|----|----------|--------|
| D-001 | Use React + TypeScript for frontend | ACTIVE |
| D-002 | PostgreSQL with pg_trgm for fuzzy search | ACTIVE |
| D-003 | Elasticsearch for full-text search | ACTIVE |
| D-004 | Max 100 results per query, paginated | ACTIVE |
| D-005 | Date range picker uses react-datepicker | ACTIVE |

---

## SPECIFICATIONS

### Functional Requirements

1. **Search Input**
   - Single text input field
   - Debounced search (300ms delay)
   - Minimum 3 characters to trigger search
   - Clear button when text present

2. **Filters**
   - Date range picker (from/to)
   - Sender filter (autocomplete from known senders)
   - Folder filter (dropdown: Inbox, Sent, Archive, All)

3. **Results Display**
   - Show: Subject, Sender, Date, Preview (first 100 chars)
   - Click to expand full email
   - Pagination: 20 per page

4. **Loading States**
   - Skeleton loader during search
   - "No results" message when empty
   - Error message on API failure

### Non-Functional Requirements
- Search response < 500ms for 95th percentile
- Accessible: WCAG 2.1 AA compliant
- Responsive: Works on mobile (320px+)

### Acceptance Criteria
- [ ] User can search by keyword
- [ ] User can filter by date range
- [ ] User can filter by sender
- [ ] User can paginate through results
- [ ] Loading states display correctly
- [ ] Error handling works

---

## VISUAL REQUIREMENTS

### Screenshots Required After Implementation
- [ ] Empty state (no search yet)
- [ ] Search with results
- [ ] Search with no results
- [ ] Loading state
- [ ] Error state
- [ ] Mobile view (375px width)

### Design References
- Use existing design system in `src/styles/`
- Primary color: `--color-primary` (#2563eb)
- Font: Inter (already loaded)

---

## EXECUTION INSTRUCTIONS

### Step 1: Create Search Component Structure
Create files:
- `src/components/Search/SearchBar.tsx`
- `src/components/Search/SearchFilters.tsx`
- `src/components/Search/SearchResults.tsx`
- `src/components/Search/index.tsx`

**Verify:** All files exist, no TypeScript errors

### Step 2: Implement SearchBar
- Text input with debounce (use `useDebouncedValue` hook)
- Clear button appears when text present
- Minimum 3 char validation

**Verify:** `npm run typecheck` passes

### Step 3: Implement SearchFilters
- Date range picker component
- Sender autocomplete (fetch from `/api/senders`)
- Folder dropdown

**Verify:** Filters render without errors

### Step 4: Implement SearchResults
- Map over results array
- Display subject, sender, date, preview
- Click handler for expansion
- Pagination controls

**Verify:** Mock data renders correctly

### Step 5: Connect to API
- Wire up to `/api/search` endpoint
- Handle loading, error, empty states
- Implement pagination

**Verify:** Real search works end-to-end

### Step 6: Add Responsive Styles
- Mobile breakpoint at 768px
- Stack filters vertically on mobile
- Adjust result card layout

**Verify:** Chrome DevTools mobile view looks correct

---

## VERIFICATION COMMANDS

```bash
# Type check
npm run typecheck

# Run tests
npm test -- --coverage

# Build check
npm run build

# Lint
npm run lint
```

---

## FILES TO MODIFY

| File | Action | Notes |
|------|--------|-------|
| `src/components/Search/SearchBar.tsx` | Create | New file |
| `src/components/Search/SearchFilters.tsx` | Create | New file |
| `src/components/Search/SearchResults.tsx` | Create | New file |
| `src/components/Search/index.tsx` | Create | Export barrel |
| `src/pages/Dashboard.tsx` | Edit | Import and use Search |
| `src/api/search.ts` | Edit | Add search endpoint call |

---

## ROLLBACK PROCEDURE

If implementation fails:
1. `git stash` current changes
2. Notify Human with error details
3. Wait for DECISION mode to resolve

---

## HANDOFF COMPLETE

Execute steps in order. Report completion of each step. HALT if:
- Any specification is ambiguous
- Tests fail after 3 attempts
- Unexpected API behavior

---

*AIXORD v2.0 — Authority. Execution. Confirmation.*
