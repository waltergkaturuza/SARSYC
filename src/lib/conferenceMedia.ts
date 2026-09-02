import { countries } from '@/lib/countries'

/** Host / venue phrases → ISO country code (journey hosts + common cities). */
const HOST_LOCATION_ALIASES: Array<{ match: string; code: string }> = [
  { match: 'university of zambia', code: 'ZM' },
  { match: 'university of botswana', code: 'BW' },
  { match: 'university of johannesburg', code: 'ZA' },
  { match: 'university of namibia', code: 'NA' },
  { match: 'luanar', code: 'MW' },
  { match: 'nipam', code: 'NA' },
  { match: 'windhoek', code: 'NA' },
  { match: 'harare', code: 'ZW' },
  { match: 'bulawayo', code: 'ZW' },
  { match: 'lilongwe', code: 'MW' },
  { match: 'lusaka', code: 'ZM' },
  { match: 'gaborone', code: 'BW' },
  { match: 'johannesburg', code: 'ZA' },
  { match: 'cape town', code: 'ZA' },
]

/**
 * Resolve host-country ISO code from a conference location string
 * (e.g. "LUANAR, Malawi", "University of Zambia", "Zimbabwe").
 */
export function resolveConferenceHostCountry(location: string | null | undefined): string {
  const raw = (location || '').trim()
  if (!raw) return ''
  const lower = raw.toLowerCase()

  const exact = countries.find(
    (c) => c.value.toLowerCase() === lower || c.label.toLowerCase() === lower,
  )
  if (exact) return exact.value

  for (const alias of HOST_LOCATION_ALIASES) {
    if (lower.includes(alias.match)) return alias.code
  }

  const byLabelLength = [...countries].sort((a, b) => b.label.length - a.label.length)
  for (const c of byLabelLength) {
    if (lower.includes(c.label.toLowerCase())) return c.value
  }

  const afterComma = raw.split(',').pop()?.trim()
  if (afterComma && afterComma.toLowerCase() !== lower) {
    return resolveConferenceHostCountry(afterComma)
  }

  return ''
}

/**
 * Resolve a displayable URL from a Payload media relation (Blob-first).
 */
export function getConferenceMediaUrl(photo: unknown): string | null {
  if (!photo) return null

  const isBlobUrl = (url: string) => url.includes('blob.vercel-storage.com')
  const isPayloadFileUrl = (url: string) => url.includes('/api/media/file/')
  const fixDomain = (url: string) => url

  if (typeof photo === 'string') {
    if (photo.startsWith('http') && !isPayloadFileUrl(photo)) return fixDomain(photo)
    if (photo.startsWith('/')) return photo
    return null
  }

  const record = photo as {
    url?: string | null
    thumbnailURL?: string | null
    sizes?: {
      card?: { url?: string | null }
      thumbnail?: { url?: string | null }
      hero?: { url?: string | null }
    }
  }

  if (record.thumbnailURL && typeof record.thumbnailURL === 'string') {
    if (isBlobUrl(record.thumbnailURL)) return fixDomain(record.thumbnailURL)
  }

  if (record.url && typeof record.url === 'string') {
    if (isBlobUrl(record.url)) return fixDomain(record.url)
    if (isPayloadFileUrl(record.url)) {
      if (record.sizes?.card?.url && isBlobUrl(record.sizes.card.url)) {
        return fixDomain(record.sizes.card.url)
      }
      if (record.sizes?.hero?.url && isBlobUrl(record.sizes.hero.url)) {
        return fixDomain(record.sizes.hero.url)
      }
      if (record.sizes?.thumbnail?.url && isBlobUrl(record.sizes.thumbnail.url)) {
        return fixDomain(record.sizes.thumbnail.url)
      }
      return null
    }
    return fixDomain(record.url)
  }

  for (const size of [record.sizes?.hero, record.sizes?.card, record.sizes?.thumbnail]) {
    if (size?.url && !isPayloadFileUrl(size.url)) return fixDomain(size.url)
  }

  return null
}

export type ConferenceGallerySlide = {
  src: string
  alt: string
  caption?: string
}

export function getConferenceGallerySlides(
  conference: { title?: string; gallery?: unknown },
): ConferenceGallerySlide[] {
  const gallery = Array.isArray(conference?.gallery) ? conference.gallery : []
  const slides: ConferenceGallerySlide[] = []

  for (const row of gallery) {
    if (!row || typeof row !== 'object') continue
    const item = row as { image?: unknown; caption?: string | null }
    const src = getConferenceMediaUrl(item.image)
    if (!src) continue
    slides.push({
      src,
      alt: item.caption?.trim() || `${conference.title || 'Conference'} photo`,
      caption: item.caption?.trim() || undefined,
    })
  }

  return slides
}
