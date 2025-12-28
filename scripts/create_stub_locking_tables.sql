-- Create stub document locking tables that return empty results
-- This allows Payload to query them without errors, but no locks will be found
-- These are minimal tables that satisfy Payload's queries but don't actually lock anything

-- Create main locking table (minimal structure)
CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  "id" serial PRIMARY KEY NOT NULL,
  "global_slug" varchar,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

-- Create relationship table (minimal structure with all possible foreign keys)
CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" integer NOT NULL,
  "path" varchar NOT NULL,
  "users_id" integer,
  "registrations_id" integer,
  "abstracts_id" integer,
  "speakers_id" integer,
  "participants_id" integer,
  "sessions_id" integer,
  "resources_id" integer,
  "news_id" integer,
  "partners_id" integer,
  "faqs_id" integer,
  "media_id" integer,
  "newsletter_subscriptions_id" integer,
  "contact_messages_id" integer,
  "sponsorship_tiers_id" integer,
  "partnership_inquiries_id" integer,
  "venue_locations_id" integer
);

-- Add foreign key constraint
ALTER TABLE "payload_locked_documents_rels" 
  DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_parent_fk";

ALTER TABLE "payload_locked_documents_rels" 
  ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" 
  FOREIGN KEY ("parent_id") REFERENCES "payload_locked_documents"("id") 
  ON DELETE CASCADE;

-- Create indexes that Payload expects
CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" 
  ON "payload_locked_documents" USING btree ("global_slug");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" 
  ON "payload_locked_documents" USING btree ("updated_at");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" 
  ON "payload_locked_documents" USING btree ("created_at");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" 
  ON "payload_locked_documents_rels" USING btree ("order");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" 
  ON "payload_locked_documents_rels" USING btree ("parent_id");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" 
  ON "payload_locked_documents_rels" USING btree ("path");

-- Create indexes for all foreign key columns
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("users_id");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_registrations_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("registrations_id");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_abstracts_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("abstracts_id");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_speakers_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("speakers_id");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_participants_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("participants_id");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_sessions_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("sessions_id");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_resources_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("resources_id");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_news_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("news_id");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_partners_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("partners_id");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_faqs_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("faqs_id");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_media_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("media_id");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_newsletter_subscriptions_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("newsletter_subscriptions_id");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_contact_messages_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("contact_messages_id");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_sponsorship_tiers_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("sponsorship_tiers_id");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_partnership_inquiries_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("partnership_inquiries_id");

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_venue_locations_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("venue_locations_id");

-- Verify tables were created
SELECT 
  '✅ Stub locking tables created successfully' as status,
  (SELECT COUNT(*) FROM "payload_locked_documents") as locked_docs_count,
  (SELECT COUNT(*) FROM "payload_locked_documents_rels") as rels_count;

