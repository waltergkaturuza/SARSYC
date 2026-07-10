import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { plainTextToSlate, parseNewsRelatedLinks, parseNewsAuthorIdNumbers, parseNewsDownloadResource } from '@/lib/newsContent'
import {
  createNewsFeaturedMedia,
  createNewsFeaturedMediaFromUrl,
  mediaIdForPayload,
} from '@/lib/newsFeaturedMediaUpload'
import { formatPayloadError } from '@/lib/payloadErrors'
import { notifyNewsletterSubscribersOfArticle } from '@/lib/newsletterBroadcast'
import { ensureNewsLatestColumns } from '@/lib/ensureNewsSchema'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function extractMediaId(value: unknown): string | undefined {
  if (value == null) return undefined
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: string | number }).id)
  }
  return String(value)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const payload = await getPayloadClient()
    await ensureNewsLatestColumns(payload)
    const formData = await request.formData()

    const existing = await payload.findByID({
      collection: 'news',
      id: params.id,
      depth: 0,
      overrideAccess: true,
    })

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const category = JSON.parse((formData.get('category') as string) || '[]')
    const tags = JSON.parse((formData.get('tags') as string) || '[]')
    const authorIds = parseNewsAuthorIdNumbers(formData.get('authors') as string | null)
    const relatedLinks = parseNewsRelatedLinks(formData.get('relatedLinks') as string | null)
    const downloadResource = parseNewsDownloadResource(
      formData.get('downloadResourceLabel') as string | null,
      formData.get('downloadResourceUrl') as string | null,
    )
    const status = formData.get('status') as string
    const featured = formData.get('featured') === 'true'
    const publishedDate = formData.get('publishedDate') as string | null
    const featuredImageFile = formData.get('featuredImage')
    const featuredImageUrl = formData.get('featuredImageUrl') as string | null
    const featuredImageIdField = formData.get('featuredImageId') as string | null

    if (authorIds.length === 0) {
      return NextResponse.json({ error: 'At least one author is required.' }, { status: 400 })
    }

    let featuredImageId: string | undefined

    if (
      featuredImageFile &&
      typeof featuredImageFile === 'object' &&
      'arrayBuffer' in featuredImageFile &&
      featuredImageFile.size > 0
    ) {
      try {
        featuredImageId = await createNewsFeaturedMedia(
          payload,
          featuredImageFile as File,
          `Featured image: ${title}`,
        )
      } catch (uploadError: unknown) {
        console.error('Featured media upload error:', uploadError)
        const message =
          uploadError instanceof Error ? uploadError.message : 'Failed to upload featured image'
        return NextResponse.json({ error: message }, { status: 500 })
      }
    } else if (featuredImageIdField) {
      featuredImageId = featuredImageIdField
    } else if (
      featuredImageUrl?.startsWith('https://') &&
      !featuredImageUrl.includes('/api/media/file/')
    ) {
      try {
        featuredImageId = await createNewsFeaturedMediaFromUrl(
          payload,
          featuredImageUrl,
          `Featured image: ${title}`,
        )
      } catch (uploadError: unknown) {
        console.error('Featured media URL error:', uploadError)
        featuredImageId = extractMediaId(existing?.featuredImage)
        if (!featuredImageId) {
          const message =
            uploadError instanceof Error ? uploadError.message : 'Failed to process featured image'
          return NextResponse.json({ error: message }, { status: 500 })
        }
      }
    } else {
      featuredImageId = extractMediaId(existing?.featuredImage)
    }

    if (!featuredImageId) {
      return NextResponse.json(
        { error: 'Featured image is required. Please upload an image before publishing.' },
        { status: 400 },
      )
    }

    const updateData: Record<string, unknown> = {
      title,
      slug,
      excerpt,
      content: plainTextToSlate(content),
      category,
      tags: tags.map((tag: string) => ({ tag })),
      relatedLinks,
      downloadResource: downloadResource ?? { label: '', url: '' },
      authors: authorIds,
      author: authorIds[0],
      status,
      featured,
      featuredImage: mediaIdForPayload(featuredImageId),
    }

    if (publishedDate && status === 'published') {
      updateData.publishedDate = new Date(publishedDate).toISOString()
    } else if (status === 'published' && !existing?.publishedDate) {
      updateData.publishedDate = new Date().toISOString()
    }

    const news = await payload.update({
      collection: 'news',
      id: params.id,
      data: updateData,
      overrideAccess: true,
    })

    let newsletterBroadcast: { sent: number; failed: number } | undefined
    const newlyPublished = status === 'published' && existing?.status !== 'published'
    if (newlyPublished) {
      try {
        const fullArticle = await payload.findByID({
          collection: 'news',
          id: params.id,
          depth: 2,
          overrideAccess: true,
        })
        newsletterBroadcast = await notifyNewsletterSubscribersOfArticle(payload, {
          title: fullArticle.title,
          slug: fullArticle.slug,
          excerpt: fullArticle.excerpt,
          featuredImage: fullArticle.featuredImage,
        })
      } catch (broadcastError) {
        console.error('Newsletter broadcast error (update):', broadcastError)
      }
    }

    return NextResponse.json({ success: true, doc: news, newsletterBroadcast })
  } catch (error: unknown) {
    console.error('Update news error:', error)
    return NextResponse.json({ error: formatPayloadError(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const payload = await getPayloadClient()

    await payload.delete({
      collection: 'news',
      id: params.id,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Delete news error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete news article' },
      { status: 500 },
    )
  }
}
