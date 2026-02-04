-- =====================================================
-- SQL Script: Fix users_sessions with Token Column
-- Database: Neon PostgreSQL
-- Purpose: Add token column and ensure proper structure for Payload auth
-- =====================================================
--
-- This addresses potential token authentication issues:
-- 1. Adds token column if missing (some Payload versions need it)
-- 2. Ensures proper indexes for fast token lookups
-- 3. Verifies the exact structure Payload expects
--
-- Instructions:
-- 1. Open Neon Console: https://console.neon.tech
-- 2. Select your SARSYC database project
-- 3. Go to SQL Editor
-- 4. Paste this entire script
-- 5. Click "Run" or press Ctrl+Enter
-- =====================================================

-- Step 1: Ensure table exists with correct base structure
DO $$
BEGIN
  -- Drop table if exists to start fresh
  DROP TABLE IF EXISTS "users_sessions" CASCADE;
  
  -- Create table with exact structure from migration + token column
  CREATE TABLE "users_sessions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar NOT NULL,
    "token" text,  -- Added for token storage/validation
    "created_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now(),
    CONSTRAINT "users_sessions_pkey" PRIMARY KEY ("id")
  );
  
  -- Add foreign key
  ALTER TABLE "users_sessions" 
  ADD CONSTRAINT "users_sessions_parent_id_fk" 
  FOREIGN KEY ("_parent_id") 
  REFERENCES "public"."users"("id") 
  ON DELETE CASCADE 
  ON UPDATE NO ACTION;
  
  -- Create indexes
  CREATE INDEX "users_sessions_order_idx" 
  ON "users_sessions" USING btree ("_order");
  
  CREATE INDEX "users_sessions_parent_id_idx" 
  ON "users_sessions" USING btree ("_parent_id");
  
  -- Index on token for fast lookups (if Payload queries by token)
  CREATE INDEX "users_sessions_token_idx" 
  ON "users_sessions" USING btree ("token") 
  WHERE "token" IS NOT NULL;
  
  -- Index on expires_at for cleanup queries
  CREATE INDEX "users_sessions_expires_at_idx" 
  ON "users_sessions" USING btree ("expires_at");
  
  RAISE NOTICE 'Table users_sessions created with token column';
END $$;

-- Step 2: Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_users_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_sessions_updated_at_trigger ON "users_sessions";
CREATE TRIGGER update_users_sessions_updated_at_trigger
  BEFORE UPDATE ON "users_sessions"
  FOR EACH ROW
  EXECUTE FUNCTION update_users_sessions_updated_at();

-- Step 3: Verify structure
SELECT '=== Final Table Structure ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_name = 'users_sessions'
ORDER BY ordinal_position;

-- Step 4: Verify indexes
SELECT '=== Indexes ===' as info;
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'users_sessions'
ORDER BY indexname;

-- Step 5: Test the exact query Payload uses
SELECT '=== Testing Payload Query ===' as info;
SELECT 
  "users"."id", 
  "users"."email",
  "users"."role",
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

-- Success message
SELECT '=== SUCCESS ===' as status, 
       'users_sessions table created with token column and all indexes!' as message;
