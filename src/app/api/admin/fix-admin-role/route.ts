import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Emergency endpoint to fix admin@sarsyc.org role
 * This should be removed after fixing the role
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    
    // Find the admin@sarsyc.org user
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'admin@sarsyc.org',
        },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (users.docs.length === 0) {
      return NextResponse.json(
        { error: 'User admin@sarsyc.org not found' },
        { status: 404 }
      )
    }

    const user = users.docs[0]
    console.log('📋 Current user:', {
      email: user.email,
      role: user.role,
      id: user.id,
    })

    // Check if role is already admin
    if (user.role === 'admin') {
      return NextResponse.json({
        message: 'User is already an admin',
        user: {
          email: user.email,
          role: user.role,
          id: user.id,
        },
      })
    }

    // Update the role to admin
    const updated = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        role: 'admin',
      },
      overrideAccess: true,
    })

    console.log('✅ Role updated:', {
      email: updated.email,
      role: updated.role,
      id: updated.id,
    })

    return NextResponse.json({
      message: 'Successfully updated role to admin',
      before: user.role,
      after: updated.role,
      user: {
        email: updated.email,
        role: updated.role,
        id: updated.id,
      },
    })
  } catch (error: any) {
    console.error('Fix admin role error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update role' },
      { status: 500 }
    )
  }
}
