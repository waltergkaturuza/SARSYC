import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📩 Registration request body keys:', Object.keys(body || {}))
    const payload = await getPayloadClient()

    // Create registration in Payload CMS
    const registration = await payload.create({
      collection: 'registrations',
      data: {
        ...body,
        status: 'pending',
        paymentStatus: 'pending',
      },
    })

    // TODO: Send confirmation email
    // await sendRegistrationEmail(registration)

    return NextResponse.json({
      success: true,
      doc: registration,
      message: 'Registration successful',
    })
  } catch (error: any) {
    console.error('❌ Registration error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      responseData: error?.response?.data,
    })
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Registration failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    
    // Get all registrations (admin only)
    const registrations = await payload.find({
      collection: 'registrations',
      limit: 100,
      sort: '-createdAt',
    })

    return NextResponse.json(registrations)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}






