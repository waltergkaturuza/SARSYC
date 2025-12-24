'use client'

import { useState } from 'react'
import { FiCheck, FiStar, FiTrendingUp, FiAward, FiHeart, FiDownload, FiMail } from 'react-icons/fi'

const tiers = [
  {
    name: 'Platinum',
    price: '$25,000',
    color: 'from-gray-300 to-gray-400',
    icon: FiStar,
    benefits: [
      'Logo on all conference materials',
      'Exhibition booth (premium location)',
      'Speaking opportunity (20 min keynote)',
      'VIP networking reception access',
      '10 complimentary registrations',
      'Full-page ad in conference programme',
      'Recognition in opening and closing ceremonies',
      'Social media feature (10+ posts)',
      'Post-conference impact report with logo',
    ],
  },
  {
    name: 'Gold',
    price: '$15,000',
    color: 'from-yellow-400 to-yellow-500',
    icon: FiAward,
    popular: true,
    benefits: [
      'Logo on conference website and materials',
      'Exhibition booth (standard location)',
      'Panel participation opportunity',
      'VIP networking reception access',
      '6 complimentary registrations',
      'Half-page ad in conference programme',
      'Recognition in ceremonies',
      'Social media feature (5+ posts)',
    ],
  },
  {
    name: 'Silver',
    price: '$8,000',
    color: 'from-gray-400 to-gray-500',
    icon: FiTrendingUp,
    benefits: [
      'Logo on conference website',
      'Exhibition table',
      '4 complimentary registrations',
      'Quarter-page ad in programme',
      'Recognition in ceremonies',
      'Social media mention (3 posts)',
    ],
  },
  {
    name: 'Bronze',
    price: '$3,000',
    color: 'from-orange-600 to-orange-700',
    icon: FiHeart,
    benefits: [
      'Logo on conference website',
      '2 complimentary registrations',
      'Logo in programme',
      'Social media mention (1 post)',
    ],
  },
]

const pastPartners = [
  'UNFPA', 'WHO', 'UNICEF', 'UNAIDS', 'Save the Children',
  'IPPF', 'MSI Reproductive Choices', 'Gates Foundation'
]

export default function PartnershipsPage() {
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Submit to API
    setFormSubmitted(true)
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Partner With Us
            </h1>
            <p className="text-xl text-white/90">
              Join leading organizations in supporting youth health and education advocacy across Southern Africa
            </p>
          </div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="section bg-white">
        <div className="container-custom">
          <h2 className="section-title">Why Partner with SARSYC VI?</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="card p-8 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Young leaders & decision-makers</div>
            </div>
            <div className="card p-8 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">14+</div>
              <div className="text-gray-600">Countries represented</div>
            </div>
            <div className="card p-8 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">100K+</div>
              <div className="text-gray-600">Social media impressions</div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-600 mb-8">
              Partnering with SARSYC provides your organization with unparalleled access to Southern Africa's
              most dynamic youth health and education network, while demonstrating commitment to youth empowerment
              and regional development.
            </p>
          </div>
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <h2 className="section-title">Sponsorship Packages</h2>
          <p className="section-subtitle">
            Choose the partnership level that aligns with your organization's goals and budget.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => {
              const Icon = tier.icon
              return (
                <div
                  key={tier.name}
                  className={`card overflow-hidden ${
                    tier.popular ? 'ring-4 ring-accent-500 transform scale-105' : ''
                  }`}
                >
                  {tier.popular && (
                    <div className="bg-accent-500 text-gray-900 text-center py-2 px-4 font-bold text-sm">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${tier.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                    <div className="text-3xl font-bold text-primary-600 mb-6">{tier.price}</div>
                    
                    <ul className="space-y-3 mb-8">
                      {tier.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2 text-sm">
                          <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <button className="btn-primary w-full" onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}>
                      Get Started
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-8">
            <button className="btn-outline flex items-center gap-2 mx-auto">
              <FiDownload />
              Download Full Sponsorship Prospectus (PDF)
            </button>
          </div>
        </div>
      </section>

      {/* Past Partners */}
      <section className="section bg-white">
        <div className="container-custom">
          <h2 className="section-title">Our Partners</h2>
          <p className="section-subtitle mb-12">
            Proud to partner with leading organizations committed to youth empowerment.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
            {pastPartners.map((partner) => (
              <div
                key={partner}
                className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center hover:shadow-lg transition-shadow"
              >
                <div className="text-gray-400 font-bold text-sm text-center px-4">
                  {partner}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Join these esteemed organizations in supporting SARSYC VI
            </p>
          </div>
        </div>
      </section>

      {/* Expression of Interest Form */}
      <section id="inquiry-form" className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Express Your Interest
              </h2>
              <p className="text-lg text-gray-600">
                Let's discuss how we can partner for SARSYC VI success.
              </p>
            </div>

            {formSubmitted ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCheck className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h3>
                <p className="text-gray-600 mb-6">
                  We've received your partnership inquiry. Our team will contact you within 24 hours.
                </p>
                <a href="/" className="btn-primary">
                  Back to Homepage
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partnership Interest *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a tier</option>
                      <option value="platinum">Platinum Sponsor</option>
                      <option value="gold">Gold Sponsor</option>
                      <option value="silver">Silver Sponsor</option>
                      <option value="bronze">Bronze Sponsor</option>
                      <option value="exhibitor">Exhibition Only</option>
                      <option value="custom">Custom Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Tell us about your organization and partnership goals..."
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                    <FiMail />
                    Submit Partnership Inquiry
                  </button>

                  <p className="text-sm text-gray-500 text-center">
                    We'll respond within 24 hours • All information is confidential
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}



