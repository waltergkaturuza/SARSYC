import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { plainTextToSlate } from '@/lib/newsContent'
import {
  createNewsFeaturedMedia,
  createNewsFeaturedMediaFromUrl,
  mediaIdForPayload,
} from '@/lib/newsFeaturedMediaUpload'
import { formatPayloadError } from '@/lib/payloadErrors'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function resolveFeaturedImageId(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  formData: FormData,
  title: string,
): Promise<string | undefined> {
  const featuredImageFile = formData.get('featuredImage')

  if (
    featuredImageFile &&
    typeof featuredImageFile === 'object' &&
    'arrayBuffer' in featuredImageFile &&
    featuredImageFile.size > 0
  ) {
    return createNewsFeaturedMedia(
      payload,
      featuredImageFile as File,
      `Featured image: ${title}`,
    )
  }

  const featuredImageUrl = formData.get('featuredImageUrl') as string | null
  if (featuredImageUrl?.startsWith('https://')) {
    return createNewsFeaturedMediaFromUrl(payload, featuredImageUrl, `Featured image: ${title}`)
  }

  const featuredImageId = formData.get('featuredImageId') as string | null
  if (featuredImageId) {
    return featuredImageId
  }

  return undefined
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const formData = await request.formData()

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const category = JSON.parse((formData.get('category') as string) || '[]')
    const tags = JSON.parse((formData.get('tags') as string) || '[]')
    const authorRaw = formData.get('author') as string
    const author = Number(authorRaw)
    const status = formData.get('status') as string
    const featured = formData.get('featured') === 'true'
    const publishedDate = formData.get('publishedDate') as string | null

    let featuredImageId: string | undefined
    try {
      featuredImageId = await resolveFeaturedImageId(payload, formData, title)
    } catch (uploadError: unknown) {
      console.error('Featured media upload error:', uploadError)
      const message =
        uploadError instanceof Error ? uploadError.message : 'Failed to upload featured image'
      return NextResponse.json({ error: message }, { status: 500 })
    }

    if (!featuredImageId) {
      return NextResponse.json(
        { error: 'Featured image is required. Please upload an image before publishing.' },
        { status: 400 },
      )
    }

    const publishedAt =
      publishedDate && status === 'published'
        ? new Date(publishedDate).toISOString()
        : status === 'published'
          ? new Date().toISOString()
          : undefined

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
        featuredImage: mediaIdForPayload(featuredImageId),
        ...(publishedAt && { publishedDate: publishedAt }),
      },
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, doc: news })
  } catch (error: unknown) {
    console.error('Create news error:', error)
    return NextResponse.json({ error: formatPayloadError(error) }, { status: 500 })
  }
}
