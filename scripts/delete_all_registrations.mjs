/**
 * Script to delete all existing registration data
 * Use this to clean the database before schema migrations
 */

import { Pool } from 'pg'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import readline from 'readline'

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

async function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.toLowerCase().trim() === 'yes' || answer.toLowerCase().trim() === 'y')
    })
  })
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
      await pool.end()
      return
    }

    console.log(`⚠️  WARNING: Found ${totalCount} registration(s) in the database.\n`)
    console.log('This will DELETE ALL registration data permanently!\n')

    // Show sample of what will be deleted
    const sampleResult = await pool.query(`
      SELECT id, email, first_name, last_name, created_at
      FROM registrations
      ORDER BY id
      LIMIT 5
    `)

    if (sampleResult.rows.length > 0) {
      console.log('Sample of data that will be deleted:')
      sampleResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ID: ${row.id}, Email: ${row.email}, Name: ${row.first_name || ''} ${row.last_name || ''}`)
      })
      if (totalCount > 5) {
        console.log(`  ... and ${totalCount - 5} more record(s)\n`)
      } else {
        console.log()
      }
    }

    // Ask for confirmation
    const confirmed = await askConfirmation('Are you sure you want to delete ALL registrations? (type "yes" to confirm): ')

    if (!confirmed) {
      console.log('\n❌ Operation cancelled. No data was deleted.\n')
      await pool.end()
      return
    }

    console.log('\n🗑️  Deleting all registrations...\n')

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



