import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
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
    const abstractFileUrl = formData.get('abstractFileUrl') as string | null // URL from blob storage
    const assignedReviewers = JSON.parse(formData.get('assignedReviewers') as string || '[]')

    // CRITICAL: Never allow "0" / empty / invalid reviewer IDs to reach Payload
    // (prevents: "This relationship field has the following invalid relationships: X 0")
    const cleanAssignedReviewers = Array.isArray(assignedReviewers)
      ? assignedReviewers
          .map((id: any) => String(id).trim())
          .filter((id: string) => {
            if (!id) return false
            if (
              id === '0' ||
              id === '' ||
              id === 'null' ||
              id === 'undefined' ||
              id === 'NaN'
            ) {
              return false
            }
            const n = Number(id)
            return Number.isFinite(n) && n > 0
          })
      : []

    console.log('[Create Abstract] assignedReviewers incoming vs cleaned:', {
      incoming: assignedReviewers,
      cleaned: cleanAssignedReviewers,
    })
    
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
        console.warn('Abstract creation proceeding without media record')
      }
    }

    // Create abstract
    const abstractDoc = await payload.create({
      collection: 'abstracts',
      data: {
        title,
        abstract,
        keywords: keywords.map((k: string) => ({ keyword: k })),
        track,
        primaryAuthor,
        coAuthors: coAuthors.map((ca: any) => ({ name: ca.name, organization: ca.organization })),
        presentationType,
        status: 'received',
        assignedReviewers: cleanAssignedReviewers,
        ...(abstractFileId && { abstractFile: abstractFileId }),
      },
    })

    return NextResponse.json({ success: true, doc: abstractDoc })
  } catch (error: any) {
    console.error('Create abstract error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create abstract' },
      { status: 500 }
    )
  }
}



