import postgres from 'postgres'

/**
 * Creates a media record directly in the database for a file already on Vercel Blob.
 * Bypasses Payload's upload validation ("No files were uploaded") which fires even
 * when we pass a URL.
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
  _payload: unknown,
  url: string,
  alt: string,
): Promise<string> {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL not configured')

  const baseName = filenameFromUrl(url)
  const mimeType = mimeTypeFromUrl(url)
  const now = new Date()

  const sql = postgres(dbUrl, { max: 1 })
  try {
    // Ensure the filename is unique (media.filename has a unique index in Payload)
    const dot = baseName.lastIndexOf('.')
    const stem = dot > 0 ? baseName.slice(0, dot) : baseName
    const ext = dot > 0 ? baseName.slice(dot) : ''
    const uniqueFilename = `${stem}-${Date.now()}${ext}`

    const rows = await sql`
      INSERT INTO "media" ("alt", "url", "filename", "mime_type", "filesize", "updated_at", "created_at")
      VALUES (${alt}, ${url}, ${uniqueFilename}, ${mimeType}, ${0}, ${now}, ${now})
      RETURNING "id"
    `
    const id = (rows?.[0] as { id: string | number })?.id
    if (!id) throw new Error('Media insert returned no id')
    return String(id)
  } finally {
    await sql.end()
  }
}
