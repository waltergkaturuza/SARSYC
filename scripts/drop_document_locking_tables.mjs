#!/usr/bin/env node
/**
 * Script to drop Payload CMS document locking tables
 * 
 * This script removes the payload_locked_documents and payload_locked_documents_rels
 * tables from the database. These tables are used for Payload's document locking
 * feature, which we've disabled with maxConcurrentEditing: 0.
 * 
 * Run this script if you're still getting document locking query errors after
 * setting maxConcurrentEditing: 0 in payload.config.ts
 * 
 * Usage:
 *   node scripts/drop_document_locking_tables.mjs
 */

import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { Client } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is required')
  console.error('   Set it in your .env file or export it before running this script')
  process.exit(1)
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('localhost') ? false : {
    rejectUnauthorized: false,
  },
})

async function dropLockingTables() {
  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected to database')

    // Check if tables exist
    const checkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'payload_locked%'
      ORDER BY table_name;
    `)

    if (checkTables.rows.length === 0) {
      console.log('✅ Document locking tables do not exist. Nothing to drop.')
      await client.end()
      return
    }

    console.log('\n📋 Found document locking tables:')
    checkTables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`)
    })

    console.log('\n🗑️  Dropping document locking tables...')

    // Drop relationship table first (has foreign keys)
    await client.query('DROP TABLE IF EXISTS "payload_locked_documents_rels" CASCADE;')
    console.log('   ✅ Dropped payload_locked_documents_rels')

    // Drop main locking table
    await client.query('DROP TABLE IF EXISTS "payload_locked_documents" CASCADE;')
    console.log('   ✅ Dropped payload_locked_documents')

    // Verify tables are dropped
    const verifyTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'payload_locked%';
    `)

    if (verifyTables.rows.length === 0) {
      console.log('\n✅ Successfully dropped all document locking tables!')
      console.log('   Document locking feature is now completely disabled.')
    } else {
      console.log('\n⚠️  Warning: Some tables still exist:')
      verifyTables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`)
      })
    }

    await client.end()
    console.log('\n✅ Script completed successfully')
  } catch (error) {
    console.error('\n❌ Error dropping document locking tables:')
    console.error(error)
    await client.end()
    process.exit(1)
  }
}

// Run the script
dropLockingTables()

