'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi'

type NavChild = { name: string; href: string }
type NavSubItem = { name: string; href: string; children?: NavChild[] }
type NavItem = { name: string; href: string; dropdown?: NavSubItem[] }

const CURRENT_CONFERENCE_LINKS: NavChild[] = [
  { name: 'Overview', href: '/sarsyc-vi' },
  { name: 'Why SARSYC VI?', href: '/sarsyc-vi/why' },
  { name: 'Objectives', href: '/sarsyc-vi/objectives' },
  { name: 'Expected Outcomes', href: '/sarsyc-vi/outcomes' },
  { name: 'Venue & Accommodation', href: '/sarsyc-vi/venue' },
]

const navigation: NavItem[] = [
  { name: 'Home', href: '/' },
  {
    name: 'About',
    href: '/about',
    dropdown: [
      { name: 'About SARSYC', href: '/about' },
      { name: 'Vision & Mission', href: '/about/vision' },
      { name: 'Who We Are', href: '/about/team' },
      { name: 'Governance', href: '/about/governance' },
    ],
  },
  {
    name: 'Conferences',
    href: '/sarsyc-vi',
    dropdown: [
      {
        name: 'Current Conference',
        href: '/sarsyc-vi',
        children: CURRENT_CONFERENCE_LINKS,
      },
      { name: 'Previous Conferences', href: '/conferences' },
    ],
  },
  {
    name: 'Programme',
    href: '/programme',
    dropdown: [
      { name: 'Programme Schedule', href: '/programme' },
      { name: 'Speakers', href: '/programme/speakers' },
      { name: 'Sessions', href: '/programme/sessions' },
    ],
  },
  {
    name: 'Participate',
    href: '/participate',
    dropdown: [
      { name: 'Register', href: '/participate/register' },
      { name: 'Submit Abstract', href: '/participate/submit-abstract' },
      { name: 'Volunteer', href: '/participate/volunteer' },
      { name: 'Track Status', href: '/track' },
    ],
  },
  { name: 'Resources', href: '/resources' },
  { name: 'News', href: '/news' },
  { name: 'Partnerships', href: '/partnerships' },
  { name: 'Contact', href: '/contact' },
]

function pathMatches(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (pathMatches(pathname, item.href)) return true
  if (!item.dropdown) return false
  return item.dropdown.some((sub) => {
    if (pathMatches(pathname, sub.href)) return true
    return Boolean(sub.children?.some((child) => pathMatches(pathname, child.href)))
  })
}

export default function Header() {
  const pathname = usePathname() || '/'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>('Current Conference')
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setActiveDropdown(null)
  }, [pathname])

  const handleMouseEnter = (itemName: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setActiveDropdown(itemName)
  }

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 300)
  }

  const navLinkClass = (active: boolean) =>
    [
      'px-2 xl:px-3 py-1.5 text-sm xl:text-base font-bold transition-colors duration-200 flex items-center gap-1 whitespace-nowrap rounded-md',
      active
        ? 'text-primary-600 bg-primary-50'
        : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50',
    ].join(' ')

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-gray-100 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <nav className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 w-full">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="relative w-11 h-11 md:w-12 md:h-12 flex-shrink-0 rounded-full overflow-hidden">
                <Image
                  src="/logo.jpeg"
                  alt="SARSYC Logo"
                  fill
                  className="object-cover scale-110"
                  sizes="48px"
                />
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="font-heading font-black text-xl md:text-2xl text-gray-900">
                  SARSYC VI
                </div>
                <div className="text-xs md:text-sm font-semibold text-gray-600">
                  Windhoek 2026
                </div>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex lg:items-center lg:flex-1 lg:justify-center lg:gap-0.5 xl:gap-1 lg:mx-4">
            {navigation.map((item) => {
              const active = isNavItemActive(pathname, item)
              return (
                <div
                  key={item.name}
                  className="relative flex-shrink-0"
                  onMouseEnter={() => item.dropdown && handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link href={item.href} className={navLinkClass(active)}>
                    {item.name}
                    {item.dropdown && (
                      <FiChevronDown
                        className={`w-3 h-3 xl:w-4 xl:h-4 transition-colors ${
                          active ? 'text-primary-600' : ''
                        }`}
                      />
                    )}
                  </Link>

                  {item.dropdown && activeDropdown === item.name && (
                    <div className="absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-xl py-2 animate-fade-in z-50 border border-gray-100">
                      {item.dropdown.map((subItem) => {
                        const subActive =
                          pathMatches(pathname, subItem.href) ||
                          Boolean(subItem.children?.some((c) => pathMatches(pathname, c.href)))
                        return (
                          <div key={subItem.name}>
                            <Link
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                                subItem.children
                                  ? subActive
                                    ? 'font-semibold text-primary-700 bg-primary-50'
                                    : 'font-semibold text-gray-900 hover:bg-primary-50 hover:text-primary-700'
                                  : subActive
                                    ? 'font-semibold text-primary-600 bg-primary-50'
                                    : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                            {subItem.children && (
                              <div className="pb-2 mb-1 border-b border-gray-100">
                                {subItem.children.map((child) => {
                                  const childActive = pathMatches(pathname, child.href)
                                  return (
                                    <Link
                                      key={child.name}
                                      href={child.href}
                                      className={`block pl-7 pr-4 py-2 text-sm transition-colors duration-200 ${
                                        childActive
                                          ? 'text-primary-600 bg-primary-50 font-medium'
                                          : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                                      }`}
                                    >
                                      {child.name}
                                    </Link>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="hidden lg:flex lg:items-center lg:gap-3 lg:flex-shrink-0">
            <Link
              href="/participate/register"
              className="btn-primary font-bold text-sm xl:text-base px-4 xl:px-5 py-2 whitespace-nowrap"
            >
              Register Now
            </Link>
          </div>

          <div className="lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 md:top-20 bg-white z-40 overflow-y-auto">
            <div className="container-custom py-4">
              <div className="space-y-1 pb-4">
                {navigation.map((item) => {
                  const active = isNavItemActive(pathname, item)
                  return (
                    <div key={item.name}>
                      <Link
                        href={item.href}
                        className={`block px-4 py-2.5 text-base font-bold rounded-lg transition-colors duration-200 ${
                          active
                            ? 'text-primary-600 bg-primary-50'
                            : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                      {item.dropdown && (
                        <div className="pl-4 space-y-1">
                          {item.dropdown.map((subItem) => (
                            <div key={subItem.name}>
                              {subItem.children ? (
                                <>
                                  <button
                                    type="button"
                                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-primary-50 hover:text-primary-700 rounded-lg"
                                    onClick={() =>
                                      setMobileExpanded((prev) =>
                                        prev === subItem.name ? null : subItem.name,
                                      )
                                    }
                                  >
                                    <span>{subItem.name}</span>
                                    <FiChevronDown
                                      className={`w-4 h-4 transition-transform ${
                                        mobileExpanded === subItem.name ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </button>
                                  {mobileExpanded === subItem.name && (
                                    <div className="pl-3 space-y-1 pb-2">
                                      <Link
                                        href={subItem.href}
                                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
                                        onClick={() => setMobileMenuOpen(false)}
                                      >
                                        Open current conference
                                      </Link>
                                      {subItem.children.map((child) => (
                                        <Link
                                          key={child.name}
                                          href={child.href}
                                          className={`block px-4 py-2 text-sm rounded-lg ${
                                            pathMatches(pathname, child.href)
                                              ? 'text-primary-600 bg-primary-50 font-medium'
                                              : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                                          }`}
                                          onClick={() => setMobileMenuOpen(false)}
                                        >
                                          {child.name}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <Link
                                  href={subItem.href}
                                  className={`block px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                                    pathMatches(pathname, subItem.href)
                                      ? 'text-primary-600 bg-primary-50 font-medium'
                                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                                  }`}
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {subItem.name}
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 px-4 space-y-3 pb-8">
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
