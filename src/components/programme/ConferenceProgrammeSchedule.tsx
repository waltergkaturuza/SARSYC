import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
import CultureNightImageSlider from '@/components/programme/CultureNightImageSlider'

const DEFAULT_SUBTITLE =
  'A comprehensive three-day program of learning, engagement, and action in Windhoek.'

type ConferenceProgrammeScheduleProps = {
  variant?: 'page' | 'embed' | 'cards-only'
  title?: string
  subtitle?: string
  showViewFullLink?: boolean
}

export default function ConferenceProgrammeSchedule({
  variant = 'page',
  title = 'Program Schedule',
  subtitle = DEFAULT_SUBTITLE,
  showViewFullLink = false,
}: ConferenceProgrammeScheduleProps) {
  const cards = (
    <div className="space-y-6">
      <div className="card p-6 lg:p-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            1
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Day 1: Research Indaba</h3>
            <p className="text-gray-600">
              A full day dedicated to research presentations, discussions, and knowledge exchange.
              Researchers and academics will share their findings and engage in critical dialogue.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              <em>Detailed schedule will be published once speakers are confirmed.</em>
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6 lg:p-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-secondary-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            2
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Day 2: Multiple Forums & Engagements</h3>
            <div className="space-y-3 text-gray-600">
              <div>
                <strong className="text-gray-900">Mugota/Ixhiba Young Men&apos;s Forum</strong>
                <p className="text-sm mt-1">
                  A dedicated space for young men to discuss health, education, and empowerment.
                </p>
              </div>
              <div>
                <strong className="text-gray-900">Web for Life Network Symposium</strong>
                <p className="text-sm mt-1">
                  Exploring digital health solutions and online safety for young people.
                </p>
              </div>
              <div>
                <strong className="text-gray-900">Alliance Building Labs</strong>
                <p className="text-sm mt-1">
                  Collaborative sessions to build strategic partnerships and networks.
                </p>
              </div>
              <div>
                <strong className="text-gray-900">
                  Student Talks and Engagement with Policymakers and Partners
                </strong>
                <p className="text-sm mt-1">
                  Direct dialogue between students, policymakers, and development partners.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              <em>Detailed schedule will be published once speakers are confirmed.</em>
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6 lg:p-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-accent-500 rounded-xl flex items-center justify-center text-gray-900 text-2xl font-bold flex-shrink-0">
            3
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Day 3: Official Opening, Closing & Culture Night
            </h3>
            <div className="space-y-3 text-gray-600">
              <div>
                <strong className="text-gray-900">Official Opening and Closing Ceremony</strong>
                <p className="text-sm mt-1">
                  Formal opening and closing ceremonies with keynote addresses and official
                  statements.
                </p>
              </div>
              <div>
                <strong className="text-gray-900">Culture Night</strong>
                <p className="text-sm mt-1">
                  A celebration of Southern African culture, music, and arts showcasing the rich
                  diversity of the region.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              <em>Detailed schedule will be published once speakers are confirmed.</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const scheduleWithSlider = (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-10 items-start">
      <div className="order-2 md:order-1">{cards}</div>
      <div className="order-1 md:order-2 md:sticky md:top-8">
        <CultureNightImageSlider />
      </div>
    </div>
  )

  if (variant === 'cards-only') {
    return cards
  }

  if (variant === 'embed') {
    return (
      <>
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{subtitle}</p>
        {scheduleWithSlider}
        {showViewFullLink ? (
          <p className="text-center mt-8">
            <Link
              href="/programme"
              className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700"
            >
              View full programme
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </p>
        ) : null}
      </>
    )
  }

  return (
    <section className="section bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
        <h2 className="section-title sr-only">{title}</h2>
        <p className="section-subtitle text-center max-w-3xl mx-auto mb-10">{subtitle}</p>
        {scheduleWithSlider}
      </div>
    </section>
  )
}
