import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'

export async function POST(req: Request) {
  try {
    const params = new URL(req.url).pathname.split('/')
    const id = params[params.length - 3] // /api/admin/participants/[id]/badge

    // Get current authenticated user from session
    const acting = await getCurrentUserFromRequest(req)
    
    if (!acting) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to access this resource.' }, { status: 401 })
    }
    
    if (!['admin', 'super-admin'].includes(acting.role)) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
    }

    const payload = await getPayloadClient()

    const res = await payload.find({ collection: 'participants', where: { id: { equals: id } }, limit: 1 })
    const participant = res?.docs?.[0]
    if (!participant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await payload.update({ collection: 'participants', id, data: { badgesPrintedAt: new Date().toISOString() } })

    return NextResponse.json({ success: true, doc: updated })
  } catch (err: any) {
    console.error('badge error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Badge update failed' }, { status: 500 })
  }
}
