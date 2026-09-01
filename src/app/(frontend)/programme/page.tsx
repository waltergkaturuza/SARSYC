'use client'

import Link from 'next/link'
import { FiDownload } from 'react-icons/fi'
import ConferenceProgrammeSchedule from '@/components/programme/ConferenceProgrammeSchedule'
import CultureNightImageSlider from '@/components/programme/CultureNightImageSlider'

export default function ProgrammePage() {
  return (
    <>
      <section className="page-hero">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="page-hero-title">Conference Programme</h1>
            <p className="page-hero-subtitle mb-4">
              Three days in Windhoek (August 5–7, 2026): Research Indaba, forums & engagements, and
              official opening, closing & culture night
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/api/programme/pdf"
                download="SARSYC-VI-Programme.pdf"
                className="btn-accent flex items-center gap-2"
              >
                <FiDownload />
                Download Full Programme (PDF)
              </a>
              <Link href="/programme/speakers" className="btn-outline border-white text-white hover:bg-white/10">
                View All Speakers
              </Link>
              <Link
                href="/participate/register-orathon"
                className="btn-outline border-white text-white hover:bg-white/10"
              >
                Register for Orathon
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-10 bg-gray-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10 items-start">
            <ConferenceProgrammeSchedule variant="cards-only" />
            <div className="md:sticky md:top-8">
              <CultureNightImageSlider />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
