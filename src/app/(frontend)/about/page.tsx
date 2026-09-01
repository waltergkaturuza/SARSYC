import Image from 'next/image'
import Link from 'next/link'
import JourneyTimeline from '@/components/about/JourneyTimeline'

const values = [
  {
    title: 'Youth-Centered',
    description: 'We amplify youth voices and prioritize youth leadership in all aspects of our work.',
  },
  {
    title: 'Regional Solidarity',
    description: 'We foster collaboration and knowledge-sharing across Southern Africa.',
  },
  {
    title: 'Evidence-Based',
    description: 'We ground our advocacy in research, data, and lived experiences of young people.',
  },
  {
    title: 'Inclusive & Accessible',
    description: 'We create spaces that welcome and include all young people, regardless of background.',
  },
]

const milestones = [
  { year: 2014, edition: 'SARSYC I', location: 'Maputo, Mozambique', participants: 200 },
  { year: 2016, edition: 'SARSYC II', location: 'Gaborone, Botswana', participants: 300 },
  { year: 2018, edition: 'SARSYC III', location: 'Johannesburg, South Africa', participants: 400 },
  { year: 2020, edition: 'SARSYC IV', location: 'Lusaka, Zambia', participants: 350 },
  { year: 2022, edition: 'SARSYC V', location: 'Maputo, Mozambique', participants: 500 },
  { year: 2026, edition: 'SARSYC VI', location: 'Windhoek, Namibia', participants: '500+', isCurrent: true },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="page-hero-title">
              About SARSYC
            </h1>
            <p className="page-hero-subtitle">
              The premier regional platform for youth health and education advocacy in Southern Africa
            </p>
          </div>
        </div>
      </section>

      {/* What is SARSYC */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-center lg:items-start">
            <div className="w-full lg:w-[30%] shrink-0 flex justify-center lg:justify-start">
              <div className="relative w-full max-w-[280px] sm:max-w-xs lg:max-w-none aspect-square">
                <Image
                  src="/logo.jpeg"
                  alt="SARSYC conference logo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 280px, 30vw"
                  priority
                />
              </div>
            </div>
            <div className="w-full lg:w-[70%] min-w-0">
              <h2 className="section-title text-left mb-6">What is SARSYC?</h2>
              <div className="prose prose-lg max-w-none text-left">
                <p className="text-gray-600 leading-relaxed mb-4">
                  The <strong>Southern African Regional Students and Youth Conference (SARSYC)</strong> is a biennial
                  regional youth conference founded in <strong>2015</strong> by SAYWHAT (Student and Youth Working on
                  Reproductive Health Action Team). SARSYC VI is convened by SAYWHAT in partnership with{' '}
                  <a href="https://www.unam.edu.na" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-semibold">
                    University of Namibia (UNAM)
                  </a>.
                  It originated from SAYWHAT&apos;s National Students&apos; Conference in Zimbabwe.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  SARSYC focuses on <strong>SRHR, HIV/AIDS, education rights, youth well-being, and integrated advocacy</strong>.
                  It is designed as a feeder platform to major regional forums such as ICASA, the SADC Summit, World Conference on Lung Health, and International Conference on Family Planning.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Since 2015, SARSYC has brought together students, young researchers, policymakers, civil society,
                  development partners, and the private sector from across Southern Africa to share knowledge, build
                  networks, and develop actionable strategies to improve youth sexual and reproductive health and
                  education outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-gray-50 py-8 md:py-10">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            <div className="card p-5 md:p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                A Southern Africa where all young people enjoy optimal sexual and reproductive health, access to
                quality education, and are empowered to realize their full potential.
              </p>
            </div>

            <div className="card p-5 md:p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To mobilize, connect, and empower students and youth in Southern Africa to advocate for evidence-based
                policies and programs that advance youth sexual and reproductive health and education.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-white py-8 md:py-10">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-5 md:mb-6">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {values.map((value) => (
              <div key={value.title} className="card p-4 md:p-5 text-center hover:shadow-xl transition-shadow">
                <h3 className="font-bold text-gray-900 mb-1.5">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SARSYC Journey */}
      <section className="section bg-white py-0">
        <div className="container-custom px-0">
          <div className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-12 mb-0">
            <div className="container-custom">
              <h2 className="text-3xl md:text-5xl font-bold text-center">The SARSYC Journey</h2>
            </div>
          </div>
          <JourneyTimeline />
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta bg-primary-600 text-white py-4 md:py-5">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Join the SARSYC Movement
            </h2>
            <p className="text-base md:text-lg mb-4 text-white/90">
              Be part of the next chapter in Southern Africa's youth advocacy movement.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/participate/register" className="btn-accent px-6 py-2.5">
                Register for SARSYC VI
              </Link>
              <Link href="/sarsyc-vi" className="btn-outline border-white text-white hover:bg-white/10 px-6 py-2.5">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}






