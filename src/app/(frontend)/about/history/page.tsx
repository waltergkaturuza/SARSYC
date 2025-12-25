import Link from 'next/link'
import { FiMapPin, FiUsers, FiAward, FiCalendar, FiCheck } from 'react-icons/fi'

const conferences = [
  {
    edition: 'SARSYC I',
    year: 2014,
    location: 'Maputo, Mozambique',
    participants: 200,
    theme: 'Youth Leadership in Health Advocacy',
    keyOutcomes: [
      'Maputo Declaration on Youth SRHR',
      'Formation of country youth networks',
      'Partnership with WHO and UNFPA',
    ],
    highlights: '5 countries, 150 abstracts, 20 partners',
  },
  {
    edition: 'SARSYC II',
    year: 2016,
    location: 'Gaborone, Botswana',
    participants: 300,
    theme: 'Education for Empowerment',
    keyOutcomes: [
      'Gaborone Youth Education Charter',
      'Launch of regional youth research network',
      'Policy commitments from 7 governments',
    ],
    highlights: '8 countries, 180 abstracts, 25 partners',
  },
  {
    edition: 'SARSYC III',
    year: 2018,
    location: 'Johannesburg, South Africa',
    participants: 400,
    theme: 'Innovation and Technology for Youth',
    keyOutcomes: [
      'Digital health innovation showcase',
      'Youth advocacy toolkit launched',
      'Regional research collaborations formed',
    ],
    highlights: '12 countries, 200 abstracts, 30 partners',
  },
  {
    edition: 'SARSYC IV',
    year: 2020,
    location: 'Lusaka, Zambia',
    participants: 350,
    theme: 'Resilience in Times of Crisis',
    keyOutcomes: [
      'COVID-19 youth response framework',
      'Virtual advocacy training program',
      'Mental health support initiative',
    ],
    highlights: '10 countries, 170 abstracts, 28 partners (hybrid format)',
  },
  {
    edition: 'SARSYC V',
    year: 2022,
    location: 'Maputo, Mozambique',
    participants: 500,
    theme: 'Youth at the Center: Recovery and Renewal',
    keyOutcomes: [
      'Post-pandemic youth health strategy',
      '15 country action plans developed',
      'Partnership with African Union',
    ],
    highlights: '14 countries, 220 abstracts, 35 partners',
  },
  {
    edition: 'SARSYC VI',
    year: 2026,
    location: 'Windhoek, Namibia',
    participants: '500+',
    theme: 'Align for Action: Sustaining Progress',
    keyOutcomes: [
      'To be determined at conference',
    ],
    highlights: 'Expected: 14+ countries, 200+ abstracts, 40+ partners',
    isCurrent: true,
  },
]

export default function HistoryPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              The SARSYC Journey
            </h1>
            <p className="text-xl text-white/90">
              A decade of youth advocacy, knowledge sharing, and regional impact
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-12">
              {conferences.map((conf, index) => (
                <div key={conf.edition} className="relative">
                  {/* Timeline Connector */}
                  {index < conferences.length - 1 && (
                    <div className="absolute left-8 top-24 bottom-0 w-0.5 bg-gray-200 hidden md:block"></div>
                  )}

                  <div className={`card p-8 ${conf.isCurrent ? 'ring-4 ring-accent-500' : ''}`}>
                    <div className="grid md:grid-cols-4 gap-6">
                      {/* Year Badge */}
                      <div className="text-center md:text-left">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                          conf.isCurrent
                            ? 'bg-accent-500 text-gray-900'
                            : 'bg-primary-600 text-white'
                        } text-2xl font-bold mb-3`}>
                          {index + 1}
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{conf.year}</div>
                        {conf.isCurrent && (
                          <span className="inline-block px-3 py-1 bg-accent-500 text-gray-900 text-xs font-bold rounded-full mt-2">
                            CURRENT
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="md:col-span-3">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{conf.edition}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <FiMapPin className="w-4 h-4 text-primary-600" />
                            {conf.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <FiUsers className="w-4 h-4 text-primary-600" />
                            {conf.participants} participants
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Theme:</p>
                          <p className="text-gray-900 font-medium">{conf.theme}</p>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Key Outcomes:</p>
                          <ul className="space-y-1">
                            {conf.keyOutcomes.map((outcome) => (
                              <li key={outcome} className="text-sm text-gray-600 flex items-start gap-2">
                                <FiCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                {outcome}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <p className="text-sm text-gray-500">{conf.highlights}</p>

                        {conf.isCurrent && (
                          <div className="mt-6">
                            <Link href="/sarsyc-vi" className="btn-primary">
                              Learn More About SARSYC VI
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <h2 className="section-title">Cumulative Impact (2014-2022)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">1,750+</div>
              <div className="text-gray-600">Total Participants</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">920+</div>
              <div className="text-gray-600">Abstracts Presented</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">140+</div>
              <div className="text-gray-600">Partner Organizations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600">Policy Commitments</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

