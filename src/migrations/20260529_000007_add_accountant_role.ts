import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'accountant';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // PostgreSQL cannot remove enum values; accountant remains unused after rollback.
  await db.execute(sql`SELECT 1`)
}
