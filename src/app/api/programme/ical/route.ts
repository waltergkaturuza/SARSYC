import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper to format dates for iCal
function formatDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    let sessions: any[] = []

    if (sessionId) {
      // Get single session
      const session = await payload.findByID({
        collection: 'sessions',
        id: parseInt(sessionId),
      })
      if (session) sessions = [session]
    } else {
      // Get all sessions
      const result = await payload.find({
        collection: 'sessions',
        limit: 1000,
        sort: 'date',
      })
      sessions = result.docs
    }

    // Generate iCal content
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SARSYC VI//Conference Programme//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:SARSYC VI Conference Programme',
      'X-WR-CALDESC:Southern African Regional Students and Youth Conference',
    ]

    sessions.forEach((session: any) => {
      if (!session.date) return

      const startDate = new Date(session.date)
      const endDate = session.endTime 
        ? new Date(session.endTime)
        : new Date(startDate.getTime() + (session.duration || 60) * 60000)

      lines.push(
        'BEGIN:VEVENT',
        `UID:session-${session.id}@sarsyc.org`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${session.title || 'SARSYC VI Session'}`,
        `DESCRIPTION:${(session.description || '').replace(/\n/g, '\\n').substring(0, 500)}`,
        `LOCATION:${session.venue || 'Windhoek, Namibia'}`,
        `URL:${process.env.NEXT_PUBLIC_SERVER_URL || 'https://sarsyc.org'}/programme`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT'
      )
    })

    lines.push('END:VCALENDAR')

    return new NextResponse(lines.join('\r\n'), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="sarsyc-vi-programme${sessionId ? `-session-${sessionId}` : ''}.ics"`,
      },
    })
  } catch (error: any) {
    console.error('iCal generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate calendar' },
      { status: 500 }
    )
  }
}


