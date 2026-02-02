import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Get current member to find old photo ID
    let oldPhotoId: string | null = null
    try {
      const currentMember = await payload.findByID({
        collection: 'youth-steering-committee',
        id: params.id,
        depth: 0,
        overrideAccess: true,
      })
      oldPhotoId = typeof currentMember.photo === 'string' 
        ? currentMember.photo 
        : (currentMember.photo as any)?.id || null
    } catch (err: any) {
      console.warn('Could not fetch current member for photo cleanup:', err?.message || err)
    }
    
    // Create media record with photo URL if provided
    let photoId: string | undefined
    if (photoUrl && photoUrl.startsWith('https://')) {
      try {
        console.log('Creating media record with blob URL for update...', photoUrl)
        
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
        photoId = typeof photoUpload === 'string' ? photoUpload : photoUpload.id
        
        console.log(`✅ New photo uploaded for committee member ${params.id}: ${photoId}`)
      } catch (uploadError: any) {
        console.error('Photo upload error:', uploadError)
        console.warn('Committee member update proceeding without photo')
      }
    }

    // Update data
    const updateData: any = {
      name,
      role,
      organization,
      country,
      bio,
      featured: featured || false,
      order: order || 0,
      socialMedia: socialMedia || {},
    }
    
    if (email) {
      updateData.email = email.trim()
    }
    
    if (photoId) {
      updateData.photo = photoId
    }

    // Update committee member
    const member = await payload.update({
      collection: 'youth-steering-committee',
      id: params.id,
      data: updateData,
      overrideAccess: true,
    })

    // Delete old photo if a new one was uploaded and it's different
    if (photoId && oldPhotoId && oldPhotoId !== photoId) {
      try {
        await payload.delete({
          collection: 'media',
          id: oldPhotoId,
          overrideAccess: true,
        })
        console.log(`🗑️  Deleted old photo ${oldPhotoId} for committee member ${params.id}`)
      } catch (deleteError: any) {
        console.warn(`⚠️  Could not delete old photo ${oldPhotoId}:`, deleteError.message)
      }
    }

    return NextResponse.json({ success: true, doc: member })
  } catch (error: any) {
    console.error('Update committee member error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update committee member' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayloadClient()
    
    await payload.delete({
      collection: 'youth-steering-committee',
      id: params.id,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete committee member error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete committee member' },
      { status: 500 }
    )
  }
}
