-- =====================================================
-- SQL Script: Test Exact Payload Query
-- Database: Neon PostgreSQL
-- Purpose: Run the exact query Payload uses to see the actual PostgreSQL error
-- =====================================================

-- First, verify the table exists and show its structure
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

-- Check if user exists
SELECT '=== User Check ===' as info;
SELECT id, email, role FROM users WHERE email = 'admin@sarsyc.org';

-- Now try the EXACT query Payload uses (simplified to see error)
SELECT '=== Testing Subquery ===' as info;
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

-- Try the FULL query Payload uses
SELECT '=== Testing Full Query ===' as info;
SELECT 
  "users"."id", 
  "users"."first_name", 
  "users"."last_name", 
  "users"."role",
  "users"."email",
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
