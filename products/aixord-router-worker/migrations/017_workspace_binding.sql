-- Migration 017: Workspace Binding
-- Stores server-side metadata for GA:ENV + GA:FLD unified workspace binding.
-- Client-side folder handle persists in IndexedDB (fileSystem.ts).
-- This table enables backend gate auto-checks without client involvement.

CREATE TABLE IF NOT EXISTS workspace_bindings (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL UNIQUE,
  folder_name TEXT,                          -- Display name of linked folder
  folder_template TEXT,                      -- 'web-app' | 'documentation' | 'general' | 'user-controlled'
  permission_level TEXT DEFAULT 'readwrite', -- 'read' | 'readwrite'
  scaffold_generated INTEGER DEFAULT 0,     -- Boolean: was scaffold written to folder?
  github_connected INTEGER DEFAULT 0,       -- Boolean: is GitHub repo linked?
  github_repo TEXT,                          -- e.g., 'user/repo'
  binding_confirmed INTEGER DEFAULT 0,      -- Boolean: Part 3 confirmation completed?
  bound_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_workspace_bindings_project ON workspace_bindings(project_id);
