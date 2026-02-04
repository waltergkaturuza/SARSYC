-- =====================================================
-- SQL Script: Reset Admin Password Directly in Neon
-- Database: Neon PostgreSQL
-- Purpose: Reset password for admin@sarsyc.org
-- =====================================================
--
-- This script updates the password hash directly in the database.
-- The hash is a bcrypt hash for password: Admin@1234
--
-- Instructions:
-- 1. Open Neon Console: https://console.neon.tech
-- 2. Select your SARSYC database project
-- 3. Go to SQL Editor
-- 4. Paste this entire script
-- 5. Click "Run" or press Ctrl+Enter
-- =====================================================

-- Reset password for admin@sarsyc.org
-- Password: Admin@1234
-- Bcrypt hash (includes salt): $2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq
UPDATE users
SET 
  hash = '$2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq',
  salt = NULL,  -- bcrypt includes salt in the hash, so clear separate salt column
  login_attempts = 0,  -- Reset failed login attempts
  lock_until = NULL,  -- Unlock account if locked
  reset_password_token = NULL,  -- Clear any reset tokens
  reset_password_expiration = NULL
WHERE LOWER(email) = LOWER('admin@sarsyc.org');

-- Verify the update
SELECT 
  email,
  role,
  hash IS NOT NULL as has_password,
  salt IS NOT NULL as has_salt,
  login_attempts,
  lock_until,
  reset_password_token IS NOT NULL as has_reset_token
FROM users
WHERE LOWER(email) = LOWER('admin@sarsyc.org');
