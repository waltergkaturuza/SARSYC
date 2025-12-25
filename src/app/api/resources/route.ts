import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const year = searchParams.get('year')
    const topic = searchParams.get('topic')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (type && type !== 'all') {
      where.type = { equals: type }
    }
    
    if (year && year !== 'all') {
      where.year = { equals: parseInt(year) }
    }
    
    if (topic) {
      where.topics = { contains: topic }
    }
    
    if (search) {
      where.or = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const resources = await payload.find({
      collection: 'resources',
      where,
      page,
      limit,
      sort: '-year',
    })

    return NextResponse.json(resources)
  } catch (error: any) {
    console.error('Resources fetch error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Track downloads
export async function PATCH(request: NextRequest) {
  try {
    const { id } = await request.json()
    const payload = await getPayloadClient()

    // Increment download count
    const resource = await payload.findByID({
      collection: 'resources',
      id,
    })

    await payload.update({
      collection: 'resources',
      id,
      data: {
        downloads: (resource.downloads || 0) + 1,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

