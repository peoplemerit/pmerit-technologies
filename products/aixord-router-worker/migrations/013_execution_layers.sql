-- migrations/013_execution_layers.sql
-- Execution Layers for Proactive Debugging (Path B)
-- Created: 2026-02-05
-- BLUEPRINT: BLUEPRINT-D4-PATH-B-PROACTIVE-DEBUGGING

-- Execution Layers (Layered Execution Mode)
-- Each layer represents a discrete unit of work that must be verified before proceeding
CREATE TABLE IF NOT EXISTS execution_layers (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    session_number INTEGER NOT NULL,          -- References project session number (from capsule)
    layer_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,

    -- Layer lifecycle: PENDING → ACTIVE → EXECUTED → VERIFIED → LOCKED
    --                                        ↓
    --                                     FAILED
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'EXECUTED', 'VERIFIED', 'LOCKED', 'FAILED')),

    -- I/O Sanitization
    expected_inputs TEXT,                     -- JSON: what this layer needs from previous layers
    expected_outputs TEXT,                    -- JSON: what this layer should produce
    actual_outputs TEXT,                      -- JSON: what was actually produced

    -- Verification
    verification_method TEXT CHECK (verification_method IN ('user_confirm', 'screenshot', 'test_output', 'file_check', 'ai_auto')),
    verification_evidence TEXT,              -- JSON: { type, image_id?, text?, timestamp }
    verified_at DATETIME,
    verified_by TEXT,                        -- 'user' | 'ai_auto'

    -- Failure tracking
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME,
    locked_at DATETIME,

    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE (project_id, session_number, layer_number)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_layers_project ON execution_layers(project_id);
CREATE INDEX IF NOT EXISTS idx_layers_session ON execution_layers(project_id, session_number);
CREATE INDEX IF NOT EXISTS idx_layers_status ON execution_layers(status);
CREATE INDEX IF NOT EXISTS idx_layers_active ON execution_layers(project_id, status) WHERE status = 'ACTIVE';

-- Layer evidence linking (optional - for multiple pieces of evidence per layer)
CREATE TABLE IF NOT EXISTS layer_evidence (
    id TEXT PRIMARY KEY,
    layer_id TEXT NOT NULL,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('screenshot', 'test_output', 'file_check', 'user_note')),
    image_id TEXT,                           -- References images table (if screenshot)
    text_content TEXT,                       -- For test output or file contents
    user_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (layer_id) REFERENCES execution_layers(id) ON DELETE CASCADE,
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_layer_evidence_layer ON layer_evidence(layer_id);
