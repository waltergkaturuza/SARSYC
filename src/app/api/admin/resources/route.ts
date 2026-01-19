import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60 // Allow up to 60 seconds for file uploads

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const formData = await request.formData()
    
    // Extract form fields
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string
    
    // Safely parse JSON fields
    let topics: string[] = []
    try {
      const topicsStr = formData.get('topics') as string
      if (topicsStr && topicsStr.trim()) {
        topics = JSON.parse(topicsStr)
      }
    } catch (e) {
      console.warn('Failed to parse topics, using empty array:', e)
    }
    
    const year = parseInt(formData.get('year') as string)
    const sarsycEdition = formData.get('sarsycEdition') as string | null
    
    let authors: string[] = []
    try {
      const authorsStr = formData.get('authors') as string
      if (authorsStr && authorsStr.trim()) {
        authors = JSON.parse(authorsStr)
      }
    } catch (e) {
      console.warn('Failed to parse authors, using empty array:', e)
    }
    
    const country = formData.get('country') as string | null
    const language = formData.get('language') as string
    const featured = formData.get('featured') === 'true'
    const fileUrl = formData.get('fileUrl') as string | null // URL from blob storage
    
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
       
        // Create media record in Payload with the external URL.
        // We use the standard Payload create API so that hooks and defaults run correctly.
        const mediaDoc: any = await payload.create({
          collection: 'media',
          data: {
            alt: `Resource file: ${title}`,
            caption: description || '',
            filename,
            mimeType,
            url: fileUrl,
          },
          overrideAccess: true,
        })

        fileId = typeof mediaDoc === 'string' ? mediaDoc : mediaDoc.id
        console.log('✅ Created media record with blob URL for resource:', {
          fileUrl,
          fileId,
        })
      } catch (uploadError: any) {
        console.error('Media record creation error:', uploadError)
        // Continue without file if media creation fails
        console.warn('Resource creation proceeding without media record')
      }
    }

    // Create resource
    const resource = await payload.create({
      collection: 'resources',
      data: {
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
        ...(fileId && { file: fileId }),
      },
    })

    return NextResponse.json({ success: true, doc: resource })
  } catch (error: any) {
    console.error('Create resource error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create resource' },
      { status: 500 }
    )
  }
}



