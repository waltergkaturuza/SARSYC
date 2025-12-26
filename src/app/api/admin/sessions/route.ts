import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const body = await request.json()
    
    // Create session
    const session = await payload.create({
      collection: 'sessions',
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        track: body.track || undefined,
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
        venue: body.venue,
        capacity: body.capacity || undefined,
        speakers: body.speakers || [],
        moderator: body.moderator || undefined,
        presentations: body.presentations || [],
        requiresRegistration: body.requiresRegistration || false,
        materials: body.materials || [],
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

