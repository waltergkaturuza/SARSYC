import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { sendRegistrationConfirmation } from '@/lib/mail'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📩 Registration request body keys:', Object.keys(body || {}))
    const payload = await getPayloadClient()

    // Clean up the data - remove undefined/null values and handle upload fields
    const cleanedData: any = {
      ...body,
      status: 'pending',
      paymentStatus: 'pending',
    }

    // Remove passportScan if it's not provided or is empty (upload fields need special handling)
    // On Vercel without storage adapter, we can't process uploads yet
    if (!cleanedData.passportScan || cleanedData.passportScan === '' || cleanedData.passportScan === null) {
      delete cleanedData.passportScan
    }

    // Create registration in Payload CMS
    const registration = await payload.create({
      collection: 'registrations',
      data: cleanedData,
    })

    // Send confirmation email
    try {
      await sendRegistrationConfirmation({
        to: registration.email,
        firstName: registration.firstName,
        registrationId: registration.registrationId || registration.id.toString(),
      })
    } catch (emailError: any) {
      // Log but don't fail the registration if email fails
      console.error('Failed to send registration confirmation email:', emailError)
    }

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






