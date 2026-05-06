/**
 * Quick check: loads .env.local then .env and runs nodemailer verify() with the same rules as src/lib/mail.ts.
 *
 *   npm run mail:verify-smtp
 */
import dotenv from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { verifySmtpConnection } from '../src/lib/mail'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })
dotenv.config({ path: join(__dirname, '..', '.env') })

async function main() {
  const user = process.env.SMTP_USER?.trim()
  console.log(user ? `SMTP_USER is set (${user.length} chars)` : 'SMTP_USER: missing')
  const hasPass = Boolean(
    process.env.SMTP_PASS ||
      process.env.SMTP_PASSWORD ||
      process.env.EMAIL_PASSWORD ||
      process.env.MAIL_PASSWORD,
  )
  console.log(hasPass ? 'Password env: set (one of SMTP_PASS / SMTP_PASSWORD / …)' : 'Password env: missing')

  const r = await verifySmtpConnection()
  if (r.ok) {
    console.log('\n✅ SMTP verify OK — server accepted credentials.\n')
  } else {
    console.error('\n❌ SMTP verify failed:', r.error)
    console.error(
      '\nFor Gmail 535: use the same Google account for SMTP_USER as for the App Password; paste the 16-char app password with no spaces; ensure 2-Step Verification is on.\n',
    )
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
