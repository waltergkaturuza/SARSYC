import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { ensureConferencesSchema } from '@/lib/ensureConferencesSchema'
import { ensureLockedDocsRelsColumns } from '@/lib/ensureLockedDocsRelsColumns'
import { normalizeConferenceBody, resolveConferenceGallery } from '@/lib/conferenceAdmin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const payload = await getPayloadClient()
    await ensureConferencesSchema(payload)
    await ensureLockedDocsRelsColumns(payload)
    const body = await request.json()
    const data = normalizeConferenceBody(body)
    const gallery = await resolveConferenceGallery(payload, body.gallery, data.title)

    const conference = await payload.update({
      collection: 'conferences',
      id: params.id,
      data: { ...data, gallery },
      overrideAccess: true,
      depth: 1,
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
