import 'dotenv/config'
import { Pool } from 'pg'

async function main() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
  if (!connectionString) {
    console.error('Error: Set DATABASE_URL_UNPOOLED or DATABASE_URL in environment')
    process.exit(1)
  }

  const useSsl = connectionString.includes('sslmode=require') || connectionString.includes('ssl=true')
  const pool = new Pool({ connectionString, ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}) })
  try {
    console.log('Connected to DB. Computing max existing SARSYC registration suffix...')

    const maxRes = await pool.query(
      "SELECT MAX( (substring(registration_id FROM 'SARSYC-\\d{4}-(\\d{5})'))::int ) AS max FROM registrations WHERE registration_id ~ '^SARSYC-\\d{4}-\\d{5}$'"
    )

    const max = maxRes.rows[0].max ? Number(maxRes.rows[0].max) : 0
    console.log('Computed max suffix:', max)

    const key = 'counters:registrations'
    const now = new Date().toISOString()

    // Try to update existing row: set count to GREATEST(existing, max) and record lastInitAt
    const updateRes = await pool.query(
      `UPDATE payload_kv
       SET data = jsonb_set(
         jsonb_set(COALESCE(data, '{}'::jsonb), '{count}', to_jsonb(GREATEST(COALESCE((data->>'count')::int, 0), $1)::int), true),
         '{lastInitAt}', to_jsonb($2::text), true
       )
       WHERE key = $3
       RETURNING *`,
      [max, now, key]
    )

    if (updateRes.rowCount > 0) {
      console.log('Updated existing payload_kv key. New data:', updateRes.rows[0].data)
    } else {
      const initial = { count: max, lastInitAt: now, source: 'init_script' }
      await pool.query(`INSERT INTO payload_kv (key, data) VALUES ($1, $2::jsonb)`, [key, JSON.stringify(initial)])
      console.log('Inserted new payload_kv key with:', initial)
    }

    console.log('Registration counter initialized successfully. Note: this operation is idempotent and will not reduce an existing counter.')
  } catch (err) {
    console.error('Failed to initialize registration counter:', err?.message || err)
    process.exit(2)
  } finally {
    await pool.end()
  }
}

// Direct invocation for ES module
main().catch((err) => { console.error('Unhandled error:', err); process.exit(2) })
