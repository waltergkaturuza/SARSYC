import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  FiArrowLeft,
  FiMapPin,
  FiUsers,
  FiAward,
  FiExternalLink,
  FiUser,
  FiSearch,
  FiTarget,
  FiFileText,
  FiDownload,
} from 'react-icons/fi'
import CountryFlag from '@/components/ui/CountryFlag'
import { getPayloadClient } from '@/lib/payload'
import { ensureConferencesSchema } from '@/lib/ensureConferencesSchema'
import {
  getConferenceGallerySlides,
  getConferenceMediaUrl,
  resolveConferenceHostCountry,
} from '@/lib/conferenceMedia'
import { getCountryLabel } from '@/lib/countries'
import { getMediaDisplayUrl } from '@/lib/mediaDisplayUrl'
import ConferenceImageSlider from '@/components/conferences/ConferenceImageSlider'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  abstract: 'Abstract',
  'concept-note': 'Concept Note',
  report: 'Conference Report',
  'research-report': 'Research Report',
  'symposium-report': 'Symposium Report',
  paper: 'Research Paper',
  brief: 'Policy Brief',
  communique: 'Communiqué',
  declaration: 'Declaration',
  presentation: 'Presentation',
  template: 'Template',
  toolkit: 'Toolkit',
  infographic: 'Infographic',
  video: 'Video',
  other: 'Other',
}

export default async function ConferenceDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const payload = await getPayloadClient()
  await ensureConferencesSchema(payload)

  const results = await payload.find({
    collection: 'conferences',
    where: {
      and: [{ slug: { equals: params.slug } }, { status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 2,
  })

  const conference = results.docs[0] as any | undefined
  if (!conference) notFound()

  const backHref = conference.isCurrent
    ? conference.currentPath || '/sarsyc-vi'
    : '/conferences'
  const slides = getConferenceGallerySlides(conference)
  const hostCode = resolveConferenceHostCountry(conference.location)
  const hostLabel = hostCode ? getCountryLabel(hostCode) : ''
  const featuredSpeakers = Array.isArray(conference.featuredSpeakers)
    ? conference.featuredSpeakers.filter((s: any) => s?.name)
    : []
  const keyOutcomes = Array.isArray(conference.keyOutcomes)
    ? conference.keyOutcomes.filter((row: any) => row?.outcome)
    : []
  const relatedLinks = Array.isArray(conference.relatedLinks)
    ? conference.relatedLinks.filter((link: any) => link?.label && link?.url)
    : []

  const conferenceYear = Number(conference.year)
  let yearResources: any[] = []
  try {
    if (Number.isFinite(conferenceYear)) {
      const resourceResults = await payload.find({
        collection: 'resources',
        where: { year: { equals: conferenceYear } },
        sort: '-createdAt',
        limit: 20,
        depth: 1,
        overrideAccess: true,
      })
      yearResources = resourceResults.docs as any[]
    }
  } catch (error) {
    console.warn('Failed to load related resources for conference:', error)
  }

  let otherEditions: any[] = []
  try {
    const siblings = await payload.find({
      collection: 'conferences',
      where: {
        and: [
          { status: { equals: 'published' } },
          { isCurrent: { equals: false } },
        ],
      },
      sort: '-year',
      limit: 20,
      depth: 0,
    })
    otherEditions = siblings.docs as any[]
  } catch {
    otherEditions = []
  }

  const hasMaterials = yearResources.length > 0 || relatedLinks.length > 0

  return (
    <>
      <section className="page-hero !py-3 md:!py-3.5">
        <div className="container-custom">
          <div className="max-w-4xl">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-2 text-sm"
            >
              <FiArrowLeft className="w-4 h-4" />
              {conference.isCurrent ? 'Back to current conference' : 'Back to previous conferences'}
            </Link>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {hostCode && (
                <CountryFlag
                  countryOrCode={hostCode}
                  size="md"
                  className="!border-white/40 shadow-md"
                />
              )}
              <span className="px-3 py-1 rounded-full bg-white/15 text-sm font-semibold">
                {conference.year}
              </span>
              {hostLabel && (
                <span className="px-3 py-1 rounded-full bg-white/15 text-sm font-semibold">
                  {hostLabel}
                </span>
              )}
              {conference.isCurrent && (
                <span className="px-3 py-1 rounded-full bg-accent-500 text-gray-900 text-sm font-bold">
                  Current
                </span>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-white m-0 leading-tight">
                {conference.title}
              </h1>
            </div>
            {conference.theme && (
              <p className="page-hero-subtitle mt-2 mb-0">{conference.theme}</p>
            )}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10">
          <div className="grid lg:grid-cols-12 gap-8 xl:gap-10 items-start">
            <aside className="lg:col-span-3 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Featured Speakers</h2>
                {featuredSpeakers.length === 0 ? (
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Featured speakers for this edition will appear here once added in the admin
                    panel.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {featuredSpeakers.map((speaker: any, index: number) => {
                      const photoUrl = getConferenceMediaUrl(speaker.photo)
                      const speakerCountry = speaker.country
                        ? resolveConferenceHostCountry(speaker.country) || speaker.country
                        : ''
                      return (
                        <article
                          key={speaker.id || `${speaker.name}-${index}`}
                          className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                        >
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={photoUrl}
                                alt={speaker.name}
                                className="h-full w-full object-cover object-top"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
                                <FiUser className="h-8 w-8 text-white/70" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-2">
                              <h3 className="text-sm font-bold text-primary-700 leading-snug">
                                {speaker.name}
                              </h3>
                              {speakerCountry && (
                                <CountryFlag countryOrCode={speakerCountry} size="sm" />
                              )}
                            </div>
                            {speaker.title && (
                              <p className="mt-0.5 text-xs font-medium text-amber-700/90 line-clamp-2">
                                {speaker.title}
                              </p>
                            )}
                            {speaker.organization && (
                              <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                                {speaker.organization}
                              </p>
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>
            </aside>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-8 min-w-0">
              {slides.length > 0 && (
                <ConferenceImageSlider
                  images={slides}
                  title={`${conference.title} gallery`}
                  aspectClassName="aspect-[16/10]"
                />
              )}

              <div className="flex flex-wrap gap-4 text-gray-700">
                {hostCode && (
                  <div className="flex items-center gap-2 font-medium">
                    <CountryFlag countryOrCode={hostCode} size="md" />
                    {hostLabel}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FiMapPin className="w-5 h-5 text-primary-600" />
                  {conference.location}
                </div>
                {conference.participants && (
                  <div className="flex items-center gap-2">
                    <FiUsers className="w-5 h-5 text-primary-600" />
                    {conference.participants} participants
                  </div>
                )}
              </div>

              <p className="font-sans text-lg text-primary-700 text-justify leading-relaxed">
                {conference.summary}
              </p>

              {conference.content && (
                <div className="prose max-w-none text-gray-700 whitespace-pre-line text-justify">
                  {conference.content}
                </div>
              )}

              {conference.isCurrent && conference.currentPath && (
                <Link href={conference.currentPath} className="btn-primary inline-flex">
                  Open live conference pages
                </Link>
              )}
            </div>

            <aside className="lg:col-span-3 order-3">
              <div className="lg:sticky lg:top-24 space-y-5">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FiSearch className="w-5 h-5" /> Search
                  </h3>
                  <form method="GET" action="/conferences">
                    <div className="relative">
                      <input
                        type="text"
                        name="search"
                        placeholder="Search editions..."
                        className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600"
                        aria-label="Search conferences"
                      >
                        <FiSearch className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                  {otherEditions.length > 0 && (
                    <div className="mt-4 space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                        Filter by year
                      </p>
                      {otherEditions.map((edition) => {
                        const active = String(edition.slug) === String(conference.slug)
                        return (
                          <Link
                            key={edition.id}
                            href={`/conferences/${edition.slug}`}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                              active
                                ? 'bg-primary-600 text-white font-semibold'
                                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                            }`}
                          >
                            {edition.year} — {edition.title}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>

                {conference.theme && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <FiTarget className="w-5 h-5 text-primary-600" /> Objectives
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{conference.theme}</p>
                  </div>
                )}

                {keyOutcomes.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FiAward className="w-5 h-5 text-primary-600" /> Key Outcomes
                    </h3>
                    <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
                      {keyOutcomes.map((row: any, i: number) => (
                        <li key={i}>{row.outcome}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {conference.highlights && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Highlights</h3>
                    <p className="text-sm text-gray-700">{conference.highlights}</p>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FiFileText className="w-5 h-5 text-primary-600" /> Materials &amp; Links
                  </h3>

                  {!hasMaterials ? (
                    <p className="text-sm text-gray-500 mb-3">
                      No resources tagged for {conferenceYear || 'this year'} yet.
                    </p>
                  ) : (
                    <ul className="space-y-3 mb-3">
                      {yearResources.map((resource) => {
                        const fileUrl = getMediaDisplayUrl(resource.file)
                        const typeLabel =
                          RESOURCE_TYPE_LABELS[resource.type] || resource.type || 'Resource'
                        return (
                          <li key={resource.id}>
                            {fileUrl ? (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block"
                              >
                                <span className="inline-flex items-start gap-2 text-sm font-medium text-primary-700 group-hover:text-primary-800">
                                  <FiDownload className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                  <span className="line-clamp-2">{resource.title}</span>
                                </span>
                                <span className="block pl-5 text-xs text-gray-500 mt-0.5">
                                  {typeLabel}
                                </span>
                              </a>
                            ) : (
                              <div>
                                <p className="text-sm font-medium text-gray-800 line-clamp-2">
                                  {resource.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">{typeLabel}</p>
                              </div>
                            )}
                          </li>
                        )
                      })}
                      {relatedLinks.map((link: any, i: number) => (
                        <li key={`manual-${i}`}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary-700 hover:text-primary-800 font-medium"
                          >
                            {link.label}
                            <FiExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}

                  {Number.isFinite(conferenceYear) && (
                    <Link
                      href={`/resources?year=${conferenceYear}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800"
                    >
                      Browse {conferenceYear} resources
                      <FiExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
