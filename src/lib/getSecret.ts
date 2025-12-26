/**
 * Get PAYLOAD_SECRET with database fallback
 * Tries environment variable first, then falls back to database
 */

import { Pool } from 'pg'

let secretCache: string | null = null

/**
 * Get secret from database as fallback
 */
async function getSecretFromDatabase(): Promise<string | null> {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️  DATABASE_URL not set, cannot use database fallback')
      return null
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })

    try {
      // Query the app_secrets table for the payload_secret
      const result = await pool.query(
        `SELECT value FROM app_secrets WHERE key = 'payload_secret' LIMIT 1`
      )

      await pool.end()

      if (result.rows.length > 0 && result.rows[0].value) {
        const secret = result.rows[0].value
        console.log('✅ Retrieved PAYLOAD_SECRET from database fallback')
        return secret
      }

      console.warn('⚠️  PAYLOAD_SECRET not found in database')
      return null
    } catch (queryError: any) {
      await pool.end()
      
      // If table doesn't exist, that's okay - we'll create it later
      if (queryError.message.includes('does not exist') || 
          queryError.message.includes('relation') ||
          queryError.code === '42P01') {
        console.warn('⚠️  app_secrets table does not exist yet. Run the initialization script.')
        return null
      }
      
      throw queryError
    }
  } catch (error: any) {
    console.error('❌ Error retrieving secret from database:', error.message)
    return null
  }
}

/**
 * Process secret the same way Payload CMS does for JWT signing
 * Payload hashes the secret with SHA-256 and truncates to 32 characters
 */
import crypto from 'crypto'

export function processPayloadSecret(rawSecret: string): string {
  // Payload CMS processes the secret: SHA-256 hash, then truncate to 32 chars
  const hash = crypto.createHash('sha256').update(rawSecret).digest('hex')
  return hash.substring(0, 32)
}

/**
 * Get PAYLOAD_SECRET - tries environment variable first, then database fallback
 * Returns the RAW secret (for config/init)
 */
export async function getSecret(): Promise<string> {
  // Check cache first
  if (secretCache) {
    return secretCache
  }

  // Try environment variable first
  const envSecret = process.env.PAYLOAD_SECRET
  if (envSecret && envSecret.trim() !== '') {
    secretCache = envSecret
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Using PAYLOAD_SECRET from environment variable (length: ' + envSecret.length + ' chars)')
    }
    return envSecret
  }

  console.log('⚠️  PAYLOAD_SECRET not in environment, trying database fallback...')

  // Try database fallback
  const dbSecret = await getSecretFromDatabase()
  if (dbSecret && dbSecret.trim() !== '') {
    secretCache = dbSecret
    return dbSecret
  }

  // If we're in development, use a default
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  Using default development secret (NOT for production)')
    return 'changeme-local-dev-only'
  }

  // In production, we must have a secret
  throw new Error(
    'PAYLOAD_SECRET is required. Please set it in:\n' +
    '  1. Environment variable PAYLOAD_SECRET, or\n' +
    '  2. Database table app_secrets (key: payload_secret)\n' +
    'Run: npm run init:secret to store a secret in the database.'
  )
}

/**
 * Get processed secret for JWT verification (hashed and truncated like Payload does)
 */
export async function getProcessedSecret(): Promise<string> {
  const rawSecret = await getSecret()
  return processPayloadSecret(rawSecret)
}

/**
 * Clear the secret cache (useful for testing)
 */
export function clearSecretCache() {
  secretCache = null
}



