'use client'

import Link from 'next/link'
import { FiDownload } from 'react-icons/fi'
import ConferenceProgrammeSchedule from '@/components/programme/ConferenceProgrammeSchedule'

export default function ProgrammePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-10 md:py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Conference Programme</h1>
            <p className="text-xl text-white/90 mb-6">
              Three days in Windhoek (August 5–7, 2026): Research Indaba, forums & engagements, and
              official opening, closing & culture night
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/api/programme/pdf" download className="btn-accent flex items-center gap-2">
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

      <ConferenceProgrammeSchedule variant="page" />
    </>
  )
}
