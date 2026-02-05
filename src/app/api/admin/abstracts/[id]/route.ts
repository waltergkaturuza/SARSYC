import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUserFromRequest(request)
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'editor')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin or Editor access required to update abstracts.' },
        { status: 403 }
      )
    }

    const payload = await getPayloadClient()
    const formData = await request.formData()
    
    // Extract form fields
    const title = formData.get('title') as string
    const abstract = formData.get('abstract') as string
    const keywords = JSON.parse(formData.get('keywords') as string || '[]')
    const track = formData.get('track') as string
    const primaryAuthor = JSON.parse(formData.get('primaryAuthor') as string || '{}')
    const coAuthors = JSON.parse(formData.get('coAuthors') as string || '[]')
    const presentationType = formData.get('presentationType') as string
    const status = formData.get('status') as string
    const reviewerComments = formData.get('reviewerComments') as string | null
    const adminNotes = formData.get('adminNotes') as string | null
    const assignedSession = formData.get('assignedSession') as string | null
    const abstractFileUrl = formData.get('abstractFileUrl') as string | null // URL from blob storage
    const assignedReviewersRaw = formData.get('assignedReviewers')
    let assignedReviewers: any[] = []
    try {
      const parsed = JSON.parse((assignedReviewersRaw as string) || '[]')
      if (Array.isArray(parsed)) {
        assignedReviewers = parsed
      } else if (parsed) {
        assignedReviewers = [parsed]
      }
    } catch {
      assignedReviewers = []
    }
    
    // Create media record with the blob URL if provided
    let abstractFileId: string | undefined
    if (abstractFileUrl) {
      try {
        // Extract filename from URL for better metadata
        const urlParts = abstractFileUrl.split('/')
        const filename = urlParts[urlParts.length - 1] || 'abstract-file'
        
        // Determine MIME type from file extension
        let mimeType = 'application/pdf' // Default
        if (filename.toLowerCase().endsWith('.doc') || filename.toLowerCase().endsWith('.docx')) {
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
        
        // Create media record with the blob URL
        const result = await payload.db.collections.media.create({
          data: {
            alt: `Abstract file: ${title}`,
            filename: filename,
            mimeType: mimeType,
            url: abstractFileUrl,
            filesize: 0,
            width: null,
            height: null,
          },
        })
        abstractFileId = typeof result === 'string' ? result : result.id
        console.log('✅ Created media record with blob URL:', abstractFileUrl)
      } catch (uploadError: any) {
        console.error('Media record creation error:', uploadError)
        // Continue without file if media creation fails
        console.warn('Abstract update proceeding without media record')
      }
    }

    // Valid track values from Abstracts collection
    const validTracks = [
      'education-rights',
      'hiv-aids',
      'ncd-prevention',
      'digital-health',
      'mental-health',
    ]
    
    // Validate track field
    const normalizedTrack = track?.trim()
    if (!normalizedTrack || !validTracks.includes(normalizedTrack)) {
      console.error('[Abstract Update] Invalid track value:', track)
      // Don't update track if invalid (keep existing value)
    }
    
    // Update data
    const updateData: any = {
      title,
      abstract,
      keywords: keywords.map((k: string) => ({ keyword: k })),
      primaryAuthor,
      coAuthors: coAuthors.map((ca: any) => ({ name: ca.name, organization: ca.organization })),
      presentationType,
      status,
    }
    
    // Only include track if it's valid
    if (normalizedTrack && validTracks.includes(normalizedTrack)) {
      updateData.track = normalizedTrack
    }
    
    // Always include these fields, even if empty (to allow clearing)
    updateData.reviewerComments = reviewerComments || null
    updateData.adminNotes = adminNotes || null
    
    if (abstractFileId) {
      updateData.abstractFile = abstractFileId
    }
    updateData.assignedSession = assignedSession || null
    
    // Normalize and validate assignedReviewers: ensure IDs exist and are reviewers
    if (Array.isArray(assignedReviewers) && assignedReviewers.length > 0) {
      // Normalize to string IDs
      const normalizedIds = assignedReviewers
        .map((value: any) => {
          if (typeof value === 'object' && value !== null) {
            return (value.id || value.value || '').toString()
          }
          return value?.toString()
        })
        .filter((id: string) => id && id.trim().length > 0)
      
      // Validate that these IDs exist and are reviewers
      if (normalizedIds.length > 0) {
        try {
          const reviewerUsers = await payload.find({
            collection: 'users',
            where: {
              id: { in: normalizedIds },
              role: { equals: 'reviewer' },
            },
            limit: normalizedIds.length,
          })
          
          // Only use IDs that exist and are reviewers
          const validReviewerIds = reviewerUsers.docs.map((user: any) => 
            typeof user.id === 'object' ? user.id.toString() : user.id?.toString()
          ).filter(Boolean)
          
          updateData.assignedReviewers = validReviewerIds
          console.log('[Abstract Update] Validated reviewers:', {
            requested: normalizedIds,
            valid: validReviewerIds,
          })
        } catch (validationError: any) {
          console.error('[Abstract Update] Reviewer validation error:', validationError)
          // If validation fails, set to empty array to avoid invalid IDs
          updateData.assignedReviewers = []
        }
      } else {
        updateData.assignedReviewers = []
      }
    } else {
      // If empty array or invalid, set to empty array (not null/undefined)
      updateData.assignedReviewers = []
    }
    
    // Ensure track is a valid value or don't include it if empty
    if (!track || !track.trim()) {
      // Don't update track if it's empty (keep existing value)
      delete updateData.track
    }

    // Log update data for debugging (without sensitive info)
    console.log('[Abstract Update] Updating abstract:', params.id, {
      track: updateData.track,
      assignedReviewersCount: updateData.assignedReviewers?.length || 0,
      status: updateData.status,
    })

    // Update abstract (overrideAccess so admin/editor can update assignedReviewers and other fields)
    const abstractDoc = await payload.update({
      collection: 'abstracts',
      id: params.id,
      data: updateData,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, doc: abstractDoc })
  } catch (error: any) {
    console.error('Update abstract error:', error)
    // Payload validation errors often have a 'data' property with field-specific errors
    const errorMessage = error.data?.errors
      ? Object.entries(error.data.errors)
          .map(([field, err]: [string, any]) => `${field}: ${err.message || err}`)
          .join(', ')
      : error.message || 'Failed to update abstract'
    
    return NextResponse.json(
      { error: errorMessage },
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
      collection: 'abstracts',
      id: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete abstract error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete abstract' },
      { status: 500 }
    )
  }
}



