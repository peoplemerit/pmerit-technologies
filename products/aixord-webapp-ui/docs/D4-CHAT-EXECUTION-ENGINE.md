# D4-CHAT Execution Engine

**Version:** 1.0
**Created:** 2026-02-12
**Status:** Active

## Overview

The D4-CHAT Execution Engine is a frontend module that parses AI responses during the EXECUTE phase and automatically writes files to the user's linked workspace folder using the Browser File System Access API.

## Architecture

### Components

1. **ExecutionEngine** (`src/lib/executionEngine.ts`)
   - Core parsing and execution logic
   - Handles file writing, API updates, and error handling

2. **useChat Hook Integration** (`src/hooks/useChat.ts`)
   - Detects EXECUTE phase conversations
   - Triggers execution engine after receiving AI responses
   - Stores execution results in message metadata

3. **MessageMetadata Extension** (`src/components/chat/types.ts`)
   - Added `executionResult` field to track execution outcomes

## Structured Block Formats

The AI router is configured to emit structured blocks in responses. The execution engine parses these formats:

### 1. Code Fences with File Paths

```typescript:src/api/auth.ts
export function login(username: string, password: string) {
  // code here
}
```

**Format:** ` ```language:path/to/file.ext`

### 2. SUBMISSION Blocks

```
=== SUBMISSION ===
assignment_id: A1234
summary: Implemented user authentication
evidence: src/api/auth.ts, src/hooks/useAuth.ts
=== END SUBMISSION ===
```

**Actions:**
- Posts to `/api/v1/projects/:projectId/assignments/:id/submit`
- Marks assignment as complete

### 3. PROGRESS UPDATE Blocks

```
=== PROGRESS UPDATE ===
assignment_id: A1234
percent: 75
completed: Implemented login endpoint
next: Add password reset functionality
=== END PROGRESS UPDATE ===
```

**Actions:**
- Posts to `/api/v1/projects/:projectId/assignments/:id/progress`
- Updates assignment progress tracking

### 4. ESCALATION Blocks

```
=== ESCALATION ===
assignment_id: A1234
decision_needed: Authentication strategy
options: JWT vs Session-based
recommendation: JWT for better scalability
rationale: Easier to implement microservices
=== END ESCALATION ===
```

**Actions:**
- Counted in execution result
- Displayed to user for decision

## Execution Flow

### Phase Detection

```typescript
if (activeConversation?.capsule?.phase === 'E' && options.projectId) {
  // Execute
}
```

Only runs when:
1. Conversation is in EXECUTE phase ('E')
2. Project has a linked workspace folder

### Processing Steps

1. **Parse Response** - Extract structured blocks and code fences
2. **Write Files** - Create/update files in workspace
3. **Update Progress** - POST progress updates to backend
4. **Submit Work** - POST submission data to backend
5. **Store Results** - Add execution metadata to message

### Error Handling

- Individual file write failures don't stop execution
- API call failures are logged in `executionResult.errors`
- All errors are displayed to user in message metadata

## File System Integration

### Workspace Permissions

The execution engine requires:
1. User has linked a workspace folder for the project
2. Browser has `readwrite` permission to the folder
3. Folder handle is stored in IndexedDB

### File Creation Logic

```typescript
// Parse path: "src/components/Button.tsx"
const pathParts = ['src', 'components'];
const filename = 'Button.tsx';

// Navigate/create directories
let handle = workspaceRoot;
for (const dir of pathParts) {
  handle = await createDirectory(handle, dir);
}

// Write file
await createFile(handle, filename, content);
```

### Supported Actions

- **Create**: New files in any directory path
- **Update**: Overwrite existing files (same as create)

## API Integration

### Assignment Progress Endpoint

```typescript
POST /api/v1/projects/:projectId/assignments/:assignmentId/progress
{
  "progress_percent": 75,
  "progress_notes": "Completed login implementation",
  "remaining_items": ["Password reset functionality"]
}
```

### Assignment Submission Endpoint

```typescript
POST /api/v1/projects/:projectId/assignments/:assignmentId/submit
{
  "submission_summary": "Implemented user authentication",
  "submission_evidence": [
    "src/api/auth.ts",
    "src/hooks/useAuth.ts"
  ]
}
```

## Usage Example

### User Workflow

1. User creates a project and links workspace folder
2. User creates a conversation with objective
3. User advances to EXECUTE phase ('E')
4. User sends message: "Implement the login component"
5. AI responds with code fences and structured blocks
6. Execution engine:
   - Writes files to workspace automatically
   - Updates assignment progress
   - Displays results in message metadata

### Result Display

```typescript
interface ExecutionResult {
  filesCreated: ['src/components/Login.tsx', 'src/api/auth.ts'];
  filesUpdated: [];
  progressUpdates: 1;
  submissions: 0;
  escalations: 0;
  errors: [];
}
```

## Future Enhancements

### Planned Features

1. **Diff Preview** - Show file changes before writing
2. **Approval Workflow** - Require user confirmation for file writes
3. **Rollback** - Undo file changes if needed
4. **Conflict Detection** - Handle concurrent file modifications
5. **Binary File Support** - Images, PDFs, etc.

### Considerations

- Performance for large file operations
- Network reliability for API calls
- Browser compatibility (File System Access API)
- Security model for workspace access

## Security Model

### Permissions

- User explicitly grants folder access via browser picker
- Access scoped ONLY to selected folder and children
- No parent folder access (enforced by browser API)
- User can revoke access anytime

### Validation

- File paths are normalized and validated
- No path traversal attacks (../ blocked by API)
- Content is written as-is (no execution)
- MIME types are not enforced

## Browser Compatibility

### Requirements

- Chrome 86+
- Edge 86+
- Opera 72+

### Unsupported Browsers

- Firefox (File System Access API not implemented)
- Safari (File System Access API not implemented)

Fallback: Users can manually download files

## Testing

### Unit Tests

```typescript
// Test code fence parsing
const response = '```typescript:src/test.ts\nconsole.log("test");\n```';
const parsed = ExecutionEngine.parseResponse(response);
expect(parsed.fileSpecs).toHaveLength(1);
expect(parsed.fileSpecs[0].path).toBe('src/test.ts');
```

### Integration Tests

```typescript
// Test file writing
const result = await ExecutionEngine.writeFileToWorkspace(
  projectId,
  'src/test.ts',
  'console.log("test");'
);
expect(result.success).toBe(true);
```

## Performance

### Benchmarks

- Parse response: < 1ms (typical)
- Write single file: 10-50ms
- API call: 100-500ms (network dependent)

### Optimization Opportunities

- Batch API calls for multiple progress updates
- Parallel file writes (currently sequential)
- Cache workspace handles to reduce lookups

## Maintenance

### Dependencies

- React 19
- TypeScript 5.9
- File System Access API (browser built-in)
- IndexedDB (browser built-in)

### Related Files

```
src/
├── lib/
│   ├── executionEngine.ts      # Core engine
│   ├── fileSystem.ts            # File System API wrappers
│   └── api.ts                   # Backend API client
├── hooks/
│   └── useChat.ts               # Chat hook with execution integration
└── components/
    └── chat/
        └── types.ts             # Message metadata types
```

## Changelog

### Version 1.0 (2026-02-12)

- Initial implementation
- Code fence parsing
- Structured block parsing (SUBMISSION, PROGRESS UPDATE, ESCALATION)
- File writing to workspace
- API integration for assignments
- Error handling and result tracking

---

*D4-CHAT Execution Engine — Automated code execution for AIXORD Copilot*
