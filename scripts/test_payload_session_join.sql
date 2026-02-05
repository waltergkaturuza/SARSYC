-- =====================================================
-- SQL Script: Test Payload's Session JOIN Query
-- Database: Neon PostgreSQL
-- Purpose: Simulate the exact JOIN query Payload uses when loading users
-- =====================================================

-- This is the EXACT query Payload uses (from the error message)
-- We'll test it step by step to find where it fails

-- Step 1: Test the lateral join subquery in isolation
SELECT '=== Testing Lateral Join Subquery ===' as info;
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

-- Step 2: Test the full query with a specific user
SELECT '=== Testing Full Query for Specific User ===' as info;
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

-- Step 3: Test with a user that has no sessions (should return empty array)
SELECT '=== Testing User with No Sessions ===' as info;
SELECT 
  "users"."id", 
  "users"."email",
  "users_sessions"."data" as "sessions",
  CASE 
    WHEN "users_sessions"."data"::text = '[]' THEN 'Empty array (correct)'
    WHEN "users_sessions"."data" IS NULL THEN 'NULL (might be issue)'
    WHEN json_array_length("users_sessions"."data") = 0 THEN 'Empty array (correct)'
    ELSE 'Has sessions'
  END as session_status,
  json_array_length("users_sessions"."data") as session_count
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

-- Step 4: Test if column names are case-sensitive
SELECT '=== Testing Column Name Case Sensitivity ===' as info;
-- Try accessing columns with different cases
SELECT 
  "_order" as order_col,
  "_parent_id" as parent_id_col,
  "id" as id_col,
  "created_at" as created_at_col,
  "expires_at" as expires_at_col
FROM "users_sessions"
LIMIT 1;

-- Step 5: Check if there are any NULL values causing issues
SELECT '=== Checking for NULL Values ===' as info;
SELECT 
  COUNT(*) as total_sessions,
  COUNT("_order") as non_null_order,
  COUNT("_parent_id") as non_null_parent_id,
  COUNT("id") as non_null_id,
  COUNT("created_at") as non_null_created_at,
  COUNT("expires_at") as non_null_expires_at
FROM "users_sessions";

-- Step 6: Test ordering by _order (this is critical for Payload)
SELECT '=== Testing ORDER BY _order ===' as info;
SELECT 
  "_order",
  "id",
  "_parent_id"
FROM "users_sessions"
ORDER BY "_order" ASC
LIMIT 5;

-- Step 7: Test the exact query structure Payload uses (with all columns from error)
SELECT '=== Testing Exact Payload Query Structure ===' as info;
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
