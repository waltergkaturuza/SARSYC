import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })
dotenv.config({ path: join(__dirname, '..', '.env') })

async function testLoginAPI() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@sarsyc.org'
    const password = process.argv[2] || process.env.ADMIN_PASSWORD || 'Admin@1234'
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://sarsyc.vercel.app'
    
    console.log('🔐 Testing login via API...')
    console.log(`   URL: ${baseUrl}/api/auth/login`)
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${'*'.repeat(password.length)}`)
    console.log(`   Type: admin`)
    console.log('')
    
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        type: 'admin',
      }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ Login failed!')
      console.error(`   Status: ${response.status}`)
      console.error(`   Error: ${data.error || 'Unknown error'}`)
      console.error('')
      console.error('Possible causes:')
      console.error('   1. Wrong password')
      console.error('   2. Password hash mismatch')
      console.error('   3. Account locked')
      console.error('   4. User not found')
      console.error('   5. Role mismatch (not admin)')
      console.error('   6. Network/API error')
      process.exit(1)
    }
    
    console.log('✅ Login successful!')
    console.log(`   Success: ${data.success}`)
    console.log(`   User ID: ${data.user?.id}`)
    console.log(`   Email: ${data.user?.email}`)
    console.log(`   Name: ${data.user?.name}`)
    console.log(`   Role: ${data.user?.role}`)
    console.log(`   Token: ${data.token ? data.token.substring(0, 20) + '...' : 'Not provided'}`)
    console.log('')
    console.log('✅ Authentication test passed!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

testLoginAPI()



