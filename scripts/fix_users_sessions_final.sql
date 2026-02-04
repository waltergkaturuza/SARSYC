-- =====================================================
-- SQL Script: Final Fix for users_sessions Table
-- Database: Neon PostgreSQL
-- Purpose: Comprehensive fix that handles all edge cases
-- =====================================================
--
-- This script will:
-- 1. Check current table state
-- 2. Drop and recreate with exact Payload structure
-- 3. Verify the query works
--
-- WARNING: This will DELETE all existing sessions!
-- Users will need to log in again after running this.
--
-- Instructions:
-- 1. Open Neon Console: https://console.neon.tech
-- 2. Select your SARSYC database project
-- 3. Go to SQL Editor
-- 4. Paste this entire script
-- 5. Click "Run" or press Ctrl+Enter
-- =====================================================

-- Step 1: Check if table exists and show structure
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users_sessions') THEN
    RAISE NOTICE 'Table users_sessions EXISTS - will recreate it';
  ELSE
    RAISE NOTICE 'Table users_sessions DOES NOT EXIST - will create it';
  END IF;
END $$;

-- Step 2: Drop table if exists (CASCADE to remove dependencies)
DROP TABLE IF EXISTS "users_sessions" CASCADE;

-- Step 3: Create table with EXACT structure from Payload migration
-- Column order matters! Match exactly: _order, _parent_id, id, created_at, expires_at
CREATE TABLE "users_sessions" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar NOT NULL,
  "created_at" timestamp(3) with time zone,
  "expires_at" timestamp(3) with time zone NOT NULL,
  CONSTRAINT "users_sessions_pkey" PRIMARY KEY ("id")
);

-- Step 4: Add foreign key constraint
ALTER TABLE "users_sessions" 
ADD CONSTRAINT "users_sessions_parent_id_fk" 
FOREIGN KEY ("_parent_id") 
REFERENCES "public"."users"("id") 
ON DELETE CASCADE 
ON UPDATE NO ACTION;

-- Step 5: Create indexes (exact names from migration)
CREATE INDEX "users_sessions_order_idx" 
ON "users_sessions" USING btree ("_order");

CREATE INDEX "users_sessions_parent_id_idx" 
ON "users_sessions" USING btree ("_parent_id");

-- Step 6: Verify table structure
SELECT '=== Table Structure ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_name = 'users_sessions'
ORDER BY ordinal_position;

-- Step 7: Verify indexes
SELECT '=== Indexes ===' as info;
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'users_sessions';

-- Step 8: Test the query Payload uses (should return empty array if no sessions)
SELECT '=== Testing Payload Query ===' as info;
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
  WHERE "users_sessions"."_parent_id" = (
    SELECT id FROM users WHERE email = 'admin@sarsyc.org' LIMIT 1
  )
  ORDER BY "users_sessions"."_order" ASC
) "users_sessions";

-- Step 9: Success message
SELECT '=== SUCCESS ===' as status, 'users_sessions table created and verified!' as message;
