import { FiUsers, FiShield, FiTarget } from 'react-icons/fi'

const committeeMembers = [
  {
    name: 'Steering Committee Chair',
    organization: 'Ministry of Health, Namibia',
    role: 'Chairperson',
    country: 'Namibia',
  },
  {
    name: 'SAYWHAT Representative',
    organization: 'SAYWHAT Regional Office',
    role: 'Member',
    country: 'Regional',
  },
  {
    name: 'Youth Representative',
    organization: 'National Youth Council',
    role: 'Member',
    country: 'Botswana',
  },
  {
    name: 'Development Partner Representative',
    organization: 'UNFPA',
    role: 'Member',
    country: 'Regional',
  },
  {
    name: 'Academic Representative',
    organization: 'University of Namibia',
    role: 'Member',
    country: 'Namibia',
  },
]

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
            <h2 className="section-title">SARSYC VI Steering Committee</h2>
            <p className="section-subtitle">
              The Steering Committee provides strategic oversight and guidance for SARSYC VI planning and implementation.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {committeeMembers.map((member, index) => (
                <div key={index} className="card p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {member.name.split(' ')[0][0]}{member.name.split(' ').slice(-1)[0]?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-primary-600 mb-1">{member.role}</div>
                      <h3 className="font-bold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{member.organization}</p>
                      <p className="text-xs text-gray-500">{member.country}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
              <p className="text-gray-700">
                <strong>Note:</strong> Full committee member profiles and photos will be updated as we approach the conference.
              </p>
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

