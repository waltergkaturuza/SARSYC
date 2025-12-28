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

    // Get current abstract to preserve other fields
    const currentAbstract = await payload.findByID({
      collection: 'abstracts',
      id: params.id,
    })

    // Update data
    const updateData: any = {
      status,
    }
    
    // Include reviewer comments if provided
    if (reviewerComments !== undefined) {
      updateData.reviewerComments = reviewerComments || null
    }

    // Update abstract (this will trigger the email hook)
    const updatedAbstract = await payload.update({
      collection: 'abstracts',
      id: params.id,
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      abstract: updatedAbstract,
    })
  } catch (error: any) {
    console.error('Quick update abstract error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update abstract' },
      { status: 500 }
    )
  }
}

