-- =====================================================
-- SQL Script: Create Youth Steering Committee Table
-- Database: Neon PostgreSQL
-- Collection: youth-steering-committee
-- =====================================================
-- 
-- This script creates the database table for the Youth Steering Committee collection.
-- Run this directly in Neon's SQL editor if the migration hasn't run automatically.
--
-- Instructions:
-- 1. Open Neon Console: https://console.neon.tech
-- 2. Select your database
-- 3. Go to SQL Editor
-- 4. Paste this entire script
-- 5. Click "Run" or press Ctrl+Enter
-- =====================================================

-- Create the main youth_steering_committee table
CREATE TABLE IF NOT EXISTS "youth_steering_committee" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "role" text NOT NULL,
  "organization" text NOT NULL,
  "country" text NOT NULL,
  "bio" jsonb NOT NULL,
  "email" text,
  "photo" integer,
  "featured" boolean DEFAULT false,
  "order" integer DEFAULT 0,
  "social_media" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp(3) DEFAULT now() NOT NULL,
  "updated_at" timestamp(3) DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "youth_steering_committee_photo_idx" 
  ON "youth_steering_committee" ("photo");

CREATE INDEX IF NOT EXISTS "youth_steering_committee_featured_idx" 
  ON "youth_steering_committee" ("featured");

CREATE INDEX IF NOT EXISTS "youth_steering_committee_order_idx" 
  ON "youth_steering_committee" ("order");

CREATE INDEX IF NOT EXISTS "youth_steering_committee_country_idx" 
  ON "youth_steering_committee" ("country");

CREATE INDEX IF NOT EXISTS "youth_steering_committee_created_at_idx" 
  ON "youth_steering_committee" ("created_at");

-- Add foreign key constraint for photo relationship to media table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'youth_steering_committee_photo_fkey'
  ) THEN
    ALTER TABLE "youth_steering_committee"
    ADD CONSTRAINT "youth_steering_committee_photo_fkey"
    FOREIGN KEY ("photo") REFERENCES "media"("id") ON DELETE SET NULL;
  END IF;
END $$;

-- Add relationship column to payload_locked_documents_rels if it doesn't exist
-- (This is needed for Payload CMS document locking feature)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payload_locked_documents_rels' 
    AND column_name = 'youth_steering_committee_id'
  ) THEN
    ALTER TABLE "payload_locked_documents_rels" 
    ADD COLUMN "youth_steering_committee_id" integer;
  END IF;
END $$;

-- Add foreign key for document locking relationship
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payload_locked_documents_rels_youth_steering_committee_fk'
  ) THEN
    ALTER TABLE "payload_locked_documents_rels" 
    ADD CONSTRAINT "payload_locked_documents_rels_youth_steering_committee_fk" 
    FOREIGN KEY ("youth_steering_committee_id") 
    REFERENCES "public"."youth_steering_committee"("id") 
    ON DELETE cascade 
    ON UPDATE no action;
  END IF;
END $$;

-- Create index for document locking relationship
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_youth_steering_committee_id_idx" 
  ON "payload_locked_documents_rels" ("youth_steering_committee_id");

-- Verify table was created successfully
SELECT 
  'Table created successfully!' as status,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'youth_steering_committee';

-- Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'youth_steering_committee'
ORDER BY ordinal_position;
