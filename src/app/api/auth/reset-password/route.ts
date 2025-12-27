import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Reset Password API
 * Validates reset token and updates password
 */
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()

    // Find user with matching reset token
    const result = await payload.find({
      collection: 'users',
      where: {
        resetPasswordToken: {
          equals: token,
        },
      },
      limit: 1,
      depth: 0,
    })

    if (result.totalDocs === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    const user = result.docs[0]

    // Check if token is expired
    if (user.resetPasswordExpiration) {
      const expiryDate = new Date(user.resetPasswordExpiration)
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { success: false, error: 'Reset token has expired. Please request a new one.' },
          { status: 400 }
        )
      }
    }

    // Update password and clear reset token
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        password: password,
        resetPasswordToken: null,
        resetPasswordExpiration: null,
        loginAttempts: 0, // Reset login attempts
        lockUntil: null, // Unlock account if locked
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to reset password. Please try again.',
      },
      { status: 500 }
    )
  }
}

