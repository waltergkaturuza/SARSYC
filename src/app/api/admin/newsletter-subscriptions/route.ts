import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    
    const results = await payload.find({
      collection: 'newsletter-subscriptions',
      limit: 1000,
      sort: '-subscribedAt',
      overrideAccess: true,
    })

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Error fetching newsletter subscriptions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}
