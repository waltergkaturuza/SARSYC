'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiMapPin, FiCheck } from 'react-icons/fi'

const footerLinks = {
  about: [
    { name: 'About SARSYC', href: '/about' },
    { name: 'Vision & Mission', href: '/about/vision' },
    { name: 'The SARSYC Journey', href: '/about/journey' },
    { name: 'Who We Are', href: '/about/team' },
    { name: 'Governance', href: '/about/governance' },
    { name: 'Our History', href: '/about/history' },
    { name: 'Youth Steering Committee', href: '/about/youth-steering-committee' },
  ],
  conference: [
    { name: 'SARSYC VI Overview', href: '/sarsyc-vi' },
    { name: 'Why SARSYC VI?', href: '/sarsyc-vi/why' },
    { name: 'Objectives', href: '/sarsyc-vi/objectives' },
    { name: 'Expected Outcomes', href: '/sarsyc-vi/outcomes' },
    { name: 'Venue & Accommodation', href: '/sarsyc-vi/venue' },
    { name: 'Previous Conferences', href: '/conferences' },
    { name: 'Programme Schedule', href: '/programme' },
    { name: 'Speakers', href: '/programme/speakers' },
    { name: 'Sessions', href: '/programme/sessions' },
  ],
  participate: [
    { name: 'How to Participate', href: '/participate' },
    { name: 'Register for Orathon', href: '/participate/register-orathon' },
    { name: 'Register', href: '/participate/register' },
    { name: 'Submit Abstract', href: '/participate/submit-abstract' },
    { name: 'Volunteer', href: '/participate/volunteer' },
    { name: 'Track Status', href: '/track' },
    { name: 'Donate / Sponsor', href: '/participate/donate' },
    { name: 'Safeguarding', href: '/participate/safeguarding' },
    { name: 'Partnerships', href: '/partnerships' },
  ],
  resources: [
    { name: 'Resource Library', href: '/resources' },
    { name: 'News & Updates', href: '/news' },
    { name: 'Photo & Video Gallery', href: '/media/gallery' },
    { name: 'Press', href: '/media/press' },
    { name: 'Media Kit', href: '/media/kit' },
    { name: 'GEAR Alliance', href: '/gear-alliance' },
    { name: 'FAQs', href: '/faq' },
    { name: 'Contact Us', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Use', href: '/terms' },
    { name: 'Accessibility', href: '/accessibility' },
  ],
}

const socialLinks = [
  { name: 'Facebook', icon: FiFacebook, href: 'https://www.facebook.com/SAYWHATOrg', color: 'hover:text-blue-600' },
  { name: 'Instagram', icon: FiInstagram, href: 'https://www.instagram.com/saywhatzimbabwe/', color: 'hover:text-pink-600' },
  { name: 'X (Twitter)', icon: FiTwitter, href: 'https://x.com/SAYWHATOrg', color: 'hover:text-sky-500' },
  { name: 'LinkedIn', icon: FiLinkedin, href: 'https://www.linkedin.com/company/5272695/', color: 'hover:text-blue-700' },
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
      <div className="container-custom py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 lg:gap-x-6 lg:gap-y-5">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden">
                <Image
                  src="/logo.jpeg"
                  alt="SARSYC Logo"
                  fill
                  className="object-cover scale-110"
                  sizes="64px"
                />
              </div>
              <div>
                <div className="font-heading font-semibold text-xl text-primary-400">
                  SARSYC
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
                <span>
                  24 JEFFERSON Road<br />
                  Logan Park, Hatfield
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <FiMail className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <a href="mailto:sarsyc@saywhat.org.zw" className="hover:text-white transition-colors block">
                    sarsyc@saywhat.org.zw
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

          {/* About Links */}
          <div>
            <h3 className="font-heading font-medium text-primary-400 mb-4">About</h3>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-2.5 lg:grid-cols-1">
              {footerLinks.about.map((link) => (
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

          {/* Conference Links */}
          <div>
            <h3 className="font-heading font-medium text-primary-400 mb-4">Conference</h3>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-2.5 lg:grid-cols-1">
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
            <h3 className="font-heading font-medium text-primary-400 mb-4">Participate</h3>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-2.5 lg:grid-cols-1">
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
            <h3 className="font-heading font-medium text-primary-400 mb-4">Resources</h3>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-2.5 lg:grid-cols-1">
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

          {/* Newsletter — full width below link columns */}
          <div className="sm:col-span-2 lg:col-span-6 pt-2 border-t border-gray-800">
            <h3 className="font-heading font-medium text-primary-400 mb-2">Stay Updated</h3>
            <p className="text-sm mb-4 max-w-2xl">
              Subscribe to our newsletter for conference updates, speaker announcements, and more.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 relative z-50">
        <div className="container-custom py-6 pb-28 md:pb-6 pr-48 lg:pr-56">
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

            {/* Legal Links + Admin (low-key, like TNF site) */}
            <div className="relative z-50 flex flex-wrap items-center justify-center gap-4 text-sm">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/login?type=admin"
                className="text-gray-700 hover:text-white transition-colors duration-200"
                aria-label="Admin login"
              >
                Admin
              </Link>
            </div>
          </div>
          
          {/* Developer Credit */}
          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              Developed by{' '}
              <a
                href="https://www.quantistechnologies.co.zw/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200 font-medium"
              >
                Quantis Technologies
              </a>
            </p>
          </div>
        </div>
      </div>

    </footer>
  )
}






