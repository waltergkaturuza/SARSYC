import { getPayloadClient } from '../src/lib/payload.js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })
dotenv.config({ path: join(__dirname, '..', '.env') })

async function testLogin() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@sarsyc.org'
    const password = process.argv[2] || process.env.ADMIN_PASSWORD || 'Admin@1234'
    
    console.log('🔐 Testing login...')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${'*'.repeat(password.length)}`)
    console.log('')
    
    const payload = await getPayloadClient()
    
    try {
      const result = await payload.login({
        collection: 'users',
        data: {
          email,
          password,
        },
      })
      
      console.log('✅ Login successful!')
      console.log(`   User ID: ${result.user.id}`)
      console.log(`   Email: ${result.user.email}`)
      console.log(`   Role: ${result.user.role || 'unknown'}`)
      console.log(`   Token: ${result.token.substring(0, 20)}...`)
      console.log('')
      console.log('✅ Authentication test passed!')
      
    } catch (loginError) {
      console.error('❌ Login failed!')
      console.error(`   Error: ${loginError.message}`)
      console.error('')
      console.error('Possible causes:')
      console.error('   1. Wrong password')
      console.error('   2. Password hash mismatch')
      console.error('   3. Account locked')
      console.error('   4. User not found')
      console.error('   5. Role mismatch')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

testLogin()

