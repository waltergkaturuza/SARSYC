import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Migration to create stub Payload CMS document locking tables
 * 
 * Instead of dropping the tables (which causes "table does not exist" errors),
 * we create empty stub tables that satisfy Payload's queries but don't actually lock anything.
 * 
 * This approach:
 * - Prevents "table does not exist" errors
 * - Allows Payload to query the tables without errors
 * - Keeps document locking effectively disabled (tables are always empty)
 * - Works better in serverless environments than dropping tables
 * 
 * Document locking is disabled with maxConcurrentEditing: 0 in payload.config.ts.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  console.log('📋 Creating stub Payload document locking tables...')
  
  // Create main locking table (minimal structure)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
      "id" serial PRIMARY KEY NOT NULL,
      "global_slug" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)
  console.log('   ✅ Created payload_locked_documents (stub)')
  
  // Create relationship table with all possible foreign keys
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
  console.log('   ✅ Created payload_locked_documents_rels (stub)')
  
  // Add foreign key constraint
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" 
    DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_parent_fk";
  `)
  
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" 
    ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" 
    FOREIGN KEY ("parent_id") REFERENCES "payload_locked_documents"("id") 
    ON DELETE CASCADE;
  `)
  console.log('   ✅ Added foreign key constraint')
  
  // Create essential indexes
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" 
    ON "payload_locked_documents" USING btree ("global_slug");
  `)
  
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" 
    ON "payload_locked_documents" USING btree ("created_at");
  `)
  
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" 
    ON "payload_locked_documents_rels" USING btree ("parent_id");
  `)
  
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" 
    ON "payload_locked_documents_rels" USING btree ("path");
  `)
  
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_speakers_id_idx" 
    ON "payload_locked_documents_rels" USING btree ("speakers_id");
  `)
  
  console.log('   ✅ Created essential indexes')
  console.log('✅ Stub locking tables created - Payload can query them but they remain empty')
}

/**
 * Migration down: Drop the stub document locking tables
 * 
 * This will drop the stub tables if you want to remove them completely.
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  console.log('🗑️  Dropping stub Payload document locking tables...')
  
  // Drop relationship table first (has foreign keys)
  await db.execute(sql`
    DROP TABLE IF EXISTS "payload_locked_documents_rels" CASCADE;
  `)
  console.log('   ✅ Dropped payload_locked_documents_rels')
  
  // Drop main locking table
  await db.execute(sql`
    DROP TABLE IF EXISTS "payload_locked_documents" CASCADE;
  `)
  console.log('   ✅ Dropped payload_locked_documents')
  
  console.log('✅ Stub locking tables dropped')
}

