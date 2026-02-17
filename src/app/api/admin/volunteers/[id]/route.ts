import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUserFromRequest(request)

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'editor')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin or Editor access required to update volunteers.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const payload = await getPayloadClient()

    const updateData: any = {}

    if (typeof body.status === 'string' && body.status.trim().length > 0) {
      updateData.status = body.status.trim()
    }

    if (typeof body.adminNotes === 'string') {
      updateData.adminNotes = body.adminNotes.trim() || null
    }

    if (typeof body.reviewerComments === 'string') {
      updateData.reviewerComments = body.reviewerComments.trim() || null
    }

    if (typeof body.interviewDate === 'string') {
      updateData.interviewDate = body.interviewDate.trim() || null
    }

    if (typeof body.interviewNotes === 'string') {
      updateData.interviewNotes = body.interviewNotes.trim() || null
    }

    if (body.assignedReviewerId !== undefined && body.assignedReviewerId !== null) {
      const idNum = Number(body.assignedReviewerId)
      updateData.assignedReviewer = Number.isFinite(idNum) && idNum > 0 ? idNum : null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update.' },
        { status: 400 }
      )
    }

    const updated = await payload.update({
      collection: 'volunteers',
      id: params.id,
      data: updateData,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, doc: updated })
  } catch (error: any) {
    console.error('[Volunteer Admin Update] Error:', {
      message: error.message,
      data: error.data,
      errors: error.data?.errors,
      stack: error.stack,
    })

    let errorMessage = error.message || 'Failed to update volunteer'

    if (error.data?.errors) {
      if (Array.isArray(error.data.errors)) {
        errorMessage = error.data.errors
          .map((err: any, index: number) => `${index}: ${err.message || err}`)
          .join(', ')
      } else if (typeof error.data.errors === 'object') {
        errorMessage = Object.entries(error.data.errors)
          .map(([field, err]: [string, any]) => {
            if (typeof err === 'object' && err.message) {
              return `${field}: ${err.message}`
            }
            return `${field}: ${err}`
          })
          .join(', ')
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

