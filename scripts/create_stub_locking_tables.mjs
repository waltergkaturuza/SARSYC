#!/usr/bin/env node
/**
 * Script to create stub document locking tables
 * 
 * These are empty tables that satisfy Payload's queries but don't actually lock anything.
 * This prevents "table does not exist" errors while keeping document locking effectively disabled.
 * 
 * Usage:
 *   node scripts/create_stub_locking_tables.mjs "postgresql://user:pass@host/db"
 *   Or set DATABASE_URL and run: node scripts/create_stub_locking_tables.mjs
 */

import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { Client } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get database URL from command line argument or environment
const databaseUrl = process.argv[2] || process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is required')
  console.error('   Usage: node scripts/create_stub_locking_tables.mjs "postgresql://user:pass@host/db"')
  console.error('   Or set DATABASE_URL environment variable')
  process.exit(1)
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('localhost') ? false : {
    rejectUnauthorized: false,
  },
})

async function createStubTables() {
  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected to database\n')

    // Read SQL file
    const sqlPath = join(__dirname, 'create_stub_locking_tables.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    console.log('📋 Creating stub document locking tables...')
    console.log('   These tables will be empty but satisfy Payload\'s queries\n')

    // Execute SQL
    await client.query(sql)

    // Verify tables were created
    const verify = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM "payload_locked_documents") as locked_docs_count,
        (SELECT COUNT(*) FROM "payload_locked_documents_rels") as rels_count;
    `)

    const result = verify.rows[0]
    console.log('✅ Stub locking tables created successfully!')
    console.log(`   - payload_locked_documents: ${result.locked_docs_count} rows (empty)`)
    console.log(`   - payload_locked_documents_rels: ${result.rels_count} rows (empty)`)
    console.log('\n💡 Payload can now query these tables without errors,')
    console.log('   but no documents will be locked (tables are empty).')

    await client.end()
    console.log('\n✅ Script completed successfully')
  } catch (error) {
    console.error('\n❌ Error creating stub locking tables:')
    console.error(error.message)
    if (error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    await client.end()
    process.exit(1)
  }
}

// Run the script
createStubTables()

