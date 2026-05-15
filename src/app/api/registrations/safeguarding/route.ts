import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import {
  SAFEGUARDING_POLICY_ITEMS,
  SAFEGUARDING_TRAINING_URL,
  validateSafeguardingAcknowledgments,
  registrationPaymentSettled,
  hasSafeguardingAcknowledgment,
} from '@/lib/safeguarding'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function clientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim()
  return request.headers.get('x-real-ip') ?? undefined
}

async function findByToken(token: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'registrations',
    where: { safeguardingAckToken: { equals: token } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs[0] ?? null
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim()
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const doc = await findByToken(token)
  if (!doc) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
  }

  const paymentSettled = registrationPaymentSettled(doc.paymentStatus)
  const acknowledged = hasSafeguardingAcknowledgment(doc)

  return NextResponse.json({
    ok: true,
    registrationId:
      typeof doc.registrationId === 'string' ? doc.registrationId : String(doc.id),
    firstName: typeof doc.firstName === 'string' ? doc.firstName : '',
    paymentSettled,
    acknowledged,
    trainingUrl: SAFEGUARDING_TRAINING_URL,
    policyItems: SAFEGUARDING_POLICY_ITEMS.map((p) => ({ id: p.id, label: p.label })),
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const token = typeof body.token === 'string' ? body.token.trim() : ''
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const doc = await findByToken(token)
  if (!doc) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
  }

  if (!registrationPaymentSettled(doc.paymentStatus)) {
    return NextResponse.json(
      {
        error:
          'Payment must be confirmed before you can complete safeguarding acknowledgment. If you paid by bank transfer, wait until we verify your payment.',
      },
      { status: 403 },
    )
  }

  if (hasSafeguardingAcknowledgment(doc)) {
    return NextResponse.json({
      ok: true,
      alreadyAcknowledged: true,
      registrationId:
        typeof doc.registrationId === 'string' ? doc.registrationId : String(doc.id),
    })
  }

  const validation = validateSafeguardingAcknowledgments(body)
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const payload = await getPayloadClient()
  const now = new Date().toISOString()
  const ip = clientIp(request)
  const userAgent = request.headers.get('user-agent') ?? undefined

  await payload.update({
    collection: 'registrations',
    id: doc.id,
    data: {
      safeguardingAcknowledgedAt: now,
      status: doc.status === 'cancelled' ? doc.status : 'confirmed',
      safeguardingAckIp: ip,
      safeguardingAckUserAgent: userAgent,
      notes: [
        typeof doc.notes === 'string' ? doc.notes.trim() : '',
        `[Safeguarding] Acknowledged ${now} (IP: ${ip ?? 'unknown'})`,
      ]
        .filter(Boolean)
        .join('\n'),
    },
    overrideAccess: true,
  })

  return NextResponse.json({
    ok: true,
    registrationId:
      typeof doc.registrationId === 'string' ? doc.registrationId : String(doc.id),
    acknowledgedAt: now,
  })
}
