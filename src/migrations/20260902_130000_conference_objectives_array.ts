import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { ensureConferencesSchema } from '@/lib/ensureConferencesSchema'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await ensureConferencesSchema(payload)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`DROP TABLE IF EXISTS "conferences_objectives";`)
  await payload.db.drizzle.execute(
    `ALTER TABLE "conferences" ADD COLUMN IF NOT EXISTS "objectives" varchar`,
  )
}
