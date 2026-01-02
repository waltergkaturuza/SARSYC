/**
 * Script to unlock admin account
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
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sarsyc.org'

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables')
  process.exit(1)
}

async function unlockAdmin() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    console.log(`🔓 Unlocking admin account: ${ADMIN_EMAIL}\n`)

    // Unlock the account
    const result = await pool.query(
      `UPDATE users 
       SET login_attempts = 0, lock_until = NULL 
       WHERE email = $1`,
      [ADMIN_EMAIL]
    )

    if (result.rowCount === 0) {
      console.log(`❌ User not found: ${ADMIN_EMAIL}\n`)
      await pool.end()
      process.exit(1)
    }

    console.log(`✅ Successfully unlocked admin account: ${ADMIN_EMAIL}\n`)

    // Verify unlock
    const verifyResult = await pool.query(
      `SELECT email, login_attempts, lock_until 
       FROM users 
       WHERE email = $1`,
      [ADMIN_EMAIL]
    )

    if (verifyResult.rows.length > 0) {
      const user = verifyResult.rows[0]
      console.log('Verification:')
      console.log(`  Email: ${user.email}`)
      console.log(`  Login Attempts: ${user.login_attempts}`)
      console.log(`  Locked Until: ${user.lock_until || 'NULL (unlocked)'}\n`)
    }

  } catch (error) {
    console.error('❌ Error unlocking admin:', error.message)
    console.error(error.stack)
    throw error
  } finally {
    if (pool && !pool.ended) {
      await pool.end()
    }
  }
}

// Run the unlock
unlockAdmin()
  .then(() => {
    console.log('✨ Unlock complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })




