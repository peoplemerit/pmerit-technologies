-- Migration 024: Artifact State Class (HANDOFF-GFB-01 Task 2)
--
-- Extends brainstorm_artifacts.status with lifecycle semantics:
--   DRAFT      — Work in progress, fully mutable, no governance authority
--   ACTIVE     — Current governing artifact, mutable with Director approval
--   FROZEN     — Locked after REVIEW finalize, immutable, authoritative
--   HISTORICAL — Superseded by newer version, immutable, reference only
--   SUPERSEDED — Explicitly replaced via REASSESS, immutable, no authority
--
-- Note: DRAFT and SUPERSEDED already exist in current usage.
-- ACTIVE, FROZEN, and HISTORICAL are new lifecycle states.

-- Add superseded_by column for traceability
ALTER TABLE brainstorm_artifacts ADD COLUMN superseded_by TEXT DEFAULT NULL;

-- Backfill: existing artifacts in projects past BRAINSTORM → ACTIVE
UPDATE brainstorm_artifacts SET status = 'ACTIVE'
WHERE status = 'DRAFT'
  AND project_id IN (
    SELECT project_id FROM project_state
    WHERE phase NOT IN ('BRAINSTORM', 'B')
  );
