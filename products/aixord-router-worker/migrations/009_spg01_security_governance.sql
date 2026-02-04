-- migrations/009_spg01_security_governance.sql
-- SPG-01: Security & Privacy Governance (AIXORD v4.3)
-- Created: 2026-02-02
-- Purpose: Implements data classification and AI exposure tracking per L-SPG laws

-- =============================================================================
-- DATA CLASSIFICATION (GS:DC Gate)
-- Per L-SPG1, L-SPG5: Sensitivity must be declared before execution
-- =============================================================================

CREATE TABLE IF NOT EXISTS data_classification (
  project_id TEXT PRIMARY KEY,

  -- Classification categories (L-SPG1)
  pii TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (pii IN ('YES', 'NO', 'UNKNOWN')),
  phi TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (phi IN ('YES', 'NO', 'UNKNOWN')),
  financial TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (financial IN ('YES', 'NO', 'UNKNOWN')),
  legal TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (legal IN ('YES', 'NO', 'UNKNOWN')),
  minor_data TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (minor_data IN ('YES', 'NO', 'UNKNOWN')),

  -- Jurisdiction and regulations (L-SPG7, L-SPG10)
  jurisdiction TEXT DEFAULT 'US',
  regulations TEXT DEFAULT '[]', -- JSON array: ["GDPR", "CCPA", "HIPAA"]

  -- AI Exposure level (L-SPG3, L-SPG4)
  -- UNKNOWN defaults to RESTRICTED per L-SPG4 "when in doubt, protect"
  ai_exposure TEXT NOT NULL DEFAULT 'RESTRICTED' CHECK (ai_exposure IN (
    'PUBLIC',       -- Full content allowed
    'INTERNAL',     -- Content allowed, results may log
    'CONFIDENTIAL', -- Redacted/masked only
    'RESTRICTED',   -- Director authorization required
    'PROHIBITED'    -- No AI exposure ever
  )),

  -- Declared by user (L-SPG1 requirement)
  declared_by TEXT,
  declared_at DATETIME,

  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- =============================================================================
-- AI EXPOSURE LOG (GS:AI Gate)
-- Per L-SPG3, L-SPG6: Track all AI exposure for audit
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_exposure_log (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  request_id TEXT NOT NULL,

  -- Classification at time of request
  classification TEXT NOT NULL CHECK (classification IN (
    'PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'PROHIBITED'
  )),

  -- What was exposed
  exposure_type TEXT NOT NULL CHECK (exposure_type IN (
    'FULL_CONTENT',    -- Raw content sent
    'REDACTED',        -- PII/PHI masked
    'SUMMARY_ONLY',    -- Only summaries sent
    'METADATA_ONLY',   -- Only metadata sent
    'BLOCKED'          -- Request blocked
  )),

  -- Authorization (L-SPG3: requires auth for sensitive data)
  authorized BOOLEAN NOT NULL DEFAULT FALSE,
  authorized_by TEXT, -- 'SYSTEM' or user_id
  authorization_reason TEXT,

  -- Redaction stats
  pii_fields_redacted INTEGER DEFAULT 0,
  phi_fields_redacted INTEGER DEFAULT 0,

  -- Provider/Model that received data
  provider TEXT,
  model TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- =============================================================================
-- USER DATA RIGHTS LOG (L-SPG8)
-- Per L-SPG8: User rights are CAPABILITIES that must be tracked
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_rights_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,

  -- Request type (GDPR Article 15-22, CCPA)
  request_type TEXT NOT NULL CHECK (request_type IN (
    'ACCESS',     -- Right to access (GDPR Art 15, CCPA)
    'RECTIFY',    -- Right to rectification (GDPR Art 16)
    'ERASE',      -- Right to erasure (GDPR Art 17, CCPA)
    'RESTRICT',   -- Right to restrict processing (GDPR Art 18)
    'PORTABILITY',-- Right to data portability (GDPR Art 20)
    'OBJECT',     -- Right to object (GDPR Art 21)
    'OPT_OUT'     -- Opt-out of sale (CCPA)
  )),

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'IN_PROGRESS', 'COMPLETED', 'DENIED'
  )),

  -- Compliance timeline (GDPR: 30 days, CCPA: 45 days)
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_date DATETIME,
  completed_at DATETIME,

  -- Details
  notes TEXT,
  handled_by TEXT,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================================
-- SECURITY GATES STATUS
-- Track which security gates have been passed per project
-- =============================================================================

CREATE TABLE IF NOT EXISTS security_gates (
  project_id TEXT PRIMARY KEY,

  -- GS:DC - Data Classification declared (L-SPG5)
  gs_dc BOOLEAN NOT NULL DEFAULT FALSE,
  gs_dc_passed_at DATETIME,

  -- GS:DP - Data Protection requirements met
  gs_dp BOOLEAN NOT NULL DEFAULT FALSE,
  gs_dp_passed_at DATETIME,

  -- GS:AC - Access Controls appropriate (already in auth system)
  gs_ac BOOLEAN NOT NULL DEFAULT TRUE,
  gs_ac_passed_at DATETIME,

  -- GS:AI - AI usage complies with classification (L-SPG6)
  gs_ai BOOLEAN NOT NULL DEFAULT FALSE,
  gs_ai_passed_at DATETIME,

  -- GS:JR - Jurisdiction compliance (L-SPG10)
  gs_jr BOOLEAN NOT NULL DEFAULT FALSE,
  gs_jr_passed_at DATETIME,

  -- GS:RT - Retention policy defined (for Lock phase)
  gs_rt BOOLEAN NOT NULL DEFAULT FALSE,
  gs_rt_passed_at DATETIME,

  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_data_classification_exposure ON data_classification(ai_exposure);
CREATE INDEX IF NOT EXISTS idx_ai_exposure_project ON ai_exposure_log(project_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_exposure_request ON ai_exposure_log(request_id);
CREATE INDEX IF NOT EXISTS idx_user_rights_user ON user_rights_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_rights_due ON user_rights_requests(due_date) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_security_gates_incomplete ON security_gates(project_id)
  WHERE gs_dc = FALSE OR gs_ai = FALSE;
