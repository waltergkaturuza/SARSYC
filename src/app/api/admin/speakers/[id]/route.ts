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
    const formData = await request.formData()
    
    // Get current speaker to find old photo ID
    let oldPhotoId: string | null = null
    try {
      const currentSpeaker = await payload.findByID({
        collection: 'speakers',
        id: params.id,
        depth: 0, // Don't need full population, just the photo ID
        overrideAccess: true,
      })
      oldPhotoId = typeof currentSpeaker.photo === 'string' 
        ? currentSpeaker.photo 
        : (currentSpeaker.photo as any)?.id || null
    } catch (err: any) {
      // Log but don't fail - photo cleanup is optional
      console.warn('Could not fetch current speaker for photo cleanup:', err?.message || err)
      // Continue without old photo cleanup
    }
    
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
    
    // Create media record with photo URL if provided
    let photoId: string | undefined
    if (photoUrl && photoUrl.startsWith('https://')) {
      try {
        console.log('Creating media record with blob URL for update...', photoUrl)
        
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
            // DON'T set filename for external URLs - it causes Payload to generate /api/media/file/ paths
            // filename: decodedFilename,
            mimeType: mimeType,
            // Note: filesize, width, height will be set by Payload if it can process the image
            // For external URLs, these may remain null, which is fine
          },
          overrideAccess: true, // Allow admin uploads
        })
        photoId = typeof photoUpload === 'string' ? photoUpload : photoUpload.id
        
        console.log(`✅ New photo uploaded for speaker ${params.id}: ${photoId}`)
      } catch (uploadError: any) {
        console.error('Photo upload error:', uploadError)
        // Continue without photo if upload fails
        console.warn('Speaker update proceeding without photo')
      }
    }

    // Update data
    const updateData: any = {
      name,
      title,
      organization,
      country,
      bio,
      type,
      featured,
      socialMedia,
      expertise: expertise.map((area: string) => ({ area })),
    }
    
    // Add email if provided
    if (email) {
      updateData.email = email.toLowerCase().trim()
    }
    
    if (photoId) {
      updateData.photo = photoId
    }

    // Update speaker
    const speaker = await payload.update({
      collection: 'speakers',
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
        console.log(`🗑️  Deleted old photo ${oldPhotoId} for speaker ${params.id}`)
      } catch (deleteError: any) {
        // Log but don't fail - old photo cleanup is not critical
        console.warn(`⚠️  Could not delete old photo ${oldPhotoId}:`, deleteError.message)
      }
    }

    return NextResponse.json({ success: true, doc: speaker })
  } catch (error: any) {
    console.error('Update speaker error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update speaker' },
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
      collection: 'speakers',
      id: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete speaker error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete speaker' },
      { status: 500 }
    )
  }
}



