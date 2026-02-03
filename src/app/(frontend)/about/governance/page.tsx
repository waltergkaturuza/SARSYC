import { FiUsers, FiShield, FiTarget, FiArrowRight } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'

// Country flag emojis mapping
const countryFlags: Record<string, string> = {
  'Botswana': '🇧🇼',
  'Malawi': '🇲🇼',
  'Namibia': '🇳🇦',
  'Zambia': '🇿🇲',
  'Angola': '🇦🇴',
  'Mozambique': '🇲🇿',
  'South Africa': '🇿🇦',
  'Zimbabwe': '🇿🇼',
  'Eswatini': '🇸🇿',
  'Lesotho': '🇱🇸',
  'Regional': '🌍',
}

// Hardcoded Youth Steering Committee members (matching the dedicated page)
const committeeMembers = [
  {
    name: 'Trevor Oahile',
    role: 'Country Coordinator',
    organization: 'SAYWHAT Botswana',
    country: 'Botswana',
    photo: '/youth-steering-committee/trevor-oahile-botswana.jpg',
  },
  {
    name: 'Sylvester G Chiweza',
    role: 'Country Coordinator',
    organization: 'SAYWHAT Malawi',
    country: 'Malawi',
    photo: '/youth-steering-committee/sylvester-chiweza-malawi.jpg',
  },
  {
    name: 'Fadzai Nyamarebvu',
    role: 'Country Coordinator',
    organization: 'SAYWHAT Namibia',
    country: 'Namibia',
    photo: '/youth-steering-committee/fadzai-nyamarebvu-namibia.jpg',
  },
  {
    name: 'Wankumbu Simukonda',
    role: 'Country Coordinator',
    organization: 'SAYWHAT Zambia',
    country: 'Zambia',
    photo: null,
  },
]

// Helper function to get initials
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 3)
}

export default function GovernancePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Governance
            </h1>
            <p className="text-xl text-white/90">
              Democratic, transparent, and accountable leadership
            </p>
          </div>
        </div>
      </section>

      {/* Governance Structure */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="section-title">Youth Steering Committee</h2>
            <p className="section-subtitle">
              10 youth leaders from SADC countries who co-plan and execute SARSYC VI, champion post-conference 
              implementation, and ensure continuity & accountability.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {committeeMembers.map((member, index) => (
                <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                  {/* Country Flag */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{countryFlags[member.country] || '🌍'}</span>
                    <span className="text-sm font-semibold text-gray-700">{member.country}</span>
                  </div>
                  
                  {/* Photo */}
                  <div className="relative w-full h-48 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-lg mb-4 overflow-hidden">
                    {member.photo ? (
                      <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                        {getInitials(member.name)}
                      </div>
                    )}
                  </div>
                  
                  {/* Member Info */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-lg">{member.name}</h3>
                    <p className="text-sm font-semibold text-primary-600 mb-1">{member.role}</p>
                    <p className="text-xs text-gray-600">{member.organization}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/about/youth-steering-committee"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FiUsers className="w-5 h-5" />
                View Full Committee Profiles
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Governance Principles */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <h2 className="section-title">Governance Principles</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiUsers className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Participatory</h3>
              <p className="text-gray-600">
                Youth representatives involved in all decision-making processes.
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiShield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Transparent</h3>
              <p className="text-gray-600">
                Open communication and accountability to all stakeholders.
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiTarget className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Results-Focused</h3>
              <p className="text-gray-600">
                Committed to measurable outcomes and sustained impact.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

