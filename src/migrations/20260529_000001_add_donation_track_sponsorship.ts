import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "donations"
      ADD COLUMN IF NOT EXISTS "sponsorship_category" varchar,
      ADD COLUMN IF NOT EXISTS "conference_track" varchar,
      ADD COLUMN IF NOT EXISTS "track_sponsorship_mode" varchar,
      ADD COLUMN IF NOT EXISTS "students_sponsored" numeric;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "donations"
      DROP COLUMN IF EXISTS "sponsorship_category",
      DROP COLUMN IF EXISTS "conference_track",
      DROP COLUMN IF EXISTS "track_sponsorship_mode",
      DROP COLUMN IF EXISTS "students_sponsored";
  `)
}
