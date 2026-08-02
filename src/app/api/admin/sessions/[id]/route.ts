import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { plainTextToSlate } from '@/lib/newsContent'
import { ensureSessionsLatestColumns } from '@/lib/ensureSessionsSchema'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function toIdNumbers(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => Number(entry))
    .filter((id) => Number.isFinite(id) && id > 0)
}

function normalizeStatus(value: unknown): 'draft' | 'published' | 'archived' | null {
  if (value === 'draft' || value === 'published' || value === 'archived') return value
  return null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayloadClient()
    await ensureSessionsLatestColumns(payload)
    const body = await request.json()
    const status = normalizeStatus(body.status)

    // Quick publish / unpublish from the admin list or detail page.
    if (body.statusOnly) {
      if (!status) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      const session = await payload.update({
        collection: 'sessions',
        id: params.id,
        data: { status },
        overrideAccess: true,
      })
      return NextResponse.json({ success: true, doc: session })
    }

    const session = await payload.update({
      collection: 'sessions',
      id: params.id,
      overrideAccess: true,
      data: {
        title: body.title,
        description:
          typeof body.description === 'string'
            ? plainTextToSlate(body.description)
            : body.description,
        type: body.type,
        day: body.day || 'day-1',
        track: body.track || null,
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
        venue: body.venue,
        capacity: body.capacity || null,
        speakers: toIdNumbers(body.speakers),
        committeeMembers: toIdNumbers(body.committeeMembers),
        speakerNames: body.speakerNames || '',
        moderator: body.moderator ? Number(body.moderator) : null,
        committeeModerator: body.committeeModerator ? Number(body.committeeModerator) : null,
        presentations: toIdNumbers(body.presentations),
        requiresRegistration: body.requiresRegistration || false,
        ...(status ? { status } : {}),
      },
    })

    return NextResponse.json({ success: true, doc: session })
  } catch (error: any) {
    console.error('Update session error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update session' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayloadClient()

    await payload.delete({
      collection: 'sessions',
      id: params.id,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete session error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete session' },
      { status: 500 }
    )
  }
}
