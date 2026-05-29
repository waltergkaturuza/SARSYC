import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { ensureRegistrationsLatestColumns } from '@/lib/ensureRegistrationSchema'
import {
  assignRegistrationPackage,
  findRegistrationForResumePayment,
  registrationNeedsPayment,
} from '@/lib/registrationResumePayment'
import { isRegistrationPackageId } from '@/lib/registrationPackages'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Lookup registration for resume payment (registration ID + email must match). */
export async function POST(req: NextRequest) {
  let body: {
    registrationId?: unknown
    email?: unknown
    registrationPackage?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const registrationId =
    typeof body.registrationId === 'string' ? body.registrationId.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!registrationId || !email) {
    return NextResponse.json(
      { error: 'Registration ID and email are required.' },
      { status: 400 },
    )
  }

  const payload = await getPayloadClient()
  await ensureRegistrationsLatestColumns(payload)

  const found = await payload.find({
    collection: 'registrations',
    where: {
      and: [
        { registrationId: { equals: registrationId } },
        { email: { equals: email } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  })

  const doc = found.docs[0] as Record<string, unknown> | undefined
  if (!doc) {
    return NextResponse.json(
      { error: 'No registration found with that ID and email. Check both match your original signup.' },
      { status: 404 },
    )
  }

  if (!registrationNeedsPayment(doc)) {
    const ps = typeof doc.paymentStatus === 'string' ? doc.paymentStatus : 'pending'
    return NextResponse.json({
      ok: true,
      alreadyPaid: ps === 'paid' || ps === 'waived',
      paymentStatus: ps,
      registrationId:
        typeof doc.registrationId === 'string' ? doc.registrationId : registrationId,
      message:
        ps === 'paid'
          ? 'This registration is already marked as paid.'
          : ps === 'waived'
            ? 'This registration fee has been waived.'
            : 'The registration payment window is currently closed.',
    })
  }

  const packageCandidate = body.registrationPackage
  if (isRegistrationPackageId(packageCandidate)) {
    await assignRegistrationPackage(payload, String(doc.id), packageCandidate)
  }

  const info = await findRegistrationForResumePayment(payload, { registrationId, email })
  if (!info) {
    return NextResponse.json({ error: 'Could not load registration.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, ...info })
}
