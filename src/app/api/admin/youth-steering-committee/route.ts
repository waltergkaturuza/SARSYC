import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const body = await request.json()
    
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
    try {
      console.log('Creating media record with blob URL...', photoUrl)
      
      const urlPath = new URL(photoUrl).pathname
      const filename = urlPath.split('/').pop() || `committee-member-${name.replace(/\s+/g, '-').toLowerCase()}.jpg`
      const decodedFilename = decodeURIComponent(filename)
      
      const mimeType = decodedFilename.toLowerCase().endsWith('.png') ? 'image/png' :
                      decodedFilename.toLowerCase().endsWith('.gif') ? 'image/gif' :
                      decodedFilename.toLowerCase().endsWith('.webp') ? 'image/webp' :
                      'image/jpeg'
      
      const photoUpload = await payload.create({
        collection: 'media',
        data: {
          alt: `Youth Steering Committee member photo: ${name}`,
          url: photoUrl,
          mimeType: mimeType,
        },
        overrideAccess: true,
      })
      
      photoId = typeof photoUpload === 'string' ? photoUpload : photoUpload?.id
      
      if (!photoId) {
        console.error('Media record creation returned no ID:', photoUpload)
        return NextResponse.json(
          { error: 'Failed to create media record - no ID returned' },
          { status: 500 }
        )
      }
      
      console.log(`✅ Media record created for committee member photo: ${photoId}`)
    } catch (uploadError: any) {
      console.error('Media record creation error:', uploadError)
      return NextResponse.json(
        { 
          error: 'Failed to create media record',
          details: uploadError.message || 'Media record creation failed',
        },
        { status: 500 }
      )
    }

    // Create committee member
    const member = await payload.create({
      collection: 'youth-steering-committee',
      data: {
        name,
        role,
        organization,
        country,
        bio,
        email: email?.trim() || undefined,
        photo: photoId,
        featured: featured || false,
        order: order || 0,
        socialMedia: socialMedia || {},
      },
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, doc: member })
  } catch (error: any) {
    console.error('Create committee member error:', error)
    
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
