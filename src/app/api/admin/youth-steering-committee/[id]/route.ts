import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { del } from '@vercel/blob'

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
    
    // Get current member to find old photo ID and URL
    let oldPhotoId: string | null = null
    let oldPhotoUrl: string | null = null
    try {
      const currentMember = await payload.findByID({
        collection: 'youth-steering-committee',
        id: params.id,
        depth: 1, // Need depth 1 to get photo URL
        overrideAccess: true,
      })
      oldPhotoId = typeof currentMember.photo === 'string' 
        ? currentMember.photo 
        : (currentMember.photo as any)?.id || null
      
      // Get the photo URL from the media record
      if (oldPhotoId) {
        try {
          const oldPhotoDoc = await payload.findByID({
            collection: 'media',
            id: oldPhotoId,
            depth: 0,
            overrideAccess: true,
          })
          oldPhotoUrl = oldPhotoDoc?.url || null
        } catch (photoErr: any) {
          console.warn('Could not fetch old photo URL:', photoErr?.message || photoErr)
        }
      }
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
        
        // Use payload.create() like speakers route - Media collection hooks handle external URLs
        const photoUpload = await payload.create({
          collection: 'media',
          data: {
            alt: `Youth Steering Committee member photo: ${name}`,
            url: photoUrl,
            // DON'T set filename for external URLs - it causes Payload to generate /api/media/file/ paths
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

    // Delete old photo blob file and media record if a new one was uploaded
    if (photoId && oldPhotoId && oldPhotoId !== photoId && oldPhotoUrl) {
      try {
        // First, delete the blob file from Vercel Blob storage
        if (oldPhotoUrl.startsWith('https://')) {
          try {
            await del(oldPhotoUrl)
            console.log(`🗑️  Deleted old blob file: ${oldPhotoUrl}`)
          } catch (blobDeleteError: any) {
            console.warn(`⚠️  Could not delete old blob file ${oldPhotoUrl}:`, blobDeleteError.message)
            // Continue to delete media record even if blob deletion fails
          }
        }
        
        // Then delete the Payload media record
        await payload.delete({
          collection: 'media',
          id: oldPhotoId,
          overrideAccess: true,
        })
        console.log(`🗑️  Deleted old photo media record ${oldPhotoId} for committee member ${params.id}`)
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
    
    // Get member data to find photo before deletion
    let photoId: string | null = null
    let photoUrl: string | null = null
    try {
      const member = await payload.findByID({
        collection: 'youth-steering-committee',
        id: params.id,
        depth: 1, // Need depth 1 to get photo URL
        overrideAccess: true,
      })
      photoId = typeof member.photo === 'string' 
        ? member.photo 
        : (member.photo as any)?.id || null
      
      // Get the photo URL from the media record
      if (photoId) {
        try {
          const photoDoc = await payload.findByID({
            collection: 'media',
            id: photoId,
            depth: 0,
            overrideAccess: true,
          })
          photoUrl = photoDoc?.url || null
        } catch (photoErr: any) {
          console.warn('Could not fetch photo URL for deletion:', photoErr?.message || photoErr)
        }
      }
    } catch (err: any) {
      console.warn('Could not fetch member for photo cleanup:', err?.message || err)
    }
    
    // Delete the member
    await payload.delete({
      collection: 'youth-steering-committee',
      id: params.id,
      overrideAccess: true,
    })
    
    // Delete the photo blob file and media record
    if (photoId && photoUrl && photoUrl.startsWith('https://')) {
      try {
        // Delete blob file from Vercel Blob storage
        await del(photoUrl)
        console.log(`🗑️  Deleted blob file: ${photoUrl}`)
        
        // Delete Payload media record
        await payload.delete({
          collection: 'media',
          id: photoId,
          overrideAccess: true,
        })
        console.log(`🗑️  Deleted photo media record ${photoId}`)
      } catch (deleteError: any) {
        console.warn(`⚠️  Could not delete photo for deleted member:`, deleteError.message)
        // Don't fail the deletion if photo cleanup fails
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete committee member error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete committee member' },
      { status: 500 }
    )
  }
}
