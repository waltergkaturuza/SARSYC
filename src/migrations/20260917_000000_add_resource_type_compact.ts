import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'compact';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // PostgreSQL does not support removing enum values easily; leave in place.
  console.log('Downgrade not supported for enum values - keeping compact resource type')
}
