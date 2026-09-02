import Link from 'next/link'
import { FiCalendar, FiMapPin, FiArrowRight, FiUser } from 'react-icons/fi'
import HeroImageSlider from '@/components/ui/HeroImageSlider'
import ConferenceTrackCards from '@/components/ui/ConferenceTrackCards'
import AboutVideoPlayer from '@/components/ui/AboutVideoPlayer'
import { getPayloadClient } from '@/lib/payload'
import { ensureSpeakersLatestColumns } from '@/lib/ensureSpeakersSchema'
import {
  HOMEPAGE_FEATURED_SPEAKER_LIMIT,
  sortFeaturedSpeakersForHomepage,
} from '@/lib/featuredSpeakers'

/** Lower-bitrate files power the quality menu; 720p is default for lighter autoplay. */
const aboutVideoSources = [
  { label: '720p', src: '/sarsyc-2026-doc-720p.mp4' },
  { label: '1080p', src: '/sarsyc-2026-doc.mp4' },
  { label: '480p', src: '/sarsyc-2026-doc-480p.mp4' },
]

// This will be fetched from Payload CMS in production
const stats = [
  { value: '14', label: 'Countries Represented' },
  { value: '2,000+', label: 'Youth Reached' },
  { value: '150+', label: 'Research Papers' },
  { value: '6', label: 'Conference Editions' },
]

const tracks = [
  {
    number: '01',
    title: 'Education Rights and Equity',
    description: 'Financing and innovation for equitable digital learning in rural communities, evaluating the effectiveness of climate resilience in education systems, Gender Equality & Social Inclusion (GESI) through responsive education budgeting, and CSE as a driver for quality education and retention.',
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-700',
  },
  {
    number: '02',
    title: 'HIV/AIDS, STIs, and Sexual Health',
    description: 'Sustaining gains in HIV/AIDS and STIs prevention and treatment, addressing resurgence among People Who Use and Inject Drugs, expanding harm reduction programs, and domestic health financing and resource mobilization.',
    color: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-700',
  },
  {
    number: '03',
    title: 'Non-Communicable Diseases (NCDs) Prevention and Health Lifestyles',
    description: 'Community-led NCD prevention and integration into primary health care, promoting healthy behaviors, nutrition, exercise, and reducing harmful habits, digital health tools for lifestyle change and risk monitoring, and innovations for early detection and screening in low-resource settings.',
    color: 'from-pink-500 to-pink-600',
    textColor: 'text-pink-700',
  },
  {
    number: '04',
    title: 'Digital Health and Safety',
    description: 'Digital violence/ online harassment: gendered vulnerabilities and responses, social media algorithms and adolescent mental health and behavior, online gambling and betting addiction, emerging trends and policy responses, and leveraging technology for health, education and service delivery.',
    color: 'from-orange-500 to-orange-600',
    textColor: 'text-orange-700',
  },
  {
    number: '05',
    title: 'Mental Health and Substance Abuse',
    description: 'Rising mental health challenges among boys and young men, suicide prevention strategies and psychosocial support, substance abuse trends and government responses, progress and gaps, and community-driven interventions for mental health and addiction recovery.',
    color: 'from-green-500 to-green-600',
    textColor: 'text-green-700',
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
  // Fetch featured speakers
  let featuredSpeakers: any[] = []
  try {
    const payload = await getPayloadClient()
    await ensureSpeakersLatestColumns(payload)
    const speakersResult = await payload.find({
      collection: 'speakers',
      where: {
        featured: { equals: true },
      },
      limit: 100,
      depth: 1,
      overrideAccess: true,
    })
    featuredSpeakers = sortFeaturedSpeakersForHomepage(speakersResult.docs || []).slice(
      0,
      HOMEPAGE_FEATURED_SPEAKER_LIMIT,
    )
    
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
      <section className="relative overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/sarsyc-group.jpg')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/75 to-slate-900/90" aria-hidden />

        <div className="relative z-10 w-full px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 pt-10 md:pt-12 lg:pt-14 pb-10 md:pb-12 lg:pb-14">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,44fr)_minmax(0,56fr)] lg:gap-x-10 lg:gap-y-5">
            {/* Intro copy — left column glass card */}
            <div className="order-1 lg:col-start-1 lg:row-start-1 lg:row-span-2 min-w-0 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-2xl p-6 md:p-8 flex flex-col gap-4 text-justify break-words transition-all duration-500 hover:border-primary-400/30 hover:bg-white/15">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-400 leading-tight text-center lg:text-left">
                The 6th Southern African Regional Students and Youth Conference
              </h1>
              <p className="text-lg md:text-xl font-semibold text-white">SARSYC VI</p>
              <p className="text-sm md:text-base font-medium text-white/90">
                Align for Action: Sustaining Progress in Youth Health and Education
              </p>
              <p className="text-sm md:text-base text-primary-300 italic">#DrivingRegionalSolidarity</p>
              <p className="text-xs sm:text-sm md:text-[15px] text-white/75 leading-relaxed">
                SARSYC VI brought together hundreds of young leaders, researchers, policymakers, and
                changemakers from across Southern Africa for three unforgettable days of learning,
                connection, and action. From powerful youth-led research and inspiring conversations to
                regional partnerships and bold commitments, the conference amplified youth voices and
                sparked solutions for the challenges facing young people today. The adoption of the
                Windhoek Declaration marked a collective commitment to turning ideas into action and
                creating lasting impact across the region. One region. Bold Ideas. Stronger
                partnerships. Youth-led action. The conference may be over, but the conversations and
                movement continue.
              </p>
            </div>

            {/* Team photo slider + date/location caption — right column */}
            <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 min-w-0 flex flex-col gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-500 hover:border-primary-400/30 hover:shadow-primary-500/10">
                <HeroImageSlider />
              </div>
              <div className="flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-lg">
                  <FiCalendar className="w-4 h-4 shrink-0 text-primary-300" />
                  <span className="text-sm font-medium">August 5-7, 2026</span>
                  <span className="w-1 h-1 bg-white/40 rounded-full shrink-0" />
                  <FiMapPin className="w-4 h-4 shrink-0 text-primary-300" />
                  <span className="text-sm font-medium">Windhoek, Namibia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Register CTAs */}
      <section className="relative text-white bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 py-4 md:py-5 pb-8 md:pb-10">
        <div className="container-custom relative z-10">
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 md:gap-4">
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
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg className="w-full h-6 md:h-8 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Stats + About Section */}
      <section className="relative overflow-hidden py-8 md:py-10 bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/sarsyc-group.jpg')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/75 to-slate-900/90" aria-hidden />

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-12">
            {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md px-3 py-2 md:px-4 md:py-2.5 shadow-lg transition-all duration-500 hover:-translate-y-0.5 hover:border-primary-400/30 hover:bg-white/15"
                >
                  <div className="text-2xl md:text-3xl font-bold text-white leading-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-white/70 mt-0.5">
                    {stat.label}
                  </div>
                </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
            <div className="min-w-0">
              <div className="mb-6 md:mb-8 text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">What is SARSYC?</h2>
                <p className="text-lg md:text-xl text-white/70">
                  The Southern African Regional Students and Youth Conference (SARSYC) is the premier regional platform
                  for transnational advocacy on youth health and education.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="group rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5 shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary-400/40 hover:bg-white/15 hover:shadow-2xl hover:shadow-primary-500/10">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-primary-300 group-hover:text-amber-300 transition-colors mb-2">
                    Connect
                  </h3>
                  <p className="text-sm text-white/75 leading-relaxed">
                    Network with 500+ young leaders, researchers, policymakers, development partners, and the private
                    sector from across Southern Africa.
                  </p>
                </div>

                <div className="group rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5 shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary-400/40 hover:bg-white/15 hover:shadow-2xl hover:shadow-primary-500/10">
                  <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-primary-300 group-hover:text-amber-300 transition-colors mb-2">
                    Learn
                  </h3>
                  <p className="text-sm text-white/75 leading-relaxed">
                    Engage with cutting-edge research, best practices, and innovative solutions in youth health and
                    education.
                  </p>
                </div>

                <div className="group rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5 shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary-400/40 hover:bg-white/15 hover:shadow-2xl hover:shadow-primary-500/10">
                  <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center text-gray-900 text-xl font-bold mb-3 shadow-lg">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-primary-300 group-hover:text-amber-300 transition-colors mb-2">
                    Act
                  </h3>
                  <p className="text-sm text-white/75 leading-relaxed">
                    Develop actionable strategies and commitments to drive real change in youth health and education
                    outcomes.
                  </p>
                </div>
              </div>
            </div>

            <div className="min-w-0 lg:sticky lg:top-24">
              <AboutVideoPlayer
                sources={aboutVideoSources}
                title="SARSYC 2026 documentary"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Conference Tracks */}
      <section className="relative overflow-hidden py-8 md:py-10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/SARSYC%20Homepage3.jpg')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[#FFF9F0]/18" aria-hidden />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-6 rounded-2xl bg-slate-900/70 backdrop-blur-sm px-5 py-4 shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-white">
              Conference Tracks
            </h2>
            <p className="text-lg text-white/95 text-center max-w-3xl mx-auto">
              SARSYC VI features five thematic tracks addressing critical issues in youth development.
            </p>
          </div>

          <ConferenceTrackCards tracks={tracks} />

          <div className="text-center mt-6">
            <Link href="/sarsyc-vi" className="btn-primary">
              Learn More About SARSYC VI
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Speakers Section */}
      {featuredSpeakers.length > 0 && (
        <section className="relative py-16 md:py-24 bg-slate-900">
          {/* Background image */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/sarsyc-group.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/85" />

          <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Featured Speakers</h2>
              <p className="text-white/70 text-lg">
                A big thanks to the distinguished speakers who shared their expertise at SARSYC VI.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSpeakers.map((speaker: any) => {
                const photoUrl = getSpeakerPhotoUrl(speaker.photo)
                const isKeynote = speaker.type && Array.isArray(speaker.type) && speaker.type.includes('keynote')
                return (
                  <Link
                    key={speaker.id}
                    href={`/programme/speakers/${speaker.id}`}
                    className="group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/20 hover:border-amber-400/40 hover:bg-white/15"
                  >
                    {/* Amber hover line */}
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Photo */}
                    <div className="relative w-full sm:w-44 flex-shrink-0 bg-slate-800/60 overflow-hidden" style={{ minHeight: '180px' }}>
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={speaker.name}
                          className="w-full h-full object-contain sm:object-cover sm:object-top transition-transform duration-500 group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
                          <FiUser className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}
                      {isKeynote && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 bg-amber-500 text-white text-[11px] font-bold rounded-md uppercase tracking-wide shadow-lg">KEYNOTE</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5 flex-1 min-w-0">
                      <h3 className="text-base font-bold text-primary-400 mb-1 leading-snug group-hover:text-amber-300 transition-colors duration-300">
                        {speaker.name}
                      </h3>
                      <p className="text-xs text-amber-400/90 font-medium mb-0.5">{speaker.title}</p>
                      <p className="text-xs text-white/55 mb-3">{speaker.organization}</p>
                      {speaker.expertise && Array.isArray(speaker.expertise) && speaker.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {speaker.expertise.slice(0, 2).map((exp: any, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-white/10 border border-white/15 text-white/70 text-xs rounded-full group-hover:bg-amber-500/20 group-hover:border-amber-400/30 transition-colors duration-300">
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
              <Link href="/programme/speakers" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition-colors shadow-lg shadow-amber-900/30">
                View All Speakers
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-8 md:py-10 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Happened In Windhoek
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
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






