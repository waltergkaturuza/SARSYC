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
      // First pass: collect all keys to identify arrays
      const fieldCounts: Record<string, number> = {}
      for (const [key] of formData.entries()) {
        if (key !== 'passportScan') {
          fieldCounts[key] = (fieldCounts[key] || 0) + 1
        }
      }
      
      // Second pass: extract values
      for (const [key, value] of formData.entries()) {
        if (key === 'passportScan' && value instanceof File) {
          passportFile = value
        } else {
          // Handle arrays (like dietaryRestrictions) - if key appears multiple times, it's an array
          if (fieldCounts[key] > 1 || key.includes('[]')) {
            const arrayKey = key.replace('[]', '')
            if (!Array.isArray(registrationData[arrayKey])) {
              registrationData[arrayKey] = []
            }
            const stringValue = value.toString()
            // Only add if not already in array (avoid duplicates)
            if (!registrationData[arrayKey].includes(stringValue)) {
              registrationData[arrayKey].push(stringValue)
            }
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
        console.log('📤 Starting passport file upload...', {
          fileName: passportFile.name,
          fileSize: passportFile.size,
          fileType: passportFile.type,
        })
        
        // For PDFs, we don't need to convert to buffer (sharp is for images)
        // For images, convert to Buffer for Payload/sharp compatibility
        let fileForPayload: File
        if (passportFile.type.startsWith('image/')) {
          // Convert image File to Buffer for Payload/sharp compatibility
          const arrayBuffer = await passportFile.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          
          // Create a new File-like object with buffer properties
          fileForPayload = Object.assign(new File([buffer], passportFile.name, { type: passportFile.type }), {
            data: buffer,
            buffer: buffer,
          })
        } else {
          // For PDFs and other non-image files, use the file as-is
          // But still convert to buffer for consistency
          const arrayBuffer = await passportFile.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          fileForPayload = Object.assign(new File([buffer], passportFile.name, { type: passportFile.type }), {
            data: buffer,
            buffer: buffer,
          })
        }
        
        console.log('📤 Uploading file to Payload Media collection...')
        
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
          code: uploadError.code,
          status: uploadError.status,
          data: uploadError.data,
        })
        
        // If user is international and file upload fails, return error
        if (registrationData.isInternational === 'true' || registrationData.isInternational === true) {
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to upload passport scan. Please try again.',
              details: process.env.NODE_ENV === 'development' 
                ? `Upload failed: ${uploadError.message || 'Unknown error'}` 
                : 'Please ensure the file is a valid PDF, JPG, or PNG and is less than 5MB.',
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






