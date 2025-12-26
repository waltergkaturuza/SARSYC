import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Simple PDF generation using HTML-to-PDF approach
// For production, consider using puppeteer or a PDF library
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    
    const sessions = await payload.find({
      collection: 'sessions',
      limit: 1000,
      sort: 'date',
    })

    // Group sessions by day
    const sessionsByDay: { [key: string]: any[] } = {}
    sessions.docs.forEach((session: any) => {
      if (session.date) {
        const date = new Date(session.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
        if (!sessionsByDay[date]) {
          sessionsByDay[date] = []
        }
        sessionsByDay[date].push(session)
      }
    })

    // Generate HTML content
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SARSYC VI Programme Schedule</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #0ea5e9; }
    h2 { color: #333; margin-top: 30px; }
    .session { margin-bottom: 15px; padding: 10px; border-left: 3px solid #0ea5e9; }
    .session-title { font-weight: bold; font-size: 14px; }
    .session-meta { font-size: 12px; color: #666; margin-top: 5px; }
    .session-time { font-weight: bold; }
  </style>
</head>
<body>
  <h1>SARSYC VI Programme Schedule</h1>
  <p><strong>Conference:</strong> The 6th Southern African Regional Students and Youth Conference</p>
  <p><strong>Dates:</strong> August 5-7, 2026</p>
  <p><strong>Location:</strong> Windhoek, Namibia</p>
  <p><strong>Theme:</strong> Align for Action: Sustaining Progress in Youth Health and Education</p>
  <hr>
  
  ${Object.entries(sessionsByDay).map(([date, daySessions]) => `
    <h2>${date}</h2>
    ${daySessions.map((session: any) => `
      <div class="session">
        <div class="session-title">${session.title || 'TBA'}</div>
        <div class="session-meta">
          <span class="session-time">${session.time || ''}</span>
          ${session.venue ? ` | ${session.venue}` : ''}
          ${session.track ? ` | Track: ${session.track}` : ''}
        </div>
      </div>
    `).join('')}
  `).join('')}
  
  <hr>
  <p style="font-size: 12px; color: #666; text-align: center;">
    Generated on ${new Date().toLocaleDateString()}<br>
    For the latest updates, visit: ${process.env.NEXT_PUBLIC_SERVER_URL || 'https://sarsyc.org'}/programme
  </p>
</body>
</html>
    `.trim()

    // Return HTML (can be converted to PDF using browser print or server-side tool)
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'inline; filename="sarsyc-vi-programme.html"',
      },
    })
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate programme' },
      { status: 500 }
    )
  }
}



