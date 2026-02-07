-- migrations/019_fix_messages_session_fk.sql
-- Fix: messages.session_id FK incorrectly references auth 'sessions' table
-- instead of 'project_sessions'. SQLite ALTER TABLE ADD COLUMN REFERENCES
-- resolved ambiguously. Rebuild table without the broken FK.

PRAGMA foreign_keys=OFF;

CREATE TABLE messages_new (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  session_id TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

INSERT INTO messages_new SELECT id, project_id, role, content, metadata, created_at, session_id FROM messages;

DROP TABLE messages;

ALTER TABLE messages_new RENAME TO messages;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);

PRAGMA foreign_keys=ON;
