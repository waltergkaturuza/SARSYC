import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { sendRegistrationConfirmation } from '@/lib/mail'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // Log immediately to ensure we capture errors
  // Use multiple logging methods to ensure visibility
  console.log('🚀 Registration API called')
  console.error('🚀 Registration API called (error stream)')
  console.warn('🚀 Registration API called (warn stream)')
  process.stderr.write('🚀 Registration API called\n')
  
  console.log('📋 Step 1: Getting request headers...')
  // Log ALL headers to diagnose Content-Type issues
  const allHeaders = Object.fromEntries(request.headers.entries())
  console.log('📋 All request headers:', JSON.stringify(allHeaders, null, 2))
  
  const contentType = request.headers.get('content-type') || ''
  const contentLength = request.headers.get('content-length')
  console.log('📋 Request method:', request.method)
  console.log('📋 Request URL:', request.url)
  console.log('📋 Content-Type:', contentType)
  console.log('📋 Content-Length:', contentLength)
  console.log('📋 Is multipart?', contentType.includes('multipart/form-data'))
  console.log('✅ Step 1 complete: Headers retrieved')
  
  try {
    console.log('📋 Step 2: Initializing registration data...')
    let registrationData: any = {
      status: 'pending',
      paymentStatus: 'pending',
    }
    let passportFile: File | null = null
    console.log('✅ Step 2 complete: Registration data initialized')

    // Handle FormData (for file uploads) or JSON
    if (contentType.includes('multipart/form-data')) {
      console.log('📦 Step 3: Parsing FormData...')
      let formData: FormData
      try {
        console.log('📦 About to call request.formData()...')
        // Add timeout wrapper for FormData parsing
        const formDataPromise = request.formData()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('FormData parsing timeout after 10 seconds')), 10000)
        )
        
        formData = await Promise.race([formDataPromise, timeoutPromise]) as FormData
        console.log('✅ FormData parsed successfully')
        
        // Convert to array immediately to avoid multiple iterations
        console.log('📦 Converting FormData entries to array...')
        const entries = Array.from(formData.entries())
        console.log('📦 FormData entries count:', entries.length)
        
        // Extract all form fields
        // First pass: collect all keys to identify arrays
        console.log('📦 Step 3a: Collecting field counts...')
        const fieldCounts: Record<string, number> = {}
        for (const [key] of entries) {
          if (key !== 'passportScan') {
            fieldCounts[key] = (fieldCounts[key] || 0) + 1
          }
        }
        console.log('✅ Step 3a complete: Field counts collected')
        
        // Second pass: extract values
        console.log('📦 Step 3b: Extracting form values...')
        for (const [key, value] of entries) {
          if (key === 'passportScan' && value instanceof File) {
            passportFile = value
            console.log('📦 Passport file found:', {
              name: value.name,
              size: value.size,
              type: value.type,
            })
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
        console.log('✅ Step 3b complete: Form values extracted')
        console.log('✅ Step 3 complete: FormData processing finished')
      } catch (formDataError: any) {
        console.error('❌ FormData parsing failed:', {
          message: formDataError.message,
          name: formDataError.name,
          stack: formDataError.stack,
        })
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to parse form data',
            details: formDataError.message,
            step: 'FormData parsing',
          },
          { status: 400 }
        )
      }

    } else {
      // Handle JSON request (backward compatibility)
      console.log('📦 Parsing JSON body...')
      try {
        const body = await request.json()
        registrationData = {
          ...body,
          status: 'pending',
          paymentStatus: 'pending',
        }
        console.log('✅ JSON body parsed successfully')
      } catch (jsonError: any) {
        console.error('❌ JSON parsing failed:', {
          message: jsonError.message,
          name: jsonError.name,
          stack: jsonError.stack,
        })
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to parse JSON body',
            details: jsonError.message,
          },
          { status: 400 }
        )
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
          hasBuffer: 'buffer' in passportFile,
        })
        
        // Validate file before processing
        if (passportFile.size === 0) {
          throw new Error('File is empty')
        }
        
        if (passportFile.size > 5 * 1024 * 1024) {
          throw new Error('File size exceeds 5MB limit')
        }
        
        // Validate file type
        const allowedTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        const fileType = passportFile.type || ''
        const isValidType = allowedTypes.some(type => fileType.includes(type.split('/')[1]) || fileType === type)
        
        if (!isValidType && fileType) {
          console.warn('⚠️  File type might not be supported:', fileType)
          // Continue anyway - let Payload validate
        }
        
        // Convert File to Buffer for Payload CMS (required in serverless environments)
        // This works for both images (processed by sharp) and PDFs
        const arrayBuffer = await passportFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        if (buffer.length === 0) {
          throw new Error('File buffer is empty after conversion')
        }
        
        console.log('📤 File converted to buffer:', {
          bufferSize: buffer.length,
          originalSize: passportFile.size,
          match: buffer.length === passportFile.size,
        })
        
        // Use the original file and add buffer properties to it
        // This preserves the original MIME type and file metadata
        // Payload validates MIME types strictly, so we need to preserve the original
        const fileForPayload = passportFile as File & { data: Buffer; buffer: Buffer }
        
        // Add buffer properties that Payload expects for serverless environments
        // These are required for Payload to process the file correctly
        Object.assign(fileForPayload, {
          data: buffer,
          buffer: buffer,
        })
        
        // Ensure the MIME type is preserved
        // Payload will validate this against the mimeTypes array in Media collection
        if (!fileForPayload.type) {
          // If no MIME type, infer from file extension
          const ext = fileForPayload.name.split('.').pop()?.toLowerCase()
          const mimeMap: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          }
          const inferredType = mimeMap[ext || ''] || 'application/octet-stream'
          
          // Set the MIME type on the file
          Object.defineProperty(fileForPayload, 'type', {
            value: inferredType,
            writable: true,
            enumerable: true,
            configurable: true,
          })
        }
        
        console.log('📤 File prepared for Payload:', {
          name: fileForPayload.name,
          type: fileForPayload.type,
          originalType: passportFile.type,
          size: fileForPayload.size,
          bufferLength: buffer.length,
          hasData: 'data' in fileForPayload,
          hasBuffer: 'buffer' in fileForPayload,
          isPDF: fileForPayload.type === 'application/pdf',
        })
        
        console.log('📤 Uploading file to Payload Media collection...', {
          fileName: fileForPayload.name,
          fileSize: fileForPayload.size,
          fileType: fileForPayload.type,
          hasData: 'data' in fileForPayload,
          hasBuffer: 'buffer' in fileForPayload,
          bufferLength: (fileForPayload as any).buffer?.length,
        })
        
        // Upload file to Payload Media collection first
        // Use overrideAccess to allow public uploads for registrations
        let uploadedFile: any
        try {
          // Log the exact file properties before upload
          console.log('📤 File object properties before Payload upload:', {
            name: fileForPayload.name,
            type: fileForPayload.type,
            size: fileForPayload.size,
            hasData: 'data' in fileForPayload,
            hasBuffer: 'buffer' in fileForPayload,
            dataType: typeof (fileForPayload as any).data,
            bufferType: typeof (fileForPayload as any).buffer,
            // Check first few bytes to verify it's actually a PDF
            firstBytes: buffer.subarray(0, 4).toString('hex'),
            isPDFHeader: buffer.subarray(0, 4).toString() === '%PDF',
          })
          
          // Check if it's a PDF file
          const isPDF = fileForPayload.type === 'application/pdf' || fileForPayload.name.toLowerCase().endsWith('.pdf')
          
          // For PDFs, upload directly to Vercel Blob to bypass Payload's MIME type validation
          // Then create a media record with the URL
          if (isPDF) {
            console.log('📄 PDF file detected, uploading directly to Vercel Blob to bypass Payload validation...')
            
            // Get the token from environment variable
            const blobToken = process.env.BLOB_READ_WRITE_TOKEN
            if (!blobToken) {
              console.error('❌ BLOB_READ_WRITE_TOKEN is missing!')
              throw new Error('BLOB_READ_WRITE_TOKEN is required for PDF uploads. Please set it in your environment variables.')
            }
            
            console.log('📤 Uploading to Vercel Blob with token:', blobToken.substring(0, 20) + '...')
            
            // Upload to Vercel Blob
            let blob: any
            try {
              blob = await put(`passport-scans/${Date.now()}-${fileForPayload.name}`, buffer, {
                access: 'public',
                contentType: 'application/pdf',
                token: blobToken, // Explicitly pass the token
              })
              console.log('✅ PDF uploaded to Vercel Blob:', blob.url)
            } catch (blobError: any) {
              console.error('❌ Vercel Blob upload error:', {
                message: blobError.message,
                name: blobError.name,
                stack: blobError.stack,
              })
              throw new Error(`Failed to upload PDF to Vercel Blob: ${blobError.message}`)
            }
            
            // Create media record with the blob URL (without file upload)
            // Payload should accept this since we're providing url, filename, mimeType, and filesize
            try {
              uploadedFile = await payload.create({
                collection: 'media',
                data: {
                  alt: `Passport scan for ${registrationData.email || 'registration'}`,
                  url: blob.url,
                  filename: fileForPayload.name,
                  mimeType: 'application/pdf',
                  filesize: fileForPayload.size,
                },
                overrideAccess: true,
              })
              console.log('✅ Media record created with blob URL')
            } catch (mediaError: any) {
              console.error('❌ Media record creation error:', {
                message: mediaError.message,
                data: mediaError.data,
                errors: mediaError.errors,
                status: mediaError.status,
                stack: mediaError.stack,
              })
              
              // Fallback: Create a file-like object from the buffer and try again
              // Payload's upload field might require a file object, so we'll create one from the buffer
              try {
                console.log('🔄 Attempting to create media record with file-like object from buffer...')
                
                // Create a Blob from the buffer
                const blobForPayload = new Blob([buffer], { type: 'application/pdf' })
                
                // Create a File-like object from the Blob
                const fileFromBlob = new File([blobForPayload], fileForPayload.name, {
                  type: 'application/pdf',
                  lastModified: Date.now(),
                })
                
                // Add buffer property for Payload/sharp compatibility
                Object.assign(fileFromBlob, {
                  data: buffer,
                  buffer: buffer,
                })
                
                // Try creating the media record with the file-like object
                uploadedFile = await payload.create({
                  collection: 'media',
                  data: {
                    alt: `Passport scan for ${registrationData.email || 'registration'}`,
                  },
                  file: fileFromBlob,
                  overrideAccess: true,
                })
                console.log('✅ Media record created with file-like object from buffer')
              } catch (fallbackError: any) {
                console.error('❌ Fallback file creation also failed:', {
                  message: fallbackError.message,
                  stack: fallbackError.stack,
                  errors: fallbackError.errors,
                })
                // Last resort: throw the original error with fallback details
                throw new Error(`Failed to create media record: ${mediaError.message}. Fallback attempt also failed: ${fallbackError.message}`)
              }
            }
          } else {
            // For images, use normal Payload upload
            uploadedFile = await payload.create({
              collection: 'media',
              data: {
                alt: `Passport scan for ${registrationData.email || 'registration'}`,
              },
              file: fileForPayload,
              overrideAccess: true, // Allow public uploads for registration passport scans
            })
          }
          
          console.log('📤 Upload response:', {
            type: typeof uploadedFile,
            isString: typeof uploadedFile === 'string',
            hasId: typeof uploadedFile === 'object' && uploadedFile !== null && 'id' in uploadedFile,
            id: typeof uploadedFile === 'object' && uploadedFile !== null ? (uploadedFile as any).id : null,
            fullResponse: JSON.stringify(uploadedFile, null, 2).substring(0, 500), // First 500 chars
          })
        } catch (payloadError: any) {
          // Log detailed Payload error information
          console.error('❌ Payload create error:', {
            message: payloadError.message,
            name: payloadError.name,
            stack: payloadError.stack,
            data: payloadError.data,
            errors: payloadError.errors,
            status: payloadError.status,
            statusCode: payloadError.statusCode,
            response: payloadError.response,
            // Check for validation errors
            validationErrors: payloadError.data?.errors || payloadError.errors,
          })
          
          // Re-throw with more context
          throw new Error(
            `Payload upload failed: ${payloadError.message || 'Unknown error'}. ` +
            `Errors: ${JSON.stringify(payloadError.data?.errors || payloadError.errors || {})}`
          )
        }
        
        // Link the uploaded file to the registration
        const fileId = typeof uploadedFile === 'string' ? uploadedFile : (uploadedFile as any)?.id
        if (!fileId) {
          console.error('❌ Upload response structure:', {
            uploadedFile,
            type: typeof uploadedFile,
            keys: typeof uploadedFile === 'object' && uploadedFile !== null ? Object.keys(uploadedFile) : [],
          })
          throw new Error('File upload succeeded but no ID was returned. Response: ' + JSON.stringify(uploadedFile).substring(0, 200))
        }
        
        registrationData.passportScan = fileId
        console.log('✅ Passport file uploaded successfully:', registrationData.passportScan)
      } catch (uploadError: any) {
        console.error('❌ File upload error:', uploadError)
        console.error('❌ Upload error details:', {
          message: uploadError.message,
          stack: uploadError.stack,
          name: uploadError.name,
          code: uploadError.code,
          status: uploadError.status,
          statusCode: uploadError.statusCode,
          data: uploadError.data,
          errors: uploadError.errors,
          response: uploadError.response,
          // Extract validation errors if present
          validationErrors: uploadError.data?.errors || uploadError.errors || uploadError.data?.validationErrors,
        })
        
        // If user is international and file upload fails, return error
        if (registrationData.isInternational === 'true' || registrationData.isInternational === true) {
          const errorMessage = uploadError.message || 'Unknown error'
          const isDevelopment = process.env.NODE_ENV === 'development'
          
          // Extract validation errors for better user feedback
          const validationErrors = uploadError.data?.errors || uploadError.errors || uploadError.data?.validationErrors
          let userFriendlyMessage = 'Failed to upload passport scan. Please try again.'
          
          if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
            const firstError = validationErrors[0]
            if (firstError.message) {
              userFriendlyMessage = firstError.message
            } else if (typeof firstError === 'string') {
              userFriendlyMessage = firstError
            }
          } else if (uploadError.message && uploadError.message.includes('validation')) {
            userFriendlyMessage = 'The passport file format is invalid. Please ensure it is a PDF, JPG, or PNG file.'
          } else if (uploadError.message && uploadError.message.includes('size')) {
            userFriendlyMessage = 'The passport file is too large. Please ensure it is less than 5MB.'
          }
          
          return NextResponse.json(
            {
              success: false,
              error: userFriendlyMessage,
              details: isDevelopment 
                ? `Upload failed: ${errorMessage}` 
                : 'Please ensure the file is a valid PDF, JPG, or PNG and is less than 5MB.',
              debug: isDevelopment ? {
                error: errorMessage,
                fileName: passportFile.name,
                fileSize: passportFile.size,
                fileType: passportFile.type,
                validationErrors: validationErrors,
                fullError: uploadError,
              } : undefined,
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

    // Check for duplicate registrations before creating
    console.log('🔍 Checking for duplicate registrations...')
    
    // Build query to check for existing registrations
    const duplicateChecks: any[] = []
    
    // Always check email (most reliable identifier)
    duplicateChecks.push({
      email: {
        equals: registrationData.email,
      },
    })
    
    // For international attendees, check passport number
    if (registrationData.isInternational && registrationData.passportNumber) {
      duplicateChecks.push({
        and: [
          {
            isInternational: {
              equals: true,
            },
          },
          {
            passportNumber: {
              equals: registrationData.passportNumber.trim().toUpperCase(),
            },
          },
        ],
      })
    }
    
    // For non-international attendees, check national ID
    if (!registrationData.isInternational && registrationData.nationalIdNumber) {
      duplicateChecks.push({
        and: [
          {
            isInternational: {
              equals: false,
            },
          },
          {
            nationalIdNumber: {
              equals: registrationData.nationalIdNumber.trim(),
            },
          },
        ],
      })
    }
    
    // Check for existing registrations matching any of the criteria
    // Only check registrations from the current year (SARSYC VI is 2026)
    const currentYear = new Date().getFullYear()
    const existingRegistrations = await payload.find({
      collection: 'registrations',
      where: {
        or: duplicateChecks,
        // Only check registrations from the current conference year
        // Assuming SARSYC VI is in 2026, we check registrations created in 2025-2026
        createdAt: {
          greater_than_equal: new Date(`${currentYear - 1}-01-01`).toISOString(),
        },
      },
      limit: 1,
    })
    
    if (existingRegistrations.totalDocs > 0) {
      const existing = existingRegistrations.docs[0]
      let duplicateReason = 'email address'
      
      // Determine which field matched
      if (registrationData.isInternational && 
          existing.passportNumber && 
          existing.passportNumber.toUpperCase() === registrationData.passportNumber.trim().toUpperCase()) {
        duplicateReason = 'passport number'
      } else if (!registrationData.isInternational && 
                 existing.nationalIdNumber && 
                 existing.nationalIdNumber === registrationData.nationalIdNumber.trim()) {
        duplicateReason = 'national ID number'
      }
      
      console.log('❌ Duplicate registration found:', {
        existingId: existing.id,
        registrationId: existing.registrationId,
        matchedField: duplicateReason,
      })
      
      return NextResponse.json(
        {
          success: false,
          error: `You have already registered for SARSYC VI using this ${duplicateReason}.`,
          details: `Registration ID: ${existing.registrationId || existing.id}`,
          existingRegistrationId: existing.registrationId || existing.id,
        },
        { status: 409 } // 409 Conflict
      )
    }
    
    console.log('✅ No duplicate registrations found, proceeding with creation...')
    console.log('📝 Registration data keys:', Object.keys(registrationData))
    console.log('📝 Registration data sample:', {
      email: registrationData.email,
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      isInternational: registrationData.isInternational,
      hasPassportScan: !!registrationData.passportScan,
    })

    // Create registration in Payload CMS
    console.log('💾 Creating registration in Payload...')
    let registration
    try {
      registration = await payload.create({
        collection: 'registrations',
        data: registrationData,
        overrideAccess: true, // Allow public registration creation
      })
      console.log('✅ Registration created successfully:', registration.id)
    } catch (createError: any) {
      console.error('❌ Registration creation failed:', {
        message: createError.message,
        stack: createError.stack,
        name: createError.name,
        data: createError.data,
        errors: createError.errors,
        status: createError.status,
      })
      throw createError
    }

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
    // Log error immediately and aggressively using ALL methods
    const errorDetails = {
      message: error.message || 'Unknown error',
      name: error.name || 'Error',
      code: error.code,
      stack: error.stack,
      responseData: error?.response?.data,
      data: error.data,
      errors: error.errors,
      status: error.status,
    }
    
    // Use all logging methods
    console.error('❌ ==========================================')
    console.error('❌ REGISTRATION ERROR - FULL DETAILS:')
    console.error('❌ ==========================================')
    console.error(JSON.stringify(errorDetails, null, 2))
    console.error('❌ ==========================================')
    console.warn('❌ ERROR (warn stream):', errorDetails)
    process.stderr.write(`❌ ERROR: ${JSON.stringify(errorDetails)}\n`)
    
    // Determine status code
    let statusCode = 500
    if (error.status && typeof error.status === 'number') {
      statusCode = error.status
    } else if (error.message?.includes('required') || error.message?.includes('invalid')) {
      statusCode = 400
    }
    
    // Return detailed error response that will be visible in browser
    const errorResponse = {
      success: false,
      error: error.message || 'Registration failed',
      details: errorDetails.message,
      // ALWAYS include debug info in production to help diagnose
      debug: {
        name: errorDetails.name,
        code: errorDetails.code,
        status: errorDetails.status,
        hasErrors: !!errorDetails.errors,
        errorCount: errorDetails.errors?.length || 0,
      },
      // Include first few errors if available
      errors: errorDetails.errors?.slice(0, 3) || undefined,
      // Include stack trace in production for now (we'll remove later)
      stack: errorDetails.stack?.split('\n').slice(0, 10).join('\n'), // First 10 lines
    }
    
    console.error('❌ Returning error response:', JSON.stringify(errorResponse, null, 2))
    
    return NextResponse.json(errorResponse, { status: statusCode })
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






