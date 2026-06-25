import { FiUsers, FiShield, FiTarget, FiArrowRight } from 'react-icons/fi'
import Link from 'next/link'
import CountryFlag from '@/components/ui/CountryFlag'
import { youthSteeringCommitteeMembers } from '@/lib/youthSteeringCommitteeMembers'

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 3)
}

export default function GovernancePage() {
  return (
    <div className="relative min-h-screen bg-slate-900">
      {/* Background image */}
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: "url('/sarsyc-group.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          zIndex: 0,
        }}
      />
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/75 to-slate-900/90" style={{ zIndex: 1 }} />

      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-12" style={{ zIndex: 2 }}>

        {/* Page heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Governance</h1>
          <p className="text-white/70 text-lg">Democratic, transparent, and accountable leadership</p>
        </div>

        {/* Youth Steering Committee */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Youth Steering Committee</h2>
          <p className="text-white/60 mb-8 max-w-3xl">
            Youth leaders from across SADC who co-plan and execute SARSYC VI, champion post-conference
            implementation, and ensure continuity and accountability.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {youthSteeringCommitteeMembers.map((member) => (
              <div
                key={member.name}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/20 hover:border-amber-400/40 hover:bg-white/15"
              >
                {/* Amber top accent */}
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Country badge */}
                <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                  <CountryFlag countryOrCode={member.country} size="sm" />
                  <span className="text-xs font-semibold text-white/60">{member.country}</span>
                </div>

                {/* Photo */}
                <div className="relative mx-4 rounded-xl overflow-hidden bg-slate-800" style={{ aspectRatio: '4/5', maxHeight: '280px' }}>
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
                      <span className="text-white text-5xl font-bold opacity-60">{getInitials(member.name)}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-primary-400 mb-1 group-hover:text-amber-300 transition-colors duration-300">{member.name}</h3>
                  <p className="text-xs font-semibold text-amber-400/90 mb-0.5">{member.role}</p>
                  <p className="text-xs text-white/50">{member.organization}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/about/youth-steering-committee"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition-colors shadow-lg shadow-amber-900/30"
            >
              <FiUsers className="w-5 h-5" />
              View Full Committee Profiles
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Governance Principles */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Governance Principles</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: FiUsers, title: 'Participatory', desc: 'Youth representatives involved in all decision-making processes.' },
              { icon: FiShield, title: 'Transparent', desc: 'Open communication and accountability to all stakeholders.' },
              { icon: FiTarget, title: 'Results-Focused', desc: 'Committed to measurable outcomes and sustained impact.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-8 text-center hover:border-amber-400/40 hover:bg-white/15 transition-all duration-300">
                <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">{title}</h3>
                <p className="text-white/60 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

