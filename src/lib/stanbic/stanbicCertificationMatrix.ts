/** Client-safe certification matrix (no server/payload imports). */

export type StanbicCertPaymentStatus =
  | 'SUCCESS'
  | 'FAILED'
  | 'TIMEOUT'
  | 'PENDING_CAPTURE'
  | 'CANCELLED'

export type StanbicReturnKind = 'success' | 'error' | 'cancel'

export type StanbicThreeDSecureOutcome = 'PASSED' | 'FAILED' | null

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
