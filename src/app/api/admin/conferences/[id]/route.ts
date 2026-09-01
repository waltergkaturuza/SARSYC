import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { ensureConferencesSchema } from '@/lib/ensureConferencesSchema'
import { ensureLockedDocsRelsColumns } from '@/lib/ensureLockedDocsRelsColumns'
import {
  normalizeConferenceBody,
  resolveConferenceGallery,
  syncConferenceGallery,
} from '@/lib/conferenceAdmin'

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

    // Update scalar/array fields without gallery — Payload upload validation rejects
    // string media IDs and can fail on custom gallery table writes.
    const conference = await payload.update({
      collection: 'conferences',
      id: params.id,
      data,
      overrideAccess: true,
      depth: 0,
    })

    await syncConferenceGallery(payload, conference.id, gallery)

    const full = await payload.findByID({
      collection: 'conferences',
      id: conference.id,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, doc: full })
  } catch (error: any) {
    console.error('Update conference error:', {
      message: error.message,
      data: error.data,
      errors: error.errors || error.data?.errors,
      stack: error.stack,
    })

    const validationErrors = error.data?.errors || error.errors
    const validationMessage = Array.isArray(validationErrors)
      ? validationErrors
          .map((e: any) => e.message || e.label || JSON.stringify(e))
          .filter(Boolean)
          .join('; ')
      : null

    return NextResponse.json(
      {
        error: validationMessage || error.message || 'Failed to update conference',
        validationErrors: validationErrors || undefined,
      },
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
