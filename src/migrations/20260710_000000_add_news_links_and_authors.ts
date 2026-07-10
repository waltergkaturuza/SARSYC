import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { ensureNewsLatestColumns } from '@/lib/ensureNewsSchema'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await ensureNewsLatestColumns(payload)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`DROP TABLE IF EXISTS "news_rels" CASCADE;`)
  await payload.db.drizzle.execute(`DROP TABLE IF EXISTS "news_related_links" CASCADE;`)
  await payload.db.drizzle.execute(
    `ALTER TABLE "news" DROP COLUMN IF EXISTS "download_resource_label";`,
  )
  await payload.db.drizzle.execute(
    `ALTER TABLE "news" DROP COLUMN IF EXISTS "download_resource_url";`,
  )
}
