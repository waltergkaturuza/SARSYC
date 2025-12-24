import { Pool } from 'pg'

async function getPool() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  return pool
}

export async function incrementFallback(name: string, meta?: Record<string, any>) {
  const key = `fallback:${name}`
  const pool = await getPool()
  try {
    // Try to update existing key
    const now = new Date().toISOString()
    const updateRes = await pool.query(
      `UPDATE payload_kv SET data = jsonb_set(data, '{count}', to_jsonb((COALESCE((data->>'count')::int,0)+1)), true), data = jsonb_set(data, '{lastSeen}', to_jsonb($2::text), true) WHERE key = $1 RETURNING *`,
      [key, now]
    )

    if (updateRes.rowCount === 0) {
      const initial = { count: 1, lastSeen: now, meta: meta || null }
      await pool.query(`INSERT INTO payload_kv (key, data) VALUES ($1, $2::jsonb)`, [key, JSON.stringify(initial)])
    }
  } catch (err: any) {
    console.error('incrementFallback failed:', err?.message || err)
  } finally {
    await pool.end()
  }
}

export async function logExport(name: string, meta?: Record<string, any>) {
  const key = `export:${name}:${Date.now()}`
  const pool = await getPool()
  try {
    const payload = { ts: new Date().toISOString(), meta: meta || null }
    await pool.query(`INSERT INTO payload_kv (key, data) VALUES ($1, $2::jsonb)`, [key, JSON.stringify(payload)])
  } catch (err: any) {
    console.error('logExport failed:', err?.message || err)
  } finally {
    await pool.end()
  }
}
