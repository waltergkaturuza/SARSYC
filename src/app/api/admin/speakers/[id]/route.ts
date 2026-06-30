import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { getPayloadClient } from '@/lib/payload'
import { ensureSpeakersLatestColumns } from '@/lib/ensureSpeakersSchema'
import { createMediaFromBlobUrl } from '@/lib/createMediaFromUrl'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayloadClient()
    await ensureSpeakersLatestColumns(payload)
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
    const featuredOrderRaw = formData.get('featuredOrder') as string | null
    const featuredOrder =
      featured && featuredOrderRaw && featuredOrderRaw.trim() !== ''
        ? Number.parseInt(featuredOrderRaw, 10)
        : null
    const socialMedia = JSON.parse(formData.get('socialMedia') as string || '{}')
    const expertise = JSON.parse(formData.get('expertise') as string || '[]')
    const abstractTitle = formData.get('abstractTitle') as string | null
    // Photo URL — already uploaded to Blob by the form on file select
    const photoUrl = formData.get('photoUrl') as string | null

    // Create media record for new photo — insert directly to bypass upload validation
    let photoId: string | undefined
    if (photoUrl?.startsWith('https://')) {
      try {
        photoId = await createMediaFromBlobUrl(payload, photoUrl, `Speaker photo: ${name}`)
        console.log(`✅ Media record created for speaker ${params.id}: ${photoId}`)
      } catch (uploadError: any) {
        console.error('Media insert error on update:', uploadError.message)
        return NextResponse.json(
          { error: 'Failed to save new photo', details: uploadError.message },
          { status: 500 },
        )
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
      ...(abstractTitle !== null ? { abstractTitle: abstractTitle || null } : {}),
      featured,
      featuredOrder: featured && Number.isFinite(featuredOrder) ? featuredOrder : null,
      socialMedia,
      expertise: expertise.map((area: string) => ({ area })),
    }
    
    // Add email if provided
    if (email) {
      updateData.email = email.toLowerCase().trim()
    }
    
    if (photoId) {
      updateData.photo = /^\d+$/.test(photoId) ? Number(photoId) : photoId
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
        let oldPhotoUrl: string | null = null
        try {
          const oldPhotoDoc = await payload.findByID({
            collection: 'media',
            id: oldPhotoId,
            depth: 0,
            overrideAccess: true,
          })
          oldPhotoUrl =
            (oldPhotoDoc as { thumbnailURL?: string; url?: string })?.thumbnailURL ||
            oldPhotoDoc?.url ||
            null
        } catch {
          // Continue with media record deletion even if URL lookup fails
        }

        await payload.delete({
          collection: 'media',
          id: oldPhotoId,
          overrideAccess: true,
        })
        console.log(`🗑️  Deleted old photo ${oldPhotoId} for speaker ${params.id}`)

        if (oldPhotoUrl?.startsWith('https://')) {
          try {
            await del(oldPhotoUrl)
            console.log(`🗑️  Deleted old blob file: ${oldPhotoUrl}`)
          } catch (blobError: unknown) {
            const message = blobError instanceof Error ? blobError.message : String(blobError)
            console.warn(`⚠️  Could not delete old blob file ${oldPhotoUrl}:`, message)
          }
        }
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

    let photoId: string | null = null
    let photoUrl: string | null = null
    try {
      const speaker = await payload.findByID({
        collection: 'speakers',
        id: params.id,
        depth: 1,
        overrideAccess: true,
      })
      photoId =
        typeof speaker.photo === 'string'
          ? speaker.photo
          : (speaker.photo as { id?: string })?.id || null

      if (photoId) {
        try {
          const photoDoc = await payload.findByID({
            collection: 'media',
            id: photoId,
            depth: 0,
            overrideAccess: true,
          })
          photoUrl =
            (photoDoc as { thumbnailURL?: string; url?: string })?.thumbnailURL ||
            photoDoc?.url ||
            null
        } catch (photoErr: unknown) {
          const message = photoErr instanceof Error ? photoErr.message : String(photoErr)
          console.warn('Could not fetch speaker photo for deletion:', message)
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      console.warn('Could not fetch speaker for photo cleanup:', message)
    }

    await payload.delete({
      collection: 'speakers',
      id: params.id,
      overrideAccess: true,
    })

    if (photoId && photoUrl?.startsWith('https://')) {
      try {
        await del(photoUrl)
        console.log(`🗑️  Deleted blob file: ${photoUrl}`)
        await payload.delete({
          collection: 'media',
          id: photoId,
          overrideAccess: true,
        })
        console.log(`🗑️  Deleted photo media record ${photoId}`)
      } catch (deleteError: unknown) {
        const message = deleteError instanceof Error ? deleteError.message : String(deleteError)
        console.warn('Could not delete speaker photo after deletion:', message)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete speaker error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete speaker' },
      { status: 500 }
    )
  }
}



