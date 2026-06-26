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
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-5 md:py-6">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Get in Touch
            </h1>
            <p className="text-lg text-white/90">
              We'd love to hear from you. Reach out with any questions about SARSYC VI.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-8 md:py-10 bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/sarsyc-group.jpg')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/75 to-slate-900/90" aria-hidden />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-2xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>

                {isSuccess ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-green-500/20 border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiSend className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-white/70">We'll get back to you within 24-48 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-white/80 mb-2">
                          First Name *
                        </label>
                        <input
                          {...register('firstName')}
                          type="text"
                          id="firstName"
                          className={`w-full px-4 py-3 rounded-lg border bg-white/95 text-gray-900 ${
                            errors.firstName ? 'border-red-500' : 'border-white/20'
                          } focus:outline-none focus:ring-2 focus:ring-primary-400`}
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-300">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-white/80 mb-2">
                          Last Name *
                        </label>
                        <input
                          {...register('lastName')}
                          type="text"
                          id="lastName"
                          className={`w-full px-4 py-3 rounded-lg border bg-white/95 text-gray-900 ${
                            errors.lastName ? 'border-red-500' : 'border-white/20'
                          } focus:outline-none focus:ring-2 focus:ring-primary-400`}
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-300">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                        Email Address *
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        id="email"
                        className={`w-full px-4 py-3 rounded-lg border bg-white/95 text-gray-900 ${
                          errors.email ? 'border-red-500' : 'border-white/20'
                        } focus:outline-none focus:ring-2 focus:ring-primary-400`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-300">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-white/80 mb-2">
                        Subject *
                      </label>
                      <select
                        {...register('subject')}
                        id="subject"
                        className={`w-full px-4 py-3 rounded-lg border bg-white/95 text-gray-900 ${
                          errors.subject ? 'border-red-500' : 'border-white/20'
                        } focus:outline-none focus:ring-2 focus:ring-primary-400`}
                      >
                        {subjectOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-300">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
                        Message *
                      </label>
                      <textarea
                        {...register('message')}
                        id="message"
                        rows={6}
                        className={`w-full px-4 py-3 rounded-lg border bg-white/95 text-gray-900 ${
                          errors.message ? 'border-red-500' : 'border-white/20'
                        } focus:outline-none focus:ring-2 focus:ring-primary-400`}
                        placeholder="How can we help you?"
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-300">{errors.message.message}</p>
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
            <div className="space-y-5">
              {/* Contact Details */}
              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-xl p-6 md:p-8 transition-all duration-500 hover:border-primary-400/30 hover:bg-white/15">
                <h3 className="font-bold text-white mb-5">Contact Information</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-primary-500/30 border border-primary-400/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiMail className="w-5 h-5 text-primary-300" />
                    </div>
                    <div>
                      <p className="font-medium text-white mb-1">Registration Enquiries</p>
                      <a href="mailto:sarsyc@saywhat.org.zw" className="text-primary-300 hover:text-amber-300 transition-colors">
                        sarsyc@saywhat.org.zw
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-primary-500/30 border border-primary-400/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiMail className="w-5 h-5 text-primary-300" />
                    </div>
                    <div>
                      <p className="font-medium text-white mb-1">Research Inquiries</p>
                      <a href="mailto:researchunit@saywhat.org.zw" className="text-primary-300 hover:text-amber-300 transition-colors">
                        researchunit@saywhat.org.zw
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-primary-500/30 border border-primary-400/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiPhone className="w-5 h-5 text-primary-300" />
                    </div>
                    <div>
                      <p className="font-medium text-white mb-1">Phone</p>
                      <div className="space-y-1">
                        <a href="tel:+263782702887" className="block text-primary-300 hover:text-amber-300 transition-colors">
                          +263 78 270 2887 (Zimbabwe)
                        </a>
                        <a href="tel:+264816279224" className="block text-primary-300 hover:text-amber-300 transition-colors">
                          +264 81 627 9224 (Namibia)
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-primary-500/30 border border-primary-400/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiMapPin className="w-5 h-5 text-primary-300" />
                    </div>
                    <div>
                      <p className="font-medium text-white mb-1">Address</p>
                      <p className="text-white/70 text-sm">
                        SAYWHAT Secretariat<br />
                        Windhoek, Namibia
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-xl p-6 md:p-8 transition-all duration-500 hover:border-primary-400/30 hover:bg-white/15">
                <h3 className="font-bold text-white mb-5">Follow Us</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="https://facebook.com/saywhat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-3 rounded-lg border border-white/15 bg-white/5 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all group"
                  >
                    <FiFacebook className="w-7 h-7 text-white/60 group-hover:text-blue-400 mb-2" />
                    <span className="text-sm font-medium text-white/80">Facebook</span>
                  </a>
                  <a
                    href="https://twitter.com/saywhat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-3 rounded-lg border border-white/15 bg-white/5 hover:border-sky-400/50 hover:bg-sky-500/10 transition-all group"
                  >
                    <FiTwitter className="w-7 h-7 text-white/60 group-hover:text-sky-400 mb-2" />
                    <span className="text-sm font-medium text-white/80">Twitter</span>
                  </a>
                  <a
                    href="https://instagram.com/saywhat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-3 rounded-lg border border-white/15 bg-white/5 hover:border-pink-400/50 hover:bg-pink-500/10 transition-all group"
                  >
                    <FiInstagram className="w-7 h-7 text-white/60 group-hover:text-pink-400 mb-2" />
                    <span className="text-sm font-medium text-white/80">Instagram</span>
                  </a>
                  <a
                    href="https://linkedin.com/company/saywhat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-3 rounded-lg border border-white/15 bg-white/5 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all group"
                  >
                    <FiLinkedin className="w-7 h-7 text-white/60 group-hover:text-blue-400 mb-2" />
                    <span className="text-sm font-medium text-white/80">LinkedIn</span>
                  </a>
                </div>
              </div>

              {/* Office Hours */}
              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5 md:p-6">
                <h4 className="font-semibold text-white mb-3">Office Hours</h4>
                <p className="text-sm text-white/70">
                  <strong className="text-white/90">Monday - Friday:</strong> 8:00 AM - 5:00 PM (GMT+2)<br />
                  <strong className="text-white/90">Saturday:</strong> Closed<br />
                  <strong className="text-white/90">Sunday:</strong> Closed
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}






