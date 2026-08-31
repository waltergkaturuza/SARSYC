import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { ensureConferencesSchema } from '@/lib/ensureConferencesSchema'
import { seedPreviousConferencesIfEmpty } from '@/lib/conferencesContent'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function normalizePayload(body: any) {
  return {
    title: body.title,
    slug: body.slug,
    year: Number(body.year),
    location: body.location,
    theme: body.theme || null,
    summary: body.summary,
    participants: body.participants || null,
    highlights: body.highlights || null,
    content: body.content || null,
    startDate: body.startDate || null,
    endDate: body.endDate || null,
    isCurrent: Boolean(body.isCurrent),
    currentPath: body.currentPath || null,
    status: body.status === 'draft' || body.status === 'archived' ? body.status : 'published',
    keyOutcomes: Array.isArray(body.keyOutcomes) ? body.keyOutcomes : [],
    relatedLinks: Array.isArray(body.relatedLinks) ? body.relatedLinks : [],
  }
}

export async function GET() {
  try {
    const payload = await getPayloadClient()
    await ensureConferencesSchema(payload)
    await seedPreviousConferencesIfEmpty(payload)

    const results = await payload.find({
      collection: 'conferences',
      limit: 100,
      sort: '-year',
      depth: 0,
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
    const data = normalizePayload(body)

    const conference = await payload.create({
      collection: 'conferences',
      data,
      overrideAccess: true,
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
