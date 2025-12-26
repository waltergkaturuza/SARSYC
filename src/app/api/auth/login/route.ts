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

    // Check if account is locked before attempting login
    try {
      const user = await payloadClient.findByID({
        collection: 'users',
        id: email,
        overrideAccess: true,
      }).catch(() => null)

      // If user not found by ID, try to find by email
      let foundUser = user
      if (!foundUser) {
        const users = await payloadClient.find({
          collection: 'users',
          where: {
            email: {
              equals: email,
            },
          },
          limit: 1,
          overrideAccess: true,
        })
        foundUser = users.docs[0] || null
      }

      // Check if account is locked
      if (foundUser && (foundUser as any).lockUntil) {
        const lockUntil = new Date((foundUser as any).lockUntil)
        if (lockUntil > new Date()) {
          return NextResponse.json(
            { 
              error: `Account is locked due to too many failed login attempts. Please try again after ${lockUntil.toLocaleString()}`,
              locked: true,
              lockUntil: lockUntil.toISOString(),
            },
            { status: 423 } // 423 Locked
          )
        }
      }
    } catch (checkError) {
      // If we can't check the user, continue with login attempt
      // (user might not exist, which will be caught by login)
      console.log('[Login API] Could not check user lock status:', checkError)
    }

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
        
        // Create response with user data
        const response = NextResponse.json({
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
        
        // Set cookie server-side for better reliability
        // Payload expects 'payload-token' cookie name
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
        
        // Method 1: Use Next.js cookies API
        response.cookies.set('payload-token', result.token, {
          path: '/',
          maxAge: 7 * 24 * 60 * 60, // 7 days
          sameSite: 'lax',
          secure: isProduction, // Only send over HTTPS in production
          httpOnly: false, // Allow client-side access for localStorage sync
        })
        
        // Method 2: Also set via Set-Cookie header directly as backup
        // This ensures the cookie is definitely set even if cookies.set() has issues
        const cookieHeader = `payload-token=${result.token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${isProduction ? '; Secure' : ''}`
        response.headers.append('Set-Cookie', cookieHeader)
        
        // Prevent caching
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
        response.headers.set('Pragma', 'no-cache')
        
        console.log('[Login API] Admin login successful, cookie set for:', result.user.email)
        
        return response
      }

      if (type === 'participant' || type === 'speaker') {
        // For participants/speakers, check if they have a registration
        // This is a simplified check - you may want to add a separate collection
        const response = NextResponse.json({
          success: true,
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
          },
          token: result.token,
        })
        
        // Set cookie for participants/speakers too
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
        response.cookies.set('payload-token', result.token, {
          path: '/',
          maxAge: 7 * 24 * 60 * 60, // 7 days
          sameSite: 'lax',
          secure: isProduction,
          httpOnly: false,
        })
        
        return response
      }

      return NextResponse.json(
        { error: 'Invalid credentials or insufficient permissions' },
        { status: 403 }
      )
    } catch (authError: any) {
      // Provide more detailed error messages
      const errorMessage = authError?.message || 'Invalid email or password'
      console.error('[Login API] Authentication failed:')
      console.error('[Login API] Error message:', errorMessage)
      console.error('[Login API] Error type:', authError?.name)
      console.error('[Login API] Error stack:', authError?.stack)
      console.error('[Login API] Attempted email:', email)
      console.error('[Login API] User type:', type)
      
      // Check if it's a locked account error
      if (errorMessage.includes('locked') || errorMessage.includes('Locked')) {
        return NextResponse.json(
          { error: 'Account is locked. Please contact an administrator.' },
          { status: 423 } // 423 Locked
        )
      }
      
      // Check for specific Payload errors
      if (errorMessage.includes('Invalid credentials') || 
          errorMessage.includes('Invalid email') || 
          errorMessage.includes('Invalid password')) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }
      
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

