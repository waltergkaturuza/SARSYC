import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Emergency password reset endpoint
// WARNING: Remove or secure this endpoint after use!
// Usage: POST /api/admin/reset-password
// Body: { email: "admin@sarsyc.org", password: "newpassword" }
export async function POST(request: NextRequest) {
  try {
    // Optional: Add token check for production
    // const authToken = request.headers.get('x-reset-token')
    // const expectedToken = process.env.PASSWORD_RESET_TOKEN
    // if (authToken !== expectedToken) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    // }

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
          equals: email,
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

    // Update the password using overrideAccess to bypass authentication
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        password: password,
      },
      overrideAccess: true, // Bypass access control
    })

    return NextResponse.json({
      success: true,
      message: `Password successfully reset for ${email}`,
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    )
  }
}

