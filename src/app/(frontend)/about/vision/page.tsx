import { FiEye, FiTarget, FiHeart, FiUsers, FiGlobe, FiAward, FiTrendingUp, FiZap } from 'react-icons/fi'
import Link from 'next/link'

const values = [
  {
    icon: FiUsers,
    title: 'Youth-Centered',
    description: 'We place youth at the center of everything we do, amplifying their voices and prioritizing their leadership.',
  },
  {
    icon: FiGlobe,
    title: 'Regional Solidarity',
    description: 'We foster collaboration, knowledge-sharing, and collective action across Southern Africa.',
  },
  {
    icon: FiAward,
    title: 'Evidence-Based',
    description: 'We ground our advocacy in rigorous research, data, and the lived experiences of young people.',
  },
  {
    icon: FiHeart,
    title: 'Inclusive',
    description: 'We create spaces that welcome all young people, regardless of background, identity, or circumstance.',
  },
  {
    icon: FiTrendingUp,
    title: 'Action-Oriented',
    description: 'We translate knowledge and dialogue into concrete actions and measurable outcomes.',
  },
  {
    icon: FiZap,
    title: 'Innovation',
    description: 'We embrace new ideas, technologies, and approaches to advance youth empowerment.',
  },
]

export default function VisionPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our Vision & Mission
            </h1>
            <p className="text-xl text-white/90">
              Building a future where all young people in Southern Africa thrive
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Vision */}
            <div>
              <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center text-white mb-6">
                <FiEye className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                A Southern Africa where all young people enjoy optimal sexual and reproductive health, access to
                quality education, and are empowered to realize their full potential as active citizens and change agents.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We envision a region where youth-led advocacy drives evidence-based policies and programs that create
                lasting positive change in the lives of young people across all 14 SADC member states.
              </p>
            </div>

            {/* Mission */}
            <div>
              <div className="w-20 h-20 bg-gradient-secondary rounded-2xl flex items-center justify-center text-white mb-6">
                <FiTarget className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                To mobilize, connect, and empower students and youth in Southern Africa to advocate for evidence-based
                policies and programs that advance youth sexual and reproductive health and education.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Through biennial conferences, knowledge sharing, and sustained advocacy, we strengthen youth movements
                and amplify youth voices in regional and national policy dialogues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <h2 className="section-title">Our Core Values</h2>
          <p className="section-subtitle">
            These principles guide everything we do at SARSYC
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div key={value.title} className="card p-8 hover:shadow-xl transition-all">
                  <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center text-white mb-6">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Strategic Priorities */}
      <section className="section bg-white">
        <div className="container-custom">
          <h2 className="section-title">Strategic Priorities</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="card p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary-600">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Strengthen Youth Advocacy Networks
                    </h3>
                    <p className="text-gray-600">
                      Build and sustain strong regional networks of youth advocates working on health and education.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary-600">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Advance Youth SRHR and Education
                    </h3>
                    <p className="text-gray-600">
                      Drive policy and programmatic improvements in youth sexual and reproductive health and quality education.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary-600">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Generate and Share Knowledge
                    </h3>
                    <p className="text-gray-600">
                      Produce and disseminate evidence to inform youth health and education policy and practice.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary-600">4</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Influence Regional and National Policies
                    </h3>
                    <p className="text-gray-600">
                      Engage with policymakers and stakeholders to ensure youth-responsive policies and programs.
                    </p>
                  </div>
                </div>
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
              Join Us in Making This Vision Reality
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Be part of the movement transforming youth health and education in Southern Africa.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/participate/register" className="btn-accent px-8 py-4">
                Register for SARSYC VI
              </Link>
              <Link href="/about" className="btn-outline border-white text-white hover:bg-white/10 px-8 py-4">
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}



