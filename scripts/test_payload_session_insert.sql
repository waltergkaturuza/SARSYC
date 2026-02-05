-- =====================================================
-- SQL Script: Test Payload's Session INSERT
-- Database: Neon PostgreSQL
-- Purpose: Simulate what Payload does when creating a session
-- =====================================================

-- Step 1: Get a test user ID
SELECT '=== Test User ===' as info;
SELECT id, email, role FROM users WHERE email = 'admin@sarsyc.org' LIMIT 1;

-- Step 2: Test INSERT with exact structure Payload might use
-- Payload typically generates a session ID like: sess_<timestamp>_<random>
DO $$
DECLARE
  test_user_id INTEGER;
  test_session_id VARCHAR;
  test_expires_at TIMESTAMP(3) WITH TIME ZONE;
BEGIN
  -- Get user ID
  SELECT id INTO test_user_id FROM users WHERE email = 'admin@sarsyc.org' LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  RAISE NOTICE 'Test user ID: %', test_user_id;
  
  -- Generate session ID (similar to Payload)
  test_session_id := 'sess_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
  test_expires_at := NOW() + INTERVAL '7 days';
  
  RAISE NOTICE 'Generated session ID: %', test_session_id;
  RAISE NOTICE 'Expires at: %', test_expires_at;
  
  -- Try to INSERT session (this is what Payload does)
  BEGIN
    INSERT INTO users_sessions (
      "_order",
      "_parent_id",
      "id",
      "token",
      "created_at",
      "expires_at",
      "updated_at"
    ) VALUES (
      0,
      test_user_id,
      test_session_id,
      NULL, -- Token might be NULL or set later
      NOW(),
      test_expires_at,
      NOW()
    );
    
    RAISE NOTICE '✅ INSERT successful!';
    
    -- Clean up test session
    DELETE FROM users_sessions WHERE id = test_session_id;
    RAISE NOTICE '✅ Test session cleaned up';
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ INSERT failed: %', SQLERRM;
    RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
    RAISE;
  END;
END $$;

-- Step 3: Test INSERT with minimal required fields only
SELECT '=== Testing Minimal INSERT ===' as info;
DO $$
DECLARE
  test_user_id INTEGER;
  test_session_id VARCHAR;
BEGIN
  SELECT id INTO test_user_id FROM users WHERE email = 'admin@sarsyc.org' LIMIT 1;
  test_session_id := 'test_min_' || EXTRACT(EPOCH FROM NOW())::BIGINT;
  
  -- Try INSERT with only required fields
  INSERT INTO users_sessions (
    "_order",
    "_parent_id",
    "id",
    "expires_at"
  ) VALUES (
    0,
    test_user_id,
    test_session_id,
    NOW() + INTERVAL '7 days'
  );
  
  RAISE NOTICE '✅ Minimal INSERT successful';
  
  -- Clean up
  DELETE FROM users_sessions WHERE id = test_session_id;
END $$;

-- Step 4: Test what happens if we try to INSERT with wrong data types
SELECT '=== Testing Data Type Validation ===' as info;
DO $$
DECLARE
  test_user_id INTEGER;
BEGIN
  SELECT id INTO test_user_id FROM users WHERE email = 'admin@sarsyc.org' LIMIT 1;
  
  -- This should fail if data types are wrong
  BEGIN
    INSERT INTO users_sessions (
      "_order",
      "_parent_id",
      "id",
      "expires_at"
    ) VALUES (
      'wrong_type', -- Should be integer
      test_user_id,
      'test_type_check',
      NOW() + INTERVAL '7 days'
    );
    RAISE NOTICE '⚠️  Type check passed (unexpected)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '✅ Type validation working: %', SQLERRM;
  END;
END $$;

-- Step 5: Check current table constraints
SELECT '=== Table Constraints ===' as info;
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'users_sessions'::regclass;

-- Step 6: Check column defaults
SELECT '=== Column Defaults ===' as info;
SELECT
  column_name,
  column_default,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'users_sessions'
ORDER BY ordinal_position;
