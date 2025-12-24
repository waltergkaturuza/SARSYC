import nodemailer from 'nodemailer'

const getTransporter = (() => {
  let transporter: any = null
  return () => {
    if (transporter) return transporter

    const host = process.env.SMTP_HOST
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (!host || !port) {
      console.warn('SMTP not configured (SMTP_HOST/SMTP_PORT missing). Emails will be logged, not sent.')
      transporter = null
      return null
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: user && pass ? { user, pass } : undefined,
    })

    // Optional: verify once
    transporter.verify().catch((err: any) => {
      console.warn('SMTP transporter verification failed:', err?.message || err)
    })

    return transporter
  }
})()

export async function sendMail({ to, subject, text, html }: { to: string; subject: string; text?: string; html?: string }) {
  const transporter = getTransporter()
  const from = process.env.SMTP_FROM || `noreply@${process.env.NEXT_PUBLIC_SITE_DOMAIN || 'localhost'}`

  const message = {
    from,
    to,
    subject,
    text,
    html,
  }

  if (!transporter) {
    // Don't throw in server flow — log and return
    console.info('Email (mock) ->', message)
    return { success: true, mock: true }
  }

  try {
    const info = await transporter.sendMail(message)
    console.info('Email sent:', info?.messageId || '(no messageId)')
    return { success: true, info }
  } catch (err: any) {
    console.error('Email send failed:', err?.message || err)
    return { success: false, error: err?.message || String(err) }
  }
}

export function sendRegistrationConfirmation({ to, firstName, registrationId }: { to: string; firstName?: string; registrationId: string }) {
  const subject = `SARSYC Registration Confirmation — ${registrationId}`
  const text = `Dear ${firstName || 'attendee'},\n\nThank you for registering for SARSYC. Your registration ID is ${registrationId}. We will be in touch with next steps.`
  const html = `<p>Dear ${firstName || 'attendee'},</p><p>Thank you for registering for <strong>SARSYC</strong>. Your registration ID is <strong>${registrationId}</strong>.</p><p>We will be in touch with next steps.</p>`

  // Return the promise so callers can catch failures if desired
  return sendMail({ to, subject, text, html })
}
