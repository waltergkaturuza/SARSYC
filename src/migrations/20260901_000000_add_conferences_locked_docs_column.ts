import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Conferences collection needs conferences_id on payload_locked_documents_rels.
 * Without it, editing conferences (including gallery uploads) fails.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "conferences_id" integer;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_conferences_id_idx"
      ON "payload_locked_documents_rels" ("conferences_id");
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_conferences_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "conferences_id";
  `)
}
