import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function run() {
  await client.connect()
  try {
    const res = await client.query("SELECT email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5")
    console.log('Recent users:', res.rows)
  } catch (err) {
    console.error('Query failed:', err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()
