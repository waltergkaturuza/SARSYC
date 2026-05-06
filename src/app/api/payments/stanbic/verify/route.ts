import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import {
  stanbicAccessToken,
  stanbicRetrieveOrder,
  isOrderPaymentSuccessful,
  registrationRequiresHostedPayment,
} from '@/lib/stanbic/ngenius'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * After redirect from hosted pay page, N-Genius appends ref=<order-reference> to redirectUrl.
 * Client calls POST with ref + registrationPayloadId; we sync Payload paymentStatus when paid.
 */
export async function POST(req: NextRequest) {
  if (!registrationRequiresHostedPayment()) {
    return NextResponse.json({ error: 'Hosted payment is not enabled' }, { status: 400 })
  }

  let body: { ref?: string; registrationPayloadId?: string | number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const ref = typeof body.ref === 'string' ? body.ref.trim() : ''
  const regId =
    typeof body.registrationPayloadId !== 'undefined'
      ? String(body.registrationPayloadId).trim()
      : ''

  if (!ref) {
    return NextResponse.json({ error: 'ref (gateway order reference) is required' }, { status: 400 })
  }
  if (!regId) {
    return NextResponse.json({ error: 'registrationPayloadId is required' }, { status: 400 })
  }

  const payload = await getPayloadClient()

  let registration
  try {
    registration = await payload.findByID({
      collection: 'registrations',
      id: regId,
      overrideAccess: true,
    })
  } catch {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  }

  const storedRef =
    typeof registration.stanbicPaymentOrderRef === 'string'
      ? registration.stanbicPaymentOrderRef.trim()
      : ''

  if (storedRef && storedRef !== ref) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Order reference does not match this registration. Use the payment link from the same session.',
      },
      { status: 400 },
    )
  }

  try {
    const { access_token } = await stanbicAccessToken()
    const { paymentStates } = await stanbicRetrieveOrder({
      accessToken: access_token,
      orderReference: ref,
    })

    const paid = isOrderPaymentSuccessful(paymentStates)

    if (paid) {
      await payload.update({
        collection: 'registrations',
        id: regId,
        data: {
          paymentStatus: 'paid',
          status: registration.status === 'cancelled' ? registration.status : 'confirmed',
          stanbicPaymentOrderRef: ref,
        },
        overrideAccess: true,
      })

      return NextResponse.json({
        ok: true,
        paid: true,
        paymentStates,
        registrationId: registration.registrationId,
      })
    }

    return NextResponse.json({
      ok: true,
      paid: false,
      paymentStates,
      registrationId: registration.registrationId,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Verification failed'
    console.error('[stanbic verify]', msg)
    return NextResponse.json({ ok: false, error: msg, paid: false }, { status: 502 })
  }
}
