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
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const category = JSON.parse(formData.get('category') as string || '[]')
    const tags = JSON.parse(formData.get('tags') as string || '[]')
    const author = formData.get('author') as string
    const status = formData.get('status') as string
    const featured = formData.get('featured') === 'true'
    const publishedDate = formData.get('publishedDate') as string | null
    const featuredImageFile = formData.get('featuredImage') as File | null
    
    // Upload featured image if provided
    let featuredImageId: string | undefined
    if (featuredImageFile && featuredImageFile.size > 0) {
      const imageUpload = await payload.create({
        collection: 'media',
        data: {},
        file: featuredImageFile,
      })
      featuredImageId = typeof imageUpload === 'string' ? imageUpload : imageUpload.id
    }

    // Update data
    const updateData: any = {
      title,
      slug,
      excerpt,
      content,
      category,
      tags: tags.map((tag: string) => ({ tag })),
      author,
      status,
      featured,
    }
    
    if (publishedDate) {
      updateData.publishedDate = new Date(publishedDate).toISOString()
    }
    if (featuredImageId) {
      updateData.featuredImage = featuredImageId
    }

    // Update news article
    const news = await payload.update({
      collection: 'news',
      id: params.id,
      data: updateData,
    })

    return NextResponse.json({ success: true, doc: news })
  } catch (error: any) {
    console.error('Update news error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update news article' },
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
      collection: 'news',
      id: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete news error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete news article' },
      { status: 500 }
    )
  }
}

