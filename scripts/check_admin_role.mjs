import pg from 'pg'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })
dotenv.config({ path: join(__dirname, '..', '.env') })

const { Client } = pg

async function checkAdminRole() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })

  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    // Check admin@sarsyc.org user
    const result = await client.query(`
      SELECT id, email, role FROM users WHERE email = 'admin@sarsyc.org'
    `)

    if (result.rows.length === 0) {
      console.log('❌ No user found with email: admin@sarsyc.org')
      console.log('\nSearching for all admin users...')
      
      const allAdmins = await client.query(`
        SELECT id, email, role FROM users WHERE role = 'admin'
      `)
      
      console.log(`\nFound ${allAdmins.rows.length} admin user(s):`)
      allAdmins.rows.forEach(user => {
        console.log(`  - ${user.email} (role: ${user.role})`)
      })
    } else {
      const user = result.rows[0]
      console.log('📋 User found:')
      console.log(`  - Email: ${user.email}`)
      console.log(`  - Role: ${user.role}`)
      console.log(`  - ID: ${user.id}`)
      
      if (user.role !== 'admin') {
        console.log(`\n⚠️  Role is '${user.role}', not 'admin'!`)
        console.log('\n🔧 Fixing role...')
        
        await client.query(`
          UPDATE users SET role = 'admin' WHERE email = 'admin@sarsyc.org'
        `)
        
        console.log('✅ Role updated to admin')
      } else {
        console.log('\n✅ Role is correct: admin')
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
    console.error('Stack:', error.stack)
  } finally {
    await client.end()
  }
}



checkAdminRole()
