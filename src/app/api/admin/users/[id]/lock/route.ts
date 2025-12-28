import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Lock user account (for testing purposes)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUserFromRequest(request)
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const payload = await getPayloadClient()
    
    // Lock the account by setting lockUntil to 1 hour from now
    const lockUntil = new Date()
    lockUntil.setHours(lockUntil.getHours() + 1)

    const updatedUser = await payload.update({
      collection: 'users',
      id: params.id,
      data: {
        lockUntil: lockUntil.toISOString(),
        loginAttempts: 5, // Set to indicate failed attempts
      },
      overrideAccess: true,
    })

    // Remove sensitive fields
    const { hash, salt, resetPasswordToken, resetPasswordExpiration, ...safeUser } = updatedUser as any

    return NextResponse.json({
      success: true,
      doc: safeUser,
      message: 'Account locked successfully (for testing)',
      lockUntil: lockUntil.toISOString(),
    })
  } catch (error: any) {
    console.error('Lock user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to lock user account' },
      { status: 500 }
    )
  }
}

