/**
 * Script to test login with both passwords
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
const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const PASSWORDS_TO_TEST = ['Admin@123', 'Admin@1234']

async function testPassword(password) {
  console.log(`\n🧪 Testing password: ${password.substring(0, 3)}***\n`)

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: password,
        type: 'admin',
      }),
    })

    const data = await response.json()

    console.log(`Status: ${response.status} ${response.statusText}`)
    
    if (response.ok && data.success) {
      console.log(`✅ SUCCESS with password: ${password.substring(0, 3)}***`)
      console.log(`User: ${data.user.name || data.user.email}`)
      console.log(`Role: ${data.user.role}`)
      return true
    } else {
      console.log(`❌ FAILED with password: ${password.substring(0, 3)}***`)
      if (data.error) {
        console.log(`Error: ${data.error}`)
      }
      return false
    }
  } catch (error) {
    console.error(`❌ Error testing password ${password.substring(0, 3)}***:`, error.message)
    return false
  }
}

async function testAllPasswords() {
  console.log('🔐 Testing multiple passwords for admin login...\n')
  console.log(`Email: ${ADMIN_EMAIL}`)
  console.log(`Base URL: ${BASE_URL}\n`)

  const results = []
  
  for (const password of PASSWORDS_TO_TEST) {
    const success = await testPassword(password)
    results.push({ password, success })
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Test Results Summary:')
  console.log('='.repeat(50))
  
  results.forEach((result, index) => {
    const status = result.success ? '✅ WORKS' : '❌ FAILED'
    console.log(`${index + 1}. ${result.password.substring(0, 3)}*** - ${status}`)
  })

  const workingPasswords = results.filter(r => r.success)
  
  if (workingPasswords.length === 0) {
    console.log('\n❌ None of the tested passwords work!')
    console.log('You may need to reset the password.')
  } else if (workingPasswords.length === 1) {
    console.log(`\n✅ Found working password: ${workingPasswords[0].password}`)
  } else {
    console.log(`\n⚠️  Multiple passwords work (unexpected):`)
    workingPasswords.forEach(r => console.log(`   - ${r.password}`))
  }

  return results
}

// Run the tests
testAllPasswords()
  .then((results) => {
    const hasWorking = results.some(r => r.success)
    process.exit(hasWorking ? 0 : 1)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })

