import Link from 'next/link'
import {
  FiAward,
  FiCheck,
  FiDownload,
  FiExternalLink,
  FiFileText,
  FiLink,
  FiTarget,
  FiUsers,
  FiZap,
} from 'react-icons/fi'
import { getPayloadClient } from '@/lib/payload'
import { ensureConferencesSchema } from '@/lib/ensureConferencesSchema'
import { getMediaDisplayUrl } from '@/lib/mediaDisplayUrl'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SARSYC_VI_YEAR = 2026

const expectedOutcomes = [
  {
    icon: FiUsers,
    title: 'Stronger Regional Youth Voice Influencing Policy',
    description:
      'Youth representatives actively engaging in national and regional policy dialogues with enhanced capacity and platforms.',
    indicators: [
      'Youth representatives in 10+ policy forums',
      'Training of 50+ youth advocates',
      'Youth-led policy recommendations adopted',
      'Sustained youth engagement mechanisms',
    ],
  },
  {
    icon: FiLink,
    title: 'Youth-Driven, Gender-Responsive Strategies',
    description: 'Actionable strategies developed by youth, for youth, with gender equality at the core.',
    indicators: [
      '5 country-level action plans developed',
      'Gender-responsive frameworks adopted',
      'Implementation roadmaps created',
      'Monitoring systems established',
    ],
  },
  {
    icon: FiZap,
    title: 'Reinforced Homegrown Solutions',
    description: 'Sustainable, locally-developed solutions that address regional challenges effectively.',
    indicators: [
      '10+ innovative solutions showcased',
      'Best practices documented and shared',
      'Local expertise leveraged',
      'Community-driven approaches highlighted',
    ],
  },
  {
    icon: FiLink,
    title: 'Stronger Transnational Alliances',
    description: 'Robust partnerships and networks connecting youth across borders and sectors.',
    indicators: [
      'Multi-country partnerships formed',
      'CSO-private sector collaborations',
      'Development partner alliances',
      'Sustained regional networks',
    ],
  },
]

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  declaration: 'Declaration',
  compact: 'Compact',
  communique: 'Communiqué',
  report: 'Conference Report',
  'research-report': 'Research Report',
  brief: 'Policy Brief',
  other: 'Resource',
}

const PRIORITY_RESOURCE_TYPES = [
  'declaration',
  'compact',
  'communique',
  'report',
  'research-report',
  'brief',
]

async function loadSarsycViConference(payload: Awaited<ReturnType<typeof getPayloadClient>>) {
  try {
    await ensureConferencesSchema(payload)
  } catch {
    // continue even if schema patch fails
  }

  const published = { status: { equals: 'published' as const } }

  const byCurrent = await payload.find({
    collection: 'conferences',
    where: { and: [{ isCurrent: { equals: true } }, published] },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  if (byCurrent.docs[0]) return byCurrent.docs[0] as any

  const byYear = await payload.find({
    collection: 'conferences',
    where: { and: [{ year: { equals: SARSYC_VI_YEAR } }, published] },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  if (byYear.docs[0]) return byYear.docs[0] as any

  const bySlug = await payload.find({
    collection: 'conferences',
    where: {
      and: [
        {
          or: [
            { slug: { equals: 'sarsyc-vi' } },
            { slug: { equals: 'sarsyc-6' } },
            { slug: { contains: 'vi' } },
          ],
        },
        published,
      ],
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  return (bySlug.docs[0] as any) || null
}

async function loadYearResources(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  year: number,
) {
  try {
    const result = await payload.find({
      collection: 'resources',
      where: {
        and: [{ year: { equals: year } }, { type: { in: PRIORITY_RESOURCE_TYPES } }],
      },
      sort: '-createdAt',
      limit: 20,
      depth: 1,
      overrideAccess: true,
    })
    const docs = (result.docs as any[]) || []
    return [...docs].sort((a, b) => {
      const ai = PRIORITY_RESOURCE_TYPES.indexOf(a.type)
      const bi = PRIORITY_RESOURCE_TYPES.indexOf(b.type)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
  } catch {
    return []
  }
}

export default async function OutcomesPage() {
  const payload = await getPayloadClient()
  const conference = await loadSarsycViConference(payload)
  const conferenceYear = Number(conference?.year) || SARSYC_VI_YEAR

  const actualOutcomes = Array.isArray(conference?.keyOutcomes)
    ? conference.keyOutcomes.filter((row: any) => row?.outcome)
    : []

  const relatedLinks = Array.isArray(conference?.relatedLinks)
    ? conference.relatedLinks.filter((link: any) => link?.label && link?.url)
    : []

  const yearResources = await loadYearResources(payload, conferenceYear)
  const hasMaterials = yearResources.length > 0 || relatedLinks.length > 0

  return (
    <>
      <section className="page-hero">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="page-hero-title">Outcomes</h1>
            <p className="page-hero-subtitle">
              Expected results for SARSYC VI, with actual outcomes and resources published as they
              become available
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-screen-2xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8 xl:gap-10 items-start">
              {/* Left — Expected Outcomes */}
              <div className="lg:col-span-8 min-w-0 space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
                    Expected Outcomes
                  </h2>
                  <p className="text-sm text-gray-600">
                    The measurable results SARSYC VI is designed to deliver.
                  </p>
                </div>

                <div className="space-y-6">
                  {expectedOutcomes.map((outcome) => {
                    const Icon = outcome.icon
                    return (
                      <div key={outcome.title} className="card p-6 md:p-8">
                        <div className="flex items-start gap-4 mb-5">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                            <Icon className="w-7 h-7" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                              {outcome.title}
                            </h3>
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                              {outcome.description}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 md:p-5">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                            <FiTarget className="w-4 h-4 text-primary-600" />
                            Key Indicators
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-2.5">
                            {outcome.indicators.map((indicator) => (
                              <div key={indicator} className="flex items-start gap-2">
                                <FiCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">{indicator}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="card p-6 md:p-8 bg-primary-50 border border-primary-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Measurement & Accountability
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    These outcomes are measurable commitments. The Youth Steering Committee and
                    SAYWHAT track progress through post-conference action plans, quarterly reports,
                    annual reviews, a mid-term evaluation (2027), and assessment at SARSYC VII
                    (2028).
                  </p>
                </div>
              </div>

              {/* Right — Actual Outcomes + year resources */}
              <aside className="lg:col-span-4">
                <div className="lg:sticky lg:top-24 space-y-5">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <FiAward className="w-5 h-5 text-primary-600" />
                      Actual Outcomes
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Managed in Admin → Conferences (Key Outcomes) for SARSYC {conferenceYear}
                    </p>

                    {actualOutcomes.length > 0 ? (
                      <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
                        {actualOutcomes.map((row: any, i: number) => (
                          <li key={i} className="leading-relaxed">
                            {row.outcome}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Actual outcomes will appear here after they are published for SARSYC VI in
                        the admin panel.
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <FiFileText className="w-5 h-5 text-primary-600" />
                      Declarations & Impacts
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Auto-loaded from Resources for {conferenceYear} (declarations, compacts,
                      reports)
                    </p>

                    {!hasMaterials ? (
                      <p className="text-sm text-gray-500 mb-3">
                        No declarations or impact documents for {conferenceYear} yet. Upload them
                        under Admin → Resources with year {conferenceYear}.
                      </p>
                    ) : (
                      <ul className="space-y-3 mb-3">
                        {yearResources.map((resource: any) => {
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
                          <li key={`link-${i}`}>
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

                    <Link
                      href={`/resources?year=${conferenceYear}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-800"
                    >
                      Browse {conferenceYear} resources
                      <FiExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 md:py-8 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-semibold mb-3">
              Help Us Achieve These Outcomes
            </h2>
            <p className="text-base mb-5 text-white/90">
              Your participation at SARSYC VI directly contributes to these outcomes
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/participate/register" className="btn-accent px-8 py-3">
                Register for SARSYC VI
              </Link>
              <Link
                href="/sarsyc-vi/objectives"
                className="btn-outline border-white text-white hover:bg-white/10 px-8 py-3"
              >
                View Conference Objectives
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
