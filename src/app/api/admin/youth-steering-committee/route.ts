import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30 // 30 seconds max for Vercel serverless

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🚀 Youth Steering Committee API called')
    const payload = await getPayloadClient()
    console.log(`✅ Payload client obtained (${Date.now() - startTime}ms)`)
    
    const body = await request.json()
    console.log('📋 Request body parsed:', {
      hasName: !!body.name,
      hasPhotoUrl: !!body.photoUrl,
      photoUrl: body.photoUrl?.substring(0, 50) + '...',
    })
    
    const {
      name,
      role,
      organization,
      country,
      bio,
      email,
      photoUrl,
      featured,
      order,
      socialMedia,
    } = body
    
    // Validate required fields
    if (!name || !role || !organization || !country || !bio) {
      return NextResponse.json(
        { error: 'Missing required fields: name, role, organization, country, and bio are required' },
        { status: 400 }
      )
    }
    
    // Photo URL is required
    if (!photoUrl || !photoUrl.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Profile photo is required. Please upload a photo.' },
        { status: 400 }
      )
    }

    // Create media record with the blob URL
    let photoId: string | undefined
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
      
      // Use payload.create() like speakers route - Media collection hooks handle external URLs
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
        overrideAccess: true,
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
      
      // Return detailed error information
      const errorResponse: any = {
        error: 'Failed to create media record',
        details: uploadError.message || 'Media record creation failed',
        photoUrl: photoUrl?.substring(0, 100), // Include partial URL for debugging
      }
      
      // Include validation errors if available
      if (uploadError.data?.errors) {
        errorResponse.validationErrors = uploadError.data.errors
      }
      
      // Include field-specific errors
      if (uploadError.errors) {
        errorResponse.fieldErrors = uploadError.errors
      }
      
      // Include stack trace in development
      if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = uploadError.stack
        errorResponse.data = uploadError.data
      }
      
      // Include error code/status
      if (uploadError.status || uploadError.statusCode) {
        errorResponse.statusCode = uploadError.status || uploadError.statusCode
      }
      
      return NextResponse.json(
        errorResponse,
        { status: 500 }
      )
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
          photo: photoId,
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
