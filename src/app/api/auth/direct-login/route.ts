import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { getProcessedSecret } from '@/lib/getSecret'

/**
 * Direct Database Authentication Bypass
 * 
 * This endpoint bypasses Payload's login() method and authenticates directly
 * against the database. Useful for debugging authentication issues.
 * 
 * WARNING: This is a diagnostic endpoint. Remove or secure it after fixing auth.
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('[Direct Login] Starting direct database authentication for:', email)

    // Step 1: Get Payload client (but we won't use its login method)
    const payload = await getPayloadClient()

    // Step 2: Query user directly from database
    console.log('[Direct Login] Step 1: Querying user from database...')
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email.toLowerCase().trim(),
        },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (!users.docs || users.docs.length === 0) {
      console.log('[Direct Login] ❌ User not found:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users.docs[0] as any
    console.log('[Direct Login] ✅ User found:', user.id, user.email, 'Role:', user.role)

    // Step 3: Check if account is locked
    if (user.lockUntil) {
      const lockUntil = new Date(user.lockUntil)
      if (lockUntil > new Date()) {
        console.log('[Direct Login] ❌ Account locked until:', lockUntil)
        return NextResponse.json(
          { 
            error: `Account is locked. Try again after ${lockUntil.toLocaleString()}`,
            locked: true,
            lockUntil: lockUntil.toISOString(),
          },
          { status: 423 }
        )
      }
    }

    // Step 4: Verify password directly using bcrypt
    console.log('[Direct Login] Step 2: Verifying password hash...')
    if (!user.hash) {
      console.log('[Direct Login] ❌ User has no password hash!')
      return NextResponse.json(
        { error: 'User account has no password set' },
        { status: 401 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.hash)
    if (!passwordMatch) {
      console.log('[Direct Login] ❌ Password mismatch')
      // Increment login attempts
      try {
        const currentAttempts = (user.loginAttempts || 0) + 1
        await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            loginAttempts: currentAttempts,
            lockUntil: currentAttempts >= 5 ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : null,
          },
          overrideAccess: true,
        })
      } catch (updateError) {
        console.error('[Direct Login] Failed to update login attempts:', updateError)
      }
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('[Direct Login] ✅ Password verified successfully')

    // Step 5: Reset login attempts on successful login
    try {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          loginAttempts: 0,
          lockUntil: null,
        },
        overrideAccess: true,
      })
    } catch (updateError) {
      console.error('[Direct Login] Failed to reset login attempts:', updateError)
      // Don't fail login if this fails
    }

    // Step 6: Generate JWT token manually (bypassing Payload's session creation)
    console.log('[Direct Login] Step 3: Generating JWT token...')
    const processedSecret = await getProcessedSecret()
    if (!processedSecret) {
      console.error('[Direct Login] ❌ PAYLOAD_SECRET not found')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Create JWT payload (matching Payload's format)
    const tokenPayload = {
      id: user.id.toString(),
      email: user.email,
      collection: 'users',
    }

    const token = jwt.sign(tokenPayload, processedSecret, {
      expiresIn: '7d', // Match Payload's default
    })

    console.log('[Direct Login] ✅ Token generated (length:', token.length + ')')

    // Step 7: Try to create session in users_sessions (but don't fail if it doesn't work)
    console.log('[Direct Login] Step 4: Attempting to create session in users_sessions...')
    try {
      // Generate a session ID
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

      // Try to insert session directly using raw SQL-like approach
      // Note: We can't do raw SQL easily, so we'll skip this for now
      // The token will still work even without a session record
      console.log('[Direct Login] ⚠️  Skipping session creation (not critical for JWT auth)')
    } catch (sessionError: any) {
      console.error('[Direct Login] ⚠️  Failed to create session (non-critical):', sessionError.message)
      // Don't fail login if session creation fails - JWT tokens work without sessions
    }

    // Step 8: Create response with token
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
    
    const response = NextResponse.json({
      success: true,
      method: 'direct-database-auth',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token: token,
    })

    // Set cookie
    response.cookies.set('payload-token', token, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: 'lax',
      secure: isProduction,
      httpOnly: false,
    })

    console.log('[Direct Login] ✅ Direct authentication successful for:', user.email)
    
    return response

  } catch (error: any) {
    console.error('[Direct Login] ❌ Error:', error)
    console.error('[Direct Login] Error stack:', error.stack)
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        details: error.message,
        method: 'direct-database-auth',
      },
      { status: 500 }
    )
  }
}
