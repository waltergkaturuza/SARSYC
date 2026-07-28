import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { buildProgrammePdfBuffer } from '@/lib/programmePdf'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET() {
  try {
    const payload = await getPayloadClient()

    let sessions: any[] = []
    try {
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
      { error: error.message || 'Failed to generate programme PDF' },
      { status: 500 },
    )
  }
}
