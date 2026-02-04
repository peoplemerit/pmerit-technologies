-- migrations/007_ccs_governance.sql
-- Credential Compromise & Sanitization for PATCH-CCS-01
-- Created: 2026-02-01
-- AIXORD v4.4

-- ============================================================================
-- CCS Incidents Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS ccs_incidents (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,

  -- Incident identity
  incident_number TEXT NOT NULL UNIQUE,  -- CCS-YYYY-MM-DD-NNN
  phase TEXT NOT NULL DEFAULT 'DETECT' CHECK (phase IN (
    'INACTIVE', 'DETECT', 'CONTAIN', 'ROTATE', 'INVALIDATE', 'VERIFY', 'ATTEST', 'UNLOCK'
  )),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED', 'EXPIRED')),

  -- Exposure details
  credential_type TEXT NOT NULL,
  credential_name TEXT NOT NULL,
  exposure_source TEXT NOT NULL,
  exposure_description TEXT NOT NULL,
  exposure_detected_at DATETIME NOT NULL,

  -- Impact assessment
  impact_assessment TEXT NOT NULL,
  affected_systems TEXT,  -- JSON array

  -- Lifecycle tracking
  contain_completed_at DATETIME,
  rotate_completed_at DATETIME,
  invalidate_completed_at DATETIME,
  verify_completed_at DATETIME,
  attest_completed_at DATETIME,
  unlock_completed_at DATETIME,

  -- Attestation
  attested_by TEXT,
  attestation_statement TEXT,

  -- Audit
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (attested_by) REFERENCES users(id)
);

-- ============================================================================
-- CCS Artifacts Table (CCS-01 through CCS-05)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ccs_artifacts (
  id TEXT PRIMARY KEY,
  incident_id TEXT NOT NULL,

  artifact_type TEXT NOT NULL CHECK (artifact_type IN (
    'CCS-01', 'CCS-02', 'CCS-03', 'CCS-04', 'CCS-05'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,  -- Markdown content

  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (incident_id) REFERENCES ccs_incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================================================
-- CCS Verification Tests Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS ccs_verification_tests (
  id TEXT PRIMARY KEY,
  incident_id TEXT NOT NULL,

  test_type TEXT NOT NULL CHECK (test_type IN (
    'OLD_REJECTED', 'NEW_SUCCESS', 'DEPENDENT_SYSTEM'
  )),
  target_system TEXT NOT NULL,
  expected_result TEXT NOT NULL,
  actual_result TEXT NOT NULL,
  passed INTEGER NOT NULL DEFAULT 0,  -- 0 = false, 1 = true

  tested_by TEXT NOT NULL,
  tested_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (incident_id) REFERENCES ccs_incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (tested_by) REFERENCES users(id)
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ccs_incidents_project ON ccs_incidents(project_id);
CREATE INDEX IF NOT EXISTS idx_ccs_incidents_status ON ccs_incidents(status);
CREATE INDEX IF NOT EXISTS idx_ccs_incidents_phase ON ccs_incidents(phase);
CREATE INDEX IF NOT EXISTS idx_ccs_artifacts_incident ON ccs_artifacts(incident_id);
CREATE INDEX IF NOT EXISTS idx_ccs_artifacts_type ON ccs_artifacts(artifact_type);
CREATE INDEX IF NOT EXISTS idx_ccs_verification_incident ON ccs_verification_tests(incident_id);
