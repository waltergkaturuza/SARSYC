import Image from 'next/image'
import Link from 'next/link'
import { FiLinkedin, FiTwitter, FiGlobe } from 'react-icons/fi'

// This will fetch from Payload CMS - placeholder data for now
const speakers = [
  {
    id: '1',
    name: 'Dr. Sarah Mwangi',
    title: 'Director of Public Health',
    organization: 'WHO Africa',
    country: 'Kenya',
    photo: '/speakers/placeholder.jpg',
    type: ['keynote'],
    bio: 'Leading expert in youth health policy with over 15 years of experience...',
    social: {
      twitter: '@sarahmwangi',
      linkedin: 'linkedin.com/in/sarah-mwangi',
    }
  },
  // Add more speaker data...
]

const speakerTypes = [
  { value: 'all', label: 'All Speakers' },
  { value: 'keynote', label: 'Keynote Speakers' },
  { value: 'plenary', label: 'Plenary Speakers' },
  { value: 'moderator', label: 'Panel Moderators' },
  { value: 'facilitator', label: 'Workshop Facilitators' },
]

export default async function SpeakersPage() {
  // In production, fetch from Payload CMS:
  // const payload = await getPayloadClient()
  // const speakers = await payload.find({ collection: 'speakers' })

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our Speakers
            </h1>
            <p className="text-xl text-white/90">
              Meet the thought leaders, researchers, and advocates shaping youth health and education in Africa
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-gray-50 py-8">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            {speakerTypes.map((type) => (
              <button
                key={type.value}
                className="px-6 py-2 rounded-full bg-white border-2 border-gray-200 hover:border-primary-600 hover:text-primary-600 transition-all font-medium text-sm"
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Speaker Grid */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {speakers.map((speaker) => (
              <div key={speaker.id} className="card group overflow-hidden">
                <div className="aspect-square relative overflow-hidden bg-gray-200">
                  {/* Placeholder - will use real images */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                    <div className="text-white text-6xl font-bold opacity-50">
                      {speaker.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex gap-2">
                      {speaker.type.includes('keynote') && (
                        <span className="px-2 py-1 bg-accent-500 text-xs font-bold rounded text-gray-900">
                          KEYNOTE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                    {speaker.name}
                  </h3>
                  <p className="text-sm font-medium text-primary-600 mb-1">{speaker.title}</p>
                  <p className="text-sm text-gray-600 mb-4">{speaker.organization} • {speaker.country}</p>
                  
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {speaker.bio}
                  </p>

                  <div className="flex items-center gap-3">
                    {speaker.social.twitter && (
                      <a
                        href={`https://twitter.com/${speaker.social.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-sky-500 transition-colors"
                      >
                        <FiTwitter className="w-5 h-5" />
                      </a>
                    )}
                    {speaker.social.linkedin && (
                      <a
                        href={`https://${speaker.social.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <FiLinkedin className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add More Speakers Notice (for admin) */}
          <div className="mt-12 text-center bg-gray-50 rounded-lg p-8">
            <h3 className="font-semibold text-gray-900 mb-2">More Speakers Coming Soon!</h3>
            <p className="text-gray-600 mb-4">
              We're adding more amazing speakers daily. Check back regularly for updates.
            </p>
            <Link href="/news" className="text-primary-600 font-medium hover:underline">
              Subscribe to updates →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}


