-- =====================================================
-- SQL Script: Complete Password Reset and Verification
-- Database: Neon PostgreSQL
-- Purpose: Reset password and verify all authentication fields
-- =====================================================

-- Step 1: Check current state
SELECT '=== Current Account State ===' as info;
SELECT 
  id,
  email,
  LOWER(email) as email_lowercase,
  hash IS NOT NULL as has_hash,
  LENGTH(hash) as hash_length,
  LEFT(hash, 10) as hash_preview,
  salt,
  login_attempts,
  lock_until,
  CASE 
    WHEN lock_until IS NULL THEN 'Not locked'
    WHEN lock_until > NOW() THEN 'LOCKED'
    ELSE 'Lock expired'
  END as lock_status
FROM users
WHERE LOWER(email) = LOWER('admin@sarsyc.org');

-- Step 2: Complete reset - password, lock, attempts
-- Password: Admin@1234
-- Hash: $2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq
UPDATE users
SET 
  hash = '$2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq',
  salt = NULL,
  login_attempts = 0,
  lock_until = NULL,
  reset_password_token = NULL,
  reset_password_expiration = NULL,
  updated_at = NOW()
WHERE LOWER(email) = LOWER('admin@sarsyc.org');

-- Step 3: Verify reset
SELECT '=== After Reset ===' as info;
SELECT 
  id,
  email,
  CASE 
    WHEN hash = '$2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq' THEN '✅ Password hash correct'
    ELSE '❌ Password hash incorrect'
  END as password_status,
  CASE 
    WHEN lock_until IS NULL AND login_attempts = 0 THEN '✅ Account unlocked'
    ELSE '⚠️  Account still has issues'
  END as account_status,
  login_attempts,
  lock_until
FROM users
WHERE LOWER(email) = LOWER('admin@sarsyc.org');

-- Step 4: Test email lookup (case-insensitive)
SELECT '=== Testing Email Lookup ===' as info;
SELECT 
  id,
  email,
  'Found' as status
FROM users
WHERE LOWER(email) = LOWER('admin@sarsyc.org');

SELECT '=== Reset Complete ===' as status;
SELECT 
  'Password: Admin@1234' as credentials,
  'Email: admin@sarsyc.org' as email,
  'Make sure to select "Admin" role on login page' as note;
