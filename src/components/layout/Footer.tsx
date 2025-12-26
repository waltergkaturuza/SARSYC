'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiMapPin, FiCheck } from 'react-icons/fi'
import { SiTiktok } from 'react-icons/si'

const footerLinks = {
  conference: [
    { name: 'About SARSYC', href: '/about' },
    { name: 'SARSYC VI Overview', href: '/sarsyc-vi' },
    { name: 'Programme', href: '/programme' },
    { name: 'Speakers', href: '/programme/speakers' },
  ],
  participate: [
    { name: 'Register', href: '/participate/register' },
    { name: 'Submit Abstract', href: '/participate/submit-abstract' },
    { name: 'Volunteer', href: '/participate/volunteer' },
    { name: 'Partnerships', href: '/partnerships' },
  ],
  resources: [
    { name: 'Resource Library', href: '/resources' },
    { name: 'News & Updates', href: '/news' },
    { name: 'Past Editions', href: '/about/history' },
    { name: 'FAQs', href: '/faq' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Use', href: '/terms' },
    { name: 'Accessibility', href: '/accessibility' },
    { name: 'Contact Us', href: '/contact' },
  ],
}

const socialLinks = [
  { name: 'Facebook', icon: FiFacebook, href: 'https://www.facebook.com/SARSYC', color: 'hover:text-blue-600' },
  { name: 'Instagram', icon: FiInstagram, href: 'https://www.instagram.com/sarsyc2026/', color: 'hover:text-pink-600' },
  { name: 'X (Twitter)', icon: FiTwitter, href: 'https://x.com/SARSYC2026', color: 'hover:text-sky-500' },
  { name: 'TikTok', icon: SiTiktok, href: 'https://www.tiktok.com/@sarsyc2026', color: 'hover:text-black dark:hover:text-white' },
]

function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsSuccess(true)
        setEmail('')
        setTimeout(() => setIsSuccess(false), 5000)
      } else {
        setError(data.error || 'Subscription failed. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm">
        <FiCheck className="w-5 h-5" />
        <span>Subscribed successfully!</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        disabled={isSubmitting}
        className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
      />
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="btn-primary whitespace-nowrap disabled:opacity-50"
      >
        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
      </button>
      {error && (
        <p className="text-red-400 text-sm mt-2 col-span-full">{error}</p>
      )}
    </form>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="SARSYC Logo"
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
              <div>
                <div className="font-heading font-bold text-xl text-white">
                  SARSYC VI
                </div>
                <div className="text-sm text-gray-400">
                  Windhoek 2026
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-md">
              The Southern African Regional Students and Youth Conference (SARSYC) is the premier platform for students 
              and youth working on reproductive health advocacy in Southern Africa.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <FiMapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>Windhoek, Namibia<br />August 5-7, 2026</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <FiMail className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <a href="mailto:saywhat@mweb.co.zw" className="hover:text-white transition-colors block">
                    saywhat@mweb.co.zw
                  </a>
                  <a href="mailto:info@sarsyc.org" className="hover:text-white transition-colors block">
                    info@sarsyc.org
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <FiMapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <a href="https://www.sarsyc.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors block">
                    www.sarsyc.org
                  </a>
                  <a href="https://www.saywhat.org.zw" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors block">
                    www.saywhat.org.zw
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Conference Links */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-4">Conference</h3>
            <ul className="space-y-3">
              {footerLinks.conference.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Participate Links */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-4">Participate</h3>
            <ul className="space-y-3">
              {footerLinks.participate.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-2xl">
            <h3 className="font-heading font-semibold text-white mb-2">Stay Updated</h3>
            <p className="text-sm mb-4">
              Subscribe to our newsletter for conference updates, speaker announcements, and more.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-gray-400 text-center md:text-left">
              © {currentYear} SAYWHAT. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-400 ${social.color} transition-colors duration-200`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-4 text-sm">
              {footerLinks.legal.slice(0, 2).map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="Back to top"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  )
}






