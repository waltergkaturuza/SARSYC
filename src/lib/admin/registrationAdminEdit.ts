import { REGISTRATION_PACKAGES } from '@/lib/registrationPackages'

export const REGISTRATION_PACKAGE_OPTIONS = REGISTRATION_PACKAGES.map((p) => ({
  value: p.id,
  label: p.name,
}))

export const PARTICIPATION_CATEGORIES = [
  { value: 'student', label: 'Student / Youth Delegate' },
  { value: 'researcher', label: 'Young Researcher' },
  { value: 'policymaker', label: 'Policymaker / Government Official' },
  { value: 'partner', label: 'Development Partner' },
  { value: 'observer', label: 'Observer' },
] as const

export const TSHIRT_SIZES = [
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
  { value: 'xxl', label: 'XXL' },
] as const

export const DIETARY_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'gluten-free', label: 'Gluten-free' },
  { value: 'other', label: 'Other' },
] as const

export const BLOOD_TYPE_OPTIONS = [
  { value: 'a-positive', label: 'A+' },
  { value: 'a-negative', label: 'A-' },
  { value: 'b-positive', label: 'B+' },
  { value: 'b-negative', label: 'B-' },
  { value: 'ab-positive', label: 'AB+' },
  { value: 'ab-negative', label: 'AB-' },
  { value: 'o-positive', label: 'O+' },
  { value: 'o-negative', label: 'O-' },
  { value: 'unknown', label: 'Unknown' },
] as const

export const EMERGENCY_RELATIONSHIP_OPTIONS = [
  { value: 'spouse-partner', label: 'Spouse / Partner' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'child', label: 'Child' },
  { value: 'other-relative', label: 'Other Relative' },
  { value: 'friend', label: 'Friend' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'other', label: 'Other' },
] as const

export const NATIONAL_ID_TYPE_OPTIONS = [
  { value: 'national-id', label: 'National ID' },
  { value: 'drivers-license', label: "Driver's License" },
  { value: 'other', label: 'Other Government ID' },
] as const

export const VISA_STATUS_OPTIONS = [
  { value: 'not-applied', label: 'Not Applied' },
  { value: 'applied-pending', label: 'Applied – Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
] as const

/** Fields the custom admin edit form may update */
export const ADMIN_REGISTRATION_EDIT_FIELDS = [
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
  'organizationPosition',
  'isInternational',
  'passportNumber',
  'passportExpiry',
  'passportIssuingCountry',
  'visaRequired',
  'visaStatus',
  'visaApplicationDate',
  'visaNumber',
  'visaInvitationLetterRequired',
  'nationalIdNumber',
  'nationalIdType',
  'emergencyContactName',
  'emergencyContactRelationship',
  'emergencyContactPhone',
  'emergencyContactEmail',
  'emergencyContactAddress',
  'emergencyContactCountry',
  'emergencyContactCity',
  'emergencyContactPostalCode',
  'arrivalDate',
  'departureDate',
  'flightNumber',
  'travelInsuranceProvider',
  'travelInsurancePolicyNumber',
  'travelInsuranceExpiry',
  'accommodationRequired',
  'accommodationPreferences',
  'hasHealthInsurance',
  'insuranceProvider',
  'insurancePolicyNumber',
  'medicalConditions',
  'bloodType',
  'registrationPackage',
  'category',
  'dietaryRestrictions',
  'accessibilityNeeds',
  'tshirtSize',
  'status',
  'paymentStatus',
  'securityCheckStatus',
  'securityCheckNotes',
  'safeguardingAcknowledgedAt',
  'notes',
] as const

const DIETARY_VALUES = new Set(DIETARY_OPTIONS.map((o) => o.value))

function normalizeDietaryRestrictions(value: unknown): string[] {
  if (value == null) return []
  const raw = Array.isArray(value) ? value : typeof value === 'string' && value ? [value] : []
  return raw
    .map((v) => String(v).trim().toLowerCase())
    .filter((v) => DIETARY_VALUES.has(v as (typeof DIETARY_OPTIONS)[number]['value']))
}

function emptyToUndefined(value: unknown): unknown {
  if (value === '' || value === null) return undefined
  return value
}

function boolField(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

export function pickAdminRegistrationUpdate(body: Record<string, unknown>): Record<string, unknown> {
  const data: Record<string, unknown> = {}

  for (const key of ADMIN_REGISTRATION_EDIT_FIELDS) {
    if (!(key in body)) continue
    const value = body[key]

    if (key === 'dietaryRestrictions') {
      data[key] = normalizeDietaryRestrictions(value)
      continue
    }

    if (
      key === 'isInternational' ||
      key === 'visaRequired' ||
      key === 'visaInvitationLetterRequired' ||
      key === 'accommodationRequired' ||
      key === 'hasHealthInsurance'
    ) {
      const b = boolField(value)
      if (b !== undefined) data[key] = b
      continue
    }

    data[key] = emptyToUndefined(value)
  }

  return data
}

export function normalizeRegistrationForm(doc: Record<string, unknown>): Record<string, unknown> {
  const dietary = doc.dietaryRestrictions
  return {
    ...doc,
    dietaryRestrictions: Array.isArray(dietary)
      ? dietary.map(String)
      : typeof dietary === 'string' && dietary
        ? [dietary]
        : [],
    isInternational: Boolean(doc.isInternational),
    visaRequired: Boolean(doc.visaRequired),
    visaInvitationLetterRequired: doc.visaInvitationLetterRequired !== false,
    accommodationRequired: Boolean(doc.accommodationRequired),
    hasHealthInsurance: Boolean(doc.hasHealthInsurance),
  }
}

export function buildAdminRegistrationPatch(form: Record<string, unknown>): Record<string, unknown> {
  return pickAdminRegistrationUpdate(form)
}
