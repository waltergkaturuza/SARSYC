#!/usr/bin/env node

/**
 * Run migration to add new resource types to the database enum
 * 
 * Usage: node scripts/run_resource_types_migration.mjs
 */

import 'dotenv/config'
import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables')
  process.exit(1)
}

console.log('🔄 Connecting to database...')

const sql = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 1,
})

async function runMigration() {
  try {
    console.log('📝 Adding new resource type enum values...')
    
    await sql.unsafe(`
      ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'abstract';
    `)
    console.log('✅ Added: abstract')
    
    await sql.unsafe(`
      ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'concept-note';
    `)
    console.log('✅ Added: concept-note')
    
    await sql.unsafe(`
      ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'research-report';
    `)
    console.log('✅ Added: research-report')
    
    await sql.unsafe(`
      ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'symposium-report';
    `)
    console.log('✅ Added: symposium-report')
    
    await sql.unsafe(`
      ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'communique';
    `)
    console.log('✅ Added: communique')
    
    await sql.unsafe(`
      ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'declaration';
    `)
    console.log('✅ Added: declaration')
    
    await sql.unsafe(`
      ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'template';
    `)
    console.log('✅ Added: template')
    
    // Verify
    console.log('\n📋 Current resource types in database:')
    const types = await sql`
      SELECT unnest(enum_range(NULL::enum_resources_type)) AS resource_type
    `
    types.forEach(t => console.log('  -', t.resource_type))
    
    console.log('\n✅ Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    throw error
  } finally {
    await sql.end()
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
