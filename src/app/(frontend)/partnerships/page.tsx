'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FiCheck, FiStar, FiTrendingUp, FiAward, FiHeart, FiDownload, FiMail, FiZap, FiTarget, FiLoader } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import EmptyState from '@/components/ui/EmptyState'
import { showToast } from '@/lib/toast'

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  star: FiStar,
  award: FiAward,
  trending: FiTrendingUp,
  heart: FiHeart,
  diamond: FiZap, // Using Zap as alternative for diamond
  trophy: FiTarget, // Using Target as alternative for trophy
}

// Color mapping
const colorMap: Record<string, string> = {
  gray: 'from-gray-300 to-gray-400',
  yellow: 'from-yellow-400 to-yellow-500',
  silver: 'from-gray-400 to-gray-500',
  orange: 'from-orange-600 to-orange-700',
  blue: 'from-blue-400 to-blue-500',
  purple: 'from-purple-400 to-purple-500',
  green: 'from-green-400 to-green-500',
  red: 'from-red-400 to-red-500',
}

// Partner organizations with their logos
const partners = [
  {
    name: 'SAYWHAT',
    logo: '/partners/saywhat logo (1).png',
    alt: 'SAYWHAT Logo',
  },
  {
    name: 'University of Namibia (UNAM)',
    logo: '/partners/university_namibia.png',
    alt: 'University of Namibia Logo',
  },
  {
    name: 'National Youth Council of Namibia',
    logo: '/partners/national_youth_council_of_namibia.jpeg',
    alt: 'National Youth Council of Namibia Logo',
  },
  {
    name: 'Stellenbosch University',
    logo: '/partners/stellenbosch_university.jpg',
    alt: 'Stellenbosch University Logo',
  },
  {
    name: 'UNESCO',
    logo: '/partners/UNESCO.png',
    alt: 'UNESCO Logo',
  },
  {
    name: 'GEAR Alliance',
    logo: '/partners/GEARlogo.jpg',
    alt: 'GEAR Alliance Logo',
  },
  {
    name: 'Education Out Loud (EOL)',
    logo: '/partners/EOL_GPE-Branding_horizontal_EN-1-e1666182269168.jpg',
    alt: 'Education Out Loud Logo',
  },
  {
    name: 'AmplifyChange',
    logo: '/partners/AmplifyChange-launch-graphics-16-9_Artboard-11-1024x576.jpg',
    alt: 'AmplifyChange Logo',
  },
  {
    name: 'CYECE',
    logo: '/partners/CYECE.webp',
    alt: 'CYECE Logo',
  },
  {
    name: 'FACET',
    logo: '/partners/FACET.webp',
    alt: 'FACET Logo',
  },
  {
    name: 'GAYO',
    logo: '/partners/gayo.webp',
    alt: 'GAYO Logo',
  },
  {
    name: 'NAQEZ',
    logo: '/partners/NAQEZ-Logo.png',
    alt: 'NAQEZ Logo',
  },
]

const partnershipInquirySchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  contactPerson: z.string().min(2, 'Contact person name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  tier: z.enum(['platinum', 'gold', 'silver', 'bronze', 'exhibitor', 'custom'], {
    required_error: 'Please select a partnership tier',
  }),
  message: z.string().optional(),
})

type PartnershipInquiryFormData = z.infer<typeof partnershipInquirySchema>

export default function PartnershipsPage() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [tiers, setTiers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PartnershipInquiryFormData>({
    resolver: zodResolver(partnershipInquirySchema),
  })

  useEffect(() => {
    fetchTiers()
  }, [])

  const fetchTiers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/sponsorship-tiers')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch sponsorship tiers')
      }

      setTiers(result.tiers || [])
    } catch (err: any) {
      console.error('Error fetching tiers:', err)
      setError(err.message || 'Failed to load sponsorship tiers')
      // Fallback to empty array - will show empty state
      setTiers([])
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: PartnershipInquiryFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit inquiry')
      }

      showToast.success(result.message || 'Partnership inquiry submitted successfully!')
      setFormSubmitted(true)
      reset()
    } catch (error: any) {
      showToast.error(error.message || 'Failed to submit inquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={fetchTiers} className="btn-outline">
                Try Again
              </button>
            </div>
          ) : tiers.length === 0 ? (
            <EmptyState
              icon="award"
              title="No Sponsorship Tiers Available"
              description="Sponsorship packages are being configured. Please check back soon or contact us for partnership opportunities."
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tiers.map((tier) => {
                const IconComponent = iconMap[tier.icon] || FiStar
                const colorClass = colorMap[tier.color] || colorMap.gray
                const benefits = tier.benefits || []
                
                return (
                  <div
                    key={tier.id || tier.name}
                    className={`card overflow-hidden ${
                      tier.isPopular ? 'ring-4 ring-accent-500 transform scale-105' : ''
                    }`}
                  >
                    {tier.isPopular && (
                      <div className="bg-accent-500 text-gray-900 text-center py-2 px-4 font-bold text-sm">
                        MOST POPULAR
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center text-white mb-4`}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                      <div className="text-3xl font-bold text-primary-600 mb-6">{tier.price}</div>
                      
                      {tier.description && (
                        <p className="text-sm text-gray-600 mb-4">{tier.description}</p>
                      )}
                      
                      <ul className="space-y-3 mb-8">
                        {benefits.map((benefit: any, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">{benefit.benefit || benefit}</span>
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
          )}

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

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 mb-12">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all hover:border-primary-300"
              >
                <div className="relative w-full h-24 flex items-center justify-center">
                  <Image
                    src={partner.logo}
                    alt={partner.alt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 200px"
                  />
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
              <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl p-8">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Name *
                      </label>
                      <input
                        {...register('organizationName')}
                        type="text"
                        id="organizationName"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.organizationName ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                      {errors.organizationName && (
                        <p className="mt-1 text-sm text-red-600">{errors.organizationName.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person *
                      </label>
                      <input
                        {...register('contactPerson')}
                        type="text"
                        id="contactPerson"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.contactPerson ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                      {errors.contactPerson && (
                        <p className="mt-1 text-sm text-red-600">{errors.contactPerson.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        id="email"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        id="phone"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="tier" className="block text-sm font-medium text-gray-700 mb-2">
                      Partnership Interest *
                    </label>
                    <select
                      {...register('tier')}
                      id="tier"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.tier ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    >
                      <option value="">Select a tier</option>
                      {tiers.map((tier) => {
                        // Map tier name to enum value
                        const tierNameLower = tier.name.toLowerCase()
                        let enumValue = 'custom'
                        if (tierNameLower.includes('platinum')) enumValue = 'platinum'
                        else if (tierNameLower.includes('gold')) enumValue = 'gold'
                        else if (tierNameLower.includes('silver')) enumValue = 'silver'
                        else if (tierNameLower.includes('bronze')) enumValue = 'bronze'
                        
                        return (
                          <option key={tier.id || tier.name} value={enumValue}>
                            {tier.name} Sponsor {tier.price && `(${tier.price})`}
                          </option>
                        )
                      })}
                      <option value="exhibitor">Exhibition Only</option>
                      <option value="custom">Custom Partnership</option>
                    </select>
                    {errors.tier && (
                      <p className="mt-1 text-sm text-red-600">{errors.tier.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      {...register('message')}
                      id="message"
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Tell us about your organization and partnership goals..."
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiMail />
                    {isSubmitting ? 'Submitting...' : 'Submit Partnership Inquiry'}
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






