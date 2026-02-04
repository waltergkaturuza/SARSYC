import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, ids } = body

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const acting = await getCurrentUserFromRequest(req)
    if (!acting) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!['admin', 'super-admin'].includes(acting.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payload = await getPayloadClient()
    const results: Record<string, any> = { updated: [], failed: [] }

    for (const id of ids) {
      try {
        if (action === 'markConfirmed') {
          await payload.update({
            collection: 'orathon-registrations',
            id,
            data: { status: 'confirmed' },
          })
          results.updated.push(id)
        } else if (action === 'markCancelled') {
          await payload.update({
            collection: 'orathon-registrations',
            id,
            data: { status: 'cancelled' },
          })
          results.updated.push(id)
        } else {
          results.failed.push({ id, reason: 'unknown action' })
        }
      } catch (err: any) {
        results.failed.push({ id, reason: err?.message || 'update failed' })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (err: any) {
    console.error('orathon bulk action error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Bulk action failed' }, { status: 500 })
  }
}
