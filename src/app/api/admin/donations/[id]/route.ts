import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'
import { isFinanceRole } from '@/lib/admin/adminAccess'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ALLOWED_STATUSES = new Set(['pending', 'paid', 'failed', 'bank-transfer'])

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  let body: { paymentStatus?: unknown; notes?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const paymentStatus =
    typeof body.paymentStatus === 'string' ? body.paymentStatus.trim() : ''
  const notes = typeof body.notes === 'string' ? body.notes.trim() : undefined

  if (paymentStatus && !ALLOWED_STATUSES.has(paymentStatus)) {
    return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
  }

  try {
    const acting = await getCurrentUserFromRequest(req)
    if (!acting) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!isFinanceRole(acting.role)) {
      return NextResponse.json({ error: 'Forbidden. Finance access required.' }, { status: 403 })
    }

    const payload = await getPayloadClient()
    const data: Record<string, unknown> = {}
    if (paymentStatus) {
      data.paymentStatus = paymentStatus
      if (paymentStatus === 'paid') {
        data.paymentConfirmedAt = new Date().toISOString()
      }
    }
    if (notes !== undefined) data.notes = notes

    const updated = await payload.update({
      collection: 'donations',
      id: params.id,
      data,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, doc: updated })
  } catch (err: unknown) {
    console.error('[admin/donations PATCH]', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
