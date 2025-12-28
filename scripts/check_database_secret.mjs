/**
 * Check if database has a stored PAYLOAD_SECRET that might differ from env var
 */

import { Pool } from 'pg'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })
dotenv.config({ path: join(__dirname, '..', '.env') })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables')
  process.exit(1)
}

async function checkDatabaseSecret() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    console.log('🔍 Checking for PAYLOAD_SECRET in database...\n')

    // Check if app_secrets table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'app_secrets'
      )
    `)

    const tableExists = tableCheck.rows[0].exists

    if (!tableExists) {
      console.log('✅ app_secrets table does not exist - no database secret stored\n')
      console.log('This means only the environment variable will be used.\n')
      await pool.end()
      return
    }

    console.log('✅ app_secrets table exists\n')

    // Check for payload_secret in database
    const result = await pool.query(`
      SELECT key, value, created_at, updated_at
      FROM app_secrets
      WHERE key = 'payload_secret'
      LIMIT 1
    `)

    if (result.rows.length === 0) {
      console.log('✅ No PAYLOAD_SECRET found in database\n')
      console.log('This means only the environment variable will be used.\n')
    } else {
      const dbSecret = result.rows[0]
      const dbSecretValue = dbSecret.value
      
      console.log('⚠️  PAYLOAD_SECRET found in database!\n')
      console.log('Database Secret Info:')
      console.log(`   Key: ${dbSecret.key}`)
      console.log(`   Length: ${dbSecretValue.length} characters`)
      console.log(`   Preview: ${dbSecretValue.substring(0, 20)}...`)
      console.log(`   Created: ${dbSecret.created_at}`)
      console.log(`   Updated: ${dbSecret.updated_at}\n`)

      // Compare with environment variable
      const envSecret = process.env.PAYLOAD_SECRET
      
      if (envSecret) {
        console.log('Environment Variable Secret Info:')
        console.log(`   Length: ${envSecret.length} characters`)
        console.log(`   Preview: ${envSecret.substring(0, 20)}...\n`)

        if (dbSecretValue === envSecret) {
          console.log('✅ Database secret matches environment variable - no conflict!\n')
        } else {
          console.log('❌ MISMATCH DETECTED!\n')
          console.log('⚠️  The database secret is DIFFERENT from the environment variable!')
          console.log('⚠️  This will cause token verification failures!\n')
          console.log('🔧 Solution:')
          console.log('   1. Update the database secret to match the env var, OR')
          console.log('   2. Delete the database secret so only env var is used, OR')
          console.log('   3. Update the env var to match the database secret\n')
          console.log('To delete the database secret, run:')
          console.log('   DELETE FROM app_secrets WHERE key = \'payload_secret\';\n')
        }
      } else {
        console.log('⚠️  No PAYLOAD_SECRET in environment variables!')
        console.log('⚠️  The system will use the database secret as fallback.\n')
      }
    }

    // Show all secrets in the table
    const allSecrets = await pool.query(`
      SELECT key, LENGTH(value) as value_length, created_at
      FROM app_secrets
      ORDER BY created_at DESC
    `)

    if (allSecrets.rows.length > 0) {
      console.log('All secrets in database:')
      allSecrets.rows.forEach((secret, index) => {
        console.log(`   ${index + 1}. ${secret.key} (${secret.value_length} chars) - Created: ${secret.created_at}`)
      })
      console.log()
    }

  } catch (error) {
    console.error('❌ Error checking database secret:', error.message)
    console.error(error.stack)
    throw error
  } finally {
    if (pool && !pool.ended) {
      await pool.end()
    }
  }
}

// Run the check
checkDatabaseSecret()
  .then(() => {
    console.log('✨ Check complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })


