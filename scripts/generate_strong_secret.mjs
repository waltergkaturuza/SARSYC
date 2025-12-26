/**
 * Generate a strong, random secret for PAYLOAD_SECRET
 */

import crypto from 'crypto'

// Generate a 64-byte random secret and encode as base64
const secret = crypto.randomBytes(64).toString('base64')

console.log('\n🔐 Generated Strong PAYLOAD_SECRET:\n')
console.log('='.repeat(70))
console.log(secret)
console.log('='.repeat(70))
console.log(`\nLength: ${secret.length} characters`)
console.log('\n📝 Add this to your .env.local file:')
console.log(`PAYLOAD_SECRET=${secret}\n`)
console.log('⚠️  IMPORTANT: After updating PAYLOAD_SECRET:')
console.log('   1. Restart your dev server')
console.log('   2. Clear all cookies (old tokens will be invalid)')
console.log('   3. Log in again\n')

