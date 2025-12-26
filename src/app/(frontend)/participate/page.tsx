import Link from 'next/link'
import { FiUserPlus, FiFileText, FiHeart, FiArrowRight, FiCheck } from 'react-icons/fi'

const participationOptions = [
  {
    icon: FiUserPlus,
    title: 'Register to Attend',
    description: 'Join 500+ young leaders, researchers, and advocates at SARSYC VI in Windhoek.',
    features: [
      'Access all sessions and plenaries',
      'Certificate of participation',
      'Conference materials and meals',
      'Networking opportunities',
      'Exhibition access',
    ],
    cta: 'Register Now',
    href: '/participate/register',
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: FiFileText,
    title: 'Submit an Abstract',
    description: 'Share your research and present at one of the premier regional youth conferences.',
    features: [
      'Oral or poster presentation',
      'Peer review by experts',
      'Publication in conference proceedings',
      'Recognition and visibility',
      'Networking with researchers',
    ],
    cta: 'Submit Abstract',
    href: '/participate/submit-abstract',
    color: 'from-secondary-500 to-secondary-600',
    deadline: 'Deadline: June 30, 2026',
  },
  {
    icon: FiHeart,
    title: 'Volunteer',
    description: 'Be part of the team that makes SARSYC VI an unforgettable experience.',
    features: [
      'Certificate of service',
      'Attend sessions during breaks',
      'Meals and refreshments',
      'Exclusive volunteer events',
      'Build your CV and network',
    ],
    cta: 'Apply to Volunteer',
    href: '/participate/volunteer',
    color: 'from-accent-500 to-orange-500',
  },
]

export default function ParticipatePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Participate in SARSYC VI
            </h1>
            <p className="text-xl text-white/90">
              Choose how you want to be part of this transformative conference
            </p>
          </div>
        </div>
      </section>

      {/* Participation Options */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {participationOptions.map((option) => {
              const Icon = option.icon
              return (
                <div key={option.title} className="card overflow-hidden group hover:shadow-2xl transition-all">
                  <div className={`h-2 bg-gradient-to-r ${option.color}`}></div>
                  
                  <div className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center text-white mb-6`}>
                      <Icon className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{option.title}</h3>
                    <p className="text-gray-600 mb-6">{option.description}</p>

                    {option.deadline && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                        <p className="text-sm font-semibold text-red-600">
                          ⏰ {option.deadline}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3 mb-8">
                      <p className="text-sm font-semibold text-gray-700">What's Included:</p>
                      <ul className="space-y-2">
                        {option.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                            <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link href={option.href} className="btn-primary w-full justify-center group-hover:scale-105 transition-transform">
                      {option.cta}
                      <FiArrowRight className="ml-2" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Participate */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="section-title">Why Participate in SARSYC VI?</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-3">🌍 Regional Platform</h3>
                <p className="text-gray-600">
                  Connect with 500+ participants from 14+ Southern African countries.
                </p>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-3">🎓 Learn from Experts</h3>
                <p className="text-gray-600">
                  Engage with 50+ renowned speakers and thought leaders in youth health and education.
                </p>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-3">📊 Share Your Research</h3>
                <p className="text-gray-600">
                  Present your work and get feedback from experts and peers.
                </p>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-3">🤝 Build Networks</h3>
                <p className="text-gray-600">
                  Create lasting connections with like-minded youth advocates and organizations.
                </p>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-3">💪 Drive Change</h3>
                <p className="text-gray-600">
                  Be part of commitments and resolutions that shape youth health and education policy.
                </p>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-3">🏆 Gain Recognition</h3>
                <p className="text-gray-600">
                  Receive certificates, build your CV, and enhance your professional profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-primary-600 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join SARSYC VI?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Registration is now open! Secure your spot today.
            </p>
            <Link href="/participate/register" className="btn-accent text-lg px-8 py-4">
              Register Now
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}



