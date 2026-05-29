/**
 * Single-line JSON logs for hosted payment flow (grep-friendly in Vercel / journald).
 * Set STANBIC_PAY_LOG_LABEL=stanbic-cert during Stanbic certification (mirrors [iveri-cert]).
 */

function logLabel(): string {
  return (process.env.STANBIC_PAY_LOG_LABEL || 'stanbic-cert').trim() || 'stanbic-cert'
}

/** Emits `[label] {"event":"…",…,"createdAt":"ISO"}` via console.info for certification grep */
export function logStanbicPaymentEvent(payload: Record<string, unknown>): void {
  const createdAt = new Date().toISOString()
  console.info(`[${logLabel()}]`, JSON.stringify({ ...payload, createdAt }))
}
