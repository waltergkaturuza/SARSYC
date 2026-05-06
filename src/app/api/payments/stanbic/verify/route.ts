import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import {
  stanbicAccessToken,
  stanbicRetrieveOrder,
  isOrderPaymentSuccessful,
  stanbicHostedPaymentsConfigured,
  formatStanbicOutboundError,
} from '@/lib/stanbic/ngenius'
import { ensureRegistrationsLatestColumns } from '@/lib/ensureRegistrationSchema'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
/** Cold Payload init + two Stanbic hops can exceed serverless defaults */
export const maxDuration = 60

/**
 * After redirect from hosted pay page, N-Genius appends ref=<order-reference> to redirectUrl.
 * Client calls POST with ref + registrationPayloadId; we sync Payload paymentStatus when paid.
 *
 * Note: we only require gateway env to be configured, not `registrationRequiresHostedPayment()`,
 * so users returning from the bank can confirm payment even after pricing tier / fee flags change.
 */
export async function POST(req: NextRequest) {
  try {
    if (!stanbicHostedPaymentsConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          paid: false,
          error:
            'Payment verification is unavailable (gateway not configured). Contact sarsyc@saywhat.org.zw with your registration ID.',
        },
        { status: 503 },
      )
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

    let payload: Awaited<ReturnType<typeof getPayloadClient>>
    try {
      payload = await getPayloadClient()
      await ensureRegistrationsLatestColumns(payload)
    } catch (boot: unknown) {
      const msg = boot instanceof Error ? boot.message : String(boot)
      console.error('[stanbic verify] payload init / schema', boot)
      return NextResponse.json(
        { ok: false, paid: false, error: msg || 'Could not connect to the database. Try again shortly.' },
        { status: 503 },
      )
    }

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
          error:
            'Order reference does not match this registration. Open the payment link from the same browser session.',
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
      const msg = formatStanbicOutboundError(e)
      console.error('[stanbic verify] gateway error', e)
      return NextResponse.json({ ok: false, error: msg, paid: false }, { status: 503 })
    }
  } catch (fatal: unknown) {
    const msg = fatal instanceof Error ? fatal.message : String(fatal)
    console.error('[stanbic verify] fatal', fatal)
    return NextResponse.json({ ok: false, paid: false, error: msg }, { status: 500 })
  }
}
