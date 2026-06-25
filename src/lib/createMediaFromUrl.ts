/**
 * Creates a media record directly in the database for a file already on Vercel Blob.
 * Bypasses Payload's upload validation ("No files were uploaded") which fires even
 * when we pass a URL — the afterChange hooks and beforeValidate hooks don't run early
 * enough to suppress it.
 */

function mimeTypeFromUrl(url: string): string {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  }
  return map[ext] || 'image/jpeg'
}

function filenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    return decodeURIComponent(pathname.split('/').pop() || 'photo.jpg')
  } catch {
    return 'photo.jpg'
  }
}

export async function createMediaFromBlobUrl(
  payload: { db: any },
  url: string,
  alt: string,
): Promise<string> {
  const filename = filenameFromUrl(url)
  const mimeType = mimeTypeFromUrl(url)
  const now = new Date().toISOString()

  const result = await (payload.db as any).drizzle.execute(
    `INSERT INTO "media" ("alt", "url", "filename", "mime_type", "filesize", "updated_at", "created_at")
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING "id"`,
    [alt, url, filename, mimeType, 0, now, now],
  )

  const rows = result?.rows ?? result
  const id = rows?.[0]?.id
  if (!id) throw new Error('Media insert returned no id')
  return String(id)
}
