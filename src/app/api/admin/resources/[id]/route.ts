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
    
    // Extract fields from JSON body
    const title = body.title
    const slug = body.slug
    const description = body.description
    const type = body.type
    const topics = Array.isArray(body.topics) ? body.topics : []
    const year = parseInt(body.year)
    const sarsycEdition = body.sarsycEdition || null
    const authors = Array.isArray(body.authors) ? body.authors : []
    const country = body.country || null
    const language = body.language
    const featured = body.featured === true
    const fileUrl = body.fileUrl || null // URL from blob storage
    
    // Create media record with the blob URL if provided
    let fileId: string | undefined
    if (fileUrl) {
      try {
        // Extract filename from URL for better metadata
        const urlParts = fileUrl.split('/')
        const filename = urlParts[urlParts.length - 1] || 'resource-file'
        
        // Determine MIME type from file extension
        let mimeType = 'application/pdf' // Default
        if (filename.toLowerCase().endsWith('.doc') || filename.toLowerCase().endsWith('.docx')) {
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        } else if (filename.toLowerCase().endsWith('.xls') || filename.toLowerCase().endsWith('.xlsx')) {
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        } else if (filename.toLowerCase().endsWith('.ppt') || filename.toLowerCase().endsWith('.pptx')) {
          mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        } else if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')) {
          mimeType = 'image/jpeg'
        } else if (filename.toLowerCase().endsWith('.png')) {
          mimeType = 'image/png'
        }
        
        // Use Payload's database adapter to create media record with external URL
        const result = await payload.db.collections.media.create({
          data: {
            alt: `Resource file: ${title}`,
            filename: filename,
            mimeType: mimeType,
            url: fileUrl,
            filesize: 0,
            width: null,
            height: null,
          },
        })
        fileId = typeof result === 'string' ? result : result.id
        console.log('✅ Created media record with blob URL:', fileUrl)
      } catch (uploadError: any) {
        console.error('Media record creation error:', uploadError)
        // Continue without file if media creation fails
        console.warn('Resource update proceeding without media record')
      }
    }

    // Update data
    const updateData: any = {
      title,
      slug,
      description,
      type,
      topics,
      year,
      sarsycEdition: sarsycEdition || undefined,
      authors: authors.map((author: string) => ({ author })),
      country: country || undefined,
      language,
      featured,
    }
    
    if (fileId) {
      updateData.file = fileId
    }

    // Update resource
    const resource = await payload.update({
      collection: 'resources',
      id: params.id,
      data: updateData,
    })

    return NextResponse.json({ success: true, doc: resource })
  } catch (error: any) {
    console.error('Update resource error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update resource' },
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
      collection: 'resources',
      id: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete resource error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete resource' },
      { status: 500 }
    )
  }
}



