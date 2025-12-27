'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiMail, FiPhone, FiMapPin, FiSend, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi'
import { showToast } from '@/lib/toast'

const contactSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.enum(['general', 'registration', 'abstract', 'partnership', 'media', 'technical', 'other']),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

const subjectOptions = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'registration', label: 'Registration Support' },
  { value: 'abstract', label: 'Abstract Submission' },
  { value: 'partnership', label: 'Partnership Inquiry' },
  { value: 'media', label: 'Media Inquiry' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'other', label: 'Other' },
]

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      subject: 'general',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message')
      }

      showToast.success(result.message || 'Message sent successfully!')
      setIsSuccess(true)
      reset()
    } catch (error: any) {
      showToast.error(error.message || 'Failed to send message. Please try again.')
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
              Get in Touch
            </h1>
            <p className="text-xl text-white/90">
              We'd love to hear from you. Reach out with any questions about SARSYC VI.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>

                {isSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiSend className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600">We'll get back to you within 24-48 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          {...register('firstName')}
                          type="text"
                          id="firstName"
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.firstName ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
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
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.lastName ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

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
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        {...register('subject')}
                        id="subject"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.subject ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      >
                        {subjectOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        {...register('message')}
                        id="message"
                        rows={6}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.message ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        placeholder="How can we help you?"
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                      <FiSend />
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Contact Details */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="font-bold text-gray-900 mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiMail className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Email</p>
                      <a href="mailto:info@sarsyc.org" className="text-primary-600 hover:underline">
                        info@sarsyc.org
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiPhone className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Phone</p>
                      <a href="tel:+264000000000" className="text-primary-600 hover:underline">
                        +264 (0) 00 000 0000
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiMapPin className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Address</p>
                      <p className="text-gray-600 text-sm">
                        SAYWHAT Secretariat<br />
                        Windhoek, Namibia
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="font-bold text-gray-900 mb-6">Follow Us</h3>
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href="https://facebook.com/saywhat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
                  >
                    <FiFacebook className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                    <span className="text-sm font-medium">Facebook</span>
                  </a>
                  <a
                    href="https://twitter.com/saywhat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-sky-500 hover:bg-sky-50 transition-all group"
                  >
                    <FiTwitter className="w-8 h-8 text-gray-400 group-hover:text-sky-500 mb-2" />
                    <span className="text-sm font-medium">Twitter</span>
                  </a>
                  <a
                    href="https://instagram.com/saywhat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-pink-600 hover:bg-pink-50 transition-all group"
                  >
                    <FiInstagram className="w-8 h-8 text-gray-400 group-hover:text-pink-600 mb-2" />
                    <span className="text-sm font-medium">Instagram</span>
                  </a>
                  <a
                    href="https://linkedin.com/company/saywhat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-blue-700 hover:bg-blue-50 transition-all group"
                  >
                    <FiLinkedin className="w-8 h-8 text-gray-400 group-hover:text-blue-700 mb-2" />
                    <span className="text-sm font-medium">LinkedIn</span>
                  </a>
                </div>
              </div>

              {/* Office Hours */}
              <div className="bg-primary-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Office Hours</h4>
                <p className="text-sm text-gray-700">
                  <strong>Monday - Friday:</strong> 8:00 AM - 5:00 PM (GMT+2)<br />
                  <strong>Saturday:</strong> Closed<br />
                  <strong>Sunday:</strong> Closed
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}






