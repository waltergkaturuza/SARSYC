-- =====================================================
-- SQL Script: Create Abstract Reviews Table
-- Database: Neon PostgreSQL
-- Collection: abstract-reviews
-- =====================================================
--
-- This script creates the database table for storing individual
-- reviewer evaluations of abstracts. Run it directly in Neon's
-- SQL editor if the table hasn't been created automatically.
--
-- Instructions:
-- 1. Open Neon Console: https://console.neon.tech
-- 2. Select your SARSYC database project
-- 3. Go to the SQL Editor
-- 4. Paste this entire script
-- 5. Click "Run" or press Ctrl+Enter
-- =====================================================

-- Create the main abstract_reviews table
CREATE TABLE IF NOT EXISTS "abstract_reviews" (
  "id" serial PRIMARY KEY,
  "abstract" integer NOT NULL,
  "reviewer" integer NOT NULL,
  "score" integer NOT NULL DEFAULT 0,
  "recommendation" varchar(50) NOT NULL DEFAULT 'accept',
  "confidence" varchar(50),
  "comments" text,
  "created_at" timestamp(3) DEFAULT now() NOT NULL,
  "updated_at" timestamp(3) DEFAULT now() NOT NULL,
  CONSTRAINT "abstract_reviews_abstract_reviewer_unique" UNIQUE ("abstract", "reviewer")
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "abstract_reviews_abstract_idx"
  ON "abstract_reviews" ("abstract");

CREATE INDEX IF NOT EXISTS "abstract_reviews_reviewer_idx"
  ON "abstract_reviews" ("reviewer");

CREATE INDEX IF NOT EXISTS "abstract_reviews_created_at_idx"
  ON "abstract_reviews" ("created_at");

-- Foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'abstract_reviews_abstract_fkey'
  ) THEN
    ALTER TABLE "abstract_reviews"
    ADD CONSTRAINT "abstract_reviews_abstract_fkey"
    FOREIGN KEY ("abstract") REFERENCES "abstracts"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'abstract_reviews_reviewer_fkey'
  ) THEN
    ALTER TABLE "abstract_reviews"
    ADD CONSTRAINT "abstract_reviews_reviewer_fkey"
    FOREIGN KEY ("reviewer") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure payload_locked_documents_rels can reference the new collection (for document locking)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payload_locked_documents_rels'
      AND column_name = 'abstract_reviews_id'
  ) THEN
    ALTER TABLE "payload_locked_documents_rels"
    ADD COLUMN "abstract_reviews_id" integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payload_locked_documents_rels_abstract_reviews_id_fkey'
  ) THEN
    ALTER TABLE "payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_abstract_reviews_id_fkey"
    FOREIGN KEY ("abstract_reviews_id")
    REFERENCES "abstract_reviews"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- Trigger to keep updated_at in sync (self-contained, no dependency on a global function)
CREATE OR REPLACE FUNCTION update_abstract_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_abstract_reviews_updated_at ON abstract_reviews;
CREATE TRIGGER update_abstract_reviews_updated_at
  BEFORE UPDATE ON abstract_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_abstract_reviews_updated_at();
