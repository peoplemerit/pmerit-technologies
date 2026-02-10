-- Migration 022: Task Delegation Layer
-- HANDOFF-TDL-01 Task 1: task_assignments, escalation_log, standup_reports
--
-- Binds blueprint deliverables to sessions with authority scoping,
-- structured escalation, and periodic standup reporting.

-- Task assignments: binding deliverables to sessions with authority scope
CREATE TABLE IF NOT EXISTS task_assignments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  deliverable_id TEXT NOT NULL,
  session_id TEXT,

  -- Priority & ordering
  priority TEXT NOT NULL DEFAULT 'P1'
    CHECK (priority IN ('P0', 'P1', 'P2')),
  sort_order INTEGER DEFAULT 0,

  -- Status lifecycle
  status TEXT NOT NULL DEFAULT 'ASSIGNED'
    CHECK (status IN (
      'BACKLOG',
      'ASSIGNED',
      'IN_PROGRESS',
      'BLOCKED',
      'SUBMITTED',
      'ACCEPTED',
      'REJECTED',
      'PAUSED'
    )),

  -- Authority delegation
  authority_scope TEXT DEFAULT '[]',
  escalation_triggers TEXT DEFAULT '[]',

  -- Progress tracking (AI-maintained)
  progress_notes TEXT DEFAULT '',
  progress_percent INTEGER DEFAULT 0,
  completed_items TEXT DEFAULT '[]',
  remaining_items TEXT DEFAULT '[]',

  -- Blocking info
  blocked_reason TEXT,
  blocked_since TEXT,

  -- Submission
  submitted_at TEXT,
  submission_summary TEXT,
  submission_evidence TEXT DEFAULT '[]',

  -- Review
  reviewed_at TEXT,
  reviewed_by TEXT,
  review_verdict TEXT
    CHECK (review_verdict IS NULL OR review_verdict IN ('ACCEPTED', 'REJECTED')),
  review_notes TEXT,

  -- Timestamps
  assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
  assigned_by TEXT NOT NULL,
  started_at TEXT,
  completed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (deliverable_id) REFERENCES blueprint_deliverables(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES project_sessions(id) ON DELETE SET NULL
);

-- Escalation log: structured escalation records
CREATE TABLE IF NOT EXISTS escalation_log (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  assignment_id TEXT NOT NULL,

  -- Escalation content
  decision_needed TEXT NOT NULL,
  options TEXT NOT NULL DEFAULT '[]',
  recommendation TEXT,
  recommendation_rationale TEXT,

  -- Resolution
  status TEXT NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN', 'RESOLVED', 'DEFERRED')),
  resolution TEXT,
  resolved_by TEXT,
  resolved_at TEXT,

  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (assignment_id) REFERENCES task_assignments(id) ON DELETE CASCADE
);

-- Standup reports: structured periodic check-ins
CREATE TABLE IF NOT EXISTS standup_reports (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  session_id TEXT NOT NULL,

  -- Report content
  report_number INTEGER NOT NULL,
  working_on TEXT NOT NULL,
  completed_since_last TEXT DEFAULT '[]',
  in_progress TEXT DEFAULT '[]',
  blocked TEXT DEFAULT '[]',
  next_actions TEXT DEFAULT '[]',
  estimate_to_completion TEXT,
  escalations_needed TEXT DEFAULT '[]',

  -- Metadata
  message_number INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES project_sessions(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assignments_project ON task_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_assignments_session ON task_assignments(session_id);
CREATE INDEX IF NOT EXISTS idx_assignments_deliverable ON task_assignments(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON task_assignments(project_id, status);
CREATE INDEX IF NOT EXISTS idx_escalations_assignment ON escalation_log(assignment_id);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON escalation_log(project_id, status);
CREATE INDEX IF NOT EXISTS idx_standups_session ON standup_reports(session_id);
