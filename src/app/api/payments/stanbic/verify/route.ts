import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import {
  stanbicHostedPaymentsConfigured,
} from '@/lib/stanbic/ngenius'
import { ensureRegistrationsLatestColumns } from '@/lib/ensureRegistrationSchema'
import { logStanbicPaymentEvent } from '@/lib/stanbic/paymentJsonLog'
import {
  buildStanbicReturnLogPayload,
} from '@/lib/stanbic/stanbicCertification'
import {
  verifyStanbicOrderReference,
  retrieveHttpFromStanbicError,
  stanbicVerificationErrorMessage,
} from '@/lib/stanbic/verifyStanbicOrder'
import {
  sendRegistrationPaymentConfirmed,
  sendRegistrationPaymentNotConfirmed,
} from '@/lib/mail'
import { ensureSafeguardingTrainingEmailSent } from '@/lib/safeguardingNotifications'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const ITEM_DESCRIPTION = 'SARSYC registration fee'

type VerifyInput = {
  ref: string
  registrationPayloadId: string
  method: 'GET' | 'POST'
}

async function runStanbicRegistrationVerify(input: VerifyInput): Promise<NextResponse> {
  const { registrationPayloadId: regId, method } = input
  let ref = input.ref.trim()

  if (!stanbicHostedPaymentsConfigured()) {
    logStanbicPaymentEvent(
      buildStanbicReturnLogPayload({
        method,
        orderReference: ref || '',
        registrationPayloadId: regId || undefined,
        verificationHttp: null,
        parsed: {
          paymentStates: [],
          primaryPaymentState: '',
          paymentStatus: 'FAILED',
          dbPaymentStatus: 'pending',
          verificationApproved: false,
          verificationError: 'gateway_not_configured',
          description: null,
          threeDSecure: null,
          returnKind: 'error',
          amount: null,
          currency: null,
        },
        dbPaymentStatusUpdated: false,
        itemDescription: ITEM_DESCRIPTION,
      }),
    )
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

  if (!regId) {
    logStanbicPaymentEvent({
      event: 'stanbic_return',
      method,
      orderReference: ref || undefined,
      returnKind: 'error',
      success: false,
      paid: false,
      dbPaymentStatusUpdated: false,
      verificationHttp: null,
      verificationApproved: false,
      verificationError: 'missing_registration_payload_id',
    })
    return NextResponse.json({ error: 'registrationPayloadId is required' }, { status: 400 })
  }

  let payload: Awaited<ReturnType<typeof getPayloadClient>>
  try {
    payload = await getPayloadClient()
    await ensureRegistrationsLatestColumns(payload)
  } catch (boot: unknown) {
    const msg = boot instanceof Error ? boot.message : String(boot)
    console.error('[stanbic verify] payload init / schema', boot)
    logStanbicPaymentEvent({
      event: 'stanbic_return',
      method,
      registrationPayloadId: regId,
      orderReference: ref || undefined,
      returnKind: 'error',
      success: false,
      paid: false,
      dbPaymentStatusUpdated: false,
      verificationHttp: null,
      verificationApproved: false,
      verificationError: 'payload_db_init_failed',
      description: msg,
      itemDescription: ITEM_DESCRIPTION,
    })
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
    logStanbicPaymentEvent({
      event: 'stanbic_return',
      method,
      registrationPayloadId: regId,
      orderReference: ref || undefined,
      returnKind: 'error',
      success: false,
      paid: false,
      dbPaymentStatusUpdated: false,
      verificationHttp: null,
      verificationApproved: false,
      verificationError: 'registration_not_found',
    })
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  }

  const registrationRef =
    typeof registration.registrationId === 'string' ? registration.registrationId : regId

  const storedRef =
    typeof registration.stanbicPaymentOrderRef === 'string'
      ? registration.stanbicPaymentOrderRef.trim()
      : ''

  if (!ref && storedRef) {
    ref = storedRef
  }

  if (!ref) {
    logStanbicPaymentEvent({
      event: 'stanbic_return',
      method,
      registrationRef,
      registrationPayloadId: regId,
      returnKind: 'error',
      success: false,
      paid: false,
      dbPaymentStatusUpdated: false,
      verificationHttp: null,
      verificationApproved: false,
      verificationError: 'missing_gateway_order_ref',
      email: registration.email,
      itemDescription: ITEM_DESCRIPTION,
    })
    return NextResponse.json({
      ok: true,
      paid: false,
      pending: true,
      registrationId: registration.registrationId,
    })
  }

  if (registration.paymentStatus === 'paid' || registration.paymentStatus === 'waived') {
    logStanbicPaymentEvent(
      buildStanbicReturnLogPayload({
        method,
        registrationRef,
        registrationPayloadId: regId,
        orderReference: ref,
        itemDescription: ITEM_DESCRIPTION,
        category: registration.category,
        email: registration.email,
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
    return NextResponse.json({
      ok: true,
      paid: true,
      paymentState: 'CAPTURED',
      paymentStatus: 'SUCCESS',
      registrationId: registration.registrationId,
    })
  }

  if (storedRef && storedRef !== ref) {
    logStanbicPaymentEvent({
      event: 'stanbic_return',
      method,
      registrationRef,
      registrationPayloadId: regId,
      orderReference: ref,
      storedOrderReference: storedRef,
      returnKind: 'error',
      success: false,
      paid: false,
      dbPaymentStatusUpdated: false,
      verificationHttp: null,
      verificationApproved: false,
      verificationError: 'order_ref_mismatch',
      email: registration.email,
      itemDescription: ITEM_DESCRIPTION,
    })
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
    const verification = await verifyStanbicOrderReference(ref)
    const { parsed, paymentStates, retrieveHttpStatus } = verification
    const paid = parsed.verificationApproved
    const wasNotPaidYet =
      registration.paymentStatus !== 'paid' && registration.paymentStatus !== 'waived'

    if (paid) {
      await payload.update({
        collection: 'registrations',
        id: regId,
        data: {
          paymentStatus: 'paid',
          status: registration.status === 'cancelled' ? registration.status : 'pending',
          stanbicPaymentOrderRef: ref,
        },
        overrideAccess: true,
      })

      const updatedReg = await payload.findByID({
        collection: 'registrations',
        id: regId,
        overrideAccess: true,
      })

      const regEmail = typeof registration.email === 'string' ? registration.email.trim() : ''
      if (wasNotPaidYet && regEmail) {
        try {
          const mailRes = await sendRegistrationPaymentConfirmed({
            to: regEmail,
            firstName:
              typeof registration.firstName === 'string' ? registration.firstName : undefined,
            registrationId: registrationRef,
          })
          if (mailRes && 'success' in mailRes && !mailRes.success) {
            console.error('[stanbic verify] payment-confirmed email not sent:', mailRes)
          }
        } catch (mailErr: unknown) {
          console.error('[stanbic verify] payment-confirmed email failed:', mailErr)
        }
        try {
          await ensureSafeguardingTrainingEmailSent(payload, updatedReg as any)
        } catch (sgErr: unknown) {
          console.error('[stanbic verify] safeguarding email failed:', sgErr)
        }
      }

      logStanbicPaymentEvent(
        buildStanbicReturnLogPayload({
          method,
          registrationRef,
          registrationPayloadId: regId,
          orderReference: ref,
          itemDescription: ITEM_DESCRIPTION,
          category: registration.category,
          email: registration.email,
          verificationHttp: retrieveHttpStatus,
          parsed,
          dbPaymentStatusUpdated: true,
        }),
      )

      return NextResponse.json({
        ok: true,
        paid: true,
        paymentStates,
        paymentState: parsed.primaryPaymentState,
        paymentStatus: parsed.paymentStatus,
        registrationId: registration.registrationId,
      })
    }

    logStanbicPaymentEvent(
      buildStanbicReturnLogPayload({
        method,
        registrationRef,
        registrationPayloadId: regId,
        orderReference: ref,
        itemDescription: ITEM_DESCRIPTION,
        category: registration.category,
        email: registration.email,
        verificationHttp: retrieveHttpStatus,
        parsed,
        dbPaymentStatusUpdated: false,
      }),
    )

    const followUpEligible =
      registration.paymentStatus === 'pending' &&
      !registration.paymentFollowUpSentAt &&
      typeof registration.email === 'string' &&
      registration.email.trim().length > 0

    if (followUpEligible) {
      const summary =
        parsed.verificationError ??
        (paymentStates.length ? paymentStates.join(', ') : 'No payment confirmation from gateway yet')
      try {
        const mailOut = await sendRegistrationPaymentNotConfirmed({
          to: registration.email!.trim(),
          firstName:
            typeof registration.firstName === 'string' ? registration.firstName : undefined,
          registrationId: registrationRef,
          summary,
        })
        if (mailOut && 'success' in mailOut && mailOut.success) {
          await payload.update({
            collection: 'registrations',
            id: regId,
            data: { paymentFollowUpSentAt: new Date().toISOString() },
            overrideAccess: true,
          })
        } else {
          console.error('[stanbic verify] payment-not-confirmed email failed or mock:', mailOut)
        }
      } catch (mailErr: unknown) {
        console.error('[stanbic verify] payment-not-confirmed email threw:', mailErr)
      }
    }

    return NextResponse.json({
      ok: true,
      paid: false,
      paymentStates,
      paymentState: parsed.primaryPaymentState,
      paymentStatus: parsed.paymentStatus,
      registrationId: registration.registrationId,
    })
  } catch (e: unknown) {
    const msg = stanbicVerificationErrorMessage(e)
    const httpErr = retrieveHttpFromStanbicError(e)
    console.error('[stanbic verify] gateway error', e)
    logStanbicPaymentEvent({
      event: 'stanbic_return',
      method,
      registrationRef,
      registrationPayloadId: regId,
      orderReference: ref,
      returnKind: 'error',
      success: false,
      paid: false,
      dbPaymentStatusUpdated: false,
      verificationHttp: httpErr,
      verificationApproved: false,
      verificationError: msg,
      itemDescription: ITEM_DESCRIPTION,
      email: registration.email,
    })
    return NextResponse.json({ ok: false, error: msg, paid: false }, { status: 503 })
  }
}

/**
 * After redirect from hosted pay page, N-Genius appends ref=<order-reference> to redirectUrl.
 * Client calls POST with ref + registrationPayloadId; we sync Payload paymentStatus when paid.
 */
export async function POST(req: NextRequest) {
  try {
    let body: { ref?: string; registrationPayloadId?: string | number }
    try {
      body = await req.json()
    } catch {
      logStanbicPaymentEvent({
        event: 'stanbic_return',
        method: 'POST',
        returnKind: 'error',
        success: false,
        paid: false,
        dbPaymentStatusUpdated: false,
        verificationHttp: null,
        verificationApproved: false,
        verificationError: 'invalid_json_body',
      })
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const ref = typeof body.ref === 'string' ? body.ref.trim() : ''
    const regId =
      typeof body.registrationPayloadId !== 'undefined'
        ? String(body.registrationPayloadId).trim()
        : ''

    return runStanbicRegistrationVerify({ ref, registrationPayloadId: regId, method: 'POST' })
  } catch (fatal: unknown) {
    const msg = fatal instanceof Error ? fatal.message : String(fatal)
    console.error('[stanbic verify] fatal', fatal)
    logStanbicPaymentEvent({
      event: 'stanbic_return',
      method: 'POST',
      returnKind: 'error',
      success: false,
      paid: false,
      dbPaymentStatusUpdated: false,
      verificationHttp: null,
      verificationApproved: false,
      verificationError: 'fatal_exception',
      description: msg,
    })
    return NextResponse.json({ ok: false, paid: false, error: msg }, { status: 500 })
  }
}

/** GET ?ref=&registrationPayloadId= — same verification path (certification / direct bank return) */
export async function GET(req: NextRequest) {
  try {
    const ref = req.nextUrl.searchParams.get('ref')?.trim() ?? ''
    const regId = req.nextUrl.searchParams.get('registrationPayloadId')?.trim() ?? ''
    return runStanbicRegistrationVerify({ ref, registrationPayloadId: regId, method: 'GET' })
  } catch (fatal: unknown) {
    const msg = fatal instanceof Error ? fatal.message : String(fatal)
    console.error('[stanbic verify] fatal GET', fatal)
    logStanbicPaymentEvent({
      event: 'stanbic_return',
      method: 'GET',
      returnKind: 'error',
      success: false,
      paid: false,
      dbPaymentStatusUpdated: false,
      verificationHttp: null,
      verificationApproved: false,
      verificationError: 'fatal_exception',
      description: msg,
    })
    return NextResponse.json({ ok: false, paid: false, error: msg }, { status: 500 })
  }
}
