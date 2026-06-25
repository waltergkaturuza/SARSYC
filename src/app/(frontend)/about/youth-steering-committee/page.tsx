import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import CountryFlag from '@/components/ui/CountryFlag'
import SteeringCommitteeMemberPhoto from '@/components/about/SteeringCommitteeMemberPhoto'
import {
  getSteeringCountriesWithoutMembers,
  youthSteeringCommitteeMembers,
} from '@/lib/youthSteeringCommitteeMembers'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 3)
}

export default function YouthSteeringCommitteePage() {
  const countriesWithoutMembers = getSteeringCountriesWithoutMembers()

  const membersByCountry = youthSteeringCommitteeMembers.reduce(
    (acc, member) => {
      if (!acc[member.country]) {
        acc[member.country] = []
      }
      acc[member.country].push(member)
      return acc
    },
    {} as Record<string, typeof youthSteeringCommitteeMembers>,
  )

  const sortedCountries = Object.keys(membersByCountry).sort((a, b) => a.localeCompare(b))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="about-hero bg-slate-800 text-white py-8 md:py-10">
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

      <div className="container-custom py-16">
        <div className="space-y-12">
          {sortedCountries.map((country) => {
            const members = membersByCountry[country]
            return (
              <div key={country} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CountryFlag countryOrCode={country} size="lg" />
                  <h2 className="text-2xl font-bold text-gray-900">{country}</h2>
                </div>

                <div className="space-y-8">
                  {members.map((member) => (
                    <div
                      key={member.name}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row">
                        {member.photo ? (
                          <SteeringCommitteeMemberPhoto
                            src={member.photo}
                            alt={member.name}
                            variant="profile"
                          />
                        ) : (
                          <div className="relative w-full md:w-80 aspect-[3/4] bg-gradient-to-br from-primary-400 to-secondary-400 flex-shrink-0 flex items-center justify-center text-white text-6xl font-bold">
                            {getInitials(member.name)}
                          </div>
                        )}

                        <div className="flex-1 p-8">
                          <div className="mb-4">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                            <p className="text-primary-600 font-semibold text-lg mb-1">{member.role}</p>
                            <p className="text-gray-600">{member.organization}</p>
                          </div>

                          {member.bio ? (
                            <p className="profile-description">{member.bio}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {countriesWithoutMembers.length > 0 ? (
          <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Other SADC Countries</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {countriesWithoutMembers.map((country) => (
                <div
                  key={country}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 text-center gap-2"
                >
                  <CountryFlag countryOrCode={country} size="md" />
                  <span className="text-sm font-medium text-gray-700">{country}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
