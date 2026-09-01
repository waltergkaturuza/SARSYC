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
      <Link href="/programme/sessions#day-1" className="card p-6 lg:p-8 block group hover:shadow-2xl transition-all">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            1
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
              Day 1: Research Indaba III
            </h3>
            <p className="text-sm font-medium text-primary-600 mb-3">
              Evidence for Action — Youth-Led Research shaping Policy and Practice
            </p>
            <ul className="space-y-2 text-sm text-gray-600 list-disc pl-4">
              <li>Setting the Stage, Opening Remarks & The Evidence Engine</li>
              <li>Youth-led abstract presentations across all 5 conference tracks</li>
              <li>Evidence to Action Plenary — translating research into regional realities</li>
              <li>Poster presentations & keynote: Evidence, Leadership and Legacy</li>
              <li>Launch of the SARSYC V Research Volume (2nd edition)</li>
              <li>Celebrating Evidence Excellence — awards for top oral presentations</li>
            </ul>
            <span className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm mt-4 group-hover:gap-3 transition-all">
              View Day 1 sessions
              <FiArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>

      <Link href="/programme/sessions#day-2" className="card p-6 lg:p-8 block group hover:shadow-2xl transition-all">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-secondary-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            2
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
              Day 2: Forums & Engagements
            </h3>
            <div className="space-y-3 text-gray-600">
              <div>
                <strong className="text-gray-900">Mugota/Ixhiba Young Men&apos;s Forum</strong>
                <p className="text-sm mt-1">
                  Confronting suicide, substance use & sexual health challenges facing adolescent
                  boys and young men — from keynote to the Young Men&apos;s Call to Action.
                </p>
              </div>
              <div>
                <strong className="text-gray-900">
                  Web for Life Network for Girls & Young Women Symposium | SHE SOARS
                </strong>
                <p className="text-sm mt-1">
                  Advancing education equity, digital safety & healthy lifestyles for adolescent
                  girls and young women, closing with the Young Women Call to Action.
                </p>
              </div>
              <div>
                <strong className="text-gray-900">Alliance Building Labs</strong>
                <p className="text-sm mt-1">
                  Transforming evidence and dialogue into coordinated regional action — featuring
                  the GEAR Alliance Impact Showcase and Alliance Spotlight.
                </p>
              </div>
              <div>
                <strong className="text-gray-900">
                  Students Talks & Engagement with Policymakers and Partners (STEPP)
                </strong>
                <p className="text-sm mt-1">
                  Youth advocacy presentations and policy panels with parliamentarians and
                  partners, capped by a high-level ministerial keynote.
                </p>
              </div>
              <div>
                <strong className="text-gray-900">High-Level Youth–Parliamentarian Round Table</strong>
                <p className="text-sm mt-1">
                  An evening intergenerational dialogue (closed meeting) culminating in the signing
                  of the SARSYC VI Youth Health and Education Accountability Compact.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm mt-4 group-hover:gap-3 transition-all">
              View Day 2 sessions
              <FiArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>

      <Link href="/programme/sessions#day-3" className="card p-6 lg:p-8 block group hover:shadow-2xl transition-all">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-accent-500 rounded-xl flex items-center justify-center text-gray-900 text-2xl font-bold flex-shrink-0">
            3
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
              Day 3: High-Level Engagement & Culture Night
            </h3>
            <p className="text-sm font-medium text-primary-600 mb-3">
              High Level Engagement Platform | Official Ceremony
            </p>
            <div className="space-y-3 text-gray-600">
              <div>
                <strong className="text-gray-900">High-Level Engagement Platform</strong>
                <p className="text-sm mt-1">
                  Official ceremony with anthems, SARSYC&apos;s twelve-year journey, UNESCO and
                  Society for AIDS in Africa addresses, reading of the Windhoek Declaration by the
                  Youth Steering Committee, and a SADC Parliamentary Forum reflection — From
                  Gaborone to Windhoek.
                </p>
              </div>
              <div>
                <strong className="text-gray-900">Voices of Namibia & Regional Leadership</strong>
                <p className="text-sm mt-1">
                  University of Namibia choir interlude, keynote by the Governor of Khomas Region,
                  and a Vote of Thanks from the Vice Chancellor of the University of Namibia.
                </p>
              </div>
              <div>
                <strong className="text-gray-900">
                  Culture Night — Culture is not the backdrop! It is the Blueprint!
                </strong>
                <p className="text-sm mt-1">
                  Cultural dress showcase, Sixteen Nations One Movement opening, Unity in Diversity
                  keynote, traditional performances, then dinner, music and networking.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm mt-4 group-hover:gap-3 transition-all">
              View Day 3 sessions
              <FiArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
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
        {title ? <h2 className="section-title">{title}</h2> : null}
        {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
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
