'use client'

import Link from 'next/link'
import { FiHeart } from 'react-icons/fi'
import { usePathname } from 'next/navigation'

export default function DonateFAB() {
  const pathname = usePathname()

  // Hide on the donate page itself and admin pages
  if (
    pathname?.startsWith('/participate/donate') ||
    pathname?.startsWith('/admin')
  ) {
    return null
  }

  return (
    <Link
      href="/participate/donate"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white px-4 py-3 rounded-full shadow-2xl shadow-primary-900/50 transition-all hover:scale-105 active:scale-95 group"
      aria-label="Donate or Sponsor SARSYC VI"
    >
      <FiHeart
        size={18}
        className="group-hover:scale-110 transition-transform"
        fill="currentColor"
      />
      <span className="text-sm font-semibold pr-1">Donate / Sponsor</span>
    </Link>
  )
}
