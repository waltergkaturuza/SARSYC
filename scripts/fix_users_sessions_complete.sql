-- =====================================================
-- SQL Script: Complete Fix for users_sessions Table
-- Database: Neon PostgreSQL
-- Purpose: Ensure users_sessions table matches Payload's exact requirements
-- =====================================================
--
-- This script will:
-- 1. Drop the table if it exists (to start fresh)
-- 2. Create it with the exact structure Payload expects
-- 3. Add all necessary indexes
-- 4. Verify the structure
--
-- WARNING: This will DELETE all existing sessions!
-- Users will need to log in again after running this.
--
-- Instructions:
-- 1. Open Neon Console: https://console.neon.tech
-- 2. Select your SARSYC database project
-- 3. Go to SQL Editor
-- 4. Paste this entire script
-- 5. Click "Run" or press Ctrl+Enter
-- =====================================================

-- Drop the table if it exists (this will delete all sessions)
DROP TABLE IF EXISTS users_sessions CASCADE;

-- Create the table with exact structure Payload expects
CREATE TABLE users_sessions (
  id           SERIAL PRIMARY KEY,
  _parent_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token        TEXT,
  _order       INTEGER DEFAULT 0,
  created_at   TIMESTAMP(3) NOT NULL DEFAULT now(),
  updated_at   TIMESTAMP(3) NOT NULL DEFAULT now(),
  expires_at   TIMESTAMP(3)
);

-- Create indexes for performance
CREATE INDEX users_sessions_parent_idx ON users_sessions (_parent_id);
CREATE INDEX users_sessions_token_idx ON users_sessions (token) WHERE token IS NOT NULL;

-- Create a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_sessions_updated_at ON users_sessions;
CREATE TRIGGER update_users_sessions_updated_at
  BEFORE UPDATE ON users_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the table structure
SELECT 
  column_name,
  data_type,
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

-- Success message
SELECT 'users_sessions table created successfully!' as status;
