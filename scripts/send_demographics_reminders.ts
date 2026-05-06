/**
 * Email primary authors whose abstracts are missing age, gender, and/or institution.
 * Groups by email so one message lists all affected abstracts for that address.
 *
 * Requires: DATABASE_URL, SMTP_USER, SMTP_PASS (and optional SMTP_HOST, SMTP_PORT, SMTP_FROM).
 * Email body tells authors the abstract portal is closed and to send demographics by reply or to researchunit@saywhat.org.zw.
 *
 * Usage:
 *   npm run mail:demographics-reminders
 *       → dry-run only
 *   npm run mail:demographics-reminders:send
 *       → actually send (avoids npm eating `--send` when passed after `--`)
 *   npx tsx scripts/send_demographics_reminders.ts --send --limit=5 --delay-ms=1200
 *
 * Runs on YOUR machine (or CI) using DATABASE_URL + SMTP_* from .env — not inside Vercel.
 * For production DB + same SMTP as the live site: copy DATABASE_URL and SMTP_* from Vercel
 * into .env.local (never commit), then run here. Gmail 535 = regenerate App Password, no spaces.
 */

import dotenv from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import postgres from 'postgres'
import { sendAbstractDemographicsReminder } from '../src/lib/mail'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })
dotenv.config({ path: join(__dirname, '..', '.env') })

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is required')
  process.exit(1)
}
const dbUrl: string = process.env.DATABASE_URL

function parseArg(name: string): string | undefined {
  const pref = `${name}=`
  const hit = process.argv.find((a) => a.startsWith(pref))
  return hit ? hit.slice(pref.length) : undefined
}

const doSend = process.argv.includes('--send')
const limitRaw = parseArg('--limit')
const limit = limitRaw != null && limitRaw !== '' ? Math.max(1, parseInt(limitRaw, 10)) : undefined
const delayRaw = parseArg('--delay-ms')
const delayMs =
  delayRaw != null && delayRaw !== '' ? Math.max(0, parseInt(delayRaw, 10)) : 900

/** Match src/lib/mail.ts: trim + strip wrapping quotes. */
function readEnvVal(key: string): string {
  const v = process.env[key]
  if (v == null) return ''
  let s = v.trim()
  if (s.length >= 2) {
    const q = s[0]
    if ((q === '"' || q === "'") && s[s.length - 1] === q) {
      s = s.slice(1, -1).trim()
    }
  }
  return s
}

function hasSmtpCredentials(): boolean {
  const user = readEnvVal('SMTP_USER')
  const passRaw =
    readEnvVal('SMTP_PASS') ||
    readEnvVal('SMTP_PASSWORD') ||
    readEnvVal('EMAIL_PASSWORD') ||
    readEnvVal('MAIL_PASSWORD')
  const pass = passRaw.replace(/\s+/g, '').trim()
  return Boolean(user && pass)
}

type Row = {
  id: number
  submission_id: string | null
  primary_author_email: string
  primary_author_first_name: string | null
  primary_author_last_name: string | null
  title: string
}

async function main() {
  const sql = postgres(dbUrl, { max: 1 })

  let rows: Row[]
  try {
    rows = await sql<Row[]>`
      SELECT
        id,
        submission_id,
        primary_author_email,
        primary_author_first_name,
        primary_author_last_name,
        title
      FROM abstracts
      WHERE
        primary_author_age IS NULL
        OR NULLIF(trim(coalesce(primary_author_gender, '')), '') IS NULL
        OR NULLIF(trim(coalesce(primary_author_institution, '')), '') IS NULL
      ORDER BY lower(trim(primary_author_email)), id
    `
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('❌ Query failed:', msg)
    console.error('   Ensure migrations added primary_author_age, primary_author_gender, primary_author_institution.')
    await sql.end({ timeout: 2 })
    process.exit(1)
  }

  await sql.end({ timeout: 5 })

  const groups = new Map<string, Row[]>()
  for (const r of rows) {
    const email = (r.primary_author_email || '').trim()
    if (!email) continue
    const key = email.toLowerCase()
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(r)
  }

  console.log(
    `\n${doSend ? '📤 SEND mode' : '🔍 DRY-RUN (no email sent; pass --send to deliver)'}\n` +
      `   Abstract rows matching filter: ${rows.length}\n` +
      `   Distinct recipient emails: ${groups.size}\n`,
  )

  if (groups.size === 0) {
    console.log('Nothing to do.')
    return
  }

  if (doSend && !hasSmtpCredentials()) {
    console.error(
      '❌ Set SMTP_USER and SMTP_PASS in .env.local (or SMTP_PASSWORD). Run: npm run mail:verify-smtp',
    )
    process.exit(1)
  }

  const groupsArr = [...groups.values()]
  const maxEmails = limit != null ? Math.min(limit, groupsArr.length) : groupsArr.length

  for (let i = 0; i < maxEmails; i++) {
    const list = groupsArr[i]
    const to = list[0].primary_author_email.trim()
    const firstName = (list[0].primary_author_first_name || '').trim()
    const items = list.map((r) => ({
      submissionId: r.submission_id,
      title: r.title || '(no title)',
    }))

    console.log('—')
    console.log(`To: ${to}`)
    console.log(`Abstracts: ${items.length}`)
    for (const it of items) {
      console.log(`   • ${it.submissionId || '—'} — ${it.title}`)
    }

    if (doSend) {
      const result = await sendAbstractDemographicsReminder({ to, firstName, items })
      const r = result as { success?: boolean; mock?: boolean; error?: string }
      if (r.mock) {
        console.error(
          '   ⚠️ SMTP not configured (missing SMTP_USER / SMTP_PASS). Add the same vars you use on Vercel to .env.local.',
        )
      } else if (!r.success) {
        const err = r.error || String(result)
        console.error('   ⚠️ Send failed:', err)
        if (String(err).includes('535') || String(err).toLowerCase().includes('badcredentials')) {
          console.error(
            '      Hint: Gmail rejected login — create a new App Password (Google Account → Security → 2-Step → App passwords), set SMTP_PASS with no spaces, SMTP_USER = that Gmail address.',
          )
        }
      } else {
        console.log('   ✅ Sent')
      }
      if (delayMs > 0 && i < maxEmails - 1) {
        await new Promise((r) => setTimeout(r, delayMs))
      }
    }
  }

  if (limit != null && limit < groups.size) {
    console.log(`\nNote: ${groups.size - limit} recipient(s) not processed (--limit=${limit}).`)
  }

  if (!doSend) {
    console.log('\nThis was a dry-run. Re-run with --send to deliver messages.\n')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
