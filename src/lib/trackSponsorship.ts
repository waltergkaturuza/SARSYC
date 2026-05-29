import {
  getRegistrationPackage,
  getRegistrationPricingTier,
  packageUsdForTier,
} from '@/lib/registrationPackages'

/** USD fee per student/youth registration package (current pricing window). */
export function studentSponsorshipRateUsd(now: Date = new Date()): number {
  const tier = getRegistrationPricingTier(now)
  const pkg = getRegistrationPackage('student_youth_shared')
  return packageUsdForTier(pkg, tier)
}

export function trackSponsorshipAmountUsd(params: {
  mode: 'students' | 'custom_amount'
  studentCount?: number
  customAmountUsd?: number
  now?: Date
}): number {
  if (params.mode === 'custom_amount') {
    const amt = params.customAmountUsd ?? 0
    return amt > 0 ? amt : 0
  }
  const count = Math.max(0, Math.floor(params.studentCount ?? 0))
  if (count < 1) return 0
  return count * studentSponsorshipRateUsd(params.now)
}
