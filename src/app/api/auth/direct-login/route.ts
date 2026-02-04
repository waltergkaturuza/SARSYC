import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import postgres from 'postgres'
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

// Helper to add CORS headers
function addCorsHeaders(response: NextResponse, request?: NextRequest): NextResponse {
  // When credentials are used, we must echo the Origin header, not use '*'
  const origin = request?.headers.get('origin') || '*'
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '*'
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      const response = NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
      return addCorsHeaders(response, request)
    }

    console.log('[Direct Login] Starting direct database authentication for:', email)

    // Step 1: Get Payload client (but we won't use its login method)
    const payload = await getPayloadClient()

    // Step 2: Query user directly from database
    // Use findByID after finding user ID to get all fields including hash
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
      depth: 0,
    })

    if (!users.docs || users.docs.length === 0) {
      console.log('[Direct Login] ❌ User not found:', email)
      const response = NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
      return addCorsHeaders(response, request)
    }

    const userBasic = users.docs[0] as any
    console.log('[Direct Login] ✅ User found via find():', userBasic.id, userBasic.email, 'Role:', userBasic.role)
    
    // Payload never returns the hash field for security. Fetch it directly from the database.
    let hash: string | null = null
    let lockUntil: string | Date | null = null
    let loginAttempts: number = 0
    const dbUrl = process.env.DATABASE_URL
    if (dbUrl) {
      try {
        const sql = postgres(dbUrl, { max: 1 })
        const rows = await sql`
          SELECT hash, login_attempts, lock_until
          FROM users
          WHERE LOWER(email) = LOWER(${email.trim().toLowerCase()})
          LIMIT 1
        `
        await sql.end()
        if (rows?.[0]) {
          hash = (rows[0] as { hash: string | null }).hash ?? null
          loginAttempts = Number((rows[0] as { login_attempts: number }).login_attempts) || 0
          lockUntil = (rows[0] as { lock_until: Date | null }).lock_until ?? null
          console.log('[Direct Login] ✅ Fetched hash from DB, length:', hash?.length ?? 0)
        }
      } catch (dbErr: any) {
        console.error('[Direct Login] ❌ DB query for hash failed:', dbErr?.message)
      }
    } else {
      console.log('[Direct Login] ⚠️  DATABASE_URL not set, cannot fetch hash')
    }
    
    const user = {
      ...userBasic,
      hash,
      lockUntil,
      loginAttempts,
    } as any
    console.log('[Direct Login] Final user has hash?', !!user.hash)

    // Step 3: Check if account is locked
    if (user.lockUntil) {
      const lockUntil = new Date(user.lockUntil)
      if (lockUntil > new Date()) {
        console.log('[Direct Login] ❌ Account locked until:', lockUntil)
        const response = NextResponse.json(
          { 
            error: `Account is locked. Try again after ${lockUntil.toLocaleString()}`,
            locked: true,
            lockUntil: lockUntil.toISOString(),
          },
          { status: 423 }
        )
        return addCorsHeaders(response, request)
      }
    }

    // Step 4: Verify password directly using bcrypt
    console.log('[Direct Login] Step 2: Verifying password hash...')
    console.log('[Direct Login] Hash exists:', !!user.hash)
    console.log('[Direct Login] Hash length:', user.hash?.length)
    console.log('[Direct Login] Hash preview:', user.hash?.substring(0, 20))
    console.log('[Direct Login] Hash format:', user.hash?.substring(0, 7))
    
    if (!user.hash) {
      console.log('[Direct Login] ❌ User has no password hash!')
      const response = NextResponse.json(
        { 
          error: 'User account has no password set',
          debug: {
            userId: user.id,
            email: user.email,
            hasHash: false
          }
        },
        { status: 401 }
      )
      return addCorsHeaders(response, request)
    }

    console.log('[Direct Login] Comparing password...')
    console.log('[Direct Login] Password provided length:', password.length)
    const passwordMatch = await bcrypt.compare(password, user.hash)
    console.log('[Direct Login] Password match result:', passwordMatch)
    
    if (!passwordMatch) {
      console.log('[Direct Login] ❌ Password mismatch')
      console.log('[Direct Login] Expected hash:', user.hash)
      console.log('[Direct Login] Password provided:', password.substring(0, 3) + '***')
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
      const response = NextResponse.json(
        { 
          error: 'Invalid email or password',
          debug: {
            userId: user.id,
            email: user.email,
            hasHash: !!user.hash,
            hashLength: user.hash?.length,
            hashFormat: user.hash?.substring(0, 7),
            hashPreview: user.hash?.substring(0, 30),
            passwordLength: password.length,
            passwordMatch: false
          }
        },
        { status: 401 }
      )
      return addCorsHeaders(response, request)
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
      const response = NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
      return addCorsHeaders(response, request)
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
    
    return addCorsHeaders(response, request)

  } catch (error: any) {
    console.error('[Direct Login] ❌ Error:', error)
    console.error('[Direct Login] Error stack:', error.stack)
    const errorResponse = NextResponse.json(
      { 
        error: 'Authentication failed',
        details: error.message,
        method: 'direct-database-auth',
      },
      { status: 500 }
    )
    return addCorsHeaders(errorResponse, request)
  }
}
