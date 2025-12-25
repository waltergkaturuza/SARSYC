import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = await getPayloadClient()

    // Transform keywords from string to array
    const keywords = body.keywords 
      ? body.keywords.split(',').map((k: string) => ({ keyword: k.trim() }))
      : []

    // Create abstract submission
    const abstract = await payload.create({
      collection: 'abstracts',
      data: {
        title: body.title,
        abstract: body.abstract,
        keywords: keywords,
        track: body.track,
        primaryAuthor: body.primaryAuthor,
        coAuthors: body.coAuthors || [],
        presentationType: body.presentationType,
        status: 'received',
      },
    })

    // TODO: Send confirmation email
    console.log('Abstract submitted:', abstract.submissionId)

    return NextResponse.json({
      success: true,
      doc: abstract,
      message: 'Abstract submitted successfully',
    })
  } catch (error: any) {
    console.error('Abstract submission error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Submission failed',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const where: any = {}
    if (status) {
      where.status = { equals: status }
    }

    const abstracts = await payload.find({
      collection: 'abstracts',
      where,
      page,
      limit,
      sort: '-createdAt',
    })

    return NextResponse.json(abstracts)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

