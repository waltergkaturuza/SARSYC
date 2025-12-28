import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayloadClient()
    const body = await request.json()
    
    const { status, reviewerComments } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status value
    const validStatuses = ['received', 'under-review', 'revisions', 'accepted', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Update data - only update status and reviewerComments
    const updateData: any = {
      status,
    }
    
    // Include reviewer comments if provided
    if (reviewerComments !== undefined) {
      updateData.reviewerComments = reviewerComments || null
    }

    // Update abstract with overrideAccess to ensure admin can update
    // This will trigger the email hook automatically
    const updatedAbstract = await payload.update({
      collection: 'abstracts',
      id: params.id,
      data: updateData,
      overrideAccess: true, // Ensure admin can update even if access control blocks it
    })

    return NextResponse.json({
      success: true,
      abstract: {
        id: updatedAbstract.id,
        status: updatedAbstract.status,
        reviewerComments: updatedAbstract.reviewerComments,
      },
    })
  } catch (error: any) {
    console.error('Quick update abstract error:', {
      message: error.message,
      stack: error.stack,
      data: error.data,
      status: error.status,
      id: params.id,
    })
    return NextResponse.json(
      { 
        error: error.message || 'Failed to update abstract',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

