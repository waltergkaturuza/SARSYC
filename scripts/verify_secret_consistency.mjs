/**
 * Verify that the secret used in config matches the one used for verification
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })
dotenv.config({ path: join(__dirname, '..', '.env') })

const envSecret = process.env.PAYLOAD_SECRET

console.log('🔍 Verifying PAYLOAD_SECRET consistency...\n')

if (!envSecret) {
  console.error('❌ PAYLOAD_SECRET not found in environment variables!')
  console.error('   Please set PAYLOAD_SECRET in .env.local\n')
  process.exit(1)
}

console.log('✅ PAYLOAD_SECRET found in environment:')
console.log(`   Length: ${envSecret.length} characters`)
console.log(`   Preview: ${envSecret.substring(0, 20)}...\n`)

if (envSecret.length < 32) {
  console.warn('⚠️  WARNING: Secret is less than 32 characters!')
  console.warn('   JWT secrets should be at least 32 bytes (64 hex chars) for security.\n')
  console.warn('   Generate a new secret with: node scripts/generate_strong_secret.mjs\n')
}

// Check if it's the old short secret
if (envSecret === 'changeme-local' || envSecret.length === 14) {
  console.error('❌ ERROR: Using old short secret (changeme-local)!')
  console.error('   This will cause token verification failures.\n')
  console.error('   Generate a new secret with: node scripts/generate_strong_secret.mjs')
  console.error('   Then update .env.local and restart the server.\n')
  process.exit(1)
}

// Check if it's the default dev secret
if (envSecret === 'changeme-local-dev-only') {
  console.warn('⚠️  WARNING: Using default development secret!')
  console.warn('   This should only be used in development.\n')
}

console.log('✅ Secret looks good!\n')
console.log('📝 Important reminders:')
console.log('   1. Make sure you RESTARTED the dev server after updating .env.local')
console.log('   2. Clear browser cookies (old tokens are invalid)')
console.log('   3. Log in again to get a new token\n')




