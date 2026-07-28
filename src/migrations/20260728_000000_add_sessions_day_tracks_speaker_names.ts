import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { ensureSessionsLatestColumns } from '@/lib/ensureSessionsSchema'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await ensureSessionsLatestColumns(payload)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(
    `ALTER TABLE "sessions" DROP COLUMN IF EXISTS "speaker_names";`,
  )
  // Enum values (track/type/day) are intentionally left in place; PostgreSQL
  // does not support removing enum values safely.
}
