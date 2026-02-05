-- =====================================================
-- SQL Script: Add university column to users table
-- Database: Neon PostgreSQL
-- Purpose: Add the missing university column that Payload expects
-- =====================================================

-- Check if column exists
SELECT '=== Checking if university column exists ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name = 'university';

-- Add column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'university'
  ) THEN
    ALTER TABLE users ADD COLUMN university VARCHAR;
    RAISE NOTICE '✅ Added university column to users table';
  ELSE
    RAISE NOTICE '⚠️  university column already exists';
  END IF;
END $$;

-- Verify the column was added
SELECT '=== Verifying university column ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name = 'university';

-- Test the query again
SELECT '=== Testing Query with university column ===' as info;
SELECT 
  "users"."id", 
  "users"."first_name", 
  "users"."last_name", 
  "users"."role", 
  "users"."speaker_id", 
  "users"."abstract_id", 
  "users"."volunteer_id", 
  "users"."organization", 
  "users"."phone", 
  "users"."university", 
  "users"."updated_at", 
  "users"."created_at", 
  "users"."email", 
  "users"."reset_password_token", 
  "users"."reset_password_expiration", 
  "users"."salt", 
  "users"."hash", 
  "users"."login_attempts", 
  "users"."lock_until", 
  "users_sessions"."data" as "sessions"
FROM "users" "users"
LEFT JOIN LATERAL (
  SELECT 
    coalesce(
      json_agg(
        json_build_array(
          "users_sessions"."_order", 
          "users_sessions"."id", 
          "users_sessions"."created_at", 
          "users_sessions"."expires_at"
        ) ORDER BY "users_sessions"."_order" ASC
      ), 
      '[]'::json
    ) as "data"
  FROM (
    SELECT * 
    FROM "users_sessions" "users_sessions" 
    WHERE "users_sessions"."_parent_id" = "users"."id"
    ORDER BY "users_sessions"."_order" ASC
  ) "users_sessions"
) "users_sessions" ON true
WHERE "users"."email" = 'admin@sarsyc.org'
ORDER BY "users"."created_at" DESC
LIMIT 1;

SELECT '=== SUCCESS ===' as status, 'university column added and query tested!' as message;
