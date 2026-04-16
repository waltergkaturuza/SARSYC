import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { plainTextToSlate } from '@/lib/newsContent'
import { createNewsFeaturedMedia } from '@/lib/newsFeaturedMediaUpload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
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
    const authorRaw = formData.get('author') as string
    const author = Number(authorRaw)
    const status = formData.get('status') as string
    const featured = formData.get('featured') === 'true'
    const publishedDate = formData.get('publishedDate') as string | null
    const featuredImageFile = formData.get('featuredImage') as File | null
    
    // Upload featured image if provided (Blob + URL media, or buffer fallback)
    let featuredImageId: string | undefined
    if (featuredImageFile && featuredImageFile.size > 0) {
      try {
        featuredImageId = await createNewsFeaturedMedia(
          payload,
          featuredImageFile,
          `Featured image: ${title}`,
        )
      } catch (uploadError: unknown) {
        console.error('Featured media upload error:', uploadError)
        const message =
          uploadError instanceof Error ? uploadError.message : 'Failed to upload featured image'
        return NextResponse.json({ error: message }, { status: 500 })
      }
    }

    const publishedAt =
      publishedDate && status === 'published'
        ? new Date(publishedDate).toISOString()
        : status === 'published'
          ? new Date().toISOString()
          : undefined

    // Create news article (content as Slate blocks from textarea)
    const news = await payload.create({
      collection: 'news',
      data: {
        title,
        slug,
        excerpt,
        content: plainTextToSlate(content),
        category,
        tags: tags.map((tag: string) => ({ tag })),
        author,
        status,
        featured,
        ...(publishedAt && { publishedDate: publishedAt }),
        ...(featuredImageId && { featuredImage: featuredImageId }),
      },
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, doc: news })
  } catch (error: any) {
    console.error('Create news error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create news article' },
      { status: 500 }
    )
  }
}



