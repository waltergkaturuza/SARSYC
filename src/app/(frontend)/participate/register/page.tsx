'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCheck, FiArrowRight, FiArrowLeft } from 'react-icons/fi'

// Validation Schema
const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  country: z.string().min(2, 'Please select your country'),
  organization: z.string().min(2, 'Please enter your organization'),
  category: z.enum(['student', 'researcher', 'policymaker', 'partner', 'observer'], {
    required_error: 'Please select a participation category',
  }),
  dietaryRestrictions: z.array(z.string()).optional(),
  accessibilityNeeds: z.string().optional(),
  tshirtSize: z.enum(['xs', 's', 'm', 'l', 'xl', 'xxl']).optional(),
})

type RegistrationFormData = z.infer<typeof registrationSchema>

const steps = [
  { id: 1, name: 'Personal Info', icon: FiUser },
  { id: 2, name: 'Details', icon: FiBriefcase },
  { id: 3, name: 'Preferences', icon: FiCheck },
]

const categories = [
  { value: 'student', label: 'Student/Youth Delegate', description: 'Undergraduate or graduate student' },
  { value: 'researcher', label: 'Young Researcher', description: 'Academic researcher or PhD candidate' },
  { value: 'policymaker', label: 'Policymaker/Government Official', description: 'Government or policy institution' },
  { value: 'partner', label: 'Development Partner', description: 'NGO, donor, or international organization' },
  { value: 'observer', label: 'Observer', description: 'General attendee' },
]

const dietaryOptions = [
  { value: 'none', label: 'None' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'gluten-free', label: 'Gluten-free' },
  { value: 'other', label: 'Other' },
]

const tshirtSizes = [
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
  { value: 'xxl', label: 'XXL' },
]

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [registrationId, setRegistrationId] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true)
    
    try {
      // Submit to Payload CMS API
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        setRegistrationId(result.doc.registrationId)
        setIsSuccess(true)
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        alert('Registration failed. Please try again.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegistrationFormData)[] = []
    
    if (currentStep === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phone']
    } else if (currentStep === 2) {
      fieldsToValidate = ['country', 'organization', 'category']
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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Registration Successful!
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for registering for SARSYC VI!
              </p>
              <div className="bg-primary-50 rounded-lg p-6 mb-8">
                <p className="text-sm text-gray-600 mb-2">Your Registration ID</p>
                <p className="text-2xl font-bold text-primary-600">{registrationId}</p>
              </div>
              <div className="text-left bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>You'll receive a confirmation email shortly with your registration details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Save your Registration ID for future reference</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Check your email regularly for conference updates</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/" className="btn-outline">
                  Back to Homepage
                </a>
                <a href="/participate/submit-abstract" className="btn-primary">
                  Submit an Abstract
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
              Register for SARSYC VI
            </h1>
            <p className="text-lg text-gray-600">
              Join us in Windhoek, Namibia • August 5-7, 2026
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isComplete = currentStep > step.id
                
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                          isComplete
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : isActive
                            ? 'bg-white border-primary-600 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}
                      >
                        {isComplete ? <FiCheck className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                      </div>
                      <span
                        className={`text-sm mt-2 font-medium ${
                          isActive || isComplete ? 'text-primary-600' : 'text-gray-400'
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-4 transition-all duration-200 ${
                          isComplete ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                  
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
                        placeholder="John"
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
                        placeholder="Doe"
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
                      placeholder="john.doe@example.com"
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
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="+264 000 000 000"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Organization Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Organization Details</h2>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      {...register('country')}
                      type="text"
                      id="country"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.country ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="e.g., Namibia"
                    />
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                      Organization/Institution *
                    </label>
                    <input
                      {...register('organization')}
                      type="text"
                      id="organization"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.organization ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="e.g., University of Namibia"
                    />
                    {errors.organization && (
                      <p className="mt-1 text-sm text-red-600">{errors.organization.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Participation Category *
                    </label>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <label
                          key={category.value}
                          className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                        >
                          <input
                            {...register('category')}
                            type="radio"
                            value={category.value}
                            className="mt-1 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">{category.label}</div>
                            <div className="text-sm text-gray-600">{category.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.category && (
                      <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Preferences */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferences & Requirements</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Dietary Restrictions
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {dietaryOptions.map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            {...register('dietaryRestrictions')}
                            type="checkbox"
                            value={option.value}
                            className="text-primary-600 focus:ring-primary-500 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="accessibilityNeeds" className="block text-sm font-medium text-gray-700 mb-2">
                      Accessibility Requirements
                    </label>
                    <textarea
                      {...register('accessibilityNeeds')}
                      id="accessibilityNeeds"
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Please let us know if you have any accessibility requirements (e.g., wheelchair access, sign language interpretation, etc.)"
                    />
                  </div>

                  <div>
                    <label htmlFor="tshirtSize" className="block text-sm font-medium text-gray-700 mb-3">
                      T-Shirt Size
                    </label>
                    <div className="flex gap-3">
                      {tshirtSizes.map((size) => (
                        <label
                          key={size.value}
                          className="flex-1 text-center cursor-pointer"
                        >
                          <input
                            {...register('tshirtSize')}
                            type="radio"
                            value={size.value}
                            className="sr-only peer"
                          />
                          <div className="px-4 py-3 border-2 border-gray-300 rounded-lg peer-checked:border-primary-600 peer-checked:bg-primary-50 peer-checked:text-primary-600 font-medium transition-all">
                            {size.label}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-outline flex items-center gap-2"
                  >
                    <FiArrowLeft />
                    Previous
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary ml-auto flex items-center gap-2"
                  >
                    Next
                    <FiArrowRight />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary ml-auto flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Complete Registration
                        <FiCheck />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              Need help? Contact us at{' '}
              <a href="mailto:registration@sarsyc.org" className="text-primary-600 hover:underline">
                registration@sarsyc.org
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}



