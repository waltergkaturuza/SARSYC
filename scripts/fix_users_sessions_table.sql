-- =====================================================
-- SQL Script: Fix users_sessions Table
-- Database: Neon PostgreSQL
-- Purpose: Ensure users_sessions table has all required columns
-- =====================================================
--
-- This script ensures the users_sessions table exists with all
-- required columns for Payload auth sessions.
--
-- Instructions:
-- 1. Open Neon Console: https://console.neon.tech
-- 2. Select your SARSYC database project
-- 3. Go to SQL Editor
-- 4. Paste this entire script
-- 5. Click "Run" or press Ctrl+Enter
-- =====================================================

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS users_sessions (
  id           SERIAL PRIMARY KEY,
  _parent_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token        TEXT,
  _order       INTEGER DEFAULT 0,
  created_at   TIMESTAMP(3) NOT NULL DEFAULT now(),
  updated_at   TIMESTAMP(3) NOT NULL DEFAULT now(),
  expires_at   TIMESTAMP(3)
);

-- Add missing columns if table exists but columns are missing
DO $$
BEGIN
  -- Add token column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users_sessions' AND column_name = 'token'
  ) THEN
    ALTER TABLE users_sessions ADD COLUMN token TEXT;
  END IF;

  -- Add _order column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users_sessions' AND column_name = '_order'
  ) THEN
    ALTER TABLE users_sessions ADD COLUMN _order INTEGER DEFAULT 0;
  END IF;

  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users_sessions' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE users_sessions ADD COLUMN created_at TIMESTAMP(3) NOT NULL DEFAULT now();
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users_sessions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users_sessions ADD COLUMN updated_at TIMESTAMP(3) NOT NULL DEFAULT now();
  END IF;

  -- Add expires_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users_sessions' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE users_sessions ADD COLUMN expires_at TIMESTAMP(3);
  END IF;
END $$;

-- Create indexes safely (drop first if they exist)
DROP INDEX IF EXISTS users_sessions_parent_idx;
CREATE INDEX users_sessions_parent_idx ON users_sessions (_parent_id);

DROP INDEX IF EXISTS users_sessions_token_idx;
CREATE INDEX users_sessions_token_idx ON users_sessions (token);

-- Verify the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users_sessions'
ORDER BY ordinal_position;
