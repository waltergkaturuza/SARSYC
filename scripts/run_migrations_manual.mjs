/**
 * Manual Migration Runner
 * This script applies migrations manually using raw SQL
 * Use this on Windows where the Payload CLI migration command fails
 */

import pg from 'pg'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  console.log('📦 Connecting to database...')
  const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes('sslmode=require') || connectionString.includes('ssl=true')
      ? { rejectUnauthorized: false }
      : undefined,
  })

  try {
    await client.connect()
    console.log('✅ Connected to database')

    // Read the SQL migration file
    const sqlPath = join(__dirname, 'apply_migrations_manual.sql')
    console.log(`📄 Reading migration file: ${sqlPath}`)
    const sql = await readFile(sqlPath, 'utf8')

    console.log('🔄 Applying migrations...')
    await client.query(sql)
    console.log('✅ Migrations applied successfully!')

    // Verify the migrations were recorded
    const result = await client.query(`
      SELECT name, batch, created_at 
      FROM payload_migrations 
      WHERE name IN (
        '20251226_155456_add_international_registration_fields',
        '20251226_160419_add_passport_scan_nextofkin_enhancements'
      )
      ORDER BY created_at DESC
    `)

    if (result.rows.length > 0) {
      console.log('\n📋 Applied migrations:')
      result.rows.forEach((row) => {
        console.log(`   ✓ ${row.name} (batch ${row.batch})`)
      })
    }

    console.log('\n🎉 All migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

runMigrations()

