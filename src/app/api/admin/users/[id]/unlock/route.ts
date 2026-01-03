import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Unlock user account
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
    
    // Get current user to check lock status
    const user = await payload.findByID({
      collection: 'users',
      id: params.id,
      overrideAccess: true,
    })

    // Check if account is actually locked
    const isLocked = user.lockUntil && new Date(user.lockUntil as string) > new Date()
    
    if (!isLocked) {
      return NextResponse.json({
        success: true,
        message: 'Account is not locked',
        wasLocked: false,
      })
    }

    // Unlock the account by clearing lockUntil and resetting loginAttempts
    const updatedUser = await payload.update({
      collection: 'users',
      id: params.id,
      data: {
        lockUntil: null,
        loginAttempts: 0,
      },
      overrideAccess: true,
    })

    // Remove sensitive fields
    const { hash, salt, resetPasswordToken, resetPasswordExpiration, ...safeUser } = updatedUser as any

    return NextResponse.json({
      success: true,
      doc: safeUser,
      message: 'Account unlocked successfully',
      wasLocked: true,
    })
  } catch (error: any) {
    console.error('Unlock user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to unlock user account' },
      { status: 500 }
    )
  }
}



