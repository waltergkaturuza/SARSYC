/**
 * SARSYC VI registration packages — amounts in USD (whole dollars in source; minor units are cents).
 * Early bird: opens 15 May 2026, closes 15 July 2026. Late: 16 July – 31 July 2026.
 * Before early-bird officially opens we still bill the early rate so the form can open earlier.
 */

export const REGISTRATION_SCHEDULE = {
  earlyOpens: '15 May 2026',
  earlyCloses: '15 July 2026',
  lateOpens: '16 July 2026',
  lateCloses: '31 July 2026',
  earlyWindowLabel: '15 May – 15 July 2026',
  lateWindowLabel: '16 – 31 July 2026',
} as const

export type RegistrationPricingTier = 'early' | 'late' | 'closed'

/** Package keys persisted on registrations.registrationPackage */
export const REGISTRATION_PACKAGE_IDS = [
  'student_youth_shared',
  'institutions_partners',
  'half_package',
  'half_package_youth',
  'day_pass',
] as const

export type RegistrationPackageId = (typeof REGISTRATION_PACKAGE_IDS)[number]

export type RegistrationPackageDef = {
  id: RegistrationPackageId
  name: string
  description: string
  /** Whole USD (major units); minor = value * 100 for USD */
  earlyUsd: number
  lateUsd: number
}

export const REGISTRATION_PACKAGES: RegistrationPackageDef[] = [
  {
    id: 'student_youth_shared',
    name: 'Students / Youth Discount',
    description:
      'Shared accommodation incl. breakfast × 4 nights. Conference package (meals incl. dinner) × 3 days, t-shirt, and IEC materials.',
    earlyUsd: 450,
    lateUsd: 500,
  },
  {
    id: 'institutions_partners',
    name: 'Institutions / Partners',
    description:
      'Non-sharing accommodation incl. breakfast × 4 nights. Conference package (meals incl. dinner) × 3 days, t-shirt, and IEC materials.',
    earlyUsd: 500,
    lateUsd: 600,
  },
  {
    id: 'half_package',
    name: 'Half Package',
    description:
      'Conference package (meals excl. dinner) × 3 days, t-shirt, and IEC materials.',
    earlyUsd: 300,
    lateUsd: 350,
  },
  {
    id: 'half_package_youth',
    name: 'Half Package — Youth Discount',
    description:
      'Conference package (meals excl. dinner) × 3 days, t-shirt, and IEC materials.',
    earlyUsd: 200,
    lateUsd: 250,
  },
  {
    id: 'day_pass',
    name: 'Day Pass',
    description: 'Conference package, t-shirt, and IEC materials.',
    earlyUsd: 100,
    lateUsd: 120,
  },
]

const PACKAGE_MAP = Object.fromEntries(
  REGISTRATION_PACKAGES.map((p) => [p.id, p]),
) as Record<RegistrationPackageId, RegistrationPackageDef>

export function isRegistrationPackageId(id: unknown): id is RegistrationPackageId {
  return typeof id === 'string' && (REGISTRATION_PACKAGE_IDS as readonly string[]).includes(id)
}

export function assertValidPackage(id: unknown): asserts id is RegistrationPackageId {
  if (!isRegistrationPackageId(id)) {
    throw new Error('Invalid registration package')
  }
}

export function registrationPackageDisplayName(id: string | undefined | null): string {
  if (!id) return '—'
  if (!isRegistrationPackageId(id)) return id
  return getRegistrationPackage(id).name
}

export function getRegistrationPackage(id: RegistrationPackageId): RegistrationPackageDef {
  return PACKAGE_MAP[id]
}

/** Early bird inclusive; late period inclusive; closed after late period. */
export function getRegistrationPricingTier(now: Date = new Date()): RegistrationPricingTier {
  const y = now.getUTCFullYear()
  const m = now.getUTCMonth()
  const d = now.getUTCDate()
  const ts = Date.UTC(y, m, d)

  const earlyStart = Date.UTC(2026, 4, 15) // 15 May 2026
  const earlyEnd = Date.UTC(2026, 6, 15) // 15 July 2026
  const lateStart = Date.UTC(2026, 6, 16) // 16 July 2026
  const lateEnd = Date.UTC(2026, 6, 31) // 31 July 2026
  const afterLate = Date.UTC(2026, 7, 1) // 1 Aug 2026

  if (y > 2026 || ts >= afterLate) return 'closed'
  if (ts >= lateStart && ts <= lateEnd) return 'late'
  if (ts >= earlyStart && ts <= earlyEnd) return 'early'

  // Before 15 May 2026 — same as early pricing so registration can open early
  if (y < 2026 || ts < earlyStart) return 'early'

  return 'closed'
}

export function packageUsdForTier(pkg: RegistrationPackageDef, tier: RegistrationPricingTier): number {
  if (tier === 'closed') return 0
  return tier === 'late' ? pkg.lateUsd : pkg.earlyUsd
}

/** N-Genius minor units — USD ⇒ cents */
export function usdToUsdMinor(usdWhole: number): number {
  return Math.round(usdWhole * 100)
}

export function minorAmountForPackage(
  packageId: RegistrationPackageId,
  tier: RegistrationPricingTier,
): number {
  if (tier === 'closed') return 0
  const pkg = getRegistrationPackage(packageId)
  const usd = packageUsdForTier(pkg, tier)
  return usdToUsdMinor(usd)
}

export function currencyForPayments(): string {
  return (process.env.REGISTRATION_FEE_CURRENCY || 'USD').trim().toUpperCase() || 'USD'
}
