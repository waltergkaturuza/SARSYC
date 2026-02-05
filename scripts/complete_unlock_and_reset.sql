-- =====================================================
-- SQL Script: Complete Account Unlock and Reset
-- Database: Neon PostgreSQL
-- Purpose: Fully unlock admin account and reset all lock-related fields
-- =====================================================

-- Step 1: Check current status
SELECT '=== Current Account Status ===' as info;
SELECT 
  id,
  email,
  login_attempts,
  lock_until,
  CASE 
    WHEN lock_until IS NULL THEN 'Not locked'
    WHEN lock_until > NOW() THEN 'LOCKED until ' || lock_until::text
    ELSE 'Lock expired'
  END as lock_status,
  updated_at
FROM users
WHERE email = 'admin@sarsyc.org';

-- Step 2: Complete unlock and reset
UPDATE users
SET 
  login_attempts = 0,
  lock_until = NULL,
  updated_at = NOW()
WHERE email = 'admin@sarsyc.org';

-- Step 3: Verify unlock
SELECT '=== After Unlock ===' as info;
SELECT 
  id,
  email,
  login_attempts,
  lock_until,
  updated_at,
  CASE 
    WHEN lock_until IS NULL AND login_attempts = 0 THEN '✅ UNLOCKED'
    WHEN lock_until IS NULL AND login_attempts > 0 THEN '⚠️  Unlocked but has ' || login_attempts || ' attempts'
    WHEN lock_until IS NOT NULL THEN '❌ Still locked until ' || lock_until::text
    ELSE '⚠️  Unknown status'
  END as status
FROM users
WHERE email = 'admin@sarsyc.org';

-- Step 4: Test query (simulate what login does)
SELECT '=== Testing User Query (Like Login Does) ===' as info;
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  login_attempts,
  lock_until,
  CASE 
    WHEN lock_until IS NULL THEN '✅ Ready to login'
    WHEN lock_until > NOW() THEN '❌ Locked'
    ELSE '✅ Lock expired, ready to login'
  END as login_status
FROM users
WHERE email = 'admin@sarsyc.org';

SELECT '=== Unlock Complete ===' as status;
SELECT 'Account has been unlocked. Try logging in now!' as message;
