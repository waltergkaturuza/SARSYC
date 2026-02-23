import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/analytics/track
 * Receives page views and custom events from the frontend.
 * Body: { type: 'pageview' | 'event', path?, referrer?, sessionId, eventType?, metadata? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const { type, path, referrer, sessionId, eventType, metadata } = body

    // Validate sessionId - required for both types
    const sid = typeof sessionId === 'string' ? sessionId.trim() : ''
    if (!sid || sid.length < 8) {
      return NextResponse.json({ error: 'Valid sessionId required' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    if (type === 'pageview') {
      const pagePath = typeof path === 'string' ? path.trim() : ''
      if (!pagePath || pagePath.length > 500) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
      }

      await payload.create({
        collection: 'page-views',
        data: {
          path: pagePath,
          referrer: typeof referrer === 'string' ? referrer.trim().substring(0, 500) : undefined,
          sessionId: sid,
        },
        overrideAccess: true,
      })

      return NextResponse.json({ ok: true })
    }

    if (type === 'event') {
      const evType = typeof eventType === 'string' ? eventType.trim() : ''
      if (!evType || evType.length > 100) {
        return NextResponse.json({ error: 'Invalid eventType' }, { status: 400 })
      }

      await payload.create({
        collection: 'site-events',
        data: {
          eventType: evType,
          path: typeof path === 'string' ? path.trim().substring(0, 500) : undefined,
          sessionId: sid,
          metadata: metadata && typeof metadata === 'object' ? metadata : undefined,
        },
        overrideAccess: true,
      })

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error: any) {
    console.error('[Analytics track] Error:', error?.message || error)
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 })
  }
}
