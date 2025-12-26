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
      <nav className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="SARSYC Logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="48px"
                />
              </div>
              <div className="hidden sm:block">
                <div className="font-heading font-bold text-xl text-gray-900">
                  SARSYC VI
                </div>
                <div className="text-xs text-gray-600">
                  Windhoek 2026
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200 flex items-center gap-1"
                >
                  {item.name}
                  {item.dropdown && <FiChevronDown className="w-4 h-4" />}
                </Link>

                {/* Dropdown Menu */}
                {item.dropdown && activeDropdown === item.name && (
                  <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-xl py-2 animate-fade-in">
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

          {/* CTA Buttons */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
              Login
            </Link>
            <Link href="/participate/register" className="btn-primary">
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
          <div className="lg:hidden py-4 animate-slide-down">
            <div className="space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors duration-200"
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
            <div className="mt-4 px-4 space-y-3">
              <Link
                href="/login"
                className="block text-center text-sm font-medium text-gray-700 hover:text-primary-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/participate/register"
                className="btn-primary w-full justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register Now
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}






