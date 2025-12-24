import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function POST(req: Request) {
  try {
    const params = new URL(req.url).pathname.split('/')
    const id = params[params.length - 3] // /api/admin/participants/[id]/badge

    const adminId = req.headers.get('x-admin-user-id')
    if (!adminId) return NextResponse.json({ error: 'Missing admin header' }, { status: 401 })

    const payload = await getPayloadClient()
    const userRes = await payload.find({ collection: 'users', where: { id: { equals: adminId } } })
    const acting = userRes?.docs?.[0]
    if (!acting || !['admin', 'super-admin'].includes(acting.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

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
