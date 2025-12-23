import { readFile } from 'fs/promises'
import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const sqlFile = new URL('../src/migrations/sql/20251223_130213.sql', import.meta.url)

async function run() {
  const sql = await readFile(sqlFile, 'utf8')
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
  console.log('Using connectionString:', connectionString)
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    console.log('Applying SQL migration to:', process.env.DATABASE_URL)
    await client.query(sql)
    console.log('Migration applied successfully')
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()
