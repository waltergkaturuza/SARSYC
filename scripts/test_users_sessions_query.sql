-- =====================================================
-- SQL Script: Test the Exact Query Payload Uses
-- Database: Neon PostgreSQL
-- Purpose: Run the exact query Payload uses to see the actual error
-- =====================================================

-- First, let's verify the table exists and has data
SELECT 'Table exists check:' as test;
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_name = 'users_sessions';

-- Check if user exists
SELECT 'User exists check:' as test;
SELECT id, email, role FROM users WHERE email = 'admin@sarsyc.org';

-- Now try the exact subquery Payload uses (for a specific user)
SELECT 'Testing subquery for user:' as test;
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

-- Try the full query Payload uses
SELECT 'Testing full query:' as test;
SELECT 
  "users"."id", 
  "users"."first_name", 
  "users"."last_name", 
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
