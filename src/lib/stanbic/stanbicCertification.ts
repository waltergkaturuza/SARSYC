/**
 * Stanbic N-Genius hosted payment page — certification logging, state mapping, and sandbox test matrix.
 * Mirrors the TNF/iVeri certification pattern with N-Genius payment states.
 */

import {
  stanbicAccessToken,
  stanbicHostedPaymentsConfigured,
  stanbicRetrieveOrder,
} from '@/lib/stanbic/ngenius'
import { logStanbicPaymentEvent } from '@/lib/stanbic/paymentJsonLog'
import {
  isStanbicPaymentCaptured,
  mapStanbicStateToDbStatus,
  primaryStanbicPaymentState,
  STANBIC_AUTHORISED_STATES,
  STANBIC_CANCELLED_STATES,
  STANBIC_FAILED_STATES,
  STANBIC_PAID_STATES,
} from '@/lib/stanbic/stanbicPaymentStates'

export type StanbicCertPaymentStatus =
  | 'SUCCESS'
  | 'FAILED'
  | 'TIMEOUT'
  | 'PENDING_CAPTURE'
  | 'CANCELLED'

export type StanbicReturnKind = 'success' | 'error' | 'cancel'

export type StanbicThreeDSecureOutcome = 'PASSED' | 'FAILED' | null

/** DB payment status we apply after gateway verification */
export type StanbicDbPaymentStatus = 'paid' | 'pending' | 'failed' | 'cancelled'

export type StanbicCertificationScenario = {
  id: string
  title: string
  icon: string
  testCard?: string
  expiry?: string
  cvv?: string
  instructions?: string
  expectedEvents: string[]
  expectedPaymentState?: string
  expectedPaymentStatus?: StanbicCertPaymentStatus
  expectedReturnKind?: StanbicReturnKind
  expectedThreeDSecure?: StanbicThreeDSecureOutcome
  expectedVerificationError?: string
  expectedDbStatus?: StanbicDbPaymentStatus
}

/** Sandbox certification suite — Stanbic N-Genius hosted payment page */
export const STANBIC_CERTIFICATION_MATRIX: StanbicCertificationScenario[] = [
  {
    id: 'success',
    title: 'Successful payment',
    icon: '✅',
    testCard: '4111 1111 1111 1111',
    expiry: '04/30',
    cvv: '123',
    expectedEvents: ['stanbic_start', 'stanbic_return'],
    expectedPaymentState: 'CAPTURED',
    expectedPaymentStatus: 'SUCCESS',
    expectedReturnKind: 'success',
    expectedDbStatus: 'paid',
  },
  {
    id: 'declined',
    title: 'Declined payment',
    icon: '❌',
    testCard: '4000 0000 0000 0002',
    expiry: '04/30',
    cvv: '123',
    expectedEvents: ['stanbic_start', 'stanbic_return'],
    expectedPaymentState: 'DECLINED',
    expectedPaymentStatus: 'FAILED',
    expectedReturnKind: 'error',
    expectedVerificationError: 'Card declined',
    expectedDbStatus: 'pending',
  },
  {
    id: 'timeout',
    title: 'Timeout / processing failure',
    icon: '⏳',
    testCard: '5454 5454 5454 5454',
    expiry: '04/30',
    cvv: '123',
    instructions: 'Delay submission intentionally on the hosted page.',
    expectedEvents: ['stanbic_start', 'stanbic_return'],
    expectedPaymentState: 'FAILED',
    expectedPaymentStatus: 'TIMEOUT',
    expectedReturnKind: 'error',
    expectedVerificationError: 'Timeout waiting for response',
    expectedDbStatus: 'pending',
  },
  {
    id: '3ds-success',
    title: '3D Secure success',
    icon: '🔐',
    testCard: '4000 0000 0000 1091',
    expiry: '04/30',
    cvv: '123',
    instructions: 'Complete OTP/authentication when redirected; payment should capture.',
    expectedEvents: ['stanbic_start', 'stanbic_return'],
    expectedPaymentState: 'CAPTURED',
    expectedPaymentStatus: 'SUCCESS',
    expectedReturnKind: 'success',
    expectedThreeDSecure: 'PASSED',
    expectedDbStatus: 'paid',
  },
  {
    id: '3ds-failure',
    title: '3D Secure failure',
    icon: '❌',
    testCard: '4000 0000 0000 1109',
    expiry: '04/30',
    cvv: '123',
    expectedEvents: ['stanbic_start', 'stanbic_return'],
    expectedPaymentState: 'DECLINED',
    expectedPaymentStatus: 'FAILED',
    expectedReturnKind: 'error',
    expectedThreeDSecure: 'FAILED',
    expectedVerificationError: '3DS authentication failed',
    expectedDbStatus: 'pending',
  },
  {
    id: 'invalid-card',
    title: 'Invalid card number',
    icon: '🚫',
    testCard: '1234 5678 9012 3456',
    expiry: '04/30',
    cvv: '123',
    expectedEvents: ['stanbic_start', 'stanbic_return'],
    expectedPaymentState: 'FAILED',
    expectedPaymentStatus: 'FAILED',
    expectedReturnKind: 'error',
    expectedVerificationError: 'Invalid card number',
    expectedDbStatus: 'pending',
  },
  {
    id: 'user-cancelled',
    title: 'User cancelled payment',
    icon: '👤',
    instructions: 'Start checkout then cancel/back out on the hosted page.',
    expectedEvents: ['stanbic_start', 'stanbic_return'],
    expectedPaymentState: 'CANCELLED',
    expectedPaymentStatus: 'CANCELLED',
    expectedReturnKind: 'cancel',
    expectedVerificationError: 'User cancelled payment',
    expectedDbStatus: 'pending',
  },
  {
    id: 'duplicate',
    title: 'Duplicate payment attempt',
    icon: '🔁',
    instructions: 'Complete a successful payment, then try to pay the same registration again.',
    expectedEvents: ['stanbic_start', 'stanbic_return', 'stanbic_duplicate_attempt'],
    expectedPaymentState: 'CAPTURED',
    expectedDbStatus: 'paid',
  },
]

export {
  isStanbicPaymentCaptured,
  isStanbicPaymentAuthorisedOnly,
  mapStanbicStateToDbStatus,
  primaryStanbicPaymentState,
  STANBIC_AUTHORISED_STATES,
  STANBIC_CANCELLED_STATES,
  STANBIC_FAILED_STATES,
  STANBIC_PAID_STATES,
} from '@/lib/stanbic/stanbicPaymentStates'

export function mapStanbicStateToCertPaymentStatus(
  state: string,
  description?: string | null,
): StanbicCertPaymentStatus {
  const s = state.trim().toUpperCase()
  const desc = (description ?? '').toLowerCase()

  if (STANBIC_CANCELLED_STATES.has(s) || /cancelled|canceled|user cancel/.test(desc)) {
    return 'CANCELLED'
  }
  if (STANBIC_PAID_STATES.has(s)) return 'SUCCESS'
  if (STANBIC_AUTHORISED_STATES.has(s)) return 'PENDING_CAPTURE'
  if (/timeout|timed out|waiting for response/.test(desc)) return 'TIMEOUT'
  if (STANBIC_FAILED_STATES.has(s) || s === 'FAILED') return 'FAILED'
  return 'FAILED'
}

function readString(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

function paymentObjects(raw: Record<string, unknown>): Record<string, unknown>[] {
  const embedded = raw._embedded as { payment?: unknown } | undefined
  const payments = embedded?.payment
  if (!Array.isArray(payments)) return []
  return payments.filter((p): p is Record<string, unknown> => p != null && typeof p === 'object')
}

function extractPaymentDescription(payment: Record<string, unknown>, orderRaw: Record<string, unknown>): string {
  const auth = payment.authResponse
  if (auth != null && typeof auth === 'object') {
    const msg = readString(auth as Record<string, unknown>, 'resultMessage', 'message', 'description')
    if (msg) return msg
  }
  const fromPayment = readString(payment, 'message', 'description', 'resultMessage', 'failureMessage')
  if (fromPayment) return fromPayment
  return readString(orderRaw, 'message', 'description')
}

function extractThreeDSecure(
  payment: Record<string, unknown>,
  state: string,
  description: string,
): StanbicThreeDSecureOutcome {
  const threeDsRaw = payment['3ds'] ?? payment['3ds2'] ?? payment.threeDSecure
  if (threeDsRaw != null && typeof threeDsRaw === 'object') {
    const o = threeDsRaw as Record<string, unknown>
    const status = readString(o, 'status', 'authenticationStatus', 'transStatus', 'eci').toUpperCase()
    if (/FAIL|REJECT|DENIED|N\b|NOT_AUTHENTICATED/.test(status)) return 'FAILED'
    if (/PASS|SUCCESS|AUTHENTICATED|Y\b|AUTHENTICATION_SUCCESSFUL/.test(status)) return 'PASSED'
    if (status === 'Y' || status === 'A') return 'PASSED'
    if (status === 'N' || status === 'R') return 'FAILED'
  }

  const desc = description.toLowerCase()
  if (/3ds authentication failed|3-d secure.*fail|authentication failed|otp.*fail/.test(desc)) {
    return 'FAILED'
  }
  if (
    STANBIC_PAID_STATES.has(state) &&
    /3ds|3-d secure|authentication|otp|verified|challenge/.test(desc + JSON.stringify(payment).toLowerCase())
  ) {
    return 'PASSED'
  }
  if (STANBIC_FAILED_STATES.has(state) && /3ds|3-d secure|authentication/.test(desc)) {
    return 'FAILED'
  }
  return null
}

function normalizeVerificationError(
  state: string,
  description: string,
  threeDSecure: StanbicThreeDSecureOutcome,
): string | null {
  const desc = description.trim()
  const s = state.toUpperCase()

  if (STANBIC_PAID_STATES.has(s) || STANBIC_AUTHORISED_STATES.has(s)) return null

  if (STANBIC_CANCELLED_STATES.has(s) || /user cancel|cancelled payment|payment cancelled/.test(desc.toLowerCase())) {
    return 'User cancelled payment'
  }
  if (/timeout|timed out|waiting for response/.test(desc.toLowerCase())) {
    return 'Timeout waiting for response'
  }
  if (threeDSecure === 'FAILED') return '3DS authentication failed'
  if (/invalid card/.test(desc.toLowerCase())) return 'Invalid card number'
  if (/declin/.test(desc.toLowerCase()) || s === 'DECLINED') return 'Card declined'
  if (desc) return desc
  if (STANBIC_FAILED_STATES.has(s)) return s === 'DECLINED' ? 'Card declined' : 'Payment failed'
  if (!s) return 'No payment confirmation from gateway yet'
  return `Payment state: ${s}`
}

function inferReturnKind(
  verificationApproved: boolean,
  paymentStatus: StanbicCertPaymentStatus,
): StanbicReturnKind {
  if (verificationApproved) return 'success'
  if (paymentStatus === 'CANCELLED') return 'cancel'
  return 'error'
}

export type ParsedStanbicVerification = {
  paymentStates: string[]
  primaryPaymentState: string
  paymentStatus: StanbicCertPaymentStatus
  dbPaymentStatus: StanbicDbPaymentStatus
  verificationApproved: boolean
  verificationError: string | null
  description: string | null
  threeDSecure: StanbicThreeDSecureOutcome
  returnKind: StanbicReturnKind
  amount: string | null
  currency: string | null
}

export function parseStanbicOrderVerification(input: {
  raw: Record<string, unknown>
  paymentStates: string[]
}): ParsedStanbicVerification {
  const { raw, paymentStates } = input
  const payments = paymentObjects(raw)
  const latestPayment = payments[payments.length - 1] ?? {}
  const primaryPaymentState = primaryStanbicPaymentState(paymentStates)

  const description = extractPaymentDescription(latestPayment, raw)
  const threeDSecure = extractThreeDSecure(latestPayment, primaryPaymentState, description)
  const paymentStatus = mapStanbicStateToCertPaymentStatus(primaryPaymentState, description)
  const dbPaymentStatus = mapStanbicStateToDbStatus(primaryPaymentState)
  const verificationApproved = isStanbicPaymentCaptured(paymentStates)
  const verificationError = verificationApproved
    ? null
    : normalizeVerificationError(primaryPaymentState, description, threeDSecure)
  const returnKind = inferReturnKind(verificationApproved, paymentStatus)

  const amountObj = (latestPayment.amount ?? raw.amount) as { value?: unknown; currencyCode?: unknown } | undefined
  const amount =
    amountObj && typeof amountObj.value !== 'undefined' ? String(amountObj.value) : null
  const currency =
    amountObj && typeof amountObj.currencyCode === 'string' ? amountObj.currencyCode : null

  return {
    paymentStates,
    primaryPaymentState,
    paymentStatus,
    dbPaymentStatus,
    verificationApproved,
    verificationError,
    description: description || null,
    threeDSecure,
    returnKind,
    amount,
    currency,
  }
}

/** Build a stanbic_return log payload with consistent certification field names */
export function buildStanbicReturnLogPayload(params: {
  method: 'GET' | 'POST'
  registrationRef?: string
  registrationPayloadId?: string
  orderReference: string
  itemDescription?: string
  category?: unknown
  email?: unknown
  verificationHttp: number | null
  parsed: ParsedStanbicVerification
  dbPaymentStatusUpdated: boolean
  storedOrderReference?: string
}): Record<string, unknown> {
  const { parsed } = params
  return {
    event: 'stanbic_return',
    method: params.method,
    registrationRef: params.registrationRef,
    registrationPayloadId: params.registrationPayloadId,
    orderReference: params.orderReference,
    returnKind: parsed.returnKind,
    success: parsed.verificationApproved,
    paid: parsed.verificationApproved,
    dbPaymentStatusUpdated: params.dbPaymentStatusUpdated,
    paymentState: parsed.primaryPaymentState || undefined,
    paymentStatus: parsed.paymentStatus,
    paymentStates: parsed.paymentStates,
    description: parsed.description ?? undefined,
    amount: parsed.amount ?? undefined,
    currency: parsed.currency ?? undefined,
    itemDescription: params.itemDescription,
    category: params.category,
    email: params.email,
    verificationHttp: params.verificationHttp,
    verificationApproved: parsed.verificationApproved,
    verificationError: parsed.verificationError,
    threeDSecure: parsed.threeDSecure ?? undefined,
    recommendedDbStatus: parsed.dbPaymentStatus,
    storedOrderReference: params.storedOrderReference,
  }
}

export function buildStanbicStartLogPayload(params: {
  registrationRef: string
  registrationPayloadId?: string
  orderReference?: string
  amount: string
  amountDisplayUsd?: number | null
  currency: string
  itemDescription?: string
  category?: unknown
  email?: unknown
  success: boolean
  createOrderHttp?: number
  paymentPageHost?: string
  dbStanbicOrderRefSaved?: boolean
  gatewayError?: string
  pricingTier?: string
  registrationPackage?: unknown
  packageName?: string
}): Record<string, unknown> {
  return {
    event: 'stanbic_start',
    registrationRef: params.registrationRef,
    registrationPayloadId: params.registrationPayloadId,
    orderReference: params.orderReference,
    amount: params.amount,
    amountDisplayUsd: params.amountDisplayUsd ?? undefined,
    currency: params.currency,
    itemDescription: params.itemDescription,
    category: params.category,
    email: params.email,
    success: params.success,
    createOrderHttp: params.createOrderHttp,
    paymentPageHost: params.paymentPageHost,
    dbStanbicOrderRefSaved: params.dbStanbicOrderRefSaved,
    gatewayError: params.gatewayError,
    pricingTier: params.pricingTier,
    registrationPackage: params.registrationPackage,
    packageName: params.packageName,
  }
}

export function buildStanbicDuplicateAttemptLogPayload(params: {
  registrationRef: string
  registrationPayloadId?: string
  existingPaymentState: string
  existingOrderReference?: string
}): Record<string, unknown> {
  return {
    event: 'stanbic_duplicate_attempt',
    registrationRef: params.registrationRef,
    registrationPayloadId: params.registrationPayloadId,
    existingPaymentState: params.existingPaymentState,
    existingOrderReference: params.existingOrderReference,
    newAttemptBlocked: true,
    description: 'Registration already paid',
  }
}

/** Log + resolve existing gateway state when blocking a duplicate payment attempt */
export async function logStanbicDuplicatePaymentAttempt(registration: {
  id: string | number
  registrationId?: unknown
  stanbicPaymentOrderRef?: unknown
  paymentStatus?: unknown
}): Promise<void> {
  const registrationRef =
    typeof registration.registrationId === 'string'
      ? registration.registrationId
      : String(registration.id)
  const existingOrderReference =
    typeof registration.stanbicPaymentOrderRef === 'string'
      ? registration.stanbicPaymentOrderRef.trim()
      : undefined

  let existingPaymentState = 'CAPTURED'
  if (existingOrderReference && stanbicHostedPaymentsConfigured()) {
    try {
      const { access_token } = await stanbicAccessToken()
      const { paymentStates } = await stanbicRetrieveOrder({
        accessToken: access_token,
        orderReference: existingOrderReference,
      })
      existingPaymentState = primaryStanbicPaymentState(paymentStates) || 'CAPTURED'
    } catch {
      existingPaymentState =
        registration.paymentStatus === 'paid' ? 'CAPTURED' : String(registration.paymentStatus ?? 'UNKNOWN')
    }
  }

  logStanbicPaymentEvent(
    buildStanbicDuplicateAttemptLogPayload({
      registrationRef,
      registrationPayloadId: String(registration.id),
      existingPaymentState,
      existingOrderReference,
    }),
  )
}
