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
    
    // Extract form fields
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string
    const topics = JSON.parse(formData.get('topics') as string || '[]')
    const year = parseInt(formData.get('year') as string)
    const sarsycEdition = formData.get('sarsycEdition') as string | null
    const authors = JSON.parse(formData.get('authors') as string || '[]')
    const country = formData.get('country') as string | null
    const language = formData.get('language') as string
    const featured = formData.get('featured') === 'true'
    const resourceFile = formData.get('file') as File | null
    
    // Upload file if provided
    let fileId: string | undefined
    if (resourceFile && resourceFile.size > 0) {
      const fileUpload = await payload.create({
        collection: 'media',
        data: {},
        file: resourceFile,
      })
      fileId = typeof fileUpload === 'string' ? fileUpload : fileUpload.id
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

