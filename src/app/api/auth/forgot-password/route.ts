import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Forgot Password API
 * Generates a secure reset token and sends it via email
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()

    // Find the user
    const result = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email.toLowerCase().trim(),
        },
      },
      limit: 1,
      depth: 0,
    })

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (result.totalDocs === 0) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      })
    }

    const user = result.docs[0]

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date()
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1) // Token valid for 1 hour

    // Store reset token in user record
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiration: resetTokenExpiry.toISOString(),
      },
      overrideAccess: true,
    })

    // Generate reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    // TODO: Send email with reset link
    // This requires email adapter configuration
    // await sendMail({
    //   to: email,
    //   subject: 'Reset Your SARSYC VI Password',
    //   html: `...`,
    // })

    // For now, log the reset URL in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Password Reset] Reset URL for', email, ':', resetUrl)
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      // In development, include the reset URL for testing
      ...(process.env.NODE_ENV === 'development' && {
        resetUrl, // Only in dev for testing
      }),
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    })
  }
}



