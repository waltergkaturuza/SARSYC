#!/usr/bin/env node

/**
 * Initialize PAYLOAD_SECRET in database
 * Creates app_secrets table and stores a generated secret
 * 
 * Usage: node scripts/init-secret-db.mjs [secret-key]
 * If secret-key is not provided, a new one will be generated
 */

import crypto from 'crypto'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL or DATABASE_URL_UNPOOLED must be set')
  process.exit(1)
}

// Get secret from command line or generate new one
const providedSecret = process.argv[2]
const secret = providedSecret || crypto.randomBytes(32).toString('hex')

async function initSecret() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  try {
    console.log('📦 Creating app_secrets table...')

    // Create the table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_secrets (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('✅ Table created/verified')

    // Check if secret already exists
    const existing = await pool.query(
      `SELECT value FROM app_secrets WHERE key = 'payload_secret'`
    )

    if (existing.rows.length > 0) {
      console.log('⚠️  PAYLOAD_SECRET already exists in database')
      console.log('   Current value:', existing.rows[0].value.substring(0, 16) + '...')
      
      // Update it
      await pool.query(
        `UPDATE app_secrets SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = 'payload_secret'`,
        [secret]
      )
      console.log('✅ Updated PAYLOAD_SECRET in database')
    } else {
      // Insert new secret
      await pool.query(
        `INSERT INTO app_secrets (key, value) VALUES ('payload_secret', $1)`,
        [secret]
      )
      console.log('✅ Stored PAYLOAD_SECRET in database')
    }

    console.log('\n🔐 Secret stored in database:')
    console.log('   Key: payload_secret')
    console.log('   Value:', secret)
    console.log('\n📝 This secret will be used as fallback if PAYLOAD_SECRET environment variable is not set.')
    console.log('⚠️  Note: Changing this will invalidate existing user sessions.')
    console.log('   Users will need to log in again.\n')

  } catch (error) {
    console.error('❌ Error initializing secret:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

initSecret()

