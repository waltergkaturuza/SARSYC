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
    const email = formData.get('email') as string
    const title = formData.get('title') as string
    const organization = formData.get('organization') as string
    const country = formData.get('country') as string
    const bio = formData.get('bio') as string
    const type = JSON.parse(formData.get('type') as string || '[]')
    const featured = formData.get('featured') === 'true'
    const socialMedia = JSON.parse(formData.get('socialMedia') as string || '{}')
    const expertise = JSON.parse(formData.get('expertise') as string || '[]')
    const photoUrl = formData.get('photoUrl') as string | null // Photo URL from client-side upload
    
    // Debug: Log all form data keys
    console.log('Form data keys:', Array.from(formData.keys()))
    console.log('Photo URL received:', {
      exists: !!photoUrl,
      url: photoUrl,
    })
    
    // Validate required fields
    if (!name || !email || !title || !organization || !country || !bio) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, title, organization, country, and bio are required' },
        { status: 400 }
      )
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      )
    }

    if (!type || type.length === 0) {
      return NextResponse.json(
        { error: 'At least one speaker type is required' },
        { status: 400 }
      )
    }

    // Photo URL is required - validate it's provided
    if (!photoUrl || !photoUrl.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Professional photo is required. Please upload a photo.' },
        { status: 400 }
      )
    }

    // Create media record with the blob URL
    let photoId: string | undefined
    try {
      console.log('Creating media record with blob URL...', photoUrl)
      
      // Extract filename from URL for better metadata
      const urlPath = new URL(photoUrl).pathname
      const filename = urlPath.split('/').pop() || `speaker-${name.replace(/\s+/g, '-').toLowerCase()}.jpg`
      
      // Decode URL-encoded filename
      const decodedFilename = decodeURIComponent(filename)
      
      // Determine MIME type from filename
      const mimeType = decodedFilename.toLowerCase().endsWith('.png') ? 'image/png' :
                      decodedFilename.toLowerCase().endsWith('.gif') ? 'image/gif' :
                      decodedFilename.toLowerCase().endsWith('.webp') ? 'image/webp' :
                      'image/jpeg' // Default to JPEG
      
      const photoUpload = await payload.create({
        collection: 'media',
        data: {
          alt: `Speaker photo: ${name}`,
          url: photoUrl, // Set the URL directly (for Vercel Blob)
          filename: decodedFilename,
          mimeType: mimeType,
          // Note: filesize, width, height will be set by Payload if it can process the image
          // For external URLs, these may remain null, which is fine
        },
        overrideAccess: true, // Allow admin uploads
      })
      
      console.log('Media record created:', {
        type: typeof photoUpload,
        id: typeof photoUpload === 'string' ? photoUpload : photoUpload?.id,
        hasId: typeof photoUpload === 'object' && photoUpload !== null && 'id' in photoUpload,
      })
      
      photoId = typeof photoUpload === 'string' ? photoUpload : photoUpload?.id
      
      if (!photoId) {
        console.error('Media record creation returned no ID:', photoUpload)
        return NextResponse.json(
          { 
            error: 'Failed to create media record - no ID returned',
            details: 'The media record was created but no file ID was returned',
          },
          { status: 500 }
        )
      }
      
      console.log(`✅ Media record created for speaker photo: ${photoId}`)
    } catch (uploadError: any) {
      console.error('Media record creation error details:', {
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
          error: 'Failed to create media record',
          details: uploadError.message || 'Media record creation failed',
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
        { error: 'Failed to create media record - no photo ID returned' },
        { status: 500 }
      )
    }

    // Create speaker
    const speaker = await payload.create({
      collection: 'speakers',
      data: {
        name,
        email: email.toLowerCase().trim(),
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



