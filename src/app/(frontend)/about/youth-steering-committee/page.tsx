import Link from 'next/link'
import { FiArrowLeft, FiMail, FiTwitter, FiLinkedin, FiGlobe } from 'react-icons/fi'
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

// Hardcoded Youth Steering Committee members
const committeeMembers = [
  {
    name: 'Trevor Oahile',
    role: 'Country Coordinator',
    organization: 'SAYWHAT Botswana',
    country: 'Botswana',
    bio: 'Trevor Oahile is a data scientist, human rights advocate, and youth leader with extensive experience in SRHR, youth development, and governance in Botswana. He currently serves as the Country Coordinator for SAYWHAT Botswana, where he leads youth focused programmes, national engagement, and initiatives that strengthen young people\'s access to information and participation in policy processes. Trevor also chairs the Commonwealth Youth Peace Ambassadors Network (CYPAN) and serves as a Youth Delegate for the Commonwealth Youth Council. His experience includes work with UNFPA, UNICEF, AMREF Health Africa, and SRHR Africa Trust. He is a former co host of the SRHR radio show Don\'t Get It Twisted and a Board Member of the Botswana National Youth Council.',
    photo: '/youth-steering-committee/trevor-oahile-botswana.jpg',
  },
  {
    name: 'Sylvester G Chiweza',
    role: 'Country Coordinator',
    organization: 'SAYWHAT Malawi',
    country: 'Malawi',
    bio: 'Sylvester G. Chiweza is a dedicated youth leadership and SRHR advocate with over 11 years of experience advancing health access, community development, and meaningful youth participation in Malawi. He currently serves as the Country Coordinator for SAYWHAT Malawi, leading strategic coordination, stakeholder engagement, and youth focused policy initiatives that strengthen access to quality health information and services. Sylvester has professional training from Kasungu Teachers Training College and the Malawi College of Health Sciences, and also studied Business Management at Mubarack Complex College. He is pursuing a Bachelor\'s degree in Human Resource Management at the University of Malawi and applies strong skills in climate resilience and community based adaptation.',
    photo: '/youth-steering-committee/sylvester-chiweza-malawi.jpg',
  },
  {
    name: 'Fadzai Nyamarebvu',
    role: 'Country Coordinator',
    organization: 'SAYWHAT Namibia',
    country: 'Namibia',
    bio: 'Fadzai Nyamarebvu is a lawyer and seasoned project manager with strong expertise in business and human rights, regional integration, and youth empowerment. She has coordinated international and regional initiatives, contributing legal insight, strategic support, and high level reporting as a facilitator and professional rapporteur in global policy processes. She currently serves as the SAYWHAT Country Coordinator for Namibia, where she leads national level planning, stakeholder engagement, and youth focused programmes that advance meaningful participation and access to opportunities. Fadzai is recognised for her ability to bridge legal analysis, project leadership, and rights based advocacy across diverse regional platforms.',
    photo: '/youth-steering-committee/fadzai-nyamarebvu-namibia.jpg',
  },
  {
    name: 'Wankumbu Simukonda',
    role: 'Country Coordinator',
    organization: 'SAYWHAT Zambia',
    country: 'Zambia',
    bio: 'Wankumbu Simukonda is a Zambian advocacy and health promotion specialist with over eight years\' experience advancing adolescent sexual and reproductive health, HIV prevention, and social and behaviour change. He serves as Country Coordinator for SAYWHAT Zambia and Field Technical Advisor for PATA, leading youth focused policy engagement, quality improvement in health services, and community-driven SRHR initiatives. Wankumbu also mentors young advocates through PATA\'s Youth Advisory Panel and lectures communication skills at Greenfield College. He holds a BA in Mass Communication and an MA in Development Studies from the University of Zambia and is currently pursuing a Master of Mass Communication.',
    photo: null, // No photo provided
  },
]

// All SADC countries (for countries without members)
const allSADCCountries = [
  'Angola',
  'Botswana',
  'Eswatini',
  'Lesotho',
  'Malawi',
  'Mozambique',
  'Namibia',
  'South Africa',
  'Zambia',
  'Zimbabwe',
]

// Get countries that have members
const countriesWithMembers = new Set(committeeMembers.map(m => m.country))

// Get countries without members
const countriesWithoutMembers = allSADCCountries.filter(country => !countriesWithMembers.has(country))

// Helper function to get initials
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 3)
}

export default function YouthSteeringCommitteePage() {
  // Group members by country
  const membersByCountry = committeeMembers.reduce((acc, member) => {
    if (!acc[member.country]) {
      acc[member.country] = []
    }
    acc[member.country].push(member)
    return acc
  }, {} as Record<string, typeof committeeMembers>)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="container-custom">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to About
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Youth Steering Committee</h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Meet the dedicated members of the Youth Steering Committee who guide and shape the vision of SARSYC VI.
          </p>
        </div>
      </div>

      {/* Committee Members by Country */}
      <div className="container-custom py-16">
        {/* Countries with Members */}
        <div className="space-y-12">
          {Object.entries(membersByCountry).map(([country, members]) => (
            <div key={country} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{countryFlags[country] || '🌍'}</span>
                <h2 className="text-2xl font-bold text-gray-900">{country}</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((member, index) => (
                  <div
                    key={`${country}-${index}`}
                    className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Photo */}
                    <div className="relative w-full h-64 bg-gradient-to-br from-primary-400 to-secondary-400">
                      {member.photo ? (
                        <Image
                          src={member.photo}
                          alt={member.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                          {getInitials(member.name)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                        <p className="text-primary-600 font-medium text-sm">{member.role}</p>
                        <p className="text-sm text-gray-600 mt-1">{member.organization}</p>
                      </div>

                      {member.bio && (
                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Countries without Members */}
        {countriesWithoutMembers.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Other SADC Countries</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {countriesWithoutMembers.map((country) => (
                <div
                  key={country}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 text-center"
                >
                  <span className="text-3xl mb-2">{countryFlags[country] || '🌍'}</span>
                  <span className="text-sm font-medium text-gray-700">{country}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
