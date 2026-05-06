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
import { logStanbicPaymentEvent } from '@/lib/stanbic/paymentJsonLog'
import {
  sendRegistrationPaymentConfirmed,
  sendRegistrationPaymentNotConfirmed,
} from '@/lib/mail'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
/** Cold Payload init + two Stanbic hops can exceed serverless defaults */
export const maxDuration = 60

function retrieveHttpFromError(e: unknown): number | null {
  if (typeof e === 'object' && e !== null && 'retrieveHttpStatus' in e) {
    const n = (e as { retrieveHttpStatus?: unknown }).retrieveHttpStatus
    return typeof n === 'number' ? n : null
  }
  return null
}

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
      logStanbicPaymentEvent({
        event: 'stanbic_return',
        method: 'POST',
        returnKind: 'error',
        success: false,
        paid: false,
        dbPaymentStatusUpdated: false,
        authoriseInfoHttp: null,
        authoriseInfoApproved: false,
        authoriseInfoError: 'gateway_not_configured',
        reason: 'stanbic_env_incomplete',
      })
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
      logStanbicPaymentEvent({
        event: 'stanbic_return',
        method: 'POST',
        returnKind: 'error',
        success: false,
        paid: false,
        dbPaymentStatusUpdated: false,
        authoriseInfoHttp: null,
        authoriseInfoApproved: false,
        authoriseInfoError: 'invalid_json_body',
      })
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const ref = typeof body.ref === 'string' ? body.ref.trim() : ''
    const regId =
      typeof body.registrationPayloadId !== 'undefined'
        ? String(body.registrationPayloadId).trim()
        : ''

    if (!ref) {
      logStanbicPaymentEvent({
        event: 'stanbic_return',
        method: 'POST',
        registrationPayloadId: regId || undefined,
        returnKind: 'error',
        success: false,
        paid: false,
        dbPaymentStatusUpdated: false,
        authoriseInfoHttp: null,
        authoriseInfoApproved: false,
        authoriseInfoError: 'missing_gateway_order_ref_query',
      })
      return NextResponse.json({ error: 'ref (gateway order reference) is required' }, { status: 400 })
    }
    if (!regId) {
      logStanbicPaymentEvent({
        event: 'stanbic_return',
        method: 'POST',
        gatewayOrderRef: ref,
        returnKind: 'error',
        success: false,
        paid: false,
        dbPaymentStatusUpdated: false,
        authoriseInfoHttp: null,
        authoriseInfoApproved: false,
        authoriseInfoError: 'missing_registration_payload_id',
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
        method: 'POST',
        registrationPayloadId: regId,
        gatewayOrderRef: ref,
        returnKind: 'error',
        success: false,
        paid: false,
        dbPaymentStatusUpdated: false,
        authoriseInfoHttp: null,
        authoriseInfoApproved: false,
        authoriseInfoError: 'payload_db_init_failed',
        description: msg,
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
        method: 'POST',
        registrationPayloadId: regId,
        gatewayOrderRef: ref,
        returnKind: 'error',
        success: false,
        paid: false,
        dbPaymentStatusUpdated: false,
        authoriseInfoHttp: null,
        authoriseInfoApproved: false,
        authoriseInfoError: 'registration_not_found',
      })
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    const storedRef =
      typeof registration.stanbicPaymentOrderRef === 'string'
        ? registration.stanbicPaymentOrderRef.trim()
        : ''

    if (storedRef && storedRef !== ref) {
      logStanbicPaymentEvent({
        event: 'stanbic_return',
        method: 'POST',
        registrationRef:
          typeof registration.registrationId === 'string' ? registration.registrationId : undefined,
        registrationPayloadId: regId,
        gatewayOrderRef: ref,
        storedGatewayOrderRef: storedRef,
        returnKind: 'error',
        success: false,
        paid: false,
        dbPaymentStatusUpdated: false,
        authoriseInfoHttp: null,
        authoriseInfoApproved: false,
        authoriseInfoError: 'order_ref_mismatch',
        email: registration.email,
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
      const { access_token } = await stanbicAccessToken()
      const { paymentStates, retrieveHttpStatus } = await stanbicRetrieveOrder({
        accessToken: access_token,
        orderReference: ref,
      })

      const paid = isOrderPaymentSuccessful(paymentStates)
      const wasNotPaidYet =
        registration.paymentStatus !== 'paid' && registration.paymentStatus !== 'waived'

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

        const regEmail =
          typeof registration.email === 'string' ? registration.email.trim() : ''
        if (wasNotPaidYet && regEmail) {
          try {
            const mailRes = await sendRegistrationPaymentConfirmed({
              to: regEmail,
              firstName:
                typeof registration.firstName === 'string' ? registration.firstName : undefined,
              registrationId:
                typeof registration.registrationId === 'string'
                  ? registration.registrationId
                  : regId,
            })
            if (mailRes && 'success' in mailRes && !mailRes.success) {
              console.error('[stanbic verify] payment-confirmed email not sent:', mailRes)
            }
          } catch (mailErr: unknown) {
            console.error('[stanbic verify] payment-confirmed email failed:', mailErr)
          }
        }

        logStanbicPaymentEvent({
          event: 'stanbic_return',
          method: 'POST',
          registrationRef:
            typeof registration.registrationId === 'string' ? registration.registrationId : regId,
          registrationPayloadId: regId,
          gatewayOrderRef: ref,
          returnKind: 'success',
          success: true,
          paid: true,
          dbPaymentStatusUpdated: true,
          paymentStates,
          gatewayStateSummary: paymentStates.length ? paymentStates.join(', ') : '(none)',
          authoriseInfoHttp: retrieveHttpStatus,
          authoriseInfoApproved: true,
          authoriseInfoError: null,
          category: registration.category,
          registrationPackage: registration.registrationPackage,
          itemDescription: 'SARSYC VI registration fee',
          email: registration.email,
        })

        return NextResponse.json({
          ok: true,
          paid: true,
          paymentStates,
          registrationId: registration.registrationId,
        })
      }

      logStanbicPaymentEvent({
        event: 'stanbic_return',
        method: 'POST',
        registrationRef:
          typeof registration.registrationId === 'string' ? registration.registrationId : regId,
        registrationPayloadId: regId,
        gatewayOrderRef: ref,
        returnKind: 'pending',
        success: false,
        paid: false,
        dbPaymentStatusUpdated: false,
        paymentStates,
        gatewayStateSummary: paymentStates.length ? paymentStates.join(', ') : '(none)',
        authoriseInfoHttp: retrieveHttpStatus,
        authoriseInfoApproved: false,
        authoriseInfoError: paymentStates.length ? `states:${paymentStates.join(',')}` : 'no_payment_states_yet',
        category: registration.category,
        registrationPackage: registration.registrationPackage,
        itemDescription: 'SARSYC VI registration fee',
        email: registration.email,
      })

      const followUpEligible =
        registration.paymentStatus === 'pending' &&
        !registration.paymentFollowUpSentAt &&
        typeof registration.email === 'string' &&
        registration.email.trim().length > 0

      if (followUpEligible) {
        const summary =
          paymentStates.length ? paymentStates.join(', ') : 'No payment confirmation from gateway yet'
        try {
          const mailOut = await sendRegistrationPaymentNotConfirmed({
            to: registration.email!.trim(),
            firstName:
              typeof registration.firstName === 'string' ? registration.firstName : undefined,
            registrationId:
              typeof registration.registrationId === 'string'
                ? registration.registrationId
                : regId,
            summary,
          })
          if (mailOut && 'success' in mailOut && mailOut.success) {
            await payload.update({
              collection: 'registrations',
              id: regId,
              data: {
                paymentFollowUpSentAt: new Date().toISOString(),
              },
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
        registrationId: registration.registrationId,
      })
    } catch (e: unknown) {
      const msg = formatStanbicOutboundError(e)
      const httpErr = retrieveHttpFromError(e)
      console.error('[stanbic verify] gateway error', e)
      logStanbicPaymentEvent({
        event: 'stanbic_return',
        method: 'POST',
        registrationRef:
          typeof registration.registrationId === 'string' ? registration.registrationId : regId,
        registrationPayloadId: regId,
        gatewayOrderRef: ref,
        returnKind: 'error',
        success: false,
        paid: false,
        dbPaymentStatusUpdated: false,
        authoriseInfoHttp: httpErr,
        authoriseInfoApproved: false,
        authoriseInfoError: msg,
        itemDescription: 'SARSYC VI registration fee',
        email: registration.email,
      })
      return NextResponse.json({ ok: false, error: msg, paid: false }, { status: 503 })
    }
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
      authoriseInfoHttp: null,
      authoriseInfoApproved: false,
      authoriseInfoError: 'fatal_exception',
      description: msg,
    })
    return NextResponse.json({ ok: false, paid: false, error: msg }, { status: 500 })
  }
}
