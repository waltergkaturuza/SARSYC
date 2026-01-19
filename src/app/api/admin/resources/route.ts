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
    const resourceFile = formData.get('file') as File | null
    
    // Upload file if provided
    let fileId: string | undefined
    if (resourceFile && resourceFile.size > 0) {
      try {
        const fileUpload = await payload.create({
          collection: 'media',
          data: {
            alt: `Resource file: ${title}`,
          },
          file: resourceFile,
          overrideAccess: true, // Allow admin uploads
        })
        fileId = typeof fileUpload === 'string' ? fileUpload : fileUpload.id
      } catch (uploadError: any) {
        console.error('File upload error:', uploadError)
        // Continue without file if upload fails
        console.warn('Resource creation proceeding without file upload')
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



