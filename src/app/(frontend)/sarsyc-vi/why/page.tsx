import Link from 'next/link'
import { FiAlertCircle, FiHeart, FiUsers, FiGlobe, FiTrendingUp, FiShield, FiDroplet, FiThermometer } from 'react-icons/fi'

const challenges = [
  {
    icon: FiTrendingUp,
    title: 'Shrinking Global Development Funding',
    description: 'Reduced international aid requires sustainable, homegrown solutions.',
    color: 'from-red-500 to-red-600',
  },
  {
    icon: FiShield,
    title: 'Digital Health Risks & Online Gender-Based Violence',
    description: 'New challenges emerge as health services move online.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: FiThermometer,
    title: 'Climate Change & Youth Vulnerability',
    description: 'Young people disproportionately affected by environmental crises.',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: FiHeart,
    title: 'Mental Health Crises & Substance Abuse',
    description: 'Growing mental health challenges and substance abuse among youth.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: FiDroplet,
    title: 'Teenage Pregnancies & Unsafe Abortions',
    description: 'Continued high rates threaten youth health and education.',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: FiAlertCircle,
    title: 'Rising Non-Communicable Diseases (NCDs)',
    description: 'Increasing burden of diabetes, hypertension, and other NCDs in youth.',
    color: 'from-blue-500 to-blue-600',
  },
]

export default function WhySarsycVIPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Why SARSYC VI?
            </h1>
            <p className="text-xl text-white/90">
              Responding to shifting development landscapes with homegrown, sustainable solutions
            </p>
          </div>
        </div>
      </section>

      {/* Positioning Statement */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card p-8 md:p-12 bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Positioning</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                <strong>SARSYC VI responds to shifting development landscapes by promoting homegrown, sustainable, 
                youth-led solutions strengthened through regional solidarity and partnerships.</strong>
              </p>
              <p className="text-gray-600 leading-relaxed">
                In an era of reduced international funding and emerging challenges, Southern Africa's youth must 
                come together to create lasting change. SARSYC VI provides the platform for this transformation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Challenges */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <h2 className="section-title">Key Challenges We Address</h2>
            <p className="section-subtitle">
              SARSYC VI responds to critical challenges facing youth in Southern Africa
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => {
                const Icon = challenge.icon
                return (
                  <div key={challenge.title} className="card p-6 hover:shadow-xl transition-all">
                    <div className={`w-14 h-14 bg-gradient-to-br ${challenge.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{challenge.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{challenge.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Regional Response */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="section-title">Why Regional Solidarity Matters</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card p-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                  <FiGlobe className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Shared Challenges</h3>
                <p className="text-gray-600 leading-relaxed">
                  Youth across Southern Africa face similar challenges regardless of borders. By working together, 
                  we can share solutions and amplify our collective voice.
                </p>
              </div>

              <div className="card p-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                  <FiUsers className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Stronger Together</h3>
                <p className="text-gray-600 leading-relaxed">
                  Regional collaboration creates more sustainable solutions. Together, we can influence policy at 
                  both national and regional levels, including SADC summits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section bg-primary-600 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Be Part of the Solution
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join us in Windhoek to align for action and sustain progress in youth health and education.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/participate/register" className="btn-accent px-8 py-4">
                Register for SARSYC VI
              </Link>
              <Link href="/sarsyc-vi" className="btn-outline border-white text-white hover:bg-white/10 px-8 py-4">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}


