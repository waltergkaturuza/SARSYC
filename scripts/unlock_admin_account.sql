-- =====================================================
-- SQL Script: Unlock Admin Account
-- Database: Neon PostgreSQL
-- Purpose: Unlock the admin account that got locked due to failed login attempts
-- =====================================================

-- Step 1: Check current lock status
SELECT '=== Current Lock Status ===' as info;
SELECT 
  id,
  email,
  login_attempts,
  lock_until,
  CASE 
    WHEN lock_until IS NULL THEN 'Not locked'
    WHEN lock_until > NOW() THEN 'LOCKED until ' || lock_until::text
    ELSE 'Lock expired (should be unlocked)'
  END as lock_status
FROM users
WHERE email = 'admin@sarsyc.org';

-- Step 2: Unlock the account
UPDATE users
SET 
  login_attempts = 0,
  lock_until = NULL
WHERE email = 'admin@sarsyc.org';

-- Step 3: Verify unlock
SELECT '=== After Unlock ===' as info;
SELECT 
  id,
  email,
  login_attempts,
  lock_until,
  CASE 
    WHEN lock_until IS NULL AND login_attempts = 0 THEN '✅ UNLOCKED'
    ELSE '⚠️  Still locked or has attempts'
  END as status
FROM users
WHERE email = 'admin@sarsyc.org';

SELECT '=== Unlock Complete ===' as status;
SELECT 'Account unlocked. You can now try logging in again.' as message;
