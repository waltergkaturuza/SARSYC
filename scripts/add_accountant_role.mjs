#!/usr/bin/env node
/**
 * Add `accountant` to enum_users_role (Windows-friendly alternative to `payload migrate`).
 *
 * Usage: node scripts/add_accountant_role.mjs
 * Requires DATABASE_URL in .env or .env.local
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import postgres from 'postgres'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: join(repoRoot, '.env.local') })
dotenv.config({ path: join(repoRoot, '.env') })

const DATABASE_URL = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
const MIGRATION_NAME = '20260529_000007_add_accountant_role'

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set (.env or .env.local)')
  process.exit(1)
}

const sql = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 1,
})

try {
  console.log('🔄 Adding accountant role to enum_users_role...')
  await sql.unsafe(`ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'accountant'`)

  const existing = await sql`
    SELECT id FROM payload_migrations WHERE name = ${MIGRATION_NAME} LIMIT 1
  `
  if (existing.length === 0) {
    await sql`
      INSERT INTO payload_migrations (name, batch, created_at, updated_at)
      VALUES (${MIGRATION_NAME}, 1, now(), now())
    `
    console.log(`✅ Recorded migration: ${MIGRATION_NAME}`)
  } else {
    console.log(`⏭️  Migration already recorded: ${MIGRATION_NAME}`)
  }

  const roles = await sql.unsafe(`
    SELECT unnest(enum_range(NULL::enum_users_role)) AS role ORDER BY role
  `)
  console.log('\nCurrent user roles:')
  for (const row of roles) console.log(`  • ${row.role}`)
  console.log('\n✅ Done — you can assign the Accountant role to users now.')
} catch (err) {
  console.error('❌ Failed:', err.message)
  process.exit(1)
} finally {
  await sql.end()
}
