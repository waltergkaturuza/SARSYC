'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiCheck, FiUsers, FiAward, FiHeart, FiCalendar } from 'react-icons/fi'
import { countries } from '@/lib/countries'

const volunteerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  country: z.string().min(2),
  organization: z.string().optional(),
  availability: z.array(z.string()).min(1, 'Select at least one day'),
  roles: z.array(z.string()).min(1, 'Select at least one role'),
  experience: z.string().optional(),
  motivation: z.string().min(50, 'Please explain why you want to volunteer (min 50 characters)'),
})

type VolunteerFormData = z.infer<typeof volunteerSchema>

const volunteerRoles = [
  { value: 'registration', label: 'Registration Desk', description: 'Help participants check in and get their materials' },
  { value: 'logistics', label: 'Logistics Support', description: 'Assist with session setup, signage, and general logistics' },
  { value: 'social-media', label: 'Social Media', description: 'Live tweet, take photos, create content' },
  { value: 'hospitality', label: 'Hospitality', description: 'Welcome guests, answer questions, provide directions' },
  { value: 'technical', label: 'Technical Support', description: 'Help with AV equipment, presentations, tech issues' },
  { value: 'translation', label: 'Translation/Interpretation', description: 'Provide language support (if bilingual)' },
]

const benefits = [
  { icon: FiAward, title: 'Certificate of Participation', description: 'Official volunteer certificate' },
  { icon: FiUsers, title: 'Networking Opportunities', description: 'Meet leaders and make connections' },
  { icon: FiHeart, title: 'Conference Access', description: 'Attend sessions during breaks' },
  { icon: FiCalendar, title: 'Meals Provided', description: 'Lunch and refreshments included' },
]

export default function VolunteerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
  })

  const onSubmit = async (data: VolunteerFormData) => {
    setIsSubmitting(true)
    // TODO: Submit to API
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSuccess(true)
    setIsSubmitting(false)
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Application Received!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for your interest in volunteering at SARSYC VI! We'll review your application and get back to you within 2 weeks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/" className="btn-outline">Back to Homepage</a>
                <a href="/participate/register" className="btn-primary">Register as Participant</a>
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
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Volunteer at SARSYC VI
            </h1>
            <p className="text-xl text-white/90">
              Be part of the team that makes SARSYC VI an unforgettable experience for 500+ participants
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-white">
        <div className="container-custom">
          <h2 className="section-title">Why Volunteer?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="card p-6 text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Volunteer Application
              </h2>
              <p className="text-gray-600">
                Fill out the form below to apply. We'll contact you within 2 weeks.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <input
                        {...register('firstName')}
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <input
                        {...register('lastName')}
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input {...register('email')} type="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input {...register('phone')} type="tel" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <select
                      {...register('country')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                      <option value="">Select country</option>
                      {countries.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organization/University</label>
                    <input {...register('organization')} type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Availability</h3>
                  <p className="text-sm text-gray-600 mb-3">Which days can you volunteer?</p>
                  <div className="space-y-2">
                    {['August 4 (Setup Day)', 'August 5 (Day 1)', 'August 6 (Day 2)', 'August 7 (Day 3)', 'August 8 (Cleanup)'].map((day) => (
                      <label key={day} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input {...register('availability')} type="checkbox" value={day} className="text-primary-600 focus:ring-primary-500 rounded" />
                        <span className="ml-3 text-gray-700">{day}</span>
                      </label>
                    ))}
                  </div>
                  {errors.availability && <p className="mt-2 text-sm text-red-600">{errors.availability.message}</p>}
                </div>

                {/* Roles */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Volunteer Roles</h3>
                  <p className="text-sm text-gray-600 mb-3">Select all roles you're interested in:</p>
                  <div className="space-y-3">
                    {volunteerRoles.map((role) => (
                      <label key={role.value} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input {...register('roles')} type="checkbox" value={role.value} className="mt-1 text-primary-600 focus:ring-primary-500 rounded" />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{role.label}</div>
                          <div className="text-sm text-gray-600">{role.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.roles && <p className="mt-2 text-sm text-red-600">{errors.roles.message}</p>}
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Volunteer Experience (Optional)
                  </label>
                  <textarea
                    {...register('experience')}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Tell us about any relevant volunteer experience..."
                  />
                </div>

                {/* Motivation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why do you want to volunteer at SARSYC VI? *
                  </label>
                  <textarea
                    {...register('motivation')}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Share your motivation..."
                  />
                  {errors.motivation && <p className="mt-1 text-sm text-red-600">{errors.motivation.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-4 text-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

