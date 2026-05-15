/**
 * SARSYC safeguarding training and zero-tolerance acknowledgment.
 */

import crypto from 'crypto'
import { publicSiteOrigin } from '@/lib/stanbic/ngenius'

export const SAFEGUARDING_TRAINING_URL = 'https://youtu.be/GappTDhWmdo'

export const SAFEGUARDING_POLICY_ITEMS = [
  {
    id: 'sexualExploitation',
    label:
      'Sexual exploitation, abuse, and harassment — I understand SAYWHAT has zero tolerance for these.',
  },
  {
    id: 'violence',
    label: 'Any form of violence — I understand this is not permitted at the conference or in SAYWHAT work.',
  },
  {
    id: 'substances',
    label: 'Drug and substance abuse — I understand this is not permitted.',
  },
  {
    id: 'partners',
    label:
      'SAYWHAT does not permit any partner, supplier, sub-contractor, agent, or individual engaged by SAYWHAT to engage in sexual abuse or exploitation against vulnerable persons or adults associated with its work.',
  },
  {
    id: 'equalProtection',
    label:
      'All persons (including children and adults) have an equal right to protection, regardless of age, gender, ability, culture, racial origin, religious belief, or sexual identity.',
  },
  {
    id: 'staffConduct',
    label:
      'SAYWHAT will not tolerate any form of abuse or exploitation by staff or associated personnel during the conference.',
  },
  {
    id: 'trainingCompleted',
    label:
      'I have watched (or will watch immediately) the safeguarding training video linked in this form and in my email.',
  },
] as const

export type SafeguardingAcknowledgmentKey = (typeof SAFEGUARDING_POLICY_ITEMS)[number]['id']

export function generateSafeguardingAckToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function safeguardingAcknowledgeUrl(token: string): string {
  return `${publicSiteOrigin()}/participate/safeguarding?token=${encodeURIComponent(token)}`
}

export function registrationPaymentSettled(paymentStatus: string | null | undefined): boolean {
  return paymentStatus === 'paid' || paymentStatus === 'waived'
}

export function hasSafeguardingAcknowledgment(
  doc: { safeguardingAcknowledgedAt?: string | Date | null },
): boolean {
  return Boolean(doc.safeguardingAcknowledgedAt)
}

/** Paid/waived and safeguarding form submitted — fully registered for the conference. */
export function isRegistrationFullyComplete(doc: {
  paymentStatus?: string | null
  safeguardingAcknowledgedAt?: string | Date | null
}): boolean {
  return registrationPaymentSettled(doc.paymentStatus) && hasSafeguardingAcknowledgment(doc)
}

export function formatSafeguardingPolicyText(): string {
  return [
    'SAYWHAT ZERO TOLERANCE',
    '',
    'All participants must complete safeguarding training and acknowledge that SAYWHAT has zero tolerance for:',
    '• Sexual exploitation, abuse, and harassment',
    '• Any form of violence',
    '• Drug and substance abuse',
    '',
    'SAYWHAT does not permit any partner, supplier, sub-contractor, agent, or individual engaged by SAYWHAT to engage in any form of sexual abuse or exploitation against vulnerable persons or other adults associated with its work.',
    '',
    'All persons (including children and adults) have an equal right to protection, regardless of personal characteristics including age, gender, ability, culture, racial origin, religious belief, and sexual identity.',
    '',
    'SAYWHAT will not tolerate any form of abuse or exploitation by staff or associated personnel during the conference.',
    '',
    `Training video: ${SAFEGUARDING_TRAINING_URL}`,
  ].join('\n')
}

export function validateSafeguardingAcknowledgments(
  body: Record<string, unknown>,
): { ok: true; acks: Record<SafeguardingAcknowledgmentKey, boolean> } | { ok: false; error: string } {
  const acks = {} as Record<SafeguardingAcknowledgmentKey, boolean>
  for (const item of SAFEGUARDING_POLICY_ITEMS) {
    if (body[item.id] !== true) {
      return {
        ok: false,
        error: `You must acknowledge all safeguarding requirements (missing: ${item.id}).`,
      }
    }
    acks[item.id] = true
  }
  return { ok: true, acks }
}
