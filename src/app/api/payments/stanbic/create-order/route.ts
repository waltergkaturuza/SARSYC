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
} from '@/lib/stanbic/ngenius'
import {
  getRegistrationPricingTier,
  isRegistrationPackageId,
} from '@/lib/registrationPackages'
import { ensureRegistrationsLatestColumns } from '@/lib/ensureRegistrationSchema'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * After a registration is saved, POST { registrationPayloadId: number } to get the hosted payment URL.
 */
export async function POST(req: NextRequest) {
  if (!registrationRequiresHostedPayment()) {
    return NextResponse.json({ error: 'Hosted payment is not enabled' }, { status: 400 })
  }

  let body: { registrationPayloadId?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const registrationPayloadId = body.registrationPayloadId
  if (typeof registrationPayloadId !== 'number' && typeof registrationPayloadId !== 'string') {
    return NextResponse.json({ error: 'registrationPayloadId is required' }, { status: 400 })
  }

  const idStr = String(registrationPayloadId)

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

  let registration
  try {
    registration = await payload.findByID({
      collection: 'registrations',
      id: idStr,
      overrideAccess: true,
    })
  } catch {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  }

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

  try {
    const { access_token } = await stanbicAccessToken()

    const { orderReference, paymentHref } = await stanbicCreateHostedOrder({
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

    return NextResponse.json({
      redirectUrl: paymentHref,
      orderReference,
    })
  } catch (e: unknown) {
    const msg = formatStanbicOutboundError(e)
    console.error('[stanbic create-order]', e)
    return NextResponse.json({ error: msg }, { status: 503 })
  }
}
