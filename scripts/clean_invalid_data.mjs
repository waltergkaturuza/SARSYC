/**
 * Script to clean invalid data from the database that doesn't match the current schema
 * Specifically fixes registrations with invalid country values
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

// Valid country codes (ISO 3166-1 alpha-2)
// This matches what getCountryOptions() returns from src/lib/countries.ts
const VALID_COUNTRIES = [
  'AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW', 'AU', 'AT', 'AZ',
  'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BQ', 'BA', 'BW', 'BV', 'BR',
  'IO', 'BN', 'BG', 'BF', 'BI', 'CV', 'KH', 'CM', 'CA', 'KY', 'CF', 'TD', 'CL', 'CN', 'CX', 'CC',
  'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CU', 'CW', 'CY', 'CZ', 'DK', 'DJ', 'DM', 'DO',
  'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF',
  'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY',
  'HT', 'HM', 'VA', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT', 'JM',
  'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'KP', 'KR', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY',
  'LI', 'LT', 'LU', 'MO', 'MK', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'YT',
  'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ',
  'NI', 'NE', 'NG', 'NU', 'NF', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH',
  'PN', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM', 'VC',
  'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS',
  'SS', 'ES', 'LK', 'SD', 'SR', 'SJ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK',
  'TO', 'TT', 'TN', 'TR', 'TM', 'TC', 'TV', 'UG', 'UA', 'AE', 'GB', 'US', 'UM', 'UY', 'UZ', 'VU',
  'VE', 'VN', 'VG', 'VI', 'WF', 'EH', 'YE', 'ZM', 'ZW'
]

async function cleanInvalidData() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    console.log('🔍 Checking for invalid data in registrations table...\n')

    // First, get all registrations with their country values
    // Note: Payload uses snake_case for database columns
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, country, nationality
      FROM registrations
      WHERE country IS NOT NULL
      ORDER BY id
    `)

    console.log(`Found ${result.rows.length} registrations with country values\n`)

    let invalidCount = 0
    const invalidRecords = []

    // Check each record
    for (const row of result.rows) {
      const country = row.country
      const nationality = row.nationality

      // Map common country names to codes
      const countryNameToCode = {
        'Zimbabwe': 'ZW',
        'United States': 'US',
        'United Kingdom': 'GB',
        'United States of America': 'US',
        'Testland': 'US', // Default test data to US
      }
      
      // Check if country is valid (code) or needs mapping (name)
      let countryCode = country
      if (countryNameToCode[country]) {
        countryCode = countryNameToCode[country]
      }
      
      const isCountryValid = VALID_COUNTRIES.includes(countryCode) || 
                            (typeof countryCode === 'string' && countryCode.length === 2 && /^[A-Z]{2}$/.test(countryCode))

      // Check if nationality is valid (if set)
      const isNationalityValid = !nationality || 
                                 VALID_COUNTRIES.includes(nationality) ||
                                 (typeof nationality === 'string' && nationality.length === 2 && /^[A-Z]{2}$/.test(nationality))

      if (!isCountryValid || !isNationalityValid) {
        invalidCount++
        invalidRecords.push({
          id: row.id,
          email: row.email,
          name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.email,
          country,
          nationality,
          issues: [
            !isCountryValid ? `Invalid country: "${country}"` : null,
            !isNationalityValid ? `Invalid nationality: "${nationality}"` : null,
          ].filter(Boolean),
        })
      }
    }

    if (invalidCount === 0) {
      console.log('✅ No invalid data found! All country values are valid.\n')
      await pool.end()
      return
    }

    console.log(`❌ Found ${invalidCount} registration(s) with invalid data:\n`)
    invalidRecords.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}, Email: ${record.email}, Name: ${record.name}`)
      console.log(`   Issues: ${record.issues.join(', ')}`)
      console.log(`   Country: "${record.country}", Nationality: "${record.nationality || 'N/A'}"\n`)
    })

    // Ask what to do (in a script, we'll default to updating to a safe value)
    console.log('🔧 Fixing invalid data...\n')

    for (const record of invalidRecords) {
      const updates = []
      const values = []
      let paramIndex = 1

      // Fix invalid country - try to map name to code first
      const countryNameToCode = {
        'Zimbabwe': 'ZW',
        'United States': 'US',
        'United Kingdom': 'GB',
        'United States of America': 'US',
        'Testland': 'US',
      }
      
      let newCountry = record.country
      if (countryNameToCode[record.country]) {
        newCountry = countryNameToCode[record.country]
      } else if (!VALID_COUNTRIES.includes(record.country) && 
                 !(typeof record.country === 'string' && record.country.length === 2 && /^[A-Z]{2}$/.test(record.country))) {
        // Set to a default valid country if no mapping found
        newCountry = 'US'
      }
      
      if (newCountry !== record.country) {
        updates.push(`country = $${paramIndex}`)
        values.push(newCountry)
        paramIndex++
        console.log(`   → Updating registration ${record.id} (${record.email}): country "${record.country}" → "${newCountry}"`)
      }

      // Fix invalid nationality
      if (record.nationality && 
          !VALID_COUNTRIES.includes(record.nationality) && 
          !(typeof record.nationality === 'string' && record.nationality.length === 2 && /^[A-Z]{2}$/.test(record.nationality))) {
        // Set to NULL or default
        updates.push(`nationality = $${paramIndex}`)
        values.push(null)
        paramIndex++
        console.log(`   → Updating registration ${record.id} (${record.email}): nationality "${record.nationality}" → NULL`)
      }

      if (updates.length > 0) {
        values.push(record.id)
        const updateQuery = `
          UPDATE registrations
          SET ${updates.join(', ')}
          WHERE id = $${paramIndex}
        `
        
        await pool.query(updateQuery, values)
        console.log(`   ✅ Updated registration ${record.id}\n`)
      }
    }

    if (invalidCount > 0) {
      console.log(`\n✅ Successfully cleaned ${invalidCount} invalid record(s)!\n`)

      // Verify the fix
      console.log('🔍 Verifying fix...\n')
      const verifyResult = await pool.query(`
        SELECT COUNT(*) as invalid_count
        FROM registrations
        WHERE country IS NOT NULL 
          AND country NOT IN (${VALID_COUNTRIES.map((_, i) => `$${i + 1}`).join(', ')})
      `, VALID_COUNTRIES)

      const remainingInvalid = parseInt(verifyResult.rows[0].invalid_count)
      if (remainingInvalid === 0) {
        console.log('✅ All data is now valid! The schema migration should work.\n')
      } else {
        console.log(`⚠️  Warning: ${remainingInvalid} invalid record(s) still remain. Manual cleanup may be needed.\n`)
      }
    }

  } catch (error) {
    console.error('❌ Error cleaning invalid data:', error.message)
    console.error(error.stack)
    throw error
  } finally {
    if (pool && !pool.ended) {
      await pool.end()
    }
  }
}

// Run the cleanup
cleanInvalidData()
  .then(() => {
    console.log('✨ Cleanup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })

