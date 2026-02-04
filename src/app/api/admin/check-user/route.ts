import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Check user role by email
 * Usage: GET /api/admin/check-user?email=admin@sarsyc.org
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
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
      overrideAccess: true,
    })

    if (result.totalDocs === 0) {
      return NextResponse.json(
        { 
          found: false,
          error: `User with email "${email}" not found in database` 
        },
        { status: 404 }
      )
    }

    const user = result.docs[0]

    // Return user info
    return NextResponse.json({
      found: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: (user as any).firstName || null,
        lastName: (user as any).lastName || null,
        role: (user as any).role || null,
        organization: (user as any).organization || null,
        lockUntil: (user as any).lockUntil || null,
        resetPasswordToken: (user as any).resetPasswordToken ? '***SET***' : null,
        resetPasswordExpiration: (user as any).resetPasswordExpiration || null,
        createdAt: (user as any).createdAt || null,
        updatedAt: (user as any).updatedAt || null,
      },
    })
  } catch (error: any) {
    console.error('Check user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check user' },
      { status: 500 }
    )
  }
}
