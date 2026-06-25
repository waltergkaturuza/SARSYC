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
    <div
      className="relative min-h-screen"
      style={{
        backgroundImage: "url('/sarsyc-group.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/75 to-slate-900/90 pointer-events-none" />

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        {/* Back link */}
        <Link
          href="/about"
          className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 text-sm font-medium mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to About
        </Link>

        {/* Page heading */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Youth Steering Committee</h1>
          <p className="text-white/70 max-w-3xl text-lg">
            Youth leaders from across SADC who co-plan and execute SARSYC VI, champion post-conference implementation, and ensure continuity and accountability.
          </p>
        </div>

        {/* Members by country */}
        <div className="space-y-8">
          {sortedCountries.map((country) => {
            const members = membersByCountry[country]
            return (
              <div
                key={country}
                className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-xl overflow-hidden"
              >
                {/* Country header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-white/5">
                  <CountryFlag countryOrCode={country} size="lg" />
                  <h2 className="text-lg font-bold text-white">{country}</h2>
                </div>

                <div className="divide-y divide-white/10">
                  {members.map((member) => (
                    <div
                      key={member.name}
                      className="group flex flex-col md:flex-row transition-all duration-300 hover:bg-white/5"
                    >
                      {/* Photo */}
                      <div className="relative w-full md:w-56 flex-shrink-0 bg-slate-800/60 overflow-hidden" style={{ minHeight: '220px' }}>
                        {/* Amber hover accent line */}
                        <div className="absolute inset-y-0 left-0 w-[3px] bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                        {member.photo ? (
                          <SteeringCommitteeMemberPhoto
                            src={member.photo}
                            alt={member.name}
                            variant="profile"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
                            <span className="text-white text-6xl font-bold opacity-60">{getInitials(member.name)}</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 p-6 md:p-8">
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-300 transition-colors duration-300">
                          {member.name}
                        </h3>
                        <p className="text-amber-400/90 font-semibold text-sm mb-0.5">{member.role}</p>
                        <p className="text-white/55 text-sm mb-4">{member.organization}</p>

                        {member.bio ? (
                          <p className="text-white/70 leading-relaxed text-sm text-justify">{member.bio}</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Countries without members */}
        {countriesWithoutMembers.length > 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-8">
            <h2 className="text-lg font-bold text-white mb-6">Other SADC Countries</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {countriesWithoutMembers.map((country) => (
                <div
                  key={country}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-white/5 text-center gap-2 hover:bg-white/10 hover:border-amber-400/30 transition-all duration-300"
                >
                  <CountryFlag countryOrCode={country} size="md" />
                  <span className="text-sm font-medium text-white/70">{country}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
