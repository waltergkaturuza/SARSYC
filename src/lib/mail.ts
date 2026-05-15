import nodemailer from 'nodemailer'
import {
  formatRegistrationBankTransferHtml,
  formatRegistrationBankTransferText,
} from '@/lib/registrationBankTransfer'

/** Trim and strip one pair of surrounding quotes (common .env mistake). */
function readEnvRaw(key: string): string | undefined {
  const v = process.env[key]
  if (v == null) return undefined
  let s = v.trim()
  if (s.length >= 2) {
    const q = s[0]
    if ((q === '"' || q === "'") && s[s.length - 1] === q) {
      s = s.slice(1, -1).trim()
    }
  }
  return s
}

function smtpPassword(): string | undefined {
  const raw =
    readEnvRaw('SMTP_PASS') ??
    readEnvRaw('SMTP_PASSWORD') ??
    readEnvRaw('EMAIL_PASSWORD') ??
    readEnvRaw('MAIL_PASSWORD')
  if (!raw) return undefined
  return raw.replace(/\s+/g, '').trim()
}

const getTransporter = (() => {
  let cached: any | null | undefined
  return () => {
    if (cached !== undefined) return cached

    const host = (readEnvRaw('SMTP_HOST') || 'smtp.gmail.com').toLowerCase()
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587
    const user = readEnvRaw('SMTP_USER')?.trim()
    const pass = smtpPassword()

    if (!user || !pass) {
      console.warn(
        'SMTP: Set SMTP_USER and SMTP_PASS (or SMTP_PASSWORD) in .env.local — see .env.example.',
      )
      cached = null
      return null
    }

    const useGmailService =
      host.includes('gmail.com') || user.toLowerCase().endsWith('@gmail.com')

    const transport = useGmailService
      ? nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass },
        })
      : nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        })

    transport.verify().catch((err: any) => {
      console.warn('SMTP transporter verification failed:', err?.message || err)
    })

    cached = transport
    return cached
  }
})()

/** Call from CLI to confirm Gmail accepts SMTP_USER + app password before bulk send. */
export async function verifySmtpConnection(): Promise<{ ok: true } | { ok: false; error: string }> {
  const transporter = getTransporter()
  if (!transporter) {
    return {
      ok: false,
      error:
        'SMTP_USER and password not set (use SMTP_PASS or SMTP_PASSWORD — see .env.example).',
    }
  }
  try {
    await transporter.verify()
    return { ok: true }
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e)
    return { ok: false, error: err }
  }
}

export async function sendMail({ to, subject, text, html }: { to: string; subject: string; text?: string; html?: string }) {
  const transporter = getTransporter()
  const from = readEnvRaw('SMTP_FROM') || readEnvRaw('SMTP_USER') || 'noreply@localhost'
  const replyTo = readEnvRaw('SMTP_REPLY_TO') || readEnvRaw('SMTP_USER') || from

  const message = {
    from,
    replyTo,
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

export async function sendRegistrationConfirmation({
  to,
  firstName,
  registrationId,
  paymentRequired,
  manualBankPayment,
  packageName,
  amountUsd,
}: {
  to: string
  firstName?: string
  registrationId: string
  /** When true, delegate must complete card payment before registration is fully confirmed */
  paymentRequired?: boolean
  /** Bank transfer instructions (hosted card payment temporarily disabled) */
  manualBankPayment?: boolean
  packageName?: string
  amountUsd?: number
}) {
  const name = firstName || 'attendee'
  const subject = `SARSYC VI — Registration received (${registrationId})`
  let text: string
  let html: string
  if (manualBankPayment && packageName != null && amountUsd != null) {
    const bankText = formatRegistrationBankTransferText({
      registrationId,
      packageName,
      amountUsd,
    })
    const bankHtml = formatRegistrationBankTransferHtml({
      registrationId,
      packageName,
      amountUsd,
    })
    text = `Dear ${name},\n\nThank you. Your registration has been saved. Your registration ID is ${registrationId}.\n\nYour place is not confirmed until we receive your registration fee by bank transfer and verify proof of payment.\n\n${bankText}\n\nWe will email you once payment is confirmed. Questions: registration@sarsyc.org`
    html = `<p>Dear ${name},</p>
<p>Thank you. Your registration has been <strong>saved</strong>. Your registration ID is <strong>${registrationId}</strong>.</p>
<p><strong>Important:</strong> your place is not confirmed until we receive your fee by <strong>bank transfer</strong> and verify proof of payment.</p>
${bankHtml}
<p>We will email you once payment is confirmed. Questions: <a href="mailto:registration@sarsyc.org">registration@sarsyc.org</a>.</p>`
  } else if (paymentRequired) {
    text = `Dear ${name},\n\nThank you. Your registration has been saved. Your registration ID is ${registrationId}.\n\nImportant: your place is not confirmed until your card payment completes successfully on the secure Stanbic hosted page. You should be redirected there automatically after you submit the form.\n\nIf the payment page did not open, use the link on the confirmation screen to try again, or contact registration@sarsyc.org with your registration ID.\n\nYou will receive another email as soon as payment is confirmed (or instructions if payment could not be completed).`
    html = `<p>Dear ${name},</p>
<p>Thank you. Your registration has been <strong>saved</strong>. Your registration ID is <strong>${registrationId}</strong>.</p>
<p><strong>Important:</strong> your place is not fully confirmed until <strong>card payment completes</strong> on the secure Stanbic / N-Genius page. You should be redirected there right after submitting the form.</p>
<p>If the payment page did not open, use the <strong>“Complete payment”</strong> option on the website with your registration ID, or email <a href="mailto:registration@sarsyc.org">registration@sarsyc.org</a>.</p>
<p>You will get <strong>another email</strong> when payment succeeds or if we need you to retry.</p>`
  } else {
    text = `Dear ${name},\n\nThank you for registering for SARSYC VI. Your registration ID is ${registrationId}. We will be in touch with next steps.`
    html = `<p>Dear ${name},</p><p>Thank you for registering for <strong>SARSYC VI</strong>. Your registration ID is <strong>${registrationId}</strong>.</p><p>We will be in touch with next steps.</p>`
  }
  return sendMail({ to, subject, text, html })
}

export async function sendRegistrationPaymentConfirmed({
  to,
  firstName,
  registrationId,
}: {
  to: string
  firstName?: string
  registrationId: string
}) {
  const name = firstName || 'attendee'
  const subject = `SARSYC VI — Payment received (${registrationId})`
  const text = `Dear ${name},\n\nWe have received your registration payment successfully. Your registration ID is ${registrationId}.\n\nYour registration is now confirmed from a payment perspective. We look forward to seeing you in Windhoek.\n\nIf you did not make this payment, contact registration@sarsyc.org immediately.`
  const html = `<p>Dear ${name},</p>
<p>We have received your <strong>registration payment successfully</strong>. Your registration ID is <strong>${registrationId}</strong>.</p>
<p>Your registration is now <strong>confirmed</strong> from a payment perspective. We look forward to seeing you at SARSYC VI in Windhoek.</p>
<p>If you did not make this payment, contact <a href="mailto:registration@sarsyc.org">registration@sarsyc.org</a> immediately.</p>`
  return sendMail({ to, subject, text, html })
}

/** After returning from the gateway without a successful capture (one email per registration, deduped via Payload). */
export async function sendRegistrationPaymentNotConfirmed({
  to,
  firstName,
  registrationId,
  summary,
}: {
  to: string
  firstName?: string
  registrationId: string
  summary?: string
}) {
  const name = firstName || 'attendee'
  const subject = `SARSYC VI — Payment not completed (${registrationId})`
  const extra = summary ? `\n\nDetails from the gateway: ${summary}` : ''
  const text = `Dear ${name},\n\nWe noticed you returned from the payment page but your registration fee has not yet been confirmed as paid. Your registration ID is ${registrationId}.${extra}\n\nYou can try paying again using the registration flow with your email, or contact registration@sarsyc.org with your registration ID.\n\nIf payment was deducted from your card but this email says otherwise, attach your bank SMS or receipt and email registration@sarsyc.org — we will reconcile with Stanbic.\n`
  const html = `<p>Dear ${name},</p>
<p>You returned from the secure payment page, but your <strong>registration fee has not yet been confirmed as paid</strong>. Your registration ID is <strong>${registrationId}</strong>.</p>
${summary ? `<p><strong>Gateway summary:</strong> ${escapeHtml(summary)}</p>` : ''}
<p>You can try again from the registration site (same email) or email <a href="mailto:registration@sarsyc.org">registration@sarsyc.org</a> with your registration ID.</p>
<p>If your bank shows a debit but this email says unpaid, reply with proof and we will follow up with the bank.</p>`
  return sendMail({ to, subject, text, html })
}

/** Could not open hosted payment session after registration was saved */
export async function sendRegistrationPaymentSessionFailed({
  to,
  firstName,
  registrationId,
  hint,
}: {
  to: string
  firstName?: string
  registrationId: string
  hint?: string
}) {
  const name = firstName || 'attendee'
  const subject = `Action needed: complete payment — SARSYC VI (${registrationId})`
  const tech = hint ? `\nTechnical note (for support): ${hint}` : ''
  const text = `Dear ${name},\n\nYour registration was saved successfully. Your registration ID is ${registrationId}.\nHowever, we could not redirect you to the secure card payment page (temporary bank or connection issue).\n\nPlease try completing payment again from the website using the same email address, or contact registration@sarsyc.org with your registration ID.${tech}\n`
  const html = `<p>Dear ${name},</p>
<p>Your registration was <strong>saved</strong>. Your registration ID is <strong>${registrationId}</strong>.</p>
<p>We could <strong>not</strong> open the secure card payment page (this is often temporary).</p>
<p>Please use the <strong>“Complete payment”</strong> option on the registration site, or email <a href="mailto:registration@sarsyc.org">registration@sarsyc.org</a> with your registration ID.</p>
${hint ? `<p style="font-size:12px;color:#666">${escapeHtml(hint)}</p>` : ''}`
  return sendMail({ to, subject, text, html })
}

export async function sendAbstractStatusUpdate({
  to,
  firstName,
  submissionId,
  title,
  status,
  reviewerComments,
}: {
  to: string
  firstName?: string
  submissionId: string
  title: string
  status: string
  reviewerComments?: string
}) {
  const statusMessages: Record<string, { subject: string; message: string; color: string }> = {
    'received': {
      subject: 'Abstract Received - SARSYC VI',
      message: 'We have received your abstract submission. Our review committee will evaluate it shortly.',
      color: '#3B82F6',
    },
    'under-review': {
      subject: 'Abstract Under Review - SARSYC VI',
      message: 'Your abstract is currently being reviewed by our committee. We will notify you once a decision has been made.',
      color: '#3B82F6',
    },
    'accepted': {
      subject: 'Congratulations! Your Abstract Has Been Accepted - SARSYC VI',
      message: 'We are pleased to inform you that your abstract has been accepted for presentation at SARSYC VI.',
      color: '#10B981',
    },
    'rejected': {
      subject: 'Abstract Decision - SARSYC VI',
      message: 'Thank you for your submission. Unfortunately, your abstract was not accepted for this conference.',
      color: '#EF4444',
    },
    'revisions': {
      subject: 'Revisions Requested for Your Abstract - SARSYC VI',
      message: 'Our review committee has requested revisions to your abstract. Please review the feedback and submit a revised version.',
      color: '#F59E0B',
    },
  }

  const statusInfo = statusMessages[status] || statusMessages['received']
  const name = firstName || 'Author'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">SARSYC VI</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Abstract Status Update</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Dear ${name},</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusInfo.color};">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: ${statusInfo.color};">
            ${statusInfo.message}
          </p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold;">Abstract Details:</p>
          <p style="margin: 5px 0;"><strong>Submission ID:</strong> ${submissionId}</p>
          <p style="margin: 5px 0;"><strong>Title:</strong> ${title}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${status.replace('-', ' ').toUpperCase()}</span></p>
        </div>

        ${reviewerComments ? `
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #92400E;">Feedback from Reviewers:</p>
          <p style="margin: 0; color: #78350F; white-space: pre-wrap;">${reviewerComments}</p>
        </div>
        ` : ''}

        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 15px 0; font-weight: bold;">Track Your Abstract</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'https://sarsyc.org'}/dashboard?email=${encodeURIComponent(to)}" 
             style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            View Your Dashboard
          </a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          If you have any questions, please contact us at <a href="mailto:info@sarsyc.org" style="color: #667eea;">info@sarsyc.org</a>
        </p>

        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
          Best regards,<br>
          SARSYC VI Organizing Committee
        </p>
      </div>
    </body>
    </html>
  `

  const text = `
Dear ${name},

${statusInfo.message}

Abstract Details:
- Submission ID: ${submissionId}
- Title: ${title}
- Status: ${status.replace('-', ' ').toUpperCase()}

${reviewerComments ? `\nFeedback from Reviewers:\n${reviewerComments}\n` : ''}

Track your abstract: ${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'https://sarsyc.org'}/dashboard?email=${encodeURIComponent(to)}

If you have any questions, please contact us at info@sarsyc.org

Best regards,
SARSYC VI Organizing Committee
  `

  return sendMail({
    to,
    subject: statusInfo.subject,
    text,
    html,
  })
}

export async function sendWelcomeEmail({
  to,
  firstName,
  lastName,
  role,
  resetToken,
}: {
  to: string
  firstName: string
  lastName: string
  role: 'speaker' | 'presenter'
  resetToken: string
}) {
  const roleLabel = role === 'speaker' ? 'Speaker' : 'Presenter'
  const resetUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
  const loginUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`
  const name = `${firstName} ${lastName}`.trim()

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">SARSYC VI</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Welcome to Your Account</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Dear ${name},</p>
        
        <p>Welcome to the SARSYC VI platform! A user account has been created for you as a <strong>${roleLabel}</strong>.</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #10B981;">
            Your Account Features:
          </p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Manage your profile and information</li>
            <li>View your schedule and assigned sessions</li>
            <li>Receive email updates about the conference</li>
            <li>Update your passport and travel details</li>
            ${role === 'speaker' ? '<li>Manage your speaker profile and bio</li>' : '<li>Track your abstract submission status</li>'}
          </ul>
        </div>

        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 15px 0; font-weight: bold;">Set Your Password</p>
          <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">
            Click the button below to set your password and access your account:
          </p>
          <a href="${resetUrl}" 
             style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0;">
            Set Password & Login
          </a>
          <p style="margin: 15px 0 0 0; font-size: 12px; color: #6b7280;">
            Or copy this link: <br>
            <span style="word-break: break-all; color: #667eea;">${resetUrl}</span>
          </p>
        </div>

        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
          <p style="margin: 0; font-size: 14px; color: #92400E;">
            <strong>Note:</strong> This password reset link will expire in 24 hours. If you need a new link, you can request one from the login page.
          </p>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Once you've set your password, you can log in at: <a href="${loginUrl}" style="color: #667eea;">${loginUrl}</a>
        </p>

        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
          If you have any questions, please contact us at <a href="mailto:info@sarsyc.org" style="color: #667eea;">info@sarsyc.org</a>
        </p>

        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
          Best regards,<br>
          SARSYC VI Organizing Committee
        </p>
      </div>
    </body>
    </html>
  `

  const text = `
Dear ${name},

Welcome to the SARSYC VI platform! A user account has been created for you as a ${roleLabel}.

Your Account Features:
- Manage your profile and information
- View your schedule and assigned sessions
- Receive email updates about the conference
- Update your passport and travel details
${role === 'speaker' ? '- Manage your speaker profile and bio' : '- Track your abstract submission status'}

Set Your Password:
Click the link below to set your password and access your account:
${resetUrl}

Note: This password reset link will expire in 24 hours. If you need a new link, you can request one from the login page.

Once you've set your password, you can log in at: ${loginUrl}

If you have any questions, please contact us at info@sarsyc.org

Best regards,
SARSYC VI Organizing Committee
  `

  return sendMail({
    to,
    subject: `Welcome to SARSYC VI - Set Your Password`,
    text,
    html,
  })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export type DemographicsReminderItem = {
  submissionId: string | null
  title: string
}

/**
 * Bulk outreach: ask primary authors to complete age, gender, and/or institution on file.
 * Call from admin script; one email can cover multiple abstracts for the same address.
 */
export async function sendAbstractDemographicsReminder({
  to,
  firstName,
  items,
}: {
  to: string
  firstName?: string
  items: DemographicsReminderItem[]
}) {
  const researchUnitEmail = 'researchunit@saywhat.org.zw'
  const officeEmail =
    readEnvRaw('SMTP_REPLY_TO') || readEnvRaw('SMTP_FROM') || readEnvRaw('SMTP_USER') || ''
  const showOffice =
    officeEmail &&
    officeEmail.toLowerCase() !== researchUnitEmail.toLowerCase() &&
    officeEmail.includes('@')
  const name = (firstName || 'Author').trim() || 'Author'

  const listHtml = items
    .map(
      (it) =>
        `<li style="margin:8px 0;"><strong>${escapeHtml(String(it.submissionId || '—'))}</strong> — ${escapeHtml(it.title)}</li>`,
    )
    .join('')

  const listText = items
    .map((it) => `- ${it.submissionId || 'N/A'} — ${it.title}`)
    .join('\n')

  const subject =
    items.length > 1
      ? 'SARSYC VI — missing author details: email us (portal closed; multiple abstracts)'
      : 'SARSYC VI — missing author details: email us (portal closed)'

  const officeText = showOffice
    ? `\nYou may also email: ${officeEmail}\n`
    : ''
  const officeHtml = showOffice
    ? `<p style="font-size: 14px; color: #6b7280;">You may also write to <a href="mailto:${escapeHtml(officeEmail)}">${escapeHtml(officeEmail)}</a>.</p>`
    : ''

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 24px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">SARSYC VI Research Indaba</h1>
        <p style="color: rgba(255,255,255,0.95); margin: 8px 0 0 0; font-size: 14px;">Author information (by email)</p>
      </div>
      <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <p>Dear ${escapeHtml(name)},</p>
        <p>Our records show that one or more of your abstract submissions are <strong>missing required primary-author details</strong> (age, gender, and/or university / tertiary institution). These fields are required for conference reporting and delegate records.</p>
        <p><strong>Submission(s) concerned:</strong></p>
        <ul style="padding-left: 20px; margin: 12px 0;">${listHtml}</ul>
        <p style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 12px 14px; border-radius: 6px;"><strong>Important:</strong> Abstract submission and editing on the conference website are <strong>closed</strong>. You can no longer add or change these details through the online form or dashboard.</p>
        <p>If you received an earlier message asking you to update your profile online, please use the email instructions below instead.</p>
        <p><strong>What to do:</strong> Send <strong>one email</strong> that includes, for <strong>each</strong> submission ID above, the missing information: <strong>age</strong>, <strong>gender</strong>, and <strong>university or tertiary institution</strong> (as they should appear on our records). Use the same email address you used when submitting, if possible.</p>
        <p><strong>Where to send it:</strong></p>
        <ul style="padding-left: 20px; margin: 8px 0;">
          <li style="margin:6px 0;"><strong>Reply to this email</strong> (recommended), or</li>
          <li style="margin:6px 0;">Email <a href="mailto:${researchUnitEmail}">${researchUnitEmail}</a></li>
        </ul>
        ${officeHtml}
        <p style="font-size: 14px; color: #6b7280;">For general conference queries you can still contact <a href="mailto:info@sarsyc.org">info@sarsyc.org</a>.</p>
        <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">Best regards,<br>SARSYC VI Organizing Committee</p>
      </div>
    </body>
    </html>
  `

  const text = `
Dear ${name},

Our records show that one or more of your abstract submissions are missing required primary-author details (age, gender, and/or university / tertiary institution).

Submission(s) concerned:
${listText}

IMPORTANT: Abstract submission and editing on the conference website are CLOSED. You cannot add these details through the online form or dashboard anymore.

If you already received an earlier message asking you to update your profile online, please ignore those instructions about the website and follow this email instead.

WHAT TO DO: Send one email that includes, for EACH submission ID above, the missing information: age, gender, and university or tertiary institution. Use the same email address you used when submitting, if possible.

WHERE TO SEND IT:
- Reply to this email, OR
- Email: ${researchUnitEmail}${officeText}
For general conference queries: info@sarsyc.org

Best regards,
SARSYC VI Organizing Committee
  `.trim()

  return sendMail({ to, subject, text, html })
}