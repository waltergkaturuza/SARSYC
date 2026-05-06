import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import {
  stanbicAccessToken,
  stanbicCreateHostedOrder,
  publicSiteOrigin,
  registrationRequiresHostedPayment,
  registrationFeeCurrency,
  resolveHostedPaymentMinorUnits,
  formatStanbicOutboundError,
  httpStatusForStanbicOutboundFailure,
} from '@/lib/stanbic/ngenius'
import {
  getRegistrationPricingTier,
  getRegistrationPackage,
  isRegistrationPackageId,
} from '@/lib/registrationPackages'
import { ensureRegistrationsLatestColumns } from '@/lib/ensureRegistrationSchema'
import { logStanbicPaymentEvent } from '@/lib/stanbic/paymentJsonLog'
import { sendRegistrationPaymentSessionFailed } from '@/lib/mail'

const STANBIC_CREATE_ORDER_UPSTREAM_HINT =
  'If this repeats: check STANBIC_* secrets and gateway URL on Vercel, and that the payment return URL origin (NEXT_PUBLIC_SITE_URL) is allow-listed for your N-Genius outlet.'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * After a registration is saved, POST JSON with either:
 * - `registrationPayloadId`: Payload CMS document id (number or string), and/or
 * - `registrationId`: human-readable id (e.g. SARSYC-…), for lookup if the CMS id is wrong.
 */
export async function POST(req: NextRequest) {
  if (!registrationRequiresHostedPayment()) {
    return NextResponse.json({ error: 'Hosted payment is not enabled' }, { status: 400 })
  }

  type Body = { registrationPayloadId?: unknown; registrationId?: unknown }
  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const payloadIdRaw = body.registrationPayloadId
  const payloadIdCandidate =
    payloadIdRaw === null || payloadIdRaw === undefined
      ? ''
      : String(payloadIdRaw).trim()
  const registrationIdHuman =
    typeof body.registrationId === 'string' ? body.registrationId.trim() : ''

  const looksLikeHumanRef = /^sarsyc-/i.test(payloadIdCandidate)

  if (!payloadIdCandidate && !registrationIdHuman && !looksLikeHumanRef) {
    return NextResponse.json(
      { error: 'Provide registrationPayloadId (CMS id) or registrationId (e.g. SARSYC-…).' },
      { status: 400 },
    )
  }

  let payload: Awaited<ReturnType<typeof getPayloadClient>>
  try {
    payload = await getPayloadClient()
    await ensureRegistrationsLatestColumns(payload)
  } catch (boot: unknown) {
    const msg = boot instanceof Error ? boot.message : String(boot)
    console.error('[stanbic create-order] payload init / schema', boot)
    return NextResponse.json(
      { error: msg || 'Database is temporarily unavailable. Try again in a moment.' },
      { status: 503 },
    )
  }

  let registration: Awaited<ReturnType<typeof payload.findByID>> | null = null

  if (payloadIdCandidate && !looksLikeHumanRef) {
    try {
      registration = await payload.findByID({
        collection: 'registrations',
        id: payloadIdCandidate,
        overrideAccess: true,
      })
    } catch {
      registration = null
    }
  }

  const humanLookup = registrationIdHuman || (looksLikeHumanRef ? payloadIdCandidate : '')
  if (!registration && humanLookup) {
    const found = await payload.find({
      collection: 'registrations',
      where: { registrationId: { equals: humanLookup } },
      limit: 1,
      overrideAccess: true,
    })
    registration = found.docs[0] ?? null
  }

  if (!registration) {
    return NextResponse.json(
      { error: 'Registration not found. Use the same email to register or contact support with your registration ID.' },
      { status: 404 },
    )
  }

  const idStr = String(registration.id)

  if (registration.paymentStatus === 'paid' || registration.paymentStatus === 'waived') {
    return NextResponse.json({ error: 'Registration does not require payment' }, { status: 409 })
  }

  if (getRegistrationPricingTier() === 'closed') {
    return NextResponse.json(
      { error: 'The online registration payment window has closed.' },
      { status: 403 },
    )
  }

  const pkgRaw = registration.registrationPackage
  if (!isRegistrationPackageId(pkgRaw)) {
    return NextResponse.json(
      { error: 'Registration is missing a valid conference package. Contact support.' },
      { status: 400 },
    )
  }

  const value = resolveHostedPaymentMinorUnits(pkgRaw)
  if (value <= 0) {
    return NextResponse.json({ error: 'No payment amount is due for this registration.' }, { status: 400 })
  }

  const redirectUrl = `${publicSiteOrigin()}/participate/register/payment-complete/${encodeURIComponent(idStr)}`

  const tier = getRegistrationPricingTier()

  try {
    const { access_token } = await stanbicAccessToken()

    const { orderReference, paymentHref, createOrderHttpStatus } = await stanbicCreateHostedOrder({
      accessToken: access_token,
      currencyCode: registrationFeeCurrency(),
      value,
      emailAddress: registration.email,
      redirectUrl,
      merchantOrderReference:
        typeof registration.registrationId === 'string' ? registration.registrationId : undefined,
    })

    await payload.update({
      collection: 'registrations',
      id: idStr,
      data: {
        stanbicPaymentOrderRef: orderReference,
      },
      overrideAccess: true,
    })

    let paymentPageHost = ''
    try {
      paymentPageHost = new URL(paymentHref).hostname
    } catch {
      /* ignore */
    }

    logStanbicPaymentEvent({
      event: 'stanbic_start',
      registrationRef:
        typeof registration.registrationId === 'string' ? registration.registrationId : idStr,
      registrationPayloadId: idStr,
      gatewayOrderRef: orderReference,
      amount: String(value),
      amountDisplayUsd: registrationFeeCurrency() === 'USD' ? Math.round(value) / 100 : null,
      amountDisplayMajor: registrationFeeCurrency() === 'USD' ? Math.round(value) / 100 : null,
      currency: registrationFeeCurrency(),
      itemDescription: 'SARSYC VI registration fee',
      pricingTier: tier,
      registrationPackage: pkgRaw,
      packageName: getRegistrationPackage(pkgRaw).name,
      category: registration.category,
      email: registration.email,
      success: true,
      dbStanbicOrderRefSaved: true,
      createOrderHttp: createOrderHttpStatus,
      paymentPageHost,
    })

    return NextResponse.json({
      redirectUrl: paymentHref,
      orderReference,
    })
  } catch (e: unknown) {
    const msg = formatStanbicOutboundError(e)
    const httpStatus = httpStatusForStanbicOutboundFailure(msg)
    console.error('[stanbic create-order]', e)
    console.error('[stanbic create-order] payment return URL (allow-list):', redirectUrl)
    logStanbicPaymentEvent({
      event: 'stanbic_start',
      registrationRef:
        typeof registration.registrationId === 'string' ? registration.registrationId : idStr,
      registrationPayloadId: idStr,
      amount: String(value),
      amountDisplayUsd: registrationFeeCurrency() === 'USD' ? Math.round(value) / 100 : null,
      amountDisplayMajor: registrationFeeCurrency() === 'USD' ? Math.round(value) / 100 : null,
      currency: registrationFeeCurrency(),
      itemDescription: 'SARSYC VI registration fee',
      pricingTier: tier,
      registrationPackage: pkgRaw,
      packageName: getRegistrationPackage(pkgRaw).name,
      category: registration.category,
      email: registration.email,
      success: false,
      dbStanbicOrderRefSaved: false,
      gatewayError: msg,
    })

    const stanbicRef =
      typeof registration.stanbicPaymentOrderRef === 'string'
        ? registration.stanbicPaymentOrderRef.trim()
        : ''
    const emailTo =
      typeof registration.email === 'string' ? registration.email.trim() : ''
    if (emailTo && !stanbicRef) {
      try {
        await sendRegistrationPaymentSessionFailed({
          to: emailTo,
          firstName:
            typeof registration.firstName === 'string' ? registration.firstName : undefined,
          registrationId:
            typeof registration.registrationId === 'string'
              ? registration.registrationId
              : idStr,
          hint: msg,
        })
      } catch (mailErr: unknown) {
        console.error('[stanbic create-order] payment-session email failed:', mailErr)
      }
    }

    return NextResponse.json(
      httpStatus === 502
        ? { error: msg, hint: STANBIC_CREATE_ORDER_UPSTREAM_HINT }
        : { error: msg },
      { status: httpStatus },
    )
  }
}
