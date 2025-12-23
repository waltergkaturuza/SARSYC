import { readFile } from 'fs/promises'
import pg from 'pg'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
const email = process.env.ADMIN_EMAIL || 'admin@local.test'
const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!'

async function run() {
  await client.connect()
  try {
    const check = await client.query('SELECT id FROM users WHERE email=$1', [email])
    if (check.rowCount > 0) {
      console.log('Admin already exists:', email)
      return
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10)
    const hash = await bcrypt.hash(password, rounds)
    const now = new Date().toISOString()

    const insert = await client.query(
      `INSERT INTO users (email, first_name, last_name, role, hash, salt, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [email, 'Admin', 'User', 'admin', hash, '', now, now]
    )

    console.log('Created admin user with id:', insert.rows[0].id, 'email:', email)
  } catch (err) {
    console.error('Create admin failed:', err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()
