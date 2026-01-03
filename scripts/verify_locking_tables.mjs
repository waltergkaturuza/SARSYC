#!/usr/bin/env node
/**
 * Script to verify Payload CMS document locking tables status
 * 
 * Usage:
 *   node scripts/verify_locking_tables.mjs "postgresql://user:pass@host/db"
 *   Or set DATABASE_URL and run: node scripts/verify_locking_tables.mjs
 */

import pg from 'pg'

const { Client } = pg

// Get database URL from command line argument or environment
const databaseUrl = process.argv[2] || process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is required')
  console.error('   Usage: node scripts/verify_locking_tables.mjs "postgresql://user:pass@host/db"')
  console.error('   Or set DATABASE_URL environment variable')
  process.exit(1)
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('localhost') ? false : {
    rejectUnauthorized: false,
  },
})

async function verifyLockingTables() {
  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected to database\n')

    // Check if tables exist
    const checkTables = await client.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name LIKE 'payload_locked%'
      ORDER BY table_name;
    `)

    if (checkTables.rows.length === 0) {
      console.log('✅ Document locking tables do not exist.')
      console.log('   This is correct - document locking is disabled.\n')
    } else {
      console.log('⚠️  Found document locking tables:')
      for (const row of checkTables.rows) {
        console.log(`   - ${row.table_name} (${row.column_count} columns)`)
        
        // Get column details
        const columns = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = $1
          ORDER BY ordinal_position;
        `, [row.table_name])
        
        columns.rows.forEach(col => {
          console.log(`     • ${col.column_name} (${col.data_type})`)
        })
      }
      console.log('\n💡 To drop these tables, run:')
      console.log('   npm run drop:locking-tables')
      console.log('   Or: node scripts/drop_document_locking_tables_direct.mjs "' + databaseUrl + '"')
    }

    // Check for any references to locked documents in other tables
    const checkReferences = await client.query(`
      SELECT 
        tc.table_name, 
        kcu.column_name,
        ccu.table_name AS foreign_table_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND ccu.table_name LIKE 'payload_locked%'
        AND tc.table_schema = 'public';
    `)

    if (checkReferences.rows.length > 0) {
      console.log('\n⚠️  Found foreign key references to locking tables:')
      checkReferences.rows.forEach(ref => {
        console.log(`   - ${ref.table_name}.${ref.column_name} → ${ref.foreign_table_name}`)
      })
    }

    await client.end()
    console.log('\n✅ Verification completed')
  } catch (error) {
    console.error('\n❌ Error verifying locking tables:')
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
verifyLockingTables()



