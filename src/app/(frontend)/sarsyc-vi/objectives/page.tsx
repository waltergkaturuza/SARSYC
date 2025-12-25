import Link from 'next/link'
import { FiTarget, FiUsers, FiLink, FiZap } from 'react-icons/fi'

const objectives = [
  {
    icon: FiUsers,
    title: 'Strengthen Meaningful Youth Engagement',
    description: 'Enhance youth participation in national and regional health & education policy-making processes.',
    outcomes: [
      'Youth representatives in policy dialogues',
      'Training on policy advocacy and engagement',
      'Platforms for youth-policymaker dialogue',
      'Sustained youth voice in decision-making',
    ],
  },
  {
    icon: FiLink,
    title: 'Foster Regional Collaboration',
    description: 'Build and strengthen alliances among youth networks, CSOs, private sector, and development partners.',
    outcomes: [
      'Stronger regional youth networks',
      'Multi-stakeholder partnerships',
      'Knowledge sharing mechanisms',
      'Joint advocacy initiatives',
    ],
  },
  {
    icon: FiZap,
    title: 'Generate Actionable Strategies',
    description: 'Develop gender-responsive strategies that sustain progress and address emerging challenges.',
    outcomes: [
      'Gender-responsive action plans',
      'Evidence-based interventions',
      'Sustainable implementation models',
      'Monitoring and evaluation frameworks',
    ],
  },
]

export default function ObjectivesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Conference Objectives
            </h1>
            <p className="text-xl text-white/90">
              Clear, actionable goals driving SARSYC VI
            </p>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-12">
              {objectives.map((objective, index) => {
                const Icon = objective.icon
                return (
                  <div key={objective.title} className="card p-8 md:p-12">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center text-white">
                          <Icon className="w-10 h-10" />
                        </div>
                        <div className="mt-4 text-center">
                          <span className="inline-block w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl">
                            {index + 1}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">{objective.title}</h2>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">{objective.description}</p>

                        <div className="bg-gray-50 rounded-xl p-6">
                          <h3 className="font-bold text-gray-900 mb-4">Expected Outcomes:</h3>
                          <ul className="space-y-3">
                            {objective.outcomes.map((outcome) => (
                              <li key={outcome} className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">{outcome}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Framework */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
              <FiTarget className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Aligned for Impact</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              These objectives are interconnected and mutually reinforcing. By strengthening youth engagement, 
              fostering collaboration, and generating actionable strategies, SARSYC VI creates a comprehensive 
              framework for sustained progress in youth health and education across Southern Africa.
            </p>
            <Link href="/sarsyc-vi/why" className="btn-primary px-8 py-4">
              Learn Why These Objectives Matter
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

