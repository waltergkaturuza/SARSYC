-- =====================================================
-- SQL Script: Check Admin User Role and Status
-- Database: Neon PostgreSQL
-- Purpose: Check user details for admin@sarsyc.org
-- =====================================================
--
-- This script queries the users table to check:
-- - User ID
-- - Email
-- - Role
-- - Account lock status
-- - Password reset token status
-- - Other user details
--
-- Instructions:
-- 1. Open Neon Console: https://console.neon.tech
-- 2. Select your SARSYC database project
-- 3. Go to SQL Editor
-- 4. Paste this entire script
-- 5. Click "Run" or press Ctrl+Enter
-- =====================================================

-- Check user by email
SELECT 
  id,
  email,
  "firstName",
  "lastName",
  role,
  organization,
  "lockUntil",
  CASE 
    WHEN "resetPasswordToken" IS NOT NULL THEN 'Token exists'
    ELSE 'No reset token'
  END as reset_token_status,
  "resetPasswordExpiration",
  "createdAt",
  "updatedAt"
FROM users
WHERE LOWER(email) = LOWER('admin@sarsyc.org');

-- Also check if user exists at all
SELECT 
  COUNT(*) as user_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'User EXISTS in database'
    ELSE 'User NOT FOUND in database'
  END as status
FROM users
WHERE LOWER(email) = LOWER('admin@sarsyc.org');

-- List all admin/editor users (in case email is different)
SELECT 
  id,
  email,
  role,
  "firstName",
  "lastName",
  "createdAt"
FROM users
WHERE role IN ('admin', 'editor')
ORDER BY "createdAt" DESC
LIMIT 10;
