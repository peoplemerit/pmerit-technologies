-- migrations/014_project_sessions.sql
-- Session Graph Model — AIXORD v4.4 Session Governance
-- Created: 2026-02-06
--
-- Introduces formal session tracking with directed graph relationships.
-- Session types: DISCOVER, BRAINSTORM, BLUEPRINT, EXECUTE, AUDIT, VERIFY_LOCK
-- Edge types: CONTINUES, DERIVES, SUPERSEDES, FORKS, RECONCILES

-- Sessions table (each session is a node in the graph)
CREATE TABLE IF NOT EXISTS project_sessions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  session_number INTEGER NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'BRAINSTORM'
    CHECK (session_type IN (
      'DISCOVER','BRAINSTORM','BLUEPRINT','EXECUTE','AUDIT','VERIFY_LOCK'
    )),
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE','CLOSED','ARCHIVED')),
  phase TEXT NOT NULL DEFAULT 'BRAINSTORM',
  capsule_snapshot TEXT,
  summary TEXT,
  message_count INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  cost_usd REAL DEFAULT 0.0,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME,
  created_by TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Session edges (directed graph relationships between project_sessions)
CREATE TABLE IF NOT EXISTS session_edges (
  id TEXT PRIMARY KEY,
  from_session_id TEXT NOT NULL,
  to_session_id TEXT NOT NULL,
  edge_type TEXT NOT NULL
    CHECK (edge_type IN (
      'CONTINUES','DERIVES','SUPERSEDES','FORKS','RECONCILES'
    )),
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_session_id) REFERENCES project_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (to_session_id) REFERENCES project_sessions(id) ON DELETE CASCADE
);

-- Add session_id to messages (nullable for backward compatibility)
-- Pre-migration messages remain with session_id = NULL
ALTER TABLE messages ADD COLUMN session_id TEXT REFERENCES project_sessions(id);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_project_sessions_project ON project_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_sessions_project_number ON project_sessions(project_id, session_number);
CREATE INDEX IF NOT EXISTS idx_project_sessions_status ON project_sessions(project_id, status);
CREATE INDEX IF NOT EXISTS idx_session_edges_from ON session_edges(from_session_id);
CREATE INDEX IF NOT EXISTS idx_session_edges_to ON session_edges(to_session_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
