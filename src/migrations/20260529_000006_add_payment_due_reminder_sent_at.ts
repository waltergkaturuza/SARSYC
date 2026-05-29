import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "payment_due_reminder_sent_at" timestamp with time zone;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "registrations" DROP COLUMN IF EXISTS "payment_due_reminder_sent_at";
  `)
}
