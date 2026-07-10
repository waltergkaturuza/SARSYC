import type { Payload } from 'payload'
import { createMediaFromBlobUrl } from '@/lib/createMediaFromUrl'
import { list } from '@vercel/blob'

type VolunteerDoc = {
  id: string | number
  firstName?: string
  lastName?: string
  email?: string
  cv?: unknown
  coverLetter?: unknown
}

function hasLinkedDocument(value: unknown): boolean {
  if (value == null || value === '') return false
  if (typeof value === 'number') return true
  if (typeof value === 'string' && /^\d+$/.test(value)) return true
  if (typeof value === 'object') return true
  return false
}

function volunteerEmailSlug(email?: string): string | null {
  if (!email) return null
  return email.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)
}

async function findBlobUrlForVolunteerDocument(
  type: 'cv' | 'coverLetter',
  email?: string,
): Promise<string | null> {
  const slug = volunteerEmailSlug(email)
  if (!slug || !process.env.BLOB_READ_WRITE_TOKEN) return null

  try {
    const prefix = `Volunteers/${type}/${slug}`
    const { blobs } = await list({ prefix, limit: 5 })
    const match = blobs
      .filter((blob) => blob.url.startsWith('http'))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0]
    return match?.url ?? null
  } catch (error) {
    console.warn(`Volunteer document blob lookup failed (${type}):`, error)
    return null
  }
}

/**
 * Link CV/cover letter media for volunteers whose files reached Blob storage
 * but never got a Payload media record (older upload handler).
 */
export async function repairVolunteerDocuments(
  payload: Payload,
  volunteer: VolunteerDoc,
): Promise<VolunteerDoc> {
  const updates: Record<string, string> = {}

  if (!hasLinkedDocument(volunteer.cv)) {
    const blobUrl = await findBlobUrlForVolunteerDocument('cv', volunteer.email)
    if (blobUrl) {
      const id = await createMediaFromBlobUrl(
        payload,
        blobUrl,
        `CV / Resume: ${volunteer.firstName || ''} ${volunteer.lastName || ''}`.trim(),
      )
      updates.cv = id
    }
  }

  if (!hasLinkedDocument(volunteer.coverLetter)) {
    const blobUrl = await findBlobUrlForVolunteerDocument('coverLetter', volunteer.email)
    if (blobUrl) {
      const id = await createMediaFromBlobUrl(
        payload,
        blobUrl,
        `Cover Letter: ${volunteer.firstName || ''} ${volunteer.lastName || ''}`.trim(),
      )
      updates.coverLetter = id
    }
  }

  if (Object.keys(updates).length === 0) {
    return volunteer
  }

  const updated = await payload.update({
    collection: 'volunteers',
    id: volunteer.id,
    data: updates,
    depth: 2,
    overrideAccess: true,
  })

  return updated as VolunteerDoc
}
