'use client'

import { useCallback, useMemo, useState } from 'react'
import { useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCheck, FiArrowRight, FiArrowLeft, FiCalendar, FiGlobe, FiShield, FiLoader, FiEye, FiEdit, FiX, FiAlertCircle } from 'react-icons/fi'
import { countries } from '@/lib/countries'
import { showToast } from '@/lib/toast'
import {
  REGISTRATION_PACKAGES,
  currencyForPayments,
  getRegistrationPackage,
  getRegistrationPricingTier,
  isRegistrationPackageId,
  packageUsdForTier,
} from '@/lib/registrationPackages'
import {
  REGISTRATION_BANK_PROOF_EMAILS,
  REGISTRATION_CONTACT_EMAIL,
  REGISTRATION_SUPPORT_EMAILS,
  SARSYC_BANK_TRANSFER_DETAILS,
} from '@/lib/registrationBankTransfer'

/** HTML selects submit "" for the placeholder option; treat as omitted for optional enums */
function optionalSelectEnum<const T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.enum(values).optional(),
  )
}

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
  visaRequired: z.boolean().optional(),
  visaStatus: optionalSelectEnum(['not-applied', 'applied-pending', 'approved', 'denied'] as const),
  visaApplicationDate: z.string().optional(),
  visaNumber: z.string().optional(),
  visaInvitationLetterRequired: z.boolean().optional(),
  
  // National ID (for non-international)
  nationalIdNumber: z.string().optional(),
  nationalIdType: optionalSelectEnum(['national-id', 'drivers-license', 'other'] as const),
  
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
  bloodType: optionalSelectEnum([
    'a-positive',
    'a-negative',
    'b-positive',
    'b-negative',
    'ab-positive',
    'ab-negative',
    'o-positive',
    'o-negative',
    'unknown',
  ] as const),
  
  // Participation
  registrationPackage: z.enum(
    ['student_youth_shared', 'institutions_partners', 'half_package', 'half_package_youth', 'day_pass'],
    { required_error: 'Please select a conference registration package' },
  ),
  category: z.enum(['student', 'researcher', 'policymaker', 'partner', 'observer'], {
    required_error: 'Please select a participation category',
  }),
  dietaryRestrictions: z.preprocess(
    (val) => {
      if (val === false || val === true || val === '' || val == null) return undefined
      if (Array.isArray(val)) return val.filter((item) => typeof item === 'string' && item.length > 0)
      return undefined
    },
    z.array(z.string()).optional(),
  ),
  accessibilityNeeds: z.string().optional(),
  tshirtSize: optionalSelectEnum(['xs', 's', 'm', 'l', 'xl', 'xxl'] as const),
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

// Must match API: NEXT_PUBLIC_REGISTRATION_OPEN=true to allow submissions
const REGISTRATION_SUSPENDED = process.env.NEXT_PUBLIC_REGISTRATION_OPEN !== 'true'

const steps = [
  { id: 1, name: 'Personal Info', icon: FiUser },
  { id: 2, name: 'Location', icon: FiMapPin },
  { id: 3, name: 'Organization', icon: FiBriefcase },
  { id: 4, name: 'Travel & ID', icon: FiGlobe },
  { id: 5, name: 'Emergency Contact', icon: FiShield },
  { id: 6, name: 'Package & Preferences', icon: FiCheck },
]

const REQUIRED_MARK = <span className="text-red-500" aria-hidden="true">*</span>

const STEP_REQUIRED_FIELDS: Record<number, (keyof RegistrationFormData)[]> = {
  1: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'],
  2: ['country', 'nationality', 'city', 'address'],
  3: ['organization', 'category'],
  5: [
    'emergencyContactName',
    'emergencyContactRelationship',
    'emergencyContactPhone',
    'emergencyContactEmail',
    'emergencyContactAddress',
    'emergencyContactCountry',
    'emergencyContactCity',
  ],
  6: ['registrationPackage'],
}

const INTERNATIONAL_STEP4_FIELDS: (keyof RegistrationFormData)[] = [
  'passportNumber',
  'passportExpiry',
  'passportIssuingCountry',
]

const FIELD_LABELS: Partial<Record<keyof RegistrationFormData, string>> = {
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email address',
  phone: 'Phone number',
  dateOfBirth: 'Date of birth',
  gender: 'Gender',
  country: 'Country of residence',
  nationality: 'Nationality',
  city: 'City',
  address: 'Full address',
  organization: 'Organization/institution',
  category: 'Participation category',
  passportNumber: 'Passport number',
  passportExpiry: 'Passport expiration date',
  passportIssuingCountry: 'Passport issuing country',
  emergencyContactName: 'Emergency contact name',
  emergencyContactRelationship: 'Emergency contact relationship',
  emergencyContactPhone: 'Emergency contact phone',
  emergencyContactEmail: 'Emergency contact email',
  emergencyContactAddress: 'Emergency contact address',
  emergencyContactCountry: 'Emergency contact country',
  emergencyContactCity: 'Emergency contact city',
  registrationPackage: 'Conference registration package',
}

function isFieldFilled(value: unknown): boolean {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

function getStepRequiredFields(
  step: number,
  isInternational: boolean,
): (keyof RegistrationFormData)[] {
  if (step === 4) {
    return isInternational ? INTERNATIONAL_STEP4_FIELDS : []
  }
  return STEP_REQUIRED_FIELDS[step] ?? []
}

function isStepComplete(
  step: number,
  values: RegistrationFormData,
  isInternational: boolean,
): boolean {
  const fields = getStepRequiredFields(step, isInternational)
  if (fields.length === 0 && step === 4) return true
  return fields.every((field) => isFieldFilled(values[field]))
}

function getMissingStepFieldLabels(
  step: number,
  values: RegistrationFormData,
  isInternational: boolean,
): string[] {
  return getStepRequiredFields(step, isInternational)
    .filter((field) => !isFieldFilled(values[field]))
    .map((field) => FIELD_LABELS[field] ?? field)
}

function focusFirstInvalidField(fields: (keyof RegistrationFormData)[]) {
  for (const field of fields) {
    const el =
      document.querySelector(`[name="${field}"]`) ||
      document.querySelector(`#${field}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      ;(el as HTMLElement).focus()
      return
    }
  }
  const passportEl = document.querySelector('#passportNumber')
  if (passportEl) {
    passportEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    ;(passportEl as HTMLElement).focus()
  }
}

function formatValidationErrors(fieldErrors: FieldErrors<RegistrationFormData>): string {
  const parts: string[] = []
  for (const [key, err] of Object.entries(fieldErrors)) {
    if (!err) continue
    const label = FIELD_LABELS[key as keyof RegistrationFormData] ?? key
    const msg =
      typeof err === 'object' && err && 'message' in err && err.message
        ? String(err.message)
        : 'Required'
    parts.push(`${label}: ${msg}`)
  }
  if (parts.length === 0) return 'Please check the highlighted required fields.'
  return parts.slice(0, 4).join('. ') + (parts.length > 4 ? '…' : '')
}

function navigateToErrorFields(
  errorFields: string[],
  setCurrentStep: (step: number) => void,
) {
  if (
    errorFields.some((f) =>
      ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'].includes(f),
    )
  ) {
    setCurrentStep(1)
  } else if (errorFields.some((f) => ['country', 'nationality', 'city', 'address'].includes(f))) {
    setCurrentStep(2)
  } else if (errorFields.some((f) => ['organization', 'category'].includes(f))) {
    setCurrentStep(3)
  } else if (
    errorFields.some((f) =>
      ['passportNumber', 'passportExpiry', 'passportIssuingCountry'].includes(f),
    )
  ) {
    setCurrentStep(4)
  } else if (errorFields.some((f) => f.startsWith('emergencyContact'))) {
    setCurrentStep(5)
  } else if (errorFields.includes('registrationPackage')) {
    setCurrentStep(6)
  }
  focusFirstInvalidField(errorFields as (keyof RegistrationFormData)[])
}

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
  /** Manual bank transfer required (hosted card payments temporarily off) */
  const [manualBankPaymentPending, setManualBankPaymentPending] = useState(false)
  const [manualPaymentPackageName, setManualPaymentPackageName] = useState('')
  const [manualPaymentAmountUsd, setManualPaymentAmountUsd] = useState<number | null>(null)
  /** Saved in Payload but redirect to Stanbic did not happen */
  const [paymentOutstanding, setPaymentOutstanding] = useState(false)
  const [savedPayloadId, setSavedPayloadId] = useState<string | null>(null)
  const [paymentRetryBusy, setPaymentRetryBusy] = useState(false)
  const [registrationId, setRegistrationId] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [duplicatePaymentUrl, setDuplicatePaymentUrl] = useState<string | null>(null)

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
      dietaryRestrictions: [],
    },
  })

  const isInternational = watch('isInternational')
  const visaRequired = watch('visaRequired')
  const hasHealthInsurance = watch('hasHealthInsurance')
  const dietaryRestrictions = watch('dietaryRestrictions') ?? []
  const formValues = watch()

  const canProceedFromCurrentStep = useMemo(
    () =>
      isStepComplete(
        currentStep,
        formValues as RegistrationFormData,
        Boolean(isInternational),
      ),
    [currentStep, formValues, isInternational],
  )

  const canReviewAndSubmit = useMemo(() => {
    for (let step = 1; step <= steps.length; step += 1) {
      if (
        !isStepComplete(step, formValues as RegistrationFormData, Boolean(isInternational))
      ) {
        return false
      }
    }
    return true
  }, [formValues, isInternational])

  const missingCurrentStepFields = useMemo(
    () =>
      getMissingStepFieldLabels(
        currentStep,
        formValues as RegistrationFormData,
        Boolean(isInternational),
      ),
    [currentStep, formValues, isInternational],
  )

  const fieldHighlightClass = (field: keyof RegistrationFormData, required = true) => {
    if (!required || canProceedFromCurrentStep) return ''
    if (!getStepRequiredFields(currentStep, Boolean(isInternational)).includes(field)) return ''
    if (isFieldFilled(formValues[field])) return ''
    return 'border-red-500 ring-2 ring-red-100'
  }

  const inputBorderClass = (field: keyof RegistrationFormData, required = true) => {
    const missing = fieldHighlightClass(field, required)
    if (errors[field] || missing) return missing || 'border-red-500 ring-2 ring-red-100'
    return 'border-gray-300'
  }
  const accommodationRequired = watch('accommodationRequired')

  const retryHostedPayment = useCallback(async () => {
    if (!savedPayloadId) return
    setPaymentRetryBusy(true)
    const loadId = showToast.loading('Opening secure payment…')
    try {
      const payRes = await fetch('/api/payments/stanbic/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationPayloadId: savedPayloadId,
          ...(registrationId.trim() ? { registrationId: registrationId.trim() } : {}),
        }),
      })
      const payJson = await payRes.json().catch(() => ({}))
      if (
        payRes.ok &&
        typeof payJson.redirectUrl === 'string' &&
        payJson.redirectUrl.startsWith('http')
      ) {
        showToast.dismiss(loadId)
        window.location.href = payJson.redirectUrl
        return
      }
      showToast.dismiss(loadId)
      const apiMsg =
        typeof payJson.error === 'string'
          ? payJson.error
          : typeof (payJson as { message?: unknown }).message === 'string'
            ? (payJson as { message: string }).message
            : null
      const apiHint =
        typeof (payJson as { hint?: unknown }).hint === 'string'
          ? (payJson as { hint: string }).hint
          : ''
      const combined = [apiMsg, apiHint].filter(Boolean).join(' ')
      showToast.error(
        combined ||
          (payRes.status
            ? `Payment could not start (HTTP ${payRes.status}). Try again or contact ${REGISTRATION_CONTACT_EMAIL}.`
            : 'We could not open the payment page. Check your email or try again in a few minutes.'),
      )
    } catch {
      showToast.dismiss(loadId)
      showToast.error('Could not reach the payment service. Please try again.')
    } finally {
      setPaymentRetryBusy(false)
    }
  }, [savedPayloadId, registrationId])

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setDuplicatePaymentUrl(null)
    setShowPreview(false)
    
    try {
      const registrationPayload = { ...data }

      // Submit to Payload CMS API as JSON
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationPayload),
      })

      if (response.ok) {
        const result = await response.json()
        const regIdHuman = result.doc?.registrationId
        const payloadId = result.doc?.id

        if (result.manualBankPayment) {
          setManualBankPaymentPending(true)
          setPaymentOutstanding(false)
          setSavedPayloadId(null)
          setRegistrationId(regIdHuman || String(payloadId))
          setManualPaymentPackageName(
            typeof result.packageName === 'string' ? result.packageName : '',
          )
          setManualPaymentAmountUsd(
            typeof result.amountUsd === 'number' ? result.amountUsd : null,
          )
          showToast.success('Registration saved — bank transfer details are in your email.')
          setIsSuccess(true)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else if (result.paymentRequired && payloadId != null) {
          setManualBankPaymentPending(false)
          const loadId = showToast.loading('Redirecting to secure payment…')
          try {
      const payRes = await fetch('/api/payments/stanbic/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationPayloadId: payloadId,
          ...(typeof regIdHuman === 'string' && regIdHuman.trim()
            ? { registrationId: regIdHuman.trim() }
            : {}),
        }),
      })
            const payJson = await payRes.json().catch(() => ({}))
            if (
              payRes.ok &&
              typeof payJson.redirectUrl === 'string' &&
              payJson.redirectUrl.startsWith('http')
            ) {
              showToast.dismiss(loadId)
              window.location.href = payJson.redirectUrl
              return
            }
            console.error('Payment session error:', payJson)
            showToast.dismiss(loadId)
            const savedPayErr = typeof payJson.error === 'string' ? payJson.error : ''
            const savedPayHint =
              typeof (payJson as { hint?: unknown }).hint === 'string'
                ? (payJson as { hint: string }).hint
                : ''
            const savedPayDetail = [savedPayErr, savedPayHint].filter(Boolean).join(' ')
            showToast.info(
              savedPayDetail
                ? `Registration saved. ${savedPayDetail} — complete payment below or check your email.`
                : 'Registration saved — card payment still required. Use the button below or check your email.',
            )
            setPaymentOutstanding(true)
            setSavedPayloadId(String(payloadId))
            setRegistrationId(regIdHuman || String(payloadId))
            setIsSuccess(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          } catch (payErr) {
            console.error(payErr)
            showToast.dismiss(loadId)
            showToast.info(
              'Registration saved — we could not start the payment page. Check your email or use Complete payment below.',
            )
            setPaymentOutstanding(true)
            setSavedPayloadId(String(payloadId))
            setRegistrationId(regIdHuman || String(payloadId))
            setIsSuccess(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        } else {
          setManualBankPaymentPending(false)
          setPaymentOutstanding(false)
          setSavedPayloadId(null)
          setRegistrationId(regIdHuman)
          setIsSuccess(true)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        let errorMessage = errorData.message || errorData.error || 'Registration failed. Please try again.'
        
        // Log full error details to console for debugging
        console.error('❌ Registration API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          fullResponse: errorData,
        })
        
        // Handle duplicate registration (409 Conflict)
        if (response.status === 409) {
          errorMessage =
            errorData.error ||
            'You have already registered for SARSYC VI with this email address.'
          if (errorData.existingRegistrationId) {
            errorMessage += ` Your registration ID is ${errorData.existingRegistrationId}.`
          }
          if (typeof errorData.resumePaymentHint === 'string') {
            errorMessage += ` ${errorData.resumePaymentHint}`
          }
          if (typeof errorData.completePaymentUrl === 'string') {
            setDuplicatePaymentUrl(errorData.completePaymentUrl)
          }
          setError('email', { type: 'server', message: errorMessage })
          setCurrentStep(1)
          showToast.error(errorMessage)
        } else {
          // For 400 errors, show more details
          if (response.status === 400) {
            if (errorData.details) {
              errorMessage += `: ${errorData.details}`
            }
            if (errorData.debug) {
              console.error('Debug info:', errorData.debug)
              // Show debug info in development
              if (process.env.NODE_ENV === 'development') {
                errorMessage += ` [Debug: ${JSON.stringify(errorData.debug)}]`
              }
            }
            if (errorData.errors && Array.isArray(errorData.errors)) {
              const errorList = errorData.errors.map((e: any) => e.message || e).join(', ')
              errorMessage += ` Errors: ${errorList}`
            }
          }
          showToast.error(errorMessage)
        }
        
        // Set full error message including details
        const fullErrorMessage = errorData.details 
          ? `${errorMessage}\n\nDetails: ${errorData.details}`
          : errorMessage
        setSubmitError(fullErrorMessage)
        
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

  const handleInvalidSubmit = (fieldErrors: FieldErrors<RegistrationFormData>) => {
    setShowPreview(false)
    const message = formatValidationErrors(fieldErrors)
    setSubmitError(message)
    showToast.error(message)
    navigateToErrorFields(Object.keys(fieldErrors), setCurrentStep)
  }

  const nextStep = async () => {
    const fieldsToValidate = getStepRequiredFields(currentStep, Boolean(isInternational))

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate, { shouldFocus: true })
      if (!isValid) {
        focusFirstInvalidField(fieldsToValidate)
        showToast.error('Please complete all required fields marked with *.')
        return
      }
    }

    if (currentStep < steps.length) {
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

  // Registration suspended — show overlay instead of form
  if (REGISTRATION_SUSPENDED) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" aria-hidden />
        <div className="relative z-50 bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 md:p-10 text-center border-2 border-primary-100">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Registration Coming Soon
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Online registration opens when organisers enable it in the configuration.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            In the meantime, you can submit an abstract or explore the programme. SARSYC VI — Windhoek, Namibia.
          </p>
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
    )
  }

  const pricingTier = getRegistrationPricingTier()
  const registrationPeriodClosed = pricingTier === 'closed'

  if (!REGISTRATION_SUSPENDED && registrationPeriodClosed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" aria-hidden />
        <div className="relative z-50 bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 md:p-10 text-center border-2 border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCalendar className="w-10 h-10 text-gray-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Registration period has closed
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Online registration for SARSYC VI followed published early-bird and late windows. If you need help, please contact the organisers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/" className="btn-outline">
              Back to Homepage
            </a>
            <a href={`mailto:${REGISTRATION_CONTACT_EMAIL}`} className="btn-primary">
              Contact registration
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    if (manualBankPaymentPending) {
      const b = SARSYC_BANK_TRANSFER_DETAILS
      const amount =
        manualPaymentAmountUsd != null
          ? `USD ${manualPaymentAmountUsd.toFixed(2)}`
          : '—'
      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-amber-100">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiAlertCircle className="w-10 h-10 text-amber-600" aria-hidden />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
                  Registration saved — bank transfer required
                </h1>
                <p className="text-lg text-gray-600 mb-6 text-center">
                  Your details are on file. Your place is confirmed only after we receive your fee and verify proof
                  of payment.
                </p>
                <div className="bg-primary-50 rounded-lg p-6 mb-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Your Registration ID</p>
                  <p className="text-2xl font-bold text-primary-600 font-mono">{registrationId}</p>
                  <p className="text-sm text-gray-600 mt-3">
                    Use this ID as your <strong>payment reference</strong> on the deposit.
                  </p>
                </div>
                {manualPaymentPackageName ? (
                  <p className="text-center text-gray-800 mb-4">
                    Package: <strong>{manualPaymentPackageName}</strong> — Amount due:{' '}
                    <strong>{amount}</strong>
                  </p>
                ) : null}
                <div className="text-left bg-gray-50 rounded-lg p-6 mb-6 text-sm text-gray-700 space-y-2 border border-gray-200">
                  <p className="font-semibold text-gray-900">Bank details (USD)</p>
                  <p><span className="text-gray-500">Bank:</span> {b.bankName}</p>
                  <p><span className="text-gray-500">Account name:</span> {b.accountName}</p>
                  <p><span className="text-gray-500">Account number:</span> <strong className="font-mono">{b.accountNumber}</strong></p>
                  <p><span className="text-gray-500">Branch:</span> {b.branchName}</p>
                  <p><span className="text-gray-500">SWIFT:</span> {b.swiftCode}</p>
                  <p><span className="text-gray-500">Intermediary bank:</span> {b.intermediaryBankName} (SWIFT: {b.intermediarySwiftCode})</p>
                </div>
                <p className="text-sm text-gray-600 mb-6 text-left bg-amber-50 rounded-lg p-4 border border-amber-100">
                  After paying, email <strong>proof of payment</strong> to{' '}
                  {REGISTRATION_BANK_PROOF_EMAILS.map((email, i) => (
                    <span key={email}>
                      {i > 0 ? ' and ' : ''}
                      <a href={`mailto:${email}`} className="text-primary-600 underline">{email}</a>
                    </span>
                  ))}
                  , including your registration ID and full name. The same instructions were sent to your email.
                </p>
                <p className="text-sm text-gray-600 mb-6 text-left bg-blue-50 rounded-lg p-4 border border-blue-100">
                  After we confirm your payment, you will receive an email with a link to complete mandatory{' '}
                  <strong>safeguarding training</strong> and a zero-tolerance acknowledgment before you are fully
                  registered for the conference.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/" className="btn-primary inline-flex items-center justify-center">Back to Homepage</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (paymentOutstanding) {
      const b = SARSYC_BANK_TRANSFER_DETAILS
      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-amber-100">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiAlertCircle className="w-10 h-10 text-amber-600" aria-hidden />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
                  Registration saved — payment required
                </h1>
                <p className="text-lg text-gray-600 mb-6 text-center">
                  Your details are on file. Your place is confirmed once payment is received.
                </p>
                <div className="bg-primary-50 rounded-lg p-6 mb-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Your Registration ID</p>
                  <p className="text-2xl font-bold text-primary-600 font-mono">{registrationId}</p>
                  <p className="text-sm text-gray-600 mt-2">Use this ID as your payment reference.</p>
                </div>

                {/* Primary: retry hosted payment */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Option 1 — Pay by card (recommended)</p>
                  <p className="text-sm text-gray-600 mb-3 bg-amber-50 rounded-lg p-4 border border-amber-100">
                    The payment page could not be opened automatically. Tap <strong>Complete payment</strong> to try again.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-60"
                      onClick={() => void retryHostedPayment()}
                      disabled={paymentRetryBusy}
                    >
                      {paymentRetryBusy ? (
                        <>
                          <FiLoader className="w-5 h-5 animate-spin" aria-hidden />
                          Opening payment…
                        </>
                      ) : (
                        'Complete payment'
                      )}
                    </button>
                    <a href="/" className="btn-outline inline-flex items-center justify-center">
                      Back to Homepage
                    </a>
                  </div>
                </div>

                {/* Fallback: bank transfer */}
                <div className="border-t border-gray-200 pt-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Option 2 — Bank transfer (if card payment is unavailable)</p>
                  <div className="text-left bg-gray-50 rounded-lg p-5 mb-4 text-sm text-gray-700 space-y-2 border border-gray-200">
                    <p className="font-semibold text-gray-900">Bank details (USD)</p>
                    <p><span className="text-gray-500">Bank:</span> {b.bankName}</p>
                    <p><span className="text-gray-500">Account name:</span> {b.accountName}</p>
                    <p><span className="text-gray-500">Account number:</span> <strong className="font-mono">{b.accountNumber}</strong></p>
                    <p><span className="text-gray-500">Branch:</span> {b.branchName}</p>
                    <p><span className="text-gray-500">SWIFT:</span> {b.swiftCode}</p>
                    <p><span className="text-gray-500">Intermediary bank:</span> {b.intermediaryBankName} (SWIFT: {b.intermediarySwiftCode})</p>
                  </div>
                  <p className="text-sm text-gray-600 bg-amber-50 rounded-lg p-4 border border-amber-100">
                    After paying, email <strong>proof of payment</strong> to{' '}
                    {REGISTRATION_BANK_PROOF_EMAILS.map((email, i) => (
                      <span key={email}>
                        {i > 0 ? ' and ' : ''}
                        <a href={`mailto:${email}`} className="text-primary-600 underline">{email}</a>
                      </span>
                    ))}, including your registration ID and full name.
                  </p>
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
                  <div className="ml-3 space-y-2">
                    <p className="text-sm text-red-700 font-medium">{submitError}</p>
                    {duplicatePaymentUrl && (
                      <p className="text-sm text-red-700">
                        <a href={duplicatePaymentUrl} className="font-semibold underline hover:text-red-900">
                          Complete your payment here
                        </a>
                        {' '}(use your registration ID and email).
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {!canProceedFromCurrentStep && missingCurrentStepFields.length > 0 && (
              <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
                <p className="text-sm text-amber-900 flex items-start gap-2">
                  <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold">Required fields missing — </strong>
                    complete the following to enable Next:{' '}
                    {missingCurrentStepFields.join(', ')}
                  </span>
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
                  <p className="text-sm text-gray-600 mb-6">Fields marked with {REQUIRED_MARK} are required.</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('firstName')}
                        type="text"
                        id="firstName"
                        className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('firstName')} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        placeholder="John"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('lastName')}
                        type="text"
                        id="lastName"
                        className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('lastName')} focus:outline-none focus:ring-2 focus:ring-primary-500`}
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
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('email')} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="john.doe@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      id="phone"
                      className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('phone')} focus:outline-none focus:ring-2 focus:ring-primary-500`}
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
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('dateOfBirth')}
                        type="date"
                        id="dateOfBirth"
                        className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('dateOfBirth')} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                      {errors.dateOfBirth && (
                        <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('gender')}
                        id="gender"
                        className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('gender')} focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white`}
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Information</h2>
                  <p className="text-sm text-gray-600 mb-6">Fields marked with {REQUIRED_MARK} are required.</p>

                  <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                        Country of Residence <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('country')}
                      id="country"
                      className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('country')} focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white`}
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
                        Nationality <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('nationality')}
                        id="nationality"
                        className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('nationality')} focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white`}
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
                      City {REQUIRED_MARK}
                    </label>
                    <input
                      {...register('city')}
                      type="text"
                      id="city"
                      className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('city')} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Windhoek"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register('address')}
                      id="address"
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('address')} focus:outline-none focus:ring-2 focus:ring-primary-500`}
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Organization Details</h2>
                  <p className="text-sm text-gray-600 mb-6">Fields marked with {REQUIRED_MARK} are required.</p>

                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                      Organization/Institution <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('organization')}
                      type="text"
                      id="organization"
                      className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('organization')} focus:outline-none focus:ring-2 focus:ring-primary-500`}
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
                      Participation Category {REQUIRED_MARK}
                    </label>
                    <div
                      className={`space-y-3 ${
                        errors.category || fieldHighlightClass('category')
                          ? 'ring-2 ring-red-100 border border-red-400 rounded-lg p-3'
                          : ''
                      }`}
                    >
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
                          Passport Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('passportNumber')}
                          type="text"
                          id="passportNumber"
                          className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('passportNumber')} focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono`}
                          placeholder="A12345678"
                        />
                        {errors.passportNumber && (
                          <p className="mt-1 text-sm text-red-600">{errors.passportNumber.message}</p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="passportExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                            Passport Expiration Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register('passportExpiry')}
                            type="date"
                            id="passportExpiry"
                            className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('passportExpiry')} focus:outline-none focus:ring-2 focus:ring-primary-500`}
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
                            Passport Issuing Country <span className="text-red-500">*</span>
                          </label>
                          <select
                            {...register('passportIssuingCountry')}
                            id="passportIssuingCountry"
                            className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('passportIssuingCountry')} focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white`}
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
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('emergencyContactName')}
                      type="text"
                      id="emergencyContactName"
                      className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('emergencyContactName')} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Full legal name"
                    />
                    {errors.emergencyContactName && (
                      <p className="mt-1 text-sm text-red-600">{errors.emergencyContactName.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-gray-700 mb-2">
                        Relationship to You <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('emergencyContactRelationship')}
                        id="emergencyContactRelationship"
                        className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('emergencyContactRelationship')} focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white`}
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
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('emergencyContactPhone')}
                        type="tel"
                        id="emergencyContactPhone"
                        className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('emergencyContactPhone')} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        placeholder="+264 000 000 000"
                      />
                      {errors.emergencyContactPhone && (
                        <p className="mt-1 text-sm text-red-600">{errors.emergencyContactPhone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="emergencyContactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('emergencyContactEmail')}
                      type="email"
                      id="emergencyContactEmail"
                      className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('emergencyContactEmail')} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="contact@example.com"
                    />
                    {errors.emergencyContactEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.emergencyContactEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="emergencyContactAddress" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Home Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register('emergencyContactAddress')}
                      id="emergencyContactAddress"
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('emergencyContactAddress')} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Street address, city, state/province, postal code"
                    />
                    {errors.emergencyContactAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.emergencyContactAddress.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="emergencyContactCountry" className="block text-sm font-medium text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('emergencyContactCountry')}
                        id="emergencyContactCountry"
                        className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('emergencyContactCountry')} focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white`}
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
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('emergencyContactCity')}
                        type="text"
                        id="emergencyContactCity"
                        className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass('emergencyContactCity')} focus:outline-none focus:ring-2 focus:ring-primary-500`}
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Package & preferences</h2>
                  <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm text-gray-800 mb-6">
                    <p className="font-semibold text-primary-900 mb-1">Pricing period</p>
                    {getRegistrationPricingTier() === 'early' && (
                      <p>
                        <strong>Early bird</strong> (1 May–30 June 2026). Before 1 May we still show early-bird rates so you can register ahead of the official opening date.
                      </p>
                    )}
                    {getRegistrationPricingTier() === 'late' && (
                      <p>
                        <strong>Late registration</strong> (1–31 July 2026). Listed prices are late rates.
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-600">
                      Amounts are shown in {currencyForPayments()}; card payment (when enabled) uses the tier in effect when you complete checkout.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Conference registration package <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`space-y-3 ${
                        errors.registrationPackage || fieldHighlightClass('registrationPackage')
                          ? 'ring-2 ring-red-100 border border-red-400 rounded-xl p-3'
                          : ''
                      }`}
                    >
                      {REGISTRATION_PACKAGES.map((pkg) => {
                        const tier = getRegistrationPricingTier()
                        const usd = packageUsdForTier(pkg, tier)
                        return (
                          <label
                            key={pkg.id}
                            className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-primary-400 transition-colors has-[[type=radio]:checked]:border-primary-600 has-[[type=radio]:checked]:bg-primary-50/60"
                          >
                            <input
                              {...register('registrationPackage')}
                              type="radio"
                              value={pkg.id}
                              className="mt-1.5 text-primary-600 focus:ring-primary-500 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <span className="font-semibold text-gray-900">{pkg.name}</span>
                                <span className="text-lg font-bold text-primary-700 tabular-nums">
                                  {currencyForPayments()} {usd}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                    {errors.registrationPackage && (
                      <p className="mt-2 text-sm text-red-600">{errors.registrationPackage.message}</p>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 pt-4 border-t border-gray-200">
                    Participation & requirements
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Dietary Restrictions
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {dietaryOptions.map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="checkbox"
                            value={option.value}
                            checked={dietaryRestrictions.includes(option.value)}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...dietaryRestrictions, option.value]
                                : dietaryRestrictions.filter((item) => item !== option.value)
                              setValue('dietaryRestrictions', next, { shouldValidate: true })
                            }}
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
                    disabled={!canProceedFromCurrentStep}
                    className="btn-primary ml-auto flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      !canProceedFromCurrentStep
                        ? 'Complete all required fields (*) on this step first'
                        : undefined
                    }
                  >
                    Next
                    <FiArrowRight />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      const fields: (keyof RegistrationFormData)[] = [
                        'firstName',
                        'lastName',
                        'email',
                        'phone',
                        'dateOfBirth',
                        'gender',
                        'country',
                        'nationality',
                        'city',
                        'address',
                        'organization',
                        'category',
                        'registrationPackage',
                        'emergencyContactName',
                        'emergencyContactRelationship',
                        'emergencyContactPhone',
                        'emergencyContactEmail',
                        'emergencyContactAddress',
                        'emergencyContactCountry',
                        'emergencyContactCity',
                      ]
                      if (isInternational) {
                        fields.push('passportNumber', 'passportExpiry', 'passportIssuingCountry')
                      }
                      const ok = await trigger(fields, { shouldFocus: true })
                      if (!ok) {
                        showToast.error('Please complete all required fields before review.')
                        focusFirstInvalidField(fields)
                        return
                      }
                      setShowPreview(true)
                    }}
                    disabled={!canReviewAndSubmit}
                    className="btn-primary ml-auto flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      !canReviewAndSubmit
                        ? 'Complete all required fields on every step first'
                        : undefined
                    }
                  >
                    <FiEye />
                    Review & Submit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center text-sm text-gray-600 space-y-3">
            <p className="max-w-2xl mx-auto text-gray-700 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              After you register and your payment is confirmed, you must complete mandatory safeguarding training
              and submit a zero-tolerance acknowledgment (link sent by email) before you are fully registered for
              SARSYC VI.
            </p>
            <p>
              Need help? Contact{' '}
              {REGISTRATION_SUPPORT_EMAILS.map((email, i) => (
                <span key={email}>
                  {i > 0 ? (i === REGISTRATION_SUPPORT_EMAILS.length - 1 ? ' or ' : ', ') : ''}
                  <a href={`mailto:${email}`} className="text-primary-600 hover:underline">
                    {email}
                  </a>
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FiEye />
                Review Your Registration
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Please review all information carefully, especially passport details, before submitting.
                </p>
              </div>

              {/* Preview Content */}
              <RegistrationPreview
                data={watch()}
                pricingTier={getRegistrationPricingTier()}
              />

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="btn-outline flex items-center gap-2"
                >
                  <FiEdit />
                  Edit Information
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(onSubmit, handleInvalidSubmit)()}
                  disabled={isSubmitting}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      Confirm & Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Preview Component
function RegistrationPreview({
  data,
  pricingTier,
}: {
  data: any
  pricingTier: ReturnType<typeof getRegistrationPricingTier>
}) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not provided'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const getCountryName = (code?: string) => {
    if (!code) return 'Not provided'
    const country = countries.find(c => c.value === code)
    return country?.label || code
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FiUser />
          Personal Information
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-gray-900">{data.firstName} {data.lastName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-900">{data.email}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <span className="ml-2 text-gray-900">{data.phone}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Date of Birth:</span>
              <span className="ml-2 text-gray-900">{formatDate(data.dateOfBirth)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Gender:</span>
              <span className="ml-2 text-gray-900 capitalize">{data.gender?.replace(/-/g, ' ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FiMapPin />
          Location
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-700">Country:</span>
              <span className="ml-2 text-gray-900">{getCountryName(data.country)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Nationality:</span>
              <span className="ml-2 text-gray-900">{getCountryName(data.nationality)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">City:</span>
              <span className="ml-2 text-gray-900">{data.city}</span>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">Address:</span>
              <span className="ml-2 text-gray-900">{data.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Organization */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FiBriefcase />
          Organization
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-700">Organization:</span>
              <span className="ml-2 text-gray-900">{data.organization || 'Not provided'}</span>
            </div>
            {data.organizationPosition && (
              <div>
                <span className="font-medium text-gray-700">Position:</span>
                <span className="ml-2 text-gray-900">{data.organizationPosition}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Conference package:</span>
              <span className="ml-2 text-gray-900">
                {isRegistrationPackageId(data.registrationPackage) && pricingTier !== 'closed'
                  ? `${getRegistrationPackage(data.registrationPackage).name} — ${currencyForPayments()} ${packageUsdForTier(getRegistrationPackage(data.registrationPackage), pricingTier)} (${pricingTier === 'late' ? 'late' : 'early'} rate)`
                  : isRegistrationPackageId(data.registrationPackage)
                    ? getRegistrationPackage(data.registrationPackage).name
                    : 'Not selected'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Category:</span>
              <span className="ml-2 text-gray-900 capitalize">{data.category?.replace(/-/g, ' ') || 'Not provided'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Passport Information (if international) */}
      {data.isInternational && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiGlobe />
            Passport & Travel Information
          </h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2 text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">Passport Number:</span>
                <span className="ml-2 text-gray-900">{data.passportNumber || 'Not provided'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Expiry Date:</span>
                <span className="ml-2 text-gray-900">{formatDate(data.passportExpiry)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Issuing Country:</span>
                <span className="ml-2 text-gray-900">{getCountryName(data.passportIssuingCountry)}</span>
              </div>
            </div>
          </div>

          {/* Visa Information */}
          {data.visaRequired && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Visa Information</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Visa Status:</span>
                  <span className="ml-2 text-gray-900 capitalize">{data.visaStatus?.replace(/-/g, ' ') || 'Not provided'}</span>
                </div>
                {data.visaInvitationLetterRequired && (
                  <div>
                    <span className="font-medium text-gray-700">Invitation Letter:</span>
                    <span className="ml-2 text-green-600">✓ Required</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Travel Information */}
          {(data.arrivalDate || data.departureDate || data.flightNumber) && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Travel Details</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {data.arrivalDate && (
                  <div>
                    <span className="font-medium text-gray-700">Arrival Date:</span>
                    <span className="ml-2 text-gray-900">{formatDate(data.arrivalDate)}</span>
                  </div>
                )}
                {data.departureDate && (
                  <div>
                    <span className="font-medium text-gray-700">Departure Date:</span>
                    <span className="ml-2 text-gray-900">{formatDate(data.departureDate)}</span>
                  </div>
                )}
                {data.flightNumber && (
                  <div>
                    <span className="font-medium text-gray-700">Flight Number:</span>
                    <span className="ml-2 text-gray-900">{data.flightNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Travel Insurance */}
          {(data.travelInsuranceProvider || data.travelInsurancePolicyNumber || data.travelInsuranceExpiry) && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Travel Insurance</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {data.travelInsuranceProvider && (
                  <div>
                    <span className="font-medium text-gray-700">Provider:</span>
                    <span className="ml-2 text-gray-900">{data.travelInsuranceProvider}</span>
                  </div>
                )}
                {data.travelInsurancePolicyNumber && (
                  <div>
                    <span className="font-medium text-gray-700">Policy Number:</span>
                    <span className="ml-2 text-gray-900">{data.travelInsurancePolicyNumber}</span>
                  </div>
                )}
                {data.travelInsuranceExpiry && (
                  <div>
                    <span className="font-medium text-gray-700">Expiry Date:</span>
                    <span className="ml-2 text-gray-900">{formatDate(data.travelInsuranceExpiry)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accommodation */}
          {data.accommodationRequired && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Accommodation</h4>
              <div>
                <span className="font-medium text-gray-700">Accommodation Required:</span>
                <span className="ml-2 text-green-600">✓ Yes</span>
              </div>
              {data.accommodationPreferences && (
                <div className="mt-2">
                  <span className="font-medium text-gray-700">Preferences:</span>
                  <p className="ml-2 text-gray-900 mt-1">{data.accommodationPreferences}</p>
                </div>
              )}
            </div>
          )}

          {/* Health Insurance */}
          {data.hasHealthInsurance && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Health Insurance</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {data.insuranceProvider && (
                  <div>
                    <span className="font-medium text-gray-700">Provider:</span>
                    <span className="ml-2 text-gray-900">{data.insuranceProvider}</span>
                  </div>
                )}
                {data.insurancePolicyNumber && (
                  <div>
                    <span className="font-medium text-gray-700">Policy Number:</span>
                    <span className="ml-2 text-gray-900">{data.insurancePolicyNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* National ID (if not international) */}
      {!data.isInternational && (data.nationalIdNumber || data.nationalIdType) && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiShield />
            National ID Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              {data.nationalIdNumber && (
                <div>
                  <span className="font-medium text-gray-700">ID Number:</span>
                  <span className="ml-2 text-gray-900">{data.nationalIdNumber}</span>
                </div>
              )}
              {data.nationalIdType && (
                <div>
                  <span className="font-medium text-gray-700">ID Type:</span>
                  <span className="ml-2 text-gray-900 capitalize">{data.nationalIdType?.replace(/-/g, ' ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contact */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FiShield />
          Emergency Contact
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-gray-900">{data.emergencyContactName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Relationship:</span>
              <span className="ml-2 text-gray-900 capitalize">{data.emergencyContactRelationship?.replace(/-/g, ' ')}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <span className="ml-2 text-gray-900">{data.emergencyContactPhone}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-900">{data.emergencyContactEmail}</span>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">Address:</span>
              <span className="ml-2 text-gray-900">{data.emergencyContactAddress}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">City:</span>
              <span className="ml-2 text-gray-900">{data.emergencyContactCity}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Country:</span>
              <span className="ml-2 text-gray-900">{getCountryName(data.emergencyContactCountry)}</span>
            </div>
            {data.emergencyContactPostalCode && (
              <div>
                <span className="font-medium text-gray-700">Postal Code:</span>
                <span className="ml-2 text-gray-900">{data.emergencyContactPostalCode}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FiCheck />
          Preferences & Requirements
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
          {data.dietaryRestrictions && data.dietaryRestrictions.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Dietary Restrictions:</span>
              <div className="ml-2 mt-1">
                {data.dietaryRestrictions.map((restriction: string, index: number) => (
                  <span key={index} className="inline-block bg-primary-100 text-primary-800 px-2 py-1 rounded mr-2 mb-2 capitalize">
                    {restriction.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.accessibilityNeeds && (
            <div>
              <span className="font-medium text-gray-700">Accessibility Needs:</span>
              <p className="ml-2 text-gray-900 mt-1">{data.accessibilityNeeds}</p>
            </div>
          )}
          {data.tshirtSize && (
            <div>
              <span className="font-medium text-gray-700">T-Shirt Size:</span>
              <span className="ml-2 text-gray-900 uppercase">{data.tshirtSize}</span>
            </div>
          )}
          {data.medicalConditions && (
            <div>
              <span className="font-medium text-gray-700">Medical Conditions:</span>
              <p className="ml-2 text-gray-900 mt-1">{data.medicalConditions}</p>
            </div>
          )}
          {data.bloodType && (
            <div>
              <span className="font-medium text-gray-700">Blood Type:</span>
              <span className="ml-2 text-gray-900">{data.bloodType.toUpperCase().replace(/-/g, '')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}