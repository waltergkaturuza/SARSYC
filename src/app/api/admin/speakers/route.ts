import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const formData = await request.formData()
    
    // Extract form fields
    const name = formData.get('name') as string
    const title = formData.get('title') as string
    const organization = formData.get('organization') as string
    const country = formData.get('country') as string
    const bio = formData.get('bio') as string
    const type = JSON.parse(formData.get('type') as string || '[]')
    const featured = formData.get('featured') === 'true'
    const socialMedia = JSON.parse(formData.get('socialMedia') as string || '{}')
    const expertise = JSON.parse(formData.get('expertise') as string || '[]')
    const photoFile = formData.get('photo') as File | null
    
    // Debug: Log all form data keys
    console.log('Form data keys:', Array.from(formData.keys()))
    console.log('Photo file received:', {
      exists: !!photoFile,
      isFile: photoFile instanceof File,
      name: photoFile?.name,
      size: photoFile?.size,
      type: photoFile?.type,
    })
    
    // Validate required fields
    if (!name || !title || !organization || !country || !bio) {
      return NextResponse.json(
        { error: 'Missing required fields: name, title, organization, country, and bio are required' },
        { status: 400 }
      )
    }

    if (!type || type.length === 0) {
      return NextResponse.json(
        { error: 'At least one speaker type is required' },
        { status: 400 }
      )
    }

    // Photo is required - validate it's provided
    if (!photoFile || photoFile.size === 0) {
      return NextResponse.json(
        { error: 'Professional photo is required' },
        { status: 400 }
      )
    }

    // Log file details for debugging
    console.log('Photo file details:', {
      name: photoFile.name,
      size: photoFile.size,
      type: photoFile.type,
      lastModified: photoFile.lastModified,
    })

    // Upload photo
    let photoId: string | undefined
    try {
      console.log('Attempting to upload photo to media collection...')
      const photoUpload = await payload.create({
        collection: 'media',
        data: {
          alt: `Speaker photo: ${name}`,
        },
        file: photoFile,
        overrideAccess: true, // Allow admin uploads
      })
      
      console.log('Photo upload result:', {
        type: typeof photoUpload,
        id: typeof photoUpload === 'string' ? photoUpload : photoUpload?.id,
        hasId: typeof photoUpload === 'object' && photoUpload !== null && 'id' in photoUpload,
      })
      
      photoId = typeof photoUpload === 'string' ? photoUpload : photoUpload?.id
      
      if (!photoId) {
        console.error('Photo upload returned no ID:', photoUpload)
        return NextResponse.json(
          { 
            error: 'Photo upload failed - no ID returned',
            details: 'The upload completed but no file ID was returned',
          },
          { status: 500 }
        )
      }
      
      console.log('Photo uploaded successfully with ID:', photoId)
    } catch (uploadError: any) {
      console.error('Photo upload error details:', {
        message: uploadError.message,
        stack: uploadError.stack,
        data: uploadError.data,
        status: uploadError.status,
        statusCode: uploadError.statusCode,
        errors: uploadError.errors,
        name: uploadError.name,
      })
      return NextResponse.json(
        { 
          error: 'Failed to upload photo',
          details: uploadError.message || 'Photo upload failed',
          ...(process.env.NODE_ENV === 'development' && {
            stack: uploadError.stack,
            data: uploadError.data,
            errors: uploadError.errors,
          }),
        },
        { status: 500 }
      )
    }

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo upload failed - no photo ID returned' },
        { status: 500 }
      )
    }

    // Create speaker
    const speaker = await payload.create({
      collection: 'speakers',
      data: {
        name,
        title,
        organization,
        country,
        bio,
        type,
        featured,
        socialMedia,
        expertise: expertise.map((area: string) => ({ area })),
        photo: photoId, // Photo is required, so always include it
      },
      overrideAccess: true, // Ensure admin can create
    })

    return NextResponse.json({ success: true, doc: speaker })
  } catch (error: any) {
    console.error('Create speaker error:', {
      message: error.message,
      stack: error.stack,
      data: error.data,
      status: error.status,
      statusCode: error.statusCode,
      errors: error.errors,
    })
    
    // Return more detailed error information
    const errorResponse: any = {
      error: error.message || 'Failed to create speaker',
    }
    
    // Include validation errors if available
    if (error.data?.errors) {
      errorResponse.validationErrors = error.data.errors
    }
    
    // Include field-specific errors
    if (error.errors) {
      errorResponse.fieldErrors = error.errors
    }
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = {
        stack: error.stack,
        data: error.data,
      }
    }
    
    return NextResponse.json(
      errorResponse,
      { status: error.status || error.statusCode || 500 }
    )
  }
}



