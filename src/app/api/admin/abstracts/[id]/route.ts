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
    
    // First, fetch the existing abstract to see what's currently stored
    let existingAbstract: any = null
    try {
      existingAbstract = await payload.findByID({
        collection: 'abstracts',
        id: params.id,
        overrideAccess: true,
      })
      console.log('[Abstract Update] Existing abstract:', {
        id: params.id,
        track: existingAbstract?.track,
        assignedReviewers: existingAbstract?.assignedReviewers,
      })
    } catch (fetchError: any) {
      console.error('[Abstract Update] Error fetching existing abstract:', fetchError)
      return NextResponse.json(
        { error: 'Abstract not found' },
        { status: 404 }
      )
    }
    
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
    // Payload expects relationship fields as multiple form-data entries with the same name
    // OR as a JSON string. Handle both formats.
    const assignedReviewersRaw = formData.getAll('assignedReviewers')
    
    console.log('[Abstract Update] Raw form data:', {
      track,
      assignedReviewersRaw,
      assignedReviewersRawType: typeof assignedReviewersRaw,
      assignedReviewersRawLength: Array.isArray(assignedReviewersRaw) ? assignedReviewersRaw.length : 'not array',
      status,
    })
    
    let assignedReviewers: any[] = []
    
    // Handle multiple form-data fields (Payload's preferred format)
    if (Array.isArray(assignedReviewersRaw) && assignedReviewersRaw.length > 0) {
      // Check if first item is a JSON string (legacy format)
      const firstItem = assignedReviewersRaw[0]
      if (typeof firstItem === 'string' && firstItem.startsWith('[') && firstItem.endsWith(']')) {
        // Legacy JSON string format
        try {
          const parsed = JSON.parse(firstItem)
          assignedReviewers = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : [])
        } catch (parseError) {
          console.error('[Abstract Update] Error parsing JSON assignedReviewers:', parseError)
          assignedReviewers = []
        }
      } else {
        // Multiple form-data fields format (Payload's preferred)
        assignedReviewers = assignedReviewersRaw
          .map((value: any) => String(value).trim())
          .filter((id: string) => id && id !== '[]' && id !== 'null' && id !== 'undefined')
      }
    }
    
    console.log('[Abstract Update] Parsed assignedReviewers:', assignedReviewers)
    
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
    
    // Validate and normalize track field - MUST have a valid track
    const normalizedTrack = track?.trim()
    let finalTrack: string
    
    if (normalizedTrack && validTracks.includes(normalizedTrack)) {
      finalTrack = normalizedTrack
    } else {
      // If empty or invalid, use existing track or default
      if (existingAbstract?.track && validTracks.includes(existingAbstract.track)) {
        finalTrack = existingAbstract.track
        console.warn('[Abstract Update] Empty/invalid track received, using existing:', finalTrack)
      } else {
        finalTrack = 'education-rights' // Default fallback
        console.warn('[Abstract Update] No valid track found, using default:', finalTrack)
      }
    }
    
    // Normalize and validate assignedReviewers: ensure IDs exist and are reviewers
    let finalAssignedReviewers: string[] = []
    
    console.log('[Abstract Update] Raw assignedReviewers from form:', assignedReviewers)
    
    if (Array.isArray(assignedReviewers) && assignedReviewers.length > 0) {
      // Normalize to string IDs and filter out invalid values
      const normalizedIds = assignedReviewers
        .map((value: any) => {
          if (typeof value === 'object' && value !== null) {
            const id = (value.id || value.value || '').toString().trim()
            return id || null
          }
          if (value === null || value === undefined) {
            return null
          }
          return String(value).trim()
        })
        .filter((id: string | null) => {
          // Strict filtering - only allow valid non-empty strings that aren't invalid values
          return id && 
                 id.length > 0 &&
                 id !== '0' && 
                 id !== 'null' && 
                 id !== 'undefined' &&
                 id !== 'NaN' &&
                 id !== 'false' &&
                 id !== 'true'
        })
      
      console.log('[Abstract Update] Normalized reviewer IDs after filtering:', normalizedIds)
      
      // Validate that these IDs exist and are reviewers
      if (normalizedIds.length > 0) {
        try {
          // Fetch all reviewers first to get their IDs
          const allReviewers = await payload.find({
            collection: 'users',
            where: {
              role: { equals: 'reviewer' },
            },
            limit: 1000,
            overrideAccess: true,
          })
          
          const validReviewerIdStrings = allReviewers.docs.map((user: any) => {
            const id = user.id
            const idStr = typeof id === 'object' ? id.toString() : String(id)
            return idStr.trim()
          })
          
          console.log('[Abstract Update] All valid reviewer IDs from DB:', validReviewerIdStrings)
          
          // Filter to only include IDs that exist and are reviewers
          finalAssignedReviewers = normalizedIds.filter((id: string) => {
            const isValid = validReviewerIdStrings.includes(id)
            if (!isValid) {
              console.warn('[Abstract Update] Removing invalid reviewer ID:', id)
            }
            return isValid
          })
          
          console.log('[Abstract Update] Final validated reviewers:', {
            requested: normalizedIds,
            valid: finalAssignedReviewers,
            removed: normalizedIds.filter(id => !finalAssignedReviewers.includes(id)),
          })
          
          // If no valid reviewers found, ensure we send empty array (not undefined)
          if (finalAssignedReviewers.length === 0) {
            console.warn('[Abstract Update] No valid reviewers found, will send empty array')
            finalAssignedReviewers = []
          }
        } catch (validationError: any) {
          console.error('[Abstract Update] Reviewer validation error:', validationError)
          // If validation fails, set to empty array to avoid invalid IDs
          finalAssignedReviewers = []
        }
      } else {
        console.log('[Abstract Update] No IDs after normalization, using empty array')
        finalAssignedReviewers = []
      }
    } else {
      console.log('[Abstract Update] assignedReviewers is empty or not array, using empty array')
      finalAssignedReviewers = []
    }
    
    // Build update data object
    const updateData: any = {
      title,
      abstract,
      keywords: keywords.map((k: string) => ({ keyword: k })),
      track: finalTrack, // Always include track (validated above)
      primaryAuthor,
      coAuthors: coAuthors.map((ca: any) => ({ name: ca.name, organization: ca.organization })),
      presentationType,
      status,
      reviewerComments: reviewerComments || null,
      adminNotes: adminNotes || null,
      assignedReviewers: finalAssignedReviewers, // Always include (validated above)
    }
    
    if (abstractFileId) {
      updateData.abstractFile = abstractFileId
    }
    
    if (assignedSession) {
      updateData.assignedSession = assignedSession
    } else {
      updateData.assignedSession = null
    }

    // Log update data for debugging
    console.log('[Abstract Update] Final update data:', {
      track: updateData.track,
      assignedReviewers: updateData.assignedReviewers,
      assignedReviewersCount: updateData.assignedReviewers?.length || 0,
      status: updateData.status,
    })

    // Log the exact data being sent to Payload
    console.log('[Abstract Update] Sending to Payload:', JSON.stringify({
      track: updateData.track,
      assignedReviewers: updateData.assignedReviewers,
      status: updateData.status,
    }, null, 2))

    // Update abstract (overrideAccess so admin/editor can update assignedReviewers and other fields)
    try {
      const abstractDoc = await payload.update({
        collection: 'abstracts',
        id: params.id,
        data: updateData,
        overrideAccess: true,
      })

      console.log('[Abstract Update] ✅ Success:', abstractDoc.id)
      return NextResponse.json({ success: true, doc: abstractDoc })
    } catch (updateError: any) {
      console.error('[Abstract Update] ❌ Payload update error:', {
        message: updateError.message,
        data: updateError.data,
        errors: updateError.data?.errors,
        stack: updateError.stack,
      })
      throw updateError
    }
  } catch (error: any) {
    console.error('[Abstract Update] ❌ Top-level error:', {
      message: error.message,
      data: error.data,
      errors: error.data?.errors,
      name: error.name,
    })
    
    // Payload validation errors often have a 'data' property with field-specific errors
    let errorMessage = error.message || 'Failed to update abstract'
    
    if (error.data?.errors) {
      // Handle array of errors (Payload format: [{ message: '...' }, ...])
      if (Array.isArray(error.data.errors)) {
        errorMessage = error.data.errors
          .map((err: any, index: number) => `${index}: ${err.message || err}`)
          .join(', ')
      } else if (typeof error.data.errors === 'object') {
        // Handle object format: { field: { message: '...' } }
        errorMessage = Object.entries(error.data.errors)
          .map(([field, err]: [string, any]) => {
            if (typeof err === 'object' && err.message) {
              return `${field}: ${err.message}`
            }
            return `${field}: ${err}`
          })
          .join(', ')
      }
    }
    
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



