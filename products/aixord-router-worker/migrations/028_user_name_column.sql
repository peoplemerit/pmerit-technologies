-- Migration 028: Add name column to users table (MED-15)
-- The frontend sends a display name during registration but the backend
-- never persisted it. This adds the column so auth.ts can store it.

ALTER TABLE users ADD COLUMN name TEXT;
