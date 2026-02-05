-- =====================================================
-- SQL Script: Test Payload's Session INSERT (Neon-Compatible)
-- Database: Neon PostgreSQL
-- Purpose: Simulate what Payload does when creating a session
-- =====================================================
-- This version avoids DO blocks that Neon's SQL Editor can't EXPLAIN

-- Step 1: Get test user ID
SELECT '=== Test User ===' as info;
SELECT id, email, role FROM users WHERE email = 'admin@sarsyc.org' LIMIT 1;

-- Step 2: Test INSERT with exact structure Payload might use
-- First, let's create a test session ID
SELECT '=== Testing Session INSERT ===' as info;

-- Generate a test session ID
WITH test_data AS (
  SELECT 
    id as user_id,
    'sess_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8) as session_id,
    NOW() + INTERVAL '7 days' as expires_at
  FROM users 
  WHERE email = 'admin@sarsyc.org' 
  LIMIT 1
)
INSERT INTO users_sessions (
  "_order",
  "_parent_id",
  "id",
  "token",
  "created_at",
  "expires_at",
  "updated_at"
)
SELECT 
  0,
  user_id,
  session_id,
  NULL, -- Token might be NULL or set later
  NOW(),
  expires_at,
  NOW()
FROM test_data
RETURNING id, "_parent_id", expires_at;

-- Step 3: Clean up test session (if it was created)
DELETE FROM users_sessions 
WHERE id LIKE 'sess_%' 
  AND created_at > NOW() - INTERVAL '1 minute'
  AND "_parent_id" = (SELECT id FROM users WHERE email = 'admin@sarsyc.org' LIMIT 1);

-- Step 4: Test INSERT with minimal required fields only
SELECT '=== Testing Minimal INSERT (Required Fields Only) ===' as info;

WITH test_data AS (
  SELECT 
    id as user_id,
    'test_min_' || EXTRACT(EPOCH FROM NOW())::BIGINT as session_id
  FROM users 
  WHERE email = 'admin@sarsyc.org' 
  LIMIT 1
)
INSERT INTO users_sessions (
  "_order",
  "_parent_id",
  "id",
  "expires_at"
)
SELECT 
  0,
  user_id,
  session_id,
  NOW() + INTERVAL '7 days'
FROM test_data
RETURNING id, "_parent_id", expires_at;

-- Clean up minimal test
DELETE FROM users_sessions 
WHERE id LIKE 'test_min_%' 
  AND created_at > NOW() - INTERVAL '1 minute';

-- Step 5: Check current table constraints
SELECT '=== Table Constraints ===' as info;
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'users_sessions'::regclass;

-- Step 6: Check column defaults and nullability
SELECT '=== Column Details ===' as info;
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_name = 'users_sessions'
ORDER BY ordinal_position;

-- Step 7: Test if we can insert with NULL token (common case)
SELECT '=== Testing INSERT with NULL token ===' as info;

WITH test_data AS (
  SELECT 
    id as user_id,
    'test_null_token_' || EXTRACT(EPOCH FROM NOW())::BIGINT as session_id
  FROM users 
  WHERE email = 'admin@sarsyc.org' 
  LIMIT 1
)
INSERT INTO users_sessions (
  "_order",
  "_parent_id",
  "id",
  "token",
  "expires_at"
)
SELECT 
  0,
  user_id,
  session_id,
  NULL, -- Explicitly NULL token
  NOW() + INTERVAL '7 days'
FROM test_data
RETURNING id, token, expires_at;

-- Clean up
DELETE FROM users_sessions 
WHERE id LIKE 'test_null_token_%' 
  AND created_at > NOW() - INTERVAL '1 minute';

-- Step 8: Verify foreign key constraint works
SELECT '=== Testing Foreign Key Constraint ===' as info;
-- This should fail if FK is broken
SELECT 
  COUNT(*) as fk_test_passed
FROM users_sessions us
INNER JOIN users u ON u.id = us."_parent_id"
WHERE u.email = 'admin@sarsyc.org';

-- Step 9: Summary - Show what columns are actually required
SELECT '=== INSERT Test Summary ===' as info;
SELECT 
  'If all INSERTs above succeeded, the table structure is correct for Payload' as status,
  'Check the RETURNING clauses above to see what was inserted' as note;
