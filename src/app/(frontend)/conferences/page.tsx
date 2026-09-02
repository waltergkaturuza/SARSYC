import Link from 'next/link'
import Image from 'next/image'
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiSearch,
  FiArrowRight,
  FiAward,
  FiExternalLink,
} from 'react-icons/fi'
import EmptyState from '@/components/ui/EmptyState'
import CountryFlag from '@/components/ui/CountryFlag'
import { getPayloadClient } from '@/lib/payload'
import { ensureConferencesSchema } from '@/lib/ensureConferencesSchema'
import { seedPreviousConferencesIfEmpty } from '@/lib/conferencesContent'
import { getConferenceGallerySlides, resolveConferenceHostCountry } from '@/lib/conferenceMedia'
import { getCountryLabel } from '@/lib/countries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ConferencesPageProps {
  searchParams: { search?: string; year?: string }
}

export default async function PreviousConferencesPage({ searchParams }: ConferencesPageProps) {
  const search = searchParams.search?.trim() || ''
  const yearFilter = searchParams.year?.trim() || 'all'

  const payload = await getPayloadClient()
  await ensureConferencesSchema(payload)
  try {
    await seedPreviousConferencesIfEmpty(payload)
  } catch (error) {
    console.warn('Conference seed failed:', error)
  }

  let conferences: any[] = []
  let currentHref = '/sarsyc-vi'
  let currentTitle = 'SARSYC VI'

  try {
    const where: Record<string, unknown> = {
      and: [{ status: { equals: 'published' } }, { isCurrent: { equals: false } }],
    }

    if (yearFilter !== 'all' && /^\d{4}$/.test(yearFilter)) {
      ;(where.and as Record<string, unknown>[]).push({ year: { equals: Number(yearFilter) } })
    }

    if (search) {
      ;(where.and as Record<string, unknown>[]).push({
        or: [
          { title: { contains: search } },
          { location: { contains: search } },
          { theme: { contains: search } },
          { summary: { contains: search } },
        ],
      })
    }

    const results = await payload.find({
      collection: 'conferences',
      where,
      sort: '-year',
      limit: 100,
      depth: 2,
    })
    conferences = results.docs as any[]

    const currentResults = await payload.find({
      collection: 'conferences',
      where: {
        and: [{ status: { equals: 'published' } }, { isCurrent: { equals: true } }],
      },
      limit: 1,
      depth: 0,
    })
    const current = currentResults.docs[0] as any | undefined
    currentHref = current?.currentPath || '/sarsyc-vi'
    currentTitle = current?.title || 'SARSYC VI'
  } catch (error) {
    console.error('Failed to load conferences:', error)
  }

  // Years + recent list from unfiltered previous editions
  let yearOptions: string[] = []
  let recentEditions: any[] = []
  try {
    const allPrevious = await payload.find({
      collection: 'conferences',
      where: {
        and: [{ status: { equals: 'published' } }, { isCurrent: { equals: false } }],
      },
      sort: '-year',
      limit: 100,
      depth: 0,
    })
    const allDocs = allPrevious.docs as any[]
    yearOptions = Array.from(
      new Set(allDocs.map((c) => (c.year != null ? String(c.year) : '')).filter(Boolean)),
    )
    recentEditions = allDocs.slice(0, 5)
  } catch {
    yearOptions = []
    recentEditions = conferences.slice(0, 5)
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="page-hero">
        <div className="container-custom">
          <div className="max-w-4xl">
            <h1 className="page-hero-title">Previous Conferences</h1>
            <p className="page-hero-subtitle">
              A decade of youth advocacy, knowledge sharing, and regional impact across Southern
              Africa.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 py-10">
        {/* Year tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
          {[{ value: 'all', label: 'All editions' }, ...yearOptions.map((y) => ({ value: y, label: y }))].map(
            (tab) => {
              const active = yearFilter === tab.value
              const params = new URLSearchParams()
              if (tab.value !== 'all') params.set('year', tab.value)
              if (search) params.set('search', search)
              const href = `/conferences${params.toString() ? `?${params}` : ''}`
              return (
                <Link
                  key={tab.value}
                  href={href}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                    active
                      ? 'bg-primary-700 text-white border-primary-700'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary-500 hover:text-primary-600'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            },
          )}
        </div>

        <div className="grid lg:grid-cols-12 gap-8 xl:gap-10 items-start">
          {/* Main column */}
          <div className="lg:col-span-8 xl:col-span-9 min-w-0">
            {conferences.length === 0 ? (
              <EmptyState
                icon="file"
                title="No conferences found"
                description="There are no published previous editions matching your selection. Check back soon."
              />
            ) : (
              <div className="space-y-8">
                {conferences.map((conf, i) => {
                  const slides = getConferenceGallerySlides(conf)
                  const img = slides[0]?.src || null
                  const href = `/conferences/${conf.slug}`
                  const hostCode = resolveConferenceHostCountry(conf.location)
                  const hostLabel = hostCode ? getCountryLabel(hostCode) : ''
                  const isFeatured = i === 0

                  if (isFeatured) {
                    return (
                      <Link key={conf.id} href={href} className="block group">
                        <div className="flex flex-col lg:flex-row gap-0 rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow bg-white">
                          <div className="relative lg:w-[52%] xl:w-[50%] aspect-[16/9] lg:aspect-auto lg:min-h-[280px] bg-gray-100 flex-shrink-0">
                            {img ? (
                              <Image
                                src={img}
                                alt={slides[0]?.alt || conf.title}
                                fill
                                className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                sizes="(max-width: 1024px) 100vw, 55vw"
                                priority
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                                <span className="text-white text-5xl font-bold opacity-20">
                                  {conf.year}
                                </span>
                              </div>
                            )}
                            <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
                              {hostCode && (
                                <CountryFlag
                                  countryOrCode={hostCode}
                                  size="md"
                                  className="!border-white/80 shadow-md"
                                />
                              )}
                              <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded">
                                {conf.year}
                              </span>
                              {slides.length > 1 && (
                                <span className="px-2 py-0.5 bg-black/60 text-white text-xs font-semibold rounded">
                                  {slides.length} photos
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-6 lg:p-8 xl:p-10 flex flex-col justify-center flex-1">
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                              {hostCode && (
                                <span className="inline-flex items-center gap-2 font-medium text-gray-700">
                                  <CountryFlag countryOrCode={hostCode} size="sm" />
                                  {hostLabel}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <FiMapPin className="w-4 h-4" />
                                {conf.location}
                              </span>
                              {conf.participants && (
                                <span className="flex items-center gap-1">
                                  <FiUsers className="w-4 h-4" />
                                  {conf.participants} participants
                                </span>
                              )}
                            </div>
                            <h2 className="text-2xl font-bold text-primary-700 group-hover:text-primary-500 transition-colors mb-3 leading-snug">
                              {conf.title}
                            </h2>
                            {conf.theme && (
                              <p className="text-sm font-medium text-gray-800 mb-3 line-clamp-2">
                                {conf.theme}
                              </p>
                            )}
                            <p className="font-sans text-primary-700 text-justify line-clamp-4 mb-6">
                              {conf.summary}
                            </p>
                            <span className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm group-hover:gap-3 transition-all">
                              View details <FiArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  }

                  return (
                    <Link
                      key={conf.id}
                      href={href}
                      className="flex flex-col sm:flex-row gap-5 group border-b border-gray-100 pb-8"
                    >
                      <div className="relative w-full sm:w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {img ? (
                          <Image
                            src={img}
                            alt={slides[0]?.alt || conf.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="160px"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-300 to-secondary-300 flex items-center justify-center">
                            <span className="text-white text-xl font-bold opacity-70">{conf.year}</span>
                          </div>
                        )}
                      </div>

                      <div className="sm:w-[220px] lg:w-[240px] xl:w-[260px] flex-shrink-0 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {hostCode && <CountryFlag countryOrCode={hostCode} size="sm" />}
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded">
                            {conf.year}
                          </span>
                          {hostLabel ? (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                              {hostLabel}
                            </span>
                          ) : conf.location ? (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                              {conf.location}
                            </span>
                          ) : null}
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors leading-snug">
                            {conf.title}
                          </h3>
                        </div>
                        {conf.theme && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">{conf.theme}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            {conf.year}
                          </span>
                          {conf.participants && (
                            <span className="flex items-center gap-1">
                              <FiUsers className="w-3 h-3" />
                              {conf.participants}
                            </span>
                          )}
                        </div>
                      </div>

                      {conf.summary && (
                        <p className="flex-1 min-w-0 font-sans text-sm md:text-base text-primary-700 text-justify leading-relaxed line-clamp-5">
                          {conf.summary}
                        </p>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-8 hidden lg:block">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FiSearch className="w-5 h-5" /> Search
              </h3>
              <form method="GET" action="/conferences">
                {yearFilter !== 'all' && <input type="hidden" name="year" value={yearFilter} />}
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    defaultValue={search}
                    placeholder="Search editions..."
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600"
                  >
                    <FiSearch className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-primary-700 text-white rounded-xl p-5">
              <h3 className="font-bold mb-2">Current conference</h3>
              <p className="text-sm text-white/85 mb-4">{currentTitle}</p>
              <Link
                href={currentHref}
                className="inline-flex items-center gap-2 text-sm font-semibold bg-white text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
              >
                View programme
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {recentEditions.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent editions</h3>
                <div className="space-y-4">
                  {recentEditions.map((post: any) => {
                    const recentHost = resolveConferenceHostCountry(post.location)
                    return (
                      <Link key={post.id} href={`/conferences/${post.slug}`} className="block group">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          {recentHost && <CountryFlag countryOrCode={recentHost} size="sm" />}
                          <span className="bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded text-xs">
                            {post.year}
                          </span>
                          {recentHost ? (
                            <span className="line-clamp-1">{getCountryLabel(recentHost)}</span>
                          ) : (
                            post.location && <span className="line-clamp-1">{post.location}</span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {yearOptions.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiAward className="w-5 h-5" /> By year
                </h3>
                <div className="space-y-1">
                  <Link
                    href={search ? `/conferences?search=${encodeURIComponent(search)}` : '/conferences'}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      yearFilter === 'all'
                        ? 'bg-primary-600 text-white font-semibold'
                        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                    }`}
                  >
                    All editions
                  </Link>
                  {yearOptions.map((y) => {
                    const params = new URLSearchParams()
                    params.set('year', y)
                    if (search) params.set('search', search)
                    const active = yearFilter === y
                    return (
                      <Link
                        key={y}
                        href={`/conferences?${params}`}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          active
                            ? 'bg-primary-600 text-white font-semibold'
                            : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                        }`}
                      >
                        {y}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Explore</h3>
              <p className="text-sm text-gray-500 mb-4">More from the SARSYC journey</p>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/media/gallery"
                    className="group flex items-center gap-1 text-sm text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Photo gallery
                    <FiExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/news"
                    className="group flex items-center gap-1 text-sm text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Updates &amp; news
                    <FiExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100" />
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
