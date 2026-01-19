'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiFileText, FiUser, FiCheck, FiUpload, FiArrowRight, FiArrowLeft, FiX, FiEdit2, FiPlus } from 'react-icons/fi'
import { countries } from '@/lib/countries'
import { showToast } from '@/lib/toast'

const abstractSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  abstract: z.string().min(100, 'Abstract must be at least 100 words').max(2000, 'Abstract must not exceed 300 words'),
  keywords: z.string().min(1, 'Please provide at least 3 keywords'),
  track: z.enum(['education-rights', 'hiv-aids', 'ncd-prevention', 'digital-health', 'mental-health'], {
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
  coAuthors: z.array(z.object({
    name: z.string().min(2, 'Name is required'),
    organization: z.string().optional(),
  })).optional(),
  presentationType: z.enum(['oral', 'poster', 'either']),
  abstractFile: z.any().optional(),
})

type AbstractFormData = z.infer<typeof abstractSchema>

const tracks = [
  { value: 'education-rights', label: 'Track 1: Education Rights and Equity', color: 'from-blue-500 to-blue-600' },
  { value: 'hiv-aids', label: 'Track 2: HIV/AIDS, STIs and Vulnerable Groups', color: 'from-purple-500 to-purple-600' },
  { value: 'ncd-prevention', label: 'Track 3: Non-Communicable Diseases (NCDs) Prevention and Health Lifestyles', color: 'from-pink-500 to-pink-600' },
  { value: 'digital-health', label: 'Track 4: Digital Health and Safety', color: 'from-orange-500 to-orange-600' },
  { value: 'mental-health', label: 'Track 5: Mental Health and Substance Abuse', color: 'from-green-500 to-green-600' },
]

export default function SubmitAbstractPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submissionId, setSubmissionId] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [abstractFile, setAbstractFile] = useState<File | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
    control,
  } = useForm<AbstractFormData>({
    resolver: zodResolver(abstractSchema),
    mode: 'onChange',
    defaultValues: {
      coAuthors: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'coAuthors',
  })

  const abstractText = watch('abstract')
  const formData = watch()

  // Update word count
  useEffect(() => {
    if (abstractText) {
      const words = abstractText.trim().split(/\s+/).filter(word => word.length > 0).length
      setWordCount(words)
    } else {
      setWordCount(0)
    }
  }, [abstractText])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        showToast.error('Please upload a PDF or Word document')
        return
      }
      // Validate file size (100MB max for blob storage with chunking)
      if (file.size > 100 * 1024 * 1024) {
        showToast.error('File size must be less than 100MB')
        return
      }
      setAbstractFile(file)
      setValue('abstractFile', file)
    }
  }

  const onSubmit = async (data: AbstractFormData) => {
    setIsSubmitting(true)
    
    try {
      // CLIENT-SIDE UPLOAD: Upload abstract file to blob storage first (if provided)
      let abstractFileUrl: string | null = null
      if (abstractFile) {
        try {
          showToast.loading('Uploading abstract file...')
          console.log('📤 Uploading abstract file to blob storage...', {
            name: abstractFile.name,
            size: abstractFile.size,
            type: abstractFile.type,
          })

          // Upload to dedicated upload endpoint
          const uploadFormData = new FormData()
          uploadFormData.append('file', abstractFile)
          if (data.track) {
            uploadFormData.append('track', data.track)
          }
          if (data.primaryAuthor?.email) {
            uploadFormData.append('email', data.primaryAuthor.email)
          }
          if (data.title) {
            uploadFormData.append('title', data.title)
          }

          const uploadResponse = await fetch('/api/upload/abstract', {
            method: 'POST',
            body: uploadFormData,
          })

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({}))
            throw new Error(errorData.error || 'Upload failed')
          }

          const uploadResult = await uploadResponse.json()
          abstractFileUrl = uploadResult.url
          console.log('✅ Abstract file uploaded to Vercel Blob:', abstractFileUrl)
          showToast.success('Abstract file uploaded successfully!')
        } catch (uploadError: any) {
          console.error('❌ Abstract upload error:', uploadError)
          showToast.error(`Failed to upload file: ${uploadError.message}`)
          setIsSubmitting(false)
          return
        }
      }

      // Now submit the abstract data with the file URL
      const response = await fetch('/api/abstracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          abstractFileUrl: abstractFileUrl, // Send the blob URL instead
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setSubmissionId(result.doc.submissionId)
        setIsSuccess(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        showToast.success('Abstract submitted successfully!')
      } else {
        const errorData = await response.json().catch(() => ({}))
        showToast.error(errorData.error || 'Submission failed. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      showToast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: any[] = []
    
    if (currentStep === 1) {
      fieldsToValidate = ['title', 'abstract', 'keywords', 'track', 'presentationType']
    } else if (currentStep === 2) {
      fieldsToValidate = ['primaryAuthor']
    } else if (currentStep === 3) {
      // Co-authors step - no validation needed as it's optional
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setShowPreview(false)
    }
  }

  const editField = (step: number) => {
    setCurrentStep(step)
    setShowPreview(false)
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
                    <span>Notification by: May 31, 2026</span>
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
              Deadline: April 30, 2026, 11:59 PM
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep >= step 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {currentStep > step ? <FiCheck className="w-5 h-5" /> : step}
                    </div>
                    <p className="text-xs mt-2 text-gray-600 hidden sm:block">
                      {step === 1 && 'Abstract'}
                      {step === 2 && 'Author'}
                      {step === 3 && 'Co-Authors'}
                      {step === 4 && 'Review'}
                    </p>
                  </div>
                  {step < 4 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">Submission Guidelines</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Abstract should be <strong>200-300 words</strong></li>
              <li>• Select the most appropriate conference track</li>
              <li>• Provide 3-5 keywords</li>
              <li>• Include all co-authors (optional)</li>
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
                      <p className={`text-sm ${wordCount > 300 ? 'text-red-600' : wordCount < 200 ? 'text-yellow-600' : 'text-gray-600'}`}>
                        {wordCount} words {wordCount < 200 && '(minimum 200)'}
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
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.primaryAuthor?.firstName ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                      {errors.primaryAuthor?.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.primaryAuthor.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        {...register('primaryAuthor.lastName')}
                        type="text"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.primaryAuthor?.lastName ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                      {errors.primaryAuthor?.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.primaryAuthor.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        {...register('primaryAuthor.email')}
                        type="email"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.primaryAuthor?.email ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                      {errors.primaryAuthor?.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.primaryAuthor.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        {...register('primaryAuthor.phone')}
                        type="tel"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization/Institution *
                    </label>
                    <input
                      {...register('primaryAuthor.organization')}
                      type="text"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.primaryAuthor?.organization ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    />
                    {errors.primaryAuthor?.organization && (
                      <p className="mt-1 text-sm text-red-600">{errors.primaryAuthor.organization.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <select
                      {...register('primaryAuthor.country')}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.primaryAuthor?.country ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white`}
                    >
                      <option value="">Select country</option>
                      {countries.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                    {errors.primaryAuthor?.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.primaryAuthor.country.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Co-Authors */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Co-Authors (Optional)</h2>
                    <button
                      type="button"
                      onClick={() => append({ name: '', organization: '' })}
                      className="btn-outline flex items-center gap-2 text-sm"
                    >
                      <FiPlus /> Add Co-Author
                    </button>
                  </div>

                  {fields.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No co-authors added yet</p>
                      <button
                        type="button"
                        onClick={() => append({ name: '', organization: '' })}
                        className="btn-outline"
                      >
                        Add First Co-Author
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="font-medium text-gray-900">Co-Author {index + 1}</h3>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name *
                              </label>
                              <input
                                {...register(`coAuthors.${index}.name`)}
                                type="text"
                                className={`w-full px-4 py-2 rounded-lg border ${
                                  errors.coAuthors?.[index]?.name ? 'border-red-500' : 'border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                placeholder="Full name"
                              />
                              {errors.coAuthors?.[index]?.name && (
                                <p className="mt-1 text-xs text-red-600">{errors.coAuthors[index]?.name?.message}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Organization (Optional)
                              </label>
                              <input
                                {...register(`coAuthors.${index}.organization`)}
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Organization name"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Optional File Upload */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Abstract Document (Optional)
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      PDF or Word document (max 5MB). This is optional - you can submit without uploading a file.
                    </p>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="btn-outline flex items-center gap-2">
                          <FiUpload /> Choose File
                        </div>
                      </label>
                      {abstractFile && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiFileText className="w-4 h-4" />
                          <span>{abstractFile.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setAbstractFile(null)
                              setValue('abstractFile', undefined)
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Submission</h2>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                    {/* Abstract Details */}
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">Abstract Details</h3>
                        <button
                          type="button"
                          onClick={() => editField(1)}
                          className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
                        >
                          <FiEdit2 className="w-4 h-4" /> Edit
                        </button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Title:</span>
                          <p className="font-medium text-gray-900 mt-1">{formData.title}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Track:</span>
                          <p className="font-medium text-gray-900 mt-1">
                            {tracks.find((t) => t.value === formData.track)?.label}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Presentation Type:</span>
                          <p className="font-medium text-gray-900 mt-1 capitalize">
                            {formData.presentationType === 'oral' && 'Oral Presentation'}
                            {formData.presentationType === 'poster' && 'Poster Presentation'}
                            {formData.presentationType === 'either' && 'Either'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Keywords:</span>
                          <p className="font-medium text-gray-900 mt-1">{formData.keywords}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Abstract ({wordCount} words):</span>
                          <p className="text-gray-700 mt-1 whitespace-pre-wrap">{formData.abstract}</p>
                        </div>
                      </div>
                    </div>

                    {/* Primary Author */}
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">Primary Author</h3>
                        <button
                          type="button"
                          onClick={() => editField(2)}
                          className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
                        >
                          <FiEdit2 className="w-4 h-4" /> Edit
                        </button>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium text-gray-900">
                          {formData.primaryAuthor?.firstName} {formData.primaryAuthor?.lastName}
                        </p>
                        <p className="text-gray-600">{formData.primaryAuthor?.email}</p>
                        {formData.primaryAuthor?.phone && (
                          <p className="text-gray-600">{formData.primaryAuthor.phone}</p>
                        )}
                        <p className="text-gray-600">{formData.primaryAuthor?.organization}</p>
                        <p className="text-gray-600">
                          {countries.find(c => c.value === formData.primaryAuthor?.country)?.label || formData.primaryAuthor?.country}
                        </p>
                      </div>
                    </div>

                    {/* Co-Authors */}
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">
                          Co-Authors {formData.coAuthors && formData.coAuthors.length > 0 && `(${formData.coAuthors.length})`}
                        </h3>
                        <button
                          type="button"
                          onClick={() => editField(3)}
                          className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
                        >
                          <FiEdit2 className="w-4 h-4" /> Edit
                        </button>
                      </div>
                      {formData.coAuthors && formData.coAuthors.length > 0 ? (
                        <div className="space-y-2 text-sm">
                          {formData.coAuthors.map((author, index) => (
                            <div key={index} className="text-gray-700">
                              <span className="font-medium">{author.name}</span>
                              {author.organization && (
                                <span className="text-gray-600"> - {author.organization}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No co-authors added</p>
                      )}
                    </div>

                    {/* File Upload */}
                    {abstractFile && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">Uploaded File</h3>
                          <button
                            type="button"
                            onClick={() => editField(3)}
                            className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
                          >
                            <FiEdit2 className="w-4 h-4" /> Edit
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FiFileText className="w-4 h-4" />
                          <span>{abstractFile.name}</span>
                          <span className="text-gray-500">
                            ({(abstractFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> After submission, you'll receive a confirmation email with your submission ID.
                      Decisions will be communicated by May 31, 2026.
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
                
                {currentStep < 4 ? (
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
