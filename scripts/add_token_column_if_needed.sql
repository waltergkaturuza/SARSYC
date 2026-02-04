-- =====================================================
-- SQL Script: Add token column to users_sessions if needed
-- Database: Neon PostgreSQL
-- Purpose: Some Payload versions might need a token column
-- =====================================================

-- Check if token column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users_sessions' AND column_name = 'token'
  ) THEN
    RAISE NOTICE 'Adding token column to users_sessions...';
    ALTER TABLE "users_sessions" ADD COLUMN "token" TEXT;
    CREATE INDEX IF NOT EXISTS "users_sessions_token_idx" 
    ON "users_sessions" ("token") WHERE "token" IS NOT NULL;
    RAISE NOTICE 'Token column added successfully!';
  ELSE
    RAISE NOTICE 'Token column already exists.';
  END IF;
END $$;

-- Verify structure
SELECT '=== Updated Table Structure ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_name = 'users_sessions'
ORDER BY ordinal_position;

-- Show indexes
SELECT '=== Indexes ===' as info;
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'users_sessions';
