import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Add new resource type values to enum_resources_type
    ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'abstract';
    ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'concept-note';
    ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'research-report';
    ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'symposium-report';
    ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'communique';
    ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'declaration';
    ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'template';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Note: PostgreSQL doesn't support removing enum values easily
  // This would require recreating the enum type, which is complex
  // For now, leaving the enum values in place is the safest option
  console.log('Downgrade not supported for enum values - keeping new resource types')
}
