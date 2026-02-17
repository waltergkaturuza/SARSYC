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
    // Track whether currently stored reviewers contain obviously invalid values (e.g. "0")
    let hasInvalidExistingIds = false
    try {
      existingAbstract = await payload.findByID({
        collection: 'abstracts',
        id: params.id,
        overrideAccess: true,
      })
      // Check existing assignedReviewers for invalid data
      const existingReviewers = existingAbstract?.assignedReviewers || []
      const existingReviewerIds = Array.isArray(existingReviewers) 
        ? existingReviewers.map((r: any) => {
            const id = typeof r === 'object' && r !== null ? r.id : r
            return String(id).trim()
          })
        : []
      
      hasInvalidExistingIds = existingReviewerIds.some((id: string) => 
        id === '0' || id === '' || id === 'null' || id === 'undefined' || id === 'NaN'
      )
      
      console.log('[Abstract Update] Existing abstract:', {
        id: params.id,
        track: existingAbstract?.track,
        assignedReviewers: existingAbstract?.assignedReviewers,
        existingReviewerIds,
        hasInvalidIds: hasInvalidExistingIds,
        warning: hasInvalidExistingIds ? '⚠️ Existing abstract contains invalid reviewer IDs - will be cleared' : '✅ Existing data looks clean',
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
        // Legacy JSON string format - parse it
        try {
          const parsed = JSON.parse(firstItem)
          assignedReviewers = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : [])
          console.log('[Abstract Update] Parsed JSON string format:', assignedReviewers)
        } catch (parseError) {
          console.error('[Abstract Update] Error parsing JSON assignedReviewers:', parseError)
          assignedReviewers = []
        }
      } else {
        // Multiple form-data fields format (Payload's preferred)
        assignedReviewers = assignedReviewersRaw
          .map((value: any) => String(value).trim())
          .filter((id: string) => {
            // Aggressively filter out invalid values including "0"
            return id && 
                   id.length > 0 &&
                   id !== '[]' && 
                   id !== 'null' && 
                   id !== 'undefined' && 
                   id !== '' &&
                   id !== '0' &&
                   id !== 'NaN' &&
                   id !== 'false' &&
                   id !== 'true'
          })
        console.log('[Abstract Update] Using multiple form-data fields format:', assignedReviewers)
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
    
    // STEP 1: Fetch ALL valid reviewer IDs from database FIRST (database-driven approach)
    let allValidReviewerIds: string[] = []
    try {
      const allReviewers = await payload.find({
        collection: 'users',
        where: {
          role: { in: ['reviewer', 'admin', 'editor'] },
        },
        limit: 1000,
        overrideAccess: true,
      })
      
      allValidReviewerIds = allReviewers.docs.map((user: any) => {
        const id = user.id
        const idStr = typeof id === 'object' ? id.toString() : String(id)
        return idStr.trim()
      })
      
      console.log('[Abstract Update] ✅ Fetched all valid reviewer IDs from DB:', {
        count: allValidReviewerIds.length,
        ids: allValidReviewerIds,
        users: allReviewers.docs.map((u: any) => ({
          id: typeof u.id === 'object' ? u.id.toString() : String(u.id),
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          role: u.role,
        })),
      })
    } catch (dbError: any) {
      console.error('[Abstract Update] ❌ Error fetching reviewers from DB:', dbError)
      // If we can't fetch from DB, reject the update to prevent invalid data
      return NextResponse.json(
        { error: 'Failed to validate reviewers. Please try again.' },
        { status: 500 }
      )
    }
    
    // STEP 2: Normalize and validate assignedReviewers against database IDs
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
      
      // STEP 3: Only keep IDs that exist in the database
      finalAssignedReviewers = normalizedIds.filter((id: string) => {
        const existsInDb = allValidReviewerIds.includes(id)
        if (!existsInDb) {
          console.warn('[Abstract Update] ❌ Removing reviewer ID not found in DB:', id)
        }
        return existsInDb
      })
      
      console.log('[Abstract Update] ✅ Final validated reviewers (database-checked):', {
        requested: normalizedIds,
        valid: finalAssignedReviewers,
        removed: normalizedIds.filter(id => !finalAssignedReviewers.includes(id)),
        dbTotal: allValidReviewerIds.length,
      })
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

    // CRITICAL: Ensure assignedReviewers is ALWAYS an array and NEVER contains "0" or invalid values
    // Double-check before sending to Payload
    const sanitizedAssignedReviewers = Array.isArray(finalAssignedReviewers)
      ? finalAssignedReviewers
          .map((id: any) => String(id).trim())
          .filter((id: string) => {
            // Final safety check - absolutely no invalid values
            return id && 
                   id.length > 0 &&
                   id !== '0' &&
                   id !== 'null' &&
                   id !== 'undefined' &&
                   id !== '' &&
                   id !== 'NaN' &&
                   id !== 'false' &&
                   id !== 'true' &&
                   allValidReviewerIds.includes(id) // Must exist in DB
          })
      : []
    
    // Update the data with sanitized reviewers
    updateData.assignedReviewers = sanitizedAssignedReviewers
    
    // Log update data for debugging
    console.log('[Abstract Update] 📋 Final update data being sent to Payload:', {
      track: updateData.track,
      assignedReviewers: updateData.assignedReviewers,
      assignedReviewersType: typeof updateData.assignedReviewers,
      assignedReviewersIsArray: Array.isArray(updateData.assignedReviewers),
      assignedReviewersCount: updateData.assignedReviewers?.length || 0,
      status: updateData.status,
      allValidReviewerIdsInDb: allValidReviewerIds, // Show what's available in DB
      containsZero: updateData.assignedReviewers.includes('0'),
      containsInvalid: updateData.assignedReviewers.some((id: string) => 
        !allValidReviewerIds.includes(String(id).trim())
      ),
    })

    // Log the exact data being sent to Payload
    console.log('[Abstract Update] Sending to Payload:', JSON.stringify({
      track: updateData.track,
      assignedReviewers: updateData.assignedReviewers,
      status: updateData.status,
    }, null, 2))

    // Update abstract (overrideAccess so admin/editor can update assignedReviewers and other fields)
    // CRITICAL: Clean database relationships first, then update with clean data
    try {
      // STEP 1: Clean up any invalid "0" relationships directly in database using Payload's adapter
      if (hasInvalidExistingIds || existingAbstract?.assignedReviewers) {
        console.log('[Abstract Update] 🗑️ Cleaning invalid relationships from database...')
        try {
          // Use Payload's find to get current relationships, then update to remove "0"
          const currentAbstract = await payload.findByID({
            collection: 'abstracts',
            id: params.id,
            overrideAccess: true,
            depth: 0, // Don't populate relationships
          })
          
          // If current abstract has invalid IDs, clear them first
          const currentReviewers = currentAbstract?.assignedReviewers || []
          const hasZero = Array.isArray(currentReviewers) && currentReviewers.some((r: any) => {
            const id = typeof r === 'object' ? r.id : r
            return String(id).trim() === '0'
          })
          
          if (hasZero) {
            console.log('[Abstract Update] Found "0" in existing relationships, clearing...')
            await payload.update({
              collection: 'abstracts',
              id: params.id,
              data: {
                assignedReviewers: [], // Clear all first
              },
              overrideAccess: true,
            })
            console.log('[Abstract Update] ✅ Cleared invalid relationships')
          }
        } catch (cleanError: any) {
          console.warn('[Abstract Update] ⚠️ Could not clean relationships:', cleanError.message)
          // Continue anyway
        }
      }
      
      // STEP 2: Final verification - ensure assignedReviewers is clean array with no "0"
      // CRITICAL: Keep as strings, don't convert to numbers (to avoid "0" becoming 0)
      const finalCheck = Array.isArray(finalAssignedReviewers) 
        ? finalAssignedReviewers
            .map((id: any) => {
              // Convert to string and trim - keep as string (never convert "0" to number)
              return String(id).trim()
            })
            .filter((id: string) => {
              // ABSOLUTE FILTER: No "0", no empty, must exist in DB
              return id && 
                     id.length > 0 &&
                     id !== '0' && 
                     id !== '' && 
                     id !== 'null' && 
                     id !== 'undefined' &&
                     id !== 'NaN' &&
                     allValidReviewerIds.includes(id)
            })
        : []
      
      // CRITICAL: Always set assignedReviewers explicitly as clean array
      // Never send undefined, null, or any value that could be interpreted as "0"
      updateData.assignedReviewers = finalCheck
      
      console.log('[Abstract Update] 🔍 Final pre-send verification:', {
        assignedReviewers: updateData.assignedReviewers,
        isArray: Array.isArray(updateData.assignedReviewers),
        length: updateData.assignedReviewers.length,
        containsZero: updateData.assignedReviewers.includes('0'),
        allValid: updateData.assignedReviewers.every((id: string) => allValidReviewerIds.includes(String(id).trim())),
        rawValue: JSON.stringify(updateData.assignedReviewers),
      })
      
      // STEP 3: Update assignedReviewers SEPARATELY to avoid Payload merging with existing invalid data
      // This ensures Payload only sees the clean values we want
      console.log('[Abstract Update] 🔄 Updating assignedReviewers separately first...')
      console.log('[Abstract Update] 📤 Sending ONLY these reviewer IDs:', {
        ids: finalCheck,
        count: finalCheck.length,
        type: typeof finalCheck[0],
        containsZero: finalCheck.includes('0') || finalCheck.includes(0),
        allAreStrings: finalCheck.every((id: any) => typeof id === 'string'),
      })
      
      try {
        const reviewerUpdateResult = await payload.update({
          collection: 'abstracts',
          id: params.id,
          data: {
            assignedReviewers: finalCheck, // ONLY the clean reviewer IDs as strings
          },
          overrideAccess: true,
        })
        console.log('[Abstract Update] ✅ Updated assignedReviewers separately with clean data:', finalCheck)
      } catch (reviewerError: any) {
        console.error('[Abstract Update] ❌ Error updating assignedReviewers separately:', {
          message: reviewerError.message,
          data: reviewerError.data,
          errors: reviewerError.data?.errors,
          stack: reviewerError.stack,
        })
        // If reviewer update fails, throw the error - don't continue with other fields
        // This ensures the user knows reviewer assignment failed
        throw reviewerError
      }
      
      // STEP 4: Update all other fields (excluding assignedReviewers since we already updated it)
      const { assignedReviewers: _, ...otherFields } = updateData
      
      console.log('[Abstract Update] 🚀 Calling Payload.update for other fields:', {
        id: params.id,
        fields: Object.keys(otherFields),
        assignedReviewersAlreadySet: finalCheck,
      })
      
      // Update with clean data - assignedReviewers already set separately
      const abstractDoc = await payload.update({
        collection: 'abstracts',
        id: params.id,
        data: otherFields,
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



