import { createMediaFromBlobUrl } from '@/lib/createMediaFromUrl'
import { mediaIdForPayload } from '@/lib/newsFeaturedMediaUpload'
import { randomBytes } from 'crypto'
import postgres from 'postgres'
import type { Payload } from 'payload'

type GalleryInputItem = {
  mediaId?: string | number | null
  image?: string | number | { id?: string | number } | null
  url?: string | null
  caption?: string | null
  id?: string | null
}

export type ConferenceGalleryRow = {
  id: string
  image: number
  caption: string | null
}

type PayloadLike = {
  findByID?: (args: any) => Promise<any>
}

/**
 * Resolve conference gallery rows: create media from new Blob URLs, keep existing IDs.
 * Returns numeric media IDs (required by Payload postgres upload validation).
 */
export async function resolveConferenceGallery(
  payload: PayloadLike | unknown,
  items: GalleryInputItem[] | undefined,
  conferenceTitle: string,
): Promise<ConferenceGalleryRow[]> {
  if (!Array.isArray(items) || items.length === 0) return []

  const gallery: ConferenceGalleryRow[] = []

  for (const [index, item] of items.entries()) {
    if (!item || typeof item !== 'object') continue

    let imageId: string | number | null | undefined =
      item.mediaId ??
      (typeof item.image === 'object' && item.image ? item.image.id : item.image)

    const url = typeof item.url === 'string' ? item.url.trim() : ''
    const caption = item.caption?.trim() || null
    const rowId =
      (typeof item.id === 'string' && item.id.trim()) ||
      `gallery-${Date.now()}-${index}-${randomBytes(4).toString('hex')}`

    if ((!imageId || imageId === 'new') && url.startsWith('https://')) {
      try {
        imageId = await createMediaFromBlobUrl(
          payload,
          url,
          caption || `${conferenceTitle} photo`,
        )
      } catch (err: any) {
        throw new Error(
          `Failed to create media for gallery image ${index + 1}: ${err?.message || 'unknown error'}`,
        )
      }
    }

    if (imageId == null || String(imageId).length === 0 || imageId === 'new') {
      throw new Error(
        `Gallery image ${index + 1} is missing. Please re-upload the photo and try again.`,
      )
    }

    const payloadImageId = mediaIdForPayload(imageId)
    const numericImageId = Number(payloadImageId)
    if (!Number.isFinite(numericImageId)) {
      throw new Error(
        `Gallery image ${index + 1} has an invalid media id (${payloadImageId}). Please re-upload.`,
      )
    }

    // Confirm the media row exists so relationship integrity holds
    if (payload && typeof (payload as PayloadLike).findByID === 'function') {
      try {
        await (payload as PayloadLike).findByID!({
          collection: 'media',
          id: numericImageId,
          depth: 0,
          overrideAccess: true,
        })
      } catch {
        throw new Error(
          `Gallery image ${index + 1} media record (${numericImageId}) was not found. Please re-upload the photo.`,
        )
      }
    }

    gallery.push({
      id: rowId,
      image: numericImageId,
      caption,
    })
  }

  return gallery
}

/**
 * Write gallery rows directly to Postgres.
 * Avoids Payload upload-array validation rejecting string media IDs / missing drizzle mappings.
 */
export async function syncConferenceGallery(
  _payload: Payload | unknown,
  conferenceId: string | number,
  gallery: ConferenceGalleryRow[],
): Promise<void> {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL not configured')

  const parentId = Number(conferenceId)
  if (!Number.isFinite(parentId)) {
    throw new Error(`Invalid conference id: ${conferenceId}`)
  }

  const sql = postgres(dbUrl, { max: 1 })
  try {
    await sql`DELETE FROM "conferences_gallery" WHERE "_parent_id" = ${parentId}`

    for (const [order, row] of gallery.entries()) {
      const imageId = Number(row.image)
      if (!Number.isFinite(imageId)) {
        throw new Error(`Invalid gallery image id at position ${order + 1}`)
      }
      await sql`
        INSERT INTO "conferences_gallery" ("_order", "_parent_id", "id", "caption", "image_id")
        VALUES (${order + 1}, ${parentId}, ${row.id}, ${row.caption}, ${imageId})
      `
    }
  } finally {
    await sql.end()
  }
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
