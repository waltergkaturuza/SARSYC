import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { ensureConferencesSchema } from '@/lib/ensureConferencesSchema'
import { seedPreviousConferencesIfEmpty } from '@/lib/conferencesContent'
import { normalizeConferenceBody, resolveConferenceGallery } from '@/lib/conferenceAdmin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const payload = await getPayloadClient()
    await ensureConferencesSchema(payload)
    await seedPreviousConferencesIfEmpty(payload)

    const results = await payload.find({
      collection: 'conferences',
      limit: 100,
      sort: '-year',
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, docs: results.docs, totalDocs: results.totalDocs })
  } catch (error: any) {
    console.error('List conferences error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list conferences' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    await ensureConferencesSchema(payload)
    const body = await request.json()
    const data = normalizeConferenceBody(body)
    const gallery = await resolveConferenceGallery(payload, body.gallery, data.title)

    const conference = await payload.create({
      collection: 'conferences',
      data: { ...data, gallery },
      overrideAccess: true,
      depth: 1,
    })

    return NextResponse.json({ success: true, doc: conference })
  } catch (error: any) {
    console.error('Create conference error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create conference' },
      { status: 500 },
    )
  }
}
