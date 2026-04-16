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
    // Payload validates the full document; legacy abstracts may lack primaryAuthor.age/gender/institution.
    const doc = await payload.findByID({
      collection: 'abstracts',
      id: params.id,
      depth: 0,
      overrideAccess: true,
    })
    const pa = (doc as any)?.primaryAuthor && typeof (doc as any).primaryAuthor === 'object'
      ? { ...(doc as any).primaryAuthor }
      : {}
    const org = typeof pa.organization === 'string' ? pa.organization.trim() : ''
    const inst = typeof pa.institution === 'string' ? pa.institution.trim() : ''
    const primaryAuthor = {
      ...pa,
      ...(pa.age == null || pa.age === '' ? { age: 18 } : { age: Number(pa.age) }),
      ...(!pa.gender ? { gender: 'prefer-not-to-say' } : {}),
      ...(!inst ? { institution: org || 'Not specified' } : {}),
    }

    await payload.update({
      collection: 'abstracts',
      id: params.id,
      data: { assignedReviewers, primaryAuthor },
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
