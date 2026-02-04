import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// TEMPORARY ONE-TIME PASSWORD RESET
// DELETE THIS FILE AFTER USE!
// Usage: POST /api/admin/temp-reset
// Body: { email: "admin@sarsyc.org", password: "Admin@1234" }
export async function POST(request: NextRequest) {
  try {
    // Simple one-time check - remove this file after use!
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
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

    if (result.totalDocs === 0) {
      return NextResponse.json(
        { error: `User with email "${email}" not found` },
        { status: 404 }
      )
    }

    const user = result.docs[0]

    // Update the password
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        password: password,
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      message: `Password successfully reset for ${email}. Please delete this endpoint file after use!`,
    })
  } catch (error: any) {
    console.error('Temp reset password error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    )
  }
}
