import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import {
  stanbicAccessToken,
  stanbicRetrieveOrder,
  isOrderPaymentSuccessful,
  stanbicHostedPaymentsConfigured,
  formatStanbicOutboundError,
} from '@/lib/stanbic/ngenius'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  if (!stanbicHostedPaymentsConfigured()) {
    return NextResponse.json({ paid: false, error: 'Gateway not configured' }, { status: 400 })
  }

  let body: { orderRef?: unknown; donationId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const orderRef = typeof body.orderRef === 'string' ? body.orderRef.trim() : ''
  const donationId = typeof body.donationId === 'string' ? body.donationId.trim() : ''

  if (!orderRef) {
    return NextResponse.json({ paid: false, pending: true })
  }

  let payload: Awaited<ReturnType<typeof getPayloadClient>>
  try {
    payload = await getPayloadClient()
  } catch {
    return NextResponse.json({ paid: false, error: 'Service temporarily unavailable' }, { status: 503 })
  }

  try {
    const { access_token } = await stanbicAccessToken()
    const orderData = await stanbicRetrieveOrder({ accessToken: access_token, orderReference: orderRef })
    const paid = isOrderPaymentSuccessful(orderData)

    if (paid && donationId) {
      // Find the donation by donationId and mark as paid
      const found = await payload.find({
        collection: 'donations',
        where: { donationId: { equals: donationId } },
        limit: 1,
        overrideAccess: true,
      })
      const doc = found.docs[0]
      if (doc) {
        await payload.update({
          collection: 'donations',
          id: String(doc.id),
          data: {
            paymentStatus: 'paid',
            stanbicPaymentOrderRef: orderRef,
            paymentConfirmedAt: new Date().toISOString(),
          },
          overrideAccess: true,
        })
      }
    }

    return NextResponse.json({ paid, failed: !paid && orderData ? true : false })
  } catch (e: unknown) {
    const msg = formatStanbicOutboundError(e)
    console.error('[donate verify]', e)
    return NextResponse.json({ paid: false, pending: true, error: msg })
  }
}
