import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * Migration to drop Payload CMS document locking tables
 * 
 * This migration removes the payload_locked_documents and payload_locked_documents_rels
 * tables. These tables are used for Payload's document locking feature, which we've
 * disabled with maxConcurrentEditing: 0 in payload.config.ts.
 * 
 * Document locking doesn't work well in serverless environments (like Vercel) and
 * causes database query errors. By dropping these tables, we prevent Payload from
 * attempting to query them.
 * 
 * This migration is safe to run multiple times (uses DROP TABLE IF EXISTS).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  console.log('🗑️  Dropping Payload document locking tables...')
  
  // Drop the relationship table first (has foreign keys)
  await db.execute(sql`
    DROP TABLE IF EXISTS "payload_locked_documents_rels" CASCADE;
  `)
  console.log('   ✅ Dropped payload_locked_documents_rels')
  
  // Drop the main locking table
  await db.execute(sql`
    DROP TABLE IF EXISTS "payload_locked_documents" CASCADE;
  `)
  console.log('   ✅ Dropped payload_locked_documents')
  
  // Verify tables are dropped
  const result = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'payload_locked%';
  `)
  
  if (Array.isArray(result) && result.length === 0) {
    console.log('✅ Successfully dropped all document locking tables')
  } else {
    console.warn('⚠️  Warning: Some locking tables may still exist')
  }
}

/**
 * Migration down: Recreate the document locking tables
 * 
 * Note: This is provided for completeness, but you likely don't want to run this
 * unless you're re-enabling document locking (which requires maxConcurrentEditing > 0).
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  console.log('⚠️  Recreating Payload document locking tables...')
  console.log('   Note: This is only needed if re-enabling document locking')
  
  // Recreate main locking table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
      "id" serial PRIMARY KEY NOT NULL,
      "global_slug" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)
  
  // Recreate relationship table
  await db.execute(sql`
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
  `)
  
  // Add foreign key constraint
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" 
    ADD CONSTRAINT IF NOT EXISTS "payload_locked_documents_rels_parent_fk" 
    FOREIGN KEY ("parent_id") REFERENCES "payload_locked_documents"("id") 
    ON DELETE CASCADE;
  `)
  
  console.log('✅ Recreated document locking tables')
}

