import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "donations"
      ADD COLUMN IF NOT EXISTS "category_display" varchar,
      ADD COLUMN IF NOT EXISTS "category_slug" varchar;

    CREATE INDEX IF NOT EXISTS "donations_donation_id_idx" ON "donations" ("donation_id");
    CREATE INDEX IF NOT EXISTS "donations_email_idx" ON "donations" ("email");
    CREATE INDEX IF NOT EXISTS "donations_payment_status_idx" ON "donations" ("payment_status");
    CREATE INDEX IF NOT EXISTS "donations_created_at_idx" ON "donations" ("created_at");
    CREATE INDEX IF NOT EXISTS "donations_category_display_idx" ON "donations" ("category_display");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "donations_id" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_donations_id_idx"
      ON "payload_locked_documents_rels" ("donations_id");
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "donations"
      DROP COLUMN IF EXISTS "category_display",
      DROP COLUMN IF EXISTS "category_slug";

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "donations_id";
  `)
}
