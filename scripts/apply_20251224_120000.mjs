import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const statements = [
  `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS deleted_at timestamp(3) with time zone;`,
  `CREATE TABLE IF NOT EXISTS participants (
    id serial PRIMARY KEY NOT NULL,
    first_name varchar NOT NULL,
    last_name varchar NOT NULL,
    email varchar NOT NULL,
    phone varchar,
    country varchar,
    organization varchar,
    job_title varchar,
    photo_id integer,
    registration_id integer,
    ticket_type varchar,
    payment_status varchar,
    checked_in boolean DEFAULT false,
    checked_in_at timestamp(3) with time zone,
    badges_printed_at timestamp(3) with time zone,
    notes varchar,
    tags jsonb,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS participants_email_unique ON participants (email);`,
  `CREATE INDEX IF NOT EXISTS participants_registration_idx ON participants (registration_id);`,
  async function addFkIfMissing(client) {
    const res = await client.query(`SELECT constraint_name FROM information_schema.table_constraints WHERE table_name='participants' AND constraint_name='participants_registration_fk'`)
    if (res.rowCount === 0) {
      await client.query(`ALTER TABLE participants ADD CONSTRAINT participants_registration_fk FOREIGN KEY (registration_id) REFERENCES registrations (id) ON DELETE SET NULL`)
    } else {
      console.log('Foreign key participants_registration_fk already exists')
    }
  },
]


const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!connectionString) {
  console.error('Please provide DATABASE_URL_UNPOOLED or DATABASE_URL in the environment')
  process.exit(1)
}
const useSsl = /sslmode=require|ssl=true/i.test(connectionString)
const client = new pg.Client({ connectionString, ssl: useSsl ? { rejectUnauthorized: false } : undefined })

async function run() {
  await client.connect()
  try {
    console.log('Applying migration 20251224_120000 to', connectionString)
    for (let i = 0; i < statements.length; i++) {
      const s = statements[i]
      try {
        if (typeof s === 'function') {
          await s(client)
        } else {
          await client.query(s)
        }
        console.log(`Statement ${i+1} succeeded`)
      } catch (err) {
        console.error(`Statement ${i+1} failed:\n`, typeof s === 'function' ? s.toString().slice(0, 200) : s)
        throw err
      }
    }
    console.log('Applied migration 20251224_120000')
  } catch (err) {
    console.error('failed to apply migration:', err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()
