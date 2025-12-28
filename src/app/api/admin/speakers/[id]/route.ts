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
      })
      oldPhotoId = typeof currentSpeaker.photo === 'string' 
        ? currentSpeaker.photo 
        : (currentSpeaker.photo as any)?.id || null
    } catch (err) {
      console.warn('Could not fetch current speaker for photo cleanup:', err)
    }
    
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
    
    // Upload photo if provided
    let photoId: string | undefined
    if (photoFile && photoFile.size > 0) {
      try {
        // Convert File to Buffer for Payload CMS (required in serverless environments)
        const arrayBuffer = await photoFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Add buffer property to File for Payload/sharp compatibility
        const fileForPayload = Object.assign(photoFile, {
          data: buffer,
          buffer: buffer,
        })
        
        const photoUpload = await payload.create({
          collection: 'media',
          data: {
            alt: `Speaker photo: ${name}`,
          },
          file: fileForPayload,
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



