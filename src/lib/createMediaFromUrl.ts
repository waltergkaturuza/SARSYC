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
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }
  return map[ext] || 'application/octet-stream'
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

    // Store the Blob URL in both "url" and "thumbnail_u_r_l" so the display
    // helpers (which prefer a Blob thumbnailURL) always find it, even if Payload
    // regenerates "url" as a local /api/media/file path on read.
    const rows = await sql`
      INSERT INTO "media" ("alt", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "updated_at", "created_at")
      VALUES (${alt}, ${url}, ${url}, ${uniqueFilename}, ${mimeType}, ${0}, ${now}, ${now})
      RETURNING "id"
    `
    const id = (rows?.[0] as { id: string | number })?.id
    if (!id) throw new Error('Media insert returned no id')
    return String(id)
  } finally {
    await sql.end()
  }
}
