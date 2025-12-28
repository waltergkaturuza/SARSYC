'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi'

const navigation = [
  { name: 'Home', href: '/' },
  { 
    name: 'About', 
    href: '/about',
    dropdown: [
      { name: 'About SARSYC', href: '/about' },
      { name: 'Vision & Mission', href: '/about/vision' },
      { name: 'Who We Are', href: '/about/team' },
      { name: 'Governance', href: '/about/governance' },
    ]
  },
  { 
    name: 'SARSYC VI', 
    href: '/sarsyc-vi',
    dropdown: [
      { name: 'Overview', href: '/sarsyc-vi' },
      { name: 'Why SARSYC VI?', href: '/sarsyc-vi/why' },
      { name: 'Objectives', href: '/sarsyc-vi/objectives' },
      { name: 'Expected Outcomes', href: '/sarsyc-vi/outcomes' },
      { name: 'Venue & Accommodation', href: '/sarsyc-vi/venue' },
    ]
  },
  { 
    name: 'Programme', 
    href: '/programme',
    dropdown: [
      { name: 'Programme Schedule', href: '/programme' },
      { name: 'Speakers', href: '/programme/speakers' },
      { name: 'Sessions', href: '/programme/sessions' },
    ]
  },
  { 
    name: 'Participate', 
    href: '/participate',
    dropdown: [
      { name: 'Register', href: '/participate/register' },
      { name: 'Submit Abstract', href: '/participate/submit-abstract' },
      { name: 'Volunteer', href: '/participate/volunteer' },
    ]
  },
  { name: 'Resources', href: '/resources' },
  { name: 'News', href: '/news' },
  { name: 'Partnerships', href: '/partnerships' },
  { name: 'Contact', href: '/contact' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <nav className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 md:h-28 w-full">
          {/* Logo - Circular */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden">
                <Image
                  src="/logo.jpeg"
                  alt="SARSYC Logo"
                  fill
                  className="object-cover scale-110"
                  priority
                  sizes="64px"
                />
              </div>
              <div className="hidden sm:block">
                <div className="font-heading font-black text-2xl md:text-3xl text-gray-900">
                  SARSYC VI
                </div>
                <div className="text-sm md:text-base font-semibold text-gray-600">
                  Windhoek 2026
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Spread evenly across available space */}
          <div className="hidden lg:flex lg:items-center lg:flex-1 lg:justify-center lg:gap-1 xl:gap-2 lg:mx-4">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative flex-shrink-0"
                onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-2 xl:px-3 py-2 text-sm xl:text-base font-bold text-gray-700 hover:text-primary-600 transition-colors duration-200 flex items-center gap-1 whitespace-nowrap"
                >
                  {item.name}
                  {item.dropdown && <FiChevronDown className="w-3 h-3 xl:w-4 xl:h-4" />}
                </Link>

                {/* Dropdown Menu */}
                {item.dropdown && activeDropdown === item.name && (
                  <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-xl py-2 animate-fade-in z-50">
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons - Right side */}
          <div className="hidden lg:flex lg:items-center lg:gap-3 lg:flex-shrink-0">
            <Link href="/login" className="text-sm xl:text-base font-bold text-gray-700 hover:text-primary-600 transition-colors whitespace-nowrap">
              Login
            </Link>
            <Link href="/participate/register" className="btn-primary font-bold text-sm xl:text-base px-4 xl:px-6 py-2 xl:py-3 whitespace-nowrap">
              Register Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-24 bg-white z-40 overflow-y-auto">
            <div className="container-custom py-4">
              <div className="space-y-1 pb-4">
                {navigation.map((item) => (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className="block px-4 py-3 text-base font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                    {item.dropdown && (
                      <div className="pl-4 space-y-1">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors duration-200"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 px-4 space-y-3 pb-8">
                <Link
                  href="/login"
                  className="block text-center text-base font-bold text-gray-700 hover:text-primary-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/participate/register"
                  className="btn-primary w-full justify-center font-bold text-base"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}






