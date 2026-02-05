-- =====================================================
-- Fix abstract_reviews table: Payload expects abstract_id and reviewer_id
-- Run in Neon SQL Editor if you get:
--   Failed query: ... "abstract_reviews"."abstract_id" = $1
--   (column "abstract_id" does not exist)
--
-- If the table abstract_reviews does not exist at all, run
-- create_abstract_reviews_table.sql instead.
-- =====================================================

-- Rename columns to match Payload's expected names (relationship fields use _id suffix)
ALTER TABLE "abstract_reviews" RENAME COLUMN "abstract" TO "abstract_id";
ALTER TABLE "abstract_reviews" RENAME COLUMN "reviewer" TO "reviewer_id";

-- Drop old unique constraint (it referenced old column names)
ALTER TABLE "abstract_reviews" DROP CONSTRAINT IF EXISTS "abstract_reviews_abstract_reviewer_unique";

-- Add unique constraint on new column names
ALTER TABLE "abstract_reviews"
  ADD CONSTRAINT "abstract_reviews_abstract_id_reviewer_id_unique"
  UNIQUE ("abstract_id", "reviewer_id");

-- Recreate indexes with correct column names (drop old first if they exist)
DROP INDEX IF EXISTS "abstract_reviews_abstract_idx";
DROP INDEX IF EXISTS "abstract_reviews_reviewer_idx";
CREATE INDEX IF NOT EXISTS "abstract_reviews_abstract_id_idx"
  ON "abstract_reviews" ("abstract_id");
CREATE INDEX IF NOT EXISTS "abstract_reviews_reviewer_id_idx"
  ON "abstract_reviews" ("reviewer_id");

-- Note: Foreign keys are preserved when columns are renamed; no need to re-add them.
