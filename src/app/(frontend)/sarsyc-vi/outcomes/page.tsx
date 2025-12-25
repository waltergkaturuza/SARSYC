import Link from 'next/link'
import { FiTarget, FiUsers, FiZap, FiLink, FiCheck } from 'react-icons/fi'

const outcomes = [
  {
    icon: FiUsers,
    title: 'Stronger Regional Youth Voice Influencing Policy',
    description: 'Youth representatives actively engaging in national and regional policy dialogues with enhanced capacity and platforms.',
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

export default function OutcomesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Expected Outcomes
            </h1>
            <p className="text-xl text-white/90">
              The impact we aim to create through SARSYC VI
            </p>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-12">
              {outcomes.map((outcome) => {
                const Icon = outcome.icon
                return (
                  <div key={outcome.title} className="card p-8 md:p-12">
                    <div className="flex items-start gap-6 mb-6">
                      <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                        <Icon className="w-10 h-10" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">{outcome.title}</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">{outcome.description}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FiTarget className="w-5 h-5 text-primary-600" />
                        Key Indicators:
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {outcome.indicators.map((indicator) => (
                          <div key={indicator} className="flex items-start gap-3">
                            <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{indicator}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Measurement & Accountability */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card p-8 md:p-12 bg-primary-50 border-2 border-primary-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Measurement & Accountability</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                These outcomes are not aspirational—they are measurable commitments. The Youth Steering Committee 
                and SAYWHAT will track progress on these outcomes through:
              </p>
              <ul className="space-y-3">
                {[
                  'Post-conference action plan monitoring',
                  'Quarterly progress reports',
                  'Annual review meetings',
                  'Mid-term evaluation (2027)',
                  'SARSYC VII assessment (2028)',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <FiCheck className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-primary-600 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Help Us Achieve These Outcomes
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Your participation at SARSYC VI directly contributes to these outcomes
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/participate/register" className="btn-accent px-8 py-4">
                Register for SARSYC VI
              </Link>
              <Link href="/sarsyc-vi/objectives" className="btn-outline border-white text-white hover:bg-white/10 px-8 py-4">
                View Conference Objectives
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

