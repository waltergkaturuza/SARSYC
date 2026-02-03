'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiCalendar, FiMapPin, FiUsers, FiCheck, FiLoader } from 'react-icons/fi'
import { showToast } from '@/lib/toast'
import { countries } from '@/lib/countries'

const orathonSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say'], {
    required_error: 'Please select your gender',
  }),
  organization: z.string().min(2, 'Organization is required'),
  country: z.string().min(2, 'Please select your country'),
  city: z.string().min(2, 'Please enter your city'),
  emergencyContact: z.string().min(2, 'Emergency contact name is required'),
  emergencyPhone: z.string().min(10, 'Emergency phone is required'),
  medicalConditions: z.string().optional(),
  dietaryRequirements: z.string().optional(),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Please select your fitness level',
  }),
  tshirtSize: z.enum(['xs', 's', 'm', 'l', 'xl', 'xxl'], {
    required_error: 'Please select a t-shirt size',
  }),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
})

type OrathonFormData = z.infer<typeof orathonSchema>

export default function OrathonRegistrationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrathonFormData>({
    resolver: zodResolver(orathonSchema),
  })

  const onSubmit = async (data: OrathonFormData) => {
    setIsSubmitting(true)
    
    try {
      // Use the new Orathon registration API endpoint
      const response = await fetch('/api/orathon/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          country: data.country,
          city: data.city,
          emergencyContactName: data.emergencyContact,
          emergencyContactPhone: data.emergencyPhone,
          medicalConditions: data.medicalConditions,
          fitnessLevel: data.fitnessLevel,
          tshirtSize: data.tshirtSize,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      showToast.success('Orathon registration submitted successfully!')
      setIsSuccess(true)
      reset()
    } catch (error: any) {
      showToast.error('Failed to submit registration. Please try again.')
      console.error('Orathon registration error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheck className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Registration Successful!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for registering for the SARSYC VI Orathon. You'll receive a confirmation email shortly with further details.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/" className="btn-outline">
                  Back to Homepage
                </a>
                <a href="/participate/register" className="btn-primary">
                  Register for Conference
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              SARSYC VI Orathon
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Post-Conference Activity - Day 4
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <FiCalendar className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">August 8, 2026</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <FiMapPin className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">Windhoek, Namibia</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <FiUsers className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">Open to All</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Orathon */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="section-title">Join the Orathon</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Continue the momentum from SARSYC VI with our post-conference Orathon. This unique event provides 
              an opportunity to extend engagement, build deeper connections, and take action beyond the formal 
              conference sessions.
            </p>
            <p className="text-gray-600 mt-4">
              <strong>Date:</strong> August 8, 2026 (Day 4)<br />
              <strong>Location:</strong> Windhoek, Namibia<br />
              <strong>Registration Required:</strong> Yes
            </p>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
                Register for Orathon
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Personal Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        {...register('firstName')}
                        type="text"
                        id="firstName"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        {...register('lastName')}
                        type="text"
                        id="lastName"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        id="email"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        id="phone"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth *
                      </label>
                      <input
                        {...register('dateOfBirth')}
                        type="date"
                        id="dateOfBirth"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.dateOfBirth && (
                        <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                      </label>
                      <select
                        {...register('gender')}
                        id="gender"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.gender ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                      {errors.gender && (
                        <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                        Organization *
                      </label>
                      <input
                        {...register('organization')}
                        type="text"
                        id="organization"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.organization ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.organization && (
                        <p className="mt-1 text-sm text-red-600">{errors.organization.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <select
                        {...register('country')}
                        id="country"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.country ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select country</option>
                        {countries.map((country) => (
                          <option key={country.value} value={country.value}>
                            {country.label}
                          </option>
                        ))}
                      </select>
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      {...register('city')}
                      type="text"
                      id="city"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Emergency Contact
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Name *
                      </label>
                      <input
                        {...register('emergencyContact')}
                        type="text"
                        id="emergencyContact"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.emergencyContact ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.emergencyContact && (
                        <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Phone *
                      </label>
                      <input
                        {...register('emergencyPhone')}
                        type="tel"
                        id="emergencyPhone"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.emergencyPhone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.emergencyPhone && (
                        <p className="mt-1 text-sm text-red-600">{errors.emergencyPhone.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Additional Information
                  </h3>
                  
                  <div>
                    <label htmlFor="medicalConditions" className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Conditions or Allergies
                    </label>
                    <textarea
                      {...register('medicalConditions')}
                      id="medicalConditions"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Please list any medical conditions or allergies we should be aware of..."
                    />
                  </div>

                  <div>
                    <label htmlFor="dietaryRequirements" className="block text-sm font-medium text-gray-700 mb-2">
                      Dietary Requirements
                    </label>
                    <textarea
                      {...register('dietaryRequirements')}
                      id="dietaryRequirements"
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Vegetarian, vegan, halal, kosher, allergies, etc."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fitnessLevel" className="block text-sm font-medium text-gray-700 mb-2">
                        Fitness Level *
                      </label>
                      <select
                        {...register('fitnessLevel')}
                        id="fitnessLevel"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.fitnessLevel ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select fitness level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                      {errors.fitnessLevel && (
                        <p className="mt-1 text-sm text-red-600">{errors.fitnessLevel.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="tshirtSize" className="block text-sm font-medium text-gray-700 mb-2">
                        T-Shirt Size *
                      </label>
                      <select
                        {...register('tshirtSize')}
                        id="tshirtSize"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.tshirtSize ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select size</option>
                        <option value="xs">XS - Extra Small</option>
                        <option value="s">S - Small</option>
                        <option value="m">M - Medium</option>
                        <option value="l">L - Large</option>
                        <option value="xl">XL - Extra Large</option>
                        <option value="xxl">XXL - Extra Extra Large</option>
                      </select>
                      {errors.tshirtSize && (
                        <p className="mt-1 text-sm text-red-600">{errors.tshirtSize.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="pt-6 border-t border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      {...register('agreeToTerms')}
                      type="checkbox"
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the terms and conditions and understand that participation in the Orathon is at my own risk. *
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <FiLoader className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-5 h-5" />
                        Register for Orathon
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
