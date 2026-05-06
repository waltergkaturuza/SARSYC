/**
 * SARSYC VI registration packages — amounts in USD (whole dollars in source; minor units are cents).
 * Early bird: opens 1 May 2026, closes 30 June 2026. Late: 1 July – 31 July 2026.
 * Before early-bird officially opens we still bill the early rate so the form can open earlier.
 */

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

  const asDay = () => ({
    ts: Date.UTC(y, m, d),
    julyDone: Date.UTC(y, 6, 31),
    afterLate: Date.UTC(y, 7, 1), // Aug 1
  })
  const { ts, afterLate } = asDay()

  // Late window: July 1 – July 31 (UTC calendar day granularity)
  if (y === 2026 && m === 6 && d >= 1 && d <= 31) return 'late'
  if (y > 2026 || (y === 2026 && ts >= afterLate)) return 'closed'

  // Early window official: May 1 – June 30, 2026
  const may1 = Date.UTC(2026, 4, 1)
  const june30 = Date.UTC(2026, 5, 30)
  if (ts >= may1 && ts <= june30) return 'early'

  // Before May 2026 — same as early pricing so registration can open early
  if (ts < may1 && y <= 2026) return 'early'

  return 'early'
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
