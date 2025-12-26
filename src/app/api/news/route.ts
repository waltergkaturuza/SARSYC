import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

        const where: any = {
          status: { equals: 'published' }
        }
        
        if (category && category !== 'all') {
          // Support both 'category' field and category as part of categories array
          where.or = [
            { category: { equals: category } },
            { categories: { contains: category } },
          ]
        }
    
    if (featured === 'true') {
      where.featured = { equals: true }
    }

    const news = await payload.find({
      collection: 'news',
      where,
      page,
      limit,
      sort: '-publishedDate',
    })

    return NextResponse.json(news)
  } catch (error: any) {
    console.error('News fetch error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

