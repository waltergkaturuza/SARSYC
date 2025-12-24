import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
const useSsl = /sslmode=require|ssl=true/i.test(connectionString)
const client = new pg.Client({ connectionString, ssl: useSsl ? { rejectUnauthorized: false } : undefined })

async function run() {
  await client.connect()
  try {
    const colRes = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name='registrations' AND column_name='deleted_at'`)
    console.log('deleted_at column present in registrations:', colRes.rowCount > 0)

    const tableRes = await client.query(`SELECT to_regclass('public.participants') as table_exists`)
    console.log('participants table exists:', !!tableRes.rows[0].table_exists)

    const idxRes = await client.query(`SELECT indexname FROM pg_indexes WHERE tablename='participants'`)
    console.log('participants indexes:', idxRes.rows.map(r=>r.indexname))

    const fkRes = await client.query(`SELECT constraint_name FROM information_schema.table_constraints WHERE table_name='participants' AND constraint_type='FOREIGN KEY'`)
    console.log('participants foreign keys:', fkRes.rows.map(r=>r.constraint_name))
  } catch (err) {
    console.error('check failed', err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()