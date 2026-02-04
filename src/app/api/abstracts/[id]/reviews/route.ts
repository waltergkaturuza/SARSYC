import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['admin', 'reviewer'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payload = await getPayloadClient()
    const data = await request.json()
    const abstractId = params.id

    const reviewerId = typeof user.id === 'object' ? user.id.toString() : user.id

    // Ensure reviewer is assigned to the abstract (unless admin)
    if (user.role === 'reviewer') {
      const abstract = await payload.findByID({
        collection: 'abstracts',
        id: abstractId,
        depth: 0,
        overrideAccess: true,
      })

      const assigned = Array.isArray(abstract.assignedReviewers) ? abstract.assignedReviewers : []
      const assignedIds = assigned.map((r: any) =>
        typeof r === 'object' ? r.id?.toString() : r?.toString()
      )

      if (!assignedIds.includes(reviewerId)) {
        return NextResponse.json(
          { error: 'You are not assigned to review this abstract.' },
          { status: 403 }
        )
      }
    }

    const score = Number(data.score ?? 0)
    if (Number.isNaN(score) || score < 0 || score > 100) {
      return NextResponse.json(
        { error: 'Score must be between 0 and 100.' },
        { status: 400 }
      )
    }

    const recommendation = data.recommendation || 'accept'
    const comments = data.comments || ''
    const confidence = data.confidence || null

    // Check for existing review
    const existing = await payload.find({
      collection: 'abstract-reviews',
      where: {
        and: [
          { abstract: { equals: abstractId } },
          { reviewer: { equals: reviewerId } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    let review
    if (existing.totalDocs > 0) {
      review = await payload.update({
        collection: 'abstract-reviews',
        id: existing.docs[0].id,
        data: {
          score,
          recommendation,
          comments,
          confidence,
        },
        overrideAccess: true,
      })
    } else {
      review = await payload.create({
        collection: 'abstract-reviews',
        data: {
          abstract: abstractId,
          reviewer: reviewerId,
          score,
          recommendation,
          comments,
          confidence,
        },
        overrideAccess: true,
      })
    }

    // When a review is submitted, ensure abstract status at least 'under-review'
    if (user.role === 'reviewer') {
      try {
        await payload.update({
          collection: 'abstracts',
          id: abstractId,
          data: {
            status: 'under-review',
          },
          overrideAccess: true,
        })
      } catch (statusError) {
        console.warn('Unable to update abstract status after review submission:', statusError)
      }
    }

    return NextResponse.json({ success: true, review })
  } catch (error: any) {
    console.error('Submit review error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit review' },
      { status: 500 }
    )
  }
}
