'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCheck, FiArrowRight, FiArrowLeft, FiCalendar, FiGlobe, FiShield, FiLoader } from 'react-icons/fi'
import { countries } from '@/lib/countries'
import { extractPassportData, mapCountryCode } from '@/lib/passportExtractor'

// Comprehensive Validation Schema matching backend
const registrationSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say'], {
    required_error: 'Please select your gender',
  }),
  
  // Location
  country: z.string().min(2, 'Please select your country of residence'),
  nationality: z.string().min(2, 'Please select your nationality'),
  city: z.string().min(2, 'Please enter your city'),
  address: z.string().min(5, 'Please enter your full address'),
  
  // Organization
  organization: z.string().min(2, 'Please enter your organization'),
  organizationPosition: z.string().optional(),
  
  // International Attendee Fields
  isInternational: z.boolean().optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  passportIssuingCountry: z.string().optional(),
  passportScan: z.any().optional(), // File upload - will be handled separately
  visaRequired: z.boolean().optional(),
  visaStatus: z.enum(['not-applied', 'applied-pending', 'approved', 'denied']).optional(),
  visaApplicationDate: z.string().optional(),
  visaNumber: z.string().optional(),
  visaInvitationLetterRequired: z.boolean().optional(),
  
  // National ID (for non-international)
  nationalIdNumber: z.string().optional(),
  nationalIdType: z.enum(['national-id', 'drivers-license', 'other']).optional(),
  
  // Emergency Contact
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactRelationship: z.enum(['spouse-partner', 'parent', 'sibling', 'child', 'other-relative', 'friend', 'colleague', 'other'], {
    required_error: 'Please select relationship',
  }),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
  emergencyContactEmail: z.string().email('Please enter a valid email address'),
  emergencyContactAddress: z.string().min(5, 'Emergency contact address is required'),
  emergencyContactCountry: z.string().min(2, 'Please select country'),
  emergencyContactCity: z.string().min(2, 'Please enter city'),
  emergencyContactPostalCode: z.string().optional(),
  
  // Travel Information
  arrivalDate: z.string().optional(),
  departureDate: z.string().optional(),
  flightNumber: z.string().optional(),
  travelInsuranceProvider: z.string().optional(),
  travelInsurancePolicyNumber: z.string().optional(),
  travelInsuranceExpiry: z.string().optional(),
  
  // Accommodation
  accommodationRequired: z.boolean().optional(),
  accommodationPreferences: z.string().optional(),
  
  // Health & Insurance
  hasHealthInsurance: z.boolean().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  medicalConditions: z.string().optional(),
  bloodType: z.enum(['a-positive', 'a-negative', 'b-positive', 'b-negative', 'ab-positive', 'ab-negative', 'o-positive', 'o-negative', 'unknown']).optional(),
  
  // Participation
  category: z.enum(['student', 'researcher', 'policymaker', 'partner', 'observer'], {
    required_error: 'Please select a participation category',
  }),
  dietaryRestrictions: z.array(z.string()).optional(),
  accessibilityNeeds: z.string().optional(),
  tshirtSize: z.enum(['xs', 's', 'm', 'l', 'xl', 'xxl']).optional(),
}).refine((data) => {
  // If international, passport fields are required
  if (data.isInternational) {
    return data.passportNumber && data.passportNumber.length > 0 &&
           data.passportExpiry && data.passportExpiry.length > 0 &&
           data.passportIssuingCountry && data.passportIssuingCountry.length > 0
  }
  return true
}, {
  message: 'Passport information is required for international attendees',
  path: ['passportNumber'],
}).refine((data) => {
  // If not international, national ID is recommended but not strictly required
  return true
}, {
  message: 'National ID is recommended for local attendees',
  path: ['nationalIdNumber'],
})

type RegistrationFormData = z.infer<typeof registrationSchema>

const steps = [
  { id: 1, name: 'Personal Info', icon: FiUser },
  { id: 2, name: 'Location', icon: FiMapPin },
  { id: 3, name: 'Organization', icon: FiBriefcase },
  { id: 4, name: 'Travel & ID', icon: FiGlobe },
  { id: 5, name: 'Emergency Contact', icon: FiShield },
  { id: 6, name: 'Preferences', icon: FiCheck },
]

const categories = [
  { value: 'student', label: 'Student/Youth Delegate', description: 'Undergraduate or graduate student' },
  { value: 'researcher', label: 'Young Researcher', description: 'Academic researcher or PhD candidate' },
  { value: 'policymaker', label: 'Policymaker/Government Official', description: 'Government or policy institution' },
  { value: 'partner', label: 'Development Partner', description: 'NGO, donor, or international organization' },
  { value: 'observer', label: 'Observer', description: 'General attendee' },
]

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
]

const relationshipOptions = [
  { value: 'spouse-partner', label: 'Spouse/Partner' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'child', label: 'Child' },
  { value: 'other-relative', label: 'Other Relative' },
  { value: 'friend', label: 'Friend' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'other', label: 'Other' },
]

const idTypeOptions = [
  { value: 'national-id', label: 'National ID' },
  { value: 'drivers-license', label: "Driver's License" },
  { value: 'other', label: 'Other Government ID' },
]

const visaStatusOptions = [
  { value: 'not-applied', label: 'Not Applied' },
  { value: 'applied-pending', label: 'Applied - Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
]

const bloodTypeOptions = [
  { value: 'a-positive', label: 'A+' },
  { value: 'a-negative', label: 'A-' },
  { value: 'b-positive', label: 'B+' },
  { value: 'b-negative', label: 'B-' },
  { value: 'ab-positive', label: 'AB+' },
  { value: 'ab-negative', label: 'AB-' },
  { value: 'o-positive', label: 'O+' },
  { value: 'o-negative', label: 'O-' },
  { value: 'unknown', label: 'Unknown' },
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
  const [passportFile, setPassportFile] = useState<File | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionStatus, setExtractionStatus] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setError,
    clearErrors,
    setValue,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      isInternational: false,
      visaRequired: true,
      visaInvitationLetterRequired: true,
      accommodationRequired: false,
      hasHealthInsurance: false,
    },
  })

  const isInternational = watch('isInternational')
  const visaRequired = watch('visaRequired')
  const hasHealthInsurance = watch('hasHealthInsurance')
  const accommodationRequired = watch('accommodationRequired')

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      // Validate all fields before submission
      const isValid = await trigger()
      if (!isValid) {
        // Find the first error and scroll to it
        const firstErrorField = Object.keys(errors)[0] as keyof RegistrationFormData
        if (firstErrorField) {
          const errorElement = document.querySelector(`[name="${firstErrorField}"]`) || 
                              document.querySelector(`#${firstErrorField}`)
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            ;(errorElement as HTMLElement).focus()
          }
        }
        
        // Find which step has errors and navigate there
        const errorFields = Object.keys(errors)
        if (errorFields.some(f => ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'].includes(f))) {
          setCurrentStep(1)
        } else if (errorFields.some(f => ['country', 'nationality', 'city', 'address'].includes(f))) {
          setCurrentStep(2)
        } else if (errorFields.some(f => ['organization', 'category'].includes(f))) {
          setCurrentStep(3)
        } else if (errorFields.some(f => ['passportNumber', 'passportExpiry', 'passportIssuingCountry', 'passportScan'].includes(f))) {
          setCurrentStep(4)
        } else if (errorFields.some(f => f.startsWith('emergencyContact'))) {
          setCurrentStep(5)
        }
        
        setSubmitError('Please fill in all required fields. Check the highlighted fields above.')
        setIsSubmitting(false)
        return
      }

      // Validate passport scan for international attendees
      if (data.isInternational && !passportFile) {
        setError('passportScan', {
          type: 'manual',
          message: 'Passport scan is required for international attendees'
        })
        setCurrentStep(4)
        const passportScanInput = document.querySelector('#passportScan')
        if (passportScanInput) {
          passportScanInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
          ;(passportScanInput as HTMLElement).focus()
        }
        setSubmitError('Please upload your passport scan.')
        setIsSubmitting(false)
        return
      }

      // Create FormData for file upload
      const formData = new FormData()
      
      // Add all form fields
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof RegistrationFormData]
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(key, item))
          } else {
            formData.append(key, String(value))
          }
        }
      })

      // Add passport file if exists
      if (passportFile) {
        formData.append('passportScan', passportFile)
      }

      // Submit to Payload CMS API
      const response = await fetch('/api/registrations', {
        method: 'POST',
        body: formData, // Use FormData instead of JSON
      })

      if (response.ok) {
        const result = await response.json()
        setRegistrationId(result.doc.registrationId)
        setIsSuccess(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || errorData.error || 'Registration failed. Please try again.'
        setSubmitError(errorMessage)
        // Scroll to top to show error
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setSubmitError(error.message || 'An error occurred. Please try again.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegistrationFormData)[] = []
    
    if (currentStep === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender']
    } else if (currentStep === 2) {
      fieldsToValidate = ['country', 'nationality', 'city', 'address']
    } else if (currentStep === 3) {
      fieldsToValidate = ['organization', 'category']
    } else if (currentStep === 4) {
      if (isInternational) {
        fieldsToValidate = ['passportNumber', 'passportExpiry', 'passportIssuingCountry']
        // Also validate passport scan
        if (!passportFile) {
          setError('passportScan', {
            type: 'manual',
            message: 'Passport scan is required'
          })
        } else {
          clearErrors('passportScan')
        }
      } else {
        fieldsToValidate = []
      }
    } else if (currentStep === 5) {
      fieldsToValidate = ['emergencyContactName', 'emergencyContactRelationship', 'emergencyContactPhone', 'emergencyContactEmail', 'emergencyContactAddress', 'emergencyContactCountry', 'emergencyContactCity']
    }

    const isValid = await trigger(fieldsToValidate)
    
    // Check passport scan for international attendees
    if (currentStep === 4 && isInternational && !passportFile) {
      setError('passportScan', {
        type: 'manual',
        message: 'Passport scan is required'
      })
      return
    }
    
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Find first error and scroll to it
      const errorFields = Object.keys(errors)
      if (errorFields.length > 0) {
        const firstError = errorFields[0] as keyof RegistrationFormData
        const errorElement = document.querySelector(`[name="${firstError}"]`) || 
                            document.querySelector(`#${firstError}`)
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          ;(errorElement as HTMLElement).focus()
        }
      }
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
                <p className="text-2xl font-bold text-primary-600 font-mono">{registrationId}</p>
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
                  {isInternational && (
                    <li className="flex items-start gap-2">
                      <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>If you requested a visa invitation letter, it will be sent separately</span>
                    </li>
                  )}
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
            <div className="flex items-center justify-between max-w-3xl mx-auto overflow-x-auto pb-4">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isComplete = currentStep > step.id
                
                return (
                  <div key={step.id} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 flex-shrink-0 ${
                          isComplete
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : isActive
                            ? 'bg-white border-primary-600 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}
                      >
                        {isComplete ? <FiCheck className="w-5 h-5 md:w-6 md:h-6" /> : <Icon className="w-5 h-5 md:w-6 md:h-6" />}
                      </div>
                      <span
                        className={`text-xs md:text-sm mt-2 font-medium text-center ${
                          isActive || isComplete ? 'text-primary-600' : 'text-gray-400'
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 md:mx-4 transition-all duration-200 flex-shrink ${
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
            {/* Error Message Display */}
            {submitError && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{submitError}</p>
                  </div>
                </div>
              </div>
            )}
            
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

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth *
                      </label>
                      <input
                        {...register('dateOfBirth')}
                        type="date"
                        id="dateOfBirth"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
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
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.gender ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white`}
                      >
                        <option value="">Select gender</option>
                        {genderOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.gender && (
                        <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Location Information</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                        Country of Residence *
                    </label>
                    <select
                      {...register('country')}
                      id="country"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.country ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white`}
                    >
                      <option value="">Select your country</option>
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

                    <div>
                      <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">
                        Nationality *
                      </label>
                      <select
                        {...register('nationality')}
                        id="nationality"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.nationality ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white`}
                      >
                        <option value="">Select your nationality</option>
                        {countries.map((country) => (
                          <option key={country.value} value={country.value}>
                            {country.label}
                          </option>
                        ))}
                      </select>
                      {errors.nationality && (
                        <p className="mt-1 text-sm text-red-600">{errors.nationality.message}</p>
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
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Windhoek"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Address *
                    </label>
                    <textarea
                      {...register('address')}
                      id="address"
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Street address, postal code, etc."
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Organization */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Organization Details</h2>

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
                    <label htmlFor="organizationPosition" className="block text-sm font-medium text-gray-700 mb-2">
                      Position/Title
                    </label>
                    <input
                      {...register('organizationPosition')}
                      type="text"
                      id="organizationPosition"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Research Assistant"
                    />
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

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        {...register('isInternational')}
                        type="checkbox"
                        className="text-primary-600 focus:ring-primary-500 rounded"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        I am an international attendee (from outside Namibia)
                      </span>
                    </label>
                    <p className="mt-2 text-xs text-gray-600 ml-6">
                      International attendees will need to provide passport and visa information
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Travel & ID */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {isInternational ? 'Passport & Travel Information' : 'National ID Information'}
                  </h2>

                  {isInternational ? (
                    <>
                      <div>
                        <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Passport Number *
                        </label>
                        <input
                          {...register('passportNumber')}
                          type="text"
                          id="passportNumber"
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.passportNumber ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono`}
                          placeholder="A12345678"
                        />
                        {errors.passportNumber && (
                          <p className="mt-1 text-sm text-red-600">{errors.passportNumber.message}</p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="passportExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                            Passport Expiration Date *
                          </label>
                          <input
                            {...register('passportExpiry')}
                            type="date"
                            id="passportExpiry"
                            className={`w-full px-4 py-3 rounded-lg border ${
                              errors.passportExpiry ? 'border-red-500' : 'border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                          />
                          {errors.passportExpiry && (
                            <p className="mt-1 text-sm text-red-600">{errors.passportExpiry.message}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            Must be valid for at least 6 months after conference end date
                          </p>
                        </div>

                        <div>
                          <label htmlFor="passportIssuingCountry" className="block text-sm font-medium text-gray-700 mb-2">
                            Passport Issuing Country *
                          </label>
                          <select
                            {...register('passportIssuingCountry')}
                            id="passportIssuingCountry"
                            className={`w-full px-4 py-3 rounded-lg border ${
                              errors.passportIssuingCountry ? 'border-red-500' : 'border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white`}
                          >
                            <option value="">Select country</option>
                            {countries.map((country) => (
                              <option key={country.value} value={country.value}>
                                {country.label}
                              </option>
                            ))}
                          </select>
                          {errors.passportIssuingCountry && (
                            <p className="mt-1 text-sm text-red-600">{errors.passportIssuingCountry.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="passportScan" className="block text-sm font-medium text-gray-700 mb-2">
                          Passport Scan/Copy *
                        </label>
                        <div className="mt-1">
                          <input
                            id="passportScan"
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                // Validate file size (5MB max)
                                if (file.size > 5 * 1024 * 1024) {
                                  setError('passportScan', {
                                    type: 'manual',
                                    message: 'File size must be less than 5MB'
                                  })
                                  e.target.value = ''
                                  setPassportFile(null)
                                  return
                                }
                                // Validate file type (only images for OCR, PDFs need server-side processing)
                                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
                                if (!validTypes.includes(file.type)) {
                                  setError('passportScan', {
                                    type: 'manual',
                                    message: 'Please upload a PDF, JPG, or PNG file'
                                  })
                                  e.target.value = ''
                                  setPassportFile(null)
                                  return
                                }
                                
                                setPassportFile(file)
                                clearErrors('passportScan')
                                
                                // Extract passport data automatically (only for images)
                                if (file.type.startsWith('image/')) {
                                  setIsExtracting(true)
                                  setExtractionStatus('Extracting passport information...')
                                  
                                  try {
                                    const extracted = await extractPassportData(file)
                                    
                                    if (extracted.confidence && extracted.confidence > 0) {
                                      // Auto-fill form fields with extracted data
                                      if (extracted.passportNumber) {
                                        setValue('passportNumber', extracted.passportNumber)
                                        setExtractionStatus(`✓ Passport number extracted: ${extracted.passportNumber}`)
                                      }
                                      
                                      if (extracted.expiryDate) {
                                        setValue('passportExpiry', extracted.expiryDate)
                                        setExtractionStatus(prev => prev + `\n✓ Expiry date extracted: ${extracted.expiryDate}`)
                                      }
                                      
                                      if (extracted.dateOfBirth) {
                                        setValue('dateOfBirth', extracted.dateOfBirth)
                                        setExtractionStatus(prev => prev + `\n✓ Date of birth extracted: ${extracted.dateOfBirth}`)
                                      }
                                      
                                      if (extracted.gender) {
                                        setValue('gender', extracted.gender)
                                        setExtractionStatus(prev => prev + `\n✓ Gender extracted: ${extracted.gender}`)
                                      }
                                      
                                      if (extracted.surname) {
                                        setValue('lastName', extracted.surname)
                                        setExtractionStatus(prev => prev + `\n✓ Surname extracted: ${extracted.surname}`)
                                      }
                                      
                                      if (extracted.givenNames) {
                                        const nameParts = extracted.givenNames.split(' ')
                                        if (nameParts.length > 0) {
                                          setValue('firstName', nameParts[0])
                                          if (nameParts.length > 1) {
                                            // If there are multiple given names, use first one for firstName
                                            setExtractionStatus(prev => prev + `\n✓ First name extracted: ${nameParts[0]}`)
                                          }
                                        }
                                      }
                                      
                                      // Map country codes to full country codes
                                      if (extracted.nationality) {
                                        const countryCode = mapCountryCode(extracted.nationality)
                                        if (countryCode) {
                                          const country = countries.find(c => c.value === countryCode)
                                          if (country) {
                                            setValue('nationality', countryCode)
                                            setExtractionStatus(prev => prev + `\n✓ Nationality extracted: ${country.label}`)
                                          }
                                        }
                                      }
                                      
                                      if (extracted.issuingCountry) {
                                        const countryCode = mapCountryCode(extracted.issuingCountry)
                                        if (countryCode) {
                                          const country = countries.find(c => c.value === countryCode)
                                          if (country) {
                                            setValue('passportIssuingCountry', countryCode)
                                            setExtractionStatus(prev => prev + `\n✓ Issuing country extracted: ${country.label}`)
                                          }
                                        }
                                      }
                                      
                                      // Trigger validation for updated fields
                                      await trigger(['passportNumber', 'passportExpiry', 'passportIssuingCountry', 'dateOfBirth', 'gender', 'firstName', 'lastName', 'nationality'])
                                      
                                      setTimeout(() => {
                                        setExtractionStatus(null)
                                      }, 5000)
                                    } else {
                                      setExtractionStatus('Could not extract passport data. Please fill manually.')
                                      setTimeout(() => {
                                        setExtractionStatus(null)
                                      }, 3000)
                                    }
                                  } catch (error) {
                                    console.error('Error extracting passport data:', error)
                                    setExtractionStatus('Error extracting data. Please fill manually.')
                                    setTimeout(() => {
                                      setExtractionStatus(null)
                                    }, 3000)
                                  } finally {
                                    setIsExtracting(false)
                                  }
                                } else {
                                  // For PDF files, show message that extraction is not available
                                  setExtractionStatus('PDF files: Please fill passport details manually.')
                                  setTimeout(() => {
                                    setExtractionStatus(null)
                                  }, 3000)
                                }
                              } else {
                                setPassportFile(null)
                                setExtractionStatus(null)
                              }
                            }}
                            className={`w-full px-4 py-3 rounded-lg border ${
                              errors.passportScan ? 'border-red-500' : 'border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100`}
                          />
                        </div>
                        {errors.passportScan && (
                          <p className="mt-1 text-sm text-red-600">{errors.passportScan.message as string}</p>
                        )}
                        {passportFile && (
                          <div className="mt-2 space-y-2">
                            <p className="text-sm text-green-600 flex items-center gap-2">
                              <FiCheck className="w-4 h-4" />
                              File selected: {passportFile.name} ({(passportFile.size / 1024).toFixed(1)} KB)
                            </p>
                            {isExtracting && (
                              <div className="flex items-center gap-2 text-sm text-blue-600">
                                <FiLoader className="w-4 h-4 animate-spin" />
                                <span>Extracting passport information...</span>
                              </div>
                            )}
                            {extractionStatus && !isExtracting && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                                <p className="text-blue-800 whitespace-pre-line">{extractionStatus}</p>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Upload a clear scan or photo of your passport bio page. Accepted formats: PDF, JPG, PNG. Max size: 5MB.
                        </p>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            {...register('visaRequired')}
                            type="checkbox"
                            defaultChecked={true}
                            className="text-primary-600 focus:ring-primary-500 rounded"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            I require a visa to enter Namibia
                          </span>
                        </label>
                      </div>

                      {visaRequired && (
                        <>
                          <div>
                            <label htmlFor="visaStatus" className="block text-sm font-medium text-gray-700 mb-2">
                              Visa Status
                            </label>
                            <select
                              {...register('visaStatus')}
                              id="visaStatus"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                            >
                              <option value="">Select status</option>
                              {visaStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <label className="flex items-center cursor-pointer">
                              <input
                                {...register('visaInvitationLetterRequired')}
                                type="checkbox"
                                defaultChecked={true}
                                className="text-primary-600 focus:ring-primary-500 rounded"
                              />
                              <span className="ml-3 text-sm font-medium text-gray-900">
                                I need a visa invitation letter from the conference organizers
                              </span>
                            </label>
                          </div>
                        </>
                      )}

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="arrivalDate" className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Arrival Date
                          </label>
                          <input
                            {...register('arrivalDate')}
                            type="date"
                            id="arrivalDate"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Departure Date
                          </label>
                          <input
                            {...register('departureDate')}
                            type="date"
                            id="departureDate"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Flight Number (if known)
                        </label>
                        <input
                          {...register('flightNumber')}
                          type="text"
                          id="flightNumber"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="e.g., BA123"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="nationalIdNumber" className="block text-sm font-medium text-gray-700 mb-2">
                            National ID Number
                          </label>
                          <input
                            {...register('nationalIdNumber')}
                            type="text"
                            id="nationalIdNumber"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                            placeholder="123456789"
                          />
                        </div>

                        <div>
                          <label htmlFor="nationalIdType" className="block text-sm font-medium text-gray-700 mb-2">
                            ID Type
                          </label>
                          <select
                            {...register('nationalIdType')}
                            id="nationalIdType"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                          >
                            <option value="">Select ID type</option>
                            {idTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 5: Emergency Contact */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Contact (Next of Kin)</h2>

                  <div>
                    <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      {...register('emergencyContactName')}
                      type="text"
                      id="emergencyContactName"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.emergencyContactName ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Full legal name"
                    />
                    {errors.emergencyContactName && (
                      <p className="mt-1 text-sm text-red-600">{errors.emergencyContactName.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-gray-700 mb-2">
                        Relationship to You *
                      </label>
                      <select
                        {...register('emergencyContactRelationship')}
                        id="emergencyContactRelationship"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.emergencyContactRelationship ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white`}
                      >
                        <option value="">Select relationship</option>
                        {relationshipOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.emergencyContactRelationship && (
                        <p className="mt-1 text-sm text-red-600">{errors.emergencyContactRelationship.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        {...register('emergencyContactPhone')}
                        type="tel"
                        id="emergencyContactPhone"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        placeholder="+264 000 000 000"
                      />
                      {errors.emergencyContactPhone && (
                        <p className="mt-1 text-sm text-red-600">{errors.emergencyContactPhone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="emergencyContactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      {...register('emergencyContactEmail')}
                      type="email"
                      id="emergencyContactEmail"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.emergencyContactEmail ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="contact@example.com"
                    />
                    {errors.emergencyContactEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.emergencyContactEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="emergencyContactAddress" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Home Address *
                    </label>
                    <textarea
                      {...register('emergencyContactAddress')}
                      id="emergencyContactAddress"
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.emergencyContactAddress ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Street address, city, state/province, postal code"
                    />
                    {errors.emergencyContactAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.emergencyContactAddress.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="emergencyContactCountry" className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <select
                        {...register('emergencyContactCountry')}
                        id="emergencyContactCountry"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.emergencyContactCountry ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white`}
                      >
                        <option value="">Select country</option>
                        {countries.map((country) => (
                          <option key={country.value} value={country.value}>
                            {country.label}
                          </option>
                        ))}
                      </select>
                      {errors.emergencyContactCountry && (
                        <p className="mt-1 text-sm text-red-600">{errors.emergencyContactCountry.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="emergencyContactCity" className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        {...register('emergencyContactCity')}
                        type="text"
                        id="emergencyContactCity"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.emergencyContactCity ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        placeholder="City name"
                      />
                      {errors.emergencyContactCity && (
                        <p className="mt-1 text-sm text-red-600">{errors.emergencyContactCity.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="emergencyContactPostalCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Postal/ZIP Code
                    </label>
                    <input
                      {...register('emergencyContactPostalCode')}
                      type="text"
                      id="emergencyContactPostalCode"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="12345"
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Preferences */}
              {currentStep === 6 && (
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
                    <div className="flex gap-3 flex-wrap">
                      {tshirtSizes.map((size) => (
                        <label
                          key={size.value}
                          className="flex-1 min-w-[80px] text-center cursor-pointer"
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

                  {isInternational && (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            {...register('accommodationRequired')}
                            type="checkbox"
                            className="text-primary-600 focus:ring-primary-500 rounded"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            I require accommodation assistance
                          </span>
                        </label>
                      </div>

                      {accommodationRequired && (
                        <div>
                          <label htmlFor="accommodationPreferences" className="block text-sm font-medium text-gray-700 mb-2">
                            Accommodation Preferences/Requirements
                          </label>
                          <textarea
                            {...register('accommodationPreferences')}
                            id="accommodationPreferences"
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Please specify your accommodation needs..."
                          />
                        </div>
                      )}

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            {...register('hasHealthInsurance')}
                            type="checkbox"
                            className="text-primary-600 focus:ring-primary-500 rounded"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            I have travel/health insurance
                          </span>
                        </label>
                        <p className="mt-2 text-xs text-gray-600 ml-6">
                          Required for international attendees. Must cover medical expenses and emergency evacuation.
                        </p>
                      </div>

                      {hasHealthInsurance && (
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="insuranceProvider" className="block text-sm font-medium text-gray-700 mb-2">
                              Insurance Provider
                            </label>
                            <input
                              {...register('insuranceProvider')}
                              type="text"
                              id="insuranceProvider"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Insurance company name"
                            />
                          </div>

                          <div>
                            <label htmlFor="insurancePolicyNumber" className="block text-sm font-medium text-gray-700 mb-2">
                              Policy Number
                            </label>
                            <input
                              {...register('insurancePolicyNumber')}
                              type="text"
                              id="insurancePolicyNumber"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Policy number"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label htmlFor="travelInsuranceProvider" className="block text-sm font-medium text-gray-700 mb-2">
                          Travel Insurance Provider
                        </label>
                        <input
                          {...register('travelInsuranceProvider')}
                          type="text"
                          id="travelInsuranceProvider"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Travel insurance company name"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="travelInsurancePolicyNumber" className="block text-sm font-medium text-gray-700 mb-2">
                            Travel Insurance Policy Number
                          </label>
                          <input
                            {...register('travelInsurancePolicyNumber')}
                            type="text"
                            id="travelInsurancePolicyNumber"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Policy number"
                          />
                        </div>

                        <div>
                          <label htmlFor="travelInsuranceExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                            Travel Insurance Expiry Date
                          </label>
                          <input
                            {...register('travelInsuranceExpiry')}
                            type="date"
                            id="travelInsuranceExpiry"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Must be valid for the duration of your stay
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label htmlFor="medicalConditions" className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Conditions or Allergies (optional)
                    </label>
                    <textarea
                      {...register('medicalConditions')}
                      id="medicalConditions"
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Please disclose any medical conditions or allergies that we should be aware of..."
                    />
                  </div>

                  <div>
                    <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Type (optional)
                    </label>
                    <select
                      {...register('bloodType')}
                      id="bloodType"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                      <option value="">Select blood type</option>
                      {bloodTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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
                
                {currentStep < steps.length ? (
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
