'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiCheck, FiUsers, FiAward, FiHeart, FiCalendar, FiChevronRight, FiChevronLeft, FiUpload, FiX, FiFileText } from 'react-icons/fi'
import { countries } from '@/lib/countries'
import { showToast } from '@/lib/toast'

// Comprehensive validation schema
const volunteerSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().optional(),
  
  // Education
  education: z.array(z.object({
    level: z.string().min(1, 'Education level is required'),
    field: z.string().min(2, 'Field of study is required'),
    institution: z.string().min(2, 'Institution name is required'),
    year: z.number().min(1900).max(new Date().getFullYear() + 5),
    currentlyStudying: z.boolean().optional(),
  })).min(1, 'At least one education entry is required'),
  
  // Skills
  skills: z.object({
    technical: z.array(z.object({
      skill: z.string().min(1),
      proficiency: z.string().min(1),
    })).optional(),
    soft: z.array(z.object({
      skill: z.string().min(1),
      proficiency: z.string().min(1),
    })).optional(),
    languages: z.array(z.object({
      language: z.string().min(1, 'Language is required'),
      proficiency: z.string().min(1, 'Proficiency is required'),
    })).min(1, 'At least one language is required'),
  }),
  
  // Work Experience
  workExperience: z.array(z.object({
    position: z.string().min(1),
    organization: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().optional(),
    currentlyWorking: z.boolean().optional(),
    description: z.string().optional(),
  })).optional(),
  
  // Volunteer Experience
  volunteerExperience: z.array(z.object({
    organization: z.string().min(1),
    role: z.string().min(1),
    date: z.string().min(1),
    description: z.string().optional(),
  })).optional(),
  
  // Volunteer Preferences
  preferredRoles: z.array(z.string()).min(1, 'Select at least one preferred role'),
  availability: z.object({
    days: z.array(z.string()).min(1, 'Select at least one available day'),
    timePreference: z.string().optional(),
    hoursAvailable: z.number().optional(),
  }),
  
  // Additional Information
  motivation: z.string().min(100, 'Motivation statement must be at least 100 characters'),
  specialSkills: z.string().optional(),
  specialAccommodations: z.string().optional(),
  
  // References
  references: z.array(z.object({
    name: z.string().min(2),
    relationship: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    organization: z.string().optional(),
  })).min(2, 'At least 2 references are required').max(3),
  
  // Emergency Contact
  emergencyContact: z.object({
    name: z.string().min(2, 'Emergency contact name is required'),
    relationship: z.string().min(2, 'Relationship is required'),
    phone: z.string().min(10, 'Phone number is required'),
    email: z.string().email().optional(),
  }),
  
  // Documents
  cv: z.string().optional(),
  coverLetter: z.string().optional(),
  
  // Consents
  consents: z.object({
    backgroundCheck: z.boolean().refine(val => val === true, 'Background check consent is required'),
    photoRelease: z.boolean().refine(val => val === true, 'Photo release consent is required'),
    dataProcessing: z.boolean().refine(val => val === true, 'Data processing consent is required'),
    termsAccepted: z.boolean().refine(val => val === true, 'Terms and conditions must be accepted'),
  }),
})

type VolunteerFormData = z.infer<typeof volunteerSchema>

const volunteerRoles = [
  { value: 'registration', label: 'Registration Desk', description: 'Help participants check in and get their materials' },
  { value: 'logistics', label: 'Logistics Support', description: 'Assist with session setup, signage, and general logistics' },
  { value: 'social-media', label: 'Social Media', description: 'Live tweet, take photos, create content' },
  { value: 'hospitality', label: 'Hospitality', description: 'Welcome guests, answer questions, provide directions' },
  { value: 'technical', label: 'Technical Support', description: 'Help with AV equipment, presentations, tech issues' },
  { value: 'translation', label: 'Translation/Interpretation', description: 'Provide language support (if bilingual)' },
  { value: 'photography', label: 'Photography/Videography', description: 'Capture conference moments' },
  { value: 'moderator', label: 'Session Moderator', description: 'Moderate conference sessions' },
  { value: 'exhibition', label: 'Exhibition Support', description: 'Assist with exhibition setup and management' },
  { value: 'transportation', label: 'Transportation', description: 'Help with transportation logistics' },
]

const educationLevels = [
  { value: 'high-school', label: 'High School' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'phd', label: 'PhD' },
  { value: 'certificate', label: 'Professional Certificate' },
  { value: 'other', label: 'Other' },
]

const proficiencyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
]

const languageProficiency = [
  { value: 'basic', label: 'Basic' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'native', label: 'Native' },
]

const benefits = [
  { icon: FiAward, title: 'Certificate of Participation', description: 'Official volunteer certificate' },
  { icon: FiUsers, title: 'Networking Opportunities', description: 'Meet leaders and make connections' },
  { icon: FiHeart, title: 'Conference Access', description: 'Attend sessions during breaks' },
  { icon: FiCalendar, title: 'Meals Provided', description: 'Lunch and refreshments included' },
]

export default function VolunteerPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)

  const totalSteps = 6

  const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      education: [{ level: '', field: '', institution: '', year: new Date().getFullYear(), currentlyStudying: false }],
      skills: { languages: [{ language: '', proficiency: '' }] },
      workExperience: [],
      volunteerExperience: [],
      references: [{ name: '', relationship: '', email: '', phone: '', organization: '' }, { name: '', relationship: '', email: '', phone: '', organization: '' }],
      preferredRoles: [],
      availability: { days: [], timePreference: '', hoursAvailable: undefined },
      consents: { backgroundCheck: false, photoRelease: false, dataProcessing: false, termsAccepted: false },
    },
  })

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: 'education',
  })

  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control,
    name: 'skills.languages',
  })

  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
    control,
    name: 'workExperience',
  })

  const { fields: volunteerFields, append: appendVolunteer, remove: removeVolunteer } = useFieldArray({
    control,
    name: 'volunteerExperience',
  })

  const { fields: referenceFields, append: appendReference, remove: removeReference } = useFieldArray({
    control,
    name: 'references',
  })

  const handleFileUpload = async (file: File, type: 'cv' | 'coverLetter') => {
    try {
      showToast.loading(`Uploading ${type === 'cv' ? 'CV' : 'cover letter'}...`)
      const email = watch('email')

      // Build pathname for organized storage
      const emailHash = email ? email.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30) : 'volunteer'
      const sanitizedFilename = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
      const pathname = `Volunteers/${type}/${emailHash}-${sanitizedFilename}`

      console.log('📤 Uploading volunteer document directly to blob storage...', {
        name: file.name,
        size: file.size,
        pathname,
      })

      // Use Vercel Blob client-side upload with presigned URL
      const { upload } = await import('@vercel/blob/client')
      
      const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: '/api/upload/volunteer-document/presigned-url',
        clientPayload: JSON.stringify({
          addRandomSuffix: true,
        }),
      })

      setValue(type, blob.url)
      console.log('✅ Volunteer document uploaded directly to Vercel Blob:', blob.url)
      showToast.success(`${type === 'cv' ? 'CV' : 'Cover letter'} uploaded successfully`)
    } catch (error: any) {
      console.error('❌ Volunteer upload error:', error)
      showToast.error(`Failed to upload ${type === 'cv' ? 'CV' : 'cover letter'}: ${error.message || 'Unknown error'}`)
    }
  }

  const onSubmit = async (data: VolunteerFormData) => {
    setIsSubmitting(true)
    try {
      // Upload files first if they exist
      if (cvFile) {
        await handleFileUpload(cvFile, 'cv')
      }
      if (coverLetterFile) {
        await handleFileUpload(coverLetterFile, 'coverLetter')
      }

      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Submission failed')
      }

      setIsSuccess(true)
      showToast.success('Volunteer application submitted successfully!')
    } catch (error: any) {
      showToast.error(error.message || 'Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Application Received!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for your interest in volunteering at SARSYC VI! We'll review your comprehensive application and get back to you within 2 weeks.
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
          <div className="max-w-4xl mx-auto">
            {/* Important note about registration */}
            <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              <p className="font-semibold mb-1">Important:</p>
              <p>
                Volunteering at SARSYC VI does <span className="font-semibold">not automatically register you as a conference participant.</span>{' '}
                To attend sessions and be counted as a delegate, please also complete the{' '}
                <a
                  href="/participate/register"
                  className="font-semibold underline hover:text-red-900"
                >
                  main conference registration form
                </a>
                .
              </p>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Volunteer Application
              </h2>
              <p className="text-gray-600 mb-4">
                Complete all sections to submit your application. Fields marked with <span className="text-red-500">*</span> are required.
              </p>
              
              {/* Progress Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
                  <span className="text-sm font-medium text-gray-700">{Math.round((currentStep / totalSteps) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl p-8">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('firstName')}
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('lastName')}
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('dateOfBirth')}
                        type="date"
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('gender')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                      {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
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
                      {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('city')}
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                      <textarea
                        {...register('address')}
                        rows={2}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Education & Skills */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Education & Skills</h3>
                  
                  {/* Education */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Education Background <span className="text-red-500">*</span>
                    </label>
                    {educationFields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                            <select
                              {...register(`education.${index}.level`)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                            >
                              <option value="">Select level</option>
                              {educationLevels.map((level) => (
                                <option key={level.value} value={level.value}>{level.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
                            <input
                              {...register(`education.${index}.field`)}
                              type="text"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                            <input
                              {...register(`education.${index}.institution`)}
                              type="text"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Year Completed</label>
                            <input
                              {...register(`education.${index}.year`, { valueAsNumber: true })}
                              type="number"
                              min="1900"
                              max={new Date().getFullYear() + 5}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              {...register(`education.${index}.currentlyStudying`)}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Currently studying</span>
                          </label>
                          {educationFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEducation(index)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => appendEducation({ level: '', field: '', institution: '', year: new Date().getFullYear(), currentlyStudying: false })}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      + Add Education
                    </button>
                  </div>

                  {/* Languages */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Languages Spoken <span className="text-red-500">*</span>
                    </label>
                    {languageFields.map((field, index) => (
                      <div key={field.id} className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <input
                            {...register(`skills.languages.${index}.language`)}
                            type="text"
                            placeholder="Language"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <select
                            {...register(`skills.languages.${index}.proficiency`)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                          >
                            <option value="">Proficiency</option>
                            {languageProficiency.map((prof) => (
                              <option key={prof.value} value={prof.value}>{prof.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          {languageFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLanguage(index)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => appendLanguage({ language: '', proficiency: '' })}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      + Add Language
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Experience */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Work & Volunteer Experience</h3>
                  
                  {/* Work Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Work Experience (Optional)</label>
                    {workFields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                            <input
                              {...register(`workExperience.${index}.position`)}
                              type="text"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                            <input
                              {...register(`workExperience.${index}.organization`)}
                              type="text"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                              {...register(`workExperience.${index}.startDate`)}
                              type="date"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                              {...register(`workExperience.${index}.endDate`)}
                              type="date"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              {...register(`workExperience.${index}.currentlyWorking`)}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Currently working here</span>
                          </label>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            {...register(`workExperience.${index}.description`)}
                            rows={2}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeWork(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => appendWork({ position: '', organization: '', startDate: '', endDate: '', currentlyWorking: false, description: '' })}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      + Add Work Experience
                    </button>
                  </div>

                  {/* Volunteer Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Previous Volunteer Experience (Optional)</label>
                    {volunteerFields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Organization/Event</label>
                            <input
                              {...register(`volunteerExperience.${index}.organization`)}
                              type="text"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                            <input
                              {...register(`volunteerExperience.${index}.role`)}
                              type="text"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                            <input
                              {...register(`volunteerExperience.${index}.date`)}
                              type="date"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            {...register(`volunteerExperience.${index}.description`)}
                            rows={2}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVolunteer(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => appendVolunteer({ organization: '', role: '', date: '', description: '' })}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      + Add Volunteer Experience
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Volunteer Preferences */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Volunteer Preferences</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preferred Roles <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      {volunteerRoles.map((role) => (
                        <label key={role.value} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            {...register('preferredRoles')}
                            type="checkbox"
                            value={role.value}
                            className="mt-1 text-primary-600 focus:ring-primary-500 rounded"
                          />
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">{role.label}</div>
                            <div className="text-sm text-gray-600">{role.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.preferredRoles && <p className="mt-2 text-sm text-red-600">{errors.preferredRoles.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Availability <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2 mb-4">
                      {[
                        { value: 'aug-4', label: 'August 4 (Setup Day)' },
                        { value: 'aug-5', label: 'August 5 (Day 1)' },
                        { value: 'aug-6', label: 'August 6 (Day 2)' },
                        { value: 'aug-7', label: 'August 7 (Day 3)' },
                        { value: 'aug-8', label: 'August 8 (Cleanup)' },
                      ].map((day) => (
                        <label key={day.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            {...register('availability.days')}
                            type="checkbox"
                            value={day.value}
                            className="text-primary-600 focus:ring-primary-500 rounded"
                          />
                          <span className="ml-3 text-gray-700">{day.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.availability?.days && <p className="mt-2 text-sm text-red-600">{errors.availability.days.message}</p>}
                    
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Preference</label>
                        <select
                          {...register('availability.timePreference')}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        >
                          <option value="">Select preference</option>
                          <option value="morning">Morning (8 AM - 12 PM)</option>
                          <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                          <option value="evening">Evening (5 PM - 9 PM)</option>
                          <option value="full-day">Full Day</option>
                          <option value="flexible">Flexible</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Hours Available</label>
                        <input
                          {...register('availability.hoursAvailable', { valueAsNumber: true })}
                          type="number"
                          min="1"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivation Statement <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register('motivation')}
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Why do you want to volunteer at SARSYC VI? (Minimum 100 characters)"
                    />
                    {errors.motivation && <p className="mt-1 text-sm text-red-600">{errors.motivation.message}</p>}
                    <p className="mt-1 text-xs text-gray-500">{watch('motivation')?.length || 0} / 100 characters minimum</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Skills or Qualifications</label>
                    <textarea
                      {...register('specialSkills')}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Any additional skills, certifications, or qualifications..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Accommodations Needed</label>
                    <textarea
                      {...register('specialAccommodations')}
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Any accommodations needed to perform volunteer duties..."
                    />
                  </div>
                </div>
              )}

              {/* Step 5: References & Emergency Contact */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">References & Emergency Contact</h3>
                  
                  {/* References */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      References <span className="text-red-500">*</span> (2-3 required)
                    </label>
                    {referenceFields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-4">Reference {index + 1}</h4>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                              {...register(`references.${index}.name`)}
                              type="text"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                            <input
                              {...register(`references.${index}.relationship`)}
                              type="text"
                              placeholder="e.g., Former Employer, Professor"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                              {...register(`references.${index}.email`)}
                              type="email"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input
                              {...register(`references.${index}.phone`)}
                              type="tel"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Organization (Optional)</label>
                          <input
                            {...register(`references.${index}.organization`)}
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        {referenceFields.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeReference(index)}
                            className="mt-2 text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    {referenceFields.length < 3 && (
                      <button
                        type="button"
                        onClick={() => appendReference({ name: '', relationship: '', email: '', phone: '', organization: '' })}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        + Add Reference
                      </button>
                    )}
                  </div>

                  {/* Emergency Contact */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Emergency Contact <span className="text-red-500">*</span></h4>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          {...register('emergencyContact.name')}
                          type="text"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        {errors.emergencyContact?.name && <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.name.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                        <input
                          {...register('emergencyContact.relationship')}
                          type="text"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        {errors.emergencyContact?.relationship && <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.relationship.message}</p>}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          {...register('emergencyContact.phone')}
                          type="tel"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        {errors.emergencyContact?.phone && <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.phone.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                        <input
                          {...register('emergencyContact.email')}
                          type="email"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Documents & Consents */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Documents & Consents</h3>
                  
                  {/* Documents */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Documents</label>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">CV/Resume (PDF preferred)</label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setCvFile(file)
                                handleFileUpload(file, 'cv')
                              }
                            }}
                            className="hidden"
                          />
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                            <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              {cvFile ? cvFile.name : 'Click to upload CV/Resume'}
                            </p>
                          </div>
                        </label>
                        {cvFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setCvFile(null)
                              setValue('cv', '')
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter (Optional)</label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setCoverLetterFile(file)
                                handleFileUpload(file, 'coverLetter')
                              }
                            }}
                            className="hidden"
                          />
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                            <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              {coverLetterFile ? coverLetterFile.name : 'Click to upload Cover Letter'}
                            </p>
                          </div>
                        </label>
                        {coverLetterFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setCoverLetterFile(null)
                              setValue('coverLetter', '')
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Consents */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Consents & Agreements <span className="text-red-500">*</span></h4>
                    <div className="space-y-4">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          {...register('consents.backgroundCheck')}
                          className="mt-1 mr-3 text-primary-600 focus:ring-primary-500 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          I consent to a background check <span className="text-red-500">*</span>
                        </span>
                      </label>
                      {errors.consents?.backgroundCheck && <p className="text-sm text-red-600 ml-6">{errors.consents.backgroundCheck.message}</p>}

                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          {...register('consents.photoRelease')}
                          className="mt-1 mr-3 text-primary-600 focus:ring-primary-500 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          I consent to photos/videos being taken during my volunteer service <span className="text-red-500">*</span>
                        </span>
                      </label>
                      {errors.consents?.photoRelease && <p className="text-sm text-red-600 ml-6">{errors.consents.photoRelease.message}</p>}

                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          {...register('consents.dataProcessing')}
                          className="mt-1 mr-3 text-primary-600 focus:ring-primary-500 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          I consent to the processing of my personal data for volunteer management purposes <span className="text-red-500">*</span>
                        </span>
                      </label>
                      {errors.consents?.dataProcessing && <p className="text-sm text-red-600 ml-6">{errors.consents.dataProcessing.message}</p>}

                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          {...register('consents.termsAccepted')}
                          className="mt-1 mr-3 text-primary-600 focus:ring-primary-500 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          I accept the volunteer terms and conditions <span className="text-red-500">*</span>
                        </span>
                      </label>
                      {errors.consents?.termsAccepted && <p className="text-sm text-red-600 ml-6">{errors.consents.termsAccepted.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Next
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
