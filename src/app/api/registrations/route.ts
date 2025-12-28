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
    console.log('📩 isInternational:', registrationData.isInternational)
    console.log('📩 passportFile present:', !!passportFile)
    
    const payload = await getPayloadClient()

    // Handle passport file upload if present (for FormData requests)
    if (passportFile) {
      try {
        // Convert File to Buffer for Payload CMS (required in serverless environments)
        const arrayBuffer = await passportFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Add buffer property to File for Payload/sharp compatibility
        const fileForPayload = Object.assign(passportFile, {
          data: buffer,
          buffer: buffer,
        })
        
        // Upload file to Payload Media collection first
        // Use overrideAccess to allow public uploads for registrations
        const uploadedFile = await payload.create({
          collection: 'media',
          data: {
            alt: `Passport scan for ${registrationData.email || 'registration'}`,
          },
          file: fileForPayload,
          overrideAccess: true, // Allow public uploads for registration passport scans
        })
        
        // Link the uploaded file to the registration
        registrationData.passportScan = typeof uploadedFile === 'string' ? uploadedFile : uploadedFile.id
        console.log('✅ Passport file uploaded successfully:', registrationData.passportScan)
      } catch (uploadError: any) {
        console.error('❌ File upload error:', uploadError)
        console.error('❌ Upload error details:', {
          message: uploadError.message,
          stack: uploadError.stack,
          name: uploadError.name,
        })
        
        // If user is international and file upload fails, return error
        if (registrationData.isInternational === 'true' || registrationData.isInternational === true) {
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to upload passport scan. Please try again.',
              details: process.env.NODE_ENV === 'development' ? uploadError.message : undefined,
            },
            { status: 400 }
          )
        }
        
        // For non-international users, continue without the file
        console.warn('⚠️  Registration proceeding without passport scan (non-international or upload failed)')
      }
    } else if (registrationData.isInternational === 'true' || registrationData.isInternational === true) {
      // International user but no passport file provided
      return NextResponse.json(
        {
          success: false,
          error: 'Passport scan is required for international attendees',
        },
        { status: 400 }
      )
    }

    // Ensure boolean values are properly converted
    if (registrationData.isInternational === 'true') registrationData.isInternational = true
    if (registrationData.isInternational === 'false') registrationData.isInternational = false
    if (registrationData.visaRequired === 'true') registrationData.visaRequired = true
    if (registrationData.visaRequired === 'false') registrationData.visaRequired = false
    if (registrationData.accommodationRequired === 'true') registrationData.accommodationRequired = true
    if (registrationData.accommodationRequired === 'false') registrationData.accommodationRequired = false
    if (registrationData.hasHealthInsurance === 'true') registrationData.hasHealthInsurance = true
    if (registrationData.hasHealthInsurance === 'false') registrationData.hasHealthInsurance = false
    if (registrationData.visaInvitationLetterRequired === 'true') registrationData.visaInvitationLetterRequired = true
    if (registrationData.visaInvitationLetterRequired === 'false') registrationData.visaInvitationLetterRequired = false

    // Remove passportScan if not international (to avoid validation errors)
    if (!registrationData.isInternational && registrationData.passportScan) {
      delete registrationData.passportScan
    }

    // Create registration in Payload CMS
    const registration = await payload.create({
      collection: 'registrations',
      data: registrationData,
      overrideAccess: true, // Allow public registration creation
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






