import { FiMail, FiLinkedin } from 'react-icons/fi'

const teamMembers = [
  {
    name: 'Executive Director',
    organization: 'SAYWHAT',
    role: 'Leadership',
    photo: '/team/placeholder.jpg',
    bio: 'Leading SAYWHAT\'s regional advocacy and youth empowerment programs.',
  },
  {
    name: 'Advocacy Director',
    organization: 'SAYWHAT',
    role: 'Advocacy',
    photo: '/team/placeholder.jpg',
    bio: 'Coordinating regional youth health and education policy advocacy.',
  },
  {
    name: 'Communications Director',
    organization: 'SAYWHAT',
    role: 'Communications',
    photo: '/team/placeholder.jpg',
    bio: 'Managing SARSYC communications, media, and digital engagement.',
  },
]

export default function TeamPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Who We Are
            </h1>
            <p className="text-xl text-white/90">
              Meet the team behind SARSYC VI
            </p>
            <p className="text-lg text-white/80 mt-4">
              Convened by SAYWHAT in partnership with University of Namibia (UNAM)
            </p>
          </div>
        </div>
      </section>

      {/* About SAYWHAT */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="section-title">About SAYWHAT</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              <strong>SAYWHAT (Student and Youth Working on Reproductive Health Action Team)</strong> is a regional
              youth-led network advancing sexual and reproductive health and rights (SRHR) and education advocacy
              across Southern Africa.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mt-4">
              Founded in 2002, SAYWHAT works across 14 SADC member states, mobilizing students and young people to
              advocate for evidence-based policies and programs that improve youth health and education outcomes.
            </p>
          </div>

          {/* What We Do */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-4">14</div>
              <h3 className="font-bold text-gray-900 mb-2">SADC Countries</h3>
              <p className="text-sm text-gray-600">Working across Southern Africa</p>
            </div>
            <div className="card p-8 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-4">2002</div>
              <h3 className="font-bold text-gray-900 mb-2">Established</h3>
              <p className="text-sm text-gray-600">Over 20 years of impact</p>
            </div>
            <div className="card p-8 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-4">2,000+</div>
              <h3 className="font-bold text-gray-900 mb-2">Youth Reached</h3>
              <p className="text-sm text-gray-600">Through SARSYC conferences</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <h2 className="section-title">Our Team</h2>
          <p className="section-subtitle">
            The dedicated professionals driving SARSYC and youth advocacy
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="card overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                  <div className="text-white text-4xl font-bold opacity-50">
                    {member.name.split(' ')[0][0]}{member.name.split(' ').slice(-1)[0]?.[0]}
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-sm font-semibold text-primary-600 mb-1">{member.role}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{member.organization}</p>
                  <p className="text-sm text-gray-600 mb-4">{member.bio}</p>
                  <div className="flex gap-3">
                    <button className="text-gray-400 hover:text-primary-600">
                      <FiMail className="w-5 h-5" />
                    </button>
                    <button className="text-gray-400 hover:text-blue-600">
                      <FiLinkedin className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 bg-blue-50 border border-blue-200 rounded-xl p-8">
            <p className="text-gray-700 mb-4">
              <strong>Note:</strong> Full team profiles and photos will be added soon. Check back regularly for updates.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}



