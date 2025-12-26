import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function POST(request: NextRequest) {
  try {
    const { email, password, type } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const payloadClient = await getPayloadClient()

    // Try to authenticate with Payload
    try {
      const result = await payloadClient.login({
        collection: 'users',
        data: {
          email,
          password,
        },
      })

      // Check if user has appropriate role
      // Note: Users collection uses 'role' (singular), not 'roles' (plural)
      const userRole = (result.user as any).role || (result.user as any).roles?.[0]
      
      if (type === 'admin') {
        // Only allow admin role for admin login
        if (userRole !== 'admin') {
          return NextResponse.json(
            { error: 'Access denied. Admin role required.' },
            { status: 403 }
          )
        }
        return NextResponse.json({
          success: true,
          user: {
            id: result.user.id,
            email: result.user.email,
            name: (result.user as any).firstName && (result.user as any).lastName 
              ? `${(result.user as any).firstName} ${(result.user as any).lastName}`
              : (result.user as any).name || result.user.email,
            role: userRole,
          },
          token: result.token,
        })
      }

      if (type === 'participant' || type === 'speaker') {
        // For participants/speakers, check if they have a registration
        // This is a simplified check - you may want to add a separate collection
        return NextResponse.json({
          success: true,
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
          },
          token: result.token,
        })
      }

      return NextResponse.json(
        { error: 'Invalid credentials or insufficient permissions' },
        { status: 403 }
      )
    } catch (authError) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}

