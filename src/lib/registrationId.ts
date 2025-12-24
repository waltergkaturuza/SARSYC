import { Pool } from 'pg'

async function getPool() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  return pool
}

/**
 * Atomically returns the next sequential registration number and formatted ID.
 * Uses payload_kv key `counters:registrations` to store the counter.
 */
export async function getNextRegistrationId() {
  const key = 'counters:registrations'
  const pool = await getPool()
  try {
    // Try to atomically increment the counter
    const updateRes = await pool.query(
      `UPDATE payload_kv
       SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{count}', to_jsonb((COALESCE((data->>'count')::int, 0) + 1)), true)
       WHERE key = $1
       RETURNING data`,
      [key]
    )

    let count: number | null = null

    if (updateRes.rowCount > 0) {
      count = parseInt(updateRes.rows[0].data.count, 10)
    } else {
      // Insert initial counter row
      const initial = { count: 1 }
      await pool.query(`INSERT INTO payload_kv (key, data) VALUES ($1, $2::jsonb)`, [key, JSON.stringify(initial)])
      count = 1
    }

    const year = new Date().getFullYear()
    const padded = String(count).padStart(5, '0')
    const id = `SARSYC-${year}-${padded}`

    console.info('Allocated registration counter', count, '->', id)
    return { id, count }
  } catch (err: any) {
    console.error('getNextRegistrationId failed:', err?.message || err)
    // Fallback: deterministic-ish id to avoid throwing
    const id = `SARSYC-${new Date().getFullYear()}-${Math.random().toString(36).substr(2,6).toUpperCase()}`
    return { id, count: null }
  } finally {
    await pool.end()
  }
}
