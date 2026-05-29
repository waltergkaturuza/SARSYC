import { getPayloadClient } from '@/lib/payload'

/** Persist [stanbic-cert] lines for admin Card activity tab (non-blocking). */
export async function persistStanbicPaymentEvent(payload: Record<string, unknown>): Promise<void> {
  const event = typeof payload.event === 'string' ? payload.event.trim() : ''
  if (!event.startsWith('stanbic_')) return

  const client = await getPayloadClient()
  await client.create({
    collection: 'stanbic-payment-events',
    data: {
      event,
      registrationRef:
        typeof payload.registrationRef === 'string' ? payload.registrationRef : undefined,
      orderReference:
        typeof payload.orderReference === 'string'
          ? payload.orderReference
          : typeof payload.gatewayOrderRef === 'string'
            ? payload.gatewayOrderRef
            : undefined,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      verificationApproved: payload.verificationApproved === true,
      dbPaymentStatusUpdated: payload.dbPaymentStatusUpdated === true,
      paymentState:
        typeof payload.paymentState === 'string' ? payload.paymentState : undefined,
      paymentStatus:
        typeof payload.paymentStatus === 'string' ? payload.paymentStatus : undefined,
      verificationError:
        typeof payload.verificationError === 'string'
          ? payload.verificationError
          : typeof payload.description === 'string'
            ? payload.description
            : undefined,
      payload,
    },
    overrideAccess: true,
  })
}
