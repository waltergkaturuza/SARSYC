import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import {
  stanbicAccessToken,
  stanbicCreateHostedOrder,
  publicSiteOrigin,
  registrationRequiresHostedPayment,
  registrationFeeCurrency,
  resolveHostedPaymentMinorUnits,
} from '@/lib/stanbic/ngenius'
import {
  getRegistrationPricingTier,
  isRegistrationPackageId,
} from '@/lib/registrationPackages'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
  const payload = await getPayloadClient()

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
    const msg = e instanceof Error ? e.message : 'Payment session failed'
    console.error('[stanbic create-order]', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
