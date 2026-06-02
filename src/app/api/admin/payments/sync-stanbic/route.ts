import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'
import { bulkSyncStanbicPayments } from '@/lib/stanbic/syncStanbicPayments'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(req: NextRequest) {
  const acting = await getCurrentUserFromRequest(req)
  if (!acting) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!['admin', 'super-admin', 'editor'].includes(String(acting.role))) {
    return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
  }

  let body: { references?: unknown; limit?: unknown } = {}
  try {
    body = await req.json()
  } catch {
    // Empty body = sync all pending card payments
  }

  const references = Array.isArray(body.references)
    ? body.references
        .filter((r): r is string => typeof r === 'string' && r.trim().length > 0)
        .map((r) => r.trim())
    : undefined
  const limit =
    typeof body.limit === 'number' && Number.isFinite(body.limit)
      ? Math.min(Math.max(1, Math.floor(body.limit)), 40)
      : undefined

  try {
    const payload = await getPayloadClient()
    const summary = await bulkSyncStanbicPayments(payload, { references, limit })
    if (!summary.ok) {
      return NextResponse.json(summary, { status: 503 })
    }
    return NextResponse.json(summary)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[admin sync-stanbic]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
