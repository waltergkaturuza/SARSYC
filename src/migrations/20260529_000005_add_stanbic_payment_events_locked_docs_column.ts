import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Payload document-locking joins require a FK column per collection on
 * payload_locked_documents_rels. Without stanbic_payment_events_id, registration
 * and other admin edits fail with a SQL error.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "stanbic_payment_events_id" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_stanbic_payment_events_id_idx"
      ON "payload_locked_documents_rels" ("stanbic_payment_events_id");
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_stanbic_payment_events_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "stanbic_payment_events_id";
  `)
}
