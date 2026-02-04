-- =====================================================
-- SQL Script: Check Password Hash Directly
-- Database: Neon PostgreSQL
-- Purpose: Verify the exact password hash in database
-- =====================================================

-- Check the exact hash value
SELECT '=== Password Hash Details ===' as info;
SELECT 
  id,
  email,
  hash as full_hash,
  LENGTH(hash) as hash_length,
  LEFT(hash, 7) as hash_prefix,
  CASE 
    WHEN hash = '$2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq' THEN '✅ MATCHES Expected (Admin@1234)'
    WHEN hash LIKE '$2b$10$%' THEN '⚠️  Wrong hash (bcrypt format correct but value wrong)'
    WHEN hash IS NULL THEN '❌ NO HASH'
    ELSE '❌ WRONG FORMAT'
  END as hash_status,
  salt,
  login_attempts,
  lock_until
FROM users
WHERE LOWER(email) = LOWER('admin@sarsyc.org');

-- Expected hash for 'Admin@1234':
-- $2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq

-- If hash doesn't match, reset it:
UPDATE users
SET 
  hash = '$2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq',
  salt = NULL,
  login_attempts = 0,
  lock_until = NULL
WHERE LOWER(email) = LOWER('admin@sarsyc.org');

-- Verify after reset
SELECT '=== After Reset ===' as info;
SELECT 
  email,
  CASE 
    WHEN hash = '$2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq' THEN '✅ Password hash correct'
    ELSE '❌ Still wrong'
  END as status,
  hash as current_hash
FROM users
WHERE LOWER(email) = LOWER('admin@sarsyc.org');
