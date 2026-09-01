import Link from 'next/link'

const values = [
  {
    title: 'Youth-Centered',
    description: 'We place youth at the center of everything we do, amplifying their voices and prioritizing their leadership.',
  },
  {
    title: 'Regional Solidarity',
    description: 'We foster collaboration, knowledge-sharing, and collective action across Southern Africa.',
  },
  {
    title: 'Evidence-Based',
    description: 'We ground our advocacy in rigorous research, data, and the lived experiences of young people.',
  },
  {
    title: 'Inclusive',
    description: 'We create spaces that welcome all young people, regardless of background, identity, or circumstance.',
  },
  {
    title: 'Action-Oriented',
    description: 'We translate knowledge and dialogue into concrete actions and measurable outcomes.',
  },
  {
    title: 'Innovation',
    description: 'We embrace new ideas, technologies, and approaches to advance youth empowerment.',
  },
]

export default function VisionPage() {
  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="page-hero-title">
              Our Vision & Mission
            </h1>
            <p className="page-hero-subtitle">
              Building a future where all young people in Southern Africa thrive
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-white py-8 md:py-10">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-5 md:gap-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Vision</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                A Southern Africa where all young people enjoy optimal sexual and reproductive health, access to
                quality education, and are empowered to realize their full potential as active citizens and change agents.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We envision a region where youth-led advocacy drives evidence-based policies and programs that create
                lasting positive change in the lives of young people across all 16 SADC member states.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
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
      <section className="bg-gray-50 py-8 md:py-10">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">
            Our Core Values
          </h2>
          <p className="text-center text-gray-600 mb-5 md:mb-6 max-w-2xl mx-auto">
            These principles guide everything we do at SARSYC
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {values.map((value) => (
              <div key={value.title} className="card p-4 md:p-5 hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Priorities */}
      <section className="bg-white py-8 md:py-10">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-5 md:mb-6">
            Strategic Priorities
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="card p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary-600">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Strengthen Youth Advocacy Networks
                    </h3>
                    <p className="text-gray-600">
                      Build and sustain strong regional networks of youth advocates working on health and education.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary-600">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Advance Youth SRHR and Education
                    </h3>
                    <p className="text-gray-600">
                      Drive policy and programmatic improvements in youth sexual and reproductive health and quality education.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary-600">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Generate and Share Knowledge
                    </h3>
                    <p className="text-gray-600">
                      Produce and disseminate evidence to inform youth health and education policy and practice.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary-600">4</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
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
      <section className="about-cta bg-primary-600 text-white py-8 md:py-10">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Us in Making This Vision Reality
            </h2>
            <p className="text-xl mb-6 text-white/90">
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
