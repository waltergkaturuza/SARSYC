import Link from 'next/link'
import { FiCalendar, FiArrowRight } from 'react-icons/fi'

// Placeholder data - will fetch from Payload CMS
const newsArticles = [
  {
    id: '1',
    title: 'SARSYC VI Announces Call for Abstracts',
    excerpt: 'Submit your research and join thought leaders at SARSYC VI in Windhoek, Namibia.',
    slug: 'call-for-abstracts-2026',
    category: 'Conference Updates',
    publishedDate: '2026-03-01',
    featuredImage: '/news/placeholder.jpg',
  },
  {
    id: '2',
    title: 'Registration Now Open for SARSYC VI',
    excerpt: 'Secure your spot at the premier regional youth health and education conference.',
    slug: 'registration-open',
    category: 'Conference Updates',
    publishedDate: '2026-05-20',
    featuredImage: '/news/placeholder.jpg',
  },
  // Add more articles...
]

const categories = [
  { value: 'all', label: 'All News' },
  { value: 'conference', label: 'Conference Updates' },
  { value: 'speakers', label: 'Speaker Announcements' },
  { value: 'partnerships', label: 'Partnerships' },
  { value: 'youth-stories', label: 'Youth Stories' },
]

export default function NewsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              News & Updates
            </h1>
            <p className="text-xl text-white/90">
              Stay informed about SARSYC VI developments, speaker announcements, and youth advocacy news
            </p>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="bg-gray-50 py-8 border-b border-gray-200">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.value}
                className="px-6 py-2 rounded-full bg-white border-2 border-gray-200 hover:border-primary-600 hover:text-primary-600 transition-all font-medium text-sm"
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="card group overflow-hidden hover:shadow-2xl transition-all"
              >
                <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary-400 to-secondary-400">
                  {/* Placeholder - will use real images */}
                  <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold opacity-30">
                    NEWS
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-primary-600 font-medium mb-3">
                    <span className="px-2 py-1 bg-primary-100 rounded-full">{article.category}</span>
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      {new Date(article.publishedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center text-primary-600 font-medium group-hover:gap-2 transition-all">
                    Read More
                    <FiArrowRight className="w-4 h-4 ml-1 group-hover:ml-0 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="btn-outline">
              Load More Articles
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Never Miss an Update
            </h2>
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






