import type { Payload } from 'payload'
import { getMediaDisplayUrl } from '@/lib/mediaDisplayUrl'
import { sendNewsArticleEmail } from '@/lib/mail'

function siteBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.sarsyc.org'
  return raw.replace(/\/$/, '').replace('https://sarsyc.org', 'https://www.sarsyc.org')
}

/** Email all active newsletter subscribers about a newly published article. */
export async function notifyNewsletterSubscribersOfArticle(
  payload: Payload,
  article: {
    title: string
    slug: string
    excerpt: string
    featuredImage?: unknown
  },
): Promise<{ sent: number; failed: number }> {
  const subscribers = await payload.find({
    collection: 'newsletter-subscriptions',
    where: { status: { equals: 'subscribed' } },
    limit: 5000,
    overrideAccess: true,
  })

  if (!subscribers.docs.length) {
    return { sent: 0, failed: 0 }
  }

  const articleUrl = `${siteBaseUrl()}/news/${article.slug}`
  const imageUrl = getMediaDisplayUrl(article.featuredImage)

  let sent = 0
  let failed = 0

  for (const sub of subscribers.docs) {
    const email = typeof sub.email === 'string' ? sub.email.trim() : ''
    if (!email) continue

    try {
      await sendNewsArticleEmail({
        to: email,
        firstName: sub.firstName as string | undefined,
        title: article.title,
        excerpt: article.excerpt,
        articleUrl,
        imageUrl,
      })
      sent++
    } catch (error) {
      failed++
      console.error(`[Newsletter] Failed to send article email to ${email}:`, error)
    }
  }

  console.log(
    `[Newsletter] Article broadcast "${article.title}": ${sent} sent, ${failed} failed`,
  )

  return { sent, failed }
}
