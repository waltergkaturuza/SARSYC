import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FiArrowLeft, FiMapPin, FiUsers, FiAward, FiExternalLink } from 'react-icons/fi'
import { getPayloadClient } from '@/lib/payload'
import { ensureConferencesSchema } from '@/lib/ensureConferencesSchema'
import { getConferenceGallerySlides } from '@/lib/conferenceMedia'
import ConferenceImageSlider from '@/components/conferences/ConferenceImageSlider'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

  return (
    <>
      <section className="bg-slate-800 text-white py-8 md:py-10">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6"
            >
              <FiArrowLeft className="w-4 h-4" />
              {conference.isCurrent ? 'Back to current conference' : 'Back to previous conferences'}
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-white/15 text-sm font-semibold">
                {conference.year}
              </span>
              {conference.isCurrent && (
                <span className="px-3 py-1 rounded-full bg-accent-500 text-gray-900 text-sm font-bold">
                  Current
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{conference.title}</h1>
            {conference.theme && <p className="text-xl text-white/90">{conference.theme}</p>}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto space-y-8">
            {slides.length > 0 && (
              <ConferenceImageSlider
                images={slides}
                title={`${conference.title} gallery`}
                aspectClassName="aspect-[16/10]"
              />
            )}

            <div className="flex flex-wrap gap-4 text-gray-700">
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

            <p className="text-lg text-gray-700 text-justify leading-relaxed">
              {conference.summary}
            </p>

            {conference.content && (
              <div className="prose max-w-none text-gray-700 whitespace-pre-line text-justify">
                {conference.content}
              </div>
            )}

            {Array.isArray(conference.keyOutcomes) && conference.keyOutcomes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FiAward className="w-5 h-5 text-primary-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Key Outcomes</h2>
                </div>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                  {conference.keyOutcomes.map((row: any, i: number) => (
                    <li key={i}>{row.outcome}</li>
                  ))}
                </ul>
              </div>
            )}

            {conference.highlights && (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-1">Highlights</h3>
                <p className="text-gray-700">{conference.highlights}</p>
              </div>
            )}

            {Array.isArray(conference.relatedLinks) && conference.relatedLinks.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Materials & Links</h2>
                <ul className="space-y-2">
                  {conference.relatedLinks.map((link: any, i: number) => (
                    <li key={i}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-800 font-medium"
                      >
                        {link.label}
                        <FiExternalLink className="w-4 h-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {conference.isCurrent && conference.currentPath && (
              <Link href={conference.currentPath} className="btn-primary inline-flex">
                Open live conference pages
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
