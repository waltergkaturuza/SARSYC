import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { put } from '@vercel/blob'

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
    const photoUrl = formData.get('photoUrl') as string | null // Existing URL fallback
    const photoFile = formData.get('photoFile') as File | null
    
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

    // A photo is required on create (either direct file or URL fallback)
    if ((!photoFile || photoFile.size === 0) && (!photoUrl || !photoUrl.startsWith('https://'))) {
      return NextResponse.json(
        { error: 'Professional photo is required. Please upload a photo.' },
        { status: 400 }
      )
    }

    // Create media record: upload to Vercel Blob, then create media with URL only.
    // This bypasses Payload/Sharp file processing which fails with "Expected Uint8Array or ArrayBuffer".
    let photoId: string | undefined
    try {
      let fileForUpload: File | null = photoFile && photoFile.size > 0 ? photoFile : null
      if (!fileForUpload && photoUrl?.startsWith('https://')) {
        const fetched = await fetch(photoUrl)
        if (!fetched.ok) {
          throw new Error(`Could not fetch existing photo URL (${fetched.status})`)
        }
        const blob = await fetched.blob()
        const urlPath = new URL(photoUrl).pathname
        const filename = decodeURIComponent(urlPath.split('/').pop() || `speaker-${name.replace(/\s+/g, '-').toLowerCase()}.jpg`)
        fileForUpload = new File([blob], filename, { type: blob.type || 'image/jpeg' })
      }

      if (!fileForUpload) {
        throw new Error('No photo file available for media upload')
      }

      const blobToken = process.env.BLOB_READ_WRITE_TOKEN
      if (!blobToken) {
        throw new Error('Blob storage not configured')
      }

      const nameHash = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50)
      const fileExt = fileForUpload.name.split('.').pop()?.toLowerCase() || 'jpg'
      const filename = `Speakers/photos/${nameHash}.${fileExt}`

      const blob = await put(filename, fileForUpload, {
        access: 'public',
        token: blobToken,
      })

      const photoUpload = await payload.create({
        collection: 'media',
        data: {
          alt: `Speaker photo: ${name}`,
          url: blob.url,
          filename: blob.pathname?.split('/').pop() || fileForUpload.name,
          mimeType: fileForUpload.type || 'image/jpeg',
        },
        overrideAccess: true,
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



