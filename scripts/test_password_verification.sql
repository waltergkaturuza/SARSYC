-- =====================================================
-- SQL Script: Test Password Verification
-- Database: Neon PostgreSQL
-- Purpose: Verify password hash format and test if it can be verified
-- =====================================================

-- Step 1: Check current password hash
SELECT '=== Current Password Hash Status ===' as info;
SELECT 
  id,
  email,
  hash,
  LENGTH(hash) as hash_length,
  LEFT(hash, 7) as hash_prefix,
  CASE 
    WHEN hash LIKE '$2a$%' THEN 'bcrypt (2a)'
    WHEN hash LIKE '$2b$%' THEN 'bcrypt (2b) - CORRECT FORMAT'
    WHEN hash LIKE '$2y$%' THEN 'bcrypt (2y)'
    WHEN hash IS NULL THEN '❌ NO PASSWORD HASH'
    ELSE '❌ UNKNOWN FORMAT'
  END as hash_format,
  salt,
  login_attempts,
  lock_until
FROM users
WHERE email = 'admin@sarsyc.org';

-- Step 2: Verify hash matches expected value for 'Admin@1234'
-- Expected hash: $2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq
SELECT '=== Password Hash Verification ===' as info;
SELECT 
  email,
  CASE 
    WHEN hash = '$2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq' THEN '✅ Hash matches expected value (Admin@1234)'
    WHEN hash IS NULL THEN '❌ NO HASH - Password not set'
    WHEN LENGTH(hash) < 50 THEN '❌ Hash too short - Invalid'
    ELSE '⚠️  Hash does NOT match expected value'
  END as hash_status,
  hash as current_hash_value
FROM users
WHERE email = 'admin@sarsyc.org';

-- Step 3: Reset password to known value
-- This ensures the hash is correct for 'Admin@1234'
UPDATE users
SET 
  hash = '$2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq',
  salt = NULL,
  login_attempts = 0,
  lock_until = NULL,
  updated_at = NOW()
WHERE email = 'admin@sarsyc.org';

-- Step 4: Verify the reset
SELECT '=== After Password Reset ===' as info;
SELECT 
  id,
  email,
  LEFT(hash, 30) as hash_preview,
  CASE 
    WHEN hash = '$2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq' THEN '✅ Password correctly set to Admin@1234'
    ELSE '❌ Password hash mismatch'
  END as password_status,
  login_attempts,
  lock_until,
  updated_at
FROM users
WHERE email = 'admin@sarsyc.org';

SELECT '=== Instructions ===' as info;
SELECT 
  'Password has been reset. Try logging in with:' as step1,
  'Email: admin@sarsyc.org' as step2,
  'Password: Admin@1234' as step3,
  'Make sure to select "Admin" role on login page' as step4;
