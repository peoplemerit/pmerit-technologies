-- migrations/006_knowledge_artifacts.sql
-- Knowledge Artifacts for GKDL-01 (L-GKDL1-7)
-- Created: 2026-02-01

-- Knowledge artifacts table
CREATE TABLE IF NOT EXISTS knowledge_artifacts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,

  -- Artifact identity
  type TEXT NOT NULL CHECK (type IN (
    'FAQ_REFERENCE',
    'SYSTEM_OPERATION_MANUAL',
    'SYSTEM_DIAGNOSTICS_GUIDE',
    'CONSOLIDATED_SESSION_REFERENCE',
    'DEFINITION_OF_DONE'
  )),
  title TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,

  -- Content
  content TEXT NOT NULL,
  summary TEXT,

  -- Derivation tracking (L-GKDL1, L-GKDL3)
  derivation_source TEXT NOT NULL DEFAULT 'MANUAL' CHECK (derivation_source IN (
    'MANUAL', 'AI_DERIVED', 'EXTRACTED', 'IMPORTED'
  )),
  source_session_ids TEXT,     -- JSON array of session IDs
  source_artifact_ids TEXT,    -- JSON array of parent artifact IDs

  -- Status and approval (L-GKDL5)
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT', 'REVIEW', 'APPROVED', 'SUPERSEDED'
  )),
  approved_by TEXT,            -- User ID who approved
  approved_at DATETIME,

  -- Authority hierarchy (L-GKDL6)
  authority_level INTEGER NOT NULL DEFAULT 0,
  supersedes TEXT,             -- ID of artifact this replaces
  superseded_by TEXT,          -- ID of artifact that replaced this

  -- Audit
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Indexes for knowledge artifacts
CREATE INDEX IF NOT EXISTS idx_knowledge_project ON knowledge_artifacts(project_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_type ON knowledge_artifacts(type);
CREATE INDEX IF NOT EXISTS idx_knowledge_status ON knowledge_artifacts(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_authority ON knowledge_artifacts(authority_level DESC);

-- FAQ entries table (for FAQ_REFERENCE artifacts)
CREATE TABLE IF NOT EXISTS faq_entries (
  id TEXT PRIMARY KEY,
  artifact_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  tags TEXT,                   -- JSON array
  source_sessions TEXT,        -- JSON array of session IDs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (artifact_id) REFERENCES knowledge_artifacts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_faq_artifact ON faq_entries(artifact_id);
CREATE INDEX IF NOT EXISTS idx_faq_category ON faq_entries(category);
