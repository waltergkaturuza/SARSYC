import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { stanbicHostedPaymentsConfigured } from '@/lib/stanbic/ngenius'
import { logStanbicPaymentEvent } from '@/lib/stanbic/paymentJsonLog'
import { buildStanbicReturnLogPayload } from '@/lib/stanbic/stanbicCertification'
import {
  verifyStanbicOrderReference,
  retrieveHttpFromStanbicError,
  stanbicVerificationErrorMessage,
} from '@/lib/stanbic/verifyStanbicOrder'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

type VerifyInput = {
  orderRef: string
  donationId: string
  method: 'GET' | 'POST'
}

async function runDonateVerify(input: VerifyInput): Promise<NextResponse> {
  const { donationId, method } = input
  let orderRef = input.orderRef.trim()

  if (!stanbicHostedPaymentsConfigured()) {
    logStanbicPaymentEvent({
      event: 'stanbic_return',
      method,
      registrationRef: donationId || undefined,
      returnKind: 'error',
      success: false,
      paid: false,
      dbPaymentStatusUpdated: false,
      verificationHttp: null,
      verificationApproved: false,
      verificationError: 'gateway_not_configured',
    })
    return NextResponse.json({ paid: false, error: 'Gateway not configured' }, { status: 400 })
  }

  let payload: Awaited<ReturnType<typeof getPayloadClient>>
  try {
    payload = await getPayloadClient()
  } catch {
    return NextResponse.json({ paid: false, error: 'Service temporarily unavailable' }, { status: 503 })
  }

  let donationDoc: Awaited<ReturnType<typeof payload.find>>['docs'][0] | null = null
  if (donationId) {
    const found = await payload.find({
      collection: 'donations',
      where: { donationId: { equals: donationId } },
      limit: 1,
      overrideAccess: true,
    })
    donationDoc = found.docs[0] ?? null
  }

  const storedRef =
    donationDoc && typeof donationDoc.stanbicPaymentOrderRef === 'string'
      ? donationDoc.stanbicPaymentOrderRef.trim()
      : ''

  if (!orderRef && storedRef) {
    orderRef = storedRef
  }

  if (!orderRef) {
    logStanbicPaymentEvent({
      event: 'stanbic_return',
      method,
      registrationRef: donationId || undefined,
      returnKind: 'error',
      success: false,
      paid: false,
      dbPaymentStatusUpdated: false,
      verificationHttp: null,
      verificationApproved: false,
      verificationError: donationDoc ? 'missing_gateway_order_ref' : 'missing_donation_id',
      email: donationDoc?.email,
    })
    return NextResponse.json({ paid: false, pending: true })
  }

  const registrationRef =
    donationDoc && typeof donationDoc.donationId === 'string'
      ? donationDoc.donationId
      : donationId || undefined
  const itemDescription =
    donationDoc && typeof donationDoc.categoryDisplay === 'string'
      ? donationDoc.categoryDisplay
      : 'SARSYC donation'

  if (donationDoc?.paymentStatus === 'paid') {
    logStanbicPaymentEvent(
      buildStanbicReturnLogPayload({
        method,
        registrationRef,
        registrationPayloadId: String(donationDoc.id),
        orderReference: orderRef,
        itemDescription,
        email: donationDoc.email,
        verificationHttp: null,
        parsed: {
          paymentStates: ['CAPTURED'],
          primaryPaymentState: 'CAPTURED',
          paymentStatus: 'SUCCESS',
          dbPaymentStatus: 'paid',
          verificationApproved: true,
          verificationError: null,
          description: 'already_paid_in_db',
          threeDSecure: null,
          returnKind: 'success',
          amount: null,
          currency: null,
        },
        dbPaymentStatusUpdated: false,
      }),
    )
    return NextResponse.json({ paid: true, paymentState: 'CAPTURED', paymentStatus: 'SUCCESS' })
  }

  try {
    const verification = await verifyStanbicOrderReference(orderRef)
    const { parsed, paymentStates, retrieveHttpStatus } = verification
    const paid = parsed.verificationApproved
    let dbPaymentStatusUpdated = false

    if (donationDoc) {
      if (storedRef && storedRef !== orderRef) {
        logStanbicPaymentEvent({
          event: 'stanbic_return',
          method,
          registrationRef,
          orderReference: orderRef,
          storedOrderReference: storedRef,
          returnKind: 'error',
          success: false,
          paid: false,
          dbPaymentStatusUpdated: false,
          verificationHttp: retrieveHttpStatus,
          verificationApproved: false,
          verificationError: 'order_ref_mismatch',
          itemDescription,
          email: donationDoc.email,
        })
        return NextResponse.json({ paid: false, failed: true, error: 'Order reference mismatch' })
      }

      if (paid && donationDoc.paymentStatus !== 'paid') {
        await payload.update({
          collection: 'donations',
          id: String(donationDoc.id),
          data: {
            paymentStatus: 'paid',
            stanbicPaymentOrderRef: orderRef,
            paymentConfirmedAt: new Date().toISOString(),
          },
          overrideAccess: true,
        })
        dbPaymentStatusUpdated = true
      } else if (
        !paid &&
        parsed.dbPaymentStatus === 'failed' &&
        donationDoc.paymentStatus === 'pending'
      ) {
        await payload.update({
          collection: 'donations',
          id: String(donationDoc.id),
          data: {
            paymentStatus: 'failed',
            stanbicPaymentOrderRef: orderRef,
          },
          overrideAccess: true,
        })
        dbPaymentStatusUpdated = true
      }
    }

    logStanbicPaymentEvent(
      buildStanbicReturnLogPayload({
        method,
        registrationRef,
        registrationPayloadId: donationDoc ? String(donationDoc.id) : undefined,
        orderReference: orderRef,
        itemDescription,
        email: donationDoc?.email,
        verificationHttp: retrieveHttpStatus,
        parsed,
        dbPaymentStatusUpdated,
      }),
    )

    return NextResponse.json({
      paid,
      failed: !paid && parsed.returnKind === 'error',
      paymentStates,
      paymentState: parsed.primaryPaymentState,
      paymentStatus: parsed.paymentStatus,
    })
  } catch (e: unknown) {
    const msg = stanbicVerificationErrorMessage(e)
    const httpErr = retrieveHttpFromStanbicError(e)
    console.error('[donate verify]', e)
    logStanbicPaymentEvent({
      event: 'stanbic_return',
      method,
      registrationRef,
      orderReference: orderRef,
      returnKind: 'error',
      success: false,
      paid: false,
      dbPaymentStatusUpdated: false,
      verificationHttp: httpErr,
      verificationApproved: false,
      verificationError: msg,
      itemDescription,
      email: donationDoc?.email,
    })
    return NextResponse.json({ paid: false, pending: true, error: msg })
  }
}

export async function POST(req: NextRequest) {
  let body: { orderRef?: unknown; donationId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const orderRef = typeof body.orderRef === 'string' ? body.orderRef.trim() : ''
  const donationId = typeof body.donationId === 'string' ? body.donationId.trim() : ''

  return runDonateVerify({ orderRef, donationId, method: 'POST' })
}

export async function GET(req: NextRequest) {
  const orderRef = req.nextUrl.searchParams.get('orderRef')?.trim() ?? req.nextUrl.searchParams.get('ref')?.trim() ?? ''
  const donationId = req.nextUrl.searchParams.get('donationId')?.trim() ?? ''
  return runDonateVerify({ orderRef, donationId, method: 'GET' })
}
