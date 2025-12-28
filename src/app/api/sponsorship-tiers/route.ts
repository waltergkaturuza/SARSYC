import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/sponsorship-tiers
 * Returns all active sponsorship tiers, sorted by order
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()

    const result = await payload.find({
      collection: 'sponsorship-tiers',
      where: {
        isActive: {
          equals: true,
        },
      },
      sort: 'order',
      limit: 100,
    })

    return NextResponse.json({
      success: true,
      tiers: result.docs,
    })
  } catch (error: any) {
    console.error('Error fetching sponsorship tiers:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch sponsorship tiers',
        tiers: [],
      },
      { status: 500 }
    )
  }
}



