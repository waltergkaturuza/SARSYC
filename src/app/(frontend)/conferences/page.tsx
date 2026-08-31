import Link from 'next/link'
import { FiMapPin, FiUsers, FiAward, FiCalendar, FiArrowRight } from 'react-icons/fi'
import { getPayloadClient } from '@/lib/payload'
import { ensureConferencesSchema } from '@/lib/ensureConferencesSchema'
import { seedPreviousConferencesIfEmpty } from '@/lib/conferencesContent'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PreviousConferencesPage() {
  const payload = await getPayloadClient()
  await ensureConferencesSchema(payload)
  try {
    await seedPreviousConferencesIfEmpty(payload)
  } catch (error) {
    console.warn('Conference seed failed:', error)
  }

  let conferences: any[] = []
  let currentHref = '/sarsyc-vi'
  try {
    const results = await payload.find({
      collection: 'conferences',
      where: {
        and: [
          { status: { equals: 'published' } },
          { isCurrent: { equals: false } },
        ],
      },
      sort: '-year',
      limit: 100,
      depth: 0,
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
  } catch (error) {
    console.error('Failed to load conferences:', error)
  }

  return (
    <>
      <section className="bg-slate-800 text-white py-8 md:py-10">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Previous Conferences</h1>
            <p className="text-xl text-white/90 mb-6">
              A decade of youth advocacy, knowledge sharing, and regional impact across Southern
              Africa
            </p>
            <Link
              href={currentHref}
              className="btn-accent inline-flex items-center gap-2"
            >
              View Current Conference
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto space-y-8">
            {conferences.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                Previous conference editions will appear here once published.
              </div>
            ) : (
              conferences.map((conf, index) => (
                <article
                  key={conf.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm"
                >
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center md:text-left">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 text-white text-2xl font-bold mb-3">
                        {conferences.length - index}
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{conf.year}</div>
                    </div>

                    <div className="md:col-span-3">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <h2 className="text-2xl font-bold text-gray-900">{conf.title}</h2>
                        <Link
                          href={`/conferences/${conf.slug}`}
                          className="text-sm font-semibold text-primary-700 hover:text-primary-800 inline-flex items-center gap-1"
                        >
                          View details
                          <FiArrowRight className="w-4 h-4" />
                        </Link>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <FiMapPin className="w-4 h-4 text-primary-600" />
                          {conf.location}
                        </div>
                        {conf.participants && (
                          <div className="flex items-center gap-2">
                            <FiUsers className="w-4 h-4 text-primary-600" />
                            {conf.participants} participants
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <FiCalendar className="w-4 h-4 text-primary-600" />
                          {conf.year}
                        </div>
                      </div>

                      {conf.theme && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Theme</p>
                          <p className="text-gray-900 font-medium">{conf.theme}</p>
                        </div>
                      )}

                      <p className="text-gray-700 mb-4 text-justify">{conf.summary}</p>

                      {Array.isArray(conf.keyOutcomes) && conf.keyOutcomes.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FiAward className="w-4 h-4 text-primary-600" />
                            <p className="text-sm font-semibold text-gray-700">Key outcomes</p>
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {conf.keyOutcomes.map((row: any, i: number) => (
                              <li key={i}>{row.outcome}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {conf.highlights && (
                        <p className="text-sm text-gray-500">{conf.highlights}</p>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  )
}
