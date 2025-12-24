import { Pool } from 'pg'

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  try {
    const res = await pool.query("SELECT key, data FROM payload_kv WHERE key LIKE 'fallback:%' ORDER BY key")
    console.log('fallback metrics:', res.rows)
  } catch (e) {
    console.error('error', e)
  } finally {
    await pool.end()
  }
}

run()
