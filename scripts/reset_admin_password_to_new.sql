-- =====================================================
-- SQL Script: Reset Admin Password
-- Database: Neon PostgreSQL
-- Purpose: Fix admin login for admin@sarsyc.org
-- =====================================================
--
-- Run this in Neon SQL Editor if the new password isn't working.
-- Also unlocks the account and clears failed login attempts.
--
-- =====================================================

UPDATE users
SET 
  hash = '$2b$10$mbZeuksk5y8EBQjNMQoS1eQHB89QguNECuU3Q.oawrvQnkPauwgbi',
  salt = NULL,
  login_attempts = 0,
  lock_until = NULL,
  reset_password_token = NULL,
  reset_password_expiration = NULL
WHERE LOWER(email) = LOWER('admin@sarsyc.org');

-- Verify
SELECT 
  email,
  role,
  hash IS NOT NULL as has_password,
  login_attempts,
  lock_until
FROM users
WHERE LOWER(email) = LOWER('admin@sarsyc.org');
