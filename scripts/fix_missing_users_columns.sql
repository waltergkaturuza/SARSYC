-- =====================================================
-- SQL Script: Fix Missing Users Table Columns
-- Database: Neon PostgreSQL
-- Purpose: Add missing columns that Payload expects
-- =====================================================

-- Step 1: Add university column (for reviewers)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'university'
  ) THEN
    ALTER TABLE users ADD COLUMN university VARCHAR;
    RAISE NOTICE '✅ Added university column';
  ELSE
    RAISE NOTICE '⚠️  university column already exists';
  END IF;
END $$;

-- Step 2: Check if speaker_id, abstract_id, volunteer_id exist
-- These might be relationship columns created by Payload
-- If they don't exist, Payload might be using a different naming convention
DO $$
BEGIN
  -- Check speaker_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'speaker_id'
  ) THEN
    -- Check if there's a speaker relationship column with different name
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name LIKE '%speaker%'
    ) THEN
      RAISE NOTICE '⚠️  speaker_id does not exist, but speaker-related column found';
    ELSE
      RAISE NOTICE '⚠️  speaker_id does not exist - Payload might use relationship table';
    END IF;
  ELSE
    RAISE NOTICE '✅ speaker_id exists';
  END IF;

  -- Check abstract_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'abstract_id'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name LIKE '%abstract%'
    ) THEN
      RAISE NOTICE '⚠️  abstract_id does not exist, but abstract-related column found';
    ELSE
      RAISE NOTICE '⚠️  abstract_id does not exist - Payload might use relationship table';
    END IF;
  ELSE
    RAISE NOTICE '✅ abstract_id exists';
  END IF;

  -- Check volunteer_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'volunteer_id'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name LIKE '%volunteer%'
    ) THEN
      RAISE NOTICE '⚠️  volunteer_id does not exist, but volunteer-related column found';
    ELSE
      RAISE NOTICE '⚠️  volunteer_id does not exist - Payload might use relationship table';
    END IF;
  ELSE
    RAISE NOTICE '✅ volunteer_id exists';
  END IF;
END $$;

-- Step 3: Verify university column was added
SELECT '=== Verifying university column ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name = 'university';

-- Step 4: Test the query again
SELECT '=== Testing Payload Query After Fix ===' as info;
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

SELECT '=== Fix Complete ===' as status;
