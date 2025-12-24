import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { sendRegistrationConfirmation } from '@/lib/mail'
import { logExport } from '@/lib/telemetry'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, ids } = body

    // Basic validation
    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const adminId = req.headers.get('x-admin-user-id')
    if (!adminId) return NextResponse.json({ error: 'Missing admin header' }, { status: 401 })

    const payload = await getPayloadClient()
    const userRes = await payload.find({ collection: 'users', where: { id: { equals: adminId } } })
    const acting = userRes?.docs?.[0]
    if (!acting || !['admin', 'super-admin'].includes(acting.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Perform actions
    const results: Record<string, any> = { updated: [], failed: [] }

    for (const id of ids) {
      try {
        if (action === 'markConfirmed') {
          await payload.update({ collection: 'registrations', id, data: { status: 'confirmed', paymentStatus: 'paid' } })
          results.updated.push(id)
        } else if (action === 'sendEmail') {
          const res = await payload.find({ collection: 'registrations', where: { id: { equals: id } } })
          const doc = res?.docs?.[0]
          if (doc) {
            // Fire-and-forget
            sendRegistrationConfirmation(doc).catch((e) => console.error('send email failed', e))
            results.updated.push(id)
          }
        } else if (action === 'softDelete') {
          // If deletedAt field exists it will be set; otherwise mark as cancelled
          try {
            await payload.update({ collection: 'registrations', id, data: { deletedAt: new Date().toISOString(), status: 'cancelled' } })
            results.updated.push(id)
          } catch (err) {
            // Fallback: set status to cancelled and add admin note
            await payload.update({ collection: 'registrations', id, data: { status: 'cancelled', notes: `Soft-deleted by ${acting.email} at ${new Date().toISOString()}` } })
            results.updated.push(id)
          }
        } else {
          results.failed.push({ id, reason: 'unknown action' })
        }
      } catch (err: any) {
        results.failed.push({ id, reason: err?.message || 'update failed' })
      }
    }

    await logExport('bulk-actions.registrations', { admin: { id: acting.id, email: acting.email }, action, count: results.updated.length })

    return NextResponse.json({ success: true, results })
  } catch (err: any) {
    console.error('bulk action error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Bulk action failed' }, { status: 500 })
  }
}
