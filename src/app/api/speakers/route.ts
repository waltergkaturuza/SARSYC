import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const featured = searchParams.get('featured')

    const where: any = {}
    
    if (type && type !== 'all') {
      where.type = { contains: type }
    }
    
    if (featured === 'true') {
      where.featured = { equals: true }
    }

    const speakers = await payload.find({
      collection: 'speakers',
      where,
      page,
      limit,
      sort: '-createdAt',
      depth: 2, // Populate photo relationship fully
      overrideAccess: true, // Ensure all speakers are fetched regardless of access control
    })

    // Log for debugging
    console.log(`✅ API: Fetched ${speakers.docs.length} speakers`)
    speakers.docs.forEach((speaker: any) => {
      if (!speaker.photo || (typeof speaker.photo === 'object' && !speaker.photo.url && !speaker.photo.sizes)) {
        console.warn(`⚠️  API: Speaker ${speaker.id} (${speaker.name}) has missing or unpopulated photo`)
      }
    })

    return NextResponse.json(speakers)
  } catch (error: any) {
    console.error('Speakers fetch error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

