-- =====================================================
-- SQL Script: Verify Password Hash
-- Database: Neon PostgreSQL
-- Purpose: Check if password hash is correct and can be verified
-- =====================================================

-- Step 1: Check current password hash
SELECT '=== Current Password Hash ===' as info;
SELECT 
  id,
  email,
  LENGTH(hash) as hash_length,
  LEFT(hash, 10) as hash_preview,
  CASE 
    WHEN hash LIKE '$2a$%' THEN 'bcrypt (2a)'
    WHEN hash LIKE '$2b$%' THEN 'bcrypt (2b) - CORRECT'
    WHEN hash LIKE '$2y$%' THEN 'bcrypt (2y)'
    ELSE 'Unknown format'
  END as hash_type,
  salt,
  login_attempts,
  lock_until
FROM users
WHERE email = 'admin@sarsyc.org';

-- Step 2: Check if we need to reset password
-- The hash should be: $2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq
-- This is the hash for 'Admin@1234'
SELECT '=== Password Hash Check ===' as info;
SELECT 
  CASE 
    WHEN hash = '$2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq' THEN '✅ Password hash matches expected value'
    ELSE '⚠️  Password hash does NOT match expected value'
  END as hash_match_status,
  hash as current_hash
FROM users
WHERE email = 'admin@sarsyc.org';

-- Step 3: Reset password to known value (Admin@1234)
-- This is the bcrypt hash for 'Admin@1234'
UPDATE users
SET 
  hash = '$2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq',
  salt = NULL,
  login_attempts = 0,
  lock_until = NULL,
  updated_at = NOW()
WHERE email = 'admin@sarsyc.org';

-- Step 4: Verify reset
SELECT '=== After Password Reset ===' as info;
SELECT 
  id,
  email,
  LEFT(hash, 20) as hash_preview,
  CASE 
    WHEN hash = '$2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq' THEN '✅ Password set correctly'
    ELSE '❌ Password hash mismatch'
  END as password_status,
  login_attempts,
  lock_until
FROM users
WHERE email = 'admin@sarsyc.org';

SELECT '=== Password Reset Complete ===' as status;
SELECT 'Password has been reset to: Admin@1234' as message;
SELECT 'Try logging in with: admin@sarsyc.org / Admin@1234' as instructions;
