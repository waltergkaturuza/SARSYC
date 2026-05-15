import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { ensureSafeguardingTrainingEmailSent } from '@/lib/safeguardingNotifications'
import { registrationPaymentSettled } from '@/lib/safeguarding'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayloadClient()
    
    const registration = await payload.findByID({
      collection: 'registrations',
      id: params.id,
      depth: 2,
    })

    return NextResponse.json({ success: true, doc: registration })
  } catch (error: any) {
    console.error('Get registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch registration' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayloadClient()
    const body = await request.json()

    const before = await payload.findByID({
      collection: 'registrations',
      id: params.id,
      depth: 0,
    })

    const registration = await payload.update({
      collection: 'registrations',
      id: params.id,
      data: body,
    })

    const paymentNowSettled =
      registrationPaymentSettled(registration.paymentStatus) &&
      !registrationPaymentSettled(before.paymentStatus)
    if (paymentNowSettled) {
      try {
        await ensureSafeguardingTrainingEmailSent(payload, registration as any)
      } catch (e) {
        console.error('[admin registration PATCH] safeguarding email failed', e)
      }
    }

    return NextResponse.json({ success: true, doc: registration })
  } catch (error: any) {
    console.error('Update registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update registration' },
      { status: 500 }
    )
  }
}



