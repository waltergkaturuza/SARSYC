-- =====================================================
-- SQL Script: Diagnose users_sessions Table
-- Database: Neon PostgreSQL
-- Purpose: Check current state of users_sessions table
-- =====================================================
--
-- Run this FIRST to see what's wrong before fixing
--

-- Check if table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'users_sessions'
    ) 
    THEN 'Table EXISTS' 
    ELSE 'Table DOES NOT EXIST' 
  END as table_status;

-- Show all columns in the table (if it exists)
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_name = 'users_sessions'
ORDER BY ordinal_position;

-- Show indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'users_sessions';

-- Show constraints
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'users_sessions'::regclass;

-- Try to count rows (will fail if table doesn't exist)
SELECT 
  COUNT(*) as total_sessions,
  COUNT(DISTINCT _parent_id) as unique_users
FROM users_sessions;

-- Check if foreign key to users table exists
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'users_sessions';
