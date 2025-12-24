import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

async function run() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
  if (!connectionString) {
    console.error('Please provide DATABASE_URL_UNPOOLED or DATABASE_URL')
    process.exit(1)
  }
  const useSsl = /sslmode=require|ssl=true/i.test(connectionString)
  const client = new pg.Client({ connectionString, ssl: useSsl ? { rejectUnauthorized: false } : undefined })

  await client.connect()
  try {
    console.log('Inserting registration row...')
    const regRes = await client.query(
      `INSERT INTO registrations (first_name, last_name, email, phone, country, organization, category, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,now(),now()) RETURNING id, registration_id`,
      ['Smoke', 'Tester', `smoke+${Date.now()}@sarsyc.local`, '+000', 'Testland', 'QA', 'observer']
    )
    const reg = regRes.rows[0]
    console.log('Created registration id:', reg.id)

    console.log('Inserting participant row linked to registration...')
    const pRes = await client.query(
      `INSERT INTO participants (first_name, last_name, email, registration_id, created_at, updated_at) VALUES ($1,$2,$3,$4,now(),now()) RETURNING id`,
      ['Smoke', 'Participant', `smoke.participant+${Date.now()}@sarsyc.local`, reg.id]
    )
    const p = pRes.rows[0]
    console.log('Created participant id:', p.id)

    console.log('Simulating check-in (set checked_in=true and checked_in_at)')
    await client.query(`UPDATE participants SET checked_in = true, checked_in_at = now(), updated_at = now() WHERE id = $1`, [p.id])
    const check1 = await client.query(`SELECT checked_in, checked_in_at FROM participants WHERE id = $1`, [p.id])
    console.log('After check-in:', check1.rows[0])

    console.log('Simulating badge print (set badges_printed_at)')
    await client.query(`UPDATE participants SET badges_printed_at = now(), updated_at = now() WHERE id = $1`, [p.id])
    const badge1 = await client.query(`SELECT badges_printed_at FROM participants WHERE id = $1`, [p.id])
    console.log('After badge:', badge1.rows[0])

    console.log('Simulating soft-delete on registration (set deleted_at)')
    await client.query(`UPDATE registrations SET deleted_at = now(), status = 'cancelled', updated_at = now() WHERE id = $1`, [reg.id])
    const del1 = await client.query(`SELECT deleted_at FROM registrations WHERE id = $1`, [reg.id])
    console.log('Registration deleted_at:', del1.rows[0])

    console.log('Smoke test successful ✅')
    await client.end()
    process.exit(0)
  } catch (err) {
    console.error('Smoke test failed:', err)
    await client.end()
    process.exit(1)
  }
}

run()
