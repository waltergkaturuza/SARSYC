import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()
const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function run() {
  await client.connect()
  try {
    const res = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public' ORDER BY tablename")
    console.log('Public tables:', res.rows.map(r => r.tablename))
  } catch (err) {
    console.error('Verify failed:', err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()
