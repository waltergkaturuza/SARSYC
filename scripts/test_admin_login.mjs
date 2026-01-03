/**
 * Script to test admin login and check account status
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
const ADMIN_PASSWORD = 'Admin@1234'

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables')
  process.exit(1)
}

async function testAdminLogin() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    console.log(`🔍 Testing admin account: ${ADMIN_EMAIL}\n`)

    // Check account status
    const userResult = await pool.query(
      `SELECT 
        id, 
        email, 
        first_name, 
        last_name, 
        role, 
        hash IS NOT NULL as has_password,
        login_attempts,
        lock_until,
        created_at,
        updated_at
      FROM users 
      WHERE email = $1`,
      [ADMIN_EMAIL]
    )

    if (userResult.rows.length === 0) {
      console.error(`❌ User with email "${ADMIN_EMAIL}" not found\n`)
      await pool.end()
      process.exit(1)
    }

    const user = userResult.rows[0]

    console.log('📋 Account Status:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.first_name} ${user.last_name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Has Password: ${user.has_password ? '✅ Yes' : '❌ No'}`)
    console.log(`   Login Attempts: ${user.login_attempts || 0}`)
    console.log(`   Locked Until: ${user.lock_until || 'NULL (unlocked)'}`)
    console.log(`   Created: ${user.created_at}`)
    console.log(`   Updated: ${user.updated_at}`)
    console.log('')

    // Check if locked
    if (user.lock_until && new Date(user.lock_until) > new Date()) {
      console.error(`❌ Account is LOCKED until ${user.lock_until}`)
      console.log('\n🔓 Unlocking account...\n')
      
      // Unlock the account
      await pool.query(
        `UPDATE users 
         SET login_attempts = 0, lock_until = NULL 
         WHERE email = $1`,
        [ADMIN_EMAIL]
      )
      
      console.log('✅ Account unlocked successfully!\n')
    } else {
      console.log('✅ Account is not locked')
    }

    // Check role
    if (user.role !== 'admin') {
      console.error(`❌ WARNING: User does NOT have admin role!`)
      console.error(`   Current role: ${user.role}`)
      console.error(`   Expected role: admin`)
      console.log('\n🔧 Fixing role...\n')
      
      await pool.query(
        `UPDATE users SET role = 'admin' WHERE email = $1`,
        [ADMIN_EMAIL]
      )
      
      console.log('✅ Role updated to admin!\n')
    } else {
      console.log('✅ Role is correct: admin')
    }

    // Check password
    if (!user.has_password) {
      console.error('❌ WARNING: User does NOT have a password set!')
      console.log('\n⚠️  You need to reset the password using the reset script.\n')
    } else {
      console.log('✅ Password is set')
    }

    console.log('\n🧪 Testing login via API...\n')

    // Test login via API
    const API_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarsyc.vercel.app'
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        type: 'admin',
      }),
    })

    const loginData = await loginResponse.json()

    console.log(`📡 API Response Status: ${loginResponse.status}`)
    console.log(`📡 API Response:`, JSON.stringify(loginData, null, 2))
    console.log('')

    if (loginResponse.ok && loginData.success) {
      console.log('✅ Login test PASSED!')
      console.log(`   Token received: ${loginData.token ? 'Yes' : 'No'}`)
      console.log(`   User role: ${loginData.user?.role || 'N/A'}`)
    } else {
      console.error('❌ Login test FAILED!')
      console.error(`   Error: ${loginData.error || 'Unknown error'}`)
      
      if (loginData.locked) {
        console.error(`   Account is locked until: ${loginData.lockUntil || 'N/A'}`)
      }
    }

    console.log('\n✅ Account check complete!')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    throw error
  } finally {
    if (pool && !pool.ended) {
      await pool.end()
    }
  }
}

// Run the test
testAdminLogin()
  .then(() => {
    console.log('\n✨ Test complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })


