-- Add 'day' column to sessions table for Day 1-4 (including Day 4 Orathon)
-- Run this on your Neon (or other) database to fix: column sessions.day does not exist

-- Add the column if it doesn't exist (safe to run multiple times)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'day'
  ) THEN
    ALTER TABLE sessions ADD COLUMN day VARCHAR(50) NOT NULL DEFAULT 'day-1';
    COMMENT ON COLUMN sessions.day IS 'Conference day: day-1, day-2, day-3, day-4 (Orathon)';
  END IF;
END $$;
