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
        { error: 'Unauthorized. Admin or Editor access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const assignedReviewers = Array.isArray(body?.assignedReviewers) ? body.assignedReviewers : []

    const payload = await getPayloadClient()
    await payload.update({
      collection: 'abstracts',
      id: params.id,
      data: { assignedReviewers },
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Assign reviewers error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to assign reviewers' },
      { status: 500 }
    )
  }
}
