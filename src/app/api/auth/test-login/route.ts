import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import bcrypt from 'bcrypt'

/**
 * Test Login Endpoint
 * 
 * This endpoint tests login step-by-step to see exactly where it fails
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const logs: string[] = []
  const errors: any[] = []
  
  const log = (message: string) => {
    logs.push(message)
    console.log(message)
  }

  try {
    const { email, password } = await request.json()
    log(`🚀 Testing login for: ${email}`)

    const payload = await getPayloadClient()

    // Step 1: Find user
    log('📋 Step 1: Finding user...')
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: email.toLowerCase().trim() } },
      limit: 1,
      overrideAccess: true,
    })
    
    if (!users.docs || users.docs.length === 0) {
      return NextResponse.json({
        success: false,
        step: 1,
        error: 'User not found',
        logs,
      }, { status: 401 })
    }

    const user = users.docs[0] as any
    log(`✅ Step 1: User found - ID: ${user.id}, Email: ${user.email}`)

    // Step 2: Check password hash
    log('📋 Step 2: Checking password hash...')
    if (!user.hash) {
      return NextResponse.json({
        success: false,
        step: 2,
        error: 'User has no password hash',
        logs,
      }, { status: 401 })
    }
    
    log(`✅ Step 2: Hash exists - Length: ${user.hash.length}, Prefix: ${user.hash.substring(0, 7)}`)

    // Step 3: Verify password with bcrypt
    log('📋 Step 3: Verifying password with bcrypt...')
    const passwordMatch = await bcrypt.compare(password, user.hash)
    
    if (!passwordMatch) {
      log(`❌ Step 3: Password mismatch`)
      return NextResponse.json({
        success: false,
        step: 3,
        error: 'Password does not match hash',
        hashLength: user.hash.length,
        hashPrefix: user.hash.substring(0, 20),
        logs,
      }, { status: 401 })
    }
    
    log(`✅ Step 3: Password verified successfully!`)

    // Step 4: Try Payload login
    log('📋 Step 4: Attempting Payload login (this creates session)...')
    try {
      const result = await payload.login({
        collection: 'users',
        data: { email, password },
      })
      
      log(`✅ Step 4: Payload login successful! Token: ${result.token.substring(0, 50)}...`)
      
      return NextResponse.json({
        success: true,
        step: 4,
        message: 'Login successful',
        token: result.token,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: (result.user as any).role,
        },
        logs,
      })
    } catch (loginError: any) {
      log(`❌ Step 4: Payload login failed: ${loginError.message}`)
      return NextResponse.json({
        success: false,
        step: 4,
        error: 'Payload login failed',
        details: loginError.message,
        errorCode: loginError.code,
        passwordVerified: true, // We verified password manually
        logs,
        errors: [{
          message: loginError.message,
          code: loginError.code,
          stack: loginError.stack,
        }],
      }, { status: 500 })
    }

  } catch (error: any) {
    log(`❌ Error: ${error.message}`)
    return NextResponse.json({
      success: false,
      error: error.message,
      logs,
      errors: [{
        message: error.message,
        stack: error.stack,
      }],
    }, { status: 500 })
  }
}
