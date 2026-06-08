import type { Payload } from 'payload'
import {
  getRegistrationPackage,
  getRegistrationPricingTier,
  isRegistrationPackageId,
  packageUsdForTier,
  registrationPackageDisplayName,
  type RegistrationPackageId,
} from '@/lib/registrationPackages'
import {
  registrationFeePaymentDue,
  registrationManualBankPaymentEnabled,
  registrationPackageAmountUsd,
} from '@/lib/registrationBankTransfer'
import { registrationRequiresHostedPayment, publicSiteOrigin } from '@/lib/stanbic/ngenius'

export type ResumePaymentRegistration = {
  id: string
  registrationId: string
  firstName: string
  lastName: string
  email: string
  paymentStatus: string
  registrationPackage: RegistrationPackageId | null
  category: string | null
  needsPackage: boolean
  packageName: string | null
  amountUsd: number | null
  hostedPaymentAvailable: boolean
  manualBankPayment: boolean
  completePaymentUrl: string
}

export function completePaymentPageUrl(registrationId?: string): string {
  const base = `${publicSiteOrigin()}/participate/register/complete-payment`
  if (registrationId?.trim()) {
    return `${base}?ref=${encodeURIComponent(registrationId.trim())}`
  }
  return base
}

/** Map legacy category-only registrations to a sensible default package. */
export function suggestedPackageForCategory(category: unknown): RegistrationPackageId | null {
  if (typeof category !== 'string') return null
  switch (category.trim().toLowerCase()) {
    case 'student':
      return 'student_youth_shared'
    case 'researcher':
    case 'policymaker':
    case 'partner':
      return 'institutions_partners'
    case 'observer':
      return 'day_pass'
    default:
      return null
  }
}

function hasDeletedAt(reg: { deletedAt?: unknown }): boolean {
  const deletedAt = reg.deletedAt
  return deletedAt != null && deletedAt !== ''
}

/** Why a registration is inactive, if applicable. */
export function registrationInactiveReason(reg: {
  status?: unknown
  deletedAt?: unknown
}): string | null {
  if (reg.status === 'cancelled') {
    return hasDeletedAt(reg)
      ? 'Soft-deleted (status: Cancelled)'
      : 'Registration status is Cancelled'
  }
  if (hasDeletedAt(reg)) return 'Soft-deleted'
  return null
}

/** Active registrations eligible for outreach (not cancelled or soft-deleted). */
export function registrationIsActive(reg: {
  status?: unknown
  deletedAt?: unknown
}): boolean {
  return registrationInactiveReason(reg) == null
}

export function registrationNeedsPayment(reg: {
  paymentStatus?: unknown
  status?: unknown
  deletedAt?: unknown
}): boolean {
  if (!registrationIsActive(reg)) return false
  const ps = reg.paymentStatus
  if (ps === 'paid' || ps === 'waived') return false
  if (!registrationFeePaymentDue()) return false
  return true
}

/** Billable registration fee for reporting (0 when cancelled or soft-deleted). */
export function registrationFeeUsd(reg: {
  registrationPackage?: unknown
  paymentStatus?: unknown
  createdAt?: unknown
  status?: unknown
  deletedAt?: unknown
}): number {
  if (!registrationIsActive(reg)) return 0
  if (reg.paymentStatus === 'waived') return 0
  const pkg = reg.registrationPackage
  if (!isRegistrationPackageId(pkg)) return 0
  const tier = getRegistrationPricingTier(
    reg.createdAt ? new Date(String(reg.createdAt)) : new Date(),
  )
  return packageUsdForTier(getRegistrationPackage(pkg), tier)
}

function feeForRegistration(reg: {
  registrationPackage?: unknown
  createdAt?: unknown
}): { packageName: string | null; amountUsd: number | null } {
  const pkg = reg.registrationPackage
  if (!isRegistrationPackageId(pkg)) {
    return { packageName: null, amountUsd: null }
  }
  const tier = getRegistrationPricingTier(
    reg.createdAt ? new Date(String(reg.createdAt)) : new Date(),
  )
  const def = getRegistrationPackage(pkg)
  return {
    packageName: def.name,
    amountUsd: packageUsdForTier(def, tier),
  }
}

export async function findRegistrationForResumePayment(
  payload: Payload,
  params: { registrationId: string; email: string },
): Promise<ResumePaymentRegistration | null> {
  const registrationId = params.registrationId.trim()
  const email = params.email.trim().toLowerCase()
  if (!registrationId || !email) return null

  const found = await payload.find({
    collection: 'registrations',
    where: {
      and: [
        { registrationId: { equals: registrationId } },
        { email: { equals: email } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  })

  const doc = found.docs[0] as Record<string, unknown> | undefined
  if (!doc || !registrationIsActive(doc)) return null

  const humanId =
    typeof doc.registrationId === 'string' ? doc.registrationId : registrationId
  const pkgRaw = doc.registrationPackage
  const hasPackage = isRegistrationPackageId(pkgRaw)
  const { packageName, amountUsd } = feeForRegistration(doc)

  return {
    id: String(doc.id),
    registrationId: humanId,
    firstName: typeof doc.firstName === 'string' ? doc.firstName : '',
    lastName: typeof doc.lastName === 'string' ? doc.lastName : '',
    email: typeof doc.email === 'string' ? doc.email : email,
    paymentStatus: typeof doc.paymentStatus === 'string' ? doc.paymentStatus : 'pending',
    registrationPackage: hasPackage ? pkgRaw : null,
    category: typeof doc.category === 'string' ? doc.category : null,
    needsPackage: !hasPackage,
    packageName,
    amountUsd,
    hostedPaymentAvailable: registrationRequiresHostedPayment(),
    manualBankPayment: registrationManualBankPaymentEnabled(),
    completePaymentUrl: completePaymentPageUrl(humanId),
  }
}

export async function assignRegistrationPackage(
  payload: Payload,
  registrationPayloadId: string,
  packageId: RegistrationPackageId,
): Promise<void> {
  await payload.update({
    collection: 'registrations',
    id: registrationPayloadId,
    data: { registrationPackage: packageId },
    overrideAccess: true,
  })
}

export function paymentDueEmailAmount(reg: {
  registrationPackage?: unknown
  category?: unknown
}): { packageName: string | null; amountUsd: number | null } {
  if (isRegistrationPackageId(reg.registrationPackage)) {
    return {
      packageName: registrationPackageDisplayName(reg.registrationPackage),
      amountUsd: registrationPackageAmountUsd(reg.registrationPackage),
    }
  }
  const suggested = suggestedPackageForCategory(reg.category)
  if (suggested) {
    const def = getRegistrationPackage(suggested)
    return {
      packageName: `${def.name} (confirm on payment page)`,
      amountUsd: registrationPackageAmountUsd(suggested),
    }
  }
  return { packageName: null, amountUsd: null }
}
