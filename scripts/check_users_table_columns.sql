-- =====================================================
-- SQL Script: Check Users Table Columns
-- Database: Neon PostgreSQL
-- Purpose: Verify which columns exist vs what Payload expects
-- =====================================================

-- Check all columns in users table
SELECT '=== All Users Table Columns ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check specifically for columns Payload is trying to SELECT
SELECT '=== Checking Columns Payload Expects ===' as info;
SELECT 
  column_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = column_check.column_name
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (
  VALUES 
    ('id'),
    ('first_name'),
    ('last_name'),
    ('role'),
    ('speaker_id'),
    ('abstract_id'),
    ('volunteer_id'),
    ('organization'),
    ('phone'),
    ('university'),
    ('updated_at'),
    ('created_at'),
    ('email'),
    ('reset_password_token'),
    ('reset_password_expiration'),
    ('salt'),
    ('hash'),
    ('login_attempts'),
    ('lock_until')
) AS column_check(column_name);
