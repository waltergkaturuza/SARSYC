-- =====================================================
-- SQL Script: Test Direct Database Authentication
-- Database: Neon PostgreSQL
-- Purpose: Verify user credentials directly in database
-- =====================================================

-- Step 1: Check if user exists and get their details
SELECT '=== User Details ===' as info;
SELECT 
  id,
  email,
  "first_name",
  "last_name",
  role,
  hash IS NOT NULL as has_password,
  salt IS NOT NULL as has_salt,
  login_attempts,
  lock_until,
  created_at,
  updated_at
FROM users
WHERE LOWER(email) = LOWER('admin@sarsyc.org');

-- Step 2: Check if we can verify password hash
-- Note: We can't directly verify bcrypt hash in SQL, but we can check if it exists
SELECT '=== Password Hash Check ===' as info;
SELECT 
  email,
  LENGTH(hash) as hash_length,
  CASE 
    WHEN hash LIKE '$2a$%' THEN 'bcrypt (2a)'
    WHEN hash LIKE '$2b$%' THEN 'bcrypt (2b)'
    WHEN hash LIKE '$2y$%' THEN 'bcrypt (2y)'
    ELSE 'Unknown format'
  END as hash_type,
  salt IS NOT NULL as has_salt
FROM users
WHERE LOWER(email) = LOWER('admin@sarsyc.org');

-- Step 3: Check for any active sessions
SELECT '=== Active Sessions ===' as info;
SELECT 
  us.id as session_id,
  us."_parent_id" as user_id,
  us.token,
  us.created_at,
  us.expires_at,
  us."_order",
  CASE 
    WHEN us.expires_at > NOW() THEN 'Active'
    WHEN us.expires_at IS NULL THEN 'No expiry'
    ELSE 'Expired'
  END as session_status
FROM users_sessions us
JOIN users u ON u.id = us."_parent_id"
WHERE LOWER(u.email) = LOWER('admin@sarsyc.org')
ORDER BY us.created_at DESC;

-- Step 4: Test the exact query Payload uses (simplified)
SELECT '=== Testing Payload Query ===' as info;
SELECT 
  u.id,
  u.email,
  u.role,
  COALESCE(
    (
      SELECT json_agg(
        json_build_array(
          us."_order",
          us.id,
          us.created_at,
          us.expires_at
        ) ORDER BY us."_order" ASC
      )
      FROM users_sessions us
      WHERE us."_parent_id" = u.id
    ),
    '[]'::json
  ) as sessions
FROM users u
WHERE LOWER(u.email) = LOWER('admin@sarsyc.org');

-- Step 5: Check if there are any database errors or constraints
SELECT '=== Table Constraints ===' as info;
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'users_sessions'::regclass;
