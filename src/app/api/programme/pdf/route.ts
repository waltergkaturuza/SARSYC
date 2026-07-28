import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { buildProgrammePdfBuffer } from '@/lib/programmePdf'
import { pathFromReferer, recordSiteEvent } from '@/lib/recordSiteEvent'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  try {
    let sessions: any[] = []
    let payload: Awaited<ReturnType<typeof getPayloadClient>> | null = null
    try {
      payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'sessions',
        limit: 1000,
        sort: 'startTime',
        depth: 1,
        overrideAccess: true,
      })
      sessions = result.docs
    } catch (error) {
      console.error('Programme PDF: failed to load sessions, continuing with overview only:', error)
    }

    const pdf = await buildProgrammePdfBuffer(sessions)

    if (payload) {
      await recordSiteEvent(payload, {
        eventType: 'download',
        path: pathFromReferer(request, '/api/programme/pdf'),
        metadata: {
          fileName: 'SARSYC-VI-Programme.pdf',
          source: 'programme-pdf',
          label: 'Programme PDF',
        },
      })
    }

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="SARSYC-VI-Programme.pdf"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      {
        error: error?.message || 'Failed to generate programme PDF',
        details: process.env.NODE_ENV === 'development' ? String(error?.stack || '') : undefined,
      },
      { status: 500 },
    )
  }
}
