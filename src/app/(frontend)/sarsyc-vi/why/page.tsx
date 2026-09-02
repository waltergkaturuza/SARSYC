import Link from 'next/link'

// Static content - revalidate every 6 hours
export const revalidate = 21600

const challenges = [
  {
    title: 'Shrinking Global Development Funding',
    description: 'Reduced international aid requires sustainable, homegrown solutions.',
  },
  {
    title: 'Digital Health Risks & Online Gender-Based Violence',
    description: 'New challenges emerge as health services move online.',
  },
  {
    title: 'Climate Change & Youth Vulnerability',
    description: 'Young people disproportionately affected by environmental crises.',
  },
  {
    title: 'Mental Health Crises & Substance Abuse',
    description: 'Growing mental health challenges and substance abuse among youth.',
  },
  {
    title: 'Teenage Pregnancies & Unsafe Abortions',
    description: 'Continued high rates threaten youth health and education.',
  },
  {
    title: 'Rising Non-Communicable Diseases (NCDs)',
    description: 'Increasing burden of diabetes, hypertension, and other NCDs in youth.',
  },
]

export default function WhySarsycVIPage() {
  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="page-hero-title">
              Why SARSYC VI?
            </h1>
            <p className="page-hero-subtitle">
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
      <section className="relative overflow-hidden py-10 md:py-14 bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/sarsyc%20vi%20why%20sarsyv%20vi.jpg')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/45 via-primary-900/35 to-slate-900/50" aria-hidden />

        <div className="container-custom relative z-10">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-3 drop-shadow-lg">Key Challenges We Address</h2>
            <p className="text-lg text-white/90 text-center mb-10 max-w-3xl mx-auto drop-shadow-md">
              SARSYC VI responds to critical challenges facing youth in Southern Africa
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <div
                  key={challenge.title}
                  className="group rounded-2xl border border-white/20 bg-white/15 backdrop-blur-md p-5 shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary-400/40 hover:bg-white/20 hover:shadow-2xl hover:shadow-primary-500/10"
                >
                  <h3 className="text-xl font-bold text-primary-300 group-hover:text-amber-300 transition-colors mb-2">
                    {challenge.title}
                  </h3>
                  <p className="text-white/75 leading-relaxed text-justify">{challenge.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Regional Response */}
      <section className="bg-white py-6 md:py-8">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4 md:mb-5">
              Why Regional Solidarity Matters
            </h2>
            <div className="grid md:grid-cols-2 gap-3 md:gap-4">
              <div className="card p-4 md:p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Shared Challenges</h3>
                <p className="text-sm text-gray-600 leading-relaxed text-justify">
                  Youth across Southern Africa face similar challenges regardless of borders. By working together,
                  we can share solutions and amplify our collective voice.
                </p>
              </div>

              <div className="card p-4 md:p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Stronger Together</h3>
                <p className="text-sm text-gray-600 leading-relaxed text-justify">
                  Regional collaboration creates more sustainable solutions. Together, we can influence policy at
                  both national and regional levels, including SADC summits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-6 md:py-8 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Be Part of the Solution
            </h2>
            <p className="text-lg mb-5 text-white/90">
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



