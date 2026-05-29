import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import {
  stanbicAccessToken,
  stanbicCreateHostedOrder,
  publicSiteOrigin,
  formatStanbicOutboundError,
  httpStatusForStanbicOutboundFailure,
} from '@/lib/stanbic/ngenius'
import { STANBIC_PAYMENT_SUPPORT_HINT } from '@/lib/stanbic/stanbicEnvFallback'
import { logStanbicPaymentEvent } from '@/lib/stanbic/paymentJsonLog'
import { isConferenceTrackId, conferenceTrackLabel } from '@/lib/conferenceTracks'
import { trackSponsorshipAmountUsd } from '@/lib/trackSponsorship'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

function generateDonationId(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `SARSYC-DON-${ts}${rand}`
}

export async function POST(req: NextRequest) {
  type Body = {
    type?: unknown
    donorType?: unknown
    firstName?: unknown
    lastName?: unknown
    orgName?: unknown
    email?: unknown
    phone?: unknown
    amountUsd?: unknown
    message?: unknown
    sponsorshipCategory?: unknown
    sponsorshipTierName?: unknown
    sponsorshipTierId?: unknown
    conferenceTrack?: unknown
    trackSponsorshipMode?: unknown
    studentsSponsored?: unknown
  }

  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const type = String(body.type ?? 'donation').trim()
  const donorType = String(body.donorType ?? 'individual').trim()
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
  const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : ''
  const orgName = typeof body.orgName === 'string' ? body.orgName.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const sponsorshipCategory =
    String(body.sponsorshipCategory ?? 'package').trim() === 'track' ? 'track' : 'package'
  const sponsorshipTierName = typeof body.sponsorshipTierName === 'string' ? body.sponsorshipTierName.trim() : ''
  const sponsorshipTierId = body.sponsorshipTierId != null ? String(body.sponsorshipTierId).trim() : ''
  const conferenceTrack =
    typeof body.conferenceTrack === 'string' ? body.conferenceTrack.trim() : ''
  const trackSponsorshipMode =
    String(body.trackSponsorshipMode ?? 'students').trim() === 'custom_amount'
      ? 'custom_amount'
      : 'students'
  const studentsSponsored = Math.floor(Number(body.studentsSponsored))
  let amountUsd = Number(body.amountUsd)

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }
  if (donorType === 'individual' && (!firstName || !lastName)) {
    return NextResponse.json({ error: 'First name and last name are required.' }, { status: 400 })
  }
  if (donorType === 'organisation' && !orgName) {
    return NextResponse.json({ error: 'Organisation name is required.' }, { status: 400 })
  }

  if (type === 'sponsorship' && sponsorshipCategory === 'track') {
    if (!isConferenceTrackId(conferenceTrack)) {
      return NextResponse.json({ error: 'Please select a valid conference track.' }, { status: 400 })
    }
    if (trackSponsorshipMode === 'students') {
      if (!Number.isFinite(studentsSponsored) || studentsSponsored < 1) {
        return NextResponse.json(
          { error: 'Please enter at least one student to sponsor.' },
          { status: 400 },
        )
      }
      amountUsd = trackSponsorshipAmountUsd({
        mode: 'students',
        studentCount: studentsSponsored,
      })
    }
  }

  if (!amountUsd || amountUsd < 1) {
    return NextResponse.json({ error: 'Minimum amount is USD 1.' }, { status: 400 })
  }

  const donorName =
    donorType === 'organisation' ? orgName : `${firstName} ${lastName}`.trim()

  const sponsorshipDescription =
    type === 'sponsorship' && sponsorshipCategory === 'track'
      ? `Track sponsorship — ${conferenceTrackLabel(conferenceTrack)}${
          trackSponsorshipMode === 'students' ? ` (${studentsSponsored} students)` : ''
        }`
      : type === 'sponsorship'
        ? `SARSYC sponsorship — ${sponsorshipTierName || 'package'}`
        : 'SARSYC donation'

  let payload: Awaited<ReturnType<typeof getPayloadClient>>
  try {
    payload = await getPayloadClient()
  } catch (err: unknown) {
    console.error('[donate create-order] payload init', err)
    return NextResponse.json(
      { error: 'Service temporarily unavailable. Please try again.' },
      { status: 503 },
    )
  }

  const donationId = generateDonationId()

  // Create the donation record (pending)
  let donationDocId: string
  try {
    const doc = await payload.create({
      collection: 'donations',
      data: {
        donationId,
        type: type as 'donation' | 'sponsorship',
        donorType: donorType as 'individual' | 'organisation',
        donorName,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        orgName: orgName || undefined,
        email,
        phone: phone || undefined,
        amountUsd,
        currency: 'USD',
        message: message || undefined,
        sponsorshipCategory: type === 'sponsorship' ? sponsorshipCategory : undefined,
        sponsorshipTierName:
          type === 'sponsorship' && sponsorshipCategory === 'package'
            ? sponsorshipTierName || undefined
            : undefined,
        sponsorshipTier:
          type === 'sponsorship' && sponsorshipCategory === 'package' && sponsorshipTierId
            ? (sponsorshipTierId as any)
            : undefined,
        conferenceTrack:
          type === 'sponsorship' && sponsorshipCategory === 'track'
            ? conferenceTrack
            : undefined,
        trackSponsorshipMode:
          type === 'sponsorship' && sponsorshipCategory === 'track'
            ? trackSponsorshipMode
            : undefined,
        studentsSponsored:
          type === 'sponsorship' &&
          sponsorshipCategory === 'track' &&
          trackSponsorshipMode === 'students'
            ? studentsSponsored
            : undefined,
        paymentMethod: 'card',
        paymentStatus: 'pending',
      },
      overrideAccess: true,
    })
    donationDocId = String(doc.id)
  } catch (err: unknown) {
    console.error('[donate create-order] db create', err)
    return NextResponse.json({ error: 'Could not record donation. Please try again.' }, { status: 500 })
  }

  const redirectUrl = `${publicSiteOrigin()}/participate/donate/payment-complete/${encodeURIComponent(donationId)}`
  const amountMinorUnits = Math.round(amountUsd * 100) // cents

  try {
    const { access_token } = await stanbicAccessToken()
    const { orderReference, paymentHref, createOrderHttpStatus } = await stanbicCreateHostedOrder({
      accessToken: access_token,
      currencyCode: 'USD',
      value: amountMinorUnits,
      emailAddress: email,
      redirectUrl,
      merchantOrderReference: donationId,
    })

    await payload.update({
      collection: 'donations',
      id: donationDocId,
      data: { stanbicPaymentOrderRef: orderReference },
      overrideAccess: true,
    })

    logStanbicPaymentEvent({
      event: 'stanbic_start',
      registrationRef: donationId,
      registrationPayloadId: donationDocId,
      gatewayOrderRef: orderReference,
      amount: String(amountMinorUnits),
      amountDisplayUsd: amountUsd,
      amountDisplayMajor: amountUsd,
      currency: 'USD',
      itemDescription: sponsorshipDescription,
      email,
      success: true,
      dbStanbicOrderRefSaved: true,
      createOrderHttp: createOrderHttpStatus,
    })

    return NextResponse.json({ redirectUrl: paymentHref, orderReference, donationId })
  } catch (e: unknown) {
    const msg = formatStanbicOutboundError(e)
    const httpStatus = httpStatusForStanbicOutboundFailure(msg)
    console.error('[donate create-order]', e)

    logStanbicPaymentEvent({
      event: 'stanbic_start',
      registrationRef: donationId,
      registrationPayloadId: donationDocId,
      amount: String(amountMinorUnits),
      amountDisplayUsd: amountUsd,
      amountDisplayMajor: amountUsd,
      currency: 'USD',
      itemDescription: sponsorshipDescription,
      email,
      success: false,
      dbStanbicOrderRefSaved: false,
      gatewayError: msg,
    })

    return NextResponse.json(
      httpStatus === 502
        ? { error: msg, hint: STANBIC_PAYMENT_SUPPORT_HINT }
        : { error: msg },
      { status: httpStatus },
    )
  }
}
