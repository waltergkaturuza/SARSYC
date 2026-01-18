import { FiTarget, FiEye, FiHeart, FiUsers, FiGlobe, FiAward } from 'react-icons/fi'
import Link from 'next/link'
import JourneyTimeline from '@/components/about/JourneyTimeline'

const values = [
  {
    icon: FiUsers,
    title: 'Youth-Centered',
    description: 'We amplify youth voices and prioritize youth leadership in all aspects of our work.',
  },
  {
    icon: FiGlobe,
    title: 'Regional Solidarity',
    description: 'We foster collaboration and knowledge-sharing across Southern Africa.',
  },
  {
    icon: FiAward,
    title: 'Evidence-Based',
    description: 'We ground our advocacy in research, data, and lived experiences of young people.',
  },
  {
    icon: FiHeart,
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
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About SARSYC
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              The premier regional platform for youth health and education advocacy in Southern Africa
            </p>
          </div>
        </div>
      </section>

      {/* What is SARSYC */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="section-title">What is SARSYC?</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                The <strong>Southern African Regional Students and Youth Conference (SARSYC)</strong> is a biennial
                regional youth conference founded in <strong>2015</strong> by SAYWHAT (Student and Youth Working on 
                Reproductive Health Action Team). It originated from SAYWHAT's National Students' Conference in Zimbabwe.
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
      </section>

      {/* Vision & Mission */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-8">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center text-white mb-6">
                <FiEye className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                A Southern Africa where all young people enjoy optimal sexual and reproductive health, access to
                quality education, and are empowered to realize their full potential.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-16 h-16 bg-gradient-secondary rounded-xl flex items-center justify-center text-white mb-6">
                <FiTarget className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To mobilize, connect, and empower students and youth in Southern Africa to advocate for evidence-based
                policies and programs that advance youth sexual and reproductive health and education.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section bg-white">
        <div className="container-custom">
          <h2 className="section-title">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div key={value.title} className="card p-6 text-center hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              )
            })}
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
      <section className="section bg-primary-600 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join the SARSYC Movement
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Be part of the next chapter in Southern Africa's youth advocacy movement.
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






