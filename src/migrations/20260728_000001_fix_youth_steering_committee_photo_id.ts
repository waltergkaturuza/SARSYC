import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { ensureYouthSteeringCommitteeLatestColumns } from '@/lib/ensureYouthSteeringCommitteeSchema'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await ensureYouthSteeringCommitteeLatestColumns(payload)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Leave photo_id / social_media_* in place — renaming back is unsafe if Payload is live.
  void payload
}
