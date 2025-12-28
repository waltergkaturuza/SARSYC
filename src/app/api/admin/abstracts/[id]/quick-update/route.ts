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

    // Get current abstract first to ensure it exists and for hook comparison
    let currentAbstract
    try {
      currentAbstract = await payload.findByID({
        collection: 'abstracts',
        id: params.id,
        overrideAccess: true,
      })
    } catch (findError: any) {
      console.error('Failed to find abstract:', findError)
      return NextResponse.json(
        { error: 'Abstract not found' },
        { status: 404 }
      )
    }

    // Check if status is actually changing
    if (currentAbstract.status === status && (!reviewerComments || currentAbstract.reviewerComments === reviewerComments)) {
      return NextResponse.json({
        success: true,
        message: 'No changes to apply',
        abstract: {
          id: currentAbstract.id,
          status: currentAbstract.status,
          reviewerComments: currentAbstract.reviewerComments,
        },
      })
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
    // The hook will compare previousDoc.status with doc.status
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
    // Enhanced error logging
    console.error('Quick update abstract error:', {
      message: error.message,
      stack: error.stack,
      data: error.data,
      status: error.status,
      statusCode: error.statusCode,
      code: error.code,
      id: params.id,
      body: body,
    })
    
    // Return more detailed error in development
    const errorResponse: any = {
      error: error.message || 'Failed to update abstract',
    }
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = {
        stack: error.stack,
        data: error.data,
        status: error.status,
        statusCode: error.statusCode,
        code: error.code,
      }
    }
    
    return NextResponse.json(
      errorResponse,
      { status: 500 }
    )
  }
}

