import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30 // 30 seconds max for Vercel serverless

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🚀 Youth Steering Committee API called')
    
    // Log Content-Type header to debug the issue
    const contentType = request.headers.get('content-type') || ''
    console.log('📋 Content-Type header:', contentType)
    console.log('📋 Is multipart?', contentType.includes('multipart/form-data'))
    
    const payload = await getPayloadClient()
    console.log(`✅ Payload client obtained (${Date.now() - startTime}ms)`)
    
    // Use FormData like speakers route - this is the key difference!
    const formData = await request.formData()
    
    // Extract form fields
    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const organization = formData.get('organization') as string
    const country = formData.get('country') as string
    const bio = formData.get('bio') as string
    const email = formData.get('email') as string | null
    const photoUrl = formData.get('photoUrl') as string | null // Photo URL from client-side upload
    const featured = formData.get('featured') === 'true'
    const order = formData.get('order') ? parseInt(formData.get('order') as string) : 0
    const socialMedia = JSON.parse(formData.get('socialMedia') as string || '{}')
    
    // Debug: Log all form data keys
    console.log('Form data keys:', Array.from(formData.keys()))
    console.log('Photo URL received:', {
      exists: !!photoUrl,
      url: photoUrl,
    })
    
    // Validate required fields
    if (!name || !role || !organization || !country || !bio) {
      return NextResponse.json(
        { error: 'Missing required fields: name, role, organization, country, and bio are required' },
        { status: 400 }
      )
    }
    
    // Photo URL is optional temporarily - validate format if provided
    let photoId: string | undefined
    if (photoUrl) {
      console.log('🔍 Photo URL validation:', {
        photoUrl: photoUrl,
        type: typeof photoUrl,
        isString: typeof photoUrl === 'string',
        startsWithHttps: typeof photoUrl === 'string' && photoUrl.startsWith('https://'),
        length: typeof photoUrl === 'string' ? photoUrl.length : 0,
      })
      
      if (typeof photoUrl !== 'string' || !photoUrl.startsWith('https://')) {
        return NextResponse.json(
          { 
            error: 'Invalid photo URL format',
            details: `Photo URL must be a valid HTTPS URL. Received: ${photoUrl?.substring(0, 50)}`,
          },
          { status: 400 }
        )
      }

      // Create media record with the blob URL
      // Determine MIME type from URL (outside try block for error logging)
      const urlPath = new URL(photoUrl).pathname
      const filename = urlPath.split('/').pop() || `committee-member-${name.replace(/\s+/g, '-').toLowerCase()}.jpg`
      const decodedFilename = decodeURIComponent(filename)
      const mimeType = decodedFilename.toLowerCase().endsWith('.png') ? 'image/png' :
                      decodedFilename.toLowerCase().endsWith('.gif') ? 'image/gif' :
                      decodedFilename.toLowerCase().endsWith('.webp') ? 'image/webp' :
                      'image/jpeg'
      
      try {
        console.log('Creating media record with blob URL...', photoUrl)
        console.log(`⏱️  Starting media creation (${Date.now() - startTime}ms elapsed)`)
        
        // Use payload.create() EXACTLY like speakers route - it works there
        // The Media collection hooks should handle external URLs
        const photoUpload = await payload.create({
          collection: 'media',
          data: {
            alt: `Youth Steering Committee member photo: ${name}`,
            url: photoUrl, // Set the URL directly (for Vercel Blob)
            // DON'T set filename for external URLs - it causes Payload to generate /api/media/file/ paths
            mimeType: mimeType,
            // Note: filesize, width, height will be set by Payload if it can process the image
            // For external URLs, these may remain null, which is fine
          },
          overrideAccess: true, // Allow admin uploads
        })
        
        console.log(`⏱️  Media creation completed (${Date.now() - startTime}ms elapsed)`)
        
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
        
        console.log(`✅ Media record created for committee member photo: ${photoId}`)
      } catch (uploadError: any) {
        console.error('❌ Media record creation error details:', {
          message: uploadError.message,
          stack: uploadError.stack,
          data: uploadError.data,
          status: uploadError.status,
          statusCode: uploadError.statusCode,
          errors: uploadError.errors,
          name: uploadError.name,
          photoUrl: photoUrl?.substring(0, 100),
          mimeType,
        })
        
        return NextResponse.json(
          { 
            error: 'Failed to create media record',
            details: uploadError.message || 'Media record creation failed',
            photoUrl: photoUrl?.substring(0, 50),
          },
          { status: 500 }
        )
      }
    } else {
      console.log('⚠️  No photo URL provided - creating member without photo (temporarily allowed)')
    }

    // Create committee member
    try {
      console.log(`⏱️  Starting committee member creation (${Date.now() - startTime}ms elapsed)`)
      console.log('Creating committee member with data:', {
        name,
        role,
        organization,
        country,
        hasBio: !!bio,
        bioType: typeof bio,
        bioIsArray: Array.isArray(bio),
        hasEmail: !!email,
        photoId,
        featured,
        order,
      })

      const member = await payload.create({
        collection: 'youth-steering-committee',
        data: {
          name,
          role,
          organization,
          country,
          bio: typeof bio === 'string' ? bio : (Array.isArray(bio) ? bio : JSON.stringify(bio)),
          email: email?.trim() || undefined,
          photo: photoId || undefined, // Optional - only set if photo was uploaded
          featured: featured || false,
          order: order || 0,
          socialMedia: socialMedia || {},
        },
        overrideAccess: true,
      })
      
      console.log(`⏱️  Committee member creation completed (${Date.now() - startTime}ms elapsed)`)

      console.log('✅ Committee member created successfully:', member.id)
      return NextResponse.json({ success: true, doc: member })
    } catch (memberError: any) {
      console.error('Committee member creation error details:', {
        message: memberError.message,
        stack: memberError.stack,
        data: memberError.data,
        status: memberError.status,
        statusCode: memberError.statusCode,
        errors: memberError.errors,
        name: memberError.name,
      })

      // If member creation fails, try to clean up the media record we just created
      if (photoId) {
        try {
          console.log('Attempting to clean up media record:', photoId)
          await payload.delete({
            collection: 'media',
            id: photoId,
            overrideAccess: true,
          })
          console.log('✅ Cleaned up orphaned media record')
        } catch (cleanupError: any) {
          console.warn('⚠️ Could not clean up orphaned media record:', cleanupError.message)
        }
      }

      const errorResponse: any = {
        error: memberError.message || 'Failed to create committee member',
      }
      
      // Check if it's a table doesn't exist error
      if (memberError.message?.includes('does not exist') || 
          memberError.message?.includes('relation') ||
          memberError.message?.includes('table')) {
        errorResponse.error = 'Database table does not exist. Please run the migration or SQL script first.'
        errorResponse.hint = 'Run the SQL script: scripts/create_youth_steering_committee_table.sql in Neon database'
      }
      
      if (memberError.data?.errors) {
        errorResponse.validationErrors = memberError.data.errors
      }
      
      if (memberError.errors) {
        errorResponse.fieldErrors = memberError.errors
      }
      
      if (process.env.NODE_ENV === 'development') {
        errorResponse.details = {
          stack: memberError.stack,
          data: memberError.data,
        }
      }
      
      return NextResponse.json(
        errorResponse,
        { status: memberError.status || memberError.statusCode || 500 }
      )
    }
  } catch (error: any) {
    console.error('Create committee member error (outer catch):', error)
    
    const errorResponse: any = {
      error: error.message || 'Failed to create committee member',
    }
    
    if (error.data?.errors) {
      errorResponse.validationErrors = error.data.errors
    }
    
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
