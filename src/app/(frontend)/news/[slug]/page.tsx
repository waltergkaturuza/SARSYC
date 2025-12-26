import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiCalendar, FiUser, FiArrowLeft, FiShare2, FiFacebook, FiTwitter, FiLinkedin } from 'react-icons/fi'

// This will fetch from Payload CMS - placeholder for now
async function getNewsArticle(slug: string) {
  // const payload = await getPayloadClient()
  // const result = await payload.find({
  //   collection: 'news',
  //   where: { slug: { equals: slug } },
  //   limit: 1,
  // })
  // if (!result.docs.length) notFound()
  // return result.docs[0]
  
  // Placeholder data
  return {
    title: 'SARSYC VI Announces Keynote Speakers for Windhoek Conference',
    slug: slug,
    excerpt: 'Renowned experts in youth health and education confirmed for August 2026 conference.',
    content: `
      <p>We are thrilled to announce the lineup of distinguished keynote speakers for SARSYC VI, taking place August 5-7, 2026, in Windhoek, Namibia.</p>
      
      <h2>Featured Keynote Speakers</h2>
      
      <p>The conference will feature thought leaders from across Africa and beyond, including:</p>
      
      <ul>
        <li><strong>Dr. Sarah Mwangi</strong> - WHO Africa Director of Youth Health</li>
        <li><strong>Prof. Amina Osman</strong> - University of Cape Town, Public Health Expert</li>
        <li><strong>Hon. Minister of Health, Namibia</strong> - Opening Address</li>
      </ul>
      
      <p>These speakers bring decades of experience in youth health advocacy, research, and policy-making.</p>
      
      <h3>What to Expect</h3>
      
      <p>Keynote sessions will address:</p>
      <ul>
        <li>Current state of youth SRHR in Southern Africa</li>
        <li>Education innovations for youth empowerment</li>
        <li>Policy opportunities and challenges</li>
        <li>Action plans for sustained progress</li>
      </ul>
      
      <p>Registration is now open! Secure your spot to hear from these amazing speakers and many more.</p>
    `,
    featuredImage: '/news/keynote-speakers.jpg',
    publishedDate: '2026-03-15T10:00:00',
    author: {
      firstName: 'Communications',
      lastName: 'Team',
    },
    category: ['Speaker Announcements', 'Conference Updates'],
    tags: ['keynote', 'speakers', 'SARSYC VI'],
  }
}

export default async function NewsArticlePage({ params }: { params: { slug: string } }) {
  const article = await getNewsArticle(params.slug)

  return (
    <>
      {/* Hero */}
      <section className="bg-gray-900 text-white py-12">
        <div className="container-custom">
          <Link href="/news" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors">
            <FiArrowLeft />
            Back to News
          </Link>

          <div className="max-w-4xl">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {article.category.map((cat: string) => (
                <span key={cat} className="px-3 py-1 bg-primary-600 rounded-full text-sm font-medium">
                  {cat}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <FiCalendar className="w-5 h-5" />
                <span>{new Date(article.publishedDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                <span>{article.author.firstName} {article.author.lastName}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <div 
                  className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-600 prose-li:text-gray-600 prose-a:text-primary-600"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Tags */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/news?tag=${tag}`}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-primary-100 hover:text-primary-600 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Share */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-4">Share this article:</p>
                  <div className="flex gap-3">
                    <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                      <FiFacebook />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors">
                      <FiTwitter />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors">
                      <FiLinkedin />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 transition-colors">
                      <FiShare2 />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  {/* CTA Card */}
                  <div className="card p-6 bg-gradient-to-br from-primary-600 to-secondary-600 text-white mb-6">
                    <h3 className="font-bold text-xl mb-3">
                      Attending SARSYC VI?
                    </h3>
                    <p className="text-sm text-white/90 mb-4">
                      Register now to secure your spot at the premier regional youth conference.
                    </p>
                    <Link href="/participate/register" className="btn-accent w-full justify-center">
                      Register Now
                    </Link>
                  </div>

                  {/* Related Articles */}
                  <div className="card p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Related Articles</h4>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Link key={i} href={`/news/article-${i}`} className="block group">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                            Related Article Title {i}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">March {i}, 2026</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay Informed
            </h2>
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
  
  return {
    title: `${article.title} | SARSYC VI News`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedDate,
    },
  }
}


