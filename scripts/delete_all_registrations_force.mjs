/**
 * ⚠️ EXTREMELY DANGEROUS SCRIPT - USE WITH EXTREME CAUTION ⚠️
 * 
 * Script to delete all existing registration data (non-interactive)
 * Use this to clean the database before schema migrations
 * 
 * 🚨 NEVER RUN THIS IN PRODUCTION! 🚨
 * This will DELETE ALL registration data permanently WITHOUT confirmation!
 * 
 * This script is ONLY for development/testing environments.
 */

import { Pool } from 'pg'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })
dotenv.config({ path: join(__dirname, '..', '.env') })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables')
  process.exit(1)
}

async function deleteAllRegistrations() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    console.log('🔍 Checking registrations table...\n')

    // Get count of registrations
    const countResult = await pool.query('SELECT COUNT(*) as total FROM registrations')
    const totalCount = parseInt(countResult.rows[0].total)

    if (totalCount === 0) {
      console.log('✅ No registrations found. Database is already clean.\n')
      if (pool && !pool.ended) {
        await pool.end()
      }
      return
    }

    console.log(`⚠️  Found ${totalCount} registration(s) in the database.\n`)
    console.log('🗑️  Deleting all registrations...\n')

    // Delete all registrations
    const deleteResult = await pool.query('DELETE FROM registrations')

    console.log(`✅ Successfully deleted ${deleteResult.rowCount} registration(s)!\n`)

    // Verify deletion
    const verifyResult = await pool.query('SELECT COUNT(*) as total FROM registrations')
    const remainingCount = parseInt(verifyResult.rows[0].total)

    if (remainingCount === 0) {
      console.log('✅ Verification: All registrations have been deleted.\n')
      console.log('The database is now clean and ready for schema migrations.\n')
    } else {
      console.log(`⚠️  Warning: ${remainingCount} registration(s) still remain.\n`)
    }

  } catch (error) {
    console.error('❌ Error deleting registrations:', error.message)
    console.error(error.stack)
    throw error
  } finally {
    if (pool && !pool.ended) {
      await pool.end()
    }
  }
}

// Run the deletion
deleteAllRegistrations()
  .then(() => {
    console.log('✨ Cleanup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })




