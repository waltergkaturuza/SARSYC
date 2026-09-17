import Link from 'next/link'
import { FiExternalLink, FiArrowRight } from 'react-icons/fi'
import OrathonFlyerSlider from '@/components/ui/OrathonFlyerSlider'
import CountryFlag from '@/components/ui/CountryFlag'
import { getPayloadClient } from '@/lib/payload'
import { ensureOrathonCountriesSchema } from '@/lib/ensureOrathonCountriesSchema'
import { getCountryLabel } from '@/lib/countries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const FALLBACK_LINKS = [
  {
    country: 'ZW',
    title: 'Register for Orathon — Zimbabwe',
    registrationUrl: 'https://onlinetickets.hypenation.co.zw/Orathon2026',
    description: 'Official online ticket registration for the Zimbabwe Orathon.',
  },
  {
    country: 'NA',
    title: 'Register for Orathon — Namibia',
    registrationUrl: 'https://timetracka.app/events/saywhat-namibia-orathon-run-2026',
    description: 'Official registration for the SAYWHAT Namibia Orathon Run 2026.',
  },
]

function mediaUrl(file: any): string | null {
  if (!file) return null
  if (typeof file === 'string') return file
  const candidates = [file.url, file.thumbnailURL, file.sizes?.card?.url].filter(Boolean)
  for (const url of candidates) {
    if (typeof url === 'string' && url.length > 0) return url
  }
  return null
}

export default async function RegisterOrathonPage() {
  let countries: Array<{
    country: string
    title: string
    registrationUrl: string
    description?: string | null
  }> = FALLBACK_LINKS

  let flyerSlides: Array<{ src: string; alt: string }> = []

  try {
    const payload = await getPayloadClient()
    await ensureOrathonCountriesSchema(payload)

    const result = await payload.find({
      collection: 'orathon-countries' as any,
      where: { active: { equals: true } },
      limit: 50,
      sort: 'displayOrder',
      depth: 1,
      overrideAccess: true,
    })

    if (result.docs?.length) {
      countries = result.docs.map((doc: any) => ({
        country: doc.country,
        title: doc.title,
        registrationUrl: doc.registrationUrl,
        description: doc.description,
      }))

      flyerSlides = result.docs
        .map((doc: any) => {
          const src = mediaUrl(doc.flyer)
          if (!src) return null
          return {
            src,
            alt: `${getCountryLabel(doc.country)} Orathon flyer`,
          }
        })
        .filter(Boolean) as Array<{ src: string; alt: string }>
    }
  } catch (error) {
    console.error('Error loading Orathon countries:', error)
  }

  return (
    <>
      <section className="page-hero">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="page-hero-title">Registration for Orathon</h1>
            <p className="page-hero-subtitle">
              The Orathon is a post-conference activity in November 2026. Choose your country registration
              link below to complete signup on the official platform.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-5 lg:gap-8 items-start max-w-6xl mx-auto">
            <div className="space-y-5">
              {countries.map((item) => (
                <a
                  key={`${item.country}-${item.registrationUrl}`}
                  href={item.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="w-14 h-14 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <CountryFlag countryOrCode={item.country} size="md" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold uppercase tracking-wide text-primary-600 mb-1">
                        {getCountryLabel(item.country)}
                      </p>
                      <h2 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors">
                        {item.title}
                      </h2>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-2 text-primary-700 font-semibold text-sm">
                      Open registration
                      <FiExternalLink className="w-4 h-4" aria-hidden />
                    </span>
                  </div>
                </a>
              ))}

              <div className="pt-4">
                <Link
                  href="/participate"
                  className="inline-flex items-center gap-2 text-primary-700 font-medium hover:underline"
                >
                  Back to Participate hub
                  <FiArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </div>

            <div>
              <OrathonFlyerSlider slides={flyerSlides} />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
