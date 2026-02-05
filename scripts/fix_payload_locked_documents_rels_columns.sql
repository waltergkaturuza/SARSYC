-- =====================================================
-- Fix Edit User "Failed query": ensure payload_locked_documents_rels
-- has every collection column the document-lock query expects.
-- Run in Neon SQL Editor. Safe to run multiple times.
-- =====================================================

-- Add any missing collection ID columns (no FK - avoids dependency on table existing)
DO $$
DECLARE
  cols text[] := ARRAY[
    'participants_id', 'newsletter_subscriptions_id', 'contact_messages_id',
    'sponsorship_tiers_id', 'partnership_inquiries_id', 'venue_locations_id',
    'audit_logs_id', 'volunteers_id', 'youth_steering_committee_id',
    'orathon_registrations_id', 'abstract_reviews_id'
  ];
  c text;
BEGIN
  FOREACH c IN ARRAY cols
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'payload_locked_documents_rels'
        AND column_name = c
    ) THEN
      EXECUTE format('ALTER TABLE "payload_locked_documents_rels" ADD COLUMN %I integer', c);
      RAISE NOTICE 'Added column %', c;
    END IF;
  END LOOP;
END $$;

-- Indexes for common lookups (ignore errors if index exists)
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_participants_id_idx"
  ON "payload_locked_documents_rels" ("participants_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_newsletter_subscriptions_id_idx"
  ON "payload_locked_documents_rels" ("newsletter_subscriptions_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_contact_messages_id_idx"
  ON "payload_locked_documents_rels" ("contact_messages_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_sponsorship_tiers_id_idx"
  ON "payload_locked_documents_rels" ("sponsorship_tiers_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_partnership_inquiries_id_idx"
  ON "payload_locked_documents_rels" ("partnership_inquiries_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_venue_locations_id_idx"
  ON "payload_locked_documents_rels" ("venue_locations_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_audit_logs_id_idx"
  ON "payload_locked_documents_rels" ("audit_logs_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_volunteers_id_idx"
  ON "payload_locked_documents_rels" ("volunteers_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_youth_steering_committee_id_idx"
  ON "payload_locked_documents_rels" ("youth_steering_committee_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_orathon_registrations_id_idx"
  ON "payload_locked_documents_rels" ("orathon_registrations_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_abstract_reviews_id_idx"
  ON "payload_locked_documents_rels" ("abstract_reviews_id");
