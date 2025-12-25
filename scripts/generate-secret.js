#!/usr/bin/env node

/**
 * Generate a secure random secret key for PAYLOAD_SECRET
 * Run: node scripts/generate-secret.js
 */

import crypto from 'crypto'

// Generate a 32-byte (256-bit) random secret
const secret = crypto.randomBytes(32).toString('hex')

console.log('\n🔐 Generated PAYLOAD_SECRET:\n')
console.log(secret)
console.log('\n📝 Add this to your .env file:')
console.log(`PAYLOAD_SECRET=${secret}`)
console.log('\n📦 Also add it to Vercel environment variables:')
console.log('   1. Go to your Vercel project settings')
console.log('   2. Navigate to "Environment Variables"')
console.log('   3. Add: PAYLOAD_SECRET =', secret)
console.log('   4. Redeploy your application')
console.log('\n⚠️  Note: Changing this will invalidate all existing user sessions.')
console.log('   Users will need to log in again.\n')

