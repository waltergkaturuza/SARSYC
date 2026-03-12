import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Add missing collection columns to payload_locked_documents_rels.
 *
 * The original stub migration only included collections up to venue_locations_id.
 * Collections added afterwards (audit_logs, volunteers, youth_steering_committee,
 * orathon_registrations, abstract_reviews, page_views, site_events) are missing
 * their FK columns, causing Payload's locking query to fail with a SQL error.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  console.log('📋 Adding missing collection columns to payload_locked_documents_rels...')

  await payload.db.drizzle.execute(`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "audit_logs_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "volunteers_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "youth_steering_committee_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "orathon_registrations_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "abstract_reviews_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "page_views_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "site_events_id" integer;
  `)

  console.log('✅ All missing columns added to payload_locked_documents_rels')
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  console.log('🗑️  Removing added columns from payload_locked_documents_rels...')

  await payload.db.drizzle.execute(`
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "audit_logs_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "volunteers_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "youth_steering_committee_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "orathon_registrations_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "abstract_reviews_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "page_views_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "site_events_id";
  `)

  console.log('✅ Columns removed from payload_locked_documents_rels')
}
