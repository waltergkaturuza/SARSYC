import { createMediaFromBlobUrl } from '@/lib/createMediaFromUrl'

type GalleryInputItem = {
  mediaId?: string | number | null
  image?: string | number | { id?: string | number } | null
  url?: string | null
  caption?: string | null
}

/**
 * Resolve conference gallery rows: create media from new Blob URLs, keep existing IDs.
 */
export async function resolveConferenceGallery(
  payload: unknown,
  items: GalleryInputItem[] | undefined,
  conferenceTitle: string,
): Promise<Array<{ image: string | number; caption: string | null }>> {
  if (!Array.isArray(items) || items.length === 0) return []

  const gallery: Array<{ image: string | number; caption: string | null }> = []

  for (const item of items) {
    if (!item || typeof item !== 'object') continue

    let imageId: string | number | null | undefined =
      item.mediaId ??
      (typeof item.image === 'object' && item.image ? item.image.id : item.image)

    const url = typeof item.url === 'string' ? item.url : ''
    const caption = item.caption?.trim() || null

    if ((!imageId || imageId === 'new') && url.startsWith('https://')) {
      imageId = await createMediaFromBlobUrl(
        payload,
        url,
        caption || `${conferenceTitle} photo`,
      )
    }

    if (imageId != null && String(imageId).length > 0 && imageId !== 'new') {
      gallery.push({ image: imageId, caption })
    }
  }

  return gallery
}

export function normalizeConferenceBody(body: any) {
  return {
    title: body.title,
    slug: body.slug,
    year: Number(body.year),
    location: body.location,
    theme: body.theme || null,
    summary: body.summary,
    participants: body.participants || null,
    highlights: body.highlights || null,
    content: body.content || null,
    startDate: body.startDate || null,
    endDate: body.endDate || null,
    isCurrent: Boolean(body.isCurrent),
    currentPath: body.currentPath || null,
    status: body.status === 'draft' || body.status === 'archived' ? body.status : 'published',
    keyOutcomes: Array.isArray(body.keyOutcomes) ? body.keyOutcomes : [],
    relatedLinks: Array.isArray(body.relatedLinks) ? body.relatedLinks : [],
  }
}
