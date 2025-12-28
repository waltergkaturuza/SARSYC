import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/venue-locations
 * Returns all active venue locations, optionally filtered by conference edition
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const edition = searchParams.get('edition')
    const current = searchParams.get('current') === 'true'

    const payload = await getPayloadClient()

    const where: any = {
      isActive: {
        equals: true,
      },
    }

    if (edition) {
      where.conferenceEdition = {
        contains: edition,
      }
    }

    if (current) {
      where.isCurrent = {
        equals: true,
      }
    }

    const venues = await payload.find({
      collection: 'venue-locations',
      where,
      sort: '-isCurrent',
      depth: 0,
    })

    return NextResponse.json({
      success: true,
      venues: venues.docs,
    })
  } catch (error: any) {
    console.error('Error fetching venue locations:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch venue locations' },
      { status: 500 }
    )
  }
}


