import Link from 'next/link'
import Image from 'next/image'
import { FiCalendar, FiMapPin, FiSearch, FiArrowRight, FiFolder } from 'react-icons/fi'
import EmptyState from '@/components/ui/EmptyState'
import { getPayloadClient } from '@/lib/payload'
import { NEWS_CATEGORY_LABELS } from '@/lib/newsContent'

export const revalidate = 60

const FILTER_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'conference', label: 'Conference Updates' },
  { value: 'speakers', label: 'Speakers' },
  { value: 'partnerships', label: 'Partnerships' },
  { value: 'youth-stories', label: 'Youth Stories' },
  { value: 'research', label: 'Research' },
  { value: 'events', label: 'Events' },
]

function primaryCategory(slugs: string[] | undefined): string {
  if (!slugs?.length) return 'News'
  return NEWS_CATEGORY_LABELS[slugs[0]] || slugs[0]
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
}

interface NewsPageProps {
  searchParams: { category?: string; search?: string }
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const filter = searchParams.category || 'all'
  const search = searchParams.search || ''

  const payload = await getPayloadClient()

  const where: Record<string, unknown> = { status: { equals: 'published' } }
  if (filter !== 'all') where.category = { contains: filter }
  if (search) {
    where.or = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
    ]
  }

  const results = await payload.find({
    collection: 'news',
    where,
    sort: '-publishedDate',
    depth: 2,
    limit: 100,
  })
  const articles = results.docs as any[]

  // Sidebar: recent posts (latest 5 regardless of filter)
  const recentResults = await payload.find({
    collection: 'news',
    where: { status: { equals: 'published' } },
    sort: '-publishedDate',
    depth: 0,
    limit: 5,
  })
  const recentPosts = recentResults.docs as any[]

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="bg-primary-700 text-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 text-primary-200 text-sm mb-3">
            <FiFolder className="w-4 h-4" />
            <span>Updates & News</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Updates & News</h1>
          <p className="text-primary-200 text-lg">Latest summit news, announcements and upcoming events.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
          {FILTER_CATEGORIES.map((cat) => {
            const active = filter === cat.value
            const params = new URLSearchParams()
            if (cat.value !== 'all') params.set('category', cat.value)
            if (search) params.set('search', search)
            const href = `/news${params.toString() ? `?${params}` : ''}`
            return (
              <Link
                key={cat.value}
                href={href}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                  active
                    ? 'bg-primary-700 text-white border-primary-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-500 hover:text-primary-600'
                }`}
              >
                {cat.label}
              </Link>
            )
          })}
        </div>

        {/* Main 2-column layout */}
        <div className="flex gap-10 items-start">
          {/* Articles */}
          <div className="flex-1 min-w-0">
            {articles.length === 0 ? (
              <EmptyState
                icon="file"
                title="No articles found"
                description="There are no published articles matching your selection. Check back soon."
              />
            ) : (
              <div className="space-y-8">
                {articles.map((article, i) => {
                  const img =
                    typeof article.featuredImage === 'object' && article.featuredImage?.url
                      ? article.featuredImage.url
                      : null
                  const date = formatDate(article.publishedDate || article.createdAt)
                  const cats: string[] = Array.isArray(article.category) ? article.category : []
                  const isFeatured = i === 0

                  if (isFeatured) {
                    return (
                      <Link
                        key={article.id}
                        href={`/news/${article.slug}`}
                        className="block group"
                      >
                        <div className="flex flex-col lg:flex-row gap-0 rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow bg-white">
                          {/* Image */}
                          <div className="relative lg:w-[55%] aspect-[16/9] lg:aspect-auto bg-gray-100 flex-shrink-0">
                            {img ? (
                              <Image
                                src={img}
                                alt={article.title}
                                fill
                                className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                sizes="(max-width: 1024px) 100vw, 55vw"
                                priority
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                                <span className="text-white text-5xl font-bold opacity-20">NEWS</span>
                              </div>
                            )}
                            {/* Category badges over image */}
                            <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                              {cats.map((c) => (
                                <span key={c} className="px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded">
                                  {primaryCategory([c])}
                                </span>
                              ))}
                            </div>
                          </div>
                          {/* Content */}
                          <div className="p-8 flex flex-col justify-center">
                            <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                              <span className="flex items-center gap-1">
                                <FiCalendar className="w-4 h-4" />
                                {date}
                              </span>
                            </div>
                            <h2 className="text-2xl font-bold text-primary-700 group-hover:text-primary-500 transition-colors mb-4 leading-snug">
                              {article.title}
                            </h2>
                            <p className="text-gray-600 line-clamp-4 mb-6">{article.excerpt}</p>
                            <span className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm group-hover:gap-3 transition-all">
                              Read More <FiArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  }

                  return (
                    <Link
                      key={article.id}
                      href={`/news/${article.slug}`}
                      className="flex gap-5 group border-b border-gray-100 pb-8"
                    >
                      <div className="relative w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {img ? (
                          <Image
                            src={img}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="160px"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-300 to-secondary-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {cats.map((c) => (
                            <span key={c} className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded">
                              {primaryCategory([c])}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{article.excerpt}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            {date}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-72 flex-shrink-0 space-y-8 hidden lg:block">
            {/* Search */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FiSearch className="w-4 h-4" /> Search
              </h3>
              <form method="GET" action="/news">
                {filter !== 'all' && <input type="hidden" name="category" value={filter} />}
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    defaultValue={search}
                    placeholder="Search updates..."
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                    <FiSearch className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Recent posts */}
            {recentPosts.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-4">Recent posts</h3>
                <div className="space-y-4">
                  {recentPosts.map((post: any) => {
                    const pCats: string[] = Array.isArray(post.category) ? post.category : []
                    const pDate = post.publishedDate || post.createdAt
                    return (
                      <Link key={post.id} href={`/news/${post.slug}`} className="block group">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          {pCats[0] && (
                            <span className="bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded text-xs">
                              {primaryCategory(pCats)}
                            </span>
                          )}
                          {pDate && (
                            <span>
                              {new Date(pDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Categories */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiFolder className="w-4 h-4" /> Categories
              </h3>
              <div className="space-y-1">
                {FILTER_CATEGORIES.map((cat) => {
                  const active = filter === cat.value
                  const params = new URLSearchParams()
                  if (cat.value !== 'all') params.set('category', cat.value)
                  if (search) params.set('search', search)
                  return (
                    <Link
                      key={cat.value}
                      href={`/news${params.toString() ? `?${params}` : ''}`}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? 'bg-primary-600 text-white font-semibold'
                          : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                      }`}
                    >
                      {cat.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
