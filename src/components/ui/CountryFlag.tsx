'use client'

import { useState } from 'react'
import { getCountryLabel, countries } from '@/lib/countries'
import {
  flagDimensions,
  flagImageUrl,
  flagImageUrlFallback,
  flagImageUrlRetina,
  type FlagDisplaySize,
} from '@/lib/flagImage'

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
  size?: FlagDisplaySize
  className?: string
}

const sizeClass: Record<FlagDisplaySize, string> = {
  sm: 'h-6 w-8',
  md: 'h-9 w-12',
  lg: 'h-12 w-16',
}

export default function CountryFlag({
  countryOrCode,
  size = 'md',
  className = '',
}: CountryFlagProps) {
  const code = resolveCountryCode(countryOrCode)
  const [useFallback, setUseFallback] = useState(false)

  if (!code) return null

  const dims = flagDimensions(size)
  const label = getCountryLabel(code)
  const src = useFallback ? flagImageUrlFallback(code, 80) : flagImageUrl(code, size)
  const srcSet = useFallback
    ? undefined
    : `${flagImageUrlRetina(code, size)} 2x`

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external flag CDN
    <img
      src={src}
      srcSet={srcSet}
      alt={`${label} flag`}
      width={dims.width}
      height={dims.height}
      className={`${sizeClass[size]} shrink-0 rounded object-cover shadow-sm border border-gray-200 bg-white ${className}`.trim()}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (!useFallback) setUseFallback(true)
      }}
    />
  )
}
