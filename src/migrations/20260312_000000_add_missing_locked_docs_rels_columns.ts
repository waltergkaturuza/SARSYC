import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Add missing collection columns to payload_locked_documents_rels.
 *
 * The original stub migration only included collections up to venue_locations_id.
 * Collections added afterwards (audit_logs, volunteers, youth_steering_committee,
 * orathon_registrations, abstract_reviews, page_views, site_events) are missing
 * their FK columns, causing Payload's locking query to fail with a SQL error.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  console.log('📋 Adding missing collection columns to payload_locked_documents_rels...')

  const columns = [
    'audit_logs_id',
    'volunteers_id',
    'youth_steering_committee_id',
    'orathon_registrations_id',
    'abstract_reviews_id',
    'page_views_id',
    'site_events_id',
  ]

  for (const col of columns) {
    await db.execute(sql`
      ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS ${sql.raw(`"${col}"`)} integer;
    `)
    console.log(`   ✅ Added column: ${col}`)
  }

  console.log('✅ All missing columns added to payload_locked_documents_rels')
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  console.log('🗑️  Removing added columns from payload_locked_documents_rels...')

  const columns = [
    'audit_logs_id',
    'volunteers_id',
    'youth_steering_committee_id',
    'orathon_registrations_id',
    'abstract_reviews_id',
    'page_views_id',
    'site_events_id',
  ]

  for (const col of columns) {
    await db.execute(sql`
      ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS ${sql.raw(`"${col}"`)};
    `)
    console.log(`   ✅ Dropped column: ${col}`)
  }
}
