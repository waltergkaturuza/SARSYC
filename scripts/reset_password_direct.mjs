import pg from 'pg'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })
dotenv.config({ path: join(__dirname, '..', '.env') })

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function resetPassword() {
  await client.connect()
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@sarsyc.org'
    const newPassword = process.argv[2] || process.env.ADMIN_PASSWORD || 'Admin@1234'
    
    if (!newPassword || newPassword.length < 8) {
      console.error('❌ Error: Password must be at least 8 characters long')
      console.log('Usage: node scripts/reset_password_direct.mjs <new_password>')
      process.exit(1)
    }
    
    console.log(`🔐 Resetting password for: ${email}`)
    console.log(`🔑 New password length: ${newPassword.length} characters`)
    
    // Find the user
    const userResult = await client.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE email = $1',
      [email]
    )
    
    if (userResult.rows.length === 0) {
      console.error(`❌ Error: User with email "${email}" not found`)
      
      // Show available users
      const allUsers = await client.query(
        'SELECT email, role FROM users ORDER BY created_at DESC LIMIT 10'
      )
      console.log('\nAvailable users:')
      allUsers.rows.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`)
      })
      process.exit(1)
    }
    
    const user = userResult.rows[0]
    console.log(`✅ Found user: ${user.first_name} ${user.last_name} (${user.role})`)
    
    // Hash the new password (Payload uses bcrypt with 10 rounds)
    // Note: bcrypt includes the salt in the hash, so we store empty string for salt field
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10)
    const hash = await bcrypt.hash(newPassword, saltRounds)
    
    // Update the password in the database
    // Payload stores password as 'hash' field, with empty salt (bcrypt hash includes salt)
    // Also reset login attempts and lock status in case account was locked
    await client.query(
      'UPDATE users SET hash = $1, salt = $2, login_attempts = 0, lock_until = NULL, updated_at = NOW() WHERE id = $3',
      [hash, '', user.id]
    )
    
    console.log(`✅ Password successfully reset for ${email}`)
    console.log(`\n📝 New password: ${newPassword}`)
    console.log('\n⚠️  Please change this password after logging in for security!')
    
  } catch (err) {
    console.error('❌ Error:', err.message)
    console.error(err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

resetPassword()

