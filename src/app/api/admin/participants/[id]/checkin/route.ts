import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'

export async function POST(req: Request) {
  try {
    const params = new URL(req.url).pathname.split('/')
    const id = params[params.length - 3] // /api/admin/participants/[id]/checkin
    const body = await req.json()
    const { checkedIn } = body

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

    const updateData: any = { checkedIn: !!checkedIn }
    if (checkedIn) {
      // Set checkedInAt if being checked in and it's not already set
      if (!participant.checkedInAt) updateData.checkedInAt = new Date().toISOString()
    }

    const updated = await payload.update({ collection: 'participants', id, data: updateData })

    return NextResponse.json({ success: true, doc: updated })
  } catch (err: any) {
    console.error('checkin error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Check-in failed' }, { status: 500 })
  }
}
