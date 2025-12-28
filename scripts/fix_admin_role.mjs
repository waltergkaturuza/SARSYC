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

async function fixAdminRole() {
  await client.connect()
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@sarsyc.org'
    
    console.log(`🔧 Fixing admin role for: ${email}\n`)
    
    // Check current role
    const checkResult = await client.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [email]
    )
    
    if (checkResult.rows.length === 0) {
      console.error(`❌ User with email "${email}" not found`)
      process.exit(1)
    }
    
    const user = checkResult.rows[0]
    console.log(`Current role: ${user.role}`)
    
    if (user.role === 'admin') {
      console.log('✅ User already has admin role')
      return
    }
    
    // Update to admin role
    await client.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2',
      ['admin', user.id]
    )
    
    console.log(`✅ Updated user role to 'admin'`)
    console.log(`   User ID: ${user.id}`)
    console.log(`   Email: ${email}`)
    
  } catch (err) {
    console.error('❌ Error:', err.message)
    console.error(err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

fixAdminRole()


