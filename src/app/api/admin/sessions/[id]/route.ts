import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayloadClient()
    const body = await request.json()
    
    // Update session
    const session = await payload.update({
      collection: 'sessions',
      id: params.id,
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

