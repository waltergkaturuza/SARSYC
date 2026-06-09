import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'
import { ensureSafeguardingTrainingEmailSent } from '@/lib/safeguardingNotifications'
import { registrationPaymentSettled } from '@/lib/safeguarding'
import { pickAdminRegistrationUpdate } from '@/lib/admin/registrationAdminEdit'
import { isFinanceRole } from '@/lib/admin/adminAccess'
import { ensureRegistrationsLatestColumns } from '@/lib/ensureRegistrationSchema'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function requireAdmin(req: NextRequest) {
  const acting = await getCurrentUserFromRequest(req)
  if (!acting) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (!isFinanceRole(String(acting.role))) {
    return { error: NextResponse.json({ error: 'Forbidden. Finance access required.' }, { status: 403 }) }
  }
  return { acting }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const payload = await getPayloadClient()
    await ensureRegistrationsLatestColumns(payload)

    const registration = await payload.findByID({
      collection: 'registrations',
      id: params.id,
      depth: 2,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, doc: registration })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch registration'
    console.error('Get registration error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const payload = await getPayloadClient()
    await ensureRegistrationsLatestColumns(payload)
    const body = await request.json()
    const data = pickAdminRegistrationUpdate(body)

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const before = await payload.findByID({
      collection: 'registrations',
      id: params.id,
      depth: 0,
      overrideAccess: true,
    })

    const patchData = { ...data }
    if (patchData.status === 'pending' || patchData.status === 'confirmed') {
      patchData.deletedAt = null
    }

    const registration = await payload.update({
      collection: 'registrations',
      id: params.id,
      data: patchData,
      overrideAccess: true,
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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update registration'
    console.error('Update registration error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
