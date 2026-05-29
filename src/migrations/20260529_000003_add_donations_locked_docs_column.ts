import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Payload document-locking joins require a FK column per collection on
 * payload_locked_documents_rels. Without donations_id, any donations query
 * in Payload admin fails with a SQL error.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "donations_id" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_donations_id_idx"
      ON "payload_locked_documents_rels" ("donations_id");
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_donations_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "donations_id";
  `)
}
