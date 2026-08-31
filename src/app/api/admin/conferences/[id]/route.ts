import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { ensureConferencesSchema } from '@/lib/ensureConferencesSchema'

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const payload = await getPayloadClient()
    await ensureConferencesSchema(payload)
    const body = await request.json()
    const data = normalizePayload(body)

    const conference = await payload.update({
      collection: 'conferences',
      id: params.id,
      data,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, doc: conference })
  } catch (error: any) {
    console.error('Update conference error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update conference' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const payload = await getPayloadClient()
    await ensureConferencesSchema(payload)

    await payload.delete({
      collection: 'conferences',
      id: params.id,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete conference error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete conference' },
      { status: 500 },
    )
  }
}
