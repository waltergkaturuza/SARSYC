import { put } from '@vercel/blob'
import type { Payload } from 'payload/types'

function inferMimeType(file: File, ext: string): string {
  if (file.type) return file.type
  switch (ext) {
    case 'pdf':
      return 'application/pdf'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    case 'svg':
      return 'image/svg+xml'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    default:
      return 'application/octet-stream'
  }
}

/**
 * Creates a `media` document for a news featured asset.
 * Prefer Vercel Blob + URL-only media (avoids Sharp/Buffer issues with `file` in API routes).
 * Falls back to buffer-attached file for local dev without `BLOB_READ_WRITE_TOKEN`.
 */
export async function createNewsFeaturedMedia(
  payload: Payload,
  file: File,
  alt: string,
): Promise<string> {
  const slug =
    alt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50) || 'featured'
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  if (blobToken) {
    const pathname = `News/featured/${slug}-${Date.now()}.${ext}`
    const blob = await put(pathname, file, {
      access: 'public',
      token: blobToken,
    })

    const mimeType = inferMimeType(file, ext)

    // Do not set filename — Payload turns it into /api/media/file/... which 404s on Vercel Blob storage.
    const doc = await payload.create({
      collection: 'media',
      data: {
        alt,
        url: blob.url,
        mimeType,
      },
      overrideAccess: true,
    })

    const id = typeof doc === 'string' ? doc : doc?.id
    if (!id) {
      throw new Error('Failed to create media record for featured asset')
    }
    return String(id)
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const fileForPayload = Object.assign(file, { data: buffer, buffer })

  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: fileForPayload as unknown as File,
    overrideAccess: true,
  })

  const id = typeof doc === 'string' ? doc : doc?.id
  if (!id) {
    throw new Error('Failed to create media record for featured asset (local storage)')
  }
  return String(id)
}

/** Re-upload an existing HTTPS image URL into media (used when editing without a new file). */
export async function createNewsFeaturedMediaFromUrl(
  payload: Payload,
  imageUrl: string,
  alt: string,
): Promise<string> {
  const fetched = await fetch(imageUrl)
  if (!fetched.ok) {
    throw new Error(`Could not fetch existing featured image (${fetched.status})`)
  }
  const blob = await fetched.blob()
  const urlPath = new URL(imageUrl).pathname
  const filename = decodeURIComponent(urlPath.split('/').pop() || 'featured.jpg')
  const file = new File([blob], filename, { type: blob.type || 'image/jpeg' })
  return createNewsFeaturedMedia(payload, file, alt)
}

export function mediaIdForPayload(id: string | number): string | number {
  const n = Number(id)
  return Number.isFinite(n) && String(n) === String(id) ? n : id
}
