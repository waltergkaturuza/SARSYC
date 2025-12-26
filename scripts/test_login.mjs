/**
 * Script to test admin login
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })
dotenv.config({ path: join(__dirname, '..', '.env') })

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sarsyc.org'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123'
const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

async function testLogin() {
  console.log('🧪 Testing admin login...\n')
  console.log(`Email: ${ADMIN_EMAIL}`)
  console.log(`Password: ${ADMIN_PASSWORD.substring(0, 3)}*** (hidden)`)
  console.log(`Base URL: ${BASE_URL}\n`)

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        type: 'admin',
      }),
    })

    const data = await response.json()

    console.log(`Status: ${response.status} ${response.statusText}`)
    console.log(`Response:`, JSON.stringify(data, null, 2))

    if (response.ok && data.success) {
      console.log('\n✅ Login successful!')
      console.log(`User: ${data.user.name || data.user.email}`)
      console.log(`Role: ${data.user.role}`)
      console.log(`Token: ${data.token ? data.token.substring(0, 20) + '...' : 'N/A'}`)
      
      // Check if cookie was set
      const setCookieHeader = response.headers.get('set-cookie')
      if (setCookieHeader) {
        console.log(`\n✅ Cookie set: ${setCookieHeader.substring(0, 50)}...`)
      } else {
        console.log(`\n⚠️  No Set-Cookie header found`)
      }
    } else {
      console.log('\n❌ Login failed!')
      if (data.error) {
        console.log(`Error: ${data.error}`)
      }
      if (data.locked) {
        console.log(`Account is locked until: ${data.lockUntil}`)
      }
    }

    return response.ok && data.success
  } catch (error) {
    console.error('\n❌ Error testing login:', error.message)
    console.error(error.stack)
    return false
  }
}

// Run the test
testLogin()
  .then((success) => {
    if (success) {
      console.log('\n✨ Login test passed!')
      process.exit(0)
    } else {
      console.log('\n❌ Login test failed!')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
