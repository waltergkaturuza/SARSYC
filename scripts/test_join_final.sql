-- =====================================================
-- SQL Script: Final JOIN Test (Fixed)
-- Database: Neon PostgreSQL
-- Purpose: Test the exact JOIN query Payload uses
-- =====================================================

-- Test 1: Basic lateral join (the core of Payload's query)
SELECT '=== Test 1: Basic Lateral Join ===' as info;
SELECT 
  "users"."id", 
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
LIMIT 1;

-- Test 2: Check if sessions data is empty array or NULL
SELECT '=== Test 2: Session Data Type Check ===' as info;
SELECT 
  "users"."id", 
  "users"."email",
  "users_sessions"."data" as "sessions",
  pg_typeof("users_sessions"."data") as data_type,
  CASE 
    WHEN "users_sessions"."data" IS NULL THEN 'NULL'
    WHEN json_array_length("users_sessions"."data") = 0 THEN 'Empty array []'
    ELSE 'Has sessions: ' || json_array_length("users_sessions"."data")::text
  END as session_status
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
LIMIT 1;

-- Test 3: The EXACT query from the error message (with all columns)
SELECT '=== Test 3: Exact Payload Query (All Columns) ===' as info;
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

-- Test 4: Verify all columns exist in users table
SELECT '=== Test 4: Verify Users Table Columns ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN (
    'id', 'first_name', 'last_name', 'role', 'speaker_id', 
    'abstract_id', 'volunteer_id', 'organization', 'phone', 
    'university', 'updated_at', 'created_at', 'email', 
    'reset_password_token', 'reset_password_expiration', 
    'salt', 'hash', 'login_attempts', 'lock_until'
  )
ORDER BY column_name;

-- Summary
SELECT '=== JOIN Test Summary ===' as info;
SELECT 
  'If all tests above succeeded, the JOIN query works correctly' as status,
  'The issue might be in Payload configuration or error handling' as note;
