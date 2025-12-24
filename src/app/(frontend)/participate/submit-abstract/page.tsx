'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiFileText, FiUser, FiCheck, FiUpload, FiArrowRight, FiArrowLeft } from 'react-icons/fi'

const abstractSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  abstract: z.string().min(100, 'Abstract must be at least 100 words').max(2000, 'Abstract must not exceed 300 words'),
  keywords: z.string().min(1, 'Please provide at least 3 keywords'),
  track: z.enum(['srhr', 'education', 'advocacy', 'innovation'], {
    required_error: 'Please select a conference track',
  }),
  primaryAuthor: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    organization: z.string().min(2),
    country: z.string().min(2),
  }),
  presentationType: z.enum(['oral', 'poster', 'either']),
})

type AbstractFormData = z.infer<typeof abstractSchema>

const tracks = [
  { value: 'srhr', label: 'Track 1: Youth Sexual & Reproductive Health', color: 'from-blue-500 to-blue-600' },
  { value: 'education', label: 'Track 2: Education & Skills Development', color: 'from-purple-500 to-purple-600' },
  { value: 'advocacy', label: 'Track 3: Advocacy & Policy Influence', color: 'from-pink-500 to-pink-600' },
  { value: 'innovation', label: 'Track 4: Innovation & Technology for Youth', color: 'from-orange-500 to-orange-600' },
]

export default function SubmitAbstractPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submissionId, setSubmissionId] = useState('')
  const [wordCount, setWordCount] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm<AbstractFormData>({
    resolver: zodResolver(abstractSchema),
    mode: 'onChange',
  })

  const abstractText = watch('abstract')

  // Update word count
  useState(() => {
    if (abstractText) {
      const words = abstractText.trim().split(/\s+/).length
      setWordCount(words)
    } else {
      setWordCount(0)
    }
  })

  const onSubmit = async (data: AbstractFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/abstracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        setSubmissionId(result.doc.submissionId)
        setIsSuccess(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        alert('Submission failed. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: any[] = []
    
    if (currentStep === 1) {
      fieldsToValidate = ['title', 'abstract', 'keywords', 'track']
    } else if (currentStep === 2) {
      fieldsToValidate = ['primaryAuthor']
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
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
                Abstract Submitted Successfully!
              </h1>
              <div className="bg-primary-50 rounded-lg p-6 mb-8">
                <p className="text-sm text-gray-600 mb-2">Your Submission ID</p>
                <p className="text-2xl font-bold text-primary-600">{submissionId}</p>
              </div>
              <div className="text-left bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">What Happens Next?</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>You'll receive a confirmation email shortly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Review process: 2-4 weeks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Decision by: June 30, 2026</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Check your email for updates</span>
                  </li>
                </ul>
              </div>
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Submit Your Abstract
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Share your research at SARSYC VI
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-red-600 font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Deadline: June 30, 2026, 11:59 PM
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">Submission Guidelines</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Abstract should be <strong>200-300 words</strong></li>
              <li>• Select the most appropriate conference track</li>
              <li>• Provide 3-5 keywords</li>
              <li>• Include all co-authors</li>
              <li>• Review process takes 2-4 weeks</li>
            </ul>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Abstract Details */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Abstract Details</h2>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Abstract Title *
                    </label>
                    <input
                      {...register('title')}
                      type="text"
                      id="title"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Enter your research title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-2">
                      Abstract (200-300 words) *
                    </label>
                    <textarea
                      {...register('abstract')}
                      id="abstract"
                      rows={10}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.abstract ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Enter your abstract text here..."
                    />
                    <div className="flex justify-between mt-2">
                      <div>
                        {errors.abstract && (
                          <p className="text-sm text-red-600">{errors.abstract.message}</p>
                        )}
                      </div>
                      <p className={`text-sm ${wordCount > 300 ? 'text-red-600' : 'text-gray-600'}`}>
                        {wordCount} words
                      </p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                      Keywords (3-5, comma-separated) *
                    </label>
                    <input
                      {...register('keywords')}
                      type="text"
                      id="keywords"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.keywords ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="e.g., youth health, reproductive rights, education"
                    />
                    {errors.keywords && (
                      <p className="mt-1 text-sm text-red-600">{errors.keywords.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Conference Track *
                    </label>
                    <div className="space-y-3">
                      {tracks.map((track) => (
                        <label
                          key={track.value}
                          className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                        >
                          <input
                            {...register('track')}
                            type="radio"
                            value={track.value}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <div className="ml-3 flex-1">
                            <div className={`inline-block bg-gradient-to-r ${track.color} text-white text-xs font-bold px-2 py-1 rounded-full mb-1`}>
                              {track.label.split(':')[0]}
                            </div>
                            <div className="font-medium text-gray-900">{track.label.split(': ')[1]}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.track && (
                      <p className="mt-2 text-sm text-red-600">{errors.track.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preferred Presentation Type *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'oral', label: 'Oral Presentation' },
                        { value: 'poster', label: 'Poster' },
                        { value: 'either', label: 'Either' },
                      ].map((type) => (
                        <label key={type.value} className="cursor-pointer">
                          <input
                            {...register('presentationType')}
                            type="radio"
                            value={type.value}
                            className="sr-only peer"
                          />
                          <div className="text-center px-4 py-3 border-2 border-gray-300 rounded-lg peer-checked:border-primary-600 peer-checked:bg-primary-50 peer-checked:text-primary-600 font-medium transition-all">
                            {type.label}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Author Information */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Primary Author Information</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        {...register('primaryAuthor.firstName')}
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        {...register('primaryAuthor.lastName')}
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      {...register('primaryAuthor.email')}
                      type="email"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization/Institution *
                    </label>
                    <input
                      {...register('primaryAuthor.organization')}
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      {...register('primaryAuthor.country')}
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Submission</h2>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Title</p>
                      <p className="font-medium">{watch('title')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Track</p>
                      <p className="font-medium">
                        {tracks.find((t) => t.value === watch('track'))?.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Primary Author</p>
                      <p className="font-medium">
                        {watch('primaryAuthor.firstName')} {watch('primaryAuthor.lastName')}
                      </p>
                      <p className="text-sm text-gray-600">{watch('primaryAuthor.email')}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> After submission, you'll receive a confirmation email with your submission ID.
                      Decisions will be communicated by June 30, 2026.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                {currentStep > 1 && (
                  <button type="button" onClick={prevStep} className="btn-outline flex items-center gap-2">
                    <FiArrowLeft /> Previous
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button type="button" onClick={nextStep} className="btn-primary ml-auto flex items-center gap-2">
                    Next <FiArrowRight />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary ml-auto flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Abstract'} <FiCheck />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}



