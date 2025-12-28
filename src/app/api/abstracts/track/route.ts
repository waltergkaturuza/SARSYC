import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const submissionId = searchParams.get('submissionId')

    if (!email && !submissionId) {
      return NextResponse.json(
        { error: 'Email or Submission ID is required' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()

    // Build where clause
    const where: any = {}
    
    if (submissionId) {
      where.submissionId = { equals: submissionId }
    } else if (email) {
      where['primaryAuthor.email'] = { equals: email }
    }

    const abstracts = await payload.find({
      collection: 'abstracts',
      where,
      sort: '-createdAt',
      depth: 1, // Include related data like abstractFile
    })

    // Format abstracts for public viewing (exclude admin-only fields)
    const formattedAbstracts = abstracts.docs.map((abstract: any) => ({
      id: abstract.id.toString(),
      submissionId: abstract.submissionId || `ABS-${abstract.id}`,
      title: abstract.title,
      abstract: abstract.abstract,
      track: abstract.track,
      presentationType: abstract.presentationType,
      status: abstract.status,
      reviewerComments: abstract.reviewerComments || null, // Include reviewer comments for author
      keywords: abstract.keywords?.map((kw: any) => typeof kw === 'object' ? kw.keyword : kw) || [],
      primaryAuthor: {
        firstName: abstract.primaryAuthor?.firstName || '',
        lastName: abstract.primaryAuthor?.lastName || '',
        email: abstract.primaryAuthor?.email || '',
      },
      coAuthors: abstract.coAuthors?.map((ca: any) => ({
        name: ca.name || '',
        organization: ca.organization || '',
      })) || [],
      submittedDate: abstract.createdAt,
      updatedDate: abstract.updatedAt,
      // Don't include adminNotes - that's admin-only
    }))

    return NextResponse.json({
      success: true,
      abstracts: formattedAbstracts,
    })
  } catch (error: any) {
    console.error('Track abstract error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to retrieve abstract',
      },
      { status: 500 }
    )
  }
}

