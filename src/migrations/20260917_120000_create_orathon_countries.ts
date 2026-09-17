import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { ensureOrathonCountriesSchema } from '@/lib/ensureOrathonCountriesSchema'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await ensureOrathonCountriesSchema(payload)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`DROP TABLE IF EXISTS "orathon_countries";`)
}
