import Link from 'next/link'
import { FiUsers, FiMapPin, FiCalendar, FiLink, FiAward } from 'react-icons/fi'

const countries = [
  { name: 'Angola', flag: '🇦🇴' },
  { name: 'Malawi', flag: '🇲🇼' },
  { name: 'Mozambique', flag: '🇲🇿' },
  { name: 'Zambia', flag: '🇿🇲' },
  { name: 'Zimbabwe', flag: '🇿🇼' },
]

const projects = [
  {
    name: 'Girls Education Advocacy in the Region',
    funder: 'Education Out Loud',
    status: 'Renewed 2024-2025',
    description: 'Advocating for girls\' education rights and access across the region.',
  },
  {
    name: 'Sexuality Education for Transformation',
    funder: 'Amplify Change',
    status: 'Renewed 2024-2025',
    description: 'Promoting comprehensive sexuality education for transformation and empowerment.',
  },
]

export default function GearAlliancePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-pink-600 via-purple-600 to-primary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              GEAR Alliance
            </h1>
            <p className="text-xl text-white/90 mb-4">
              Girls Education Advocacy in the Region Alliance
            </p>
            <p className="text-lg text-white/80">
              Born from SARSYC resolutions, driving girls' education across Southern Africa
            </p>
          </div>
        </div>
      </section>

      {/* What is GEAR */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card p-8 md:p-12 bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What is GEAR?</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                The <strong>Girls Education Advocacy in the Region (GEAR) Alliance</strong> is a regional coalition 
                dedicated to advancing girls' education rights and access across Southern Africa.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Founded in <strong>2021</strong>, GEAR was born directly from resolutions and commitments made at 
                previous SARSYC conferences. It represents a concrete outcome of youth-led advocacy, demonstrating 
                how conference declarations translate into sustained action.
              </p>
              <p className="text-gray-600 leading-relaxed">
                GEAR brings together youth organizations, civil society groups, and education advocates from five 
                Southern African countries to work collectively on girls' education challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Projects */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <h2 className="section-title">Key Projects</h2>
            <p className="section-subtitle">
              Two flagship projects driving GEAR's impact, both renewed through 2025
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {projects.map((project) => (
                <div key={project.name} className="card p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                      <FiAward className="w-8 h-8" />
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      {project.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{project.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    <strong>Funder:</strong> {project.funder}
                  </p>
                  <p className="text-gray-600 leading-relaxed">{project.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Countries */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="section-title">GEAR Countries</h2>
            <p className="section-subtitle">
              Active in 5 Southern African countries
            </p>

            <div className="grid md:grid-cols-5 gap-6">
              {countries.map((country) => (
                <div key={country.name} className="text-center">
                  <div className="text-6xl mb-4">{country.flag}</div>
                  <h3 className="text-xl font-bold text-gray-900">{country.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Connection to SARSYC */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card p-8 md:p-12 bg-primary-50 border-2 border-primary-200">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <FiLink className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Connection to SARSYC</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    GEAR Alliance is a perfect example of how SARSYC resolutions translate into real-world impact. 
                    What started as conference commitments has grown into a sustained, multi-country alliance with 
                    two active projects and growing influence.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    At SARSYC VI, we'll continue to strengthen GEAR and explore new alliances and partnerships that 
                    can emerge from our collective commitments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-br from-pink-600 to-purple-600 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join the Movement
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Be part of SARSYC VI and contribute to the next generation of regional alliances
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/participate/register" className="btn-accent px-8 py-4">
                Register for SARSYC VI
              </Link>
              <Link href="/sarsyc-vi" className="btn-outline border-white text-white hover:bg-white/10 px-8 py-4">
                Learn More About SARSYC VI
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

