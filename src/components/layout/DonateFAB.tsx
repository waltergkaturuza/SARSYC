'use client'

import Link from 'next/link'
import { FiHeart } from 'react-icons/fi'
import { usePathname } from 'next/navigation'

export default function DonateFAB() {
  const pathname = usePathname()

  const hideDonate =
    pathname?.startsWith('/participate/donate') || pathname?.startsWith('/admin')

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="Back to top"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      {!hideDonate && (
        <Link
          href="/participate/donate"
          className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white px-4 py-3 rounded-full shadow-2xl shadow-primary-900/50 transition-all hover:scale-105 active:scale-95 group"
          aria-label="Donate or Sponsor SARSYC VI"
        >
          <FiHeart
            size={18}
            className="group-hover:scale-110 transition-transform"
            fill="currentColor"
          />
          <span className="text-sm font-semibold pr-1">Donate / Sponsor</span>
        </Link>
      )}
    </div>
  )
}
