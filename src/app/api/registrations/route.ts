import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { sendRegistrationConfirmation } from '@/lib/mail'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let registrationData: any = {
      status: 'pending',
      paymentStatus: 'pending',
    }
    let passportFile: File | null = null

    // Handle FormData (for file uploads) or JSON
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      
      // Extract all form fields
      for (const [key, value] of formData.entries()) {
        if (key === 'passportScan' && value instanceof File) {
          passportFile = value
        } else {
          // Handle arrays (like dietaryRestrictions)
          if (key.includes('[]') || Array.isArray(registrationData[key])) {
            const arrayKey = key.replace('[]', '')
            if (!Array.isArray(registrationData[arrayKey])) {
              registrationData[arrayKey] = []
            }
            registrationData[arrayKey].push(value.toString())
          } else {
            registrationData[key] = value.toString()
          }
        }
      }

    } else {
      // Handle JSON request (backward compatibility)
      const body = await request.json()
      registrationData = {
        ...body,
        status: 'pending',
        paymentStatus: 'pending',
      }
    }

    console.log('📩 Registration request body keys:', Object.keys(registrationData || {}))
    
    const payload = await getPayloadClient()

    // Handle passport file upload if present (for FormData requests)
    if (passportFile) {
      try {
        // Upload file to Payload Media collection first
        // Use overrideAccess to allow public uploads for registrations
        const uploadedFile = await payload.create({
          collection: 'media',
          data: {
            alt: `Passport scan for ${registrationData.email || 'registration'}`,
          },
          file: passportFile,
          overrideAccess: true, // Allow public uploads for registration passport scans
        })
        
        // Link the uploaded file to the registration
        registrationData.passportScan = typeof uploadedFile === 'string' ? uploadedFile : uploadedFile.id
      } catch (uploadError: any) {
        console.error('❌ File upload error:', uploadError)
        // If file upload fails, continue without the file but log the error
        // This allows registration to proceed even if file upload fails
        // The registration will be created without the passport scan
        console.warn('⚠️  Registration proceeding without passport scan due to upload error')
      }
    }

    // Create registration in Payload CMS
    const registration = await payload.create({
      collection: 'registrations',
      data: registrationData,
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






