import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'
import { notifyNewsletterSubscribersOfArticle } from '@/lib/newsletterBroadcast'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Manually email subscribers about a published article (admin only). */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const payload = await getPayloadClient()
    const article = await payload.findByID({
      collection: 'news',
      id: params.id,
      depth: 2,
      overrideAccess: true,
    })

    if (!article || article.status !== 'published') {
      return NextResponse.json(
        { error: 'Article must be published before sending to subscribers' },
        { status: 400 },
      )
    }

    const newsletterBroadcast = await notifyNewsletterSubscribersOfArticle(payload, {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      featuredImage: article.featuredImage,
    })

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${newsletterBroadcast.sent} subscriber(s)`,
      newsletterBroadcast,
    })
  } catch (error: unknown) {
    console.error('Manual newsletter broadcast error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Broadcast failed' },
      { status: 500 },
    )
  }
}
