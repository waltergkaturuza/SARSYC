#!/usr/bin/env node

/**
 * Add new resource types to Neon Database
 * 
 * Usage: node scripts/neon_add_resource_types.mjs
 * 
 * Make sure DATABASE_URL is set in your .env file
 */

import 'dotenv/config'
import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in .env file')
  console.log('\nPlease add DATABASE_URL to your .env file:')
  console.log('DATABASE_URL=postgresql://user:password@host/database')
  process.exit(1)
}

console.log('🔄 Connecting to Neon database...\n')

const sql = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
})

async function addResourceTypes() {
  try {
    console.log('📝 Adding new resource type enum values...\n')
    
    // Add all new enum values
    const newTypes = [
      'abstract',
      'concept-note',
      'research-report',
      'symposium-report',
      'communique',
      'declaration',
      'template'
    ]
    
    for (const type of newTypes) {
      try {
        await sql.unsafe(`
          ALTER TYPE enum_resources_type ADD VALUE IF NOT EXISTS '${type}'
        `)
        console.log(`✅ Added: ${type}`)
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⏭️  Skipped: ${type} (already exists)`)
        } else {
          throw error
        }
      }
    }
    
    console.log('\n📋 Verifying all resource types in database...\n')
    
    // Verify the changes
    const types = await sql.unsafe(`
      SELECT unnest(enum_range(NULL::enum_resources_type)) AS resource_type
      ORDER BY resource_type
    `)
    
    console.log('Current resource types:')
    types.forEach((t, i) => console.log(`  ${i + 1}. ${t.resource_type}`))
    
    console.log(`\n✅ SUCCESS! Total resource types: ${types.length}`)
    console.log('\n🎉 You can now create resources with all types!\n')
    
  } catch (error) {
    console.error('\n❌ Migration failed!')
    console.error('Error:', error.message)
    console.error('\nFull error:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

addResourceTypes()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Unexpected error:', err)
    process.exit(1)
  })
