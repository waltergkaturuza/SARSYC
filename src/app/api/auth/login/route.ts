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
    
    // Log the secret being used for debugging
    const { getSecret } = await import('@/lib/getSecret')
    const loginSecret = await getSecret()
    if (process.env.NODE_ENV === 'development') {
      console.log('[Login API] Secret used for login (length:', loginSecret.length + '):', loginSecret.substring(0, 20) + '...')
    }

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
    // NOTE: This is where Payload tries to INSERT into users_sessions table
    console.log('[Login API] Step 4: Calling payload.login() - this will attempt to create session in users_sessions table')
    try {
      const result = await payloadClient.login({
        collection: 'users',
        data: {
          email,
          password,
        },
      })
      console.log('[Login API] ✅ Step 4: payload.login() succeeded - session created successfully')
      
      // Log token info for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('[Login API] Token generated (length:', result.token.length + '):', result.token.substring(0, 50) + '...')
      }

      // Check if user has appropriate role
      // Note: Users collection uses 'role' (singular), not 'roles' (plural)
      const userRole = (result.user as any).role || (result.user as any).roles?.[0]
      
      if (type === 'admin') {
        // Allow admin-panel login for privileged roles
        // (some deployments use 'editor' accounts to access the admin UI)
        const allowedAdminPanelRoles = new Set(['admin', 'editor'])
        if (!allowedAdminPanelRoles.has(String(userRole))) {
          return NextResponse.json(
            { error: 'Access denied. Admin or Editor role required.' },
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
        
        // Set cookie with cross-browser compatible settings
        response.cookies.set('payload-token', result.token, {
          path: '/',
          maxAge: 7 * 24 * 60 * 60, // 7 days
          sameSite: 'lax', // Changed to lax for better cross-browser support
          secure: isProduction, // HTTPS in production
          httpOnly: false, // Allow client-side access
        })
        
        // Also set via Set-Cookie header for Firefox/Edge compatibility
        const cookieValue = encodeURIComponent(result.token)
        const cookieHeader = `payload-token=${cookieValue}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${isProduction ? '; Secure' : ''}`
        response.headers.set('Set-Cookie', cookieHeader)
        
        // Prevent caching
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
        response.headers.set('Pragma', 'no-cache')
        
        console.log('[Login API] Admin login successful, cookie set for:', result.user.email)
        
        return response
      }

      // For all other user types (speaker, presenter, contributor, editor, etc.)
      // Allow login for any authenticated user
      const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
      
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
      
      // Set cookie for all user types
      response.cookies.set('payload-token', result.token, {
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        sameSite: 'lax',
        secure: isProduction,
        httpOnly: false,
      })
      
      // Also set via Set-Cookie header as backup
      const cookieHeader = `payload-token=${result.token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${isProduction ? '; Secure' : ''}`
      response.headers.append('Set-Cookie', cookieHeader)
      
      console.log('[Login API] User login successful, cookie set for:', result.user.email, 'Role:', userRole)
      
      return response
    } catch (authError: any) {
      // Provide more detailed error messages
      const errorMessage = authError?.message || 'Invalid email or password'
      console.error('[Login API] ❌ Step 4: payload.login() FAILED')
      console.error('[Login API] Authentication failed:')
      console.error('[Login API] Error message:', errorMessage)
      console.error('[Login API] Error type:', authError?.name)
      console.error('[Login API] Error code:', authError?.code)
      console.error('[Login API] Error detail:', authError?.detail)
      console.error('[Login API] Error hint:', authError?.hint)
      console.error('[Login API] Error stack:', authError?.stack)
      console.error('[Login API] Attempted email:', email)
      console.error('[Login API] User type:', type)
      
      // Check if it's a database/session error
      const isSessionError = errorMessage?.includes('users_sessions') ||
                            errorMessage?.includes('session') ||
                            errorMessage?.includes('relation') ||
                            errorMessage?.includes('column') ||
                            authError?.code === '42P01' || // Table doesn't exist
                            authError?.code === '42703' || // Column doesn't exist
                            authError?.code === '23505' || // Unique violation
                            authError?.code === '23503'    // Foreign key violation
      
      if (isSessionError) {
        console.error('[Login API] 🔍 DIAGNOSIS: This appears to be a users_sessions table issue!')
        console.error('[Login API] 🔍 The error occurred when Payload tried to INSERT into users_sessions')
        console.error('[Login API] 🔍 Check: Table structure, column names, data types, constraints')
      }
      
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

