import Link from 'next/link'
import Image from 'next/image'
import { FiImage, FiArrowRight } from 'react-icons/fi'
import { getPayloadClient } from '@/lib/payload'
import { ensureConferencesSchema } from '@/lib/ensureConferencesSchema'
import {
  getConferenceGallerySlides,
  resolveConferenceHostCountry,
} from '@/lib/conferenceMedia'
import { getCountryLabel } from '@/lib/countries'
import CountryFlag from '@/components/ui/CountryFlag'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type GalleryItem = {
  src: string
  alt: string
  caption?: string
  conferenceTitle: string
  conferenceSlug: string
  year: number | string
  hostCode: string
  hostLabel: string
}

export default async function GalleryPage() {
  const payload = await getPayloadClient()
  await ensureConferencesSchema(payload)

  let items: GalleryItem[] = []
  try {
    const results = await payload.find({
      collection: 'conferences',
      where: { status: { equals: 'published' } },
      sort: '-year',
      limit: 100,
      depth: 2,
      overrideAccess: true,
    })

    for (const conf of results.docs as any[]) {
      const slides = getConferenceGallerySlides(conf)
      const hostCode = resolveConferenceHostCountry(conf.location)
      const hostLabel = hostCode ? getCountryLabel(hostCode) : ''
      for (const slide of slides) {
        items.push({
          src: slide.src,
          alt: slide.alt,
          caption: slide.caption,
          conferenceTitle: conf.title,
          conferenceSlug: conf.slug,
          year: conf.year,
          hostCode,
          hostLabel,
        })
      }
    }
  } catch (error) {
    console.error('Failed to load gallery photos:', error)
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="page-hero">
        <div className="container-custom">
          <div className="max-w-4xl">
            <h1 className="page-hero-title">Photo &amp; Video Gallery</h1>
            <p className="page-hero-subtitle">
              Moments from past SARSYC conferences and events
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10">
          {items.length === 0 ? (
            <div className="text-center py-12 max-w-2xl mx-auto">
              <FiImage className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No gallery photos yet</h2>
              <p className="text-gray-600 mb-4">
                Photos appear here automatically from each conference&apos;s photo gallery.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                To add photos: go to{' '}
                <strong>Admin Panel → Conferences → Edit a conference → Photo Gallery</strong>,
                upload images, then save.
              </p>
              <Link
                href="/conferences"
                className="inline-flex items-center gap-2 text-primary-700 font-semibold hover:text-primary-800"
              >
                Browse previous conferences
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <p className="text-gray-600">
                  Showing {items.length} photo{items.length === 1 ? '' : 's'} from published
                  conference editions.
                </p>
                <Link
                  href="/conferences"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800"
                >
                  View conferences
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {items.map((item, index) => (
                  <Link
                    key={`${item.conferenceSlug}-${item.src}-${index}`}
                    href={`/conferences/${item.conferenceSlug}`}
                    className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-[4/3] bg-gray-100">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {item.hostCode && (
                          <CountryFlag countryOrCode={item.hostCode} size="sm" />
                        )}
                        <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                          {item.year}
                        </span>
                        {item.hostLabel && (
                          <span className="text-xs text-gray-500">{item.hostLabel}</span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {item.conferenceTitle}
                      </p>
                      {item.caption && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.caption}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
