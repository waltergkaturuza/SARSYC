import pg from 'pg'
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

async function checkAdminUser() {
  await client.connect()
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@sarsyc.org'
    
    console.log(`🔍 Checking user: ${email}\n`)
    
    // Find the user
    const userResult = await client.query(
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
      [email]
    )
    
    if (userResult.rows.length === 0) {
      console.error(`❌ User with email "${email}" not found\n`)
      
      // Show all users
      const allUsers = await client.query(
        'SELECT email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10'
      )
      console.log('Available users:')
      allUsers.rows.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) - Created: ${user.created_at}`)
      })
      process.exit(1)
    }
    
    const user = userResult.rows[0]
    
    console.log('✅ User Found:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.first_name} ${user.last_name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Has Password: ${user.has_password ? '✅ Yes' : '❌ No'}`)
    console.log(`   Login Attempts: ${user.login_attempts || 0}`)
    console.log(`   Locked Until: ${user.lock_until || 'Not locked'}`)
    console.log(`   Created: ${user.created_at}`)
    console.log(`   Updated: ${user.updated_at}`)
    console.log('')
    
    // Check role
    if (user.role !== 'admin') {
      console.error(`❌ WARNING: User does NOT have admin role!`)
      console.error(`   Current role: ${user.role}`)
      console.error(`   Expected role: admin`)
      console.log('')
      console.log('To fix this, run:')
      console.log(`   UPDATE users SET role = 'admin' WHERE email = '${email}';`)
      process.exit(1)
    } else {
      console.log('✅ Role is correct: admin')
    }
    
    // Check password
    if (!user.has_password) {
      console.error('❌ WARNING: User does NOT have a password set!')
      process.exit(1)
    } else {
      console.log('✅ Password is set')
    }
    
    // Check if locked
    if (user.lock_until && new Date(user.lock_until) > new Date()) {
      console.error(`❌ WARNING: Account is LOCKED until ${user.lock_until}`)
      console.log('To unlock, run:')
      console.log(`   UPDATE users SET login_attempts = 0, lock_until = NULL WHERE email = '${email}';`)
      process.exit(1)
    } else {
      console.log('✅ Account is not locked')
    }
    
    console.log('\n✅ All checks passed! User should be able to log in.')
    
  } catch (err) {
    console.error('❌ Error:', err.message)
    console.error(err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

checkAdminUser()





