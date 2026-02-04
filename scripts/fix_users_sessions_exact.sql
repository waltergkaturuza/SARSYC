-- =====================================================
-- SQL Script: Fix users_sessions Table (Exact Payload Structure)
-- Database: Neon PostgreSQL
-- Purpose: Recreate users_sessions table to match Payload's exact migration structure
-- =====================================================
--
-- Based on Payload migration: 20251223_130213.ts
-- This matches the EXACT structure Payload originally created
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

-- Create the table with EXACT structure from Payload migration
-- Based on: 20251223_130213.ts and 20251226_160419_add_passport_scan_nextofkin_enhancements.json
-- Note: id is VARCHAR, not SERIAL (Payload generates string IDs for sessions)
CREATE TABLE users_sessions (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "created_at" timestamp(3) with time zone,
  "expires_at" timestamp(3) with time zone NOT NULL
);

-- Add foreign key constraint (from original migration)
ALTER TABLE "users_sessions" 
ADD CONSTRAINT "users_sessions_parent_id_fk" 
FOREIGN KEY ("_parent_id") 
REFERENCES "public"."users"("id") 
ON DELETE cascade 
ON UPDATE no action;

-- Create indexes (from original migration)
CREATE INDEX "users_sessions_order_idx" 
ON "users_sessions" USING btree ("_order");

CREATE INDEX "users_sessions_parent_id_idx" 
ON "users_sessions" USING btree ("_parent_id");

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
SELECT 'users_sessions table created successfully with exact Payload structure!' as status;
