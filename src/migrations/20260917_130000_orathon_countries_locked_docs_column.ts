import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * orathon-countries needs orathon_countries_id on payload_locked_documents_rels.
 * Without it, Payload document-lock queries fail when editing Orathon countries.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "orathon_countries_id" integer;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_orathon_countries_id_idx"
      ON "payload_locked_documents_rels" ("orathon_countries_id");
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_orathon_countries_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "orathon_countries_id";
  `)
}
