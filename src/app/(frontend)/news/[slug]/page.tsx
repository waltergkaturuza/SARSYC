import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiCalendar, FiUser, FiArrowLeft, FiShare2, FiFacebook, FiTwitter, FiLinkedin } from 'react-icons/fi'
import { getPayloadClient } from '@/lib/payload'
import { slateToSimpleHtml, NEWS_CATEGORY_LABELS } from '@/lib/newsContent'

export const revalidate = 60

async function getNewsArticle(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  if (!result.docs.length) return null
  return result.docs[0] as any
}

async function getRelatedArticles(currentId: number | string, limit = 3) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'news',
    where: {
      and: [{ status: { equals: 'published' } }, { id: { not_equals: currentId } }],
    },
    sort: '-publishedDate',
    limit,
    depth: 1,
  })
  return result.docs as any[]
}

export default async function NewsArticlePage({ params }: { params: { slug: string } }) {
  const article = await getNewsArticle(params.slug)
  if (!article) notFound()

  const related = await getRelatedArticles(article.id)

  const imgUrl =
    typeof article.featuredImage === 'object' && article.featuredImage?.url
      ? article.featuredImage.url
      : null

  const author = article.author
  const authorName =
    typeof author === 'object' && author
      ? `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.email || 'SARSYC'
      : 'SARSYC'

  const categories: string[] = Array.isArray(article.category) ? article.category : []
  const tagList =
    article.tags?.map((t: { tag?: string }) => t?.tag).filter(Boolean) || []

  const published =
    article.publishedDate || article.createdAt

  const html = slateToSimpleHtml(article.content)

  return (
    <>
      <section className="bg-gray-900 text-white py-12">
        <div className="container-custom">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <FiArrowLeft />
            Back to News
          </Link>

          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((cat: string) => (
                <span key={cat} className="px-3 py-1 bg-primary-600 rounded-full text-sm font-medium">
                  {NEWS_CATEGORY_LABELS[cat] || cat}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-6">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <FiCalendar className="w-5 h-5" />
                <span>
                  {published
                    ? new Date(published).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                <span>{authorName}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {imgUrl && (
        <div className="relative w-full max-h-[420px] overflow-hidden bg-gray-100">
          <div className="container-custom py-0">
            <div className="relative aspect-[21/9] max-h-[420px] w-full">
              <Image
                src={imgUrl}
                alt={article.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      )}

      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-12">
              <div className="lg:col-span-3">
                <div
                  className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-600 prose-li:text-gray-600 prose-a:text-primary-600"
                  dangerouslySetInnerHTML={{ __html: html }}
                />

                {tagList.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {tagList.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-4">Share this article:</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <FiFacebook />
                    </button>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <FiTwitter />
                    </button>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors"
                      aria-label="Share on LinkedIn"
                    >
                      <FiLinkedin />
                    </button>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      aria-label="Share"
                    >
                      <FiShare2 />
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div className="card p-6 bg-gradient-to-br from-primary-600 to-secondary-600 text-white mb-6">
                    <h3 className="font-bold text-xl mb-3">Attending SARSYC VI?</h3>
                    <p className="text-sm text-white/90 mb-4">
                      Register when registration opens to secure your spot at the premier regional youth conference.
                    </p>
                    <Link href="/participate/register" className="btn-accent w-full justify-center">
                      Register
                    </Link>
                  </div>

                  {related.length > 0 && (
                    <div className="card p-6">
                      <h4 className="font-bold text-gray-900 mb-4">More news</h4>
                      <div className="space-y-4">
                        {related.map((r) => (
                          <Link key={r.id} href={`/news/${r.slug}`} className="block group">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                              {r.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {r.publishedDate || r.createdAt
                                ? new Date(r.publishedDate || r.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : ''}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Informed</h2>
            <p className="text-lg text-gray-600 mb-8">
              Subscribe to receive the latest SARSYC VI news and updates.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getNewsArticle(params.slug)
  if (!article) {
    return { title: 'News | SARSYC VI' }
  }
  const published = article.publishedDate || article.createdAt
  return {
    title: `${article.title} | SARSYC VI News`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: published,
    },
  }
}
