/** Resolve a Payload media object to a public HTTPS URL safe for Next/Image (Blob-first). */
export function getMediaDisplayUrl(media: unknown): string | null {
  if (!media) return null

  const fixDomain = (url: string): string => {
    if (url.includes('sarsyc.org') && !url.includes('www.sarsyc.org')) {
      return url.replace('https://sarsyc.org', 'https://www.sarsyc.org')
    }
    return url
  }

  const isBlobUrl = (url: string): boolean =>
    url.includes('blob.vercel-storage.com') || url.includes('public.blob.vercel-storage.com')

  const isPayloadFileUrl = (url: string): boolean => url.includes('/api/media/file/')

  if (typeof media === 'string') {
    if (!media.startsWith('http')) return null
    if (isPayloadFileUrl(media)) return null
    return fixDomain(media)
  }

  if (typeof media !== 'object' || media === null) return null

  const photo = media as {
    url?: string
    thumbnailURL?: string
    sizes?: {
      card?: { url?: string }
      thumbnail?: { url?: string }
      hero?: { url?: string }
    }
  }

  if (photo.thumbnailURL && isBlobUrl(photo.thumbnailURL)) {
    return fixDomain(photo.thumbnailURL)
  }

  if (photo.url) {
    if (isBlobUrl(photo.url)) return fixDomain(photo.url)
    if (isPayloadFileUrl(photo.url)) {
      for (const size of [photo.sizes?.hero, photo.sizes?.card, photo.sizes?.thumbnail]) {
        if (size?.url && isBlobUrl(size.url)) return fixDomain(size.url)
      }
      return null
    }
    if (photo.url.startsWith('http')) return fixDomain(photo.url)
  }

  for (const size of [photo.sizes?.hero, photo.sizes?.card, photo.sizes?.thumbnail]) {
    if (size?.url && !isPayloadFileUrl(size.url)) {
      return fixDomain(size.url)
    }
  }

  return null
}

/** Resolve a media upload (image or document) to a public download/view URL. */
export function getMediaDocumentLink(
  media: unknown,
  fallbackLabel = 'View document',
): { href: string; label: string } | null {
  const href = getMediaDisplayUrl(media)
  if (!href) return null

  let label = fallbackLabel
  if (typeof media === 'object' && media !== null) {
    const filename = (media as { filename?: string }).filename
    const alt = (media as { alt?: string }).alt
    if (filename) label = filename
    else if (alt) label = alt
  }

  return { href, label }
}
