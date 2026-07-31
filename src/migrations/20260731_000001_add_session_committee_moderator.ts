import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { ensureSessionsLatestColumns } from '@/lib/ensureSessionsSchema'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await ensureSessionsLatestColumns(payload)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Enum values and committee_moderator_id are intentionally left in place.
}
