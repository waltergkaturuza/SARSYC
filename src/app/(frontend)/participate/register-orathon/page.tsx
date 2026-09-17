import Link from 'next/link'
import { FiExternalLink, FiMapPin, FiArrowRight } from 'react-icons/fi'
import OrathonFlyerSlider from '@/components/ui/OrathonFlyerSlider'

const ORATHON_LINKS = [
  {
    country: 'Zimbabwe',
    label: 'Register for Orathon — Zimbabwe',
    href: 'https://onlinetickets.hypenation.co.zw/Orathon2026',
    description: 'Official online ticket registration for the Zimbabwe Orathon.',
  },
  {
    country: 'Namibia',
    label: 'Register for Orathon — Namibia',
    href: 'https://timetracka.app/events/saywhat-namibia-orathon-run-2026',
    description: 'Official registration for the SAYWHAT Namibia Orathon Run 2026.',
  },
] as const

export default function RegisterOrathonPage() {
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
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
            <div className="space-y-5">
              {ORATHON_LINKS.map((item) => (
                <a
                  key={item.country}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0">
                      <FiMapPin className="w-6 h-6" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold uppercase tracking-wide text-primary-600 mb-1">
                        {item.country}
                      </p>
                      <h2 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors">
                        {item.label}
                      </h2>
                      <p className="text-sm text-gray-600">{item.description}</p>
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
              <OrathonFlyerSlider />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
