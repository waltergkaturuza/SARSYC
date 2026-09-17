import Link from 'next/link'
import JourneyTimeline from '@/components/about/JourneyTimeline'

export const metadata = {
  title: 'The SARSYC Journey | SARSYC',
  description:
    'Follow SARSYC’s path across Southern Africa — from Maputo to Windhoek and beyond.',
}

export default function JourneyPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="page-hero-title">The SARSYC Journey</h1>
            <p className="page-hero-subtitle">
              A regional movement growing across Southern Africa, edition by edition
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-0">
        <JourneyTimeline />
      </section>

      <section className="bg-primary-600 text-white py-4 md:py-5">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-semibold mb-2">
              Be part of the next chapter
            </h2>
            <p className="text-sm md:text-base mb-3 text-white/90">
              Join SARSYC VI in Windhoek and continue the journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/participate/register" className="btn-accent px-6 py-2.5">
                Register for SARSYC VI
              </Link>
              <Link href="/about" className="btn-outline border-white text-white hover:bg-white/10 px-6 py-2.5">
                About SARSYC
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
