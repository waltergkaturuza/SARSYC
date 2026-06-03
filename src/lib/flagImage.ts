/** Flag CDN URLs (Flagpedia / flagcdn.com — same source as journey timeline). */

export type FlagDisplaySize = 'sm' | 'md' | 'lg'

const FLAG_DIMENSIONS: Record<
  FlagDisplaySize,
  { standard: string; retina: string; width: number; height: number }
> = {
  sm: { standard: '32x24', retina: '64x48', width: 32, height: 24 },
  md: { standard: '48x36', retina: '96x72', width: 48, height: 36 },
  lg: { standard: '64x48', retina: '128x96', width: 64, height: 48 },
}

/** Primary flag URL (aspect-ratio format — reliable for all ISO codes). */
export function flagImageUrl(countryCode: string, size: FlagDisplaySize = 'md'): string {
  const code = countryCode.trim().toLowerCase()
  if (!code) return ''
  const dims = FLAG_DIMENSIONS[size]
  return `https://flagcdn.com/${dims.standard}/${code}.png`
}

export function flagImageUrlRetina(countryCode: string, size: FlagDisplaySize = 'md'): string {
  const code = countryCode.trim().toLowerCase()
  if (!code) return ''
  const dims = FLAG_DIMENSIONS[size]
  return `https://flagcdn.com/${dims.retina}/${code}.png`
}

/** Fallback width-based URL if aspect-ratio asset fails. */
export function flagImageUrlFallback(countryCode: string, width = 80): string {
  const code = countryCode.trim().toLowerCase()
  if (!code) return ''
  return `https://flagcdn.com/w${width}/${code}.png`
}

export function flagDimensions(size: FlagDisplaySize = 'md') {
  return FLAG_DIMENSIONS[size]
}
