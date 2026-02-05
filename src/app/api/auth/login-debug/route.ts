import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

/**
 * Debug Login Endpoint
 * 
 * This endpoint provides detailed logging at every step of the authentication process
 * to identify exactly where the failure occurs.
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const logs: string[] = []
  const errors: any[] = []
  
  const log = (message: string) => {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}`
    logs.push(logMessage)
    console.log(logMessage)
  }

  const logError = (error: any, context: string) => {
    const errorInfo = {
      context,
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      code: error?.code,
      detail: error?.detail,
      hint: error?.hint,
    }
    errors.push(errorInfo)
    log(`❌ ERROR in ${context}: ${error?.message}`)
    console.error(`[ERROR] ${context}:`, error)
  }

  try {
    const { email, password, type } = await request.json()
    log(`🚀 Starting debug login for: ${email}`)

    // Step 1: Get Payload Client
    log('📋 Step 1: Getting Payload client...')
    let payloadClient
    try {
      payloadClient = await getPayloadClient()
      log('✅ Step 1: Payload client obtained')
    } catch (error: any) {
      logError(error, 'Step 1: Get Payload Client')
      return NextResponse.json({
        success: false,
        step: 1,
        error: 'Failed to get Payload client',
        details: error?.message,
        logs,
        errors,
      }, { status: 500 })
    }

    // Step 2: Check if user exists (without sessions)
    log('📋 Step 2: Checking if user exists...')
    let foundUser
    try {
      const users = await payloadClient.find({
        collection: 'users',
        where: {
          email: {
            equals: email.toLowerCase().trim(),
          },
        },
        limit: 1,
        overrideAccess: true,
        // Try to avoid loading sessions
        depth: 0,
      })
      foundUser = users.docs[0] || null
      
      if (!foundUser) {
        log('❌ Step 2: User not found')
        return NextResponse.json({
          success: false,
          step: 2,
          error: 'User not found',
          logs,
          errors,
        }, { status: 401 })
      }
      log(`✅ Step 2: User found - ID: ${foundUser.id}, Email: ${foundUser.email}, Role: ${(foundUser as any).role}`)
    } catch (error: any) {
      logError(error, 'Step 2: Find User')
      return NextResponse.json({
        success: false,
        step: 2,
        error: 'Failed to find user',
        details: error?.message,
        logs,
        errors,
      }, { status: 500 })
    }

    // Step 3: Check account lock status
    log('📋 Step 3: Checking account lock status...')
    try {
      if ((foundUser as any).lockUntil) {
        const lockUntil = new Date((foundUser as any).lockUntil)
        if (lockUntil > new Date()) {
          log(`❌ Step 3: Account locked until ${lockUntil.toISOString()}`)
          return NextResponse.json({
            success: false,
            step: 3,
            error: 'Account is locked',
            lockUntil: lockUntil.toISOString(),
            logs,
            errors,
          }, { status: 423 })
        }
      }
      log('✅ Step 3: Account is not locked')
    } catch (error: any) {
      logError(error, 'Step 3: Check Lock Status')
      // Continue anyway
    }

    // Step 4: Attempt Payload login (this is where session creation happens)
    log('📋 Step 4: Attempting Payload login (this creates session)...')
    let loginResult
    try {
      loginResult = await payloadClient.login({
        collection: 'users',
        data: {
          email,
          password,
        },
      })
      log(`✅ Step 4: Payload login successful! Token length: ${loginResult.token.length}`)
      log(`✅ Step 4: User ID: ${loginResult.user.id}, Email: ${loginResult.user.email}`)
    } catch (error: any) {
      logError(error, 'Step 4: Payload Login')
      
      // Detailed error analysis
      const errorAnalysis = {
        message: error?.message,
        name: error?.name,
        code: error?.code,
        // Check if it's a database error
        isDatabaseError: error?.code === '23505' || // Unique violation
                        error?.code === '23503' || // Foreign key violation
                        error?.code === '42P01' || // Table doesn't exist
                        error?.code === '42703' || // Column doesn't exist
                        error?.message?.includes('relation') ||
                        error?.message?.includes('column') ||
                        error?.message?.includes('users_sessions'),
        // Check if it's a password error
        isPasswordError: error?.message?.includes('password') ||
                        error?.message?.includes('credentials') ||
                        error?.message?.includes('Invalid'),
        // Check if it's a session creation error
        isSessionError: error?.message?.includes('session') ||
                       error?.message?.includes('users_sessions'),
      }
      
      log(`🔍 Error Analysis: ${JSON.stringify(errorAnalysis, null, 2)}`)
      
      return NextResponse.json({
        success: false,
        step: 4,
        error: 'Payload login failed',
        details: error?.message,
        errorAnalysis,
        logs,
        errors,
      }, { status: 401 })
    }

    // Step 5: Verify we can query the user back (this tests the JOIN)
    log('📋 Step 5: Verifying user can be queried back (tests users_sessions JOIN)...')
    try {
      const verifyUser = await payloadClient.findByID({
        collection: 'users',
        id: loginResult.user.id,
        overrideAccess: true,
        depth: 0, // Try without depth first
      })
      log(`✅ Step 5: User query successful - Email: ${verifyUser.email}`)
    } catch (error: any) {
      logError(error, 'Step 5: Verify User Query')
      
      // This is the JOIN failure point
      const errorAnalysis = {
        message: error?.message,
        isJoinError: error?.message?.includes('users_sessions') ||
                    error?.message?.includes('JOIN') ||
                    error?.message?.includes('lateral'),
        isTableError: error?.message?.includes('relation') ||
                     error?.message?.includes('does not exist'),
      }
      
      log(`🔍 Step 5 Error Analysis: ${JSON.stringify(errorAnalysis, null, 2)}`)
      
      return NextResponse.json({
        success: false,
        step: 5,
        error: 'User query after login failed (JOIN issue?)',
        details: error?.message,
        errorAnalysis,
        logs,
        errors,
        // But login was successful, so return token anyway
        token: loginResult.token,
        user: {
          id: loginResult.user.id,
          email: loginResult.user.email,
        },
      }, { status: 200 }) // Return 200 because login succeeded, but query failed
    }

    // Step 6: Success - return token
    log('✅ All steps completed successfully!')
    
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
    
    const response = NextResponse.json({
      success: true,
      step: 6,
      user: {
        id: loginResult.user.id,
        email: loginResult.user.email,
        role: (loginResult.user as any).role,
      },
      token: loginResult.token,
      logs,
      errors: errors.length > 0 ? errors : undefined,
    })

    // Set cookie
    response.cookies.set('payload-token', loginResult.token, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: isProduction,
      httpOnly: false,
    })

    return response

  } catch (error: any) {
    logError(error, 'Top Level')
    return NextResponse.json({
      success: false,
      step: 0,
      error: 'Unexpected error',
      details: error?.message,
      logs,
      errors,
    }, { status: 500 })
  }
}
