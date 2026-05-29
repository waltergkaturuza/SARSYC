/** N-Genius payment states that mean funds are collected (update DB → paid) */
export const STANBIC_PAID_STATES = new Set(['CAPTURED', 'PURCHASED'])

/** Auth-only — do not mark paid until capture */
export const STANBIC_AUTHORISED_STATES = new Set(['AUTHORISED', 'AUTHORIZED'])

export const STANBIC_FAILED_STATES = new Set(['FAILED', 'DECLINED'])

export const STANBIC_CANCELLED_STATES = new Set(['CANCELLED', 'CANCELED'])

export function isStanbicPaymentCaptured(paymentStates: string[]): boolean {
  return paymentStates.some((s) => STANBIC_PAID_STATES.has(s))
}

export function isStanbicPaymentAuthorisedOnly(paymentStates: string[]): boolean {
  return (
    paymentStates.some((s) => STANBIC_AUTHORISED_STATES.has(s)) &&
    !paymentStates.some((s) => STANBIC_PAID_STATES.has(s))
  )
}

export function primaryStanbicPaymentState(paymentStates: string[]): string {
  if (!paymentStates.length) return ''
  const priority = [
    'CAPTURED',
    'PURCHASED',
    'AUTHORISED',
    'AUTHORIZED',
    'DECLINED',
    'FAILED',
    'CANCELLED',
    'CANCELED',
    'PENDING',
  ]
  for (const p of priority) {
    if (paymentStates.includes(p)) return p
  }
  return paymentStates[paymentStates.length - 1] ?? ''
}

export function mapStanbicStateToDbStatus(
  state: string,
): 'paid' | 'pending' | 'failed' | 'cancelled' {
  const s = state.trim().toUpperCase()
  if (STANBIC_PAID_STATES.has(s)) return 'paid'
  if (STANBIC_AUTHORISED_STATES.has(s)) return 'pending'
  if (STANBIC_FAILED_STATES.has(s)) return 'failed'
  if (STANBIC_CANCELLED_STATES.has(s)) return 'cancelled'
  return 'pending'
}
