import { getCountryLabel, countries } from '@/lib/countries'
import { flagImageUrl } from '@/lib/flagImage'

export function resolveCountryCode(countryOrCode: string): string {
  if (!countryOrCode?.trim()) return ''
  const trimmed = countryOrCode.trim()
  const upper = trimmed.toUpperCase()
  const byCode = countries.find((c) => c.value === upper)
  if (byCode) return byCode.value
  const byLabel = countries.find((c) => c.label === trimmed)
  return byLabel?.value ?? ''
}

type CountryFlagProps = {
  /** ISO code (e.g. BW) or full country name (e.g. Botswana) */
  countryOrCode: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeConfig = {
  sm: { width: 80, className: 'h-6 w-8' },
  md: { width: 120, className: 'h-8 w-11' },
  lg: { width: 160, className: 'h-10 w-14' },
} as const

export default function CountryFlag({
  countryOrCode,
  size = 'md',
  className = '',
}: CountryFlagProps) {
  const code = resolveCountryCode(countryOrCode)
  if (!code) return null

  const { width, className: sizeClass } = sizeConfig[size]
  const label = getCountryLabel(code)

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external flag CDN (matches journey timeline)
    <img
      src={flagImageUrl(code, width)}
      srcSet={`${flagImageUrl(code, width * 2)} 2x`}
      alt={`${label} flag`}
      width={width === 80 ? 32 : width === 120 ? 44 : 56}
      height={width === 80 ? 24 : width === 120 ? 33 : 42}
      className={`${sizeClass} shrink-0 rounded object-cover shadow-sm border border-gray-200 bg-white ${className}`.trim()}
      loading="lazy"
      decoding="async"
    />
  )
}
