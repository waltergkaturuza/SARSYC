import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Add age, gender, and institution columns to the abstracts table
 * for the primaryAuthor group.
 *
 * These fields allow SARSYC to:
 *  - Confirm submissions are from young people (age 10–35)
 *  - Track gender balance (target 50/50)
 *  - Identify tertiary institution students (core audience)
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  console.log('📋 Adding demographics columns to abstracts table...')

  await payload.db.drizzle.execute(`
    ALTER TABLE "abstracts" ADD COLUMN IF NOT EXISTS "primary_author_age" integer;
    ALTER TABLE "abstracts" ADD COLUMN IF NOT EXISTS "primary_author_gender" varchar;
    ALTER TABLE "abstracts" ADD COLUMN IF NOT EXISTS "primary_author_institution" varchar;
  `)

  console.log('✅ Demographics columns added to abstracts (primary_author_age, primary_author_gender, primary_author_institution)')
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  console.log('🗑️  Removing demographics columns from abstracts table...')

  await payload.db.drizzle.execute(`
    ALTER TABLE "abstracts" DROP COLUMN IF EXISTS "primary_author_age";
    ALTER TABLE "abstracts" DROP COLUMN IF EXISTS "primary_author_gender";
    ALTER TABLE "abstracts" DROP COLUMN IF EXISTS "primary_author_institution";
  `)

  console.log('✅ Demographics columns removed from abstracts')
}
