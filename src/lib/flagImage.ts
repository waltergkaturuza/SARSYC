/** Flag CDN URLs (same source as SARSYC journey timeline cards). */
export function flagImageUrl(countryCode: string, width = 160): string {
  const code = countryCode.trim().toLowerCase()
  if (!code) return ''
  return `https://flagcdn.com/w${width}/${code}.png`
}
