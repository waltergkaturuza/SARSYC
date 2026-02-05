-- =====================================================
-- SQL Script: Diagnose Which INSERT Failed
-- Database: Neon PostgreSQL
-- Purpose: Test each INSERT operation individually to find the failure
-- =====================================================

-- Test 1: Full INSERT with all columns (including token and updated_at)
SELECT '=== Test 1: Full INSERT (All Columns) ===' as info;
WITH test_data AS (
  SELECT 
    id as user_id,
    'test_full_' || EXTRACT(EPOCH FROM NOW())::BIGINT as session_id,
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
  NULL,
  NOW(),
  expires_at,
  NOW()
FROM test_data
RETURNING id, "_parent_id", expires_at, token, created_at, updated_at;

-- Clean up
DELETE FROM users_sessions WHERE id LIKE 'test_full_%' AND created_at > NOW() - INTERVAL '1 minute';

-- Test 2: Minimal INSERT (only required fields - NO token, NO updated_at)
SELECT '=== Test 2: Minimal INSERT (Required Fields Only) ===' as info;
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
RETURNING id, "_parent_id", expires_at, token, created_at, updated_at;

-- Clean up
DELETE FROM users_sessions WHERE id LIKE 'test_min_%' AND created_at > NOW() - INTERVAL '1 minute';

-- Test 3: INSERT with token column but NULL value
SELECT '=== Test 3: INSERT with NULL Token ===' as info;
WITH test_data AS (
  SELECT 
    id as user_id,
    'test_token_' || EXTRACT(EPOCH FROM NOW())::BIGINT as session_id
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
  NULL,
  NOW() + INTERVAL '7 days'
FROM test_data
RETURNING id, "_parent_id", expires_at, token;

-- Clean up
DELETE FROM users_sessions WHERE id LIKE 'test_token_%' AND created_at > NOW() - INTERVAL '1 minute';

-- Test 4: INSERT with updated_at column
SELECT '=== Test 4: INSERT with updated_at ===' as info;
WITH test_data AS (
  SELECT 
    id as user_id,
    'test_updated_' || EXTRACT(EPOCH FROM NOW())::BIGINT as session_id
  FROM users 
  WHERE email = 'admin@sarsyc.org' 
  LIMIT 1
)
INSERT INTO users_sessions (
  "_order",
  "_parent_id",
  "id",
  "expires_at",
  "updated_at"
)
SELECT 
  0,
  user_id,
  session_id,
  NOW() + INTERVAL '7 days',
  NOW()
FROM test_data
RETURNING id, "_parent_id", expires_at, updated_at;

-- Clean up
DELETE FROM users_sessions WHERE id LIKE 'test_updated_%' AND created_at > NOW() - INTERVAL '1 minute';

-- Summary: Show which tests passed/failed
SELECT '=== INSERT Test Summary ===' as info;
SELECT 
  'If you see results above, those INSERTs succeeded' as note,
  'If any INSERT failed, check the error message above' as troubleshooting;
