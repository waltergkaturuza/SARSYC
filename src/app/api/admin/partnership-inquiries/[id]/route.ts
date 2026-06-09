import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'
import { isAdminRole } from '@/lib/admin/adminAccess'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const currentUser = await getCurrentUserFromRequest(request)

    if (!currentUser || !isAdminRole(currentUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 },
      )
    }

    const payload = await getPayloadClient()

    await payload.delete({
      collection: 'partnership-inquiries',
      id: params.id,
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      message: 'Partnership inquiry deleted successfully',
    })
  } catch (error: unknown) {
    console.error('[admin/partnership-inquiries DELETE]', error)
    const message = error instanceof Error ? error.message : 'Failed to delete inquiry'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
