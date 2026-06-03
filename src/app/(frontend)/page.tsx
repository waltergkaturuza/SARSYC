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
    title: 'Education Rights and Equity',
    description: 'Financing and innovation for equitable digital learning in rural communities, evaluating the effectiveness of climate resilience in education systems, Gender Equality & Social Inclusion (GESI) through responsive education budgeting, and CSE as a driver for quality education and retention.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    number: '02',
    title: 'HIV/AIDS, STIs, and Sexual Health',
    description: 'Sustaining gains in HIV/AIDS and STIs prevention and treatment, addressing resurgence among People Who Use and Inject Drugs, expanding harm reduction programs, and domestic health financing and resource mobilization.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    number: '03',
    title: 'Non-Communicable Diseases (NCDs) Prevention and Health Lifestyles',
    description: 'Community-led NCD prevention and integration into primary health care, promoting healthy behaviors, nutrition, exercise, and reducing harmful habits, digital health tools for lifestyle change and risk monitoring, and innovations for early detection and screening in low-resource settings.',
    color: 'from-pink-500 to-pink-600',
  },
  {
    number: '04',
    title: 'Digital Health and Safety',
    description: 'Digital violence/ online harassment: gendered vulnerabilities and responses, social media algorithms and adolescent mental health and behavior, online gambling and betting addiction, emerging trends and policy responses, and leveraging technology for health, education and service delivery.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    number: '05',
    title: 'Mental Health and Substance Abuse',
    description: 'Rising mental health challenges among boys and young men, suicide prevention strategies and psychosocial support, substance abuse trends and government responses, progress and gaps, and community-driven interventions for mental health and addiction recovery.',
    color: 'from-green-500 to-green-600',
  },
]

// Helper function to get speaker photo URL (Blob-safe)
function getSpeakerPhotoUrl(photo: any): string | null {
  if (!photo) return null

  // Helper to fix domain in URLs (ensure www.sarsyc.org instead of sarsyc.org)
  const fixDomain = (url: string): string => {
    if (url.includes('sarsyc.org') && !url.includes('www.sarsyc.org')) {
      return url.replace('https://sarsyc.org', 'https://www.sarsyc.org')
    }
    return url
  }

  // Helper to check if URL is a Vercel Blob URL (preferred)
  const isBlobUrl = (url: string): boolean => {
    return url.includes('blob.vercel-storage.com') || url.includes('public.blob.vercel-storage.com')
  }

  // Helper to check if URL is Payload's generated file path (should be avoided)
  const isPayloadFileUrl = (url: string): boolean => {
    return url.includes('/api/media/file/')
  }

  // ✅ Vercel Blob stored as string URL (most common case)
  if (typeof photo === 'string') {
    if (photo.startsWith('http')) {
      // Skip Payload file URLs entirely (404 for Blob-stored files)
      if (isPayloadFileUrl(photo)) return null
      return fixDomain(photo)
    }
    return null
  }

  // ✅ PRIORITY 1: Check thumbnailURL first (migration stores Blob URLs here!)
  if (photo.thumbnailURL && typeof photo.thumbnailURL === 'string') {
    if (isBlobUrl(photo.thumbnailURL)) {
      return fixDomain(photo.thumbnailURL)
    }
  }

  // ✅ PRIORITY 2: Check main URL (only if it's a Blob URL)
  if (photo.url && typeof photo.url === 'string') {
    // Prefer Blob URLs - they're the most reliable
    if (isBlobUrl(photo.url)) {
      return fixDomain(photo.url)
    }
    // If it's a Payload file URL, skip it (likely missing on Blob-only storage)
    if (isPayloadFileUrl(photo.url)) {
      // Try to find a Blob URL in sizes instead
      if (photo.sizes?.card?.url && isBlobUrl(photo.sizes.card.url)) {
        return fixDomain(photo.sizes.card.url)
      }
      if (photo.sizes?.thumbnail?.url && isBlobUrl(photo.sizes.thumbnail.url)) {
        return fixDomain(photo.sizes.thumbnail.url)
      }
      return null
    }
    // Use any other valid URL
    return fixDomain(photo.url)
  }

  // Optional: Payload local storage fallback (only if not Payload file URLs)
  if (photo.sizes?.card?.url) {
    if (isPayloadFileUrl(photo.sizes.card.url)) {
      // Skip Payload file URLs
    } else {
      return fixDomain(photo.sizes.card.url)
    }
  }

  if (photo.sizes?.thumbnail?.url) {
    if (isPayloadFileUrl(photo.sizes.thumbnail.url)) {
      // Skip Payload file URLs
    } else {
      return fixDomain(photo.sizes.thumbnail.url)
    }
  }

  return null
}

// Force page to revalidate on every request to show latest featured speakers
export const revalidate = 0

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
      depth: 1, // Minimal depth - Blob URLs don't need deep population
      overrideAccess: true, // Ensure all speakers are fetched regardless of access control
    })
    featuredSpeakers = speakersResult.docs || []
    
    // Log for debugging
    console.log(`✅ Fetched ${featuredSpeakers.length} featured speakers`)
    if (featuredSpeakers.length > 0) {
      console.log('First speaker photo structure:', {
        name: featuredSpeakers[0].name,
        photoType: typeof featuredSpeakers[0].photo,
        photoValue: featuredSpeakers[0].photo,
      })
    }
    featuredSpeakers.forEach((speaker: any) => {
      const photoUrl = getSpeakerPhotoUrl(speaker.photo)
      if (!photoUrl) {
        console.warn(`⚠️  Featured speaker ${speaker.id} (${speaker.name}) has no photo URL`, {
          photoType: typeof speaker.photo,
          photoValue: speaker.photo,
        })
      }
    })
  } catch (error) {
    console.error('Error fetching featured speakers:', error)
  }

  return (
    <>
      {/* Hero Section — headline, photo, intro copy */}
      <section className="relative overflow-hidden text-gray-900 bg-[#FFF9F0]">
        <div className="relative w-full px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 pt-10 md:pt-12 lg:pt-14 pb-10 md:pb-12 lg:pb-14">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,44fr)_minmax(0,56fr)] lg:gap-x-10 lg:gap-y-5">
            {/* Headline — left column on desktop */}
            <h1 className="order-1 lg:col-start-1 lg:row-start-1 text-3xl sm:text-4xl md:text-5xl font-bold text-[#1877F2] leading-tight text-center lg:text-left">
              The 6th Southern African Regional Students and Youth Conference
            </h1>

            {/* Intro — left column only, wraps within column bounds */}
            <div className="order-3 lg:col-start-1 lg:row-start-2 min-w-0 flex flex-col gap-4 text-justify break-words">
              <p className="text-lg md:text-xl font-semibold text-gray-900">SARSYC VI</p>
              <p className="text-sm md:text-base font-medium text-gray-900">
                Align for Action: Sustaining Progress in Youth Health and Education
              </p>
              <p className="text-sm md:text-base text-gray-800">#DrivingRegionalSolidarity</p>
              <p className="text-xs sm:text-sm md:text-[15px] text-gray-800 leading-relaxed">
                A flagship, youth-led regional conference convened by{' '}
                <a
                  href="https://www.saywhat.org.zw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 font-semibold underline hover:text-primary-700 transition-colors"
                >
                  SAYWHAT
                </a>
                {' '}in partnership with{' '}
                <a
                  href="https://www.unam.edu.na"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 font-semibold underline hover:text-primary-700 transition-colors"
                >
                  University of Namibia (UNAM)
                </a>
                , bringing together students, youth leaders, policymakers, civil society, development
                partners, and the private sector from across Southern Africa to drive transnational advocacy
                on youth health and education.
              </p>
            </div>

            {/* Team photo + date/location caption — right column */}
            <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 min-w-0 flex flex-col gap-3">
              <div className="relative w-full min-h-[300px] sm:min-h-[380px] lg:min-h-[460px] overflow-hidden shadow-2xl lg:shadow-md lg:rounded-l-3xl ring-1 ring-gray-200/80 lg:ring-gray-200 bg-white">
                <Image
                  src="/homepage-hero-team.jpg"
                  alt="SARSYC VI participants at a regional conference"
                  fill
                  priority
                  quality={95}
                  className="object-contain object-center lg:object-left"
                  sizes="(max-width: 1024px) 100vw, 56vw"
                />
              </div>
              <div className="flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-900 ring-1 ring-gray-200 shadow-sm">
                  <FiCalendar className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">August 5-8, 2026</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full shrink-0"></span>
                  <FiMapPin className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">Windhoek, Namibia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Register & countdown */}
      <section className="relative text-white bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 pb-12 md:pb-16">
        <div className="container-custom pt-2 md:pt-4">
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 mb-10">
            <Link href="/participate/register" className="btn-accent text-lg px-8 py-3 w-full sm:w-auto">
              Register for SARSYC VI
              <FiArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link href="/participate/submit-abstract" className="btn-outline border-white text-white hover:bg-white/10 text-lg px-8 py-3 w-full sm:w-auto">
              Submit Abstract (Research Indaba)
            </Link>
            <Link href="/partnerships" className="btn-outline border-white text-white hover:bg-white/10 text-lg px-8 py-3 w-full sm:w-auto">
              Become a Partner / Exhibitor
            </Link>
          </div>

          <div className="flex flex-col items-center">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
              Conference Countdown
            </h2>
            <CountdownTimer targetDate={conferenceDate} />
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
      <section className="py-8 md:py-10 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-full mb-3">
                    <Icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
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
      <section className="py-8 md:py-10 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="section-title">What is SARSYC?</h2>
            <p className="text-lg md:text-xl text-gray-600 text-center max-w-3xl mx-auto">
              The Southern African Regional Students and Youth Conference (SARSYC) is the premier regional platform
              for transnational advocacy on youth health and education.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="card p-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Connect</h3>
              <p className="text-gray-600">
                Network with 500+ young leaders, researchers, policymakers, development partners, and the private sector from across
                Southern Africa.
              </p>
            </div>

            <div className="card p-6">
              <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center text-white text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Learn</h3>
              <p className="text-gray-600">
                Engage with cutting-edge research, best practices, and innovative solutions in youth health and
                education.
              </p>
            </div>

            <div className="card p-6">
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
      <section className="section relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/SARSYC%20Homepage3.jpg')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[#FFF9F0]/80" aria-hidden />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="section-title">Conference Tracks</h2>
            <p className="section-subtitle">
              SARSYC VI features five thematic tracks addressing critical issues in youth development.
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
                        <img
                          src={photoUrl}
                          alt={speaker.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-400">
                          <FiUser className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}
                      {speaker.type && Array.isArray(speaker.type) && speaker.type.includes('keynote') && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1.5 rounded-md text-xs font-bold uppercase">
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
      <section className="py-8 md:py-10 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ready to Join Us in Windhoek?
            </h2>
            <p className="text-lg md:text-xl mb-6 text-white/90">
              Registration is now open for SARSYC VI. Secure your spot today and be part of this transformative
              conference.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/participate/register" className="btn-accent text-lg px-8 py-3 w-full sm:w-auto">
                Register for SARSYC VI
              </Link>
              <Link href="/programme" className="btn-outline border-white text-white hover:bg-white/10 text-lg px-8 py-3 w-full sm:w-auto">
                View Programme
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}






