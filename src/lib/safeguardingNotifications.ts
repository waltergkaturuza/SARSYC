import type { Payload } from 'payload'
import { sendSafeguardingTrainingRequired } from '@/lib/mail'
import {
  generateSafeguardingAckToken,
  registrationPaymentSettled,
  hasSafeguardingAcknowledgment,
} from '@/lib/safeguarding'

type RegistrationDoc = {
  id: string | number
  email?: string | null
  firstName?: string | null
  registrationId?: string | null
  paymentStatus?: string | null
  safeguardingAckToken?: string | null
  safeguardingAcknowledgedAt?: string | Date | null
  safeguardingTrainingEmailSentAt?: string | Date | null
}

/**
 * After payment is verified, email the delegate a unique link to complete safeguarding training acknowledgment.
 */
export async function ensureSafeguardingTrainingEmailSent(
  payload: Payload,
  registration: RegistrationDoc,
): Promise<{ sent: boolean; token?: string; reason?: string }> {
  if (!registrationPaymentSettled(registration.paymentStatus)) {
    return { sent: false, reason: 'payment_not_settled' }
  }
  if (hasSafeguardingAcknowledgment(registration)) {
    return { sent: false, reason: 'already_acknowledged' }
  }

  const to = typeof registration.email === 'string' ? registration.email.trim() : ''
  if (!to) return { sent: false, reason: 'no_email' }

  let token =
    typeof registration.safeguardingAckToken === 'string' &&
    registration.safeguardingAckToken.trim()
      ? registration.safeguardingAckToken.trim()
      : generateSafeguardingAckToken()

  const regId =
    typeof registration.registrationId === 'string' && registration.registrationId.trim()
      ? registration.registrationId.trim()
      : String(registration.id)

  const alreadySent = Boolean(registration.safeguardingTrainingEmailSentAt)

  if (!registration.safeguardingAckToken) {
    await payload.update({
      collection: 'registrations',
      id: registration.id,
      data: { safeguardingAckToken: token },
      overrideAccess: true,
    })
  }

  if (alreadySent) {
    return { sent: false, reason: 'email_already_sent', token }
  }

  const mailRes = await sendSafeguardingTrainingRequired({
    to,
    firstName: typeof registration.firstName === 'string' ? registration.firstName : undefined,
    registrationId: regId,
    token,
  })

  if (mailRes && 'success' in mailRes && !mailRes.success) {
    console.error('[safeguarding] training email not sent:', mailRes)
    return { sent: false, reason: 'mail_failed', token }
  }

  await payload.update({
    collection: 'registrations',
    id: registration.id,
    data: { safeguardingTrainingEmailSentAt: new Date().toISOString() },
    overrideAccess: true,
  })

  return { sent: true, token }
}
