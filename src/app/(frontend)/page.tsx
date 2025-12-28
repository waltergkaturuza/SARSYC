import Link from 'next/link'
import Image from 'next/image'
import { FiCalendar, FiMapPin, FiUsers, FiGlobe, FiAward, FiTrendingUp, FiArrowRight, FiMic, FiUser } from 'react-icons/fi'
import CountdownTimer from '@/components/ui/CountdownTimer'
import { getPayloadClient } from '@/lib/payload'

// This will be fetched from Payload CMS in production
const stats = [
  { icon: FiGlobe, value: '14', label: 'Countries Represented' },
  { icon: FiUsers, value: '2,000+', label: 'Youth Reached' },
  { icon: FiAward, value: '150+', label: 'Research Papers' },
  { icon: FiTrendingUp, value: '6', label: 'Conference Editions' },
]

const tracks = [
  {
    number: '01',
    title: 'Youth Sexual & Reproductive Health',
    description: 'Advancing SRHR access, education, and rights for young people across Southern Africa.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    number: '02',
    title: 'Education & Skills Development',
    description: 'Empowering youth through education, vocational training, and leadership skills.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    number: '03',
    title: 'Advocacy & Policy Influence',
    description: 'Strengthening youth voices in policy-making and institutional decision-making.',
    color: 'from-pink-500 to-pink-600',
  },
  {
    number: '04',
    title: 'Innovation & Technology for Youth',
    description: 'Leveraging digital solutions and innovation for youth development and engagement.',
    color: 'from-orange-500 to-orange-600',
  },
]

// Helper function to get speaker photo URL
function getSpeakerPhotoUrl(photo: any): string | null {
  if (!photo) {
    return null
  }
  
  // If it's just an ID (string), it wasn't populated - return null
  if (typeof photo === 'string') {
    return null
  }
  
  // If it's an object, try different URL locations
  if (typeof photo === 'object') {
    // Try direct URL first (for Vercel Blob or external storage)
    if (photo.url && typeof photo.url === 'string') {
      // Check if it's a valid HTTP(S) URL (including localhost for development)
      if (photo.url.startsWith('http://') || photo.url.startsWith('https://')) {
        return photo.url
      }
      // Handle relative URLs
      if (photo.url.startsWith('/')) {
        if (process.env.NODE_ENV === 'development') {
          return `http://localhost:3000${photo.url}`
        }
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || ''
        if (serverUrl) {
          return `${serverUrl}${photo.url}`
        }
        return photo.url
      }
    }
    
    // Try sizes (for local storage with image processing)
    if (photo.sizes) {
      if (photo.sizes.card?.url) {
        if (photo.sizes.card.url.startsWith('http')) {
          return photo.sizes.card.url
        }
        if (photo.sizes.card.url.startsWith('/')) {
          if (process.env.NODE_ENV === 'development') {
            return `http://localhost:3000${photo.sizes.card.url}`
          }
          const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || ''
          if (serverUrl) {
            return `${serverUrl}${photo.sizes.card.url}`
          }
        }
      }
      if (photo.sizes.thumbnail?.url) {
        if (photo.sizes.thumbnail.url.startsWith('http')) {
          return photo.sizes.thumbnail.url
        }
        if (photo.sizes.thumbnail.url.startsWith('/')) {
          if (process.env.NODE_ENV === 'development') {
            return `http://localhost:3000${photo.sizes.thumbnail.url}`
          }
          const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || ''
          if (serverUrl) {
            return `${serverUrl}${photo.sizes.thumbnail.url}`
          }
        }
      }
      if (photo.sizes.hero?.url) {
        if (photo.sizes.hero.url.startsWith('http')) {
          return photo.sizes.hero.url
        }
        if (photo.sizes.hero.url.startsWith('/')) {
          if (process.env.NODE_ENV === 'development') {
            return `http://localhost:3000${photo.sizes.hero.url}`
          }
          const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || ''
          if (serverUrl) {
            return `${serverUrl}${photo.sizes.hero.url}`
          }
        }
      }
    }
    
    // Try thumbnailURL (legacy field)
    if (photo.thumbnailURL) {
      if (photo.thumbnailURL.startsWith('http')) {
        return photo.thumbnailURL
      }
      if (photo.thumbnailURL.startsWith('/')) {
        if (process.env.NODE_ENV === 'development') {
          return `http://localhost:3000${photo.thumbnailURL}`
        }
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || ''
        if (serverUrl) {
          return `${serverUrl}${photo.thumbnailURL}`
        }
      }
    }
  }
  
  return null
}

export default async function HomePage() {
  const conferenceDate = process.env.NEXT_PUBLIC_CONFERENCE_DATE || '2026-08-05T09:00:00'
  
  // Fetch featured speakers
  let featuredSpeakers: any[] = []
  try {
    const payload = await getPayloadClient()
    const speakersResult = await payload.find({
      collection: 'speakers',
      where: {
        featured: { equals: true },
      },
      limit: 6,
      sort: '-createdAt',
      depth: 2, // Populate photo relationship fully
      overrideAccess: true, // Ensure all speakers are fetched regardless of access control
    })
    featuredSpeakers = speakersResult.docs || []
    
    // Log for debugging
    console.log(`✅ Fetched ${featuredSpeakers.length} featured speakers`)
    featuredSpeakers.forEach((speaker: any) => {
      const photoUrl = getSpeakerPhotoUrl(speaker.photo)
      if (!photoUrl) {
        console.warn(`⚠️  Featured speaker ${speaker.id} (${speaker.name}) has no photo URL`)
      }
    })
  } catch (error) {
    console.error('Error fetching featured speakers:', error)
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>

        <div className="relative container-custom py-20 md:py-32">
          <div className="relative">
            {/* Logo - Floating at Left Corner (Circular, Reduced by Half) */}
            <div className="hidden sm:block absolute -left-4 -top-4 md:-left-8 md:-top-8 w-32 h-32 md:w-56 md:h-56 lg:w-72 lg:h-72 xl:w-80 xl:h-80 z-10 animate-float">
              <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl">
                <Image
                  src="/logo.jpeg"
                  alt="SARSYC Logo"
                  fill
                  className="object-cover scale-110"
                  priority
                  sizes="(max-width: 768px) 128px, (max-width: 1024px) 224px, (max-width: 1280px) 288px, 320px"
                />
              </div>
            </div>

            {/* Content - Adjusted for Logo */}
            <div className="max-w-4xl sm:ml-40 md:ml-48 lg:ml-64 xl:ml-72 text-center">

            {/* Conference Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white mb-6">
              <FiCalendar className="w-4 h-4" />
              <span className="text-sm font-medium">August 5-7, 2026</span>
              <span className="w-1 h-1 bg-white/60 rounded-full"></span>
              <FiMapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Windhoek, Namibia</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              The 6th Southern African Regional Students and Youth Conference
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-white/95 font-medium mb-4">
              SARSYC VI
            </p>
            <p className="text-lg md:text-xl text-white/90 font-semibold mb-3">
              Align for Action: Sustaining Progress in Youth Health and Education
            </p>
            <p className="text-base md:text-lg text-white/80 mb-2">
              #DrivingRegionalSolidarity
            </p>
            <p className="text-sm md:text-base text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              A flagship, youth-led regional conference convened by SAYWHAT, bringing together students, youth leaders, 
              policymakers, civil society, development partners, and the private sector from across Southern Africa 
              to drive transnational advocacy on youth health and education.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/participate/register" className="btn-accent text-lg px-8 py-4 w-full sm:w-auto">
                Register for SARSYC VI
                <FiArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/participate/submit-abstract" className="btn-outline border-white text-white hover:bg-white/10 text-lg px-8 py-4 w-full sm:w-auto">
                Submit Abstract (Research Indaba)
              </Link>
              <Link href="/partnerships" className="btn-outline border-white text-white hover:bg-white/10 text-lg px-8 py-4 w-full sm:w-auto">
                Become a Partner / Exhibitor
              </Link>
            </div>

            {/* Countdown Timer */}
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-6">
                Conference Countdown
              </h2>
              <CountdownTimer targetDate={conferenceDate} />
            </div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 md:h-20 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-gray-600">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="section-title">What is SARSYC?</h2>
            <p className="section-subtitle">
              The Southern African Regional Students and Youth Conference (SARSYC) is the premier regional platform
              for transnational advocacy on youth health and education.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Connect</h3>
              <p className="text-gray-600">
                Network with 500+ young leaders, researchers, policymakers, and development partners from across
                Southern Africa.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center text-white text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Learn</h3>
              <p className="text-gray-600">
                Engage with cutting-edge research, best practices, and innovative solutions in youth health and
                education.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center text-gray-900 text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Act</h3>
              <p className="text-gray-600">
                Develop actionable strategies and commitments to drive real change in youth health and education
                outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Conference Tracks */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="section-title">Conference Tracks</h2>
            <p className="section-subtitle">
              SARSYC VI features four thematic tracks addressing critical issues in youth development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {tracks.map((track) => (
              <div key={track.number} className="card p-6 hover:shadow-2xl transition-shadow duration-300">
                <div className={`inline-block bg-gradient-to-r ${track.color} text-white text-sm font-bold px-3 py-1 rounded-full mb-4`}>
                  Track {track.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {track.title}
                </h3>
                <p className="text-gray-600">
                  {track.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/sarsyc-vi" className="btn-primary">
              Learn More About SARSYC VI
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Speakers Section */}
      {featuredSpeakers.length > 0 && (
        <section className="section bg-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="section-title">Featured Speakers</h2>
              <p className="section-subtitle">
                Meet some of the distinguished speakers who will be sharing their expertise at SARSYC VI.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredSpeakers.map((speaker: any) => {
                const photoUrl = getSpeakerPhotoUrl(speaker.photo)
                return (
                  <Link
                    key={speaker.id}
                    href={`/programme/speakers/${speaker.id}`}
                    className="card group overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {photoUrl ? (
                        <Image
                          src={photoUrl}
                          alt={speaker.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized={photoUrl.includes('blob.vercel-storage.com') || photoUrl.includes('public.blob.vercel-storage.com')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-400">
                          <FiUser className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}
                      {speaker.type && Array.isArray(speaker.type) && speaker.type.includes('keynote') && (
                        <div className="absolute top-2 right-2 bg-accent-500 text-gray-900 px-2 py-1 rounded-full text-xs font-bold">
                          KEYNOTE
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                        {speaker.name}
                      </h3>
                      <p className="text-sm text-primary-600 font-medium mb-2">
                        {speaker.title}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        {speaker.organization}
                      </p>
                      {speaker.expertise && Array.isArray(speaker.expertise) && speaker.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {speaker.expertise.slice(0, 2).map((exp: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {exp.area || exp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="text-center mt-12">
              <Link href="/programme/speakers" className="btn-primary">
                View All Speakers
                <FiArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Join Us in Windhoek?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Registration is now open for SARSYC VI. Secure your spot today and be part of this transformative
              conference.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/participate/register" className="btn-accent text-lg px-8 py-4 w-full sm:w-auto">
                Register for SARSYC VI
              </Link>
              <Link href="/programme" className="btn-outline border-white text-white hover:bg-white/10 text-lg px-8 py-4 w-full sm:w-auto">
                View Programme
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}






