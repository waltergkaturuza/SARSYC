import Link from 'next/link'
import Image from 'next/image'
import { FiCalendar, FiArrowRight } from 'react-icons/fi'
import EmptyState from '@/components/ui/EmptyState'
import { getPayloadClient } from '@/lib/payload'
import { NEWS_CATEGORY_LABELS } from '@/lib/newsContent'

export const revalidate = 60

const FILTER_CATEGORIES = [
  { value: 'all', label: 'All News' },
  { value: 'conference', label: 'Conference Updates' },
  { value: 'speakers', label: 'Speaker Announcements' },
  { value: 'partnerships', label: 'Partnerships' },
  { value: 'youth-stories', label: 'Youth Stories' },
]

function categoryLabel(slugs: string[] | undefined): string {
  if (!slugs?.length) return 'News'
  return slugs.map((s) => NEWS_CATEGORY_LABELS[s] || s).join(' · ')
}

interface NewsPageProps {
  searchParams: { category?: string }
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const filter = searchParams.category || 'all'

  const payload = await getPayloadClient()
  const where: Record<string, unknown> = {
    status: { equals: 'published' },
  }
  if (filter !== 'all') {
    where.category = { contains: filter }
  }

  const results = await payload.find({
    collection: 'news',
    where,
    sort: '-publishedDate',
    depth: 2,
    limit: 100,
  })

  const articles = results.docs as any[]

  return (
    <>
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">News & Updates</h1>
            <p className="text-xl text-white/90">
              Stay informed about SARSYC VI developments, speaker announcements, and youth advocacy news
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-8 border-b border-gray-200">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            {FILTER_CATEGORIES.map((cat) => {
              const active = filter === cat.value
              const href = cat.value === 'all' ? '/news' : `/news?category=${cat.value}`
              return (
                <Link
                  key={cat.value}
                  href={href}
                  className={`px-6 py-2 rounded-full border-2 font-medium text-sm transition-all ${
                    active
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-primary-600 hover:text-primary-600'
                  }`}
                >
                  {cat.label}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">
          {articles.length === 0 ? (
            <EmptyState
              icon="file"
              title="No News Articles Yet"
              description="Check back soon for updates. Conference news is published here as soon as it is available."
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => {
                const img =
                  typeof article.featuredImage === 'object' && article.featuredImage?.url
                    ? article.featuredImage.url
                    : null
                const dateStr =
                  article.publishedDate || article.createdAt
                return (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="card group overflow-hidden hover:shadow-2xl transition-all"
                  >
                    <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary-400 to-secondary-400">
                      {img ? (
                        <Image
                          src={img}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold opacity-30">
                          NEWS
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 text-xs text-primary-600 font-medium mb-3 flex-wrap">
                        <span className="px-2 py-1 bg-primary-100 rounded-full max-w-full truncate">
                          {categoryLabel(article.category)}
                        </span>
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <FiCalendar className="w-3 h-3" />
                          {dateStr
                            ? new Date(dateStr).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : ''}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                        {article.title}
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>

                      <div className="flex items-center text-primary-600 font-medium group-hover:gap-2 transition-all">
                        Read More
                        <FiArrowRight className="w-4 h-4 ml-1 group-hover:ml-0 transition-all" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Never Miss an Update</h2>
            <p className="text-lg text-gray-600 mb-8">
              Subscribe to our newsletter for conference updates, speaker announcements, and youth health news.
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
