import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "safeguarding_ack_token" varchar;
    ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "safeguarding_acknowledged_at" timestamp with time zone;
    ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "safeguarding_training_email_sent_at" timestamp with time zone;
    ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "safeguarding_ack_ip" varchar;
    ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "safeguarding_ack_user_agent" varchar;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "registrations" DROP COLUMN IF EXISTS "safeguarding_ack_token";
    ALTER TABLE "registrations" DROP COLUMN IF EXISTS "safeguarding_acknowledged_at";
    ALTER TABLE "registrations" DROP COLUMN IF EXISTS "safeguarding_training_email_sent_at";
    ALTER TABLE "registrations" DROP COLUMN IF EXISTS "safeguarding_ack_ip";
    ALTER TABLE "registrations" DROP COLUMN IF EXISTS "safeguarding_ack_user_agent";
  `)
}
