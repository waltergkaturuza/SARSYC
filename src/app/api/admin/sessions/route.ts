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

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    await ensureSessionsLatestColumns(payload)
    const body = await request.json()

    const session = await payload.create({
      collection: 'sessions',
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
        presentations: toIdNumbers(body.presentations),
        requiresRegistration: body.requiresRegistration || false,
      },
    })

    return NextResponse.json({ success: true, doc: session })
  } catch (error: any) {
    console.error('Create session error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 500 }
    )
  }
}
