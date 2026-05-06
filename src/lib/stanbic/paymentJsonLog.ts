/**
 * Single-line JSON logs for hosted payment flow (grep-friendly in Vercel / journald).
 * Set STANBIC_PAY_LOG_LABEL=stanbic-cert to mirror e.g. [iveri-cert] style tags.
 */

function logLabel(): string {
  return (process.env.STANBIC_PAY_LOG_LABEL || 'stanbic-pay').trim() || 'stanbic-pay'
}

/** Emits `[label] {"event":"…",…,"createdAt":"ISO"}` */
export function logStanbicPaymentEvent(payload: Record<string, unknown>): void {
  const createdAt = new Date().toISOString()
  console.log(`[${logLabel()}] ${JSON.stringify({ ...payload, createdAt })}`)
}
