-- =====================================================
-- Fix Edit User "Failed query": add abstract_reviews_id to payload_locked_documents_rels
-- Payload document locking expects this column when you have the abstract-reviews collection.
-- Run in Neon SQL Editor if Edit User page fails with a query mentioning abstract_reviews_id.
-- =====================================================

-- Add column if missing (abstract_reviews table must exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND column_name = 'abstract_reviews_id'
  ) THEN
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "abstract_reviews_id" integer;
  END IF;
END $$;

-- Foreign key (skip if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payload_locked_documents_rels_abstract_reviews_id_fkey'
  ) THEN
    ALTER TABLE "payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_abstract_reviews_id_fkey"
    FOREIGN KEY ("abstract_reviews_id") REFERENCES "abstract_reviews"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- Index for the query
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_abstract_reviews_id_idx"
  ON "payload_locked_documents_rels" ("abstract_reviews_id");
